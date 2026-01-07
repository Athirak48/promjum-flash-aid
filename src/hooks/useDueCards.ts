import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useStudyGoals } from './useStudyGoals';

export interface DueCard {
    id: string;
    flashcard_id: string;
    user_id: string;
    next_review_date: string;
    srs_level: number;
    srs_score: number;
    easiness_factor: number;
    interval_days: number;
    times_reviewed: number;
    times_correct: number;
    flashcard: {
        id: string;
        word: string;
        meaning: string;
        phonetic?: string;
        example_sentence?: string;
        deck_id: string;
    };
}

interface UseDueCardsReturn {
    dueCards: DueCard[];
    loading: boolean;
    totalDue: number;
    fromGoal: boolean;
    refetch: () => Promise<void>;
}

export function useDueCards(): UseDueCardsReturn {
    const [dueCards, setDueCards] = useState<DueCard[]>([]);
    const [totalDue, setTotalDue] = useState(0);
    const [fromGoal, setFromGoal] = useState(false);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const { activeGoal } = useStudyGoals();

    const fetchDueCards = useCallback(async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const now = new Date().toISOString();

            // Check if there's an active goal
            if (activeGoal && activeGoal.is_active) {
                // Pull cards from GOAL DECK only!
                setFromGoal(true);

                const { data, error, count } = await supabase
                    .from('user_flashcard_progress')
                    .select(`
            *,
            flashcards!inner(*)
          `, { count: 'exact' })
                    .eq('user_id', user.id)
                    .eq('flashcards.deck_id', activeGoal.deck_id)
                    .lte('next_review_date', now)
                    .order('next_review_date', { ascending: true })
                    .limit(activeGoal.words_per_session); // 20 cards per session

                if (error) throw error;

                setDueCards((data as any) || []);
                setTotalDue(count || 0);

            } else {
                // No active goal - pull from ALL decks (normal mode)
                setFromGoal(false);

                const { data, error, count } = await supabase
                    .from('user_flashcard_progress')
                    .select(`
            *,
            flashcards(*)
          `, { count: 'exact' })
                    .eq('user_id', user.id)
                    .lte('next_review_date', now)
                    .order('next_review_date', { ascending: true })
                    .limit(50); // Normal limit

                if (error) throw error;

                setDueCards((data as any) || []);
                setTotalDue(count || 0);
            }

        } catch (error: any) {
            console.error('Error fetching due cards:', error);
            toast({
                title: 'เกิดข้อผิดพลาด',
                description: 'ไม่สามารถโหลดการ์ดที่ต้องทบทวนได้',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    }, [activeGoal, toast]);

    useEffect(() => {
        fetchDueCards();
    }, [fetchDueCards]);

    return {
        dueCards,
        loading,
        totalDue,
        fromGoal,
        refetch: fetchDueCards
    };
}
