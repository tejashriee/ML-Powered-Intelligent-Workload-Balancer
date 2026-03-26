import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X, User } from 'lucide-react';
import { User as UserType } from '@/types';

interface ProfileModalProps {
  user: UserType;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (userData: Partial<UserType>) => void;
}

export function ProfileModal({ user, isOpen, onClose, onUpdate }: ProfileModalProps) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    location: user.location || '',
    skills: (user.skills || []).join(', ')
  });

  React.useEffect(() => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      location: user.location || '',
      skills: (user.skills || []).join(', ')
    });
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...formData,
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean)
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Edit Profile
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Skills (comma separated)</label>
              <Input
                value={formData.skills}
                onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                placeholder="react, typescript, node.js"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600">Update Profile</Button>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
