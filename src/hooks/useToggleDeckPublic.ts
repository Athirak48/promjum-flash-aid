import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useToggleDeckPublic() {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const togglePublic = async (
        deckId: string,
        isPublic: boolean,
        category?: string,
        tags?: string[]
    ) => {
        try {
            setLoading(true);

            const updateData: any = { is_public: isPublic };

            if (isPublic) {
                // When making public, allow setting category and tags
                if (category) updateData.category = category;
                if (tags) updateData.tags = tags;
            }

            const { error } = await supabase
                .from('sub_decks')
                .update(updateData)
                .eq('id', deckId);

            if (error) throw error;

            toast({
                title: isPublic ? "แชร์สำเร็จ! 🌍" : "ยกเลิกการแชร์",
                description: isPublic
                    ? "Deck ของคุณถูกแชร์สู่ชุมชนแล้ว"
                    : "Deck ของคุณเป็นส่วนตัวแล้ว",
            });

            return true;
        } catch (error: any) {
            console.error('Error toggling deck public:', error);
            toast({
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถเปลี่ยนสถานะการแชร์ได้",
                variant: "destructive"
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        togglePublic,
        loading
    };
}
