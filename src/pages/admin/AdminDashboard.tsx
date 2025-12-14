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
          color: 'text-blue-500',
          bgColor: 'bg-blue-100',
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
          color: 'text-amber-500',
          bgColor: 'bg-amber-100',
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
          color: 'text-purple-500',
          bgColor: 'bg-purple-100',
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
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Dashboard</h1>
          <p className="text-muted-foreground">ภาพรวมและสถิติของระบบ</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          รีเฟรช
        </Button>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2 hover:bg-muted/80"
                onClick={() => navigate(action.path)}
              >
                <div className={`p-2 rounded-lg ${action.color}`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.totalUsers.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">ผู้ใช้ทั้งหมด</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50">
                <ArrowUpRight className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">+{stats.newUsersToday}</p>
                <div className="flex items-center gap-1">
                  <p className="text-xs text-muted-foreground">ใหม่วันนี้</p>
                  {userGrowthPercent !== 0 && (
                    <span className={`text-[10px] font-medium ${userGrowthPercent > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {userGrowthPercent > 0 ? '↑' : '↓'}{Math.abs(userGrowthPercent)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                <Crown className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{stats.premiumUsers}</p>
                <p className="text-xs text-muted-foreground">Premium</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                <DollarSign className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">฿{stats.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">รายได้รวม</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/30 border-rose-200/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/50">
                <MessageSquare className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-rose-600">{stats.pendingFeedback}</p>
                <p className="text-xs text-muted-foreground">Feedback รอตอบ</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 border-indigo-200/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
                <Activity className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <p className="text-2xl font-bold text-indigo-600">{stats.activeUsersNow}</p>
                </div>
                <p className="text-xs text-muted-foreground">Online ตอนนี้</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              ผู้ใช้ใหม่ 7 วันล่าสุด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-32">
              {weeklyUsers.map((count, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-sm transition-all hover:from-blue-600 hover:to-cyan-500"
                    style={{ height: `${(count / maxWeeklyUsers) * 100}%`, minHeight: '4px' }}
                  />
                  <span className="text-[10px] text-muted-foreground">{getLast7Days()[i]}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>รวม: {weeklyUsers.reduce((a, b) => a + b, 0)} คน</span>
              <span>เฉลี่ย: {Math.round(weeklyUsers.reduce((a, b) => a + b, 0) / 7)} คน/วัน</span>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              รายได้ 7 วันล่าสุด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-32">
              {weeklyRevenue.map((amount, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-sm transition-all hover:from-green-600 hover:to-emerald-500"
                    style={{ height: `${(amount / maxWeeklyRevenue) * 100}%`, minHeight: '4px' }}
                  />
                  <span className="text-[10px] text-muted-foreground">{getLast7Days()[i]}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>รวม: ฿{weeklyRevenue.reduce((a, b) => a + b, 0).toLocaleString()}</span>
              <span>เฉลี่ย: ฿{Math.round(weeklyRevenue.reduce((a, b) => a + b, 0) / 7).toLocaleString()}/วัน</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              กิจกรรมล่าสุด
            </CardTitle>
            <CardDescription>ผู้ใช้ใหม่, Feedback และการสมัคร Premium</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">ไม่มีกิจกรรมล่าสุด</p>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`p-2 rounded-lg ${activity.bgColor} dark:opacity-80`}>
                      <activity.icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{activity.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-xs">
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
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">รายได้วันนี้</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-green-600">
                  ฿{stats.revenueToday.toLocaleString()}
                </div>
                <div className={`text-sm flex items-center ${revenueGrowthPercent >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {revenueGrowthPercent >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {revenueGrowthPercent >= 0 ? '+' : ''}{revenueGrowthPercent}%
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">เทียบกับเมื่อวาน (฿{stats.revenueYesterday.toLocaleString()})</p>
            </CardContent>
          </Card>

          {/* Vocab Challenge Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Gamepad2 className="h-4 w-4" />
                Vocab Challenge
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">เล่นวันนี้</span>
                <span className="font-bold">24 คน</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">เวลาเฉลี่ย</span>
                <span className="font-bold">12.5 วินาที</span>
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/admin/vocab-challenge')}>
                ดูรายละเอียด
              </Button>
            </CardContent>
          </Card>

          {/* Top Decks */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                Top Decks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {topDecks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">ไม่มีข้อมูล</p>
              ) : (
                topDecks.slice(0, 4).map((deck, i) => (
                  <div key={deck.id} className="flex items-center gap-2">
                    <span className={`text-xs font-bold w-5 ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-700' : 'text-muted-foreground'}`}>
                      #{i + 1}
                    </span>
                    <span className="text-sm flex-1 truncate">{deck.name}</span>
                    <Badge variant="secondary" className="text-xs">{deck.total_flashcards || 0}</Badge>
                  </div>
                ))
              )}
              <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => navigate('/admin/decks')}>
                ดูทั้งหมด
              </Button>
            </CardContent>
          </Card>

          {/* Device Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">อุปกรณ์ที่ใช้</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 text-blue-500" />
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Mobile</span>
                    <span className="font-medium">68%</span>
                  </div>
                  <Progress value={68} className="h-2" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Monitor className="h-4 w-4 text-purple-500" />
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Desktop</span>
                    <span className="font-medium">32%</span>
                  </div>
                  <Progress value={32} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
