import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy,
    ArrowRight,
    Star,
    Target,
    Zap,
    RotateCcw,
    CheckCircle2,
    XCircle,
    Activity,
    TrendingUp,
    Clock,
    Sparkles,
    Brain,
    Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import confetti from 'canvas-confetti';

interface InterimResultState {
    score: number;
    total: number;
    correct: number;
    wrong: number;
    mastered: number; // Number of items moved to mastered (SRS > ?)
    leechCount: number; // Number of items reset (Leeches)
    timeSpent: number;
    goalId?: string;
}

export default function InterimTestResultsPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as InterimResultState;

    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        if (!state) {
            navigate('/dashboard');
            return;
        }

        // Delay content slightly for entrance animation
        setTimeout(() => setShowContent(true), 500);

        // Confetti!
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const random = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: random(0.1, 0.3), y: random(0.1, 0.3) } });
            confetti({ ...defaults, particleCount, origin: { x: random(0.7, 0.9), y: random(0.1, 0.3) } });
        }, 250);

        return () => clearInterval(interval);

    }, [state, navigate]);

    if (!state) return null;

    const percentage = Math.round((state.correct / state.total) * 100);
    const getGradeColor = () => {
        if (percentage >= 80) return 'from-emerald-400 to-teal-400';
        if (percentage >= 60) return 'from-amber-400 to-orange-400';
        return 'from-rose-400 to-pink-400';
    };

    const getGradeText = () => {
        if (percentage >= 90) return 'สุดยอดมาก! (Excellent)';
        if (percentage >= 80) return 'ทำได้ดีมาก! (Very Good)';
        if (percentage >= 60) return 'ผ่านเกณฑ์ (Passed)';
        return 'พยายามอีกนิด! (Keep Going)';
    };

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-slate-100 font-sans selection:bg-indigo-500/30 overflow-x-hidden relative">
            {/* Cosmic Background */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0a0a0b] to-[#0a0a0b]" />
            </div>

            <main className="relative z-10 container mx-auto px-4 py-8 max-w-lg flex flex-col min-h-screen">
                <Header />

                <AnimatePresence>
                    {showContent && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="flex-1 flex flex-col gap-6"
                        >
                            {/* 1. Main Score Card */}
                            <div className="relative">
                                {/* Glow behind */}
                                <div className={`absolute inset-0 bg-gradient-to-b ${getGradeColor()} opacity-20 blur-2xl rounded-3xl transform scale-105`} />

                                <Card className="relative overflow-hidden border-0 bg-black/40 backdrop-blur-xl rounded-3xl p-8 text-center shadow-2xl">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

                                    <div className="relative z-10 flex flex-col items-center">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                                            className="mb-4"
                                        >
                                            <div className="relative">
                                                <Trophy className={`w-20 h-20 text-transparent bg-clip-text bg-gradient-to-br ${getGradeColor()} drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]`}
                                                    fill="currentColor" strokeWidth={1} />
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                                    className="absolute -top-4 -right-4"
                                                >
                                                    <Star className="w-8 h-8 text-yellow-400 fill-yellow-400 drop-shadow-md" />
                                                </motion.div>
                                            </div>
                                        </motion.div>

                                        <h2 className={`text-xl font-bold bg-gradient-to-r ${getGradeColor()} bg-clip-text text-transparent mb-1`}>
                                            {getGradeText()}
                                        </h2>

                                        <div className="relative mb-6">
                                            <div className="text-8xl font-black text-white tracking-tighter drop-shadow-2xl font-mono">
                                                {percentage}%
                                            </div>
                                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Interim Score</div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 w-full max-w-[280px]">
                                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 flex flex-col items-center">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-1" />
                                                <span className="text-2xl font-bold text-emerald-400">{state.correct}</span>
                                                <span className="text-[10px] text-emerald-300/70 uppercase">Correct</span>
                                            </div>
                                            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3 flex flex-col items-center">
                                                <XCircle className="w-5 h-5 text-rose-400 mb-1" />
                                                <span className="text-2xl font-bold text-rose-400">{state.wrong}</span>
                                                <span className="text-[10px] text-rose-300/70 uppercase">Wrong</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* 2. SRS & Insights */}
                            <div className="grid grid-cols-2 gap-4">
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-indigo-950/30 border border-indigo-500/20 rounded-2xl p-4 flex flex-col items-center text-center relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-6 bg-indigo-500/10 blur-xl rounded-full" />
                                    <Brain className="w-8 h-8 text-indigo-400 mb-2" />
                                    <div className="text-3xl font-bold text-indigo-300">{state.mastered}</div>
                                    <div className="text-xs font-medium text-slate-400 mt-1">
                                        คำศัพท์แม่นยำ<br />(Mastered)
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="bg-amber-950/20 border border-amber-500/20 rounded-2xl p-4 flex flex-col items-center text-center relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-6 bg-amber-500/10 blur-xl rounded-full" />
                                    <TrendingUp className="w-8 h-8 text-amber-400 mb-2" />
                                    <div className="text-3xl font-bold text-amber-300">+{Math.ceil(state.correct * 2.5)}</div>
                                    <div className="text-xs font-medium text-slate-400 mt-1">
                                        XP Gained<br />(Bonus Applied)
                                    </div>
                                </motion.div>
                            </div>

                            {/* 3. Action Buttons */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="mt-auto space-y-3 pt-6"
                            >
                                <Button
                                    onClick={() => navigate('/dashboard')}
                                    className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-[0_0_20px_-5px_#6366f1] transition-all hover:scale-[1.02] flex items-center justify-center gap-2 group"
                                >
                                    <Rocket className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    กลับสู่หน้าหลัก (Dashboard)
                                </Button>

                                <div className="text-center text-xs text-slate-500">
                                    การทดสอบบันทึกเรียบร้อย • ระบบอัปเดต Goal ของคุณแล้ว
                                </div>
                            </motion.div>

                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

function Header() {
    return (
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="font-bold text-base text-slate-200">Interim Results</h1>
                    <p className="text-[10px] font-medium text-indigo-400">การวัดผลระหว่างทาง</p>
                </div>
            </div>
            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20">
                Weekly Check-in
            </Badge>
        </div>
    );
}
