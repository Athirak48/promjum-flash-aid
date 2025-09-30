import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { MessageSquare, Send, Star, Lightbulb, Bug, Heart } from 'lucide-react';
import BackgroundDecorations from '@/components/BackgroundDecorations';

export default function FeedbackPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: 'general',
    title: '',
    message: '',
    rating: '',
    email: user?.email || '',
    allowContact: false
  });

  const feedbackTypes = [
    { id: 'general', label: 'ความคิดเห็นทั่วไป', icon: MessageSquare },
    { id: 'feature', label: 'เสนอฟีเจอร์ใหม่', icon: Lightbulb },
    { id: 'bug', label: 'รายงานปัญหา', icon: Bug },
    { id: 'compliment', label: 'ชื่นชม/ขอบคุณ', icon: Heart }
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

    setIsSubmitting(true);
    
    try {
      // Simulate API call - replace with real Supabase call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "ส่งข้อเสนอแนะสำเร็จแล้ว",
        description: "ขอบคุณสำหรับข้อเสนอแนะ เราจะนำไปพัฒนาระบบให้ดีขึ้น",
      });
      
      // Reset form
      setFormData({
        type: 'general',
        title: '',
        message: '',
        rating: '',
        email: user?.email || '',
        allowContact: false
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

  const selectedType = feedbackTypes.find(type => type.id === formData.type);
  const TypeIcon = selectedType?.icon || MessageSquare;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8 relative overflow-hidden">
      <BackgroundDecorations />
      <div className="container max-w-2xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">ข้อเสนอแนะ</h1>
          <p className="text-muted-foreground">
            ช่วยเราพัฒนา Promjum ให้ดีขึ้น ด้วยความคิดเห็นและข้อเสนอแนะของคุณ
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TypeIcon className="h-5 w-5" />
              แบบฟอร์มข้อเสนอแนะ
            </CardTitle>
            <CardDescription>
              ข้อมูลทั้งหมดจะถูกส่งไปยังทีมผู้พัฒนา เพื่อนำไปใช้ในการพัฒนาระบบ
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Feedback Type */}
              <div className="space-y-3">
                <Label>ประเภทข้อเสนอแนะ</Label>
                <RadioGroup
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  {feedbackTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <div key={type.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={type.id} id={type.id} />
                        <Label 
                          htmlFor={type.id} 
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Icon className="h-4 w-4" />
                          {type.label}
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>

              {/* Rating (for general feedback) */}
              {formData.type === 'general' && (
                <div className="space-y-3">
                  <Label>คะแนนความพึงพอใจโดยรวม</Label>
                  <RadioGroup
                    value={formData.rating}
                    onValueChange={(value) => setFormData({ ...formData, rating: value })}
                  >
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center space-x-2">
                        <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                        <Label 
                          htmlFor={`rating-${rating}`} 
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span>
                            {rating === 5 && 'ยอดเยี่ยม'}
                            {rating === 4 && 'ดีมาก'}
                            {rating === 3 && 'ปานกลาง'}
                            {rating === 2 && 'ต้องปรับปรุง'}
                            {rating === 1 && 'ไม่พอใจ'}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">หัวข้อ *</Label>
                <Input
                  id="title"
                  placeholder="สรุปสั้นๆ เกี่ยวกับข้อเสนอแนะของคุณ"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">รายละเอียด *</Label>
                <Textarea
                  id="message"
                  placeholder="อธิบายรายละเอียดเพิ่มเติม..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={6}
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">อีเมลสำหรับติดต่อกลับ</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {/* Allow Contact */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowContact"
                  checked={formData.allowContact}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, allowContact: checked as boolean })
                  }
                />
                <Label htmlFor="allowContact" className="text-sm">
                  อนุญาตให้ทีมพัฒนาติดต่อกลับเพื่อขอรายละเอียดเพิ่มเติม
                </Label>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
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
            </form>
          </CardContent>
        </Card>

        {/* Thank You Message */}
        <div className="mt-8 text-center">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <Heart className="h-8 w-8 mx-auto text-primary mb-3" />
              <h3 className="font-semibold mb-2">ขอบคุณสำหรับความร่วมมือ</h3>
              <p className="text-sm text-muted-foreground">
                ข้อเสนอแนะของคุณมีค่ามากสำหรับการพัฒนา Promjum ให้ดีขึ้น
                <br />
                เราจะนำไปพิจารณาและปรับปรุงระบบอย่างต่อเนื่อง
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}