import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { CreditCard, Users, DollarSign, Plus, Edit, Trash2, Search, Crown, UserPlus, ArrowUpRight, RefreshCcw, XCircle } from 'lucide-react';

interface Subscription {
    id: string;
    user_id: string;
    user_email: string;
    user_name: string;
    plan: 'free' | 'monthly' | 'yearly' | 'lifetime';
    status: 'active' | 'cancelled' | 'expired';
    price_paid: number;
    start_date: string;
    end_date: string | null;
    created_at: string;
}

interface Plan {
    id: string;
    name: string;
    price: number;
    duration: string;
    features: string[];
    is_active: boolean;
}

// Mock data
const mockSubscriptions: Subscription[] = [
    {
        id: '1',
        user_id: 'u1',
        user_email: 'john@example.com',
        user_name: 'John Doe',
        plan: 'yearly',
        status: 'active',
        price_paid: 1490,
        start_date: '2024-01-15',
        end_date: '2025-01-15',
        created_at: '2024-01-15',
    },
    {
        id: '2',
        user_id: 'u2',
        user_email: 'jane@example.com',
        user_name: 'Jane Smith',
        plan: 'monthly',
        status: 'active',
        price_paid: 199,
        start_date: '2024-12-01',
        end_date: '2025-01-01',
        created_at: '2024-12-01',
    },
    {
        id: '3',
        user_id: 'u3',
        user_email: 'bob@example.com',
        user_name: 'Bob Wilson',
        plan: 'lifetime',
        status: 'active',
        price_paid: 2990,
        start_date: '2024-06-20',
        end_date: null,
        created_at: '2024-06-20',
    },
    {
        id: '4',
        user_id: 'u4',
        user_email: 'alice@example.com',
        user_name: 'Alice Brown',
        plan: 'monthly',
        status: 'cancelled',
        price_paid: 199,
        start_date: '2024-11-01',
        end_date: '2024-12-01',
        created_at: '2024-11-01',
    },
];

const mockPlans: Plan[] = [
    {
        id: '1',
        name: 'Free',
        price: 0,
        duration: 'ตลอดชีพ',
        features: ['Deck ฟรี 5 ชุด', 'Flashcard 50 ใบ/เดือน', 'เกม 3 รูปแบบ'],
        is_active: true,
    },
    {
        id: '2',
        name: 'Monthly Premium',
        price: 199,
        duration: '1 เดือน',
        features: ['Deck ไม่จำกัด', 'Flashcard ไม่จำกัด', 'เกมทุกรูปแบบ', 'AI Features', 'ไม่มีโฆษณา'],
        is_active: true,
    },
    {
        id: '3',
        name: 'Yearly Premium',
        price: 1490,
        duration: '1 ปี',
        features: ['ทุกฟีเจอร์ Premium', 'ประหยัด 38%', 'Priority Support'],
        is_active: true,
    },
    {
        id: '4',
        name: 'Lifetime',
        price: 2990,
        duration: 'ตลอดชีพ',
        features: ['ทุกฟีเจอร์ Premium', 'จ่ายครั้งเดียว', 'VIP Support', 'Early Access'],
        is_active: true,
    },
];

export default function AdminSubscriptions() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>(mockSubscriptions);
    const [plans, setPlans] = useState<Plan[]>(mockPlans);
    const [activeTab, setActiveTab] = useState('subscriptions');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isManualUpgradeOpen, setIsManualUpgradeOpen] = useState(false);
    const [isEditPlanOpen, setIsEditPlanOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

    // Manual upgrade form
    const [upgradeForm, setUpgradeForm] = useState({
        user_email: '',
        plan: 'monthly' as 'monthly' | 'yearly' | 'lifetime',
        notes: '',
    });

    // Stats
    const totalActive = subscriptions.filter(s => s.status === 'active').length;
    const totalRevenue = subscriptions.reduce((acc, s) => acc + s.price_paid, 0);
    const monthlyRevenue = subscriptions
        .filter(s => new Date(s.created_at).getMonth() === new Date().getMonth())
        .reduce((acc, s) => acc + s.price_paid, 0);

    const getPlanBadge = (plan: string) => {
        switch (plan) {
            case 'free': return <Badge variant="secondary">Free</Badge>;
            case 'monthly': return <Badge className="bg-blue-500">Monthly</Badge>;
            case 'yearly': return <Badge className="bg-purple-500">Yearly</Badge>;
            case 'lifetime': return <Badge className="bg-amber-500">Lifetime</Badge>;
            default: return <Badge>{plan}</Badge>;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active': return <Badge className="bg-green-500">Active</Badge>;
            case 'cancelled': return <Badge variant="destructive">Cancelled</Badge>;
            case 'expired': return <Badge variant="secondary">Expired</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    const handleManualUpgrade = () => {
        toast.success(`อัปเกรด ${upgradeForm.user_email} สำเร็จ!`);
        setIsManualUpgradeOpen(false);
        setUpgradeForm({ user_email: '', plan: 'monthly', notes: '' });
    };

    const handleCancelSubscription = (id: string) => {
        setSubscriptions(subscriptions.map(s =>
            s.id === id ? { ...s, status: 'cancelled' as const } : s
        ));
        toast.success('ยกเลิก Subscription สำเร็จ');
    };

    const filteredSubscriptions = subscriptions.filter(s => {
        const matchesSearch = s.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.user_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <CreditCard className="h-8 w-8 text-primary" />
                        Subscription Management
                    </h1>
                    <p className="text-slate-500 mt-1">จัดการ Subscription และแผนราคา</p>
                </div>
                <Dialog open={isManualUpgradeOpen} onOpenChange={setIsManualUpgradeOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <UserPlus className="h-4 w-4" />
                            Manual Upgrade
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>อัปเกรดผู้ใช้ Manual</DialogTitle>
                            <DialogDescription>อัปเกรดผู้ใช้เป็น Premium โดยไม่ต้องชำระเงิน</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Email ผู้ใช้</Label>
                                <Input
                                    placeholder="user@example.com"
                                    value={upgradeForm.user_email}
                                    onChange={(e) => setUpgradeForm({ ...upgradeForm, user_email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>แผน</Label>
                                <Select
                                    value={upgradeForm.plan}
                                    onValueChange={(value: 'monthly' | 'yearly' | 'lifetime') =>
                                        setUpgradeForm({ ...upgradeForm, plan: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="monthly">Monthly (1 เดือน)</SelectItem>
                                        <SelectItem value="yearly">Yearly (1 ปี)</SelectItem>
                                        <SelectItem value="lifetime">Lifetime (ตลอดชีพ)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>หมายเหตุ</Label>
                                <Input
                                    placeholder="เหตุผลในการอัปเกรด..."
                                    value={upgradeForm.notes}
                                    onChange={(e) => setUpgradeForm({ ...upgradeForm, notes: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsManualUpgradeOpen(false)}>ยกเลิก</Button>
                            <Button onClick={handleManualUpgrade} disabled={!upgradeForm.user_email}>
                                <Crown className="h-4 w-4 mr-2" />
                                อัปเกรด
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardContent className="pt-6 pb-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-slate-900">{totalActive}</p>
                                <p className="text-sm font-medium text-slate-500">Premium Users</p>
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
                                <p className="text-3xl font-bold text-slate-900">฿{totalRevenue.toLocaleString()}</p>
                                <p className="text-sm font-medium text-slate-500">รายได้ทั้งหมด</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardContent className="pt-6 pb-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                <ArrowUpRight className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-slate-900">฿{monthlyRevenue.toLocaleString()}</p>
                                <p className="text-sm font-medium text-slate-500">เดือนนี้</p>
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
                                <p className="text-3xl font-bold text-slate-900">{plans.filter(p => p.is_active).length}</p>
                                <p className="text-sm font-medium text-slate-500">Active Plans</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="subscriptions">รายการ Subscription</TabsTrigger>
                    <TabsTrigger value="plans">แผนราคา</TabsTrigger>
                </TabsList>

                <TabsContent value="subscriptions" className="space-y-4">
                    {/* Filters */}
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                                    <Input
                                        placeholder="ค้นหา Email หรือชื่อ..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="สถานะ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">ทั้งหมด</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                        <SelectItem value="expired">Expired</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Table */}
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/50">
                            <CardTitle className="text-slate-800">รายการ Subscription ({filteredSubscriptions.length})</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                            <TableHead className="font-semibold text-slate-700">ผู้ใช้</TableHead>
                                            <TableHead className="font-semibold text-slate-700">แผน</TableHead>
                                            <TableHead className="font-semibold text-slate-700">สถานะ</TableHead>
                                            <TableHead className="font-semibold text-slate-700">ราคา</TableHead>
                                            <TableHead className="font-semibold text-slate-700">วันเริ่ม</TableHead>
                                            <TableHead className="font-semibold text-slate-700">วันหมดอายุ</TableHead>
                                            <TableHead className="font-semibold text-slate-700">การกระทำ</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredSubscriptions.map((sub) => (
                                            <TableRow key={sub.id}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium text-slate-900">{sub.user_name}</p>
                                                        <p className="text-xs text-slate-500">{sub.user_email}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getPlanBadge(sub.plan)}</TableCell>
                                                <TableCell>{getStatusBadge(sub.status)}</TableCell>
                                                <TableCell className="text-slate-900">฿{sub.price_paid.toLocaleString()}</TableCell>
                                                <TableCell className="text-slate-500">
                                                    {new Date(sub.start_date).toLocaleDateString('th-TH')}
                                                </TableCell>
                                                <TableCell className="text-slate-500">
                                                    {sub.end_date
                                                        ? new Date(sub.end_date).toLocaleDateString('th-TH')
                                                        : 'ตลอดชีพ'}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button variant="ghost" size="sm" title="Renew" className="text-slate-600 hover:text-slate-900">
                                                            <RefreshCcw className="h-4 w-4" />
                                                        </Button>
                                                        {sub.status === 'active' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-destructive hover:bg-destructive/10"
                                                                onClick={() => handleCancelSubscription(sub.id)}
                                                                title="Cancel"
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                            </Button>
                                                        )}
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

                <TabsContent value="plans" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {plans.map((plan) => (
                            <Card key={plan.id} className={`relative ${!plan.is_active && 'opacity-50'}`}>
                                {plan.name.includes('Lifetime') && (
                                    <div className="absolute top-2 right-2">
                                        <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500">Popular</Badge>
                                    </div>
                                )}
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Crown className={`h-5 w-5 ${plan.price === 0 ? 'text-gray-400' : 'text-primary'}`} />
                                        {plan.name}
                                    </CardTitle>
                                    <CardDescription>{plan.duration}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-4">
                                        <span className="text-3xl font-bold">฿{plan.price.toLocaleString()}</span>
                                        {plan.price > 0 && <span className="text-slate-500">/{plan.duration}</span>}
                                    </div>
                                    <ul className="space-y-2 text-sm">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center gap-2">
                                                <span className="text-green-500">✓</span>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <Button variant="outline" className="w-full mt-4 gap-2">
                                        <Edit className="h-4 w-4" />
                                        แก้ไข
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
