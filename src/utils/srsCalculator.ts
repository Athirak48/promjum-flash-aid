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
 * Q=2: 100% correct (no wrong guesses)
 * Q=1: ≤3 wrong guesses
 * Q=0: Lost or >5 wrong guesses
 */
export function getHangmanQuality(isComplete: boolean, wrongGuesses: number): number {
  if (!isComplete || wrongGuesses > 5) {
    return 0;
  }
  
  if (wrongGuesses === 0) {
    return 2; // Perfect
  }
  
  if (wrongGuesses <= 3) {
    return 1; // Some mistakes but still good
  }
  
  return 0; // Too many mistakes (4-5 considered poor performance)
}

/**
 * Get quality score for Vocab Blinder game
 * Q=2: Correct answer
 * Q=0: Wrong answer
 */
export function getVocabBlinderQuality(isCorrect: boolean): number {
  return isCorrect ? 2 : 0;
}

/**
 * Get quality score for Quiz Game
 * Q=2: Correct answer
 * Q=0: Wrong answer
 */
export function getQuizGameQuality(isCorrect: boolean): number {
  return isCorrect ? 2 : 0;
}

/**
 * Get quality score for Matching Game
 * Q=2: Matched correctly on first try
 * Q=0: Wrong match or not first try
 */
export function getMatchingGameQuality(isCorrect: boolean, isFirstTry: boolean): number {
  if (isCorrect && isFirstTry) {
    return 2;
  }
  return 0;
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
 * Calculate next review date and interval based on SRS algorithm
 * Uses a simplified SM-2 variant
 */
export function calculateSRS(
  currentData: Partial<SRSData>,
  qualityScore: number
): SRSUpdateResult {
  const currentEF = currentData.easinessFactor ?? 2.5;
  const currentInterval = currentData.intervalDays ?? 1;
  const currentLevel = currentData.srsLevel ?? 0;
  const currentScore = currentData.srsScore;
  
  // Calculate new SRS score (cumulative)
  const newSrsScore = combineSRSScore(currentScore, qualityScore);
  
  // Calculate new easiness factor
  // EF' = EF + (0.1 - (3 - Q) * (0.08 + (3 - Q) * 0.02))
  // Adjusted for Q range 0-3
  let newEF = currentEF + (0.1 - (3 - qualityScore) * (0.08 + (3 - qualityScore) * 0.02));
  newEF = Math.max(1.3, newEF); // Minimum EF of 1.3
  
  // Calculate new interval
  let newInterval: number;
  let newLevel: number;
  
  if (qualityScore === 0) {
    // Failed - reset to beginning
    newInterval = 1;
    newLevel = 0;
  } else if (currentLevel === 0) {
    newInterval = 1;
    newLevel = 1;
  } else if (currentLevel === 1) {
    newInterval = 3;
    newLevel = 2;
  } else {
    // Level 2+: interval * EF
    newInterval = Math.round(currentInterval * newEF);
    newLevel = Math.min(currentLevel + 1, 10); // Cap at level 10
  }
  
  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);
  
  return {
    easinessFactor: Number(newEF.toFixed(2)),
    intervalDays: newInterval,
    srsLevel: newLevel,
    srsScore: newSrsScore,
    nextReviewDate
  };
}
