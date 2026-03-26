import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Users, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { User } from '@/types';

interface OverloadAlert {
  id: string;
  employeeId: string;
  employeeName: string;
  currentWorkload: number;
  threshold: number;
  severity: 'warning' | 'critical';
  timestamp: string;
  suggestions: Array<{
    taskId: string;
    taskTitle: string;
    fromEmployee: string;
    toEmployee: string;
    toEmployeeName: string;
    reason: string;
  }>;
}

interface OverloadDetectionProps {
  users: User[];
  onReallocation?: () => void;
}

export function OverloadDetection({ users, onReallocation }: OverloadDetectionProps) {
  const [alerts, setAlerts] = useState<OverloadAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  useEffect(() => {
    loadOverloadAlerts();
    const interval = setInterval(loadOverloadAlerts, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadOverloadAlerts = async () => {
    try {
      const data = await api.getOverloadAlerts();
      setAlerts(data);
    } catch (error) {
      console.error('Failed to load overload alerts:', error);
    }
  };

  const handleReallocation = async (taskId: string, fromEmployeeId: string, toEmployeeId: string) => {
    setLoading(true);
    try {
      await api.executeReallocation(taskId, fromEmployeeId, toEmployeeId);
      await loadOverloadAlerts(); // Refresh alerts
      onReallocation?.();
    } catch (error) {
      console.error('Reallocation failed:', error);
      alert('Failed to reallocate task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 border-red-300 text-red-800';
      case 'warning': return 'bg-orange-100 border-orange-300 text-orange-800';
      default: return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    return severity === 'critical' ? '🚨' : '⚠️';
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <TrendingUp className="h-5 w-5" />
            Workload Status: Optimal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-muted-foreground">
              All team members are within their optimal workload thresholds
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-600">
          <AlertTriangle className="h-5 w-5" />
          Overload Detection System
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {alerts.length} employee{alerts.length > 1 ? 's' : ''} detected with workload concerns
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-lg">{getSeverityIcon(alert.severity)}</span>
                <div>
                  <h4 className="font-semibold">{alert.employeeName}</h4>
                  <p className="text-sm opacity-80">
                    {alert.currentWorkload}h workload (threshold: {alert.threshold}h)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs opacity-70">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpandedAlert(
                    expandedAlert === alert.id ? null : alert.id
                  )}
                  className="border-current"
                >
                  {expandedAlert === alert.id ? 'Hide' : 'View'} Solutions
                </Button>
              </div>
            </div>

            {expandedAlert === alert.id && alert.suggestions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-current/20">
                <h5 className="font-medium mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Smart Reallocation Suggestions
                </h5>
                <div className="space-y-3">
                  {alert.suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="bg-white/50 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{suggestion.taskTitle}</p>
                        <div className="flex items-center gap-2 text-xs opacity-80 mt-1">
                          <Users className="h-3 w-3" />
                          <span>Reassign to {suggestion.toEmployeeName}</span>
                          <ArrowRight className="h-3 w-3" />
                          <span>{suggestion.reason}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleReallocation(
                          suggestion.taskId,
                          suggestion.fromEmployee,
                          suggestion.toEmployee
                        )}
                        disabled={loading}
                        className="bg-white/80 text-current border-current hover:bg-white"
                      >
                        {loading ? (
                          <Clock className="h-3 w-3 animate-spin" />
                        ) : (
                          'Apply'
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {expandedAlert === alert.id && alert.suggestions.length === 0 && (
              <div className="mt-4 pt-4 border-t border-current/20">
                <p className="text-sm opacity-80">
                  No automatic reallocation suggestions available. 
                  Consider manual task redistribution or adjusting deadlines.
                </p>
              </div>
            )}
          </div>
        ))}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h5 className="font-medium text-blue-800 mb-2">💡 Optimization Tips</h5>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Consider extending deadlines for non-urgent tasks</li>
            <li>• Review task complexity and break down large tasks</li>
            <li>• Evaluate if additional team members are needed</li>
            <li>• Check for skill mismatches that increase task duration</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}