-- Allow anyone to view flashcards from public community decks
CREATE POLICY "Anyone can view flashcards from public community decks"
ON public.user_flashcards
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_flashcard_sets ufs
    WHERE ufs.id = user_flashcards.flashcard_set_id
    AND ufs.is_public = true
  )
  OR auth.uid() = user_id
);