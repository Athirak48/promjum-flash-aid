import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Flashcard {
  id: string;
  front_text: string;
  back_text: string;
  upload_id?: string;
  created_at: string;
}

export function useFlashcards() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFlashcards = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFlashcards(data || []);
    } catch (error: any) {
      console.error('Error fetching flashcards:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลแฟลชการ์ดได้",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, []);

  return {
    flashcards,
    loading,
    refetch: fetchFlashcards
  };
}