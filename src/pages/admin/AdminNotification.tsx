import { useState, useEffect } from 'react';
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
import { Bell, Send, Users, Clock, Mail, Smartphone, MessageSquare, Plus, Eye, Trash2, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
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
}

// Mock data for notifications
const mockNotifications: Notification[] = [
    {
        id: '1',
        title: 'ยินดีต้อนรับสมาชิกใหม่!',
        message: 'ขอบคุณที่เข้าร่วม Promjum Flash Aid เริ่มเรียนคำศัพท์วันนี้!',
        type: 'in_app',
        target_audience: 'all',
        status: 'sent',
        scheduled_at: null,
        sent_at: '2024-12-14T10:00:00',
        read_count: 1250,
        created_at: '2024-12-14T10:00:00',
    },
    {
        id: '2',
        title: 'โปรโมชั่น Premium 50% OFF',
        message: 'อัปเกรดเป็น Premium วันนี้ ลด 50% ถึงสิ้นเดือนนี้เท่านั้น!',
        type: 'email',
        target_audience: 'free',
        status: 'sent',
        scheduled_at: null,
        sent_at: '2024-12-13T09:00:00',
        read_count: 542,
        created_at: '2024-12-13T09:00:00',
    },
    {
        id: '3',
        title: 'อัปเดตใหม่! Deck คำศัพท์ TOEIC',
        message: 'เพิ่ม Deck ใหม่ 500 คำศัพท์ TOEIC พร้อมให้เรียนแล้ว',
        type: 'push',
        target_audience: 'premium',
        status: 'scheduled',
        scheduled_at: '2024-12-20T08:00:00',
        sent_at: null,
        read_count: 0,
        created_at: '2024-12-14T11:00:00',
    },
];

export default function AdminNotification() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('all');

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
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                // Return mock data if table doesn't exist
                console.warn('Notifications table not found, using mock data.');
                setNotifications(mockNotifications);
                return;
            }
            // Cast to any because local Notification interface might be more extensive than current DB schema
            setNotifications((data as any) || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setNotifications(mockNotifications);
        }
    };

    const handleCreateNotification = async () => {
        try {
            const newNotif = {
                title: formData.title,
                message: formData.message,
                type: formData.type,
                target_audience: formData.target_audience,
                status: formData.is_scheduled ? 'scheduled' : 'sent',
                scheduled_at: formData.is_scheduled ? formData.scheduled_at : null,
                sent_at: formData.is_scheduled ? null : new Date().toISOString(),
                read_count: 0
            };

            // Cast to any to bypass strict type check on insert if columns are missing in types
            const { data, error } = await supabase
                .from('notifications')
                .insert(newNotif as any)
                .select()
                .single();

            if (error) throw error;

            setNotifications([data as any, ...notifications]);
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
        } catch (error) {
            console.error('Error creating notification:', error);
            toast.error('ไม่สามารถส่งการแจ้งเตือนได้ (Table missing?)');
        }
    };

    const handleDeleteNotification = async (id: string) => {
        try {
            const { error } = await supabase.from('notifications').delete().eq('id', id);

            if (error) throw error;

            setNotifications(notifications.filter(n => n.id !== id));
            toast.success('ลบการแจ้งเตือนสำเร็จ');
        } catch (error) {
            console.error('Error deleting notification:', error);
            toast.error('ไม่สามารถลบการแจ้งเตือนได้');
            // Optimistic delete for mock
            setNotifications(notifications.filter(n => n.id !== id));
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
            case 'sent': return <Badge className="bg-green-500">ส่งแล้ว</Badge>;
            case 'scheduled': return <Badge className="bg-blue-500">ตั้งเวลาไว้</Badge>;
            case 'draft': return <Badge variant="secondary">ฉบับร่าง</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (activeTab === 'all') return true;
        if (activeTab === 'sent') return n.status === 'sent';
        if (activeTab === 'scheduled') return n.status === 'scheduled';
        return true;
    });

    // Stats
    const totalSent = notifications.filter(n => n.status === 'sent').length;
    const totalScheduled = notifications.filter(n => n.status === 'scheduled').length;
    const totalReads = notifications.reduce((acc, n) => acc + n.read_count, 0);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Bell className="h-8 w-8 text-primary" />
                        Notification Center
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">ส่งการแจ้งเตือนและจัดการข้อความถึงผู้ใช้</p>
                </div>
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
                            <Button onClick={handleCreateNotification} disabled={!formData.title || !formData.message}>
                                <Send className="h-4 w-4 mr-2" />
                                {formData.is_scheduled ? 'ตั้งเวลาส่ง' : 'ส่งเลย'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                    <CardContent className="pt-6 pb-4">
                        <div className="flex flex-col items-center text-center gap-2">
                            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                                <Send className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalSent}</p>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">ส่งแล้ว</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                    <CardContent className="pt-6 pb-4">
                        <div className="flex flex-col items-center text-center gap-2">
                            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                <Clock className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalScheduled}</p>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">ตั้งเวลาไว้</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                    <CardContent className="pt-6 pb-4">
                        <div className="flex flex-col items-center text-center gap-2">
                            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                                <Eye className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalReads.toLocaleString()}</p>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">ยอดอ่าน</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                    <CardContent className="pt-6 pb-4">
                        <div className="flex flex-col items-center text-center gap-2">
                            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{notifications.length}</p>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">ทั้งหมด</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Notifications Table */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/50">
                    <CardTitle className="text-slate-800 dark:text-slate-100">รายการการแจ้งเตือน</CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400">ประวัติและสถานะการแจ้งเตือนทั้งหมด</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
                        <TabsList className="bg-slate-100 dark:bg-slate-800 p-1">
                            <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">ทั้งหมด</TabsTrigger>
                            <TabsTrigger value="sent" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">ส่งแล้ว</TabsTrigger>
                            <TabsTrigger value="scheduled" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">ตั้งเวลาไว้</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">หัวข้อ</TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">ประเภท</TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">กลุ่มเป้าหมาย</TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">สถานะ</TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">ยอดอ่าน</TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">วันที่</TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">การกระทำ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredNotifications.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                                            ไม่พบการแจ้งเตือน
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredNotifications.map((notification) => (
                                        <TableRow key={notification.id}>
                                            <TableCell className="font-medium max-w-[200px] truncate text-slate-900 dark:text-white">
                                                {notification.title}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                                    {getTypeIcon(notification.type)}
                                                    {getTypeLabel(notification.type)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">{getAudienceLabel(notification.target_audience)}</Badge>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(notification.status)}</TableCell>
                                            <TableCell className="text-slate-600 dark:text-slate-300">{notification.read_count.toLocaleString()}</TableCell>
                                            <TableCell className="text-slate-600 dark:text-slate-300">
                                                {new Date(notification.sent_at || notification.scheduled_at || notification.created_at).toLocaleDateString('th-TH', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                                        onClick={() => {
                                                            setSelectedNotification(notification);
                                                            setIsViewDialogOpen(true);
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                        onClick={() => handleDeleteNotification(notification.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
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

            {/* View Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedNotification?.title}</DialogTitle>
                        <DialogDescription>รายละเอียดการแจ้งเตือน</DialogDescription>
                    </DialogHeader>
                    {selectedNotification && (
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
                                <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{selectedNotification.message}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-slate-500 dark:text-slate-400">ประเภท</p>
                                    <p className="font-medium flex items-center gap-2 text-slate-900 dark:text-white">
                                        {getTypeIcon(selectedNotification.type)}
                                        {getTypeLabel(selectedNotification.type)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-slate-500 dark:text-slate-400">กลุ่มเป้าหมาย</p>
                                    <p className="font-medium text-slate-900 dark:text-white">{getAudienceLabel(selectedNotification.target_audience)}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 dark:text-slate-400">สถานะ</p>
                                    <div>{getStatusBadge(selectedNotification.status)}</div>
                                </div>
                                <div>
                                    <p className="text-slate-500 dark:text-slate-400">ยอดอ่าน</p>
                                    <p className="font-medium text-slate-900 dark:text-white">{selectedNotification.read_count.toLocaleString()} คน</p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
