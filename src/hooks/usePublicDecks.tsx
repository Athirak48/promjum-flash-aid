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

            let query = supabase
                .from('public_decks_with_creator')
                .select('*');

            // Apply search filter
            if (filters?.search) {
                query = query.or(`name.ilike.%${filters.search}%,creator_nickname.ilike.%${filters.search}%`);
            }

            // Apply category filter
            if (filters?.category) {
                query = query.eq('category', filters.category);
            }

            // Apply tags filter
            if (filters?.tags && filters.tags.length > 0) {
                query = query.contains('tags', filters.tags);
            }

            // Apply sorting
            switch (filters?.sortBy) {
                case 'popular':
                    query = query.order('total_flashcards', { ascending: false });
                    break;
                case 'clones':
                    query = query.order('clone_count', { ascending: false });
                    break;
                case 'recent':
                default:
                    query = query.order('created_at', { ascending: false });
                    break;
            }

            const { data, error } = await query;

            if (error) throw error;

            setDecks(data || []);
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
