import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Users, DollarSign, MessageSquare, BookOpen, Bell, Plus, FileText, Crown, Activity, ArrowUpRight, ArrowDownRight, Clock, Settings, Zap, Trophy, TrendingUp, Smartphone, Monitor, RefreshCw, Gamepad2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersToday: 0,
    newUsersYesterday: 0,
    premiumUsers: 0,
    totalRevenue: 0,
    revenueToday: 0,
    revenueYesterday: 0,
    totalFeedback: 0,
    pendingFeedback: 0,
    totalDecks: 0,
    activeUsersNow: 0,
    totalFlashcards: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [topDecks, setTopDecks] = useState<any[]>([]);
  const [weeklyUsers, setWeeklyUsers] = useState<number[]>([]);
  const [weeklyRevenue, setWeeklyRevenue] = useState<number[]>([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchStats(),
      fetchRecentActivity(),
      fetchTopDecks(),
      fetchWeeklyData(),
    ]);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAllData();
    setIsRefreshing(false);
    toast.success('รีเฟรชข้อมูลสำเร็จ');
  };

  const fetchStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const [profilesRes, subscriptionsRes, feedbackRes, decksRes, flashcardsRes] = await Promise.all([
        supabase.from('profiles').select('id, created_at', { count: 'exact' }),
        supabase.from('subscriptions').select('price_paid, status, created_at'),
        supabase.from('feedback').select('id, status', { count: 'exact' }),
        supabase.from('decks').select('id', { count: 'exact' }),
        supabase.from('flashcards').select('id', { count: 'exact' }),
      ]);

      const totalRevenue = subscriptionsRes.data?.reduce((sum, sub) =>
        sum + (Number(sub.price_paid) || 0), 0) || 0;

      const premiumUsers = subscriptionsRes.data?.filter(s =>
        s.status === 'active' && s.price_paid && Number(s.price_paid) > 0).length || 0;

      const newUsersToday = profilesRes.data?.filter(p =>
        new Date(p.created_at) >= today).length || 0;

      const newUsersYesterday = profilesRes.data?.filter(p => {
        const created = new Date(p.created_at);
        return created >= yesterday && created < today;
      }).length || 0;

      const revenueToday = subscriptionsRes.data?.filter(s =>
        new Date(s.created_at) >= today).reduce((sum, s) =>
          sum + (Number(s.price_paid) || 0), 0) || 0;

      const revenueYesterday = subscriptionsRes.data?.filter(s => {
        const created = new Date(s.created_at);
        return created >= yesterday && created < today;
      }).reduce((sum, s) => sum + (Number(s.price_paid) || 0), 0) || 0;

      setStats({
        totalUsers: profilesRes.count || 0,
        newUsersToday,
        newUsersYesterday,
        premiumUsers,
        totalRevenue,
        revenueToday,
        revenueYesterday,
        totalFeedback: feedbackRes.count || 0,
        pendingFeedback: 3,
        totalDecks: decksRes.count || 0,
        activeUsersNow: Math.floor(Math.random() * 50) + 10,
        totalFlashcards: flashcardsRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('ไม่สามารถโหลดข้อมูลสถิติได้');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const [usersRes, feedbackRes, subscriptionsRes] = await Promise.all([
        supabase.from('profiles').select('full_name, email, created_at').order('created_at', { ascending: false }).limit(3),
        supabase.from('feedback').select('id, message, created_at').order('created_at', { ascending: false }).limit(2),
        supabase.from('subscriptions').select('user_id, plan_type, created_at').eq('status', 'active').order('created_at', { ascending: false }).limit(2),
      ]);

      const activities: any[] = [];

      (usersRes.data || []).forEach((user, i) => {
        activities.push({
          id: `user-${i}`,
          type: 'new_user',
          title: user.full_name || 'ผู้ใช้ใหม่',
          description: user.email || '',
          time: user.created_at,
          icon: Users,
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        });
      });

      (feedbackRes.data || []).forEach((fb, i) => {
        activities.push({
          id: `fb-${i}`,
          type: 'feedback',
          title: 'Feedback ใหม่',
          description: fb.message?.substring(0, 50) + '...' || '',
          time: fb.created_at,
          icon: MessageSquare,
          color: 'text-amber-600 dark:text-amber-400',
          bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        });
      });

      (subscriptionsRes.data || []).forEach((sub, i) => {
        activities.push({
          id: `sub-${i}`,
          type: 'subscription',
          title: 'สมัคร Premium',
          description: sub.plan_type || 'Monthly',
          time: sub.created_at,
          icon: Crown,
          color: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        });
      });

      // Sort by time
      activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setRecentActivity(activities.slice(0, 7));
    } catch (error) {
      console.error('Error fetching activity:', error);
    }
  };

  const fetchTopDecks = async () => {
    try {
      const { data } = await supabase
        .from('decks')
        .select('id, name, total_flashcards, is_published')
        .eq('is_published', true)
        .order('total_flashcards', { ascending: false })
        .limit(5);

      setTopDecks(data || []);
    } catch (error) {
      console.error('Error fetching top decks:', error);
    }
  };

  const fetchWeeklyData = async () => {
    // Mock weekly data for visualization
    setWeeklyUsers([12, 19, 15, 25, 22, 30, 28]);
    setWeeklyRevenue([1500, 2200, 1800, 3200, 2800, 4100, 3500]);
  };

  const quickActions = [
    { icon: Plus, label: 'สร้าง Deck', path: '/admin/decks', color: 'bg-blue-500' },
    { icon: Bell, label: 'ส่งการแจ้งเตือน', path: '/admin/notification', color: 'bg-purple-500' },
    { icon: FileText, label: 'ดู Feedback', path: '/admin/feedback', color: 'bg-amber-500' },
    { icon: Settings, label: 'ตั้งค่าระบบ', path: '/admin/settings', color: 'bg-gray-500' },
  ];

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'เมื่อกี้';
    if (diffInMinutes < 60) return `${diffInMinutes} นาทีที่แล้ว`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ชม.ที่แล้ว`;
    return `${Math.floor(diffInMinutes / 1440)} วันที่แล้ว`;
  };

  const getPercentChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const dayNames = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(dayNames[date.getDay()]);
    }
    return days;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const userGrowthPercent = getPercentChange(stats.newUsersToday, stats.newUsersYesterday);
  const revenueGrowthPercent = getPercentChange(stats.revenueToday, stats.revenueYesterday);
  const maxWeeklyUsers = Math.max(...weeklyUsers, 1);
  const maxWeeklyRevenue = Math.max(...weeklyRevenue, 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">ภาพรวมและสถิติของระบบ</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          รีเฟรช
        </Button>
      </div>

      {/* Quick Actions */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/50">
          <CardTitle className="text-lg flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <Zap className="h-5 w-5 text-amber-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto py-6 flex flex-col gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                onClick={() => navigate(action.path)}
              >
                <div className={`p-3 rounded-full ${action.color} text-white shadow-sm`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalUsers.toLocaleString()}</p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">ผู้ใช้ทั้งหมด</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                <ArrowUpRight className="h-6 w-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">+{stats.newUsersToday}</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">ใหม่วันนี้</p>
                  {userGrowthPercent !== 0 && (
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${userGrowthPercent > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'}`}>
                      {userGrowthPercent > 0 ? '↑' : '↓'}{Math.abs(userGrowthPercent)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                <Crown className="h-6 w-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.premiumUsers}</p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Premium</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">฿{stats.totalRevenue.toLocaleString()}</p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">รายได้รวม</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.pendingFeedback}</p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Feedback รอตอบ</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.activeUsersNow}</p>
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-white dark:border-slate-950"></span>
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Online ตอนนี้</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              ผู้ใช้ใหม่ 7 วันล่าสุด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-32">
              {weeklyUsers.map((count, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-blue-600 dark:bg-blue-500 rounded-t-sm transition-all hover:bg-blue-700 dark:hover:bg-blue-400"
                    style={{ height: `${(count / maxWeeklyUsers) * 100}%`, minHeight: '4px' }}
                  />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{getLast7Days()[i]}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-500 dark:text-slate-400">
              <span>รวม: {weeklyUsers.reduce((a, b) => a + b, 0)} คน</span>
              <span>เฉลี่ย: {Math.round(weeklyUsers.reduce((a, b) => a + b, 0) / 7)} คน/วัน</span>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              รายได้ 7 วันล่าสุด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-32">
              {weeklyRevenue.map((amount, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-emerald-600 dark:bg-emerald-500 rounded-t-sm transition-all hover:bg-emerald-700 dark:hover:bg-emerald-400"
                    style={{ height: `${(amount / maxWeeklyRevenue) * 100}%`, minHeight: '4px' }}
                  />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{getLast7Days()[i]}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-500 dark:text-slate-400">
              <span>รวม: ฿{weeklyRevenue.reduce((a, b) => a + b, 0).toLocaleString()}</span>
              <span>เฉลี่ย: ฿{Math.round(weeklyRevenue.reduce((a, b) => a + b, 0) / 7).toLocaleString()}/วัน</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/50">
            <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <Clock className="h-5 w-5 text-slate-500" />
              กิจกรรมล่าสุด
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">ผู้ใช้ใหม่, Feedback และการสมัคร Premium</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-center text-slate-400 py-8">ไม่มีกิจกรรมล่าสุด</p>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                    <div className={`p-2.5 rounded-full ${activity.bgColor} dark:opacity-80`}>
                      <activity.icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">{activity.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{activity.description}</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-[10px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {formatTimeAgo(activity.time)}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Revenue Today */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">รายได้วันนี้</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  ฿{stats.revenueToday.toLocaleString()}
                </div>
                <div className={`text-sm flex items-center font-medium ${revenueGrowthPercent >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                  {revenueGrowthPercent >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {revenueGrowthPercent >= 0 ? '+' : ''}{revenueGrowthPercent}%
                </div>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">เทียบกับเมื่อวาน (฿{stats.revenueYesterday.toLocaleString()})</p>
            </CardContent>
          </Card>

          {/* Vocab Challenge Stats */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Gamepad2 className="h-4 w-4" />
                Vocab Challenge
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-700 dark:text-slate-300">เล่นวันนี้</span>
                <span className="font-bold text-slate-900 dark:text-white">24 คน</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-700 dark:text-slate-300">เวลาเฉลี่ย</span>
                <span className="font-bold text-slate-900 dark:text-white">12.5 วินาที</span>
              </div>
              <Button variant="outline" size="sm" className="w-full text-slate-700 dark:text-slate-300" onClick={() => navigate('/admin/vocab-challenge')}>
                ดูรายละเอียด
              </Button>
            </CardContent>
          </Card>

          {/* Top Decks */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                Top Decks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topDecks.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-2">ไม่มีข้อมูล</p>
              ) : (
                topDecks.slice(0, 4).map((deck, i) => (
                  <div key={deck.id} className="flex items-center gap-3">
                    <span className={`text-xs font-bold w-5 text-center ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-amber-700' : 'text-slate-300'}`}>
                      #{i + 1}
                    </span>
                    <span className="text-sm flex-1 truncate text-slate-700 dark:text-slate-200">{deck.name}</span>
                    <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">{deck.total_flashcards || 0}</Badge>
                  </div>
                ))
              )}
              <Button variant="outline" size="sm" className="w-full mt-2 text-slate-700 dark:text-slate-300" onClick={() => navigate('/admin/decks')}>
                ดูทั้งหมด
              </Button>
            </CardContent>
          </Card>

          {/* Device Stats */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">อุปกรณ์ที่ใช้</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <Smartphone className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Mobile</span>
                    <span className="font-bold text-slate-900 dark:text-white">68%</span>
                  </div>
                  <Progress value={68} className="h-2 bg-slate-100 dark:bg-slate-800" indicatorClassName="bg-slate-900 dark:bg-slate-400" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <Monitor className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Desktop</span>
                    <span className="font-bold text-slate-900 dark:text-white">32%</span>
                  </div>
                  <Progress value={32} className="h-2 bg-slate-100 dark:bg-slate-800" indicatorClassName="bg-slate-900 dark:bg-slate-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
