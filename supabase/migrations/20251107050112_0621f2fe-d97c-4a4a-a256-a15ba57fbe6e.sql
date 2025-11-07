-- Add category field to features table
ALTER TABLE public.features 
ADD COLUMN IF NOT EXISTS category TEXT;

-- Create index for category lookups
CREATE INDEX IF NOT EXISTS idx_features_category ON public.features(category);

-- Update existing features to have a default category
UPDATE public.features 
SET category = 'general' 
WHERE category IS NULL;

-- Add some sample categories
INSERT INTO public.features (name, name_en, description, description_en, category, is_active, display_order)
VALUES 
  ('Speaking Practice', 'Speaking Practice', 'ฝึกการพูดภาษาอังกฤษ', 'Practice English speaking skills', 'speaking', true, 1),
  ('Listening Practice', 'Listening Practice', 'ฝึกการฟังภาษาอังกฤษ', 'Practice English listening skills', 'listening', true, 2),
  ('Reading Practice', 'Reading Practice', 'ฝึกการอ่านภาษาอังกฤษ', 'Practice English reading skills', 'reading', true, 3),
  ('Writing Practice', 'Writing Practice', 'ฝึกการเขียนภาษาอังกฤษ', 'Practice English writing skills', 'writing', true, 4)
ON CONFLICT (id) DO NOTHING;