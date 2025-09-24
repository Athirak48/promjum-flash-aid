import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MarketplaceCard {
  id: string;
  flashcard_id: string;
  price: number;
  status: string;
  created_at: string;
  uploader_id?: string;
  flashcard?: {
    id: string;
    front_text: string;
    back_text: string;
  };
}

export function useMarketplace() {
  const [cards, setCards] = useState<MarketplaceCard[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMarketplaceCards = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('marketplace_cards')
        .select(`
          *,
          flashcards (
            id,
            front_text,
            back_text
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCards(data || []);
    } catch (error: any) {
      console.error('Error fetching marketplace cards:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูล marketplace ได้",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketplaceCards();
  }, []);

  return {
    cards,
    loading,
    refetch: fetchMarketplaceCards
  };
}