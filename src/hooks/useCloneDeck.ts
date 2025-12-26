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

            // Call the clone_deck function
            const { data, error } = await supabase.rpc('clone_deck', {
                p_source_deck_id: sourceDeckId,
                p_user_id: user.id,
                p_target_folder_id: targetFolderId
            });

            if (error) throw error;

            toast({
                title: "โคลนสำเร็จ! 🎉",
                description: "Deck ถูกเพิ่มเข้าโฟลเดอร์ของคุณแล้ว",
            });

            return data;
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
