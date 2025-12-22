import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Zap, Eye, Search } from 'lucide-react';

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

interface MyStats {
    rank: number;
    bestTime: string;
    nextRank: number;
}

interface UniversityChallengeViewProps {
    timeLeft: TimeLeft;
    myStats: MyStats;
    onStartGame: (isWarmup: boolean) => void;
    onViewVocab: () => void;
}

export function UniversityChallengeView({ timeLeft, myStats, onStartGame, onViewVocab }: UniversityChallengeViewProps) {
    return (
        <div className="bg-[#0a0a1a] rounded-none min-h-screen relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0">
                {/* Main gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a0825] via-[#0d0d20] to-[#0a0a1a]" />
                {/* Pink/Magenta glow - left side */}
                <div className="absolute top-0 left-0 w-[500px] h-[600px] bg-gradient-to-br from-pink-600/30 via-fuchsia-600/20 to-transparent blur-[80px]" />
                {/* Cyan glow - right side */}
                <div className="absolute top-20 right-20 w-[300px] h-[300px] bg-cyan-500/10 blur-[100px] rounded-full" />
                {/* Purple accent */}
                <div className="absolute bottom-0 left-1/2 w-[400px] h-[200px] bg-purple-600/10 blur-[60px]" />
            </div>

            <div className="relative z-10 px-6 py-6 max-w-6xl mx-auto">
                {/* Session Countdown Banner */}
                <div className="mb-8">
                    <div className="inline-flex items-center gap-3">
                        <span className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse shadow-lg shadow-orange-500/50" />
                        <span className="text-orange-500 text-xs font-bold tracking-[0.2em] uppercase">SESSION ENDS IN:</span>
                        <span className="text-white font-mono font-bold text-sm tracking-wide">
                            {String(timeLeft.days).padStart(2, '0')}D {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                        </span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Title */}
                        <div className="space-y-0">
                            <h1 className="text-[2.5rem] md:text-[3.5rem] lg:text-[4.5rem] font-black italic leading-[0.85] tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-500">UNIVERSITY</span>
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400">CHALLENGE</span>
                            </h1>
                        </div>

                        {/* Description */}
                        <div className="space-y-1 pt-2">
                            <p className="text-slate-400 text-sm leading-relaxed">
                                คว้าชัยชนะให้สถาบัน! <span className="text-cyan-400">รวมพลังต่อสู้</span> เพื่อดัน <span className="text-pink-400 italic font-medium">Chiang</span>
                            </p>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                <span className="text-pink-400 italic font-medium">Mai University</span> สู่ <span className="text-yellow-400 font-bold not-italic">THE CHAMPION</span>
                            </p>
                            <p className="text-slate-600 text-xs font-mono pt-1">// Every point counts. Fight for glory.</p>
                        </div>

                        {/* Health Bar */}
                        <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg px-4 py-3 inline-flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2">
                                <span className="text-pink-500 text-sm">❤</span>
                                <span className="text-white text-xs font-bold tracking-wider">HEALTH</span>
                            </div>
                            {/* Segmented Health Bar */}
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div
                                        key={i}
                                        className={`w-6 h-3 rounded-sm ${i <= 3 ? 'bg-gradient-to-r from-cyan-400 to-cyan-500' : 'bg-slate-700'}`}
                                    />
                                ))}
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <span className="text-slate-500">REGEN</span>
                                <span className="text-cyan-400 font-mono font-bold">04:22</span>
                            </div>
                            <span className="text-white font-bold text-sm">3/5</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 pt-4">
                            {/* PLAY NOW - Skewed Button */}
                            <button
                                className="relative group"
                                onClick={() => onStartGame(false)}
                            >
                                <div className="bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 px-10 py-4 skew-x-[-12deg] rounded-sm shadow-xl shadow-pink-500/30 hover:shadow-pink-500/50 transition-all hover:scale-105">
                                    <div className="skew-x-[12deg] flex items-center gap-2">
                                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M13.5 2L3 14h9l-1 8 10.5-12h-9l1-8z" />
                                        </svg>
                                        <span className="text-white font-black text-lg italic tracking-wide">PLAY NOW</span>
                                    </div>
                                </div>
                            </button>

                            {/* VIEW VOCAB - Outline Button */}
                            <button
                                className="bg-slate-800/90 border-2 border-slate-600 hover:border-slate-500 px-8 py-4 rounded-lg flex items-center gap-3 transition-all hover:bg-slate-700/50"
                                onClick={onViewVocab}
                            >
                                <svg className="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                </svg>
                                <span className="text-slate-300 font-bold text-sm tracking-wider">VIEW VOCAB</span>
                            </button>
                        </div>

                        {/* Stats Cards */}
                        <div className="flex gap-2 lg:gap-4 pt-4 flex-wrap">
                            <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg px-4 lg:px-6 py-3 lg:py-4 text-center flex-1 min-w-[70px]">
                                <p className="text-[8px] lg:text-[9px] text-slate-500 font-bold tracking-[0.15em] mb-1">MY RANK</p>
                                <p className="text-xl lg:text-3xl font-black text-white">#{myStats.rank}</p>
                            </div>
                            <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg px-4 lg:px-6 py-3 lg:py-4 text-center flex-1 min-w-[70px]">
                                <p className="text-[8px] lg:text-[9px] text-slate-500 font-bold tracking-[0.15em] mb-1">UNI SCORE</p>
                                <p className="text-xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">1.25M</p>
                            </div>
                            <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg px-4 lg:px-6 py-3 lg:py-4 text-center flex-1 min-w-[70px]">
                                <p className="text-[8px] lg:text-[9px] text-slate-500 font-bold tracking-[0.15em] mb-1">MY SCORE</p>
                                <p className="text-xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">1,240</p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Right Column - Podium */}
                <div className="flex items-end justify-center gap-0 pt-6 lg:pt-0 scale-75 lg:scale-100 origin-bottom">
                    {/* 2nd Place - Mahidol */}
                    <motion.div
                        className="flex flex-col items-center"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        {/* Logo */}
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-400 via-slate-500 to-slate-600 border-2 border-slate-300/50 flex items-center justify-center mb-2 shadow-lg">
                            <span className="text-2xl">🎓</span>
                        </div>
                        {/* Rank Badge */}
                        <div className="bg-slate-500 text-white text-[10px] font-bold px-2 py-0.5 rounded mb-1">#2</div>
                        {/* Name & Score */}
                        <p className="text-slate-300 text-sm font-semibold">Mahidol</p>
                        <p className="text-[11px] text-cyan-400 font-bold mb-2">1.18M PTS</p>
                        {/* Podium */}
                        <div className="w-28 h-28 bg-gradient-to-t from-slate-800 via-slate-600 to-slate-500 rounded-t-xl flex items-end justify-center pb-4 border-t-2 border-slate-400/80 shadow-xl">
                            <span className="text-5xl font-black text-slate-400/60">2</span>
                        </div>
                    </motion.div>

                    {/* 1st Place - CMU */}
                    <motion.div
                        className="flex flex-col items-center -mt-16 mx-1"
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                    >
                        {/* Trophy */}
                        <div className="text-4xl mb-1">🏆</div>
                        {/* Logo */}
                        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-cyan-400 via-cyan-500 to-teal-600 border-2 border-cyan-300/70 flex items-center justify-center mb-2 shadow-xl shadow-cyan-500/30">
                            <div className="text-center">
                                <div className="text-white text-xs font-bold">CMU</div>
                            </div>
                        </div>
                        {/* Rank Badge */}
                        <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-1 shadow-lg shadow-pink-500/30">#1</div>
                        {/* Name & Score */}
                        <p className="text-white text-base font-bold">CMU</p>
                        <p className="text-sm text-cyan-400 font-bold mb-2">1.25M PTS</p>
                        {/* Podium */}
                        <div className="w-32 h-40 bg-gradient-to-t from-teal-900 via-cyan-700 to-cyan-500 rounded-t-xl flex items-end justify-center pb-5 border-t-2 border-cyan-300/80 shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_30%,rgba(255,255,255,0.05)_50%,transparent_70%)]" />
                            <span className="text-6xl font-black text-white/50 relative z-10">1</span>
                        </div>
                    </motion.div>

                    {/* 3rd Place - Chula */}
                    <motion.div
                        className="flex flex-col items-center"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        {/* Logo */}
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 border-2 border-amber-400/50 flex items-center justify-center mb-2 shadow-lg">
                            <span className="text-2xl">🏫</span>
                        </div>
                        {/* Rank Badge */}
                        <div className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded mb-1">#3</div>
                        {/* Name & Score */}
                        <p className="text-slate-300 text-sm font-semibold">Chula</p>
                        <p className="text-[11px] text-cyan-400 font-bold mb-2">1.10M PTS</p>
                        {/* Podium */}
                        <div className="w-28 h-20 bg-gradient-to-t from-amber-900 via-amber-700 to-amber-500 rounded-t-xl flex items-end justify-center pb-3 border-t-2 border-amber-400/80 shadow-xl">
                            <span className="text-4xl font-black text-amber-600/50">3</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Timeframe & Search */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-10 mb-5">
                <div className="flex items-center gap-4">
                    <span className="text-slate-500 text-[11px] font-bold tracking-[0.15em] uppercase">TIMEFRAME:</span>
                    <div className="flex gap-1.5">
                        <button className="px-4 py-2 text-[11px] font-bold rounded bg-cyan-500 text-white shadow-lg shadow-cyan-500/25">ALL TIME</button>
                        <button className="px-4 py-2 text-[11px] font-bold rounded bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">WEEKLY</button>
                        <button className="px-4 py-2 text-[11px] font-bold rounded bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">MONTHLY</button>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 rounded-lg px-4 py-2.5 flex-1 max-w-xs">
                    <Search className="w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="SEARCH UNIVERSITY..."
                        className="bg-transparent text-slate-300 text-[11px] placeholder:text-slate-600 outline-none w-full tracking-wide"
                    />
                </div>
            </div>

            {/* Ranking Table */}
            <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 overflow-hidden">
                {/* Header */}
                <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-800/60 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                    <div className="col-span-1">Rank</div>
                    <div className="col-span-6">University</div>
                    <div className="col-span-2 text-center">Trend</div>
                    <div className="col-span-3 text-right">Score</div>
                </div>

                {/* Row 1 - CMU (Highlighted) */}
                <motion.div
                    className="flex flex-wrap lg:grid lg:grid-cols-12 gap-2 lg:gap-4 px-4 lg:px-6 py-3 lg:py-5 items-center bg-gradient-to-r from-pink-500/15 via-fuchsia-500/10 to-transparent border-l-4 border-pink-500"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="hidden lg:block lg:col-span-1">
                        <span className="text-xl font-black text-pink-400">1</span>
                    </div>
                    <div className="flex-1 lg:col-span-6 flex items-center gap-3 lg:gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <span className="text-lg">🏛️</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-white text-sm">Chiang Mai University</span>
                                <span className="bg-pink-500 text-white text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">YOUR TEAM</span>
                            </div>
                            <p className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">FACULTY OF MEDICINE LEADING</p>
                        </div>
                    </div>
                    <div className="hidden lg:flex lg:col-span-2 justify-center">
                        <span className="bg-orange-500/20 text-orange-400 text-[10px] font-bold px-3 py-1 rounded-full border border-orange-500/40 flex items-center gap-1">
                            🔥 ON FIRE
                        </span>
                    </div>
                    <div className="lg:col-span-3 text-right ml-auto">
                        <span className="text-lg lg:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">1.25M</span>
                    </div>
                </motion.div>

                {/* Row 2 - Mahidol */}
                <motion.div
                    className="flex flex-wrap lg:grid lg:grid-cols-12 gap-2 lg:gap-4 px-4 lg:px-6 py-3 lg:py-5 items-center border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <div className="hidden lg:block lg:col-span-1">
                        <span className="text-xl font-bold text-slate-400">2</span>
                    </div>
                    <div className="flex-1 lg:col-span-6 flex items-center gap-2 lg:gap-4">
                        <span className="lg:hidden text-sm font-bold text-slate-400 w-5">2</span>
                        <div className="w-8 lg:w-10 h-8 lg:h-10 rounded-lg bg-slate-700/80 flex items-center justify-center">
                            <span className="text-base lg:text-lg">🎓</span>
                        </div>
                        <span className="font-semibold text-slate-300 text-xs lg:text-sm">Mahidol</span>
                    </div>
                    <div className="hidden lg:flex lg:col-span-2 justify-center">
                        <span className="text-emerald-400 text-sm font-bold">▲ 1</span>
                    </div>
                    <div className="lg:col-span-3 text-right ml-auto">
                        <span className="text-sm lg:text-lg font-bold text-slate-300">1.18M</span>
                    </div>
                </motion.div>

                {/* Row 3 - Chulalongkorn */}
                <motion.div
                    className="flex flex-wrap lg:grid lg:grid-cols-12 gap-2 lg:gap-4 px-4 lg:px-6 py-3 lg:py-5 items-center border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="hidden lg:block lg:col-span-1">
                        <span className="text-xl font-bold text-slate-400">3</span>
                    </div>
                    <div className="flex-1 lg:col-span-6 flex items-center gap-2 lg:gap-4">
                        <span className="lg:hidden text-sm font-bold text-slate-400 w-5">3</span>
                        <div className="w-8 lg:w-10 h-8 lg:h-10 rounded-lg bg-slate-700/80 flex items-center justify-center">
                            <span className="text-base lg:text-lg">🏫</span>
                        </div>
                        <span className="font-semibold text-slate-300 text-xs lg:text-sm">Chula</span>
                    </div>
                    <div className="hidden lg:flex lg:col-span-2 justify-center">
                        <span className="text-rose-400 text-sm font-bold">▼ 1</span>
                    </div>
                    <div className="lg:col-span-3 text-right ml-auto">
                        <span className="text-sm lg:text-lg font-bold text-slate-300">1.10M</span>
                    </div>
                </motion.div>

                {/* Row 4 - Thammasat */}
                <motion.div
                    className="flex flex-wrap lg:grid lg:grid-cols-12 gap-2 lg:gap-4 px-4 lg:px-6 py-3 lg:py-5 items-center hover:bg-slate-800/20 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <div className="hidden lg:block lg:col-span-1">
                        <span className="text-xl font-bold text-slate-400">4</span>
                    </div>
                    <div className="flex-1 lg:col-span-6 flex items-center gap-2 lg:gap-4">
                        <span className="lg:hidden text-sm font-bold text-slate-400 w-5">4</span>
                        <div className="w-8 lg:w-10 h-8 lg:h-10 rounded-lg bg-slate-700/80 flex items-center justify-center">
                            <span className="text-base lg:text-lg">🎒</span>
                        </div>
                        <span className="font-semibold text-slate-300 text-xs lg:text-sm">Thammasat</span>
                    </div>
                    <div className="hidden lg:flex lg:col-span-2 justify-center">
                        <span className="text-rose-400 text-sm font-bold">▼ 1</span>
                    </div>
                    <div className="lg:col-span-3 text-right ml-auto">
                        <span className="text-sm lg:text-lg font-bold text-slate-300">980K</span>
                    </div>
                </motion.div>

                {/* Footer */}
                <div className="px-6 py-4 text-center border-t border-slate-800/40">
                    <span className="text-[11px] text-slate-500 tracking-[0.2em]">// VIEWING TOP 4 OF 20 //</span>
                </div>
            </div>

            {/* Your Team Card */}
            <motion.div
                className="mt-6 bg-gradient-to-r from-slate-900/90 via-purple-900/20 to-slate-900/90 rounded-xl border border-pink-500/30 p-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <span className="text-2xl font-black text-white">1</span>
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-xl shadow-cyan-500/20">
                            <span className="text-2xl">🏛️</span>
                        </div>
                        <div>
                            <p className="font-black text-white text-lg tracking-wide uppercase">CHIANG MAI UNIVERSITY</p>
                            <p className="text-[11px] text-pink-400 font-semibold flex items-center gap-1.5">
                                <span>📍</span> YOUR TEAM
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="bg-orange-500/20 text-orange-400 text-[10px] font-bold px-3 py-1.5 rounded-full border border-orange-500/40">
                            🔥 ON FIRE
                        </span>
                        <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">1,250,000</p>
                    </div>
                </div>
            </motion.div>

            {/* System Status */}
            <div className="mt-10 flex justify-center pb-6">
                <div className="inline-flex items-center gap-4 bg-slate-900/60 border border-slate-800/60 rounded-full px-6 py-2.5">
                    <span className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-lg shadow-cyan-400/50" />
                        SYSTEM STATUS: <span className="text-cyan-400 font-bold">ONLINE</span>
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-[11px] text-slate-400">
                        LAST UPDATE: <span className="text-slate-300 font-bold">JUST NOW</span>
                    </span>
                </div>
            </div>
        </div>
    );
}
