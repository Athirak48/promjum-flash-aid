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
  category: string;
  categoryName: string;
  features: Feature[];
  existingRatings: FeatureRating;
  onReviewSubmitted: () => void;
}

export default function FeatureReviewDialog({
  open,
  onOpenChange,
  category,
  categoryName,
  features,
  existingRatings,
  onReviewSubmitted,
}: FeatureReviewDialogProps) {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [ratings, setRatings] = useState<FeatureRating>(existingRatings);
  const [submitting, setSubmitting] = useState(false);

  const handleRatingChange = (featureId: string, rating: number) => {
    setRatings(prev => ({
      ...prev,
      [featureId]: rating
    }));
  };

  const handleSubmitReviews = async () => {
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

      // Prepare reviews data for features in this category
      const categoryFeatureIds = features.map(f => f.id);
      const reviewsToSubmit = Object.entries(ratings)
        .filter(([featureId]) => categoryFeatureIds.includes(featureId))
        .map(([featureId, rating]) => ({
          user_id: user.id,
          feature_id: featureId,
          rating
        }));

      if (reviewsToSubmit.length === 0) {
        toast({
          title: language === 'th' ? "กรุณาให้คะแนน" : "Please rate",
          description: language === 'th' ? "กรุณาให้คะแนนอย่างน้อย 1 ฟีเจอร์" : "Please rate at least 1 feature",
          variant: "destructive"
        });
        return;
      }

      // Upsert reviews
      const { error } = await supabase
        .from('feature_reviews')
        .upsert(reviewsToSubmit, { 
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
      console.error('Error submitting reviews:', error);
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
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {language === 'th' ? `รีวิว${categoryName}` : `Review ${categoryName}`}
          </DialogTitle>
          <DialogDescription>
            {language === 'th' 
              ? 'ให้คะแนนฟีเจอร์ที่คุณได้ใช้งาน' 
              : 'Rate the features you have used'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {features.map((feature) => (
            <div 
              key={feature.id} 
              className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-card"
            >
              {/* Feature Image */}
              <div className="aspect-video bg-gradient-subtle relative overflow-hidden">
                {feature.image_url ? (
                  <img 
                    src={feature.image_url} 
                    alt={language === 'th' ? feature.name : feature.name_en}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10">
                    <span className="text-4xl">✨</span>
                  </div>
                )}
              </div>

              {/* Feature Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-base mb-1">
                    {language === 'th' ? feature.name : feature.name_en}
                  </h3>
                  {(feature.description || feature.description_en) && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {language === 'th' ? feature.description : feature.description_en}
                    </p>
                  )}
                </div>

                {/* Star Rating */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {language === 'th' ? 'ให้คะแนน:' : 'Rate:'}
                  </p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRatingChange(feature.id, star)}
                        className="transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            (ratings[feature.id] || 0) >= star
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  
                  {/* Rating Label */}
                  {ratings[feature.id] && (
                    <p className="text-sm font-medium text-primary">
                      {getRatingLabel(ratings[feature.id])}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mt-6 pb-2">
          <Button 
            size="lg"
            onClick={handleSubmitReviews}
            disabled={submitting || Object.keys(ratings).filter(id => features.some(f => f.id === id)).length === 0}
            className="min-w-[200px]"
          >
            {submitting 
              ? (language === 'th' ? 'กำลังส่ง...' : 'Submitting...') 
              : (language === 'th' ? 'ยืนยันการส่งรีวิว' : 'Submit Review')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
