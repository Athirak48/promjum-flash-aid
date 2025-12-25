import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'push' | 'email' | 'in_app';
    status: 'sent' | 'scheduled' | 'draft';
    created_at: string;
}

export const NotificationHub = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    // Load read notifications from LocalStorage to determine unread count
    const getReadIds = () => {
        const stored = localStorage.getItem('read_notifications');
        return stored ? JSON.parse(stored) : [];
    };

    useEffect(() => {
        fetchNotifications();

        // Subscribe to new notifications
        const channel = supabase
            .channel('public:notifications')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
                const newNotif = payload.new as Notification;
                if (newNotif.status === 'sent') {
                    setNotifications(prev => [newNotif, ...prev]);
                    setUnreadCount(prev => prev + 1);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('status', 'sent') // Only show sent notifications
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;

            if (data) {
                setNotifications(data as Notification[]);

                // Calculate unread
                const readIds = getReadIds();
                const unread = data.filter(n => !readIds.includes(n.id)).length;
                setUnreadCount(unread);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open && unreadCount > 0) {
            // Mark all visible as read when opening
            const readIds = getReadIds();
            const newReadIds = [...readIds, ...notifications.map(n => n.id)];
            // Deduplicate
            const uniqueReadIds = Array.from(new Set(newReadIds));
            localStorage.setItem('read_notifications', JSON.stringify(uniqueReadIds));
            setUnreadCount(0);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-white/90 hover:text-white hover:bg-white/10">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 bg-white border-slate-200 shadow-lg">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                    <h4 className="font-semibold text-slate-900">การแจ้งเตือน</h4>
                    {unreadCount > 0 && (
                        <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                            {unreadCount} ใหม่
                        </Badge>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-4 text-center text-slate-400">
                            <Bell className="h-8 w-8 mb-2 opacity-50" />
                            <p className="text-sm">ไม่มีการแจ้งเตือน</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {notifications.map((notif) => (
                                <div key={notif.id} className="p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <h5 className="text-sm font-medium leading-none text-slate-900">{notif.title}</h5>
                                        <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                                            {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: th })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-2">
                                        {notif.message}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
};
