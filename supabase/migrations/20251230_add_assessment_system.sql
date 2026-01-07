-- Assessment System for Goal-Based Learning
-- Tracks pre-tests, progress tests, and post-tests

-- Table: goal_assessments
-- Stores assessment sessions (Pre-test, Progress tests, Post-test)
CREATE TABLE IF NOT EXISTS goal_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES study_goals(id) ON DELETE CASCADE,
  
  -- Assessment Info
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('pre-test', 'progress-25', 'progress-50', 'progress-75', 'post-test')),
  test_size_percentage INTEGER NOT NULL CHECK (test_size_percentage IN (30, 50, 100)), -- User choice
  total_questions INTEGER NOT NULL,
  
  -- Results
  correct_answers INTEGER DEFAULT 0,
  wrong_answers INTEGER DEFAULT 0,
  accuracy FLOAT GENERATED ALWAYS AS (
    CASE WHEN total_questions > 0 
    THEN (correct_answers::FLOAT / total_questions::FLOAT * 100)
    ELSE 0 
    END
  ) STORED,
  
  -- Performance
  time_spent_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_answers CHECK (correct_answers + wrong_answers <= total_questions)
);

-- Table: assessment_answers
-- Stores individual answers for detailed analysis
CREATE TABLE IF NOT EXISTS assessment_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES goal_assessments(id) ON DELETE CASCADE,
  flashcard_id UUID NOT NULL,
  
  -- Question Data
  question TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  user_answer TEXT,
  
  -- Result
  is_correct BOOLEAN NOT NULL,
  time_taken_seconds INTEGER DEFAULT 0,
  
  -- Metadata
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_goal_assessments_user_id ON goal_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_assessments_goal_id ON goal_assessments(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_assessments_type ON goal_assessments(assessment_type);
CREATE INDEX IF NOT EXISTS idx_assessment_answers_assessment_id ON assessment_answers(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_answers_flashcard_id ON assessment_answers(flashcard_id);

-- RLS Policies
ALTER TABLE goal_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_answers ENABLE ROW LEVEL SECURITY;

-- Users can only see their own assessments
CREATE POLICY "Users can view own assessments"
  ON goal_assessments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own assessments"
  ON goal_assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assessments"
  ON goal_assessments FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only see answers from their assessments
CREATE POLICY "Users can view own assessment answers"
  ON assessment_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM goal_assessments
      WHERE goal_assessments.id = assessment_answers.assessment_id
      AND goal_assessments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own assessment answers"
  ON assessment_answers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM goal_assessments
      WHERE goal_assessments.id = assessment_answers.assessment_id
      AND goal_assessments.user_id = auth.uid()
    )
  );
