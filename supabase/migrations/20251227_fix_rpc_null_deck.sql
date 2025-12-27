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
  v_new_deck_id uuid;
  v_source_id uuid;
  v_user_id uuid;
  v_folder_id uuid;
  v_parent_deck_id uuid;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get or Create Parent Deck (Fallback)
  -- Because sub_decks MUST link to a deck_id in public.decks
  SELECT id INTO v_parent_deck_id FROM decks LIMIT 1;
  
  IF v_parent_deck_id IS NULL THEN
    -- Table 'decks' requires name_en NOT NULL
    INSERT INTO decks (name, name_en, description, category)
    VALUES ('General Community', 'General Community', 'Auto-created parent deck for community uploads', 'General')
    RETURNING id INTO v_parent_deck_id;
  END IF;

  -- Get or Create "Community Uploads" folder for this user
  -- Table 'user_folders' only has (user_id, title) - NO description/icon/color
  SELECT id INTO v_folder_id
  FROM user_folders
  WHERE user_id = v_user_id AND title = 'Community Uploads';

  IF v_folder_id IS NULL THEN
    INSERT INTO user_folders (user_id, title)
    VALUES (v_user_id, 'Community Uploads')
    RETURNING id INTO v_folder_id;
  END IF;

  -- Create the combined sub_deck
  -- Table 'sub_decks' requires name_en NOT NULL
  -- columns like category, tags, creator_user_id added via 20251227_fix_complete_structure.sql
  INSERT INTO sub_decks (
    name,
    name_en, -- MANDATORY
    description,
    creator_user_id,
    is_public,
    category,
    tags,
    clone_count,
    deck_id
  ) 
  VALUES (
    p_name || ' ' || p_emoji,
    p_name, -- Use Thai name as fallback for name_en
    p_description,
    v_user_id,
    true,
    p_category,
    p_tags,
    0,
    v_parent_deck_id
  )
  RETURNING id INTO v_new_deck_id;

  -- Copy cards from USER_FLASHCARDS (user_flashcard_sets)
  -- Mapping: front_text -> word, back_text -> translation
  IF p_source_sub_deck_ids IS NOT NULL AND array_length(p_source_sub_deck_ids, 1) > 0 THEN
    FOREACH v_source_id IN ARRAY p_source_sub_deck_ids
    LOOP
      INSERT INTO sub_deck_flashcards (
        sub_deck_id, 
        word, 
        translation, 
        image_url
      )
      SELECT
        v_new_deck_id, 
        front_text, 
        back_text, 
        front_image_url
      FROM user_flashcards
      WHERE flashcard_set_id = v_source_id;
    END LOOP;
  END IF;

  RETURN v_new_deck_id;
END;
$$;
