import { motion } from 'framer-motion';
import { Trophy, Star, Target, Zap, Award, CheckCircle2, Lock, BookOpen, Clock, Map, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { StudyGoal } from '@/types/goals';

interface Milestone {
    id: number;
    day: number;
    type: 'start' | 'pretest' | 'interim' | 'posttest' | 'finish';
    label: string;
    icon: any;
    position: { x: number; y: number };
    completed: boolean;
    locked: boolean;
}

interface GoalJourneyMapProps {
    goal: StudyGoal;
    onMilestoneClick?: (milestone: Milestone) => void;
    onStartSession?: () => void;
}

export default function GoalJourneyMap({ goal, onMilestoneClick, onStartSession }: GoalJourneyMapProps) {
    const totalDays = goal.duration_days;
    const currentDay = goal.current_day;
    const progress = Math.round((currentDay / totalDays) * 100);

    // --- LOGIC: Premium Sine Wave Journey ---

    const calculateNodePosition = (index: number, totalPoints: number) => {
        const paddingX = 60;
        const availableWidth = 880;
        const stepX = availableWidth / (totalPoints - 1);

        const x = paddingX + (index * stepX);

        // Enhanced Sine Wave
        const frequency = 2;
        const amplitude = 55;
        const yBase = 150;
        // Add a slight phase shift or complexity if desired, but simple sine is clean
        const angle = (index / (totalPoints - 1)) * Math.PI * 2 * frequency;
        const y = yBase + Math.sin(angle) * amplitude;

        return { x, y };
    };

    const generateAllNodes = () => {
        const nodes = [];
        const totalPoints = totalDays + 2;

        // 1. Start Node
        nodes.push({
            id: 0,
            day: 0,
            x: calculateNodePosition(0, totalPoints).x,
            y: calculateNodePosition(0, totalPoints).y,
            isMajor: true,
            milestone: {
                id: 0,
                type: 'start',
                label: 'Start',
                icon: Map,
                locked: false,
                completed: true
            } as any
        });

        // 2. Daily Nodes
        const interimDays = calculateInterimTestDays(totalDays);

        for (let day = 1; day <= totalDays; day++) {
            const index = day;
            const pos = calculateNodePosition(index, totalPoints);
            let isMajor = false;
            let milestone = null;

            // Pre-test
            if (day === 1) {
                isMajor = true;
                milestone = {
                    id: 1,
                    day: day,
                    type: 'pretest',
                    label: 'Pre-test',
                    icon: Target,
                    locked: false,
                    completed: currentDay >= day
                } as any;
            }

            // Interim Tests
            const interimIndex = interimDays.indexOf(day);
            if (interimIndex !== -1) {
                isMajor = true;
                milestone = {
                    id: 10 + interimIndex,
                    day: day,
                    type: 'interim',
                    label: `Mid-term ${interimIndex + 1}`,
                    icon: Zap,
                    locked: currentDay < day,
                    completed: currentDay > day
                } as any;
            }

            // Post-test
            if (day === totalDays) {
                isMajor = true;
                milestone = {
                    id: 90,
                    day: totalDays,
                    type: 'posttest',
                    label: 'Final Exam',
                    icon: Trophy,
                    locked: currentDay < totalDays,
                    completed: currentDay >= totalDays
                } as any;
            }

            // Calculate sessions for this day
            const sessionsPerDay = goal.sessions_per_day || 1;
            const sessionsDone = Math.max(0, Math.min(sessionsPerDay, goal.sessions_completed - ((day - 1) * sessionsPerDay)));

            nodes.push({
                id: day,
                day: day,
                x: pos.x,
                y: pos.y,
                isMajor,
                milestone,
                sessionsDone,
                totalSessions: sessionsPerDay
            });
        }

        // 3. Victory Node
        const endPos = calculateNodePosition(totalPoints - 1, totalPoints);
        nodes.push({
            id: 999,
            day: totalDays + 1,
            x: endPos.x,
            y: endPos.y,
            isMajor: true,
            milestone: {
                id: 999,
                type: 'finish',
                label: 'Victory',
                icon: Award,
                locked: currentDay < totalDays,
                completed: currentDay >= totalDays && goal.words_learned >= goal.target_words
            } as any
        });

        return nodes;
    };

    const generatePathData = () => {
        const totalPoints = totalDays + 2;
        const resolution = 200; // Even smoother
        const points = [];

        for (let i = 0; i <= resolution; i++) {
            const index = (i / resolution) * (totalPoints - 1);
            const pos = calculateNodePosition(index, totalPoints);
            points.push(`${pos.x},${pos.y}`);
        }

        // Use Catmull-Rom or just precise polyline since we have high resolution
        // Polyline is fine with 200 points
        return `M ${points.join(" L ")}`;
    };

    const getNodePosition = (day: number) => {
        const clampedDay = Math.min(Math.max(0, day), totalDays + 1);
        const totalPoints = totalDays + 2;

        if (goal.sessions_completed >= ((goal.sessions_per_day || 1) * goal.duration_days) && goal.words_learned >= goal.target_words) {
            return calculateNodePosition(totalPoints - 1, totalPoints);
        }
        return calculateNodePosition(clampedDay, totalPoints);
    };

    const calculateInterimTestDays = (totalDays: number): number[] => {
        if (totalDays <= 5) return [];
        if (totalDays <= 7) return [Math.floor(totalDays / 2)];
        if (totalDays <= 12) return [
            Math.round(totalDays * 0.33),
            Math.round(totalDays * 0.66)
        ];
        const testCount = Math.min(4, Math.floor(totalDays / 5));
        return Array.from({ length: testCount }, (_, i) =>
            Math.floor((totalDays / (testCount + 1)) * (i + 1))
        );
    };

    return (
        <Card className="relative overflow-hidden border-0 shadow-2xl bg-[#0F172A] h-full flex flex-col">
            {/* Glossy Background Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-slate-900/50 to-purple-900/20 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />

            <div className="p-6 relative z-10">
                {/* Header Section */}
                {/* Header Section */}
                {/* Compact Header Section */}
                <div className="flex flex-col gap-4 mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" /> Premium
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 border border-white/5 px-2 py-0.5 rounded bg-slate-800/50">
                                    {totalDays} Day Challenge
                                </span>
                            </div>
                            <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
                                    {goal.goal_name}
                                </span>
                            </h3>
                        </div>

                        <div className="flex items-end gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                            <div className="text-right">
                                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Progress</div>
                                <div className="flex items-baseline justify-end gap-1">
                                    <span className="text-3xl font-black text-white leading-none">{progress}</span>
                                    <span className="text-sm font-bold text-slate-500">%</span>
                                </div>
                            </div>
                            <div className="w-px h-8 bg-white/10" />
                            <div className="text-right">
                                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Day</div>
                                <div className="flex items-baseline justify-end gap-1">
                                    <span className="text-xl font-bold text-white leading-none">{currentDay}</span>
                                    <span className="text-xs font-bold text-slate-500">/{totalDays}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Full Width Progress Bar */}
                    <div className="relative w-full h-3 bg-slate-800/50 rounded-full overflow-hidden border border-white/5 shadow-inner">
                        <motion.div
                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_12px_rgba(168,85,247,0.6)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                    </div>

                    <div className="flex justify-between items-center text-xs font-medium text-slate-400 px-1">
                        <div className="flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Target: <span className="text-slate-300">{goal.target_words} words</span></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-blue-400" />
                            <span>Remaining: <span className="text-slate-300">{totalDays - currentDay} days</span></span>
                        </div>
                    </div>
                </div>

                {/* Journey Map Container */}
                {/* Journey Map Container - Dynamic Height */}
                <div className="relative w-full flex-1 min-h-[250px] bg-[#0B1221] rounded-2xl border border-white/5 shadow-inner overflow-hidden mb-4 group">
                    {/* Subtle grid background */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:40px_40px] pointer-events-none" />

                    {/* SVG Map */}
                    <svg viewBox="0 0 1000 300" className="w-full h-full relative z-10">
                        <defs>
                            <linearGradient id="pathGradientPremium" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="50%" stopColor="#d946ef" />
                                <stop offset="100%" stopColor="#ec4899" />
                            </linearGradient>

                            <linearGradient id="nodeCompleted" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#34d399" />
                                <stop offset="100%" stopColor="#059669" />
                            </linearGradient>

                            <linearGradient id="nodeCurrent" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#fbbf24" />
                                <stop offset="100%" stopColor="#b45309" />
                            </linearGradient>

                            <linearGradient id="nodeBonus" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#f472b6" />
                                <stop offset="100%" stopColor="#be185d" />
                            </linearGradient>

                            <filter id="neonGlow" x="-100%" y="-100%" width="300%" height="300%">
                                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>

                            <filter id="glass" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur" />
                                <feOffset in="blur" dx="1" dy="1" result="offsetBlur" />
                                <feSpecularLighting in="blur" surfaceScale="5" specularConstant=".75" specularExponent="20" lightingColor="#bbbbbb" result="specOut">
                                    <fePointLight x="-5000" y="-10000" z="20000" />
                                </feSpecularLighting>
                                <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut" />
                                <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litPaint" />
                            </filter>
                        </defs>

                        {/* Base Path (faint) */}
                        <path
                            d={generatePathData()}
                            fill="none"
                            stroke="#1e293b"
                            strokeWidth="4"
                            strokeLinecap="round"
                        />

                        {/* Active Path (Gradient & Animated) */}
                        <path
                            d={generatePathData()}
                            fill="none"
                            stroke="url(#pathGradientPremium)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            className="drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                        />

                        {/* Nodes */}
                        {generateAllNodes().map((node) => {
                            const isMajor = node.isMajor;
                            const isCompleted = node.day <= currentDay; // Past or Today(?) - careful with Today logic for visual state
                            // Strict completion for Visuals: 
                            // - Major: use node.milestone.completed (if available) or currentDay > node.day
                            // - Daily: use node.sessionsDone === node.totalSessions

                            const isStrictlyCompleted = isMajor ? (node.milestone?.completed || currentDay > node.day) : (node.day < currentDay || (node.day === currentDay && node.sessionsDone === node.totalSessions));

                            const isCurrent = node.day === currentDay;
                            const isFuture = node.day > currentDay;
                            const isBonusMode = isCurrent && node.sessionsDone === node.totalSessions;

                            return (
                                <g key={node.id} className="transition-all duration-300">
                                    {/* Connection Line to Node (Vertical Drop) - Optional stylistic choice, maybe skip for cleaner look */}

                                    {/* Main Node Circle */}
                                    <motion.circle
                                        cx={node.x}
                                        cy={node.y}
                                        r={isMajor ? 24 : 9}
                                        fill={isStrictlyCompleted ? 'url(#nodeCompleted)' : isCurrent ? (isBonusMode ? 'url(#nodeBonus)' : 'url(#nodeCurrent)') : '#1e293b'}
                                        stroke={isStrictlyCompleted ? '#34d399' : isCurrent ? (isBonusMode ? '#f472b6' : '#fbbf24') : '#334155'}
                                        strokeWidth={isCurrent ? 3 : 2}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: isMajor || isCurrent ? 1 : 1 }}
                                        transition={{ delay: node.day * 0.02 }}
                                        className={`${isMajor ? 'cursor-pointer' : ''}`}
                                        onClick={() => isMajor && node.milestone && onMilestoneClick?.(node.milestone)}
                                        filter={isMajor ? "url(#glass)" : isCurrent ? "url(#neonGlow)" : ""}
                                    />

                                    {/* Pulse for Current Node */}
                                    {isCurrent && (
                                        <motion.circle
                                            cx={node.x}
                                            cy={node.y}
                                            r={isMajor ? 32 : 16}
                                            fill="none"
                                            stroke={isBonusMode ? '#ec4899' : '#f59e0b'}
                                            strokeWidth="1"
                                            initial={{ scale: 0.8, opacity: 0.8 }}
                                            animate={{ scale: 1.5, opacity: 0 }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                        />
                                    )}

                                    {/* Completion Badge (Checkmark) for Major Nodes */}
                                    {isMajor && isStrictlyCompleted && (
                                        <motion.g
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <circle cx={node.x + 14} cy={node.y - 14} r="12" fill="#10b981" stroke="#064e3b" strokeWidth="2" className="drop-shadow-md" />
                                            <CheckCircle2 x={node.x + 6} y={node.y - 22} size={16} className="text-white" />
                                        </motion.g>
                                    )}

                                    {/* Session Dots - Show on ALL nodes */}
                                    <g transform={`translate(${node.x}, ${node.y + (isMajor ? 32 : 20)})`}>
                                        {/* Show for ALL days */}
                                        {Array.from({ length: node.totalSessions || 1 }).map((_, i) => (
                                            <circle
                                                key={i}
                                                cx={(i - ((node.totalSessions || 1) - 1) / 2) * 10}
                                                cy={0}
                                                r={i < (node.sessionsDone || 0) ? 3.5 : 2.5}
                                                fill={i < (node.sessionsDone || 0) ? (node.day === currentDay ? '#f59e0b' : '#10b981') : '#334155'}
                                                stroke={i < (node.sessionsDone || 0) ? "none" : "#1e293b"}
                                                strokeWidth="1"
                                            />
                                        ))}
                                    </g>

                                    {/* Icon for Major Nodes */}
                                    {isMajor && node.milestone && (
                                        <g pointerEvents="none">
                                            <g transform={`translate(${node.x - 10}, ${node.y - 10})`}>
                                                <node.milestone.icon size={20} className={isStrictlyCompleted ? "text-white" : isCurrent ? "text-white" : "text-slate-400"} />
                                            </g>

                                            {/* Label - Moved down further for Major nodes to clear dots */}
                                            <foreignObject x={node.x - 50} y={node.y + 42} width="100" height="40">
                                                <div className={`text-center text-[11px] font-bold leading-tight ${isStrictlyCompleted ? 'text-emerald-400' : isCurrent ? 'text-amber-400' : 'text-slate-400'}`}>
                                                    {node.milestone.label}
                                                </div>
                                            </foreignObject>
                                        </g>
                                    )}

                                    {/* Minor Node Label (Day Number) */}
                                    {!isMajor && (isCurrent || (isFuture && node.day < currentDay + 5)) && (
                                        <text
                                            x={node.x}
                                            y={node.y + 35} // Moved down slightly to avoid session dots
                                            textAnchor="middle"
                                            fontSize="8"
                                            fill={isCurrent ? '#fbbf24' : '#475569'}
                                            fontWeight="bold"
                                        >
                                            {node.day}
                                        </text>
                                    )}
                                </g>
                            );
                        })}

                        {/* Avatar / YOU Marker */}
                        <motion.g
                            initial={{ opacity: 0, y: -50 }}
                            animate={{
                                opacity: 1,
                                x: getNodePosition(currentDay).x,
                                y: getNodePosition(currentDay).y - 20
                            }}
                            transition={{ duration: 1, delay: 0.5, type: 'spring' }}
                        >
                            <motion.g
                                animate={{ y: [0, -8, 0] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            >
                                {/* Glow Under Pin */}
                                <circle cx="0" cy="-25" r="15" fill="#f59e0b" filter="blur(10px)" opacity="0.4" />

                                {/* Pin Shape */}
                                <path
                                    d="M 0 0 L -4 -8 Q -14 -18 -14 -28 A 14 14 0 1 1 14 -28 Q 14 -18 4 -8 Z"
                                    fill="url(#nodeCurrent)"
                                    stroke="white"
                                    strokeWidth="2"
                                    className="drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]"
                                />

                                {/* Inner Detail */}
                                <circle cx="0" cy="-28" r="10" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="1" strokeDasharray="2 2" />

                                {/* Text */}
                                <text x="0" y="-25" textAnchor="middle" fontSize="9" fontWeight="900" fill="white" style={{ textShadow: "0px 1px 2px rgba(0,0,0,0.5)" }}>
                                    YOU
                                </text>
                            </motion.g>
                        </motion.g>

                    </svg>
                </div>

                {/* Primary Actions Grid */}
                <div className="mt-4">
                    <Button
                        onClick={onStartSession}
                        className="w-full h-16 relative overflow-hidden group bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 transition-all duration-300 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] border border-white/10"
                    >
                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />

                        <div className="flex items-center justify-between w-full px-4 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                    <BookOpen className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-sm font-medium text-white/80 uppercase tracking-widest">Ready to learn?</span>
                                    <span className="text-xl font-bold text-white">Start Today's Session</span>
                                </div>
                            </div>
                            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                                <Sparkles className="w-5 h-5 text-amber-300" />
                            </div>
                        </div>
                    </Button>
                </div>
            </div>
        </Card>
    );
}
