import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

/**
 * Hook to check if user has any personal flashcard folders/decks
 * Used for first-time user detection in onboarding flow
 */
export function useUserDecks() {
    const { user } = useAuth();
    const [deckCount, setDeckCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [hasDecks, setHasDecks] = useState(false);

    useEffect(() => {
        if (user) {
            checkUserDecks();
        } else {
            setIsLoading(false);
            setDeckCount(0);
            setHasDecks(false);
        }
    }, [user]);

    const checkUserDecks = async () => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);

            // Query user's flashcard folders (personal decks)
            const { data, error, count } = await supabase
                .from('user_flashcard_folders')
                .select('*', { count: 'exact', head: false })
                .eq('user_id', user.id);

            if (error) {
                console.error('Error fetching user decks:', error);
                setDeckCount(0);
                setHasDecks(false);
            } else {
                const totalCount = count || 0;
                setDeckCount(totalCount);
                setHasDecks(totalCount > 0);
            }
        } catch (err) {
            console.error('User decks check failed:', err);
            setDeckCount(0);
            setHasDecks(false);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        deckCount,
        hasDecks,
        isLoading,
        refetch: checkUserDecks
    };
}
