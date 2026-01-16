import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Check, Play, Circle, Clock, Target, Sparkles, TrendingUp,
    Calendar, Zap, ArrowRight, Star, AlertTriangle, X, Crown, Flame, ClipboardCheck, RotateCcw, Lock, Repeat, BookOpen, Trophy // Added Repeat & BookOpen icon & Trophy
} from "lucide-react";
import { useStudyGoals } from "@/hooks/useStudyGoals";
import { useAuth } from "@/hooks/useAuth";
import { useWeakWords } from "@/hooks/useWeakWords";
import { useAssessment } from "@/hooks/useAssessment";

import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from '@/integrations/supabase/client';
import { CreateGoalDialog } from "@/components/pro/CreateGoalDialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { StudyGoal } from "@/types/goals";
import { getSessionWindow, SessionTimeWindow } from "@/lib/sessionTimeUtils";


interface TodayScheduleProps {
    activeGoal: StudyGoal | null;
    refetch: () => void;
    deleteGoal: (id: string) => Promise<void>;
    startSmartSession: (
        goal: StudyGoal,
        navigate: any,
        isBonus: boolean,
        bonusType?: 'random' | 'weak',
        customLimit?: number,
        goalConfig?: any // Add this new parameter
    ) => void;
}

export function TodaySchedule({ activeGoal, refetch, deleteGoal, startSmartSession }: TodayScheduleProps) {
    const { user } = useAuth();
    const navigate = useNavigate();
    // Removed internal useStudyGoals hook to rely on parent props
    const { weakWords, loading: weakWordsLoading } = useWeakWords(user?.id, activeGoal?.deck_ids, activeGoal?.created_at);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isWeakWordsOpen, setIsWeakWordsOpen] = useState(false);
    const [reviewOptionsOpen, setReviewOptionsOpen] = useState(false);
    const [isTestsDialogOpen, setIsTestsDialogOpen] = useState(false);
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
    const [assessments, setAssessments] = useState<any[]>([]);
    const { getGoalAssessments } = useAssessment();

    // New: Robust Session Tracking via Practice Sessions table
    const [todaysPracticeSessions, setTodaysPracticeSessions] = useState<any[]>([]);


    useEffect(() => {
        const fetchTodaysSessions = async () => {
            if (!user?.id) return;
            try {
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);

                const { data } = await supabase
                    .from('practice_sessions')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('goal_id', activeGoal.id) // Filter by Goal ID to prevent cross-contamination
                    .gte('created_at', todayStart.toISOString());

                if (data) {
                    setTodaysPracticeSessions(data);
                }
            } catch (err) {
                console.error("Error fetching sessions", err);
            }
        };

        fetchTodaysSessions();
    }, [user?.id, activeGoal]); // Re-fetch when activeGoal changes or user

    // FIX 1: Fetch Test History (was imported but never called!)
    useEffect(() => {
        const loadAssessments = async () => {
            if (!activeGoal?.id) return;
            try {
                // Pass goalId to filter history
                const data = await getGoalAssessments(activeGoal.id);
                setAssessments(data || []);
            } catch (err) {
                console.error("Error fetching assessments:", err);
                setAssessments([]);
            }
        };
        loadAssessments();
    }, [activeGoal?.id, getGoalAssessments]);

    const scheduleData = useMemo(() => {
        if (!activeGoal) return null;

        const currentDay = activeGoal.current_day;
        const totalDuration = activeGoal.duration_days;
        const targetWords = activeGoal.target_words;
        const durationDays = activeGoal.duration_days;
        const sessionsPerDay = activeGoal.sessions_per_day || 1;

        const goalConfig = {
            goalId: activeGoal.id,
            targetWords: activeGoal.target_words || 20,
            totalDurationDays: activeGoal.duration_days,
            currentDay: activeGoal.current_day,
            wordsLearned: activeGoal.words_learned || 0,
            sessionsPerDay: activeGoal.sessions_per_day || 1,
            deckIds: activeGoal.deck_ids || []
        };

        // --- 1. Define Standard Session Times ---
        const allSessionTimes = [];
        allSessionTimes.push('08:00');
        if (sessionsPerDay >= 2) allSessionTimes.push('14:00');
        if (sessionsPerDay >= 3) allSessionTimes.push('20:00');
        if (sessionsPerDay >= 4) allSessionTimes.push('22:00'); // Fallback if 4 sessions

        // --- 2. Determine Day Type & Assessment Status ---
        const isPreTest = currentDay === 1;
        const isInterimTestDay = false; // Interim Test Disabled
        const isPostTestDay = currentDay === durationDays;

        const isAssessmentSession = isPreTest || isPostTestDay;

        // --- 3. Check Completion Status (History + Logs) ---
        // Pre-Fetch status for special assessments
        const preTestDone = isPreTest && (
            assessments.some(a => a.assessment_type === 'pre-test') ||
            todaysPracticeSessions.some(s => s.session_mode === 'pre-test') ||
            ((activeGoal as any).risk_vocabulary && (activeGoal as any).risk_vocabulary.length > 0)
        );

        // Check standard completions for TODAY
        // Use exact check: How many 'standard' sessions are done today?
        // Note: Bonus sessions do NOT count towards unlocking the next slot logic directly 
        // but 'completed' status DOES trigger "Bonus" mode.
        // We need an array of completions per slot index.
        const sessionsByType: { [key: string]: boolean } = {}; // '08:00' -> true

        // Simple counter for "Sessions Completed Today"
        // Logic: Filter out explicit Bonus mode, but include any valid learning session
        const rawCompletions = todaysPracticeSessions.filter(s =>
            (['standard', 'early-bird', 'night-owl'].includes(s.session_type) && s.session_mode !== 'bonus') ||
            (['pre-test', 'post-test'].includes(s.session_mode))
        );

        // Deduplicate: Remove sessions created within 1 minute of each other (prevent double-counting bug)
        const validCompletions = rawCompletions.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            .filter((session, index, array) => {
                if (index === 0) return true;
                const prevSession = array[index - 1];
                const timeDiff = new Date(session.created_at).getTime() - new Date(prevSession.created_at).getTime();
                return timeDiff > 60000; // Keep only if > 1 minute apart
            });

        // Count for progress bar
        let sessionsCompletedToday = validCompletions.length;

        // Special case: If historical assessment done (e.g. Pre-Test yesterday) but no log today,
        // we might need to count it to unlock Session 2?
        // Actually, for "Day 1 Pre-Test", if done yesterday, user shouldn't be on Day 1 today?
        // Ah, Day calculation is calendar based now. So user IS on Day X.
        // If Day 1, Pre-Test must be done today or previously.
        if (isAssessmentSession) {
            const assessmentDone = (isPreTest && preTestDone) ||
                (isPostTestDay && assessments.some(a => a.assessment_type === 'post-test'));

            if (assessmentDone && !validCompletions.some(s => ['pre-test', 'post-test'].includes(s.session_mode))) {
                // It was done in the past, so for today's specific log it's "done" conceptually for progress?
                // Or maybe just for the CHECKBOX visual.
                // For now, let's keep progress bar to strictly "Active Goals Logged Today".
                // BUT: The session card itself needs to know it is "done".
            }
        }

        const todayProgress = Math.round((sessionsCompletedToday / sessionsPerDay) * 100);
        const remainingSessions = Math.max(0, sessionsPerDay - sessionsCompletedToday);

        // --- 4. Build Session Cards ---
        const sessions = allSessionTimes.map((time, index) => {
            const isFirst = index === 0;

            // A. Special Labeling
            let label = `Session ${index + 1}`;
            let desc = `20 คำ`;
            let isSpecial = false;
            let isAssessment = false; // Only true for the specific assessment card

            if (isFirst) {
                if (isPreTest) { label = 'Pre-Test'; desc = 'ทดสอบวัดระดับ'; isSpecial = true; isAssessment = true; }
                else if (isPostTestDay) { label = 'Post-Test'; desc = 'ทดสอบประมวลผล'; isSpecial = true; isAssessment = true; }
            }

            // B. Check Completion
            // Has this specific slot been done today?
            // Since we don't strictly bind times to DB rows, we assume sequential filling.
            // Slot 0 done if validCompletions >= 1
            // Slot 1 done if validCompletions >= 2
            let isCompleted = sessionsCompletedToday > index;

            // Override for Assessment: check historical record
            if (isAssessment) {
                if (isPreTest && preTestDone) isCompleted = true;
                // Add similar checks for Interim/Post if needed
            }

            // C. Calculate Status (Locked, Ready, Missed, Completed)
            let status: 'completed' | 'ready' | 'waiting' | 'locked' | 'missed' = 'locked';
            let extraInfo = '';

            if (isCompleted) {
                status = 'completed';
            } else {
                // Not completed, check time window
                const window = getSessionWindow(allSessionTimes, index);

                if (window.status === 'ready') status = 'ready';
                else if (window.status === 'missed') status = 'missed';
                else if (window.status === 'locked') {
                    status = 'locked';
                    // Optional: Show "Start in X min"
                    if (window.minutesUntilStart && window.minutesUntilStart < 60) {
                        extraInfo = `อีก ${window.minutesUntilStart} นาที`;
                    }
                }

                // Dependency Rule: Must complete previous session first?
                // User didn't strictly say strict sequential enforcement (just time window).
                // BUT usually S2 requires S1.
                // Let's enforce: If previous session NOT completed, and it's NOT missed/ready? 
                // Actually, if S1 is MISSED, can they do S2? Yes normally.
                // Let's stick to Time Window rule primarily.

                // Special: Day 1 Session 2 requires Pre-Test Done
                if (currentDay === 1 && index === 1 && !preTestDone) {
                    status = 'locked'; // Override time window if pre-test not done
                }
            }

            return {
                time,
                label,
                description: desc,
                status,
                isCurrent: status === 'ready', // Highlight if ready
                isSpecial,
                isAssessment,
                extraInfo
            };
        });

        return {
            currentDay,
            totalDuration,
            targetWords,
            durationDays,
            todayProgress,
            sessions,
            remainingSessions,
            sessionsCompletedToday,
            sessionsPerDay
        };
    }, [activeGoal, assessments, todaysPracticeSessions]); // FIX: Must include assessments and todaysPracticeSessions!

    // View 1: Create Goal Promo (No Active Goal)
    if (!activeGoal) {
        return (
            <>
                <div className="group relative h-full overflow-hidden rounded-2xl lg:rounded-3xl border border-white/10 bg-[#0a0a0b] p-4 lg:p-8 shadow-2xl transition-all duration-500 hover:border-purple-500/30 hover:shadow-purple-900/20">
                    {/* Premium Background Effects */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-[#0a0a0b] to-[#0a0a0b]" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 grayscale" />

                    {/* Animated Glows */}
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-500/20 blur-[100px] transition-all duration-700 group-hover:bg-purple-500/30" />
                    <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-blue-500/10 blur-[100px] transition-all duration-700 group-hover:bg-blue-500/20" />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col justify-center h-full space-y-4 md:space-y-8">
                        <div className="space-y-2 md:space-y-4">
                            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 md:px-3 md:py-1 text-[10px] md:text-xs font-medium text-purple-300 shadow-[0_0_15px_-5px_#a855f7]">
                                <Crown className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                <span>PRO FEATURE</span>
                            </div>

                            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-white leading-tight">
                                <span className="bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                                    สร้างเป้าหมาย<br />การเรียนรู้
                                </span>
                            </h2>

                            <p className="text-slate-400 text-xs md:text-sm leading-relaxed max-w-[95%] md:max-w-[90%]">
                                ปลดล็อกขีดจำกัดการเรียนรู้ด้วยระบบ SRS อัจฉริยะ ให้ AI ช่วยวางแผนการจำของคุณให้แม่นยำที่สุด
                            </p>
                        </div>

                        <div className="grid gap-2 md:gap-3">
                            {[
                                { icon: Sparkles, text: "แบ่งเรียนเป็น Session ย่อย", color: "text-amber-300" },
                                { icon: TrendingUp, text: "ระบบคำนวณวันจบอัตโนมัติ", color: "text-blue-300" },
                                { icon: Target, text: "ติดตามผลแบบ Real-time", color: "text-green-300" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2 lg:gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-2.5 lg:p-3 text-xs lg:text-sm text-slate-300 transition-colors hover:bg-white/[0.05]">
                                    <item.icon className={cn("h-3.5 w-3.5 md:h-4 md:w-4 shrink-0 shadow-lg", item.color)} />
                                    <span>{item.text}</span>
                                </div>
                            ))}
                        </div>

                        <Button
                            onClick={() => setIsCreateDialogOpen(true)}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-5 lg:py-7 rounded-lg lg:rounded-xl shadow-[0_0_30px_-5px_rgba(79,70,229,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_-5px_rgba(147,51,234,0.4)] group/btn relative overflow-hidden border border-white/10"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] transition-transform duration-1000 group-hover/btn:translate-x-[200%]" />
                            <span className="flex items-center gap-2 text-sm md:text-base">
                                เริ่มต้นวางแผน
                                <ArrowRight className="h-4 w-4 md:h-5 md:w-5 transition-transform group-hover/btn:translate-x-1" />
                            </span>
                        </Button>
                    </div>
                </div>

                <CreateGoalDialog
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                    onGoalCreated={refetch}
                />
            </>
        );
    }

    // View 2: Schedule View (Active Goal)
    if (!scheduleData) return null;

    return (
        <>
            <div className="h-full relative overflow-hidden rounded-2xl lg:rounded-3xl border-2 border-purple-500/20 bg-slate-900/40 backdrop-blur-sm p-3 lg:p-5 shadow-xl flex flex-col">
                {/* Premium Background Effects */}
                <div className="absolute top-0 right-0 h-[300px] w-[300px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent blur-[60px] opacity-60" />
                <div className="absolute bottom-0 left-0 h-[200px] w-[200px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent blur-[60px]" />

                {/* Reset Goal Button - Absolute Top Right (outside header area) */}
                <button
                    className="absolute top-2 right-2 z-20 flex items-center gap-1 text-[8px] md:text-[9px] text-slate-500 hover:text-red-400 transition-all group bg-white/5 hover:bg-red-500/10 px-1.5 py-0.5 rounded-md border border-white/10 hover:border-red-500/30"
                    onClick={() => setIsResetDialogOpen(true)}
                >
                    <RotateCcw className="h-2 w-2 md:h-2.5 md:w-2.5 group-hover:rotate-[-45deg] transition-transform" />
                    <span className="hidden md:inline">Reset</span>
                </button>

                {/* Header Section */}
                <div className="relative z-10 flex items-start justify-between mb-3 lg:mb-5">
                    <div className="flex items-center gap-2 lg:gap-4">
                        <div className="relative">
                            <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 opacity-30 blur-md" />
                            <div className="relative rounded-lg lg:rounded-xl bg-gradient-to-b from-amber-500/20 to-orange-500/20 p-2 lg:p-3 ring-1 ring-inset ring-amber-500/40 backdrop-blur-md">
                                <Clock className="h-4 w-4 lg:h-6 lg:w-6 text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.5)]" />
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-base lg:text-lg tracking-tight">กำหนดการวันนี้</h3>
                            <div className="flex items-center gap-2 mt-0.5 lg:mt-1">
                                <div className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-1.5 lg:px-2 py-0.5">
                                    <Target className="h-2.5 w-2.5 lg:h-3 lg:w-3 text-amber-400" />
                                    <span className="text-[9px] lg:text-[10px] font-medium text-amber-200">{scheduleData.targetWords} คำ</span>
                                </div>
                                <span className="text-white/20 text-[10px]">|</span>
                                <span className="text-[10px] lg:text-xs text-slate-400 whitespace-nowrap">เหลือ {scheduleData.durationDays} วัน</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end">
                        <div className="relative">
                            <span className="text-2xl lg:text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 drop-shadow-sm">
                                {Math.round((scheduleData.currentDay / scheduleData.totalDuration) * 100)}
                                <span className="text-sm lg:text-lg text-slate-500 font-bold ml-0.5">%</span>
                            </span>
                        </div>
                        <div className="text-[8px] lg:text-[9px] font-bold text-slate-600 uppercase tracking-[0.1em] lg:tracking-[0.2em]">Course Progress</div>
                    </div>
                </div>



                {/* Pro Insights Grid - Glass Cards */}
                <div className="relative z-10 grid grid-cols-3 gap-2 lg:gap-2.5 mb-3 lg:mb-5">
                    {/* Card 1: Mastered Words - Emerald Theme */}
                    <div className="group relative overflow-hidden rounded-xl lg:rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-slate-900/60 p-2 lg:p-3 transition-all hover:border-emerald-500/40 hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]">
                        {/* Background Pattern - Dot Grid */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b9811a_1px,transparent_1px),linear-gradient(to_bottom,#10b9811a_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)]" />

                        <div className="relative z-10">
                            <div className="text-[8px] md:text-[10px] font-bold text-emerald-400 mb-0.5 md:mb-1 flex items-center gap-1 uppercase tracking-wider">
                                <div className="p-0.5 md:p-1 rounded-md bg-emerald-500/20 ring-1 ring-emerald-500/30">
                                    <BookOpen className="h-2 w-2 md:h-2.5 md:w-2.5" />
                                </div>
                                <span className="truncate">Learned</span>
                            </div>
                            <div className="text-base md:text-xl font-bold text-white tracking-tight mt-0.5 md:mt-1 flex items-baseline">
                                {activeGoal.words_learned || 0}
                                <span className="text-[8px] md:text-[10px] text-slate-500 font-normal mx-0.5 md:mx-1">/</span>
                                <span className="text-[10px] md:text-xs text-slate-400">{scheduleData.targetWords}</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Risk Words - Rose Theme */}
                    <div
                        className="group relative cursor-pointer overflow-hidden rounded-xl md:rounded-2xl border border-rose-500/20 bg-gradient-to-br from-rose-950/40 via-slate-900/60 to-slate-900/60 p-2 md:p-3 transition-all hover:border-rose-500/40 hover:shadow-[0_0_20px_-5px_rgba(244,63,94,0.3)]"
                        onClick={() => setIsWeakWordsOpen(true)}
                    >
                        {/* Background Pattern - Diagonal Lines */}
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f43f5e_1px,transparent_1px)] [background-size:12px_12px]" />

                        <div className="absolute bottom-0 right-0 opacity-20 group-hover:opacity-30 transition-opacity transform group-hover:scale-110 duration-500">
                            <Flame className="h-10 w-10 md:h-16 md:w-16 text-rose-500 -mb-2 -mr-2 md:-mb-4 md:-mr-4 blur-[2px]" />
                        </div>

                        <div className="relative z-10">
                            <div className="text-[8px] md:text-[10px] font-bold text-rose-400 mb-0.5 md:mb-1 flex items-center gap-1 uppercase tracking-wider">
                                <div className="p-0.5 md:p-1 rounded-md bg-rose-500/20 ring-1 ring-rose-500/30">
                                    <AlertTriangle className="h-2 w-2 md:h-2.5 md:w-2.5" />
                                </div>
                                <span className="truncate">Risk Words</span>
                            </div>
                            <div className="flex items-baseline gap-0.5 md:gap-1 mt-0.5 md:mt-1">
                                <div className="text-base md:text-xl font-bold text-rose-100 tracking-tight">
                                    {weakWords.length}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Tests */}
                    {/* Card 3: Tests - Blue Theme */}
                    <div
                        className="group relative cursor-pointer overflow-hidden rounded-xl md:rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-950/40 via-slate-900/60 to-slate-900/60 p-2 md:p-3 transition-all hover:border-blue-500/40 hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]"
                        onClick={async () => {
                            if (activeGoal?.id) {
                                const data = await getGoalAssessments(activeGoal.id);
                                setAssessments(data);
                            }
                            setIsTestsDialogOpen(true);
                        }}
                    >
                        {/* Background Pattern - Hexagons (approx via unicode or svg, using simple grid for now) */}
                        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(30deg,#3b82f6_1px,transparent_1px),linear-gradient(150deg,#3b82f6_1px,transparent_1px)] bg-[size:20px_20px]" />

                        <div className="relative z-10">
                            <div className="text-[8px] md:text-[10px] font-bold text-blue-400 mb-0.5 md:mb-1 flex items-center gap-1 uppercase tracking-wider">
                                <div className="p-0.5 md:p-1 rounded-md bg-blue-500/20 ring-1 ring-blue-500/30">
                                    <ClipboardCheck className="h-2 w-2 md:h-2.5 md:w-2.5" />
                                </div>
                                <span className="truncate">Tests</span>
                            </div>
                            <div className="flex items-center gap-1 mt-0.5 md:mt-1">
                                <div className="text-xs md:text-sm font-bold text-blue-100 tracking-tight">ดูประวัติ</div>
                                <ArrowRight className="h-2.5 w-2.5 md:h-3 md:w-3 text-blue-400 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>
                </div>



                {/* Sessions Timeline - Premium Cards */}
                <div className="relative z-10 flex-1 overflow-y-auto pr-1 lg:pr-2 space-y-2 lg:space-y-3 custom-scrollbar -mr-1 lg:-mr-2 pl-1 pb-1">
                    {scheduleData.sessions.map((session, index) => (
                        <div
                            key={index}
                            className={cn(
                                "group relative flex items-center gap-2 lg:gap-3 rounded-xl border p-2 lg:p-3 transition-all duration-300",
                                session.isCurrent
                                    ? "bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/30 shadow-[0_4px_20px_-5px_rgba(245,158,11,0.15)]"
                                    : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10"
                            )}
                        >
                            {/* Left Glow Bar for Current */}
                            {session.isCurrent && (
                                <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-amber-500 shadow-[0_0_10px_#f59e0b]" />
                            )}

                            {/* Status Icon */}
                            <div className={cn(
                                "flex h-9 w-9 lg:h-11 lg:w-11 shrink-0 items-center justify-center rounded-lg lg:rounded-xl border transition-all shadow-lg",
                                session.status === 'completed'
                                    ? "border-green-500/30 bg-gradient-to-br from-green-500/20 to-emerald-500/10 text-green-400"
                                    : (session as any).isSpecial
                                        ? "border-blue-500/50 bg-gradient-to-br from-blue-500/20 to-indigo-500/10 text-blue-400 animate-pulse" // Special Style
                                        : session.isCurrent
                                            ? "border-amber-500/50 bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-amber-400 scale-105"
                                            : "border-white/5 bg-slate-800/30 text-slate-600"
                            )}>
                                {session.status === 'completed' ? (
                                    <Check className="h-4 w-4 lg:h-5 lg:w-5 drop-shadow-[0_0_3px_rgba(74,222,128,0.5)]" />
                                ) : (session as any).isSpecial ? (
                                    <ClipboardCheck className="h-4 w-4 lg:h-5 lg:w-5 ml-1 fill-current drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]" />
                                ) : session.isCurrent ? (
                                    <Play className="h-4 w-4 lg:h-5 lg:w-5 ml-1 fill-current drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]" />
                                ) : (
                                    <div className="h-1.5 w-1.5 lg:h-2 lg:w-2 rounded-full bg-slate-600 ring-4 ring-slate-800" />
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5 lg:mb-1">
                                    <span className={cn(
                                        "text-xs lg:text-sm font-bold tracking-tight",
                                        (session as any).isSpecial ? "text-blue-200" :
                                            session.isCurrent ? "text-amber-100" : "text-slate-300"
                                    )}>
                                        {session.label}
                                        <span className={cn("text-[10px] md:text-xs font-medium ml-1.5 md:ml-2 opacity-60",
                                            (session as any).isSpecial ? "text-blue-300" :
                                                session.isCurrent ? "text-amber-200" : "text-slate-500")}>
                                            {session.time}
                                        </span>
                                    </span>
                                    {session.isCurrent && (
                                        <div className="flex h-1.5 w-1.5 md:h-2 md:w-2">
                                            <span className="animate-ping absolute inline-flex h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-amber-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-amber-500"></span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-[10px] md:text-xs text-slate-500 font-medium truncate">
                                    {session.description}
                                </div>
                            </div>

                            {/* Action Button - Start vs Bonus Logic */}
                            {(() => {
                                // Check if this session has been completed with a 'start' session
                                const hasStartSession = todaysPracticeSessions.some(s =>
                                    s.session_type === 'standard' &&
                                    s.session_mode !== 'bonus' &&
                                    !['pre-test', 'interim', 'post-test'].includes(s.session_mode)
                                );

                                const isSessionCompleted = session.status === 'completed';
                                const isAssessment = (session as any).isAssessment;

                                // Assessment completed - show checkmark
                                if (isSessionCompleted && isAssessment) {
                                    return (
                                        <Button
                                            size="sm"
                                            disabled
                                            className="shrink-0 h-8 lg:h-9 bg-green-500/20 text-green-400 font-bold text-[10px] lg:text-xs rounded-lg px-2 lg:px-4 border border-green-500/30 cursor-not-allowed"
                                        >
                                            <Check className="h-3.5 w-3.5 mr-1" />
                                            เสร็จ
                                        </Button>
                                    );
                                }

                                // Regular session completed with Start - show Bonus button
                                if (isSessionCompleted && hasStartSession && !isAssessment) {
                                    return (
                                        <Button
                                            size="sm"
                                            onClick={() => startSmartSession(activeGoal, navigate, true, 'weak')}
                                            className="shrink-0 h-8 lg:h-9 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-bold text-[10px] lg:text-xs rounded-lg px-2 lg:px-4 shadow-[0_0_15px_-3px_rgba(236,72,153,0.4)] hover:shadow-[0_0_20px_-3px_rgba(236,72,153,0.6)] transition-all hover:scale-105 active:scale-95 border-b-2 border-pink-700"
                                        >
                                            <Sparkles className="h-3 w-3 mr-1" />
                                            Bonus
                                        </Button>
                                    );
                                }

                                // Session ready - Show Start button (or locked)
                                // Allow starting if 'ready' or 'missed' (better late than never)
                                const sessionIsReady = session.status === 'ready' || session.status === 'missed';

                                if (sessionIsReady) {
                                    return (
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                const goalConfig = {
                                                    goalId: activeGoal.id,
                                                    targetWords: activeGoal.target_words || 20,
                                                    totalDurationDays: activeGoal.duration_days,
                                                    currentDay: activeGoal.current_day,
                                                    wordsLearned: activeGoal.words_learned || 0,
                                                    sessionsPerDay: activeGoal.sessions_per_day || 1
                                                };

                                                startSmartSession(activeGoal, navigate, false, undefined, 20, goalConfig);
                                            }}
                                            className={cn(
                                                "shrink-0 h-8 lg:h-9 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:via-yellow-400 hover:to-amber-400 text-slate-900 font-extrabold text-[10px] lg:text-xs rounded-lg px-3 lg:px-6 shadow-[0_0_20px_-3px_rgba(245,158,11,0.5)] hover:shadow-[0_0_25px_-3px_rgba(245,158,11,0.7)] transition-all hover:scale-110 active:scale-95 border-b-3 border-amber-700 animate-pulse"
                                            )}
                                        >
                                            <Play className="h-3.5 w-3.5 mr-1" fill="currentColor" />
                                            Start
                                        </Button>
                                    );
                                } else {
                                    return (
                                        <Button
                                            size="sm"
                                            disabled
                                            className="shrink-0 h-8 lg:h-9 bg-slate-800 text-slate-500 font-bold text-[10px] lg:text-xs rounded-lg px-2 lg:px-4 cursor-not-allowed border border-slate-700"
                                        >
                                            <Lock className="h-3 w-3 mr-1" />
                                            {session.status === 'locked' ? 'Locked' : 'Wait'}
                                        </Button>
                                    );
                                }
                            })()}
                        </div>
                    ))}
                </div>

                {/* Footer - Motivational */}
                <div className="mt-2 md:mt-4 pt-2 md:pt-4 border-t border-white/5 flex items-center justify-center">
                    {scheduleData.remainingSessions > 0 ? (
                        <p className="text-[10px] md:text-xs text-amber-500/80 font-medium flex items-center gap-1.5 md:gap-2 animate-pulse">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_#f59e0b]" />
                            Keep going! เหลืออีก {scheduleData.remainingSessions} ครั้ง
                        </p>
                    ) : (
                        <p className="text-[10px] md:text-xs text-green-400/80 font-medium flex items-center gap-1.5 md:gap-2">
                            <Star className="h-3 w-3 fill-current" />
                            Daily Goal Completed!
                        </p>
                    )}
                </div>
            </div>

            {/* Dangerous Words Dialog - Premium Dark Glass */}
            <Dialog open={isWeakWordsOpen} onOpenChange={setIsWeakWordsOpen}>
                <DialogContent className="bg-[#0f0f11]/95 backdrop-blur-xl border border-white/10 text-white max-w-md shadow-2xl overflow-hidden p-0 gap-0">
                    {/* Header */}
                    <div className="relative p-6 bg-gradient-to-b from-red-500/10 to-transparent border-b border-white/5">
                        <div className="absolute top-0 right-0 p-6 opacity-20">
                            <AlertTriangle className="h-24 w-24 text-red-500 blur-sm transform rotate-12" />
                        </div>
                        <DialogHeader className="relative z-10">
                            <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-white">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 ring-1 ring-red-500/40 shadow-[0_0_15px_-3px_rgba(239,68,68,0.4)]">
                                    <Flame className="h-6 w-6 text-red-500 fill-red-500/20" />
                                </div>
                                Dangerous Words
                            </DialogTitle>
                            <DialogDescription className="text-slate-400 font-medium mt-2">
                                กล่องรวมคำศัพท์ที่ "ต้องระวัง" ระบบคัดกรองจากความถี่ที่คุณตอบผิด
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar bg-[#0a0a0b]">
                        {weakWordsLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                                <p className="text-sm text-slate-500">Analyzing your performance...</p>
                            </div>
                        ) : weakWords.length > 0 ? (
                            <div className="grid gap-3">
                                {weakWords.map((word, idx) => (
                                    <div key={idx} className="group relative overflow-hidden rounded-xl border border-white/5 bg-gradient-to-r from-white/[0.03] to-transparent p-4 transition-all duration-300 hover:border-red-500/30 hover:bg-white/[0.05]">
                                        {/* Background Danger Glow */}
                                        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-red-500/5 blur-[40px] transition-all group-hover:bg-red-500/10" />

                                        <div className="relative z-10 flex items-start justify-between">
                                            <div className="flex-1 min-w-0 mr-4">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-[10px] font-bold text-red-400 ring-1 ring-red-500/20">
                                                        {idx + 1}
                                                    </div>
                                                    <h4 className="flex-1 truncate text-lg font-bold text-slate-100 group-hover:text-red-200 transition-colors">
                                                        {word.word}
                                                    </h4>
                                                </div>

                                                {/* Hidden Meaning - Hover to Reveal */}
                                                <div className="mt-2 group/meaning relative cursor-help">
                                                    <div className="absolute inset-0 flex items-center gap-2 rounded-lg bg-slate-900/80 backdrop-blur-[2px] px-3 py-1 transition-opacity duration-300 group-hover/meaning:opacity-0 border border-white/5">
                                                        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Tap to reveal</span>
                                                    </div>
                                                    <p className="px-3 py-1 text-sm text-slate-300/90 font-medium">
                                                        {word.translation || "คำแปล..."}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Stats Column */}
                                            <div className="flex flex-col items-end gap-2 shrink-0">
                                                <div className="text-right">
                                                    <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">Mistakes</span>
                                                    <span className="text-sm font-bold text-red-400 flex items-center justify-end gap-1">
                                                        <X className="h-3 w-3" /> {word.times_wrong}
                                                    </span>
                                                </div>

                                                {/* Visual Risk Bar */}
                                                <div className="w-20">
                                                    <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-slate-800 ring-1 ring-white/5">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-orange-500 via-red-500 to-rose-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                                                            style={{ width: `${Math.min(100, Math.round(word.difficulty_score * 100))}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="rounded-full bg-green-500/10 p-4 mb-4 ring-1 ring-green-500/20">
                                    <Star className="h-8 w-8 text-green-500 fill-green-500/20" />
                                </div>
                                <h4 className="text-white font-bold text-lg">Clean Record!</h4>
                                <p className="text-slate-400 text-sm mt-1 max-w-[200px]">
                                    ยังไม่มีคำศัพท์อันตราย คุณทำได้ยอดเยี่ยมมาก
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer - With Action Button */}
                    <div className="p-4 bg-[#0a0a0b] border-t border-white/5 flex items-center justify-between min-h-[72px]">
                        {reviewOptionsOpen ? (
                            <div className="w-full flex items-center justify-between animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <span className="text-xs text-slate-400 font-medium whitespace-nowrap mr-2">เลือกจำนวนคำ:</span>
                                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                                    {[25, 50, 75, 100].map((pct) => (
                                        <Button
                                            key={pct}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const count = Math.ceil(weakWords.length * (pct / 100));
                                                startSmartSession(activeGoal, navigate, true, 'weak', count);
                                                setIsWeakWordsOpen(false);
                                                setReviewOptionsOpen(false);
                                            }}
                                            className="h-8 text-xs px-2 border-white/10 bg-white/5 text-slate-300 hover:bg-blue-500/20 hover:text-blue-300 hover:border-blue-500/30 transition-all font-mono"
                                        >
                                            {pct}%
                                        </Button>
                                    ))}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setReviewOptionsOpen(false)}
                                        className="h-8 w-8 p-0 text-slate-500 hover:text-white"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="text-xs text-slate-500 font-medium ml-2">
                                    {weakWords.length === 0 ? (
                                        <span className="text-green-500 flex items-center gap-1">
                                            <Sparkles className="h-3 w-3" /> เยี่ยมมาก! ไม่มีคำศัพท์ที่น่าห่วง
                                        </span>
                                    ) : (
                                        <span className="text-red-400">พร้อมทบทวน {weakWords.length} คำ</span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setIsWeakWordsOpen(false)}
                                        className="text-slate-400 hover:text-white hover:bg-white/5"
                                    >
                                        Close
                                    </Button>
                                    <Button
                                        disabled={weakWords.length === 0}
                                        onClick={() => setReviewOptionsOpen(true)}
                                        className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Flame className="h-4 w-4 mr-2" />
                                        Review Now
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Tests History Dialog */}
            <Dialog open={isTestsDialogOpen} onOpenChange={setIsTestsDialogOpen}>
                <DialogContent hideCloseButton className="bg-[#0B0F19]/95 backdrop-blur-2xl border border-white/10 text-white sm:max-w-xl w-full shadow-2xl p-0 overflow-hidden rounded-[2rem]">

                    {/* Decorative Background Effects */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

                    {/* Header */}
                    <div className="relative p-6 pb-4 z-10 border-b border-white/5 flex items-start justify-between">
                        <DialogHeader className="flex flex-row items-center gap-4 space-y-0">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center ring-1 ring-white/10 shadow-lg backdrop-blur-md">
                                <ClipboardCheck className="h-6 w-6 text-blue-400" />
                            </div>
                            <div className="text-left">
                                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                                    ประวัติการทดสอบ
                                </DialogTitle>
                                <DialogDescription className="text-slate-400 font-medium text-xs mt-0.5">
                                    สถิติและผลการประเมินทักษะภาษาอังกฤษ
                                </DialogDescription>
                            </div>
                        </DialogHeader>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full -mr-2 -mt-2"
                            onClick={() => setIsTestsDialogOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Content Area - Dynamic Height */}
                    <div className="p-6 space-y-4 min-h-[300px] max-h-[60vh] overflow-y-auto custom-scrollbar relative z-10">
                        {assessments.length > 0 ? (
                            <div className="grid gap-4">
                                {assessments.map((assessment, idx) => (
                                    <div
                                        key={idx}
                                        className="group relative overflow-hidden rounded-2xl bg-[#1A1F2E]/50 border border-white/5 hover:border-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-0.5"
                                    >
                                        {/* Evaluation Status Bar */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${assessment.correct_answers !== null
                                            ? assessment.test_size_percentage && assessment.test_size_percentage >= 80 ? 'bg-green-500'
                                                : 'bg-blue-500' // High/Normal score bar
                                            : 'bg-amber-500' // Incomplete/Retake
                                            }`} />

                                        <div className="p-4 pl-5">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase border ${assessment.assessment_type === 'pre-test'
                                                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                        : assessment.assessment_type === 'post-test'
                                                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                        }`}>
                                                        {assessment.assessment_type === 'pre-test' ? 'PRE-TEST'
                                                            : assessment.assessment_type === 'post-test' ? 'POST-TEST'
                                                                : 'INTERIM'}
                                                    </div>
                                                    <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(assessment.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-end justify-between">
                                                {/* Score Display */}
                                                <div>
                                                    {assessment.correct_answers !== null ? (
                                                        <div className="flex flex-col">
                                                            <div className="flex items-baseline gap-1">
                                                                <span className="text-3xl font-black text-white tracking-tight">
                                                                    {Math.round((assessment.correct_answers / assessment.total_questions) * 100)}
                                                                </span>
                                                                <span className="text-sm font-bold text-slate-500">%</span>
                                                            </div>
                                                            <span className="text-[11px] text-slate-400 font-medium mt-1">
                                                                ทำถูก {assessment.correct_answers} จาก {assessment.total_questions} ข้อ
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-slate-300">รอผลประเมิน</span>
                                                            <span className="text-[10px] text-slate-500 mt-1">ยังไม่มีคะแนนบันทึก</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Action Button */}
                                                {!assessment.correct_answers && (
                                                    <Button
                                                        size="sm"
                                                        className="h-8 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-lg shadow-amber-500/20 px-3 transition-all active:scale-95"
                                                        onClick={() => {
                                                            const path = assessment.assessment_type === 'pre-test' ? '/focus-mode/pre-test'
                                                                : assessment.assessment_type === 'post-test' ? '/focus-mode/post-test'
                                                                    : '/focus-mode/interim-test';

                                                            navigate(path, {
                                                                state: {
                                                                    goalId: activeGoal.id,
                                                                    deckIds: activeGoal.deck_ids || [],
                                                                    goalName: activeGoal.goal_name || 'Study Goal'
                                                                }
                                                            });
                                                        }}
                                                    >
                                                        <RotateCcw className="h-3 w-3 mr-1.5" />
                                                        สอบแก้ตัว
                                                    </Button>
                                                )}

                                                {/* High Score Badge */}
                                                {assessment.correct_answers !== null && (assessment.correct_answers / assessment.total_questions) >= 0.8 && (
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                                                        <Trophy className="h-5 w-5 text-white animate-pulse" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 h-full">
                                <div className="h-20 w-20 rounded-3xl bg-[#1A1F2E] flex items-center justify-center ring-1 ring-white/5 shadow-inner">
                                    <ClipboardCheck className="h-10 w-10 text-slate-600" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-lg">ยังไม่มีข้อมูลทดสอบ</h4>
                                    <p className="text-slate-500 text-xs mt-1 max-w-[200px] mx-auto leading-relaxed">
                                        เริ่มทำ Pre-test เพื่อวัดระดับความรู้ และดูพัฒนาการของคุณได้ที่นี่
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Stats - Balances the composition */}
                    <div className="px-6 py-4 bg-[#080a10]/50 border-t border-white/5 flex items-center justify-between z-10 relative">
                        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                <span>Completed: <span className="text-slate-300">{assessments.filter(a => a.completed_at).length}</span></span>
                            </div>
                            {assessments.some(a => a.correct_answers !== null) && (
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                    <span>Best: <span className="text-slate-300">
                                        {Math.max(...assessments.map(a =>
                                            a.correct_answers ? Math.round((a.correct_answers / a.total_questions) * 100) : 0
                                        ))}%
                                    </span></span>
                                </div>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-white hover:bg-white/5 h-8 text-xs"
                            onClick={() => setIsTestsDialogOpen(false)}
                        >
                            ปิดหน้าต่าง
                        </Button>
                    </div>

                </DialogContent>
            </Dialog>

            <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                <AlertDialogContent className="bg-slate-900 border border-slate-800 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการรีเซ็ตเป้าหมาย?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            การดำเนินการนี้จะลบเป้าหมายและความก้าวหน้าทั้งหมดของคุณ ไม่สามารถกู้คืนได้
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 text-white border-none"
                            onClick={async () => {
                                if (activeGoal?.id) {
                                    await deleteGoal(activeGoal.id);
                                    refetch();
                                }
                            }}
                        >
                            ยืนยันการลบ
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
