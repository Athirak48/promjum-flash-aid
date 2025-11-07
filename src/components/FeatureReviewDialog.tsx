import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface Feature {
  id: string;
  name: string;
  name_en: string;
  description: string | null;
  description_en: string | null;
  image_url: string | null;
}

interface FeatureRating {
  [featureId: string]: number;
}

interface FeatureReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: Feature;
  existingRating: number | undefined;
  onReviewSubmitted: () => void;
}

export default function FeatureReviewDialog({
  open,
  onOpenChange,
  feature,
  existingRating,
  onReviewSubmitted,
}: FeatureReviewDialogProps) {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [rating, setRating] = useState<number>(existingRating || 0);
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  const handleSubmitReview = async () => {
    try {
      setSubmitting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: language === 'th' ? "กรุณาเข้าสู่ระบบ" : "Please login",
          description: language === 'th' ? "คุณต้องเข้าสู่ระบบก่อนส่งรีวิว" : "You need to login to submit reviews",
          variant: "destructive"
        });
        return;
      }

      if (rating === 0) {
        toast({
          title: language === 'th' ? "กรุณาให้คะแนน" : "Please rate",
          description: language === 'th' ? "กรุณาให้คะแนนก่อนส่งรีวิว" : "Please rate before submitting",
          variant: "destructive"
        });
        return;
      }

      // Upsert review
      const { error } = await supabase
        .from('feature_reviews')
        .upsert({
          user_id: user.id,
          feature_id: feature.id,
          rating,
          comment: comment || null
        }, { 
          onConflict: 'user_id,feature_id',
          ignoreDuplicates: false 
        });

      if (error) throw error;

      toast({
        title: language === 'th' ? "ส่งรีวิวสำเร็จ" : "Review submitted",
        description: language === 'th' ? "ขอบคุณสำหรับการให้คะแนน" : "Thank you for your rating",
      });

      onReviewSubmitted();
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: language === 'th' ? "เกิดข้อผิดพลาด" : "Error",
        description: language === 'th' ? "ไม่สามารถส่งรีวิวได้ กรุณาลองใหม่" : "Failed to submit review. Please try again",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingLabel = (rating: number) => {
    const labels: { [key: number]: { th: string; en: string } } = {
      1: { th: 'แย่มาก', en: 'Very Bad' },
      2: { th: 'แย่', en: 'Bad' },
      3: { th: 'พอใช้', en: 'Fair' },
      4: { th: 'ดี', en: 'Good' },
      5: { th: 'ดีมาก', en: 'Excellent' }
    };
    return language === 'th' ? labels[rating].th : labels[rating].en;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {/* Feature Image - Full Width */}
        <div className="aspect-video bg-gradient-subtle relative overflow-hidden rounded-lg -mx-6 -mt-6">
          {feature.image_url ? (
            <img 
              src={feature.image_url} 
              alt={language === 'th' ? feature.name : feature.name_en}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10">
              <span className="text-6xl">✨</span>
            </div>
          )}
        </div>

        {/* Rating Section */}
        <div className="space-y-6 pt-6">
          {/* Star Rating */}
          <div className="space-y-3">
            <p className="text-center text-lg font-medium">
              {language === 'th' ? 'ให้คะแนน' : 'Rate this feature'}
            </p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRatingChange(star)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`h-10 w-10 ${
                      rating >= star
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
            
            {/* Rating Label */}
            {rating > 0 && (
              <p className="text-center text-lg font-semibold text-primary">
                {getRatingLabel(rating)}
              </p>
            )}
          </div>

          {/* Comment/Feedback Section */}
          <div className="space-y-2">
            <Label htmlFor="comment">
              {language === 'th' ? 'คำแนะนำเพิ่มเติม (ถ้ามี)' : 'Additional Feedback (Optional)'}
            </Label>
            <Textarea
              id="comment"
              placeholder={language === 'th' ? 'แชร์ความคิดเห็นของคุณ...' : 'Share your thoughts...'}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Submit Button */}
          <Button
            size="lg"
            onClick={handleSubmitReview}
            disabled={submitting || rating === 0}
            className="w-full"
          >
            {submitting 
              ? (language === 'th' ? 'กำลังส่ง...' : 'Submitting...') 
              : (language === 'th' ? 'ยืนยันการให้คะแนน' : 'Submit Rating')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
