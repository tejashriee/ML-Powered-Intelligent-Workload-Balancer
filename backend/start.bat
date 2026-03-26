@echo off
echo 🚀 Starting ML-Powered Intelligent Workload Balancer...
echo.

echo 📦 Installing dependencies...
call npm install
cd server
call npm install express cors ws bcryptjs jsonwebtoken node-cron sqlite3
cd ..

echo.
echo 🔧 Starting backend server...
start "Backend Server" cmd /k "cd server && node index.js"

timeout /t 3 /nobreak >nul

echo 🎨 Starting frontend...
start "Frontend" cmd /k "npm run dev"

echo.
echo ✅ Both servers are starting...
echo 🌐 Frontend will be available at: http://localhost:5173
echo 🔧 Backend running on: http://localhost:4000
echo.
echo 🔑 Demo Credentials:
echo    Admin: admin@example.com / admin123
echo    Employee: sarah.chen@example.com / password123
echo.
echo Press any key to exit...
pause >nul
