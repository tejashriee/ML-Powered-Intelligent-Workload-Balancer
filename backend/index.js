import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cron from 'node-cron';
import db from './database/connection.js';
import { TimezoneAwareScheduler } from './algorithms/timezone-scheduler.js';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const JWT_SECRET = 'your-secret-key-change-in-production';
const scheduler = new TimezoneAwareScheduler(db);

app.use(express.json({ limit: '10mb' }));
app.use(cors({ 
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'userrole']
}));

// WebSocket handling
function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(data));
    }
  });
}

let clientCount = 0;

wss.on('connection', (ws) => {
  clientCount++;
  console.log(`🔌 Client connected (${clientCount} active)`);
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      broadcast(data);
    } catch (error) {
      console.error('Invalid WebSocket message:', error);
    }
  });

  ws.on('close', () => {
    clientCount--;
    console.log(`🔌 Client disconnected (${clientCount} active)`);
  });
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Users API
app.get("/api/users", async (req, res) => {
  try {
    const users = await db.all(`
      SELECT id, name, email, role, skills, workload, efficiency, location, 
             timezone, is_online, avg_task_time, role_expertise, overload_threshold, 
             tasks_completed, working_hours_start, working_hours_end, working_days
      FROM users
    `);
    
    const formattedUsers = users.map(user => ({
      ...user,
      skills: JSON.parse(user.skills || '[]'),
      working_days: JSON.parse(user.working_days || '[]')
    }));
    
    res.json(formattedUsers);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Employees endpoint (alias for users)
app.get("/api/employees", async (req, res) => {
  try {
    const users = await db.all(`
      SELECT id, name, email, role, skills, workload, efficiency, location, 
             timezone, is_online, avg_task_time, role_expertise, overload_threshold, 
             tasks_completed, working_hours_start, working_hours_end, working_days
      FROM users WHERE role != 'admin'
    `);
    
    const formattedUsers = users.map(user => ({
      ...user,
      skills: JSON.parse(user.skills || '[]'),
      working_days: JSON.parse(user.working_days || '[]')
    }));
    
    res.json(formattedUsers);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post("/api/employees", async (req, res) => {
  try {
    const { name, email, password, role, skills, location, timezone, working_hours_start, working_hours_end } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await db.run(`
      INSERT INTO users (name, email, password_hash, role, skills, location, timezone, working_hours_start, working_hours_end, is_online)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [
      name, email, hashedPassword, role || 'employee', 
      JSON.stringify(skills || []), location || '', timezone || 'UTC',
      working_hours_start || '09:00', working_hours_end || '17:00'
    ]);

    const newUser = await db.get('SELECT * FROM users WHERE id = ?', [result.id]);
    broadcast({ type: 'EMPLOYEE_ADDED', employee: newUser });
    
    res.status(201).json(newUser);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.put("/api/employees/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;
    
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const allowedFields = ['name', 'email', 'skills', 'location', 'timezone', 'working_hours_start', 'working_hours_end', 'working_days', 'efficiency'];
    const updateFields = Object.keys(updates).filter(key => allowedFields.includes(key));
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const setClause = updateFields.map(key => {
      if (key === 'skills' || key === 'working_days') {
        return `${key} = ?`;
      }
      return `${key} = ?`;
    }).join(', ');
    
    const values = updateFields.map(key => {
      if (key === 'skills' || key === 'working_days') {
        return JSON.stringify(updates[key]);
      }
      return updates[key];
    });
    values.push(userId);
    
    await db.run(`UPDATE users SET ${setClause} WHERE id = ?`, values);
    
    const updatedUser = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    broadcast({ type: 'EMPLOYEE_UPDATED', employee: updatedUser });
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const { name, email, password, role, skills, location, timezone, working_hours_start, working_hours_end } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await db.run(`
      INSERT INTO users (name, email, password_hash, role, skills, location, timezone, working_hours_start, working_hours_end, is_online)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [
      name, email, hashedPassword, role || 'employee', 
      JSON.stringify(skills || []), location || '', timezone || 'UTC',
      working_hours_start || '09:00', working_hours_end || '17:00'
    ]);

    const newUser = await db.get('SELECT * FROM users WHERE id = ?', [result.id]);
    broadcast({ type: 'USER_ADDED', user: newUser });
    
    res.status(201).json(newUser);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Tasks API with advanced features
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await db.all(`
      SELECT t.*, u.name as assigned_to_name, c.name as created_by_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN users c ON t.created_by = c.id
      ORDER BY t.created_at DESC
    `);
    
    const formattedTasks = tasks.map(task => ({
      ...task,
      tags: JSON.parse(task.tags || '[]'),
      dependencies: JSON.parse(task.dependencies || '[]'),
      deadline: new Date(task.deadline),
      created_at: new Date(task.created_at),
      updated_at: new Date(task.updated_at)
    }));
    
    res.json(formattedTasks);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post("/api/tasks", async (req, res) => {
  try {
    const { title, description, priority, estimated_hours, deadline, tags, created_by, project_id, complexity, assigned_to } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: "Title required" });
    }

    const result = await db.run(`
      INSERT INTO tasks (title, description, priority, estimated_hours, deadline, tags, created_by, project_id, complexity, assigned_to)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title, description || '', priority || 'medium', estimated_hours || 1,
      deadline, JSON.stringify(tags || []), created_by, project_id, complexity || 1, assigned_to
    ]);

    let newTask = await db.get('SELECT * FROM tasks WHERE id = ?', [result.id]);
    
    // Dynamic auto-allocation if no assignee specified and tags exist
    if (!assigned_to && tags && tags.length > 0) {
      console.log('🤖 Dynamic allocation triggered for task with skills:', tags);
      
      const taskForAllocation = {
        ...newTask,
        tags: JSON.parse(newTask.tags || '[]'),
        deadline: new Date(newTask.deadline)
      };
      
      const assignedUserId = await scheduler.allocateTaskWithTimezone(taskForAllocation);
      
      if (assignedUserId) {
        await db.run(`
          UPDATE tasks 
          SET assigned_to = ?, auto_assigned = 1, timezone_scheduled = (
            SELECT timezone FROM users WHERE id = ?
          )
          WHERE id = ?
        `, [assignedUserId, assignedUserId, result.id]);
        
        // Update user workload
        await db.run(
          'UPDATE users SET workload = workload + ? WHERE id = ?',
          [estimated_hours || 1, assignedUserId]
        );
        
        // Get updated task
        newTask = await db.get('SELECT * FROM tasks WHERE id = ?', [result.id]);
        
        // Send notification
        await db.run(`
          INSERT INTO notifications (type, title, message, user_id, related_task_id, priority)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          'auto_allocated',
          'Task Auto-Assigned',
          `You have been automatically assigned the task "${title}" based on your skills and availability.`,
          assignedUserId,
          result.id,
          priority === 'urgent' ? 'urgent' : 'normal'
        ]);
        
        console.log(`✅ Task "${title}" dynamically assigned to user ${assignedUserId}`);
      }
    } else if (assigned_to) {
      // Update workload for manually assigned tasks
      await db.run(
        'UPDATE users SET workload = workload + ? WHERE id = ?',
        [estimated_hours || 1, assigned_to]
      );
    }
    
    broadcast({ type: 'TASK_CREATED', task: newTask });
    
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Task creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put("/api/tasks/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const updates = req.body;
    
    // Get current task
    const currentTask = await db.get('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (!currentTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Handle workload changes
    if (updates.assigned_to !== undefined && updates.assigned_to !== currentTask.assigned_to) {
      // Remove workload from old assignee
      if (currentTask.assigned_to) {
        await db.run('UPDATE users SET workload = workload - ? WHERE id = ?', 
          [currentTask.estimated_hours, currentTask.assigned_to]);
      }
      
      // Add workload to new assignee
      if (updates.assigned_to) {
        await db.run('UPDATE users SET workload = workload + ? WHERE id = ?', 
          [currentTask.estimated_hours, updates.assigned_to]);
      }
    }

    // Handle task completion
    if (updates.status === 'completed' && currentTask.status !== 'completed') {
      updates.completed_at = new Date().toISOString();
      
      if (currentTask.assigned_to) {
        await db.run(`
          UPDATE users 
          SET workload = workload - ?, tasks_completed = tasks_completed + 1 
          WHERE id = ?
        `, [currentTask.estimated_hours, currentTask.assigned_to]);
      }
    }

    // Update task
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), taskId];
    
    await db.run(`UPDATE tasks SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
    
    const updatedTask = await db.get('SELECT * FROM tasks WHERE id = ?', [taskId]);
    broadcast({ type: 'TASK_UPDATED', task: updatedTask });
    
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Advanced auto-allocation endpoint
app.post("/api/tasks/auto-allocate", async (req, res) => {
  try {
    const { task_ids } = req.body;
    
    let tasksToAllocate;
    if (task_ids && task_ids.length > 0) {
      // Allocate specific tasks
      const placeholders = task_ids.map(() => '?').join(',');
      tasksToAllocate = await db.all(`
        SELECT * FROM tasks 
        WHERE id IN (${placeholders}) AND assigned_to IS NULL AND status = 'pending'
      `, task_ids);
    } else {
      // Allocate all pending unassigned tasks
      tasksToAllocate = await db.all(`
        SELECT * FROM tasks 
        WHERE assigned_to IS NULL AND status = 'pending'
      `);
    }

    if (tasksToAllocate.length === 0) {
      return res.json({ allocated: 0, failed: 0, message: 'No tasks to allocate' });
    }

    const results = await scheduler.batchAllocateWithTimezone(tasksToAllocate);
    
    // Update tasks in database
    for (const result of results) {
      if (result.success) {
        await db.run(`
          UPDATE tasks 
          SET assigned_to = ?, auto_assigned = 1, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `, [result.assignedTo, result.taskId]);
        
        // Broadcast update
        const updatedTask = await db.get('SELECT * FROM tasks WHERE id = ?', [result.taskId]);
        broadcast({ type: 'TASK_UPDATED', task: updatedTask });
      }
    }

    const allocated = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    res.json({ 
      allocated, 
      failed, 
      message: `Successfully allocated ${allocated} tasks, ${failed} failed`,
      details: results
    });
  } catch (error) {
    console.error('Auto-allocation error:', error);
    res.status(500).json({ error: 'Auto-allocation failed' });
  }
});

// Authentication endpoints
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    console.log(`Login attempt: ${email} as ${role}`);
    
    // Check for demo admin credentials first
    if (email === 'admin@example.com' && password === 'admin123') {
      const adminUser = {
        id: 'admin-1',
        name: 'System Administrator',
        email: 'admin@example.com',
        role: 'admin',
        skills: ['management', 'analytics'],
        workload: 0,
        efficiency: 100,
        location: 'System',
        timezone: 'UTC',
        working_hours_start: '09:00',
        working_hours_end: '17:00',
        working_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        isOnline: true
      };
      
      const token = jwt.sign({ userId: adminUser.id, role: adminUser.role }, JWT_SECRET, { expiresIn: '24h' });
      console.log('Admin login successful');
      
      return res.json({ 
        success: true, 
        user: adminUser, 
        token 
      });
    }
    
    // Try to find user in database
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    console.log('Database user found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('User not found in database');
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    console.log('Password valid:', validPassword);
    
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Update last active
    await db.run('UPDATE users SET last_active = CURRENT_TIMESTAMP, is_online = 1 WHERE id = ?', [user.id]);

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    
    const { password_hash, ...userWithoutPassword } = user;
    console.log('Login successful for:', user.email);
    
    res.json({ 
      success: true, 
      user: {
        ...userWithoutPassword,
        skills: JSON.parse(userWithoutPassword.skills || '[]'),
        workingDays: JSON.parse(userWithoutPassword.working_days || '[]')
      }, 
      token 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// Change password endpoint
app.post("/api/auth/change-password", async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    
    if (userId === 'admin-1') {
      return res.json({ success: false, error: 'Cannot change admin password' });
    }
    
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect' });
    }
    
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await db.run('UPDATE users SET password_hash = ? WHERE id = ?', [hashedNewPassword, userId]);
    
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, error: 'Failed to change password' });
  }
});

// Notifications API
app.get("/api/notifications/:userId", async (req, res) => {
  try {
    const notifications = await db.all(`
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 50
    `, [req.params.userId]);
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

app.put("/api/notifications/:id/read", async (req, res) => {
  try {
    await db.run('UPDATE notifications SET is_read = 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Task deletion endpoint
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    
    // Get task before deletion to handle workload
    const task = await db.get('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Remove workload from assigned user if task is not completed
    if (task.assigned_to && task.status !== 'completed') {
      await db.run(
        'UPDATE users SET workload = workload - ? WHERE id = ?',
        [task.estimated_hours, task.assigned_to]
      );
    }

    // Delete the task
    await db.run('DELETE FROM tasks WHERE id = ?', [taskId]);
    
    broadcast({ type: 'TASK_DELETED', taskId: taskId });
    
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Task deletion error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Analytics API
app.get("/api/analytics/dashboard", async (req, res) => {
  try {
    const totalTasks = await db.get('SELECT COUNT(*) as count FROM tasks');
    const completedTasks = await db.get('SELECT COUNT(*) as count FROM tasks WHERE status = "completed"');
    const overdueTasks = await db.get('SELECT COUNT(*) as count FROM tasks WHERE status != "completed" AND deadline < datetime("now")');
    const avgEfficiency = await db.get('SELECT AVG(efficiency) as avg FROM users WHERE role != "admin"');
    
    const workloadDistribution = await db.all(`
      SELECT id as userId, name, workload 
      FROM users 
      WHERE role != 'admin'
    `);

    res.json({
      totalTasks: totalTasks.count,
      completedTasks: completedTasks.count,
      overdueTasks: overdueTasks.count,
      teamEfficiency: avgEfficiency.avg || 0,
      workloadDistribution
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Performance endpoint
app.get("/api/performance", async (req, res) => {
  try {
    const users = await db.all(`
      SELECT id, name, efficiency, workload, tasks_completed 
      FROM users WHERE role != 'admin'
    `);
    
    const tasks = await db.all(`
      SELECT assigned_to, status, priority, estimated_hours, actual_hours
      FROM tasks WHERE assigned_to IS NOT NULL
    `);

    const performanceData = users.map(user => {
      const userTasks = tasks.filter(t => t.assigned_to === user.id);
      const completedTasks = userTasks.filter(t => t.status === 'completed');
      
      return {
        userId: user.id,
        name: user.name,
        efficiency: user.efficiency || 85,
        workload: user.workload || 0,
        tasksCompleted: completedTasks.length,
        totalTasks: userTasks.length,
        completionRate: userTasks.length > 0 ? (completedTasks.length / userTasks.length) * 100 : 0
      };
    });

    res.json(performanceData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch performance data' });
  }
});

// Scheduled tasks
cron.schedule('0 9 * * *', async () => {
  console.log('🕘 Running daily task allocation check...');
  
  try {
    const urgentTasks = await db.all(`
      SELECT * FROM tasks 
      WHERE assigned_to IS NULL 
      AND status = 'pending' 
      AND deadline < datetime('now', '+24 hours')
    `);

    if (urgentTasks.length > 0) {
      console.log(`Found ${urgentTasks.length} urgent unassigned tasks`);
      const results = await scheduler.batchAllocateWithTimezone(urgentTasks);
      
      for (const result of results) {
        if (result.success) {
          await db.run(`
            UPDATE tasks 
            SET assigned_to = ?, auto_assigned = 1 
            WHERE id = ?
          `, [result.assignedTo, result.taskId]);
          
          // Send notification
          await db.run(`
            INSERT INTO notifications (type, title, message, user_id, related_task_id, priority)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [
            'task_assigned',
            'Urgent Task Assigned',
            `You have been automatically assigned an urgent task due within 24 hours.`,
            result.assignedTo,
            result.taskId,
            'urgent'
          ]);
        }
      }
    }
  } catch (error) {
    console.error('Daily allocation check failed:', error);
  }
});

// Deadline warning notifications
cron.schedule('0 */6 * * *', async () => {
  console.log('⏰ Checking for approaching deadlines...');
  
  try {
    const approachingDeadlines = await db.all(`
      SELECT t.*, u.name as user_name 
      FROM tasks t
      JOIN users u ON t.assigned_to = u.id
      WHERE t.status != 'completed' 
      AND t.deadline BETWEEN datetime('now') AND datetime('now', '+24 hours')
    `);

    for (const task of approachingDeadlines) {
      await db.run(`
        INSERT INTO notifications (type, title, message, user_id, related_task_id, priority)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        'deadline_approaching',
        'Deadline Approaching',
        `Task "${task.title}" is due within 24 hours.`,
        task.assigned_to,
        task.id,
        'high'
      ]);
    }
  } catch (error) {
    console.error('Deadline check failed:', error);
  }
});

server.listen(4000, '0.0.0.0', () => {
  console.log('🚀 Advanced WorkHub Server running on port 4000');
  console.log('🔌 WebSocket server running on same port');
  console.log('🌐 CORS enabled for all origins');
  console.log('⏰ Scheduled tasks initialized');
  console.log('\n🔑 Demo Credentials:');
  console.log('   Admin: admin@example.com / admin123');
  console.log('   Employee: sarah.chen@example.com / password123');
  console.log('   Employee: mike.j@example.com / password123');
  console.log('\n📝 Registration: Available for new employees');
  console.log('🌐 Access from:');
  console.log('   Local: http://localhost:4000');
  console.log('   Network: http://192.168.0.165:4000');
});
