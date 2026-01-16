import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { WeakWord } from '@/types/assessment';

export function useWeakWords(user_id?: string, deckIds?: string[], goalCreatedAt?: string) {
    const [weakWords, setWeakWords] = useState<WeakWord[]>([]);
    const [loading, setLoading] = useState(false);

    // Get weak words based on user_flashcard_progress
    // FILTER: Only count progress made WITHIN this goal's context (after goal creation)
    const getWeakWords = useCallback(async (limit: number = 50): Promise<WeakWord[]> => {
        if (!user_id) return [];

        setLoading(true);
        try {
            // FIX 2: Query BOTH flashcard tables (shared + user decks)
            // FIX 3: Filter by deckIds if provided (Goal-specific filtering)

            // Step 1: Get flashcard IDs from selected decks (if deckIds provided)
            let allowedFlashcardIds: Set<string> | null = null;

            if (deckIds && deckIds.length > 0) {
                // Get flashcard IDs from user decks (folder_id matches deckIds)
                const { data: userSets } = await supabase
                    .from('user_flashcard_sets')
                    .select('id')
                    .in('folder_id', deckIds) as { data: { id: string }[] | null };

                if (userSets && userSets.length > 0) {
                    const setIds = userSets.map(s => s.id);
                    const { data: userCards } = await supabase
                        .from('user_flashcards')
                        .select('id')
                        .in('flashcard_set_id', setIds);

                    allowedFlashcardIds = new Set((userCards || []).map(c => c.id));
                }

                // Also get shared flashcard IDs from same deck
                const { data: sharedCards } = await supabase
                    .from('flashcards')
                    .select('id')
                    .in('subdeck_id', deckIds);

                if (sharedCards && sharedCards.length > 0) {
                    if (!allowedFlashcardIds) allowedFlashcardIds = new Set();
                    sharedCards.forEach(c => allowedFlashcardIds!.add(c.id));
                }
            }

            // Query 1: Shared flashcards (front_text field)
            let sharedQuery = supabase
                .from('user_flashcard_progress')
                .select(`
                    flashcard_id,
                    times_reviewed,
                    times_correct,
                    interval_days,
                    updated_at,
                    srs_score,
                    flashcards!inner (
                        front_text,
                        back_text
                    )
                `)
                .eq('user_id', user_id)
                .gt('times_reviewed', 0)
                .order('times_correct', { ascending: true })
                .limit(limit * 3);

            // Apply deck filter if we have allowed IDs
            if (allowedFlashcardIds && allowedFlashcardIds.size > 0) {
                sharedQuery = sharedQuery.in('flashcard_id', Array.from(allowedFlashcardIds));
            }

            // CRITICAL FIX: Filter by goal creation timestamp
            // Only count progress made AFTER this goal was created (excludes Pre-Test and other goals)
            if (goalCreatedAt) {
                sharedQuery = sharedQuery.gte('updated_at', goalCreatedAt);
            }

            const { data: sharedData, error: sharedError } = await sharedQuery;

            // Query 2: User flashcards (front_text field)
            let userQuery = supabase
                .from('user_flashcard_progress')
                .select(`
                    flashcard_id,
                    times_reviewed,
                    times_correct,
                    interval_days,
                    updated_at,
                    srs_score,
                    user_flashcards!inner (
                        front_text,
                        back_text
                    )
                `)
                .eq('user_id', user_id)
                .gt('times_reviewed', 0)
                .order('times_correct', { ascending: true })
                .limit(limit * 3);

            // Apply deck filter if we have allowed IDs
            if (allowedFlashcardIds && allowedFlashcardIds.size > 0) {
                userQuery = userQuery.in('flashcard_id', Array.from(allowedFlashcardIds));
            }

            // CRITICAL FIX: Filter by goal creation timestamp
            // Only count progress made AFTER this goal was created (excludes Pre-Test and other goals)
            if (goalCreatedAt) {
                userQuery = userQuery.gte('updated_at', goalCreatedAt);
            }

            const { data: userData, error: userError } = await userQuery;

            // Merge both results
            const combinedData = [
                ...(sharedData || []).map((item: any) => ({
                    ...item,
                    word: item.flashcards?.front_text || 'Unknown',
                    translation: item.flashcards?.back_text || ''
                })),
                ...(userData || []).map((item: any) => ({
                    ...item,
                    word: item.user_flashcards?.front_text || 'Unknown',
                    translation: item.user_flashcards?.back_text || ''
                }))
            ];

            // Calculate difficulty score and filter
            const weakWordsData: WeakWord[] = combinedData
                .map(item => {
                    const accuracy = item.times_reviewed > 0
                        ? item.times_correct / item.times_reviewed
                        : 0;

                    // IMPROVED ALGORITHM: "Danger Score"
                    // 1. Accuracy Impact (70%): Base risk on how often we fail
                    const accuracyRisk = (1 - accuracy) * 0.7;

                    // 2. Leech Factor (20%): Chronic failures (>3 wrong) amplify risk
                    const timesWrong = item.times_reviewed - item.times_correct;
                    const leechRisk = Math.min(0.2, (timesWrong / 10)); // Cap at 10 wrongs

                    // 3. Urgency (10%): Score drops -> Danger increases
                    // Lower srs_score implies forgotten state
                    const scoreRisk = Math.max(0, (15 - (item.srs_score || 0)) / 150); // 0.1 max

                    const difficulty_score = accuracyRisk + leechRisk + scoreRisk;

                    return {
                        flashcard_id: item.flashcard_id,
                        word: item.word,
                        translation: item.translation,
                        times_wrong: timesWrong,
                        last_wrong_at: item.updated_at || new Date().toISOString(),
                        difficulty_score,
                    };
                })
                // TUNED THRESHOLD: 
                // > 0.4 (40%) Risk Score
                // Meaning: You need to be failing about >50% of the time for it to be a "Risk".
                // Keeps the list focused on specific problem words, not just "new" words.
                .filter(w => w.difficulty_score > 0.4 && w.word !== 'Unknown')
                .sort((a, b) => b.difficulty_score - a.difficulty_score)
                .slice(0, limit);

            setWeakWords(weakWordsData);
            return weakWordsData;
        } catch (err) {
            console.error('Error fetching weak words:', err);
            return [];
        } finally {
            setLoading(false);
        }
    }, [user_id, deckIds, goalCreatedAt]);

    // Get weak words from assessment
    // Note: assessment_answers table doesn't exist in current schema
    const getWeakWordsFromAssessment = useCallback(async (
        _assessment_id: string
    ): Promise<string[]> => {
        // This function is a placeholder since assessment_answers table doesn't exist
        console.log('getWeakWordsFromAssessment called but assessment_answers table not available');
        return [];
    }, []);

    // Auto-fetch on mount if user_id provided
    useEffect(() => {
        if (user_id) {
            getWeakWords(50);
        }
    }, [user_id, deckIds, goalCreatedAt, getWeakWords]);

    return {
        weakWords,
        loading,
        getWeakWords,
        getWeakWordsFromAssessment,
    };
}
