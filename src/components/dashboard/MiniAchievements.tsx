import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Flame, Zap, Target } from 'lucide-react';

interface Achievement {
  id: string;
  icon: any;
  title: string;
  description: string;
  unlocked: boolean;
  progress?: number;
  total?: number;
}

export function MiniAchievements() {
  const achievements: Achievement[] = [
    {
      id: '1',
      icon: Flame,
      title: '7 วันติดต่อกัน',
      description: 'ฝึกต่อเนื่อง 7 วัน',
      unlocked: false,
      progress: 1,
      total: 7,
    },
    {
      id: '2',
      icon: Star,
      title: 'Deck Master',
      description: 'จบ Deck แรก 100%',
      unlocked: false,
      progress: 0,
      total: 1,
    },
    {
      id: '3',
      icon: Zap,
      title: 'Speed Learner',
      description: 'ฝึก 50 คำใน 1 วัน',
      unlocked: false,
      progress: 0,
      total: 50,
    },
    {
      id: '4',
      icon: Target,
      title: 'Perfect Score',
      description: 'ได้ 100% ใน Quiz',
      unlocked: false,
      progress: 0,
      total: 1,
    },
  ];

  return (
    <Card className="bg-gradient-card backdrop-blur-sm shadow-soft border border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Trophy className="w-6 h-6 text-primary" />
          ความสำเร็จ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {achievements.map((achievement) => {
          const Icon = achievement.icon;
          const progressPercent = achievement.progress && achievement.total 
            ? (achievement.progress / achievement.total) * 100 
            : 0;

          return (
            <div 
              key={achievement.id}
              className={`
                p-4 rounded-lg border transition-all
                ${achievement.unlocked 
                  ? 'bg-primary/10 border-primary/30 shadow-soft' 
                  : 'bg-muted/20 border-border/30'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`
                  p-2 rounded-lg
                  ${achievement.unlocked ? 'bg-primary/20' : 'bg-muted/30'}
                `}>
                  <Icon className={`
                    w-5 h-5
                    ${achievement.unlocked ? 'text-primary' : 'text-muted-foreground'}
                  `} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`
                      font-semibold text-sm
                      ${achievement.unlocked ? 'text-primary' : 'text-foreground'}
                    `}>
                      {achievement.title}
                    </h4>
                    {achievement.unlocked && (
                      <Badge variant="secondary" className="text-xs bg-primary/20 text-primary">
                        ปลดล็อกแล้ว
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2">
                    {achievement.description}
                  </p>
                  
                  {!achievement.unlocked && achievement.progress !== undefined && achievement.total && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-primary transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {achievement.progress}/{achievement.total}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
