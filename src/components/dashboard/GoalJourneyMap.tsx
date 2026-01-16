import { motion } from 'framer-motion';
import { Trophy, Star, Target, Zap, Award, CheckCircle2, Lock, BookOpen, Clock, Map, Sparkles, LayoutList } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { StudyGoal } from '@/types/goals';

interface Milestone {
    id: number;
    day: number;
    type: 'start' | 'pre-test' | 'interim' | 'post-test' | 'finish';
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
    bigButtonStatus?: 'locked' | 'ready' | 'completed' | 'bonus';
}

export default function GoalJourneyMap({ goal, onMilestoneClick, onStartSession, bigButtonStatus = 'ready' }: GoalJourneyMapProps) {
    const totalDays = goal.duration_days;
    const currentDay = goal.current_day;
    const progress = Math.round((currentDay / totalDays) * 100);

    // Local state for real-time progress visualization
    const [todaysSessionsCount, setTodaysSessionsCount] = React.useState(0);
    const [todaysBonusCount, setTodaysBonusCount] = React.useState(0);
    const [hasPreTest, setHasPreTest] = React.useState(false);
    const [sessionHistory, setSessionHistory] = React.useState<Record<number, { normal: number, bonus: number }>>({});
    const [viewMode, setViewMode] = React.useState<'map' | 'list'>('map');

    // Fetch real session data to ensure Map matches Schedule
    React.useEffect(() => {
        const fetchSessions = async () => {
            if (!goal?.id) return;
            try {
                // 1. Check goal_assessments (permanent test records)
                const { data } = await supabase
                    .from('goal_assessments' as any)
                    .select('assessment_type')
                    .eq('goal_id', goal.id);

                const assessments = data as any[] || [];

                // 2. Get ALL practice sessions for this goal
                const { data: allSessions } = await supabase
                    .from('practice_sessions')
                    .select('session_mode, created_at, session_type')
                    .eq('user_id', goal.user_id)
                    .eq('goal_id', goal.id)
                    .order('created_at', { ascending: true });

                // Check if Pre-Test exists in assessments (permanent)
                const foundPreTest = assessments?.some((a: any) => a.assessment_type === 'pre-test') || false;
                setHasPreTest(foundPreTest);

                if (allSessions) {
                    // Deduplicate sessions
                    const uniqueSessions = allSessions.filter((session, index, array) => {
                        if (index === 0) return true;
                        const prevSession = array[index - 1];
                        const timeDiff = new Date(session.created_at).getTime() - new Date(prevSession.created_at).getTime();
                        return timeDiff > 60000; // Keep only if > 1 minute apart
                    });

                    const history: Record<number, { normal: number, bonus: number }> = {};
                    const goalStart = new Date(goal.created_at);
                    goalStart.setHours(0, 0, 0, 0); // Normalize goal start

                    uniqueSessions.forEach((s: any) => {
                        const sessionDate = new Date(s.created_at);
                        sessionDate.setHours(0, 0, 0, 0); // Normalize session date

                        // Calculate Day Number (Difference in days + 1)
                        const diffTime = sessionDate.getTime() - goalStart.getTime();
                        const dayNum = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

                        if (!history[dayNum]) {
                            history[dayNum] = { normal: 0, bonus: 0 };
                        }

                        // Count Logic
                        if (['pre-test', 'interim', 'post-test'].includes(s.session_mode)) {
                            // Assessments count as normal progress
                            history[dayNum].normal++;
                        } else if (s.session_type === 'bonus') {
                            history[dayNum].bonus++;
                        } else {
                            history[dayNum].normal++;
                        }
                    });

                    setSessionHistory(history);

                    const todayStats = history[currentDay] || { normal: 0, bonus: 0 };
                    setTodaysSessionsCount(todayStats.normal);
                    setTodaysBonusCount(todayStats.bonus);
                }
            } catch (e) {
                console.error("Error fetching map sessions", e);
            }
        };
        fetchSessions();
    }, [goal]);


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

    const calculateInterimTestDays = (totalDays: number): number[] => {
        return []; // Disabled Interim Tests
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
            } as any,
            sessionsDone: 1, // Start node is always "done" (Goal Created)
            totalSessions: 1
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
                    type: 'pre-test',
                    label: 'Pre-test',
                    icon: Target,
                    locked: false,
                    // Use fetched 'hasPreTest' if available and day is 1, else fallback to standard logic
                    completed: day === 1 && hasPreTest ? true : currentDay > day
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
                    locked: false, // UNLOCKED FOR TESTING: currentDay < day
                    completed: currentDay > day
                } as any;
            }

            // Post-test
            if (day === totalDays) {
                isMajor = true;
                milestone = {
                    id: 90,
                    day: totalDays,
                    type: 'post-test',
                    label: 'Final Exam',
                    icon: Trophy,
                    locked: currentDay < totalDays,
                    completed: currentDay >= totalDays
                } as any;
            }

            // Calculate sessions for this day
            const sessionsPerDay = goal.sessions_per_day || 1;
            const dayStats = sessionHistory[day] || { normal: 0, bonus: 0 };

            let sessionsDone = 0;
            if (day <= currentDay) {
                sessionsDone = dayStats.normal;
            }

            nodes.push({
                id: day,
                day: day,
                x: pos.x,
                y: pos.y,
                isMajor,
                milestone,
                sessionsDone,
                totalSessions: sessionsPerDay,
                bonusCount: dayStats.bonus
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
        return `M ${points.join(" L ")}`;
    };

    const getNodePosition = (day: number) => {
        const sessionsPerDay = goal.sessions_per_day || 1;
        const fractionalDay = day;
        const clampedDay = Math.min(Math.max(0, fractionalDay), totalDays + 1);
        const totalPoints = totalDays + 2;

        if (goal.sessions_completed >= ((goal.sessions_per_day || 1) * goal.duration_days) && goal.words_learned >= goal.target_words) {
            return calculateNodePosition(totalPoints - 1, totalPoints);
        }
        return calculateNodePosition(clampedDay, totalPoints);
    };

    return (
        <Card className="relative overflow-hidden border-0 shadow-2xl bg-[#0F172A] h-full flex flex-col">
            {/* Glossy Background Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-slate-900/50 to-purple-900/20 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />

            <div className="p-3 lg:p-4 relative z-10 flex flex-col h-full">
                {/* Header Section - Teen/Game Style */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2 lg:gap-3 mb-2 lg:mb-4 shrink-0">
                    <div>
                        <div className="flex items-center gap-2 mb-0.5 md:mb-1">
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 px-1.5 md:px-2 py-0.5 text-[8px] md:text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                                <Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3" /> Premium Quest
                            </Badge>
                            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20 px-1.5 md:px-2 py-0.5 text-[8px] md:text-[10px] font-bold uppercase tracking-wider">
                                {totalDays} Days
                            </Badge>
                        </div>
                        <h3 className="text-xl md:text-2xl lg:text-4xl font-black text-white tracking-tight drop-shadow-lg">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient-x">
                                {goal.goal_name}
                            </span>
                        </h3>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* View Toggle - Sliding Pill */}
                        <div className="relative flex items-center bg-slate-900/80 rounded-full p-1 border border-white/10 shadow-inner scale-90 md:scale-100 origin-left">
                            {/* Sliding Background */}
                            <motion.div
                                className="absolute top-1 bottom-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-lg"
                                initial={false}
                                animate={{
                                    left: viewMode === 'map' ? '4px' : '50%',
                                    width: 'calc(50% - 6px)',
                                    x: viewMode === 'map' ? 0 : 2
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />

                            <button
                                onClick={() => setViewMode('map')}
                                className={`relative z-10 flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors duration-200 ${viewMode === 'map' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                <Map size={12} className="md:w-3.5 md:h-3.5" /> Map
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`relative z-10 flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors duration-200 ${viewMode === 'list' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                <LayoutList size={12} className="md:w-3.5 md:h-3.5" /> List
                            </button>
                        </div>

                        {/* Stats HUD */}
                        <div className="hidden md:flex items-center gap-3 bg-slate-900/60 px-4 py-2 rounded-2xl border border-white/5 backdrop-blur-sm">
                            <div className="text-right">
                                <div className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">EXP</div>
                                <div className="flex items-baseline justify-end gap-1">
                                    <span className="text-2xl font-black text-emerald-400 leading-none drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">{progress}</span>
                                    <span className="text-[10px] font-bold text-slate-500">%</span>
                                </div>
                            </div>
                            <div className="w-px h-8 bg-white/10" />
                            <div className="text-right">
                                <div className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Day</div>
                                <div className="flex items-baseline justify-end gap-1">
                                    <span className="text-xl font-bold text-white leading-none">{currentDay}</span>
                                    <span className="text-[10px] font-bold text-slate-500">/{totalDays}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Journey Map Container */}
                {viewMode === 'map' ? (
                    <div className="relative w-full flex-1 min-h-[120px] lg:min-h-[180px] bg-[#0B1221] rounded-2xl border border-white/5 shadow-inner overflow-hidden mb-2 lg:mb-3 group">
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
                                const isCompleted = node.day <= currentDay;
                                const isStrictlyCompleted = isMajor ? (node.milestone?.completed || currentDay > node.day) : (node.day < currentDay || (node.day === currentDay && node.sessionsDone === node.totalSessions));

                                const isCurrent = node.day === currentDay;
                                const isFuture = node.day > currentDay;
                                const isBonusMode = isCurrent && node.sessionsDone === node.totalSessions;

                                return (
                                    <g key={node.id} className="transition-all duration-300">
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

                                        {/* Bonus Count Indicator */}
                                        {(node as any).bonusCount > 0 && (
                                            <motion.g
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.5 }}
                                            >
                                                <circle cx={node.x + (isMajor ? 20 : 12)} cy={node.y - (isMajor ? 20 : 12)} r="8" fill="#ec4899" className="drop-shadow-lg" />
                                                <text
                                                    x={node.x + (isMajor ? 20 : 12)}
                                                    y={node.y - (isMajor ? 20 : 12) + 3}
                                                    textAnchor="middle"
                                                    fontSize="10"
                                                    fontWeight="bold"
                                                    fill="white"
                                                >
                                                    +{(node as any).bonusCount}
                                                </text>
                                            </motion.g>
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
                                            {Array.from({ length: node.totalSessions || 1 }).map((_, i) => {
                                                const isDone = i < (node.sessionsDone || 0);
                                                const isPast = node.day < currentDay;
                                                let dotColor = '#64748b';
                                                if (isDone) {
                                                    dotColor = '#10b981';
                                                } else if (isPast) {
                                                    dotColor = '#ef4444';
                                                }

                                                return (
                                                    <circle
                                                        key={i}
                                                        cx={(i - ((node.totalSessions || 1) - 1) / 2) * 10}
                                                        cy={0}
                                                        r={isDone ? 3.5 : 2.5}
                                                        fill={dotColor}
                                                        stroke={isDone ? "none" : "#1e293b"}
                                                        strokeWidth="1"
                                                    />
                                                );
                                            })}
                                        </g>

                                        {/* Icon for Major Nodes */}
                                        {isMajor && node.milestone && (
                                            <g pointerEvents="none">
                                                <g transform={`translate(${node.x - 10}, ${node.y - 10})`}>
                                                    <node.milestone.icon size={20} className={isStrictlyCompleted ? "text-white" : isCurrent ? "text-white" : "text-slate-400"} />
                                                </g>
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
                                                y={node.y + 35}
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
                        </svg>
                    </div>
                ) : (
                    <div className="relative w-full flex-1 min-h-[120px] lg:min-h-[180px] max-h-[300px] lg:max-h-[400px] bg-[#0B1221] rounded-2xl border border-white/5 shadow-inner overflow-hidden mb-2 lg:mb-3 group flex flex-col">
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:40px_40px] pointer-events-none" />

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar relative z-10">
                            {generateAllNodes().map((node) => {
                                const isMajor = node.isMajor;
                                const isStrictlyCompleted = isMajor ? (node.milestone?.completed || currentDay > node.day) : (node.day < currentDay || (node.day === currentDay && node.sessionsDone === node.totalSessions));
                                const isCurrent = node.day === currentDay;
                                const isBonusMode = isCurrent && node.sessionsDone === node.totalSessions;
                                const isLocked = !isStrictlyCompleted && !isCurrent && node.day > currentDay;

                                return (
                                    <div
                                        key={node.id}
                                        onClick={() => isMajor && node.milestone && onMilestoneClick?.(node.milestone)}
                                        className={`relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 group/item
                                            ${isCurrent
                                                ? 'bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                                                : isStrictlyCompleted
                                                    ? 'bg-emerald-900/20 border-emerald-500/20 hover:bg-emerald-900/30'
                                                    : 'bg-slate-900/40 border-white/5 opacity-60 hover:opacity-80'
                                            }
                                            ${isMajor && !isLocked ? 'cursor-pointer hover:scale-[1.02]' : ''}
                                        `}
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-2 shadow-lg
                                            ${isStrictlyCompleted
                                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                                : isCurrent
                                                    ? 'bg-amber-500/20 border-amber-500 text-amber-400 animate-pulse'
                                                    : 'bg-slate-800 border-slate-700 text-slate-500'
                                            }
                                        `}>
                                            {isMajor && node.milestone ? (
                                                <node.milestone.icon size={24} />
                                            ) : (
                                                <span className="text-lg font-black">{node.day}</span>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className={`font-black text-base uppercase tracking-wide ${isStrictlyCompleted ? 'text-emerald-300' : isCurrent ? 'text-white' : 'text-slate-400'}`}>
                                                    {isMajor ? node.milestone?.label : `Mission Day ${node.day}`}
                                                </h4>
                                                {isCurrent && (
                                                    <Badge variant="outline" className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px] h-5 animate-pulse">
                                                        ACTIVE
                                                    </Badge>
                                                )}
                                                {(node as any).bonusCount > 0 && (
                                                    <Badge variant="outline" className="bg-pink-500/20 text-pink-300 border-pink-500/40 text-[10px] h-5">
                                                        +{(node as any).bonusCount} BONUS
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${isStrictlyCompleted ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                                        style={{ width: `${Math.min(100, ((node.sessionsDone || 0) / (node.totalSessions || 1)) * 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-500">
                                                    {node.sessionsDone}/{node.totalSessions}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="shrink-0">
                                            {isStrictlyCompleted ? (
                                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50">
                                                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                                </div>
                                            ) : isLocked ? (
                                                <Lock className="w-6 h-6 text-slate-600" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/30 animate-pulse">
                                                    <Target className="w-6 h-6 text-amber-400" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Primary Actions Grid */}
                <div className="mt-1 lg:mt-2 shrink-0">
                    <Button
                        onClick={() => bigButtonStatus !== 'locked' && onStartSession?.()}
                        disabled={bigButtonStatus === 'locked'}
                        className={`w-full h-10 lg:h-14 relative overflow-hidden group transition-all duration-300 rounded-lg lg:rounded-xl border border-white/10 shadow-xl 
                        ${bigButtonStatus === 'locked'
                                ? 'bg-slate-800/80 text-slate-500 cursor-not-allowed border-slate-700 shadow-none'
                                : bigButtonStatus === 'bonus'
                                    ? 'bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 hover:from-pink-500 hover:via-rose-400 hover:to-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:shadow-[0_0_30px_rgba(236,72,153,0.6)]'
                                    : 'bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 hover:from-yellow-400 hover:via-amber-400 hover:to-orange-400 shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)]'
                            }`}
                    >
                        {/* Shine Effect (Only if not locked) */}
                        {bigButtonStatus !== 'locked' && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                        )}

                        <div className="flex items-center justify-between w-full px-3 lg:px-4 relative z-10">
                            <div className="flex items-center gap-2 lg:gap-4">
                                <div className={`w-7 h-7 lg:w-10 lg:h-10 rounded-full flex items-center justify-center backdrop-blur-sm ${bigButtonStatus === 'locked' ? 'bg-slate-700' : 'bg-white/20'}`}>
                                    {bigButtonStatus === 'locked' ? <Lock className="w-3.5 h-3.5 lg:w-5 lg:h-5 text-slate-400" /> :
                                        bigButtonStatus === 'bonus' ? <Sparkles className="w-3.5 h-3.5 lg:w-5 lg:h-5 text-white" /> :
                                            <Zap className="w-3.5 h-3.5 lg:w-5 lg:h-5 text-white" />}
                                </div>
                                <div className="flex flex-col items-start text-left">
                                    <span className={`text-[10px] lg:text-sm font-medium uppercase tracking-widest leading-none mb-0.5 ${bigButtonStatus === 'locked' ? 'text-slate-500' : 'text-white/80'}`}>
                                        {bigButtonStatus === 'locked' ? 'Wait for schedule' :
                                            bigButtonStatus === 'bonus' ? 'Goal Completed!' :
                                                'Ready to learn?'}
                                    </span>
                                    <span className={`text-sm lg:text-lg font-black leading-none ${bigButtonStatus === 'locked' ? 'text-slate-400' : 'text-white'}`}>
                                        {bigButtonStatus === 'locked' ? 'Come back tomorrow' :
                                            bigButtonStatus === 'bonus' ? 'BONUS MODE' :
                                                'START MISSION'}
                                    </span>
                                </div>
                            </div>
                            {bigButtonStatus !== 'locked' && (
                                <div className="bg-white/20 p-1 lg:p-2 rounded-lg">
                                    <Zap className="w-3.5 h-3.5 lg:w-5 lg:h-5 text-white fill-current" />
                                </div>
                            )}
                        </div>
                    </Button>
                </div>
            </div>
        </Card>
    );
}
