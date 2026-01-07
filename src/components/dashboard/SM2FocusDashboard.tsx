import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sunrise, Zap, BookOpen, Trophy, TrendingUp, Lock } from 'lucide-react';
import GoalJourneyMap from './GoalJourneyMap';
import { TodaySchedule } from './TodaySchedule';
import { CreateGoalDialog } from '@/components/pro/CreateGoalDialog';
import { useStudyGoals } from '@/hooks/useStudyGoals';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { StudyGoal } from '@/types/goals'; // Ensure we import type

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
    }, [user?.id, activeGoal]); // Re-fetch on goal change

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
                <Card className="border-2 border-purple-500/30 bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-purple-500/20">
                    <CardContent className="p-12 text-center relative overflow-hidden">
                        {/* Animated Background Orbs - More Subtle */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                        </div>

                        {/* Icon with Glow */}
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200 }}
                            className="relative z-10 mx-auto w-24 h-24 mb-6"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                            <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center w-full h-full shadow-2xl">
                                <Trophy className="h-12 w-12 text-white" />
                            </div>
                        </motion.div>

                        {/* Title - With Shadow */}
                        <h3 className="text-4xl font-bold text-white mb-4 relative z-10" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                            No Active Goal
                        </h3>

                        {/* Description - Brighter */}
                        <p className="text-slate-200 text-lg mb-8 max-w-md mx-auto relative z-10" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
                            Create a study goal to start your learning journey!
                        </p>

                        {/* Create Goal Button */}
                        <Button
                            onClick={() => setShowCreateGoal(true)}
                            className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white px-8 py-6 text-lg font-bold shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 transition-all hover:scale-105 relative z-10"
                            size="lg"
                        >
                            <Trophy className="mr-2 h-6 w-6" />
                            Create Goal
                        </Button>
                    </CardContent>
                </Card>

                {/* Create Goal Dialog */}
                <CreateGoalDialog
                    open={showCreateGoal}
                    onOpenChange={setShowCreateGoal}
                />
            </>
        );
    }



    const handleStartSession = (mode: 'standard' | 'early-bird' | 'bonus') => {
        // Navigate to appropriate session type
        if (mode === 'early-bird') {
            // Start next day's session early
            navigate('/learning-session', {
                state: {
                    goalId: activeGoal.id,
                    mode: 'early-bird',
                    day: activeGoal.current_day + 1
                }
            });
        } else if (mode === 'bonus') {
            // Bonus practice (weak words only)
            navigate('/learning-session', {
                state: {
                    goalId: activeGoal.id,
                    mode: 'bonus-practice'
                }
            });
        } else {
            // Standard session
            navigate('/learning-session', {
                state: {
                    goalId: activeGoal.id,
                    mode: 'standard',
                    day: activeGoal.current_day
                }
            });
        }
    };

    const handleMilestoneClick = (milestone: any) => {
        // Prevent clicking future milestones
        if (activeGoal.current_day < milestone.day) {
            toast({
                title: "ใจเย็นวัยรุ่น! 🚧",
                description: "รีบหรอยังไม่ถึงวันเลย ฝึกวันนี้ให้ครบก่อนนะครับ!",
                variant: "default",
                className: "bg-amber-500 text-white border-none"
            });
            return;
        }

        // Protect Against Re-Doing Completed Tests
        const isPastDay = activeGoal.current_day > milestone.day;
        let isCompletedToday = false;

        // Check if actually done based on DB records
        if (milestone.type === 'pretest') {
            isCompletedToday = todaysPracticeSessions.some(s => s.session_mode === 'pretest');
        } else if (milestone.type === 'interim') {
            isCompletedToday = todaysPracticeSessions.some(s => s.session_mode === 'interim');
        } else if (milestone.type === 'posttest') {
            isCompletedToday = todaysPracticeSessions.some(s => s.session_mode === 'posttest');
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
            case 'pretest':
                navigate('/pre-test', {
                    state: {
                        goalId: activeGoal.id,
                        deckIds: activeGoal.deck_ids,
                        totalWords: activeGoal.target_words
                    }
                });
                break;
            case 'interim':
                navigate('/interim-test', {
                    state: {
                        goalId: activeGoal.id,
                        deckIds: activeGoal.deck_ids,
                        testNumber: milestone.id - 9,
                        currentDay: activeGoal.current_day
                    }
                });
                break;
            case 'posttest':
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
            {/* Main Journey Map (Left) */}
            <div className="lg:col-span-8 h-full">
                <GoalJourneyMap
                    goal={activeGoal}
                    onMilestoneClick={handleMilestoneClick}
                    onStartSession={() => handleStartSession('standard')}
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
