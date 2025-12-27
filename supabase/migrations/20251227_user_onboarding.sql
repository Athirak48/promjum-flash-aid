-- Create user_onboarding table to store onboarding responses
CREATE TABLE IF NOT EXISTS public.user_onboarding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- Question responses
    learning_goal TEXT, -- exam, business, travel, entertainment, social
    skill_level TEXT, -- beginner, basic, intermediate, advanced
    target_languages TEXT[], -- array of language codes
    daily_time TEXT, -- 5min, 15min, 30min+
    best_time TEXT, -- morning, lunch, commute, night, random
    biggest_problem TEXT, -- vocabulary, listening, boring, shy
    preferred_media TEXT, -- music, movies, news, memes
    spirit_animal TEXT, -- owl, tiger, turtle, monkey, cat, rabbit, shiba, dragon
    play_style TEXT, -- fair_play, trickster
    motivation_style TEXT, -- soft, hard
    nickname TEXT,
    
    -- Metadata
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to prevent errors on re-run
DROP POLICY IF EXISTS "Users can view own onboarding" ON public.user_onboarding;
DROP POLICY IF EXISTS "Users can insert own onboarding" ON public.user_onboarding;
DROP POLICY IF EXISTS "Users can update own onboarding" ON public.user_onboarding;
DROP POLICY IF EXISTS "Admins can view all onboarding" ON public.user_onboarding;

-- Users can view their own onboarding
CREATE POLICY "Users can view own onboarding"
ON public.user_onboarding FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can insert their own onboarding
CREATE POLICY "Users can insert own onboarding"
ON public.user_onboarding FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can update their own onboarding
CREATE POLICY "Users can update own onboarding"
ON public.user_onboarding FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Admins can view all onboarding data
CREATE POLICY "Admins can view all onboarding"
ON public.user_onboarding FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
    OR
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_onboarding_user_id ON public.user_onboarding(user_id);
