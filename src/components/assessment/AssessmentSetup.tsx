import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { AssessmentType, TestSizePercentage } from "@/types/assessment";
import { Clock, Target, Zap } from "lucide-react";

interface AssessmentSetupProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    assessmentType: AssessmentType;
    totalWords: number;
    onStart: (testSize: TestSizePercentage) => void;
}

export function AssessmentSetup({
    open,
    onOpenChange,
    assessmentType,
    totalWords,
    onStart,
}: AssessmentSetupProps) {
    const [selectedSize, setSelectedSize] = useState<TestSizePercentage>(50);

    const getTitle = () => {
        switch (assessmentType) {
            case 'pre-test': return '📝 Pre-test';
            case 'post-test': return '🎯 Post-test';
            default: return '📊 Progress Test';
        }
    };

    const getDescription = () => {
        switch (assessmentType) {
            case 'pre-test':
                return 'ทดสอบความรู้เดิมก่อนเริ่มเรียน';
            case 'post-test':
                return 'ทดสอบผลลัพธ์หลังเรียนครบ';
            default:
                return 'ติดตามความก้าวหน้าระหว่างเรียน';
        }
    };

    const calculateQuestions = (percentage: TestSizePercentage) => {
        return Math.round(totalWords * (percentage / 100));
    };

    const estimateTime = (questions: number) => {
        return Math.round(questions * 0.1); // ~6 seconds per question
    };

    const handleStart = () => {
        onStart(selectedSize);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{getTitle()}</DialogTitle>
                    <DialogDescription>{getDescription()}</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">ทั้งหมด</p>
                        <p className="text-3xl font-bold">{totalWords} คำ</p>
                    </div>

                    <div>
                        <Label className="text-base font-semibold">เลือกจำนวนข้อ:</Label>
                        <RadioGroup
                            value={selectedSize.toString()}
                            onValueChange={(value) => setSelectedSize(parseInt(value) as TestSizePercentage)}
                            className="mt-4 space-y-3"
                        >
                            {/* Quick 30% */}
                            <div className="flex items-center space-x-3 p-4 rounded-lg border-2 hover:border-primary transition-colors cursor-pointer">
                                <RadioGroupItem value="30" id="size-30" />
                                <Label htmlFor="size-30" className="flex-1 cursor-pointer">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Zap className="h-4 w-4" />
                                                <span className="font-semibold">Quick ({calculateQuestions(30)} คำ)</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                ⏱️ ~{estimateTime(calculateQuestions(30))} นาที • ประเมินคร่าวๆ
                                            </p>
                                        </div>
                                    </div>
                                </Label>
                            </div>

                            {/* Balanced 50% */}
                            <div className="flex items-center space-x-3 p-4 rounded-lg border-2 hover:border-primary transition-colors cursor-pointer">
                                <RadioGroupItem value="50" id="size-50" />
                                <Label htmlFor="size-50" className="flex-1 cursor-pointer">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Target className="h-4 w-4" />
                                                <span className="font-semibold">Balanced ({calculateQuestions(50)} คำ)</span>
                                                <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">แนะนำ</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                ⏱️ ~{estimateTime(calculateQuestions(50))} นาที • ความแม่นยำดี
                                            </p>
                                        </div>
                                    </div>
                                </Label>
                            </div>

                            {/* Full 100% */}
                            <div className="flex items-center space-x-3 p-4 rounded-lg border-2 hover:border-primary transition-colors cursor-pointer">
                                <RadioGroupItem value="100" id="size-100" />
                                <Label htmlFor="size-100" className="flex-1 cursor-pointer">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">Full ({calculateQuestions(100)} คำ)</span>
                                                <span className="text-xs bg-yellow-500 text-yellow-950 px-2 py-0.5 rounded">🏆 Grade A</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                ⏱️ ~{estimateTime(calculateQuestions(100))} นาที • ครบถ้วนที่สุด
                                            </p>
                                        </div>
                                    </div>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                            💡 <span className="font-medium">เคล็ดลับ:</span> Full test ได้ Certificate Grade A!
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                        ยกเลิก
                    </Button>
                    <Button onClick={handleStart} className="flex-1">
                        เริ่ม {getTitle()}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
