import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Bell, Send, Users, Clock, Mail, Smartphone, MessageSquare, Plus, Eye, Trash2, RefreshCw, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface NotificationBroadcast {
    id: string;
    title: string;
    message: string;
    type: 'push' | 'email' | 'in_app';
    target_audience: 'all' | 'premium' | 'free';
    status: 'sent' | 'scheduled' | 'draft';
    scheduled_at: string | null;
    sent_at: string | null;
    read_count: number;
    created_at: string;
    created_by: string | null;
}

export default function AdminNotification() {
    const { user } = useAuth();
    const [broadcasts, setBroadcasts] = useState<NotificationBroadcast[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [selectedBroadcast, setSelectedBroadcast] = useState<NotificationBroadcast | null>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [sending, setSending] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'in_app' as 'push' | 'email' | 'in_app',
        target_audience: 'all' as 'all' | 'premium' | 'free',
        scheduled_at: '',
        is_scheduled: false,
    });

    useEffect(() => {
        fetchBroadcasts();
    }, []);

    const fetchBroadcasts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('notification_broadcasts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBroadcasts((data || []) as NotificationBroadcast[]);
        } catch (error: any) {
            console.error('Error fetching broadcasts:', error);
            toast.error('ไม่สามารถโหลดข้อมูลได้');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBroadcast = async () => {
        if (!formData.title.trim() || !formData.message.trim()) {
            toast.error('กรุณากรอกหัวข้อและข้อความ');
            return;
        }

        setSending(true);
        try {
            const newBroadcast = {
                title: formData.title.trim(),
                message: formData.message.trim(),
                type: formData.type,
                target_audience: formData.target_audience,
                status: formData.is_scheduled ? 'scheduled' : 'sent',
                scheduled_at: formData.is_scheduled ? formData.scheduled_at : null,
                sent_at: formData.is_scheduled ? null : new Date().toISOString(),
                created_by: user?.id || null,
                read_count: 0
            };

            const { data: broadcast, error } = await supabase
                .from('notification_broadcasts')
                .insert(newBroadcast)
                .select()
                .single();

            if (error) throw error;

            // If sending immediately, also create recipient records for target users
            if (!formData.is_scheduled) {
                await sendToRecipients(broadcast.id, formData.target_audience);
            }

            setBroadcasts([broadcast as NotificationBroadcast, ...broadcasts]);
            setIsCreateDialogOpen(false);
            setFormData({
                title: '',
                message: '',
                type: 'in_app',
                target_audience: 'all',
                scheduled_at: '',
                is_scheduled: false,
            });

            toast.success(formData.is_scheduled ? 'ตั้งเวลาส่งสำเร็จ' : 'ส่งการแจ้งเตือนสำเร็จ');
        } catch (error: any) {
            console.error('Error creating broadcast:', error);
            toast.error('ไม่สามารถส่งการแจ้งเตือนได้: ' + (error.message || 'Unknown error'));
        } finally {
            setSending(false);
        }
    };

    const sendToRecipients = async (broadcastId: string, targetAudience: string) => {
        try {
            // Get target users based on audience - simple query without complex filters
            const { data: users, error } = await supabase
                .from('profiles')
                .select('user_id');
                
            if (error) throw error;

            if (users && users.length > 0) {
                // Create recipient records in batches
                const recipients = users.map(u => ({
                    broadcast_id: broadcastId,
                    user_id: u.user_id,
                    is_read: false
                }));

                const { error: insertError } = await supabase
                    .from('notification_broadcast_recipients')
                    .insert(recipients);

                if (insertError) {
                    console.error('Error creating recipients:', insertError);
                }
            }
        } catch (error) {
            console.error('Error sending to recipients:', error);
        }
    };

    const handleDeleteBroadcast = async (id: string) => {
        try {
            const { error } = await supabase
                .from('notification_broadcasts')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setBroadcasts(broadcasts.filter(b => b.id !== id));
            toast.success('ลบการแจ้งเตือนสำเร็จ');
        } catch (error: any) {
            console.error('Error deleting broadcast:', error);
            toast.error('ไม่สามารถลบได้: ' + error.message);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'push': return <Smartphone className="h-4 w-4" />;
            case 'email': return <Mail className="h-4 w-4" />;
            case 'in_app': return <MessageSquare className="h-4 w-4" />;
            default: return <Bell className="h-4 w-4" />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'push': return 'Push';
            case 'email': return 'Email';
            case 'in_app': return 'In-App';
            default: return type;
        }
    };

    const getAudienceLabel = (audience: string) => {
        switch (audience) {
            case 'all': return 'ทุกคน';
            case 'premium': return 'Premium';
            case 'free': return 'Free';
            default: return audience;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'sent': return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">ส่งแล้ว</Badge>;
            case 'scheduled': return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">ตั้งเวลาไว้</Badge>;
            case 'draft': return <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-0">ฉบับร่าง</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    const filteredBroadcasts = useMemo(() => {
        return broadcasts.filter(b => {
            if (activeTab === 'all') return true;
            return b.status === activeTab;
        });
    }, [broadcasts, activeTab]);

    // Stats
    const stats = useMemo(() => ({
        total: broadcasts.length,
        sent: broadcasts.filter(b => b.status === 'sent').length,
        scheduled: broadcasts.filter(b => b.status === 'scheduled').length,
        totalReads: broadcasts.reduce((acc, b) => acc + (b.read_count || 0), 0)
    }), [broadcasts]);

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Bell className="h-8 w-8 text-primary" />
                        Notification Center
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">ส่งการแจ้งเตือนถึงผู้ใช้ทั้งหมด</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchBroadcasts} className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        รีเฟรช
                    </Button>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                สร้างการแจ้งเตือน
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>สร้างการแจ้งเตือนใหม่</DialogTitle>
                                <DialogDescription>กรอกข้อมูลเพื่อส่งการแจ้งเตือนถึงผู้ใช้</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>หัวข้อ</Label>
                                    <Input
                                        placeholder="หัวข้อการแจ้งเตือน..."
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>ข้อความ</Label>
                                    <Textarea
                                        placeholder="เนื้อหาการแจ้งเตือน..."
                                        rows={4}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>ประเภท</Label>
                                        <Select
                                            value={formData.type}
                                            onValueChange={(value: 'push' | 'email' | 'in_app') => setFormData({ ...formData, type: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="in_app">
                                                    <div className="flex items-center gap-2">
                                                        <MessageSquare className="h-4 w-4" /> In-App
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="push">
                                                    <div className="flex items-center gap-2">
                                                        <Smartphone className="h-4 w-4" /> Push
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="email">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4" /> Email
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>กลุ่มเป้าหมาย</Label>
                                        <Select
                                            value={formData.target_audience}
                                            onValueChange={(value: 'all' | 'premium' | 'free') => setFormData({ ...formData, target_audience: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">ทุกคน</SelectItem>
                                                <SelectItem value="premium">Premium เท่านั้น</SelectItem>
                                                <SelectItem value="free">Free เท่านั้น</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="schedule"
                                            checked={formData.is_scheduled}
                                            onChange={(e) => setFormData({ ...formData, is_scheduled: e.target.checked })}
                                            className="rounded"
                                        />
                                        <Label htmlFor="schedule" className="cursor-pointer">ตั้งเวลาส่ง</Label>
                                    </div>
                                    {formData.is_scheduled && (
                                        <Input
                                            type="datetime-local"
                                            value={formData.scheduled_at}
                                            onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                                        />
                                    )}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>ยกเลิก</Button>
                                <Button onClick={handleCreateBroadcast} disabled={!formData.title || !formData.message || sending}>
                                    {sending ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                            กำลังส่ง...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            {formData.is_scheduled ? 'ตั้งเวลาส่ง' : 'ส่งเลย'}
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
                    <CardContent className="pt-6 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">ส่งแล้ว</p>
                                <p className="text-3xl font-bold mt-1">{stats.sent}</p>
                            </div>
                            <Send className="h-10 w-10 text-green-200" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                    <CardContent className="pt-6 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">ตั้งเวลาไว้</p>
                                <p className="text-3xl font-bold mt-1">{stats.scheduled}</p>
                            </div>
                            <Clock className="h-10 w-10 text-blue-200" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                    <CardContent className="pt-6 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm">ยอดอ่าน</p>
                                <p className="text-3xl font-bold mt-1">{stats.totalReads.toLocaleString()}</p>
                            </div>
                            <Eye className="h-10 w-10 text-purple-200" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
                    <CardContent className="pt-6 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-amber-100 text-sm">ทั้งหมด</p>
                                <p className="text-3xl font-bold mt-1">{stats.total}</p>
                            </div>
                            <Bell className="h-10 w-10 text-amber-200" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Notifications Table */}
            <Card>
                <CardHeader className="border-b">
                    <CardTitle className="text-slate-800 dark:text-white">รายการการแจ้งเตือน</CardTitle>
                    <CardDescription>ประวัติและสถานะการแจ้งเตือนทั้งหมด</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
                        <TabsList>
                            <TabsTrigger value="all">ทั้งหมด ({stats.total})</TabsTrigger>
                            <TabsTrigger value="sent">ส่งแล้ว ({stats.sent})</TabsTrigger>
                            <TabsTrigger value="scheduled">ตั้งเวลาไว้ ({stats.scheduled})</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {filteredBroadcasts.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <Bell className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                            <p>ยังไม่มีการแจ้งเตือน</p>
                            <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                สร้างการแจ้งเตือนแรก
                            </Button>
                        </div>
                    ) : (
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50 dark:bg-slate-900">
                                        <TableHead className="font-semibold">หัวข้อ</TableHead>
                                        <TableHead className="font-semibold">ประเภท</TableHead>
                                        <TableHead className="font-semibold">กลุ่มเป้าหมาย</TableHead>
                                        <TableHead className="font-semibold">สถานะ</TableHead>
                                        <TableHead className="font-semibold">ยอดอ่าน</TableHead>
                                        <TableHead className="font-semibold">วันที่</TableHead>
                                        <TableHead className="font-semibold">การกระทำ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredBroadcasts.map((broadcast) => (
                                        <TableRow key={broadcast.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <TableCell className="font-medium max-w-[200px] truncate">
                                                {broadcast.title}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                                    {getTypeIcon(broadcast.type)}
                                                    {getTypeLabel(broadcast.type)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{getAudienceLabel(broadcast.target_audience)}</Badge>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(broadcast.status)}</TableCell>
                                            <TableCell className="text-slate-600 dark:text-slate-300">
                                                {(broadcast.read_count || 0).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-slate-600 dark:text-slate-300">
                                                {formatDate(broadcast.sent_at || broadcast.scheduled_at || broadcast.created_at)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedBroadcast(broadcast);
                                                            setIsViewDialogOpen(true);
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        onClick={() => handleDeleteBroadcast(broadcast.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* View Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedBroadcast?.title}</DialogTitle>
                        <DialogDescription>รายละเอียดการแจ้งเตือน</DialogDescription>
                    </DialogHeader>
                    {selectedBroadcast && (
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                                    {selectedBroadcast.message}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-slate-500">ประเภท</p>
                                    <p className="font-medium flex items-center gap-2">
                                        {getTypeIcon(selectedBroadcast.type)}
                                        {getTypeLabel(selectedBroadcast.type)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-slate-500">กลุ่มเป้าหมาย</p>
                                    <p className="font-medium">{getAudienceLabel(selectedBroadcast.target_audience)}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">สถานะ</p>
                                    <div>{getStatusBadge(selectedBroadcast.status)}</div>
                                </div>
                                <div>
                                    <p className="text-slate-500">ยอดอ่าน</p>
                                    <p className="font-medium">{(selectedBroadcast.read_count || 0).toLocaleString()} คน</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">วันที่สร้าง</p>
                                    <p className="font-medium">{formatDate(selectedBroadcast.created_at)}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">วันที่ส่ง</p>
                                    <p className="font-medium">{formatDate(selectedBroadcast.sent_at)}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
