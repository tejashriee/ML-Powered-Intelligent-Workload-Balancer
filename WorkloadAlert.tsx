import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Button } from './ui/button';
import { AlertTriangle, MessageSquare } from 'lucide-react';
import { User, Task } from '@/types';

interface WorkloadAlertProps {
  user: User;
  tasks: Task[];
  users: User[];
  onRequestReallocation: (taskId: string, reason: string, sentiment: any) => void;
}

export function WorkloadAlert({ user, tasks, users, onRequestReallocation }: WorkloadAlertProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [message, setMessage] = useState('');

  const myTasks = tasks.filter(task => task.assignedTo === user.id && task.status !== 'completed');
  const isOverloaded = user.workload > 35;

  const handleSubmitAlert = async () => {
    if (!message || !selectedTask) return;

    onRequestReallocation(selectedTask, message, { sentiment: 'neutral', stressLevel: 50 });
    
    setIsOpen(false);
    setMessage('');
    setSelectedTask('');
  };

  if (!isOverloaded && myTasks.length < 5) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 border-orange-200 text-orange-700 hover:bg-orange-50"
        >
          <AlertTriangle className="h-4 w-4" />
          Request Help
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Request Task Reallocation
          </AlertDialogTitle>
          <AlertDialogDescription>
            You currently have {myTasks.length} active tasks ({user.workload}h workload). 
            Select a task to request reallocation if you're feeling overwhelmed.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Task to Reallocate</label>
            <select 
              value={selectedTask} 
              onChange={(e) => setSelectedTask(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Choose a task...</option>
              {myTasks.map(task => (
                <option key={task.id} value={task.id}>
                  {task.title} ({task.priority} priority)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Why do you need help with this task?
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g., I'm overwhelmed with this task and need someone with specific expertise..."
              className="w-full p-3 border rounded-md h-20 resize-none"
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => {
            setMessage('');
            setSelectedTask('');
          }}>Cancel</AlertDialogCancel>
          
          <AlertDialogAction 
            onClick={handleSubmitAlert}
            disabled={!message || !selectedTask}
          >
            Request Reallocation
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}