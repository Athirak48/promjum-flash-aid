-- จำนวนครั้งที่แต่ละเกมถูกเล่น (รวมทุกคน)
-- Total Play Count per Game (All Players Combined)

SELECT 
    event_label as game_id,
    CASE event_label
        WHEN 'quiz' THEN 'Quiz Game'
        WHEN 'matching' THEN 'Matching Game'
        WHEN 'honeycomb' THEN 'Honey Hive'
        WHEN 'ninja' THEN 'Ninja Slice'
        WHEN 'hangman' THEN 'Hangman Master'
        WHEN 'listen' THEN 'Listen & Choose'
        WHEN 'vocabBlinder' THEN 'Vocab Blinder'
        WHEN 'wordSearch' THEN 'Word Search'
        WHEN 'scramble' THEN 'Word Scramble'
        ELSE event_label
    END as game_name,
    COUNT(*) as total_plays,
    COUNT(DISTINCT user_id) as unique_players,
    ROUND(COUNT(*)::numeric / COUNT(DISTINCT user_id)::numeric, 2) as avg_plays_per_player
FROM user_activity_logs
WHERE event_category = 'game' 
  AND event_action = 'start'
GROUP BY event_label
ORDER BY total_plays DESC;

-- สรุปรวม
SELECT 
    '🎮 สรุปรวมทุกเกม' as summary,
    COUNT(*) as total_all_plays,
    COUNT(DISTINCT user_id) as total_unique_players,
    COUNT(DISTINCT event_label) as total_games
FROM user_activity_logs
WHERE event_category = 'game' 
  AND event_action = 'start';
