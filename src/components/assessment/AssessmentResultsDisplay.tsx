import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { AssessmentResults } from "@/types/assessment";
import { TrendingUp, TrendingDown, Award, Clock, Target } from "lucide-react";

interface AssessmentResultsDisplayProps {
    results: AssessmentResults;
    onClose: () => void;
    onRetry?: () => void;
}

export function AssessmentResultsDisplay({
    results,
    onClose,
    onRetry,
}: AssessmentResultsDisplayProps) {
    const { assessment, weak_words, improvement } = results;
    const { accuracy, correct_answers, total_questions, time_spent_seconds } = assessment;

    const getGrade = () => {
        if (accuracy >= 90) return { grade: 'A', color: 'text-green-500', emoji: '🏆' };
        if (accuracy >= 80) return { grade: 'B', color: 'text-blue-500', emoji: '🎯' };
        if (accuracy >= 70) return { grade: 'C', color: 'text-yellow-500', emoji: '📈' };
        return { grade: 'D', color: 'text-red-500', emoji: '💪' };
    };

    const grade = getGrade();
    const minutes = Math.floor(time_spent_seconds / 60);
    const seconds = time_spent_seconds % 60;

    const isPassed = accuracy >= 70;

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center pb-4">
                <div className="text-6xl mb-4">{grade.emoji}</div>
                <CardTitle className="text-3xl">
                    {assessment.assessment_type === 'pre-test' && 'Pre-test เสร็จสิ้น'}
                    {assessment.assessment_type === 'post-test' && 'Post-test เสร็จสิ้น'}
                    {assessment.assessment_type.startsWith('progress') && 'Progress Test เสร็จสิ้น'}
                </CardTitle>
                <CardDescription>
                    {isPassed ? '🎉 ยอดเยี่ยม!' : 'เก่งมากแล้ว พยายามต่อไป!'}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Score */}
                <div className="text-center p-6 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">ผลคะแนน</p>
                    <p className={`text-5xl font-bold ${grade.color}`}>
                        {accuracy.toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                        Grade {grade.grade}
                    </p>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-500/10 rounded-lg">
                        <Target className="h-6 w-6 mx-auto mb-2 text-green-500" />
                        <p className="text-2xl font-bold">{correct_answers}</p>
                        <p className="text-sm text-muted-foreground">ตอบถูก</p>
                    </div>

                    <div className="text-center p-4 bg-red-500/10 rounded-lg">
                        <Target className="h-6 w-6 mx-auto mb-2 text-red-500" />
                        <p className="text-2xl font-bold">{assessment.wrong_answers}</p>
                        <p className="text-sm text-muted-foreground">ตอบผิด</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">ความแม่นยำ</span>
                        <span className="font-medium">{accuracy.toFixed(1)}%</span>
                    </div>
                    <Progress value={accuracy} className="h-3" />
                </div>

                {/* Time & Questions */}
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{minutes}:{seconds.toString().padStart(2, '0')} นาที</span>
                    </div>
                    <span className="text-muted-foreground">
                        {total_questions} ข้อ
                    </span>
                </div>

                {/* Improvement (for post-test) */}
                {improvement !== undefined && (
                    <div className={`p-4 rounded-lg ${improvement > 0 ? 'bg-green-500/10' : 'bg-muted'}`}>
                        <div className="flex items-center justify-center gap-2">
                            {improvement > 0 ? (
                                <TrendingUp className="h-5 w-5 text-green-500" />
                            ) : (
                                <TrendingDown className="h-5 w-5" />
                            )}
                            <span className="font-semibold">
                                {improvement > 0 ? 'ปรับปรุง' : 'เปลี่ยนแปลง'} {Math.abs(improvement).toFixed(1)}%
                            </span>
                        </div>
                        <p className="text-center text-sm text-muted-foreground mt-1">
                            เทียบกับ Pre-test
                        </p>
                    </div>
                )}

                {/* Weak Words */}
                {weak_words.length > 0 && (
                    <div className="p-4 bg-yellow-500/10 rounded-lg">
                        <p className="font-semibold mb-2">⚠️ คำที่ควร focus:</p>
                        <div className="flex flex-wrap gap-2">
                            {weak_words.slice(0, 10).map((word, idx) => (
                                <span
                                    key={idx}
                                    className="px-2 py-1 bg-yellow-500/20 rounded text-sm"
                                >
                                    {word}
                                </span>
                            ))}
                        </div>
                        {weak_words.length > 10 && (
                            <p className="text-sm text-muted-foreground mt-2">
                                และอีก {weak_words.length - 10} คำ
                            </p>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    {onRetry && (
                        <Button variant="outline" onClick={onRetry} className="flex-1">
                            ทำใหม่
                        </Button>
                    )}
                    <Button onClick={onClose} className="flex-1">
                        {assessment.assessment_type === 'pre-test' ? 'เริ่มเรียน' : 'ปิด'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
