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
import UserDetailModal from '@/components/admin/UserDetailModal';
import EditUserModal from '@/components/admin/EditUserModal';
import BlockUserDialog from '@/components/admin/BlockUserDialog';
import UserDecksDialog from '@/components/admin/UserDecksDialog';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMembers: 0,
    totalRevenue: 0,
    totalFeedback: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<{id: string, name: string, email: string, isBlocked: boolean} | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showUserDecks, setShowUserDecks] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchSubscriptions();
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
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('user_id, plan_type, status');

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  const getUserPlanType = (userId: string) => {
    const sub = subscriptions.find(s => s.user_id === userId && s.status === 'active');
    return sub?.plan_type || 'Free';
  };

  const handleViewUser = (user: any) => {
    setSelectedUser({
      id: user.user_id,
      name: user.full_name || 'Unknown User',
      email: user.email || 'No email',
      isBlocked: user.is_blocked || false,
    });
    setShowUserDetail(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser({
      id: user.user_id,
      name: user.full_name || 'Unknown User',
      email: user.email || 'No email',
      isBlocked: user.is_blocked || false,
    });
    setShowEditUser(true);
  };

  const handleBlockUser = (user: any) => {
    setSelectedUser({
      id: user.user_id,
      name: user.full_name || 'Unknown User',
      email: user.email || 'No email',
      isBlocked: user.is_blocked || false,
    });
    setShowBlockDialog(true);
  };

  const handleEditSuccess = () => {
    fetchUsers();
    fetchSubscriptions();
  };

  const handleBlockSuccess = () => {
    fetchUsers();
  };

  const handleViewDecks = (user: any) => {
    setSelectedUser({
      id: user.user_id,
      name: user.full_name || 'Unknown User',
      email: user.email || 'No email',
      isBlocked: user.is_blocked || false,
    });
    setShowUserDecks(true);
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
              
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Name / Email</TableHead>
                      <TableHead>Plan Type</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Total XP</TableHead>
                      <TableHead>Deck</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Joined Date</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className={user.is_blocked ? 'bg-destructive/5' : ''}>
                        <TableCell className="font-mono text-xs max-w-[200px] break-all">{user.user_id}</TableCell>
                        <TableCell className="min-w-[200px]">
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">{user.full_name || '-'}</span>
                            <span className="text-sm text-foreground">{user.email || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getUserPlanType(user.user_id) !== 'Free' ? 'default' : 'secondary'}>
                            {getUserPlanType(user.user_id)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">-</TableCell>
                        <TableCell className="text-muted-foreground">-</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewDecks(user)}
                          >
                            View Decks
                          </Button>
                        </TableCell>
                        <TableCell className="text-muted-foreground">-</TableCell>
                        <TableCell className="text-sm">
                          {new Date(user.created_at).toLocaleDateString('th-TH', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleViewUser(user)}>
                              View
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditUser(user)}
                              disabled={user.is_blocked}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={user.is_blocked ? 'text-orange-600' : 'text-destructive'}
                              onClick={() => handleBlockUser(user)}
                            >
                              {user.is_blocked ? 'Unblock' : 'Block'}
                            </Button>
                          </div>
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

      {/* User Detail Modal */}
      {selectedUser && (
        <>
          <UserDetailModal
            open={showUserDetail}
            onOpenChange={setShowUserDetail}
            userId={selectedUser.id}
            userName={selectedUser.name}
            userEmail={selectedUser.email}
          />
          <EditUserModal
            open={showEditUser}
            onOpenChange={setShowEditUser}
            userId={selectedUser.id}
            userName={selectedUser.name}
            userEmail={selectedUser.email}
            onSuccess={handleEditSuccess}
          />
          <BlockUserDialog
            open={showBlockDialog}
            onOpenChange={setShowBlockDialog}
            userId={selectedUser.id}
            userName={selectedUser.name}
            isBlocked={selectedUser.isBlocked}
            onSuccess={handleBlockSuccess}
          />
          <UserDecksDialog
            open={showUserDecks}
            onOpenChange={setShowUserDecks}
            userId={selectedUser.id}
            userEmail={selectedUser.email}
          />
        </>
      )}
    </div>
  );
}
