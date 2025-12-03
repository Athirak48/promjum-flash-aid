import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type ScheduledReview = Database['public']['Tables']['scheduled_reviews']['Row'];
type InsertScheduledReview = Database['public']['Tables']['scheduled_reviews']['Insert'];
type UpdateScheduledReview = Database['public']['Tables']['scheduled_reviews']['Update'];

export function useScheduledReviews() {
    const { toast } = useToast();
    const [reviews, setReviews] = useState<ScheduledReview[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('scheduled_reviews')
                .select('*')
                .eq('user_id', user.id)
                .order('scheduled_date', { ascending: true })
                .order('scheduled_time', { ascending: true });

            if (error) throw error;
            setReviews(data || []);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            toast({
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถโหลดข้อมูลตารางเรียนรู้ได้",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const addReview = async (review: Omit<InsertScheduledReview, 'user_id'>) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast({
                    title: "กรุณาเข้าสู่ระบบ",
                    description: "คุณต้องเข้าสู่ระบบเพื่อสร้างตารางเรียนรู้",
                    variant: "destructive"
                });
                return null;
            }

            const { data, error } = await supabase
                .from('scheduled_reviews')
                .insert({ ...review, user_id: user.id })
                .select()
                .single();

            if (error) throw error;

            setReviews(prev => [...prev, data]);
            toast({
                title: "บันทึกสำเร็จ",
                description: "เพิ่มกิจกรรมลงในตารางเรียบร้อยแล้ว",
            });
            return data;
        } catch (error) {
            console.error('Error adding review:', error);
            toast({
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถบันทึกกิจกรรมได้",
                variant: "destructive"
            });
            return null;
        }
    };

    const updateReview = async (id: string, updates: UpdateScheduledReview) => {
        try {
            const { data, error } = await supabase
                .from('scheduled_reviews')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            setReviews(prev => prev.map(r => r.id === id ? data : r));
            toast({
                title: "อัปเดตสำเร็จ",
                description: "แก้ไขข้อมูลกิจกรรมเรียบร้อยแล้ว",
            });
            return data;
        } catch (error) {
            console.error('Error updating review:', error);
            toast({
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถแก้ไขกิจกรรมได้",
                variant: "destructive"
            });
            return null;
        }
    };

    const deleteReview = async (id: string) => {
        try {
            const { error } = await supabase
                .from('scheduled_reviews')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setReviews(prev => prev.filter(r => r.id !== id));
            toast({
                title: "ลบสำเร็จ",
                description: "ลบกิจกรรมออกจากตารางเรียบร้อยแล้ว",
            });
            return true;
        } catch (error) {
            console.error('Error deleting review:', error);
            toast({
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถลบกิจกรรมได้",
                variant: "destructive"
            });
            return false;
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    return {
        reviews,
        isLoading,
        fetchReviews,
        addReview,
        updateReview,
        deleteReview
    };
}
