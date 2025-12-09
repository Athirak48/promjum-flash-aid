import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, RotateCcw, Home, Trophy, BookOpen, Gamepad2, Layers, Target, CheckCircle2, Star, Lightbulb } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

export default function AIReadingFinalSummaryPage() {
    const navigate = useNavigate();
    const { language } = useLanguage();

    const location = useLocation();
    const { answers, questions } = location.state || { answers: [], questions: [] };

    const totalQuestions = questions.length || 1;
    const correctAnswers = answers.filter((a: any) => a.correct).length;
    const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);

    // Mock summary data with explicit Section mapping
    // In a real app, these would come from global state or API
    const summary = {
        totalVocab: questions.reduce((acc: number, q: any) => acc + (q.vocabUsed?.length || 0), 0),
        section2_Flashcard: 100, // Section 2
        section3_Game: 85,       // Section 3
        section4_Reading: scorePercentage, // Section 4
        weakVocab: [] // Could be derived from incorrect answers
    };

    const overallScore = Math.round((summary.section2_Flashcard + summary.section3_Game + summary.section4_Reading) / 3);

    // Recommendation Logic
    const getRecommendation = () => {
        const scores = [
            { id: 2, score: summary.section2_Flashcard, name: language === 'th' ? 'Section 2 (คำศัพท์)' : 'Section 2 (Flashcards)' },
            { id: 3, score: summary.section3_Game, name: language === 'th' ? 'Section 3 (เกม)' : 'Section 3 (Games)' },
            { id: 4, score: summary.section4_Reading, name: language === 'th' ? 'Section 4 (บทอ่าน)' : 'Section 4 (Reading)' }
        ];

        // Find lowest score
        const lowest = scores.reduce((prev, curr) => prev.score < curr.score ? prev : curr);

        if (overallScore >= 80) {
            return language === 'th'
                ? "ยอดเยี่ยม! คุณทำได้ดีมากในทุกส่วน พร้อมสำหรับบทเรียนถัดไปแล้ว"
                : "Excellent! You performed well in all sections. Ready for the next chapter.";
        } else if (lowest.score < 60) {
            return language === 'th'
                ? `แนะนำให้ทบทวน ${lowest.name} เพิ่มเติม เพื่อเพิ่มความแม่นยำ`
                : `We recommend reviewing ${lowest.name} to improve your accuracy.`;
        } else {
            return language === 'th'
                ? "ทำได้ดี! ฝึกฝนอีกเล็กน้อยเพื่อคะแนนที่สมบูรณ์แบบ"
                : "Good job! A little more practice and you'll be perfect.";
        }
    };

    return (
        <div className="h-screen bg-slate-50 flex flex-col overflow-hidden font-sans">
            {/* Header */}
            <header className="border-b bg-white shrink-0 h-14 flex items-center z-10 px-4">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-slate-800"
                            onClick={() => navigate('/ai-reading-mcq')}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-lg font-bold text-slate-800">
                            {language === 'th' ? 'สรุปผลการเรียนรู้' : 'Learning Summary'}
                        </h1>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-4 overflow-hidden h-[calc(100vh-56px)]">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">

                    {/* Left Column: Overall Score & Recommendation (5 cols) */}
                    <div className="lg:col-span-5 h-full flex flex-col gap-4">
                        <Card className="flex-1 p-6 flex flex-col items-center justify-center text-center bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-xl relative overflow-hidden rounded-3xl border-0">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Trophy className="w-40 h-40 rotate-12" />
                            </div>

                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="relative z-10 flex flex-col items-center"
                            >
                                <div className="mb-4 inline-flex p-3 bg-white/10 backdrop-blur-md rounded-2xl shadow-inner border border-white/20">
                                    <Trophy className="w-10 h-10 text-yellow-300 drop-shadow-md" />
                                </div>
                                <h2 className="text-2xl font-bold mb-1 tracking-tight">
                                    {language === 'th' ? 'สรุปคะแนนรวม' : 'Overall Result'}
                                </h2>
                                <p className="text-indigo-200 mb-6 text-sm">
                                    Chapters 4 Sections 2-4
                                </p>

                                <div className="relative inline-flex items-center justify-center w-36 h-36 rounded-full bg-white text-indigo-700 shadow-2xl mb-6 ring-8 ring-white/10">
                                    <div className="text-center">
                                        <span className="text-5xl font-extrabold tracking-tighter block">{overallScore}%</span>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Total</span>
                                    </div>
                                </div>
                            </motion.div>
                        </Card>

                        {/* Recommendation Card */}
                        <Card className="p-5 bg-amber-50 border-amber-100 rounded-3xl shrink-0">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-amber-100 rounded-full shrink-0">
                                    <Lightbulb className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-amber-800 text-sm mb-1">
                                        {language === 'th' ? 'คำแนะนำสำหรับคุณ' : 'Recommendation'}
                                    </h3>
                                    <p className="text-xs text-amber-700/90 leading-relaxed font-medium">
                                        {getRecommendation()}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: Detailed Stats (7 cols) */}
                    <div className="lg:col-span-7 h-full flex flex-col gap-4 overflow-y-auto lg:overflow-visible pr-1">

                        {/* Section Scores Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0">
                            {[
                                {
                                    icon: Layers,
                                    color: "text-purple-500",
                                    bg: "bg-purple-50",
                                    label: "Section 2",
                                    sub: "Flashcards",
                                    value: `${summary.section2_Flashcard}%`
                                },
                                {
                                    icon: Gamepad2,
                                    color: "text-orange-500",
                                    bg: "bg-orange-50",
                                    label: "Section 3",
                                    sub: "Games",
                                    value: `${summary.section3_Game}%`
                                },
                                {
                                    icon: BookOpen,
                                    color: "text-emerald-500",
                                    bg: "bg-emerald-50",
                                    label: "Section 4",
                                    sub: "Reading",
                                    value: `${summary.section4_Reading}%`
                                },
                            ].map((stat, idx) => (
                                <Card key={idx} className="p-4 flex flex-col gap-3 hover:shadow-md transition-all border-slate-100 rounded-2xl relative overflow-hidden group">
                                    <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity`}>
                                        <stat.icon className={`w-16 h-16 ${stat.color}`} />
                                    </div>
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className={`p-2 rounded-xl ${stat.bg}`}>
                                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                        </div>
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex items-baseline gap-2 mb-0.5">
                                            <span className="text-2xl font-bold text-slate-800">{stat.value}</span>
                                        </div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{stat.label}</p>
                                        <p className="text-[10px] font-medium text-slate-400">{stat.sub}</p>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Weak Vocab Section */}
                        {summary.weakVocab.length > 0 ? (
                            <Card className="flex-1 p-5 border-rose-100 bg-rose-50/50 rounded-2xl overflow-hidden flex flex-col">
                                <h3 className="font-bold mb-3 flex items-center gap-2 text-rose-700 text-sm">
                                    <Target className="w-4 h-4" />
                                    {language === 'th' ? 'คำศัพท์ที่ควรทบทวน' : 'Review Recommended'}
                                </h3>
                                <div className="flex flex-wrap gap-2 overflow-y-auto pr-2 custom-scrollbar content-start">
                                    {summary.weakVocab.map((word, index) => (
                                        <span key={index} className="px-3 py-1.5 bg-white border border-rose-100 text-rose-600 rounded-lg text-xs font-bold shadow-sm">
                                            {word}
                                        </span>
                                    ))}
                                </div>
                            </Card>
                        ) : (
                            <Card className="flex-1 p-5 border-emerald-100 bg-emerald-50/50 rounded-2xl flex flex-col items-center justify-center text-center opacity-80 backdrop-blur-sm">
                                <div className="p-3 bg-white rounded-full shadow-sm mb-2">
                                    <Star className="w-6 h-6 text-emerald-400 fill-emerald-400" />
                                </div>
                                <p className="text-emerald-800 font-bold text-sm">
                                    {language === 'th' ? 'ยอดเยี่ยม! คุณจำคำศัพท์ได้หมดแล้ว' : 'Perfect! No weak words found.'}
                                </p>
                            </Card>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 shrink-0 pt-1">
                            <Button
                                variant="outline"
                                className="flex-1 h-11 text-sm font-semibold rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
                                onClick={() => navigate('/ai-reading-guide')}
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                {language === 'th' ? 'เริ่มใหม่' : 'Restart'}
                            </Button>
                            <Button
                                className="flex-1 h-11 text-sm font-bold shadow-lg shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
                                onClick={() => navigate('/dashboard')}
                            >
                                <Home className="w-4 h-4 mr-2" />
                                {language === 'th' ? 'กลับหน้าแรก' : 'Dashboard'}
                            </Button>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
