-- =====================================================
-- XP SYSTEM MIGRATION
-- Created: 2024-12-24
-- =====================================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USER XP TABLE - stores current XP and level
-- =====================================================
CREATE TABLE IF NOT EXISTS user_xp (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  total_xp INTEGER DEFAULT 0 NOT NULL,
  level INTEGER DEFAULT 1 NOT NULL,
  -- Daily limits tracking
  games_xp_today INTEGER DEFAULT 0,
  flashcard_xp_today INTEGER DEFAULT 0,
  last_daily_reset DATE DEFAULT CURRENT_DATE,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. XP TRANSACTIONS TABLE - logs all XP gains
-- =====================================================
CREATE TABLE IF NOT EXISTS xp_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL, -- 'game_quiz', 'game_ninja', 'flashcard', 'learning_session'
  source_detail TEXT, -- specific game name or action
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. XP CONFIG TABLE - configurable XP values
-- =====================================================
CREATE TABLE IF NOT EXISTS xp_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT UNIQUE NOT NULL,
  xp_per_action INTEGER DEFAULT 0,
  xp_completion_bonus INTEGER DEFAULT 0,
  daily_limit INTEGER, -- NULL = no limit
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. INSERT DEFAULT XP CONFIG VALUES
-- =====================================================
INSERT INTO xp_config (source, xp_per_action, xp_completion_bonus, daily_limit, description) VALUES
  -- Games (reduced ~50%)
  ('game_quiz', 4, 5, 150, 'Quiz Game - answer correctly'),
  ('game_swipe', 1, 3, 150, 'Swipe Game'),
  ('game_matching', 3, 8, 150, 'Matching Game'),
  ('game_listen_choose', 4, 8, 150, 'Listen & Choose'),
  ('game_word_scramble', 4, 8, 150, 'Word Scramble'),
  ('game_honeycomb', 4, 8, 150, 'HoneyComb'),
  ('game_vocab_blinder', 4, 8, 150, 'Vocab Blinder'),
  ('game_hangman', 5, 10, 150, 'Hangman'),
  ('game_word_search', 5, 10, 150, 'Word Search'),
  ('game_ninja_slice', 3, 12, 150, 'Ninja Slice'),
  -- Flashcard
  ('flashcard_remember', 1, 0, 100, 'Flashcard - remembered'),
  ('flashcard_forgot', 0, 0, 100, 'Flashcard - forgot'),
  ('flashcard_complete', 0, 5, NULL, 'Complete flashcard deck'),
  ('flashcard_perfect', 0, 10, NULL, 'Perfect score on deck'),
  -- Learning Session
  ('learning_flashcard', 1, 5, NULL, 'Learning Session - Flashcard phase'),
  ('learning_listening', 2, 5, NULL, 'Learning Session - Listening phase'),
  ('learning_listening_streak3', 0, 3, NULL, 'Listening - 3 correct streak'),
  ('learning_listening_streak5', 0, 5, NULL, 'Listening - 5 correct streak'),
  ('learning_listening_streak10', 0, 10, NULL, 'Listening - 10 correct streak (perfect)'),
  ('learning_reading', 2, 5, NULL, 'Learning Session - Reading phase'),
  ('learning_game', 5, 15, NULL, 'Learning Session - Game phase'),
  ('learning_complete_all', 0, 20, NULL, 'Complete all phases'),
  ('learning_first_today', 0, 10, NULL, 'First session of the day')
ON CONFLICT (source) DO NOTHING;

-- =====================================================
-- 5. INDEXES for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_user_xp_user_id ON user_xp(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_id ON xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_created_at ON xp_transactions(created_at DESC);

-- =====================================================
-- 6. ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_config ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own XP
CREATE POLICY "Users can view own xp" ON user_xp
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own xp" ON user_xp
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own xp" ON user_xp
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can read/insert their own transactions
CREATE POLICY "Users can view own transactions" ON xp_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON xp_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Everyone can read XP config
CREATE POLICY "Anyone can view xp config" ON xp_config
  FOR SELECT USING (true);

-- =====================================================
-- 7. FUNCTION: Add XP with daily limit check
-- =====================================================
CREATE OR REPLACE FUNCTION add_xp(
  p_user_id UUID,
  p_amount INTEGER,
  p_source TEXT,
  p_source_detail TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS TABLE(
  new_xp INTEGER,
  new_level INTEGER,
  xp_added INTEGER,
  level_up BOOLEAN
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. FUNCTION: Get user XP data
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_xp(p_user_id UUID)
RETURNS TABLE(
  total_xp INTEGER,
  level INTEGER,
  xp_to_next_level INTEGER,
  games_xp_today INTEGER,
  games_xp_remaining INTEGER,
  flashcard_xp_today INTEGER,
  flashcard_xp_remaining INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ux.total_xp,
    ux.level,
    (ux.level * 1000) - ux.total_xp AS xp_to_next_level,
    CASE WHEN ux.last_daily_reset = CURRENT_DATE THEN ux.games_xp_today ELSE 0 END,
    150 - CASE WHEN ux.last_daily_reset = CURRENT_DATE THEN ux.games_xp_today ELSE 0 END,
    CASE WHEN ux.last_daily_reset = CURRENT_DATE THEN ux.flashcard_xp_today ELSE 0 END,
    100 - CASE WHEN ux.last_daily_reset = CURRENT_DATE THEN ux.flashcard_xp_today ELSE 0 END
  FROM user_xp ux
  WHERE ux.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
