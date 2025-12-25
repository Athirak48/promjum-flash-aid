import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface Feedback {
    id: string;
    userId: string;
    name: string;
    email: string;
    message: string;
    createdAt: string;
}

interface FeedbackDetail {
    date: string;
    subject: string;
    satisfaction: string;
    details: string;
}

type ViewMode = "overall" | "individual";

export default function AdminFeedback() {
    const [viewMode, setViewMode] = useState<ViewMode>("individual");

    // Mock data
    const [feedbacks] = useState<Feedback[]>([
        {
            id: "1",
            userId: "1234",
            name: "สมชาย ใจดี",
            email: "somchai@example.com",
            message: "ระบบมีข้อบกพร่องเล็กน้อย",
            createdAt: "2024-01-05"
        },
        {
            id: "2",
            userId: "5678",
            name: "สมหญิง แจ่มใส",
            email: "somying@example.com",
            message: "ใช้งานง่าย ประทับใจมาก",
            createdAt: "2024-01-04"
        }
    ]);

    // Mock feedback details
    const feedbackDetails: Record<string, FeedbackDetail[]> = {
        "1": [
            {
                date: "05/01/2024",
                subject: "ปัญหาการใช้งานระบบ",
                satisfaction: "พอใช้",
                details: "ระบบมีข้อบกพร่องเล็กน้อยในส่วนของการโหลดข้อมูล"
            },
            {
                date: "03/01/2024",
                subject: "ข้อเสนอแนะการปรับปรุง",
                satisfaction: "ดี",
                details: "อยากให้เพิ่มฟีเจอร์การค้นหาที่ดีขึ้น"
            }
        ],
        "2": [
            {
                date: "04/01/2024",
                subject: "ความประทับใจในการใช้งาน",
                satisfaction: "ดีมาก",
                details: "ใช้งานง่าย ประทับใจมาก UI สวยงาม"
            }
        ]
    };

    const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleViewFeedback = (feedbackId: string) => {
        setSelectedFeedback(feedbackId);
        setIsDialogOpen(true);
    };

    // Mock statistics for overall view
    const stats = {
        total: 150,
        excellent: 45,
        good: 60,
        fair: 30,
        poor: 15
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Feedback</h1>
                <p className="text-slate-500 dark:text-slate-400">จัดการและตอบกลับ Feedback จากผู้ใช้</p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
                <Button
                    variant={viewMode === "overall" ? "default" : "outline"}
                    className={viewMode === "individual" ? "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300" : ""}
                    onClick={() => setViewMode("overall")}
                >
                    Overall
                </Button>
                <Button
                    variant={viewMode === "individual" ? "default" : "outline"}
                    className={viewMode === "overall" ? "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300" : ""}
                    onClick={() => setViewMode("individual")}
                >
                    Individual
                </Button>
            </div>

            {viewMode === "overall" ? (
                <div className="space-y-6">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    Total Feedback
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    ดีมาก
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-green-600">{stats.excellent}</div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {((stats.excellent / stats.total) * 100).toFixed(1)}%
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    ดี
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-blue-600">{stats.good}</div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {((stats.good / stats.total) * 100).toFixed(1)}%
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    พอใช้
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-yellow-600">{stats.fair}</div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {((stats.fair / stats.total) * 100).toFixed(1)}%
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    แย่
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-red-600">{stats.poor}</div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {((stats.poor / stats.total) * 100).toFixed(1)}%
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Data Analysis Section */}
                    {/* Satisfaction Trend */}
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 pb-3">
                            <CardTitle className="text-slate-800 dark:text-slate-100">แนวโน้มความพึงพอใจ</CardTitle>
                            <CardDescription className="text-slate-500 dark:text-slate-400">ความพึงพอใจเฉลี่ยในแต่ละเดือน</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium w-24 text-slate-700 dark:text-slate-300">มกราคม</div>
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-3">
                                            <div className="bg-green-500 h-3 rounded-full" style={{ width: '75%' }}></div>
                                        </div>
                                        <span className="text-sm font-medium w-16 text-slate-600 dark:text-slate-400">3.8/5.0</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium w-24 text-slate-700 dark:text-slate-300">กุมภาพันธ์</div>
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-3">
                                            <div className="bg-green-500 h-3 rounded-full" style={{ width: '82%' }}></div>
                                        </div>
                                        <span className="text-sm font-medium w-16 text-slate-600 dark:text-slate-400">4.1/5.0</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium w-24 text-slate-700 dark:text-slate-300">มีนาคม</div>
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-3">
                                            <div className="bg-yellow-500 h-3 rounded-full" style={{ width: '70%' }}></div>
                                        </div>
                                        <span className="text-sm font-medium w-16 text-slate-600 dark:text-slate-400">3.5/5.0</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium w-24 text-slate-700 dark:text-slate-300">เมษายน</div>
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-3">
                                            <div className="bg-green-500 h-3 rounded-full" style={{ width: '85%' }}></div>
                                        </div>
                                        <span className="text-sm font-medium w-16 text-slate-600 dark:text-slate-400">4.2/5.0</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Topics */}
                        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                            <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 pb-3">
                                <CardTitle className="text-slate-800 dark:text-slate-100">หัวข้อที่ถูกแจ้งบ่อยที่สุด</CardTitle>
                                <CardDescription className="text-slate-500 dark:text-slate-400">5 อันดับแรก</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">ทั่วไป</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">52 ครั้ง</p>
                                        </div>
                                        <div className="text-sm font-semibold text-slate-900 dark:text-white">35%</div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">แจ้งปัญหา</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">38 ครั้ง</p>
                                        </div>
                                        <div className="text-sm font-semibold text-slate-900 dark:text-white">25%</div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">ฟีเจอร์ใหม่</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">30 ครั้ง</p>
                                        </div>
                                        <div className="text-sm font-semibold text-slate-900 dark:text-white">20%</div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">สอบถาม</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">18 ครั้ง</p>
                                        </div>
                                        <div className="text-sm font-semibold text-slate-900 dark:text-white">12%</div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">ชื่นชม</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">12 ครั้ง</p>
                                        </div>
                                        <div className="text-sm font-semibold text-slate-900 dark:text-white">8%</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Monthly Summary */}
                        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                            <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 pb-3">
                                <CardTitle className="text-slate-800 dark:text-slate-100">สรุปรายเดือน</CardTitle>
                                <CardDescription className="text-slate-500 dark:text-slate-400">เดือนปัจจุบัน</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Feedback ใหม่</p>
                                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">42</p>
                                        </div>
                                        <div className="text-xs text-green-600 font-medium">↑ 12%</div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">ตอบกลับแล้ว</p>
                                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">38</p>
                                        </div>
                                        <div className="text-xs text-green-600 font-medium">↑ 8%</div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-100 dark:border-yellow-900/20">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">รอดำเนินการ</p>
                                            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">4</p>
                                        </div>
                                        <div className="text-xs text-red-600 font-medium">↓ 5%</div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-900/20">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">เวลาตอบกลับเฉลี่ย</p>
                                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">2.4 ชม.</p>
                                        </div>
                                        <div className="text-xs text-green-600 font-medium">↓ 15%</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : (
                // Individual View - Table
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 pb-3">
                        <CardTitle className="text-slate-800 dark:text-slate-100">User Feedback</CardTitle>
                        <CardDescription className="text-slate-500 dark:text-slate-400">รายการ Feedback จากผู้ใช้</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">User ID</TableHead>
                                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Name</TableHead>
                                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Email</TableHead>
                                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">ข้อความ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {feedbacks.map((feedback) => (
                                        <TableRow key={feedback.id}>
                                            <TableCell className="font-medium text-slate-900 dark:text-white">{feedback.userId}</TableCell>
                                            <TableCell className="text-slate-600 dark:text-slate-300">{feedback.name}</TableCell>
                                            <TableCell className="text-slate-600 dark:text-slate-300">{feedback.email}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                                                    onClick={() => handleViewFeedback(feedback.id)}
                                                >
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Feedback Detail Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>รายละเอียด Feedback</DialogTitle>
                        <DialogDescription>
                            ประวัติการแจ้ง Feedback ของผู้ใช้
                        </DialogDescription>
                    </DialogHeader>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ว/ด/ป</TableHead>
                                    <TableHead>เรื่องที่คุณต้องการแจ้ง</TableHead>
                                    <TableHead>ความพึงพอใจ</TableHead>
                                    <TableHead>รายละเอียด</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedFeedback && feedbackDetails[selectedFeedback]?.map((detail, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{detail.date}</TableCell>
                                        <TableCell>{detail.subject}</TableCell>
                                        <TableCell>{detail.satisfaction}</TableCell>
                                        <TableCell>{detail.details}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
