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

export default function AdminMembers() {
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*, profiles(full_name, email)')
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

  const filteredMembers = members.filter(member =>
    member.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'cancelled': return 'destructive';
      case 'expired': return 'secondary';
      case 'paused': return 'outline';
      default: return 'secondary';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'lifetime': return 'default';
      case 'yearly': return 'default';
      case 'monthly': return 'secondary';
      case 'free': return 'outline';
      default: return 'secondary';
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
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Members</h1>
        <p className="text-muted-foreground">จัดการสมาชิกและแผนการใช้งาน</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายชื่อสมาชิก</CardTitle>
          <CardDescription>ดูข้อมูลสมาชิก แผน และสถานะการใช้งาน</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="ค้นหาสมาชิก..."
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
                  <TableHead>แผน</TableHead>
                  <TableHead>วันที่เริ่ม</TableHead>
                  <TableHead>วันหมดอายุ</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>ราคา</TableHead>
                  <TableHead>การกระทำ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.profiles?.full_name || '-'}
                    </TableCell>
                    <TableCell>{member.profiles?.email || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={getPlanColor(member.plan_type)}>
                        {member.plan_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(member.started_at).toLocaleDateString('th-TH')}
                    </TableCell>
                    <TableCell>
                      {member.expires_at 
                        ? new Date(member.expires_at).toLocaleDateString('th-TH')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(member.status)}>
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{member.price_paid ? `${member.price_paid} ฿` : '-'}</TableCell>
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
    </div>
  );
}
