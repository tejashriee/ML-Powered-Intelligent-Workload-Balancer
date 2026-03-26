export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'manager' | 'employee';
  avatar?: string;
  skills: string[];
  workload: number;
  efficiency: number;
  location: string;
  isOnline: boolean;
  timezone: string;
  avgTaskTime?: number;
  roleExpertise?: number;
  overloadThreshold?: number;
  tasksCompleted?: number;
  workingHoursStart: string;
  workingHoursEnd: string;
  workingDays: string[];
  lastActive?: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue' | 'blocked';
  assignedTo?: string;
  createdBy: string;
  projectId?: string;
  estimatedHours: number;
  actualHours?: number;
  actualEstimatedHours?: number;
  complexity: number;
  deadline: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  dependencies?: string[];
  autoAssigned?: boolean;
  timezoneScheduled?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  progress: number;
  startDate: Date;
  endDate: Date;
  teamMembers: string[];
  tasks: string[];
}

export interface Analytics {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  averageCompletionTime: number;
  teamEfficiency: number;
  workloadDistribution: { userId: string; workload: number }[];
  productivityTrends: { date: string; productivity: number }[];
  timezoneDistribution?: { timezone: string; userCount: number }[];
  autoAllocationSuccess?: number;
  skillUtilization?: { skill: string; usage: number }[];
}

export interface Notification {
  id: string;
  type: 'task_assigned' | 'deadline_approaching' | 'task_completed' | 'overload_warning' | 'auto_allocated';
  title: string;
  message: string;
  userId: string;
  relatedTaskId?: string;
  relatedProjectId?: string;
  isRead: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: Date;
  readAt?: Date;
}

export interface AllocationHistory {
  id: string;
  taskId: string;
  fromUserId?: string;
  toUserId: string;
  allocationType: 'auto' | 'manual' | 'reallocation';
  algorithmUsed: string;
  confidenceScore: number;
  timezoneFactor: number;
  skillMatchScore: number;
  workloadFactor: number;
  deadlineUrgency: number;
  reason?: string;
  createdAt: Date;
}

export interface TimezoneScheduleResult {
  taskId: string;
  assignedTo?: string;
  success: boolean;
  confidenceScore?: number;
  reason?: string;
  timezoneOptimal?: boolean;
}