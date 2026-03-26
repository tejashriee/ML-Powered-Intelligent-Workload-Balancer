// Direct connection to backend on port 4000
const API_BASE_URL = 'http://localhost:4000/api';

export const api = {
  // Auth endpoints
  login: async (email: string, password: string, role: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role })
    });
    return response.json();
  },

  changePassword: async (userId: string, currentPassword: string, newPassword: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, currentPassword, newPassword })
    });
    return response.json();
  },

  // Employee endpoints
  getEmployees: async () => {
    const response = await fetch(`${API_BASE_URL}/employees`);
    return response.json();
  },

  createEmployee: async (userData: any) => {
    const response = await fetch(`${API_BASE_URL}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  },

  updateEmployee: async (id: string, userData: any) => {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  },

  // Task endpoints
  getTasks: async () => {
    const response = await fetch(`${API_BASE_URL}/tasks`);
    return response.json();
  },

  getWorkload: async () => {
    const response = await fetch(`${API_BASE_URL}/workload`);
    return response.json();
  },

  createTask: async (taskData: any) => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    return response.json();
  },

  updateTask: async (id: string, taskData: any) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    return response.json();
  },

  deleteTask: async (id: string, userRole: string) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: {
        'userrole': userRole
      }
    });
    return response.json();
  },

  assignTask: async (taskId: string, userId: string) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignedTo: parseInt(userId) })
    });
    return response.json();
  },

  // Enhanced analytics endpoints
  getOverloadAlerts: async () => {
    const response = await fetch(`${API_BASE_URL}/overload-alerts`);
    return response.json();
  },

  getWorkloadHistory: async (employeeId?: string, days?: number) => {
    const params = new URLSearchParams();
    if (employeeId) params.append('employeeId', employeeId);
    if (days) params.append('days', days.toString());
    
    const response = await fetch(`${API_BASE_URL}/workload-history?${params}`);
    return response.json();
  },

  convertTimezone: async (date: string, fromTimezone: string, toTimezone: string) => {
    const response = await fetch(`${API_BASE_URL}/convert-timezone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, fromTimezone, toTimezone })
    });
    return response.json();
  },

  getSmartReallocation: async (overloadedEmployeeId: string) => {
    const response = await fetch(`${API_BASE_URL}/smart-reallocate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ overloadedEmployeeId })
    });
    return response.json();
  },

  executeReallocation: async (taskId: string, fromEmployeeId: string, toEmployeeId: string) => {
    const response = await fetch(`${API_BASE_URL}/execute-reallocation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, fromEmployeeId, toEmployeeId })
    });
    return response.json();
  },

  getPerformanceData: async () => {
    const response = await fetch(`${API_BASE_URL}/performance`);
    return response.json();
  }
};
