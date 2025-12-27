-- Function to clone a deck (Public SubDeck -> User Flashcard Set)
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
  v_new_set_id uuid;
  v_deck_name text;
  v_flashcard_count integer;
BEGIN
  -- Get source deck data
  SELECT name INTO v_deck_name
  FROM sub_decks
  WHERE id = p_source_deck_id;

  IF v_deck_name IS NULL THEN
    RAISE EXCEPTION 'Source deck not found';
  END IF;

  -- Create new User Flashcard Set
  INSERT INTO user_flashcard_sets (
    user_id, folder_id, title, source, card_count
  )
  VALUES (
    p_user_id, p_target_folder_id, v_deck_name, 'cloned', 0
  )
  RETURNING id INTO v_new_set_id;

  -- Clone flashcards from sub_deck_flashcards -> user_flashcards
  INSERT INTO user_flashcards (
    user_id, flashcard_set_id, front_text, back_text, front_image_url
  )
  SELECT 
    p_user_id,
    v_new_set_id,
    word,
    translation,
    image_url
  FROM sub_deck_flashcards 
  WHERE sub_deck_id = p_source_deck_id;

  -- Get actual count
  GET DIAGNOSTICS v_flashcard_count = ROW_COUNT;

  -- Update count
  UPDATE user_flashcard_sets 
  SET card_count = v_flashcard_count 
  WHERE id = v_new_set_id;

  -- Increment clone count on source deck
  UPDATE sub_decks 
  SET clone_count = clone_count + 1
  WHERE id = p_source_deck_id;

  RETURN v_new_set_id;
END;
$$;
