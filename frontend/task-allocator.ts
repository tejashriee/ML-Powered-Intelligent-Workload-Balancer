import { User, Task } from '../types';

export class TaskAllocator {
  private users: User[] = [];
  private tasks: Task[] = [];

  updateUsers(users: User[]) {
    this.users = users;
  }

  updateTasks(tasks: Task[]) {
    this.tasks = tasks;
  }

  allocateTask(task: Task): string | null {
    const availableUsers = this.users.filter(user => 
      user.role !== 'admin' && 
      user.isOnline && 
      user.workload < 40
    );

    if (availableUsers.length === 0) {
      return null;
    }

    const userScores = availableUsers.map(user => {
      let score = 0;

      // Skill matching (50% weight)
      const matchedSkills = task.tags.filter(tag => 
        user.skills.some(skill => skill.toLowerCase().includes(tag.toLowerCase()))
      );
      const skillMatch = task.tags.length > 0 ? matchedSkills.length / task.tags.length : 0.5;
      score += skillMatch * 0.5;

      // Workload balance (30% weight)
      const workloadScore = (40 - user.workload) / 40;
      score += workloadScore * 0.3;

      // Efficiency (20% weight)
      const efficiencyScore = (user.efficiency || 80) / 100;
      score += efficiencyScore * 0.2;

      return { userId: user.id, score, user };
    });

    userScores.sort((a, b) => b.score - a.score);
    return userScores[0]?.userId || null;
  }

  autoAllocateAllPendingTasks(): { allocated: number; failed: number } {
    const pendingTasks = this.tasks.filter(task => 
      task.status === 'pending' && !task.assignedTo
    );

    let allocated = 0;
    let failed = 0;

    pendingTasks.forEach(task => {
      const assignedUserId = this.allocateTask(task);
      if (assignedUserId) {
        allocated++;
      } else {
        failed++;
      }
    });

    return { allocated, failed };
  }
}
