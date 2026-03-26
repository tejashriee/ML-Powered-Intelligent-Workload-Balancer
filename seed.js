import bcrypt from 'bcryptjs';
import db from './connection.js';

async function seedDatabase() {
  console.log('🌱 Seeding database with default users...');
  
  try {
    // Check if users already exist
    const existingUsers = await db.get('SELECT COUNT(*) as count FROM users');
    if (existingUsers.count > 0) {
      console.log('✅ Database already seeded');
      return;
    }

    // Default employees
    const defaultUsers = [
      {
        name: 'Sarah Chen',
        email: 'sarah.chen@example.com',
        password: 'password123',
        role: 'manager',
        skills: ['project-management', 'leadership', 'strategy'],
        location: 'New York',
        timezone: 'America/New_York',
        efficiency: 92,
        overload_threshold: 35
      },
      {
        name: 'Mike Johnson',
        email: 'mike.j@example.com',
        password: 'password123',
        role: 'employee',
        skills: ['javascript', 'react', 'node.js', 'mongodb'],
        location: 'San Francisco',
        timezone: 'America/Los_Angeles',
        efficiency: 88,
        overload_threshold: 32
      },
      {
        name: 'Emily Davis',
        email: 'emily.d@example.com',
        password: 'password123',
        role: 'employee',
        skills: ['python', 'data-analysis', 'machine-learning', 'sql'],
        location: 'Chicago',
        timezone: 'America/Chicago',
        efficiency: 90,
        overload_threshold: 30
      },
      {
        name: 'Alex Rodriguez',
        email: 'alex.r@example.com',
        password: 'password123',
        role: 'employee',
        skills: ['ui-design', 'ux-research', 'figma', 'prototyping'],
        location: 'Austin',
        timezone: 'America/Chicago',
        efficiency: 85,
        overload_threshold: 28
      },
      {
        name: 'Lisa Wang',
        email: 'lisa.w@example.com',
        password: 'password123',
        role: 'employee',
        skills: ['java', 'spring-boot', 'microservices', 'aws'],
        location: 'Seattle',
        timezone: 'America/Los_Angeles',
        efficiency: 91,
        overload_threshold: 34
      }
    ];

    for (const user of defaultUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      await db.run(`
        INSERT INTO users (
          name, email, password_hash, role, skills, location, timezone, 
          efficiency, overload_threshold, is_online, working_hours_start, 
          working_hours_end, working_days
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, '09:00', '17:00', ?)
      `, [
        user.name,
        user.email,
        hashedPassword,
        user.role,
        JSON.stringify(user.skills),
        user.location,
        user.timezone,
        user.efficiency,
        user.overload_threshold,
        JSON.stringify(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])
      ]);
      
      console.log(`✅ Created user: ${user.name} (${user.email})`);
    }

    // Create some sample tasks
    const sampleTasks = [
      {
        title: 'Implement user authentication',
        description: 'Add JWT-based authentication system',
        priority: 'high',
        estimated_hours: 8,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['javascript', 'node.js', 'security'],
        created_by: 1
      },
      {
        title: 'Design dashboard mockups',
        description: 'Create wireframes and mockups for admin dashboard',
        priority: 'medium',
        estimated_hours: 6,
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['ui-design', 'figma'],
        created_by: 1
      },
      {
        title: 'Data analysis report',
        description: 'Analyze user behavior patterns and create insights report',
        priority: 'medium',
        estimated_hours: 12,
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['python', 'data-analysis'],
        created_by: 1
      }
    ];

    for (const task of sampleTasks) {
      await db.run(`
        INSERT INTO tasks (
          title, description, priority, estimated_hours, deadline, tags, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        task.title,
        task.description,
        task.priority,
        task.estimated_hours,
        task.deadline,
        JSON.stringify(task.tags),
        task.created_by
      ]);
    }

    console.log('✅ Sample tasks created');
    console.log('🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  }
}

// Run seeding if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().then(() => process.exit(0));
}

export default seedDatabase;