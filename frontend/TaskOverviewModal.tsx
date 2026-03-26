import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { X, User, Clock, Calendar, Tag, CheckCircle2, Play, AlertCircle, Pause } from 'lucide-react';
import { Task, User as UserType } from '@/types';
import { getTaskPriorityColor, getStatusColor, formatDate } from '@/lib/utils';

interface TaskOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  users: UserType[];
}

export function TaskOverviewModal({ isOpen, onClose, tasks, users }: TaskOverviewModalProps) {
  if (!isOpen) return null;

  const getEmployeeByTask = (task: Task) => {
    return users.find(user => user.id === task.assignedTo);
  };

  const groupedTasks = {
    pending: tasks.filter(t => t.status === 'pending'),
    'in-progress': tasks.filter(t => t.status === 'in-progress'),
    completed: tasks.filter(t => t.status === 'completed'),
    overdue: tasks.filter(t => t.status !== 'completed' && new Date(t.deadline) < new Date())
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Task Overview & Employee Assignments</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto h-full">
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <div className="text-2xl font-bold text-yellow-600">{groupedTasks.pending.length}</div>
                </div>
                <div className="text-sm text-yellow-700 font-medium">Pending Tasks</div>
              </CardContent>
            </Card>
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Play className="h-5 w-5 text-blue-600" />
                  <div className="text-2xl font-bold text-blue-600">{groupedTasks['in-progress'].length}</div>
                </div>
                <div className="text-sm text-blue-700 font-medium">In Progress</div>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div className="text-2xl font-bold text-green-600">{groupedTasks.completed.length}</div>
                </div>
                <div className="text-sm text-green-700 font-medium">Completed</div>
              </CardContent>
            </Card>
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div className="text-2xl font-bold text-red-600">{groupedTasks.overdue.length}</div>
                </div>
                <div className="text-sm text-red-700 font-medium">Overdue</div>
              </CardContent>
            </Card>
          </div>

          {/* Employee Task Distribution */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Employee Task Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.filter(u => u.role !== 'admin').map(user => {
                  const userTasks = tasks.filter(t => t.assignedTo === user.id);
                  const activeTasks = userTasks.filter(t => t.status !== 'completed');
                  
                  return (
                    <div key={user.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <div>
                            <h3 className="font-medium">{user.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {user.role} • {user.workload}h workload • {user.efficiency}% efficiency
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{activeTasks.length} active tasks</div>
                          <div className="text-xs text-muted-foreground">{userTasks.length} total</div>
                        </div>
                      </div>
                      
                      {activeTasks.length > 0 ? (
                        <div className="space-y-2">
                          {activeTasks.map(task => {
                            const isOverdue = task.status !== 'completed' && new Date(task.deadline) < new Date();
                            const statusIcon = {
                              'pending': <Clock className="h-3 w-3 text-yellow-500" />,
                              'in-progress': <Play className="h-3 w-3 text-blue-500" />,
                              'completed': <CheckCircle2 className="h-3 w-3 text-green-500" />,
                              'overdue': <AlertCircle className="h-3 w-3 text-red-500" />
                            };
                            
                            return (
                              <div key={task.id} className={`p-3 rounded-lg border transition-all ${
                                task.status === 'in-progress' ? 'bg-blue-50 border-blue-200' :
                                isOverdue ? 'bg-red-50 border-red-200' :
                                'bg-gray-50 border-gray-200'
                              }`}>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    {statusIcon[isOverdue ? 'overdue' : task.status]}
                                    <span className="font-medium text-sm">{task.title}</span>
                                    <span className={`px-2 py-1 rounded-full text-xs ${getTaskPriorityColor(task.priority)}`}>
                                      {task.priority}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                      isOverdue ? 'bg-red-100 text-red-800' :
                                      'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {isOverdue ? 'OVERDUE' : task.status.replace('-', ' ').toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {task.estimatedHours}h
                                    </span>
                                    <span className={`flex items-center gap-1 ${
                                      isOverdue ? 'text-red-600 font-medium' : ''
                                    }`}>
                                      <Calendar className="h-3 w-3" />
                                      {formatDate(new Date(task.deadline))}
                                    </span>
                                    {task.tags.length > 0 && (
                                      <span className="flex items-center gap-1">
                                        <Tag className="h-3 w-3" />
                                        {task.tags.join(', ')}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          No active tasks assigned
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* All Tasks by Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(groupedTasks).map(([status, statusTasks]) => (
              <Card key={status}>
                <CardHeader>
                  <CardTitle className="capitalize">{status.replace('-', ' ')} Tasks ({statusTasks.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {statusTasks.length > 0 ? (
                      statusTasks.map(task => {
                        const assignee = getEmployeeByTask(task);
                        const isOverdue = task.status !== 'completed' && new Date(task.deadline) < new Date();
                        const statusIcon = {
                          'pending': <Clock className="h-4 w-4 text-yellow-500" />,
                          'in-progress': <Play className="h-4 w-4 text-blue-500" />,
                          'completed': <CheckCircle2 className="h-4 w-4 text-green-500" />,
                          'overdue': <AlertCircle className="h-4 w-4 text-red-500" />
                        };
                        
                        return (
                          <div key={task.id} className={`border rounded-lg p-3 transition-all ${
                            task.status === 'completed' ? 'bg-green-50 border-green-200' :
                            task.status === 'in-progress' ? 'bg-blue-50 border-blue-200' :
                            isOverdue ? 'bg-red-50 border-red-200' :
                            'bg-white'
                          }`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  {statusIcon[isOverdue && task.status !== 'completed' ? 'overdue' : task.status]}
                                  <h4 className={`font-medium ${
                                    task.status === 'completed' ? 'line-through text-gray-500' : ''
                                  }`}>{task.title}</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  <span className={`px-2 py-1 rounded-full text-xs ${getTaskPriorityColor(task.priority)}`}>
                                    {task.priority}
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                    isOverdue ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {isOverdue && task.status !== 'completed' ? 'OVERDUE' : task.status.replace('-', ' ').toUpperCase()}
                                  </span>
                                  {task.tags.map(tag => (
                                    <span key={tag} className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-3 pt-3 border-t">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {assignee ? assignee.name : 'Unassigned'}
                                </span>
                                {task.status === 'completed' && (
                                  <span className="text-xs text-green-600 font-medium">• Completed</span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{task.estimatedHours}h</span>
                                <span className={isOverdue && task.status !== 'completed' ? 'text-red-600 font-medium' : ''}>
                                  {formatDate(new Date(task.deadline))}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No {status} tasks
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
