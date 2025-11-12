import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CreateMockDataButtonProps {
  userId: string;
  userEmail: string;
  onSuccess?: () => void;
}

export default function CreateMockDataButton({ userId, userEmail, onSuccess }: CreateMockDataButtonProps) {
  const [loading, setLoading] = useState(false);

  const createMockData = async () => {
    try {
      setLoading(true);

      // Fetch available decks and subdecks
      const { data: decks } = await supabase
        .from('decks')
        .select('id, name')
        .eq('is_published', true)
        .limit(3);

      const { data: subdecks } = await supabase
        .from('sub_decks')
        .select('id, name')
        .eq('is_published', true)
        .limit(5);

      if (!decks || !subdecks) {
        throw new Error('No decks or subdecks found');
      }

      // Insert deck progress
      const deckProgress = decks.map((deck, index) => ({
        user_id: userId,
        deck_id: deck.id,
        progress_percentage: [65, 30, 90][index] || 50,
        last_accessed: new Date(Date.now() - (index + 1) * 86400000).toISOString(), // 1-3 days ago
      }));

      const { error: deckError } = await supabase
        .from('user_deck_progress')
        .upsert(deckProgress, { onConflict: 'user_id,deck_id' });

      if (deckError) throw deckError;

      // Insert subdeck progress
      const subdeckProgress = subdecks.map((subdeck, index) => ({
        user_id: userId,
        subdeck_id: subdeck.id,
        cards_learned: [15, 8, 20, 12, 25][index] || 10,
        is_completed: [false, false, true, false, true][index] || false,
        last_accessed: new Date(Date.now() - (index + 1) * 86400000).toISOString(),
      }));

      const { error: subdeckError } = await supabase
        .from('user_subdeck_progress')
        .upsert(subdeckProgress, { onConflict: 'user_id,subdeck_id' });

      if (subdeckError) throw subdeckError;

      toast.success('สร้าง Mock Data สำเร็จ!', {
        description: `สร้างข้อมูลสำหรับ ${userEmail}`,
      });
      
      // Trigger refresh
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error creating mock data:', error);
      toast.error('ไม่สามารถสร้าง Mock Data ได้', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={createMockData}
      disabled={loading}
      variant="outline"
      size="sm"
      className="ml-auto"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          กำลังสร้าง...
        </>
      ) : (
        'สร้าง Mock Data'
      )}
    </Button>
  );
}
