import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, RotateCcw, Home, Trophy, BookOpen, Gamepad2, Headphones } from 'lucide-react';
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
        <div className="h-[100dvh] w-full bg-background flex flex-col overflow-hidden">
            {/* Header */}
            <header className="flex-none border-b bg-card z-10">
                <div className="container mx-auto px-4 py-2 md:py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/ai-listening-mcq')}
                            className="h-8 w-8 md:h-10 md:w-10"
                        >
                            <ArrowLeft className="h-4 w-4 md:h-6 md:w-6" />
                        </Button>
                        <h1 className="text-base md:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent truncate">
                            {language === 'th' ? 'สรุปผลรวม' : 'Final Summary'}
                        </h1>
                    </div>
                </div>
            </header>

            {/* Main Content - Force Fit */}
            <main className="flex-1 w-full max-w-md md:max-w-3xl mx-auto px-4 py-2 md:py-6 flex flex-col min-h-0 overflow-hidden">

                {/* Content Wrapper: Centers Trophy and Stats vertically */}
                <div className="flex-1 flex flex-col justify-center gap-4 md:gap-8 w-full">

                    {/* Top Section: Score & Trophy */}
                    <Card className="flex flex-col items-center justify-center py-6 px-4 md:py-12 md:px-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 md:p-6 opacity-5">
                            <Trophy className="w-20 h-20 md:w-48 md:h-48" />
                        </div>

                        <div className="flex flex-col items-center justify-center space-y-3 md:space-y-6">
                            <Trophy className="w-12 h-12 md:w-24 md:h-24 text-yellow-500 drop-shadow-sm" />

                            <div className="text-center space-y-1 md:space-y-2">
                                <h2 className="text-xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-orange-600">
                                    {language === 'th' ? 'ยินดีด้วย!' : 'Congratulations!'}
                                </h2>
                                <p className="text-xs md:text-lg text-muted-foreground line-clamp-1 px-2 mt-1">
                                    {language === 'th' ? 'ภารกิจครบแล้ว' : 'Missions completed!'}
                                </p>
                            </div>

                            <div className="relative inline-flex items-center justify-center w-14 h-14 md:w-32 md:h-32 rounded-full bg-background shadow-md border-2 border-primary/10 my-1 md:my-4">
                                <span className="text-xl md:text-5xl font-bold text-primary">{overallScore}%</span>
                            </div>
                            <div className="bg-primary/10 text-primary text-[9px] md:text-sm px-2 py-0.5 md:px-4 md:py-1 rounded-full uppercase tracking-wider font-bold scale-90 md:scale-100">
                                {language === 'th' ? 'คะแนนรวม' : 'Overall'}
                            </div>
                        </div>
                    </Card>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 md:gap-6">
                        {[
                            {
                                icon: BookOpen,
                                color: 'text-blue-500',
                                bg: 'bg-blue-50 dark:bg-blue-950/30',
                                label: language === 'th' ? 'คำศัพท์' : 'Vocab',
                                value: `${summary.totalVocab}`
                            },
                            {
                                icon: BookOpen,
                                color: 'text-purple-500',
                                bg: 'bg-purple-50 dark:bg-purple-950/30',
                                label: 'Flashcard',
                                value: `${summary.flashcardScore}%`
                            },
                            {
                                icon: Gamepad2,
                                color: 'text-orange-500',
                                bg: 'bg-orange-50 dark:bg-orange-950/30',
                                label: language === 'th' ? 'เกม' : 'Game',
                                value: `${summary.gameScore}%`
                            },
                            {
                                icon: Headphones,
                                color: 'text-green-500',
                                bg: 'bg-green-50 dark:bg-green-950/30',
                                label: 'Listening',
                                value: `${summary.listeningScore}%`
                            }
                        ].map((item, idx) => (
                            <Card key={idx} className="p-2.5 md:p-6 flex items-center gap-2.5 md:gap-5 shadow-sm border hover:bg-accent/50 transition-colors">
                                <div className={`p-1.5 md:p-3 rounded-md md:rounded-xl shrink-0 ${item.bg}`}>
                                    <item.icon className={`w-3.5 h-3.5 md:w-6 md:h-6 ${item.color}`} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] md:text-sm text-muted-foreground truncate">{item.label}</p>
                                    <p className="text-sm md:text-2xl font-bold truncate leading-none">{item.value}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Bottom Section: Actions */}
                <div className="flex-none pt-4 pb-10 md:pb-24 flex gap-2 md:gap-4">
                    <Button
                        variant="outline"
                        className="flex-1 h-11 md:h-14 text-xs md:text-base font-medium border hover:bg-accent hover:text-accent-foreground rounded-lg md:rounded-xl"
                        onClick={() => navigate('/ai-listening-guide')}
                    >
                        <RotateCcw className="w-3.5 h-3.5 md:w-5 md:h-5 mr-1.5 md:mr-2" />
                        {language === 'th' ? 'เริ่มใหม่' : 'Restart'}
                    </Button>
                    <Button
                        className="flex-1 h-11 md:h-14 text-xs md:text-base font-bold shadow-sm bg-gradient-primary text-primary-foreground hover:opacity-90 rounded-lg md:rounded-xl"
                        onClick={() => navigate('/dashboard')}
                    >
                        <Home className="w-3.5 h-3.5 md:w-5 md:h-5 mr-1.5 md:mr-2" />
                        {language === 'th' ? 'หน้าแรก' : 'Home'}
                    </Button>
                </div>
            </main>
        </div>
    );
}
