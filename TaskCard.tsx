import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { 
  CheckCircle2, 
  Play, 
  Clock, 
  AlertCircle, 
  Calendar, 
  User, 
  Tag,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { Task, User as UserType } from '@/types';
import { getTaskPriorityColor, formatDate } from '@/lib/utils';
import { TaskStatusIndicator, TaskProgressBar } from './TaskStatusIndicator';

interface TaskCardProps {
  task: Task;
  assignee?: UserType;
  currentUser: UserType;
  onUpdateTask?: (taskId: string, status: string) => void;
  onDeleteTask?: (taskId: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

export function TaskCard({ 
  task, 
  assignee, 
  currentUser, 
  onUpdateTask, 
  onDeleteTask,
  showActions = true,
  compact = false 
}: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const isOverdue = task.status !== 'completed' && new Date(task.deadline) < new Date();
  const canManageTask = currentUser.role === 'admin' || task.assignedTo === currentUser.id;
  
  const statusConfig = {
    'pending': {
      icon: <Clock className="h-4 w-4 text-yellow-500" />,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      statusBadge: 'bg-yellow-100 text-yellow-800'
    },
    'in-progress': {
      icon: <Play className="h-4 w-4 text-blue-500" />,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      statusBadge: 'bg-blue-100 text-blue-800'
    },
    'completed': {
      icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      statusBadge: 'bg-green-100 text-green-800'
    },
    'overdue': {
      icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      statusBadge: 'bg-red-100 text-red-800'
    }
  };

  const currentStatus = isOverdue && task.status !== 'completed' ? 'overdue' : task.status;
  const config = statusConfig[currentStatus];

  const handleStatusUpdate = (newStatus: string) => {
    if (onUpdateTask) {
      onUpdateTask(task.id, newStatus);
    }
  };

  const handleDelete = () => {
    if (onDeleteTask && confirm(`Are you sure you want to delete "${task.title}"? This action cannot be undone.`)) {
      onDeleteTask(task.id);
    }
  };

  return (
    <Card className={`transition-all hover:shadow-md ${config.bgColor} ${config.borderColor} ${compact ? 'p-2' : ''}`}>
      <CardContent className={compact ? 'p-3' : 'p-4'}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Task Header */}
            <div className="flex items-center gap-2 mb-2">
              <TaskStatusIndicator task={task} size={compact ? 'sm' : 'md'} showLabel={false} />
              <h3 className={`font-medium ${compact ? 'text-sm' : ''} ${
                task.status === 'completed' ? 'line-through text-gray-500' : ''
              }`}>
                {task.title}
              </h3>
            </div>

            {/* Task Description */}
            {!compact && (
              <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
            )}

            {/* Task Metadata */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className={`px-2 py-1 rounded-full text-xs ${getTaskPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.statusBadge}`}>
                {currentStatus === 'overdue' ? 'OVERDUE' : task.status.replace('-', ' ').toUpperCase()}
              </span>
              {task.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-100 rounded-full text-xs flex items-center gap-1">
                  <Tag className="h-2 w-2" />
                  {tag}
                </span>
              ))}
            </div>

            {/* Task Details */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {task.estimatedHours}h
              </span>
              <span className={`flex items-center gap-1 ${
                isOverdue && task.status !== 'completed' ? 'text-red-600 font-medium' : ''
              }`}>
                <Calendar className="h-3 w-3" />
                {formatDate(new Date(task.deadline))}
              </span>
              {assignee && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {assignee.name}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {showActions && canManageTask && (
            <div className="flex flex-col gap-2 ml-4 relative">
              {/* Status Action Buttons */}
              {task.status === 'pending' && (
                <Button 
                  size="sm" 
                  onClick={() => handleStatusUpdate('in-progress')}
                  className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1"
                >
                  <Play className="h-3 w-3" />
                  Start
                </Button>
              )}
              {task.status === 'in-progress' && (
                <Button 
                  size="sm" 
                  onClick={() => handleStatusUpdate('completed')}
                  className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Complete
                </Button>
              )}
              {task.status === 'completed' && (
                <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Done
                </div>
              )}

              {/* Menu Button for Admin */}
              {currentUser.role === 'admin' && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1 h-6 w-6"
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                  
                  {showMenu && (
                    <div className="absolute right-0 top-full mt-1 bg-white border rounded-md shadow-lg z-10 min-w-[120px]">
                      <button
                        onClick={() => {
                          handleDelete();
                          setShowMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        {!compact && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between text-xs mb-2">
              <TaskStatusIndicator task={task} size="sm" />
              <span className={`font-medium ${
                task.status === 'completed' ? 'text-green-600' :
                task.status === 'in-progress' ? 'text-blue-600' :
                isOverdue ? 'text-red-600' :
                'text-gray-500'
              }`}>
                {task.status === 'completed' ? '100%' :
                 task.status === 'in-progress' ? '50%' :
                 isOverdue ? 'Overdue' : '0%'}
              </span>
            </div>
            <TaskProgressBar task={task} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}