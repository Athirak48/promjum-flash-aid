import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserNotification {
    id: string;
    broadcast_id: string;
    title: string;
    message: string;
    type: 'push' | 'email' | 'in_app';
    is_read: boolean;
    created_at: string;
}

export function useNotifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<UserNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        if (!user?.id) {
            setNotifications([]);
            setUnreadCount(0);
            setLoading(false);
            return;
        }

        try {
            // Fetch user's notification recipients with broadcast details
            const { data, error } = await supabase
                .from('notification_broadcast_recipients')
                .select(`
                    id,
                    broadcast_id,
                    is_read,
                    created_at,
                    broadcast:notification_broadcasts(
                        title,
                        message,
                        type
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) {
                console.error('Error fetching notifications:', error);
                setNotifications([]);
                return;
            }

            const formattedNotifications: UserNotification[] = (data || []).map((item: any) => ({
                id: item.id,
                broadcast_id: item.broadcast_id,
                title: item.broadcast?.title || 'Notification',
                message: item.broadcast?.message || '',
                type: item.broadcast?.type || 'in_app',
                is_read: item.is_read,
                created_at: item.created_at
            }));

            setNotifications(formattedNotifications);
            setUnreadCount(formattedNotifications.filter(n => !n.is_read).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Subscribe to new notifications in real-time
    useEffect(() => {
        if (!user?.id) return;

        const channel = supabase
            .channel('user-notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notification_broadcast_recipients',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    // Refetch to get full broadcast details
                    fetchNotifications();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id, fetchNotifications]);

    const markAsRead = async (notificationId: string) => {
        try {
            const { error } = await supabase
                .from('notification_broadcast_recipients')
                .update({
                    is_read: true,
                    read_at: new Date().toISOString()
                })
                .eq('id', notificationId);

            if (error) throw error;

            // Also increment read_count on the broadcast - silently ignore errors
            const notification = notifications.find(n => n.id === notificationId);
            if (notification?.broadcast_id) {
                try {
                    await supabase
                        .from('notification_broadcasts')
                        .update({ read_count: 1 })
                        .eq('id', notification.broadcast_id);
                } catch {
                    // Ignore if update fails
                }
            }

            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        if (!user?.id) return;

        try {
            const { error } = await supabase
                .from('notification_broadcast_recipients')
                .update({
                    is_read: true,
                    read_at: new Date().toISOString()
                })
                .eq('user_id', user.id)
                .eq('is_read', false);

            if (error) throw error;

            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        refetch: fetchNotifications
    };
}
