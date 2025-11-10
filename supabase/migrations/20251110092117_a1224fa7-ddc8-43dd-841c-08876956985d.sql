-- Fix RLS policies to check cascade publishing (deck AND subdeck must be published)

-- Drop and recreate sub_decks policy to check parent deck
DROP POLICY IF EXISTS "Anyone can view published sub_decks" ON public.sub_decks;

CREATE POLICY "Anyone can view published sub_decks"
ON public.sub_decks
FOR SELECT
TO public
USING (
  is_published = true AND
  EXISTS (
    SELECT 1 FROM public.decks
    WHERE decks.id = sub_decks.deck_id
    AND decks.is_published = true
  )
);

-- Fix flashcards policy to check both subdeck and deck
DROP POLICY IF EXISTS "Users can view flashcards in published subdecks" ON public.flashcards;

CREATE POLICY "Users can view flashcards in published subdecks"
ON public.flashcards
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.sub_decks
    JOIN public.decks ON decks.id = sub_decks.deck_id
    WHERE sub_decks.id = flashcards.subdeck_id
    AND sub_decks.is_published = true
    AND decks.is_published = true
  )
);