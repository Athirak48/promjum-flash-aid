import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { MessageSquare, Send, Star, Lightbulb, Bug, Heart, CheckCircle2 } from 'lucide-react';
import BackgroundDecorations from '@/components/BackgroundDecorations';

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
    { id: 'general', label: 'ทั่วไป', icon: MessageSquare, description: 'ความคิดเห็นทั่วไป' },
    { id: 'feature', label: 'ฟีเจอร์', icon: Lightbulb, description: 'เสนอแนะฟีเจอร์ใหม่' },
    { id: 'bug', label: 'ปัญหา', icon: Bug, description: 'รายงานข้อผิดพลาด' },
    { id: 'compliment', label: 'ชื่นชม', icon: Heart, description: 'ส่งกำลังใจให้ทีมงาน' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.message.trim()) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        description: "หัวข้อและข้อความเป็นช่องที่จำเป็นต้องกรอก",
        variant: "destructive",
      });
      return;
    }

    if (formData.type === 'general' && formData.rating === 0) {
      toast({
        title: "กรุณาให้คะแนน",
        description: "โปรดเลือกคะแนนความพึงพอใจ",
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
        title: "ส่งข้อเสนอแนะสำเร็จ",
        description: "ขอบคุณสำหรับความคิดเห็นของคุณ",
      });

    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งข้อเสนอแนะได้ กรุณาลองใหม่อีกครั้ง",
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
        <div className="max-w-md w-full text-center space-y-6 relative z-10 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">ขอบคุณครับ!</h2>
          <p className="text-muted-foreground text-lg">
            เราได้รับข้อเสนอแนะของคุณแล้ว <br />
            ความคิดเห็นของคุณช่วยให้ Promjum ดีขึ้น
          </p>
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
            className="mt-8 min-w-[200px]"
            variant="outline"
          >
            ส่งข้อเสนอแนะเพิ่มเติม
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 relative overflow-hidden">
      <BackgroundDecorations />

      <div className="max-w-2xl mx-auto relative z-10">
        <div className="text-center mb-10 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Feedback</h1>
          <p className="text-muted-foreground">เสียงของคุณสำคัญสำหรับเรา</p>
        </div>

        <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Feedback Type Selection */}
              <div className="space-y-4">
                <Label className="text-base font-medium">เรื่องที่คุณต้องการแจ้ง</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {feedbackTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = formData.type === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: type.id })}
                        className={`
                          flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200
                          ${isSelected
                            ? 'border-primary bg-primary/5 text-primary scale-105 shadow-sm'
                            : 'border-muted bg-background hover:border-primary/30 hover:bg-accent/50 text-muted-foreground'
                          }
                        `}
                      >
                        <Icon className={`h-6 w-6 mb-2 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="text-sm font-medium">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rating Section */}
              {formData.type === 'general' && (
                <div className="space-y-4 text-center py-2 animate-in slide-in-from-top-2 fade-in duration-300">
                  <Label className="text-base font-medium block mb-3">ความพึงพอใจโดยรวม</Label>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star
                          className={`h-8 w-8 transition-colors duration-200 ${star <= formData.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground/30 hover:text-yellow-400/50'
                            }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground h-5">
                    {formData.rating === 5 && 'ยอดเยี่ยม!'}
                    {formData.rating === 4 && 'ดีมาก'}
                    {formData.rating === 3 && 'ปานกลาง'}
                    {formData.rating === 2 && 'พอใช้'}
                    {formData.rating === 1 && 'ต้องปรับปรุง'}
                  </p>
                </div>
              )}

              {/* Input Fields */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="title">หัวข้อ</Label>
                  <Input
                    id="title"
                    placeholder="เช่น ใช้งานยาก, อยากได้ฟีเจอร์เพิ่ม..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">รายละเอียด</Label>
                  <Textarea
                    id="message"
                    placeholder="เล่าให้เราฟังหน่อย..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={5}
                    className="bg-background/50 resize-none"
                  />
                </div>

                <div className="pt-2">
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="allowContact"
                      checked={formData.allowContact}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, allowContact: checked as boolean })
                      }
                    />
                    <Label htmlFor="allowContact" className="text-sm font-normal cursor-pointer">
                      อนุญาตให้ทีมงานติดต่อกลับ
                    </Label>
                  </div>

                  {formData.allowContact && (
                    <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                      <Input
                        id="email"
                        type="email"
                        placeholder="อีเมลของคุณ"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-background/50"
                      />
                    </div>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    กำลังส่ง...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    ส่งข้อเสนอแนะ
                  </div>
                )}
              </Button>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}