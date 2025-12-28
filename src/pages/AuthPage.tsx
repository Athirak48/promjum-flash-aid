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

    const { data, error } = await signUp(email, password, fullName);

    if (error) {
      toast({
        title: "สมัครสมาชิกไม่สำเร็จ",
        description: error.message || "กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } else if (data?.session) {
      // Login immediately if email verification is disabled
      toast({
        title: "สมัครสมาชิกสำเร็จ!",
        description: "ยินดีต้อนรับสู่ Promjum",
      });
      navigate('/dashboard');
    } else {
      // Email verification required
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
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4 relative overflow-hidden font-prompt">

      <div className="w-full max-w-md relative z-10">
        {/* Back button */}
        <Button variant="ghost" asChild className="mb-3 hover:bg-white/10 text-white hover:text-primary">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับหน้าหลัก
          </Link>
        </Button>

        <Card className="glass-card border-white/20 rounded-[2rem]">
          <CardHeader className="text-center pb-1 pt-4">
            <div className="flex flex-col items-center justify-center gap-2 mb-3">
              <div className="p-2 bg-white/95 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] backdrop-blur-md border border-white/50">
                <img
                  src={promjumLogo}
                  alt="Promjum Logo"
                  className="h-12 w-12 object-contain"
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent font-cute tracking-wide drop-shadow-md">
                Promjum
              </span>
            </div>
            <CardTitle className="text-xl font-bold text-white">ยินดีต้อนรับ</CardTitle>
            <CardDescription className="text-sm text-white/60">
              เข้าสู่ระบบหรือสมัครสมาชิกเพื่อเริ่มใช้งาน
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 bg-black/40 p-1 rounded-xl h-auto border border-white/10">
                <TabsTrigger value="login" className="rounded-lg py-1.5 text-sm text-white/50 data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all">เข้าสู่ระบบ</TabsTrigger>
                <TabsTrigger value="register" className="rounded-lg py-1.5 text-sm text-white/50 data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all">สมัครสมาชิก</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-0 focus-visible:outline-none">
                {/* Google Login Button */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 text-base rounded-xl mb-4 border-white/20 bg-white/5 hover:bg-white/10 text-white hover:text-white flex items-center justify-center gap-3 backdrop-blur-sm"
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
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-transparent text-white/40 font-medium bg-black/20 backdrop-blur-md rounded-full">หรือด้วยอีเมล</span>
                  </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="login-email" className="text-white/80 font-medium text-sm">อีเมล</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
                      <Input
                        id="login-email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-9 h-10 text-sm rounded-xl bg-white/5 border-white/10 focus:bg-white/10 focus:border-primary/50 text-white placeholder:text-white/20 transition-all font-light"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="login-password" className="text-white/80 font-medium text-sm">รหัสผ่าน</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
                      <Input
                        id="login-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-9 pr-9 h-10 text-sm rounded-xl bg-white/5 border-white/10 focus:bg-white/10 focus:border-primary/50 text-white placeholder:text-white/20 transition-all font-light"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-transparent text-white/40 hover:text-white"
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

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        className="rounded-md border-white/30 data-[state=checked]:bg-primary data-[state=checked]:text-white h-4 w-4"
                      />
                      <Label htmlFor="remember" className="text-xs font-normal cursor-pointer text-white/70">
                        จำฉันไว้
                      </Label>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('reset')}
                      className="text-xs text-white/60 hover:text-white transition-colors font-medium decoration-1 underline-offset-4 hover:underline"
                    >
                      ลืมรหัสผ่าน?
                    </button>
                  </div>

                  <Button
                    type="submit"
                    className="btn-space-glass w-full h-10 text-base rounded-xl shadow-[0_4px_15px_rgba(168,85,247,0.4)] hover:shadow-[0_8px_25px_rgba(168,85,247,0.6)]"
                    disabled={isLoading}
                  >
                    {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="mt-0 focus-visible:outline-none">
                <form onSubmit={handleSignUp} className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="full-name" className="text-white/80 font-medium text-sm">ชื่อ-นามสกุล</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
                      <Input
                        id="full-name"
                        name="fullName"
                        type="text"
                        placeholder="Promjum User"
                        className="pl-9 h-10 text-sm rounded-xl bg-white/5 border-white/10 focus:bg-white/10 focus:border-primary/50 text-white placeholder:text-white/20 transition-all font-light"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="register-email" className="text-white/80 font-medium text-sm">อีเมล</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
                      <Input
                        id="register-email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-9 h-10 text-sm rounded-xl bg-white/5 border-white/10 focus:bg-white/10 focus:border-primary/50 text-white placeholder:text-white/20 transition-all font-light"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="register-password" className="text-white/80 font-medium text-sm">รหัสผ่าน</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
                      <Input
                        id="register-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-9 pr-9 h-10 text-sm rounded-xl bg-white/5 border-white/10 focus:bg-white/10 focus:border-primary/50 text-white placeholder:text-white/20 transition-all font-light"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-transparent text-white/40 hover:text-white"
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
                  <div className="space-y-1">
                    <Label htmlFor="confirm-password" className="text-white/80 font-medium text-sm">ยืนยันรหัสผ่าน</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
                      <Input
                        id="confirm-password"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-9 pr-9 h-10 text-sm rounded-xl bg-white/5 border-white/10 focus:bg-white/10 focus:border-primary/50 text-white placeholder:text-white/20 transition-all font-light"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-transparent text-white/40 hover:text-white"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="btn-space-glass w-full h-10 text-base rounded-xl mt-4 shadow-[0_4px_15px_rgba(168,85,247,0.4)] hover:shadow-[0_8px_25px_rgba(168,85,247,0.6)]"
                    disabled={isLoading}
                  >
                    {isLoading ? "กำลังสมัคร..." : "ยืนยันการสมัคร"}
                  </Button>
                </form>
              </TabsContent>



              <TabsContent value="reset" className="mt-0 focus-visible:outline-none">
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold text-white">รีเซ็ตรหัสผ่าน</h3>
                    <p className="text-sm text-white/60">
                      กรอกอีเมลของคุณ เราจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านให้
                    </p>
                  </div>
                  <form onSubmit={handleForgotPassword} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email" className="text-white/80 font-medium">อีเมล</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-white/40" />
                        <Input
                          id="reset-email"
                          name="email"
                          type="email"
                          placeholder="your@email.com"
                          className="pl-10 h-11 rounded-xl bg-white/5 border-white/10 focus:bg-white/10 focus:border-primary/50 text-white placeholder:text-white/20 transition-all font-light"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="btn-space-glass w-full h-12 text-lg rounded-xl shadow-[0_4px_15px_rgba(168,85,247,0.4)] hover:shadow-[0_8px_25px_rgba(168,85,247,0.6)]"
                      disabled={isLoading}
                    >
                      {isLoading ? "กำลังส่ง..." : "ส่งลิงก์รีเซ็ต"}
                    </Button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setActiveTab('login')}
                        className="text-sm text-white/60 hover:text-white transition-colors font-medium decoration-1 underline-offset-4 hover:underline"
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

        <div className="text-center mt-4">
          <p className="text-xs text-white/50">
            ต้องการความช่วยเหลือ?{" "}
            <Button variant="link" size="sm" className="p-0 h-auto text-xs font-normal text-white/80 hover:text-white">
              ติดต่อทีมงาน
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}