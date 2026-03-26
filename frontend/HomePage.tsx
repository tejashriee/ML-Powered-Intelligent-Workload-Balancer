import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { User, Task, Analytics } from '../types';
import { 
  Users, 
  CheckSquare, 
  BarChart3, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  Calendar,
  Target,
  Award,
  Zap,
  Activity,
  ArrowRight
} from 'lucide-react';

interface HomePageProps {
  currentUser: User;
  users: User[];
  tasks: Task[];
  analytics: Analytics;
  onRouteChange: (route: string) => void;
}

export function HomePage({ currentUser, users, tasks, analytics, onRouteChange }: HomePageProps) {
  const userTasks = tasks.filter(t => t.assignedTo === currentUser.id);
  const pendingTasks = userTasks.filter(t => t.status === 'pending');
  const completedTasks = userTasks.filter(t => t.status === 'completed');
  const overdueTasks = userTasks.filter(t => 
    t.status !== 'completed' && new Date(t.deadline) < new Date()
  );

  const recentTasks = tasks
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const topPerformers = users
    .filter(u => u.role === 'employee')
    .sort((a, b) => (b.efficiency || 0) - (a.efficiency || 0))
    .slice(0, 3);

  const quickActions = [
    { 
      title: 'Task Management', 
      description: 'View and manage all tasks', 
      icon: CheckSquare, 
      route: 'tasks',
      color: 'bg-blue-500'
    },
    { 
      title: 'Team Overview', 
      description: 'View team members and assignments', 
      icon: Users, 
      route: 'employees',
      color: 'bg-green-500',
      adminOnly: true
    },
    { 
      title: 'Performance Analytics', 
      description: 'View detailed performance metrics', 
      icon: BarChart3, 
      route: 'performance',
      color: 'bg-purple-500',
      adminOnly: true
    },
    { 
      title: 'Dashboard', 
      description: 'Go to main dashboard', 
      icon: Target, 
      route: 'dashboard',
      color: 'bg-orange-500'
    }
  ];

  const availableActions = quickActions.filter(action => 
    !action.adminOnly || currentUser.role === 'admin'
  );

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-8 rounded-xl shadow-2xl border border-slate-700/50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}></div>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {currentUser.name}!
            </h1>
            <p className="text-blue-100">
              Here's your productivity overview for today
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-slate-700/50 bg-slate-800/90 backdrop-blur-sm hover:bg-slate-800 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">My Tasks</CardTitle>
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <CheckSquare className="h-4 w-4 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{userTasks.length}</div>
            <p className="text-xs text-slate-400">
              {pendingTasks.length} pending
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-slate-800/90 backdrop-blur-sm hover:bg-slate-800 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Completed</CardTitle>
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Award className="h-4 w-4 text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{completedTasks.length}</div>
            <p className="text-xs text-slate-400">
              Tasks finished
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-slate-800/90 backdrop-blur-sm hover:bg-slate-800 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Overdue</CardTitle>
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{overdueTasks.length}</div>
            <p className="text-xs text-slate-400">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-slate-800/90 backdrop-blur-sm hover:bg-slate-800 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Efficiency</CardTitle>
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{currentUser.efficiency || 0}%</div>
            <p className="text-xs text-slate-400">
              Performance rating
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-slate-700/50 bg-slate-800/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-400" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {availableActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.route}
                  variant="outline"
                  className="h-auto p-6 flex flex-col items-center gap-3 border-slate-600 bg-slate-700/50 hover:bg-slate-700 text-white transition-all group"
                  onClick={() => onRouteChange(action.route)}
                >
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-white">{action.title}</div>
                    <div className="text-xs text-slate-400">
                      {action.description}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <Card className="border-slate-700/50 bg-slate-800/90 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <Clock className="h-5 w-5 text-blue-400" />
              Recent Tasks
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onRouteChange('tasks')} className="text-slate-300 hover:text-white hover:bg-slate-700">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTasks.length === 0 ? (
                <p className="text-slate-400 text-center py-4">No tasks yet</p>
              ) : (
                recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border border-slate-600 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                    <div className="flex-1">
                      <div className="font-medium text-white">{task.title}</div>
                      <div className="text-sm text-slate-400">
                        {task.assignedTo ? 
                          users.find(u => u.id === task.assignedTo)?.name || 'Unassigned' : 
                          'Unassigned'
                        }
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={
                        task.priority === 'urgent' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        task.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 
                        task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 
                        'bg-green-500/20 text-green-400 border-green-500/30'
                      }>
                        {task.priority}
                      </Badge>
                      <Badge className={
                        task.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 
                        task.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 
                        'bg-slate-500/20 text-slate-400 border-slate-500/30'
                      }>
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Team Performance (Admin Only) */}
        {currentUser.role === 'admin' && (
          <Card className="border-slate-700/50 bg-slate-800/90 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-white">
                <Award className="h-5 w-5 text-yellow-400" />
                Top Performers
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onRouteChange('performance')} className="text-slate-300 hover:text-white hover:bg-slate-700">
                View Details
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topPerformers.length === 0 ? (
                  <p className="text-slate-400 text-center py-4">No employees yet</p>
                ) : (
                  topPerformers.map((user, index) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border border-slate-600 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 
                          index === 1 ? 'bg-gradient-to-r from-slate-400 to-slate-500' : 
                          'bg-gradient-to-r from-orange-400 to-orange-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-white">{user.name}</div>
                          <div className="text-sm text-slate-400">{user.role}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white">{user.efficiency || 0}%</div>
                        <div className="text-sm text-slate-400">Efficiency</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* My Workload (Employee View) */}
        {currentUser.role === 'employee' && (
          <Card className="border-slate-700/50 bg-slate-800/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Calendar className="h-5 w-5 text-indigo-400" />
                My Workload
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Current Workload</span>
                  <Badge className={
                    (currentUser.workload || 0) > 40 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 
                    (currentUser.workload || 0) > 20 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 
                    'bg-green-500/20 text-green-400 border-green-500/30'
                  }>
                    {currentUser.workload || 0}h
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Pending Tasks</span>
                  <span className="font-bold text-white">{pendingTasks.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Completion Rate</span>
                  <span className="font-bold text-white">
                    {userTasks.length > 0 ? 
                      Math.round((completedTasks.length / userTasks.length) * 100) : 0
                    }%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* System Overview (Admin Only) */}
      {currentUser.role === 'admin' && (
        <Card className="border-slate-700/50 bg-slate-800/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-400" />
              System Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                <div className="text-2xl font-bold text-blue-400">{analytics.totalTasks}</div>
                <div className="text-sm text-slate-400">Total Tasks</div>
              </div>
              <div className="text-center p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                <div className="text-2xl font-bold text-green-400">{analytics.completedTasks}</div>
                <div className="text-sm text-slate-400">Completed</div>
              </div>
              <div className="text-center p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                <div className="text-2xl font-bold text-red-400">{analytics.overdueTasks}</div>
                <div className="text-sm text-slate-400">Overdue</div>
              </div>
              <div className="text-center p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                <div className="text-2xl font-bold text-purple-400">{users.filter(u => u.role !== 'admin').length}</div>
                <div className="text-sm text-slate-400">Employees</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
