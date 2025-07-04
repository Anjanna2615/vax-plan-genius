
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bell, Mail, Phone, Calendar, CheckCircle, Clock } from 'lucide-react';
import { Patient, VaccineRecommendation } from '@/pages/Index';

interface ReminderPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  advanceDays: number;
  preferredTime: string;
  emailAddress: string;
  phoneNumber: string;
}

interface ScheduledReminder {
  id: string;
  vaccine: string;
  appointmentDate: string;
  reminderDate: string;
  type: 'email' | 'sms' | 'push';
  status: 'scheduled' | 'sent' | 'failed';
  priority: 'high' | 'medium' | 'low';
}

interface ReminderSystemProps {
  patient: Patient | null;
  recommendations: VaccineRecommendation[];
}

export const ReminderSystem: React.FC<ReminderSystemProps> = ({
  patient,
  recommendations
}) => {
  const [preferences, setPreferences] = useState<ReminderPreferences>({
    email: true,
    sms: false,
    push: true,
    advanceDays: 7,
    preferredTime: '09:00',
    emailAddress: '',
    phoneNumber: ''
  });

  const [scheduledReminders, setScheduledReminders] = useState<ScheduledReminder[]>([]);
  const [testReminderSent, setTestReminderSent] = useState(false);

  useEffect(() => {
    if (!patient || recommendations.length === 0) {
      setScheduledReminders([]);
      return;
    }

    const reminders = generateReminders(recommendations, preferences);
    setScheduledReminders(reminders);
  }, [patient, recommendations, preferences]);

  const generateReminders = (recs: VaccineRecommendation[], prefs: ReminderPreferences): ScheduledReminder[] => {
    const reminders: ScheduledReminder[] = [];

    recs.forEach((rec, index) => {
      const appointmentDate = new Date(rec.dueDate);
      const reminderDate = new Date(appointmentDate);
      reminderDate.setDate(reminderDate.getDate() - prefs.advanceDays);

      // Generate different types of reminders based on preferences
      const reminderTypes: ('email' | 'sms' | 'push')[] = [];
      if (prefs.email && prefs.emailAddress) reminderTypes.push('email');
      if (prefs.sms && prefs.phoneNumber) reminderTypes.push('sms');
      if (prefs.push) reminderTypes.push('push');

      reminderTypes.forEach(type => {
        reminders.push({
          id: `${rec.vaccine}-${type}-${index}`,
          vaccine: rec.vaccine,
          appointmentDate: rec.dueDate,
          reminderDate: reminderDate.toISOString().split('T')[0],
          type,
          status: reminderDate < new Date() ? 'sent' : 'scheduled',
          priority: rec.priority
        });
      });

      // Add follow-up reminder for high priority vaccines
      if (rec.priority === 'high') {
        const followUpDate = new Date(appointmentDate);
        followUpDate.setDate(followUpDate.getDate() - 1); // Day before
        
        reminderTypes.forEach(type => {
          reminders.push({
            id: `${rec.vaccine}-${type}-followup-${index}`,
            vaccine: `${rec.vaccine} (Final Reminder)`,
            appointmentDate: rec.dueDate,
            reminderDate: followUpDate.toISOString().split('T')[0],
            type,
            status: followUpDate < new Date() ? 'sent' : 'scheduled',
            priority: rec.priority
          });
        });
      }
    });

    return reminders.sort((a, b) => new Date(a.reminderDate).getTime() - new Date(b.reminderDate).getTime());
  };

  const sendTestReminder = () => {
    console.log('Sending test reminder with preferences:', preferences);
    
    // Simulate sending test reminder
    setTimeout(() => {
      setTestReminderSent(true);
      setTimeout(() => setTestReminderSent(false), 3000);
    }, 1000);
  };

  const getReminderTypeIcon = (type: 'email' | 'sms' | 'push') => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <Phone className="h-4 w-4" />;
      case 'push': return <Bell className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: 'scheduled' | 'sent' | 'failed') => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'sent': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
    }
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Reminder Preferences */}
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-6 w-6 mr-2 text-blue-600" />
            Reminder Preferences
          </CardTitle>
          <CardDescription>
            Configure how and when you want to receive vaccination reminders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">Contact Information</h4>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={preferences.emailAddress}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    emailAddress: e.target.value
                  })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={preferences.phoneNumber}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    phoneNumber: e.target.value
                  })}
                />
              </div>
            </div>

            {/* Reminder Settings */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">Reminder Settings</h4>
              <div>
                <Label htmlFor="advanceDays">Reminder Advance Notice</Label>
                <Select
                  value={preferences.advanceDays.toString()}
                  onValueChange={(value) => setPreferences({
                    ...preferences,
                    advanceDays: parseInt(value)
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day before</SelectItem>
                    <SelectItem value="3">3 days before</SelectItem>
                    <SelectItem value="7">1 week before</SelectItem>
                    <SelectItem value="14">2 weeks before</SelectItem>
                    <SelectItem value="30">1 month before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="time">Preferred Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={preferences.preferredTime}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    preferredTime: e.target.value
                  })}
                />
              </div>
            </div>
          </div>

          {/* Notification Methods */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Notification Methods</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Email Notifications</div>
                    <div className="text-sm text-gray-600">Receive detailed reminders via email</div>
                  </div>
                </div>
                <Switch
                  checked={preferences.email}
                  onCheckedChange={(checked) => setPreferences({
                    ...preferences,
                    email: checked
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium">SMS Notifications</div>
                    <div className="text-sm text-gray-600">Quick text message reminders</div>
                  </div>
                </div>
                <Switch
                  checked={preferences.sms}
                  onCheckedChange={(checked) => setPreferences({
                    ...preferences,
                    sms: checked
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="font-medium">Push Notifications</div>
                    <div className="text-sm text-gray-600">Browser/app notifications</div>
                  </div>
                </div>
                <Switch
                  checked={preferences.push}
                  onCheckedChange={(checked) => setPreferences({
                    ...preferences,
                    push: checked
                  })}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={sendTestReminder} variant="outline" className="flex-1">
              {testReminderSent ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  Test Sent!
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  Send Test Reminder
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Reminders */}
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-6 w-6 mr-2 text-green-600" />
            Scheduled Reminders
          </CardTitle>
          <CardDescription>
            Overview of all upcoming and sent vaccination reminders
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scheduledReminders.length > 0 ? (
            <div className="space-y-4">
              {scheduledReminders.map((reminder) => (
                <div key={reminder.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getReminderTypeIcon(reminder.type)}
                      <span className="text-sm font-medium capitalize">{reminder.type}</span>
                    </div>
                    <div>
                      <div className="font-medium">{reminder.vaccine}</div>
                      <div className="text-sm text-gray-600">
                        Reminder: {new Date(reminder.reminderDate).toLocaleDateString()} | 
                        Appointment: {new Date(reminder.appointmentDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getPriorityColor(reminder.priority)}>
                      {reminder.priority}
                    </Badge>
                    <Badge className={getStatusColor(reminder.status)}>
                      {reminder.status === 'scheduled' && <Clock className="h-3 w-3 mr-1" />}
                      {reminder.status === 'sent' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {reminder.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No reminders scheduled</p>
              <p className="text-sm mt-2">
                {!patient ? "Complete patient profile to set up reminders" : 
                 "Generate vaccination schedule to create automatic reminders"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reminder Statistics */}
      {scheduledReminders.length > 0 && (
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Reminder Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {scheduledReminders.filter(r => r.status === 'scheduled').length}
                </div>
                <div className="text-sm text-gray-600">Scheduled</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {scheduledReminders.filter(r => r.status === 'sent').length}
                </div>
                <div className="text-sm text-gray-600">Sent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {scheduledReminders.filter(r => r.priority === 'high').length}
                </div>
                <div className="text-sm text-gray-600">High Priority</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(scheduledReminders.map(r => r.vaccine)).size}
                </div>
                <div className="text-sm text-gray-600">Unique Vaccines</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
