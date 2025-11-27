import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import FeatureReviewDialog from '@/components/FeatureReviewDialog';

interface Feature {
  id: string;
  name: string;
  name_en: string;
  description: string | null;
  description_en: string | null;
  image_url: string | null;
  display_order: number;
  category: string | null;
}

interface Category {
  id: string;
  name: string;
  name_en: string;
  image_url: string | null;
}

interface FeatureRating {
  [featureId: string]: number;
}

export default function AIRealtimePracticePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();

  const STATIC_FEATURES: Feature[] = [
    {
      id: 'ai-listening',
      name: 'AI Listening',
      name_en: 'AI Listening',
      description: 'ฝึกฝนทักษะการฟังกับ AI',
      description_en: 'Practice listening skills with AI',
      image_url: null,
      display_order: 1,
      category: 'practice'
    },
    {
      id: 'ai-speaking',
      name: 'AI Speaking',
      name_en: 'AI Speaking',
      description: 'ฝึกฝนทักษะการพูดกับ AI',
      description_en: 'Practice speaking skills with AI',
      image_url: null,
      display_order: 2,
      category: 'practice'
    },
    {
      id: 'ai-reading',
      name: 'AI Reading',
      name_en: 'AI Reading',
      description: 'ฝึกฝนทักษะการอ่านกับ AI',
      description_en: 'Practice reading skills with AI',
      image_url: null,
      display_order: 3,
      category: 'practice'
    },
    {
      id: 'ai-writing',
      name: 'AI Writing',
      name_en: 'AI Writing',
      description: 'ฝึกฝนทักษะการเขียนกับ AI',
      description_en: 'Practice writing skills with AI',
      image_url: null,
      display_order: 4,
      category: 'practice'
    }
  ];

  const [features] = useState<Feature[]>(STATIC_FEATURES);
  const [existingReviews, setExistingReviews] = useState<FeatureRating>({});
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
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
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleFeatureClick = (feature: Feature) => {
    if (feature.id === 'ai-listening') {
      navigate('/ai-listening-guide');
      return;
    }
    setSelectedFeature(feature);
    setDialogOpen(true);
  };

  const handleReviewSubmitted = () => {
    fetchReviews();
  };

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
            <Card
              key={feature.id}
              className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => handleFeatureClick(feature)}
            >
              {/* Feature Image */}
              <div className="aspect-video bg-gradient-subtle relative overflow-hidden">
                {feature.image_url ? (
                  <img
                    src={feature.image_url}
                    alt={language === 'th' ? feature.name : feature.name_en}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <span className="text-5xl">✨</span>
                  </div>
                )}
              </div>

              {/* Feature Title */}
              <div className="p-4">
                <h3 className="font-semibold text-lg text-center group-hover:text-primary transition-colors">
                  {language === 'th' ? feature.name : feature.name_en}
                </h3>
              </div>
            </Card>
          ))}
        </div>

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

      {/* Feature Review Dialog */}
      {selectedFeature && (
        <FeatureReviewDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          feature={selectedFeature}
          existingRating={existingReviews[selectedFeature.id]}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
}
