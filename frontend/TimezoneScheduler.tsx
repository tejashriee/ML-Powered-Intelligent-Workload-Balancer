import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, Clock, Users, Calendar } from 'lucide-react';
import { api } from '@/lib/api';
import { User } from '@/types';

interface TimezoneSchedulerProps {
  users: User[];
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
}

interface TimezoneInfo {
  timezone: string;
  localTime: string;
  offset: string;
  users: User[];
}

export function TimezoneScheduler({ users, selectedDate, onDateSelect }: TimezoneSchedulerProps) {
  const [timezones, setTimezones] = useState<TimezoneInfo[]>([]);
  const [selectedTimezone, setSelectedTimezone] = useState<string>('America/New_York');
  const [convertedDate, setConvertedDate] = useState<string>('');
  const [inputDate, setInputDate] = useState<string>(
    selectedDate?.toISOString().slice(0, 16) || new Date().toISOString().slice(0, 16)
  );

  useEffect(() => {
    updateTimezoneInfo();
    const interval = setInterval(updateTimezoneInfo, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [users]);

  useEffect(() => {
    if (inputDate) {
      convertTimezone();
    }
  }, [inputDate, selectedTimezone]);

  const updateTimezoneInfo = () => {
    const timezoneMap = new Map<string, User[]>();
    
    users.forEach(user => {
      const timezone = user.timezone || 'America/New_York';
      if (!timezoneMap.has(timezone)) {
        timezoneMap.set(timezone, []);
      }
      timezoneMap.get(timezone)!.push(user);
    });

    const timezoneInfos: TimezoneInfo[] = Array.from(timezoneMap.entries()).map(([timezone, users]) => {
      const now = new Date();
      const localTime = now.toLocaleString('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      
      const offset = now.toLocaleString('en-US', {
        timeZone: timezone,
        timeZoneName: 'short'
      }).split(' ').pop() || '';

      return {
        timezone,
        localTime,
        offset,
        users: users.filter(u => u.role !== 'admin')
      };
    });

    setTimezones(timezoneInfos.sort((a, b) => a.timezone.localeCompare(b.timezone)));
  };

  const convertTimezone = async () => {
    if (!inputDate) return;
    
    try {
      const result = await api.convertTimezone(inputDate, 'UTC', selectedTimezone);
      setConvertedDate(result.convertedDate);
    } catch (error) {
      console.error('Timezone conversion failed:', error);
    }
  };

  const getWorkingHoursStatus = (timezone: string) => {
    const now = new Date();
    const hour = parseInt(now.toLocaleString('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      hour12: false
    }));
    
    if (hour >= 9 && hour < 17) {
      return { status: 'working', color: 'text-green-600', icon: '🟢' };
    } else if (hour >= 17 && hour < 22) {
      return { status: 'evening', color: 'text-orange-600', icon: '🟡' };
    } else {
      return { status: 'off-hours', color: 'text-red-600', icon: '🔴' };
    }
  };

  const getBestMeetingTime = () => {
    const timezoneHours = timezones.map(tz => {
      const now = new Date();
      const hour = parseInt(now.toLocaleString('en-US', {
        timeZone: tz.timezone,
        hour: '2-digit',
        hour12: false
      }));
      return { timezone: tz.timezone, hour, users: tz.users.length };
    });

    // Find overlapping working hours (9 AM - 5 PM)
    const workingHours = [];
    for (let hour = 9; hour < 17; hour++) {
      const overlapping = timezoneHours.filter(tz => {
        const adjustedHour = (hour + getTimezoneOffset(tz.timezone)) % 24;
        return adjustedHour >= 9 && adjustedHour < 17;
      });
      
      if (overlapping.length > 0) {
        workingHours.push({
          hour,
          overlappingUsers: overlapping.reduce((sum, tz) => sum + tz.users, 0),
          timezones: overlapping.map(tz => tz.timezone)
        });
      }
    }

    return workingHours.sort((a, b) => b.overlappingUsers - a.overlappingUsers)[0];
  };

  const getTimezoneOffset = (timezone: string) => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const targetTime = new Date(utc + (getTimezoneOffsetHours(timezone) * 3600000));
    return Math.round((targetTime.getTime() - now.getTime()) / 3600000);
  };

  const getTimezoneOffsetHours = (timezone: string) => {
    const offsets: { [key: string]: number } = {
      'America/Los_Angeles': -8,
      'America/Chicago': -6,
      'America/New_York': -5,
      'Europe/London': 0,
      'Europe/Paris': 1,
      'Asia/Tokyo': 9
    };
    return offsets[timezone] || -5;
  };

  const bestMeetingTime = getBestMeetingTime();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Global Team Timezone Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {timezones.map((tz) => {
              const workingStatus = getWorkingHoursStatus(tz.timezone);
              return (
                <div
                  key={tz.timezone}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">
                      {tz.timezone.replace('_', ' ').split('/')[1]}
                    </h4>
                    <span className="text-lg">{workingStatus.icon}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-sm">{tz.localTime}</span>
                      <span className="text-xs text-muted-foreground">{tz.offset}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{tz.users.length} team members</span>
                    </div>
                    
                    <div className={`text-xs ${workingStatus.color} font-medium`}>
                      {workingStatus.status === 'working' && '🟢 Working Hours'}
                      {workingStatus.status === 'evening' && '🟡 Evening Hours'}
                      {workingStatus.status === 'off-hours' && '🔴 Off Hours'}
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      {tz.users.map(u => u.name).join(', ')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {bestMeetingTime && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h5 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Optimal Meeting Time
              </h5>
              <p className="text-sm text-blue-700">
                Best time for team meetings: <strong>{bestMeetingTime.hour}:00</strong> 
                {' '}(covers {bestMeetingTime.overlappingUsers} team members during working hours)
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Timezones: {bestMeetingTime.timezones.join(', ')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Smart Deadline Scheduler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Date & Time (UTC)
              </label>
              <Input
                type="datetime-local"
                value={inputDate}
                onChange={(e) => setInputDate(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">
                Convert to Timezone
              </label>
              <select
                value={selectedTimezone}
                onChange={(e) => setSelectedTimezone(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {timezones.map((tz) => (
                  <option key={tz.timezone} value={tz.timezone}>
                    {tz.timezone.replace('_', ' ')} ({tz.offset})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {convertedDate && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h5 className="font-medium text-green-800 mb-2">Converted Time</h5>
              <p className="text-sm text-green-700">
                <strong>{convertedDate}</strong> in {selectedTimezone.replace('_', ' ')}
              </p>
              <p className="text-xs text-green-600 mt-1">
                This ensures deadlines are set according to the assignee's local time
              </p>
            </div>
          )}

          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h5 className="font-medium text-purple-800 mb-2">🎯 Smart Scheduling Tips</h5>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Deadlines are automatically adjusted to assignee's timezone</li>
              <li>• Meeting times consider all team members' working hours</li>
              <li>• Task notifications respect local business hours</li>
              <li>• Urgent tasks avoid off-hours unless critical</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
