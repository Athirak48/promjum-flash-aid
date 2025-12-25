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
 * Q=3: Correct first attempt, confident (≤7 seconds)
 * Q=1: Correct first attempt, but took >7 seconds
 * Q=0: Correct on subsequent attempts (2nd, 3rd, etc.)
 * Q=0: Wrong (swipe left)
 */
export function getFlashcardReviewQuality(
  isCorrect: boolean,
  attemptCount: number,
  timeTakenSeconds: number = 0
): number {
  if (!isCorrect) {
    return 0;
  }

  // Only first attempt can get Q > 0
  if (attemptCount > 1) {
    return 0;
  }

  // First attempt - check timing
  if (timeTakenSeconds <= 7) {
    return 3; // Confident, quick response
  }

  return 1; // Correct but hesitated
}

/**
 * Get quality score for Listen & Choose game
 * Q=2: Correct on first listen
 * Q=1: Replay needed before correct answer
 * Q=0: Wrong answer
 */
export function getListenChooseQuality(isCorrect: boolean, playCount: number): number {
  if (!isCorrect) {
    return 0;
  }

  // First listen (playCount = 1) gets Q=2
  if (playCount <= 1) {
    return 2;
  }

  // Replayed before answering correctly
  return 1;
}

/**
 * Get quality score for Hangman Master game
 * Q=3: Perfect (0 wrong guesses)
 * Q=2: Good (≤3 wrong guesses)
 * Q=1: Okay (4-5 wrong guesses)
 * Q=0: Lost or ≥6 wrong guesses
 */
export function getHangmanQuality(isComplete: boolean, wrongGuesses: number): number {
  if (!isComplete || wrongGuesses >= 6) {
    return 0;
  }

  if (wrongGuesses === 0) {
    return 3; // Perfect - remember spelling completely
  }

  if (wrongGuesses <= 3) {
    return 2; // Good
  }

  return 1; // Many mistakes but still completed
}

/**
 * Get quality score for Vocab Blinder game (with time factor)
 * Q=3: Correct in <3 seconds (instant recognition)
 * Q=2: Correct in 3-8 seconds (normal)
 * Q=1: Correct in >8 seconds (hesitated)
 * Q=0: Wrong answer
 */
export function getVocabBlinderQuality(isCorrect: boolean, timeSeconds: number = 5): number {
  if (!isCorrect) {
    return 0;
  }

  if (timeSeconds < 3) {
    return 3; // Instant recognition
  }

  if (timeSeconds <= 8) {
    return 2; // Normal speed
  }

  return 1; // Slow/hesitated
}

/**
 * Get quality score for Quiz Game (with time factor)
 * Q=3: Correct in <5 seconds (very fast)
 * Q=2: Correct in 5-15 seconds (normal)
 * Q=1: Correct in >15 seconds (slow/guessing)
 * Q=0: Wrong answer
 */
export function getQuizGameQuality(isCorrect: boolean, timeSeconds: number = 10): number {
  if (!isCorrect) {
    return 0;
  }

  if (timeSeconds < 5) {
    return 3; // Very confident
  }

  if (timeSeconds <= 15) {
    return 2; // Normal
  }

  return 1; // Slow/unsure
}

/**
 * Get quality score for Matching Game
 * Q=2: Matched correctly on first try
 * Q=0: Wrong match or not first try
 */
export function getMatchingGameQuality(isCorrect: boolean, isFirstTry: boolean): number {
  if (!isCorrect) {
    return 0;
  }
  return isFirstTry ? 3 : 1;
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
