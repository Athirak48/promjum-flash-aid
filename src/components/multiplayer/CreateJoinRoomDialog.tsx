import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Users,
    Plus,
    Hash,
    Loader2,
    Gamepad2,
    Copy,
    Check,
    Sparkles
} from 'lucide-react';
import { useGameRoom } from '@/hooks/useGameRoom';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface CreateJoinRoomDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onRoomJoined?: (roomCode: string) => void;
}

export function CreateJoinRoomDialog({ open, onOpenChange, onRoomJoined }: CreateJoinRoomDialogProps) {
    const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
    const [roomCode, setRoomCode] = useState('');
    const [maxPlayers, setMaxPlayers] = useState(5);
    const [copied, setCopied] = useState(false);
    const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);

    const { createRoom, joinRoom, loading } = useGameRoom();
    const { toast } = useToast();

    const handleCreate = async () => {
        const result = await createRoom(maxPlayers);

        if (result.success && result.roomCode) {
            setCreatedRoomCode(result.roomCode);
            toast({
                title: "🎮 สร้างห้องสำเร็จ!",
                description: `รหัสห้อง: ${result.roomCode}`,
            });
        } else {
            toast({
                title: "❌ สร้างห้องไม่สำเร็จ",
                description: result.error,
                variant: "destructive"
            });
        }
    };

    const handleJoin = async () => {
        if (!roomCode.trim()) {
            toast({
                title: "⚠️ กรุณาใส่รหัสห้อง",
                variant: "destructive"
            });
            return;
        }

        const result = await joinRoom(roomCode);

        if (result.success) {
            toast({
                title: "✅ เข้าห้องสำเร็จ!",
            });
            onRoomJoined?.(roomCode);
            onOpenChange(false);
        } else {
            toast({
                title: "❌ เข้าห้องไม่สำเร็จ",
                description: result.error,
                variant: "destructive"
            });
        }
    };

    const handleCopyCode = () => {
        if (createdRoomCode) {
            navigator.clipboard.writeText(createdRoomCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleEnterLobby = () => {
        if (createdRoomCode) {
            onRoomJoined?.(createdRoomCode);
            onOpenChange(false);
        }
    };

    const resetDialog = () => {
        setCreatedRoomCode(null);
        setRoomCode('');
        setCopied(false);
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            onOpenChange(isOpen);
            if (!isOpen) resetDialog();
        }}>
            <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 border-white/10 text-white overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl" />
                </div>

                <DialogHeader className="relative">
                    <DialogTitle className="text-2xl font-black flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                            <Gamepad2 className="w-6 h-6 text-white" />
                        </div>
                        Multiplayer
                    </DialogTitle>
                    <DialogDescription className="text-slate-300">
                        สร้างห้องใหม่ หรือ เข้าร่วมห้องเพื่อน
                    </DialogDescription>
                </DialogHeader>

                {createdRoomCode ? (
                    // Room Created Success View
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative py-6 space-y-6"
                    >
                        <div className="text-center space-y-2">
                            <Sparkles className="w-12 h-12 mx-auto text-yellow-400" />
                            <h3 className="text-xl font-bold text-white">สร้างห้องสำเร็จ!</h3>
                            <p className="text-slate-400 text-sm">แชร์รหัสนี้ให้เพื่อนเพื่อเข้าร่วม</p>
                        </div>

                        {/* Room Code Display */}
                        <div className="bg-white/10 rounded-2xl p-6 text-center border border-white/20">
                            <p className="text-sm text-slate-400 mb-2">รหัสห้อง</p>
                            <div className="flex items-center justify-center gap-3">
                                <span className="text-4xl font-black tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                    {createdRoomCode}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleCopyCode}
                                    className="rounded-full hover:bg-white/10"
                                >
                                    {copied ? (
                                        <Check className="w-5 h-5 text-green-400" />
                                    ) : (
                                        <Copy className="w-5 h-5 text-white/70" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <Button
                            onClick={handleEnterLobby}
                            className="w-full h-14 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl text-lg"
                        >
                            <Users className="w-5 h-5 mr-2" />
                            เข้าห้องรอ
                        </Button>
                    </motion.div>
                ) : (
                    // Create/Join Tabs
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'create' | 'join')} className="relative">
                        <TabsList className="grid grid-cols-2 bg-white/10 border border-white/20 rounded-xl p-1">
                            <TabsTrigger
                                value="create"
                                className="rounded-lg font-bold data-[state=active]:bg-white/20 data-[state=active]:text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                สร้างห้อง
                            </TabsTrigger>
                            <TabsTrigger
                                value="join"
                                className="rounded-lg font-bold data-[state=active]:bg-white/20 data-[state=active]:text-white"
                            >
                                <Hash className="w-4 h-4 mr-2" />
                                เข้าร่วม
                            </TabsTrigger>
                        </TabsList>

                        {/* Create Room Tab */}
                        <TabsContent value="create" className="space-y-4 mt-4">
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-slate-300">จำนวนผู้เล่นสูงสุด</label>
                                <div className="flex gap-2">
                                    {[2, 3, 4, 5].map((num) => (
                                        <Button
                                            key={num}
                                            variant={maxPlayers === num ? "default" : "outline"}
                                            onClick={() => setMaxPlayers(num)}
                                            className={`flex-1 h-12 rounded-xl font-bold ${maxPlayers === num
                                                    ? 'bg-purple-500 hover:bg-purple-600 text-white'
                                                    : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                                                }`}
                                        >
                                            <Users className="w-4 h-4 mr-1" />
                                            {num}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <Button
                                onClick={handleCreate}
                                disabled={loading}
                                className="w-full h-14 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl text-lg mt-4"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                ) : (
                                    <Gamepad2 className="w-5 h-5 mr-2" />
                                )}
                                สร้างห้อง
                            </Button>
                        </TabsContent>

                        {/* Join Room Tab */}
                        <TabsContent value="join" className="space-y-4 mt-4">
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-slate-300">รหัสห้อง 6 หลัก</label>
                                <Input
                                    value={roomCode}
                                    onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 6))}
                                    placeholder="000000"
                                    maxLength={6}
                                    className="h-14 text-center text-2xl font-bold tracking-[0.3em] bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:ring-purple-500"
                                />
                            </div>

                            <Button
                                onClick={handleJoin}
                                disabled={loading || roomCode.length < 6}
                                className="w-full h-14 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold rounded-xl text-lg mt-4"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                ) : (
                                    <Hash className="w-5 h-5 mr-2" />
                                )}
                                เข้าร่วมห้อง
                            </Button>
                        </TabsContent>
                    </Tabs>
                )}
            </DialogContent>
        </Dialog>
    );
}
