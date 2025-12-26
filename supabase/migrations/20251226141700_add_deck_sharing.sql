-- Add public sharing fields to sub_decks table
ALTER TABLE sub_decks 
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS creator_user_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS original_deck_id uuid REFERENCES sub_decks(id),
ADD COLUMN IF NOT EXISTS clone_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS category text;

-- Create indexes for public deck discovery
CREATE INDEX IF NOT EXISTS idx_sub_decks_public ON sub_decks(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_sub_decks_category ON sub_decks(category) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sub_decks_tags ON sub_decks USING gin(tags) WHERE array_length(tags, 1) > 0;
CREATE INDEX IF NOT EXISTS idx_sub_decks_creator ON sub_decks(creator_user_id) WHERE creator_user_id IS NOT NULL;

-- Update existing decks to have creator_user_id (set to owner of parent folder)
UPDATE sub_decks sd
SET creator_user_id = (
  SELECT user_id 
  FROM user_folders uf 
  WHERE uf.id = sd.folder_id
  LIMIT 1
)
WHERE creator_user_id IS NULL;

-- Create view for public deck discovery with creator info
CREATE OR REPLACE VIEW public_decks_with_creator AS
SELECT 
  sd.id,
  sd.name,
  sd.description,
  sd.deck_id,
  sd.folder_id,
  sd.creator_user_id,
  sd.clone_count,
  sd.tags,
  sd.category,
  sd.created_at,
  sd.updated_at,
  p.nickname as creator_nickname,
  p.avatar_url as creator_avatar,
  COUNT(DISTINCT sf.id) as total_flashcards
FROM sub_decks sd
LEFT JOIN profiles p ON sd.creator_user_id = p.id
LEFT JOIN sub_deck_flashcards sf ON sd.id = sf.sub_deck_id
WHERE sd.is_public = true
GROUP BY 
  sd.id, 
  sd.name, 
  sd.description, 
  sd.deck_id,
  sd.folder_id,
  sd.creator_user_id,
  sd.clone_count,
  sd.tags,
  sd.category,
  sd.created_at,
  sd.updated_at,
  p.nickname, 
  p.avatar_url;

-- Function to clone a deck
CREATE OR REPLACE FUNCTION clone_deck(
  p_source_deck_id uuid,
  p_user_id uuid,
  p_target_folder_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_deck_id uuid;
  v_flashcard record;
BEGIN
  -- Check if source deck is public
  IF NOT EXISTS (
    SELECT 1 FROM sub_decks 
    WHERE id = p_source_deck_id AND is_public = true
  ) THEN
    RAISE EXCEPTION 'Source deck is not public or does not exist';
  END IF;

  -- Create new deck (clone)
  INSERT INTO sub_decks (
    name, description, deck_id, folder_id, 
    creator_user_id, original_deck_id, is_public
  )
  SELECT 
    name, description, deck_id, p_target_folder_id,
    p_user_id, p_source_deck_id, false
  FROM sub_decks
  WHERE id = p_source_deck_id
  RETURNING id INTO v_new_deck_id;

  -- Clone all flashcards
  FOR v_flashcard IN 
    SELECT * FROM sub_deck_flashcards 
    WHERE sub_deck_id = p_source_deck_id
  LOOP
    INSERT INTO sub_deck_flashcards (
      sub_deck_id, word, translation, 
      phonetic, example_sentence, parts_of_speech,
      difficulty_level, image_url, audio_url
    ) VALUES (
      v_new_deck_id, v_flashcard.word, v_flashcard.translation,
      v_flashcard.phonetic, v_flashcard.example_sentence, v_flashcard.parts_of_speech,
      v_flashcard.difficulty_level, v_flashcard.image_url, v_flashcard.audio_url
    );
  END LOOP;

  -- Increment clone count on original
  UPDATE sub_decks 
  SET clone_count = clone_count + 1
  WHERE id = p_source_deck_id;

  RETURN v_new_deck_id;
END;
$$;
