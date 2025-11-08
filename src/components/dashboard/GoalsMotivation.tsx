import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, Trophy, Zap } from "lucide-react";

export function GoalsMotivation() {
  const goals = [
    {
      id: 1,
      title: "เรียนครบ 7 วัน",
      icon: Target,
      current: 1,
      target: 7,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      id: 2,
      title: "คำศัพท์ 1000 คำ",
      icon: Trophy,
      current: 20,
      target: 1000,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    },
    {
      id: 3,
      title: "จบ Subdeck 10 ชุด",
      icon: Zap,
      current: 0,
      target: 10,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    }
  ];

  return (
    <Card className="bg-gradient-card backdrop-blur-sm border-border/50 shadow-soft">
      <CardHeader>
        <CardTitle className="text-lg">เป้าหมายการเรียน</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const Icon = goal.icon;
            const progress = (goal.current / goal.target) * 100;
            
            return (
              <div key={goal.id} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${goal.bgColor}`}>
                    <Icon className={`h-6 w-6 ${goal.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{goal.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {goal.current} / {goal.target}
                    </p>
                  </div>
                </div>
                
                <Progress value={progress} className="h-3" />
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{Math.round(progress)}% เสร็จสมบูรณ์</span>
                  {progress === 100 && (
                    <span className="text-primary font-semibold animate-pulse">✨ สำเร็จ!</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
