-- Enable RLS on individual_challenge_vocab table
ALTER TABLE public.individual_challenge_vocab ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view challenge vocabulary
CREATE POLICY "Anyone can view challenge vocab"
ON public.individual_challenge_vocab FOR SELECT
USING (true);

-- Policy: Only admins can manage challenge vocabulary
CREATE POLICY "Admins can manage challenge vocab"
ON public.individual_challenge_vocab FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fix add_xp function to verify caller matches target user
CREATE OR REPLACE FUNCTION public.add_xp(
  p_user_id uuid, 
  p_amount integer, 
  p_source text, 
  p_source_detail text DEFAULT NULL::text, 
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE(new_xp integer, new_level integer, xp_added integer, level_up boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_daily_limit INTEGER;
  v_current_xp INTEGER;
  v_current_games_xp INTEGER;
  v_current_flashcard_xp INTEGER;
  v_last_reset DATE;
  v_old_level INTEGER;
  v_new_level INTEGER;
  v_actual_xp INTEGER;
  v_category TEXT;
BEGIN
  -- SECURITY CHECK: Verify caller is adding XP to their own account
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: can only add XP for self';
  END IF;

  -- Get daily limit for this source
  SELECT daily_limit INTO v_daily_limit
  FROM xp_config WHERE source = p_source;
  
  -- Get or create user XP record
  INSERT INTO user_xp (user_id, total_xp, level, games_xp_today, flashcard_xp_today, last_daily_reset)
  VALUES (p_user_id, 0, 1, 0, 0, CURRENT_DATE)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Get current user XP data
  SELECT total_xp, level, games_xp_today, flashcard_xp_today, last_daily_reset
  INTO v_current_xp, v_old_level, v_current_games_xp, v_current_flashcard_xp, v_last_reset
  FROM user_xp WHERE user_id = p_user_id;
  
  -- Reset daily counters if new day
  IF v_last_reset < CURRENT_DATE THEN
    v_current_games_xp := 0;
    v_current_flashcard_xp := 0;
  END IF;
  
  -- Determine category and apply daily limit
  IF p_source LIKE 'game_%' THEN
    v_category := 'games';
    IF v_daily_limit IS NOT NULL AND v_current_games_xp >= v_daily_limit THEN
      v_actual_xp := 0;
    ELSE
      v_actual_xp := LEAST(p_amount, COALESCE(v_daily_limit - v_current_games_xp, p_amount));
    END IF;
  ELSIF p_source LIKE 'flashcard_%' THEN
    v_category := 'flashcard';
    IF v_daily_limit IS NOT NULL AND v_current_flashcard_xp >= v_daily_limit THEN
      v_actual_xp := 0;
    ELSE
      v_actual_xp := LEAST(p_amount, COALESCE(v_daily_limit - v_current_flashcard_xp, p_amount));
    END IF;
  ELSE
    v_category := 'other';
    v_actual_xp := p_amount;
  END IF;
  
  -- If no XP to add, return early
  IF v_actual_xp <= 0 THEN
    RETURN QUERY SELECT v_current_xp, v_old_level, 0, false;
    RETURN;
  END IF;
  
  -- Calculate new level (1000 XP per level)
  v_new_level := GREATEST(1, ((v_current_xp + v_actual_xp) / 1000) + 1);
  
  -- Update user XP
  UPDATE user_xp SET
    total_xp = total_xp + v_actual_xp,
    level = v_new_level,
    games_xp_today = CASE WHEN v_category = 'games' THEN games_xp_today + v_actual_xp ELSE games_xp_today END,
    flashcard_xp_today = CASE WHEN v_category = 'flashcard' THEN flashcard_xp_today + v_actual_xp ELSE flashcard_xp_today END,
    last_daily_reset = CURRENT_DATE,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Log transaction
  INSERT INTO xp_transactions (user_id, amount, source, source_detail, metadata)
  VALUES (p_user_id, v_actual_xp, p_source, p_source_detail, p_metadata);
  
  -- Return results
  RETURN QUERY SELECT 
    v_current_xp + v_actual_xp,
    v_new_level,
    v_actual_xp,
    v_new_level > v_old_level;
    
END;
$$;