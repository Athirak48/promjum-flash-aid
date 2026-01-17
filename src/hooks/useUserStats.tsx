import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface UserStats {
    streak: number;
    totalXP: number;
    wordsLearnedToday: number;
    wordsLearned: number;
    subdecksCompleted: number;
    totalSubdecks: number;
    progressPercentage: number;
    timeSpentToday: number; // seconds
    ranking: number;
}

// Helper to get today's date string (YYYY-MM-DD) in local timezone
function getTodayDateString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// Helper to get yesterday's date string (YYYY-MM-DD) in local timezone
function getYesterdayDateString(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
}

export function useUserStats() {
    const { user } = useAuth();
    const [stats, setStats] = useState<UserStats>({
        streak: 0,
        totalXP: 0,
        wordsLearnedToday: 0,
        wordsLearned: 0,
        subdecksCompleted: 0,
        totalSubdecks: 0,
        progressPercentage: 0,
        timeSpentToday: 0,
        ranking: 0
    });
    const [loading, setLoading] = useState(true);

    // Function to update streak when user does any activity
    const updateStreak = useCallback(async () => {
        if (!user) return;

        try {
            const todayStr = getTodayDateString();
            const yesterdayStr = getYesterdayDateString();

            // Fetch current profile data
            const { data: profile } = await supabase
                .from('profiles')
                .select('current_streak, longest_streak, last_activity_date')
                .eq('user_id', user.id)
                .single();

            if (!profile) return;

            const lastActivity = profile.last_activity_date;
            let newStreak = profile.current_streak || 0;
            let newLongestStreak = profile.longest_streak || 0;

            // If already active today, don't update
            if (lastActivity === todayStr) {
                return;
            }

            // If last activity was yesterday, increment streak
            if (lastActivity === yesterdayStr) {
                newStreak = newStreak + 1;
            } 
            // If last activity was before yesterday or never, reset to 1
            else {
                newStreak = 1;
            }

            // Update longest streak if current is higher
            if (newStreak > newLongestStreak) {
                newLongestStreak = newStreak;
            }

            // Update profile with new streak
            await supabase
                .from('profiles')
                .update({
                    current_streak: newStreak,
                    longest_streak: newLongestStreak,
                    last_activity_date: todayStr
                })
                .eq('user_id', user.id);

            // Update local stats
            setStats(prev => ({
                ...prev,
                streak: newStreak
            }));

        } catch (error) {
            console.error('Error updating streak:', error);
        }
    }, [user]);

    // Check and update streak on component mount (when user visits dashboard)
    useEffect(() => {
        if (user) {
            updateStreak();
        }
    }, [user, updateStreak]);

    useEffect(() => {
        async function fetchStats() {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const todayStr = getTodayDateString();
                const yesterdayStr = getYesterdayDateString();

                // 1. Fetch Profile Stats
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('total_xp, current_streak, longest_streak, last_activity_date')
                    .eq('user_id', user.id)
                    .single();

                // Calculate the actual streak based on last_activity_date
                let currentStreak = profile?.current_streak || 0;
                const lastActivity = profile?.last_activity_date;

                // If last activity is neither today nor yesterday, streak should be 0
                if (lastActivity && lastActivity !== todayStr && lastActivity !== yesterdayStr) {
                    currentStreak = 0;
                    // Also update in database
                    await supabase
                        .from('profiles')
                        .update({ current_streak: 0 })
                        .eq('user_id', user.id);
                }

                // 1.1 Calculate Total Words Learned (Correctly Count Only Level > 0)
                const { count: totalWordsCount } = await supabase
                    .from('user_flashcard_progress')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .gt('srs_level', 0); // Only count words that are actually learned (Level > 0)

                // 2. Calculate Words Learned Today
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const { count: todayCount } = await supabase
                    .from('user_flashcard_progress')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .gt('srs_level', 0) // Only count learned words
                    .gte('created_at', today.toISOString());

                // 3. Subdecks count
                const { count: totalSubdecks } = await supabase
                    .from('sub_decks')
                    .select('*', { count: 'exact', head: true });

                // Calculate progress percentage
                const totalWordsGoal = 5000;
                const learned = totalWordsCount || 0;
                const progress = Math.min(100, Math.round((learned / totalWordsGoal) * 100));

                // Fetch Time Spent Today from practice_sessions
                const { data: sessionsToday } = await supabase
                    .from('practice_sessions')
                    .select('duration_minutes')
                    .eq('user_id', user.id)
                    .gte('created_at', today.toISOString());

                const timeSpent = sessionsToday?.reduce((acc, curr) => acc + ((curr.duration_minutes || 0) * 60), 0) || 0;

                // Fetch Daily Ranking from user_xp (based on games_xp_today)
                const { data: userXp } = await supabase
                    .from('user_xp')
                    .select('games_xp_today')
                    .eq('user_id', user.id)
                    .single();

                const myDailyXp = userXp?.games_xp_today || 0;

                const { count: higherRankCount } = await supabase
                    .from('user_xp')
                    .select('*', { count: 'exact', head: true })
                    .gt('games_xp_today', myDailyXp);

                const rank = (higherRankCount || 0) + 1;

                setStats({
                    streak: currentStreak,
                    totalXP: profile?.total_xp || 0,
                    wordsLearnedToday: todayCount || 0,
                    wordsLearned: totalWordsCount || 0,
                    subdecksCompleted: 0,
                    totalSubdecks: totalSubdecks || 0,
                    progressPercentage: progress,
                    timeSpentToday: timeSpent,
                    ranking: rank
                });
            } catch (error) {
                console.error('Error fetching user stats:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, [user]);

    return { stats, loading, updateStreak };
}
