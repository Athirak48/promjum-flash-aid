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
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Feedback</h1>
                <p className="text-muted-foreground">จัดการและตอบกลับ Feedback จากผู้ใช้</p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
                <Button
                    variant={viewMode === "overall" ? "default" : "outline"}
                    onClick={() => setViewMode("overall")}
                >
                    Overall
                </Button>
                <Button
                    variant={viewMode === "individual" ? "default" : "outline"}
                    onClick={() => setViewMode("individual")}
                >
                    Individual
                </Button>
            </div>

            {viewMode === "overall" ? (
                <div className="space-y-6">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Feedback
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{stats.total}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    ดีมาก
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-green-600">{stats.excellent}</div>
                                <p className="text-xs text-muted-foreground">
                                    {((stats.excellent / stats.total) * 100).toFixed(1)}%
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    ดี
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-blue-600">{stats.good}</div>
                                <p className="text-xs text-muted-foreground">
                                    {((stats.good / stats.total) * 100).toFixed(1)}%
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    พอใช้
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-yellow-600">{stats.fair}</div>
                                <p className="text-xs text-muted-foreground">
                                    {((stats.fair / stats.total) * 100).toFixed(1)}%
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className=" pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    แย่
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-red-600">{stats.poor}</div>
                                <p className="text-xs text-muted-foreground">
                                    {((stats.poor / stats.total) * 100).toFixed(1)}%
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Data Analysis Section */}
                    {/* Satisfaction Trend */}
                    <Card>
                        <CardHeader>
                            <CardTitle>แนวโน้มความพึงพอใจ</CardTitle>
                            <CardDescription>ความพึงพอใจเฉลี่ยในแต่ละเดือน</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium w-24">มกราคม</div>
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                                            <div className="bg-green-500 h-3 rounded-full" style={{ width: '75%' }}></div>
                                        </div>
                                        <span className="text-sm font-medium w-16">3.8/5.0</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium w-24">กุมภาพันธ์</div>
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                                            <div className="bg-green-500 h-3 rounded-full" style={{ width: '82%' }}></div>
                                        </div>
                                        <span className="text-sm font-medium w-16">4.1/5.0</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium w-24">มีนาคม</div>
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                                            <div className="bg-yellow-500 h-3 rounded-full" style={{ width: '70%' }}></div>
                                        </div>
                                        <span className="text-sm font-medium w-16">3.5/5.0</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium w-24">เมษายน</div>
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                                            <div className="bg-green-500 h-3 rounded-full" style={{ width: '85%' }}></div>
                                        </div>
                                        <span className="text-sm font-medium w-16">4.2/5.0</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Topics */}
                        <Card>
                            <CardHeader>
                                <CardTitle>หัวข้อที่ถูกแจ้งบ่อยที่สุด</CardTitle>
                                <CardDescription>5 อันดับแรก</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">ทั่วไป</p>
                                            <p className="text-xs text-muted-foreground">52 ครั้ง</p>
                                        </div>
                                        <div className="text-sm font-semibold">35%</div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">แจ้งปัญหา</p>
                                            <p className="text-xs text-muted-foreground">38 ครั้ง</p>
                                        </div>
                                        <div className="text-sm font-semibold">25%</div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">ฟีเจอร์ใหม่</p>
                                            <p className="text-xs text-muted-foreground">30 ครั้ง</p>
                                        </div>
                                        <div className="text-sm font-semibold">20%</div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">สอบถาม</p>
                                            <p className="text-xs text-muted-foreground">18 ครั้ง</p>
                                        </div>
                                        <div className="text-sm font-semibold">12%</div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">ชื่นชม</p>
                                            <p className="text-xs text-muted-foreground">12 ครั้ง</p>
                                        </div>
                                        <div className="text-sm font-semibold">8%</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Monthly Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>สรุปรายเดือน</CardTitle>
                                <CardDescription>เดือนปัจจุบัน</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">Feedback ใหม่</p>
                                            <p className="text-2xl font-bold text-blue-600">42</p>
                                        </div>
                                        <div className="text-xs text-green-600 font-medium">↑ 12%</div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">ตอบกลับแล้ว</p>
                                            <p className="text-2xl font-bold text-green-600">38</p>
                                        </div>
                                        <div className="text-xs text-green-600 font-medium">↑ 8%</div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">รอดำเนินการ</p>
                                            <p className="text-2xl font-bold text-yellow-600">4</p>
                                        </div>
                                        <div className="text-xs text-red-600 font-medium">↓ 5%</div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">เวลาตอบกลับเฉลี่ย</p>
                                            <p className="text-2xl font-bold text-purple-600">2.4 ชม.</p>
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
                <Card>
                    <CardHeader>
                        <CardTitle>User Feedback</CardTitle>
                        <CardDescription>รายการ Feedback จากผู้ใช้</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>ข้อความ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {feedbacks.map((feedback) => (
                                        <TableRow key={feedback.id}>
                                            <TableCell className="font-medium">{feedback.userId}</TableCell>
                                            <TableCell>{feedback.name}</TableCell>
                                            <TableCell>{feedback.email}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
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
