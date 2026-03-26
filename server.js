import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json({ limit: '10mb' }));
app.use(cors({ 
  origin: ["http://localhost:8080"], 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Data
let employees = [
  { id: 'admin-1', name: "Admin User", email: "admin@example.com", password: "admin123", role: "admin", phone: "+1 (555) 000-0000", location: "HQ", tasksCompleted: 0, efficiency: 100, skills: ['management', 'analytics'], workload: 0, isOnline: true }
];
let nextEmployeeId = 100;

let tasks = [];
let nextTaskId = 1;

// WebSocket broadcast function
function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(data));
    }
  });
}

// API Routes
app.get("/api/employees", (req, res) => {
  res.json(employees);
});

app.post("/api/employees", (req, res) => {
  try {
    const body = req.body || {};
    if (!body.name || !body.email) {
      return res.status(400).json({ error: "name and email required" });
    }

    const newEmp = {
      id: nextEmployeeId++,
      name: String(body.name).substring(0, 100),
      email: String(body.email).substring(0, 100),
      password: String(body.password || 'temp123'),
      role: body.role ?? "employee",
      phone: body.phone ?? "",
      location: body.location ?? "",
      skills: body.skills || [],
      workload: Number(body.workload ?? 0),
      tasksCompleted: Number(body.tasksCompleted ?? 0),
      efficiency: Number(body.efficiency ?? 85),
      isOnline: Boolean(body.isOnline ?? true)
    };

    employees.push(newEmp);
    broadcast({ type: 'EMPLOYEE_ADDED', employee: newEmp });
    
    res.status(201).json(newEmp);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get("/api/tasks", (req, res) => {
  res.json(tasks);
});

app.post("/api/tasks", (req, res) => {
  try {
    const body = req.body || {};
    if (!body.title) {
      return res.status(400).json({ error: "title required" });
    }

    const newTask = {
      id: nextTaskId++,
      title: String(body.title).substring(0, 200),
      description: String(body.description || '').substring(0, 1000),
      priority: body.priority || 'medium',
      status: body.status || 'pending',
      assignedTo: body.assignedTo,
      createdBy: body.createdBy,
      estimatedHours: Number(body.estimatedHours || 1),
      deadline: body.deadline,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: Array.isArray(body.tags) ? body.tags : []
    };

    tasks.push(newTask);
    
    // Update assignee workload if task is assigned
    if (newTask.assignedTo) {
      const empIndex = employees.findIndex(e => e.id.toString() === newTask.assignedTo.toString());
      if (empIndex !== -1) {
        employees[empIndex].workload = (employees[empIndex].workload || 0) + newTask.estimatedHours;
        console.log(`📼 Updated workload for ${employees[empIndex].name}: ${employees[empIndex].workload}h`);
      }
    }
    
    broadcast({ type: 'TASK_CREATED', task: newTask });
    console.log('📡 Broadcasting task creation:', newTask.title);
    
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put("/api/tasks/:id", (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    tasks[taskIndex] = { ...tasks[taskIndex], ...req.body, updatedAt: new Date().toISOString() };
    broadcast({ type: 'TASK_UPDATED', task: tasks[taskIndex] });
    
    res.json(tasks[taskIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update employee
app.put("/api/employees/:id", (req, res) => {
  try {
    const empId = req.params.id;
    const empIndex = employees.findIndex(e => e.id.toString() === empId);
    
    if (empIndex === -1) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    employees[empIndex] = { ...employees[empIndex], ...req.body };
    broadcast({ type: 'EMPLOYEE_UPDATED', employee: employees[empIndex] });
    
    res.json(employees[empIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Authentication
app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    const user = employees.find(e => e.email === email && e.role === role);
    if (user && user.password === password) {
      res.json({ success: true, user: { ...user, password: undefined } });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password
app.post("/api/auth/change-password", (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    console.log('Password change request:', { userId, currentPassword, newPassword });
    
    const empIndex = employees.findIndex(e => e.id.toString() === userId.toString());
    console.log('Employee index found:', empIndex);
    
    if (empIndex === -1) {
      console.log('User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Current stored password:', employees[empIndex].password);
    console.log('Provided current password:', currentPassword);
    
    if (employees[empIndex].password !== currentPassword) {
      console.log('Password mismatch');
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    employees[empIndex].password = newPassword;
    console.log('Password updated to:', newPassword);
    console.log('Updated employee:', employees[empIndex]);
    
    broadcast({ type: 'PASSWORD_CHANGED', userId });
    
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// WebSocket handling
wss.on('connection', (ws) => {
  console.log('Client connected');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('📨 Received WebSocket message:', data.type);
      
      // Handle task assignment messages
      if (data.type === 'TASK_ASSIGNED') {
        const taskIndex = tasks.findIndex(t => t.id.toString() === data.taskId.toString());
        if (taskIndex !== -1) {
          tasks[taskIndex].assignedTo = data.userId;
          tasks[taskIndex].updatedAt = new Date().toISOString();
          console.log(`✅ Task "${tasks[taskIndex].title}" assigned to user ${data.userId}`);
          
          // Update user workload
          const empIndex = employees.findIndex(e => e.id.toString() === data.userId.toString());
          if (empIndex !== -1) {
            employees[empIndex].workload = (employees[empIndex].workload || 0) + (tasks[taskIndex].estimatedHours || 4);
            console.log(`💼 Updated ${employees[empIndex].name} workload: ${employees[empIndex].workload}h`);
          }
        }
      }
      
      broadcast(data);
    } catch (error) {
      console.error('Invalid WebSocket message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

app.get("/", (req, res) => res.send("AI Workload Manager Backend Running"));

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`HTTP Server running on http://localhost:${PORT}`);
  console.log(`WebSocket Server running on ws://localhost:${PORT}`);
});