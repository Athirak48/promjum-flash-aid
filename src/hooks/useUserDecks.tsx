import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserDeck {
    id: string;
    deck_name: string; // Alias for title
    title: string;
    user_id: string;
    created_at: string;
}

/**
 * Hook to check if user has any personal flashcard folders/decks
 * Used for first-time user detection in onboarding flow
 */
export function useUserDecks() {
    const { user } = useAuth();
    const [decks, setDecks] = useState<UserDeck[]>([]);
    const [deckCount, setDeckCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [hasDecks, setHasDecks] = useState(false);

    useEffect(() => {
        if (user) {
            checkUserDecks();
        } else {
            setIsLoading(false);
            setDecks([]);
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

            // Query user's folders (personal decks) from user_folders table
            const { data, error, count } = await supabase
                .from('user_folders')
                .select('id, title, user_id, created_at', { count: 'exact', head: false })
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching user decks:', error);
                setDecks([]);
                setDeckCount(0);
                setHasDecks(false);
            } else {
                const totalCount = count || 0;
                // Map title to deck_name for compatibility
                const deckData = (data || []).map(folder => ({
                    ...folder,
                    deck_name: folder.title, // Add deck_name alias
                }));
                setDecks(deckData);
                setDeckCount(totalCount);
                setHasDecks(totalCount > 0);
            }
        } catch (err) {
            console.error('User decks check failed:', err);
            setDecks([]);
            setDeckCount(0);
            setHasDecks(false);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        decks,
        deckCount,
        hasDecks,
        isLoading,
        refetch: checkUserDecks
    };
}

