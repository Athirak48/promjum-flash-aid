import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useStudyGoals } from './useStudyGoals';
import { useToast } from './use-toast';

export function useGoalProgress() {
    const { activeGoal, updateProgress } = useStudyGoals();
    const { toast } = useToast();

    /**
     * Record a completed session for the active goal
     * @param cardsCompleted - Number of cards completed in this session
     */
    const recordSession = useCallback(async (cardsCompleted: number) => {
        if (!activeGoal) return;

        const newSessionsCompleted = activeGoal.sessions_completed + 1;
        const newWordsLearned = activeGoal.words_learned + cardsCompleted;

        // Update goal progress
        await updateProgress(
            activeGoal.id,
            newSessionsCompleted,
            newWordsLearned
        );

        // Check if goal is completed
        if (newWordsLearned >= activeGoal.target_words) {
            toast({
                title: '🎉 เป้าหมายสำเร็จ!',
                description: `ยินดีด้วย! คุณจำครบ ${activeGoal.target_words} คำแล้ว`,
            });

            // Complete the goal
            await supabase
                .from('user_goals')
                .update({
                    is_active: false,
                    completed_at: new Date().toISOString()
                })
                .eq('id', activeGoal.id);
        } else {
            // Show progress toast
            const sessionsToday = newSessionsCompleted % activeGoal.sessions_per_day;
            if (sessionsToday === 0) {
                toast({
                    title: '✅ ทำครบวันนี้แล้ว!',
                    description: `ยอดเยี่ยม! ${activeGoal.sessions_per_day} ครั้ง เสร็จสิ้น`,
                });
            } else {
                toast({
                    title: '✅ Session เสร็จ',
                    description: `${newWordsLearned}/${activeGoal.target_words} คำ • ${sessionsToday}/${activeGoal.sessions_per_day} ครั้งวันนี้`,
                });
            }
        }
    }, [activeGoal, updateProgress, toast]);

    /**
     * Get current session info
     */
    const getSessionInfo = useCallback(() => {
        if (!activeGoal) return null;

        const sessionsToday = activeGoal.sessions_completed % activeGoal.sessions_per_day;
        const progress = (activeGoal.words_learned / activeGoal.target_words) * 100;
        const wordsRemaining = activeGoal.target_words - activeGoal.words_learned;

        return {
            sessionsToday,
            sessionsPerDay: activeGoal.sessions_per_day,
            wordsPerSession: activeGoal.words_per_session,
            progress,
            wordsRemaining,
            isCompleteToday: sessionsToday >= activeGoal.sessions_per_day,
            isGoalComplete: activeGoal.words_learned >= activeGoal.target_words
        };
    }, [activeGoal]);

    return {
        recordSession,
        getSessionInfo,
        activeGoal
    };
}
