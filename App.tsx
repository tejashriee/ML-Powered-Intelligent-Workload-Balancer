import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LoginPage } from './components/auth/LoginPage';
import { LandingPage } from './components/LandingPage';
import { ProfileModal } from './components/ProfileModal';
import { Navigation } from './components/Navigation';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { ManagerDashboard } from './components/dashboard/ManagerDashboard';
import { EmployeeDashboard } from './components/dashboard/EmployeeDashboard';
import { PerformanceDashboard } from './components/dashboard/PerformanceDashboard';
import { HomePage } from './components/HomePage';
import { TaskManagement } from './components/TaskManagement';
import { User, Task, Analytics } from './types';
import { useWebSocket } from './hooks/useWebSocket';
import { api } from './lib/api';


function AppContent() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [currentUser, setCurrentUser] = useState<User>({
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    skills: ['management', 'analytics'],
    workload: 0,
    efficiency: 100,
    location: 'HQ',
    isOnline: true
  });

  const [users, setUsers] = useState<User[]>([]);

  const [tasks, setTasks] = useState<Task[]>([]);

  const [sentimentAlerts, setSentimentAlerts] = useState<any[]>([]);

  const [analytics, setAnalytics] = useState<Analytics>({
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    averageCompletionTime: 0,
    teamEfficiency: 100,
    workloadDistribution: [],
    productivityTrends: []
  });

  // Load initial data
  React.useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [employeesRes, tasksRes] = await Promise.all([
          api.getEmployees(),
          api.getTasks()
        ]);
        
        setUsers(employeesRes.map((emp: any) => ({
          id: emp.id.toString(),
          name: emp.name,
          email: emp.email,
          role: emp.role,
          skills: emp.skills || [],
          workload: emp.workload || 0,
          efficiency: emp.efficiency || 0,
          location: emp.location || '',
          isOnline: emp.isOnline || true,
          password: emp.password
        })));
        
        setTasks(tasksRes.map((task: any) => ({
          id: task.id.toString(),
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          assignedTo: task.assignedTo?.toString(),
          createdBy: task.createdBy?.toString(),
          estimatedHours: task.estimatedHours,
          deadline: new Date(task.deadline),
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
          tags: task.tags || []
        })));
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };
    
    loadInitialData();
  }, []);

  // Update analytics when tasks change
  React.useEffect(() => {
    setAnalytics(prev => ({
      ...prev,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      overdueTasks: tasks.filter(t => t.status !== 'completed' && new Date(t.deadline) < new Date()).length,
      workloadDistribution: users.map(u => ({ userId: u.id, workload: u.workload }))
    }));
  }, [tasks, users]);

  const { lastMessage, sendMessage } = useWebSocket();



  useEffect(() => {
    if (lastMessage) {
      console.log('📡 WebSocket message received:', lastMessage);
      
      switch (lastMessage.type) {

          
        case 'TASK_CREATED':
          console.log('📝 New task created');
          setTasks(prev => {
            // Prevent duplicates
            if (prev.find(t => t.id === lastMessage.task.id.toString())) {
              return prev;
            }
            const newTask = {
              ...lastMessage.task,
              id: lastMessage.task.id.toString(),
              assignedTo: lastMessage.task.assignedTo?.toString(),
              createdBy: lastMessage.task.createdBy?.toString(),
              deadline: new Date(lastMessage.task.deadline),
              createdAt: new Date(lastMessage.task.createdAt),
              updatedAt: new Date(lastMessage.task.updatedAt),
              actualEstimatedHours: lastMessage.task.actualEstimatedHours || lastMessage.task.estimatedHours,
              complexity: lastMessage.task.complexity || 1.0
            };
            return [...prev, newTask];
          });
          
          // Refresh workload data if task is assigned
          if (lastMessage.task.assignedTo) {
            api.getEmployees().then(employees => {
              setUsers(prev => prev.map(user => {
                const updatedEmp = employees.find((e: any) => e.id.toString() === user.id);
                return updatedEmp ? { ...user, workload: updatedEmp.workload || 0 } : user;
              }));
            });
          }
          break;
          
        case 'TASK_UPDATED':
          console.log('✏️ Task updated');
          setTasks(prev => prev.map(task => 
            task.id === lastMessage.task.id.toString() ? {
              ...lastMessage.task,
              id: lastMessage.task.id.toString(),
              assignedTo: lastMessage.task.assignedTo?.toString(),
              createdBy: lastMessage.task.createdBy?.toString(),
              deadline: new Date(lastMessage.task.deadline),
              createdAt: new Date(lastMessage.task.createdAt),
              updatedAt: new Date(lastMessage.task.updatedAt),
              actualEstimatedHours: lastMessage.task.actualEstimatedHours || lastMessage.task.estimatedHours,
              complexity: lastMessage.task.complexity || 1.0
            } : task
          ));
          
          // Refresh workload data
          api.getEmployees().then(employees => {
            setUsers(prev => prev.map(user => {
              const updatedEmp = employees.find((e: any) => e.id.toString() === user.id);
              return updatedEmp ? { ...user, workload: updatedEmp.workload || 0, tasksCompleted: updatedEmp.tasksCompleted || 0 } : user;
            }));
          });
          break;
          
        case 'TASK_DELETED':
          console.log('🗑️ Task deleted');
          setTasks(prev => prev.filter(task => task.id !== lastMessage.taskId.toString()));
          break;
          
        case 'EMPLOYEE_ADDED':
          console.log('👤 New employee added');
          setUsers(prev => {
            // Prevent duplicates
            if (prev.find(u => u.id === lastMessage.employee.id.toString())) {
              return prev;
            }
            const newEmployee = {
              id: lastMessage.employee.id.toString(),
              name: lastMessage.employee.name,
              email: lastMessage.employee.email,
              role: lastMessage.employee.role,
              skills: lastMessage.employee.skills || [],
              workload: lastMessage.employee.workload || 0,
              efficiency: lastMessage.employee.efficiency || 0,
              location: lastMessage.employee.location || '',
              isOnline: lastMessage.employee.isOnline || true,
              password: lastMessage.employee.password,
              timezone: lastMessage.employee.timezone || 'America/New_York',
              avgTaskTime: lastMessage.employee.avgTaskTime || 4,
              roleExpertise: lastMessage.employee.roleExpertise || 0.8,
              overloadThreshold: lastMessage.employee.overloadThreshold || 32,
              tasksCompleted: lastMessage.employee.tasksCompleted || 0
            };
            return [...prev, newEmployee];
          });
          break;
          
        case 'EMPLOYEE_UPDATED':
          console.log('👤 Employee updated');
          setUsers(prev => prev.map(user => 
            user.id === lastMessage.employee.id.toString() ? {
              ...user,
              ...lastMessage.employee,
              id: lastMessage.employee.id.toString(),
              skills: lastMessage.employee.skills || user.skills,
              workload: lastMessage.employee.workload || 0,
              timezone: lastMessage.employee.timezone || user.timezone,
              avgTaskTime: lastMessage.employee.avgTaskTime || user.avgTaskTime,
              roleExpertise: lastMessage.employee.roleExpertise || user.roleExpertise,
              overloadThreshold: lastMessage.employee.overloadThreshold || user.overloadThreshold,
              tasksCompleted: lastMessage.employee.tasksCompleted || user.tasksCompleted
            } : user
          ));
          break;
          
        case 'TASK_REALLOCATED':
          console.log('🔄 Task reallocated');
          setTasks(prev => prev.map(task => 
            task.id === lastMessage.task?.id?.toString() 
              ? {
                  ...lastMessage.task,
                  id: lastMessage.task.id.toString(),
                  assignedTo: lastMessage.task.assignedTo?.toString(),
                  createdBy: lastMessage.task.createdBy?.toString(),
                  deadline: new Date(lastMessage.task.deadline),
                  createdAt: new Date(lastMessage.task.createdAt),
                  updatedAt: new Date(lastMessage.task.updatedAt)
                }
              : task
          ));
          
          // Refresh user data to get updated workloads
          api.getEmployees().then(employees => {
            setUsers(prev => prev.map(user => {
              const updatedEmp = employees.find((e: any) => e.id.toString() === user.id);
              return updatedEmp ? { 
                ...user, 
                workload: updatedEmp.workload || 0,
                avgTaskTime: updatedEmp.avgTaskTime || user.avgTaskTime,
                roleExpertise: updatedEmp.roleExpertise || user.roleExpertise,
                overloadThreshold: updatedEmp.overloadThreshold || user.overloadThreshold
              } : user;
            }));
          });
          break;
          
        default:
          console.log('🔄 Unknown message type:', lastMessage.type);
      }
    }
  }, [lastMessage]);

  const handleCreateTask = async (taskData: Partial<Task>) => {
    // Only send to backend - let WebSocket handle state updates
    try {
      const newTask = {
        title: taskData.title || '',
        description: taskData.description || '',
        priority: taskData.priority || 'medium',
        status: 'pending',
        createdBy: taskData.createdBy || currentUser.id,
        estimatedHours: taskData.estimatedHours || 1,
        deadline: taskData.deadline || new Date().toISOString(),
        tags: taskData.tags || [],
        assignedTo: taskData.assignedTo
      };

      await api.createTask(newTask);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleUpdateTask = async (taskId: string, status: string) => {
    try {
      await api.updateTask(taskId, { status });
      // WebSocket will handle the state update
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleRequestReallocation = async (taskId: string, reason: string, sentiment: any) => {
    console.log('Task reallocation requested:', { taskId, reason, sentiment });
    alert('Task reallocation feature has been disabled.');
  };

  const handleLogin = async (email: string, password: string, role: 'admin' | 'employee') => {
    try {
      console.log('Attempting login:', { email, role });
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Login failed:', errorData);
        alert(errorData.error || 'Invalid credentials. Please try again.');
        return false;
      }
      
      const data = await response.json();
      console.log('Login response:', data);
      
      if (data.success && data.user) {
        const userWithDefaults = {
          id: data.user.id || 'admin-1',
          name: data.user.name || 'User',
          email: data.user.email || email,
          role: data.user.role || role,
          skills: Array.isArray(data.user.skills) ? data.user.skills : (typeof data.user.skills === 'string' ? JSON.parse(data.user.skills) : []),
          workload: data.user.workload || 0,
          efficiency: data.user.efficiency || 85,
          location: data.user.location || 'Remote',
          isOnline: true,
          timezone: data.user.timezone || 'UTC',
          avgTaskTime: data.user.avg_task_time || data.user.avgTaskTime || 4,
          roleExpertise: data.user.role_expertise || data.user.roleExpertise || 0.8,
          overloadThreshold: data.user.overload_threshold || data.user.overloadThreshold || 40,
          tasksCompleted: data.user.tasks_completed || data.user.tasksCompleted || 0,
          workingHoursStart: data.user.working_hours_start || data.user.workingHoursStart || '09:00',
          workingHoursEnd: data.user.working_hours_end || data.user.workingHoursEnd || '17:00',
          workingDays: Array.isArray(data.user.working_days) ? data.user.working_days : (Array.isArray(data.user.workingDays) ? data.user.workingDays : (typeof data.user.working_days === 'string' ? JSON.parse(data.user.working_days) : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']))
        };
        console.log('Setting user:', userWithDefaults);
        setCurrentUser(userWithDefaults);
        setIsAuthenticated(true);
        console.log('Login successful, authentication set to true');
        return true;
      } else {
        console.error('Login failed:', data);
        alert(data.error || 'Invalid credentials. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Server is not responding. Please ensure the backend is running on port 4000.');
      return false;
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(users[0]);
  };

  const handleCreateEmployee = async (userData: Partial<User>) => {
    // Only send to backend - let WebSocket handle state updates
    try {
      const newUser = {
        name: userData.name || '',
        email: userData.email || '',
        password: userData.password || '',
        role: userData.role || 'employee',
        skills: userData.skills || [],
        workload: 0,
        efficiency: 85,
        location: userData.location || '',
        isOnline: true,
        timezone: userData.timezone || 'America/New_York',
        avgTaskTime: 4,
        roleExpertise: 0.8,
        overloadThreshold: userData.role === 'manager' ? 35 : 32,
        tasksCompleted: 0
      };

      await api.createEmployee(newUser);
    } catch (error) {
      console.error('Failed to create employee:', error);
    }
  };

  const handleUpdateProfile = async (userData: Partial<User>) => {
    try {
      await api.updateEmployee(currentUser.id, userData);
      // WebSocket will handle the state update
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    console.log('Changing password for user:', currentUser.id);
    console.log('Current password:', currentPassword);
    console.log('New password:', newPassword);
    
    try {
      const result = await api.changePassword(currentUser.id, currentPassword, newPassword);
      console.log('Password change result:', result);
      
      if (result.success) {
        alert('Password changed successfully!');
      } else {
        alert(result.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      alert('Network error: Failed to change password');
    }
  };

  const handleSendSentimentAlert = (message: string, sentiment: any) => {
    const newAlert = {
      id: Date.now().toString(),
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      message,
      sentiment,
      timestamp: new Date(),
      status: 'pending'
    };
    
    setSentimentAlerts(prev => [...prev, newAlert]);
  };



  const handleResolveAlert = (alertId: string) => {
    setSentimentAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: 'resolved' } : alert
    ));
  };

  const handleGetStarted = () => {
    navigate('/login');
  };

  const handleLoginSuccess = async (email: string, password: string, role: 'admin' | 'employee') => {
    console.log('handleLoginSuccess called with:', { email, role });
    const success = await handleLogin(email, password, role);
    console.log('Login result:', success);
    if (success) {
      console.log('Navigating to /home');
      setTimeout(() => {
        navigate('/home');
      }, 100);
    }
  };

  const handleLogoutClick = () => {
    handleLogout();
    navigate('/');
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage onGetStarted={handleGetStarted} />} />
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/home" /> : <LoginPage onLogin={handleLoginSuccess} />
        } />
        
        {/* Protected Routes */}
        {isAuthenticated ? (
          <>
            <Route path="/home" element={
              <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <Navigation 
                  currentUser={currentUser}
                  onShowProfile={() => setShowProfile(true)}
                  onLogout={handleLogoutClick}
                />
                <main className="p-6">
                  <HomePage 
                    currentUser={currentUser}
                    users={users}
                    tasks={tasks}
                    analytics={analytics}
                    onRouteChange={(route) => navigate(`/${route}`)}
                  />
                </main>
              </div>
            } />
            
            <Route path="/dashboard" element={
              <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <Navigation 
                  currentUser={currentUser}
                  onShowProfile={() => setShowProfile(true)}
                  onLogout={handleLogoutClick}
                />
                <main className="p-6">
                  {currentUser.role === 'admin' && (
                    <AdminDashboard 
                      users={users} 
                      tasks={tasks} 
                      analytics={analytics} 
                      onCreateEmployee={handleCreateEmployee}
                      onCreateTask={handleCreateTask}
                    />
                  )}
                  {currentUser.role === 'manager' && (
                    <ManagerDashboard 
                      user={currentUser} 
                      users={users} 
                      tasks={tasks} 
                      onCreateTask={handleCreateTask}
                    />
                  )}
                  {currentUser.role === 'employee' && (
                    <EmployeeDashboard 
                      user={currentUser} 
                      tasks={tasks} 
                      users={users}
                      onUpdateTask={handleUpdateTask}
                      onRequestReallocation={handleRequestReallocation}
                      onChangePassword={handleChangePassword}
                    />
                  )}
                </main>
              </div>
            } />
            
            <Route path="/tasks" element={
              <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <Navigation 
                  currentUser={currentUser}
                  onShowProfile={() => setShowProfile(true)}
                  onLogout={handleLogoutClick}
                />
                <main className="p-6">
                  <TaskManagement
                    tasks={tasks}
                    users={users}
                    currentUser={currentUser}
                    onCreateTask={handleCreateTask}
                    onUpdateTask={handleUpdateTask}
                    onDeleteTask={async (taskId: string) => {
                      try {
                        const result = await api.deleteTask(taskId, currentUser.role);
                        if (!result.success) {
                          alert(result.error || 'Failed to delete task');
                        }
                      } catch (error) {
                        console.error('Delete task error:', error);
                        alert('Network error: Failed to delete task. Please try again.');
                      }
                    }}
                  />
                </main>
              </div>
            } />
            
            <Route path="/employees" element={
              currentUser.role === 'admin' ? (
                <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                  <Navigation 
                    currentUser={currentUser}
                    onShowProfile={() => setShowProfile(true)}
                    onLogout={handleLogoutClick}
                  />
                  <main className="p-6">
                    <AdminDashboard 
                      users={users} 
                      tasks={tasks} 
                      analytics={analytics} 
                      onCreateEmployee={handleCreateEmployee}
                      onCreateTask={handleCreateTask}
                    />
                  </main>
                </div>
              ) : <Navigate to="/home" />
            } />
            
            <Route path="/performance" element={
              currentUser.role === 'admin' ? (
                <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                  <Navigation 
                    currentUser={currentUser}
                    onShowProfile={() => setShowProfile(true)}
                    onLogout={handleLogoutClick}
                  />
                  <main className="p-6">
                    <PerformanceDashboard users={users} tasks={tasks} />
                  </main>
                </div>
              ) : <Navigate to="/home" />
            } />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/" />} />
        )}
      </Routes>
      
      <ProfileModal 
        user={currentUser}
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        onUpdate={handleUpdateProfile}
      />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;