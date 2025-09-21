import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileText, 
  Clock, 
  CheckCircle, 
  CreditCard,
  Plus,
  Calendar,
  TrendingUp
} from "lucide-react";

const Dashboard = () => {
  // Mock data - will be replaced with real data from Supabase
  const userStats = {
    totalUploads: 12,
    totalFlashcards: 156,
    currentBalance: 45.50,
    thisMonthSpent: 125.00
  };

  const recentUploads = [
    {
      id: "1",
      filename: "คณิตศาสตร์ ม.6 บทที่ 1.pdf",
      status: "completed",
      flashcards: 24,
      uploadDate: "2024-01-15",
      cost: 18.50
    },
    {
      id: "2", 
      filename: "ฟิสิกส์ เรื่องแสง.docx",
      status: "processing",
      flashcards: 0,
      uploadDate: "2024-01-14",
      cost: 12.00
    },
    {
      id: "3",
      filename: "ภาษาอังกฤษ Vocabulary.pptx",
      status: "completed", 
      flashcards: 45,
      uploadDate: "2024-01-12",
      cost: 24.00
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">สำเร็จ</Badge>;
      case "processing":
        return <Badge className="bg-yellow-100 text-yellow-800">กำลังประมวลผล</Badge>;
      case "pending":
        return <Badge className="bg-gray-100 text-gray-800">รอชำระเงิน</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-secondary/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              แดชบอร์ด
            </span>
          </h1>
          <p className="text-muted-foreground">จัดการไฟล์และแฟลชการ์ดของคุณ</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-card shadow-soft border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ไฟล์ที่อัปโหลด</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{userStats.totalUploads}</div>
              <p className="text-xs text-muted-foreground">ไฟล์ทั้งหมด</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-soft border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">แฟลชการ์ด</CardTitle>
              <CheckCircle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{userStats.totalFlashcards}</div>
              <p className="text-xs text-muted-foreground">การ์ดที่สร้างแล้ว</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-soft border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ยอดเงินคงเหลือ</CardTitle>
              <CreditCard className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">฿{userStats.currentBalance}</div>
              <p className="text-xs text-muted-foreground">เครดิตในบัญชี</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-soft border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">เดือนนี้</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">฿{userStats.thisMonthSpent}</div>
              <p className="text-xs text-muted-foreground">ค่าใช้จ่าย</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card className="bg-gradient-card shadow-medium border-0">
              <CardHeader>
                <CardTitle className="text-xl">การดำเนินการด่วน</CardTitle>
                <CardDescription>เริ่มต้นสร้างแฟลชการ์ดใหม่</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button variant="hero" className="h-16">
                    <Upload className="mr-2 h-5 w-5" />
                    อัปโหลดไฟล์ใหม่
                  </Button>
                  <Button variant="outline" className="h-16">
                    <Plus className="mr-2 h-5 w-5" />
                    สร้างการ์ดเอง
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Uploads */}
            <Card className="bg-gradient-card shadow-medium border-0">
              <CardHeader>
                <CardTitle className="text-xl">ไฟล์ล่าสุด</CardTitle>
                <CardDescription>ประวัติการอัปโหลดของคุณ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentUploads.map((upload) => (
                    <div
                      key={upload.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border/40 bg-background/50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{upload.filename}</p>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{upload.uploadDate}</span>
                            <span>•</span>
                            <span>฿{upload.cost}</span>
                            {upload.flashcards > 0 && (
                              <>
                                <span>•</span>
                                <span>{upload.flashcards} การ์ด</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(upload.status)}
                        {upload.status === "completed" && (
                          <Button variant="ghost" size="sm">
                            ดูการ์ด
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-4">
                  <Button variant="outline">ดูทั้งหมด</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="bg-gradient-card shadow-soft border-0">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  กิจกรรมวันนี้
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">ไฟล์ที่อัปโหลด</span>
                  <span className="font-medium">2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">การ์ดที่สร้าง</span>
                  <span className="font-medium">24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">เวลาที่ใช้ทบทวน</span>
                  <span className="font-medium">15 นาที</span>
                </div>
              </CardContent>
            </Card>

            {/* Top up Balance */}
            <Card className="bg-gradient-hero shadow-medium border-0 text-white">
              <CardHeader>
                <CardTitle className="text-white">เติมเครดิต</CardTitle>
                <CardDescription className="text-white/80">
                  เติมเงินเพื่อใช้งานต่อ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-4">฿{userStats.currentBalance}</div>
                <Button variant="secondary" className="w-full">
                  เติมเครดิต
                </Button>
              </CardContent>
            </Card>

            {/* Pro Upgrade */}
            <Card className="bg-gradient-card shadow-soft border-0">
              <CardHeader>
                <CardTitle className="text-lg">อัปเกรด Pro</CardTitle>
                <CardDescription>
                  ใช้งานไม่จำกัด + ฟีเจอร์พิเศษ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-primary">฿299</div>
                  <div className="text-sm text-muted-foreground">ต่อเดือน</div>
                </div>
                <Button variant="hero" className="w-full">
                  อัปเกรดตอนนี้
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;