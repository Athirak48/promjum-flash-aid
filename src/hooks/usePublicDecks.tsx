import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PublicDeck {
  id: string;
  name: string;
  description: string;
  deck_id: string; // parent deck id (decks.id)
  folder_id: string; // unused for community decks
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

      // Community decks are stored in public.sub_decks (created via create_combined_community_deck)
      let query = supabase
        .from('sub_decks')
        .select(
          `
          id,
          name,
          name_en,
          description,
          deck_id,
          creator_user_id,
          clone_count,
          tags,
          category,
          created_at,
          updated_at,
          flashcard_count,
          decks!inner(category)
        `
        )
        .eq('decks.category', 'Community')
        .eq('is_public', true)
        .eq('is_published', true);

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.search) {
        const s = filters.search.trim();
        if (s) {
          query = query.or(`name.ilike.%${s}%,name_en.ilike.%${s}%`);
        }
      }

      if (filters?.tags?.length) {
        query = query.contains('tags', filters.tags);
      }

      switch (filters?.sortBy) {
        case 'popular':
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

      const transformed: PublicDeck[] = (data || []).map((sd: any) => ({
        id: sd.id,
        name: sd.name,
        description: sd.description ?? '',
        deck_id: sd.deck_id,
        folder_id: '',
        creator_user_id: sd.creator_user_id ?? '',
        clone_count: sd.clone_count ?? 0,
        tags: sd.tags ?? [],
        category: sd.category ?? null,
        created_at: sd.created_at,
        updated_at: sd.updated_at,
        creator_nickname: 'ผู้ใช้',
        creator_avatar: null,
        total_flashcards: sd.flashcard_count ?? 0,
      }));

      setDecks(transformed);
    } catch (error: any) {
      console.error('Error fetching public decks:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error?.message || 'ไม่สามารถดึงข้อมูล Community Decks ได้',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicDecks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.search, filters?.category, filters?.sortBy, filters?.tags?.join(',')]);

  return { decks, loading, refetch: fetchPublicDecks };
}

