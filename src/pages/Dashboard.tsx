import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ArrowUpDown, Clock, FileText, Plus, Upload, TrendingUp, Bell, Star, CreditCard, MessageSquare, Send, Calendar, BarChart3, Zap, Target } from "lucide-react";
import BackgroundDecorations from "@/components/BackgroundDecorations";
import StatsChart from "@/components/StatsChart";
import FileUploadSection from "@/components/FileUploadSection";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [feedback, setFeedback] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const userProfile = user ? {
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || 'ผู้ใช้',
    role: user.app_metadata?.role || 'user',
    subscription: 'normal'
  } : null;

  // Real user stats - can be enhanced with actual data from database
  const userStats = {
    totalUploads: 0,
    totalCards: 20, // Based on actual flashcard count
    studyStreak: 1,
    creditsUsed: 0,
    uploadQuota: 100, // MB
    usedQuota: 0,
    remainingQuota: 100
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 relative overflow-hidden">
      <BackgroundDecorations />
      <div className="container mx-auto px-4 py-8 relative z-10">
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
          <Card className="mb-6 bg-gradient-card backdrop-blur-sm shadow-soft border border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                โควตาการอัปโหลด
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">การใช้งาน</span>
                  <span className="text-lg font-bold text-primary">
                    {Math.round((userStats.usedQuota / userStats.uploadQuota) * 100)}%
                  </span>
                </div>
                
                <div className="relative">
                  <Progress 
                    value={(userStats.usedQuota / userStats.uploadQuota) * 100} 
                    className="w-full h-3 bg-muted/50"
                  />
                  <div className="absolute inset-0 bg-gradient-primary opacity-75 rounded-full" 
                       style={{ width: `${(userStats.usedQuota / userStats.uploadQuota) * 100}%` }} />
                </div>
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{userStats.usedQuota} MB ใช้แล้ว</span>
                  <span>เหลือ {userStats.remainingQuota} MB</span>
                </div>
                
                {userProfile?.subscription === 'normal' && (
                  <div className="bg-gradient-primary/10 rounded-lg p-3 text-center">
                    <p className="text-xs text-primary font-medium">
                      อัปเกรดเป็น Pro เพื่อโควตาไม่จำกัด
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsChart
            title="ไฟล์ที่อัปโหลด"
            value={userStats.totalUploads}
            unit="ไฟล์ทั้งหมด"
            icon="chart"
            color="primary"
          />
          
          <StatsChart
            title="แฟลชการ์ดที่สร้าง"
            value={userStats.totalCards}
            unit="การ์ดทั้งหมด"
            percentage={85}
            icon="trending"
            color="primary"
          />
          
          <StatsChart
            title="สตรีคการเรียน"
            value={userStats.studyStreak}
            unit="วันติดต่อกัน"
            percentage={20}
            icon="target"
            color="primary"
          />
          
          <StatsChart
            title="เครดิตที่ใช้"
            value={userStats.creditsUsed}
            unit="เครดิต"
            icon="clock"
            color="primary"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upload Section */}
            <FileUploadSection onUpload={(file) => {
              console.log('File uploaded:', file);
              // Handle file upload logic here
            }} />

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
            <Card className="bg-gradient-card backdrop-blur-sm shadow-soft border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
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
                  className="bg-background/50 border-border/50 focus:border-primary"
                />
                <Button 
                  onClick={submitFeedback}
                  disabled={isSubmittingFeedback}
                  className="w-full bg-gradient-primary hover:shadow-glow transition-all"
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
            {/* Learning Stats - Updated with Charts */}
            <Card className="bg-gradient-card backdrop-blur-sm shadow-soft border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  สถิติความจำ
                </CardTitle>
                <CardDescription>ผลลัพธ์การทบทวนวันนี้</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">การ์ดที่ทบทวน</span>
                      <span className="text-sm font-bold text-primary">{learningStats.cardsReviewed}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-gradient-primary h-2 rounded-full transition-all" 
                           style={{ width: `${(learningStats.cardsReviewed / 200) * 100}%` }} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">คำที่จำได้</span>
                      <span className="text-sm font-bold text-primary">{learningStats.wordsLearned}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-gradient-primary h-2 rounded-full transition-all" 
                           style={{ width: `${(learningStats.wordsLearned / 100) * 100}%` }} />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">เวลาเรียน</span>
                      <span className="text-sm font-bold text-primary">{learningStats.studyTime}น</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-gradient-primary h-2 rounded-full transition-all" 
                           style={{ width: `${(learningStats.studyTime / 60) * 100}%` }} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">ความแม่นยำ</span>
                      <span className="text-sm font-bold text-primary">{learningStats.accuracy}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-gradient-primary h-2 rounded-full transition-all" 
                           style={{ width: `${learningStats.accuracy}%` }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upgrade CTA for Normal Users */}
            {userProfile?.subscription === 'normal' && (
              <Card className="border-primary/30 bg-gradient-primary/10 backdrop-blur-sm shadow-glow">
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
                  <ul className="text-sm space-y-3">
                    <li className="flex items-center">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                        <Plus className="h-3 w-3 text-primary" />
                      </div>
                      อัปโหลดไฟล์ไม่จำกัด
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                        <Plus className="h-3 w-3 text-primary" />
                      </div>
                      AI ประมวลผลเร็วขึ้น
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                        <Plus className="h-3 w-3 text-primary" />
                      </div>
                      ไม่มีโฆษณา
                    </li>
                  </ul>
                  <Button className="w-full bg-gradient-primary hover:shadow-glow transition-all">
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