import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SubDeck {
  id: string;
  deck_id: string;
  name: string;
  name_en: string;
  description: string;
  description_en: string;
  flashcard_count: number;
  is_free: boolean;
  display_order: number;
  difficulty_level: string;
  created_at: string;
  progress?: {
    is_completed: boolean;
    cards_learned: number;
    last_accessed: string;
  };
}

export function useSubDecks(deckId: string) {
  const [subDecks, setSubDecks] = useState<SubDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSubDecks = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      // Fetch all sub-decks for this deck
      const { data: subDecksData, error: subDecksError } = await supabase
        .from('sub_decks')
        .select('*')
        .eq('deck_id', deckId)
        .order('display_order', { ascending: true });

      if (subDecksError) throw subDecksError;

      // Fetch user progress if logged in
      if (user) {
        const { data: progressData } = await supabase
          .from('user_subdeck_progress')
          .select('subdeck_id, is_completed, cards_learned, last_accessed')
          .eq('user_id', user.id);

        // Merge progress with sub-decks
        const subDecksWithProgress = subDecksData?.map(subdeck => {
          const progress = progressData?.find(p => p.subdeck_id === subdeck.id);
          return {
            ...subdeck,
            progress: progress ? {
              is_completed: progress.is_completed,
              cards_learned: progress.cards_learned,
              last_accessed: progress.last_accessed
            } : undefined
          };
        });

        setSubDecks(subDecksWithProgress || []);
      } else {
        setSubDecks(subDecksData || []);
      }
    } catch (error: any) {
      console.error('Error fetching sub-decks:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูล Sub-deck ได้",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (deckId) {
      fetchSubDecks();
    }
  }, [deckId]);

  return {
    subDecks,
    loading,
    refetch: fetchSubDecks
  };
}
