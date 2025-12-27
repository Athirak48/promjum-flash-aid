-- Enable RLS just in case
ALTER TABLE sub_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_deck_flashcards ENABLE ROW LEVEL SECURITY;

-- Drop (if exist) potentially loose policies to ensure we start fresh for modifications
DROP POLICY IF EXISTS "Users can update their own decks" ON sub_decks;
DROP POLICY IF EXISTS "Users can delete their own decks" ON sub_decks;
DROP POLICY IF EXISTS "Users can modify cards in their decks" ON sub_deck_flashcards;

-- 1. Policies for sub_decks

-- UPDATE: Only creator can update
CREATE POLICY "Users can update their own decks"
ON sub_decks FOR UPDATE
USING (auth.uid() = creator_user_id)
WITH CHECK (auth.uid() = creator_user_id);

-- DELETE: Only creator can delete
CREATE POLICY "Users can delete their own decks"
ON sub_decks FOR DELETE
USING (auth.uid() = creator_user_id);

-- 2. Policies for sub_deck_flashcards

-- INSERT: Only creator of the parent deck can insert cards
CREATE POLICY "Users can insert cards to their decks"
ON sub_deck_flashcards FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM sub_decks 
    WHERE id = sub_deck_id AND creator_user_id = auth.uid()
  )
);

-- UPDATE: Only creator of the parent deck can update cards
CREATE POLICY "Users can update cards in their decks"
ON sub_deck_flashcards FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM sub_decks 
    WHERE id = sub_deck_id AND creator_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM sub_decks 
    WHERE id = sub_deck_id AND creator_user_id = auth.uid()
  )
);

-- DELETE: Only creator of the parent deck can delete cards
CREATE POLICY "Users can delete cards in their decks"
ON sub_deck_flashcards FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM sub_decks 
    WHERE id = sub_deck_id AND creator_user_id = auth.uid()
  )
);
