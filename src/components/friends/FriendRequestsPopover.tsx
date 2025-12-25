import { useState } from 'react';
import { useFriends, FriendRequest } from '@/hooks/useFriends';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, X, Loader2, UserCheck, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface FriendRequestsPopoverProps {
    children?: React.ReactNode;
}

export function FriendRequestsPopover({ children }: FriendRequestsPopoverProps) {
    const { pendingRequests, acceptRequest, rejectRequest } = useFriends();
    const { toast } = useToast();
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleAccept = async (request: FriendRequest) => {
        setProcessingId(request.requestId);

        const result = await acceptRequest(request.requestId);

        if (result.success) {
            toast({
                title: "🎉 เป็นเพื่อนกันแล้ว!",
                description: `คุณและ ${request.nickname} เป็นเพื่อนกันแล้ว`,
            });
        } else {
            toast({
                title: "❌ ไม่สำเร็จ",
                description: result.message,
                variant: "destructive"
            });
        }

        setProcessingId(null);
    };

    const handleReject = async (request: FriendRequest) => {
        setProcessingId(request.requestId);

        const result = await rejectRequest(request.requestId);

        if (result.success) {
            toast({
                title: "ปฏิเสธคำขอแล้ว",
                description: `ปฏิเสธคำขอจาก ${request.nickname}`,
            });
        }

        setProcessingId(null);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                {children || (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative rounded-full hover:bg-white/10"
                    >
                        <UserPlus className="w-5 h-5 text-white" />
                        {pendingRequests.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white animate-pulse">
                                {pendingRequests.length}
                            </span>
                        )}
                    </Button>
                )}
            </PopoverTrigger>
            <PopoverContent
                className="w-80 p-0 bg-white border-slate-200 shadow-lg"
                align="end"
            >
                <div className="p-3 border-b border-slate-200">
                    <h3 className="font-bold flex items-center gap-2 text-slate-900">
                        <UserCheck className="w-4 h-4 text-purple-500" />
                        คำขอเป็นเพื่อน
                        {pendingRequests.length > 0 && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                {pendingRequests.length}
                            </span>
                        )}
                    </h3>
                </div>

                <div className="max-h-[300px] overflow-y-auto">
                    <AnimatePresence mode="popLayout">
                        {pendingRequests.length > 0 ? (
                            pendingRequests.map((request, index) => (
                                <motion.div
                                    key={request.requestId}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="p-3 border-b border-slate-100 hover:bg-slate-50 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-10 h-10 border-2 border-purple-200">
                                            <AvatarImage src={request.avatarUrl || undefined} />
                                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                                                {request.nickname?.charAt(0)?.toUpperCase() || '?'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-slate-900 truncate">
                                                {request.nickname}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                Level {request.level} • {request.totalXP.toLocaleString()} XP
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-2 ml-13">
                                        {processingId === request.requestId ? (
                                            <Loader2 className="w-5 h-5 animate-spin text-purple-500 mx-auto" />
                                        ) : (
                                            <>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleAccept(request)}
                                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-lg h-8"
                                                >
                                                    <Check className="w-4 h-4 mr-1" /> ยอมรับ
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleReject(request)}
                                                    className="flex-1 bg-slate-100 hover:bg-red-100 text-slate-700 hover:text-red-600 rounded-lg h-8"
                                                >
                                                    <X className="w-4 h-4 mr-1" /> ปฏิเสธ
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="p-6 text-center text-slate-400">
                                <UserCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">ไม่มีคำขอใหม่</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </PopoverContent>
        </Popover>
    );
}
