import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Flashcard {
    id: string;
    front_text: string;
    back_text: string;
    upload_id?: string;
    created_at: string;
    set_id?: string;
    user_id?: string;
    image_url?: string;
    audio_url?: string;
    difficulty_level?: string;
    next_review?: string;
    interval?: number;
    ease_factor?: number;
    repetitions?: number;
    srs_score?: number | null;
    srs_level?: number | null;
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
            setFlashcards(data as Flashcard[] || []);
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