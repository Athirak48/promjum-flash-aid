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
// HOOK 1: Learning Now Statistics
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

                const { data: result, error: rpcError } = await supabase.rpc('get_learning_now_stats', {
                    start_date: startDate,
                    end_date: endDate
                });

                if (rpcError) throw rpcError;

                if (result && result.length > 0) {
                    const row = result[0];
                    setData({
                        totalClicks: Number(row.total_clicks || 0),
                        uniqueUsers: Number(row.unique_users || 0),
                        avgClicksPerUser: Number(row.avg_clicks_per_user || 0),
                        dailyData: row.daily_data || []
                    });
                } else {
                    setData({
                        totalClicks: 0,
                        uniqueUsers: 0,
                        avgClicksPerUser: 0,
                        dailyData: []
                    });
                }
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
// HOOK 2: Game Usage Statistics
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

                const { data: result, error: rpcError } = await supabase.rpc('get_game_usage_stats', {
                    start_date: startDate,
                    end_date: endDate
                });

                if (rpcError) throw rpcError;

                setData(
                    (result || []).map((row: any) => ({
                        gameName: row.game_name,
                        gameId: row.game_id,
                        totalPlays: Number(row.total_plays || 0),
                        uniquePlayers: Number(row.unique_players || 0),
                        totalCompletions: Number(row.total_completions || 0),
                        completionRate: Number(row.completion_rate || 0),
                        avgScore: Number(row.avg_score || 0),
                        avgDuration: Number(row.avg_duration || 0),
                        lastPlayed: row.last_played
                    }))
                );
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

                const { data: result, error: rpcError } = await supabase.rpc('get_top_games_ranking', {
                    start_date: startDate,
                    end_date: endDate,
                    limit_count: limit
                });

                if (rpcError) throw rpcError;

                setData(
                    (result || []).map((row: any) => ({
                        rank: Number(row.rank),
                        gameName: row.game_name,
                        gameId: row.game_id,
                        totalPlays: Number(row.total_plays || 0),
                        growthPercentage: Number(row.growth_percentage || 0)
                    }))
                );
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

                const { data: result, error: rpcError } = await supabase.rpc('get_analytics_overview', {
                    start_date: startDate,
                    end_date: endDate
                });

                if (rpcError) throw rpcError;

                if (result && result.length > 0) {
                    const row = result[0];
                    setData({
                        totalSessions: Number(row.total_sessions || 0),
                        uniqueUsers: Number(row.unique_users || 0),
                        totalGamesPlayed: Number(row.total_games_played || 0),
                        totalLearningNowClicks: Number(row.total_learning_now_clicks || 0),
                        avgSessionDuration: Number(row.avg_session_duration || 0),
                        mostPopularGame: row.most_popular_game || 'N/A',
                        totalGameCompletions: Number(row.total_game_completions || 0)
                    });
                }
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

                const { data: result, error: rpcError } = await supabase.rpc('get_game_usage_timeline', {
                    game_id: gameId,
                    start_date: startDate,
                    end_date: endDate
                });

                if (rpcError) throw rpcError;

                setData(
                    (result || []).map((row: any) => ({
                        date: row.date,
                        plays: Number(row.plays || 0),
                        uniquePlayers: Number(row.unique_players || 0),
                        completions: Number(row.completions || 0)
                    }))
                );
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
