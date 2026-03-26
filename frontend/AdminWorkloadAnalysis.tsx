import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Brain, User, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { GeminiTaskAllocator } from '@/lib/gemini-allocator';
import { User as UserType, Task } from '@/types';

interface SentimentAlert {
  id: string;
  employeeId: string;
  employeeName: string;
  message: string;
  sentiment: {
    sentiment: string;
    stressLevel: number;
  };
  timestamp: Date;
  status: 'pending' | 'analyzed' | 'resolved';
}

interface AdminWorkloadAnalysisProps {
  users: UserType[];
  tasks: Task[];
  sentimentAlerts: SentimentAlert[];
  onAllocateTask: (fromUserId: string, toUserId: string, taskId?: string) => void;
  onResolveAlert: (alertId: string) => void;
}

export function AdminWorkloadAnalysis({ 
  users, 
  tasks, 
  sentimentAlerts, 
  onAllocateTask, 
  onResolveAlert 
}: AdminWorkloadAnalysisProps) {
  const [allocator] = useState(() => new GeminiTaskAllocator());
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<{[key: string]: any}>({});

  const handleAnalyzeWorkload = async (alert: SentimentAlert) => {
    setAnalyzing(alert.id);
    allocator.updateEmployees(users);
    
    const employee = users.find(u => u.id === alert.employeeId);
    if (!employee) return;

    // Analyze workload and get recommendations
    const result = await allocator.processAlert(alert.message, alert.employeeId, false);
    
    setAnalysisResults(prev => ({
      ...prev,
      [alert.id]: {
        ...result,
        currentWorkload: employee.workload,
        recommendedAction: employee.workload > 35 ? 'redistribute' : 'monitor',
        stressLevel: alert.sentiment.stressLevel
      }
    }));
    
    setAnalyzing(null);
  };

  const handleQuickAllocate = (alert: SentimentAlert, targetUserId: string) => {
    const employee = users.find(u => u.id === alert.employeeId);
    const userTasks = tasks.filter(t => t.assignedTo === alert.employeeId && t.status !== 'completed');
    
    if (userTasks.length > 0) {
      onAllocateTask(alert.employeeId, targetUserId, userTasks[0].id);
    } else {
      onAllocateTask(alert.employeeId, targetUserId);
    }
    
    onResolveAlert(alert.id);
  };

  const pendingAlerts = sentimentAlerts.filter(alert => alert.status === 'pending');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Workload Analysis ({pendingAlerts.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {pendingAlerts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending sentiment alerts</p>
        ) : (
          pendingAlerts.map(alert => {
            const employee = users.find(u => u.id === alert.employeeId);
            const analysis = analysisResults[alert.id];
            
            return (
              <div key={alert.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4" />
                    <div>
                      <p className="font-medium">{alert.employeeName}</p>
                      <p className="text-sm text-muted-foreground">
                        {employee?.workload}h workload • {alert.sentiment.stressLevel.toFixed(0)}% stress
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      alert.sentiment.stressLevel > 70 ? 'bg-red-100 text-red-800' :
                      alert.sentiment.stressLevel > 50 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {alert.sentiment.sentiment}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm italic">"{alert.message}"</p>
                </div>

                {!analysis ? (
                  <Button 
                    onClick={() => handleAnalyzeWorkload(alert)}
                    disabled={analyzing === alert.id}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Brain className="h-4 w-4" />
                    {analyzing === alert.id ? 'Analyzing...' : 'AI Analysis'}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded">
                      <p className="text-sm font-medium mb-2">🤖 AI Analysis:</p>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="font-medium">Workload:</span> {analysis.currentWorkload}h
                        </div>
                        <div>
                          <span className="font-medium">Action:</span> {analysis.recommendedAction}
                        </div>
                        <div>
                          <span className="font-medium">Stress Level:</span> {analysis.stressLevel}%
                        </div>
                        <div>
                          <span className="font-medium">Status:</span> 
                          <span className={analysis.stressLevel > 70 ? 'text-red-600' : 'text-green-600'}>
                            {analysis.stressLevel > 70 ? ' Critical' : ' Manageable'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {analysis.recommendations && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Recommended Team Members:</p>
                        {analysis.recommendations.slice(0, 2).map((rec: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-white border rounded">
                            <div>
                              <span className="font-medium">{rec.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                {rec.score}% match • {rec.reason}
                              </span>
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => handleQuickAllocate(alert, rec.employeeId)}
                            >
                              Allocate
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onResolveAlert(alert.id)}
                        className="flex items-center gap-1"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Resolve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => onResolveAlert(alert.id)}
                        className="flex items-center gap-1"
                      >
                        <X className="h-3 w-3" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
