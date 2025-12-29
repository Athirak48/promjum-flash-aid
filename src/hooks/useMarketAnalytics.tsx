import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MarketMetrics {
    dau: number; // Daily Active Users
    wau: number; // Weekly Active Users
    sessionsInRange: number;
    newUsersInRange: number;
}

export interface DailyData {
    date: string;
    uniqueUsers: number;
    totalSessions: number;
}

export interface GrowthData {
    date: string;
    newUsers: number;
    totalUsers: number;
}

export interface TopFeature {
    feature: string;
    clicks: number;
}

interface UseMarketAnalyticsParams {
    startDate: Date;
    endDate: Date;
}

export function useMarketAnalytics({ startDate, endDate }: UseMarketAnalyticsParams) {
    const [metrics, setMetrics] = useState<MarketMetrics | null>(null);
    const [dailyData, setDailyData] = useState<DailyData[]>([]);
    const [growthData, setGrowthData] = useState<GrowthData[]>([]);
    const [topFeatures, setTopFeatures] = useState<TopFeature[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAnalytics();
    }, [startDate, endDate]);

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);

        try {
            // Parallel fetch for better performance
            const [metricsData, dailyTrend, growth, features] = await Promise.all([
                fetchMetrics(),
                fetchDailyTrend(),
                fetchGrowthData(),
                fetchTopFeatures()
            ]);

            setMetrics(metricsData);
            setDailyData(dailyTrend);
            setGrowthData(growth);
            setTopFeatures(features);
        } catch (err) {
            console.error('Analytics fetch error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const fetchMetrics = async (): Promise<MarketMetrics> => {
        const startISO = startDate.toISOString().split('T')[0];
        const endISO = endDate.toISOString().split('T')[0];
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        // DAU - Active Users in selected range
        const { data: dauData, error: dauError } = await supabase
            .from('user_activity_logs')
            .select('user_id')
            .gte('created_at', `${startISO}T00:00:00`)
            .lte('created_at', `${endISO}T23:59:59`);

        if (dauError) throw dauError;
        const dau = new Set(dauData?.map(d => d.user_id).filter(Boolean)).size;

        // WAU - Weekly Active Users (still last 7 days for comparison)
        const { data: wauData, error: wauError } = await supabase
            .from('user_activity_logs')
            .select('user_id')
            .gte('created_at', weekAgo);

        if (wauError) throw wauError;
        const wau = new Set(wauData?.map(d => d.user_id).filter(Boolean)).size;

        // Sessions in selected range
        const { count: sessionsInRange, error: sessionsError } = await supabase
            .from('user_activity_logs')
            .select('*', { count: 'exact', head: true })
            .eq('event_type', 'navigation')
            .gte('created_at', `${startISO}T00:00:00`)
            .lte('created_at', `${endISO}T23:59:59`);

        if (sessionsError) throw sessionsError;

        // New Users in selected range
        const { count: newUsersInRange, error: newUsersError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', `${startISO}T00:00:00`)
            .lte('created_at', `${endISO}T23:59:59`);

        if (newUsersError) throw newUsersError;

        return {
            dau,
            wau,
            sessionsInRange: sessionsInRange || 0,
            newUsersInRange: newUsersInRange || 0
        };
    };

    const fetchDailyTrend = async (): Promise<DailyData[]> => {
        const startISO = startDate.toISOString();
        const endISO = endDate.toISOString();

        const { data, error } = await supabase
            .from('user_activity_logs')
            .select('user_id, created_at')
            .gte('created_at', startISO)
            .lte('created_at', endISO)
            .order('created_at', { ascending: true });

        if (error) throw error;
        if (!data) return [];

        // Group by date
        const grouped = data.reduce((acc, log) => {
            const date = log.created_at.split('T')[0];
            if (!acc[date]) {
                acc[date] = { users: new Set(), sessions: 0 };
            }
            if (log.user_id) acc[date].users.add(log.user_id);
            acc[date].sessions++;
            return acc;
        }, {} as Record<string, { users: Set<string>; sessions: number }>);

        return Object.entries(grouped).map(([date, data]) => ({
            date,
            uniqueUsers: data.users.size,
            totalSessions: data.sessions
        })).sort((a, b) => a.date.localeCompare(b.date));
    };

    const fetchGrowthData = async (): Promise<GrowthData[]> => {
        const startISO = startDate.toISOString().split('T')[0];
        const endISO = endDate.toISOString();

        const { data, error } = await supabase
            .from('profiles')
            .select('created_at')
            .gte('created_at', startISO)
            .lte('created_at', endISO)
            .order('created_at', { ascending: true });

        if (error) throw error;
        if (!data) return [];

        // Group by date and calculate cumulative
        const grouped = data.reduce((acc, profile) => {
            const date = profile.created_at.split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        let cumulative = 0;
        return Object.entries(grouped)
            .map(([date, newUsers]) => {
                cumulative += newUsers;
                return { date, newUsers, totalUsers: cumulative };
            })
            .sort((a, b) => a.date.localeCompare(b.date));
    };

    const fetchTopFeatures = async (): Promise<TopFeature[]> => {
        const startISO = startDate.toISOString();
        const endISO = endDate.toISOString();

        const { data, error } = await supabase
            .from('user_activity_logs')
            .select('event_action')
            .eq('event_type', 'button_click')
            .gte('created_at', startISO)
            .lte('created_at', endISO);

        if (error) throw error;
        if (!data) return [];

        // Count clicks per feature
        const counts = data.reduce((acc, log) => {
            if (log.event_action) {
                acc[log.event_action] = (acc[log.event_action] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts)
            .map(([feature, clicks]) => ({ feature, clicks }))
            .sort((a, b) => b.clicks - a.clicks)
            .slice(0, 10);
    };

    return {
        metrics,
        dailyData,
        growthData,
        topFeatures,
        loading,
        error,
        refetch: fetchAnalytics
    };
}
