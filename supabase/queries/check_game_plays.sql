-- ตรวจสอบจำนวนการเล่นเกมทั้งหมด
-- Total Game Plays Count

-- 1. จำนวนการเล่นเกมทั้งหมด (game:start events)
SELECT 
    COUNT(*) as total_game_starts,
    COUNT(DISTINCT user_id) as unique_players
FROM user_activity_logs
WHERE event_category = 'game' 
  AND event_action = 'start';

-- 2. จำนวนการเล่นเกมแยกตามเกม
SELECT 
    event_label as game_name,
    COUNT(*) as play_count,
    COUNT(DISTINCT user_id) as unique_players,
    COUNT(CASE WHEN event_action = 'complete' THEN 1 END) as completed_games,
    ROUND(COUNT(CASE WHEN event_action = 'complete' THEN 1 END)::numeric / COUNT(*)::numeric * 100, 2) as completion_rate
FROM user_activity_logs
WHERE event_category = 'game'
GROUP BY event_label
ORDER BY play_count DESC;

-- 3. จำนวนการเล่นเกมตาม Time Range
-- วันนี้
SELECT COUNT(*) as plays_today
FROM user_activity_logs
WHERE event_category = 'game' 
  AND event_action = 'start'
  AND created_at >= CURRENT_DATE;

-- 7 วันที่ผ่านมา
SELECT COUNT(*) as plays_last_7_days
FROM user_activity_logs
WHERE event_category = 'game' 
  AND event_action = 'start'
  AND created_at >= CURRENT_DATE - INTERVAL '7 days';

-- 30 วันที่ผ่านมา
SELECT COUNT(*) as plays_last_30_days
FROM user_activity_logs
WHERE event_category = 'game' 
  AND event_action = 'start'
  AND created_at >= CURRENT_DATE - INTERVAL '30 days';

-- 4. Top 5 เกมที่ได้รับความนิยม
SELECT 
    event_label as game_name,
    COUNT(*) as total_plays,
    COUNT(DISTINCT user_id) as players,
    ROUND(AVG((metadata->>'duration')::numeric), 2) as avg_duration_sec
FROM user_activity_logs
WHERE event_category = 'game' 
  AND event_action = 'complete'
  AND metadata->>'duration' IS NOT NULL
GROUP BY event_label
ORDER BY total_plays DESC
LIMIT 5;

-- 5. สรุปภาพรวม
SELECT 
    (SELECT COUNT(*) FROM user_activity_logs WHERE event_category = 'game' AND event_action = 'start') as total_games_started,
    (SELECT COUNT(*) FROM user_activity_logs WHERE event_category = 'game' AND event_action = 'complete') as total_games_completed,
    (SELECT COUNT(DISTINCT user_id) FROM user_activity_logs WHERE event_category = 'game') as total_unique_players,
    (SELECT COUNT(DISTINCT event_label) FROM user_activity_logs WHERE event_category = 'game') as total_different_games_played;
