import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, RotateCcw, Home, Trophy, BookOpen, Gamepad2, Headphones, Target } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AIListeningFinalSummaryPage() {
    const navigate = useNavigate();
    const { language } = useLanguage();

    // Mock summary data
    const summary = {
        totalVocab: 10,
        flashcardScore: 80,
        gameScore: 70,
        listeningScore: 67,
        weakVocab: ['adjust', 'method', 'elephant']
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
                            onClick={() => navigate('/ai-listening-summary')}
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
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Overall Score */}
                    <Card className="p-8 text-center bg-gradient-to-br from-primary/10 to-purple-500/10">
                        <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold mb-2">
                            {language === 'th' ? 'ยินดีด้วย!' : 'Congratulations!'}
                        </h2>
                        <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-background shadow-lg mb-4">
                            <span className="text-5xl font-bold text-primary">{overallScore}%</span>
                        </div>
                        <p className="text-muted-foreground">
                            {language === 'th' 
                                ? 'คะแนนรวมของคุณ'
                                : 'Your Overall Score'}
                        </p>
                    </Card>

                    {/* Stats Breakdown */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                                    <BookOpen className="w-5 h-5 text-blue-500" />
                                </div>
                                <span className="font-medium">
                                    {language === 'th' ? 'คำศัพท์ทั้งหมด' : 'Total Vocabulary'}
                                </span>
                            </div>
                            <p className="text-3xl font-bold">{summary.totalVocab}</p>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                                    <BookOpen className="w-5 h-5 text-purple-500" />
                                </div>
                                <span className="font-medium">Flashcard</span>
                            </div>
                            <p className="text-3xl font-bold text-purple-600">{summary.flashcardScore}%</p>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                                    <Gamepad2 className="w-5 h-5 text-orange-500" />
                                </div>
                                <span className="font-medium">{language === 'th' ? 'เกม' : 'Game'}</span>
                            </div>
                            <p className="text-3xl font-bold text-orange-600">{summary.gameScore}%</p>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-green-50 dark:bg-green-950/30 rounded-lg">
                                    <Headphones className="w-5 h-5 text-green-500" />
                                </div>
                                <span className="font-medium">AI Listening</span>
                            </div>
                            <p className="text-3xl font-bold text-green-600">{summary.listeningScore}%</p>
                        </Card>
                    </div>

                    {/* Weak Vocabulary */}
                    {summary.weakVocab.length > 0 && (
                        <Card className="p-6">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5 text-orange-500" />
                                {language === 'th' ? 'คำศัพท์ที่แนะนำให้ทบทวนเพิ่ม' : 'Recommended Vocabulary to Review'}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {summary.weakVocab.map((word, index) => (
                                    <span key={index} className="px-4 py-2 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 rounded-full">
                                        {word}
                                    </span>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button
                            variant="outline"
                            size="lg"
                            className="flex-1"
                            onClick={() => navigate('/ai-listening-guide')}
                        >
                            <RotateCcw className="w-5 h-5 mr-2" />
                            {language === 'th' ? 'เริ่มใหม่ทั้งโปรแกรม' : 'Start Over'}
                        </Button>
                        <Button
                            size="lg"
                            className="flex-1"
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
