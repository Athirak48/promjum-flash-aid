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
 * If currentScore is null (unplayed), the new score is just the quality
 */
export function combineSRSScore(currentScore: number | null | undefined, newQuality: number): number {
  if (currentScore === null || currentScore === undefined) {
    return newQuality;
  }
  return currentScore + newQuality;
}

/**
 * Calculate next review date and interval based on SRS algorithm (SM-2 Style)
 * Now fully enabled with 0-5 scale inputs.
 */
export function calculateSRS(
  currentData: Partial<SRSData>,
  qualityScore: number
): SRSUpdateResult {
  let easiness = currentData.easinessFactor ?? 2.5;
  let interval = currentData.intervalDays ?? 0;
  let level = currentData.srsLevel ?? 0;
  const currentScore = currentData.srsScore;

  // 1. Calculate new SRS Score (Cumulative)
  const newSrsScore = combineSRSScore(currentScore, qualityScore);

  // 2. Logic based on Quality (0-5)
  if (qualityScore >= 3) {
    // Correct response (3=Pass, 4=Good, 5=Perfect)

    // Update Interval
    if (level === 0) {
      interval = 1;
    } else if (level === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easiness);
    }

    // Update Level (consecutive correct count equivalent)
    level++;

    // Update Easiness Factor (Standard SM-2 Formula)
    // EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
    easiness = easiness + (0.1 - (5 - qualityScore) * (0.08 + (5 - qualityScore) * 0.02));

  } else {
    // Incorrect response (0=Fail, 1=Fail, 2=Fail)
    level = 0;
    interval = 1; // Reset to 1 day
    // EF stays same or could decrease slightly, but standard SM-2 keeps it or drops it.
    // Let's keep it but ensure it doesn't go below 1.3
  }

  // Cap Easiness
  if (easiness < 1.3) easiness = 1.3;

  // Calculate Next Review Date
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
