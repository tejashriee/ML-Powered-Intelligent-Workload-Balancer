import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Send, 
  User, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle,
  Lightbulb,
  Calendar,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import { User as UserType, Task } from '@/types';

interface PersonalAssistantProps {
  user: UserType;
  tasks: Task[];
  users: UserType[];
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  category?: 'general' | 'task' | 'workload' | 'schedule' | 'help';
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: string;
  category: string;
}

export function PersonalAssistant({ user, tasks, users }: PersonalAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: `Hello ${user.name}! 👋 I'm your personal AI assistant. I can help you with task management, workload optimization, schedule planning, and answer any work-related questions. How can I assist you today?`,
      timestamp: new Date(),
      category: 'general'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions: QuickAction[] = [
    {
      id: '1',
      label: 'My Tasks Overview',
      icon: <CheckCircle className="h-4 w-4" />,
      action: 'show_my_tasks',
      category: 'task'
    },
    {
      id: '2',
      label: 'Workload Analysis',
      icon: <BarChart3 className="h-4 w-4" />,
      action: 'analyze_workload',
      category: 'workload'
    },
    {
      id: '3',
      label: 'Schedule Optimization',
      icon: <Calendar className="h-4 w-4" />,
      action: 'optimize_schedule',
      category: 'schedule'
    },
    {
      id: '4',
      label: 'Productivity Tips',
      icon: <Lightbulb className="h-4 w-4" />,
      action: 'productivity_tips',
      category: 'help'
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = (userMessage: string, action?: string): string => {
    const userTasks = tasks.filter(t => t.assignedTo === user.id);
    const activeTasks = userTasks.filter(t => t.status !== 'completed');
    const completedTasks = userTasks.filter(t => t.status === 'completed');
    const overdueTasks = userTasks.filter(t => t.status !== 'completed' && new Date(t.deadline) < new Date());

    // Handle quick actions
    if (action) {
      switch (action) {
        case 'show_my_tasks': {
          return `📋 **Your Task Overview:**

**Active Tasks:** ${activeTasks.length}
**Completed:** ${completedTasks.length}
**Overdue:** ${overdueTasks.length}
**Current Workload:** ${user.workload || 0} hours

${activeTasks.length > 0 ? `**Upcoming Tasks:**
${activeTasks.slice(0, 3).map(t => `• ${t.title} (${t.priority} priority) - Due: ${new Date(t.deadline).toLocaleDateString()}`).join('\n')}` : '✅ No active tasks! Great job staying on top of things.'}

${overdueTasks.length > 0 ? `\n⚠️ **Attention:** You have ${overdueTasks.length} overdue task(s) that need immediate attention.` : ''}`;
        }

        case 'analyze_workload': {
          const workloadPercentage = ((user.workload || 0) / (user.overloadThreshold || 40)) * 100;
          const status = workloadPercentage > 80 ? 'High' : workloadPercentage > 60 ? 'Moderate' : 'Light';
          const statusEmoji = workloadPercentage > 80 ? '🔴' : workloadPercentage > 60 ? '🟡' : '🟢';
          
          return `📊 **Workload Analysis:**

${statusEmoji} **Current Status:** ${status} (${workloadPercentage.toFixed(1)}%)
**Hours:** ${user.workload || 0}h / ${user.overloadThreshold || 40}h capacity
**Efficiency:** ${user.efficiency || 85}%
**Tasks Distribution:**
- High Priority: ${activeTasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length}
- Medium Priority: ${activeTasks.filter(t => t.priority === 'medium').length}
- Low Priority: ${activeTasks.filter(t => t.priority === 'low').length}

${workloadPercentage > 80 ? '💡 **Recommendation:** Consider delegating some tasks or extending deadlines to prevent burnout.' : workloadPercentage > 60 ? '💡 **Recommendation:** You\'re managing well, but monitor your workload closely.' : '💡 **Recommendation:** You have capacity for additional tasks if needed.'}`;
        }

        case 'optimize_schedule': {
          const todayTasks = activeTasks.filter(t => {
            const deadline = new Date(t.deadline);
            const today = new Date();
            return deadline.toDateString() === today.toDateString();
          });
          
          return `📅 **Schedule Optimization:**

**Today's Focus:** ${todayTasks.length} task(s) due today
**This Week:** ${activeTasks.filter(t => {
            const deadline = new Date(t.deadline);
            const weekFromNow = new Date();
            weekFromNow.setDate(weekFromNow.getDate() + 7);
            return deadline <= weekFromNow;
          }).length} task(s) due this week

**Recommended Schedule:**
${activeTasks
  .sort((a, b) => {
    const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
    const aPriority = priorityWeight[a.priority as keyof typeof priorityWeight] || 1;
    const bPriority = priorityWeight[b.priority as keyof typeof priorityWeight] || 1;
    return bPriority - aPriority;
  })
  .slice(0, 5)
  .map((t, i) => `${i + 1}. ${t.title} (${t.priority} priority)`)
  .join('\n')}

💡 **Tips:**
- Focus on high-priority tasks during your peak energy hours
- Break large tasks into smaller, manageable chunks
- Schedule buffer time between tasks for unexpected issues`;
        }

        case 'productivity_tips':
          return `💡 **Personalized Productivity Tips:**

Based on your current workload and performance:

🎯 **Focus Strategies:**
- Use the Pomodoro Technique (25min work, 5min break)
- Tackle your most challenging task first thing in the morning
- Batch similar tasks together to maintain flow

⚡ **Efficiency Boosters:**
- Set specific time blocks for email and communication
- Use keyboard shortcuts and automation tools
- Keep a "done" list to track accomplishments

🧘 **Well-being:**
- Take regular breaks to prevent mental fatigue
- Stay hydrated and maintain good posture
- Practice the 20-20-20 rule for eye strain

📈 **Performance Tracking:**
- Review your completed tasks weekly
- Identify patterns in your most productive hours
- Celebrate small wins to maintain motivation`;
      }
    }

    // Handle natural language queries
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('task') || lowerMessage.includes('work')) {
      if (lowerMessage.includes('how many') || lowerMessage.includes('count')) {
        return `You currently have ${activeTasks.length} active tasks and have completed ${completedTasks.length} tasks. ${overdueTasks.length > 0 ? `You also have ${overdueTasks.length} overdue task(s) that need attention.` : 'All your tasks are on track! 🎉'}`;
      }
      if (lowerMessage.includes('deadline') || lowerMessage.includes('due')) {
        const urgentTasks = activeTasks.filter(t => {
          const deadline = new Date(t.deadline);
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          return deadline <= tomorrow;
        });
        return urgentTasks.length > 0 
          ? `⏰ You have ${urgentTasks.length} task(s) due soon:\n${urgentTasks.map(t => `• ${t.title} - Due: ${new Date(t.deadline).toLocaleDateString()}`).join('\n')}`
          : 'No urgent deadlines coming up. You\'re in good shape! ✅';
      }
    }
    
    if (lowerMessage.includes('workload') || lowerMessage.includes('busy') || lowerMessage.includes('overwhelmed')) {
      const workloadPercentage = ((user.workload || 0) / (user.overloadThreshold || 40)) * 100;
      return `Your current workload is ${(user.workload || 0)} hours (${workloadPercentage.toFixed(1)}% of capacity). ${
        workloadPercentage > 80 
          ? 'You seem quite busy! Consider prioritizing tasks or asking for help with lower-priority items.' 
          : workloadPercentage > 60 
            ? 'You have a moderate workload. You\'re managing well!' 
            : 'Your workload looks manageable. You have room for additional tasks if needed.'
      }`;
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('stuck')) {
      return `I'm here to help! 🤝 Here are some ways I can assist you:

📋 **Task Management:** Ask about your tasks, deadlines, or priorities
📊 **Workload Analysis:** Get insights into your current workload and capacity  
📅 **Schedule Planning:** Help optimize your daily and weekly schedule
💡 **Productivity Tips:** Personalized advice based on your work patterns
🔍 **Quick Answers:** Ask about team members, project status, or work policies

Just ask me anything like:
- "What tasks do I have due this week?"
- "How is my workload looking?"
- "Give me some productivity tips"
- "Who else is working on this project?"`;
    }
    
    if (lowerMessage.includes('team') || lowerMessage.includes('colleague') || lowerMessage.includes('who')) {
      const teamMembers = users.filter(u => u.role !== 'admin' && u.id !== user.id);
      return `👥 **Your Team:**\n${teamMembers.map(u => `• ${u.name} (${u.role}) - ${u.isOnline ? '🟢 Online' : '🔴 Offline'} - ${u.workload || 0}h workload`).join('\n')}\n\nNeed to collaborate with someone? I can help you find the right person based on skills or availability!`;
    }
    
    // Default responses
    const responses = [
      `I understand you're asking about "${userMessage}". Could you be more specific? I can help with tasks, workload, scheduling, or general work questions.`,
      `That's an interesting question! I'm designed to help with work-related topics. Try asking about your tasks, deadlines, workload, or productivity tips.`,
      `I'd love to help with that! I specialize in task management, workload optimization, and productivity advice. What specific aspect would you like to explore?`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async (message: string, action?: string) => {
    if (!message.trim() && !action) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message || (quickActions.find(qa => qa.action === action)?.label || ''),
      timestamp: new Date(),
      category: action ? quickActions.find(qa => qa.action === action)?.category as any : 'general'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const response = generateResponse(message, action);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date(),
        category: userMessage.category
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickAction = (action: string) => {
    handleSendMessage('', action);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputMessage);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Personal AI Assistant</h3>
            <p className="text-sm text-gray-600 font-normal">Your intelligent workplace companion</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-600">Online</span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Quick Actions */}
        <div className="p-4 border-b bg-gray-50">
          <p className="text-sm text-gray-600 mb-3">Quick Actions:</p>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map(action => (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action.action)}
                className="flex items-center gap-2 text-left justify-start h-auto py-2"
              >
                {action.icon}
                <span className="text-xs">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : ''}`}>
                <div
                  className={`p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {message.category && message.category !== 'general' && (
                    <Badge variant="outline" className="text-xs">
                      {message.category}
                    </Badge>
                  )}
                </div>
              </div>

              {message.type === 'user' && (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your work, tasks, or productivity..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button
              onClick={() => handleSendMessage(inputMessage)}
              disabled={!inputMessage.trim() || isTyping}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Try asking: "What are my tasks today?", "How's my workload?", or "Give me productivity tips"
          </p>
        </div>
      </CardContent>
    </Card>
  );
}