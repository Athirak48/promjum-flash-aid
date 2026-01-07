import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Check, Play, Circle, Clock, Target, Sparkles, TrendingUp,
    Calendar, Zap, ArrowRight, Star, AlertTriangle, X, Crown, Flame, ClipboardCheck, RotateCcw, Lock, Repeat // Added Repeat icon
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

interface TodayScheduleProps {
    activeGoal: StudyGoal | null;
    refetch: () => void;
    deleteGoal: (id: string) => Promise<void>;
    startSmartSession: (goal: StudyGoal, navigate: any, isBonus: boolean, bonusType?: 'random' | 'weak', customLimit?: number) => void;
}

export function TodaySchedule({ activeGoal, refetch, deleteGoal, startSmartSession }: TodayScheduleProps) {
    const { user } = useAuth();
    const navigate = useNavigate();
    // Removed internal useStudyGoals hook to rely on parent props
    const { weakWords, loading: weakWordsLoading } = useWeakWords(user?.id);
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

        // Calculate progress percentage for "today"
        // Robustness: Use the greater of: calculated logic OR actual DB records count
        let sessionsCompletedToday = activeGoal.sessions_completed % (activeGoal.sessions_per_day || 1);

        // Override with actual records if available (fixes Pre-Test 0 score issue robustly)
        if (todaysPracticeSessions.length > sessionsCompletedToday) {
            // Basic logic: if we have more records than the algo thinks, trust the records
            // But careful not to overcount if logic is cumulative.
            // For Day 1, records are absolute truth.
            if (currentDay === 1 || todaysPracticeSessions.length > 0) {
                sessionsCompletedToday = Math.max(sessionsCompletedToday, todaysPracticeSessions.length);
            }
        }

        const sessionsPerDay = activeGoal.sessions_per_day || 1;
        const todayProgress = Math.round((sessionsCompletedToday / sessionsPerDay) * 100);

        // Sessions List
        const sessions = [];

        // Determine Test Days matches startSmartSession logic
        const isPreTest = currentDay === 1;
        let isInterimTestDay = false;
        if (durationDays < 14) {
            isInterimTestDay = (currentDay === 3 || currentDay === 6);
        } else {
            isInterimTestDay = (currentDay > 1 && currentDay % 7 === 0);
        }
        const isPostTestDay = currentDay === durationDays;

        // Priority: Post > Interim > Pre (though logically distinct)
        if (isPostTestDay) isInterimTestDay = false;

        // Check completion status from ACTUAL records
        // This prevents the "infinite retake" bug because we check if a record exists
        // FIX: Also check 'assessments' (history) because sometimes practice_sessions insert fails or user is migrating.
        const preTestDone = isPreTest && (
            todaysPracticeSessions.some(s => s.session_mode === 'pretest') ||
            assessments.some(a => a.assessment_type === 'pretest')
        );
        const interimDone = isInterimTestDay && todaysPracticeSessions.some(s => s.session_mode === 'interim');
        const postTestDone = isPostTestDay && todaysPracticeSessions.some(s => s.session_mode === 'posttest');

        // Session 1 (08:00) - The Assessment Slot
        const isAssessmentSession = isPreTest || isInterimTestDay || isPostTestDay;

        let session1Status: 'completed' | 'ready' | 'waiting' | 'locked' = 'ready'; // Default

        if (isAssessmentSession) {
            // Assessment Logic: strictly check if done
            if (isPreTest && preTestDone) session1Status = 'completed';
            else if (isInterimTestDay && interimDone) session1Status = 'completed';
            else if (isPostTestDay && postTestDone) session1Status = 'completed';
            else session1Status = 'ready'; // If not done, it's ready (assuming time unlocked logic is handled later or ignored for tests)
        } else {
            // Normal Logic
            session1Status = sessionsCompletedToday >= 1 ? 'completed' : 'ready';
        }

        let session1Label = 'Session 1';
        let session1Desc = `${activeGoal.words_per_session || 20} คำ`;

        if (isPreTest) {
            session1Label = 'Pre-Test';
            session1Desc = 'ทดสอบวัดระดับ';
        } else if (isInterimTestDay) {
            session1Label = 'Interim Test';
            session1Desc = 'ทดสอบระหว่างเรียน';
        } else if (isPostTestDay) {
            session1Label = 'Post-Test';
            session1Desc = 'ทดสอบประมวลผล';
        }

        sessions.push({
            time: '08:00',
            label: session1Label,
            description: session1Desc,
            status: session1Status,
            isCurrent: session1Status !== 'completed' && sessionsCompletedToday === 0,
            isSpecial: isAssessmentSession, // Flag for special styling
            isAssessment: isAssessmentSession // Flag to hide Bonus button
        });

        // Session 2 (14:00)
        if (sessionsPerDay >= 2) {
            // Determine if Session 2 is accessible. 
            // If Session 1 was assessment, we must ensure it's COMPLETED before unlocking Session 2.
            // sessionsCompletedToday counts sessions. If assessment didn't increment count (per previous fix), 
            // we might have an issue where Session 2 relies on count.
            // BUT: todaysPracticeSessions include the assessment session record.
            // So sessionsCompletedToday = todaysPracticeSessions.length.
            // Since I fixed PreTestPage to INSERT session but NOT update goal words, it DOES insert a session.
            // So logic `sessionsCompletedToday >= 1` is still valid for unlocking Session 2!

            sessions.push({
                time: '14:00',
                label: `Session 2`,
                description: `${activeGoal.words_per_session || 20} คำ`,
                status: sessionsCompletedToday >= 2 ? 'completed' : (sessionsCompletedToday >= 1 ? 'ready' : 'waiting'),
                isCurrent: sessionsCompletedToday === 1
            });
        }

        // Session 3 (20:00)
        if (sessionsPerDay >= 3) {
            sessions.push({
                time: '20:00',
                label: `Session 3`,
                description: `${activeGoal.words_per_session || 20} คำ`,
                status: sessionsCompletedToday >= 3 ? 'completed' : (sessionsCompletedToday >= 2 ? 'ready' : 'waiting'),
                isCurrent: sessionsCompletedToday === 2
            });
        }

        const remainingSessions = sessionsPerDay - sessionsCompletedToday;

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
    }, [activeGoal]);

    // View 1: Create Goal Promo (No Active Goal)
    if (!activeGoal) {
        return (
            <>
                <div className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0b] p-8 shadow-2xl transition-all duration-500 hover:border-purple-500/30 hover:shadow-purple-900/20">
                    {/* Premium Background Effects */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-[#0a0a0b] to-[#0a0a0b]" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 grayscale" />

                    {/* Animated Glows */}
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-500/20 blur-[100px] transition-all duration-700 group-hover:bg-purple-500/30" />
                    <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-blue-500/10 blur-[100px] transition-all duration-700 group-hover:bg-blue-500/20" />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col justify-center h-full space-y-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300 shadow-[0_0_15px_-5px_#a855f7]">
                                <Crown className="h-3.5 w-3.5" />
                                <span>PRO FEATURE</span>
                            </div>

                            <h2 className="text-3xl font-bold tracking-tight text-white">
                                <span className="bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                                    สร้างเป้าหมาย<br />การเรียนรู้
                                </span>
                            </h2>

                            <p className="text-slate-400 text-sm leading-relaxed max-w-[90%]">
                                ปลดล็อกขีดจำกัดการเรียนรู้ด้วยระบบ SRS อัจฉริยะ ให้ AI ช่วยวางแผนการจำของคุณให้แม่นยำที่สุด
                            </p>
                        </div>

                        <div className="grid gap-3">
                            {[
                                { icon: Sparkles, text: "แบ่งเรียนเป็น Session ย่อย", color: "text-amber-300" },
                                { icon: TrendingUp, text: "ระบบคำนวณวันจบอัตโนมัติ", color: "text-blue-300" },
                                { icon: Target, text: "ติดตามผลแบบ Real-time", color: "text-green-300" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-sm text-slate-300 transition-colors hover:bg-white/[0.05]">
                                    <item.icon className={cn("h-4 w-4 shrink-0 shadow-lg", item.color)} />
                                    <span>{item.text}</span>
                                </div>
                            ))}
                        </div>

                        <Button
                            onClick={() => setIsCreateDialogOpen(true)}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-7 rounded-xl shadow-[0_0_30px_-5px_rgba(79,70,229,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_-5px_rgba(147,51,234,0.4)] group/btn relative overflow-hidden border border-white/10"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] transition-transform duration-1000 group-hover/btn:translate-x-[200%]" />
                            <span className="flex items-center gap-2 text-base">
                                เริ่มต้นวางแผน
                                <ArrowRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
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
            <div className="h-full relative overflow-hidden rounded-3xl border-2 border-purple-500/20 bg-slate-900/40 backdrop-blur-sm p-6 shadow-xl flex flex-col">
                {/* Premium Background Effects */}
                <div className="absolute top-0 right-0 h-[300px] w-[300px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent blur-[60px] opacity-60" />
                <div className="absolute bottom-0 left-0 h-[200px] w-[200px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent blur-[60px]" />

                {/* Reset Goal Button - Absolute Top Right (outside header area) */}
                <button
                    className="absolute top-2 right-2 z-20 flex items-center gap-1 text-[9px] text-slate-500 hover:text-red-400 transition-all group bg-white/5 hover:bg-red-500/10 px-1.5 py-0.5 rounded-md border border-white/10 hover:border-red-500/30"
                    onClick={() => setIsResetDialogOpen(true)}
                >
                    <RotateCcw className="h-2.5 w-2.5 group-hover:rotate-[-45deg] transition-transform" />
                    <span>Reset</span>
                </button>

                {/* Header Section */}
                <div className="relative z-10 flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 opacity-30 blur-md" />
                            <div className="relative rounded-xl bg-gradient-to-b from-amber-500/20 to-orange-500/20 p-3 ring-1 ring-inset ring-amber-500/40 backdrop-blur-md">
                                <Clock className="h-6 w-6 text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.5)]" />
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg tracking-tight">กำหนดการวันนี้</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5">
                                    <Target className="h-3 w-3 text-amber-400" />
                                    <span className="text-[10px] font-medium text-amber-200">{scheduleData.targetWords} คำ</span>
                                </div>
                                <span className="text-white/20">|</span>
                                <span className="text-xs text-slate-400">เหลือ {scheduleData.durationDays} วัน</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end">
                        <div className="relative">
                            <span className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 drop-shadow-sm">
                                {Math.round((scheduleData.currentDay / scheduleData.totalDuration) * 100)}
                                <span className="text-lg text-slate-500 font-bold ml-0.5">%</span>
                            </span>
                        </div>
                        <div className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em]">Course Progress</div>
                    </div>
                </div>



                {/* Pro Insights Grid - Glass Cards */}
                <div className="relative z-10 grid grid-cols-3 gap-3 mb-8">
                    {/* Card 1: Mastered Words - Emerald Theme */}
                    <div className="group relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-slate-900/60 p-3 transition-all hover:border-emerald-500/40 hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]">
                        {/* Background Pattern - Dot Grid */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b9811a_1px,transparent_1px),linear-gradient(to_bottom,#10b9811a_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)]" />

                        <div className="relative z-10">
                            <div className="text-[10px] font-bold text-emerald-400 mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                                <div className="p-1 rounded-md bg-emerald-500/20 ring-1 ring-emerald-500/30">
                                    <Check className="h-2.5 w-2.5" />
                                </div>
                                <span>Mastered</span>
                            </div>
                            <div className="text-xl font-bold text-white tracking-tight mt-1 flex items-baseline">
                                {activeGoal.words_learned || 0}
                                <span className="text-[10px] text-slate-500 font-normal mx-1">/</span>
                                <span className="text-xs text-slate-400">{scheduleData.targetWords}</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Risk Words - Rose Theme */}
                    <div
                        className="group relative cursor-pointer overflow-hidden rounded-2xl border border-rose-500/20 bg-gradient-to-br from-rose-950/40 via-slate-900/60 to-slate-900/60 p-3 transition-all hover:border-rose-500/40 hover:shadow-[0_0_20px_-5px_rgba(244,63,94,0.3)]"
                        onClick={() => setIsWeakWordsOpen(true)}
                    >
                        {/* Background Pattern - Diagonal Lines */}
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f43f5e_1px,transparent_1px)] [background-size:12px_12px]" />

                        <div className="absolute bottom-0 right-0 opacity-20 group-hover:opacity-30 transition-opacity transform group-hover:scale-110 duration-500">
                            <Flame className="h-16 w-16 text-rose-500 -mb-4 -mr-4 blur-[2px]" />
                        </div>

                        <div className="relative z-10">
                            <div className="text-[10px] font-bold text-rose-400 mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                                <div className="p-1 rounded-md bg-rose-500/20 ring-1 ring-rose-500/30">
                                    <AlertTriangle className="h-2.5 w-2.5" />
                                </div>
                                <span>Risk Words</span>
                            </div>
                            <div className="flex items-baseline gap-1 mt-1">
                                <div className="text-xl font-bold text-rose-100 tracking-tight">
                                    {weakWords.length}
                                </div>
                                <span className="text-[10px] text-rose-400/60 font-medium">คำ</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Tests */}
                    {/* Card 3: Tests - Blue Theme */}
                    <div
                        className="group relative cursor-pointer overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-950/40 via-slate-900/60 to-slate-900/60 p-3 transition-all hover:border-blue-500/40 hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]"
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
                            <div className="text-[10px] font-bold text-blue-400 mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                                <div className="p-1 rounded-md bg-blue-500/20 ring-1 ring-blue-500/30">
                                    <ClipboardCheck className="h-2.5 w-2.5" />
                                </div>
                                <span>Tests</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                                <div className="text-sm font-bold text-blue-100 tracking-tight">ดูประวัติ</div>
                                <ArrowRight className="h-3 w-3 text-blue-400 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>
                </div>



                {/* Sessions Timeline - Premium Cards */}
                <div className="relative z-10 flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar -mr-2 pl-1 pb-1">
                    {scheduleData.sessions.map((session, index) => (
                        <div
                            key={index}
                            className={cn(
                                "group relative flex items-center gap-4 rounded-xl border p-4 transition-all duration-300",
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
                                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all shadow-lg",
                                session.status === 'completed'
                                    ? "border-green-500/30 bg-gradient-to-br from-green-500/20 to-emerald-500/10 text-green-400"
                                    : (session as any).isSpecial
                                        ? "border-blue-500/50 bg-gradient-to-br from-blue-500/20 to-indigo-500/10 text-blue-400 animate-pulse" // Special Style
                                        : session.isCurrent
                                            ? "border-amber-500/50 bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-amber-400 scale-105"
                                            : "border-white/5 bg-slate-800/30 text-slate-600"
                            )}>
                                {session.status === 'completed' ? (
                                    <Check className="h-5 w-5 drop-shadow-[0_0_3px_rgba(74,222,128,0.5)]" />
                                ) : (session as any).isSpecial ? (
                                    <ClipboardCheck className="h-5 w-5 ml-1 fill-current drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]" />
                                ) : session.isCurrent ? (
                                    <Play className="h-5 w-5 ml-1 fill-current drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]" />
                                ) : (
                                    <div className="h-2 w-2 rounded-full bg-slate-600 ring-4 ring-slate-800" />
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <span className={cn(
                                        "text-sm font-bold tracking-tight",
                                        (session as any).isSpecial ? "text-blue-200" :
                                            session.isCurrent ? "text-amber-100" : "text-slate-300"
                                    )}>
                                        {session.label}
                                        <span className={cn("text-xs font-medium ml-2 opacity-60",
                                            (session as any).isSpecial ? "text-blue-300" :
                                                session.isCurrent ? "text-amber-200" : "text-slate-500")}>
                                            {session.time}
                                        </span>
                                    </span>
                                    {session.isCurrent && (
                                        <div className="flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-amber-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-xs text-slate-500 font-medium">
                                    {session.description}
                                </div>
                            </div>

                            {/* Action Button - Smart Logic (Time Gated + Bonus) */}
                            {session.status === 'completed' && !(session as any).isAssessment ? (
                                /* Bonus Mode - Pink Button (Only for regular sessions, NOT assessments) */
                                <Button
                                    size="sm"
                                    onClick={() => startSmartSession(activeGoal, navigate, true)}
                                    className="shrink-0 h-9 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-bold text-xs rounded-lg px-4 shadow-[0_0_15px_-3px_rgba(236,72,153,0.4)] hover:shadow-[0_0_20px_-3px_rgba(236,72,153,0.6)] transition-all hover:scale-105 active:scale-95 border-b-2 border-pink-700"
                                >
                                    <Sparkles className="h-3 w-3 mr-1.5" />
                                    Bonus
                                </Button>
                            ) : session.status === 'completed' ? (
                                /* Assessment completed - Just show checkmark, no Bonus */
                                null
                            ) : (
                                /* Standard Mode - Gold (Ready) or Gray (Locked) */
                                (() => {
                                    // Parse session time (e.g. "14:00" -> 14)
                                    const sessionHour = parseInt(session.time.split(':')[0]);
                                    const currentHour = new Date().getHours();
                                    // Unlock 1 hour before (e.g. 14:00 unlocks at 13:00)
                                    // For testing/demo, we can be more lenient or strict.
                                    // User Requirement: "7โมงปุ่มstartก็กดเล่นได้" (For 8:00) -> 1 hour buffer.
                                    const isUnlocked = currentHour >= (sessionHour - 1);

                                    // Override for "Session 1" (Morning) or if it's the very first session of the day, 
                                    // maybe we allow it? "First session" usually ready immediately if it's "today".
                                    // But let's stick to strict logic for "Smart" feel.
                                    // EXCEPTION: If it is PAST the time, it should definitely be unlocked (which logic covers).

                                    if (isUnlocked) {
                                        return (
                                            <Button
                                                size="sm"
                                                onClick={() => startSmartSession(activeGoal, navigate, false)}
                                                className="shrink-0 h-9 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-xs rounded-lg px-4 shadow-[0_0_15px_-3px_rgba(245,158,11,0.4)] hover:shadow-[0_0_20px_-3px_rgba(245,158,11,0.6)] transition-all hover:scale-105 active:scale-95 border-b-2 border-amber-600"
                                            >
                                                Start
                                            </Button>
                                        );
                                    } else {
                                        return (
                                            <Button
                                                size="sm"
                                                disabled
                                                className="shrink-0 h-9 bg-slate-800 text-slate-500 font-bold text-xs rounded-lg px-4 border border-white/5 cursor-not-allowed opacity-70"
                                            >
                                                <Lock className="h-3 w-3 mr-1.5" />
                                                Wait
                                            </Button>
                                        );
                                    }
                                })()
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer - Motivational */}
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-center">
                    {scheduleData.remainingSessions > 0 ? (
                        <p className="text-xs text-amber-500/80 font-medium flex items-center gap-2 animate-pulse">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_#f59e0b]" />
                            Keep going! เหลืออีก {scheduleData.remainingSessions} ครั้ง
                        </p>
                    ) : (
                        <p className="text-xs text-green-400/80 font-medium flex items-center gap-2">
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
                                    <div key={idx} className="group flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-red-500/30 hover:bg-red-500/[0.03] transition-all duration-300">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-xs font-bold text-slate-500 group-hover:text-white transition-colors">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg text-slate-200 group-hover:text-red-200 transition-colors tracking-wide">{word.word}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 font-bold border border-red-500/10">
                                                        ผิด {word.times_wrong} ครั้ง
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="flex h-1.5 w-16 overflow-hidden rounded-full bg-slate-800">
                                                <div
                                                    className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                                                    style={{ width: `${Math.min(100, Math.round(word.difficulty_score * 100))}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-medium text-slate-500">Difficulty</span>
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
                <DialogContent className="bg-[#0f0f11]/95 backdrop-blur-xl border border-white/10 text-white max-w-md shadow-2xl overflow-hidden p-0 gap-0">
                    {/* Header */}
                    <div className="relative p-6 bg-gradient-to-b from-blue-500/10 to-transparent border-b border-white/5">
                        <div className="absolute top-0 right-0 p-6 opacity-20">
                            <ClipboardCheck className="h-24 w-24 text-blue-500 blur-sm transform rotate-12" />
                        </div>
                        <DialogHeader className="relative z-10">
                            <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-white">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 ring-1 ring-blue-500/40 shadow-[0_0_15px_-3px_rgba(59,130,246,0.4)]">
                                    <ClipboardCheck className="h-6 w-6 text-blue-500" />
                                </div>
                                ประวัติการทดสอบ
                            </DialogTitle>
                            <DialogDescription className="text-slate-400 font-medium mt-2">
                                ดูผลการทดสอบ Pretest และ Mid-test ของคุณ
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar bg-[#0a0a0b]">
                        {assessments.length > 0 ? (
                            <div className="grid gap-3">
                                {assessments.map((assessment, idx) => (
                                    <div key={idx} className="group flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/[0.03] transition-all duration-300">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold",
                                                assessment.assessment_type === 'pretest'
                                                    ? "bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/30"
                                                    : "bg-green-500/20 text-green-300 ring-1 ring-green-500/30"
                                            )}>
                                                {assessment.assessment_type === 'pretest' ? 'Pre' : 'Mid'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-200 group-hover:text-blue-200 transition-colors">
                                                    {assessment.assessment_type === 'pretest' ? 'Pretest' : 'Mid-test'}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] text-slate-500">
                                                        {new Date(assessment.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                                                    </span>
                                                    {assessment.completed_at && (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 font-medium">
                                                            เสร็จแล้ว
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            {assessment.completed_at ? (
                                                <>
                                                    <div className="text-xl font-black text-white">
                                                        {Math.round((assessment.correct_answers / assessment.total_questions) * 100)}%
                                                    </div>
                                                    <span className="text-[10px] text-slate-500">
                                                        {assessment.correct_answers}/{assessment.total_questions} ถูก
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-medium">
                                                    ยังไม่เสร็จ
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="rounded-full bg-blue-500/10 p-4 mb-4 ring-1 ring-blue-500/20">
                                    <ClipboardCheck className="h-8 w-8 text-blue-500" />
                                </div>
                                <h4 className="text-white font-bold text-lg">ยังไม่มีการทดสอบ</h4>
                                <p className="text-slate-400 text-sm mt-1 max-w-[200px]">
                                    เริ่มเรียนและทำ Pretest เพื่อดูประวัติที่นี่
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-[#0a0a0b] border-t border-white/5 flex justify-end">
                        <Button
                            variant="ghost"
                            onClick={() => setIsTestsDialogOpen(false)}
                            className="text-slate-400 hover:text-white hover:bg-white/5"
                        >
                            Close
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
