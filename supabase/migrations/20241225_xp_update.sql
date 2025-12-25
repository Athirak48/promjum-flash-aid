-- =====================================================
-- XP CONFIG UPDATE MIGRATION
-- Created: 2024-12-25
-- Purpose: Update XP values to new reduced amounts
-- =====================================================

-- Update Games (reduced ~50%)
UPDATE xp_config SET xp_per_action = 4, xp_completion_bonus = 5 WHERE source = 'game_quiz';
UPDATE xp_config SET xp_per_action = 1, xp_completion_bonus = 3 WHERE source = 'game_swipe';
UPDATE xp_config SET xp_per_action = 3, xp_completion_bonus = 8 WHERE source = 'game_matching';
UPDATE xp_config SET xp_per_action = 4, xp_completion_bonus = 8 WHERE source = 'game_listen_choose';
UPDATE xp_config SET xp_per_action = 4, xp_completion_bonus = 8 WHERE source = 'game_word_scramble';
UPDATE xp_config SET xp_per_action = 4, xp_completion_bonus = 8 WHERE source = 'game_honeycomb';
UPDATE xp_config SET xp_per_action = 4, xp_completion_bonus = 8 WHERE source = 'game_vocab_blinder';
UPDATE xp_config SET xp_per_action = 5, xp_completion_bonus = 10 WHERE source = 'game_hangman';
UPDATE xp_config SET xp_per_action = 5, xp_completion_bonus = 10 WHERE source = 'game_word_search';
UPDATE xp_config SET xp_per_action = 3, xp_completion_bonus = 12 WHERE source = 'game_ninja_slice';

-- Update Flashcard
UPDATE xp_config SET xp_per_action = 1 WHERE source = 'flashcard_remember';
UPDATE xp_config SET xp_completion_bonus = 5 WHERE source = 'flashcard_complete';
UPDATE xp_config SET xp_completion_bonus = 10 WHERE source = 'flashcard_perfect';

-- Update Learning Session
UPDATE xp_config SET xp_per_action = 1, xp_completion_bonus = 5 WHERE source = 'learning_flashcard';
UPDATE xp_config SET xp_per_action = 2, xp_completion_bonus = 5 WHERE source = 'learning_listening';
UPDATE xp_config SET xp_per_action = 2, xp_completion_bonus = 5 WHERE source = 'learning_reading';
UPDATE xp_config SET xp_completion_bonus = 20 WHERE source = 'learning_complete_all';
UPDATE xp_config SET xp_completion_bonus = 10 WHERE source = 'learning_first_today';

-- Insert new streak bonus configs
INSERT INTO xp_config (source, xp_per_action, xp_completion_bonus, daily_limit, description) VALUES
  ('learning_listening_streak3', 0, 3, NULL, 'Listening - 3 correct streak'),
  ('learning_listening_streak5', 0, 5, NULL, 'Listening - 5 correct streak'),
  ('learning_listening_streak10', 0, 10, NULL, 'Listening - 10 correct streak (perfect)')
ON CONFLICT (source) DO NOTHING;
