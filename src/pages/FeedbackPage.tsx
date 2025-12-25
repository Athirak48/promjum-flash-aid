import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Send, Star, Lightbulb, Bug, MessageSquare, CheckCircle2, Gamepad2, Heart, BookOpen, HelpCircle } from 'lucide-react';
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
    { id: 'general', label: 'ทั่วไป', icon: MessageSquare, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' },
    { id: 'feature', label: 'ฟีเจอร์ใหม่', icon: Lightbulb, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    { id: 'bug', label: 'แจ้งปัญหา', icon: Bug, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
    { id: 'game_idea', label: 'ไอเดียเกม', icon: Gamepad2, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200' },
    { id: 'content', label: 'คำศัพท์/เนื้อหา', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
    { id: 'question', label: 'สอบถาม', icon: HelpCircle, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' },
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSuccess(true);
    } catch (error) {
      toast({
        title: "ส่งไม่สำเร็จ",
        description: "ลองใหม่อีกครั้งนะ",
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
          className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-2xl text-center relative z-10 border border-slate-100 dark:border-slate-800"
        >
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border-4 border-white dark:border-slate-800">
            <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-2">ขอบคุณนะ!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg">
            เราได้รับความคิดเห็นของคุณแล้ว <br /> ทีมงานจะอ่านทุกข้อความแน่นอน
          </p>
          <Button
            onClick={() => {
              setIsSuccess(false);
              setFormData({ type: 'general', message: '', rating: 0, email: user?.email || '' });
            }}
            className="w-full h-12 rounded-xl text-base font-medium shadow-lg hover:shadow-xl transition-all"
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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent mb-3 drop-shadow-sm">Opinion</h1>
          <p className="text-slate-500 font-medium text-lg">เสียงของคุณช่วยให้เราเติบโต</p>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/60 dark:border-slate-800 p-6 sm:p-10"
        >
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* 1. Rating */}
            <div className="text-center space-y-4">
              <div className="inline-block bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full text-sm font-bold text-slate-500 uppercase tracking-widest">
                ความพึงพอใจ
              </div>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="transition-all hover:scale-110 active:scale-95 focus:outline-none"
                  >
                    <Star
                      className={cn(
                        "h-10 w-10 sm:h-12 sm:w-12 transition-all duration-300 filter drop-shadow-sm",
                        star <= formData.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-200 dark:text-slate-700 hover:text-amber-200"
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
                        "flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200 h-24 sm:h-28 group relative overflow-hidden",
                        isSelected
                          ? `bg-white dark:bg-slate-800 ${type.border} ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ${type.color.replace('text', 'ring')}/20 shadow-md`
                          : "bg-slate-50 dark:bg-slate-800/50 border-transparent hover:bg-white dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-xl transition-all duration-300",
                        isSelected ? type.bg : "bg-white dark:bg-slate-900 group-hover:scale-110"
                      )}>
                        <Icon className={cn("w-5 h-5 sm:w-6 sm:h-6", isSelected ? type.color : "text-slate-400 group-hover:text-slate-600")} />
                      </div>
                      <span className={cn(
                        "font-bold text-xs sm:text-sm transition-colors",
                        isSelected ? "text-slate-800 dark:text-slate-200" : "text-slate-500"
                      )}>
                        {type.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Message */}
            <div className="space-y-4">
              <Textarea
                placeholder="เล่ารายละเอียดให้เราฟังหน่อย..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-0 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none p-5 text-base shadow-inner placeholder:text-slate-400"
              />

              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-2 pl-4 rounded-2xl">
                <span className="text-sm font-bold text-slate-400 whitespace-nowrap">ติดต่อกลับ:</span>
                <Input
                  type="email"
                  placeholder="อีเมลของคุณ (ไม่บังคับ)"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-2 h-9 text-slate-600 dark:text-slate-300 placeholder:text-slate-300"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-violet-200/50 dark:shadow-none bg-gradient-to-r from-violet-600 to-indigo-600 hover:scale-[1.02] active:scale-95 transition-all text-white"
            >
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                <span>{isSubmitting ? "กำลังส่ง..." : "ส่งความคิดเห็น"}</span>
              </div>
            </Button>

          </form>
        </motion.div>
      </div>
    </div>
  );
}