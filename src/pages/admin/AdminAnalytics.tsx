import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Users,
    TrendingUp,
    Activity,
    UserPlus,
    RefreshCw,
    Download
} from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { useMarketAnalytics } from '@/hooks/useMarketAnalytics';
import { motion } from 'framer-motion';

// Stat Card Component
interface StatCardProps {
    title: string;
    value: number | string;
    subtext?: string;
    icon: React.ElementType;
    trend?: 'up' | 'down' | 'neutral';
    color: string;
}

function StatCard({ title, value, subtext, icon: Icon, trend, color }: StatCardProps) {
    const trendColors = {
        up: 'text-green-500',
        down: 'text-red-500',
        neutral: 'text-slate-400'
    };

    return (
        <Card className="bg-slate-900 border-slate-700 hover:border-slate-600 transition-all">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-${color}-500/10`}>
                        <Icon className={`w-6 h-6 text-${color}-400`} />
                    </div>
                    {trend && (
                        <TrendingUp className={`w-4 h-4 ${trendColors[trend]}`} />
                    )}
                </div>
                <h3 className="text-2xl font-black text-white mb-1">{value.toLocaleString()}</h3>
                <p className="text-sm text-slate-400 font-medium">{title}</p>
                {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
            </CardContent>
        </Card>
    );
}

export default function AdminAnalytics() {
    // Date range helpers
    const getToday = () => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return now;
    };

    const getMonthStart = () => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    };

    const getYearStart = () => {
        const now = new Date();
        return new Date(now.getFullYear(), 0, 1);
    };

    const [dateRange, setDateRange] = useState<'today' | 'month' | 'year' | 'custom'>('today');
    const [startDate, setStartDate] = useState(getToday());
    const [endDate, setEndDate] = useState(new Date());

    const { metrics, dailyData, growthData, topFeatures, loading, error, refetch } = useMarketAnalytics({
        startDate,
        endDate
    });

    const handleDateRangeChange = (range: 'today' | 'month' | 'year') => {
        setDateRange(range);
        const end = new Date();

        switch (range) {
            case 'today':
                setStartDate(getToday());
                setEndDate(end);
                break;
            case 'month':
                setStartDate(getMonthStart());
                setEndDate(end);
                break;
            case 'year':
                setStartDate(getYearStart());
                setEndDate(end);
                break;
        }
    };

    const handleCustomDateChange = (type: 'start' | 'end', value: string) => {
        setDateRange('custom');
        const date = new Date(value);
        if (type === 'start') {
            setStartDate(date);
        } else {
            setEndDate(date);
        }
    };

    const handleExportCSV = () => {
        if (!dailyData.length) return;

        const csv = [
            ['Date', 'Unique Users', 'Total Sessions'],
            ...dailyData.map(d => [d.date, d.uniqueUsers, d.totalSessions])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-950">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white font-bold">Loading Analytics...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-950">
                <Card className="bg-red-950 border-red-800 max-w-md">
                    <CardHeader>
                        <CardTitle className="text-red-400">Error Loading Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-300 mb-4">{error}</p>
                        <Button onClick={refetch} variant="outline" className="w-full">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2">Market Analytics</h1>
                        <p className="text-slate-400">Real-time user engagement and growth metrics</p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={refetch}
                            variant="outline"
                            className="border-slate-700 text-white hover:bg-slate-800"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                        <Button
                            onClick={handleExportCSV}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export CSV
                        </Button>
                    </div>
                </motion.div>

                {/* Date Range Selector */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4"
                >
                    {/* Quick Filters */}
                    <div className="flex gap-3">
                        <Button
                            onClick={() => handleDateRangeChange('today')}
                            variant={dateRange === 'today' ? 'default' : 'outline'}
                            className={dateRange === 'today' ? 'bg-purple-600 hover:bg-purple-700' : 'border-slate-700 text-white hover:bg-slate-800'}
                        >
                            📅 วันนี้
                        </Button>
                        <Button
                            onClick={() => handleDateRangeChange('month')}
                            variant={dateRange === 'month' ? 'default' : 'outline'}
                            className={dateRange === 'month' ? 'bg-purple-600 hover:bg-purple-700' : 'border-slate-700 text-white hover:bg-slate-800'}
                        >
                            📆 เดือนนี้
                        </Button>
                        <Button
                            onClick={() => handleDateRangeChange('year')}
                            variant={dateRange === 'year' ? 'default' : 'outline'}
                            className={dateRange === 'year' ? 'bg-purple-600 hover:bg-purple-700' : 'border-slate-700 text-white hover:bg-slate-800'}
                        >
                            🗓️ ปีนี้
                        </Button>
                    </div>

                    {/* Custom Date Range Picker */}
                    <Card className="bg-slate-900 border-slate-700">
                        <CardContent className="p-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-slate-300 font-medium whitespace-nowrap">📅 จาก:</label>
                                    <input
                                        type="date"
                                        value={startDate.toISOString().split('T')[0]}
                                        onChange={(e) => handleCustomDateChange('start', e.target.value)}
                                        className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-slate-300 font-medium whitespace-nowrap">📅 ถึง:</label>
                                    <input
                                        type="date"
                                        value={endDate.toISOString().split('T')[0]}
                                        onChange={(e) => handleCustomDateChange('end', e.target.value)}
                                        className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <Button
                                    onClick={refetch}
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    🔍 ดูข้อมูล
                                </Button>
                            </div>
                            {dateRange === 'custom' && (
                                <p className="text-xs text-slate-400 mt-2">
                                    เลือกช่วงเวลา: {startDate.toLocaleDateString('th-TH')} - {endDate.toLocaleDateString('th-TH')}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Metrics Overview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    <StatCard
                        title="Active Users"
                        value={metrics?.dau || 0}
                        subtext={`ช่วง${dateRange === 'today' ? 'วันนี้' : dateRange === 'month' ? 'เดือนนี้' : dateRange === 'year' ? 'ปีนี้' : 'ที่เลือก'}`}
                        icon={Users}
                        color="blue"
                        trend="up"
                    />
                    <StatCard
                        title="Weekly Active Users"
                        value={metrics?.wau || 0}
                        subtext="Last 7 days"
                        icon={Activity}
                        color="green"
                        trend="up"
                    />
                    <StatCard
                        title="Total Sessions"
                        value={metrics?.sessionsInRange || 0}
                        subtext="Total visits"
                        icon={TrendingUp}
                        color="purple"
                    />
                    <StatCard
                        title="New Users"
                        value={metrics?.newUsersInRange || 0}
                        subtext="Sign-ups"
                        icon={UserPlus}
                        color="pink"
                        trend="up"
                    />
                </motion.div>

                {/* Charts Row 1: Users & Sessions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-1 gap-6"
                >
                    <Card className="bg-slate-900 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">📈 Daily Active Users & Sessions</CardTitle>
                            <CardDescription>Unique users vs total sessions over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={dailyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#94a3b8"
                                        tick={{ fill: '#94a3b8' }}
                                    />
                                    <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1e293b',
                                            border: '1px solid #475569',
                                            borderRadius: '8px'
                                        }}
                                        labelStyle={{ color: '#fff' }}
                                    />
                                    <Legend wrapperStyle={{ color: '#fff' }} />
                                    <Line
                                        type="monotone"
                                        dataKey="uniqueUsers"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        name="Unique Users"
                                        dot={{ fill: '#3b82f6', r: 4 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="totalSessions"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        name="Total Sessions"
                                        dot={{ fill: '#10b981', r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Charts Row 2: Growth & Features */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                    {/* User Growth */}
                    <Card className="bg-slate-900 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">📊 User Growth</CardTitle>
                            <CardDescription>Cumulative users over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={growthData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#94a3b8"
                                        tick={{ fill: '#94a3b8' }}
                                    />
                                    <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1e293b',
                                            border: '1px solid #475569',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="totalUsers"
                                        stroke="#a855f7"
                                        fill="#a855f7"
                                        fillOpacity={0.3}
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Top Features */}
                    <Card className="bg-slate-900 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">🔥 Top Features</CardTitle>
                            <CardDescription>Most clicked buttons & features</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={topFeatures} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                                    <YAxis
                                        type="category"
                                        dataKey="feature"
                                        width={120}
                                        stroke="#94a3b8"
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1e293b',
                                            border: '1px solid #475569',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Bar
                                        dataKey="clicks"
                                        fill="#f59e0b"
                                        radius={[0, 8, 8, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Engagement Insights */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card className="bg-gradient-to-r from-purple-900 to-pink-900 border-purple-700">
                        <CardHeader>
                            <CardTitle className="text-white">💡 Engagement Insights</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
                                <div>
                                    <p className="text-sm text-purple-200 mb-1">Sessions per User</p>
                                    <p className="text-3xl font-black">
                                        {metrics?.dau ? (metrics.sessionsInRange / metrics.dau).toFixed(2) : '0'}
                                    </p>
                                    <p className="text-xs text-purple-300 mt-1">Average visits per user</p>
                                </div>
                                <div>
                                    <p className="text-sm text-purple-200 mb-1">WAU/DAU Ratio</p>
                                    <p className="text-3xl font-black">
                                        {metrics?.dau && metrics?.wau ? ((metrics.dau / metrics.wau) * 100).toFixed(0) : '0'}%
                                    </p>
                                    <p className="text-xs text-purple-300 mt-1">Daily engagement rate</p>
                                </div>
                                <div>
                                    <p className="text-sm text-purple-200 mb-1">Total Users</p>
                                    <p className="text-3xl font-black">
                                        {growthData[growthData.length - 1]?.totalUsers.toLocaleString() || '0'}
                                    </p>
                                    <p className="text-xs text-purple-300 mt-1">All-time signups</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

            </div>
        </div>
    );
}
