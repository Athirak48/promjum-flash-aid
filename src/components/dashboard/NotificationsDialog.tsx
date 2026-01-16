import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, CheckCheck, Clock } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

interface NotificationsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function NotificationsDialog({ open, onOpenChange }: NotificationsDialogProps) {
    const { notifications, markAsRead, markAllAsRead } = useNotifications();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-slate-950 border-slate-800 text-white p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-6 pb-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                                <Bell className="w-5 h-5" />
                            </div>
                            การแจ้งเตือน
                        </DialogTitle>
                        {notifications.some(n => !n.is_read) && (
                            <button
                                onClick={() => markAllAsRead()}
                                className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1 transition-colors px-3 py-1.5 rounded-full hover:bg-slate-800"
                            >
                                <CheckCheck className="w-3.5 h-3.5" />
                                อ่านทั้งหมด
                            </button>
                        )}
                    </div>
                    <DialogDescription className="hidden">
                        รายการแจ้งเตือนทั้งหมดของคุณ
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-[400px] p-6">
                    <div className="flex flex-col gap-4">
                        <AnimatePresence>
                            {notifications.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center justify-center py-12 text-center text-slate-500 gap-3"
                                >
                                    <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center">
                                        <Bell className="w-6 h-6 opacity-50" />
                                    </div>
                                    <p>ไม่มีการแจ้งเตือนใหม่</p>
                                </motion.div>
                            ) : (
                                notifications.map((notification) => (
                                    <motion.div
                                        key={notification.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, height: 0 }}
                                        layout
                                        onClick={() => !notification.is_read && markAsRead(notification.id)}
                                        className={`relative group p-4 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${notification.is_read
                                                ? "bg-slate-900/30 border-slate-800/50 opacity-60 hover:opacity-100"
                                                : "bg-indigo-950/20 border-indigo-500/30 shadow-lg shadow-indigo-500/5"
                                            }`}
                                    >
                                        {!notification.is_read && (
                                            <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                        )}

                                        <div className="flex gap-4">
                                            <div className={`mt-1 h-2 w-2 rounded-full ${notification.is_read ? 'bg-slate-600' : 'bg-indigo-500'} shrink-0`} />
                                            <div className="space-y-1">
                                                <h4 className={`text-sm font-semibold leading-none ${notification.is_read ? 'text-slate-300' : 'text-white'}`}>
                                                    {notification.title}
                                                </h4>
                                                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center gap-1.5 pt-1">
                                                    <Clock className="w-3 h-3 text-slate-500" />
                                                    <span className="text-[10px] text-slate-500 font-medium tracking-wide">
                                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: th })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
