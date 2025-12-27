import { useState } from 'react';
import { Bell, Check, CheckCheck, MessageSquare, Mail, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

export function NotificationBell() {
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'push': return <Smartphone className="h-4 w-4 text-purple-500" />;
            case 'email': return <Mail className="h-4 w-4 text-blue-500" />;
            default: return <MessageSquare className="h-4 w-4 text-cyan-500" />;
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'เมื่อสักครู่';
        if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
        if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
        if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
        return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-500 border-2 border-background"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>การแจ้งเตือน</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={(e) => {
                                e.preventDefault();
                                markAllAsRead();
                            }}
                        >
                            <CheckCheck className="h-3 w-3" />
                            อ่านทั้งหมด
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <ScrollArea className="h-[300px]">
                    {loading ? (
                        <div className="flex items-center justify-center py-8 text-slate-400">
                            <div className="animate-spin h-5 w-5 border-2 border-slate-300 border-t-blue-500 rounded-full" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                            <Bell className="h-8 w-8 mb-2 opacity-50" />
                            <p className="text-sm">ไม่มีการแจ้งเตือน</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={cn(
                                    "flex flex-col items-start gap-1 p-3 cursor-pointer",
                                    !notification.is_read && "bg-blue-50/50 dark:bg-blue-900/10"
                                )}
                                onClick={() => {
                                    if (!notification.is_read) {
                                        markAsRead(notification.id);
                                    }
                                }}
                            >
                                <div className="flex items-start gap-3 w-full">
                                    <div className="mt-0.5">
                                        {getTypeIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className={cn(
                                                "font-medium text-sm truncate",
                                                !notification.is_read && "text-slate-900 dark:text-white"
                                            )}>
                                                {notification.title}
                                            </p>
                                            {!notification.is_read && (
                                                <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                            {formatTime(notification.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        ))
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
