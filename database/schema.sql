-- Advanced Work Hub Database Schema

-- Users table with timezone and advanced features
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'employee')),
    avatar_url VARCHAR(500),
    skills TEXT, -- JSON array
    workload INTEGER DEFAULT 0,
    efficiency INTEGER DEFAULT 85,
    location VARCHAR(255),
    timezone VARCHAR(100) DEFAULT 'UTC',
    is_online BOOLEAN DEFAULT false,
    avg_task_time REAL DEFAULT 0,
    role_expertise INTEGER DEFAULT 50,
    overload_threshold INTEGER DEFAULT 40,
    tasks_completed INTEGER DEFAULT 0,
    last_active DATETIME,
    working_hours_start TIME DEFAULT '09:00',
    working_hours_end TIME DEFAULT '17:00',
    working_days TEXT DEFAULT '["monday","tuesday","wednesday","thursday","friday"]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'on-hold')),
    progress INTEGER DEFAULT 0,
    start_date DATE,
    end_date DATE,
    created_by INTEGER REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table with advanced features
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'overdue', 'blocked')),
    assigned_to INTEGER REFERENCES users(id),
    created_by INTEGER REFERENCES users(id),
    project_id INTEGER REFERENCES projects(id),
    estimated_hours REAL DEFAULT 1,
    actual_hours REAL DEFAULT 0,
    complexity INTEGER DEFAULT 1 CHECK (complexity BETWEEN 1 AND 10),
    deadline DATETIME,
    started_at DATETIME,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    tags TEXT, -- JSON array
    dependencies TEXT, -- JSON array of task IDs
    auto_assigned BOOLEAN DEFAULT false,
    timezone_scheduled VARCHAR(100)
);

-- Notifications
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    related_task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT false,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Task allocation history
CREATE TABLE allocation_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    from_user_id INTEGER REFERENCES users(id),
    to_user_id INTEGER REFERENCES users(id),
    allocation_type VARCHAR(50) NOT NULL, -- 'auto', 'manual', 'reallocation'
    algorithm_used VARCHAR(100),
    confidence_score REAL,
    timezone_factor REAL,
    skill_match_score REAL,
    workload_factor REAL,
    deadline_urgency REAL,
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_timezone ON users(timezone);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
