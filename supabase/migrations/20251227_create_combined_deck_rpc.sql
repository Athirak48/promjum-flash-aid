-- Function to create a combined community deck from multiple source sub-decks
CREATE OR REPLACE FUNCTION create_combined_community_deck(
  p_name text,
  p_description text,
  p_category text,
  p_tags text[],
  p_source_sub_deck_ids uuid[],
  p_emoji text DEFAULT '📦'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_folder_id uuid;
  v_new_deck_id uuid;
  v_source_id uuid;
  v_flashcard record;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Find or Create "Community Uploads" folder
  SELECT id INTO v_folder_id
  FROM user_folders
  WHERE user_id = v_user_id AND name = 'Community Uploads'
  LIMIT 1;

  IF v_folder_id IS NULL THEN
    INSERT INTO user_folders (user_id, name, description, icon)
    VALUES (v_user_id, 'Community Uploads', 'Decks shared to the community', '🌍')
    RETURNING id INTO v_folder_id;
  END IF;

  -- 2. Create the new combined deck
  INSERT INTO sub_decks (
    name,
    description,
    folder_id,
    creator_user_id,
    is_public,
    category,
    tags,
    clone_count
  ) VALUES (
    p_name || ' ' || p_emoji, -- Append emoji to name or handle separately if you prefer
    p_description,
    v_folder_id,
    v_user_id,
    true, -- Set as public immediately
    p_category,
    p_tags,
    0
  )
  RETURNING id INTO v_new_deck_id;

  -- 3. Copy cards from all source decks
  IF p_source_sub_deck_ids IS NOT NULL AND array_length(p_source_sub_deck_ids, 1) > 0 THEN
    FOREACH v_source_id IN ARRAY p_source_sub_deck_ids
    LOOP
      -- Copy cards from this source sub-deck
      INSERT INTO sub_deck_flashcards (
        sub_deck_id,
        word,
        translation,
        phonetic,
        example_sentence,
        parts_of_speech,
        difficulty_level,
        image_url,
        audio_url
      )
      SELECT
        v_new_deck_id,
        word,
        translation,
        phonetic,
        example_sentence,
        parts_of_speech,
        difficulty_level,
        image_url,
        audio_url
      FROM sub_deck_flashcards
      WHERE sub_deck_id = v_source_id;
    END LOOP;
  END IF;

  RETURN v_new_deck_id;
END;
$$;
