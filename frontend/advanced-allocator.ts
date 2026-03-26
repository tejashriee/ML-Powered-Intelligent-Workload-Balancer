import { User, Task, TimezoneScheduleResult } from '../types';

export class AdvancedTaskAllocator {
  private users: User[] = [];
  private tasks: Task[] = [];

  updateUsers(users: User[]) {
    this.users = users;
  }

  updateTasks(tasks: Task[]) {
    this.tasks = tasks;
  }

  /**
   * Advanced allocation with timezone awareness
   */
  async allocateTaskWithTimezone(task: Task): Promise<string | null> {
    const availableUsers = this.getAvailableUsers();
    
    if (availableUsers.length === 0) {
      return null;
    }

    const userScores = availableUsers.map(user => {
      const score = this.calculateAdvancedScore(user, task);
      return { userId: user.id, score, user };
    });

    userScores.sort((a, b) => b.score.total - a.score.total);
    
    console.log(`🎯 Advanced allocation for "${task.title}":`);
    userScores.slice(0, 3).forEach((result, index) => {
      console.log(`${index + 1}. ${result.user.name}: ${result.score.total.toFixed(2)} points`);
      console.log(`   Timezone: ${result.score.breakdown.timezone.toFixed(2)}, Skills: ${result.score.breakdown.skills.toFixed(2)}, Workload: ${result.score.breakdown.workload.toFixed(2)}`);
    });

    const bestMatch = userScores[0];
    return bestMatch && bestMatch.score.total > 0.4 ? bestMatch.userId : null;
  }

  private getAvailableUsers(): User[] {
    return this.users.filter(user => 
      user.role !== 'admin' && 
      user.isOnline && 
      user.workload < (user.overloadThreshold || 40)
    );
  }

  private calculateAdvancedScore(user: User, task: Task) {
    const breakdown = {
      timezone: this.calculateTimezoneScore(user, task),
      skills: this.calculateSkillScore(user, task),
      workload: this.calculateWorkloadScore(user),
      deadline: this.calculateDeadlineScore(user, task),
      expertise: this.calculateExpertiseScore(user, task),
      availability: this.calculateAvailabilityScore(user)
    };

    // Advanced weighted scoring
    const weights = {
      timezone: 0.25,    // 25% - timezone compatibility
      skills: 0.25,      // 25% - skill matching
      workload: 0.20,    // 20% - current workload
      deadline: 0.15,    // 15% - deadline urgency
      expertise: 0.10,   // 10% - role expertise
      availability: 0.05  // 5% - general availability
    };

    const total = Object.keys(breakdown).reduce((sum, key) => {
      return sum + (breakdown[key] * weights[key]);
    }, 0);

    return { total, breakdown };
  }

  private calculateTimezoneScore(user: User, task: Task): number {
    const now = new Date();
    const userTimezone = user.timezone || 'UTC';
    
    // Get current time in user's timezone
    const userTime = new Date(now.toLocaleString("en-US", {timeZone: userTimezone}));
    const userHour = userTime.getHours();
    
    // Parse working hours
    const workStart = parseInt(user.workingHoursStart?.split(':')[0] || '9');
    const workEnd = parseInt(user.workingHoursEnd?.split(':')[0] || '17');
    
    let score = 0;
    
    // Base score for being in working hours
    if (userHour >= workStart && userHour <= workEnd) {
      score += 0.6;
    } else {
      score += 0.1; // Low score for off-hours
    }
    
    // Check if it's a working day
    const dayName = userTime.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    if (user.workingDays?.includes(dayName)) {
      score += 0.3;
    }
    
    // Deadline alignment bonus
    const deadlineInUserTz = new Date(task.deadline.toLocaleString("en-US", {timeZone: userTimezone}));
    const hoursUntilDeadline = (deadlineInUserTz.getTime() - userTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilDeadline > task.estimatedHours * 2) {
      score += 0.1; // Bonus for having enough time
    }
    
    return Math.min(score, 1.0);
  }

  private calculateSkillScore(user: User, task: Task): number {
    if (!task.tags || task.tags.length === 0) {
      return 0.5; // Neutral score for tasks without specific skill requirements
    }
    
    const userSkills = user.skills || [];
    const matchedSkills = task.tags.filter(tag =>
      userSkills.some(skill => 
        skill.toLowerCase().includes(tag.toLowerCase()) ||
        tag.toLowerCase().includes(skill.toLowerCase())
      )
    );
    
    const baseScore = matchedSkills.length / task.tags.length;
    
    // Bonus for having more skills than required
    if (matchedSkills.length > task.tags.length * 0.8) {
      return Math.min(baseScore + 0.2, 1.0);
    }
    
    return baseScore;
  }

  private calculateWorkloadScore(user: User): number {
    const maxWorkload = user.overloadThreshold || 40;
    const currentWorkload = user.workload || 0;
    
    // Exponential decay for workload scoring
    const utilizationRatio = currentWorkload / maxWorkload;
    return Math.max(0, Math.pow(1 - utilizationRatio, 2));
  }

  private calculateDeadlineScore(user: User, task: Task): number {
    const now = new Date();
    const hoursUntilDeadline = (task.deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // Urgent tasks favor high-efficiency users
    if (hoursUntilDeadline < 24) {
      return (user.efficiency || 85) / 100;
    }
    
    // Normal deadline scoring
    if (hoursUntilDeadline < 72) {
      return 0.8;
    } else if (hoursUntilDeadline < 168) {
      return 0.6;
    } else {
      return 0.4;
    }
  }

  private calculateExpertiseScore(user: User, task: Task): number {
    const baseExpertise = (user.roleExpertise || 50) / 100;
    
    // Complexity bonus/penalty
    const complexityFactor = task.complexity || 1;
    if (complexityFactor > 5 && baseExpertise > 0.8) {
      return Math.min(baseExpertise + 0.2, 1.0); // Bonus for experts on complex tasks
    }
    
    return baseExpertise;
  }

  private calculateAvailabilityScore(user: User): number {
    // Base availability score
    let score = 0.5;
    
    // Recent activity bonus
    if (user.lastActive) {
      const hoursSinceActive = (Date.now() - user.lastActive.getTime()) / (1000 * 60 * 60);
      if (hoursSinceActive < 2) {
        score += 0.3; // Recently active
      } else if (hoursSinceActive < 8) {
        score += 0.2; // Active today
      }
    }
    
    // Task completion rate bonus
    const completionRate = (user.tasksCompleted || 0) / Math.max((user.tasksCompleted || 0) + this.getUserActiveTasks(user.id), 1);
    score += completionRate * 0.2;
    
    return Math.min(score, 1.0);
  }

  private getUserActiveTasks(userId: string): number {
    return this.tasks.filter(task => 
      task.assignedTo === userId && 
      task.status !== 'completed'
    ).length;
  }

  /**
   * Batch allocation with optimization
   */
  async batchAllocateWithTimezone(tasks: Task[]): Promise<TimezoneScheduleResult[]> {
    const results: TimezoneScheduleResult[] = [];
    
    // Sort tasks by priority and deadline
    const sortedTasks = [...tasks].sort((a, b) => {
      const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityWeight[a.priority] || 1;
      const bPriority = priorityWeight[b.priority] || 1;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      return a.deadline.getTime() - b.deadline.getTime();
    });
    
    for (const task of sortedTasks) {
      const assignedUserId = await this.allocateTaskWithTimezone(task);
      
      const result: TimezoneScheduleResult = {
        taskId: task.id,
        assignedTo: assignedUserId || undefined,
        success: !!assignedUserId,
        timezoneOptimal: assignedUserId ? this.isTimezoneOptimal(assignedUserId, task) : false
      };
      
      results.push(result);
      
      // Update user workload for next allocation
      if (assignedUserId) {
        const userIndex = this.users.findIndex(u => u.id === assignedUserId);
        if (userIndex !== -1) {
          this.users[userIndex].workload += task.estimatedHours;
        }
      }
    }
    
    return results;
  }

  private isTimezoneOptimal(userId: string, task: Task): boolean {
    const user = this.users.find(u => u.id === userId);
    if (!user) return false;
    
    const userTimezone = user.timezone || 'UTC';
    const deadlineInUserTz = new Date(task.deadline.toLocaleString("en-US", {timeZone: userTimezone}));
    const deadlineHour = deadlineInUserTz.getHours();
    
    // Optimal if deadline is during working hours
    const workStart = parseInt(user.workingHoursStart?.split(':')[0] || '9');
    const workEnd = parseInt(user.workingHoursEnd?.split(':')[0] || '17');
    
    return deadlineHour >= workStart && deadlineHour <= workEnd;
  }

  /**
   * Get allocation recommendations with detailed analysis
   */
  getDetailedRecommendations(task: Task): Array<{
    user: User;
    score: number;
    recommendation: string;
    timezoneMatch: boolean;
    skillMatch: number;
    workloadStatus: string;
  }> {
    const availableUsers = this.getAvailableUsers();
    
    return availableUsers.map(user => {
      const score = this.calculateAdvancedScore(user, task);
      const skillMatchPercent = this.calculateSkillScore(user, task) * 100;
      
      let workloadStatus = 'optimal';
      if (user.workload > (user.overloadThreshold || 40) * 0.8) {
        workloadStatus = 'high';
      } else if (user.workload > (user.overloadThreshold || 40) * 0.6) {
        workloadStatus = 'moderate';
      }
      
      return {
        user,
        score: score.total,
        recommendation: this.generateRecommendation(score),
        timezoneMatch: score.breakdown.timezone > 0.7,
        skillMatch: skillMatchPercent,
        workloadStatus
      };
    }).sort((a, b) => b.score - a.score);
  }

  private generateRecommendation(score: any): string {
    if (score.total > 0.8) return 'Excellent match';
    if (score.total > 0.6) return 'Good match';
    if (score.total > 0.4) return 'Fair match';
    return 'Poor match';
  }
}
