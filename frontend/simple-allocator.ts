import { User, Task } from '../types';

export class SimpleTaskAllocator {
  private users: User[] = [];
  private tasks: Task[] = [];

  updateUsers(users: User[]) {
    this.users = users.filter(u => u.role !== 'admin');
  }

  updateTasks(tasks: Task[]) {
    this.tasks = tasks;
  }

  allocateTask(task: Task): string | null {
    const availableUsers = this.users.filter(u => u.role !== 'admin' && u.isOnline);
    
    if (availableUsers.length === 0) {
      return null;
    }

    // Score each user based on multiple factors
    const scoredUsers = availableUsers.map(user => {
      let score = 0;
      
      // Factor 1: Workload (40% weight) - prefer users with lower workload
      const maxWorkload = Math.max(...availableUsers.map(u => u.workload || 0), 1);
      const workloadScore = maxWorkload > 0 ? (maxWorkload - (user.workload || 0)) / maxWorkload : 1;
      score += workloadScore * 0.4;
      
      // Factor 2: Skills matching (30% weight)
      const userSkills = user.skills || [];
      const taskTags = task.tags || [];
      const skillMatches = taskTags.filter(tag => 
        userSkills.some(skill => skill.toLowerCase().includes(tag.toLowerCase()))
      ).length;
      const skillScore = taskTags.length > 0 ? skillMatches / taskTags.length : 0.5;
      score += skillScore * 0.3;
      
      // Factor 3: Efficiency (20% weight)
      const efficiencyScore = (user.efficiency || 0) / 100;
      score += efficiencyScore * 0.2;
      
      // Factor 4: Priority handling (10% weight)
      const priorityScore = task.priority === 'high' || task.priority === 'urgent' ? 
        (user.efficiency || 0) / 100 : 0.5;
      score += priorityScore * 0.1;
      
      return {
        user,
        score,
        workload: user.workload || 0
      };
    });

    // Sort by score (highest first) and then by workload (lowest first)
    scoredUsers.sort((a, b) => {
      if (Math.abs(a.score - b.score) < 0.1) {
        return a.workload - b.workload; // If scores are close, prefer lower workload
      }
      return b.score - a.score;
    });

    return scoredUsers[0]?.user.id || null;
  }

  findBestReallocationTarget(task: Task, currentUserId: string): string | null {
    const availableUsers = this.users.filter(u => 
      u.role !== 'admin' && 
      u.isOnline && 
      u.id !== currentUserId
    );
    
    if (availableUsers.length === 0) {
      return null;
    }

    // Find user with lowest workload who can handle the task
    const sortedUsers = availableUsers
      .map(user => ({
        user,
        workload: user.workload || 0,
        efficiency: user.efficiency || 0
      }))
      .sort((a, b) => {
        // First sort by workload, then by efficiency
        if (Math.abs(a.workload - b.workload) < 2) {
          return b.efficiency - a.efficiency;
        }
        return a.workload - b.workload;
      });

    return sortedUsers[0]?.user.id || null;
  }

  detectOverload(): Array<{userId: string, workload: number, recommendation: string}> {
    return this.users
      .filter(u => (u.workload || 0) > 40)
      .map(user => ({
        userId: user.id,
        workload: user.workload || 0,
        recommendation: user.workload! > 50 ? 'Critical - redistribute tasks immediately' : 'High workload - consider redistribution'
      }));
  }

  calculateTeamMetrics() {
    const employees = this.users.filter(u => u.role === 'employee');
    if (employees.length === 0) {
      return {
        teamEfficiency: 0,
        completionRate: 0,
        overdueRate: 0,
        workloadBalance: 0
      };
    }

    const totalEfficiency = employees.reduce((sum, u) => sum + (u.efficiency || 0), 0);
    const teamEfficiency = totalEfficiency / employees.length;

    const completedTasks = this.tasks.filter(t => t.status === 'completed').length;
    const completionRate = this.tasks.length > 0 ? (completedTasks / this.tasks.length) * 100 : 0;

    const overdueTasks = this.tasks.filter(t => 
      t.status !== 'completed' && new Date(t.deadline) < new Date()
    ).length;
    const overdueRate = this.tasks.length > 0 ? (overdueTasks / this.tasks.length) * 100 : 0;

    const workloads = employees.map(u => u.workload || 0);
    const avgWorkload = workloads.reduce((sum, w) => sum + w, 0) / workloads.length;
    const workloadVariance = workloads.reduce((sum, w) => sum + Math.pow(w - avgWorkload, 2), 0) / workloads.length;
    const workloadBalance = Math.max(0, 100 - Math.sqrt(workloadVariance));

    return {
      teamEfficiency,
      completionRate,
      overdueRate,
      workloadBalance
    };
  }
}
