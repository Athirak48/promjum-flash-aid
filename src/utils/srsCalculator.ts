/**
 * SRS (Spaced Repetition System) Calculator
 * 
 * New scoring system:
 * - Flashcard Review: Q=3 (correct first try ≤7s), Q=1 (correct first try >7s), Q=0 (wrong or subsequent attempts)
 * - Listen & Choose: Q=2 (correct first listen), Q=1 (replay before correct), Q=0 (wrong)
 * - Hangman Master: Q=2 (100% correct), Q=1 (≤3 wrong guesses), Q=0 (>5 wrong or lost)
 * - Vocab Blinder: Q=2 (correct), Q=0 (wrong)
 * - Quiz Game: Q=2 (correct), Q=0 (wrong)
 * - Matching Game: Q=2 (first try correct), Q=0 (wrong or not first try)
 * 
 * srs_score starts as null (unplayed), then accumulates Q scores
 */

export interface SRSData {
  easinessFactor: number;
  intervalDays: number;
  srsLevel: number;
  srsScore: number | null;
  nextReviewDate: Date;
  timesReviewed: number;
  timesCorrect: number;
}

export interface SRSUpdateResult {
  easinessFactor: number;
  intervalDays: number;
  srsLevel: number;
  srsScore: number;
  nextReviewDate: Date;
}

/**
 * GAME TIERS: The "10/10" Logic
 * Prevents "Fake Mastery" by capping scores for easy games.
 * 
 * TIER 1 (Recognition): Cap 10 (Intermediate)
 * - Users only "Recognize" the word. Cannot prove full mastery.
 * 
 * TIER 2 (Recall): Cap 15 (Master)
 * - Users must "Produce" the word (Spell, Speak, or Self-Verify).
 */
export const GAME_TIERS: Record<string, { tier: 1 | 2; cap: number }> = {
  // Recognition Games (Easy)
  'quiz': { tier: 1, cap: 10 },
  'matching': { tier: 1, cap: 10 },
  'wordsearch': { tier: 1, cap: 10 },
  'ninja': { tier: 1, cap: 10 },
  'listen-choose': { tier: 1, cap: 10 },
  'vocab-blinder': { tier: 1, cap: 10 },

  // Recall Games (Hard)
  'flashcard': { tier: 2, cap: 15 },
  'scramble': { tier: 2, cap: 15 },
  'hangman': { tier: 2, cap: 15 },
  'honeycomb': { tier: 2, cap: 15 },
  'speaking': { tier: 2, cap: 15 },
};

export function getGameScoreCap(gameId: string): number {
  return GAME_TIERS[gameId]?.cap ?? 15; // Default to 15 (Recall) if unknown
}

/**
 * Get quality score for Flashcard Review (Swipe mode)
 * Q=5: Perfect (≤3s) - Instant recall
 * Q=4: Good (≤6s) - Brief checking
 * Q=3: Pass (≤10s) - Thinking needed
 * Q=2: Hard (>10s) - Slow recall
 * Q=0: Wrong
 */
export function getFlashcardReviewQuality(
  isCorrect: boolean,
  attemptCount: number,
  timeTakenSeconds: number = 0
): number {
  if (!isCorrect) return 0;
  if (attemptCount > 1) return 1; // Correct after retry is barely passing

  // First attempt timing
  if (timeTakenSeconds <= 3) return 5;
  if (timeTakenSeconds <= 6) return 4;
  if (timeTakenSeconds <= 10) return 3;
  return 2;
}

/**
 * Get quality score for Listen & Choose game
 * Q=5: Instant match (1st play)
 * Q=3: Correct (1st play)
 * Q=1: Replay needed
 * Q=0: Wrong
 */
export function getListenChooseQuality(isCorrect: boolean, playCount: number): number {
  if (!isCorrect) return 0;

  if (playCount <= 1) {
    return 5; // Standard for listening usually simpler if correct immediately
  }
  return 2; // Replayed
}

/**
 * Get quality score for Hangman Master game
 * Q=5: Perfect (0 wrong)
 * Q=3: Good (≤3 wrong)
 * Q=1: Hard (>3 wrong)
 * Q=0: Failed
 */
export function getHangmanQuality(isComplete: boolean, wrongGuesses: number): number {
  if (!isComplete || wrongGuesses >= 6) return 0;

  if (wrongGuesses === 0) return 5;
  if (wrongGuesses <= 2) return 4;
  if (wrongGuesses <= 4) return 3;
  return 1;
}

/**
 * Get quality score for Vocab Blinder game
 * Q=5: < 2.5s
 * Q=4: < 5s
 * Q=3: < 8s
 * Q=2: Slow
 */
export function getVocabBlinderQuality(isCorrect: boolean, timeSeconds: number = 5): number {
  if (!isCorrect) return 0;

  if (timeSeconds < 2.5) return 5;
  if (timeSeconds < 5) return 4;
  if (timeSeconds < 8) return 3;
  return 2;
}

/**
 * Get quality score for Quiz Game
 * Q=5: < 3s
 * Q=4: < 6s
 * Q=3: < 10s
 * Q=2: > 10s
 */
export function getQuizGameQuality(isCorrect: boolean, timeSeconds: number = 10): number {
  if (!isCorrect) return 0;

  if (timeSeconds < 3) return 5;
  if (timeSeconds < 6) return 4;
  if (timeSeconds < 10) return 3;
  return 2;
}

/**
 * Get quality score for Matching Game
 * Match is usually easy/recognition based.
 * Q=5: First try
 * Q=0: Mistake
 */
export function getMatchingGameQuality(isCorrect: boolean, isFirstTry: boolean): number {
  if (!isCorrect) return 0;
  return isFirstTry ? 4 : 1; // Capped at 4 mostly unless very fast? Kept simple.
}

// ============================================
// NEW GAME QUALITY FUNCTIONS
// ============================================

/**
 * Get quality score for Word Search game
 * Q=3: Found word in <10 seconds
 * Q=2: Found word in 10-30 seconds
 * Q=1: Found word in >30 seconds
 * Q=0: Didn't find / timeout
 */
export function getWordSearchQuality(isFound: boolean, timeSeconds: number): number {
  if (!isFound) {
    return 0;
  }

  if (timeSeconds < 10) {
    return 3; // Found very quickly
  }

  if (timeSeconds <= 30) {
    return 2; // Found in reasonable time
  }

  return 1; // Found but slow
}

/**
 * Get quality score for Word Scramble game
 * Q=3: Completed without hints
 * Q=2: Used 1-2 hints
 * Q=1: Used more than 2 hints
 * Q=0: Failed to complete
 */
export function getWordScrambleQuality(isComplete: boolean, hintsUsed: number): number {
  if (!isComplete) {
    return 0;
  }

  if (hintsUsed === 0) {
    return 3; // Perfect - remembered spelling
  }

  if (hintsUsed <= 2) {
    return 2; // Needed some help
  }

  return 1; // Needed lots of help
}

/**
 * Get quality score for Ninja Slice game
 * Q=3: Sliced correct fruit on first try
 * Q=1: Sliced correct but had mistakes before
 * Q=0: Sliced wrong or missed
 */
export function getNinjaSliceQuality(isCorrect: boolean, wasFirstTry: boolean): number {
  if (!isCorrect) {
    return 0;
  }

  if (wasFirstTry) {
    return 3; // Instant recognition
  }

  return 1; // Got it eventually
}

/**
 * Get quality score for HoneyComb game
 * Q=3: Correct on first attempt
 * Q=2: Correct in 2-3 attempts
 * Q=1: Correct in more than 3 attempts
 * Q=0: Wrong / gave up
 */
export function getHoneyCombQuality(isCorrect: boolean, attemptsNeeded: number): number {
  if (!isCorrect) {
    return 0;
  }

  if (attemptsNeeded === 1) {
    return 3; // First try
  }

  if (attemptsNeeded <= 3) {
    return 2; // Few attempts
  }

  return 1; // Many attempts
}

/**
 * Combine SRS score - adds new quality to existing score
 * NOW STANDARDIZED: Maps Quality (0-5) to Score Delta (+2/+1/-3)
 * Capped at 'maxScore' (Default 15).
 */
export function combineSRSScore(currentScore: number | null | undefined, qualityScore: number, maxScore: number = 15): number {
  const current = currentScore ?? 0;
  let delta = 0;

  if (qualityScore >= 5) {
    // Perfect/Fast Recall
    delta = 2;
  } else if (qualityScore >= 3) {
    // Correct but slow/average (Pass/Good)
    delta = 1;
  } else {
    // Incorrect
    delta = -3;
  }

  // Apply delta and clamp between 0 and maxScore
  // Note: maxScore only limits growth. 
  // If current is already 15 and maxScore is 10 (Tier 1), we shouldn't force it down to 10 if correct.
  // Actually, Tier 1 is "Maintenance". It shouldn't reduce score unless wrong.
  // So clamp: Min: 0. Max: Max(current, maxScore) if we want to allow holding high score.
  // BUT the request is to "Separate" words. 
  // If I play Quiz on a Master word, I should just maintain 15, not be capped at 10.
  // The cap is for GROWTH. You cannot GROW past 10 with Quiz.
  // So: NewScore = Current + Delta.
  // If NewScore > 10 and maxScore is 10: NewScore = Max(Current, 10).
  // Wait, if Current is 9 and delta is +2 -> New is 11. Cap is 10. Result 10. Correct.
  // If Current is 15 and delta is +2 -> New is 17. Cap is 10. 
  // We don't want to reset 15 to 10 just because they played a quiz.

  let newScore = current + delta;

  if (delta > 0) {
    // Growth/Maintenance
    if (newScore > maxScore) {
      // If we are growing past cap, stop at cap.
      // Unless we were ALREADY past cap.
      newScore = Math.max(current, maxScore);
      // Wait, if current is 15, max is 10. Max(15, 10) = 15. So it stays 15.
      // If current is 9, max is 10. New is 11. Max(9, 10) = 10. So it stops at 10.

      // But wait, if I have 15 and play Quiz (+2), I want to stay 15.
      // Math.max(15, 10) works.
      // Check upper bound: 15 is absolute hard cap.
      newScore = Math.min(15, newScore);
    } else {
      // Normal growth below cap
    }
  } else {
    // Penalty (delta < 0)
    // Just apply delta.
    newScore = Math.max(0, newScore);
  }

  // Final check: Hard cap 15 always
  return Math.min(15, newScore);
}

/**
 * Calculate next review date and interval based on Unified SRS algorithm
 */
export function calculateSRS(
  currentData: Partial<SRSData>,
  qualityScore: number,
  deadlineDays?: number, // Optional: For compression context
  maxScore: number = 15  // NEW: Safety Cap based on Game Tier
): SRSUpdateResult {
  let easiness = currentData.easinessFactor ?? 2.5;
  let interval = currentData.intervalDays ?? 0;
  let level = currentData.srsLevel ?? 0;
  const currentScore = currentData.srsScore ?? 0;

  // 1. Calculate new SRS Score (Tier-Capped)
  const newSrsScore = combineSRSScore(currentScore, qualityScore, maxScore);

  const isCorrect = qualityScore >= 3;

  // 2. Update Easiness Factor (Standard SM-2 Formula)
  if (isCorrect) {
    // EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
    easiness = easiness + (0.1 - (5 - qualityScore) * (0.08 + (5 - qualityScore) * 0.02));
  } else {
    // Decrease EF for failures
    easiness = easiness - 0.2;
  }
  if (easiness < 1.3) easiness = 1.3;

  // 3. Update Level based on Score Thresholds
  if (isCorrect) {
    // Promote if Mastery Score is high enough
    if (newSrsScore >= 12) {
      level++;
    }
    // If capped at 10 (Tier 1), user CANNOT reach Score 12, so Level won't increase past a certain point naturally.
  } else {
    // Demote if Mastery Score drops too low
    if (newSrsScore <= 5) {
      level = Math.max(0, level - 1);
    }
  }

  // 4. Calculate Interval based on Level (Exponential)
  if (level === 0) {
    interval = 1;
  } else if (level === 1) {
    interval = 1;
  } else if (level === 2) {
    interval = 6;
  } else {
    // Exponential Growth: 6 * EF^(Level-2)
    interval = Math.round(6 * Math.pow(easiness, level - 2));
  }

  // Failure Reset Override: Force re-review tomorrow if wrong
  if (!isCorrect) {
    interval = 1;
  }

  // 5. Apply Deadline Compression (if provided)
  if (deadlineDays !== undefined && deadlineDays < 7 && interval > 1) {
    const maxInterval = Math.max(1, Math.floor(deadlineDays / 2));
    interval = Math.min(interval, maxInterval);
  }

  // 6. Calculate Next Date
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);

  return {
    easinessFactor: parseFloat(easiness.toFixed(2)),
    intervalDays: interval,
    srsLevel: level,
    srsScore: newSrsScore,
    nextReviewDate: nextDate
  };
}
