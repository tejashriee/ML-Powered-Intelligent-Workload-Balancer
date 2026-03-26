import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { User, Task } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Trophy, Clock, Target, TrendingUp, Globe, Brain, AlertTriangle } from 'lucide-react';
import { api } from '../../lib/api';
import { WorkloadChart } from '../charts/WorkloadChart';
import { OverloadDetection } from '../OverloadDetection';
import { TimezoneScheduler } from '../TimezoneScheduler';
import { WorkHoursTracker } from '../WorkHoursTracker';

interface PerformanceDashboardProps {
  users: User[];
  tasks: Task[];
}

export function PerformanceDashboard({ users, tasks }: PerformanceDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'timezone' | 'workload' | 'hours'>('overview');
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPerformanceData();
  }, [users, tasks]);

  const loadPerformanceData = async () => {
    try {
      const data = await api.getPerformanceData();
      setPerformanceData(data);
    } catch (error) {
      console.error('Failed to load performance data:', error);
      // Fallback to local calculation
      const employees = users.filter(u => u.role !== 'admin');
      const localData = employees.map(getEmployeePerformance);
      setPerformanceData(localData);
    } finally {
      setLoading(false);
    }
  };

  const getEmployeePerformance = (employee: User) => {
    const employeeTasks = tasks.filter(t => t.assignedTo === employee.id);
    const completedTasks = employeeTasks.filter(t => t.status === 'completed');
    const onTimeTasks = completedTasks.filter(t => 
      new Date(t.updatedAt) <= new Date(t.deadline)
    );
    
    return {
      id: employee.id,
      name: employee.name,
      role: employee.role,
      timezone: employee.timezone || 'America/New_York',
      totalTasks: employeeTasks.length,
      completedTasks: completedTasks.length,
      onTimeTasks: onTimeTasks.length,
      completionRate: employeeTasks.length > 0 ? (completedTasks.length / employeeTasks.length) * 100 : 0,
      onTimeRate: completedTasks.length > 0 ? (onTimeTasks.length / completedTasks.length) * 100 : 0,
      efficiency: employee.efficiency || 0,
      workload: employee.workload || 0,
      avgTaskTime: employee.avgTaskTime || 0,
      roleExpertise: employee.roleExpertise || 0.8,
      overloadThreshold: employee.overloadThreshold || 32,
      isOverloaded: (employee.workload || 0) > (employee.overloadThreshold || 32),
      tasksCompleted: employee.tasksCompleted || 0
    };
  };

  const employees = users.filter(u => u.role !== 'admin');
  const localPerformanceData = employees.map(getEmployeePerformance);
  const displayData = performanceData.length > 0 ? performanceData : localPerformanceData;

  const topPerformers = [...displayData].sort((a, b) => b.completionRate - a.completionRate).slice(0, 3);

  const chartData = displayData.map(p => ({
    name: p.name.split(' ')[0],
    completed: p.completedTasks,
    total: p.totalTasks,
    efficiency: p.efficiency
  }));

  const workloadData = displayData.map(p => ({
    name: p.name.split(' ')[0],
    workload: p.workload
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Calculate summary metrics
  const totalActiveTasks = tasks.filter(t => t.status !== 'completed').length;
  const totalCompletedTasks = tasks.filter(t => t.status === 'completed').length;
  const averageEfficiency = displayData.reduce((sum, p) => sum + p.efficiency, 0) / displayData.length;
  const completionRate = tasks.length > 0 ? (totalCompletedTasks / tasks.length) * 100 : 0;
  const onTimeRate = displayData.reduce((sum, p) => sum + p.onTimeRate, 0) / displayData.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Enhanced Performance Analytics</h2>
        <div className="text-sm text-muted-foreground">
          Real-time insights • Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📊 Overview
        </button>
        <button
          onClick={() => setActiveTab('timezone')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'timezone'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🌍 Timezone Scheduler
        </button>
        <button
          onClick={() => setActiveTab('workload')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'workload'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🚨 Overload Detection
        </button>
        <button
          onClick={() => setActiveTab('hours')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'hours'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          ⏱️ Work Hours Tracker
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Efficiency</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageEfficiency.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  {averageEfficiency > 85 ? '🟢 Excellent' : averageEfficiency > 70 ? '🟡 Good' : '🔴 Needs Improvement'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalActiveTasks}</div>
                <p className="text-xs text-muted-foreground">
                  {totalCompletedTasks} completed this period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{displayData.length}</div>
                <p className="text-xs text-muted-foreground">
                  {displayData.filter(p => p.isOverloaded).length} overloaded
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  {onTimeRate.toFixed(1)}% delivered on time
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Performers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topPerformers.map((performer, index) => (
              <Card key={performer.id} className={index === 0 ? 'border-yellow-200 bg-yellow-50' : ''}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {index === 0 && <Trophy className="h-4 w-4 text-yellow-500 inline mr-1" />}
                    {performer.name}
                  </CardTitle>
                  <Badge variant={index === 0 ? 'default' : 'secondary'}>
                    #{index + 1}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{performer.completionRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">Completion Rate</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Tasks: {performer.completedTasks}/{performer.totalTasks}</span>
                      <span>Avg: {performer.avgTaskTime?.toFixed(1) || 'N/A'}h</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Task Completion Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completed" fill="#0088FE" name="Completed" />
                    <Bar dataKey="total" fill="#E5E7EB" name="Total" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Workload Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <WorkloadChart users={users} />
              </CardContent>
            </Card>
          </div>

          {/* Detailed Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Detailed Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Employee</th>
                      <th className="text-left p-2">Role</th>
                      <th className="text-left p-2">Timezone</th>
                      <th className="text-left p-2">Tasks</th>
                      <th className="text-left p-2">Completed</th>
                      <th className="text-left p-2">Avg Hours</th>
                      <th className="text-left p-2">Efficiency</th>
                      <th className="text-left p-2">Workload</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayData.map((employee) => (
                      <tr key={employee.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{employee.name}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            employee.role === 'manager' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {employee.role}
                          </span>
                        </td>
                        <td className="p-2 text-xs">
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {employee.timezone?.split('/')[1] || 'N/A'}
                          </span>
                        </td>
                        <td className="p-2">{employee.totalTasks}</td>
                        <td className="p-2">
                          <span className="text-green-600 font-medium">{employee.completedTasks}</span>
                        </td>
                        <td className="p-2">
                          <span className="text-blue-600 font-medium">{employee.avgTaskTime?.toFixed(1) || 'N/A'}h</span>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <Progress value={employee.efficiency} className="w-16 h-2" />
                            <span className="text-sm font-medium">{employee.efficiency}%</span>
                          </div>
                        </td>
                        <td className="p-2">
                          <span className={`font-medium ${
                            employee.isOverloaded ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {employee.workload}h
                          </span>
                        </td>
                        <td className="p-2">
                          {employee.isOverloaded ? (
                            <span className="flex items-center gap-1 text-red-600">
                              <AlertTriangle className="h-3 w-3" />
                              Overloaded
                            </span>
                          ) : (
                            <span className="text-green-600">✓ Optimal</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
      
      {activeTab === 'timezone' && (
        <TimezoneScheduler users={users} />
      )}
      
      {activeTab === 'workload' && (
        <OverloadDetection users={users} onReallocation={loadPerformanceData} />
      )}
      
      {activeTab === 'hours' && (
        <WorkHoursTracker users={users} tasks={tasks} />
      )}
    </div>
  );
}