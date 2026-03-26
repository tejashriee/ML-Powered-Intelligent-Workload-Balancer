# IntelliHub - AI-Powered Workforce Management Platform

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Backend Server**
   ```bash
   npm run server
   ```
   The server will start on `http://localhost:4000`

3. **Start the Frontend (in a new terminal)**
   ```bash
   npm run dev
   ```
   The frontend will start on `http://localhost:5173`

### 🔐 Demo Credentials

**Admin Access:**
- Email: `admin@example.com`
- Password: `admin123`

**Manager Access:**
- Email: `sarah.chen@example.com`
- Password: `password123`

**Employee Access:**
- Email: `mike.j@example.com`
- Password: `password123`
- Email: `emily.d@example.com`
- Password: `password123`

### 🎯 Key Features

- **AI-Powered Task Allocation**: Machine learning algorithms automatically assign tasks
- **Real-time Collaboration**: WebSocket-powered live updates
- **Timezone Intelligence**: Global team scheduling optimization
- **Predictive Analytics**: Burnout prevention and performance insights
- **Role-based Access Control**: Secure multi-level permissions
- **Modern Dark UI**: Professional productivity-focused interface

### 🛠️ Troubleshooting

**Login Issues:**
If you encounter login failures, restart the server to regenerate the database with properly hashed passwords:

**Windows:**
```bash
restart-server.bat
```

**Manual Restart:**
1. Stop the server (Ctrl+C)
2. Delete `server/database/workhub.db`
3. Run `npm run server` again

### 🏗️ Architecture

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + SQLite
- **Real-time**: WebSocket connections
- **Authentication**: JWT + bcrypt
- **AI Features**: Custom allocation algorithms

### 📱 Usage

1. **Landing Page**: Modern AI-focused marketing page
2. **Authentication**: Secure login with role-based access
3. **Dashboard**: Personalized productivity overview
4. **Task Management**: Create, assign, and track tasks
5. **Team Management**: Employee oversight (Admin only)
6. **Analytics**: Performance insights and metrics

### 🎨 UI Theme

The platform features a modern dark theme optimized for productivity:
- **Primary Colors**: Blue to Indigo gradients
- **Dark Background**: Slate color palette
- **Accent Colors**: Role-based color coding
- **Typography**: Clean, professional fonts
- **Animations**: Smooth transitions and hover effects

### 🔧 Development

**File Structure:**
```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard views
│   └── ui/             # Reusable UI components
├── lib/                # Utilities and API
├── types/              # TypeScript definitions
└── hooks/              # Custom React hooks

server/
├── database/           # Database schema and connection
├── algorithms/         # AI allocation algorithms
└── index.js           # Main server file
```

**Key Technologies:**
- React 18 with TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- Express.js backend
- SQLite database
- WebSocket for real-time updates

### 🚀 Production Deployment

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Configure environment variables
3. Set up production database
4. Deploy to your preferred hosting platform

### 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the demo credentials
3. Ensure all dependencies are installed
4. Verify Node.js version compatibility

---

**Built with ❤️ for modern workforce management**