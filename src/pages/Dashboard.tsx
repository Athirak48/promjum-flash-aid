import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ArrowUpDown, Clock, FileText, Plus, Upload, TrendingUp, Bell, Star, CreditCard, MessageSquare, Send, Calendar, BarChart3, Zap } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [feedback, setFeedback] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Mock data for demonstration
  const userProfile = user ? {
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || 'ผู้ใช้',
    role: user.app_metadata?.role || 'user',
    subscription: 'normal' // หรือ 'pro'
  } : null;

  const userStats = {
    totalUploads: 12,
    totalCards: 234,
    studyStreak: 7,
    creditsUsed: 45,
    uploadQuota: 100, // MB
    usedQuota: 68,
    remainingQuota: 32
  };

  const recentUploads = [
    {
      id: 1,
      filename: "english_vocabulary.pdf",
      uploadDate: "2024-01-20",
      status: "completed",
      cardCount: 45,
      fileSize: "5.2 MB",
      cost: 10.4
    },
    {
      id: 2,
      filename: "math_formulas.docx",
      uploadDate: "2024-01-19",
      status: "processing",
      cardCount: 0,
      fileSize: "2.1 MB",
      cost: 4.2
    },
    {
      id: 3,
      filename: "history_notes.txt",
      uploadDate: "2024-01-18",
      status: "completed",
      cardCount: 67,
      fileSize: "1.8 MB",
      cost: 0 // Pro user
    }
  ];

  const learningStats = {
    cardsReviewed: 142,
    wordsLearned: 89,
    studyTime: 45, // minutes
    accuracy: 78
  };

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

  const submitFeedback = async () => {
    if (!feedback.trim()) {
      toast({
        title: "กรุณากรอกข้อความ",
        description: "กรอกข้อเสนอแนะก่อนส่งครับ",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingFeedback(true);
    
    try {
      // Simulate API call - replace with real Supabase call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "ส่งข้อเสนอแนะสำเร็จแล้ว",
        description: "ขอบคุณสำหรับข้อเสนอแนะ เราจะนำไปพัฒนาระบบให้ดีขึ้น",
      });
      
      setFeedback('');
      
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งข้อเสนอแนะได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8">
      <div className="container mx-auto px-4">
        {/* Header with User Info */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="" alt={userProfile?.full_name} />
                <AvatarFallback className="text-lg">
                  {userProfile?.full_name?.charAt(0) || userProfile?.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">{userProfile?.full_name}</h1>
                <p className="text-muted-foreground">{userProfile?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={userProfile?.subscription === 'pro' ? 'default' : 'secondary'} className="flex items-center gap-1">
                    {userProfile?.subscription === 'pro' ? (
                      <Star className="h-3 w-3" />
                    ) : null}
                    {userProfile?.subscription === 'pro' ? 'Pro' : 'Normal'}
                  </Badge>
                </div>
              </div>
            </div>
            <Bell className="h-6 w-6 text-muted-foreground cursor-pointer hover:text-primary transition-colors" />
          </div>
          
          {/* Quota Information */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">โควตาการอัปโหลด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>ใช้แล้ว {userStats.usedQuota} MB</span>
                  <span>เหลือ {userStats.remainingQuota} MB</span>
                </div>
                <Progress value={(userStats.usedQuota / userStats.uploadQuota) * 100} className="w-full" />
                <p className="text-xs text-muted-foreground">
                  โควตาทั้งหมด: {userStats.uploadQuota} MB
                  {userProfile?.subscription === 'normal' && ' • อัปเกรดเป็น Pro เพื่อโควตาไม่จำกัด'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ไฟล์ที่อัปโหลด</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.totalUploads}</div>
              <p className="text-xs text-muted-foreground">ไฟล์ทั้งหมด</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">แฟลชการ์ดที่สร้าง</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.totalCards}</div>
              <p className="text-xs text-muted-foreground">การ์ดทั้งหมด</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">สตรีคการเรียน</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.studyStreak}</div>
              <p className="text-xs text-muted-foreground">วันติดต่อกัน</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">เครดิตที่ใช้</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.creditsUsed}</div>
              <p className="text-xs text-muted-foreground">เครดิต</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>อัปโหลดไฟล์</CardTitle>
                <CardDescription>
                  รองรับไฟล์ PDF, DOCX, TXT และอื่นๆ เพื่อสร้างแฟลชการ์ดอัตโนมัติ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center space-y-4">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="font-medium mb-2">เลือกไฟล์หรือลากมาวางที่นี่</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      รองรับ PDF, DOCX, TXT, PPTX (ขนาดสูงสุด 20MB)
                    </p>
                    
                    {/* Cost Calculator for Normal Users */}
                    {userProfile?.subscription === 'normal' && (
                      <div className="bg-muted/50 rounded-lg p-4 mb-4">
                        <p className="text-sm font-medium mb-2">ราคาการอัปโหลด</p>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>• ไฟล์ขนาด 1 MB = 2 บาท</div>
                          <div>• ตัวอย่าง: ไฟล์ 5.1 MB = 10.2 บาท</div>
                        </div>
                      </div>
                    )}
                    
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      เลือกไฟล์
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Uploads */}
            <Card>
              <CardHeader>
                <CardTitle>ประวัติการอัปโหลด</CardTitle>
                <CardDescription>ติดตามสथานะไฟล์ที่อัปโหลดและดาวน์โหลดแฟลชการ์ด</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentUploads.map((upload) => (
                    <div key={upload.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{upload.filename}</p>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>{new Date(upload.uploadDate).toLocaleDateString('th-TH')}</span>
                            <span>• {upload.fileSize}</span>
                            {upload.status === "completed" && (
                              <span>• {upload.cardCount} การ์ด</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(upload.status)}
                        
                        {/* Cost Display */}
                        <div className="text-sm">
                          {upload.cost > 0 ? (
                            <Badge variant="outline">{upload.cost} บาท</Badge>
                          ) : userProfile?.subscription === 'pro' ? (
                            <Badge variant="secondary">ฟรี</Badge>
                          ) : null}
                        </div>
                        
                        {upload.status === "completed" && (
                          <Button size="sm">
                            ดูแฟลชการ์ด
                          </Button>
                        )}
                        
                        {upload.status === "processing" && userProfile?.subscription === 'normal' && (
                          <Button size="sm" variant="outline">
                            ชำระเงิน
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Feedback Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  ข้อเสนอแนะ
                </CardTitle>
                <CardDescription>ช่วยเราพัฒนา Promjum ให้ดีขึ้น</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="แบ่งปันความคิดเห็น ข้อเสนอแนะ หรือปัญหาที่พบ..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                />
                <Button 
                  onClick={submitFeedback}
                  disabled={isSubmittingFeedback}
                  className="w-full"
                >
                  {isSubmittingFeedback ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      กำลังส่ง...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      ส่งข้อเสนอแนะ
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            {/* Learning Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  สถิติการเรียนวันนี้
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">การ์ดที่ทบทวน</span>
                  <span className="font-medium">{learningStats.cardsReviewed} การ์ด</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">คำที่จำได้</span>
                  <span className="font-medium">{learningStats.wordsLearned} คำ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">เวลาเรียน</span>
                  <span className="font-medium">{learningStats.studyTime} นาที</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">ความแม่นยำ</span>
                  <span className="font-medium">{learningStats.accuracy}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Upgrade CTA for Normal Users */}
            {userProfile?.subscription === 'normal' && (
              <Card className="border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    อัปเกรดเป็น Pro
                  </CardTitle>
                  <CardDescription>
                    ปลดล็อกฟีเจอร์เต็มรูปแบบ
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center">
                      <Plus className="h-4 w-4 mr-2 text-primary" />
                      อัปโหลดไฟล์ไม่จำกัด
                    </li>
                    <li className="flex items-center">
                      <Plus className="h-4 w-4 mr-2 text-primary" />
                      AI ประมวลผลเร็วขึ้น
                    </li>
                    <li className="flex items-center">
                      <Plus className="h-4 w-4 mr-2 text-primary" />
                      ไม่มีโฆษณา
                    </li>
                  </ul>
                  <Button className="w-full">
                    <Star className="h-4 w-4 mr-2" />
                    อัปเกรดตอนนี้
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}