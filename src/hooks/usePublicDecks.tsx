import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PublicDeck {
  id: string;
  name: string;
  description: string;
  creator_user_id: string;
  clone_count: number;
  tags: string[];
  category: string | null;
  created_at: string;
  updated_at: string;
  creator_nickname: string;
  creator_avatar: string | null;
  total_flashcards: number;
  total_sets: number; // Number of subdecks
}

export interface PublicSubdeck {
  id: string;
  name: string;
  card_count: number;
  parent_deck_id: string;
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

  const fetchPublicDecks = useCallback(async () => {
    try {
      setLoading(true);

      // Query community decks from user_flashcard_sets
      let query = supabase
        .from('user_flashcard_sets')
        .select(`
          id,
          title,
          description,
          user_id,
          clone_count,
          tags,
          category,
          created_at,
          updated_at,
          card_count,
          is_public
        `)
        .eq('source', 'community')
        .eq('is_public', true)
        .is('parent_deck_id', null); // Only get parent decks

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.search) {
        const s = filters.search.trim();
        if (s) {
          query = query.ilike('title', `%${s}%`);
        }
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

      // Get subdeck counts for each parent deck
      const parentIds = (data || []).map(d => d.id);
      
      let subdeckCounts: Record<string, number> = {};
      if (parentIds.length > 0) {
        const { data: subdeckData } = await supabase
          .from('user_flashcard_sets')
          .select('parent_deck_id')
          .in('parent_deck_id', parentIds);
        
        if (subdeckData) {
          subdeckData.forEach(sd => {
            const pid = sd.parent_deck_id;
            if (pid) {
              subdeckCounts[pid] = (subdeckCounts[pid] || 0) + 1;
            }
          });
        }
      }

      // Get creator info
      const userIds = [...new Set((data || []).map(d => d.user_id))];
      let profiles: Record<string, { nickname: string; avatar_url: string | null }> = {};
      
      if (userIds.length > 0) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('user_id, nickname, avatar_url')
          .in('user_id', userIds);
        
        if (profileData) {
          profileData.forEach(p => {
            profiles[p.user_id] = {
              nickname: p.nickname || 'ผู้ใช้',
              avatar_url: p.avatar_url
            };
          });
        }
      }

      const transformed: PublicDeck[] = (data || []).map((d: any) => ({
        id: d.id,
        name: d.title,
        description: d.description ?? '',
        creator_user_id: d.user_id ?? '',
        clone_count: d.clone_count ?? 0,
        tags: d.tags ?? [],
        category: d.category ?? null,
        created_at: d.created_at,
        updated_at: d.updated_at,
        creator_nickname: profiles[d.user_id]?.nickname || 'ผู้ใช้',
        creator_avatar: profiles[d.user_id]?.avatar_url || null,
        total_flashcards: d.card_count ?? 0,
        total_sets: subdeckCounts[d.id] || 0,
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
  }, [filters?.search, filters?.category, filters?.sortBy, toast]);

  useEffect(() => {
    fetchPublicDecks();
  }, [fetchPublicDecks]);

  return { decks, loading, refetch: fetchPublicDecks };
}

// Hook to fetch subdecks of a community deck
export function useCommunitySubdecks(parentDeckId: string | null) {
  const [subdecks, setSubdecks] = useState<PublicSubdeck[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!parentDeckId) {
      setSubdecks([]);
      return;
    }

    const fetchSubdecks = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_flashcard_sets')
          .select('id, title, card_count, parent_deck_id')
          .eq('parent_deck_id', parentDeckId)
          .eq('source', 'community_subdeck');

        if (error) throw error;

        const formatted: PublicSubdeck[] = (data || []).map(d => ({
          id: d.id,
          name: d.title,
          card_count: d.card_count || 0,
          parent_deck_id: d.parent_deck_id || ''
        }));

        setSubdecks(formatted);
      } catch (error) {
        console.error('Error fetching subdecks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubdecks();
  }, [parentDeckId]);

  return { subdecks, loading };
}

// Hook to fetch flashcards of a subdeck
export function useSubdeckFlashcards(subdeckId: string | null) {
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!subdeckId) {
      setFlashcards([]);
      return;
    }

    const fetchFlashcards = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_flashcards')
          .select('id, front_text, back_text, part_of_speech')
          .eq('flashcard_set_id', subdeckId);

        if (error) throw error;
        setFlashcards(data || []);
      } catch (error) {
        console.error('Error fetching flashcards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, [subdeckId]);

  return { flashcards, loading };
}