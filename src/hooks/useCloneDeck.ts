import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useCloneDeck() {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const cloneDeck = async (sourceDeckId: string, targetFolderId: string) => {
        try {
            setLoading(true);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast({
                    title: "กรุณาเข้าสู่ระบบ",
                    description: "คุณต้องเข้าสู่ระบบก่อนจึงจะโคลน Deck ได้",
                    variant: "destructive"
                });
                return null;
            }

            // Fetch source deck flashcards (from user_flashcard_sets and user_flashcards)
            const { data: sourceSet, error: sourceSetError } = await supabase
                .from('user_flashcard_sets')
                .select('*')
                .eq('id', sourceDeckId)
                .single();

            if (sourceSetError || !sourceSet) {
                throw new Error('ไม่พบ Deck ต้นฉบับ');
            }

            const { data: sourceCards, error: sourceCardsError } = await supabase
                .from('user_flashcards')
                .select('*')
                .eq('flashcard_set_id', sourceDeckId);

            if (sourceCardsError) {
                throw sourceCardsError;
            }

            // Create new flashcard set in target folder
            const { data: newSet, error: newSetError } = await supabase
                .from('user_flashcard_sets')
                .insert({
                    user_id: user.id,
                    folder_id: targetFolderId,
                    title: `${sourceSet.title} (คัดลอก)`,
                    source: 'cloned',
                    card_count: sourceCards?.length || 0
                })
                .select()
                .single();

            if (newSetError) throw newSetError;

            // Clone flashcards to new set
            if (sourceCards && sourceCards.length > 0) {
                const clonedCards = sourceCards.map(card => ({
                    user_id: user.id,
                    flashcard_set_id: newSet.id,
                    front_text: card.front_text,
                    back_text: card.back_text,
                    part_of_speech: card.part_of_speech,
                    front_image_url: card.front_image_url,
                    back_image_url: card.back_image_url
                }));

                const { error: insertError } = await supabase
                    .from('user_flashcards')
                    .insert(clonedCards);

                if (insertError) throw insertError;
            }

            toast({
                title: "โคลนสำเร็จ! 🎉",
                description: "Deck ถูกเพิ่มเข้าโฟลเดอร์ของคุณแล้ว",
            });

            return newSet;
        } catch (error: any) {
            console.error('Error cloning deck:', error);
            toast({
                title: "เกิดข้อผิดพลาด",
                description: error.message || "ไม่สามารถโคลน Deck ได้",
                variant: "destructive"
            });
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        cloneDeck,
        loading
    };
}
