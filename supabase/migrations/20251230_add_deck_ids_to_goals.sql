-- Add deck_ids column to support multiple decks
ALTER TABLE public.study_goals ADD COLUMN IF NOT EXISTS deck_ids JSONB DEFAULT '[]'::jsonb;

-- Comment
COMMENT ON COLUMN public.study_goals.deck_ids IS 'List of deck IDs included in this goal';
