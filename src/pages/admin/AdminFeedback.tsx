import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    MessageSquare, Lightbulb, Bug, Gamepad2, BookOpen, HelpCircle,
    Star, RefreshCw, CheckCircle2, Clock, AlertCircle, TrendingUp,
    Users, BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Feedback {
    id: string;
    user_id: string | null;
    type: string;
    message: string;
    rating: number;
    email: string | null;
    status: 'pending' | 'reviewed' | 'resolved';
    admin_notes: string | null;
    created_at: string;
    updated_at: string;
}

type ViewMode = "overall" | "individual";

const feedbackTypeConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
    general: { label: 'ทั่วไป', icon: MessageSquare, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    feature: { label: 'ฟีเจอร์ใหม่', icon: Lightbulb, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    bug: { label: 'แจ้งปัญหา', icon: Bug, color: 'text-red-500', bg: 'bg-red-500/10' },
    game_idea: { label: 'ไอเดียเกม', icon: Gamepad2, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    content: { label: 'คำศัพท์/เนื้อหา', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    question: { label: 'สอบถาม', icon: HelpCircle, color: 'text-pink-500', bg: 'bg-pink-500/10' },
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'รอดำเนินการ', color: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
    reviewed: { label: 'ตรวจสอบแล้ว', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    resolved: { label: 'แก้ไขแล้ว', color: 'text-green-700 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
};

export default function AdminFeedback() {
    const { toast } = useToast();
    const [viewMode, setViewMode] = useState<ViewMode>("individual");
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');
    const [newStatus, setNewStatus] = useState<string>('');
    const [updating, setUpdating] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('user_feedbacks')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setFeedbacks(data || []);
        } catch (error: any) {
            console.error('Error fetching feedbacks:', error);
            toast({
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถโหลดข้อมูล Feedback ได้",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleViewFeedback = (feedback: Feedback) => {
        setSelectedFeedback(feedback);
        setAdminNotes(feedback.admin_notes || '');
        setNewStatus(feedback.status);
        setIsDialogOpen(true);
    };

    const handleUpdateFeedback = async () => {
        if (!selectedFeedback) return;
        setUpdating(true);

        try {
            const { error } = await supabase
                .from('user_feedbacks')
                .update({
                    status: newStatus,
                    admin_notes: adminNotes.trim() || null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', selectedFeedback.id);

            if (error) throw error;

            toast({
                title: "อัปเดตสำเร็จ",
                description: "บันทึกข้อมูลเรียบร้อยแล้ว",
            });

            setIsDialogOpen(false);
            fetchFeedbacks();
        } catch (error: any) {
            console.error('Error updating feedback:', error);
            toast({
                title: "เกิดข้อผิดพลาด",
                description: error.message || "ไม่สามารถอัปเดตได้",
                variant: "destructive",
            });
        } finally {
            setUpdating(false);
        }
    };

    // Filter feedbacks
    const filteredFeedbacks = useMemo(() => {
        return feedbacks.filter(f => {
            if (filterStatus !== 'all' && f.status !== filterStatus) return false;
            if (filterType !== 'all' && f.type !== filterType) return false;
            return true;
        });
    }, [feedbacks, filterStatus, filterType]);

    // Statistics
    const stats = useMemo(() => {
        const total = feedbacks.length;
        const pending = feedbacks.filter(f => f.status === 'pending').length;
        const reviewed = feedbacks.filter(f => f.status === 'reviewed').length;
        const resolved = feedbacks.filter(f => f.status === 'resolved').length;

        const ratings = feedbacks.map(f => f.rating);
        const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '0.0';

        const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        feedbacks.forEach(f => {
            if (f.rating >= 1 && f.rating <= 5) {
                ratingCounts[f.rating as keyof typeof ratingCounts]++;
            }
        });

        const typeCounts: Record<string, number> = {};
        feedbacks.forEach(f => {
            typeCounts[f.type] = (typeCounts[f.type] || 0) + 1;
        });

        return { total, pending, reviewed, resolved, avgRating, ratingCounts, typeCounts };
    }, [feedbacks]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const RatingStars = ({ rating }: { rating: number }) => (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`h-4 w-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`}
                />
            ))}
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Feedback</h1>
                    <p className="text-slate-500 dark:text-slate-400">จัดการ Feedback จากผู้ใช้จริง</p>
                </div>
                <Button variant="outline" onClick={fetchFeedbacks} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    รีเฟรช
                </Button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
                <Button
                    variant={viewMode === "overall" ? "default" : "outline"}
                    onClick={() => setViewMode("overall")}
                >
                    📊 Overall
                </Button>
                <Button
                    variant={viewMode === "individual" ? "default" : "outline"}
                    onClick={() => setViewMode("individual")}
                >
                    📝 Individual
                </Button>
            </div>

            {viewMode === "overall" ? (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-100 text-sm">Total Feedback</p>
                                        <p className="text-4xl font-bold mt-1">{stats.total}</p>
                                    </div>
                                    <BarChart3 className="h-10 w-10 text-blue-200" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-0">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-yellow-100 text-sm">รอดำเนินการ</p>
                                        <p className="text-4xl font-bold mt-1">{stats.pending}</p>
                                    </div>
                                    <Clock className="h-10 w-10 text-yellow-200" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-100 text-sm">ตรวจสอบแล้ว</p>
                                        <p className="text-4xl font-bold mt-1">{stats.reviewed}</p>
                                    </div>
                                    <AlertCircle className="h-10 w-10 text-purple-200" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-100 text-sm">แก้ไขแล้ว</p>
                                        <p className="text-4xl font-bold mt-1">{stats.resolved}</p>
                                    </div>
                                    <CheckCircle2 className="h-10 w-10 text-green-200" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-amber-100 text-sm">คะแนนเฉลี่ย</p>
                                        <p className="text-4xl font-bold mt-1">{stats.avgRating}/5</p>
                                    </div>
                                    <Star className="h-10 w-10 text-amber-200 fill-amber-200" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Rating Distribution & Type Distribution */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-slate-800 dark:text-white">การกระจายคะแนน</CardTitle>
                                <CardDescription>ความพึงพอใจจากผู้ใช้</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {[5, 4, 3, 2, 1].map((rating) => {
                                        const count = stats.ratingCounts[rating as keyof typeof stats.ratingCounts];
                                        const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                                        return (
                                            <div key={rating} className="flex items-center gap-3">
                                                <div className="flex items-center gap-1 w-20">
                                                    <span className="font-medium text-slate-600 dark:text-slate-300">{rating}</span>
                                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                </div>
                                                <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-3">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 w-12 text-right">
                                                    {count}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-slate-800 dark:text-white">หัวข้อที่ถูกแจ้งบ่อย</CardTitle>
                                <CardDescription>ประเภท Feedback</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {Object.entries(stats.typeCounts)
                                        .sort((a, b) => b[1] - a[1])
                                        .map(([type, count]) => {
                                            const config = feedbackTypeConfig[type] || feedbackTypeConfig.general;
                                            const Icon = config.icon;
                                            const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                                            return (
                                                <div key={type} className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${config.bg}`}>
                                                        <Icon className={`h-4 w-4 ${config.color}`} />
                                                    </div>
                                                    <span className="font-medium text-slate-700 dark:text-slate-300 w-28">{config.label}</span>
                                                    <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-3">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400 w-16 text-right">
                                                        {count} ({percentage.toFixed(0)}%)
                                                    </span>
                                                </div>
                                            );
                                        })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : (
                // Individual View - Table
                <Card>
                    <CardHeader className="border-b">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <CardTitle className="text-slate-800 dark:text-white">User Feedback</CardTitle>
                                <CardDescription>รายการ Feedback จากผู้ใช้จริง ({filteredFeedbacks.length} รายการ)</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="สถานะ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">ทุกสถานะ</SelectItem>
                                        <SelectItem value="pending">รอดำเนินการ</SelectItem>
                                        <SelectItem value="reviewed">ตรวจสอบแล้ว</SelectItem>
                                        <SelectItem value="resolved">แก้ไขแล้ว</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={filterType} onValueChange={setFilterType}>
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="ประเภท" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">ทุกประเภท</SelectItem>
                                        {Object.entries(feedbackTypeConfig).map(([key, config]) => (
                                            <SelectItem key={key} value={key}>{config.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {filteredFeedbacks.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                                <p>ยังไม่มี Feedback</p>
                            </div>
                        ) : (
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50 dark:bg-slate-900">
                                            <TableHead className="font-semibold">วันที่</TableHead>
                                            <TableHead className="font-semibold">ประเภท</TableHead>
                                            <TableHead className="font-semibold">คะแนน</TableHead>
                                            <TableHead className="font-semibold">ข้อความ</TableHead>
                                            <TableHead className="font-semibold">สถานะ</TableHead>
                                            <TableHead className="font-semibold">การดำเนินการ</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredFeedbacks.map((feedback) => {
                                            const typeConfig = feedbackTypeConfig[feedback.type] || feedbackTypeConfig.general;
                                            const statConfig = statusConfig[feedback.status];
                                            const TypeIcon = typeConfig.icon;
                                            return (
                                                <TableRow key={feedback.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                    <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                                                        {formatDate(feedback.created_at)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`p-1.5 rounded-lg ${typeConfig.bg}`}>
                                                                <TypeIcon className={`h-4 w-4 ${typeConfig.color}`} />
                                                            </div>
                                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                                {typeConfig.label}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <RatingStars rating={feedback.rating} />
                                                    </TableCell>
                                                    <TableCell className="max-w-[300px]">
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                                                            {feedback.message}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={`${statConfig.bg} ${statConfig.color} border-0`}>
                                                            {statConfig.label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleViewFeedback(feedback)}
                                                        >
                                                            ดูรายละเอียด
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Feedback Detail Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>รายละเอียด Feedback</DialogTitle>
                        <DialogDescription>
                            ตรวจสอบและจัดการ Feedback จากผู้ใช้
                        </DialogDescription>
                    </DialogHeader>

                    {selectedFeedback && (
                        <div className="space-y-6">
                            {/* Feedback Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">วันที่ส่ง</p>
                                    <p className="font-medium">{formatDate(selectedFeedback.created_at)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">อีเมล</p>
                                    <p className="font-medium">{selectedFeedback.email || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">ประเภท</p>
                                    <div className="flex items-center gap-2">
                                        {(() => {
                                            const config = feedbackTypeConfig[selectedFeedback.type] || feedbackTypeConfig.general;
                                            const Icon = config.icon;
                                            return (
                                                <>
                                                    <div className={`p-1.5 rounded-lg ${config.bg}`}>
                                                        <Icon className={`h-4 w-4 ${config.color}`} />
                                                    </div>
                                                    <span className="font-medium">{config.label}</span>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">คะแนน</p>
                                    <RatingStars rating={selectedFeedback.rating} />
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <p className="text-sm text-slate-500 mb-2">ข้อความจากผู้ใช้</p>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                        {selectedFeedback.message}
                                    </p>
                                </div>
                            </div>

                            {/* Admin Actions */}
                            <div className="space-y-4 pt-4 border-t">
                                <div>
                                    <p className="text-sm font-medium mb-2">สถานะ</p>
                                    <Select value={newStatus} onValueChange={setNewStatus}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">🟡 รอดำเนินการ</SelectItem>
                                            <SelectItem value="reviewed">🔵 ตรวจสอบแล้ว</SelectItem>
                                            <SelectItem value="resolved">🟢 แก้ไขแล้ว</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <p className="text-sm font-medium mb-2">หมายเหตุ Admin</p>
                                    <Textarea
                                        placeholder="บันทึกหมายเหตุสำหรับ Admin..."
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            ยกเลิก
                        </Button>
                        <Button onClick={handleUpdateFeedback} disabled={updating}>
                            {updating ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    กำลังบันทึก...
                                </>
                            ) : (
                                'บันทึก'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
