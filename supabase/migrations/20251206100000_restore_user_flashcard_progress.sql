-- Restore user_flashcard_progress table which was deleted
CREATE TABLE IF NOT EXISTS public.user_flashcard_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    flashcard_id UUID REFERENCES public.flashcards(id) ON DELETE CASCADE,
    user_flashcard_id UUID REFERENCES public.user_flashcards(id) ON DELETE CASCADE,
    srs_level INTEGER DEFAULT 0,
    srs_score INTEGER DEFAULT 0,
    easiness_factor NUMERIC DEFAULT 2.5,
    interval_days INTEGER DEFAULT 1,
    next_review_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    times_reviewed INTEGER DEFAULT 0,
    times_correct INTEGER DEFAULT 0,
    last_review_score INTEGER,
    is_starred BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT check_flashcard_reference CHECK (flashcard_id IS NOT NULL OR user_flashcard_id IS NOT NULL),
    UNIQUE (user_id, flashcard_id)
);

-- Create indexes for performance and constraints
CREATE INDEX IF NOT EXISTS idx_user_flashcard_progress_next_review ON public.user_flashcard_progress(user_id, next_review_date);
CREATE INDEX IF NOT EXISTS idx_user_flashcard_progress_user_flashcard_id ON public.user_flashcard_progress(user_flashcard_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_flashcard_progress_user_user_flashcard ON public.user_flashcard_progress(user_id, user_flashcard_id) WHERE user_flashcard_id IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.user_flashcard_progress ENABLE ROW LEVEL SECURITY;

-- Re-create policies
DROP POLICY IF EXISTS "Users can manage their own progress" ON public.user_flashcard_progress;

CREATE POLICY "Users can manage their own progress"
ON public.user_flashcard_progress FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Re-create triggers for updated_at
DROP TRIGGER IF EXISTS update_user_flashcard_progress_updated_at ON public.user_flashcard_progress;

CREATE TRIGGER update_user_flashcard_progress_updated_at
BEFORE UPDATE ON public.user_flashcard_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
