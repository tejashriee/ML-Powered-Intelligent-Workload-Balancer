import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertCircle, TrendingUp, Lock, Bot } from 'lucide-react';
import { Task, User } from '@/types';
import { WorkloadAlert } from '@/components/WorkloadAlert';
import { PersonalAssistant } from '@/components/PersonalAssistant';
import { ChangePasswordModal } from '@/components/ChangePasswordModal';
import { TaskCard } from '@/components/TaskCard';
import { useTaskCompletionNotification } from '@/components/TaskCompletionToast';

interface EmployeeDashboardProps {
  user: User;
  tasks: Task[];
  users: User[];
  onUpdateTask: (taskId: string, status: string) => void;
  onRequestReallocation: (taskId: string, reason: string, sentiment: any) => void;
  onChangePassword: (currentPassword: string, newPassword: string) => void;
}

export function EmployeeDashboard({ user, tasks, users, onUpdateTask, onRequestReallocation, onChangePassword }: EmployeeDashboardProps) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const { showCompletionNotification, TaskCompletionToast } = useTaskCompletionNotification();
  
  const myTasks = tasks.filter(task => task.assignedTo === user.id);
  const completedTasks = myTasks.filter(task => task.status === 'completed');
  const inProgressTasks = myTasks.filter(task => task.status === 'in-progress');
  const pendingTasks = myTasks.filter(task => task.status === 'pending');

  const handleUpdateTask = (taskId: string, status: string) => {
    const task = myTasks.find(t => t.id === taskId);
    if (task && status === 'completed') {
      showCompletionNotification(task);
    }
    if (onUpdateTask) {
      onUpdateTask(taskId, status);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAssistant(!showAssistant)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-purple-100"
            >
              <Bot className="h-4 w-4" />
              {showAssistant ? 'Hide Assistant' : 'AI Assistant'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center gap-2"
            >
              <Lock className="h-4 w-4" />
              Change Password
            </Button>
            <WorkloadAlert 
              user={user} 
              tasks={tasks} 
              users={users}
              onRequestReallocation={onRequestReallocation} 
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Welcome back, {user.name}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myTasks.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressTasks.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.efficiency}%</div>
          </CardContent>
        </Card>
      </div>



      {/* Personal AI Assistant */}
      {showAssistant && (
        <div className="mb-6">
          <PersonalAssistant user={user} tasks={tasks} users={users} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              My Tasks
              <div className="text-sm text-muted-foreground">
                {inProgressTasks.length} active • {completedTasks.length} completed
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                  <p>No tasks assigned!</p>
                  <p className="text-sm">You're all caught up. Great job!</p>
                </div>
              ) : (
                myTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    currentUser={user}
                    onUpdateTask={handleUpdateTask}
                    showActions={true}
                  />
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium">Completion Rate</span>
                <span className="text-lg font-bold text-green-600">
                  {myTasks.length > 0 ? Math.round((completedTasks.length / myTasks.length) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">Current Workload</span>
                <span className="text-lg font-bold text-blue-600">{user.workload || 0}h</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium">Efficiency Score</span>
                <span className="text-lg font-bold text-purple-600">{user.efficiency || 85}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-sm font-medium">Skills</span>
                <div className="flex flex-wrap gap-1">
                  {user.skills.slice(0, 3).map(skill => (
                    <span key={skill} className="px-2 py-1 bg-orange-200 text-orange-800 text-xs rounded">
                      {skill}
                    </span>
                  ))}
                  {user.skills.length > 3 && (
                    <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                      +{user.skills.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ChangePasswordModal 
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onChangePassword={onChangePassword}
      />
      
      <TaskCompletionToast />
    </div>
  );
}
