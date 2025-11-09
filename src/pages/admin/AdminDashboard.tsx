import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Users, DollarSign, MessageSquare, TrendingUp } from 'lucide-react';
import StatsChart from '@/components/StatsChart';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMembers: 0,
    totalRevenue: 0,
    totalFeedback: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  const fetchStats = async () => {
    try {
      const [profilesRes, subscriptionsRes, feedbackRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('subscriptions').select('price_paid, status'),
        supabase.from('feedback').select('id', { count: 'exact' }),
      ]);

      const totalRevenue = subscriptionsRes.data?.reduce((sum, sub) => 
        sum + (Number(sub.price_paid) || 0), 0) || 0;
      
      const totalMembers = subscriptionsRes.data?.filter(s => 
        s.status === 'active' && s.price_paid && Number(s.price_paid) > 0).length || 0;

      setStats({
        totalUsers: profilesRes.count || 0,
        totalMembers,
        totalRevenue,
        totalFeedback: feedbackRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('ไม่สามารถโหลดข้อมูลสถิติได้');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, user_roles(role)')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">ภาพรวมและสถิติของระบบ</p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="users">ข้อมูลผู้ใช้</TabsTrigger>
          <TabsTrigger value="stats">สถิติผู้ใช้</TabsTrigger>
          <TabsTrigger value="notifications">แจ้งเตือน</TabsTrigger>
        </TabsList>

        {/* User Data Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>จัดการผู้ใช้</CardTitle>
              <CardDescription>ดู แก้ไข และจัดการผู้ใช้ทั้งหมด</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="ค้นหาผู้ใช้..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ชื่อ</TableHead>
                      <TableHead>อีเมล</TableHead>
                      <TableHead>บทบาท</TableHead>
                      <TableHead>วันที่สมัคร</TableHead>
                      <TableHead>การกระทำ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name || '-'}</TableCell>
                        <TableCell>{user.email || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={user.user_roles?.[0]?.role === 'admin' ? 'default' : 'secondary'}>
                            {user.user_roles?.[0]?.role || 'user'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString('th-TH')}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">แก้ไข</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsChart
              title="ผู้ใช้ทั้งหมด"
              value={stats.totalUsers}
              unit="คน"
              icon="chart"
              percentage={12}
            />
            <StatsChart
              title="สมาชิก"
              value={stats.totalMembers}
              unit="คน"
              icon="trending"
              percentage={8}
            />
            <StatsChart
              title="รายได้"
              value={stats.totalRevenue}
              unit="บาท"
              icon="target"
              percentage={15}
            />
            <StatsChart
              title="Feedback"
              value={stats.totalFeedback}
              unit="รายการ"
              icon="clock"
              percentage={5}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>สถิติโดยรวม</CardTitle>
              <CardDescription>ข้อมูลสถิติและแนวโน้มการใช้งาน</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">กราฟและข้อมูลสถิติเพิ่มเติมจะแสดงที่นี่</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>สร้างการแจ้งเตือน</CardTitle>
              <CardDescription>ส่งการแจ้งเตือนให้กับผู้ใช้</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">หัวข้อ</label>
                <Input placeholder="ระบุหัวข้อการแจ้งเตือน" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">ข้อความ</label>
                <Textarea placeholder="ระบุข้อความที่ต้องการส่ง" rows={4} />
              </div>
              <Button className="w-full">ส่งการแจ้งเตือน</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
