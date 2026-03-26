import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  Users, 
  CheckSquare, 
  BarChart3, 
  Clock, 
  Shield, 
  Zap,
  ArrowRight,
  Star,
  Target,
  Brain,
  Globe,
  TrendingUp,
  Sparkles
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Allocation',
      description: 'Machine learning algorithms automatically assign tasks based on skills, workload, and performance patterns.'
    },
    {
      icon: Globe,
      title: 'Timezone Intelligence',
      description: 'Smart scheduling that considers global team timezones for optimal collaboration and productivity.'
    },
    {
      icon: TrendingUp,
      title: 'Predictive Analytics',
      description: 'Advanced insights that predict bottlenecks, burnout risks, and optimal resource allocation.'
    },
    {
      icon: Clock,
      title: 'Real-time Sync',
      description: 'Instant updates across all devices with WebSocket-powered live collaboration features.'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level security with role-based access control and encrypted data transmission.'
    },
    {
      icon: Sparkles,
      title: 'Smart Insights',
      description: 'Intelligent recommendations for workflow optimization and team performance enhancement.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Project Manager',
      content: 'This platform has revolutionized how we manage our team workload. The real-time updates are game-changing.',
      rating: 5
    },
    {
      name: 'Mike Chen',
      role: 'Team Lead',
      content: 'The performance analytics help us identify bottlenecks and optimize our workflow efficiently.',
      rating: 5
    },
    {
      name: 'Emily Davis',
      role: 'Operations Director',
      content: 'Simple, intuitive, and powerful. Our team productivity has increased by 40% since implementation.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}></div>
      </div>
      
      {/* Header */}
      <header className="bg-slate-800/90 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">
                IntelliHub
              </h1>
            </div>
            <Button 
              onClick={onGetStarted}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 rounded-full border border-blue-500/30 mb-6">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span className="text-blue-300 text-sm font-medium">AI-Powered Workforce Intelligence</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Next-Gen Workforce
            </span>
            <br />
            <span className="text-white">Management Platform</span>
          </h1>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Harness the power of artificial intelligence to optimize team productivity, predict workload patterns, 
            and create the most efficient workforce management system ever built.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={onGetStarted}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-4 text-lg border-0 shadow-2xl shadow-blue-500/25"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => {
                alert('🎬 Interactive Demo Available!\n\nExperience:\n• AI-Powered Task Allocation\n• Real-time Team Collaboration\n• Predictive Analytics Dashboard\n• Global Timezone Intelligence\n• Burnout Prevention System\n• Smart Performance Insights');
              }}
              className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-slate-500 px-8 py-4 text-lg backdrop-blur-sm"
            >
              Interactive Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/50 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Revolutionary Features for Modern Teams
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Advanced AI-driven capabilities that transform how teams collaborate, perform, and succeed.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-slate-700/50 bg-slate-800/90 backdrop-blur-sm hover:bg-slate-800 transition-all hover:scale-105 group">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm">
              <div className="text-4xl font-bold text-blue-400 mb-2">25K+</div>
              <div className="text-slate-300">Active Users</div>
            </div>
            <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm">
              <div className="text-4xl font-bold text-indigo-400 mb-2">150K+</div>
              <div className="text-slate-300">Tasks Automated</div>
            </div>
            <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm">
              <div className="text-4xl font-bold text-purple-400 mb-2">99.9%</div>
              <div className="text-slate-300">AI Accuracy</div>
            </div>
            <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm">
              <div className="text-4xl font-bold text-green-400 mb-2">65%</div>
              <div className="text-slate-300">Efficiency Boost</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/50 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-blue-100">
              Join thousands of teams who rely on IntelliHub for next-level productivity
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-slate-700/50 bg-slate-800/90 backdrop-blur-sm hover:bg-slate-800 transition-all">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-300 mb-4">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-slate-400">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-12 rounded-2xl border border-slate-700/50 relative overflow-hidden">
            <div className="absolute inset-0 opacity-30">
              <div className="w-full h-full" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}></div>
            </div>
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-white mb-6">
                Ready to revolutionize your workforce?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join the AI-powered productivity revolution. Transform your team's potential with intelligent automation.
              </p>
              <Button 
                size="lg"
                onClick={onGetStarted}
                className="bg-white text-blue-600 hover:bg-blue-50 px-12 py-4 text-lg font-semibold shadow-2xl"
              >
                Start Your AI Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700/50 text-white py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold">IntelliHub</h3>
              </div>
              <p className="text-slate-400">
                AI-powered workforce intelligence for the future of work.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-blue-400">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li className="hover:text-white cursor-pointer transition-colors">AI Features</li>
                <li className="hover:text-white cursor-pointer transition-colors">Pricing</li>
                <li className="hover:text-white cursor-pointer transition-colors">Security</li>
                <li className="hover:text-white cursor-pointer transition-colors">Updates</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-indigo-400">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li className="hover:text-white cursor-pointer transition-colors">About</li>
                <li className="hover:text-white cursor-pointer transition-colors">Careers</li>
                <li className="hover:text-white cursor-pointer transition-colors">Contact</li>
                <li className="hover:text-white cursor-pointer transition-colors">Blog</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-purple-400">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li className="hover:text-white cursor-pointer transition-colors">Help Center</li>
                <li className="hover:text-white cursor-pointer transition-colors">Documentation</li>
                <li className="hover:text-white cursor-pointer transition-colors">Community</li>
                <li className="hover:text-white cursor-pointer transition-colors">Status</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2025 IntelliHub. All rights reserved.</p>
            <p className="mt-2 text-sm">Powered by AI • Built for the Future</p>
          </div>
        </div>
      </footer>
    </div>
  );
}