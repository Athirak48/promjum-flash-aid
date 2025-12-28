-- Create user_onboarding table
-- This table stores the onboarding survey responses from users

CREATE TABLE IF NOT EXISTS user_onboarding (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Survey responses
  age_group TEXT NOT NULL,
  learning_goal TEXT NOT NULL,
  skill_level TEXT NOT NULL,
  target_languages TEXT[] NOT NULL DEFAULT '{}',
  daily_time TEXT NOT NULL,
  best_time TEXT NOT NULL,
  biggest_problem TEXT NOT NULL,
  preferred_media TEXT NOT NULL,
  spirit_animal TEXT NOT NULL,
  play_style TEXT NOT NULL,
  motivation_style TEXT NOT NULL,
  nickname TEXT NOT NULL,
  
  -- Timestamps
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one onboarding record per user
  UNIQUE(user_id)
);

-- Create index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_user_onboarding_user_id ON user_onboarding(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only read their own onboarding data
CREATE POLICY "Users can view their own onboarding"
  ON user_onboarding
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own onboarding data (only once due to UNIQUE constraint)
CREATE POLICY "Users can insert their own onboarding"
  ON user_onboarding
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own onboarding data
CREATE POLICY "Users can update their own onboarding"
  ON user_onboarding
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin can view all onboarding data
CREATE POLICY "Admins can view all onboarding"
  ON user_onboarding
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_user_onboarding_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_onboarding_updated_at
  BEFORE UPDATE ON user_onboarding
  FOR EACH ROW
  EXECUTE FUNCTION update_user_onboarding_updated_at();

-- Grant permissions
GRANT ALL ON user_onboarding TO postgres, authenticated;
