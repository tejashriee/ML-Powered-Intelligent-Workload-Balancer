import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { User } from '@/types';

interface WorkloadChartProps {
  users: User[];
}

export function WorkloadChart({ users }: WorkloadChartProps) {
  const workloadData = users
    .filter(user => user.role !== 'admin')
    .map(user => ({
      name: user.name.split(' ')[0], // First name only
      workload: user.workload || 0,
      capacity: user.overloadThreshold || 40,
      utilization: Math.round(((user.workload || 0) / (user.overloadThreshold || 40)) * 100)
    }))
    .sort((a, b) => b.workload - a.workload);

  const pieData = workloadData.map(user => ({
    name: user.name,
    value: user.workload,
    utilization: user.utilization
  }));

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-blue-600">
            Workload: {payload[0].value}h
          </p>
          <p className="text-gray-600">
            Capacity: {payload[0].payload.capacity}h
          </p>
          <p className="text-purple-600">
            Utilization: {payload[0].payload.utilization}%
          </p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-blue-600">
            Workload: {payload[0].value}h
          </p>
          <p className="text-purple-600">
            Utilization: {payload[0].payload.utilization}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (workloadData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">No workload data available</p>
          <p className="text-sm">Add team members to see workload distribution</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bar Chart */}
      <div>
        <h3 className="text-lg font-medium mb-4">Team Workload Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={workloadData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="workload" fill="#8884d8" name="Current Workload" />
            <Bar dataKey="capacity" fill="#e0e0e0" name="Max Capacity" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div>
        <h3 className="text-lg font-medium mb-4">Workload Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}h`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Utilization Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-800">Optimal Load</h4>
          <p className="text-2xl font-bold text-green-600">
            {workloadData.filter(u => u.utilization <= 70).length}
          </p>
          <p className="text-sm text-green-600">Users under 70% capacity</p>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-medium text-yellow-800">High Load</h4>
          <p className="text-2xl font-bold text-yellow-600">
            {workloadData.filter(u => u.utilization > 70 && u.utilization <= 90).length}
          </p>
          <p className="text-sm text-yellow-600">Users at 70-90% capacity</p>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <h4 className="font-medium text-red-800">Overloaded</h4>
          <p className="text-2xl font-bold text-red-600">
            {workloadData.filter(u => u.utilization > 90).length}
          </p>
          <p className="text-sm text-red-600">Users over 90% capacity</p>
        </div>
      </div>
    </div>
  );
}