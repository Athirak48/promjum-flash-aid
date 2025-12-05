/**
 * SRS (Spaced Repetition System) Calculator
 * Based on SM-2 algorithm with custom modifications
 * 
 * Quality Scores (Q):
 * - Q=5: Perfect response, remembered easily on first try
 * - Q=4: Correct response with slight hesitation
 * - Q=3: Correct response with difficulty
 * - Q=2: Correct response but took time/guessed
 * - Q=1: Incorrect, but upon seeing answer, remembered
 * - Q=0: Complete failure, no memory
 * - Q=-1: Special case (Matching Game wrong match) -> treated as Q=0
 */

export interface SRSData {
  easinessFactor: number;  // EF: 1.3 - 2.5, default 2.5
  intervalDays: number;    // I: days until next review
  srsLevel: number;        // Level 0-5 for repetition count
  srsScore: number;        // Difficulty score for sorting (lower = harder)
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
 * Normalize quality score
 * - Any Q <= 0 becomes 0 (heavy penalty)
 * - Q > 5 becomes 5
 */
export function normalizeQuality(q: number): number {
  if (q <= 0) return 0;
  if (q > 5) return 5;
  return Math.round(q);
}

/**
 * Calculate new SRS values based on quality score
 * Using modified SM-2 algorithm
 */
export function calculateSRS(
  currentData: Partial<SRSData>,
  qualityScore: number
): SRSUpdateResult {
  // Normalize quality score (handle negative values)
  const q = normalizeQuality(qualityScore);
  
  // Get current values with defaults
  let ef = currentData.easinessFactor ?? 2.5;
  let interval = currentData.intervalDays ?? 1;
  let level = currentData.srsLevel ?? 0;
  let srsScore = currentData.srsScore ?? 0;
  
  // Calculate new Easiness Factor using SM-2 formula
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const newEF = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  
  // Clamp EF between 1.3 and 2.5
  ef = Math.max(1.3, Math.min(2.5, newEF));
  
  // Calculate new interval and level based on quality
  if (q < 3) {
    // Failed review - reset to beginning
    level = 0;
    interval = 1;
    // Decrease SRS score (harder word)
    srsScore = Math.max(0, srsScore - 10);
  } else {
    // Successful review
    if (level === 0) {
      interval = 1;
    } else if (level === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * ef);
    }
    level = Math.min(5, level + 1);
    
    // Increase SRS score based on quality
    srsScore = srsScore + (q * 2);
  }
  
  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);
  
  return {
    easinessFactor: Math.round(ef * 100) / 100,
    intervalDays: interval,
    srsLevel: level,
    srsScore,
    nextReviewDate
  };
}

/**
 * Get quality score for Flashcard Review with timing
 * - Q=4: Correct on first attempt, confident (time ≤ 10 seconds)
 * - Q=2: Correct on first attempt, but took longer (time > 10 seconds)
 * - Q=1: Correct on subsequent attempts (2nd, 3rd, etc.)
 * - Q=0: Wrong answer (swipe left)
 */
export function getFlashcardReviewQuality(
  isCorrect: boolean,
  attemptCount: number,
  timeSpentSeconds?: number
): number {
  if (!isCorrect) return 0;  // Wrong answer = Q=0
  
  if (attemptCount === 1) {
    // First attempt correct
    if (timeSpentSeconds !== undefined && timeSpentSeconds <= 10) {
      return 4;  // Confident, quick response
    }
    return 2;  // Took longer than 10 seconds
  }
  
  return 1;  // Correct on subsequent attempts (2nd, 3rd, etc.)
}

/**
 * Get quality score for Listen & Choose game
 * - Q=5: Correct on first listen
 * - Q=2: Replayed before answering correctly
 * - Q=0: Wrong answer
 */
export function getListenChooseQuality(
  isCorrect: boolean,
  playCount: number
): number {
  if (!isCorrect) return 0;
  if (playCount <= 1) return 5;  // First listen correct
  return 2;  // Replayed before correct
}

/**
 * Get quality score for Hangman Master game
 * - Q=5: Perfect (100% correct, no wrong guesses)
 * - Q=2: Used <= 3 wrong guesses
 * - Q=0: Used > 5 wrong guesses (lost)
 */
export function getHangmanQuality(
  isComplete: boolean,
  wrongGuesses: number
): number {
  if (!isComplete) return 0;  // Lost the game
  if (wrongGuesses === 0) return 5;  // Perfect
  if (wrongGuesses <= 3) return 2;  // Minor mistakes
  return 0;  // Too many mistakes
}

/**
 * Get quality score for Vocab Blinder game
 * - Q=3: Correct answer
 * - Q=0: Wrong answer
 */
export function getVocabBlinderQuality(isCorrect: boolean): number {
  return isCorrect ? 3 : 0;
}

/**
 * Get quality score for Quiz Game
 * - Q=3: Correct answer
 * - Q=0: Wrong answer
 */
export function getQuizGameQuality(isCorrect: boolean): number {
  return isCorrect ? 3 : 0;
}

/**
 * Get quality score for Matching Game
 * - Q=3: Matched correctly on first try
 * - Q=-1 -> 0: Wrong match (penalty)
 * - Q=0: Matched correctly but not first try
 */
export function getMatchingGameQuality(
  isCorrect: boolean,
  isFirstTry: boolean
): number {
  if (!isCorrect) return -1;  // Will be normalized to 0
  if (isFirstTry) return 3;
  return 0;  // Correct but not first try
}

/**
 * Calculate combined SRS score from none (null)
 * none + number = number
 */
export function combineSRSScore(
  currentScore: number | null | undefined,
  newQuality: number
): number {
  const normalized = normalizeQuality(newQuality);
  if (currentScore === null || currentScore === undefined) {
    return normalized;
  }
  return currentScore + normalized;
}
