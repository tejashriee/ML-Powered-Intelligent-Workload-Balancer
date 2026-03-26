import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Play, 
  AlertCircle,
  Users,
  Calendar,
  BarChart3
} from 'lucide-react';
import { Task, User } from '@/types';
import { TaskCard } from './TaskCard';

interface TaskManagementProps {
  tasks: Task[];
  users: User[];
  currentUser: User;
  onCreateTask?: (taskData: Partial<Task>) => void;
  onUpdateTask?: (taskId: string, status: string) => void;
  onDeleteTask?: (taskId: string) => void;
}

export function TaskManagement({ 
  tasks, 
  users, 
  currentUser, 
  onCreateTask, 
  onUpdateTask, 
  onDeleteTask 
}: TaskManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filter tasks based on current user role and filters
  const filteredTasks = tasks.filter(task => {
    // Role-based filtering
    if (currentUser.role === 'employee' && task.assignedTo !== currentUser.id) {
      return false;
    }

    // Search filter
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !task.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'overdue') {
        const isOverdue = task.status !== 'completed' && new Date(task.deadline) < new Date();
        if (!isOverdue) return false;
      } else if (task.status !== statusFilter) {
        return false;
      }
    }

    // Priority filter
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
      return false;
    }

    // Assignee filter
    if (assigneeFilter !== 'all' && task.assignedTo !== assigneeFilter) {
      return false;
    }

    return true;
  });

  // Task statistics
  const stats = {
    total: filteredTasks.length,
    pending: filteredTasks.filter(t => t.status === 'pending').length,
    inProgress: filteredTasks.filter(t => t.status === 'in-progress').length,
    completed: filteredTasks.filter(t => t.status === 'completed').length,
    overdue: filteredTasks.filter(t => t.status !== 'completed' && new Date(t.deadline) < new Date()).length
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    if (onCreateTask) {
      onCreateTask({
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        priority: formData.get('priority') as any,
        assignedTo: formData.get('assignedTo') as string || undefined,
        estimatedHours: Number(formData.get('estimatedHours')),
        deadline: new Date(formData.get('deadline') as string),
        tags: (formData.get('tags') as string).split(',').map(t => t.trim()).filter(t => t),
        status: 'pending'
      });
    }
    
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Task Management</h1>
          <p className="text-muted-foreground">
            {currentUser.role === 'employee' ? 'Manage your assigned tasks' : 'Manage all team tasks'}
          </p>
        </div>
        {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
          >
            <Plus className="h-4 w-4" />
            Create Task
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-4 w-4 text-gray-600" />
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </div>
            <div className="text-sm text-yellow-700">Pending</div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Play className="h-4 w-4 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            </div>
            <div className="text-sm text-blue-700">In Progress</div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </div>
            <div className="text-sm text-green-700">Completed</div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            </div>
            <div className="text-sm text-red-700">Overdue</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
            <select 
              value={priorityFilter} 
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="p-2 border rounded-md"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            {currentUser.role !== 'employee' && (
              <select 
                value={assigneeFilter} 
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="p-2 border rounded-md"
              >
                <option value="all">All Assignees</option>
                <option value="">Unassigned</option>
                {users.filter(u => u.role !== 'admin').map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            )}
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPriorityFilter('all');
                setAssigneeFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Tasks ({filteredTasks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No tasks found matching your criteria</p>
                <p className="text-sm">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              filteredTasks.map(task => {
                const assignee = users.find(u => u.id === task.assignedTo);
                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    assignee={assignee}
                    currentUser={currentUser}
                    onUpdateTask={onUpdateTask}
                    onDeleteTask={onDeleteTask}
                    showActions={true}
                  />
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create New Task</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <Input name="title" placeholder="Task Title" required />
                <textarea 
                  name="description" 
                  placeholder="Task Description" 
                  className="w-full p-2 border rounded-md" 
                  rows={3} 
                  required
                />
                <select name="priority" className="w-full p-2 border rounded-md" required>
                  <option value="">Select Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                <select name="assignedTo" className="w-full p-2 border rounded-md">
                  <option value="">Assign to...</option>
                  {users.filter(u => u.role !== 'admin').map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role}) - {user.workload}h workload
                    </option>
                  ))}
                </select>
                <Input 
                  name="estimatedHours" 
                  type="number" 
                  placeholder="Estimated Hours" 
                  min="1" 
                  required 
                />
                <Input name="deadline" type="date" required />
                <Input name="tags" placeholder="Tags/Skills (comma separated)" />
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                  >
                    Create Task
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateModal(false)}
                  >
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
