import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, Calendar, BookOpen, TrendingUp, CheckCircle2 } from 'lucide-react';
import type { StudyGoal } from '@/types/goals';

interface GoalProgressCardProps {
    goal: StudyGoal;
    onStartSession?: () => void;
}

export function GoalProgressCard({ goal, onStartSession }: GoalProgressCardProps) {
    const progress = (goal.words_learned / goal.target_words) * 100;
    const sessionsToday = goal.sessions_completed % goal.sessions_per_day;
    const daysElapsed = goal.current_day - 1;
    const daysRemaining = goal.duration_days - daysElapsed;

    const isOnTrack = goal.words_learned >= (goal.target_words / goal.duration_days) * daysElapsed;

    return (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        <span className="text-lg">{goal.goal_name}</span>
                    </div>
                    {isOnTrack && (
                        <span className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-1 rounded-full flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            On track
                        </span>
                    )}
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Overall Progress */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">ความก้าวหน้า</span>
                        <span className="font-bold">
                            {goal.words_learned} / {goal.target_words} คำ ({Math.round(progress)}%)
                        </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                    {/* Today's Sessions */}
                    <div className="space-y-1 p-3 bg-background rounded-lg border">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>วันนี้</span>
                        </div>
                        <p className="text-xl font-bold">
                            {sessionsToday}/{goal.sessions_per_day}
                        </p>
                        <p className="text-xs text-muted-foreground">ครั้ง</p>
                    </div>

                    {/* Days Remaining */}
                    <div className="space-y-1 p-3 bg-background rounded-lg border">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>เหลือ</span>
                        </div>
                        <p className="text-xl font-bold">{daysRemaining}</p>
                        <p className="text-xs text-muted-foreground">วัน</p>
                    </div>

                    {/* Words per Session */}
                    <div className="space-y-1 p-3 bg-background rounded-lg border">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <BookOpen className="h-3 w-3" />
                            <span>ครั้งละ</span>
                        </div>
                        <p className="text-xl font-bold">{goal.words_per_session}</p>
                        <p className="text-xs text-muted-foreground">คำ</p>
                    </div>
                </div>

                {/* Action Button */}
                <Button
                    className="w-full"
                    size="lg"
                    onClick={onStartSession}
                    disabled={sessionsToday >= goal.sessions_per_day}
                >
                    {sessionsToday >= goal.sessions_per_day ? (
                        <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            ทำครบวันนี้แล้ว! 🎉
                        </>
                    ) : (
                        <>
                            <Target className="mr-2 h-4 w-4" />
                            เริ่มครั้งที่ {sessionsToday + 1}
                        </>
                    )}
                </Button>

                {/* Next session reminder */}
                {sessionsToday < goal.sessions_per_day && (
                    <p className="text-xs text-center text-muted-foreground">
                        เหลืออีก {goal.sessions_per_day - sessionsToday} ครั้งวันนี้ •
                        ครั้งละ ~10 นาที
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
