import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { calculateSRS } from '@/utils/srsCalculator';
import type { StudyGoal } from '@/types/goals';

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

interface DailyTarget {
    newCards: number;
    reviewCards: number;
    totalCards: number;
    estimatedMinutes: number;
}

interface PrioritizedCard extends FlashcardProgress {
    priority_score: number;
    priority_reason: 'weak' | 'new' | 'due' | 'early_review';
}

export function useSM2FocusMode(goal: StudyGoal | null) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    /**
     * Calculate daily target based on goal progress and remaining time
     * Implements "Front-Loading" strategy (80% rule)
     */
    const calculateDailyTarget = useCallback((): DailyTarget => {
        if (!goal) {
            return { newCards: 0, reviewCards: 0, totalCards: 0, estimatedMinutes: 0 };
        }

        const daysRemaining = goal.duration_days - (goal.current_day - 1);
        const cardsRemaining = goal.target_words - goal.words_learned;
        const totalSessions = goal.duration_days * goal.sessions_per_day;
        const currentSession = ((goal.current_day - 1) * goal.sessions_per_day) + 1;

        // Front-Loading Logic: Finish all new content by 80% of timeline
        const frontLoadingThreshold = Math.floor(totalSessions * 0.8);
        const isInFrontLoadingPhase = currentSession <= frontLoadingThreshold;

        let newCardsToday = 0;
        if (isInFrontLoadingPhase && cardsRemaining > 0) {
            const sessionsLeftInPhase = frontLoadingThreshold - currentSession + 1;
            newCardsToday = Math.ceil(cardsRemaining / Math.max(1, sessionsLeftInPhase));
        }

        // Review cards: Estimate based on SRS algorithm
        // Typically ~30-50% of learned cards need review
        const estimatedReviewCards = Math.floor(goal.words_learned * 0.4);

        const totalCards = newCardsToday + estimatedReviewCards;
        const estimatedMinutes = totalCards * 1.5; // ~1.5 min per card avg

        return {
            newCards: newCardsToday,
            reviewCards: estimatedReviewCards,
            totalCards,
            estimatedMinutes: Math.ceil(estimatedMinutes)
        };
    }, [goal]);

    /**
     * Get prioritized cards for today's focus session
     * Priority: Weak > New > Due > Early Review
     */
    const getTodayFocusCards = useCallback(async (deckIds: string[]): Promise<PrioritizedCard[]> => {
        if (!goal || deckIds.length === 0) return [];

        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const target = calculateDailyTarget();
            const today = new Date().toISOString().split('T')[0];

            // Fetch all flashcards from the goal's decks
            const { data: allCards, error: cardsError } = await supabase
                .from('user_flashcards')
                .select('id, front_text, back_text, part_of_speech, flashcard_set_id')
                .in('flashcard_set_id', deckIds)
                .limit(500);

            if (cardsError) throw cardsError;
            if (!allCards || allCards.length === 0) return [];

            const cardIds = allCards.map(c => c.id);

            // Fetch progress for these cards
            const { data: progressData, error: progressError } = await supabase
                .from('user_flashcard_progress')
                .select('*')
                .eq('user_id', user.id)
                .in('flashcard_id', cardIds);

            if (progressError) throw progressError;

            // Create progress map
            const progressMap = new Map(
                (progressData || []).map(p => [p.flashcard_id, p])
            );

            // Categorize and prioritize cards
            const prioritizedCards: PrioritizedCard[] = [];

            for (const card of allCards) {
                const progress = progressMap.get(card.id);

                let priorityScore = 0;
                let priorityReason: 'weak' | 'new' | 'due' | 'early_review' = 'new';

                if (!progress || progress.times_reviewed === 0) {
                    // NEW CARD
                    priorityScore = 50;
                    priorityReason = 'new';
                } else {
                    // Calculate priority based on SRS data
                    const isWeak = progress.srs_score < 5 || progress.srs_level < 3;
                    const isDue = progress.next_review_date <= today;
                    const daysSinceReview = progress.updated_at
                        ? Math.floor((Date.now() - new Date(progress.updated_at).getTime()) / (1000 * 60 * 60 * 24))
                        : 0;

                    if (isWeak) {
                        // WEAK CARD (Highest priority)
                        priorityScore = 100 - progress.srs_score;
                        priorityReason = 'weak';
                    } else if (isDue) {
                        // DUE CARD
                        priorityScore = 60 + daysSinceReview;
                        priorityReason = 'due';
                    } else {
                        // EARLY REVIEW
                        priorityScore = 20;
                        priorityReason = 'early_review';
                    }
                }

                prioritizedCards.push({
                    id: progress?.id || '',
                    flashcard_id: card.id,
                    user_id: user.id,
                    times_reviewed: progress?.times_reviewed || 0,
                    srs_level: progress?.srs_level || 0,
                    srs_score: progress?.srs_score || 0,
                    easiness_factor: progress?.easiness_factor || 2.5,
                    interval_days: progress?.interval_days || 0,
                    next_review_date: progress?.next_review_date || today,
                    last_reviewed_at: progress?.updated_at || '',
                    flashcard: {
                        id: card.id,
                        front_text: card.front_text,
                        back_text: card.back_text,
                        part_of_speech: card.part_of_speech
                    },
                    priority_score: priorityScore,
                    priority_reason: priorityReason
                });
            }

            // Sort by priority (highest first)
            prioritizedCards.sort((a, b) => b.priority_score - a.priority_score);

            // Dynamic Selection Logic (Elastic Catch-up + Safety Brake)

            const weakCards = prioritizedCards.filter(c => c.priority_reason === 'weak');
            const dueCards = prioritizedCards.filter(c => c.priority_reason === 'due');

            // EMERGENCY BRAKE: If user is struggling (Too many weak cards), stop adding new stuff.
            // If Weak Cards > 15: STOP NEW CARDS completely. Focus on repair.
            // If Weak Cards > 8: Reduce New Cards by 50%.
            let adjustedNewTarget = target.newCards;

            if (weakCards.length > 15) {
                adjustedNewTarget = 0;
            } else if (weakCards.length > 8) {
                adjustedNewTarget = Math.floor(target.newCards / 2);
            }

            // 1. Must Do: Weak + Due
            const mustDoCards = [...weakCards, ...dueCards];

            // 2. New Cards (Throttled)
            const newCards = prioritizedCards
                .filter(c => c.priority_reason === 'new')
                .slice(0, adjustedNewTarget);

            // 3. Combine
            let selectedCards = [...mustDoCards, ...newCards];

            // 4. Fill if under target (only if not braking)
            if (selectedCards.length < target.totalCards && weakCards.length <= 15) {
                const remainingSlots = target.totalCards - selectedCards.length;
                const extras = prioritizedCards.filter(c =>
                    !selectedCards.find(s => s.id === c.id) // Not already selected
                ).slice(0, remainingSlots);
                selectedCards = [...selectedCards, ...extras];
            }

            // Remove duplicates (just in case) and return
            // Use simplistic unique check in case IDs duped
            const uniqueCards = new Map();
            selectedCards.forEach(c => uniqueCards.set(c.id, c));
            return Array.from(uniqueCards.values());
        } catch (error: any) {
            console.error('Error fetching focus cards:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch focus cards',
                variant: 'destructive'
            });
            return [];
        } finally {
            setLoading(false);
        }
    }, [goal, calculateDailyTarget, toast]);

    /**
     * Review a card within Focus Mode context
     * Applies deadline compression to interval calculation
     */
    const reviewFocusCard = useCallback(async (
        flashcardId: string,
        quality: number
    ): Promise<boolean> => {
        if (!goal) return false;

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

            // Track times reviewed separately
            const newTimesReviewed = (currentProgress?.times_reviewed || 0) + 1;

            // DEADLINE COMPRESSION LOGIC
            const daysRemaining = goal.duration_days - (goal.current_day - 1);
            let compressedInterval = newSRS.intervalDays;

            if (daysRemaining < 7) {
                // If deadline is near, compress intervals
                const maxInterval = Math.floor(daysRemaining / 2);
                compressedInterval = Math.min(newSRS.intervalDays, maxInterval);
            }

            // Calculate next review date
            const nextReviewDate = new Date();
            nextReviewDate.setDate(nextReviewDate.getDate() + compressedInterval);

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
                    interval_days: compressedInterval, // Use compressed interval
                    next_review_date: nextReviewDate.toISOString().split('T')[0],
                    updated_at: new Date().toISOString()
                });

            if (upsertError) throw upsertError;

            return true;
        } catch (error: any) {
            console.error('Error reviewing focus card:', error);
            toast({
                title: 'Error',
                description: 'Failed to update card progress',
                variant: 'destructive'
            });
            return false;
        }
    }, [goal, toast]);

    return {
        loading,
        calculateDailyTarget,
        getTodayFocusCards,
        reviewFocusCard
    };
}
