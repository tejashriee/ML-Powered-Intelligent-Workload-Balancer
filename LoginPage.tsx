import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Shield, Zap, Target, TrendingUp, Users, CheckCircle2, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string, password: string, role: 'admin' | 'employee') => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [loginType, setLoginType] = useState<'admin' | 'employee'>('employee');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    skills: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password, loginType);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:4000/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerData.name,
          email: registerData.email,
          password: registerData.password,
          role: 'employee',
          skills: registerData.skills.split(',').map(s => s.trim()).filter(s => s),
          location: 'Remote',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
        })
      });
      
      if (response.ok) {
        alert('Registration successful! You can now login.');
        setShowRegister(false);
        setEmail(registerData.email);
        setRegisterData({ name: '', email: '', password: '', confirmPassword: '', skills: '' });
      } else {
        const error = await response.json();
        alert(error.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please check your connection and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}></div>
      </div>
      
      <div className="flex w-full max-w-6xl mx-auto relative z-10">
        {/* Left Side - Branding & Features */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12 text-white">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                IntelliHub
              </h1>
            </div>
            <p className="text-xl text-blue-100 mb-8">
              Intelligent Workforce Management Platform
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Target className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-100">Smart Task Allocation</h3>
                <p className="text-blue-200/80 text-sm">AI-powered task distribution based on skills and workload</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-100">Performance Analytics</h3>
                <p className="text-blue-200/80 text-sm">Real-time insights and productivity metrics</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Users className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-100">Team Collaboration</h3>
                <p className="text-blue-200/80 text-sm">Seamless communication and project management</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <Card className="w-full max-w-md border-slate-700/50 bg-slate-800/90 backdrop-blur-xl shadow-2xl">
            <CardHeader className="text-center pb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-white">
                  IntelliHub
                </CardTitle>
              </div>
              <p className="text-slate-300">
                {showRegister ? 'Create your employee account' : 'Sign in to your workspace'}
              </p>
            </CardHeader>
        
        <CardContent className="space-y-6 pb-8">
          {!showRegister && (
            <div className="flex gap-2">
              <Button
                type="button"
                variant={loginType === 'employee' ? 'default' : 'outline'}
                onClick={() => setLoginType('employee')}
                className={`flex-1 flex items-center gap-2 transition-all ${
                  loginType === 'employee' 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0' 
                    : 'border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500'
                }`}
              >
                <User className="h-4 w-4" />
                Employee
              </Button>
              <Button
                type="button"
                variant={loginType === 'admin' ? 'default' : 'outline'}
                onClick={() => setLoginType('admin')}
                className={`flex-1 flex items-center gap-2 transition-all ${
                  loginType === 'admin' 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0' 
                    : 'border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500'
                }`}
              >
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            </div>
          )}

          {showRegister ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Full Name</label>
                <Input
                  type="text"
                  value={registerData.name}
                  onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Email</label>
                <Input
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Skills (comma separated)</label>
                <Input
                  type="text"
                  value={registerData.skills}
                  onChange={(e) => setRegisterData(prev => ({ ...prev, skills: e.target.value }))}
                  placeholder="e.g. JavaScript, React, Node.js"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Password</label>
                <Input
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter your password"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Confirm Password</label>
                <Input
                  type="password"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm your password"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Register as Employee
              </Button>
              
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setShowRegister(false)}
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500 transition-all"
              >
                Back to Login
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white transition-all flex items-center gap-2"
              >
                <ArrowRight className="h-4 w-4" />
                Sign In as {loginType === 'admin' ? 'Admin' : 'Employee'}
              </Button>
              
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setShowRegister(true)}
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500 transition-all"
              >
                Register New Employee
              </Button>
            </form>
          )}

          <div className="text-center text-sm text-slate-300 bg-slate-700/30 p-4 rounded-lg border border-slate-600/50">
            <p className="font-medium mb-3 text-blue-400">Demo Credentials:</p>
            <div className="space-y-1 text-xs">
              <p><span className="text-blue-400">Admin:</span> admin@example.com / admin123</p>
              <p><span className="text-indigo-400">Manager:</span> sarah.chen@example.com / password123</p>
              <p><span className="text-purple-400">Employee:</span> mike.j@example.com / password123</p>
              <p><span className="text-purple-400">Employee:</span> emily.d@example.com / password123</p>
            </div>
          </div>
        </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}