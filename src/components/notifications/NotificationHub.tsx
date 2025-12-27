import { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCheck, MessageSquare, Mail, Smartphone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface UserNotification {
    id: string;
    broadcast_id: string;
    title: string;
    message: string;
    type: 'push' | 'email' | 'in_app';
    is_read: boolean;
    created_at: string;
}

export const NotificationHub = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<UserNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
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
                .limit(20);

            if (error) {
                // Fallback to old notifications table if new one doesn't exist
                console.warn('Using fallback notifications:', error.message);
                await fetchLegacyNotifications();
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
            await fetchLegacyNotifications();
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    // Fallback to old notifications table
    const fetchLegacyNotifications = async () => {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;

            if (data) {
                const readIds = getReadIds();
                const formattedNotifications: UserNotification[] = data.map((n: any) => ({
                    id: n.id,
                    broadcast_id: n.id,
                    title: n.title,
                    message: n.message,
                    type: n.type || 'in_app',
                    is_read: readIds.includes(n.id),
                    created_at: n.created_at
                }));

                setNotifications(formattedNotifications);
                setUnreadCount(formattedNotifications.filter(n => !n.is_read).length);
            }
        } catch (error) {
            console.error('Error fetching legacy notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    // Load read notifications from LocalStorage (for legacy support)
    const getReadIds = () => {
        const stored = localStorage.getItem('read_notifications');
        return stored ? JSON.parse(stored) : [];
    };

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Subscribe to new notifications in real-time
    useEffect(() => {
        if (!user?.id) return;

        const channel = supabase
            .channel('user-notifications-hub')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notification_broadcast_recipients',
                    filter: `user_id=eq.${user.id}`
                },
                () => {
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

            if (error) {
                // Fallback to localStorage for legacy
                const readIds = getReadIds();
                localStorage.setItem('read_notifications', JSON.stringify([...readIds, notificationId]));
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

            if (error) {
                // Fallback to localStorage for legacy
                const allIds = notifications.map(n => n.id);
                localStorage.setItem('read_notifications', JSON.stringify(allIds));
            }

            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'push': return <Smartphone className="h-4 w-4 text-purple-500" />;
            case 'email': return <Mail className="h-4 w-4 text-blue-500" />;
            default: return <MessageSquare className="h-4 w-4 text-cyan-500" />;
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-white/90 hover:text-white hover:bg-white/10">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-lg">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <h4 className="font-semibold text-slate-900 dark:text-white">การแจ้งเตือน</h4>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <>
                                <Badge variant="secondary" className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                                    {unreadCount} ใหม่
                                </Badge>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        markAllAsRead();
                                    }}
                                >
                                    <CheckCheck className="h-4 w-4" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>
                <ScrollArea className="h-[300px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-full p-4">
                            <div className="animate-spin h-5 w-5 border-2 border-slate-300 border-t-blue-500 rounded-full" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-4 text-center text-slate-400 dark:text-slate-500">
                            <Bell className="h-8 w-8 mb-2 opacity-50" />
                            <p className="text-sm">ไม่มีการแจ้งเตือน</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={cn(
                                        "p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer",
                                        !notif.is_read && "bg-blue-50/50 dark:bg-blue-900/10"
                                    )}
                                    onClick={() => {
                                        if (!notif.is_read) {
                                            markAsRead(notif.id);
                                        }
                                    }}
                                >
                                    <div className="flex gap-3">
                                        <div className="mt-0.5">
                                            {getTypeIcon(notif.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2 mb-1">
                                                <div className="flex items-center gap-2">
                                                    <h5 className={cn(
                                                        "text-sm font-medium leading-none truncate",
                                                        !notif.is_read ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"
                                                    )}>
                                                        {notif.title}
                                                    </h5>
                                                    {!notif.is_read && (
                                                        <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                                                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: th })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                                {notif.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
};
