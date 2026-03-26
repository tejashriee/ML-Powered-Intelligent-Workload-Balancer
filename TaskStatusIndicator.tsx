import React from 'react';
import { CheckCircle2, Play, Clock, AlertCircle, Pause } from 'lucide-react';
import { Task } from '@/types';

interface TaskStatusIndicatorProps {
  task: Task;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function TaskStatusIndicator({ task, size = 'md', showLabel = true }: TaskStatusIndicatorProps) {
  const isOverdue = task.status !== 'completed' && new Date(task.deadline) < new Date();
  
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const statusConfig = {
    'pending': {
      icon: <Clock className={`${sizeClasses[size]} text-yellow-500`} />,
      label: 'Pending',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      description: 'Task is waiting to be started'
    },
    'in-progress': {
      icon: <Play className={`${sizeClasses[size]} text-blue-500`} />,
      label: 'In Progress',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Task is currently being worked on'
    },
    'completed': {
      icon: <CheckCircle2 className={`${sizeClasses[size]} text-green-500`} />,
      label: 'Completed',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Task has been completed successfully'
    },
    'overdue': {
      icon: <AlertCircle className={`${sizeClasses[size]} text-red-500`} />,
      label: 'Overdue',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Task is past its deadline'
    },
    'blocked': {
      icon: <Pause className={`${sizeClasses[size]} text-gray-500`} />,
      label: 'Blocked',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      description: 'Task is blocked and cannot proceed'
    }
  };

  const currentStatus = isOverdue && task.status !== 'completed' ? 'overdue' : task.status;
  const config = statusConfig[currentStatus] || statusConfig['pending'];

  if (!showLabel) {
    return (
      <div className="flex items-center" title={`${config.label}: ${config.description}`}>
        {config.icon}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {config.icon}
      <span className={`${textSizeClasses[size]} font-medium ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
}

// Progress bar component for tasks
export function TaskProgressBar({ task, className = '' }: { task: Task; className?: string }) {
  const progress = {
    'pending': 0,
    'in-progress': 50,
    'completed': 100,
    'blocked': 25,
    'overdue': task.status === 'in-progress' ? 50 : 0
  };

  const isOverdue = task.status !== 'completed' && new Date(task.deadline) < new Date();
  const currentStatus = isOverdue ? 'overdue' : task.status;
  const progressValue = progress[currentStatus] || 0;

  const colorClasses = {
    'pending': 'bg-yellow-500',
    'in-progress': 'bg-blue-500',
    'completed': 'bg-green-500',
    'blocked': 'bg-gray-500',
    'overdue': 'bg-red-500'
  };

  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div 
        className={`h-2 rounded-full transition-all duration-500 ${colorClasses[currentStatus]}`}
        style={{ width: `${progressValue}%` }}
      />
    </div>
  );
}