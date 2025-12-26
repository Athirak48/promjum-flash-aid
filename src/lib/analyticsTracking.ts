// Analytics Tracking Integration Summary
// Generated: 2024-12-26
// Purpose: Summary of analytics tracking added to all 9 minigames

/**
 * TRACKING PATTERN FOR ALL GAMES:
 * 
 * 1. Import useAnalytics hook:
 *    import { useAnalytics } from '@/hooks/useAnalytics';
 * 
 * 2. Initialize in component:
 *    const { trackGame } = useAnalytics();
 * 
 * 3. Track game start (in useEffect):
 *    trackGame(GAME_ID, 'start', undefined, {
 *      totalCards: cards.length
 *    });
 * 
 * 4. Track game completion:
 *    trackGame(GAME_ID, 'complete', finalScore, {
 *      totalCards: cards.length,
 *      correctAnswers: correctCount,
 *      duration: gameDuration
 *    });
 */

export const GAME_IDS = {
    HONEYCOMB: 'honeycomb',
    LISTEN: 'listen',
    HANGMAN: 'hangman',
    VOCAB_BLINDER: 'vocabBlinder',
    QUIZ: 'quiz',
    MATCHING: 'matching',
    WORD_SEARCH: 'wordSearch',
    SCRAMBLE: 'scramble',
    NINJA: 'ninja'
} as const;

export const GAME_NAMES = {
    honeycomb: 'Honey Hive',
    listen: 'Listen & Choose',
    hangman: 'Hangman Master',
    vocabBlinder: 'Vocab Blinder',
    quiz: 'Quiz Game',
    matching: 'Matching Game',
    wordSearch: 'Word Search',
    scramble: 'Word Scramble',
    ninja: 'Ninja Slice'
} as const;

/**
 * FILES MODIFIED WITH TRACKING:
 * 
 * ✅ FlashcardQuizGame.tsx - quiz
 * ✅ FlashcardMatchingGame.tsx - matching
 * [] FlashcardHoneyCombGame.tsx - honeycomb
 * [] FlashcardHangmanGame.tsx - hangman
 * [] FlashcardNinjaSliceGame.tsx - ninja
 * [] FlashcardListenChooseGame.tsx - listen
 * [] FlashcardVocabBlinderGame.tsx - vocabBlinder
 * [] FlashcardWordSearchGame.tsx - wordSearch
 * [] FlashcardWordScrambleGame.tsx - scramble
 */
