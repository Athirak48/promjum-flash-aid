import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PublicDeck {
    id: string;
    name: string;
    description: string;
    deck_id: string;
    folder_id: string;
    creator_user_id: string;
    clone_count: number;
    tags: string[];
    category: string | null;
    created_at: string;
    updated_at: string;
    creator_nickname: string;
    creator_avatar: string | null;
    total_flashcards: number;
}

export interface PublicDecksFilters {
    search?: string;
    category?: string;
    tags?: string[];
    sortBy?: 'popular' | 'recent' | 'clones';
}

export function usePublicDecks(filters?: PublicDecksFilters) {
    const [decks, setDecks] = useState<PublicDeck[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchPublicDecks = async () => {
        try {
            setLoading(true);

            // Query user_flashcard_sets with user profiles
            let query = supabase
                .from('user_flashcard_sets')
                .select(`
                    id,
                    title,
                    source,
                    card_count,
                    created_at,
                    updated_at,
                    user_id,
                    profiles:user_id (
                        display_name,
                        username,
                        avatar_url
                    )
                `)
                .eq('source', 'shared');

            // Apply search filter
            if (filters?.search) {
                query = query.ilike('title', `%${filters.search}%`);
            }

            // Apply sorting
            switch (filters?.sortBy) {
                case 'popular':
                    query = query.order('card_count', { ascending: false });
                    break;
                case 'clones':
                    query = query.order('card_count', { ascending: false });
                    break;
                case 'recent':
                default:
                    query = query.order('created_at', { ascending: false });
                    break;
            }

            const { data, error } = await query;

            if (error) throw error;

            // Transform to PublicDeck format with real user data
            const transformedDecks: PublicDeck[] = (data || []).map((set: any) => {
                const profile = set.profiles;
                const nickname = profile?.display_name || profile?.username || 'ผู้ใช้';
                const avatar = profile?.avatar_url || null;

                // Extract emoji and category from title if present
                const titleParts = set.title.match(/^([\p{Emoji}]+)\s+(.+)$/u);
                const cleanTitle = titleParts ? titleParts[2] : set.title;

                return {
                    id: set.id,
                    name: set.title,
                    description: `แชร์โดย ${nickname}`,
                    deck_id: set.id,
                    folder_id: '',
                    creator_user_id: set.user_id,
                    clone_count: 0,
                    tags: [],
                    category: null,
                    created_at: set.created_at,
                    updated_at: set.updated_at,
                    creator_nickname: nickname,
                    creator_avatar: avatar,
                    total_flashcards: set.card_count || 0
                };
            });

            setDecks(transformedDecks);
        } catch (error: any) {
            console.error('Error fetching public decks:', error);
            toast({
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถดึงข้อมูล Deck ชุมชนได้",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPublicDecks();
    }, [filters?.search, filters?.category, filters?.sortBy, filters?.tags?.join(',')]);

    return {
        decks,
        loading,
        refetch: fetchPublicDecks
    };
}
