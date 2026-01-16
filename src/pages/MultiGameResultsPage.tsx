import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, CheckCircle2, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MultiGameResultsPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const {
        combinedScore = 0,
        totalCorrect = 0,
        totalQuestions = 0,
        gameResults = [],
        wrongWords = [],
        encouragement = 'ยอดเยี่ยม!',
        goalName = 'Study Goal'
    } = location.state || {};

    if (!location.state) {
        return null;
    }

    // Calculate Overall Accuracy based on actual correct/total
    const displayScore = totalQuestions > 0
        ? Math.round((totalCorrect / totalQuestions) * 100)
        : Math.min(Math.round(combinedScore), 100);

    const radius = 64;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (displayScore / 100) * circumference;

    return (
        <div className="h-screen w-full bg-[#030712] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden bg-[url('/grid-pattern.svg')]">
            {/* Premium Background Effects */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none opacity-40" />
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-rose-600/10 blur-[150px] rounded-full pointer-events-none opacity-40" />

            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.6, type: "spring", bounce: 0.2 }}
                className="w-full max-w-[380px] h-full max-h-[850px] z-10 flex flex-col justify-center"
            >
                {/* Unified Glass Card - Ultra Premium */}
                <Card className="w-full bg-[#0f172a]/90 backdrop-blur-3xl border border-white/10 shadow-[0_0_50px_rgba(79,70,229,0.15)] rounded-[40px] overflow-hidden flex flex-col shrink-0 max-h-full h-auto ring-1 ring-white/5">

                    {/* Header Section (Fixed) - More Compact & Punchy */}
                    <div className="relative pt-6 pb-2 flex flex-col items-center justify-center bg-gradient-to-b from-white/5 to-transparent shrink-0">
                        {/* Increased Circle Size for Impact (w-48 h-48) */}
                        <div className="relative w-48 h-48 flex items-center justify-center mb-1 group cursor-default">
                            {/* SVG Progress Circle with Soft Glow */}
                            <svg className="absolute inset-0 w-full h-full rotate-[-90deg] drop-shadow-[0_0_20px_rgba(99,102,241,0.4)] transform transition-transform group-hover:scale-105 duration-500" viewBox="0 0 200 200">
                                <circle
                                    cx="100" cy="100" r={radius}
                                    className="stroke-slate-800/50 fill-none"
                                    strokeWidth="10"
                                />
                                <motion.circle
                                    cx="100" cy="100" r={radius}
                                    className="stroke-indigo-500 fill-none"
                                    strokeWidth="10"
                                    strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    initial={{ strokeDashoffset: circumference }}
                                    animate={{ strokeDashoffset }}
                                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                                />
                            </svg>

                            {/* Inner Content - Clean Typography */}
                            <div className="flex flex-col items-center gap-0.5">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.5, type: "spring" }}
                                    className="absolute -top-1"
                                >
                                    {displayScore >= 100 ? (
                                        <Trophy className="w-6 h-6 text-amber-400 fill-amber-400/20 animate-bounce drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                                    ) : (
                                        <CheckCircle2 className="w-6 h-6 text-indigo-400 drop-shadow-[0_0_10px_rgba(129,140,248,0.5)]" />
                                    )}
                                </motion.div>
                                <div className="flex flex-col items-center justify-center h-full pt-3">
                                    <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-indigo-100 to-indigo-200 tracking-tighter leading-none filter drop-shadow-sm">
                                        {displayScore}
                                    </span>
                                    <span className="text-sm text-indigo-200/60 font-bold uppercase tracking-widest mt-1">%</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-center z-10 px-6 -mt-3">
                            <motion.h2
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                className="text-3xl font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] bg-gradient-to-r from-white via-indigo-50 to-white bg-clip-text text-transparent"
                            >
                                {encouragement}
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.6 }}
                                transition={{ delay: 1.0 }}
                                className="text-[11px] text-indigo-200 font-bold tracking-[0.25em] uppercase mt-1.5"
                            >
                                {goalName}
                            </motion.p>
                        </div>
                    </div>

                    {/* Content Area (Flex Column) */}
                    <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-t from-[#020617]/50 to-transparent relative">

                        {/* Games Summary (Fixed) - Refined Cards */}
                        <div className="px-5 pt-2 pb-3 shrink-0 space-y-2.5">
                            {gameResults.map((result: any, idx: number) => {
                                // Calculate accuracy percentage
                                const accuracy = result.total > 0 ? Math.round((result.correct / result.total) * 100) : 0;
                                return (
                                    <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all duration-300 group shadow-sm hover:shadow-indigo-500/10 hover:border-indigo-500/20">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 flex items-center justify-center text-slate-400 text-xs font-bold group-hover:from-indigo-600 group-hover:to-indigo-500 group-hover:text-white group-hover:border-transparent transition-all shadow-inner">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-200 group-hover:text-indigo-100 transition-colors">{result.gameName}</p>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold group-hover:text-slate-400 transition-colors">{result.correct}/{result.total} Correct</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-lg font-bold tracking-tight ${accuracy >= 100 ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]' : 'text-white'}`}>
                                                {accuracy}%
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Focus Area (Scrollable) - Custom Scrollbar & Premium List */}
                        {wrongWords.length > 0 && (
                            <div className="flex-1 flex flex-col min-h-0 px-5 pb-3">
                                <div className="flex items-center justify-between mb-3 shrink-0 pt-3 border-t border-white/5">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-rose-500/10 rounded-lg border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.15)]">
                                            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">
                                            Focus Area
                                        </span>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] bg-rose-500/[0.08] text-rose-300 border-rose-500/20 px-2 py-0.5 h-6 shadow-[0_0_5px_rgba(244,63,94,0.1)]">
                                        {wrongWords.length} Missed
                                    </Badge>
                                </div>

                                {/* Scrollable List - Hidden Scrollbar Style for Clean Look */}
                                <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20 transition-colors">
                                    {wrongWords.map((word: any, idx: number) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.05 * idx }}
                                            className="group relative flex items-start gap-4 p-3.5 rounded-2xl bg-[#0f172a]/40 border border-white/5 hover:border-rose-500/20 hover:bg-gradient-to-r hover:from-rose-900/10 hover:to-transparent transition-all duration-300 shrink-0 shadow-sm"
                                        >
                                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-rose-500/40 group-hover:bg-rose-400 group-hover:shadow-[0_0_8px_rgba(244,63,94,0.6)] shrink-0 transition-all duration-300" />

                                            <div className="flex flex-col min-w-0 space-y-0.5">
                                                <span className="text-base font-bold text-slate-200 group-hover:text-white truncate transition-colors leading-tight">
                                                    {word.front_text}
                                                </span>
                                                <span className="text-xs text-slate-500 group-hover:text-rose-200/70 truncate transition-colors font-medium">
                                                    {word.back_text || "No definition"}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Footer Button - Floating Glass Style */}
                        <div className="p-5 pt-3 shrink-0 z-20">
                            <Button
                                onClick={() => navigate('/dashboard', { state: { activeTab: 'focus', shouldRefetch: true } })}
                                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm rounded-2xl shadow-[0_8px_20px_-4px_rgba(79,70,229,0.4)] border border-indigo-400/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Back to Dashboard
                            </Button>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
