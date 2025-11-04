import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Edit2, Sparkles, BookOpen, MessageCircle, Headphones, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Activity {
  id: string;
  type: 'vocabulary' | 'practice' | 'listening' | 'review';
  time: string;
  duration: number; // minutes
  title: string;
  icon: any;
  color: string;
}

interface DaySchedule {
  dayIndex: number;
  activities: Activity[];
}

const activityTypes = [
  { value: 'vocabulary', label: 'ทบทวนคำศัพท์', icon: BookOpen, color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  { value: 'practice', label: 'ฝึกภาษาอังกฤษ', icon: MessageCircle, color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
  { value: 'listening', label: 'ฟัง Podcast', icon: Headphones, color: 'bg-green-500/10 text-green-600 border-green-200' },
  { value: 'review', label: 'ทำแบบทดสอบ', icon: Target, color: 'bg-orange-500/10 text-orange-600 border-orange-200' },
];

export function ScheduleCalendar() {
  const { toast } = useToast();
  const today = new Date();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - today.getDay() + i);
    return date;
  });

  // AI recommended schedule - can be customized by user
  const [schedules, setSchedules] = useState<DaySchedule[]>([
    {
      dayIndex: 1, // Monday
      activities: [
        { id: '1', type: 'vocabulary', time: '07:00', duration: 15, title: 'ทบทวนคำศัพท์เช้า', icon: BookOpen, color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
        { id: '2', type: 'practice', time: '12:30', duration: 20, title: 'ฝึกสนทนาพักเที่ยง', icon: MessageCircle, color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
      ]
    },
    {
      dayIndex: 2, // Tuesday
      activities: [
        { id: '3', type: 'listening', time: '08:00', duration: 30, title: 'ฟัง Podcast', icon: Headphones, color: 'bg-green-500/10 text-green-600 border-green-200' },
      ]
    },
    {
      dayIndex: 3, // Wednesday
      activities: [
        { id: '4', type: 'vocabulary', time: '07:00', duration: 15, title: 'ทบทวนคำศัพท์', icon: BookOpen, color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
        { id: '5', type: 'review', time: '20:00', duration: 25, title: 'ทำแบบทดสอบ', icon: Target, color: 'bg-orange-500/10 text-orange-600 border-orange-200' },
      ]
    },
    {
      dayIndex: 4, // Thursday
      activities: [
        { id: '6', type: 'practice', time: '19:00', duration: 30, title: 'ฝึกพูดกับ AI', icon: MessageCircle, color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
      ]
    },
    {
      dayIndex: 5, // Friday
      activities: [
        { id: '7', type: 'vocabulary', time: '07:00', duration: 15, title: 'ทบทวนคำศัพท์', icon: BookOpen, color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
        { id: '8', type: 'listening', time: '18:00', duration: 20, title: 'ฟังเพลงภาษาอังกฤษ', icon: Headphones, color: 'bg-green-500/10 text-green-600 border-green-200' },
      ]
    },
  ]);

  const isToday = (date: Date) => date.toDateString() === today.toDateString();

  const getDaySchedule = (dayIndex: number) => {
    return schedules.find(s => s.dayIndex === dayIndex);
  };

  const handleEditSchedule = (dayIndex: number) => {
    setSelectedDay(dayIndex);
    setIsDialogOpen(true);
  };

  const handleAddActivity = () => {
    if (selectedDay === null) return;

    const newActivity: Activity = {
      id: Date.now().toString(),
      type: 'vocabulary',
      time: '09:00',
      duration: 15,
      title: 'กิจกรรมใหม่',
      icon: BookOpen,
      color: 'bg-blue-500/10 text-blue-600 border-blue-200'
    };

    setSchedules(prev => {
      const existingSchedule = prev.find(s => s.dayIndex === selectedDay);
      if (existingSchedule) {
        return prev.map(s => 
          s.dayIndex === selectedDay 
            ? { ...s, activities: [...s.activities, newActivity] }
            : s
        );
      } else {
        return [...prev, { dayIndex: selectedDay, activities: [newActivity] }];
      }
    });

    toast({
      title: "เพิ่มกิจกรรมสำเร็จ",
      description: "เพิ่มกิจกรรมใหม่ในตารางเวลาแล้ว",
    });
  };

  const handleRemoveActivity = (dayIndex: number, activityId: string) => {
    setSchedules(prev => prev.map(s => 
      s.dayIndex === dayIndex 
        ? { ...s, activities: s.activities.filter(a => a.id !== activityId) }
        : s
    ));

    toast({
      title: "ลบกิจกรรมสำเร็จ",
      description: "ลบกิจกรรมออกจากตารางเวลาแล้ว",
    });
  };

  return (
    <Card className="bg-gradient-card backdrop-blur-sm shadow-soft border border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Calendar className="w-6 h-6 text-primary" />
            ตารางเวลาฝึกภาษา
          </CardTitle>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI แนะนำ
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map((date, index) => {
            const daySchedule = getDaySchedule(index);
            const dayLabel = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'][index];
            const totalActivities = daySchedule?.activities.length || 0;
            
            return (
              <div 
                key={date.toDateString()}
                className={`
                  relative flex flex-col p-3 rounded-lg border transition-all cursor-pointer
                  ${isToday(date) 
                    ? 'bg-primary/20 border-primary shadow-soft ring-2 ring-primary/30' 
                    : 'bg-background/50 border-border/30 hover:bg-muted/30'
                  }
                `}
                onClick={() => handleEditSchedule(index)}
              >
                <div className="text-xs text-muted-foreground mb-1">{dayLabel}</div>
                <div className={`
                  text-lg font-semibold mb-2
                  ${isToday(date) ? 'text-primary' : 'text-foreground'}
                `}>
                  {date.getDate()}
                </div>
                
                {totalActivities > 0 && (
                  <Badge variant="secondary" className="text-xs w-full justify-center">
                    {totalActivities} กิจกรรม
                  </Badge>
                )}
                
                {isToday(date) && (
                  <div className="absolute top-1 right-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Schedule Details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">กิจกรรมสัปดาห์นี้</h4>
            <Button variant="ghost" size="sm" className="text-xs">
              ดูทั้งหมด
            </Button>
          </div>

          {schedules.slice(0, 3).map(schedule => {
            const date = weekDays[schedule.dayIndex];
            return (
              <div key={schedule.dayIndex} className="space-y-2">
                <div className="text-xs text-muted-foreground font-medium">
                  {date.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'short' })}
                </div>
                {schedule.activities.map(activity => {
                  const Icon = activity.icon;
                  return (
                    <div 
                      key={activity.id}
                      className={`
                        p-3 rounded-lg border flex items-center justify-between
                        ${activity.color}
                        hover:shadow-soft transition-all
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-background/50">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{activity.title}</div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {activity.time} • {activity.duration} นาที
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditSchedule(schedule.dayIndex)}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              แก้ไขตารางเวลา
              {selectedDay !== null && (
                <span className="text-sm text-muted-foreground ml-2">
                  {weekDays[selectedDay]?.toLocaleDateString('th-TH', { weekday: 'long' })}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedDay !== null && getDaySchedule(selectedDay)?.activities.map(activity => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className={`p-4 rounded-lg border ${activity.color}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="font-medium text-sm">{activity.title}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRemoveActivity(selectedDay, activity.id)}
                    >
                      ลบ
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">เวลา</Label>
                      <Select defaultValue={activity.time}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="07:00">07:00</SelectItem>
                          <SelectItem value="08:00">08:00</SelectItem>
                          <SelectItem value="12:30">12:30</SelectItem>
                          <SelectItem value="18:00">18:00</SelectItem>
                          <SelectItem value="19:00">19:00</SelectItem>
                          <SelectItem value="20:00">20:00</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">ระยะเวลา (นาที)</Label>
                      <Select defaultValue={activity.duration.toString()}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 นาที</SelectItem>
                          <SelectItem value="20">20 นาที</SelectItem>
                          <SelectItem value="25">25 นาที</SelectItem>
                          <SelectItem value="30">30 นาที</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              );
            })}

            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleAddActivity}
            >
              + เพิ่มกิจกรรม
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
