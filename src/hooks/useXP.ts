import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// XP Config - matches database values
export const XP_CONFIG = {
    // Games (reduced ~50%)
    game_quiz: { perAction: 4, completion: 5 },
    game_swipe: { perAction: 1, completion: 3 },
    game_matching: { perAction: 3, completion: 8 },
    game_listen_choose: { perAction: 4, completion: 8 },
    game_word_scramble: { perAction: 4, completion: 8 },
    game_honeycomb: { perAction: 4, completion: 8 },
    game_vocab_blinder: { perAction: 4, completion: 8 },
    game_hangman: { perAction: 5, completion: 10 },
    game_word_search: { perAction: 5, completion: 10 },
    game_ninja_slice: { perAction: 3, completion: 12 },
    // Flashcard
    flashcard_remember: { perAction: 1, completion: 0 },
    flashcard_forgot: { perAction: 0, completion: 0 },
    flashcard_complete: { perAction: 0, completion: 5 },
    flashcard_perfect: { perAction: 0, completion: 10 },
    // Learning Session
    learning_flashcard: { perAction: 1, completion: 5 },
    learning_listening: { perAction: 2, completion: 5 },
    learning_listening_streak3: { perAction: 0, completion: 3 },
    learning_listening_streak5: { perAction: 0, completion: 5 },
    learning_listening_streak10: { perAction: 0, completion: 10 },
    learning_reading: { perAction: 2, completion: 5 },
    learning_game: { perAction: 5, completion: 15 },
    learning_complete_all: { perAction: 0, completion: 20 },
    learning_first_today: { perAction: 0, completion: 10 },
} as const;

export type XPSource = keyof typeof XP_CONFIG;

export interface UserXPData {
    totalXP: number;
    level: number;
    xpToNextLevel: number;
    xpProgress: number; // 0-100 percentage
    gamesXPToday: number;
    gamesXPRemaining: number;
    flashcardXPToday: number;
    flashcardXPRemaining: number;
}

export interface XPGainResult {
    newXP: number;
    newLevel: number;
    xpAdded: number;
    levelUp: boolean;
}

interface XPGainEvent {
    amount: number;
    source: string;
    levelUp: boolean;
    timestamp: number;
}

export function useXP() {
    const { user } = useAuth();
    const [xpData, setXpData] = useState<UserXPData | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastGain, setLastGain] = useState<XPGainEvent | null>(null);

    // Load user XP data
    const loadXPData = useCallback(async () => {
        if (!user) {
            setXpData(null);
            setLoading(false);
            return;
        }

        try {
            // Try to get existing XP data
            const { data, error } = await supabase
                .from('user_xp')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error loading XP:', error);
            }

            if (data) {
                const level = data.level || 1;
                const totalXP = data.total_xp || 0;
                const xpInCurrentLevel = totalXP % 1000;

                setXpData({
                    totalXP,
                    level,
                    xpToNextLevel: 1000 - xpInCurrentLevel,
                    xpProgress: Math.round((xpInCurrentLevel / 1000) * 100),
                    gamesXPToday: data.last_daily_reset === new Date().toISOString().split('T')[0]
                        ? data.games_xp_today || 0 : 0,
                    gamesXPRemaining: 150 - (data.last_daily_reset === new Date().toISOString().split('T')[0]
                        ? data.games_xp_today || 0 : 0),
                    flashcardXPToday: data.last_daily_reset === new Date().toISOString().split('T')[0]
                        ? data.flashcard_xp_today || 0 : 0,
                    flashcardXPRemaining: 100 - (data.last_daily_reset === new Date().toISOString().split('T')[0]
                        ? data.flashcard_xp_today || 0 : 0),
                });
            } else {
                // Create default XP data
                setXpData({
                    totalXP: 0,
                    level: 1,
                    xpToNextLevel: 100,
                    xpProgress: 0,
                    gamesXPToday: 0,
                    gamesXPRemaining: 150,
                    flashcardXPToday: 0,
                    flashcardXPRemaining: 100,
                });
            }
        } catch (err) {
            console.error('Error in loadXPData:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadXPData();
    }, [loadXPData]);

    // Add XP
    const addXP = useCallback(async (
        source: XPSource,
        sourceDetail?: string,
        metadata?: Record<string, any>
    ): Promise<XPGainResult | null> => {
        if (!user) return null;

        const config = XP_CONFIG[source];
        const amount = config.perAction + config.completion;

        if (amount <= 0) return null;

        try {
            const { data, error } = await supabase.rpc('add_xp', {
                p_user_id: user.id,
                p_amount: amount,
                p_source: source,
                p_source_detail: sourceDetail || null,
                p_metadata: metadata || {},
            });

            if (error) {
                console.error('Error adding XP:', error);
                return null;
            }

            const result = data?.[0];
            if (result) {
                const gainResult: XPGainResult = {
                    newXP: result.new_xp,
                    newLevel: result.new_level,
                    xpAdded: result.xp_added,
                    levelUp: result.level_up,
                };

                // Update last gain for animation
                setLastGain({
                    amount: result.xp_added,
                    source,
                    levelUp: result.level_up,
                    timestamp: Date.now(),
                });

                // Reload XP data
                await loadXPData();

                return gainResult;
            }
        } catch (err) {
            console.error('Error in addXP:', err);
        }

        return null;
    }, [user, loadXPData]);

    // Add XP for correct answer in games
    const addGameXP = useCallback(async (
        gameType: string,
        isCorrect: boolean,
        isCompletion: boolean = false
    ) => {
        const sourceMap: Record<string, XPSource> = {
            'quiz': 'game_quiz',
            'swipe': 'game_swipe',
            'matching': 'game_matching',
            'listen-choose': 'game_listen_choose',
            'word-scramble': 'game_word_scramble',
            'honeycomb': 'game_honeycomb',
            'vocab-blinder': 'game_vocab_blinder',
            'hangman': 'game_hangman',
            'word-search': 'game_word_search',
            'ninja-slice': 'game_ninja_slice',
        };

        const source = sourceMap[gameType];
        if (!source) return null;

        // Only give XP for correct answers
        if (!isCorrect && !isCompletion) return null;

        return addXP(source, gameType);
    }, [addXP]);

    // Add XP for flashcard review
    const addFlashcardXP = useCallback(async (
        remembered: boolean,
        isCompletion: boolean = false,
        isPerfect: boolean = false
    ) => {
        if (isCompletion) {
            if (isPerfect) {
                return addXP('flashcard_perfect', 'deck_complete_perfect');
            }
            return addXP('flashcard_complete', 'deck_complete');
        }

        return addXP(
            remembered ? 'flashcard_remember' : 'flashcard_forgot',
            remembered ? 'remembered' : 'forgot'
        );
    }, [addXP]);

    // Add XP for learning session
    const addLearningXP = useCallback(async (
        phase: 'flashcard' | 'listening' | 'reading' | 'game',
        isCorrect: boolean = true,
        isPhaseComplete: boolean = false
    ) => {
        const sourceMap: Record<string, XPSource> = {
            'flashcard': 'learning_flashcard',
            'listening': 'learning_listening',
            'reading': 'learning_reading',
            'game': 'learning_game',
        };

        const source = sourceMap[phase];
        if (!source || !isCorrect) return null;

        return addXP(source, `${phase}_phase`);
    }, [addXP]);

    // Clear last gain (for animation cleanup)
    const clearLastGain = useCallback(() => {
        setLastGain(null);
    }, []);

    return {
        xpData,
        loading,
        lastGain,
        addXP,
        addGameXP,
        addFlashcardXP,
        addLearningXP,
        clearLastGain,
        refreshXP: loadXPData,
    };
}
