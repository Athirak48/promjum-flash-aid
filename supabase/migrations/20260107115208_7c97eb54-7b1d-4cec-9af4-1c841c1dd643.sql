-- Table: goal_assessments
-- Records test results (Pre-Test, Interim, Post-Test) for Focus Mode goals
CREATE TABLE public.goal_assessments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_id UUID NOT NULL REFERENCES public.user_goals(id) ON DELETE CASCADE,
    assessment_type TEXT NOT NULL CHECK (assessment_type IN ('pre-test', 'interim', 'post-test')),
    test_size_percentage INTEGER DEFAULT 100,
    total_questions INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    wrong_answers INTEGER DEFAULT 0,
    time_spent_seconds INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.goal_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own assessments"
ON public.goal_assessments
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assessments"
ON public.goal_assessments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments"
ON public.goal_assessments
FOR UPDATE
USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_goal_assessments_goal_id ON public.goal_assessments(goal_id);
CREATE INDEX idx_goal_assessments_user_id ON public.goal_assessments(user_id);
CREATE INDEX idx_goal_assessments_type ON public.goal_assessments(assessment_type);

-- Add goal_id column to practice_sessions for linking sessions to goals
ALTER TABLE public.practice_sessions 
ADD COLUMN IF NOT EXISTS goal_id UUID REFERENCES public.user_goals(id) ON DELETE SET NULL;