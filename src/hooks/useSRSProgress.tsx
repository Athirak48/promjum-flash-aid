import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  calculateSRS,
  getFlashcardReviewQuality,
  getListenChooseQuality,
  getHangmanQuality,
  getVocabBlinderQuality,
  getQuizGameQuality,
  getMatchingGameQuality,
  combineSRSScore
} from '@/utils/srsCalculator';

export interface FlashcardSRSResult {
  flashcardId: string;
  qualityScore: number;
  isUserFlashcard?: boolean;
}

export function useSRSProgress() {
  /**
   * Get or create progress record for a flashcard
   */
  const getOrCreateProgress = useCallback(async (
    flashcardId: string,
    isUserFlashcard: boolean = false
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Build query based on flashcard type
    let query = supabase
      .from('user_flashcard_progress')
      .select('*')
      .eq('user_id', user.id);

    if (isUserFlashcard) {
      query = query.eq('user_flashcard_id', flashcardId);
    } else {
      query = query.eq('flashcard_id', flashcardId);
    }

    const { data: existing } = await query.maybeSingle();

    if (existing) {
      return existing;
    }

    // Create new progress record
    const insertData: any = {
      user_id: user.id,
      srs_score: null, // Start as null (unplayed)
      srs_level: 0,
      easiness_factor: 2.5,
      interval_days: 1,
      times_reviewed: 0,
      times_correct: 0,
      next_review_date: new Date().toISOString()
    };

    if (isUserFlashcard) {
      insertData.user_flashcard_id = flashcardId;
    } else {
      insertData.flashcard_id = flashcardId;
    }

    const { data: newRecord, error } = await supabase
      .from('user_flashcard_progress')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating progress record:', error);
      return null;
    }

    return newRecord;
  }, []);

  /**
   * Update SRS for a flashcard with a quality score
   */
  const updateFlashcardSRS = useCallback(async (
    flashcardId: string,
    qualityScore: number,
    isCorrect: boolean,
    isUserFlashcard: boolean = false
  ) => {
    const progress = await getOrCreateProgress(flashcardId, isUserFlashcard);
    if (!progress) return null;

    // Calculate new SRS values
    const srsResult = calculateSRS({
      easinessFactor: progress.easiness_factor ?? 2.5,
      intervalDays: progress.interval_days ?? 1,
      srsLevel: progress.srs_level ?? 0,
      srsScore: progress.srs_score
    }, qualityScore);

    // Update the record
    const { data, error } = await supabase
      .from('user_flashcard_progress')
      .update({
        srs_score: srsResult.srsScore,
        srs_level: srsResult.srsLevel,
        easiness_factor: srsResult.easinessFactor,
        interval_days: srsResult.intervalDays,
        next_review_date: srsResult.nextReviewDate.toISOString(),
        times_reviewed: (progress.times_reviewed ?? 0) + 1,
        times_correct: isCorrect ? (progress.times_correct ?? 0) + 1 : (progress.times_correct ?? 0),
        updated_at: new Date().toISOString()
      })
      .eq('id', progress.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating SRS:', error);
      return null;
    }

    return data;
  }, [getOrCreateProgress]);

  /**
   * Update SRS from Flashcard Review (Swipe mode)
   * Q=3: Correct first attempt ≤7s
   * Q=1: Correct first attempt >7s
   * Q=0: Wrong or subsequent attempts
   */
  const updateFromFlashcardReview = useCallback(async (
    flashcardId: string,
    isCorrect: boolean,
    attemptCount: number = 1,
    timeTakenSeconds: number = 0,
    isUserFlashcard: boolean = false
  ) => {
    const qualityScore = getFlashcardReviewQuality(isCorrect, attemptCount, timeTakenSeconds);
    return updateFlashcardSRS(flashcardId, qualityScore, isCorrect, isUserFlashcard);
  }, [updateFlashcardSRS]);

  /**
   * Update SRS from Listen & Choose game
   * Q=2: Correct first listen
   * Q=1: Replay needed
   * Q=0: Wrong
   */
  const updateFromListenChoose = useCallback(async (
    flashcardId: string,
    isCorrect: boolean,
    playCount: number,
    isUserFlashcard: boolean = false
  ) => {
    const qualityScore = getListenChooseQuality(isCorrect, playCount);
    return updateFlashcardSRS(flashcardId, qualityScore, isCorrect, isUserFlashcard);
  }, [updateFlashcardSRS]);

  /**
   * Update SRS from Hangman game
   * Q=2: Perfect (0 wrong)
   * Q=1: ≤3 wrong guesses
   * Q=0: Lost or >5 wrong
   */
  const updateFromHangman = useCallback(async (
    flashcardId: string,
    isComplete: boolean,
    wrongGuesses: number,
    isUserFlashcard: boolean = false
  ) => {
    const qualityScore = getHangmanQuality(isComplete, wrongGuesses);
    return updateFlashcardSRS(flashcardId, qualityScore, isComplete, isUserFlashcard);
  }, [updateFlashcardSRS]);

  /**
   * Update SRS from Vocab Blinder game
   * Q=2: Correct
   * Q=0: Wrong
   */
  const updateFromVocabBlinder = useCallback(async (
    flashcardId: string,
    isCorrect: boolean,
    isUserFlashcard: boolean = false
  ) => {
    const qualityScore = getVocabBlinderQuality(isCorrect);
    return updateFlashcardSRS(flashcardId, qualityScore, isCorrect, isUserFlashcard);
  }, [updateFlashcardSRS]);

  /**
   * Update SRS from Quiz game
   * Q=2: Correct
   * Q=0: Wrong
   */
  const updateFromQuiz = useCallback(async (
    flashcardId: string,
    isCorrect: boolean,
    isUserFlashcard: boolean = false
  ) => {
    const qualityScore = getQuizGameQuality(isCorrect);
    return updateFlashcardSRS(flashcardId, qualityScore, isCorrect, isUserFlashcard);
  }, [updateFlashcardSRS]);

  /**
   * Update SRS from Matching game
   * Q=2: First try correct
   * Q=0: Wrong or not first try
   */
  const updateFromMatching = useCallback(async (
    flashcardId: string,
    isCorrect: boolean,
    isFirstTry: boolean,
    isUserFlashcard: boolean = false
  ) => {
    const qualityScore = getMatchingGameQuality(isCorrect, isFirstTry);
    return updateFlashcardSRS(flashcardId, qualityScore, isCorrect, isUserFlashcard);
  }, [updateFlashcardSRS]);

  /**
   * Batch update SRS for multiple flashcards
   */
  const updateBatchSRS = useCallback(async (results: FlashcardSRSResult[]) => {
    const updates = results.map(result =>
      updateFlashcardSRS(
        result.flashcardId,
        result.qualityScore,
        result.qualityScore > 0,
        result.isUserFlashcard
      )
    );
    return Promise.all(updates);
  }, [updateFlashcardSRS]);

  /**
   * Get flashcards sorted by difficulty (lowest SRS score first)
   */
  const getFlashcardsByDifficulty = useCallback(async (flashcardIds: string[]) => {
    if (flashcardIds.length === 0) return flashcardIds;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return flashcardIds;

    const { data: progressData } = await supabase
      .from('user_flashcard_progress')
      .select('flashcard_id, user_flashcard_id, srs_score')
      .eq('user_id', user.id)
      .or(`flashcard_id.in.(${flashcardIds.join(',')}),user_flashcard_id.in.(${flashcardIds.join(',')})`);

    if (!progressData) return flashcardIds;

    // Create a map of flashcard ID to SRS score
    const scoreMap = new Map<string, number | null>();
    progressData.forEach(p => {
      const id = p.flashcard_id || p.user_flashcard_id;
      if (id) scoreMap.set(id, p.srs_score);
    });

    // Sort: null (unplayed) first, then by lowest score
    return [...flashcardIds].sort((a, b) => {
      const scoreA = scoreMap.get(a);
      const scoreB = scoreMap.get(b);

      // Null (unplayed) cards come first
      if (scoreA === null || scoreA === undefined) return -1;
      if (scoreB === null || scoreB === undefined) return 1;

      // Then sort by lowest score
      return scoreA - scoreB;
    });
  }, []);

  /**
   * Get recommended flashcards for review (due or low score)
   */
  const getRecommendedFlashcards = useCallback(async (
    flashcardIds: string[],
    limit: number = 10
  ) => {
    const sorted = await getFlashcardsByDifficulty(flashcardIds);
    return sorted.slice(0, limit);
  }, [getFlashcardsByDifficulty]);

  /**
   * Get the 15 flashcards with lowest SRS scores for current user
   */
  const getLowestSRSFlashcards = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_flashcard_progress')
      .select(`
        id,
        flashcard_id,
        user_flashcard_id,
        srs_score,
        srs_level,
        times_reviewed,
        times_correct,
        next_review_date
      `)
      .eq('user_id', user.id)
      .order('srs_score', { ascending: true, nullsFirst: true })
      .limit(15);

    if (error) {
      console.error('Error fetching lowest SRS flashcards:', error);
      return [];
    }

    return data || [];
  }, []);

  /**
   * Get all SRS progress for a specific user (admin use)
   */
  const getAllUserSRSProgress = useCallback(async (userId?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const targetUserId = userId || user.id;

    const { data, error } = await supabase
      .from('user_flashcard_progress')
      .select('*')
      .eq('user_id', targetUserId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching user SRS progress:', error);
      return [];
    }

    return data || [];
  }, []);

  return {
    updateFlashcardSRS,
    updateBatchSRS,
    updateFromFlashcardReview,
    updateFromListenChoose,
    updateFromHangman,
    updateFromVocabBlinder,
    updateFromQuiz,
    updateFromMatching,
    getFlashcardsByDifficulty,
    getRecommendedFlashcards,
    getLowestSRSFlashcards,
    getAllUserSRSProgress
  };
}
