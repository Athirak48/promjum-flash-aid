import { useCallback } from 'react';

export interface FlashcardSRSResult {
  flashcardId: string;
  qualityScore: number;
  isUserFlashcard?: boolean;
}

export function useSRSProgress() {
  const updateFlashcardSRS = useCallback(async () => null, []);
  const updateBatchSRS = useCallback(async () => [], []);
  const updateFromFlashcardReview = useCallback(async () => null, []);
  const updateFromListenChoose = useCallback(async () => null, []);
  const updateFromHangman = useCallback(async () => null, []);
  const updateFromVocabBlinder = useCallback(async () => null, []);
  const updateFromQuiz = useCallback(async () => null, []);
  const updateFromMatching = useCallback(async () => null, []);

  // Return input list without sorting/filtering
  const getFlashcardsByDifficulty = useCallback(async (ids: string[]) => ids, []);
  const getRecommendedFlashcards = useCallback(async (ids: string[], limit: number = 10) => ids.slice(0, limit), []);
  const getLowestSRSFlashcards = useCallback(async () => [], []);
  const getAllUserSRSProgress = useCallback(async () => [], []);

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
