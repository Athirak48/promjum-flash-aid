import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { Flame, Star, BookOpen, Play } from 'lucide-react';

interface DailyDeckQuickStartProps {
  streak?: number;
  totalXP?: number;
  wordsLearnedToday?: number;
}

export function DailyDeckQuickStart({ 
  streak = 0, 
  totalXP = 0, 
  wordsLearnedToday = 0 
}: DailyDeckQuickStartProps) {
  const navigate = useNavigate();

  return (
    <Card className="bg-gradient-primary/10 backdrop-blur-sm shadow-glow border border-primary/30 hover:shadow-large transition-all h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-3 rounded-xl bg-primary/20 shadow-soft">
            <Flame className="w-8 h-8 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              ความก้าวหน้าต่อเนื่อง
            </div>
            <div className="text-sm text-muted-foreground font-normal mt-1">
              สถิติการเรียนของคุณวันนี้
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* Streak */}
          <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-500/30">
            <div className="flex flex-col items-center gap-2">
              <Flame className="w-8 h-8 text-orange-500" />
              <div className="text-3xl font-bold text-foreground">{streak}</div>
              <div className="text-xs text-muted-foreground text-center">วันติดต่อกัน</div>
            </div>
          </div>

          {/* Total XP */}
          <div className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-xl p-4 border border-yellow-500/30">
            <div className="flex flex-col items-center gap-2">
              <Star className="w-8 h-8 text-yellow-500" />
              <div className="text-3xl font-bold text-foreground">{totalXP.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground text-center">XP ทั้งหมด</div>
            </div>
          </div>

          {/* Words Today */}
          <div className="bg-gradient-to-br from-primary/20 to-primary/30 rounded-xl p-4 border border-primary/40">
            <div className="flex flex-col items-center gap-2">
              <BookOpen className="w-8 h-8 text-primary" />
              <div className="text-3xl font-bold text-foreground">{wordsLearnedToday}</div>
              <div className="text-xs text-muted-foreground text-center">คำวันนี้</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">เป้าหมายวันนี้</span>
            <span className="font-bold text-primary">{wordsLearnedToday}/50 คำ</span>
          </div>
          <Progress value={(wordsLearnedToday / 50) * 100} className="h-3" />
        </div>

        {/* Review Button */}
        <Button 
          onClick={() => navigate('/decks')}
          className="w-full bg-gradient-primary hover:shadow-glow transition-all text-lg py-6"
          size="lg"
        >
          <Play className="w-5 h-5 mr-2" />
          ทบทวนทันที
        </Button>
      </CardContent>
    </Card>
  );
}
