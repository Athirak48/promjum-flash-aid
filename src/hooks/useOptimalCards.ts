import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Types
export interface VocabItem {
    id: string;
    front_text: string;
    back_text: string;
    part_of_speech?: string;
    srs_score?: number | null;
    srs_level?: number | null;
    isUserFlashcard?: boolean;
}

export interface ScoredCard {
    card: VocabItem;
    score: number;
    tier: 'critical' | 'due' | 'weak' | 'new';
    daysOverdue?: number;
}

export interface OptimalCardsResult {
    cards: VocabItem[];
    breakdown: {
        critical: number;
        due: number;
        weak: number;
        new: number;
    };
}

export type LearningMode = 'review-only' | 'review-and-new';

// Utility: Shuffle array
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Calculate smart ratio based on user state
function calculateSmartRatio(criticalCount: number, dueCount: number): { review: number; new: number } {
    // Priority 1: ถ้ามี CRITICAL เยอะ → เน้นกู้คืน
    if (criticalCount >= 5) {
        return { review: 0.6, new: 0.4 };
    }

    // Priority 2: ถ้ามี DUE cards มาก → ทบทวนให้หมด
    if (dueCount >= 10) {
        return { review: 0.5, new: 0.5 };
    }

    // Priority 3: ปกติ → เน้นเรียนใหม่
    if (dueCount < 3) {
        return { review: 0.2, new: 0.8 };
    }

    // Default: balanced 30/70
    return { review: 0.3, new: 0.7 };
}

export function useOptimalCards() {
    const [isLoading, setIsLoading] = useState(false);

    const getOptimalCards = useCallback(async (
        totalCount: number,
        mode: LearningMode
    ): Promise<OptimalCardsResult> => {
        setIsLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return { cards: [], breakdown: { critical: 0, due: 0, weak: 0, new: 0 } };
            }

            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];

            // ========================================
            // STEP 1: Fetch cards with progress (for review)
            // ========================================
            const { data: progressCards } = await supabase
                .from('user_flashcard_progress')
                .select(`
          id, srs_score, srs_level, next_review_date, 
          times_reviewed, times_correct,
          flashcard_id, user_flashcard_id,
          flashcards:flashcard_id(id, front_text, back_text, part_of_speech),
          user_flashcards:user_flashcard_id(id, front_text, back_text, part_of_speech)
        `)
                .eq('user_id', user.id)
                .order('next_review_date', { ascending: true })
                .limit(100);

            // ========================================
            // STEP 2: Score each card by priority tier
            // ========================================
            const scoredCards: ScoredCard[] = [];

            progressCards?.forEach(p => {
                const card = (p as any).flashcards || (p as any).user_flashcards;
                if (!card) return;

                const reviewDate = new Date(p.next_review_date || today);
                const daysOverdue = Math.floor((today.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24));
                const accuracy = p.times_reviewed && p.times_reviewed > 0
                    ? (p.times_correct || 0) / p.times_reviewed
                    : 0;

                let score = 0;
                let tier: ScoredCard['tier'] = 'weak';

                // Tier 1: CRITICAL DUE (overdue > 3 days)
                if (daysOverdue > 3) {
                    score = 100 + (daysOverdue * 10);
                    tier = 'critical';
                }
                // Tier 2: STANDARD DUE (due today or passed)
                else if (daysOverdue >= 0) {
                    score = 50 + (daysOverdue * 5);
                    tier = 'due';
                }
                // Tier 3: WEAK (low level or accuracy)
                else if ((p.srs_level || 0) <= 2 || accuracy < 0.6) {
                    score = 30 - ((p.srs_level || 0) * 5);
                    tier = 'weak';
                }
                // Not due yet and not weak, skip for review
                else {
                    return;
                }

                scoredCards.push({
                    card: {
                        id: card.id,
                        front_text: card.front_text,
                        back_text: card.back_text,
                        part_of_speech: card.part_of_speech,
                        srs_score: p.srs_score,
                        srs_level: p.srs_level,
                        isUserFlashcard: !!p.user_flashcard_id
                    },
                    score,
                    tier,
                    daysOverdue
                });
            });

            // ========================================
            // STEP 3: Handle based on mode
            // ========================================

            const criticalCount = scoredCards.filter(c => c.tier === 'critical').length;
            const dueCount = scoredCards.filter(c => c.tier === 'due').length;
            const weakCount = scoredCards.filter(c => c.tier === 'weak').length;

            // Sort by score (highest priority first)
            scoredCards.sort((a, b) => b.score - a.score);

            let finalCards: ScoredCard[] = [];
            let breakdown = { critical: 0, due: 0, weak: 0, new: 0 };

            if (mode === 'review-only') {
                // ====== REVIEW ONLY MODE ======
                // Take top-scored review cards
                finalCards = scoredCards.slice(0, totalCount);

                // Count breakdown
                breakdown.critical = finalCards.filter(c => c.tier === 'critical').length;
                breakdown.due = finalCards.filter(c => c.tier === 'due').length;
                breakdown.weak = finalCards.filter(c => c.tier === 'weak').length;
                breakdown.new = 0;

            } else {
                // ====== REVIEW + NEW MODE ======
                // Calculate smart ratio
                const ratio = calculateSmartRatio(criticalCount, dueCount);
                const reviewSlots = Math.ceil(totalCount * ratio.review);
                const newSlots = totalCount - reviewSlots;

                // Select review cards
                const reviewCards = scoredCards.slice(0, reviewSlots);

                // Get new cards
                const seenCardIds = progressCards?.map(p => p.flashcard_id || p.user_flashcard_id).filter(Boolean) || [];

                let newCards: VocabItem[] = [];

                // Try system flashcards first
                if (seenCardIds.length > 0) {
                    const { data: systemNewCards } = await supabase
                        .from('flashcards')
                        .select('id, front_text, back_text, part_of_speech')
                        .not('id', 'in', `(${seenCardIds.join(',')})`)
                        .limit(newSlots);

                    if (systemNewCards) {
                        newCards = systemNewCards.map(c => ({
                            id: c.id,
                            front_text: c.front_text,
                            back_text: c.back_text,
                            part_of_speech: c.part_of_speech,
                            srs_score: null,
                            srs_level: null,
                            isUserFlashcard: false
                        }));
                    }
                } else {
                    // No seen cards, get any flashcards
                    const { data: anyCards } = await supabase
                        .from('flashcards')
                        .select('id, front_text, back_text, part_of_speech')
                        .limit(newSlots);

                    if (anyCards) {
                        newCards = anyCards.map(c => ({
                            id: c.id,
                            front_text: c.front_text,
                            back_text: c.back_text,
                            part_of_speech: c.part_of_speech,
                            srs_score: null,
                            srs_level: null,
                            isUserFlashcard: false
                        }));
                    }
                }

                // Also try user flashcards
                if (newCards.length < newSlots) {
                    const remaining = newSlots - newCards.length;
                    const existingIds = [...seenCardIds, ...newCards.map(c => c.id)];

                    const { data: userNewCards } = await supabase
                        .from('user_flashcards')
                        .select('id, front_text, back_text, part_of_speech')
                        .eq('user_id', user.id)
                        .limit(remaining);

                    if (userNewCards) {
                        const filteredUserCards = userNewCards
                            .filter(c => !existingIds.includes(c.id))
                            .map(c => ({
                                id: c.id,
                                front_text: c.front_text,
                                back_text: c.back_text,
                                part_of_speech: c.part_of_speech,
                                srs_score: null,
                                srs_level: null,
                                isUserFlashcard: true
                            }));
                        newCards = [...newCards, ...filteredUserCards];
                    }
                }

                // Combine and set breakdown
                finalCards = [
                    ...reviewCards,
                    ...newCards.slice(0, newSlots).map(c => ({
                        card: c,
                        score: 10,
                        tier: 'new' as const
                    }))
                ];

                breakdown.critical = reviewCards.filter(c => c.tier === 'critical').length;
                breakdown.due = reviewCards.filter(c => c.tier === 'due').length;
                breakdown.weak = reviewCards.filter(c => c.tier === 'weak').length;
                breakdown.new = Math.min(newCards.length, newSlots);
            }

            // ========================================
            // STEP 4: Session Fatigue Ordering
            // ========================================
            // Hard cards first (CRITICAL, DUE), then easier (WEAK, NEW)
            const sortedByFatigue = [
                ...finalCards.filter(c => c.tier === 'critical'),
                ...finalCards.filter(c => c.tier === 'due'),
                ...shuffleArray(finalCards.filter(c => c.tier === 'weak')),
                ...shuffleArray(finalCards.filter(c => c.tier === 'new'))
            ];

            return {
                cards: sortedByFatigue.slice(0, totalCount).map(c => c.card),
                breakdown
            };

        } catch (error) {
            console.error('Error getting optimal cards:', error);
            return { cards: [], breakdown: { critical: 0, due: 0, weak: 0, new: 0 } };
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { getOptimalCards, isLoading };
}
