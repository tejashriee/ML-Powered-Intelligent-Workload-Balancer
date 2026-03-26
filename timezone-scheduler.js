import moment from 'moment-timezone';

export class TimezoneAwareScheduler {
  constructor(db) {
    this.db = db;
  }

  async allocateTaskWithTimezone(task) {
    const availableUsers = await this.getAvailableUsers();
    const taskDeadline = moment(task.deadline);
    
    const userScores = await Promise.all(
      availableUsers.map(async (user) => {
        const score = await this.calculateUserScore(user, task, taskDeadline);
        return { user, score, breakdown: score.breakdown };
      })
    );

    userScores.sort((a, b) => b.score.total - a.score.total);
    
    const bestMatch = userScores[0];
    
    if (bestMatch && bestMatch.score.total > 0.3) {
      await this.logAllocation(task.id, null, bestMatch.user.id, 'auto', 'timezone-aware', bestMatch.score);
      return bestMatch.user.id;
    }

    return null;
  }

  async getAvailableUsers() {
    const users = await this.db.all(`
      SELECT * FROM users 
      WHERE role != 'admin' 
      AND is_online = 1 
      AND workload < overload_threshold
    `);

    return users.map(user => ({
      ...user,
      skills: JSON.parse(user.skills || '[]'),
      working_days: JSON.parse(user.working_days || '["monday","tuesday","wednesday","thursday","friday"]')
    }));
  }

  async calculateUserScore(user, task, taskDeadline) {
    const breakdown = {
      timezone: await this.calculateTimezoneScore(user, task, taskDeadline),
      skills: this.calculateSkillScore(user, task),
      workload: this.calculateWorkloadScore(user),
      deadline: this.calculateDeadlineUrgencyScore(user, taskDeadline),
      availability: await this.calculateAvailabilityScore(user, taskDeadline)
    };

    const weights = {
      timezone: 0.25,
      skills: 0.30,
      workload: 0.20,
      deadline: 0.15,
      availability: 0.10
    };

    const total = Object.keys(breakdown).reduce((sum, key) => {
      return sum + (breakdown[key] * weights[key]);
    }, 0);

    return { total, breakdown };
  }

  async calculateTimezoneScore(user, task, taskDeadline) {
    const userTime = moment().tz(user.timezone);
    const currentHour = userTime.hour();
    const workStart = parseInt(user.working_hours_start.split(':')[0]);
    const workEnd = parseInt(user.working_hours_end.split(':')[0]);
    
    let timezoneScore = 0;
    
    if (currentHour >= workStart && currentHour <= workEnd) {
      timezoneScore += 0.5;
    }
    
    const workingHoursUntilDeadline = this.calculateWorkingHours(userTime, taskDeadline.clone().tz(user.timezone), user);
    
    if (workingHoursUntilDeadline >= task.estimated_hours) {
      timezoneScore += 0.3;
    }
    
    const deadlineHour = taskDeadline.clone().tz(user.timezone).hour();
    if (deadlineHour >= 10 && deadlineHour <= 16) {
      timezoneScore += 0.2;
    }
    
    return Math.min(timezoneScore, 1.0);
  }

  calculateWorkingHours(startTime, endTime, user) {
    let workingHours = 0;
    let current = startTime.clone();
    
    while (current.isBefore(endTime)) {
      const dayName = current.format('dddd').toLowerCase();
      
      if (user.working_days.includes(dayName)) {
        const dayStart = current.clone().hour(parseInt(user.working_hours_start.split(':')[0])).minute(0);
        const dayEnd = current.clone().hour(parseInt(user.working_hours_end.split(':')[0])).minute(0);
        
        const effectiveStart = moment.max(current, dayStart);
        const effectiveEnd = moment.min(endTime, dayEnd);
        
        if (effectiveStart.isBefore(effectiveEnd)) {
          workingHours += effectiveEnd.diff(effectiveStart, 'hours', true);
        }
      }
      
      current.add(1, 'day').startOf('day');
    }
    
    return workingHours;
  }

  calculateSkillScore(user, task) {
    const taskTags = JSON.parse(task.tags || '[]');
    if (taskTags.length === 0) return 0.5;
    
    const matchedSkills = taskTags.filter(tag =>
      user.skills.some(skill => 
        skill.toLowerCase().includes(tag.toLowerCase()) ||
        tag.toLowerCase().includes(skill.toLowerCase())
      )
    );
    
    const baseScore = matchedSkills.length / taskTags.length;
    const expertiseBonus = (user.role_expertise || 50) / 100 * 0.2;
    
    return Math.min(baseScore + expertiseBonus, 1.0);
  }

  calculateWorkloadScore(user) {
    const maxWorkload = user.overload_threshold || 40;
    const currentWorkload = user.workload || 0;
    
    return Math.max(0, (maxWorkload - currentWorkload) / maxWorkload);
  }

  calculateDeadlineUrgencyScore(user, taskDeadline) {
    const userTime = moment().tz(user.timezone);
    const hoursUntilDeadline = taskDeadline.diff(userTime, 'hours');
    
    if (hoursUntilDeadline < 24) {
      return (user.efficiency || 85) / 100;
    }
    
    if (hoursUntilDeadline < 72) {
      return 0.7;
    } else if (hoursUntilDeadline < 168) {
      return 0.5;
    } else {
      return 0.3;
    }
  }

  async calculateAvailabilityScore(user, taskDeadline) {
    const userTime = moment().tz(user.timezone);
    const dayName = userTime.format('dddd').toLowerCase();
    
    if (!user.working_days.includes(dayName)) {
      return 0.2;
    }
    
    return 0.8;
  }

  async logAllocation(taskId, fromUserId, toUserId, allocationType, algorithm, scoreBreakdown) {
    await this.db.run(`
      INSERT INTO allocation_history (
        task_id, from_user_id, to_user_id, allocation_type, algorithm_used,
        confidence_score, timezone_factor, skill_match_score, workload_factor, deadline_urgency
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      taskId, fromUserId, toUserId, allocationType, algorithm,
      scoreBreakdown.total, scoreBreakdown.breakdown.timezone,
      scoreBreakdown.breakdown.skills, scoreBreakdown.breakdown.workload,
      scoreBreakdown.breakdown.deadline
    ]);
  }

  async batchAllocateWithTimezone(tasks) {
    const results = [];
    
    for (const task of tasks) {
      const assignedUserId = await this.allocateTaskWithTimezone(task);
      results.push({
        taskId: task.id,
        assignedTo: assignedUserId,
        success: !!assignedUserId
      });
      
      if (assignedUserId) {
        await this.db.run(`
          UPDATE users 
          SET workload = workload + ? 
          WHERE id = ?
        `, [task.estimated_hours, assignedUserId]);
      }
    }
    
    return results;
  }
}