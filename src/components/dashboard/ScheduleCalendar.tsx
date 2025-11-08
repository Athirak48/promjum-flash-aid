import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Clock, Edit2, Sparkles, BookOpen, MessageCircle, Headphones, Target, ChevronDown } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { TimePicker } from './TimePicker';
import { DurationPicker } from './DurationPicker';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { cn } from '@/lib/utils';
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
const activityTypes = [{
  value: 'vocabulary',
  label: 'ทบทวนคำศัพท์',
  icon: BookOpen,
  color: 'bg-blue-500/10 text-blue-600 border-blue-200'
}, {
  value: 'practice',
  label: 'ฝึกภาษาอังกฤษ',
  icon: MessageCircle,
  color: 'bg-purple-500/10 text-purple-600 border-purple-200'
}, {
  value: 'listening',
  label: 'ฟัง Podcast',
  icon: Headphones,
  color: 'bg-green-500/10 text-green-600 border-green-200'
}, {
  value: 'review',
  label: 'ทำแบบทดสอบ',
  icon: Target,
  color: 'bg-orange-500/10 text-orange-600 border-orange-200'
}];
type ViewMode = 'day' | 'week' | 'month' | 'year';
export function ScheduleCalendar() {
  const {
    toast
  } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const today = selectedDate;
  const weekDays = Array.from({
    length: 7
  }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - today.getDay() + i);
    return date;
  });

  // AI recommended schedule - can be customized by user
  const [schedules, setSchedules] = useState<DaySchedule[]>([{
    dayIndex: 1,
    // Monday
    activities: [{
      id: '1',
      type: 'vocabulary',
      time: '07:00',
      duration: 15,
      title: 'ทบทวนคำศัพท์เช้า',
      icon: BookOpen,
      color: 'bg-blue-500/10 text-blue-600 border-blue-200'
    }, {
      id: '2',
      type: 'practice',
      time: '12:30',
      duration: 20,
      title: 'ฝึกสนทนาพักเที่ยง',
      icon: MessageCircle,
      color: 'bg-purple-500/10 text-purple-600 border-purple-200'
    }]
  }, {
    dayIndex: 2,
    // Tuesday
    activities: [{
      id: '3',
      type: 'listening',
      time: '08:00',
      duration: 30,
      title: 'ฟัง Podcast',
      icon: Headphones,
      color: 'bg-green-500/10 text-green-600 border-green-200'
    }]
  }, {
    dayIndex: 3,
    // Wednesday
    activities: [{
      id: '4',
      type: 'vocabulary',
      time: '07:00',
      duration: 15,
      title: 'ทบทวนคำศัพท์',
      icon: BookOpen,
      color: 'bg-blue-500/10 text-blue-600 border-blue-200'
    }, {
      id: '5',
      type: 'review',
      time: '20:00',
      duration: 25,
      title: 'ทำแบบทดสอบ',
      icon: Target,
      color: 'bg-orange-500/10 text-orange-600 border-orange-200'
    }]
  }, {
    dayIndex: 4,
    // Thursday
    activities: [{
      id: '6',
      type: 'practice',
      time: '19:00',
      duration: 30,
      title: 'ฝึกพูดกับ AI',
      icon: MessageCircle,
      color: 'bg-purple-500/10 text-purple-600 border-purple-200'
    }]
  }, {
    dayIndex: 5,
    // Friday
    activities: [{
      id: '7',
      type: 'vocabulary',
      time: '07:00',
      duration: 15,
      title: 'ทบทวนคำศัพท์',
      icon: BookOpen,
      color: 'bg-blue-500/10 text-blue-600 border-blue-200'
    }, {
      id: '8',
      type: 'listening',
      time: '18:00',
      duration: 20,
      title: 'ฟังเพลงภาษาอังกฤษ',
      icon: Headphones,
      color: 'bg-green-500/10 text-green-600 border-green-200'
    }]
  }]);
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
        return prev.map(s => s.dayIndex === selectedDay ? {
          ...s,
          activities: [...s.activities, newActivity]
        } : s);
      } else {
        return [...prev, {
          dayIndex: selectedDay,
          activities: [newActivity]
        }];
      }
    });
    toast({
      title: "เพิ่มกิจกรรมสำเร็จ",
      description: "เพิ่มกิจกรรมใหม่ในตารางเวลาแล้ว"
    });
  };
  const handleRemoveActivity = (dayIndex: number, activityId: string) => {
    setSchedules(prev => prev.map(s => s.dayIndex === dayIndex ? {
      ...s,
      activities: s.activities.filter(a => a.id !== activityId)
    } : s));
    toast({
      title: "ลบกิจกรรมสำเร็จ",
      description: "ลบกิจกรรมออกจากตารางเวลาแล้ว"
    });
  };
  const handleUpdateActivityTime = (dayIndex: number, activityId: string, newTime: string) => {
    setSchedules(prev => prev.map(s => s.dayIndex === dayIndex ? {
      ...s,
      activities: s.activities.map(a => a.id === activityId ? {
        ...a,
        time: newTime
      } : a)
    } : s));
  };
  const handleUpdateActivityDuration = (dayIndex: number, activityId: string, newDuration: number) => {
    setSchedules(prev => prev.map(s => s.dayIndex === dayIndex ? {
      ...s,
      activities: s.activities.map(a => a.id === activityId ? {
        ...a,
        duration: newDuration
      } : a)
    } : s));
  };
  const handleUpdateActivityTitle = (dayIndex: number, activityId: string, newTitle: string) => {
    setSchedules(prev => prev.map(s => s.dayIndex === dayIndex ? {
      ...s,
      activities: s.activities.map(a => a.id === activityId ? {
        ...a,
        title: newTitle
      } : a)
    } : s));
  };
  return <Card className="bg-gradient-card backdrop-blur-sm shadow-soft border border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            
            <CardTitle className="flex items-center gap-2 text-xl">
              <CalendarIcon className="w-6 h-6 text-primary" />
              ตารางเวลาฝึกภาษา
            </CardTitle>
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "d MMM yyyy", {
                locale: th
              }) : <span>เลือกวันที่</span>}
                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar mode="single" selected={selectedDate} onSelect={date => date && setSelectedDate(date)} initialFocus className="pointer-events-auto" />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map((date, index) => {
          const daySchedule = getDaySchedule(index);
          const dayLabel = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'][index];
          const totalActivities = daySchedule?.activities.length || 0;
          return <div key={date.toDateString()} className={`
                  relative flex flex-col p-3 rounded-lg border transition-all cursor-pointer
                  ${isToday(date) ? 'bg-primary/20 border-primary shadow-soft ring-2 ring-primary/30' : 'bg-background/50 border-border/30 hover:bg-muted/30'}
                `} onClick={() => handleEditSchedule(index)}>
                <div className="text-xs text-muted-foreground mb-1">{dayLabel}</div>
                <div className={`
                  text-lg font-semibold mb-2
                  ${isToday(date) ? 'text-primary' : 'text-foreground'}
                `}>
                  {date.getDate()}
                </div>
                
                {totalActivities > 0 && <Badge variant="secondary" className="text-xs w-full justify-center">
                    {totalActivities} กิจกรรม
                  </Badge>}
                
                {isToday(date) && <div className="absolute top-1 right-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  </div>}
              </div>;
        })}
        </div>

        {/* View Mode Tabs */}
        <div className="mb-4">
          <Tabs value={viewMode} onValueChange={value => setViewMode(value as ViewMode)}>
            <TabsList className="grid w-full grid-cols-4 bg-muted/50">
              <TabsTrigger value="day" className="text-xs">วัน</TabsTrigger>
              <TabsTrigger value="week" className="text-xs">สัปดาห์</TabsTrigger>
              <TabsTrigger value="month" className="text-xs">เดือน</TabsTrigger>
              <TabsTrigger value="year" className="text-xs">ปี</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Schedule Details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">
              {viewMode === 'day' && 'กิจกรรมวันนี้'}
              {viewMode === 'week' && 'กิจกรรมสัปดาห์นี้'}
              {viewMode === 'month' && 'กิจกรรมเดือนนี้'}
              {viewMode === 'year' && 'สรุปรายปี'}
            </h4>
            <Button variant="ghost" size="sm" className="text-xs">
              ดูทั้งหมด
            </Button>
          </div>

          {/* Day View */}
          {viewMode === 'day' && <>
              {getDaySchedule(today.getDay())?.activities.map(activity => {
            const Icon = activity.icon;
            return <div key={activity.id} className={`
                      p-3 rounded-lg border flex items-center justify-between
                      ${activity.color}
                      hover:shadow-soft transition-all
                    `}>
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
                    <Button variant="ghost" size="sm" onClick={() => handleEditSchedule(today.getDay())}>
                      <Edit2 className="w-3 h-3" />
                    </Button>
                  </div>;
          }) || <div className="text-center py-8 text-muted-foreground text-sm">
                  ยังไม่มีกิจกรรมวันนี้
                </div>}
            </>}

          {/* Week View */}
          {viewMode === 'week' && schedules.slice(0, 3).map(schedule => {
          const date = weekDays[schedule.dayIndex];
          return <div key={schedule.dayIndex} className="space-y-2">
                <div className="text-xs text-muted-foreground font-medium">
                  {date.toLocaleDateString('th-TH', {
                weekday: 'long',
                day: 'numeric',
                month: 'short'
              })}
                </div>
                {schedule.activities.map(activity => {
              const Icon = activity.icon;
              return <div key={activity.id} className={`
                        p-3 rounded-lg border flex items-center justify-between
                        ${activity.color}
                        hover:shadow-soft transition-all
                      `}>
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
                      <Button variant="ghost" size="sm" onClick={() => handleEditSchedule(schedule.dayIndex)}>
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    </div>;
            })}
              </div>;
        })}

          {/* Month View */}
          {viewMode === 'month' && <div className="grid grid-cols-1 gap-3">
              {schedules.map(schedule => {
            const date = weekDays[schedule.dayIndex];
            const totalDuration = schedule.activities.reduce((sum, a) => sum + a.duration, 0);
            return <div key={schedule.dayIndex} className="p-4 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-sm">
                        {date.toLocaleDateString('th-TH', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short'
                  })}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {schedule.activities.length} กิจกรรม • {totalDuration}น
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {schedule.activities.map(activity => {
                  const Icon = activity.icon;
                  return <Badge key={activity.id} variant="outline" className="text-xs">
                            <Icon className="w-3 h-3 mr-1" />
                            {activity.time}
                          </Badge>;
                })}
                    </div>
                  </div>;
          })}
            </div>}

          {/* Year View */}
          {viewMode === 'year' && <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-200">
                  <div className="text-xs text-muted-foreground mb-1">ทบทวนคำศัพท์</div>
                  <div className="text-2xl font-bold text-blue-600">156</div>
                  <div className="text-xs text-muted-foreground">ครั้ง/ปี</div>
                </div>
                
                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-200">
                  <div className="text-xs text-muted-foreground mb-1">ฝึกภาษาอังกฤษ</div>
                  <div className="text-2xl font-bold text-purple-600">104</div>
                  <div className="text-xs text-muted-foreground">ครั้ง/ปี</div>
                </div>
                
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-200">
                  <div className="text-xs text-muted-foreground mb-1">ฟัง Podcast</div>
                  <div className="text-2xl font-bold text-green-600">78</div>
                  <div className="text-xs text-muted-foreground">ครั้ง/ปี</div>
                </div>
                
                <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-200">
                  <div className="text-xs text-muted-foreground mb-1">ทำแบบทดสอบ</div>
                  <div className="text-2xl font-bold text-orange-600">52</div>
                  <div className="text-xs text-muted-foreground">ครั้ง/ปี</div>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-border/50 bg-gradient-primary/10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-foreground">เวลาฝึกรวม</div>
                    <div className="text-xs text-muted-foreground">ตลอดทั้งปี</div>
                  </div>
                  <div className="text-3xl font-bold text-primary">97.5 ชม.</div>
                </div>
              </div>
            </div>}
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              แก้ไขตารางเวลา
              {selectedDay !== null && <span className="text-sm text-muted-foreground ml-2">
                  {weekDays[selectedDay]?.toLocaleDateString('th-TH', {
                weekday: 'long'
              })}
                </span>}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              {selectedDay !== null && getDaySchedule(selectedDay)?.activities.map(activity => {
              const Icon = activity.icon;
              return <div key={activity.id} className={`p-4 rounded-lg border ${activity.color}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-1">
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <Input value={activity.title} onChange={e => handleUpdateActivityTitle(selectedDay, activity.id, e.target.value)} className="font-medium text-sm h-8 bg-background/50" placeholder="ชื่อกิจกรรม" />
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveActivity(selectedDay, activity.id)}>
                        ลบ
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs mb-1.5 block text-center">เวลาทบทวน</Label>
                        <div className="flex justify-center p-2 bg-muted/20 rounded-lg border border-border/50">
                          <TimePicker value={activity.time} onChange={newTime => handleUpdateActivityTime(selectedDay, activity.id, newTime)} />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs mb-1.5 block text-center">ระยะเวลาทบทวน</Label>
                        <div className="flex justify-center p-2 bg-muted/20 rounded-lg border border-border/50">
                          <DurationPicker value={activity.duration} onChange={newDuration => handleUpdateActivityDuration(selectedDay, activity.id, newDuration)} />
                        </div>
                      </div>
                    </div>
                  </div>;
            })}

              <Button variant="outline" className="w-full" onClick={handleAddActivity}>
                + เพิ่มกิจกรรม
              </Button>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)} className="w-full">
              ตกลง
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>;
}