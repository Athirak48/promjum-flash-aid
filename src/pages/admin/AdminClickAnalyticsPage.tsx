import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import {
    LayoutDashboard, RefreshCw, Gamepad2, Users, Layers, BookOpen,
    AlertTriangle, TrendingUp, TrendingDown, Download, Calendar,
    BarChart3, UserCheck
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AnalyticsItem {
    label: string;
    daily: number;
    total: number;
    uniqueUsers: number;
    trend: number; // percentage change vs previous period
}

interface SectionData {
    title: string;
    icon: any;
    items: AnalyticsItem[];
}

type TimeRange = '7d' | '30d' | '90d' | 'all';

export default function AdminClickAnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [sections, setSections] = useState<SectionData[]>([]);
    const [timeRange, setTimeRange] = useState<TimeRange>('30d');
    const [allLogs, setAllLogs] = useState<any[]>([]);
    const [totalUniqueUsers, setTotalUniqueUsers] = useState(0);
    const [totalEvents, setTotalEvents] = useState(0);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (allLogs.length > 0) {
            processData(allLogs);
        }
    }, [timeRange, allLogs]);

    const getDateRange = (range: TimeRange): { start: Date; previousStart: Date; previousEnd: Date } => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        let daysBack = 0;
        switch (range) {
            case '7d': daysBack = 7; break;
            case '30d': daysBack = 30; break;
            case '90d': daysBack = 90; break;
            case 'all': daysBack = 365 * 5; break; // 5 years back for "all"
        }

        const start = new Date(today);
        start.setDate(start.getDate() - daysBack);

        // Previous period for trend comparison
        const previousEnd = new Date(start);
        previousEnd.setDate(previousEnd.getDate() - 1);
        const previousStart = new Date(previousEnd);
        previousStart.setDate(previousStart.getDate() - daysBack);

        return { start, previousStart, previousEnd };
    };

    const fetchData = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const { data: logs, error } = await supabase
                .from('user_activity_logs')
                .select(`
                    *,
                    profiles:user_id (
                        email
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Filter out specific admin email (doing it in JS to preserve guest logs/left join behavior)
            const filteredLogs = (logs || []).filter((log: any) =>
                log.profiles?.email !== 'storybook2548@gmail.com'
            );

            setAllLogs(filteredLogs);
            processData(filteredLogs);

        } catch (error: any) {
            console.error('Error fetching analytics:', error);
            setErrorMsg(error.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const processData = (logs: any[]) => {
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            const { start, previousStart, previousEnd } = getDateRange(timeRange);

            // Filter logs for current period
            const currentLogs = logs.filter(log => {
                const logDate = new Date(log.created_at);
                return logDate >= start;
            });

            // Filter logs for previous period (for trend calculation)
            const previousLogs = logs.filter(log => {
                const logDate = new Date(log.created_at);
                return logDate >= previousStart && logDate <= previousEnd;
            });

            // Calculate total unique users
            const uniqueUserIds = new Set(currentLogs.filter(l => l.user_id).map(l => l.user_id));
            setTotalUniqueUsers(uniqueUserIds.size);
            setTotalEvents(currentLogs.length);

            const getCounts = (filterFn: (log: any) => boolean) => {
                let daily = 0;
                let total = 0;
                const userSet = new Set<string>();

                currentLogs.forEach(log => {
                    if (filterFn(log)) {
                        total++;
                        if (log.user_id) userSet.add(log.user_id);
                        if (log.created_at && log.created_at.startsWith(todayStr)) {
                            daily++;
                        }
                    }
                });

                // Calculate previous period count for trend
                let previousTotal = 0;
                previousLogs.forEach(log => {
                    if (filterFn(log)) {
                        previousTotal++;
                    }
                });

                // Calculate trend percentage
                let trend = 0;
                if (previousTotal > 0) {
                    trend = Math.round(((total - previousTotal) / previousTotal) * 100);
                } else if (total > 0) {
                    trend = 100; // New activity
                }

                return {
                    daily,
                    total,
                    uniqueUsers: userSet.size,
                    trend
                };
            };

            // 1. Dashboard
            const dashboardItems: AnalyticsItem[] = [
                { label: 'หน้า Dashboard', ...getCounts(l => l.event_type === 'navigation' && l.event_label === 'Dashboard') },
                { label: 'ปุ่ม Learning Now', ...getCounts(l => l.event_label === 'Learning Now') },
                { label: '↳ โหมด Flashcard', ...getCounts(l => l.event_label === 'Learning Mode: flashcard') },
                { label: '↳ โหมด Game', ...getCounts(l => l.event_label === 'Learning Mode: game') },
                { label: '↳ โหมด Reading', ...getCounts(l => l.event_label === 'Learning Mode: reading') },
                { label: '↳ โหมด Listening', ...getCounts(l => l.event_label === 'Learning Mode: listening') },
                { label: 'ปุ่ม แข่งกับเพื่อน', ...getCounts(l => l.event_label === 'Multiplayer') },
                { label: 'ปุ่ม Vocab Challenge', ...getCounts(l => l.event_label === 'Vocab Challenge' && l.event_category === 'dashboard') },
            ];

            // 2. Lobby
            const lobbyItems: AnalyticsItem[] = [
                { label: 'หน้า Lobby', ...getCounts(l => l.event_type === 'navigation' && l.event_label === 'Lobby') },
                { label: 'ปุ่ม Gacha Warp', ...getCounts(l => l.event_label === 'Gacha Warp') },
                { label: 'ปุ่ม Pet Lab', ...getCounts(l => l.event_label === 'Pet Lab') },
                { label: 'Icon Games ทั้งหมด', ...getCounts(l => l.event_category === 'game-selection') },
            ];

            // 3. Community
            const communityItems: AnalyticsItem[] = [
                { label: 'หน้า Community', ...getCounts(l => l.event_type === 'navigation' && l.event_label === 'Community') },
            ];

            // 4. Deck (Flashcards)
            // Games: only count 'complete' action, not 'start'
            const deckItems: AnalyticsItem[] = [
                { label: 'หน้า Deck', ...getCounts(l => l.event_type === 'navigation' && l.event_label === 'Deck') },
                { label: 'ปุ่ม สร้าง Flashcard', ...getCounts(l => l.event_label === 'Create Flashcard') },
                { label: 'เกม: Honey Hive', ...getCounts(l => l.event_label === 'honeycomb' && l.event_action === 'complete') },
                { label: 'เกม: Listen & Choose', ...getCounts(l => l.event_label === 'listen' && l.event_action === 'complete') },
                { label: 'เกม: Hangman Master', ...getCounts(l => l.event_label === 'hangman' && l.event_action === 'complete') },
                { label: 'เกม: Vocab Blinder', ...getCounts(l => l.event_label === 'vocabBlinder' && l.event_action === 'complete') },
                { label: 'เกม: Quiz Game', ...getCounts(l => l.event_label === 'quiz' && l.event_action === 'complete') },
                { label: 'เกม: Matching Game', ...getCounts(l => l.event_label === 'matching' && l.event_action === 'complete') },
                { label: 'เกม: Word Search', ...getCounts(l => l.event_label === 'wordSearch' && l.event_action === 'complete') },
                { label: 'เกม: Word Scramble', ...getCounts(l => l.event_label === 'scramble' && l.event_action === 'complete') },
                { label: 'เกม: Ninja Slice', ...getCounts(l => l.event_label === 'ninja' && l.event_action === 'complete') },
            ];

            // 5. Vocab Challenge Page
            const challengeItems: AnalyticsItem[] = [
                { label: 'หน้า Vocab Challenge', ...getCounts(l => l.event_type === 'navigation' && l.event_label === 'Vocab Challenge') },
                { label: 'ปุ่ม Start Run', ...getCounts(l => l.event_label === 'Start Run') },
            ];

            setSections([
                { title: '1. Dashboard', icon: LayoutDashboard, items: dashboardItems },
                { title: '2. Lobby', icon: Gamepad2, items: lobbyItems },
                { title: '3. Community', icon: Users, items: communityItems },
                { title: '4. Deck & Games', icon: Layers, items: deckItems },
                { title: '5. Vocab Challenge', icon: BookOpen, items: challengeItems },
            ]);

        } catch (e: any) {
            setErrorMsg('Error processing data: ' + e.message);
        }
    };

    // Get top 5 items across all sections
    const topItems = useMemo(() => {
        const allItems: { label: string; total: number; section: string }[] = [];
        sections.forEach(section => {
            section.items.forEach(item => {
                if (!item.label.startsWith('↳')) { // Exclude sub-items
                    allItems.push({ label: item.label, total: item.total, section: section.title });
                }
            });
        });
        return allItems.sort((a, b) => b.total - a.total).slice(0, 5);
    }, [sections]);

    const maxTopItemValue = useMemo(() => {
        return topItems.length > 0 ? topItems[0].total : 1;
    }, [topItems]);

    // Export to CSV
    const exportToCSV = () => {
        const headers = ['Section', 'Label', 'Today', 'Total (Period)', 'Unique Users', 'Trend %'];
        const rows: string[][] = [];

        sections.forEach(section => {
            section.items.forEach(item => {
                rows.push([
                    section.title,
                    item.label,
                    item.daily.toString(),
                    item.total.toString(),
                    item.uniqueUsers.toString(),
                    `${item.trend >= 0 ? '+' : ''}${item.trend}%`
                ]);
            });
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `click-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const TrendBadge = ({ trend }: { trend: number }) => {
        if (trend === 0) return <span className="text-xs text-slate-400">-</span>;
        const isPositive = trend > 0;
        return (
            <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
                {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {isPositive ? '+' : ''}{trend}%
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Click Analytics Dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">รายละเอียดการใช้งานแต่ละหน้าและปุ่ม</p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={timeRange} onValueChange={(v: TimeRange) => setTimeRange(v)}>
                        <SelectTrigger className="w-[140px] bg-white dark:bg-slate-800">
                            <Calendar className="h-4 w-4 mr-2 text-slate-500" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">7 วัน</SelectItem>
                            <SelectItem value="30d">30 วัน</SelectItem>
                            <SelectItem value="90d">3 เดือน</SelectItem>
                            <SelectItem value="all">ทั้งหมด</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={exportToCSV} className="gap-2">
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                    <Button variant="outline" onClick={fetchData} className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        รีเฟรช
                    </Button>
                </div>
            </div>

            {errorMsg && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Total Events</p>
                                <p className="text-4xl font-bold mt-1">{totalEvents.toLocaleString()}</p>
                                <p className="text-blue-200 text-xs mt-1">ในช่วง {timeRange === 'all' ? 'ทั้งหมด' : timeRange}</p>
                            </div>
                            <BarChart3 className="h-12 w-12 text-blue-200" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm font-medium">Unique Users</p>
                                <p className="text-4xl font-bold mt-1">{totalUniqueUsers.toLocaleString()}</p>
                                <p className="text-purple-200 text-xs mt-1">ผู้ใช้ที่มี activity</p>
                            </div>
                            <UserCheck className="h-12 w-12 text-purple-200" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-emerald-100 text-sm font-medium">Avg Events/User</p>
                                <p className="text-4xl font-bold mt-1">
                                    {totalUniqueUsers > 0 ? (totalEvents / totalUniqueUsers).toFixed(1) : '0'}
                                </p>
                                <p className="text-emerald-200 text-xs mt-1">ค่าเฉลี่ย actions ต่อคน</p>
                            </div>
                            <TrendingUp className="h-12 w-12 text-emerald-200" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Items Chart */}
            {topItems.length > 0 && (
                <Card>
                    <CardHeader className="pb-3 border-b">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                                <BarChart3 className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-lg">🔥 Top 5 Actions</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {topItems.map((item, idx) => (
                                <div key={idx} className="space-y-1">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                                        <span className="text-slate-500 dark:text-slate-400 font-bold">{item.total.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                                            style={{ width: `${(item.total / maxTopItemValue) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Section Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {sections.map((section, idx) => {
                    const Icon = section.icon;
                    return (
                        <Card key={idx}>
                            <CardHeader className="pb-3 border-b">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <CardTitle className="text-lg">{section.title}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4">
                                {/* Table Header */}
                                <div className="flex items-center justify-between py-2 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b">
                                    <span className="flex-1">Action</span>
                                    <div className="flex items-center gap-3 text-right">
                                        <span className="w-14">วันนี้</span>
                                        <span className="w-14">รวม</span>
                                        <span className="w-12">Users</span>
                                        <span className="w-14">Trend</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    {section.items.map((item, itemIdx) => (
                                        <div key={itemIdx} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded px-1 transition-colors">
                                            <span className={`text-sm font-medium text-slate-700 dark:text-slate-300 ${item.label.startsWith('↳') ? 'pl-4 text-slate-500 dark:text-slate-400' : ''}`}>
                                                {item.label}
                                            </span>
                                            <div className="flex items-center gap-3 text-right">
                                                <span className={`w-14 px-2 py-0.5 rounded text-xs font-medium ${item.daily > 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                                                    {item.daily}
                                                </span>
                                                <span className="w-14 text-sm font-bold text-slate-900 dark:text-white">
                                                    {item.total.toLocaleString()}
                                                </span>
                                                <span className="w-12 text-xs text-purple-600 dark:text-purple-400 font-medium">
                                                    {item.uniqueUsers > 0 ? item.uniqueUsers : '-'}
                                                </span>
                                                <span className="w-14">
                                                    <TrendBadge trend={item.trend} />
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
