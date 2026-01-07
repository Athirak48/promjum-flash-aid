import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { WeakWord } from '@/types/assessment';

export function useWeakWords(user_id?: string) {
    const [weakWords, setWeakWords] = useState<WeakWord[]>([]);
    const [loading, setLoading] = useState(false);

    // Get weak words based on user_flashcard_progress
    const getWeakWords = useCallback(async (limit: number = 50): Promise<WeakWord[]> => {
        if (!user_id) return [];

        setLoading(true);
        try {
            // FIX 2: Query BOTH flashcard tables (shared + user decks)

            // Query 1: Shared flashcards (front field)
            const { data: sharedData, error: sharedError } = await supabase
                .from('user_flashcard_progress')
                .select(`
                    flashcard_id,
                    times_reviewed,
                    times_correct,
                    interval_days,
                    updated_at,
                    flashcards!inner (
                        front
                    )
                `)
                .eq('user_id', user_id)
                .gt('times_reviewed', 0)
                .order('times_correct', { ascending: true })
                .limit(limit * 3);

            // Query 2: User flashcards (front_text field)
            const { data: userData, error: userError } = await supabase
                .from('user_flashcard_progress')
                .select(`
                    flashcard_id,
                    times_reviewed,
                    times_correct,
                    interval_days,
                    updated_at,
                    user_flashcards!inner (
                        front_text
                    )
                `)
                .eq('user_id', user_id)
                .gt('times_reviewed', 0)
                .order('times_correct', { ascending: true })
                .limit(limit * 3);

            // Merge both results
            const combinedData = [
                ...(sharedData || []).map(item => ({
                    ...item,
                    word: item.flashcards?.front || 'Unknown'
                })),
                ...(userData || []).map(item => ({
                    ...item,
                    word: item.user_flashcards?.front_text || 'Unknown'
                }))
            ];

            // Calculate difficulty score and filter
            const weakWordsData: WeakWord[] = combinedData
                .map(item => {
                    const accuracy = item.times_reviewed > 0
                        ? item.times_correct / item.times_reviewed
                        : 0;

                    // Difficulty score: lower accuracy + shorter intervals = higher score
                    const intervalFactor = Math.max(0, (7 - (item.interval_days || 0)) / 7);
                    const accuracyFactor = 1 - accuracy;
                    const difficulty_score = (accuracyFactor * 0.7) + (intervalFactor * 0.3);

                    return {
                        flashcard_id: item.flashcard_id,
                        word: item.word,
                        times_wrong: item.times_reviewed - item.times_correct,
                        last_wrong_at: item.updated_at || new Date().toISOString(),
                        difficulty_score,
                    };
                })
                .filter(w => w.difficulty_score > 0.3 && w.word !== 'Unknown') // Filter out unknowns
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
    }, [user_id]);

    // Get weak words from assessment
    const getWeakWordsFromAssessment = useCallback(async (
        assessment_id: string
    ): Promise<string[]> => {
        try {
            const { data, error } = await supabase
                .from('assessment_answers')
                .select('flashcard_id, flashcards(front_text)')
                .eq('assessment_id', assessment_id)
                .eq('is_correct', false);

            if (error) throw error;
            return (data || []).map(item => item.flashcards?.front_text || 'Unknown');
        } catch (err) {
            console.error('Error fetching weak words from assessment:', err);
            return [];
        }
    }, []);

    // Auto-fetch on mount if user_id provided
    useEffect(() => {
        if (user_id) {
            getWeakWords(50);
        }
    }, [user_id, getWeakWords]);

    return {
        weakWords,
        loading,
        getWeakWords,
        getWeakWordsFromAssessment,
    };
}
