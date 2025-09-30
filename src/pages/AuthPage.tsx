import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Checkbox } from "@/components/ui/checkbox";
import promjumLogo from "@/assets/promjum-logo.png";
import { supabase } from "@/integrations/supabase/client";
import BackgroundDecorations from "@/components/BackgroundDecorations";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { toast } = useToast();
  const { signIn, signUp, resetPassword, user, getUserRole } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'login';

  // Redirect if user is already logged in
  useEffect(() => {
    const checkUserRole = async () => {
      if (user) {
        const role = await getUserRole(user.id);
        if (role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    };
    
    checkUserRole();
  }, [user, navigate, getUserRole]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "เข้าสู่ระบบไม่สำเร็จ",
        description: error.message || "กรุณาตรวจสอบข้อมูลและลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } else {
      toast({
        title: "เข้าสู่ระบบสำเร็จ!",
        description: "ยินดีต้อนรับสู่ Promjum",
      });
      
      // Get current session to check user role
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const role = await getUserRole(session.user.id);
        if (role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        navigate('/dashboard');
      }
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    const { error } = await signUp(email, password, fullName);
    
    if (error) {
      toast({
        title: "สมัครสมาชิกไม่สำเร็จ",
        description: error.message || "กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } else {
      toast({
        title: "สมัครสมาชิกสำเร็จ!",
        description: "กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชีก่อนเข้าสู่ระบบ",
      });
      setSearchParams({ tab: 'login' });
    }
    
    setIsLoading(false);
  };

  const handleForgotPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;

    const { error } = await resetPassword(email);
    
    if (error) {
      toast({
        title: "รีเซ็ตรหัสผ่านไม่สำเร็จ",
        description: error.message || "กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } else {
      toast({
        title: "ส่งอีเมลรีเซ็ตแล้ว",
        description: "กรุณาตรวจสอบอีเมลสำหรับคำแนะนำการรีเซ็ตรหัสผ่าน",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-secondary/30 flex items-center justify-center p-4 relative overflow-hidden">
      <BackgroundDecorations />
      <div className="w-full max-w-md relative z-10">
        {/* Back button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับหน้าหลัก
          </Link>
        </Button>

        <Card className="bg-gradient-card shadow-large border-0">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <img 
                src={promjumLogo} 
                alt="Promjum Logo" 
                className="h-12 w-12 object-contain"
              />
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Promjum
              </span>
            </div>
            <CardTitle className="text-2xl">ยินดีต้อนรับ</CardTitle>
            <CardDescription>
              เข้าสู่ระบบหรือสมัครสมาชิกเพื่อเริ่มใช้งาน
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setSearchParams({ tab: value })} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="login">เข้าสู่ระบบ</TabsTrigger>
                <TabsTrigger value="signup">สมัครสมาชิก</TabsTrigger>
                <TabsTrigger value="reset">รีเซ็ต</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">อีเมล</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">รหัสผ่าน</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="remember" 
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <Label htmlFor="remember" className="text-sm">
                      จำฉันไว้
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                  </Button>
                  
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setSearchParams({ tab: 'reset' })}
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      ลืมรหัสผ่าน?
                    </button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullname">ชื่อ-นามสกุล</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullname"
                        name="fullName"
                        type="text"
                        placeholder="ชื่อ นามสกุล"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">อีเมล</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">รหัสผ่าน</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        minLength={6}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    variant="hero"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    การสมัครสมาชิกแสดงว่าคุณยอมรับ{" "}
                    <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                      เงื่อนไขการใช้งาน
                    </Button>{" "}
                    และ{" "}
                    <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                      นโยบายความเป็นส่วนตัว
                    </Button>
                  </p>
                </form>
              </TabsContent>

              <TabsContent value="reset">
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">รีเซ็ตรหัสผ่าน</h3>
                    <p className="text-sm text-muted-foreground">
                      กรอกอีเมลของคุณ เราจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านให้
                    </p>
                  </div>
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">อีเมล</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="reset-email"
                          name="email"
                          type="email"
                          placeholder="your@email.com"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <Button
                      type="submit"
                      variant="hero"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "กำลังส่ง..." : "ส่งลิงก์รีเซ็ต"}
                    </Button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setSearchParams({ tab: 'login' })}
                        className="text-sm text-muted-foreground hover:text-primary"
                      >
                        กลับไปเข้าสู่ระบบ
                      </button>
                    </div>
                  </form>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            ต้องการความช่วยเหลือ?{" "}
            <Button variant="link" size="sm" className="p-0 h-auto text-sm">
              ติดต่อทีมงาน
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};