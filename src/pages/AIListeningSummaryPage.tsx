import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, RotateCcw, ArrowRight, CheckCircle, XCircle, Clock, Target } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AIListeningSummaryPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { language } = useLanguage();

    const answers = location.state?.answers || [];
    const questions = location.state?.questions || [];

    const correctCount = answers.filter((a: any) => a.correct).length;
    const totalCount = questions.length;
    const percentage = Math.round((correctCount / totalCount) * 100);

    // Mock weak vocabulary
    const weakVocab = ['adjust', 'method'];

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="border-b bg-card sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/ai-listening-mcq')}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                            {language === 'th' ? 'สรุปผล AI Listening' : 'AI Listening Summary'}
                        </h1>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Score Card */}
                    <Card className="p-8 text-center">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-4">
                            <span className="text-4xl font-bold text-primary">{percentage}%</span>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">
                            {percentage >= 80 
                                ? (language === 'th' ? 'ยอดเยี่ยม!' : 'Excellent!')
                                : percentage >= 60 
                                    ? (language === 'th' ? 'ดีมาก!' : 'Good Job!')
                                    : (language === 'th' ? 'ลองอีกครั้ง' : 'Keep Practicing!')}
                        </h2>
                        <p className="text-muted-foreground">
                            {language === 'th' 
                                ? `คุณตอบถูก ${correctCount} จาก ${totalCount} ข้อ`
                                : `You got ${correctCount} out of ${totalCount} correct`}
                        </p>
                    </Card>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        <Card className="p-4 text-center">
                            <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-green-600">{correctCount}</p>
                            <p className="text-xs text-muted-foreground">
                                {language === 'th' ? 'ถูก' : 'Correct'}
                            </p>
                        </Card>
                        <Card className="p-4 text-center">
                            <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-red-600">{totalCount - correctCount}</p>
                            <p className="text-xs text-muted-foreground">
                                {language === 'th' ? 'ผิด' : 'Wrong'}
                            </p>
                        </Card>
                        <Card className="p-4 text-center">
                            <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-blue-600">2:30</p>
                            <p className="text-xs text-muted-foreground">
                                {language === 'th' ? 'เวลา' : 'Time'}
                            </p>
                        </Card>
                    </div>

                    {/* Weak Vocabulary */}
                    {weakVocab.length > 0 && (
                        <Card className="p-6">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5 text-orange-500" />
                                {language === 'th' ? 'คำศัพท์ที่ควรทบทวนเพิ่ม' : 'Vocabulary to Review'}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {weakVocab.map((word, index) => (
                                    <span key={index} className="px-3 py-1 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 rounded-full text-sm">
                                        {word}
                                    </span>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Question Review */}
                    <Card className="p-6">
                        <h3 className="font-semibold mb-4">
                            {language === 'th' ? 'ทบทวนคำตอบ' : 'Review Answers'}
                        </h3>
                        <div className="space-y-3">
                            {answers.map((answer: any, index: number) => (
                                <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${answer.correct ? 'bg-green-50 dark:bg-green-950/30' : 'bg-red-50 dark:bg-red-950/30'}`}>
                                    <div className="flex items-center gap-3">
                                        {answer.correct 
                                            ? <CheckCircle className="w-5 h-5 text-green-500" />
                                            : <XCircle className="w-5 h-5 text-red-500" />
                                        }
                                        <span>{language === 'th' ? `ข้อ ${index + 1}` : `Question ${index + 1}`}</span>
                                    </div>
                                    <span className={`text-sm ${answer.correct ? 'text-green-600' : 'text-red-600'}`}>
                                        {answer.correct 
                                            ? (language === 'th' ? 'ถูก' : 'Correct')
                                            : (language === 'th' ? 'ผิด' : 'Wrong')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                            variant="outline"
                            size="lg"
                            className="flex-1"
                            onClick={() => navigate('/ai-listening-mcq')}
                        >
                            <RotateCcw className="w-5 h-5 mr-2" />
                            {language === 'th' ? 'ทำใหม่' : 'Try Again'}
                        </Button>
                        <Button
                            size="lg"
                            className="flex-1"
                            onClick={() => navigate('/ai-listening-final-summary')}
                        >
                            {language === 'th' ? 'ไปต่อ Section 5' : 'Go to Section 5'}
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
