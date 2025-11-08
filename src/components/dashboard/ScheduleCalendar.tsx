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
import { Calendar as CalendarIcon, Clock, Edit2, Sparkles, BookOpen, MessageCircle, Headphones, Target, ChevronDown, Bell, CheckCircle } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { TimePicker } from './TimePicker';
import { DurationPicker } from './DurationPicker';
import { DatePicker } from './DatePicker';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useFlashcards } from '@/hooks/useFlashcards';
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
  const { toast } = useToast();
  const { flashcards } = useFlashcards();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewDate, setReviewDate] = useState<Date>(new Date());
  const [reviewTime, setReviewTime] = useState<string>('09:00');
  const [selectedVocabulary, setSelectedVocabulary] = useState<string[]>([]);
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

  // Get all days in the current month for calendar view
  const getMonthDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days in the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
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
          
          <div className="flex items-center gap-2">
            <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Bell className="h-4 w-4 mr-2" />
                  ตั้งเวลาทวน
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">⏰ ตั้งเวลาทบทวนคำศัพท์</DialogTitle>
                </DialogHeader>
                
                <div className="grid grid-cols-2 gap-6 py-4">
                  {/* ฝั่งซ้าย: คำศัพท์ทบทวน */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">คำศัพท์ทบทวน</Label>
                    <ScrollArea className="h-[320px] rounded-lg border border-border/50 bg-muted/20 p-3">
                      {flashcards.length > 0 ? (
                        <div className="space-y-2">
                          {flashcards.slice(0, 20).map((card) => (
                            <div
                              key={card.id}
                              onClick={() => {
                                setSelectedVocabulary(prev => 
                                  prev.includes(card.id) 
                                    ? prev.filter(id => id !== card.id)
                                    : [...prev, card.id]
                                );
                              }}
                              className={cn(
                                "p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-soft",
                                selectedVocabulary.includes(card.id)
                                  ? "border-primary bg-primary/10"
                                  : "border-border/30 bg-background hover:border-primary/50"
                              )}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-sm truncate">{card.front_text}</div>
                                  <div className="text-xs text-muted-foreground truncate mt-1">{card.back_text}</div>
                                </div>
                                {selectedVocabulary.includes(card.id) && (
                                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center py-8">
                          <BookOpen className="w-12 h-12 text-muted-foreground/50 mb-3" />
                          <p className="text-sm text-muted-foreground">ยังไม่มีคำศัพท์</p>
                          <p className="text-xs text-muted-foreground/70 mt-1">เพิ่มคำศัพท์เพื่อเริ่มทบทวน</p>
                        </div>
                      )}
                    </ScrollArea>
                    <p className="text-xs text-muted-foreground">
                      เลือกแล้ว: {selectedVocabulary.length} คำศัพท์
                    </p>
                  </div>

                  {/* ฝั่งขวา: ตั้งวันและเวลา */}
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">เลือกวันที่</Label>
                      <div className="flex justify-center p-4 rounded-lg border border-border/50 bg-gradient-to-br from-primary/5 to-accent/5">
                        <DatePicker 
                          value={reviewDate} 
                          onChange={setReviewDate}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-semibold">เลือกเวลา</Label>
                      <div className="flex justify-center p-4 rounded-lg border border-border/50 bg-gradient-to-br from-accent/5 to-primary/5">
                        <TimePicker 
                          value={reviewTime} 
                          onChange={setReviewTime}
                        />
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="p-4 rounded-lg bg-primary/10 border-2 border-primary/20 space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                        <Bell className="w-4 h-4" />
                        <span>สรุปการตั้งเวลา</span>
                      </div>
                      <div className="text-sm space-y-1">
                        <p className="text-foreground">
                          📅 {reviewDate.toLocaleDateString('th-TH', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </p>
                        <p className="text-foreground">🕐 {reviewTime} น.</p>
                        <p className="text-muted-foreground">
                          📚 {selectedVocabulary.length} คำศัพท์ที่เลือก
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsReviewDialogOpen(false);
                      setSelectedVocabulary([]);
                    }}
                    className="w-full sm:w-auto"
                  >
                    ยกเลิก
                  </Button>
                  <Button 
                    onClick={() => {
                      toast({
                        title: "✅ ตั้งเวลาทบทวนสำเร็จ",
                        description: `จะแจ้งเตือนในวันที่ ${reviewDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} เวลา ${reviewTime} น.`
                      });
                      setIsReviewDialogOpen(false);
                      setSelectedVocabulary([]);
                    }}
                    className="w-full sm:w-auto"
                    disabled={selectedVocabulary.length === 0}
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    ตั้งเวลาทบทวน
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
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
          {viewMode === 'month' && <div className="space-y-4">
              {/* เดือน/ปี Header */}
              <div className="flex items-center justify-between px-2">
                <h3 className="text-lg font-bold text-foreground">
                  {selectedDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setMonth(newDate.getMonth() - 1);
                      setSelectedDate(newDate);
                    }}
                  >
                    ←
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setMonth(newDate.getMonth() + 1);
                      setSelectedDate(newDate);
                    }}
                  >
                    →
                  </Button>
                </div>
              </div>

              {/* Header วันในสัปดาห์ */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day, index) => (
                  <div 
                    key={day} 
                    className={`text-center text-xs font-bold py-2 rounded-md ${
                      index === 0 || index === 6 ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>
              
              {/* ตารางวันที่ */}
              <div className="grid grid-cols-7 gap-1">
                {getMonthDays().map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="aspect-square min-h-[80px]" />;
                  }
                  
                  const daySchedule = getDaySchedule(date.getDay());
                  const isCurrentDay = isToday(date);
                  const hasActivities = daySchedule && daySchedule.activities.length > 0;
                  const totalActivities = daySchedule?.activities.length || 0;
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  
                  return (
                    <div
                      key={date.toDateString()}
                      className={`
                        relative min-h-[80px] p-2 rounded-lg border-2 transition-all duration-200 cursor-pointer
                        hover:shadow-soft hover:scale-[1.02] hover:z-10
                        ${isCurrentDay 
                          ? 'bg-primary/10 border-primary shadow-sm ring-2 ring-primary/20' 
                          : hasActivities 
                          ? 'bg-accent/10 border-accent/50 hover:bg-accent/20' 
                          : 'bg-background border-border/30 hover:bg-muted/20'}
                      `}
                      onClick={() => handleEditSchedule(date.getDay())}
                    >
                      {/* วันที่ */}
                      <div className="flex items-center justify-between mb-1">
                        <div className={`
                          text-sm font-bold
                          ${isCurrentDay ? 'text-primary' : isWeekend ? 'text-primary/70' : 'text-foreground'}
                        `}>
                          {date.getDate()}
                        </div>
                        
                        {isCurrentDay && (
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        )}
                      </div>
                      
                      {/* กิจกรรม */}
                      {hasActivities && (
                        <div className="space-y-1">
                          {daySchedule!.activities.slice(0, 3).map((activity) => {
                            const Icon = activity.icon;
                            return (
                              <div 
                                key={activity.id} 
                                className={`
                                  text-xs px-1.5 py-1 rounded-md border
                                  ${activity.color}
                                  flex items-center gap-1.5 truncate
                                  hover:scale-105 transition-transform
                                `}
                              >
                                <Icon className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate font-medium" style={{ fontSize: '10px' }}>
                                  {activity.time}
                                </span>
                              </div>
                            );
                          })}
                          {totalActivities > 3 && (
                            <div className="text-[10px] text-center font-semibold text-primary bg-primary/10 rounded px-1 py-0.5">
                              +{totalActivities - 3} กิจกรรม
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Empty state hint */}
                      {!hasActivities && !isCurrentDay && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <div className="text-xs text-muted-foreground">+</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Legend */}
              <div className="flex flex-wrap gap-3 pt-3 border-t border-border/30">
                {activityTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <div key={type.value} className="flex items-center gap-1.5">
                      <div className={`p-1 rounded ${type.color}`}>
                        <Icon className="w-3 h-3" />
                      </div>
                      <span className="text-xs text-muted-foreground">{type.label}</span>
                    </div>
                  );
                })}
              </div>
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