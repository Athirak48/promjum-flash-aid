import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { calculateSRS } from '@/utils/srsCalculator';

interface FlashcardProgress {
    id: string;
    flashcard_id: string;
    user_id: string;
    times_reviewed: number;
    srs_level: number;
    srs_score: number;
    easiness_factor: number;
    interval_days: number;
    next_review_date: string;
    last_reviewed_at: string;
    flashcard: {
        id: string;
        front_text: string;
        back_text: string;
        part_of_speech: string;
    };
}

export function useSM2Standard() {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    /**
     * Get all cards that are due for review today
     * (next_review_date <= today)
     */
    const getDueCards = useCallback(async (): Promise<FlashcardProgress[]> => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const today = new Date().toISOString().split('T')[0];

            const { data, error } = await supabase
                .from('user_flashcard_progress')
                .select(`
          *,
          flashcard:user_flashcards(id, front_text, back_text, part_of_speech)
        `)
                .eq('user_id', user.id)
                .lte('next_review_date', today)
                .order('next_review_date', { ascending: true });

            if (error) throw error;

            return (data || []) as unknown as FlashcardProgress[];
        } catch (error: any) {
            console.error('Error fetching due cards:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch due cards',
                variant: 'destructive'
            });
            return [];
        } finally {
            setLoading(false);
        }
    }, [toast]);

    /**
     * Get cards sorted by difficulty (lowest SRS score first)
     * These are the "weak words" that need extra attention
     */
    const getDifficultCards = useCallback(async (limit: number = 15): Promise<FlashcardProgress[]> => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from('user_flashcard_progress')
                .select(`
          *,
          flashcard:user_flashcards(id, front_text, back_text, part_of_speech)
        `)
                .eq('user_id', user.id)
                .gt('times_reviewed', 0) // Only cards that have been reviewed at least once
                .order('srs_score', { ascending: true })
                .limit(limit);

            if (error) throw error;

            return (data || []) as unknown as FlashcardProgress[];
        } catch (error: any) {
            console.error('Error fetching difficult cards:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch difficult cards',
                variant: 'destructive'
            });
            return [];
        } finally {
            setLoading(false);
        }
    }, [toast]);

    /**
     * Get recommended cards for today's review session
     * Combines due cards + some difficult cards for balanced practice
     */
    const getTodayReviewCards = useCallback(async (targetCount: number = 20): Promise<FlashcardProgress[]> => {
        try {
            const dueCards = await getDueCards();

            // If we have enough due cards, just return those
            if (dueCards.length >= targetCount) {
                return dueCards.slice(0, targetCount);
            }

            // Otherwise, supplement with difficult cards
            const remainingSlots = targetCount - dueCards.length;
            const difficultCards = await getDifficultCards(remainingSlots);

            // Combine and deduplicate
            const allCards = [...dueCards];
            const dueCardIds = new Set(dueCards.map(c => c.flashcard_id));

            for (const card of difficultCards) {
                if (!dueCardIds.has(card.flashcard_id) && allCards.length < targetCount) {
                    allCards.push(card);
                }
            }

            return allCards;
        } catch (error: any) {
            console.error('Error fetching today review cards:', error);
            return [];
        }
    }, [getDueCards, getDifficultCards]);

    /**
     * Mark a card as reviewed and update its SRS data
     * @param flashcardId - The flashcard ID
     * @param quality - Quality score (0-3, where 0=wrong, 3=perfect)
     */
    const reviewCard = useCallback(async (
        flashcardId: string,
        quality: number
    ): Promise<boolean> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return false;

            // Get current progress
            const { data: currentProgress, error: fetchError } = await supabase
                .from('user_flashcard_progress')
                .select('*')
                .eq('user_id', user.id)
                .eq('flashcard_id', flashcardId)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                throw fetchError;
            }

            // Calculate new SRS values
            const srsData = currentProgress ? {
                timesReviewed: currentProgress.times_reviewed,
                srsLevel: currentProgress.srs_level,
                srsScore: currentProgress.srs_score,
                easinessFactor: currentProgress.easiness_factor,
                intervalDays: currentProgress.interval_days
            } : {
                timesReviewed: 0,
                srsLevel: 0,
                srsScore: 0,
                easinessFactor: 2.5,
                intervalDays: 0
            };

            const newSRS = calculateSRS(srsData, quality);

            // Calculate next review date
            const nextReviewDate = new Date();
            nextReviewDate.setDate(nextReviewDate.getDate() + newSRS.intervalDays);

            // Track times reviewed separately (not part of SRS algorithm return)
            const newTimesReviewed = (currentProgress?.times_reviewed || 0) + 1;

            // Update or insert progress
            const { error: upsertError } = await supabase
                .from('user_flashcard_progress')
                .upsert({
                    user_id: user.id,
                    flashcard_id: flashcardId,
                    times_reviewed: newTimesReviewed,
                    srs_level: newSRS.srsLevel,
                    srs_score: newSRS.srsScore,
                    easiness_factor: newSRS.easinessFactor,
                    interval_days: newSRS.intervalDays,
                    next_review_date: nextReviewDate.toISOString().split('T')[0],
                    updated_at: new Date().toISOString()
                });

            if (upsertError) throw upsertError;

            return true;
        } catch (error: any) {
            console.error('Error reviewing card:', error);
            toast({
                title: 'Error',
                description: 'Failed to update card progress',
                variant: 'destructive'
            });
            return false;
        }
    }, [toast]);

    return {
        loading,
        getDueCards,
        getDifficultCards,
        getTodayReviewCards,
        reviewCard
    };
}
