-- =====================================================
-- USER GOALS TABLE
-- Created: 2024-12-25
-- Purpose: Store user goals and progress
-- =====================================================

-- Table to store user goals
CREATE TABLE IF NOT EXISTS user_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    goal_type VARCHAR(50) NOT NULL, -- 'streak', 'words', 'decks', 'sessions', 'review', 'custom'
    title VARCHAR(255) NOT NULL,
    target_value INTEGER NOT NULL DEFAULT 10,
    current_value INTEGER NOT NULL DEFAULT 0,
    emoji VARCHAR(10) DEFAULT '🎯',
    icon_name VARCHAR(50) DEFAULT 'Target',
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);

-- Enable RLS
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (to allow re-running migration)
DROP POLICY IF EXISTS "Users can view own goals" ON user_goals;
DROP POLICY IF EXISTS "Users can insert own goals" ON user_goals;
DROP POLICY IF EXISTS "Users can update own goals" ON user_goals;
DROP POLICY IF EXISTS "Users can delete own goals" ON user_goals;

-- Users can view their own goals
CREATE POLICY "Users can view own goals" ON user_goals
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own goals
CREATE POLICY "Users can insert own goals" ON user_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own goals
CREATE POLICY "Users can update own goals" ON user_goals
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own goals
CREATE POLICY "Users can delete own goals" ON user_goals
    FOR DELETE USING (auth.uid() = user_id);
