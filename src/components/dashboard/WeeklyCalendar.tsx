import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle2 } from 'lucide-react';

export function WeeklyCalendar() {
  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - today.getDay() + i);
    return date;
  });

  // Mock activity data - in real app, fetch from backend
  const activityData: { [key: string]: { completed: boolean; count: number } } = {
    [weekDays[1].toDateString()]: { completed: true, count: 2 },
    [weekDays[2].toDateString()]: { completed: true, count: 1 },
    [weekDays[4].toDateString()]: { completed: true, count: 3 },
  };

  const isToday = (date: Date) => date.toDateString() === today.toDateString();
  
  return (
    <Card className="bg-gradient-card backdrop-blur-sm shadow-soft border border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Calendar className="w-6 h-6 text-primary" />
          สัปดาห์นี้
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((date, index) => {
            const dateStr = date.toDateString();
            const activity = activityData[dateStr];
            const dayLabel = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'][index];
            
            return (
              <div 
                key={dateStr}
                className={`
                  flex flex-col items-center p-3 rounded-lg border transition-all
                  ${isToday(date) 
                    ? 'bg-primary/20 border-primary shadow-soft' 
                    : activity?.completed 
                      ? 'bg-muted/50 border-border/50' 
                      : 'bg-background/50 border-border/30'
                  }
                `}
              >
                <div className="text-xs text-muted-foreground mb-1">{dayLabel}</div>
                <div className={`
                  text-lg font-semibold mb-2
                  ${isToday(date) ? 'text-primary' : 'text-foreground'}
                `}>
                  {date.getDate()}
                </div>
                
                {activity?.completed && (
                  <div className="flex flex-col items-center gap-1">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <Badge variant="secondary" className="text-xs">
                      {activity.count} Deck
                    </Badge>
                  </div>
                )}
                
                {isToday(date) && !activity && (
                  <div className="text-xs text-primary font-medium">วันนี้</div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/30">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">สัปดาห์นี้</span>
            <span className="font-semibold text-foreground">
              {Object.values(activityData).reduce((sum, a) => sum + a.count, 0)} Deck เสร็จแล้ว
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
