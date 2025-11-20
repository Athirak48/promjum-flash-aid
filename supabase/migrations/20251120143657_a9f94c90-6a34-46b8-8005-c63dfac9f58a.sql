-- Add srs_score column to user_flashcard_progress table
ALTER TABLE public.user_flashcard_progress
ADD COLUMN srs_score integer DEFAULT 0;