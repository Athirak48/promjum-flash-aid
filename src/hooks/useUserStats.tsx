import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface UserStats {
    streak: number;
    totalXP: number;
    wordsLearnedToday: number;
    wordsLearned: number;
    subdecksCompleted: number;
    totalSubdecks: number;
    subdecksCompleted: number;
    totalSubdecks: number;
    progressPercentage: number; // Rough estimate or calculation
    timeSpentToday: number; // seconds
    ranking: number;
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
        wordsLearned: 0,
        subdecksCompleted: 0,
        totalSubdecks: 0,
        progressPercentage: 0,
        timeSpentToday: 0,
        ranking: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                // 1. Fetch Profile Stats
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('total_xp, current_streak, words_learned')
                    .eq('id', user.id)
                    .single();

                // 2. Calculate Words Learned Today
                // Logic: Count user_flashcard_progress updated today with srs_level > 0 (meaning learned/remembered)
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const { count: todayCount } = await supabase
                    .from('user_flashcard_progress')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .gte('updated_at', today.toISOString());

                // 3. Subdecks Completed (Optional: requires logic to define "completed")
                // For now, we can count distinct subdecks the user has interacted with or completed all cards in.
                // Simplified: Fetch total subdecks count
                const { count: totalSubdecks } = await supabase
                    .from('sub_decks')
                    .select('*', { count: 'exact', head: true });

                // Calculate progress percentage (Example: words learned / 5000)
                // Adjust goal as needed
                const totalWordsGoal = 5000;
                const learned = profile?.words_learned || 0;
                const progress = Math.min(100, Math.round((learned / totalWordsGoal) * 100));

                setStats({
                    streak: profile?.current_streak || 0,
                    totalXP: profile?.total_xp || 0,
                    wordsLearnedToday: todayCount || 0,
                    wordsLearned: learned,
                    subdecksCompleted: 0, // Placeholder logic for now
                    totalSubdecks: totalSubdecks || 0,
                    setStats({
                        streak: profile?.current_streak || 0,
                    totalXP: profile?.total_xp || 0,
                    wordsLearnedToday: todayCount || 0,
                    wordsLearned: learned,
                    subdecksCompleted: 0, // Placeholder logic for now
                    totalSubdecks: totalSubdecks || 0,
                    progressPercentage: progress,
                    timeSpentToday: 0, // Will be updated by separate query if needed, or we can fetch here
                    ranking: 0 // Will be updated by separate query
                });

    // Fetch Time Spent Today from user_activity_logs
    const { data: timeData } = await supabase
        .from('user_activity_logs')
        .select('event_value')
        .eq('user_id', user.id)
        .eq('event_type', 'feature_usage')
        .in('event_action', ['complete', 'stop'])
        .gte('created_at', today.toISOString());

    const timeSpent = timeData?.reduce((acc, curr) => acc + (curr.event_value || 0), 0) || 0;

    // Fetch Daily Ranking from user_xp (based on games_xp_today)
    // Rank = count of users with more games_xp_today + 1
    // First get current user's games_xp_today
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

    setStats(prev => ({
        ...prev,
        timeSpentToday: timeSpent,
        ranking: rank
    }));

} catch (error) {
    console.error('Error fetching user stats:', error);
} finally {
    setLoading(false);
}
        }

fetchStats();
    }, [user]);

return { stats, loading };
}
