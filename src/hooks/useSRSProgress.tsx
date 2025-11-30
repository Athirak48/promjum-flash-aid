import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  calculateSRS, 
  normalizeQuality,
  getFlashcardReviewQuality,
  getListenChooseQuality,
  getHangmanQuality,
  getVocabBlinderQuality,
  getQuizGameQuality,
  getMatchingGameQuality
} from '@/utils/srsCalculator';

export interface FlashcardSRSResult {
  flashcardId: string;
  qualityScore: number;
  isUserFlashcard?: boolean;
}

export function useSRSProgress() {
  /**
   * Update SRS progress for a single flashcard (supports both system and user flashcards)
   */
  const updateFlashcardSRS = useCallback(async (
    flashcardId: string,
    qualityScore: number,
    isUserFlashcard: boolean = true // Default to user flashcard since most reviews are user cards
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Normalize quality score
      const q = normalizeQuality(qualityScore);

      // Build query based on flashcard type
      const idColumn = isUserFlashcard ? 'user_flashcard_id' : 'flashcard_id';
      
      // Get existing progress
      const { data: existing } = await supabase
        .from('user_flashcard_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq(idColumn, flashcardId)
        .single();

      // Calculate new SRS values
      const srsResult = calculateSRS({
        easinessFactor: existing?.easiness_factor ?? 2.5,
        intervalDays: existing?.interval_days ?? 1,
        srsLevel: existing?.srs_level ?? 0,
        srsScore: existing?.srs_score ?? 0,
      }, q);

      const updateData: Record<string, any> = {
        user_id: user.id,
        easiness_factor: srsResult.easinessFactor,
        interval_days: srsResult.intervalDays,
        srs_level: srsResult.srsLevel,
        srs_score: srsResult.srsScore,
        next_review_date: srsResult.nextReviewDate.toISOString(),
        last_review_score: q,
        times_reviewed: (existing?.times_reviewed ?? 0) + 1,
        times_correct: (existing?.times_correct ?? 0) + (q >= 3 ? 1 : 0),
        updated_at: new Date().toISOString()
      };

      // Set the appropriate flashcard ID column
      if (isUserFlashcard) {
        updateData.user_flashcard_id = flashcardId;
        updateData.flashcard_id = null;
      } else {
        updateData.flashcard_id = flashcardId;
        updateData.user_flashcard_id = null;
      }

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('user_flashcard_progress')
          .update(updateData)
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('user_flashcard_progress')
          .insert(updateData as any);

        if (error) throw error;
      }

      return srsResult;
    } catch (error) {
      console.error('Error updating SRS progress:', error);
      return null;
    }
  }, []);

  /**
   * Batch update SRS progress for multiple flashcards
   */
  const updateBatchSRS = useCallback(async (
    results: FlashcardSRSResult[]
  ) => {
    const promises = results.map(result => 
      updateFlashcardSRS(result.flashcardId, result.qualityScore, result.isUserFlashcard ?? true)
    );
    return Promise.all(promises);
  }, [updateFlashcardSRS]);

  /**
   * Update SRS from Flashcard Review (default: user flashcards)
   */
  const updateFromFlashcardReview = useCallback(async (
    flashcardId: string,
    isCorrect: boolean,
    attemptCount: number,
    isUserFlashcard: boolean = true
  ) => {
    const quality = getFlashcardReviewQuality(isCorrect, attemptCount);
    return updateFlashcardSRS(flashcardId, quality, isUserFlashcard);
  }, [updateFlashcardSRS]);

  /**
   * Update SRS from Listen & Choose game
   */
  const updateFromListenChoose = useCallback(async (
    flashcardId: string,
    isCorrect: boolean,
    playCount: number,
    isUserFlashcard: boolean = true
  ) => {
    const quality = getListenChooseQuality(isCorrect, playCount);
    return updateFlashcardSRS(flashcardId, quality, isUserFlashcard);
  }, [updateFlashcardSRS]);

  /**
   * Update SRS from Hangman game
   */
  const updateFromHangman = useCallback(async (
    flashcardId: string,
    isComplete: boolean,
    wrongGuesses: number,
    isUserFlashcard: boolean = true
  ) => {
    const quality = getHangmanQuality(isComplete, wrongGuesses);
    return updateFlashcardSRS(flashcardId, quality, isUserFlashcard);
  }, [updateFlashcardSRS]);

  /**
   * Update SRS from Vocab Blinder game
   */
  const updateFromVocabBlinder = useCallback(async (
    flashcardId: string,
    isCorrect: boolean,
    isUserFlashcard: boolean = true
  ) => {
    const quality = getVocabBlinderQuality(isCorrect);
    return updateFlashcardSRS(flashcardId, quality, isUserFlashcard);
  }, [updateFlashcardSRS]);

  /**
   * Update SRS from Quiz game
   */
  const updateFromQuiz = useCallback(async (
    flashcardId: string,
    isCorrect: boolean,
    isUserFlashcard: boolean = true
  ) => {
    const quality = getQuizGameQuality(isCorrect);
    return updateFlashcardSRS(flashcardId, quality, isUserFlashcard);
  }, [updateFlashcardSRS]);

  /**
   * Update SRS from Matching game
   */
  const updateFromMatching = useCallback(async (
    flashcardId: string,
    isCorrect: boolean,
    isFirstTry: boolean,
    isUserFlashcard: boolean = true
  ) => {
    const quality = getMatchingGameQuality(isCorrect, isFirstTry);
    return updateFlashcardSRS(flashcardId, quality, isUserFlashcard);
  }, [updateFlashcardSRS]);

  /**
   * Get user flashcards sorted by SRS score (lowest first = needs review)
   */
  const getFlashcardsByDifficulty = useCallback(async (
    flashcardIds: string[],
    isUserFlashcards: boolean = true
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return flashcardIds;

      const idColumn = isUserFlashcards ? 'user_flashcard_id' : 'flashcard_id';
      
      const { data: progress } = await supabase
        .from('user_flashcard_progress')
        .select(`${idColumn}, srs_score`)
        .eq('user_id', user.id)
        .in(idColumn, flashcardIds);

      // Create a map of flashcard_id to srs_score
      const scoreMap = new Map<string, number | null>();
      progress?.forEach((p: any) => {
        const id = p[idColumn];
        if (id) scoreMap.set(id, p.srs_score);
      });

      // Sort flashcards: null/none first (never reviewed), then by lowest score
      return [...flashcardIds].sort((a, b) => {
        const scoreA = scoreMap.get(a) ?? -1;  // null = -1 (highest priority)
        const scoreB = scoreMap.get(b) ?? -1;
        return scoreA - scoreB;  // Lower score = higher priority
      });
    } catch (error) {
      console.error('Error getting flashcards by difficulty:', error);
      return flashcardIds;
    }
  }, []);

  /**
   * Get recommended flashcards for review (due for review or low score)
   */
  const getRecommendedFlashcards = useCallback(async (
    flashcardIds: string[],
    limit: number = 10,
    isUserFlashcards: boolean = true
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return flashcardIds.slice(0, limit);

      const idColumn = isUserFlashcards ? 'user_flashcard_id' : 'flashcard_id';

      const { data: progress } = await supabase
        .from('user_flashcard_progress')
        .select(`${idColumn}, srs_score, next_review_date`)
        .eq('user_id', user.id)
        .in(idColumn, flashcardIds);

      const now = new Date();
      const scoreMap = new Map<string, { score: number | null, isDue: boolean }>();
      
      progress?.forEach((p: any) => {
        const id = p[idColumn];
        if (!id) return;
        const nextReview = p.next_review_date ? new Date(p.next_review_date) : null;
        const isDue = !nextReview || nextReview <= now;
        scoreMap.set(id, { score: p.srs_score, isDue });
      });

      // Sort: due for review first, then by lowest score, then never reviewed
      const sorted = [...flashcardIds].sort((a, b) => {
        const dataA = scoreMap.get(a);
        const dataB = scoreMap.get(b);
        
        // Never reviewed cards first
        if (!dataA && !dataB) return 0;
        if (!dataA) return -1;
        if (!dataB) return 1;
        
        // Due cards next
        if (dataA.isDue && !dataB.isDue) return -1;
        if (!dataA.isDue && dataB.isDue) return 1;
        
        // Sort by score (lower = harder = higher priority)
        const scoreA = dataA.score ?? 0;
        const scoreB = dataB.score ?? 0;
        return scoreA - scoreB;
      });

      return sorted.slice(0, limit);
    } catch (error) {
      console.error('Error getting recommended flashcards:', error);
      return flashcardIds.slice(0, limit);
    }
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
    getRecommendedFlashcards
  };
}
