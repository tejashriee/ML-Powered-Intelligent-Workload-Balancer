import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, TrendingUp, BarChart3, Target, Brain, Zap } from 'lucide-react';
import { api } from '@/lib/api';
import { User, Task } from '@/types';

interface WorkHoursTrackerProps {
  users: User[];
  tasks: Task[];
  selectedUserId?: string;
}

interface WorkloadHistory {
  employeeId: string;
  timestamp: string;
  workload: number;
  action: 'task_assigned' | 'task_reassigned' | 'task_completed' | 'task_deleted';
  taskId: string;
}

interface EstimatedHoursData {
  taskId: string;
  taskTitle: string;
  originalEstimate: number;
  actualEstimate: number;
  complexity: number;
  assigneeName: string;
  status: string;
  adjustmentReason: string;
}

export function WorkHoursTracker({ users, tasks, selectedUserId }: WorkHoursTrackerProps) {
  const [workloadHistory, setWorkloadHistory] = useState<WorkloadHistory[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(7);
  const [loading, setLoading] = useState(false);
  const [estimatedHoursData, setEstimatedHoursData] = useState<EstimatedHoursData[]>([]);

  useEffect(() => {
    loadWorkloadHistory();
    calculateEstimatedHours();
  }, [selectedUserId, selectedPeriod, tasks, users]);

  const loadWorkloadHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getWorkloadHistory(selectedUserId, selectedPeriod);
      setWorkloadHistory(data);
    } catch (error) {
      console.error('Failed to load workload history:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateEstimatedHours = () => {
    const enhancedTasks: EstimatedHoursData[] = tasks
      .filter(task => !selectedUserId || task.assignedTo === selectedUserId)
      .map(task => {
        const assignee = users.find(u => u.id === task.assignedTo);
        const originalEstimate = task.estimatedHours || 4;
        const actualEstimate = (task as any).actualEstimatedHours || originalEstimate;
        const complexity = (task as any).complexity || 1.0;
        
        let adjustmentReason = '';
        if (actualEstimate > originalEstimate) {
          const factors = [];
          if (complexity > 1.2) factors.push('high complexity');
          if (assignee && assignee.efficiency < 90) factors.push('efficiency adjustment');
          if (assignee && assignee.roleExpertise < 0.8) factors.push('expertise level');
          adjustmentReason = factors.length > 0 ? `Increased due to: ${factors.join(', ')}` : 'Algorithm adjustment';
        } else if (actualEstimate < originalEstimate) {
          adjustmentReason = 'Reduced due to high expertise and efficiency';
        } else {
          adjustmentReason = 'No adjustment needed';
        }

        return {
          taskId: task.id,
          taskTitle: task.title,
          originalEstimate,
          actualEstimate,
          complexity,
          assigneeName: assignee?.name || 'Unassigned',
          status: task.status,
          adjustmentReason
        };
      });

    setEstimatedHoursData(enhancedTasks);
  };

  const getWorkloadTrend = () => {
    if (workloadHistory.length < 2) return { trend: 'stable', change: 0 };
    
    const recent = workloadHistory.slice(-5);
    const older = workloadHistory.slice(-10, -5);
    
    const recentAvg = recent.reduce((sum, h) => sum + h.workload, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((sum, h) => sum + h.workload, 0) / older.length : recentAvg;
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    if (change > 10) return { trend: 'increasing', change };
    if (change < -10) return { trend: 'decreasing', change };
    return { trend: 'stable', change };
  };

  const getAccuracyMetrics = () => {
    const tasksWithEstimates = estimatedHoursData.filter(t => t.originalEstimate > 0);
    if (tasksWithEstimates.length === 0) return { accuracy: 0, avgAdjustment: 0 };
    
    const totalOriginal = tasksWithEstimates.reduce((sum, t) => sum + t.originalEstimate, 0);
    const totalActual = tasksWithEstimates.reduce((sum, t) => sum + t.actualEstimate, 0);
    
    const accuracy = Math.max(0, 100 - Math.abs((totalActual - totalOriginal) / totalOriginal) * 100);
    const avgAdjustment = (totalActual - totalOriginal) / tasksWithEstimates.length;
    
    return { accuracy: Math.round(accuracy), avgAdjustment: Math.round(avgAdjustment * 10) / 10 };
  };

  const selectedUser = selectedUserId ? users.find(u => u.id === selectedUserId) : null;
  const workloadTrend = getWorkloadTrend();
  const accuracyMetrics = getAccuracyMetrics();

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <TrendingUp className="h-4 w-4 text-green-500 rotate-180" />;
      default: return <BarChart3 className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'text-red-600';
      case 'decreasing': return 'text-green-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Estimated Work Hours Tracker
          </CardTitle>
          <div className="flex items-center gap-4">
            <select
              value={selectedUserId || ''}
              onChange={(e) => window.location.hash = e.target.value ? `user-${e.target.value}` : ''}
              className="px-3 py-1 border rounded text-sm"
            >
              <option value="">All Team Members</option>
              {users.filter(u => u.role !== 'admin').map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
            
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
              className="px-3 py-1 border rounded text-sm"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-500" />
                <h4 className="font-medium">Estimation Accuracy</h4>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {accuracyMetrics.accuracy}%
              </div>
              <p className="text-sm text-muted-foreground">
                Avg adjustment: {accuracyMetrics.avgAdjustment > 0 ? '+' : ''}{accuracyMetrics.avgAdjustment}h
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {getTrendIcon(workloadTrend.trend)}
                <h4 className="font-medium">Workload Trend</h4>
              </div>
              <div className={`text-2xl font-bold ${getTrendColor(workloadTrend.trend)}`}>
                {workloadTrend.change > 0 ? '+' : ''}{Math.round(workloadTrend.change)}%
              </div>
              <p className="text-sm text-muted-foreground capitalize">
                {workloadTrend.trend} over {selectedPeriod} days
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-purple-500" />
                <h4 className="font-medium">Smart Adjustments</h4>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {estimatedHoursData.filter(t => t.actualEstimate !== t.originalEstimate).length}
              </div>
              <p className="text-sm text-muted-foreground">
                Tasks with AI adjustments
              </p>
            </div>
          </div>

          {selectedUser && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                {selectedUser.name}'s Performance Profile
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Avg Task Time:</span>
                  <div className="font-semibold">{selectedUser.avgTaskTime?.toFixed(1) || 'N/A'}h</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Role Expertise:</span>
                  <div className="font-semibold">{((selectedUser.roleExpertise || 0.8) * 100).toFixed(0)}%</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Efficiency:</span>
                  <div className="font-semibold">{selectedUser.efficiency}%</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Overload Threshold:</span>
                  <div className="font-semibold">{selectedUser.overloadThreshold || 32}h</div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h4 className="font-medium">Recent Task Estimates</h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {estimatedHoursData.slice(0, 10).map((task) => (
                <div
                  key={task.taskId}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <h5 className="font-medium text-sm">{task.taskTitle}</h5>
                    <p className="text-xs text-muted-foreground">
                      Assigned to: {task.assigneeName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {task.adjustmentReason}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {task.originalEstimate}h
                      </span>
                      <span className="text-sm">→</span>
                      <span className={`text-sm font-semibold ${
                        task.actualEstimate > task.originalEstimate ? 'text-red-600' :
                        task.actualEstimate < task.originalEstimate ? 'text-green-600' :
                        'text-blue-600'
                      }`}>
                        {task.actualEstimate}h
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Complexity: {task.complexity.toFixed(1)}x
                    </div>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h5 className="font-medium text-blue-800 mb-2">🧠 How Smart Estimation Works</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Task Complexity:</strong> Analyzes priority, description length, and tags</li>
              <li>• <strong>Role Expertise:</strong> Adjusts based on employee's skill level in the domain</li>
              <li>• <strong>Historical Performance:</strong> Uses past completion times for accuracy</li>
              <li>• <strong>Efficiency Factor:</strong> Considers individual productivity rates</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
