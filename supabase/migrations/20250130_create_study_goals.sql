-- Create study_goals table for PRO users
-- Supports goal-based learning with 20 words per session

CREATE TABLE IF NOT EXISTS public.study_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Goal settings
  goal_name TEXT NOT NULL,
  target_words INTEGER NOT NULL CHECK (target_words >= 10),
  duration_days INTEGER NOT NULL CHECK (duration_days >= 5),
  deck_id UUID REFERENCES public.user_decks(id) ON DELETE CASCADE,
  
  -- Calculated values
  words_per_session INTEGER NOT NULL DEFAULT 20,
  sessions_per_day INTEGER NOT NULL,
  
  -- Progress tracking
  words_learned INTEGER DEFAULT 0,
  sessions_completed INTEGER DEFAULT 0,
  current_day INTEGER DEFAULT 1,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_active_goal_per_user UNIQUE NULLS NOT DISTINCT (user_id, is_active)
);

-- Enable RLS
ALTER TABLE public.study_goals ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own goals"
  ON public.study_goals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals"
  ON public.study_goals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
  ON public.study_goals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
  ON public.study_goals
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_study_goals_user_active 
  ON public.study_goals(user_id, is_active) 
  WHERE is_active = true;

CREATE INDEX idx_study_goals_user_created 
  ON public.study_goals(user_id, created_at DESC);

-- Updated timestamp trigger
CREATE TRIGGER update_study_goals_updated_at
  BEFORE UPDATE ON public.study_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Comments
COMMENT ON TABLE public.study_goals IS 'User study goals for vocabulary learning (PRO feature)';
COMMENT ON COLUMN public.study_goals.words_per_session IS 'Fixed at 20 words per session';
COMMENT ON COLUMN public.study_goals.sessions_per_day IS 'Auto-calculated based on target_words and duration_days';
COMMENT ON CONSTRAINT unique_active_goal_per_user ON public.study_goals IS 'Only one active goal per user allowed';
