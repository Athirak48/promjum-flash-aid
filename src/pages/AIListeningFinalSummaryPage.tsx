import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, RotateCcw, Home, Trophy, BookOpen, Gamepad2, Headphones, Target } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AIListeningFinalSummaryPage() {
    const navigate = useNavigate();
    const { language } = useLanguage();

    const location = useLocation();
    const { answers, questions } = location.state || { answers: [], questions: [] };

    const totalQuestions = questions.length || 1;
    const correctAnswers = answers.filter((a: any) => a.correct).length;
    const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);

    // Mock summary data mixed with real results
    const summary = {
        totalVocab: questions.reduce((acc: number, q: any) => acc + (q.vocabUsed?.length || 0), 0),
        flashcardScore: 100, // Placeholder
        gameScore: 85, // Placeholder
        listeningScore: scorePercentage,
        weakVocab: [] // Could be derived from incorrect answers
    };

    const overallScore = Math.round((summary.flashcardScore + summary.gameScore + summary.listeningScore) / 3);

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
                            {language === 'th' ? 'สรุปผลรวม' : 'Final Summary'}
                        </h1>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
                    {/* Overall Score */}
                    <Card className="p-10 text-center bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Trophy className="w-32 h-32" />
                        </div>
                        <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6 drop-shadow-md" />
                        <h2 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-orange-600">
                            {language === 'th' ? 'ยินดีด้วย!' : 'Congratulations!'}
                        </h2>
                        <p className="text-xl text-muted-foreground mb-8">
                            {language === 'th' ? 'คุณทำภารกิจครบทั้งหมดแล้ว' : 'You have completed all missions!'}
                        </p>

                        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-background shadow-2xl border-4 border-primary/10">
                            <span className="text-5xl font-bold text-primary">{overallScore}%</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-4 font-medium uppercase tracking-wider">
                            {language === 'th' ? 'คะแนนรวม' : 'Overall Score'}
                        </p>
                    </Card>

                    {/* Stats Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="p-6 flex items-center justify-between hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
                                    <BookOpen className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <p className="font-medium text-muted-foreground text-sm">
                                        {language === 'th' ? 'คำศัพท์ทั้งหมด' : 'Total Vocabulary'}
                                    </p>
                                    <p className="text-2xl font-bold">{summary.totalVocab} Words</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 flex items-center justify-between hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl">
                                    <BookOpen className="w-6 h-6 text-purple-500" />
                                </div>
                                <div>
                                    <p className="font-medium text-muted-foreground text-sm">Flashcard</p>
                                    <p className="text-2xl font-bold text-purple-600">{summary.flashcardScore}%</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 flex items-center justify-between hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-xl">
                                    <Gamepad2 className="w-6 h-6 text-orange-500" />
                                </div>
                                <div>
                                    <p className="font-medium text-muted-foreground text-sm">{language === 'th' ? 'เกม' : 'Game'}</p>
                                    <p className="text-2xl font-bold text-orange-600">{summary.gameScore}%</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 flex items-center justify-between hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-xl">
                                    <Headphones className="w-6 h-6 text-green-500" />
                                </div>
                                <div>
                                    <p className="font-medium text-muted-foreground text-sm">AI Listening</p>
                                    <p className="text-2xl font-bold text-green-600">{summary.listeningScore}%</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Weak Vocabulary */}
                    {summary.weakVocab.length > 0 && (
                        <Card className="p-8 border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/10">
                            <h3 className="font-semibold mb-6 flex items-center gap-2 text-red-700 dark:text-red-400">
                                <Target className="w-5 h-5" />
                                {language === 'th' ? 'คำศัพท์ที่ยังจำไม่ได้ (แนะนำให้ทบทวน)' : 'Words Not Yet Remembered (Recommended Review)'}
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {summary.weakVocab.map((word, index) => (
                                    <span key={index} className="px-4 py-2 bg-white dark:bg-red-950/50 border border-red-100 dark:border-red-900 text-red-700 dark:text-red-300 rounded-full font-medium shadow-sm">
                                        {word}
                                    </span>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-8 pb-12">
                        <Button
                            variant="outline"
                            size="lg"
                            className="flex-1 h-14 text-base"
                            onClick={() => navigate('/ai-listening-guide')}
                        >
                            <RotateCcw className="w-5 h-5 mr-2" />
                            {language === 'th' ? 'เริ่มใหม่ทั้งโปรแกรม' : 'Start Over'}
                        </Button>
                        <Button
                            size="lg"
                            className="flex-1 h-14 text-base shadow-lg hover:shadow-xl transition-all"
                            onClick={() => navigate('/dashboard')}
                        >
                            <Home className="w-5 h-5 mr-2" />
                            {language === 'th' ? 'กลับหน้าแรก' : 'Go Home'}
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
