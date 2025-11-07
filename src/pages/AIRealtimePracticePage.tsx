import { useState, useEffect } from 'react';
import { ArrowLeft, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
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
  display_order: number;
}

interface FeatureRating {
  [featureId: string]: number;
}

export default function AIRealtimePracticePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [ratings, setRatings] = useState<FeatureRating>({});
  const [existingReviews, setExistingReviews] = useState<FeatureRating>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      
      // Fetch features
      const { data: featuresData, error: featuresError } = await supabase
        .from('features')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (featuresError) throw featuresError;

      // Fetch user's existing reviews
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('feature_reviews')
          .select('feature_id, rating')
          .eq('user_id', user.id);

        if (reviewsError) throw reviewsError;

        const reviewsMap: FeatureRating = {};
        reviewsData?.forEach(review => {
          reviewsMap[review.feature_id] = review.rating;
        });
        
        setExistingReviews(reviewsMap);
        setRatings(reviewsMap);
      }

      setFeatures(featuresData || []);
    } catch (error) {
      console.error('Error fetching features:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดฟีเจอร์ได้",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
          title: "กรุณาเข้าสู่ระบบ",
          description: "คุณต้องเข้าสู่ระบบก่อนส่งรีวิว",
          variant: "destructive"
        });
        return;
      }

      // Prepare reviews data
      const reviewsToSubmit = Object.entries(ratings).map(([featureId, rating]) => ({
        user_id: user.id,
        feature_id: featureId,
        rating
      }));

      // Upsert reviews
      const { error } = await supabase
        .from('feature_reviews')
        .upsert(reviewsToSubmit, { 
          onConflict: 'user_id,feature_id',
          ignoreDuplicates: false 
        });

      if (error) throw error;

      toast({
        title: "ส่งรีวิวสำเร็จ",
        description: "ขอบคุณสำหรับการให้คะแนน",
      });

      setExistingReviews(ratings);
    } catch (error) {
      console.error('Error submitting reviews:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งรีวิวได้ กรุณาลองใหม่",
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {language === 'th' ? 'รีวิวฟีเจอร์ AI Practice' : 'Review AI Practice Features'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {language === 'th' 
                  ? 'ให้คะแนนฟีเจอร์ที่คุณได้ใช้งาน' 
                  : 'Rate the features you have used'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card key={feature.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1">
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
            </Card>
          ))}
        </div>

        {/* Submit Button */}
        {features.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Button 
              size="lg"
              onClick={handleSubmitReviews}
              disabled={submitting || Object.keys(ratings).length === 0}
              className="min-w-[200px]"
            >
              {submitting 
                ? (language === 'th' ? 'กำลังส่ง...' : 'Submitting...') 
                : (language === 'th' ? 'ยืนยันการส่งรีวิว' : 'Submit Review')}
            </Button>
          </div>
        )}

        {/* Empty State */}
        {features.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {language === 'th' 
                ? 'ยังไม่มีฟีเจอร์ที่พร้อมให้รีวิว' 
                : 'No features available for review yet'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
