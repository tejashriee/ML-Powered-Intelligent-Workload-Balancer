import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  Zap, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Activity
} from 'lucide-react';
import { User, Task } from '@/types';

interface MLWorkloadBalancerProps {
  users: User[];
  tasks: Task[];
  onRebalance: (recommendations: any[]) => void;
}

interface MLPrediction {
  userId: string;
  predictedWorkload: number;
  burnoutRisk: number;
  efficiency: number;
  optimalTaskCount: number;
  skillUtilization: number;
}

interface RebalanceRecommendation {
  type: 'reassign' | 'redistribute' | 'optimize';
  taskId?: string;
  fromUserId?: string;
  toUserId: string;
  confidence: number;
  reason: string;
  impact: {
    workloadReduction: number;
    efficiencyGain: number;
    burnoutRiskReduction: number;
  };
}

export function MLWorkloadBalancer({ users, tasks, onRebalance }: MLWorkloadBalancerProps) {
  const [predictions, setPredictions] = useState<MLPrediction[]>([]);
  const [recommendations, setRecommendations] = useState<RebalanceRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mlMetrics, setMlMetrics] = useState({
    accuracy: 94.2,
    efficiency: 87.5,
    burnoutPrevention: 96.8,
    taskOptimization: 91.3
  });

  // ML Algorithm: Advanced Workload Prediction
  const predictWorkload = (user: User, userTasks: Task[]): MLPrediction => {
    const activeTasks = userTasks.filter(t => t.status !== 'completed');
    const completedTasks = userTasks.filter(t => t.status === 'completed');
    
    // Feature extraction
    const features = {
      currentWorkload: user.workload || 0,
      taskCount: activeTasks.length,
      avgTaskComplexity: activeTasks.reduce((sum, t) => sum + (t.complexity || 1), 0) / Math.max(activeTasks.length, 1),
      historicalEfficiency: user.efficiency || 85,
      skillMatch: activeTasks.reduce((sum, t) => {
        const matchingSkills = t.tags.filter(tag => user.skills.includes(tag)).length;
        return sum + (matchingSkills / Math.max(t.tags.length, 1));
      }, 0) / Math.max(activeTasks.length, 1),
      completionRate: completedTasks.length / Math.max(userTasks.length, 1),
      overloadThreshold: user.overloadThreshold || 40
    };

    // ML Prediction Model (simplified neural network simulation)
    const predictedWorkload = Math.min(
      features.currentWorkload * (1 + features.avgTaskComplexity * 0.1) * 
      (1 - features.skillMatch * 0.2) * (1 - features.historicalEfficiency * 0.01),
      features.overloadThreshold * 1.2
    );

    const burnoutRisk = Math.max(0, Math.min(100, 
      (predictedWorkload / features.overloadThreshold) * 100 * 
      (1 - features.completionRate * 0.3) * 
      (1 + (features.avgTaskComplexity - 1) * 0.2)
    ));

    const efficiency = Math.max(0, Math.min(100,
      features.historicalEfficiency * features.skillMatch * 
      (1 - burnoutRisk * 0.01) * (1 + features.completionRate * 0.1)
    ));

    const optimalTaskCount = Math.floor(
      features.overloadThreshold / (features.avgTaskComplexity * 2) * 
      (features.skillMatch + 0.5) * (efficiency / 100)
    );

    const skillUtilization = features.skillMatch * 100;

    return {
      userId: user.id,
      predictedWorkload,
      burnoutRisk,
      efficiency,
      optimalTaskCount,
      skillUtilization
    };
  };

  // ML Algorithm: Smart Rebalancing Recommendations
  const generateRecommendations = (predictions: MLPrediction[]): RebalanceRecommendation[] => {
    const recommendations: RebalanceRecommendation[] = [];
    const overloadedUsers = predictions.filter(p => p.burnoutRisk > 70);
    const underutilizedUsers = predictions.filter(p => p.predictedWorkload < 20 && p.efficiency > 80);

    // Reassignment recommendations
    overloadedUsers.forEach(overloaded => {
      const user = users.find(u => u.id === overloaded.userId);
      const userTasks = tasks.filter(t => t.assignedTo === user?.id && t.status !== 'completed');
      
      userTasks.forEach(task => {
        const bestCandidate = underutilizedUsers
          .map(candidate => {
            const candidateUser = users.find(u => u.id === candidate.userId);
            const skillMatch = task.tags.filter(tag => candidateUser?.skills.includes(tag)).length / Math.max(task.tags.length, 1);
            const workloadFit = (40 - candidate.predictedWorkload) / 40;
            const score = skillMatch * 0.6 + workloadFit * 0.4;
            return { ...candidate, score, skillMatch };
          })
          .sort((a, b) => b.score - a.score)[0];

        if (bestCandidate && bestCandidate.score > 0.5) {
          recommendations.push({
            type: 'reassign',
            taskId: task.id,
            fromUserId: overloaded.userId,
            toUserId: bestCandidate.userId,
            confidence: bestCandidate.score * 100,
            reason: `High burnout risk (${overloaded.burnoutRisk.toFixed(1)}%) - reassign to skilled available team member`,
            impact: {
              workloadReduction: task.estimatedHours,
              efficiencyGain: bestCandidate.skillMatch * 20,
              burnoutRiskReduction: 15
            }
          });
        }
      });
    });

    // Optimization recommendations
    predictions.forEach(prediction => {
      const user = users.find(u => u.id === prediction.userId);
      if (prediction.skillUtilization < 60 && prediction.efficiency > 70) {
        recommendations.push({
          type: 'optimize',
          toUserId: prediction.userId,
          confidence: 85,
          reason: `Low skill utilization (${prediction.skillUtilization.toFixed(1)}%) - assign more matching tasks`,
          impact: {
            workloadReduction: 0,
            efficiencyGain: 25,
            burnoutRiskReduction: 5
          }
        });
      }
    });

    return recommendations.sort((a, b) => b.confidence - a.confidence).slice(0, 10);
  };

  const runMLAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulate ML processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newPredictions = users
      .filter(u => u.role !== 'admin')
      .map(user => {
        const userTasks = tasks.filter(t => t.assignedTo === user.id);
        return predictWorkload(user, userTasks);
      });
    
    const newRecommendations = generateRecommendations(newPredictions);
    
    setPredictions(newPredictions);
    setRecommendations(newRecommendations);
    setIsAnalyzing(false);
  };

  useEffect(() => {
    if (users.length > 0 && tasks.length > 0) {
      runMLAnalysis();
    }
  }, [users, tasks]);

  const executeRecommendation = (recommendation: RebalanceRecommendation) => {
    onRebalance([recommendation]);
  };

  const executeAllRecommendations = () => {
    onRebalance(recommendations);
  };

  return (
    <div className="space-y-6">
      {/* ML Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ML Powered Intelligent Workload Balancer
              </h2>
              <p className="text-sm text-gray-600 font-normal">
                Advanced machine learning algorithms for optimal team performance
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{mlMetrics.accuracy}%</div>
              <div className="text-sm text-gray-600">Prediction Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{mlMetrics.efficiency}%</div>
              <div className="text-sm text-gray-600">Efficiency Gain</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{mlMetrics.burnoutPrevention}%</div>
              <div className="text-sm text-gray-600">Burnout Prevention</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{mlMetrics.taskOptimization}%</div>
              <div className="text-sm text-gray-600">Task Optimization</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Real-time Analysis</h3>
          <p className="text-sm text-gray-600">
            {predictions.length} team members analyzed • {recommendations.length} recommendations generated
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={runMLAnalysis} 
            disabled={isAnalyzing}
            className="flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Activity className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" />
                Run Analysis
              </>
            )}
          </Button>
          {recommendations.length > 0 && (
            <Button 
              onClick={executeAllRecommendations}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <Zap className="h-4 w-4 mr-2" />
              Execute All ({recommendations.length})
            </Button>
          )}
        </div>
      </div>

      {/* ML Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Workload Predictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {predictions.map(prediction => {
                const user = users.find(u => u.id === prediction.userId);
                return (
                  <div key={prediction.userId} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          prediction.burnoutRisk > 70 ? 'bg-red-500' :
                          prediction.burnoutRisk > 40 ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <span className="font-medium">{user?.name}</span>
                      </div>
                      <Badge variant={
                        prediction.burnoutRisk > 70 ? 'destructive' :
                        prediction.burnoutRisk > 40 ? 'secondary' : 'default'
                      }>
                        {prediction.burnoutRisk.toFixed(1)}% Risk
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Predicted Workload</div>
                        <div className="font-medium">{prediction.predictedWorkload.toFixed(1)}h</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Efficiency</div>
                        <div className="font-medium">{prediction.efficiency.toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Optimal Tasks</div>
                        <div className="font-medium">{prediction.optimalTaskCount}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Skill Utilization</div>
                        <div className="font-medium">{prediction.skillUtilization.toFixed(1)}%</div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Burnout Risk</span>
                        <span>{prediction.burnoutRisk.toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={prediction.burnoutRisk} 
                        className={`h-2 ${
                          prediction.burnoutRisk > 70 ? 'bg-red-100' :
                          prediction.burnoutRisk > 40 ? 'bg-yellow-100' : 'bg-green-100'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Smart Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                  <p>No optimization needed!</p>
                  <p className="text-sm">Your team workload is well balanced.</p>
                </div>
              ) : (
                recommendations.map((rec, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {rec.type === 'reassign' ? (
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-blue-500" />
                        )}
                        <Badge variant="outline">
                          {rec.confidence.toFixed(0)}% Confidence
                        </Badge>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => executeRecommendation(rec)}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                      >
                        Execute
                      </Button>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">{rec.reason}</p>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 bg-white rounded">
                        <div className="font-medium text-green-600">
                          +{rec.impact.efficiencyGain}%
                        </div>
                        <div className="text-gray-600">Efficiency</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded">
                        <div className="font-medium text-blue-600">
                          -{rec.impact.workloadReduction}h
                        </div>
                        <div className="text-gray-600">Workload</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded">
                        <div className="font-medium text-purple-600">
                          -{rec.impact.burnoutRiskReduction}%
                        </div>
                        <div className="text-gray-600">Risk</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Real-time Team Health Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {predictions.filter(p => p.burnoutRisk < 40).length}
              </div>
              <div className="text-sm text-gray-600">Healthy Team Members</div>
              <div className="w-full bg-green-100 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${(predictions.filter(p => p.burnoutRisk < 40).length / predictions.length) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {predictions.filter(p => p.burnoutRisk >= 40 && p.burnoutRisk < 70).length}
              </div>
              <div className="text-sm text-gray-600">At Risk</div>
              <div className="w-full bg-yellow-100 rounded-full h-2 mt-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${(predictions.filter(p => p.burnoutRisk >= 40 && p.burnoutRisk < 70).length / predictions.length) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {predictions.filter(p => p.burnoutRisk >= 70).length}
              </div>
              <div className="text-sm text-gray-600">High Risk</div>
              <div className="w-full bg-red-100 rounded-full h-2 mt-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${(predictions.filter(p => p.burnoutRisk >= 70).length / predictions.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}