import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserFlashcardSet {
    id: string;
    folder_id: string;
    title: string;
    card_count: number;
    created_at: string;
}

/**
 * Hook to fetch user's flashcard sets from a specific folder
 * Used for personal folders (user_folders -> user_flashcard_sets)
 */
export function useUserFlashcardSets(folderId: string) {
    const [flashcardSets, setFlashcardSets] = useState<UserFlashcardSet[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!folderId) {
            setFlashcardSets([]);
            setLoading(false);
            return;
        }

        const fetchFlashcardSets = async () => {
            try {
                setLoading(true);

                const { data, error } = await supabase
                    .from('user_flashcard_sets')
                    .select('id, folder_id, title, card_count, created_at')
                    .eq('folder_id', folderId)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Error fetching flashcard sets:', error);
                    setFlashcardSets([]);
                } else {
                    // Manually count cards for each set to ensure accuracy
                    const setsWithCounts = await Promise.all((data || []).map(async (set) => {
                        const { count } = await supabase
                            .from('user_flashcards')
                            .select('*', { count: 'exact', head: true })
                            .eq('flashcard_set_id', set.id);

                        return {
                            ...set,
                            card_count: count || 0
                        };
                    }));

                    setFlashcardSets(setsWithCounts);
                }
            } catch (err) {
                console.error('Flashcard sets fetch failed:', err);
                setFlashcardSets([]);
            } finally {
                setLoading(false);
            }
        };

        fetchFlashcardSets();
    }, [folderId]);

    return {
        flashcardSets,
        loading,
    };
}
