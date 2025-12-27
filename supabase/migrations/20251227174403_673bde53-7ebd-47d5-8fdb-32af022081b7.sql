-- Drop and recreate the function with proper SECURITY DEFINER
DROP FUNCTION IF EXISTS public.create_combined_community_deck(text, text, text, text[], uuid[], text);

CREATE OR REPLACE FUNCTION public.create_combined_community_deck(
  p_name text, 
  p_description text, 
  p_category text, 
  p_tags text[], 
  p_source_sub_deck_ids uuid[], 
  p_emoji text DEFAULT '📦'::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_new_deck_id uuid;
  v_source_id uuid;
  v_user_id uuid;
  v_parent_deck_id uuid;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get or Create Parent Deck for community decks
  SELECT id INTO v_parent_deck_id FROM decks WHERE category = 'Community' LIMIT 1;
  
  IF v_parent_deck_id IS NULL THEN
    INSERT INTO decks (name, name_en, description, category, is_published)
    VALUES ('Community Decks', 'Community Decks', 'User-created community decks', 'Community', true)
    RETURNING id INTO v_parent_deck_id;
  END IF;

  -- Create the combined sub_deck
  INSERT INTO sub_decks (
    name,
    name_en,
    description,
    creator_user_id,
    is_public,
    is_published,
    category,
    tags,
    clone_count,
    deck_id
  ) 
  VALUES (
    p_emoji || ' ' || p_name,
    p_name,
    p_description,
    v_user_id,
    true,
    true,
    p_category,
    p_tags,
    0,
    v_parent_deck_id
  )
  RETURNING id INTO v_new_deck_id;

  -- Copy cards from user_flashcards table
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
      WHERE flashcard_set_id = v_source_id
        AND user_id = v_user_id;
    END LOOP;
  END IF;

  -- Update flashcard count on the sub_deck
  UPDATE sub_decks 
  SET flashcard_count = (
    SELECT COUNT(*) FROM sub_deck_flashcards WHERE sub_deck_id = v_new_deck_id
  )
  WHERE id = v_new_deck_id;

  RETURN v_new_deck_id;
END;
$function$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_combined_community_deck(text, text, text, text[], uuid[], text) TO authenticated;