import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RotateCcw, Home, Trophy, BookOpen, Gamepad2, Headphones } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AIListeningFinalSummaryPage() {
    const navigate = useNavigate();
    const { language } = useLanguage();

    const location = useLocation();
    const { answers, questions } = location.state || { answers: [], questions: [] };

    const totalQuestions = questions.length || 1;
    const correctAnswers = answers.filter((a: any) => a.correct).length;
    const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);

    const summary = {
        totalVocab: questions.reduce((acc: number, q: any) => acc + (q.vocabUsed?.length || 0), 0),
        flashcardScore: 100,
        gameScore: 85,
        listeningScore: scorePercentage,
    };

    const overallScore = Math.round((summary.flashcardScore + summary.gameScore + summary.listeningScore) / 3);

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-amber-50/50 to-white flex flex-col">

            {/* Main Content */}
            <main className="flex-1 w-full max-w-lg mx-auto px-4 py-6 flex flex-col">

                {/* Trophy Section */}
                <div className="flex-1 flex flex-col items-center justify-center">

                    {/* Trophy Card */}
                    <Card className="w-full p-6 bg-white/80 border-amber-100 shadow-lg shadow-amber-100/50 rounded-3xl text-center mb-6">
                        <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-4" />

                        <h1 className="text-2xl font-black text-amber-500 mb-1">
                            {language === 'th' ? 'ยินดีด้วย!' : 'Congratulations!'}
                        </h1>
                        <p className="text-sm text-slate-500 mb-4">
                            {language === 'th' ? 'ภารกิจครบแล้ว' : 'All missions completed!'}
                        </p>

                        {/* Score Circle */}
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white border-4 border-amber-200 shadow-inner mb-4">
                            <span className="text-3xl font-black text-amber-500">{overallScore}%</span>
                        </div>

                        <div className="inline-block bg-amber-100 text-amber-600 px-4 py-1.5 rounded-full text-sm font-bold">
                            {language === 'th' ? 'คะแนนรวม' : 'Overall Score'}
                        </div>
                    </Card>

                    {/* Stats Grid */}
                    <div className="w-full grid grid-cols-2 gap-3">
                        {[
                            {
                                icon: BookOpen,
                                color: 'text-blue-500',
                                bg: 'bg-blue-50',
                                borderColor: 'border-blue-100',
                                label: language === 'th' ? 'คำศัพท์' : 'Vocab',
                                value: `${summary.totalVocab}`
                            },
                            {
                                icon: BookOpen,
                                color: 'text-purple-500',
                                bg: 'bg-purple-50',
                                borderColor: 'border-purple-100',
                                label: 'Flashcard',
                                value: `${summary.flashcardScore}%`
                            },
                            {
                                icon: Gamepad2,
                                color: 'text-orange-500',
                                bg: 'bg-orange-50',
                                borderColor: 'border-orange-100',
                                label: language === 'th' ? 'เกม' : 'Game',
                                value: `${summary.gameScore}%`
                            },
                            {
                                icon: Headphones,
                                color: 'text-green-500',
                                bg: 'bg-green-50',
                                borderColor: 'border-green-100',
                                label: 'Listening',
                                value: `${summary.listeningScore}%`
                            }
                        ].map((item, idx) => (
                            <Card key={idx} className={`p-4 flex items-center gap-3 ${item.bg} ${item.borderColor} border rounded-2xl shadow-sm`}>
                                <div className={`p-2 rounded-xl bg-white shadow-sm`}>
                                    <item.icon className={`w-5 h-5 ${item.color}`} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-slate-500">{item.label}</p>
                                    <p className="text-xl font-bold text-slate-800">{item.value}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 pb-4">
                    <Button
                        variant="outline"
                        className="flex-1 h-12 text-sm font-bold border-slate-200 hover:bg-slate-50 rounded-xl"
                        onClick={() => navigate('/ai-listening-guide')}
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        {language === 'th' ? 'เริ่มใหม่' : 'Restart'}
                    </Button>
                    <Button
                        className="flex-1 h-12 text-sm font-bold bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white rounded-xl shadow-lg shadow-amber-200/50"
                        onClick={() => navigate('/dashboard')}
                    >
                        <Home className="w-4 h-4 mr-2" />
                        {language === 'th' ? 'หน้าหลัก' : 'Home'}
                    </Button>
                </div>
            </main>
        </div>
    );
}
