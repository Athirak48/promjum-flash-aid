-- Add columns for community deck functionality
ALTER TABLE public.user_flashcard_sets 
ADD COLUMN IF NOT EXISTS parent_deck_id uuid REFERENCES public.user_flashcard_sets(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS tags text[],
ADD COLUMN IF NOT EXISTS clone_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_flashcard_sets_parent_deck_id ON public.user_flashcard_sets(parent_deck_id);
CREATE INDEX IF NOT EXISTS idx_user_flashcard_sets_is_public ON public.user_flashcard_sets(is_public);
CREATE INDEX IF NOT EXISTS idx_user_flashcard_sets_source ON public.user_flashcard_sets(source);

-- Update RLS policy to allow viewing public community decks
DROP POLICY IF EXISTS "Anyone can view public community decks" ON public.user_flashcard_sets;
CREATE POLICY "Anyone can view public community decks"
ON public.user_flashcard_sets
FOR SELECT
TO authenticated
USING (is_public = true OR user_id = auth.uid());