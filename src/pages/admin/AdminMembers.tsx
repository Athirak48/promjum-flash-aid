import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserFlashcardsDialog } from '@/components/admin/UserFlashcardsDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, Crown, UserPlus, Shield, Search, Download } from 'lucide-react';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  created_at: string;
  phone: string | null;
  is_blocked?: boolean;
  gender?: string;
  total_xp?: number;
  last_active?: string;
}

export default function AdminMembers() {
  const [members, setMembers] = useState<Profile[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');
  const [selectedUser, setSelectedUser] = useState<{ userId: string; email: string } | null>(null);
  const [showFlashcardsDialog, setShowFlashcardsDialog] = useState(false);

  useEffect(() => {
    fetchMembers();
    fetchSubscriptions();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('ไม่สามารถโหลดข้อมูลสมาชิกได้');
    } finally {
      setIsLoading(false);
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

  const getUserPlan = (userId: string) => {
    const sub = subscriptions.find(s => s.user_id === userId && s.status === 'active');
    return sub?.plan_type || 'Free';
  };

  const handleExportCSV = () => {
    const headers = ['User ID', 'Name', 'Email', 'Plan', 'Gender', 'Total XP', 'Last Active', 'Joined Date'];
    const rows = filteredMembers.map(m => [
      m.user_id,
      m.full_name || '',
      m.email || '',
      getUserPlan(m.user_id),
      m.gender || '-',
      m.total_xp || 0,
      m.last_active || '-',
      new Date(m.created_at).toLocaleDateString('th-TH'),
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `members_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Export สำเร็จ');
  };

  const handleToggleBlock = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_blocked: !currentStatus })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success(currentStatus ? 'ปลดแบนผู้ใช้สำเร็จ' : 'แบนผู้ใช้สำเร็จ');

      // Update local state
      setMembers(members.map(m =>
        m.user_id === userId ? { ...m, is_blocked: !currentStatus } : m
      ));
    } catch (error) {
      console.error('Error toggling block status:', error);
      toast.error('ไม่สามารถเปลี่ยนสถานะได้');
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch =
      member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.user_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    const matchesPlan = filterPlan === 'all' || getUserPlan(member.user_id).toLowerCase() === filterPlan;
    return matchesSearch && matchesRole && matchesPlan;
  });

  // Stats
  const totalMembers = members.length;
  const todayMembers = members.filter(m => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(m.created_at) >= today;
  }).length;
  const premiumMembers = members.filter(m => getUserPlan(m.user_id) !== 'Free').length;
  const adminCount = members.filter(m => m.role === 'admin').length;

  const getPlanBadge = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'monthly': return <Badge className="bg-blue-500">Monthly</Badge>;
      case 'yearly': return <Badge className="bg-purple-500">Yearly</Badge>;
      case 'lifetime': return <Badge className="bg-amber-500">Lifetime</Badge>;
      default: return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Free</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{totalMembers}</p>
                <p className="text-xs text-muted-foreground">สมาชิกทั้งหมด</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50">
                <UserPlus className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">+{todayMembers}</p>
                <p className="text-xs text-muted-foreground">ใหม่วันนี้</p>
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
                <p className="text-2xl font-bold text-purple-600">{premiumMembers}</p>
                <p className="text-xs text-muted-foreground">Premium</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/30 border-rose-200/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/50">
                <Shield className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-rose-600">{adminCount}</p>
                <p className="text-xs text-muted-foreground">Admin</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Row */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาผู้ใช้..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-[130px] bg-white">
            <SelectValue placeholder="ทุก Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุก Role</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPlan} onValueChange={setFilterPlan}>
          <SelectTrigger className="w-[130px] bg-white">
            <SelectValue placeholder="ทุก Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุก Plan</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Members Table Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>จัดการผู้ใช้</CardTitle>
              <CardDescription>ดู แก้ไข และจัดการผู้ใช้ทั้งหมด</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold">User ID</TableHead>
                  <TableHead className="font-semibold">Name / Email</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Plan Type</TableHead>
                  <TableHead className="font-semibold">Gender</TableHead>
                  <TableHead className="font-semibold">Total XP</TableHead>
                  <TableHead className="font-semibold">Deck</TableHead>
                  <TableHead className="font-semibold">Last Active</TableHead>
                  <TableHead className="font-semibold">Joined Date</TableHead>
                  <TableHead className="font-semibold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                      ไม่พบข้อมูลสมาชิก
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => (
                    <TableRow key={member.id} className={member.is_blocked ? 'bg-red-50/50' : ''}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {member.user_id?.substring(0, 8)}...
                        <br />
                        <span className="text-[10px]">{member.user_id?.substring(8, 20)}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{member.full_name || '-'}</p>
                          <p className="text-sm text-blue-600">{member.email || '-'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.role === 'admin' ? 'destructive' : 'secondary'}>
                          {member.role === 'admin' ? 'Admin' : 'User'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getPlanBadge(getUserPlan(member.user_id))}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {member.gender || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {member.total_xp || '-'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            setSelectedUser({ userId: member.user_id, email: member.email || '' });
                            setShowFlashcardsDialog(true);
                          }}
                        >
                          View Decks
                        </Button>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {member.last_active || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(member.created_at).toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2">
                            View
                          </Button>
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2">
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={member.is_blocked
                              ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50 px-2"
                              : "text-red-600 hover:text-red-700 hover:bg-red-50 px-2"
                            }
                            onClick={() => handleToggleBlock(member.user_id, member.is_blocked || false)}
                          >
                            {member.is_blocked ? 'Unblock' : 'Block'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedUser && (
        <UserFlashcardsDialog
          open={showFlashcardsDialog}
          onOpenChange={setShowFlashcardsDialog}
          userId={selectedUser.userId}
          userEmail={selectedUser.email}
        />
      )}
    </div>
  );
}

