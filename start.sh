#!/bin/bash

echo "🚀 Starting ML-Powered Intelligent Workload Balancer..."
echo

echo "📦 Installing dependencies..."
npm install
cd server
npm install express cors ws bcryptjs jsonwebtoken node-cron sqlite3
cd ..

echo
echo "🔧 Starting backend server..."
cd server
node index.js &
BACKEND_PID=$!
cd ..

sleep 3

echo "🎨 Starting frontend..."
npm run dev &
FRONTEND_PID=$!

echo
echo "✅ Both servers are running..."
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend: http://localhost:4000"
echo
echo "🔑 Demo Credentials:"
echo "   Admin: admin@example.com / admin123"
echo "   Employee: sarah.chen@example.com / password123"
echo
echo "Press Ctrl+C to stop both servers..."

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait