-- Migration: Create User Analytics Tables
-- Created: 2024-12-24

-- Table 1: User Activity Logs
-- Stores all user interactions and events
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('navigation', 'button_click', 'feature_usage', 'session')),
  event_category TEXT, -- 'navbar', 'learning', 'game', 'admin', 'dashboard'
  event_action TEXT NOT NULL, -- 'click', 'view', 'start', 'complete', 'cancel'
  event_label TEXT, -- ชื่อปุ่ม, หน้า, feature
  event_value INTEGER, -- เวลาที่ใช้ (seconds), คะแนน, จำนวน
  metadata JSONB, -- ข้อมูลเพิ่มเติม
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_activity_user_id ON public.user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_event_type ON public.user_activity_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON public.user_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_category_action ON public.user_activity_logs(event_category, event_action);
CREATE INDEX IF NOT EXISTS idx_activity_date ON public.user_activity_logs(DATE(created_at));

-- Table 2: Daily Analytics (Pre-aggregated)
-- Stores pre-calculated daily statistics for better performance
CREATE TABLE IF NOT EXISTS public.daily_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  metric_type TEXT NOT NULL, -- 'page_views', 'button_clicks', 'active_users', 'feature_usage'
  metric_category TEXT, -- 'dashboard', 'learning', 'games', 'admin'
  metric_label TEXT, -- specific page/button/feature name
  count INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  total_value BIGINT DEFAULT 0, -- sum of event_value
  avg_value NUMERIC,
  metadata JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  
  UNIQUE(date, metric_type, metric_category, metric_label)
);

-- Indexes for Daily Analytics
CREATE INDEX IF NOT EXISTS idx_daily_analytics_date ON public.daily_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_analytics_metric ON public.daily_analytics(metric_type, metric_category);

-- Enable Row Level Security
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_activity_logs

-- Policy: Users can insert their own activity logs
CREATE POLICY "Users can insert own activity"
  ON public.user_activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Admins can view all activity logs
CREATE POLICY "Admins can view all activity"
  ON public.user_activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for daily_analytics

-- Policy: Only admins can read daily analytics
CREATE POLICY "Admins can view daily analytics"
  ON public.daily_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Only admins can insert/update daily analytics
CREATE POLICY "Admins can modify daily analytics"
  ON public.daily_analytics FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function: Aggregate daily analytics (can be called manually or via cron)
CREATE OR REPLACE FUNCTION aggregate_daily_analytics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Aggregate page views
  INSERT INTO public.daily_analytics (date, metric_type, metric_category, metric_label, count, unique_users)
  SELECT 
    target_date,
    'page_views',
    event_category,
    event_label,
    COUNT(*),
    COUNT(DISTINCT user_id)
  FROM public.user_activity_logs
  WHERE DATE(created_at) = target_date
    AND event_type = 'navigation'
    AND event_action = 'view'
  GROUP BY event_category, event_label
  ON CONFLICT (date, metric_type, metric_category, metric_label)
  DO UPDATE SET
    count = EXCLUDED.count,
    unique_users = EXCLUDED.unique_users,
    updated_at = NOW();

  -- Aggregate button clicks
  INSERT INTO public.daily_analytics (date, metric_type, metric_category, metric_label, count, unique_users)
  SELECT 
    target_date,
    'button_clicks',
    event_category,
    event_label,
    COUNT(*),
    COUNT(DISTINCT user_id)
  FROM public.user_activity_logs
  WHERE DATE(created_at) = target_date
    AND event_type = 'button_click'
  GROUP BY event_category, event_label
  ON CONFLICT (date, metric_type, metric_category, metric_label)
  DO UPDATE SET
    count = EXCLUDED.count,
    unique_users = EXCLUDED.unique_users,
    updated_at = NOW();

  -- Aggregate active users
  INSERT INTO public.daily_analytics (date, metric_type, metric_category, count, unique_users)
  SELECT 
    target_date,
    'active_users',
    NULL,
    COUNT(*),
    COUNT(DISTINCT user_id)
  FROM public.user_activity_logs
  WHERE DATE(created_at) = target_date
  ON CONFLICT (date, metric_type, metric_category, metric_label)
  DO UPDATE SET
    count = EXCLUDED.count,
    unique_users = EXCLUDED.unique_users,
    updated_at = NOW();
END;
$$;

-- Grant execute permission to authenticated users (admins can call this)
GRANT EXECUTE ON FUNCTION aggregate_daily_analytics TO authenticated;

-- Comments for documentation
COMMENT ON TABLE public.user_activity_logs IS 'Stores all user activity events for analytics';
COMMENT ON TABLE public.daily_analytics IS 'Pre-aggregated daily statistics for performance';
COMMENT ON FUNCTION aggregate_daily_analytics IS 'Aggregates daily analytics from activity logs';
