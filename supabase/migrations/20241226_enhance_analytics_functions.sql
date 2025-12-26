-- Migration: Enhanced Analytics Functions for Admin Dashboard
-- Created: 2024-12-26
-- Purpose: Add SQL functions to aggregate and query analytics data for Learning Now button and Minigames

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for game-related events
CREATE INDEX IF NOT EXISTS idx_activity_game_events 
  ON public.user_activity_logs(event_category, event_label, created_at DESC) 
  WHERE event_category = 'game';

-- Index for dashboard events (Learning Now button)
CREATE INDEX IF NOT EXISTS idx_activity_dashboard_events 
  ON public.user_activity_logs(event_category, event_label, created_at DESC) 
  WHERE event_category = 'dashboard';

-- Index for button click events
CREATE INDEX IF NOT EXISTS idx_activity_button_clicks 
  ON public.user_activity_logs(event_type, event_label, created_at DESC) 
  WHERE event_type = 'button_click';

-- ============================================================================
-- FUNCTION 1: Get Learning Now Button Statistics
-- ============================================================================

CREATE OR REPLACE FUNCTION get_learning_now_stats(
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
  total_clicks BIGINT,
  unique_users BIGINT,
  avg_clicks_per_user NUMERIC,
  daily_data JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH click_stats AS (
    SELECT 
      COUNT(*) as clicks,
      COUNT(DISTINCT user_id) as users
    FROM public.user_activity_logs
    WHERE event_type = 'button_click'
      AND event_label = 'Learning Now'
      AND created_at BETWEEN start_date AND end_date
  ),
  daily_breakdown AS (
    SELECT 
      jsonb_agg(
        jsonb_build_object(
          'date', DATE(created_at),
          'clicks', COUNT(*),
          'unique_users', COUNT(DISTINCT user_id)
        ) ORDER BY DATE(created_at)
      ) as data
    FROM public.user_activity_logs
    WHERE event_type = 'button_click'
      AND event_label = 'Learning Now'
      AND created_at BETWEEN start_date AND end_date
    GROUP BY DATE(created_at)
  )
  SELECT 
    cs.clicks,
    cs.users,
    CASE 
      WHEN cs.users > 0 THEN ROUND(cs.clicks::numeric / cs.users::numeric, 2)
      ELSE 0
    END as avg_clicks_per_user,
    COALESCE(db.data, '[]'::jsonb) as daily_data
  FROM click_stats cs
  CROSS JOIN daily_breakdown db;
END;
$$;

-- ============================================================================
-- FUNCTION 2: Get Game Usage Statistics (All 9 Minigames)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_game_usage_stats(
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
  game_name TEXT,
  game_id TEXT,
  total_plays BIGINT,
  unique_players BIGINT,
  total_completions BIGINT,
  completion_rate NUMERIC,
  avg_score NUMERIC,
  avg_duration NUMERIC,
  last_played TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH game_starts AS (
    SELECT 
      event_label as game_id,
      COUNT(*) as starts,
      COUNT(DISTINCT user_id) as players,
      MAX(created_at) as last_play
    FROM public.user_activity_logs
    WHERE event_category = 'game'
      AND event_action = 'start'
      AND created_at BETWEEN start_date AND end_date
    GROUP BY event_label
  ),
  game_completions AS (
    SELECT 
      event_label as game_id,
      COUNT(*) as completions,
      AVG(event_value) as avg_score,
      AVG((metadata->>'duration')::numeric) as avg_duration
    FROM public.user_activity_logs
    WHERE event_category = 'game'
      AND event_action = 'complete'
      AND created_at BETWEEN start_date AND end_date
    GROUP BY event_label
  ),
  game_names AS (
    SELECT 'honeycomb' as game_id, 'Honey Hive' as game_name
    UNION ALL SELECT 'listen', 'Listen & Choose'
    UNION ALL SELECT 'hangman', 'Hangman Master'
    UNION ALL SELECT 'vocabBlinder', 'Vocab Blinder'
    UNION ALL SELECT 'quiz', 'Quiz Game'
    UNION ALL SELECT 'matching', 'Matching Game'
    UNION ALL SELECT 'wordSearch', 'Word Search'
    UNION ALL SELECT 'scramble', 'Word Scramble'
    UNION ALL SELECT 'ninja', 'Ninja Slice'
  )
  SELECT 
    gn.game_name,
    gn.game_id,
    COALESCE(gs.starts, 0) as total_plays,
    COALESCE(gs.players, 0) as unique_players,
    COALESCE(gc.completions, 0) as total_completions,
    CASE 
      WHEN COALESCE(gs.starts, 0) > 0 
      THEN ROUND((COALESCE(gc.completions, 0)::numeric / gs.starts::numeric) * 100, 2)
      ELSE 0
    END as completion_rate,
    ROUND(COALESCE(gc.avg_score, 0), 2) as avg_score,
    ROUND(COALESCE(gc.avg_duration, 0), 2) as avg_duration,
    gs.last_play
  FROM game_names gn
  LEFT JOIN game_starts gs ON gn.game_id = gs.game_id
  LEFT JOIN game_completions gc ON gn.game_id = gc.game_id
  ORDER BY total_plays DESC;
END;
$$;

-- ============================================================================
-- FUNCTION 3: Get Top Games Ranking
-- ============================================================================

CREATE OR REPLACE FUNCTION get_top_games_ranking(
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  limit_count INTEGER DEFAULT 5
)
RETURNS TABLE (
  rank INTEGER,
  game_name TEXT,
  game_id TEXT,
  total_plays BIGINT,
  growth_percentage NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH current_period AS (
    SELECT 
      event_label as game_id,
      COUNT(*) as plays
    FROM public.user_activity_logs
    WHERE event_category = 'game'
      AND event_action = 'start'
      AND created_at BETWEEN start_date AND end_date
    GROUP BY event_label
  ),
  previous_period AS (
    SELECT 
      event_label as game_id,
      COUNT(*) as plays
    FROM public.user_activity_logs
    WHERE event_category = 'game'
      AND event_action = 'start'
      AND created_at BETWEEN (start_date - (end_date - start_date)) AND start_date
    GROUP BY event_label
  ),
  game_names AS (
    SELECT 'honeycomb' as game_id, 'Honey Hive' as game_name
    UNION ALL SELECT 'listen', 'Listen & Choose'
    UNION ALL SELECT 'hangman', 'Hangman Master'
    UNION ALL SELECT 'vocabBlinder', 'Vocab Blinder'
    UNION ALL SELECT 'quiz', 'Quiz Game'
    UNION ALL SELECT 'matching', 'Matching Game'
    UNION ALL SELECT 'wordSearch', 'Word Search'
    UNION ALL SELECT 'scramble', 'Word Scramble'
    UNION ALL SELECT 'ninja', 'Ninja Slice'
  )
  SELECT 
    ROW_NUMBER() OVER (ORDER BY COALESCE(cp.plays, 0) DESC)::INTEGER as rank,
    gn.game_name,
    gn.game_id,
    COALESCE(cp.plays, 0) as total_plays,
    CASE 
      WHEN COALESCE(pp.plays, 0) > 0 
      THEN ROUND(((COALESCE(cp.plays, 0) - pp.plays)::numeric / pp.plays::numeric) * 100, 2)
      ELSE 0
    END as growth_percentage
  FROM game_names gn
  LEFT JOIN current_period cp ON gn.game_id = cp.game_id
  LEFT JOIN previous_period pp ON gn.game_id = pp.game_id
  WHERE COALESCE(cp.plays, 0) > 0
  ORDER BY total_plays DESC
  LIMIT limit_count;
END;
$$;

-- ============================================================================
-- FUNCTION 4: Get Analytics Overview (Summary for Dashboard)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_analytics_overview(
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
  total_sessions BIGINT,
  unique_users BIGINT,
  total_games_played BIGINT,
  total_learning_now_clicks BIGINT,
  avg_session_duration NUMERIC,
  most_popular_game TEXT,
  total_game_completions BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH session_stats AS (
    SELECT 
      COUNT(*) as sessions,
      COUNT(DISTINCT user_id) as users
    FROM public.user_activity_logs
    WHERE created_at BETWEEN start_date AND end_date
  ),
  game_stats AS (
    SELECT 
      COUNT(*) as total_plays,
      COUNT(*) FILTER (WHERE event_action = 'complete') as completions
    FROM public.user_activity_logs
    WHERE event_category = 'game'
      AND created_at BETWEEN start_date AND end_date
  ),
  learning_now_stats AS (
    SELECT COUNT(*) as clicks
    FROM public.user_activity_logs
    WHERE event_type = 'button_click'
      AND event_label = 'Learning Now'
      AND created_at BETWEEN start_date AND end_date
  ),
  popular_game AS (
    SELECT 
      CASE event_label
        WHEN 'honeycomb' THEN 'Honey Hive'
        WHEN 'listen' THEN 'Listen & Choose'
        WHEN 'hangman' THEN 'Hangman Master'
        WHEN 'vocabBlinder' THEN 'Vocab Blinder'
        WHEN 'quiz' THEN 'Quiz Game'
        WHEN 'matching' THEN 'Matching Game'
        WHEN 'wordSearch' THEN 'Word Search'
        WHEN 'scramble' THEN 'Word Scramble'
        WHEN 'ninja' THEN 'Ninja Slice'
        ELSE event_label
      END as game_name
    FROM public.user_activity_logs
    WHERE event_category = 'game'
      AND event_action = 'start'
      AND created_at BETWEEN start_date AND end_date
    GROUP BY event_label
    ORDER BY COUNT(*) DESC
    LIMIT 1
  )
  SELECT 
    ss.sessions,
    ss.users,
    COALESCE(gs.total_plays, 0),
    COALESCE(ln.clicks, 0),
    0::numeric as avg_session_duration, -- Can be calculated from session events later
    COALESCE(pg.game_name, 'N/A'),
    COALESCE(gs.completions, 0)
  FROM session_stats ss
  CROSS JOIN game_stats gs
  CROSS JOIN learning_now_stats ln
  LEFT JOIN popular_game pg ON true;
END;
$$;

-- ============================================================================
-- FUNCTION 5: Get Game Usage Timeline (for Charts)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_game_usage_timeline(
  game_id TEXT,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
  date DATE,
  plays BIGINT,
  unique_players BIGINT,
  completions BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(created_at) as date,
    COUNT(*) FILTER (WHERE event_action = 'start') as plays,
    COUNT(DISTINCT user_id) FILTER (WHERE event_action = 'start') as unique_players,
    COUNT(*) FILTER (WHERE event_action = 'complete') as completions
  FROM public.user_activity_logs
  WHERE event_category = 'game'
    AND event_label = game_id
    AND created_at BETWEEN start_date AND end_date
  GROUP BY DATE(created_at)
  ORDER BY date;
END;
$$;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permission to authenticated users (admins will use these)
GRANT EXECUTE ON FUNCTION get_learning_now_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_game_usage_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_games_ranking TO authenticated;
GRANT EXECUTE ON FUNCTION get_analytics_overview TO authenticated;
GRANT EXECUTE ON FUNCTION get_game_usage_timeline TO authenticated;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON FUNCTION get_learning_now_stats IS 'Get statistics for Learning Now button clicks including daily breakdown';
COMMENT ON FUNCTION get_game_usage_stats IS 'Get comprehensive usage statistics for all 9 minigames';
COMMENT ON FUNCTION get_top_games_ranking IS 'Get ranking of most popular games with growth percentage';
COMMENT ON FUNCTION get_analytics_overview IS 'Get high-level overview of all analytics for dashboard summary';
COMMENT ON FUNCTION get_game_usage_timeline IS 'Get daily timeline data for a specific game (for charts)';
