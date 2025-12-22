import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Trophy,
    Home,
    Share2,
    Sparkles,
    Layers,
    Headphones,
    BookOpen,
    Gamepad2,
    CheckCircle,
    Star
} from 'lucide-react';
import confetti from 'canvas-confetti';
import BackgroundDecorations from '@/components/BackgroundDecorations';
import { LearningModes, VocabItem } from '@/components/learning';

interface PhaseResult {
    correct: number;
    total: number;
    timeSpent?: number;
}

interface LearningResultsState {
    results: Record<string, PhaseResult>;
    selectedVocab: VocabItem[];
    selectedModes: LearningModes;
    phases: string[];
}

const phaseInfo = {
    flashcard: { icon: Layers, label: 'Flashcard', color: 'bg-blue-100 text-blue-600' },
    listening: { icon: Headphones, label: 'Listening', color: 'bg-indigo-100 text-indigo-600' },
    reading: { icon: BookOpen, label: 'Reading', color: 'bg-orange-100 text-orange-600' },
    game: { icon: Gamepad2, label: 'Game', color: 'bg-pink-100 text-pink-600' },
};

export default function LearningResultsPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as LearningResultsState | null;

    const [xpAnimated, setXpAnimated] = useState(0);

    // Redirect if no state
    useEffect(() => {
        if (!state) {
            navigate('/dashboard');
            return;
        }

        // Trigger confetti
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#9333ea', '#ec4899', '#f59e0b'],
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#9333ea', '#ec4899', '#f59e0b'],
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        frame();

        // Animate XP counter
        const totalXP = calculateXP();
        const duration2 = 2000;
        const startTime = Date.now();

        const animateXP = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration2, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setXpAnimated(Math.floor(totalXP * easeOut));

            if (progress < 1) {
                requestAnimationFrame(animateXP);
            }
        };
        animateXP();
    }, [state, navigate]);

    if (!state) {
        return null;
    }

    const { results, selectedVocab, phases } = state;

    // Calculate XP
    const calculateXP = () => {
        let xp = 0;

        Object.entries(results).forEach(([phase, result]) => {
            switch (phase) {
                case 'flashcard':
                    xp += result.correct * 5;
                    break;
                case 'listening':
                case 'reading':
                    xp += result.correct * 10;
                    break;
                case 'game':
                    xp += result.correct * 8;
                    break;
            }
        });

        // Combo bonus for multiple modes
        if (phases.length >= 3) {
            xp = Math.floor(xp * 1.2);
        }

        return xp || 120; // Default XP if calculation is 0
    };

    // Calculate total stats
    const totalCorrect = Object.values(results).reduce((sum, r) => sum + r.correct, 0);
    const totalQuestions = Object.values(results).reduce((sum, r) => sum + r.total, 0);
    const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    // Handle share
    const handleShare = async () => {
        const text = `🎉 ฉันเรียนรู้คำศัพท์ ${selectedVocab.length} คำ และได้ ${calculateXP()} XP บน Promjum Flash Aid!`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Promjum Flash Aid',
                    text: text,
                    url: window.location.origin,
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(text);
            alert('คัดลอกข้อความแล้ว!');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <BackgroundDecorations />

            {/* Main Content Card */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
                    <CardContent className="p-5 text-center relative z-10">
                        {/* Trophy Section with Glow */}
                        <div className="relative mb-2">
                            {/* Sunburst/Glow Effect behind trophy */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-tr from-yellow-100 to-amber-50 rounded-full opacity-50 blur-xl -z-10"
                            />

                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
                                className="w-20 h-20 mx-auto mb-2 rounded-3xl bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center shadow-xl shadow-amber-200 ring-4 ring-white"
                            >
                                <Trophy className="w-10 h-10 text-white drop-shadow-md" />
                            </motion.div>
                        </div>

                        {/* Title */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-1 tracking-tight">
                                ยอดเยี่ยม! <span className="inline-block animate-bounce">🎉</span>
                            </h1>
                            <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mb-6">
                                ภารกิจเสร็จสิ้นแล้ว สุดยอดมาก!
                            </p>
                        </motion.div>

                        {/* XP Display - Premium Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6 }}
                            className="bg-gradient-to-r from-[#FDF4FF] to-[#F5F3FF] border-2 border-purple-50 rounded-2xl p-4 mb-6 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Sparkles className="w-12 h-12 text-purple-500 rotate-12" />
                            </div>

                            <div className="flex flex-col items-center relative z-10">
                                <div className="flex items-center gap-1.5 mb-1 bg-white/60 px-3 py-1 rounded-full backdrop-blur-sm border border-purple-100">
                                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                    <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">EXP OBTAINED</span>
                                </div>
                                <div className="text-5xl font-black bg-gradient-to-br from-purple-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent drop-shadow-sm filter mt-1">
                                    +{xpAnimated}
                                </div>
                            </div>
                        </motion.div>

                        {/* Stats Grid - With Icons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="grid grid-cols-3 gap-3 mb-6"
                        >
                            {/* Vocab Stat */}
                            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-3 flex flex-col items-center">
                                <div className="bg-white p-1.5 rounded-full shadow-sm mb-1.5">
                                    <BookOpen className="w-4 h-4 text-blue-500" />
                                </div>
                                <div className="text-lg font-black text-slate-700">{selectedVocab.length}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Words</div>
                            </div>

                            {/* Accuracy Stat */}
                            <div className="bg-green-50/50 border border-green-100 rounded-2xl p-3 flex flex-col items-center">
                                <div className="bg-white p-1.5 rounded-full shadow-sm mb-1.5">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                </div>
                                <div className="text-lg font-black text-slate-700">{accuracy}%</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Accuracy</div>
                            </div>

                            {/* Phases Stat */}
                            <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-3 flex flex-col items-center">
                                <div className="bg-white p-1.5 rounded-full shadow-sm mb-1.5">
                                    <Layers className="w-4 h-4 text-orange-500" />
                                </div>
                                <div className="text-lg font-black text-slate-700">{phases.length}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Modes</div>
                            </div>
                        </motion.div>

                        {/* Phase Results List */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="space-y-2 mb-6"
                        >
                            {phases.map((phase, idx) => {
                                const info = phaseInfo[phase as keyof typeof phaseInfo];
                                const result = results[phase];
                                const Icon = info?.icon || Sparkles;

                                return (
                                    <motion.div
                                        key={phase}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.8 + (idx * 0.1) }}
                                        className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl bg-opacity-10 group-hover:scale-110 transition-transform ${info?.color.replace('text-', 'bg-').replace('-600', '-100')} ${info?.color}`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-sm text-slate-600">
                                                {info?.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {result && (
                                                <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                                                    {result.correct}/{result.total}
                                                </span>
                                            )}
                                            <div className="bg-green-100 p-0.5 rounded-full">
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.0 }}
                            className="space-y-2"
                        >
                            <Button
                                onClick={handleShare}
                                className="w-full h-11 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-pink-200 transform hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                แชร์ความสำเร็จ
                            </Button>

                            <Button
                                onClick={() => navigate('/dashboard')}
                                variant="ghost"
                                className="w-full h-10 font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl"
                            >
                                <Home className="w-4 h-4 mr-2" />
                                กลับหน้าหลัก
                            </Button>
                        </motion.div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
