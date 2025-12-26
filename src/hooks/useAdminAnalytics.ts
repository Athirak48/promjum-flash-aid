import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export interface LearningNowStats {
    totalClicks: number;
    uniqueUsers: number;
    avgClicksPerUser: number;
    dailyData: {
        date: string;
        clicks: number;
        unique_users: number;
    }[];
}

export interface GameUsageStats {
    gameName: string;
    gameId: string;
    totalPlays: number;
    uniquePlayers: number;
    totalCompletions: number;
    completionRate: number;
    avgScore: number;
    avgDuration: number;
    lastPlayed: string | null;
}

export interface TopGameRanking {
    rank: number;
    gameName: string;
    gameId: string;
    totalPlays: number;
    growthPercentage: number;
}

export interface AnalyticsOverview {
    totalSessions: number;
    uniqueUsers: number;
    totalGamesPlayed: number;
    totalLearningNowClicks: number;
    avgSessionDuration: number;
    mostPopularGame: string;
    totalGameCompletions: number;
}

export interface GameTimeline {
    date: string;
    plays: number;
    uniquePlayers: number;
    completions: number;
}

export type TimeRange = 'today' | '7days' | '30days' | '90days' | 'custom';

interface DateRange {
    startDate: string;
    endDate: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getDateRangeFromTimeRange(timeRange: TimeRange, customRange?: DateRange): DateRange {
    const now = new Date();
    const endDate = now.toISOString();
    let startDate: Date;

    switch (timeRange) {
        case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        case '7days':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case '30days':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        case '90days':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
        case 'custom':
            if (!customRange) {
                throw new Error('Custom range requires startDate and endDate');
            }
            return customRange;
        default:
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return {
        startDate: startDate.toISOString(),
        endDate
    };
}

// ============================================================================
// HOOK 1: Learning Now Statistics (using direct table queries)
// ============================================================================

export function useLearningNowStats(timeRange: TimeRange = '30days', customRange?: DateRange) {
    const [data, setData] = useState<LearningNowStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setIsLoading(true);
                setError(null);

                const { startDate, endDate } = getDateRangeFromTimeRange(timeRange, customRange);

                // Query lobby_activities table directly
                const { data: lobbyData, error: lobbyError } = await supabase
                    .from('lobby_activities')
                    .select('user_id, clicked_at')
                    .gte('clicked_at', startDate)
                    .lte('clicked_at', endDate);

                if (lobbyError) throw lobbyError;

                const totalClicks = lobbyData?.length || 0;
                const uniqueUserIds = new Set(lobbyData?.map(d => d.user_id) || []);
                const uniqueUsers = uniqueUserIds.size;
                const avgClicksPerUser = uniqueUsers > 0 ? totalClicks / uniqueUsers : 0;

                setData({
                    totalClicks,
                    uniqueUsers,
                    avgClicksPerUser,
                    dailyData: []
                });
            } catch (err) {
                console.error('Error fetching Learning Now stats:', err);
                setError(err as Error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [timeRange, customRange?.startDate, customRange?.endDate]);

    return { data, isLoading, error };
}

// ============================================================================
// HOOK 2: Game Usage Statistics (using practice_sessions table)
// ============================================================================

export function useGameUsageStats(timeRange: TimeRange = '30days', customRange?: DateRange) {
    const [data, setData] = useState<GameUsageStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setIsLoading(true);
                setError(null);

                const { startDate, endDate } = getDateRangeFromTimeRange(timeRange, customRange);

                // Query practice_sessions for game data
                const { data: sessions, error: sessionError } = await supabase
                    .from('practice_sessions')
                    .select('*')
                    .gte('created_at', startDate)
                    .lte('created_at', endDate);

                if (sessionError) throw sessionError;

                // Group by session_type (game name)
                const gameMap = new Map<string, {
                    plays: number;
                    players: Set<string>;
                    completions: number;
                    totalDuration: number;
                    lastPlayed: string;
                }>();

                (sessions || []).forEach(session => {
                    const gameId = session.session_type || 'unknown';
                    const existing = gameMap.get(gameId) || {
                        plays: 0,
                        players: new Set<string>(),
                        completions: 0,
                        totalDuration: 0,
                        lastPlayed: ''
                    };

                    existing.plays += 1;
                    existing.players.add(session.user_id);
                    if (session.completed) existing.completions += 1;
                    existing.totalDuration += session.duration_minutes || 0;
                    if (session.created_at > existing.lastPlayed) {
                        existing.lastPlayed = session.created_at;
                    }

                    gameMap.set(gameId, existing);
                });

                const stats: GameUsageStats[] = Array.from(gameMap.entries()).map(([gameId, stat]) => ({
                    gameName: gameId,
                    gameId: gameId,
                    totalPlays: stat.plays,
                    uniquePlayers: stat.players.size,
                    totalCompletions: stat.completions,
                    completionRate: stat.plays > 0 ? (stat.completions / stat.plays) * 100 : 0,
                    avgScore: 0,
                    avgDuration: stat.plays > 0 ? (stat.totalDuration / stat.plays) * 60 : 0, // convert to seconds
                    lastPlayed: stat.lastPlayed || null
                }));

                setData(stats.sort((a, b) => b.totalPlays - a.totalPlays));
            } catch (err) {
                console.error('Error fetching game usage stats:', err);
                setError(err as Error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [timeRange, customRange?.startDate, customRange?.endDate]);

    return { data, isLoading, error };
}

// ============================================================================
// HOOK 3: Top Games Ranking
// ============================================================================

export function useTopGamesRanking(
    timeRange: TimeRange = '30days',
    limit: number = 5,
    customRange?: DateRange
) {
    const [data, setData] = useState<TopGameRanking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setIsLoading(true);
                setError(null);

                const { startDate, endDate } = getDateRangeFromTimeRange(timeRange, customRange);

                const { data: sessions, error: sessionError } = await supabase
                    .from('practice_sessions')
                    .select('session_type')
                    .gte('created_at', startDate)
                    .lte('created_at', endDate);

                if (sessionError) throw sessionError;

                // Count by session_type
                const countMap = new Map<string, number>();
                (sessions || []).forEach(s => {
                    const type = s.session_type || 'unknown';
                    countMap.set(type, (countMap.get(type) || 0) + 1);
                });

                const rankings: TopGameRanking[] = Array.from(countMap.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, limit)
                    .map(([gameId, plays], idx) => ({
                        rank: idx + 1,
                        gameName: gameId,
                        gameId: gameId,
                        totalPlays: plays,
                        growthPercentage: 0
                    }));

                setData(rankings);
            } catch (err) {
                console.error('Error fetching top games ranking:', err);
                setError(err as Error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [timeRange, limit, customRange?.startDate, customRange?.endDate]);

    return { data, isLoading, error };
}

// ============================================================================
// HOOK 4: Analytics Overview
// ============================================================================

export function useAnalyticsOverview(timeRange: TimeRange = '30days', customRange?: DateRange) {
    const [data, setData] = useState<AnalyticsOverview | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setIsLoading(true);
                setError(null);

                const { startDate, endDate } = getDateRangeFromTimeRange(timeRange, customRange);

                // Fetch practice sessions
                const { data: sessions, error: sessionError } = await supabase
                    .from('practice_sessions')
                    .select('*')
                    .gte('created_at', startDate)
                    .lte('created_at', endDate);

                if (sessionError) throw sessionError;

                // Fetch lobby clicks
                const { count: lobbyCount } = await supabase
                    .from('lobby_activities')
                    .select('*', { count: 'exact', head: true })
                    .gte('clicked_at', startDate)
                    .lte('clicked_at', endDate);

                const totalSessions = sessions?.length || 0;
                const uniqueUserIds = new Set(sessions?.map(s => s.user_id) || []);
                const completedSessions = sessions?.filter(s => s.completed) || [];
                
                // Find most popular game
                const gameCount = new Map<string, number>();
                sessions?.forEach(s => {
                    const type = s.session_type || 'unknown';
                    gameCount.set(type, (gameCount.get(type) || 0) + 1);
                });
                
                let mostPopular = 'N/A';
                let maxCount = 0;
                gameCount.forEach((count, game) => {
                    if (count > maxCount) {
                        maxCount = count;
                        mostPopular = game;
                    }
                });

                const totalDuration = sessions?.reduce((acc, s) => acc + (s.duration_minutes || 0), 0) || 0;

                setData({
                    totalSessions,
                    uniqueUsers: uniqueUserIds.size,
                    totalGamesPlayed: totalSessions,
                    totalLearningNowClicks: lobbyCount || 0,
                    avgSessionDuration: totalSessions > 0 ? totalDuration / totalSessions : 0,
                    mostPopularGame: mostPopular,
                    totalGameCompletions: completedSessions.length
                });
            } catch (err) {
                console.error('Error fetching analytics overview:', err);
                setError(err as Error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [timeRange, customRange?.startDate, customRange?.endDate]);

    return { data, isLoading, error };
}

// ============================================================================
// HOOK 5: Game Timeline (for Charts)
// ============================================================================

export function useGameTimeline(
    gameId: string,
    timeRange: TimeRange = '30days',
    customRange?: DateRange
) {
    const [data, setData] = useState<GameTimeline[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setIsLoading(true);
                setError(null);

                const { startDate, endDate } = getDateRangeFromTimeRange(timeRange, customRange);

                const { data: sessions, error: sessionError } = await supabase
                    .from('practice_sessions')
                    .select('*')
                    .eq('session_type', gameId)
                    .gte('created_at', startDate)
                    .lte('created_at', endDate);

                if (sessionError) throw sessionError;

                // Group by date
                const dateMap = new Map<string, { plays: number; players: Set<string>; completions: number }>();

                (sessions || []).forEach(s => {
                    const date = s.created_at?.split('T')[0] || '';
                    const existing = dateMap.get(date) || { plays: 0, players: new Set<string>(), completions: 0 };
                    existing.plays += 1;
                    existing.players.add(s.user_id);
                    if (s.completed) existing.completions += 1;
                    dateMap.set(date, existing);
                });

                const timeline: GameTimeline[] = Array.from(dateMap.entries())
                    .map(([date, stat]) => ({
                        date,
                        plays: stat.plays,
                        uniquePlayers: stat.players.size,
                        completions: stat.completions
                    }))
                    .sort((a, b) => a.date.localeCompare(b.date));

                setData(timeline);
            } catch (err) {
                console.error('Error fetching game timeline:', err);
                setError(err as Error);
            } finally {
                setIsLoading(false);
            }
        }

        if (gameId) {
            fetchData();
        }
    }, [gameId, timeRange, customRange?.startDate, customRange?.endDate]);

    return { data, isLoading, error };
}

// ============================================================================
// COMBINED HOOK: All Admin Analytics
// ============================================================================

export function useAdminAnalytics(timeRange: TimeRange = '30days', customRange?: DateRange) {
    const overview = useAnalyticsOverview(timeRange, customRange);
    const learningNow = useLearningNowStats(timeRange, customRange);
    const gameStats = useGameUsageStats(timeRange, customRange);
    const topGames = useTopGamesRanking(timeRange, 5, customRange);

    return {
        overview: overview.data,
        learningNow: learningNow.data,
        gameStats: gameStats.data,
        topGames: topGames.data,
        isLoading:
            overview.isLoading ||
            learningNow.isLoading ||
            gameStats.isLoading ||
            topGames.isLoading,
        error: overview.error || learningNow.error || gameStats.error || topGames.error
    };
}
