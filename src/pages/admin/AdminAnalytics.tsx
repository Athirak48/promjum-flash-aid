
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    TrendingUp,
    Users,
    CreditCard,
    Activity,
    Download,
    Calendar,
    MousePointerClick,
    Clock,
    Target,
    BarChart3,
    FileText,
    Database
} from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell
} from 'recharts';

// Mock Data
const trafficData = [
    { date: '1 Dec', users: 120, sessions: 180 },
    { date: '2 Dec', users: 132, sessions: 210 },
    { date: '3 Dec', users: 145, sessions: 250 },
    { date: '4 Dec', users: 160, sessions: 280 },
    { date: '5 Dec', users: 155, sessions: 270 },
    { date: '6 Dec', users: 190, sessions: 320 },
    { date: '7 Dec', users: 210, sessions: 400 },
    { date: '8 Dec', users: 200, sessions: 380 },
    { date: '9 Dec', users: 230, sessions: 420 },
    { date: '10 Dec', users: 250, sessions: 450 },
    { date: '11 Dec', users: 280, sessions: 510 },
    { date: '12 Dec', users: 310, sessions: 550 },
    { date: '13 Dec', users: 342, sessions: 600 },
    { date: '14 Dec', users: 380, sessions: 650 },
];

const revenueData = [
    { month: 'Jul', revenue: 12000 },
    { month: 'Aug', revenue: 15000 },
    { month: 'Sep', revenue: 18000 },
    { month: 'Oct', revenue: 22000 },
    { month: 'Nov', revenue: 25000 },
    { month: 'Dec', revenue: 32000 },
];

const featureUsageData = [
    { name: 'Vocab Challenge', value: 45, color: '#f59e0b' },
    { name: 'Flashcards', value: 30, color: '#3b82f6' },
    { name: 'AI Practice', value: 15, color: '#8b5cf6' },
    { name: 'Reading', value: 10, color: '#10b981' },
];

const databaseTables = [
    { name: 'users_master', rows: 2847, size: '2.4 MB', updated: 'Today, 13:00' },
    { name: 'game_logs', rows: 15678, size: '12.8 MB', updated: 'Today, 13:05' },
    { name: 'transactions', rows: 560, size: '0.8 MB', updated: 'Today, 10:00' },
    { name: 'user_feedback', rows: 230, size: '0.2 MB', updated: 'Yesterday' },
    { name: 'learning_progress', rows: 89000, size: '45.2 MB', updated: 'Today, 13:05' },
];

// Components
const StatCard = ({ title, value, subtext, icon: Icon, trend }: any) => (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                <div className="p-2 bg-primary/10 rounded-full">
                    <Icon className="h-4 w-4 text-primary" />
                </div>
            </div>
            <div className="flex items-baseline justify-between mt-2">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
                {trend && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trend > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtext}</p>
        </CardContent>
    </Card>
);

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

export default function AdminAnalytics() {
    const [timeRange, setTimeRange] = useState('Dec 2024');
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [previewData, setPreviewData] = useState<{ name: string; columns: string[]; data: any[] } | null>(null);
    const [isSystemHealthOpen, setIsSystemHealthOpen] = useState(false);

    // Mock Preview Data
    const mockPreviews: Record<string, { columns: string[]; data: any[] }> = {
        'users_master': {
            columns: ['id', 'email', 'created_at', 'last_login', 'status'],
            data: [
                { id: 'u001', email: 'user1@example.com', created_at: '2024-01-15', last_login: '2024-12-14', status: 'active' },
                { id: 'u002', email: 'user2@example.com', created_at: '2024-02-20', last_login: '2024-12-13', status: 'active' },
                { id: 'u003', email: 'user3@example.com', created_at: '2024-03-10', last_login: '2024-11-30', status: 'inactive' },
                { id: 'u004', email: 'user4@example.com', created_at: '2024-04-05', last_login: '2024-12-14', status: 'active' },
                { id: 'u005', email: 'user5@example.com', created_at: '2024-05-12', last_login: '2024-12-10', status: 'active' },
            ]
        },
        'game_logs': {
            columns: ['log_id', 'user_id', 'game_mode', 'score', 'timestamp'],
            data: [
                { log_id: 'g1001', user_id: 'u001', game_mode: 'vocab_challenge', score: 28, timestamp: '2024-12-14 10:30:00' },
                { log_id: 'g1002', user_id: 'u045', game_mode: 'flashcard_review', score: 15, timestamp: '2024-12-14 10:35:00' },
                { log_id: 'g1003', user_id: 'u012', game_mode: 'vocab_challenge', score: 30, timestamp: '2024-12-14 10:42:00' },
                { log_id: 'g1004', user_id: 'u099', game_mode: 'ai_practice', score: 85, timestamp: '2024-12-14 10:50:00' },
                { log_id: 'g1005', user_id: 'u001', game_mode: 'vocab_challenge', score: 29, timestamp: '2024-12-14 11:15:00' },
            ]
        },
        'transactions': {
            columns: ['trans_id', 'user_id', 'amount', 'plan', 'date'],
            data: [
                { trans_id: 't5001', user_id: 'u023', amount: 199, plan: 'monthly', date: '2024-12-14' },
                { trans_id: 't5002', user_id: 'u087', amount: 1990, plan: 'yearly', date: '2024-12-13' },
                { trans_id: 't5003', user_id: 'u105', amount: 199, plan: 'monthly', date: '2024-12-13' },
                { trans_id: 't5004', user_id: 'u056', amount: 199, plan: 'monthly', date: '2024-12-12' },
                { trans_id: 't5005', user_id: 'u002', amount: 199, plan: 'monthly', date: '2024-12-12' },
            ]
        },
        'user_feedback': {
            columns: ['fb_id', 'user_id', 'type', 'message', 'date'],
            data: [
                { fb_id: 'f001', user_id: 'u001', type: 'bug', message: 'App crashes on launch', date: '2024-12-13' },
                { fb_id: 'f002', user_id: 'u005', type: 'feature', message: 'Dark mode please', date: '2024-12-12' },
            ]
        },
        'learning_progress': {
            columns: ['prog_id', 'user_id', 'word_id', 'srs_stage', 'next_review'],
            data: [
                { prog_id: 'p001', user_id: 'u001', word_id: 'w101', srs_stage: 3, next_review: '2024-12-15' },
                { prog_id: 'p002', user_id: 'u001', word_id: 'w102', srs_stage: 5, next_review: '2024-12-20' },
            ]
        }
    };

    const handleGenerateReport = () => {
        setIsGeneratingReport(true);
        // Simulate API call
        setTimeout(() => {
            setIsGeneratingReport(false);
            toast.success("สร้างรายงานสำเร็จ", {
                description: "Monthly_Report_Dec2024.pdf ถูกดาวน์โหลดแล้ว"
            });
        }, 2000);
    };

    const handleDownloadCSV = (tableName: string) => {
        // Simulate CSV download
        toast.info(`กำลังดาวน์โหลด ${tableName}.csv`, {
            description: "ข้อมูลกำลังถูกเตรียมและดาวน์โหลด..."
        });

        setTimeout(() => {
            // In a real app, this would trigger a blob download
            toast.success("ดาวน์โหลดสำเร็จ", {
                description: `ไฟล์ ${tableName}.csv ถูกบันทึกแล้ว`
            });
        }, 1000);
    };

    const handlePreview = (tableName: string) => {
        const data = mockPreviews[tableName];
        if (data) {
            setPreviewData({ name: tableName, ...data });
        } else {
            setPreviewData({
                name: tableName,
                columns: ['id', 'data'],
                data: [{ id: 1, data: 'Sample Data 1' }, { id: 2, data: 'Sample Data 2' }]
            });
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                        <Database className="h-8 w-8 text-primary" />
                        Master Analytics
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        ศุนย์กลางข้อมูลและสถิติทั้งหมดของระบบ (Data Warehouse View)
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Calendar className="mr-2 h-4 w-4" />
                                {timeRange}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setTimeRange('Dec 2024')}>Dec 2024</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTimeRange('Nov 2024')}>Nov 2024</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTimeRange('Oct 2024')}>Oct 2024</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTimeRange('Year 2024')}>Year 2024</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button onClick={handleGenerateReport} disabled={isGeneratingReport}>
                        {isGeneratingReport ? (
                            <>
                                <Activity className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-4 w-4" />
                                Generate Report
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Top Level Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Traffic"
                    value="12,345"
                    subtext="Sessions this month"
                    icon={MousePointerClick}
                    trend={12.5}
                />
                <StatCard
                    title="Active Users"
                    value="2,847"
                    subtext="Unique users this month"
                    icon={Users}
                    trend={8.2}
                />
                <StatCard
                    title="Total Revenue"
                    value="฿124,500"
                    subtext={`Showing ${timeRange}`}
                    icon={CreditCard}
                    trend={15.3}
                />
                <StatCard
                    title="Avg. Session"
                    value="14m 32s"
                    subtext="Time spent per user"
                    icon={Clock}
                    trend={-2.1}
                />
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="bg-background border">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="engagement">Engagement</TabsTrigger>
                    <TabsTrigger value="vocab">Vocab Challenge</TabsTrigger>
                    <TabsTrigger value="financial">Financials</TabsTrigger>
                    <TabsTrigger value="warehouse">Data Warehouse</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                        <Card className="col-span-1 lg:col-span-4">
                            <CardHeader>
                                <CardTitle>User Growth & Traffic</CardTitle>
                                <CardDescription>จำนวนผู้ใช้งานและ Sessions ในช่วง 14 วันที่ผ่านมา</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trafficData}>
                                        <defs>
                                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <Tooltip />
                                        <Legend />
                                        <Area type="monotone" dataKey="users" stroke="#8884d8" fillOpacity={1} fill="url(#colorUsers)" name="Active Users" />
                                        <Area type="monotone" dataKey="sessions" stroke="#82ca9d" fillOpacity={1} fill="url(#colorSessions)" name="Total Sessions" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="col-span-1 lg:col-span-3">
                            <CardHeader>
                                <CardTitle>Feature Usage Distribution</CardTitle>
                                <CardDescription>สัดส่วนการใช้งานแต่ละฟีเจอร์</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px] flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={featureUsageData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {featureUsageData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* ENGAGEMENT TAB */}
                <TabsContent value="engagement" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Session Retention</CardTitle>
                            <CardDescription>กราฟแสดงระยะเวลาที่ผู้ใช้ใช้งานต่อครั้ง (นาที)</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            {/* Simple placeholder or another chart */}
                            <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500">
                                <BarChart width={800} height={300} data={[
                                    { range: '0-5m', users: 150 },
                                    { range: '5-15m', users: 320 },
                                    { range: '15-30m', users: 280 },
                                    { range: '30-60m', users: 120 },
                                    { range: '>60m', users: 45 },
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="range" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* VOCAB CHALLENGE TAB */}
                <TabsContent value="vocab" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Game Completion Rate</CardTitle>
                                <CardDescription>อัตราการเล่นจนจบเกมรายวัน</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={trafficData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="users" name="Games Played" fill="#f59e0b" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Average Score Trend</CardTitle>
                                <CardDescription>คะแนนเฉลี่ยของผู้เล่น (เต็ม 30)</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={[
                                        { date: '1 Dec', score: 24 },
                                        { date: '5 Dec', score: 25 },
                                        { date: '10 Dec', score: 26 },
                                        { date: '14 Dec', score: 25.5 },
                                    ]}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis domain={[0, 30]} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* FINANCIALS TAB */}
                <TabsContent value="financial" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Monthly Recurring Revenue (MRR)</CardTitle>
                            <CardDescription>รายได้รวมรายเดือน (บาท)</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => `฿${value}`} />
                                    <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* DATA WAREHOUSE TAB - FOR DATA SCIENTISTS */}
                <TabsContent value="warehouse" className="space-y-4">
                    <Card className="border-2 border-primary/20">
                        <CardHeader className="bg-muted/30">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Database className="h-5 w-5 text-primary" />
                                        Raw Data Repository
                                    </CardTitle>
                                    <CardDescription>
                                        ดาวน์โหลดข้อมูล Raw Data สำหรับนำไปวิเคราะห์ต่อ (CSV/JSON/SQL)
                                    </CardDescription>
                                </div>
                                <Button variant="outline" onClick={() => setIsSystemHealthOpen(true)}>
                                    <Activity className="mr-2 h-4 w-4" />
                                    System Health
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="rounded-md border-t"></div>
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Table Name</th>
                                        <th className="px-6 py-3 font-medium">Records</th>
                                        <th className="px-6 py-3 font-medium">Size</th>
                                        <th className="px-6 py-3 font-medium">Last Updated</th>
                                        <th className="px-6 py-3 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {databaseTables.map((table) => (
                                        <tr key={table.name} className="hover:bg-muted/20 transition-colors">
                                            <td className="px-6 py-4 font-mono text-blue-600 font-medium">
                                                {table.name}
                                            </td>
                                            <td className="px-6 py-4">{table.rows.toLocaleString()}</td>
                                            <td className="px-6 py-4 font-mono text-xs">{table.size}</td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{table.updated}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" className="h-8" onClick={() => handlePreview(table.name)}>
                                                        Preview
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="h-8 gap-2" onClick={() => handleDownloadCSV(table.name)}>
                                                        <Download className="h-3 w-3" />
                                                        CSV
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* PREVIEW DIALOG */}
            <Dialog open={!!previewData} onOpenChange={(open) => !open && setPreviewData(null)}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Data Preview: {previewData?.name}
                        </DialogTitle>
                        <DialogDescription>
                            แสดงข้อมูลตัวอย่าง 5 แถวแรกจากตาราง (Read-only)
                        </DialogDescription>
                    </DialogHeader>
                    {previewData && (
                        <div className="border rounded-md overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted">
                                    <tr>
                                        {previewData.columns.map((col) => (
                                            <th key={col} className="px-4 py-2 font-medium border-b">{col}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {previewData.data.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-muted/30">
                                            {previewData.columns.map((col) => (
                                                <td key={col} className="px-4 py-2 border-b whitespace-nowrap">
                                                    {row[col]}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setPreviewData(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* SYSTEM HEALTH DIALOG */}
            <Dialog open={isSystemHealthOpen} onOpenChange={setIsSystemHealthOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" />
                            System Health Status
                        </DialogTitle>
                        <DialogDescription>
                            สถานะการทำงานของ Server และ Database
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>CPU Usage</span>
                                <span className="font-bold text-green-600">42%</span>
                            </div>
                            <Progress value={42} className="h-2" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Memory Usage (RAM)</span>
                                <span className="font-bold text-amber-600">76%</span>
                            </div>
                            <Progress value={76} className="h-2 bg-muted [&>div]:bg-amber-500" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Database Disk Space</span>
                                <span className="font-bold text-blue-600">23%</span>
                            </div>
                            <Progress value={23} className="h-2 bg-muted [&>div]:bg-blue-500" />
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-between">
                                <span className="text-sm font-medium">Database Node</span>
                                <Badge className="bg-green-500 hover:bg-green-600">Online</Badge>
                            </div>
                            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-between">
                                <span className="text-sm font-medium">API Server</span>
                                <Badge className="bg-green-500 hover:bg-green-600">Healthy</Badge>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}
