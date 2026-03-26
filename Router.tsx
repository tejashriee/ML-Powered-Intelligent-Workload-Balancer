import React from 'react';
import { AdminDashboard } from './dashboard/AdminDashboard';
import { ManagerDashboard } from './dashboard/ManagerDashboard';
import { EmployeeDashboard } from './dashboard/EmployeeDashboard';
import { PerformanceDashboard } from './dashboard/PerformanceDashboard';
import { HomePage } from './HomePage';
import { User, Task, Analytics } from '../types';

interface RouterProps {
  currentRoute: string;
  currentUser: User;
  users: User[];
  tasks: Task[];
  analytics: Analytics;
  onCreateEmployee: (userData: Partial<User>) => void;
  onCreateTask: (taskData: Partial<Task>) => void;
  onUpdateTask: (taskId: string, status: string) => void;
  onRequestReallocation: (taskId: string, reason: string, sentiment: any) => void;
  onChangePassword: (currentPassword: string, newPassword: string) => void;
  onRouteChange: (route: string) => void;
}

export function Router({
  currentRoute,
  currentUser,
  users,
  tasks,
  analytics,
  onCreateEmployee,
  onCreateTask,
  onUpdateTask,
  onRequestReallocation,
  onChangePassword,
  onRouteChange
}: RouterProps) {
  switch (currentRoute) {
    case 'home':
      return (
        <HomePage 
          currentUser={currentUser}
          users={users}
          tasks={tasks}
          analytics={analytics}
          onRouteChange={onRouteChange}
        />
      );

    case 'dashboard':
      if (currentUser.role === 'admin') {
        return (
          <AdminDashboard 
            users={users} 
            tasks={tasks} 
            analytics={analytics} 
            onCreateEmployee={onCreateEmployee}
            onCreateTask={onCreateTask}
          />
        );
      }
      if (currentUser.role === 'manager') {
        return (
          <ManagerDashboard 
            user={currentUser} 
            users={users} 
            tasks={tasks} 
            onCreateTask={onCreateTask}
          />
        );
      }
      return (
        <EmployeeDashboard 
          user={currentUser} 
          tasks={tasks} 
          users={users}
          onUpdateTask={onUpdateTask}
          onRequestReallocation={onRequestReallocation}
          onChangePassword={onChangePassword}
        />
      );

    case 'performance':
      if (currentUser.role === 'admin') {
        return <PerformanceDashboard users={users} tasks={tasks} />;
      }
      return <div className="p-6 text-center text-muted-foreground">Access denied. Admin only.</div>;

    case 'employees':
      if (currentUser.role === 'admin') {
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Employee Management</h2>
            <AdminDashboard 
              users={users} 
              tasks={tasks} 
              analytics={analytics} 
              onCreateEmployee={onCreateEmployee}
              onCreateTask={onCreateTask}
            />
          </div>
        );
      }
      return <div className="p-6 text-center text-muted-foreground">Access denied. Admin only.</div>;

    case 'tasks':
      if (currentUser.role === 'admin') {
        return (
          <AdminDashboard 
            users={users} 
            tasks={tasks} 
            analytics={analytics} 
            onCreateEmployee={onCreateEmployee}
            onCreateTask={onCreateTask}
          />
        );
      }
      if (currentUser.role === 'manager') {
        return (
          <ManagerDashboard 
            user={currentUser} 
            users={users} 
            tasks={tasks} 
            onCreateTask={onCreateTask}
          />
        );
      }
      return (
        <EmployeeDashboard 
          user={currentUser} 
          tasks={tasks} 
          users={users}
          onUpdateTask={onUpdateTask}
          onRequestReallocation={onRequestReallocation}
          onChangePassword={onChangePassword}
        />
      );

    default:
      return (
        <div className="p-6 text-center text-muted-foreground">
          Page not found
        </div>
      );
  }
}