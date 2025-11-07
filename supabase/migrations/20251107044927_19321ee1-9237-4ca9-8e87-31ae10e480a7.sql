-- Create features table for admin to manage practice features
CREATE TABLE public.features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description TEXT,
  description_en TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create feature_reviews table for users to rate features
CREATE TABLE public.feature_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  feature_id UUID NOT NULL REFERENCES public.features(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, feature_id)
);

-- Enable RLS
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for features
CREATE POLICY "Anyone can view active features"
ON public.features
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage features"
ON public.features
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'content_editor'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'content_editor'::app_role));

-- RLS Policies for feature_reviews
CREATE POLICY "Users can view their own reviews"
ON public.feature_reviews
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reviews"
ON public.feature_reviews
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
ON public.feature_reviews
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_features_updated_at
BEFORE UPDATE ON public.features
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feature_reviews_updated_at
BEFORE UPDATE ON public.feature_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample features
INSERT INTO public.features (name, name_en, description, description_en, image_url, display_order) VALUES
('โหมดพูด', 'Speaking Mode', 'ฝึกพูดภาษาอังกฤษแบบ Real-time', 'Practice speaking English in real-time', 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=400', 1),
('โหมดประโยค', 'Sentence Builder', 'สร้างประโยคจากคำศัพท์', 'Build sentences from vocabulary', 'https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=400', 2),
('โหมดเงาตาม', 'Shadowing Mode', 'ฝึกเลียนเสียงเจ้าของภาษา', 'Shadow native speakers', 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=400', 3),
('โหมดทดสอบ', 'Quiz Mode', 'ทดสอบความรู้ด้วยแบบทดสอบ', 'Test your knowledge with quizzes', 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400', 4);