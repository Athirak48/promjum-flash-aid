-- Drop the existing check constraint
ALTER TABLE public.user_flashcard_sets 
DROP CONSTRAINT user_flashcard_sets_source_check;

-- Add new check constraint with community sources
ALTER TABLE public.user_flashcard_sets 
ADD CONSTRAINT user_flashcard_sets_source_check 
CHECK (source = ANY (ARRAY['created'::text, 'uploaded'::text, 'marketcard'::text, 'community'::text, 'community_subdeck'::text]));