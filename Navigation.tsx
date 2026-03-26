import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { User } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home,
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  BarChart3, 
  Settings, 
  LogOut,
  Clock,
  Zap,
  Bell
} from 'lucide-react';

interface NavigationProps {
  currentUser: User;
  onShowProfile: () => void;
  onLogout: () => void;
}

export function Navigation({ 
  currentUser, 
  onShowProfile, 
  onLogout 
}: NavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentRoute = location.pathname.slice(1) || 'home';
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  const navItems = [
    { id: 'home', label: 'Home', icon: Home, roles: ['admin', 'manager', 'employee'] },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'employee'] },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, roles: ['admin', 'manager', 'employee'] },
    { id: 'employees', label: 'Employees', icon: Users, roles: ['admin'] },
    { id: 'performance', label: 'Performance', icon: BarChart3, roles: ['admin'] }
  ];

  const availableItems = navItems.filter(item => item.roles.includes(currentUser.role));

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-800/90 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">
              IntelliHub
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-right">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 rounded-lg border border-slate-600/50">
                <Clock className="h-4 w-4 text-blue-400" />
                <div className="text-sm">
                  <div className="font-medium text-white">
                    {currentTime.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </div>
                  <div className="text-xs text-slate-400">
                    {currentTime.toLocaleDateString('en-US', { 
                      weekday: 'short',
                      month: 'short', 
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-white">{currentUser.name}</div>
                <Badge 
                  variant="secondary" 
                  className={`text-xs border-0 ${
                    currentUser.role === 'admin' ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-400' :
                    currentUser.role === 'manager' ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400' :
                    'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400'
                  }`}
                >
                  {currentUser.role}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="relative text-slate-300 hover:text-white hover:bg-slate-700/50">
              <Bell className="h-4 w-4" />
              <div className="absolute -top-1 -right-1 h-2 w-2 bg-blue-500 rounded-full"></div>
            </Button>
            <Button variant="ghost" size="sm" onClick={onShowProfile} className="text-slate-300 hover:text-white hover:bg-slate-700/50">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onLogout} className="text-slate-300 hover:text-white hover:bg-slate-700/50">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="border-b border-slate-700/50 bg-slate-800/50 p-4">
        <div className="flex gap-2">
          {availableItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate(`/${item.id}`)}
                className={`flex items-center gap-2 transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 border-0' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}