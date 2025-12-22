import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft, Share2, Trophy, Target, Zap, Flame,
  CheckCircle2, XCircle, Clock, TrendingUp, Award,
  Star, Medal, Crown, Sparkles, Edit3, Settings,
  Calendar, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import BackgroundDecorations from '@/components/BackgroundDecorations';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useUserStats } from '@/hooks/useUserStats';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  challenge_nickname: string | null;
  created_at: string;
  updated_at: string;
}

// Fallback for missing stats
const DEFAULT_STATS = {
  level: 1,
  xpNeeded: 1000,
  globalRank: "-",
  personalBest: "0.00",
  personalBestDate: "-",
  accuracy: 0,
  totalRuns: 0,
  title: "Novice Learner 🌱"
};

// Mock trophies
const trophies = [
  { id: 1, name: "Season 1 Gold", icon: "🏆", unlocked: true, color: "from-yellow-400 to-amber-500" },
  { id: 2, name: "Speed Demon", icon: "⚡", unlocked: true, color: "from-blue-400 to-cyan-500" },
  { id: 3, name: "Perfect Week", icon: "✅", unlocked: true, color: "from-green-400 to-emerald-500" },
  { id: 4, name: "100 Streak", icon: "🔥", unlocked: true, color: "from-orange-400 to-red-500" },
  { id: 5, name: "Locked", icon: "🔒", unlocked: false, color: "from-gray-300 to-gray-400" },
];

// Mock recent matches
const recentMatches = [
  { id: 1, type: "victory", opponent: "WordMaster_X", time: "09.26s", accuracy: 100, date: "2 mins ago" },
  { id: 2, type: "defeat", opponent: "LexiconKing", time: "11.54s", accuracy: 92, date: "1 hrs ago" },
  { id: 3, type: "victory", opponent: "Solo Speedrun", time: "09.84s", accuracy: 99, date: "Yesterday" },
];

// Mock learning evolution data
const learningData = [
  { month: "S", value: 100 },
  { month: "2s", value: 200 },
  { month: "5s", value: 350 },
  { month: "10s", value: 450 },
  { month: "20s", value: 500 },
  { month: "", value: 600 },
];

// Preset avatars
const presetAvatars = [
  { id: 1, url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix", name: "นักผจญภัย" },
  { id: 2, url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka", name: "นักเรียน" },
  { id: 3, url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Cookie", name: "คุกกี้" },
  { id: 4, url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Dusty", name: "นักวิทย์" },
  { id: 5, url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Oreo", name: "โอรีโอ้" },
  { id: 6, url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Tiger", name: "เสือ" },
  { id: 7, url: "https://api.dicebear.com/7.x/bottts/svg?seed=Robot1", name: "หุ่นยนต์" },
  { id: 8, url: "https://api.dicebear.com/7.x/bottts/svg?seed=Robot2", name: "เครื่องจักร" },
  { id: 9, url: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Happy", name: "สดใส" },
  { id: 10, url: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Cool", name: "เท่" },
  { id: 11, url: "https://api.dicebear.com/7.x/lorelei/svg?seed=Luna", name: "ลูน่า" },
  { id: 12, url: "https://api.dicebear.com/7.x/lorelei/svg?seed=Star", name: "ดาว" },
];

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { stats } = useUserStats();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Nickname state
  const [nicknameDialogOpen, setNicknameDialogOpen] = useState(false);
  const [nickname, setNickname] = useState('');
  const [nicknameInput, setNicknameInput] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [checkingNickname, setCheckingNickname] = useState(false);
  const [savingNickname, setSavingNickname] = useState(false);

  // Chart view mode state
  const [chartViewMode, setChartViewMode] = useState<'month' | 'year'>('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  // Thai month names
  const thaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];

  const thaiMonthsFull = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  // Generate mock cumulative data based on mode
  const chartData = useMemo(() => {
    if (chartViewMode === 'month') {
      // Month view: X-axis = days, Y-axis = cumulative words
      const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      const today = new Date();
      const isCurrentMonth = selectedYear === today.getFullYear() && selectedMonth === today.getMonth();
      const maxDay = isCurrentMonth ? today.getDate() : daysInMonth;

      // Mock cumulative data - starting from beginning of month
      let cumulative = Math.floor(Math.random() * 50) + 100; // Base words at start of month
      return Array.from({ length: maxDay }, (_, i) => {
        cumulative += Math.floor(Math.random() * 15) + 5; // Add 5-20 words per day
        return {
          label: `${i + 1}`,
          value: cumulative,
        };
      });
    } else {
      // Year view: X-axis = months, Y-axis = cumulative words
      const today = new Date();
      const isCurrentYear = selectedYear === today.getFullYear();
      const maxMonth = isCurrentYear ? today.getMonth() + 1 : 12;

      // Mock cumulative data - starting from January of selected year
      let cumulative = Math.floor(Math.random() * 100) + 200; // Base words at start of year
      return Array.from({ length: maxMonth }, (_, i) => {
        cumulative += Math.floor(Math.random() * 100) + 150; // Add 150-250 words per month
        return {
          label: thaiMonths[i],
          value: cumulative,
        };
      });
    }
  }, [chartViewMode, selectedYear, selectedMonth]);

  const maxValue = useMemo(() => {
    return Math.max(...chartData.map(d => d.value), 1);
  }, [chartData]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        setFullName(data.full_name || '');
        setBio(data.bio || '');
        setNickname(data.challenge_nickname || '');
        setNicknameInput(data.challenge_nickname || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: fullName,
          bio: bio,
        });

      if (error) throw error;

      toast({
        title: "อัพเดทสำเร็จ",
        description: "ข้อมูลโปรไฟล์ของคุณได้รับการอัพเดทแล้ว",
      });

      fetchProfile();
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพเดทโปรไฟล์ได้",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Check if nickname is available (not taken by another user)
  const checkNicknameAvailability = async (inputNickname: string) => {
    if (!inputNickname.trim() || inputNickname.length < 3) {
      setNicknameError('ชื่อต้องมีอย่างน้อย 3 ตัวอักษร');
      return false;
    }
    if (inputNickname.length > 20) {
      setNicknameError('ชื่อต้องไม่เกิน 20 ตัวอักษร');
      return false;
    }
    if (!/^[a-zA-Z0-9_ก-๙]+$/.test(inputNickname)) {
      setNicknameError('ใช้ได้เฉพาะตัวอักษร ตัวเลข และ _ เท่านั้น');
      return false;
    }

    setCheckingNickname(true);
    setNicknameError('');

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('challenge_nickname')
        .eq('challenge_nickname', inputNickname)
        .neq('user_id', user?.id || '')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setNicknameError('ชื่อนี้ถูกใช้งานแล้ว กรุณาเลือกชื่ออื่น');
        return false;
      }

      setNicknameError('');
      return true;
    } catch (error) {
      console.error('Error checking nickname:', error);
      setNicknameError('เกิดข้อผิดพลาดในการตรวจสอบ');
      return false;
    } finally {
      setCheckingNickname(false);
    }
  };

  // Save nickname to database
  const saveNickname = async () => {
    if (!user) return;

    const isAvailable = await checkNicknameAvailability(nicknameInput);
    if (!isAvailable) return;

    setSavingNickname(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          challenge_nickname: nicknameInput.trim(),
        });

      if (error) {
        // Check if it's a unique constraint violation
        if (error.code === '23505') {
          setNicknameError('ชื่อนี้ถูกใช้งานแล้ว กรุณาเลือกชื่ออื่น');
          return;
        }
        throw error;
      }

      setNickname(nicknameInput.trim());
      toast({
        title: "บันทึกสำเร็จ! 🎉",
        description: "ตั้งชื่อ Challenge เรียบร้อยแล้ว",
        className: "bg-green-50 border-green-200 text-green-800"
      });

      fetchProfile();
      setNicknameDialogOpen(false);
    } catch (error) {
      console.error('Error saving nickname:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกชื่อได้",
        variant: "destructive",
      });
    } finally {
      setSavingNickname(false);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const displayName = fullName || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-background py-6 relative overflow-hidden">
      <BackgroundDecorations />
      <div className="container max-w-6xl mx-auto px-4 relative z-10">
        {/* Back button */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับหน้าหลัก
          </Link>
        </div>

        {/* Profile Header Card - Cute Edition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="overflow-hidden border-0 shadow-xl relative">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-100 via-pink-50 to-purple-100 dark:from-purple-950/50 dark:via-pink-950/30 dark:to-purple-950/50" />
            {/* Floating Decorations */}
            <motion.div
              className="absolute top-4 right-8 text-2xl z-10"
              animate={{ y: [0, -8, 0], rotate: [0, 15, -15, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >⭐</motion.div>
            <motion.div
              className="absolute top-8 right-20 text-xl z-10"
              animate={{ y: [0, -5, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            >✨</motion.div>
            <motion.div
              className="absolute bottom-6 right-12 text-lg z-10"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >💫</motion.div>
            <CardContent className="p-6 sm:p-8 relative z-10">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Avatar with Level Badge - Clickable */}
                <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
                  <DialogTrigger asChild>
                    <div className="relative cursor-pointer group">
                      {/* Sparkle Ring Animation */}
                      <motion.div
                        className="absolute rounded-full border-2 border-dashed border-purple-300 dark:border-purple-600"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        style={{ width: 136, height: 136, top: -4, left: -4 }}
                      />
                      <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-purple-500 p-1 group-hover:scale-105 transition-all shadow-xl">
                        <Avatar className="w-full h-full border-4 border-white dark:border-slate-800">
                          <AvatarImage src={selectedAvatar || profile?.avatar_url || ''} />
                          <AvatarFallback className="text-4xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                            {displayName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {/* Edit overlay */}
                        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Edit3 className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      {/* Level Badge - Cute Style */}
                      <motion.div
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1.5 border-2 border-white dark:border-slate-800"
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <span>🔥</span>
                        Lv.{Math.floor(stats.totalXP / 1000) + 1}
                      </motion.div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>เลือกรูปโปรไฟล์</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      {/* Preset Avatars */}
                      <div>
                        <Label className="text-sm text-muted-foreground mb-3 block">เลือกจากรูปแบบสำเร็จรูป</Label>
                        <div className="grid grid-cols-4 gap-3">
                          {presetAvatars.map((avatar) => (
                            <button
                              key={avatar.id}
                              onClick={() => setSelectedAvatar(avatar.url)}
                              className={`relative p-1 rounded-xl transition-all hover:scale-105 ${selectedAvatar === avatar.url
                                ? 'ring-2 ring-primary ring-offset-2 bg-primary/10'
                                : 'hover:bg-muted'
                                }`}
                            >
                              <img
                                src={avatar.url}
                                alt={avatar.name}
                                className="w-full aspect-square rounded-lg bg-muted"
                              />
                              <span className="text-[10px] text-center block mt-1 text-muted-foreground truncate">{avatar.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Upload Custom */}
                      <div className="border-t pt-4">
                        <Label className="text-sm text-muted-foreground mb-3 block">หรืออัปโหลดรูปของคุณ</Label>
                        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-muted-foreground/30 rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                          <div className="flex flex-col items-center justify-center">
                            <Sparkles className="w-8 h-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">คลิกเพื่ออัปโหลดรูปภาพ</p>
                          </div>
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setSelectedAvatar(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }} />
                        </label>
                      </div>

                      {/* Save Button */}
                      <Button
                        onClick={async () => {
                          if (!user || !selectedAvatar) return;
                          setSaving(true);
                          try {
                            await supabase.from('profiles').upsert({
                              user_id: user.id,
                              avatar_url: selectedAvatar,
                            });
                            toast({ title: "อัพเดทสำเร็จ", description: "เปลี่ยนรูปโปรไฟล์เรียบร้อยแล้ว" });
                            fetchProfile();
                            setAvatarDialogOpen(false);
                          } catch (error) {
                            toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
                          } finally {
                            setSaving(false);
                          }
                        }}
                        disabled={!selectedAvatar || saving}
                        className="w-full"
                      >
                        {saving ? 'กำลังบันทึก...' : 'บันทึกรูปโปรไฟล์'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* User Info */}
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                      {nickname || displayName}
                    </h1>
                    <CheckCircle2 className="w-6 h-6 text-blue-500" />

                    {/* Nickname Edit Button */}
                    <Dialog open={nicknameDialogOpen} onOpenChange={(open) => {
                      setNicknameDialogOpen(open);
                      if (open) {
                        setNicknameInput(nickname || displayName);
                        setNicknameError('');
                      }
                    }}>
                      <DialogTrigger asChild>
                        <button className="p-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 transition-colors group">
                          <Edit3 className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-3 text-xl">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                              <span className="text-xl">✏️</span>
                            </div>
                            ตั้งชื่อ Challenge
                          </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 pt-4">
                          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-100 dark:border-purple-900/30">
                            <p className="text-sm text-muted-foreground mb-1">💡 เคล็ดลับ</p>
                            <p className="text-xs text-muted-foreground">ชื่อนี้จะแสดงในอันดับ Challenge และเมื่อเพิ่มเพื่อน</p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="nickname" className="flex items-center gap-2">
                              <span className="text-lg">🎮</span>
                              ชื่อ Challenge
                            </Label>
                            <div className="relative">
                              <Input
                                id="nickname"
                                value={nicknameInput}
                                onChange={(e) => {
                                  setNicknameInput(e.target.value);
                                  setNicknameError('');
                                }}
                                placeholder="ใส่ชื่อของคุณ..."
                                className={`h-12 text-lg font-medium rounded-xl pr-10 ${nicknameError ? 'border-red-500 focus-visible:ring-red-500' :
                                  ''
                                  }`}
                                maxLength={20}
                              />
                              {checkingNickname && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                  <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                              )}
                            </div>
                            {nicknameError && (
                              <p className="text-sm text-red-500 flex items-center gap-1">
                                <span>❌</span> {nicknameError}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {nicknameInput.length}/20 ตัวอักษร • ใช้ได้: ก-ฮ, A-Z, 0-9, _
                            </p>
                          </div>

                          <div className="flex gap-3 pt-2">
                            <Button
                              variant="outline"
                              onClick={() => setNicknameDialogOpen(false)}
                              className="flex-1 rounded-xl"
                            >
                              ยกเลิก
                            </Button>
                            <Button
                              onClick={saveNickname}
                              disabled={savingNickname || checkingNickname || !nicknameInput.trim()}
                              className="flex-1 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                            >
                              {savingNickname ? (
                                <span className="flex items-center gap-2">
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  กำลังบันทึก...
                                </span>
                              ) : (
                                <span className="flex items-center gap-2">
                                  <span>✨</span> บันทึก
                                </span>
                              )}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <p className="text-primary font-medium mb-2">{Math.floor(stats.totalXP / 1000) > 10 ? 'Elite Learner 🎓' : DEFAULT_STATS.title}</p>
                  {bio && (
                    <p className="text-muted-foreground text-sm max-w-md italic">
                      "{bio}"
                    </p>
                  )}

                  {/* XP Progress - Cute Enhanced */}
                  <div className="mt-5 bg-white/60 dark:bg-slate-800/60 rounded-2xl p-4 backdrop-blur-sm max-w-md mx-auto sm:mx-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">⚡</span>
                        <span className="text-sm text-slate-700 dark:text-slate-200 font-semibold">EXP Progress</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{stats.totalXP % 1000}</span>
                        <span className="text-xs text-slate-400">/ 1000 XP</span>
                      </div>
                    </div>
                    <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded-full overflow-hidden shadow-inner">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-400 rounded-full relative"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max((stats.totalXP % 1000) / 10, 5)}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          animate={{ x: ["-100%", "200%"] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                      </motion.div>
                    </div>
                    <div className="flex justify-between mt-1.5 text-[10px] text-slate-400">
                      <span>อีก {1000 - (stats.totalXP % 1000)} XP จะถึงเลเวลถัดไป! 🎯</span>
                      <span>{Math.round((stats.totalXP % 1000) / 10)}%</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Cute Style */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2 rounded-full border-purple-200 hover:bg-purple-50 text-purple-600 hover:text-purple-700 px-4">
                    <span>🎉</span>
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stats */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Key Statistics - Cute Redesign */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-card to-violet-50/30 dark:to-violet-950/10 overflow-hidden relative">
              {/* Decorative Elements */}
              <div className="absolute top-3 right-3 text-3xl opacity-20 animate-jiggle">📊</div>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">สถิติการเรียน</h3>
                    <p className="text-xs text-muted-foreground">ข้อมูลความก้าวหน้าของคุณ ✨</p>
                  </div>
                </div>

                {/* Stats Grid - Cute Style */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 border border-purple-200/50 dark:border-purple-700/30 group hover:scale-105 transition-transform cursor-default">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl animate-jiggle">📅</span>
                      <p className="text-xs text-muted-foreground font-medium">เดือนนี้</p>
                    </div>
                    <p className="text-3xl font-black bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">{stats.wordsLearnedToday}</p>
                    <p className="text-xs text-muted-foreground">คำศัพท์ที่จำได้ (วันนี้)</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 border border-blue-200/50 dark:border-blue-700/30 group hover:scale-105 transition-transform cursor-default">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl animate-jiggle" style={{ animationDelay: '0.2s' }}>📆</span>
                      <p className="text-xs text-muted-foreground font-medium">ปีนี้</p>
                    </div>
                    <p className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{stats.wordsLearned}</p>
                    <p className="text-xs text-muted-foreground">คำศัพท์ที่จำได้ (ทั้งหมด)</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 border border-orange-200/50 dark:border-orange-700/30 group hover:scale-105 transition-transform cursor-default">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl animate-swing">🏆</span>
                      <p className="text-xs text-muted-foreground font-medium">Streak สูงสุด</p>
                    </div>
                    <p className="text-3xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">-</p>
                    <p className="text-xs text-muted-foreground">วันต่อเนื่อง 🔥</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200/50 dark:border-green-700/30 group hover:scale-105 transition-transform cursor-default">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl animate-heartbeat">🔥</span>
                      <p className="text-xs text-muted-foreground font-medium">Streak ปัจจุบัน</p>
                    </div>
                    <p className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{stats.streak}</p>
                    <p className="text-xs text-muted-foreground">วันต่อเนื่อง 💪</p>
                  </div>
                </div>

                {/* Additional Stats - Cute List */}
                <div className="space-y-3 pt-4 border-t border-violet-100 dark:border-violet-900/30">
                  <div className="flex items-center justify-between p-2 rounded-xl hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-lg animate-wiggle">⏰</span>
                      <span className="text-sm text-muted-foreground">เวลาเรียนรวม</span>
                    </div>
                    <span className="font-bold text-foreground bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">128 ชม.</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-lg animate-jiggle">📚</span>
                      <span className="text-sm text-muted-foreground">Deck ที่เรียนจบ</span>
                    </div>
                    <span className="font-bold text-foreground">15 / 42</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-lg animate-swing">🗓️</span>
                      <span className="text-sm text-muted-foreground">วันที่เริ่มใช้งาน</span>
                    </div>
                    <span className="font-bold text-foreground">15 ม.ค. 2024</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vocab Challenge - Redesigned with Sections */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-card to-amber-50/30 dark:to-amber-950/10 overflow-hidden relative">
              {/* Decorative Elements */}
              <div className="absolute top-3 right-3 text-3xl opacity-20 animate-heartbeat">🏅</div>
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Vocab Challenge</h3>
                    <p className="text-xs text-muted-foreground">แข่งขันกับเพื่อนๆ 🎮</p>
                  </div>
                </div>

                {/* ==================== ALL TIME BEST ==================== */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg animate-swing">🏆</span>
                    <h4 className="text-sm font-bold text-foreground uppercase tracking-wide">สถิติที่ดีที่สุด (All Time)</h4>
                  </div>

                  {/* Personal Best - Highlight */}
                  <div className="mb-3 p-4 rounded-2xl bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 border border-amber-200/50 dark:border-amber-700/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                          <span className="text-xl animate-heartbeat">⚡</span>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Best Time</p>
                          <p className="font-bold text-foreground">Personal Best</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{DEFAULT_STATS.personalBest}s</p>
                        <p className="text-[10px] text-muted-foreground">📅 {DEFAULT_STATS.personalBestDate}</p>
                      </div>
                    </div>
                  </div>

                  {/* Best Rank & Best Accuracy - 2 columns */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-100 dark:border-blue-800/30">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm animate-wiggle">👑</span>
                        <p className="text-[10px] text-muted-foreground">Best Rank</p>
                      </div>
                      <p className="text-xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">#42</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800/30">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm animate-jiggle">🎯</span>
                        <p className="text-[10px] text-muted-foreground">Best Accuracy</p>
                      </div>
                      <p className="text-xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">100%</p>
                    </div>
                  </div>
                </div>

                {/* ==================== THIS MONTH ==================== */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg animate-jiggle">📅</span>
                    <h4 className="text-sm font-bold text-foreground uppercase tracking-wide">สถิติเดือนนี้ (ธ.ค. 2567)</h4>
                  </div>

                  {/* Current Rank - Highlight */}
                  <div className="mb-3 p-4 rounded-2xl bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 border border-blue-200/50 dark:border-blue-700/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                          <span className="text-xl animate-swing">👑</span>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">อันดับโลก</p>
                          <p className="font-bold text-foreground">Current Rank</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">#{DEFAULT_STATS.globalRank}</p>
                        <p className="text-[10px] text-muted-foreground">🌟 Unranked</p>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Stats Grid - 2x2 */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-100 dark:border-purple-800/30">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm animate-wiggle">⏱️</span>
                        <p className="text-[10px] text-muted-foreground">Avg. Time</p>
                      </div>
                      <p className="text-xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">09.8542s</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800/30">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm animate-jiggle">🎯</span>
                        <p className="text-[10px] text-muted-foreground">Accuracy</p>
                      </div>
                      <p className="text-xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{DEFAULT_STATS.accuracy}%</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-100 dark:border-orange-800/30">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm animate-shake">🎮</span>
                        <p className="text-[10px] text-muted-foreground">Games</p>
                      </div>
                      <p className="text-xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">48</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20 border border-rose-100 dark:border-rose-800/30">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm animate-boing">📈</span>
                        <p className="text-[10px] text-muted-foreground">Rank Change</p>
                      </div>
                      <p className="text-xl font-black text-green-600">+12 ↑</p>
                    </div>
                  </div>
                </div>

                {/* Total Runs - Footer */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/10 dark:to-purple-900/10 border border-violet-100 dark:border-violet-800/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg animate-wiggle">🏁</span>
                    <span className="text-sm text-muted-foreground">เล่นทั้งหมด (All Time)</span>
                  </div>
                  <span className="font-bold text-foreground">{DEFAULT_STATS.totalRuns.toLocaleString()} ครั้ง</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Trophy & Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Trophy Case - Cute Redesign */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-card to-amber-50/30 dark:to-amber-950/10 overflow-hidden relative">
              {/* Decorative Elements */}
              <div className="absolute top-3 right-3 text-2xl opacity-30 animate-twinkle">✨</div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg">
                      <span className="text-xl animate-swing">🏆</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">ถ้วยรางวัล</h3>
                      <p className="text-xs text-muted-foreground">รางวัลที่คุณได้รับ 🌟</p>
                    </div>
                  </div>
                  <Link to="#" className="text-sm text-primary hover:underline flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors">
                    ดูทั้งหมด →
                  </Link>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-amber-200 dark:scrollbar-thumb-amber-800">
                  {trophies.map((trophy) => (
                    <div
                      key={trophy.id}
                      className={`flex flex-col items-center min-w-[90px] p-3 rounded-2xl transition-all duration-300 cursor-default ${trophy.unlocked
                        ? 'hover:scale-110 hover:bg-amber-50/50 dark:hover:bg-amber-900/10'
                        : 'opacity-60'
                        }`}
                    >
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg border-2 ${trophy.unlocked
                        ? `bg-gradient-to-br ${trophy.color} border-white/50`
                        : 'bg-muted border-muted-foreground/20'
                        }`}>
                        {trophy.icon}
                      </div>
                      <p className={`text-xs mt-2 text-center font-medium ${trophy.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {trophy.name}
                      </p>
                      {trophy.unlocked && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">✓ ปลดล็อกแล้ว</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Learning Evolution - Cute Redesigned */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-card to-purple-50/30 dark:to-purple-950/10 overflow-hidden">
              <CardContent className="p-6 relative">
                {/* Decorative Background Elements */}
                <div className="absolute top-4 right-4 text-4xl opacity-20 animate-pulse">✨</div>
                <div className="absolute bottom-20 right-10 text-2xl opacity-15">📚</div>

                {/* Header with title and mode toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">พัฒนาการเรียนรู้</h3>
                      <p className="text-xs text-muted-foreground">ติดตามความก้าวหน้าของคุณ 🎯</p>
                    </div>
                  </div>

                  {/* Cute Mode Toggle Buttons */}
                  <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-full">
                    <button
                      onClick={() => setChartViewMode('month')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${chartViewMode === 'month'
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md scale-105'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                    >
                      <span className="text-base">📅</span>
                      เดือน
                    </button>
                    <button
                      onClick={() => setChartViewMode('year')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${chartViewMode === 'year'
                        ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md scale-105'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                    >
                      <span className="text-base">📊</span>
                      ปี
                    </button>
                  </div>
                </div>

                {/* Date Selector - Cute Style */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 rounded-2xl bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border border-violet-100 dark:border-violet-900/30">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🗓️</span>
                    {chartViewMode === 'month' ? (
                      <div className="flex items-center gap-2">
                        {/* Month Selector */}
                        <Select
                          value={selectedMonth.toString()}
                          onValueChange={(value) => setSelectedMonth(parseInt(value))}
                        >
                          <SelectTrigger className="w-[140px] h-10 bg-white dark:bg-background border-violet-200 dark:border-violet-800 rounded-xl font-medium">
                            <SelectValue placeholder="เลือกเดือน" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {thaiMonthsFull.map((month, index) => (
                              <SelectItem key={index} value={index.toString()} className="rounded-lg">
                                {month}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Year Selector for Month View */}
                        <Select
                          value={selectedYear.toString()}
                          onValueChange={(value) => setSelectedYear(parseInt(value))}
                        >
                          <SelectTrigger className="w-[110px] h-10 bg-white dark:bg-background border-violet-200 dark:border-violet-800 rounded-xl font-medium">
                            <SelectValue placeholder="เลือกปี" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                              <SelectItem key={year} value={year.toString()} className="rounded-lg">
                                {year + 543}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      /* Year Selector */
                      <Select
                        value={selectedYear.toString()}
                        onValueChange={(value) => setSelectedYear(parseInt(value))}
                      >
                        <SelectTrigger className="w-[130px] h-10 bg-white dark:bg-background border-violet-200 dark:border-violet-800 rounded-xl font-medium">
                          <SelectValue placeholder="เลือกปี" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                            <SelectItem key={year} value={year.toString()} className="rounded-lg">
                              พ.ศ. {year + 543}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Current View Info - Cute Badge */}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-background rounded-full shadow-sm border border-violet-100 dark:border-violet-900/30">
                    <span className="text-sm">📈</span>
                    <span className="text-xs text-muted-foreground">
                      {chartViewMode === 'month' ? 'แสดงรายวัน' : 'แสดงรายเดือน'}
                    </span>
                  </div>
                </div>

                {/* Beautiful Chart Visualization */}
                <div className="relative h-64 rounded-2xl bg-gradient-to-b from-white to-violet-50/50 dark:from-background dark:to-violet-950/10 p-4 border border-violet-100/50 dark:border-violet-900/20">
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-4 bottom-12 flex flex-col justify-between text-[10px] text-muted-foreground w-8">
                    <span>{maxValue.toLocaleString()}</span>
                    <span>{Math.floor(maxValue / 2).toLocaleString()}</span>
                    <span>0</span>
                  </div>

                  {/* Chart Area */}
                  <div className="ml-10 h-full relative">
                    {/* Grid Lines */}
                    <div className="absolute inset-0 bottom-8 flex flex-col justify-between pointer-events-none">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-full h-px bg-violet-200/30 dark:bg-violet-700/20" />
                      ))}
                    </div>

                    {/* SVG Chart */}
                    <svg
                      className="absolute inset-0 bottom-8 w-full h-[calc(100%-32px)]"
                      viewBox={`0 0 ${Math.max(chartData.length - 1, 1) * 100} 100`}
                      preserveAspectRatio="none"
                    >
                      {/* Gradient Definition */}
                      <defs>
                        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.4" />
                          <stop offset="50%" stopColor="rgb(168, 85, 247)" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="rgb(192, 132, 252)" stopOpacity="0.05" />
                        </linearGradient>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="rgb(236, 72, 153)" />
                          <stop offset="50%" stopColor="rgb(168, 85, 247)" />
                          <stop offset="100%" stopColor="rgb(139, 92, 246)" />
                        </linearGradient>
                      </defs>

                      {/* Area Fill */}
                      <path
                        d={`${chartData.map((data, i) => {
                          const x = chartData.length > 1 ? (i / (chartData.length - 1)) * ((chartData.length - 1) * 100) : 0;
                          const y = 100 - (data.value / maxValue) * 100;
                          return `${i === 0 ? 'M' : 'L'}${x},${y}`;
                        }).join(' ')} L${(chartData.length - 1) * 100},100 L0,100 Z`}
                        fill="url(#areaGradient)"
                        className="transition-all duration-500"
                      />

                      {/* Line */}
                      <path
                        d={chartData.map((data, i) => {
                          const x = chartData.length > 1 ? (i / (chartData.length - 1)) * ((chartData.length - 1) * 100) : 0;
                          const y = 100 - (data.value / maxValue) * 100;
                          return `${i === 0 ? 'M' : 'L'}${x},${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="url(#lineGradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-all duration-500"
                      />

                      {/* Data Points removed for cleaner look - line only */}
                    </svg>

                    {/* X-axis Labels */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-muted-foreground px-1">
                      {chartData.map((data, index) => {
                        // Show limited labels for month view with many days
                        if (chartViewMode === 'month' && chartData.length > 15 && index % 5 !== 0 && index !== chartData.length - 1) {
                          return <span key={index} className="w-0" />;
                        }
                        return (
                          <span key={index} className="text-center" style={{ minWidth: '20px' }}>
                            {data.label}
                          </span>
                        );
                      })}
                    </div>

                    {/* Interactive Hover Areas with Tooltips */}
                    <div className="absolute inset-0 bottom-8 flex">
                      {chartData.map((data, index) => (
                        <div
                          key={index}
                          className="flex-1 h-full relative group cursor-pointer"
                        >
                          {/* Hover Line */}
                          <div className="absolute inset-0 bg-violet-500/0 group-hover:bg-violet-500/5 transition-colors" />

                          {/* Tooltip */}
                          <div className="absolute left-1/2 -translate-x-1/2 -top-2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-20">
                            <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-3 py-2 rounded-xl shadow-lg text-xs whitespace-nowrap">
                              <div className="font-bold">{data.value.toLocaleString()} คำ</div>
                              <div className="text-violet-200 text-[10px]">
                                {chartViewMode === 'month' ? `วันที่ ${data.label}` : data.label}
                              </div>
                              {/* Tooltip Arrow */}
                              <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-purple-600 rotate-45" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Summary Stats - Cute Cards */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {/* Total Words */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200/50 dark:border-violet-700/30">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">📚</span>
                      <span className="text-xs text-muted-foreground">คำศัพท์สะสม</span>
                    </div>
                    <p className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                      {chartData[chartData.length - 1]?.value.toLocaleString() || 0}
                    </p>
                  </div>

                  {/* Growth */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/20 dark:to-rose-900/20 border border-pink-200/50 dark:border-pink-700/30">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">🚀</span>
                      <span className="text-xs text-muted-foreground">เพิ่มขึ้น</span>
                    </div>
                    <p className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                      +{((chartData[chartData.length - 1]?.value || 0) - (chartData[0]?.value || 0)).toLocaleString()}
                    </p>
                  </div>

                  {/* Average */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/50 dark:border-amber-700/30 col-span-2 sm:col-span-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">⭐</span>
                      <span className="text-xs text-muted-foreground">เฉลี่ย/{chartViewMode === 'month' ? 'วัน' : 'เดือน'}</span>
                    </div>
                    <p className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      {chartData.length > 1
                        ? Math.round(((chartData[chartData.length - 1]?.value || 0) - (chartData[0]?.value || 0)) / (chartData.length - 1)).toLocaleString()
                        : 0
                      }
                    </p>
                  </div>
                </div>

                {/* Motivational Message */}
                <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-200/50 dark:border-green-700/30 flex items-center gap-3">
                  <span className="text-2xl">🎉</span>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    เยี่ยมมาก! คุณกำลังพัฒนาอย่างต่อเนื่อง สู้ๆ นะ! 💪
                  </p>
                </div>
              </CardContent>
            </Card>

          </motion.div>
        </div>
      </div>
    </div>
  );
}