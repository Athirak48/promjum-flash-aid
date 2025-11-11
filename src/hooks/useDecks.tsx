import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Deck {
  id: string;
  name: string;
  name_en: string;
  description: string;
  description_en: string;
  icon: string;
  category: string;
  total_flashcards: number;
  is_premium: boolean;
  created_at: string;
  progress?: {
    progress_percentage: number;
    last_accessed: string;
  };
}

export function useDecks() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDecks = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      // Fetch all decks
      const { data: decksData, error: decksError } = await supabase
        .from('decks')
        .select('*')
        .order('display_order', { ascending: true });

      if (decksError) throw decksError;

      // Fetch user progress if logged in
      if (user) {
        const { data: progressData } = await supabase
          .from('user_deck_progress')
          .select('deck_id, progress_percentage, last_accessed')
          .eq('user_id', user.id);

        // Merge progress with decks
        const decksWithProgress = decksData?.map(deck => {
          const progress = progressData?.find(p => p.deck_id === deck.id);
          return {
            ...deck,
            progress: progress ? {
              progress_percentage: progress.progress_percentage,
              last_accessed: progress.last_accessed
            } : undefined
          };
        });

        setDecks(decksWithProgress || []);
      } else {
        setDecks(decksData || []);
      }
    } catch (error: any) {
      console.error('Error fetching decks:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูล Deck ได้",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecks();
  }, []);

  return {
    decks,
    loading,
    refetch: fetchDecks
  };
}
