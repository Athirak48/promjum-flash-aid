-- Create decks table (Main categories)
CREATE TABLE public.decks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description TEXT,
  description_en TEXT,
  icon TEXT NOT NULL DEFAULT 'BookOpen',
  category TEXT NOT NULL,
  total_flashcards INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sub_decks table (Sub-categories within each deck)
CREATE TABLE public.sub_decks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deck_id UUID NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description TEXT,
  description_en TEXT,
  flashcard_count INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  difficulty_level TEXT DEFAULT 'beginner',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_deck_progress table
CREATE TABLE public.user_deck_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  deck_id UUID NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, deck_id)
);

-- Create user_subdeck_progress table
CREATE TABLE public.user_subdeck_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subdeck_id UUID NOT NULL REFERENCES public.sub_decks(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT false,
  cards_learned INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, subdeck_id)
);

-- Link flashcards to sub_decks
ALTER TABLE public.flashcards 
ADD COLUMN subdeck_id UUID REFERENCES public.sub_decks(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_deck_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subdeck_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for decks (everyone can view)
CREATE POLICY "Anyone can view decks"
ON public.decks FOR SELECT
USING (true);

-- RLS Policies for sub_decks (everyone can view)
CREATE POLICY "Anyone can view sub_decks"
ON public.sub_decks FOR SELECT
USING (true);

-- RLS Policies for user_deck_progress
CREATE POLICY "Users can view their own deck progress"
ON public.user_deck_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own deck progress"
ON public.user_deck_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deck progress"
ON public.user_deck_progress FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for user_subdeck_progress
CREATE POLICY "Users can view their own subdeck progress"
ON public.user_subdeck_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subdeck progress"
ON public.user_subdeck_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subdeck progress"
ON public.user_subdeck_progress FOR UPDATE
USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_decks_updated_at
BEFORE UPDATE ON public.decks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sub_decks_updated_at
BEFORE UPDATE ON public.sub_decks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_deck_progress_updated_at
BEFORE UPDATE ON public.user_deck_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subdeck_progress_updated_at
BEFORE UPDATE ON public.user_subdeck_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample decks
INSERT INTO public.decks (name, name_en, description, description_en, icon, category, total_flashcards, is_premium) VALUES
('ชีวิตประจำวัน', 'Daily Life', 'เรียนรู้คำศัพท์และประโยคที่ใช้บ่อยในชีวิตประจำวัน', 'Learn common vocabulary and phrases for everyday life', 'Home', 'daily', 500, false),
('ท่องเที่ยว', 'Travel', 'คำศัพท์และประโยคสำหรับการเดินทางและท่องเที่ยว', 'Vocabulary and phrases for traveling', 'Plane', 'travel', 400, false),
('งาน', 'Work', 'คำศัพท์ทางธุรกิจและการทำงาน', 'Business and work-related vocabulary', 'Briefcase', 'work', 600, true),
('การสอบ', 'Exams', 'เตรียมสอบด้วยคำศัพท์และไวยากรณ์', 'Prepare for exams with vocabulary and grammar', 'GraduationCap', 'exam', 800, true);

-- Insert sample sub_decks for Daily Life
INSERT INTO public.sub_decks (deck_id, name, name_en, description, description_en, flashcard_count, is_free, display_order, difficulty_level) 
SELECT id, 'ทักทาย', 'Greetings', 'คำทักทายพื้นฐาน', 'Basic greetings', 50, true, 1, 'beginner' FROM public.decks WHERE category = 'daily' LIMIT 1;

INSERT INTO public.sub_decks (deck_id, name, name_en, description, description_en, flashcard_count, is_free, display_order, difficulty_level) 
SELECT id, 'ร้านอาหาร', 'Restaurant', 'คำศัพท์ในร้านอาหาร', 'Restaurant vocabulary', 100, true, 2, 'beginner' FROM public.decks WHERE category = 'daily' LIMIT 1;

INSERT INTO public.sub_decks (deck_id, name, name_en, description, description_en, flashcard_count, is_free, display_order, difficulty_level) 
SELECT id, 'ซื้อของ', 'Shopping', 'คำศัพท์การซื้อของ', 'Shopping vocabulary', 150, false, 3, 'intermediate' FROM public.decks WHERE category = 'daily' LIMIT 1;

-- Insert sample sub_decks for Travel
INSERT INTO public.sub_decks (deck_id, name, name_en, description, description_en, flashcard_count, is_free, display_order, difficulty_level) 
SELECT id, 'สนามบิน', 'Airport', 'คำศัพท์ในสนามบิน', 'Airport vocabulary', 80, true, 1, 'beginner' FROM public.decks WHERE category = 'travel' LIMIT 1;

INSERT INTO public.sub_decks (deck_id, name, name_en, description, description_en, flashcard_count, is_free, display_order, difficulty_level) 
SELECT id, 'โรงแรม', 'Hotel', 'คำศัพท์เกี่ยวกับโรงแรม', 'Hotel vocabulary', 100, false, 2, 'intermediate' FROM public.decks WHERE category = 'travel' LIMIT 1;