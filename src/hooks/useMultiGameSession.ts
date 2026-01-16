import { useState, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { supabase } from '@/integrations/supabase/client';
import { useOptimalCards, VocabItem } from './useOptimalCards';

interface FlashcardData {
    id: string;
    front_text: string;
    back_text: string;
    // Compatibility aliases
    front?: string;
    back?: string;
    front_image?: string;
    back_image?: string;
    part_of_speech?: string;
}

interface WordProgress {
    flashcard_id: string;
    srs_level: number;
    srs_score: number;
    easiness_factor: number;
    interval_days: number; // Added for SRS persistence
    times_reviewed: number;
    flashcard: FlashcardData;
    isUserFlashcard?: boolean;
}

interface GameResult {
    gameId: string;
    gameName: string;
    answers: Array<{
        wordId: string;
        isCorrect: boolean;
        timeSpent?: number;
    }>;
    score: number;
    correct: number;
    total: number;
}

interface MultiGameSession {
    sessionId: string;
    goalId: string;
    mode: 'start' | 'bonus';
    words: WordProgress[];
    selectedGames: string[];
    currentGameIndex: number;
    gameResults: GameResult[];
}

export const useMultiGameSession = () => {
    const [session, setSession] = useState<MultiGameSession | null>(null);
    const { getOptimalCards } = useOptimalCards();

    // Start new multi-game session
    const startSession = useCallback(async (
        goalId: string,
        mode: 'start' | 'bonus',
        selectedGames: string[],
        goalConfig?: any, // Added for Pacing
        customLimit?: number // Added for strict override
    ) => {
        // Use Centralized SRS Logic
        // Determine mode mapping: 'start' -> 'review-and-new', 'bonus' -> 'review-only'
        const srsMode = mode === 'bonus' ? 'review-only' : 'review-and-new';

        // Use default count 20 (or from config?) - enforcing user's minimum 20
        const totalCount = customLimit || 20;

        const { cards: optimalCards } = await getOptimalCards(totalCount, srsMode, goalConfig);

        // Map to WordProgress format expected by games
        const words: WordProgress[] = optimalCards.map(c => ({
            flashcard_id: c.id,
            srs_level: c.srs_level || 0,
            srs_score: c.srs_score || 0,
            easiness_factor: c.easiness_factor || 2.5, // Check property availability
            interval_days: c.interval_days || 0,
            times_reviewed: c.times_reviewed || 0,
            flashcard: {
                id: c.id,
                front_text: c.front_text,
                back_text: c.back_text,
                front: c.front_text,
                back: c.back_text,
                part_of_speech: c.part_of_speech,
                // Optional: map images if available in VocabItem
            },
            isUserFlashcard: c.isUserFlashcard
        }));

        setSession({
            sessionId: nanoid(),
            goalId,
            mode,
            words,
            selectedGames,
            currentGameIndex: 0,
            gameResults: []
        });

        return words;
    }, [getOptimalCards]);

    // Complete current game
    const completeGame = useCallback((result: GameResult) => {
        setSession(prev => {
            if (!prev) return null;
            return {
                ...prev,
                gameResults: [...prev.gameResults, result],
                currentGameIndex: prev.currentGameIndex + 1
            };
        });
    }, []);

    // Check if all games completed
    const isSessionComplete = useCallback(() => {
        if (!session) return false;
        return session.currentGameIndex >= session.selectedGames.length;
    }, [session]);

    // Finalize session and update database
    const finalizeSession = useCallback(async () => {
        if (!session) return null;

        // Calculate combined results
        const combinedResults = calculateCombinedResults(session);

        // Update SM-2 scores
        await updateSM2MultiGame(session.words, session.gameResults);

        // Save practice session
        await savePracticeSession(session, combinedResults);

        return {
            ...combinedResults,
            session
        };
    }, [session]);

    // Reset session
    const resetSession = useCallback(() => {
        setSession(null);
    }, []);

    return {
        session,
        startSession,
        completeGame,
        isSessionComplete,
        finalizeSession,
        resetSession
    };
};

// Fetch words for session


// Calculate combined results across all games
const calculateCombinedResults = (session: MultiGameSession) => {
    const { gameResults, words } = session;

    // Calculate per-word performance across all games
    const wordPerformance = words.map(word => {
        const wordId = word.flashcard.id;
        const results = gameResults.map(game => {
            const answer = game.answers.find(a => a.wordId === wordId);
            return answer?.isCorrect || false;
        });

        const correctCount = results.filter(r => r).length;
        const totalGames = results.length;

        return {
            wordId,
            word: word.flashcard,
            correctCount,
            totalGames,
            successRate: correctCount / totalGames
        };
    });

    // Overall statistics
    const totalCorrect = gameResults.reduce((sum, game) => sum + game.correct, 0);
    const totalQuestions = gameResults.reduce((sum, game) => sum + game.total, 0);
    const combinedScore = Math.round((totalCorrect / totalQuestions) * 100);

    // Words that need review (< 67% success rate)
    const wrongWords = wordPerformance
        .filter(wp => wp.successRate < 0.67)
        .map(wp => wp.word);

    // Encouragement message
    const encouragement = combinedScore >= 90 ? 'ยอดเยี่ยม! 🏆'
        : combinedScore >= 80 ? 'เก่งมาก! 🎉'
            : combinedScore >= 70 ? 'ดีมาก! 👏'
                : combinedScore >= 60 ? 'ทำได้ดี! 💪'
                    : 'พยายามต่อไป! 📚';

    return {
        combinedScore,
        totalCorrect,
        totalQuestions,
        gameResults,
        wrongWords,
        wordPerformance,
        encouragement
    };
};

// Helper: Update SM-2 Algorithm based on Game Results
// Now uses Unified 'calculateSRS' from utils
import { calculateSRS, GAME_TIERS } from '@/utils/srsCalculator';

const updateSM2MultiGame = async (words: WordProgress[], gameResults: GameResult[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    for (const word of words) {
        const wordId = word.flashcard.id;

        // Get performance across all games for this word
        const specificResults = gameResults
            .map(game => game.answers.find(a => a.wordId === wordId))
            .filter(Boolean);

        if (specificResults.length === 0) continue;

        const isCorrect = specificResults.every(r => r?.isCorrect);
        // Fix: 'timeTaken' might be missing in some types, force access or use default
        const avgTime = specificResults.reduce((sum, r) => sum + ((r as any)?.timeTaken || 0), 0) / specificResults.length;

        // --- MAPPING TO UNIFIED QUALITY (0-5) ---
        let qualityScore = 0;

        if (isCorrect) {
            // Fast (<3s) OR Perfect Session (>=2 games correct) -> Quality 5 (Delta +2)
            if (avgTime < 3000 || specificResults.length >= 2) {
                qualityScore = 5;
            } else {
                // Slow -> Quality 3 (Delta +1)
                qualityScore = 3;
            }
        } else {
            // Wrong -> Quality 0 (Delta -3)
            qualityScore = 0;
        }

        // --- DETERMINE SESSION SCORE CAP (TIERED SRS) ---
        // Find which games this specific word appeared in
        // Filter parent GameResults to find ones containing this word
        const gamesWithWord = gameResults.filter(g =>
            g.answers.some(a => a.wordId === wordId)
        );

        const gamesPlayedForWord = gamesWithWord.map(g => g.gameName || g.gameId);

        // Check tiers: If any played game is Tier 2 (Recall), cap is 15. Else 10.
        let sessionCap = 10;
        const hasRecallGame = gamesPlayedForWord.some(gId => {
            const tierInfo = GAME_TIERS[gId];
            // Default to Tier 2 if unknown (safest assumption)
            return (tierInfo?.tier ?? 2) === 2;
        });

        if (hasRecallGame) {
            sessionCap = 15;
        }

        // --- CALCULATE NEW SRS ---
        const newSRS = calculateSRS({
            easinessFactor: word.easiness_factor,
            intervalDays: word.interval_days,
            srsLevel: word.srs_level,
            srsScore: word.srs_score,
        }, qualityScore, undefined, sessionCap);

        await supabase
            .from('user_flashcard_progress')
            .upsert({
                user_id: user.id,
                flashcard_id: wordId,
                srs_level: newSRS.srsLevel,
                srs_score: newSRS.srsScore,
                easiness_factor: newSRS.easinessFactor,
                interval_days: newSRS.intervalDays,
                next_review_date: newSRS.nextReviewDate.toISOString().split('T')[0],
                times_reviewed: word.times_reviewed + 1,
                last_reviewed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
    }
};

// Save practice session to database
const savePracticeSession = async (session: MultiGameSession, results: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // CRITICAL FIX: Count words that are NEW (were at Level 0 before this session)
    // These are truly "newly learned" words that should increment goal progress
    // Updated: Count for BOTH 'start' and 'bonus' modes (since Bonus also teaches 40% new words)
    const newWordsLearned = session.words.filter(w => w.srs_level === 0).length;

    // 1. Insert practice session record
    await supabase
        .from('practice_sessions')
        .insert({
            user_id: user.id,
            goal_id: session.goalId,
            session_type: session.mode === 'start' ? 'standard' : 'bonus',
            session_mode: `multi-game (${session.selectedGames.join(', ')})`,
            words_learned: newWordsLearned, // Count only NEW words (Level 0)
            words_reviewed: session.words.length,
            duration_minutes: Math.round(session.gameResults.reduce((sum, g) => sum + (g.gameId === 'quiz' ? 3 : 5), 0)),
            completed: true,
            completed_at: new Date().toISOString(),
            created_at: new Date().toISOString()
        });

    // 2. Update goal progress for BOTH modes (if new words were learned)
    if (newWordsLearned > 0) {
        // Get current goal stats
        const { data: goal } = await supabase
            .from('user_goals')
            .select('current_value')
            .eq('id', session.goalId)
            .single();

        if (goal) {
            const newTotal = (goal.current_value || 0) + newWordsLearned;

            await supabase
                .from('user_goals')
                .update({
                    current_value: newTotal,
                    updated_at: new Date().toISOString()
                })
                .eq('id', session.goalId);

            console.log(`✅ Goal Progress Updated: +${newWordsLearned} new words (Total: ${newTotal})`);
        }
    }

    // 3. Update Streak & XP (Profile)
    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('current_streak, last_activity_date, longest_streak, total_xp')
            .eq('user_id', user.id)
            .single();

        if (profile) {
            const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD (Local)
            const lastActive = profile.last_activity_date;
            let newStreak = profile.current_streak || 0;
            let newLongest = profile.longest_streak || 0;

            if (lastActive !== today) {
                if (lastActive) {
                    const lastDate = new Date(lastActive);
                    const currentDate = new Date(today);
                    const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays === 1) {
                        newStreak += 1;
                    } else {
                        newStreak = 1; // Reset if missed a day
                    }
                } else {
                    newStreak = 1; // First time
                }
            }

            if (newStreak > newLongest) {
                newLongest = newStreak;
            }

            // Calculate XP (e.g., 10 XP per minute + bonus)
            const xpGained = Math.round(session.gameResults.reduce((sum, g) => sum + (g.score || 0), 0) / 10) + 50; // Base 50 + 10% of score
            const newTotalXP = (profile.total_xp || 0) + xpGained;

            await supabase
                .from('profiles')
                .update({
                    current_streak: newStreak,
                    last_activity_date: today,
                    longest_streak: newLongest,
                    total_xp: newTotalXP,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', user.id);

            console.log(`🔥 Streak Updated: ${newStreak} (XP +${xpGained})`);
        }
    } catch (err) {
        console.error("Error updating profile stats:", err);
    }
};
