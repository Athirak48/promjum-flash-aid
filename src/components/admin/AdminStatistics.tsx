import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  CreditCard, 
  DollarSign, 
  TrendingDown,
  TrendingUp,
  MessageSquare,
  Target,
  Award
} from 'lucide-react';
import StatsChart from '@/components/StatsChart';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface KPIStats {
  totalUsers: number;
  premiumUsers: number;
  membershipRevenue: number;
  subdeckRevenue: number;
  churnRate: number;
  conversionRate: number;
  recentFeedback: number;
  previousTotalUsers?: number;
}

interface GrowthData {
  month: string;
  users: number;
  premium: number;
}

interface TopContent {
  name: string;
  users: number;
  revenue: number;
}

export default function AdminStatistics() {
  const [kpiStats, setKpiStats] = useState<KPIStats>({
    totalUsers: 0,
    premiumUsers: 0,
    membershipRevenue: 0,
    subdeckRevenue: 0,
    churnRate: 0,
    conversionRate: 0,
    recentFeedback: 0,
  });
  const [growthData, setGrowthData] = useState<GrowthData[]>([]);
  const [topDecks, setTopDecks] = useState<TopContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchKPIStats(),
        fetchGrowthData(),
        fetchTopContent(),
      ]);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast.error('ไม่สามารถโหลดข้อมูลสถิติได้');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchKPIStats = async () => {
    try {
      // Fetch all required data
      const [profilesRes, subscriptionsRes, purchasesRes, feedbackRes] = await Promise.all([
        supabase.from('profiles').select('created_at', { count: 'exact' }),
        supabase.from('subscriptions').select('*'),
        supabase.from('user_subdeck_purchases').select('amount_paid'),
        supabase.from('feedback').select('created_at', { count: 'exact' }),
      ]);

      const totalUsers = profilesRes.count || 0;
      
      // Premium users (active subscriptions with payment)
      const activeSubscriptions = subscriptionsRes.data?.filter(
        s => s.status === 'active' && s.price_paid && Number(s.price_paid) > 0
      ) || [];
      const premiumUsers = activeSubscriptions.length;

      // Membership revenue
      const membershipRevenue = activeSubscriptions.reduce(
        (sum, sub) => sum + (Number(sub.price_paid) || 0), 
        0
      );

      // Subdeck revenue
      const subdeckRevenue = purchasesRes.data?.reduce(
        (sum, purchase) => sum + (Number(purchase.amount_paid) || 0),
        0
      ) || 0;

      // Churn rate (cancelled subscriptions in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const cancelledSubs = subscriptionsRes.data?.filter(
        s => s.cancelled_at && new Date(s.cancelled_at) > thirtyDaysAgo
      ) || [];
      const churnRate = premiumUsers > 0 ? (cancelledSubs.length / premiumUsers) * 100 : 0;

      // Conversion rate
      const conversionRate = totalUsers > 0 ? (premiumUsers / totalUsers) * 100 : 0;

      // Recent feedback (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentFeedback = feedbackRes.count || 0;

      setKpiStats({
        totalUsers,
        premiumUsers,
        membershipRevenue,
        subdeckRevenue,
        churnRate,
        conversionRate,
        recentFeedback,
      });
    } catch (error) {
      console.error('Error fetching KPI stats:', error);
    }
  };

  const fetchGrowthData = async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('created_at')
        .order('created_at', { ascending: true });

      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('started_at')
        .eq('status', 'active')
        .order('started_at', { ascending: true });

      // Group by month for last 6 months
      const monthlyData: { [key: string]: { users: number; premium: number } } = {};
      const months = [];
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toLocaleDateString('th-TH', { month: 'short', year: '2-digit' });
        months.push(monthKey);
        monthlyData[monthKey] = { users: 0, premium: 0 };
      }

      profiles?.forEach(profile => {
        const date = new Date(profile.created_at);
        const monthKey = date.toLocaleDateString('th-TH', { month: 'short', year: '2-digit' });
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].users += 1;
        }
      });

      subscriptions?.forEach(sub => {
        const date = new Date(sub.started_at);
        const monthKey = date.toLocaleDateString('th-TH', { month: 'short', year: '2-digit' });
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].premium += 1;
        }
      });

      const chartData = months.map(month => ({
        month,
        users: monthlyData[month].users,
        premium: monthlyData[month].premium,
      }));

      setGrowthData(chartData);
    } catch (error) {
      console.error('Error fetching growth data:', error);
    }
  };

  const fetchTopContent = async () => {
    try {
      const { data: decks } = await supabase
        .from('decks')
        .select(`
          name,
          sub_decks (
            user_subdeck_progress (user_id),
            user_subdeck_purchases (amount_paid)
          )
        `)
        .limit(5);

      const topDecksData = decks?.map(deck => {
        const uniqueUsers = new Set();
        let revenue = 0;

        deck.sub_decks?.forEach((subdeck: any) => {
          subdeck.user_subdeck_progress?.forEach((progress: any) => {
            uniqueUsers.add(progress.user_id);
          });
          subdeck.user_subdeck_purchases?.forEach((purchase: any) => {
            revenue += Number(purchase.amount_paid) || 0;
          });
        });

        return {
          name: deck.name,
          users: uniqueUsers.size,
          revenue,
        };
      }).sort((a, b) => b.users - a.users).slice(0, 5) || [];

      setTopDecks(topDecksData);
    } catch (error) {
      console.error('Error fetching top content:', error);
    }
  };

  const calculatePercentage = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Section 1: KPI Cards */}
      <div>
        <h2 className="text-2xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
          สถิติภาพรวม
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsChart
            title="ผู้ใช้ทั้งหมด"
            value={kpiStats.totalUsers}
            unit="คน"
            icon="chart"
            color="primary"
          />
          <StatsChart
            title="สมาชิก Premium"
            value={kpiStats.premiumUsers}
            unit="คน"
            percentage={kpiStats.conversionRate}
            icon="trending"
            color="primary"
          />
          <Card className="bg-gradient-card backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รายได้ Membership</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">฿{kpiStats.membershipRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">จากสมาชิก</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รายได้ Subdeck</CardTitle>
              <CreditCard className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">฿{kpiStats.subdeckRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">จากการซื้อ Deck</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpiStats.churnRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">ในรอบ 30 วัน</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpiStats.conversionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">Free → Premium</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Feedback ล่าสุด</CardTitle>
              <MessageSquare className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpiStats.recentFeedback}</div>
              <p className="text-xs text-muted-foreground mt-1">ใน 7 วันที่ผ่านมา</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รายได้รวม</CardTitle>
              <Award className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ฿{(kpiStats.membershipRevenue + kpiStats.subdeckRevenue).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">รายได้ทั้งหมด</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 2: Graphs & Detailed Data */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          สถิติโดยรวม
        </h2>

        {/* Growth Chart */}
        <Card className="bg-gradient-card backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>กราฟการเติบโตของสมาชิก</CardTitle>
            <CardDescription>ผู้ใช้ใหม่และสมาชิก Premium ในช่วง 6 เดือนที่ผ่านมา</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="ผู้ใช้ทั้งหมด"
                />
                <Line 
                  type="monotone" 
                  dataKey="premium" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={2}
                  name="สมาชิก Premium"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Distribution */}
          <Card className="bg-gradient-card backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>สัดส่วนรายได้</CardTitle>
              <CardDescription>รายได้แบ่งตามประเภท</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Membership', value: kpiStats.membershipRevenue },
                      { name: 'Subdeck Sales', value: kpiStats.subdeckRevenue },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    <Cell fill="hsl(var(--primary))" />
                    <Cell fill="hsl(var(--accent))" />
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => `฿${value.toLocaleString()}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* User Status Distribution */}
          <Card className="bg-gradient-card backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>สัดส่วนผู้ใช้</CardTitle>
              <CardDescription>แยกตามประเภทผู้ใช้</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Free Users', value: kpiStats.totalUsers - kpiStats.premiumUsers },
                      { name: 'Premium Users', value: kpiStats.premiumUsers },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="hsl(var(--muted))"
                    dataKey="value"
                  >
                    <Cell fill="hsl(var(--muted))" />
                    <Cell fill="hsl(var(--primary))" />
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => `${value} คน`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top 5 Decks */}
        <Card className="bg-gradient-card backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Top 5 Decks ยอดนิยม</CardTitle>
            <CardDescription>Deck ที่มีผู้ใช้งานมากที่สุด</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>ชื่อ Deck</TableHead>
                  <TableHead className="text-right">ผู้ใช้</TableHead>
                  <TableHead className="text-right">รายได้</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topDecks.length > 0 ? (
                  topDecks.map((deck, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">{deck.name}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{deck.users} คน</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-primary">
                          ฿{deck.revenue.toLocaleString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      ไม่มีข้อมูล
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
