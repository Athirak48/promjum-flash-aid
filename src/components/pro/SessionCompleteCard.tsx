import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Trophy, TrendingUp, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SessionCompleteCardProps {
    cardsCompleted: number;
    correctCount: number;
    accuracy: number;
    timeSpent: number;
    goalProgress?: {
        wordsLearned: number;
        targetWords: number;
        sessionsToday: number;
        sessionsPerDay: number;
        isCompleteToday: boolean;
        isGoalComplete: boolean;
    };
}

export function SessionCompleteCard({
    cardsCompleted,
    correctCount,
    accuracy,
    timeSpent,
    goalProgress
}: SessionCompleteCardProps) {
    const navigate = useNavigate();

    return (
        <Card className="max-w-md mx-auto border-2 border-primary/20">
            <CardHeader>
                <CardTitle className="text-center">
                    {goalProgress?.isGoalComplete ? (
                        <div className="space-y-2">
                            <Trophy className="h-12 w-12 text-yellow-500 mx-auto" />
                            <h2 className="text-2xl font-bold">🎉 เป้าหมายสำเร็จ!</h2>
                        </div>
                    ) : goalProgress?.isCompleteToday ? (
                        <div className="space-y-2">
                            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                            <h2 className="text-2xl font-bold">✅ ทำครบวันนี้แล้ว!</h2>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
                            <h2 className="text-2xl font-bold">Session เสร็จสิ้น</h2>
                        </div>
                    )}
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Session Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">คำที่ทำ</p>
                        <p className="text-3xl font-bold">{cardsCompleted}</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">ถูกต้อง</p>
                        <p className="text-3xl font-bold text-green-500">{correctCount}</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">ความแม่นยำ</p>
                        <p className="text-3xl font-bold">{Math.round(accuracy)}%</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">เวลา</p>
                        <p className="text-3xl font-bold">{Math.round(timeSpent / 60)}</p>
                        <p className="text-xs text-muted-foreground">นาที</p>
                    </div>
                </div>

                {/* Goal Progress (if active goal) */}
                {goalProgress && (
                    <div className="space-y-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            <span>ความก้าวหน้าเป้าหมาย</span>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">คำที่จำได้</span>
                                <span className="font-bold">
                                    {goalProgress.wordsLearned}/{goalProgress.targetWords}
                                </span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">วันนี้</span>
                                <span className="font-bold">
                                    {goalProgress.sessionsToday}/{goalProgress.sessionsPerDay} ครั้ง
                                </span>
                            </div>
                        </div>

                        {!goalProgress.isGoalComplete && !goalProgress.isCompleteToday && (
                            <p className="text-xs text-muted-foreground text-center pt-2">
                                เหลืออีก {goalProgress.sessionsPerDay - goalProgress.sessionsToday} ครั้งวันนี้
                            </p>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2">
                    <Button
                        onClick={() => navigate('/dashboard')}
                        className="w-full"
                        size="lg"
                    >
                        {goalProgress?.isGoalComplete ? (
                            <>
                                <Calendar className="mr-2 h-4 w-4" />
                                กลับหน้าหลัก
                            </>
                        ) : (
                            <>
                                <Calendar className="mr-2 h-4 w-4" />
                                กลับ Dashboard
                            </>
                        )}
                    </Button>

                    {goalProgress && !goalProgress.isCompleteToday && !goalProgress.isGoalComplete && (
                        <Button
                            onClick={() => window.location.reload()}
                            variant="outline"
                            className="w-full"
                        >
                            ทำครั้งต่อไป
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
