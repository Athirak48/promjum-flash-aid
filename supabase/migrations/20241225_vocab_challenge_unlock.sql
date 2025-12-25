-- =====================================================
-- VOCAB CHALLENGE UNLOCK COUNTER
-- Created: 2024-12-25
-- Purpose: Track users who clicked to unlock the feature
-- =====================================================

-- Table to store unlock clicks
CREATE TABLE IF NOT EXISTS vocab_challenge_unlocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_vocab_challenge_unlocks_user_id ON vocab_challenge_unlocks(user_id);

-- Enable RLS
ALTER TABLE vocab_challenge_unlocks ENABLE ROW LEVEL SECURITY;

-- Users can see total count
CREATE POLICY "Anyone can count unlocks" ON vocab_challenge_unlocks
    FOR SELECT USING (true);

-- Users can insert their own unlock
CREATE POLICY "Users can unlock once" ON vocab_challenge_unlocks
    FOR INSERT WITH CHECK (auth.uid() = user_id);
