import React, { useEffect, useState } from 'react';
import { CheckCircle2, X, Trophy, Star } from 'lucide-react';
import { Task } from '@/types';

interface TaskCompletionToastProps {
  task?: Task;
  isVisible: boolean;
  onClose: () => void;
}

export function TaskCompletionToast({ task, isVisible, onClose }: TaskCompletionToastProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      // Delay unmounting to allow exit animation
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!shouldRender || !task) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="bg-white border border-green-200 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <p className="text-sm font-medium text-gray-900">Task Completed!</p>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Great job completing "{task.title}"
            </p>
            
            {/* Task completion stats */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-400" />
                +10 XP
              </span>
              <span>
                {task.estimatedHours}h task
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {task.priority}
              </span>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>
        
        {/* Progress bar animation */}
        <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
          <div className="bg-green-500 h-1 rounded-full animate-pulse w-full" />
        </div>
      </div>
    </div>
  );
}

// Hook to manage task completion notifications
export function useTaskCompletionNotification() {
  const [completedTask, setCompletedTask] = useState<Task | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showCompletionNotification = (task: Task) => {
    setCompletedTask(task);
    setIsVisible(true);
  };

  const hideNotification = () => {
    setIsVisible(false);
  };

  return {
    completedTask,
    isVisible,
    showCompletionNotification,
    hideNotification,
    TaskCompletionToast: () => (
      <TaskCompletionToast
        task={completedTask}
        isVisible={isVisible}
        onClose={hideNotification}
      />
    )
  };
}