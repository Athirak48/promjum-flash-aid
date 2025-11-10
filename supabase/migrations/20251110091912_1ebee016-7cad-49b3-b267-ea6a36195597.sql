-- Add RLS policy for users to view flashcards in published subdecks
CREATE POLICY "Users can view flashcards in published subdecks"
ON public.flashcards
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.sub_decks
    WHERE sub_decks.id = flashcards.subdeck_id
    AND sub_decks.is_published = true
  )
);