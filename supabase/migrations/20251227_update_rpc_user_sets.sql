-- Function to create combined community deck FROM USER FLASHCARD SETS
CREATE OR REPLACE FUNCTION create_combined_community_deck(
  p_name text,
  p_description text,
  p_category text,
  p_tags text[],
  p_source_sub_deck_ids uuid[], -- actually p_source_set_ids (user_flashcard_sets)
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
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Find or Create "Community Uploads" folder
  SELECT id INTO v_folder_id
  FROM user_folders
  WHERE user_id = v_user_id AND name = 'Community Uploads'
  LIMIT 1;

  IF v_folder_id IS NULL THEN
    INSERT INTO user_folders (user_id, name, description, icon)
    VALUES (v_user_id, 'Community Uploads', 'Decks shared to the community', '🌍')
    RETURNING id INTO v_folder_id;
  END IF;

  -- Create the new community deck (in sub_decks)
  INSERT INTO sub_decks (
    name, description, folder_id, creator_user_id, is_public, category, tags, clone_count, deck_id
  ) 
  SELECT
    p_name || ' ' || p_emoji,
    p_description,
    v_folder_id,
    v_user_id,
    true,
    p_category,
    p_tags,
    0,
    (SELECT id FROM public.decks LIMIT 1) -- Fallback deck_id
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
        -- audio_url, example_sentence -- (not available in simple user_flashcards usually, unless using complex schema)
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
