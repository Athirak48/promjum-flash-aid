import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { MessageSquare, Send, Star, Lightbulb, Bug, Heart, CheckCircle2, Smile, Frown, Meh, Gamepad2, HelpCircle } from 'lucide-react';
import BackgroundDecorations from '@/components/BackgroundDecorations';
import { cn } from '@/lib/utils';

export default function FeedbackPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    type: 'general',
    title: '',
    message: '',
    rating: 0,
    email: user?.email || '',
    allowContact: false
  });

  const feedbackTypes = [
    { id: 'general', label: 'ทั่วไป', icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-200' },
    { id: 'feature', label: 'ฟีเจอร์ใหม่', icon: Lightbulb, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-200' },
    { id: 'bug', label: 'แจ้งปัญหา', icon: Bug, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-200' },
    { id: 'game', label: 'เกม', icon: Gamepad2, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-200' },
    { id: 'question', label: 'สอบถาม', icon: HelpCircle, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-200' },
    { id: 'compliment', label: 'ชื่นชม', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-200' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.message.trim()) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        description: "ช่วยบอกหัวข้อและรายละเอียดให้เราหน่อยนะ",
        variant: "destructive",
      });
      return;
    }

    if (formData.type === 'general' && formData.rating === 0) {
      toast({
        title: "ลืมให้คะแนนหรือเปล่า?",
        description: "ช่วยกดให้ดาวความพึงพอใจหน่อยนะ",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setIsSuccess(true);
      toast({
        title: "ได้รับข้อความแล้ว!",
        description: "ขอบคุณที่ช่วยให้ Promjum ดีขึ้นนะ",
      });

    } catch (error) {
      toast({
        title: "อุ๊ย! ส่งไม่ผ่าน",
        description: "ลองใหม่อีกครั้งนะ",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        <BackgroundDecorations />
        <div className="max-w-md w-full text-center space-y-8 relative z-10 animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto shadow-sm animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">ขอบคุณนะ!</h2>
            <p className="text-muted-foreground text-lg">
              เราได้รับความคิดเห็นของคุณแล้ว <br />
              ทุกเสียงของคุณช่วยให้เราพัฒนาได้ดียิ่งขึ้น
            </p>
          </div>
          <Button
            onClick={() => {
              setIsSuccess(false);
              setFormData({
                type: 'general',
                title: '',
                message: '',
                rating: 0,
                email: user?.email || '',
                allowContact: false
              });
            }}
            className="min-w-[200px] h-12 rounded-full shadow-md hover:shadow-lg transition-all"
            variant="outline"
          >
            ส่งข้อเสนอแนะอีกครั้ง
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background/50 py-12 px-4 relative overflow-hidden">
      <BackgroundDecorations />

      <div className="max-w-xl mx-auto relative z-10">
        <div className="text-center mb-12 space-y-3">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">Feedback</h1>
          <p className="text-lg text-muted-foreground font-medium">เสียงของคุณสำคัญสำหรับเรา</p>
        </div>

        <div className="bg-card/40 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl p-6 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Feedback Type Selection */}
            <div className="space-y-4">
              <Label className="text-base font-semibold text-foreground/80 ml-1">เรื่องที่คุณต้องการแจ้ง</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {feedbackTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.type === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type.id })}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300 group relative overflow-hidden",
                        isSelected
                          ? `border-${type.color.split('-')[1]}-200 bg-${type.color.split('-')[1]}-50/50 shadow-sm`
                          : "border-transparent bg-muted/30 hover:bg-muted/50 hover:scale-[1.02]"
                      )}
                    >
                      <div className={cn(
                        "p-2.5 rounded-xl transition-colors",
                        isSelected ? "bg-white shadow-sm" : "bg-background/50 group-hover:bg-white"
                      )}>
                        <Icon className={cn("h-5 w-5", type.color)} />
                      </div>
                      <span className={cn("font-medium", isSelected ? "text-foreground" : "text-muted-foreground")}>
                        {type.label}
                      </span>
                      {isSelected && (
                        <div className={cn("absolute inset-0 opacity-10 pointer-events-none", type.bg)} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rating Section */}
            {formData.type === 'general' && (
              <div className="space-y-4 text-center py-4 bg-muted/20 rounded-2xl animate-in slide-in-from-top-2 fade-in duration-300">
                <Label className="text-base font-semibold text-foreground/80 block mb-2">ความพึงพอใจโดยรวม</Label>
                <div className="flex justify-center gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="transition-transform hover:scale-110 focus:outline-none group"
                    >
                      <Star
                        className={cn(
                          "h-10 w-10 transition-all duration-300",
                          star <= formData.rating
                            ? "fill-yellow-400 text-yellow-400 drop-shadow-sm"
                            : "text-muted-foreground/20 group-hover:text-yellow-400/40"
                        )}
                      />
                    </button>
                  ))}
                </div>
                <div className="h-6 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground transition-all">
                  {formData.rating === 5 && <><Smile className="w-4 h-4 text-green-500" /> ยอดเยี่ยมมาก!</>}
                  {formData.rating === 4 && <><Smile className="w-4 h-4 text-blue-500" /> ดีมากเลย</>}
                  {formData.rating === 3 && <><Meh className="w-4 h-4 text-yellow-500" /> ปานกลาง</>}
                  {formData.rating === 2 && <><Frown className="w-4 h-4 text-orange-500" /> พอใช้ได้</>}
                  {formData.rating === 1 && <><Frown className="w-4 h-4 text-red-500" /> ต้องปรับปรุง</>}
                </div>
              </div>
            )}

            {/* Input Fields */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold text-foreground/80 ml-1">หัวข้อ</Label>
                <Input
                  id="title"
                  placeholder="เช่น ใช้งานยาก, อยากได้ฟีเจอร์เพิ่ม..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="h-12 rounded-xl bg-muted/30 border-transparent focus:bg-background focus:border-primary/20 transition-all px-4"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-base font-semibold text-foreground/80 ml-1">รายละเอียด</Label>
                <Textarea
                  id="message"
                  placeholder="เล่าให้เราฟังหน่อย..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={5}
                  className="rounded-xl bg-muted/30 border-transparent focus:bg-background focus:border-primary/20 transition-all resize-none p-4"
                />
              </div>

              <div className="pt-2">
                <div className="flex items-center space-x-3 mb-4 p-3 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setFormData({ ...formData, allowContact: !formData.allowContact })}>
                  <Checkbox
                    id="allowContact"
                    checked={formData.allowContact}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, allowContact: checked as boolean })
                    }
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label htmlFor="allowContact" className="text-sm font-medium cursor-pointer text-muted-foreground">
                    อนุญาตให้ทีมงานติดต่อกลับ (เพื่อสอบถามเพิ่มเติม)
                  </Label>
                </div>

                {formData.allowContact && (
                  <div className="animate-in slide-in-from-top-2 fade-in duration-300 pl-2">
                    <Input
                      id="email"
                      type="email"
                      placeholder="อีเมลของคุณ"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-11 rounded-xl bg-muted/30 border-transparent focus:bg-background focus:border-primary/20 transition-all"
                    />
                  </div>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all bg-gradient-to-r from-primary to-violet-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  กำลังส่ง...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  ส่งข้อเสนอแนะ
                </div>
              )}
            </Button>

          </form>
        </div>
      </div>
    </div>
  );
}