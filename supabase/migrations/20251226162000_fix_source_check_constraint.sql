-- Drop the existing source check constraint if it exists
ALTER TABLE public.user_flashcard_sets 
DROP CONSTRAINT IF EXISTS user_flashcard_sets_source_check;

-- Re-create the constraint with additional allowed values
ALTER TABLE public.user_flashcard_sets
ADD CONSTRAINT user_flashcard_sets_source_check 
CHECK (source IN ('created', 'imported', 'cloned', 'cloned_from_community', 'shared'));

-- Add comment for documentation
COMMENT ON CONSTRAINT user_flashcard_sets_source_check ON public.user_flashcard_sets 
IS 'Allowed source values: created, imported, cloned, cloned_from_community, shared';
