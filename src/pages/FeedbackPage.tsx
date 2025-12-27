import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Send, Star, Lightbulb, Bug, MessageSquare, CheckCircle2, Gamepad2, BookOpen, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function FeedbackPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    type: 'general',
    message: '',
    rating: 0,
    email: user?.email || '',
  });

  const feedbackTypes = [
    { id: 'general', label: 'ทั่วไป', icon: MessageSquare, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
    { id: 'feature', label: 'ฟีเจอร์ใหม่', icon: Lightbulb, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
    { id: 'bug', label: 'แจ้งปัญหา', icon: Bug, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
    { id: 'game_idea', label: 'ไอเดียเกม', icon: Gamepad2, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
    { id: 'content', label: 'คำศัพท์/เนื้อหา', icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    { id: 'question', label: 'สอบถาม', icon: HelpCircle, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.message.trim()) {
      toast({
        title: "กรุณาระบุรายละเอียด",
        variant: "destructive",
      });
      return;
    }

    if (formData.rating === 0) {
      toast({
        title: "ช่วยให้คะแนนความพึงพอใจหน่อยนะ",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('user_feedbacks').insert({
        user_id: user?.id || null,
        type: formData.type,
        message: formData.message.trim(),
        rating: formData.rating,
        email: formData.email.trim() || null,
        status: 'pending'
      });

      if (error) throw error;

      setIsSuccess(true);
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "ส่งไม่สำเร็จ",
        description: error.message || "ลองใหม่อีกครั้งนะ",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full glass-card rounded-[2.5rem] p-10 text-center relative z-10"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.4)] border-4 border-white/20">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2 font-cute">ขอบคุณนะ!</h2>
          <p className="text-slate-300 mb-8 text-lg font-medium">
            เราได้รับความคิดเห็นของคุณแล้ว <br /> ทีมงานจะอ่านทุกข้อความแน่นอน 💖
          </p>
          <Button
            onClick={() => {
              setIsSuccess(false);
              setFormData({ type: 'general', message: '', rating: 0, email: user?.email || '' });
            }}
            className="w-full h-12 rounded-xl text-base font-bold shadow-lg hover:shadow-xl transition-all bg-white/10 hover:bg-white/20 text-white border border-white/20"
            variant="outline"
          >
            ส่งข้อเสนอแนะเพิ่มเติม
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent py-8 px-4 relative overflow-auto font-sans">
      <div className="max-w-xl mx-auto relative z-10 h-full flex flex-col justify-center min-h-[85vh]">

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-black text-white mb-2 font-cute drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
            Open Space 🚀
          </h1>
          <p className="text-purple-200 font-medium text-lg">เสียงของคุณคือพลังขับเคลื่อนยานของเรา</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-[2.5rem] p-6 sm:p-10 relative overflow-hidden"
        >
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 blur-[100px] rounded-full -z-10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/20 blur-[100px] rounded-full -z-10" />

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">

            {/* 1. Rating */}
            <div className="text-center space-y-4">
              <div className="inline-block bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold text-cyan-200 uppercase tracking-widest border border-white/10">
                ความพึงพอใจ 🌟
              </div>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="transition-all hover:scale-110 active:scale-95 focus:outline-none group"
                  >
                    <Star
                      className={cn(
                        "h-10 w-10 sm:h-12 sm:w-12 transition-all duration-300 filter drop-shadow-lg",
                        star <= formData.rating
                          ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]"
                          : "text-slate-600 group-hover:text-yellow-200/50"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Topic Type Grid */}
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">เรื่องที่อยากบอก</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {feedbackTypes.map((type) => {
                  const isSelected = formData.type === type.id;
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type.id })}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all duration-300 h-24 sm:h-28 group relative overflow-hidden",
                        isSelected
                          ? `bg-white/10 ${type.border} shadow-[0_0_15px_rgba(255,255,255,0.1)] scale-105`
                          : "bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-xl transition-all duration-300",
                        isSelected ? "bg-white/20 shadow-inner" : "bg-white/5 group-hover:scale-110"
                      )}>
                        <Icon className={cn("w-5 h-5 sm:w-6 sm:h-6", isSelected ? type.color : "text-slate-500 group-hover:text-white")} />
                      </div>
                      <span className={cn(
                        "font-bold text-xs sm:text-sm transition-colors",
                        isSelected ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                      )}>
                        {type.label}
                      </span>

                      {/* Active Indicator */}
                      {isSelected && (
                        <motion.div layoutId="active-indicator" className="absolute inset-0 border-2 border-white/20 rounded-2xl pointer-events-none" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Message */}
            <div className="space-y-4">
              <div className="relative">
                <Textarea
                  placeholder="เล่ารายละเอียดให้เราฟังหน่อย..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  className="rounded-2xl bg-black/20 border-white/10 focus:border-purple-500/50 focus:bg-black/40 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none p-5 text-base text-white placeholder:text-slate-500 shadow-inner"
                />
                <div className="absolute top-3 right-3">
                  <MessageSquare className="w-5 h-5 text-white/10" />
                </div>
              </div>

              <div className="flex items-center gap-3 bg-black/20 border border-white/5 p-2 pl-4 rounded-2xl focus-within:border-purple-500/30 transition-all">
                <span className="text-sm font-bold text-slate-400 whitespace-nowrap">ติดต่อกลับ:</span>
                <Input
                  type="email"
                  placeholder="อีเมลของคุณ (ไม่บังคับ)"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-2 h-9 text-white placeholder:text-slate-600"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 rounded-2xl text-lg font-bold btn-space-glass mt-4"
            >
              <div className="flex items-center gap-2">
                {isSubmitting ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>ส่งความคิดเห็น</span>
                  </>
                )}
              </div>
            </Button>

          </form>
        </motion.div>
      </div>
    </div>
  );
}