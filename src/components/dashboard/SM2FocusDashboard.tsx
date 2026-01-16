import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sunrise, Zap, BookOpen, Trophy, TrendingUp, Lock, Sparkles, Brain, Plus } from 'lucide-react';
import GoalJourneyMap from './GoalJourneyMap';
import { TodaySchedule } from './TodaySchedule';
import { CreateGoalDialog } from '@/components/pro/CreateGoalDialog';
import { useStudyGoals } from '@/hooks/useStudyGoals';
import { useAuth } from '@/hooks/useAuth';
import { useAssessment } from '@/hooks/useAssessment';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PricingDialog } from '@/components/pro/PricingDialog';

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { StudyGoal } from '@/types/goals';
import { getSessionWindow } from '@/lib/sessionTimeUtils';

interface SM2FocusDashboardProps {
    activeGoal?: StudyGoal | null;
    refetch?: () => void;
    deleteGoal?: (id: string) => Promise<void>;
    startSmartSession?: (goal: StudyGoal, navigate: any, isBonus?: boolean) => Promise<void>;
    loading?: boolean;
}

export default function SM2FocusDashboard({
    activeGoal: propActiveGoal,
    refetch: propRefetch,
    deleteGoal: propDeleteGoal,
    startSmartSession: propStartSmartSession,
    loading: propLoading
}: SM2FocusDashboardProps = {}) {
    // Internal hook for standalone usage (fallback)
    const hook = useStudyGoals();

    // Use props if available, otherwise internal hook
    // Note: hook is always called (rules of hooks), but we ignore its values if props are passed.
    const activeGoal = propActiveGoal !== undefined ? propActiveGoal : hook.activeGoal;
    const refetch = propRefetch || hook.refetch;
    const deleteGoal = propDeleteGoal || hook.deleteGoal;
    const startSmartSession = propStartSmartSession || hook.startSmartSession;
    const loading = propLoading !== undefined ? propLoading : hook.loading;

    const { user } = useAuth();
    const { toast } = useToast();

    const navigate = useNavigate();
    const [showCreateGoal, setShowCreateGoal] = useState(false);
    const [showPricing, setShowPricing] = useState(false);

    const [todaysPracticeSessions, setTodaysPracticeSessions] = useState<any[]>([]);
    const [assessments, setAssessments] = useState<any[]>([]);
    const { getGoalAssessments } = useAssessment();

    useEffect(() => {
        const fetchTodaysSessions = async () => {
            if (!user?.id) return;
            try {
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);

                // FIX: Strictly filter by Current Goal ID to ignore deleted/old goals
                let query = supabase
                    .from('practice_sessions')
                    .select('*')
                    .eq('user_id', user.id)
                    .gte('created_at', todayStart.toISOString());

                if (activeGoal?.id) {
                    query = query.eq('goal_id', activeGoal.id);
                }

                const { data } = await query;

                if (data) {
                    setTodaysPracticeSessions(data);
                }
            } catch (err) {
                console.error("Error fetching sessions", err);
            }
        };

        fetchTodaysSessions();
    }, [user?.id, activeGoal]); // Re-fetch on goal change

    // Fetch assessments (permanent goal test history)
    useEffect(() => {
        const loadAssessments = async () => {
            if (!activeGoal?.id) return;
            try {
                const data = await getGoalAssessments(activeGoal.id);
                setAssessments(data || []);
            } catch (err) {
                console.error("Error fetching assessments:", err);
                setAssessments([]);
            }
        };
        loadAssessments();
    }, [activeGoal?.id, getGoalAssessments]);

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <p className="text-center text-muted-foreground">Loading...</p>
                </CardContent>
            </Card>
        );
    }



    if (!activeGoal) {
        return (
            <>
                <div
                    onClick={() => setShowCreateGoal(true)}
                    className="group relative h-auto min-h-[350px] w-full flex flex-col items-center justify-center p-8 rounded-3xl border border-dashed border-slate-300 dark:border-indigo-500/20 hover:border-indigo-400/50 hover:border-solid bg-white/50 dark:bg-slate-950/30 hover:bg-white/80 dark:hover:bg-slate-900/40 transition-all duration-500 cursor-pointer overflow-hidden shadow-lg shadow-indigo-500/5 backdrop-blur-sm"
                >
                    {/* Deep Space Background elements - Lighter Touch */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-900/5 to-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                    {/* Stars / Noise Texture (Subtle) */}
                    <div className="absolute inset-0 opacity-[0.1] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none mix-blend-overlay" />

                    {/* Hover Glow Effect - Nebula */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                    {/* Pro Badge - Floating */}
                    <div className="absolute top-6 right-6 animate-in fade-in zoom-in duration-700 z-20">
                        <Badge variant="outline" className="bg-slate-950/40 text-indigo-300 border-indigo-500/30 backdrop-blur-md shadow-[0_0_15px_-3px_rgba(99,102,241,0.1)] group-hover:shadow-[0_0_20px_-3px_rgba(99,102,241,0.4)] transition-shadow">
                            <Sparkles className="w-3 h-3 mr-1.5 fill-indigo-400 animate-pulse" />
                            AI PRO SYSTEM
                        </Badge>
                    </div>

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center max-w-lg text-center relative z-10"
                    >
                        {/* Central Visual - Breathing */}
                        <div className="relative mb-3 group-hover:scale-105 transition-transform duration-500">
                            <div className="absolute inset-0 bg-indigo-600 blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity duration-500 animate-pulse" />
                            <div className="relative w-16 h-16 rounded-2xl bg-slate-950/80 shadow-2xl border border-white/10 flex items-center justify-center group-hover:border-indigo-500/50 transition-colors duration-300 ring-1 ring-white/5 backdrop-blur-xl">
                                <Brain className="w-9 h-9 text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                            </div>

                            {/* Floating Decor */}
                            <div className="absolute -right-2 -top-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full rotate-12 shadow-lg border border-white/10 z-20">
                                AI
                            </div>
                        </div>

                        <h2 className="text-xl md:text-3xl font-black text-slate-100 mb-3 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-cyan-400 transition-all duration-300 drop-shadow-md">
                            สร้างเป้าหมายการเรียน
                        </h2>

                        <p className="text-slate-400 text-sm md:text-base mb-6 max-w-md leading-relaxed group-hover:text-slate-200 transition-colors font-medium">
                            เลือกชุดคำศัพท์ที่อยากจำเร่งด่วน 🚀
                        </p>

                        <Button
                            size="lg"
                            className="relative overflow-hidden bg-gradient-to-b from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-slate-900 font-black rounded-2xl px-12 h-16 text-xl shadow-[0_10px_20px_rgba(245,158,11,0.3)] hover:shadow-[0_15px_30px_rgba(245,158,11,0.4)] hover:-translate-y-1 transition-all duration-300 w-auto group-active:scale-95 border-b-[6px] border-amber-600 active:border-b-0 active:translate-y-1 ring-1 ring-white/20"
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />

                            <Plus className="w-7 h-7 mr-2.5 stroke-[3] drop-shadow-sm" />
                            <span className="drop-shadow-sm tracking-tight">เริ่มใช้งาน Focus Mode</span>
                        </Button>

                    </motion.div>
                </div>

                {/* Create Goal Dialog */}
                <CreateGoalDialog
                    open={showCreateGoal}
                    onOpenChange={setShowCreateGoal}
                    onGoalCreated={() => {
                        console.log("Goal created, refetching dashboard...");
                        refetch();
                    }}
                />

                {/* Pricing / Upsell Dialog */}
                <PricingDialog open={showPricing} onOpenChange={setShowPricing} />
            </>
        );
    }




    // --- Session Status Logic for Big Button ---
    const sessionsPerDay = activeGoal?.sessions_per_day || 1;

    const rawCompletions = todaysPracticeSessions.filter(s =>
        (['standard', 'early-bird', 'night-owl'].includes(s.session_type) && s.session_mode !== 'bonus') ||
        (['pre-test', 'interim', 'post-test'].includes(s.session_mode))
    );

    // FIX: Deduplicate logs (same logic as TodaySchedule)
    const validCompletions = rawCompletions.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .filter((session, index, array) => {
            if (index === 0) return true;
            const prevSession = array[index - 1];
            const timeDiff = new Date(session.created_at).getTime() - new Date(prevSession.created_at).getTime();
            return timeDiff > 60000; // Keep only if > 1 minute apart
        });

    const sessionsCompletedToday = validCompletions.length;

    let bigButtonStatus: 'locked' | 'ready' | 'completed' | 'bonus' = 'locked';
    let nextSessionTimeStr = '';

    if (sessionsCompletedToday >= sessionsPerDay) {
        // All done -> Bonus Mode
        bigButtonStatus = 'bonus';
    } else {
        // Check next session
        const nextIndex = sessionsCompletedToday;

        // Construct times array (Sync with TodaySchedule logic)
        const allSessionTimes = [];
        allSessionTimes.push('08:00');
        if (sessionsPerDay >= 2) allSessionTimes.push('14:00');
        if (sessionsPerDay >= 3) allSessionTimes.push('20:00');
        if (sessionsPerDay >= 4) allSessionTimes.push('22:00');

        const window = getSessionWindow(allSessionTimes, nextIndex);

        if (window.status === 'ready') bigButtonStatus = 'ready';
        else if (window.status === 'missed') bigButtonStatus = 'ready'; // Allow playing missed sessions? Usually yes for "Start"
        else bigButtonStatus = 'locked';

        // Special Case: Pre-Test Day 1
        // If Day 1, Index 1 (Session 2). If Pre-test done, Unlock immediately.
        // We need to know if pre-test done.
        if (activeGoal?.current_day === 1 && nextIndex === 1) {
            const preTestDone = assessments.some(a => a.assessment_type === 'pre-test') ||
                todaysPracticeSessions.some(s => s.session_mode === 'pre-test');

            if (preTestDone) {
                // USER REQUEST: If Pre-Test done but Session 2 is time-locked, show BONUS (Pink)
                // If Session 2 is ready, show READY (Orange)
                if (window.status === 'ready' || window.status === 'missed') {
                    bigButtonStatus = 'ready';
                } else {
                    bigButtonStatus = 'bonus';
                }
            }
        }

        nextSessionTimeStr = allSessionTimes[nextIndex] || '';
    }

    const handleStartSession = (mode: 'standard' | 'early-bird' | 'bonus') => {
        if (!activeGoal) return;

        // If big button is 'bonus' (All done), force bonus mode
        // Or if explicitly passed 'bonus'
        const finalMode = (bigButtonStatus === 'bonus' || mode === 'bonus') ? 'bonus' : 'start';

        // Navigate to multi-game session page
        navigate('/multi-game-session', {
            state: {
                goalId: activeGoal.id,
                mode: finalMode,
                goalName: activeGoal.goal_name,
                goalConfig: {
                    goalId: activeGoal.id,
                    targetWords: activeGoal.target_words,
                    totalDurationDays: activeGoal.duration_days,
                    currentDay: activeGoal.current_day,
                    wordsLearned: activeGoal.words_learned || 0,
                    sessionsPerDay: activeGoal.sessions_per_day || 1,
                    deckIds: activeGoal.deck_ids || []
                }
            }
        });
    };

    const handleMilestoneClick = (milestone: any) => {
        console.log("Milestone Clicked:", milestone);
        toast({ title: "Debug Click", description: `Clicked: ${milestone.type} (Day ${milestone.day})` });

        // Prevent clicking future milestones
        /* TEMPORARY BYPASS FOR TESTING POST-TEST LOGIC
        if (activeGoal.current_day < milestone.day) {
            toast({
                title: "ใจเย็นวัยรุ่น! 🚧",
                description: "รีบหรอยังไม่ถึงวันเลย ฝึกวันนี้ให้ครบก่อนนะครับ!",
                variant: "default",
                className: "bg-amber-500 text-white border-none"
            });
            return;
        }
        */

        // Protect Against Re-Doing Completed Tests
        const isPastDay = activeGoal.current_day > milestone.day;
        let isCompletedToday = false;

        // Check if actually done based on DB records
        // FIX: Use assessments (permanent goal_assessments) FIRST to prevent reset bug
        if (milestone.type === 'pre-test') {
            isCompletedToday = assessments.some(a => a.assessment_type === 'pre-test') ||
                todaysPracticeSessions.some(s => s.session_mode === 'pre-test');
        } else if (milestone.type === 'post-test') {
            isCompletedToday = assessments.some(a => a.assessment_type === 'post-test') ||
                todaysPracticeSessions.some(s => s.session_mode === 'post-test');
        }

        if (isPastDay || isCompletedToday) {
            toast({
                title: "Test Completed",
                description: "คุณได้ทำแบบทดสอบนี้ไปแล้ว",
                variant: "default" // Not error, just info
            });
            return; // STOP NAVIGATION
        }

        // Navigate to appropriate test based on milestone type
        switch (milestone.type) {
            case 'pre-test':
                navigate('/pre-test', {
                    state: {
                        goalId: activeGoal.id,
                        deckIds: activeGoal.deck_ids,
                        totalWords: activeGoal.target_words
                    }
                });
                break;
            // Interim Test Removed
            case 'post-test':
                navigate('/post-test', {
                    state: {
                        goalId: activeGoal.id,
                        deckIds: activeGoal.deck_ids,
                        goalName: activeGoal.goal_name
                    }
                });
                break;
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
            {/* Main Journey Map (Left) */}
            <div className="lg:col-span-8 h-full">
                <GoalJourneyMap
                    goal={activeGoal}
                    onMilestoneClick={handleMilestoneClick}
                    onStartSession={() => handleStartSession('standard')}
                    bigButtonStatus={bigButtonStatus}
                />
            </div>


            {/* Sidebar Schedule (Right) */}
            <div className="lg:col-span-4 h-full">
                <TodaySchedule
                    activeGoal={activeGoal}
                    refetch={refetch}
                    deleteGoal={deleteGoal}
                    startSmartSession={startSmartSession}
                />
            </div>
        </div>
    );
}
