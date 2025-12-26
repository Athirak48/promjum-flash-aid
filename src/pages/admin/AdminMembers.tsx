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
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{totalMembers}</p>
                <p className="text-sm font-medium text-slate-500">สมาชิกทั้งหมด</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                <UserPlus className="h-6 w-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">+{todayMembers}</p>
                <p className="text-sm font-medium text-slate-500">ใหม่วันนี้</p>
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
                <p className="text-3xl font-bold text-slate-900">{premiumMembers}</p>
                <p className="text-sm font-medium text-slate-500">Premium</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{adminCount}</p>
                <p className="text-sm font-medium text-slate-500">Admin</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Row */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="ค้นหาผู้ใช้..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
          />
        </div>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-[130px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
            <SelectValue placeholder="ทุก Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุก Role</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPlan} onValueChange={setFilterPlan}>
          <SelectTrigger className="w-[130px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
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
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-800">จัดการผู้ใช้</CardTitle>
              <CardDescription className="text-slate-500">ดู แก้ไข และจัดการผู้ใช้ทั้งหมด</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900">
                  <TableHead className="font-semibold text-slate-700">User ID</TableHead>
                  <TableHead className="font-semibold text-slate-700">Name / Email</TableHead>
                  <TableHead className="font-semibold text-slate-700">Role</TableHead>
                  <TableHead className="font-semibold text-slate-700">Plan Type</TableHead>
                  <TableHead className="font-semibold text-slate-700">Gender</TableHead>
                  <TableHead className="font-semibold text-slate-700">Total XP</TableHead>
                  <TableHead className="font-semibold text-slate-700">Deck</TableHead>
                  <TableHead className="font-semibold text-slate-700">Last Active</TableHead>
                  <TableHead className="font-semibold text-slate-700">Joined Date</TableHead>
                  <TableHead className="font-semibold text-slate-700">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-slate-400 py-8">
                      ไม่พบข้อมูลสมาชิก
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => (
                    <TableRow key={member.id} className={member.is_blocked ? 'bg-red-50/50' : ''}>
                      <TableCell className="font-mono text-xs text-slate-500">
                        {member.user_id?.substring(0, 8)}...
                        <br />
                        <span className="text-[10px] opacity-70">{member.user_id?.substring(8, 20)}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900">{member.full_name || '-'}</p>
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
                      <TableCell className="text-slate-600">
                        {member.gender || '-'}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {member.total_xp || '-'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs text-slate-600"
                          onClick={() => {
                            setSelectedUser({ userId: member.user_id, email: member.email || '' });
                            setShowFlashcardsDialog(true);
                          }}
                        >
                          View Decks
                        </Button>
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm">
                        {member.last_active || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
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

