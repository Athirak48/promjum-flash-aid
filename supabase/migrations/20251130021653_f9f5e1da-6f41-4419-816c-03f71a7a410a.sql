-- Add user_flashcard_id column to support user-created flashcards
ALTER TABLE public.user_flashcard_progress 
ADD COLUMN IF NOT EXISTS user_flashcard_id uuid REFERENCES public.user_flashcards(id) ON DELETE CASCADE;

-- Make flashcard_id nullable since we can have either system or user flashcards
ALTER TABLE public.user_flashcard_progress 
ALTER COLUMN flashcard_id DROP NOT NULL;

-- Add constraint to ensure at least one flashcard reference exists
ALTER TABLE public.user_flashcard_progress
ADD CONSTRAINT check_flashcard_reference 
CHECK (flashcard_id IS NOT NULL OR user_flashcard_id IS NOT NULL);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_flashcard_progress_user_flashcard_id 
ON public.user_flashcard_progress(user_flashcard_id);

-- Create unique constraint for user + user_flashcard combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_flashcard_progress_user_user_flashcard 
ON public.user_flashcard_progress(user_id, user_flashcard_id) 
WHERE user_flashcard_id IS NOT NULL;