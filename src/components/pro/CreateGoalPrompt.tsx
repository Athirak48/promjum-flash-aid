import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Sparkles, TrendingUp } from 'lucide-react';

interface CreateGoalPromptProps {
    onCreateGoal: () => void;
}

export function CreateGoalPrompt({ onCreateGoal }: CreateGoalPromptProps) {
    return (
        <Card className="border-0 bg-white dark:bg-zinc-900 shadow-xl rounded-3xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <CardContent className="p-8 sm:p-10 relative z-10">
                <div className="flex flex-col gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Target className="h-6 w-6 text-primary" />
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                                สร้างเป้าหมายการเรียน
                            </h2>
                        </div>

                        <p className="text-muted-foreground text-base max-w-xl">
                            ตั้งเป้าหมายและให้ระบบช่วยวางแผนการเรียนที่เหมาะกับคุณ:
                        </p>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm font-medium text-foreground/80">
                                <Sparkles className="h-4 w-4 text-purple-500" />
                                <span>ครั้งละ <strong>20 คำ</strong> (พอดี ไม่เยอะ)</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm font-medium text-foreground/80">
                                <TrendingUp className="h-4 w-4 text-purple-500" />
                                <span>ระบบคำนวณแผนให้อัตโนมัติ</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm font-medium text-foreground/80">
                                <Target className="h-4 w-4 text-purple-500" />
                                <span>Track ความก้าวหน้าแบบ real-time</span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full">
                        <Button
                            onClick={onCreateGoal}
                            className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] hover:opacity-90 transition-opacity text-white font-bold text-lg h-14 rounded-2xl shadow-lg shadow-purple-500/20"
                        >
                            <Target className="mr-2 h-5 w-5" />
                            สร้างเป้าหมาย (PRO)
                        </Button>
                        <p className="text-xs text-center text-muted-foreground mt-3">
                            Feature สำหรับ PRO users
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
