import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, BookOpen, Layers } from "lucide-react";

interface ProgressOverviewProps {
  streak: number;
  wordsLearned: number;
  totalWords: number;
  subdecksCompleted: number;
  totalSubdecks: number;
}

export function ProgressOverview({ 
  streak, 
  wordsLearned, 
  totalWords, 
  subdecksCompleted, 
  totalSubdecks 
}: ProgressOverviewProps) {
  const vocabularyProgress = (wordsLearned / totalWords) * 100;
  const subdeckProgress = (subdecksCompleted / totalSubdecks) * 100;

  return (
    <Card className="bg-gradient-card backdrop-blur-sm border-border/50 shadow-soft">
      <CardHeader>
        <CardTitle className="text-lg">ภาพรวมความก้าวหน้า</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Streak */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-foreground">Streak</span>
              </div>
              <span className="text-2xl font-bold text-primary">{streak}</span>
            </div>
            <p className="text-xs text-muted-foreground">วันติดต่อกัน</p>
            <Progress value={(streak / 30) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground text-right">เป้าหมาย: 30 วัน</p>
          </div>

          {/* Vocabulary */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-foreground">คำศัพท์</span>
              </div>
              <span className="text-2xl font-bold text-primary">{wordsLearned}</span>
            </div>
            <p className="text-xs text-muted-foreground">คำที่เรียนแล้ว</p>
            <Progress value={vocabularyProgress} className="h-2" />
            <p className="text-xs text-muted-foreground text-right">
              {wordsLearned} / {totalWords} คำ
            </p>
          </div>

          {/* Subdeck */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-foreground">Subdeck</span>
              </div>
              <span className="text-2xl font-bold text-primary">{subdecksCompleted}</span>
            </div>
            <p className="text-xs text-muted-foreground">จบแล้ว</p>
            <Progress value={subdeckProgress} className="h-2" />
            <p className="text-xs text-muted-foreground text-right">
              {subdecksCompleted} / {totalSubdecks} Subdeck
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
