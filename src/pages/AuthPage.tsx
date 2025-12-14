import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Checkbox } from "@/components/ui/checkbox";
import promjumLogo from "@/assets/promjum-logo.png";
import { supabase } from "@/integrations/supabase/client";
import BackgroundDecorations from "@/components/BackgroundDecorations";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { toast } = useToast();
  const { signIn, signUp, signInWithGoogle, resetPassword, user, getUserRole } = useAuth();
  const navigate = useNavigate();

  // Simple local state for tabs, defaulting to 'login'
  const [activeTab, setActiveTab] = useState("login");

  // Redirect if user is already logged in
  useEffect(() => {
    const checkUserRole = async () => {
      if (user) {
        const role = await getUserRole(user.id);
        if (role === 'admin') {
          navigate('/admin');
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
          navigate('/admin');
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
    const confirmPassword = formData.get('confirmPassword') as string;
    const fullName = formData.get('fullName') as string;

    // ตรวจสอบว่ารหัสผ่านตรงกันหรือไม่
    if (password !== confirmPassword) {
      toast({
        title: "รหัสผ่านไม่ตรงกัน",
        description: "กรุณาตรวจสอบรหัสผ่านให้ตรงกัน",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

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
      setActiveTab('login');
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden font-prompt">
      <BackgroundDecorations />
      <div className="w-full max-w-md relative z-10">
        {/* Back button */}
        <Button variant="ghost" asChild className="mb-6 hover:bg-white/50">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับหน้าหลัก
          </Link>
        </Button>

        <Card className="bg-white/80 backdrop-blur-md shadow-large border-white/50 rounded-[2rem]">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <img
                src={promjumLogo}
                alt="Promjum Logo"
                className="h-12 w-12 object-contain"
              />
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Promjum
              </span>
            </div>
            <CardTitle className="text-2xl font-bold">ยินดีต้อนรับ</CardTitle>
            <CardDescription className="text-base">
              เข้าสู่ระบบหรือสมัครสมาชิกเพื่อเริ่มใช้งาน
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8 bg-secondary/50 p-1 rounded-2xl h-auto">
                <TabsTrigger value="login" className="rounded-xl py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">เข้าสู่ระบบ</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-xl py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">สมัครสมาชิก</TabsTrigger>
                <TabsTrigger value="reset" className="rounded-xl py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">รีเซ็ต</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-0 focus-visible:outline-none">
                {/* Google Login Button */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 text-base rounded-xl mb-4 border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-3"
                  onClick={async () => {
                    setIsLoading(true);
                    const { error } = await signInWithGoogle();
                    if (error) {
                      toast({
                        title: "เข้าสู่ระบบไม่สำเร็จ",
                        description: error.message || "กรุณาลองใหม่อีกครั้ง",
                        variant: "destructive",
                      });
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  เข้าสู่ระบบด้วย Google
                </Button>

                {/* Divider */}
                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">หรือ</span>
                  </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email">อีเมล</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10 h-11 rounded-xl bg-white/50 border-border/50 focus:bg-white transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">รหัสผ่าน</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 h-11 rounded-xl bg-white/50 border-border/50 focus:bg-white transition-all"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-9 w-9 p-0 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      className="rounded-md border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    />
                    <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                      จำฉันไว้
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    className="w-full h-12 text-lg rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                  </Button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('reset')}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      ลืมรหัสผ่าน?
                    </button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-0 focus-visible:outline-none">
                <form onSubmit={handleSignUp} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="fullname">ชื่อ-นามสกุล</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="fullname"
                        name="fullName"
                        type="text"
                        placeholder="ชื่อ นามสกุล"
                        className="pl-10 h-11 rounded-xl bg-white/50 border-border/50 focus:bg-white transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">อีเมล</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10 h-11 rounded-xl bg-white/50 border-border/50 focus:bg-white transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">รหัสผ่าน</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 h-11 rounded-xl bg-white/50 border-border/50 focus:bg-white transition-all"
                        minLength={6}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-9 w-9 p-0 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">ยืนยันรหัสผ่าน</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 h-11 rounded-xl bg-white/50 border-border/50 focus:bg-white transition-all"
                        minLength={6}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-9 w-9 p-0 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    variant="hero"
                    className="w-full h-12 text-lg rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center leading-relaxed">
                    การสมัครสมาชิกแสดงว่าคุณยอมรับ{" "}
                    <Button variant="link" size="sm" className="p-0 h-auto text-xs font-normal">
                      เงื่อนไขการใช้งาน
                    </Button>{" "}
                    และ{" "}
                    <Button variant="link" size="sm" className="p-0 h-auto text-xs font-normal">
                      นโยบายความเป็นส่วนตัว
                    </Button>
                  </p>
                </form>
              </TabsContent>

              <TabsContent value="reset" className="mt-0 focus-visible:outline-none">
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold">รีเซ็ตรหัสผ่าน</h3>
                    <p className="text-sm text-muted-foreground">
                      กรอกอีเมลของคุณ เราจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านให้
                    </p>
                  </div>
                  <form onSubmit={handleForgotPassword} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">อีเมล</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="reset-email"
                          name="email"
                          type="email"
                          placeholder="your@email.com"
                          className="pl-10 h-11 rounded-xl bg-white/50 border-border/50 focus:bg-white transition-all"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="hero"
                      className="w-full h-12 text-lg rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                      disabled={isLoading}
                    >
                      {isLoading ? "กำลังส่ง..." : "ส่งลิงก์รีเซ็ต"}
                    </Button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setActiveTab('login')}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
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

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            ต้องการความช่วยเหลือ?{" "}
            <Button variant="link" size="sm" className="p-0 h-auto text-sm font-normal">
              ติดต่อทีมงาน
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}