import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class Database {
  constructor() {
    this.db = null;
    this.init();
  }

  async init() {
    const dbPath = join(__dirname, 'workhub.db');
    
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('📊 Connected to SQLite database');
        this.createTables();
      }
    });

    // Enable foreign keys
    this.db.run('PRAGMA foreign_keys = ON');
  }

  async createTables() {
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    this.db.exec(schema, (err) => {
      if (err) {
        console.error('Error creating tables:', err);
      } else {
        console.log('✅ Database tables created successfully');
        this.seedInitialData();
      }
    });
  }

  async seedInitialData() {
    // Check if users exist
    this.db.get('SELECT COUNT(*) as count FROM users', async (err, row) => {
      if (err) {
        console.error('Error checking users:', err);
        return;
      }
      
      if (row.count === 0) {
        console.log('🌱 Seeding initial data...');
        await this.insertInitialUsers();
        this.insertSystemSettings();
      } else {
        console.log(`✅ Database has ${row.count} users`);
      }
    });
  }

  async insertInitialUsers() {
    const bcrypt = await import('bcryptjs');
    
    const users = [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password_hash: await bcrypt.default.hash('admin123', 10),
        role: 'admin',
        skills: '[]',
        location: 'HQ',
        timezone: 'America/New_York',
        efficiency: 100,
        role_expertise: 95
      },
      {
        name: 'Sarah Chen',
        email: 'sarah.chen@example.com',
        password_hash: await bcrypt.default.hash('password123', 10),
        role: 'manager',
        skills: '["management", "planning", "leadership"]',
        location: 'San Francisco, CA',
        timezone: 'America/Los_Angeles',
        efficiency: 95,
        role_expertise: 88,
        tasks_completed: 12
      },
      {
        name: 'Mike Johnson',
        email: 'mike.j@example.com',
        password_hash: await bcrypt.default.hash('password123', 10),
        role: 'employee',
        skills: '["javascript", "react", "nodejs", "typescript"]',
        location: 'New York, NY',
        timezone: 'America/New_York',
        efficiency: 87,
        role_expertise: 82,
        tasks_completed: 8
      },
      {
        name: 'Emily Davis',
        email: 'emily.d@example.com',
        password_hash: await bcrypt.default.hash('password123', 10),
        role: 'employee',
        skills: '["python", "data-analysis", "machine-learning", "sql"]',
        location: 'Austin, TX',
        timezone: 'America/Chicago',
        efficiency: 92,
        role_expertise: 85,
        tasks_completed: 15
      },
      {
        name: 'Alex Kumar',
        email: 'alex.kumar@example.com',
        password_hash: await bcrypt.default.hash('password123', 10),
        role: 'employee',
        skills: '["java", "spring", "microservices", "aws"]',
        location: 'Mumbai, India',
        timezone: 'Asia/Kolkata',
        efficiency: 89,
        role_expertise: 78,
        tasks_completed: 6,
        working_hours_start: '10:00',
        working_hours_end: '18:00'
      }
    ];

    const stmt = this.db.prepare(`
      INSERT INTO users (name, email, password_hash, role, skills, location, timezone, efficiency, role_expertise, tasks_completed, working_hours_start, working_hours_end, is_online)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    users.forEach(user => {
      stmt.run([
        user.name, user.email, user.password_hash, user.role, user.skills,
        user.location, user.timezone, user.efficiency, user.role_expertise,
        user.tasks_completed, user.working_hours_start || '09:00', user.working_hours_end || '17:00'
      ]);
    });

    stmt.finalize();
    console.log('👥 Initial users created');
  }

  insertSystemSettings() {
    const settings = [
      { key: 'auto_allocation_enabled', value: 'true', description: 'Enable automatic task allocation' },
      { key: 'timezone_scheduling_enabled', value: 'true', description: 'Enable timezone-aware scheduling' },
      { key: 'notification_enabled', value: 'true', description: 'Enable system notifications' },
      { key: 'max_workload_hours', value: '40', description: 'Maximum workload hours per week' },
      { key: 'deadline_warning_hours', value: '24', description: 'Hours before deadline to send warning' }
    ];

    const stmt = this.db.prepare(`
      INSERT INTO system_settings (key, value, description)
      VALUES (?, ?, ?)
    `);

    settings.forEach(setting => {
      stmt.run([setting.key, setting.value, setting.description]);
    });

    stmt.finalize();
    console.log('⚙️ System settings initialized');
  }

  // Utility methods
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

export default new Database();