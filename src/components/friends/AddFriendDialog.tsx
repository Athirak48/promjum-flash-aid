import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UserPlus, Check, Clock, X, Loader2 } from 'lucide-react';
import { useFriends, FriendProfile } from '@/hooks/useFriends';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AddFriendDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddFriendDialog({ open, onOpenChange }: AddFriendDialogProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sendingTo, setSendingTo] = useState<string | null>(null);
    const { searchResults, searching, searchUsers, sendFriendRequest, clearSearch } = useFriends();
    const { toast } = useToast();

    const handleSearch = () => {
        if (searchQuery.trim().length >= 2) {
            searchUsers(searchQuery);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // Clear on close
    useEffect(() => {
        if (!open) {
            setSearchQuery('');
            clearSearch();
        }
    }, [open, clearSearch]);

    const handleSendRequest = async (user: FriendProfile) => {
        setSendingTo(user.userId);

        const result = await sendFriendRequest(user.userId);

        if (result.success) {
            toast({
                title: "✅ ส่งคำขอแล้ว!",
                description: `ส่งคำขอเป็นเพื่อนไปยัง ${user.nickname} แล้ว`,
            });
            // Refresh search to update status
            searchUsers(searchQuery);
        } else {
            toast({
                title: "❌ ไม่สำเร็จ",
                description: result.message,
                variant: "destructive"
            });
        }

        setSendingTo(null);
    };

    const getStatusButton = (user: FriendProfile) => {
        if (sendingTo === user.userId) {
            return (
                <Button size="sm" disabled className="rounded-full">
                    <Loader2 className="w-4 h-4 animate-spin" />
                </Button>
            );
        }

        switch (user.friendshipStatus) {
            case 'accepted':
                return (
                    <Button size="sm" variant="ghost" disabled className="rounded-full text-green-600">
                        <Check className="w-4 h-4 mr-1" /> เพื่อนกันแล้ว
                    </Button>
                );
            case 'pending':
                return (
                    <Button size="sm" variant="ghost" disabled className="rounded-full text-amber-600">
                        <Clock className="w-4 h-4 mr-1" /> รอตอบกลับ
                    </Button>
                );
            default:
                return (
                    <Button
                        size="sm"
                        onClick={() => handleSendRequest(user)}
                        className="rounded-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
                    >
                        <UserPlus className="w-4 h-4 mr-1" /> เพิ่มเพื่อน
                    </Button>
                );
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-purple-400" />
                        เพิ่มเพื่อน
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search Input */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="พิมพ์ชื่อเพื่อค้นหา..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:ring-purple-500"
                            />
                        </div>
                        <Button
                            onClick={handleSearch}
                            disabled={searching || searchQuery.trim().length < 2}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ค้นหา'}
                        </Button>
                    </div>

                    {/* Search Results */}
                    <div className="min-h-[200px] max-h-[300px] overflow-y-auto space-y-2">
                        {searchResults.length > 0 ? (
                            <AnimatePresence mode="popLayout">
                                {searchResults.map((user, index) => (
                                    <motion.div
                                        key={user.userId}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-10 h-10 border-2 border-purple-400/50">
                                                <AvatarImage src={user.avatarUrl || undefined} />
                                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                                                    {user.nickname?.charAt(0)?.toUpperCase() || '?'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-semibold text-white">{user.nickname}</div>
                                                <div className="text-xs text-slate-400">
                                                    Level {user.level} • {user.totalXP.toLocaleString()} XP
                                                </div>
                                            </div>
                                        </div>
                                        {getStatusButton(user)}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        ) : searchQuery.length >= 2 && !searching ? (
                            <div className="flex flex-col items-center justify-center h-[150px] text-slate-400">
                                <Search className="w-12 h-12 mb-2 opacity-30" />
                                <p>ไม่พบผู้ใช้</p>
                                <p className="text-xs">ลองค้นหาด้วยชื่ออื่น</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[150px] text-slate-400">
                                <UserPlus className="w-12 h-12 mb-2 opacity-30" />
                                <p>พิมพ์ชื่อและกดค้นหา</p>
                                <p className="text-xs">เพื่อเพิ่มเพื่อน</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
