import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Flame, Star, TrendingUp, Target } from 'lucide-react';

interface StreakProgressProps {
  streak?: number;
  starlightScore?: number;
  decksCompleted?: number;
  wordsLearned?: number;
}

export function StreakProgress({ 
  streak = 0, 
  starlightScore = 0, 
  decksCompleted = 0,
  wordsLearned = 0 
}: StreakProgressProps) {
  const maxScore = 1000;
  const scorePercentage = (starlightScore / maxScore) * 100;

  return (
    <Card className="bg-gradient-card backdrop-blur-sm shadow-soft border border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <TrendingUp className="w-6 h-6 text-primary" />
          ความก้าวหน้าของคุณ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Streak */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-primary/10 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/20">
              <Flame className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">{streak}</div>
              <div className="text-sm text-muted-foreground">วันติดต่อกัน</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">เป้าหมาย</div>
            <div className="text-sm font-semibold text-foreground">7 วัน 🎯</div>
          </div>
        </div>

        {/* Starlight Score */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Starlight Score</span>
            </div>
            <span className="text-lg font-bold text-primary">{starlightScore}/{maxScore}</span>
          </div>
          <Progress value={scorePercentage} className="h-3" />
        </div>

        {/* Daily Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Deck วันนี้</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{decksCompleted}</div>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">คำศัพท์วันนี้</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{wordsLearned}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
