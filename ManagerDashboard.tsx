import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, BarChart3, Calendar } from 'lucide-react';
import { Task, User } from '@/types';

interface ManagerDashboardProps {
  user: User;
  users: User[];
  tasks: Task[];
  onCreateTask: (task: Partial<Task>) => void;
}

export function ManagerDashboard({ user, users, tasks, onCreateTask }: ManagerDashboardProps) {
  const [showCreateTask, setShowCreateTask] = useState(false);
  const teamMembers = users.filter(u => u.role === 'employee');
  const teamTasks = tasks.filter(task => 
    teamMembers.some(member => member.id === task.assignedTo) || task.createdBy === user.id
  );

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    onCreateTask({
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      priority: formData.get('priority') as any,
      estimatedHours: Number(formData.get('estimatedHours')),
      deadline: new Date(formData.get('deadline') as string),
      tags: (formData.get('tags') as string).split(',').map(t => t.trim()),
      createdBy: user.id,
      status: 'pending'
    });
    
    setShowCreateTask(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manager Dashboard</h1>
        <Button onClick={() => setShowCreateTask(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
            <p className="text-xs text-muted-foreground">
              {teamMembers.filter(m => m.isOnline).length} online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Tasks</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {teamTasks.filter(t => t.status === 'completed').length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Workload</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamMembers.length > 0 
                ? (teamMembers.reduce((sum, m) => sum + m.workload, 0) / teamMembers.length).toFixed(1)
                : 0}h
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamMembers.map(member => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.workload}h workload</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{member.efficiency}%</p>
                    <p className="text-sm text-muted-foreground">efficiency</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teamTasks.slice(0, 5).map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {task.assignedTo ? users.find(u => u.id === task.assignedTo)?.name : 'Unassigned'}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    task.status === 'completed' ? 'bg-green-100 text-green-800' :
                    task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {showCreateTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Task</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input name="title" required className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea name="description" className="w-full p-2 border rounded" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select name="priority" className="w-full p-2 border rounded">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estimated Hours</label>
                  <input name="estimatedHours" type="number" min="1" required className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Deadline</label>
                  <input name="deadline" type="date" required className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                  <input name="tags" placeholder="frontend, react, urgent" className="w-full p-2 border rounded" />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Create Task</Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateTask(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}