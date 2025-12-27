import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    Crown,
    Check,
    X,
    Copy,
    Play,
    BookOpen,
    Gamepad2,
    Clock,
    Target,
    Loader2,
    ArrowLeft,
    Settings,
    UserX
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { supabase } from '@/integrations/supabase/client';
import { useGameRoom, GAME_NAMES, GAME_TYPES } from '@/hooks/useGameRoom';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { GameSelectorDialog } from './GameSelectorDialog';
import { VocabSelectorDialog } from './VocabSelectorDialog';

interface GameLobbyProps {
    roomCode: string;
    onLeave?: () => void;
}

export function GameLobby({ roomCode, onLeave }: GameLobbyProps) {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);
    const [showGameSelector, setShowGameSelector] = useState(false);
    const [showVocabSelector, setShowVocabSelector] = useState(false);
    const [showDevDialog, setShowDevDialog] = useState(false);

    const {
        currentRoom,
        loading,
        isHost,
        allPlayersReady,
        currentPlayer,
        loadRoom,
        toggleReady,
        updateGames,
        addVocabulary,
        clearVocabulary,
        startGame,
        leaveRoom
    } = useGameRoom();

    // Load room on mount
    useEffect(() => {
        if (roomCode) {
            loadRoom(roomCode);
        }
    }, [roomCode, loadRoom]);

    const handleCopyCode = () => {
        navigator.clipboard.writeText(roomCode);
        setCopied(true);
        toast({ title: "📋 คัดลอกรหัสแล้ว!" });
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLeave = async () => {
        await leaveRoom();
        onLeave?.();
    };

    const handleStartGame = async () => {
        setShowDevDialog(true);
        // Original logic commented out for now
        /*
        const result = await startGame();
        if (!result?.success) {
            toast({
                title: "❌ ไม่สามารถเริ่มเกมได้",
                description: result?.error,
                variant: "destructive"
            });
        }
        */
    };

    const handleGamesSelected = async (games: string[]) => {
        await updateGames(games);
        setShowGameSelector(false);
    };

    const handleVocabSelected = async (flashcards: Array<{ id: string; front: string; back: string }>) => {
        await clearVocabulary();
        await addVocabulary(flashcards);
        setShowVocabSelector(false);
    };

    const handleKickPlayer = async (playerId: string) => {
        if (!isHost || !currentRoom) return;

        await supabase
            .from('room_players')
            .delete()
            .eq('room_id', currentRoom.id)
            .eq('id', playerId);

        toast({ title: "เตะผู้เล่นออกแล้ว" });
    };

    if (loading || !currentRoom) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-purple-400" />
            </div>
        );
    }

    const canStart = allPlayersReady &&
        currentRoom.selectedGames.length > 0 &&
        currentRoom.vocabulary.length >= 10;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 p-4 md:p-8">
            {/* Background decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl" />
            </div>

            <div className="max-w-4xl mx-auto relative space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={handleLeave}
                        className="text-white hover:bg-white/10"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        ออกจากห้อง
                    </Button>

                    {/* Room Code */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2"
                    >
                        <span className="text-sm text-slate-400">รหัสห้อง</span>
                        <span className="text-xl font-black tracking-[0.2em] text-white">{roomCode}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCopyCode}
                            className="h-8 w-8 rounded-full hover:bg-white/10"
                        >
                            {copied ? (
                                <Check className="w-4 h-4 text-green-400" />
                            ) : (
                                <Copy className="w-4 h-4 text-white/70" />
                            )}
                        </Button>
                    </motion.div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Players Panel */}
                    <Card className="bg-black/30 backdrop-blur-xl border-white/10 overflow-hidden">
                        <CardHeader className="border-b border-white/10">
                            <CardTitle className="flex items-center gap-2 text-white">
                                <Users className="w-5 h-5 text-purple-400" />
                                ผู้เล่น ({currentRoom.players.length}/{currentRoom.maxPlayers})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="space-y-3">
                                <AnimatePresence>
                                    {currentRoom.players.map((player, index) => (
                                        <motion.div
                                            key={player.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${player.isReady
                                                ? 'bg-green-500/10 border-green-500/30'
                                                : 'bg-white/5 border-white/10'
                                                }`}
                                        >
                                            <Avatar className="w-10 h-10 border-2 border-purple-400/50">
                                                <AvatarImage src={player.avatarUrl || undefined} />
                                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                                                    {player.nickname?.charAt(0)?.toUpperCase() || '?'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-white truncate">{player.nickname}</span>
                                                    {player.isHost && (
                                                        <Crown className="w-4 h-4 text-yellow-400" />
                                                    )}
                                                </div>
                                            </div>
                                            <Badge
                                                variant={player.isReady ? "default" : "secondary"}
                                                className={player.isReady ? 'bg-green-500' : 'bg-white/10'}
                                            >
                                                {player.isReady ? 'พร้อม' : 'รอ...'}
                                            </Badge>
                                            {isHost && !player.isHost && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleKickPlayer(player.id)}
                                                    className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                >
                                                    <UserX className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {/* Empty slots */}
                                {Array(currentRoom.maxPlayers - currentRoom.players.length).fill(0).map((_, i) => (
                                    <div
                                        key={`empty-${i}`}
                                        className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-white/20 text-white/30"
                                    >
                                        <Users className="w-5 h-5" />
                                        รอผู้เล่น...
                                    </div>
                                ))}
                            </div>

                            {/* Ready Button */}
                            {!isHost && currentPlayer && (
                                <Button
                                    onClick={toggleReady}
                                    className={`w-full mt-4 h-12 font-bold rounded-xl ${currentPlayer.isReady
                                        ? 'bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30'
                                        : 'bg-green-500 hover:bg-green-600 text-white'
                                        }`}
                                >
                                    {currentPlayer.isReady ? (
                                        <>
                                            <X className="w-5 h-5 mr-2" />
                                            ยกเลิกพร้อม
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-5 h-5 mr-2" />
                                            พร้อม!
                                        </>
                                    )}
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Settings Panel */}
                    <div className="space-y-4">
                        {/* Selected Games */}
                        <Card className="bg-black/30 backdrop-blur-xl border-white/10">
                            <CardHeader className="border-b border-white/10 pb-3">
                                <CardTitle className="flex items-center justify-between text-white">
                                    <div className="flex items-center gap-2">
                                        <Gamepad2 className="w-5 h-5 text-teal-400" />
                                        เกมที่เลือก ({currentRoom.selectedGames.length}/3)
                                    </div>
                                    {isHost && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowGameSelector(true)}
                                            className="text-purple-400 hover:text-purple-300"
                                        >
                                            <Settings className="w-4 h-4 mr-1" />
                                            เลือก
                                        </Button>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                {currentRoom.selectedGames.length > 0 ? (
                                    <div className="space-y-2">
                                        {currentRoom.selectedGames.map((game, i) => (
                                            <div key={game} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                                                <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 text-xs font-bold flex items-center justify-center">
                                                    {i + 1}
                                                </span>
                                                <span className="text-white font-medium">{GAME_NAMES[game] || game}</span>
                                                <Badge variant="outline" className="ml-auto text-xs border-white/20 text-white/60">
                                                    {GAME_TYPES.TIME_BASED.includes(game as any) ? (
                                                        <><Clock className="w-3 h-3 mr-1" /> เวลา</>
                                                    ) : (
                                                        <><Target className="w-3 h-3 mr-1" /> คะแนน</>
                                                    )}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-white/40">
                                        <Gamepad2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                        <p>ยังไม่ได้เลือกเกม</p>
                                        {isHost && (
                                            <Button
                                                variant="link"
                                                onClick={() => setShowGameSelector(true)}
                                                className="text-purple-400 mt-2"
                                            >
                                                เลือกเกมเลย
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Vocabulary */}
                        <Card className="bg-black/30 backdrop-blur-xl border-white/10">
                            <CardHeader className="border-b border-white/10 pb-3">
                                <CardTitle className="flex items-center justify-between text-white">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-5 h-5 text-pink-400" />
                                        คำศัพท์ ({currentRoom.vocabulary.length} คำ)
                                    </div>
                                    {isHost && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowVocabSelector(true)}
                                            className="text-purple-400 hover:text-purple-300"
                                        >
                                            <Settings className="w-4 h-4 mr-1" />
                                            เลือก
                                        </Button>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                {currentRoom.vocabulary.length >= 10 ? (
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                        {currentRoom.vocabulary.map((vocab, i) => (
                                            <div key={vocab.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                                                <span className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 text-xs font-bold flex items-center justify-center shrink-0">
                                                    {i + 1}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white font-medium truncate">{vocab.frontText}</p>
                                                    <p className="text-xs text-white/50 truncate">{vocab.backText}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-white/40">
                                        <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                        <p>ต้องเลือกอย่างน้อย 10 คำ</p>
                                        {isHost && (
                                            <Button
                                                variant="link"
                                                onClick={() => setShowVocabSelector(true)}
                                                className="text-purple-400 mt-2"
                                            >
                                                เลือกคำศัพท์
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Start Button (Host only) */}
                        {isHost && (
                            <Button
                                onClick={handleStartGame}
                                className="w-full h-14 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl text-lg hover:shadow-lg transition-all"
                            >
                                <Play className="w-6 h-6 mr-2" />
                                เริ่มเกม!
                            </Button>
                        )}

                        {/* Status for non-host */}
                        {!isHost && (
                            <div className="text-center py-4 text-white/60">
                                <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin" />
                                <p>รอ Host เริ่มเกม...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Game Selector Dialog */}
            <GameSelectorDialog
                open={showGameSelector}
                onOpenChange={setShowGameSelector}
                selectedGames={currentRoom.selectedGames}
                onConfirm={handleGamesSelected}
            />

            {/* Vocab Selector Dialog */}
            <VocabSelectorDialog
                open={showVocabSelector}
                onOpenChange={setShowVocabSelector}
                onConfirm={handleVocabSelected}
                minCount={10}
                maxCount={50}
            />

            {/* Dev Dialog */}
            <Dialog open={showDevDialog} onOpenChange={setShowDevDialog}>
                <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-white/10 text-white sm:max-w-md text-center">
                    <DialogHeader>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            type="spring"
                            className="w-24 h-24 mx-auto mb-6 bg-pink-500/20 rounded-full flex items-center justify-center"
                        >
                            <span className="text-5xl">🙈</span>
                        </motion.div>
                        <DialogTitle className="text-6xl font-black text-center bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent tracking-wider py-2">
                            Oops.....
                        </DialogTitle>
                        <DialogDescription className="text-slate-300 text-xl pt-6 leading-relaxed font-medium w-full flex flex-col items-center justify-center gap-2">
                            <span>โหมดนี้กำลังก่อสร้างอยู่น้าาา 🏗️</span>
                            <span>อดใจรออีกนิดนึงนะค้าบ ✨</span>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-8">
                        <Button
                            onClick={() => navigate('/dashboard')}
                            className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 font-bold rounded-xl text-lg shadow-lg hover:shadow-pink-500/25 transition-all"
                        >
                            กลับไปหน้าหลัก 🏠
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
