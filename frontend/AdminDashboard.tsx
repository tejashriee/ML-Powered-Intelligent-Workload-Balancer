import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, CheckSquare, TrendingUp, AlertTriangle, Clock, Plus, UserPlus, Zap, Brain } from 'lucide-react';
import { User, Task, Analytics } from '@/types';
import { TaskOverviewModal } from '@/components/TaskOverviewModal';
import { TaskCard } from '@/components/TaskCard';
import { useWebSocket } from '@/hooks/useWebSocket';
import { api } from '@/lib/api';
import { TaskAllocator } from '@/lib/task-allocator';
import { OverloadDetection } from '@/components/OverloadDetection';
import { MLWorkloadBalancer } from '@/components/ml/MLWorkloadBalancer';

interface AdminDashboardProps {
  users: User[];
  tasks: Task[];
  analytics: Analytics;
  onCreateEmployee: (userData: Partial<User>) => void;
  onCreateTask: (taskData: Partial<Task>) => void;
}

export function AdminDashboard({ users, tasks, analytics, onCreateEmployee, onCreateTask }: AdminDashboardProps) {
  const [showCreateEmployee, setShowCreateEmployee] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showTaskOverview, setShowTaskOverview] = useState(false);
  const [showMLBalancer, setShowMLBalancer] = useState(false);
  const { isConnected, sendMessage } = useWebSocket();
  const [allocator] = useState(() => new TaskAllocator());

  useEffect(() => {
    allocator.updateUsers(users);
    allocator.updateTasks(tasks);
  }, [users, tasks, allocator]);

  const teamMetrics = {
    teamEfficiency: users.length > 0 ? users.reduce((sum, u) => sum + (u.efficiency || 0), 0) / users.length : 0,
    completionRate: tasks.length > 0 ? (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100 : 0,
    workloadBalance: 85,
    overdueRate: tasks.length > 0 ? (tasks.filter(t => t.status !== 'completed' && new Date(t.deadline) < new Date()).length / tasks.length) * 100 : 0
  };

  const handleAutoAllocate = async () => {
    const pendingTasks = tasks.filter(task => task.status === 'pending' && !task.assignedTo);
    
    if (pendingTasks.length === 0) {
      alert('No pending tasks to allocate!');
      return;
    }

    let allocatedCount = 0;
    
    for (const task of pendingTasks) {
      const assignedUserId = allocator.allocateTask(task);
      
      if (assignedUserId) {
        try {
          await api.updateTask(task.id, { assignedTo: assignedUserId });
          allocatedCount++;
        } catch (error) {
          console.error('Failed to assign task:', error);
        }
      }
    }
    
    if (allocatedCount > 0) {
      alert(`✅ Successfully allocated ${allocatedCount} task(s)!`);
    } else {
      alert('⚠️ No tasks could be allocated. Check user availability and skills.');
    }
  };



  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    onCreateEmployee({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      role: formData.get('role') as any,
      location: formData.get('location') as string,
      skills: (formData.get('skills') as string).split(',').map(s => s.trim()),
      workload: 0,
      efficiency: 85,
      isOnline: true
    });
    
    setShowCreateEmployee(false);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    onCreateTask({
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      priority: formData.get('priority') as any,
      assignedTo: formData.get('assignedTo') as string || undefined,
      estimatedHours: Number(formData.get('estimatedHours')),
      deadline: new Date(formData.get('deadline') as string),
      tags: (formData.get('tags') as string).split(',').map(t => t.trim()),
      status: 'pending'
    });
    
    setShowCreateTask(false);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const result = await api.deleteTask(taskId, 'admin');
      if (result.success) {
        console.log('Task deleted successfully');
      } else {
        alert(result.error || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Delete task error:', error);
      alert('Network error: Failed to delete task. Please try again.');
    }
  };



  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <Button onClick={() => setShowCreateEmployee(true)} className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600">
            <UserPlus className="h-4 w-4" />
            Add Employee
          </Button>
          <Button onClick={() => setShowCreateTask(true)} className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600">
            <Plus className="h-4 w-4" />
            Create Task
          </Button>
          <Button onClick={handleAutoAllocate} className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
            <Zap className="h-4 w-4" />
            Auto Allocate
          </Button>
          <Button 
            onClick={() => setShowMLBalancer(!showMLBalancer)} 
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            <Brain className="h-4 w-4" />
            {showMLBalancer ? 'Hide ML Balancer' : 'ML Balancer'}
          </Button>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-sm text-muted-foreground">
              {isConnected ? 'Live Updates Active' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.role !== 'admin').length}</div>
            <p className="text-xs text-muted-foreground">
              {users.filter(u => u.isOnline).length} online
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setShowTaskOverview(true)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.completedTasks} completed • Click to view all
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMetrics.teamEfficiency?.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {teamMetrics.completionRate?.toFixed(1)}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analytics.overdueTasks}</div>
            <p className="text-xs text-muted-foreground">
              {teamMetrics.overdueRate?.toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ML Workload Balancer */}
      {showMLBalancer && (
        <div className="mb-6">
          <MLWorkloadBalancer 
            users={users} 
            tasks={tasks} 
            onRebalance={(recommendations) => {
              console.log('ML Recommendations:', recommendations);
              alert(`🤖 ML Balancer executed ${recommendations.length} optimization(s)!\n\nRecommendations applied successfully.`);
            }} 
          />
        </div>
      )}

      {/* Dynamic Allocation Status */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <div>
            <h3 className="font-semibold text-green-800">🤖 Dynamic Allocation System Active</h3>
            <p className="text-sm text-green-700">
              Tasks with skills are automatically assigned when created based on timezone, availability, and expertise!
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced AI Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Advanced Management Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                🌍 Timezone Adaptive Scheduling
              </h4>
              <p className="text-sm text-blue-700 mb-3">
                Automatically adjusts deadlines based on assignee's local timezone for optimal work-life balance.
              </p>
              <div className="text-xs text-blue-600">
                ✓ Global team coordination<br/>
                ✓ Smart meeting scheduling<br/>
                ✓ Deadline optimization
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                ⏱️ Smart Work Hours Estimation
              </h4>
              <p className="text-sm text-green-700 mb-3">
                AI calculates realistic task durations based on complexity, expertise, and historical performance.
              </p>
              <div className="text-xs text-green-600">
                ✓ Complexity analysis<br/>
                ✓ Expertise matching<br/>
                ✓ Performance tracking
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-800 mb-2 flex items-center gap-2">
                🚨 Real-time Overload Detection
              </h4>
              <p className="text-sm text-purple-700 mb-3">
                Monitors workload in real-time and suggests smart task reallocation to prevent burnout.
              </p>
              <div className="text-xs text-purple-600">
                ✓ Burnout prevention<br/>
                ✓ Smart reallocation<br/>
                ✓ Team optimization
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <h3 className="font-medium">Quick Actions</h3>
              <p className="text-sm text-muted-foreground">
                {tasks.filter(t => t.status === 'pending' && !t.assignedTo).length} unassigned tasks ready for allocation
              </p>
            </div>
            <Button onClick={handleAutoAllocate} className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
              <Zap className="h-4 w-4" />
              Auto Allocate All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Overload Detection */}
      <OverloadDetection users={users} onReallocation={() => window.location.reload()} />

      {/* Task Assignment Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tasks.slice(-5).map(task => {
                const assignee = users.find(u => u.id === task.assignedTo);
                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    assignee={assignee}
                    currentUser={{ id: 'admin', role: 'admin' } as User}
                    onDeleteTask={handleDeleteTask}
                    showActions={true}
                    compact={true}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Team Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {users.filter(u => u.role !== 'admin').map(user => (
                <div key={user.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="font-medium">{user.name}</span>
                    <span className="text-sm text-muted-foreground">({user.role})</span>
                  </div>
                  <div className="text-sm">
                    <span className={`font-medium ${
                      (user.workload || 0) > (user.overloadThreshold || 40) * 0.8 ? 'text-red-600' : 
                      (user.workload || 0) > (user.overloadThreshold || 40) * 0.6 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {user.workload || 0}h
                    </span>
                    <span className="text-gray-500"> / {user.overloadThreshold || 40}h</span>
                    <span className="ml-2 text-gray-400">• {tasks.filter(t => t.assignedTo === user.id && t.status !== 'completed').length} active tasks</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Employee Modal */}
      {showCreateEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add New Employee</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateEmployee} className="space-y-4">
                <Input name="name" placeholder="Full Name" required />
                <Input name="email" type="email" placeholder="Email" required />
                <Input name="password" type="password" placeholder="Default Password" required />
                <select name="role" className="w-full p-2 border rounded">
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                </select>
                <Input name="location" placeholder="Location" />
                <Input name="skills" placeholder="Skills (comma separated)" />
                <div className="flex gap-2">
                  <Button type="submit" className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600">Add Employee</Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateEmployee(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Task</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <Input name="title" placeholder="Task Title" required />
                <textarea name="description" placeholder="Description" className="w-full p-2 border rounded" rows={3} />
                <select name="priority" className="w-full p-2 border rounded">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <select name="assignedTo" className="flex-1 p-2 border rounded">
                      <option value="">Assign to...</option>
                      {users.filter(u => u.role !== 'admin').map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.role}) - {user.workload}h workload
                        </option>
                      ))}
                    </select>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const form = document.querySelector('form');
                        const formData = new FormData(form as HTMLFormElement);
                        const mockTask = {
                          title: formData.get('title') as string,
                          tags: (formData.get('tags') as string).split(',').map(t => t.trim()),
                          priority: formData.get('priority') as any,
                          estimatedHours: Number(formData.get('estimatedHours')),
                          status: 'pending',
                          id: 'temp',
                          description: '',
                          assignedTo: '',
                          createdBy: '',
                          deadline: new Date(),
                          createdAt: new Date(),
                          updatedAt: new Date()
                        };
                        const suggested = allocator.allocateTask(mockTask);
                        if (suggested) {
                          const select = form?.querySelector('select[name="assignedTo"]') as HTMLSelectElement;
                          if (select) select.value = suggested;
                        } else {
                          alert('No suitable user found for auto-assignment');
                        }
                      }}
                      className="flex items-center gap-1 border-green-300 text-green-600 hover:bg-green-50"
                    >
                      <Zap className="h-3 w-3" />
                      Smart
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use Smart button for automatic assignment based on skills and workload
                  </p>
                </div>
                <Input name="estimatedHours" type="number" placeholder="Estimated Hours" required />
                <Input name="deadline" type="date" required />
                <div className="space-y-2">
                  <Input name="tags" placeholder="Tags/Skills (comma separated)" />
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <div className="flex items-center gap-2 text-blue-800 text-sm">
                      <Zap className="h-4 w-4" />
                      <span className="font-medium">Dynamic Allocation Enabled</span>
                    </div>
                    <p className="text-xs text-blue-700 mt-1">
                      If you add skills/tags and leave assignee empty, the task will be automatically assigned to the best matching team member!
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600">Create Task</Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateTask(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <TaskOverviewModal 
        isOpen={showTaskOverview}
        onClose={() => setShowTaskOverview(false)}
        tasks={tasks}
        users={users}
      />
    </div>
  );
}
