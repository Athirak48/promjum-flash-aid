-- ============================================
-- 1. Create app_role enum for user roles
-- ============================================
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'content_editor', 'user');

-- ============================================
-- 2. Create user_roles table (Security: avoid storing roles in profiles)
-- ============================================
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID,
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 3. Add user preferences for TTS/STT settings
-- ============================================
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS tts_voice TEXT DEFAULT 'en-US-male-01',
ADD COLUMN IF NOT EXISTS tts_accent TEXT DEFAULT 'en-US',
ADD COLUMN IF NOT EXISTS tts_speed NUMERIC DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS learner_accent TEXT DEFAULT 'en-TH',
ADD COLUMN IF NOT EXISTS target_level TEXT DEFAULT 'B1',
ADD COLUMN IF NOT EXISTS shadowing_speed NUMERIC DEFAULT 0.9,
ADD COLUMN IF NOT EXISTS auto_play_audio BOOLEAN DEFAULT true;

-- ============================================
-- 4. Enhance flashcards table with detailed fields
-- ============================================
ALTER TABLE public.flashcards
ADD COLUMN IF NOT EXISTS word TEXT,
ADD COLUMN IF NOT EXISTS part_of_speech TEXT,
ADD COLUMN IF NOT EXISTS meaning_en TEXT,
ADD COLUMN IF NOT EXISTS meaning_th TEXT,
ADD COLUMN IF NOT EXISTS pronunciation_ipa TEXT,
ADD COLUMN IF NOT EXISTS example_sentence_en TEXT,
ADD COLUMN IF NOT EXISTS example_sentence_th TEXT,
ADD COLUMN IF NOT EXISTS synonyms TEXT[], -- Array of synonyms
ADD COLUMN IF NOT EXISTS tags TEXT[], -- Array of tags
ADD COLUMN IF NOT EXISTS tts_voice TEXT DEFAULT 'en-US-male-01',
ADD COLUMN IF NOT EXISTS audio_url TEXT, -- Pre-generated TTS audio
ADD COLUMN IF NOT EXISTS audio_url_slow TEXT, -- Slow speed version
ADD COLUMN IF NOT EXISTS difficulty_score INTEGER DEFAULT 3 CHECK (difficulty_score >= 1 AND difficulty_score <= 5),
ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'B1', -- A1, A2, B1, B2, C1, C2
ADD COLUMN IF NOT EXISTS language_variant TEXT DEFAULT 'US', -- US, UK, AU
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

-- Create index for searching
CREATE INDEX IF NOT EXISTS idx_flashcards_word ON public.flashcards(word);
CREATE INDEX IF NOT EXISTS idx_flashcards_tags ON public.flashcards USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_flashcards_level ON public.flashcards(level);
CREATE INDEX IF NOT EXISTS idx_flashcards_published ON public.flashcards(is_published);

-- ============================================
-- 5. Enhance decks table with metadata
-- ============================================
ALTER TABLE public.decks
ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'B1',
ADD COLUMN IF NOT EXISTS language_variant TEXT DEFAULT 'US',
ADD COLUMN IF NOT EXISTS default_tts_voice TEXT DEFAULT 'en-US-male-01',
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS popularity_score INTEGER DEFAULT 0;

-- ============================================
-- 6. Enhance sub_decks table
-- ============================================
ALTER TABLE public.sub_decks
ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'B1',
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS estimated_duration_minutes INTEGER DEFAULT 10;

-- ============================================
-- 7. Create practice_sessions table
-- ============================================
CREATE TABLE public.practice_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    deck_id UUID REFERENCES public.decks(id) ON DELETE CASCADE,
    subdeck_id UUID REFERENCES public.sub_decks(id) ON DELETE CASCADE,
    session_type TEXT NOT NULL, -- 'flashcard', 'shadowing', 'conversation', 'quiz'
    session_mode TEXT NOT NULL, -- 'personal_library', 'randomized'
    duration_minutes INTEGER,
    words_reviewed INTEGER DEFAULT 0,
    words_learned INTEGER DEFAULT 0,
    pronunciation_avg INTEGER DEFAULT 0,
    grammar_avg INTEGER DEFAULT 0,
    naturalness_avg INTEGER DEFAULT 0,
    xp_gained INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
ON public.practice_sessions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
ON public.practice_sessions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
ON public.practice_sessions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- 8. Create user_flashcard_progress table (SRS tracking)
-- ============================================
CREATE TABLE public.user_flashcard_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    flashcard_id UUID REFERENCES public.flashcards(id) ON DELETE CASCADE,
    srs_level INTEGER DEFAULT 0,
    easiness_factor NUMERIC DEFAULT 2.5,
    interval_days INTEGER DEFAULT 1,
    next_review_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    times_reviewed INTEGER DEFAULT 0,
    times_correct INTEGER DEFAULT 0,
    last_review_score INTEGER, -- 1-5 scale
    is_starred BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, flashcard_id)
);

ALTER TABLE public.user_flashcard_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own progress"
ON public.user_flashcard_progress FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Index for next review query
CREATE INDEX idx_user_flashcard_progress_next_review 
ON public.user_flashcard_progress(user_id, next_review_date);

-- ============================================
-- 9. Create user_speaking_attempts table
-- ============================================
CREATE TABLE public.user_speaking_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    session_id UUID REFERENCES public.practice_sessions(id) ON DELETE CASCADE,
    flashcard_id UUID REFERENCES public.flashcards(id) ON DELETE SET NULL,
    target_word TEXT,
    target_sentence TEXT,
    user_transcript TEXT NOT NULL,
    audio_url TEXT,
    pronunciation_score INTEGER,
    grammar_score INTEGER,
    naturalness_score INTEGER,
    corrected_sentence TEXT,
    feedback_text TEXT,
    feedback_th TEXT,
    pronunciation_tips JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_speaking_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own attempts"
ON public.user_speaking_attempts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own attempts"
ON public.user_speaking_attempts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 10. Create user_phrasebook table (saved sentences)
-- ============================================
CREATE TABLE public.user_phrasebook (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    phrase_en TEXT NOT NULL,
    phrase_th TEXT,
    audio_url TEXT,
    source TEXT, -- 'user_generated', 'ai_corrected', 'example_sentence'
    related_words TEXT[],
    tags TEXT[],
    notes TEXT,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_phrasebook ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own phrasebook"
ON public.user_phrasebook FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 11. Create deck_audit_log table (admin tracking)
-- ============================================
CREATE TABLE public.deck_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID REFERENCES public.decks(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- 'created', 'updated', 'published', 'unpublished', 'deleted'
    changed_by UUID NOT NULL,
    changes JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.deck_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
ON public.deck_audit_log FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'));

-- ============================================
-- 12. Create deck_analytics table
-- ============================================
CREATE TABLE public.deck_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID REFERENCES public.decks(id) ON DELETE CASCADE,
    total_users INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    avg_completion_rate NUMERIC DEFAULT 0,
    avg_success_rate NUMERIC DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (deck_id)
);

ALTER TABLE public.deck_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view deck analytics"
ON public.deck_analytics FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "System can update analytics"
ON public.deck_analytics FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 13. Update triggers for updated_at timestamps
-- ============================================
CREATE TRIGGER update_user_flashcard_progress_updated_at
BEFORE UPDATE ON public.user_flashcard_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 14. Update flashcards RLS to allow viewing published cards
-- ============================================
DROP POLICY IF EXISTS "Users can view flashcards from their uploads" ON public.flashcards;

CREATE POLICY "Anyone can view published flashcards"
ON public.flashcards FOR SELECT
TO authenticated
USING (is_published = true OR EXISTS (
  SELECT 1 FROM uploads WHERE uploads.id = flashcards.upload_id AND uploads.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all flashcards"
ON public.flashcards FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'content_editor'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'content_editor'));

-- ============================================
-- 15. Update decks RLS for admin management
-- ============================================
CREATE POLICY "Admins can manage all decks"
ON public.decks FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'content_editor'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'content_editor'));