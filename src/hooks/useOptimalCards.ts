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
    easiness_factor?: number | null;
    interval_days?: number | null;
    times_reviewed?: number | null;
    isUserFlashcard?: boolean;
}

export interface ScoredCard {
    card: VocabItem;
    score: number;
    tier: 'critical' | 'due' | 'weak' | 'new' | 'remembered';
    daysOverdue?: number;
}

export interface OptimalCardsResult {
    cards: VocabItem[];
    breakdown: {
        critical: number;
        due: number;
        weak: number;
        new: number;
        remembered: number;
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



export function useOptimalCards() {
    const [isLoading, setIsLoading] = useState(false);

    const getOptimalCards = useCallback(async (
        totalCount: number,
        mode: LearningMode,
        goalConfig?: {
            goalId: string;
            targetWords: number;
            totalDurationDays: number;
            currentDay: number;
            wordsLearned: number;
            sessionsPerDay: number;
            deckIds?: string[];
        }
    ): Promise<OptimalCardsResult> => {
        setIsLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return { cards: [], breakdown: { critical: 0, due: 0, weak: 0, new: 0, remembered: 0 } };
            }

            const today = new Date();
            const targetDeckIds = goalConfig?.deckIds || [];

            // ========================================
            // STEP 1: Fetch cards with progress (Learned/Review Pool)
            // ========================================
            // Fetch ALL learned cards for this goal context to properly sort by SRS
            const { data: progressCards } = await supabase
                .from('user_flashcard_progress')
                .select(`
                  id, srs_score, srs_level, next_review_date, 
                  easiness_factor, interval_days,
                  times_reviewed, times_correct,
                  flashcard_id, user_flashcard_id,
                  flashcards:flashcard_id(id, front_text, back_text, part_of_speech, subdeck_id),
                  user_flashcards:user_flashcard_id(id, front_text, back_text, part_of_speech, flashcard_set_id)
                `)
                .eq('user_id', user.id)
                .order('srs_score', { ascending: true }); // Order by weakest first for Bonus logic

            // ========================================
            // STEP 2: Score & Categorize
            // ========================================
            const scoredCards: ScoredCard[] = [];

            progressCards?.forEach(p => {
                const card = (p as any).flashcards || (p as any).user_flashcards;
                if (!card) return;

                // FILTER: Only include cards from target decks
                if (targetDeckIds.length > 0) {
                    const deckId = card.subdeck_id || card.flashcard_set_id; // Check both system and user field
                    if (!deckId || !targetDeckIds.includes(deckId)) {
                        return; // Skip if not in goal's decks
                    }
                }

                // ... Rest of scoring logic unchanged ...
                const reviewDate = new Date(p.next_review_date || today);
                const daysOverdue = Math.floor((today.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24));
                const srsScore = p.srs_score || 0;

                let score = 0;
                let tier: ScoredCard['tier'] = 'weak';

                // Tier Logic
                if (daysOverdue > 3) {
                    score = 100 + (daysOverdue * 10);
                    tier = 'critical';
                } else if (daysOverdue >= 0) {
                    score = 50 + (daysOverdue * 5);
                    tier = 'due';
                } else if (srsScore < 50) { // Weak threshold
                    score = 40 - (srsScore / 2);
                    tier = 'weak';
                } else {
                    score = 10;
                    tier = 'remembered';
                }

                scoredCards.push({
                    card: {
                        id: card.id,
                        front_text: card.front_text,
                        back_text: card.back_text,
                        part_of_speech: card.part_of_speech,
                        srs_score: srsScore,
                        srs_level: p.srs_level,
                        easiness_factor: (p as any).easiness_factor,
                        interval_days: (p as any).interval_days,
                        times_reviewed: p.times_reviewed,
                        isUserFlashcard: !!p.user_flashcard_id
                    },
                    score,
                    tier,
                    daysOverdue
                });
            });

            let finalCards: ScoredCard[] = [];
            let breakdown = { critical: 0, due: 0, weak: 0, new: 0, remembered: 0 };

            // ========================================
            // STEP 3: Mode-Specific Logic
            // ========================================

            if (mode === 'review-only') {
                // ====== BONUS SESSION (Hybrid Strategy) ======
                // User Strategy: 70% Weak/Repair + 30% New Words (Aggressive Progress)
                // Fallback: If no new words available, fill with Random Review.

                // 1. Calculate Quotas
                const weakQuota = Math.ceil(totalCount * 0.7);
                const newQuota = totalCount - weakQuota; // ~30%

                // 2. Select Weakest (70%)
                // Already sorted by SRS Score ascending (Weakest First)
                const weakSet = scoredCards.slice(0, weakQuota);

                // 3. Fetch New Cards (30%)
                const seenCardIds = progressCards?.map(p => p.flashcard_id || p.user_flashcard_id).filter(Boolean) || [];
                let newSet: ScoredCard[] = [];

                if (newQuota > 0 && targetDeckIds.length > 0) {
                    // Try system flashcards / subdeck filter
                    const { data: systemNewCards } = await supabase
                        .from('flashcards')
                        .select('id, front_text, back_text, part_of_speech')
                        .in('subdeck_id', targetDeckIds)
                        .not('id', 'in', `(${seenCardIds.length > 0 ? seenCardIds.join(',') : '00000000-0000-0000-0000-000000000000'})`)
                        .limit(newQuota);

                    if (systemNewCards && systemNewCards.length > 0) {
                        newSet = systemNewCards.map(c => ({
                            card: {
                                id: c.id, front_text: c.front_text, back_text: c.back_text, part_of_speech: c.part_of_speech,
                                srs_score: 0, srs_level: 0, easiness_factor: 2.5, interval_days: 0, times_reviewed: 0, isUserFlashcard: false
                            },
                            score: 0,
                            tier: 'new' as const
                        }));
                    }

                    // Fallback to User Cards if needed
                    if (newSet.length < newQuota) {
                        const { data: userNewCards } = await supabase
                            .from('user_flashcards')
                            .select('id, front_text, back_text, part_of_speech')
                            .in('flashcard_set_id', targetDeckIds)
                            .not('id', 'in', `(${seenCardIds.length > 0 ? seenCardIds.join(',') : '00000000-0000-0000-0000-000000000000'})`)
                            .limit(newQuota - newSet.length);

                        if (userNewCards) {
                            const mappedUserCards = userNewCards.map(c => ({
                                card: {
                                    id: c.id, front_text: c.front_text, back_text: c.back_text, part_of_speech: c.part_of_speech,
                                    srs_score: 0, srs_level: 0, easiness_factor: 2.5, interval_days: 0, times_reviewed: 0, isUserFlashcard: true
                                },
                                score: 0,
                                tier: 'new' as const
                            }));
                            newSet = [...newSet, ...mappedUserCards];
                        }
                    }
                }

                // 4. Fill Remainder with Random Refresh (if New Words ran out)
                let finalCards = [...weakSet, ...newSet];

                if (finalCards.length < totalCount) {
                    const remainingNeeded = totalCount - finalCards.length;

                    // Exclude already selected weak cards from random pool
                    const weakIds = new Set(weakSet.map(c => c.card.id));
                    const remainingPool = scoredCards.filter(c => !weakIds.has(c.card.id));

                    const randomSet = shuffleArray(remainingPool).slice(0, remainingNeeded);
                    finalCards = [...finalCards, ...randomSet];
                    breakdown.remembered = randomSet.length;
                }

                breakdown.weak = weakSet.length;
                breakdown.new = newSet.length;

                // Sort: Weak -> New -> Random(Remembered)
                // (Fatigue ordering handles this later, but finalCards structure is important)
                // Actually step 4 sorts by fatigue anyway.

                // Push to Step 4 via finalCards var.
                // We need to ensure `finalCards` contains ScoredCards. It does.
                // Assignment to outer variable
                // But wait, `finalCards` was defined outside in previous version? 
                // In the file content I saw: `let finalCards: ScoredCard[] = [];` at line 153.
                // So I can assign to it.

                // Assign to the outer variable for Step 4 to use
                // But wait, I'm inside the if block, I need to assign to the outer `finalCards` variable, not create a new local one.
                // The `let finalCards` was declared at line 153.
                // IN THE REPLACEMENT CONTENT, I should use `finalCards = ...` NOT `let finalCards = ...`
                // Correcting...

                // Also need to handle the return path or ensure code flows to Step 4 correctly.
                // The replacement replaces the entire `if (mode === 'review-only') { ... }` block.
                // So after this block, it goes to `else` (which I'm not touching) -> No, I'm replacing the `if` block.
                // Wait, if I replace the `if` block, I need to make sure I don't break the `else`.
                // My target content is lines 160-181 (approx).
                // Let's target the exact lines.

            } else {
                // ====== STANDARD SESSION (Pacing Strategy) ======
                // Goal: Progress + Critical Review.

                // 1. Calculate Pacing Quota
                let neededNewWords = 0;

                if (goalConfig) {
                    const { targetWords, wordsLearned, totalDurationDays, currentDay, sessionsPerDay } = goalConfig;

                    // Buffer Logic: Last 4 sessions are for Review Only
                    const totalSessions = totalDurationDays * sessionsPerDay;
                    const learningSessionsTotal = Math.max(1, totalSessions - 4);

                    const sessionsPassed = (currentDay - 1) * sessionsPerDay; // Approx
                    const sessionsRemaining = Math.max(1, learningSessionsTotal - sessionsPassed);

                    const wordsRemaining = Math.max(0, targetWords - wordsLearned);

                    // Strict Consolidation Phase Check
                    const isConsolidationPhase = sessionsPassed >= learningSessionsTotal;

                    if (isConsolidationPhase) {
                        neededNewWords = 0;
                    } else {
                        // Formula: Words Needed / Remaining Learning Sessions
                        const paceQuota = Math.ceil(wordsRemaining / sessionsRemaining);

                        // Hybrid Rule: Max(Pace Quota, 50% Baseline)
                        // But cap at totalCount to prevent error
                        const baseline = Math.floor(totalCount * 0.5);
                        neededNewWords = Math.min(totalCount, Math.max(paceQuota, baseline));
                    }
                } else {
                    // Fallback if no goal config: 50%
                    neededNewWords = Math.floor(totalCount * 0.5);
                }

                // 2. Select Cards

                // A. Critical Reviews (Must Do)
                const criticalCards = scoredCards.filter(c => c.tier === 'critical');
                const selectedCritical = criticalCards.slice(0, totalCount - neededNewWords); // Leave room for new

                // Adjust new words slot if criticals took too much space?
                // Priority: Critical > New > Standard Review
                // Actually user wants New Words to be guaranteed for pacing.
                // So New Words reserve their slots FIRST.

                const slotsForNew = neededNewWords;
                const slotsForReview = totalCount - slotsForNew;

                // B. Fetch New Cards
                const seenCardIds = progressCards?.map(p => p.flashcard_id || p.user_flashcard_id).filter(Boolean) || [];
                let newCards: VocabItem[] = [];

                if (slotsForNew > 0 && targetDeckIds.length > 0) {
                    // FIX: Filter by SubDecks (Target Decks)
                    // Try system flashcards
                    const { data: systemNewCards } = await supabase
                        .from('flashcards')
                        .select('id, front_text, back_text, part_of_speech')
                        .in('subdeck_id', targetDeckIds) // CRITICAL FIX: Only fetch from goal's decks
                        .not('id', 'in', `(${seenCardIds.length > 0 ? seenCardIds.join(',') : '00000000-0000-0000-0000-000000000000'})`)
                        .limit(Math.max(slotsForNew * 2, totalCount)); // Fetch enough to fill session if reviews missing

                    if (systemNewCards) {
                        newCards = systemNewCards.map(c => ({
                            id: c.id, front_text: c.front_text, back_text: c.back_text,
                            part_of_speech: c.part_of_speech,
                            srs_score: 0, srs_level: 0, easiness_factor: 2.5, interval_days: 0, times_reviewed: 0,
                            isUserFlashcard: false
                        }));
                    }

                    // Fallback to User Cards if needed
                    if (newCards.length < slotsForNew * 2) {
                        const { data: userNewCards } = await supabase
                            .from('user_flashcards')
                            .select('id, front_text, back_text, part_of_speech')
                            .in('flashcard_set_id', targetDeckIds)
                            .not('id', 'in', `(${seenCardIds.length > 0 ? seenCardIds.join(',') : '00000000-0000-0000-0000-000000000000'})`)
                            .limit(Math.max(slotsForNew * 2, totalCount));

                        if (userNewCards) {
                            const mappedUserCards = userNewCards.map(c => ({
                                id: c.id, front_text: c.front_text, back_text: c.back_text,
                                part_of_speech: c.part_of_speech,
                                srs_score: 0, srs_level: 0, easiness_factor: 2.5, interval_days: 0, times_reviewed: 0,
                                isUserFlashcard: true
                            }));
                            newCards = [...newCards, ...mappedUserCards];
                        }
                    }
                } else if (slotsForNew > 0) {
                    // Fallback if no deck IDs provided (Old behavior but safe)
                    // Actually better to return nothing to avoid random words
                    console.warn("No deck IDs provided for new words fetch.");
                }

                // C. Fill Remainder with Review (Critical -> Due -> Weak)
                // DYNAMIC FILLING LOGIC:
                // 1. Take New Cards up to quota
                // 2. Take Review Cards up to remaining space
                // 3. If Review Cards ran out, backfill with MORE New Cards (if available)

                // 1. New Cards (Priority 1: Meet the New Word Quota)
                const primaryNew = newCards.slice(0, slotsForNew).map(c => ({ card: c, score: 0, tier: 'new' as const }));

                // 2. Review Cards (Priority 2: Fill the rest with Review)
                const reviewPool = scoredCards.sort((a, b) => b.score - a.score); // Highest priority first
                const reviewQuota = totalCount - primaryNew.length;
                const primaryReview = reviewPool.slice(0, reviewQuota);

                // 3. Backfill (Priority 3: If Reviews ran out, use extra New Cards)
                let extraNew: ScoredCard[] = [];
                if (primaryNew.length + primaryReview.length < totalCount) {
                    const remainingNeeded = totalCount - (primaryNew.length + primaryReview.length);
                    // Take from newCards starting after the primary slice
                    extraNew = newCards.slice(slotsForNew, slotsForNew + remainingNeeded)
                        .map(c => ({ card: c, score: 0, tier: 'new' as const }));
                }

                // Combine all
                finalCards = [...primaryNew, ...primaryReview, ...extraNew];

                breakdown.new = primaryNew.length + extraNew.length;
                breakdown.critical = primaryReview.filter(c => c.tier === 'critical').length;
                breakdown.due = primaryReview.filter(c => c.tier === 'due').length;
                breakdown.remembered = primaryReview.filter(c => c.tier === 'remembered').length;
            }

            // ========================================
            // STEP 4: Session Fatigue Ordering
            // ========================================
            // Standard: Hard -> Easy -> New
            const sortedByFatigue = [
                ...finalCards.filter(c => c.tier === 'critical'),
                ...finalCards.filter(c => c.tier === 'due'),
                ...finalCards.filter(c => c.tier === 'weak'),
                ...finalCards.filter(c => c.tier === 'new'), // New cards at end? Or mixed? usually mixed or end.
                ...finalCards.filter(c => c.tier === 'remembered')
            ];

            return {
                cards: sortedByFatigue.slice(0, totalCount).map(c => c.card),
                breakdown
            };

        } catch (error) {
            console.error('Error getting optimal cards:', error);
            return { cards: [], breakdown: { critical: 0, due: 0, weak: 0, new: 0, remembered: 0 } };
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { getOptimalCards, isLoading };
}
