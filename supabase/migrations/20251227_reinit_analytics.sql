-- Migration: Re-initialize Analytics Schema (Tables + RLS)
-- Created: 2025-12-27
-- Description: Creates missing analytics tables and applies correct RLS policies. Run this if tables are missing.

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('navigation', 'button_click', 'feature_usage', 'session', 'game')),
  event_category TEXT, 
  event_action TEXT NOT NULL, 
  event_label TEXT, 
  event_value INTEGER, 
  metadata JSONB, 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.daily_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  metric_type TEXT NOT NULL, 
  metric_category TEXT, 
  metric_label TEXT, 
  count INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  total_value BIGINT DEFAULT 0, 
  avg_value NUMERIC,
  metadata JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(date, metric_type, metric_category, metric_label)
);

-- 2. Create Indexes
CREATE INDEX IF NOT EXISTS idx_activity_user_id ON public.user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_event_type ON public.user_activity_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON public.user_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_analytics_date ON public.daily_analytics(date DESC);

-- 3. Enable RLS
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_analytics ENABLE ROW LEVEL SECURITY;

-- 4. Drop Old Policies (to avoid conflicts if re-running)
DROP POLICY IF EXISTS "Users can insert own activity" ON public.user_activity_logs;
DROP POLICY IF EXISTS "Admins can view all activity" ON public.user_activity_logs;
DROP POLICY IF EXISTS "Admins can view daily analytics" ON public.daily_analytics;
DROP POLICY IF EXISTS "Admins can modify daily analytics" ON public.daily_analytics;

-- 5. Create Correct Policies

-- Users can insert their own logs
CREATE POLICY "Users can insert own activity"
  ON public.user_activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Admins can view ALL logs (Checks both user_roles and profiles for safety)
CREATE POLICY "Admins can view all activity"
  ON public.user_activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
    OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Admins can view/modify daily analytics
CREATE POLICY "Admins can view/edit daily analytics"
  ON public.daily_analytics FOR ALL
  USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
    OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
