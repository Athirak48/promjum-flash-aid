import { useState, useEffect } from 'react';
import { useGameRoom, GAME_NAMES, RoomVocabulary } from '@/hooks/useGameRoom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
    Loader2,
    Trophy,
    Clock,
    Users,
    ArrowRight,
    CheckCircle,
    Crown,
    RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import game components
import { QuizGameComponent } from '@/components/games/QuizGame';
import { MatchingGameComponent } from '@/components/games/MatchingGame';
import { WordScrambleComponent } from '@/components/games/WordScramble';
import { HangmanComponent } from '@/components/games/HangmanGame';
import { WordSearchComponent } from '@/components/games/WordSearchGame';
import { ListenChooseComponent } from '@/components/games/ListenChooseGame';
import { VocabBlinderComponent } from '@/components/games/VocabBlinderGame';
import { HoneycombComponent } from '@/components/games/HoneycombGame';
import { NinjaSliceComponent } from '@/components/games/NinjaSliceGame';

interface MultiplayerGameWrapperProps {
    roomCode: string;
    onComplete?: () => void;
}

interface GameFlashcard {
    id: string;
    front_text: string;
    back_text: string;
}

export function MultiplayerGameWrapper({ roomCode, onComplete }: MultiplayerGameWrapperProps) {
    const {
        currentRoom,
        loading,
        isHost,
        currentPlayer,
        submitResult,
        nextGame,
        getGameResults,
        loadRoom
    } = useGameRoom();

    const [gameStartTime, setGameStartTime] = useState<number>(0);
    const [showResults, setShowResults] = useState(false);
    const [gameResults, setGameResults] = useState<any[]>([]);
    const [waitingForOthers, setWaitingForOthers] = useState(false);

    // Load room on mount
    useEffect(() => {
        if (roomCode) {
            loadRoom(roomCode);
        }
    }, [roomCode, loadRoom]);

    // Start timer when game begins
    useEffect(() => {
        if (currentRoom?.status === 'playing') {
            setGameStartTime(Date.now());
        }
    }, [currentRoom?.status, currentRoom?.currentGameIndex]);

    // Convert room vocabulary to game format
    const getGameFlashcards = (): GameFlashcard[] => {
        if (!currentRoom?.vocabulary) return [];
        return currentRoom.vocabulary.map(v => ({
            id: v.id,
            front_text: v.frontText,
            back_text: v.backText
        }));
    };

    // Handle game completion
    const handleGameComplete = async (score: number, correctCount: number, totalCount: number) => {
        const timeMs = Date.now() - gameStartTime;
        const currentGame = currentRoom?.selectedGames[currentRoom.currentGameIndex];

        if (currentGame) {
            await submitResult(currentGame, score, timeMs, correctCount, totalCount);
        }

        setWaitingForOthers(true);

        // Poll for all results
        const checkResults = async () => {
            const results = await getGameResults(currentRoom?.currentGameIndex);
            if (results.length >= (currentRoom?.players.length || 0)) {
                setGameResults(results);
                setShowResults(true);
                setWaitingForOthers(false);
            } else {
                setTimeout(checkResults, 1000);
            }
        };
        checkResults();
    };

    // Handle next game
    const handleNextGame = async () => {
        setShowResults(false);
        setGameResults([]);
        if (isHost) {
            await nextGame();
        }
    };

    if (loading || !currentRoom) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-purple-400" />
            </div>
        );
    }

    // Show waiting screen for others to finish
    if (waitingForOthers) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 flex items-center justify-center p-4">
                <Card className="bg-black/30 backdrop-blur-xl border-white/10 p-8 text-center max-w-md">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                        <CheckCircle className="w-16 h-16 mx-auto text-green-400 mb-4" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-white mb-2">เสร็จแล้ว!</h2>
                    <p className="text-slate-300 mb-4">กำลังรอผู้เล่นคนอื่น...</p>
                    <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                        <span className="text-slate-400">
                            {gameResults.length}/{currentRoom.players.length} เสร็จแล้ว
                        </span>
                    </div>
                </Card>
            </div>
        );
    }

    // Show results
    if (showResults) {
        const isLastGame = currentRoom.currentGameIndex >= currentRoom.selectedGames.length - 1;

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 flex items-center justify-center p-4">
                <Card className="bg-black/30 backdrop-blur-xl border-white/10 w-full max-w-lg">
                    <CardContent className="p-6">
                        <div className="text-center mb-6">
                            <Trophy className="w-12 h-12 mx-auto text-yellow-400 mb-2" />
                            <h2 className="text-2xl font-bold text-white">
                                {GAME_NAMES[currentRoom.selectedGames[currentRoom.currentGameIndex]]}
                            </h2>
                            <p className="text-slate-400">ผลการแข่งขัน</p>
                        </div>

                        <div className="space-y-3 mb-6">
                            {gameResults.map((result, index) => {
                                const player = currentRoom.players.find(p => p.userId === result.userId);
                                const isMe = player?.userId === currentPlayer?.userId;

                                return (
                                    <motion.div
                                        key={result.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`flex items-center gap-3 p-3 rounded-xl ${isMe ? 'bg-purple-500/20 border border-purple-500/50' : 'bg-white/5'
                                            }`}
                                    >
                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${result.rank === 1 ? 'bg-yellow-500 text-white' :
                                            result.rank === 2 ? 'bg-slate-400 text-white' :
                                                result.rank === 3 ? 'bg-amber-700 text-white' :
                                                    'bg-white/10 text-white'
                                            }`}>
                                            {result.rank === 1 ? <Crown className="w-4 h-4" /> : result.rank}
                                        </span>
                                        <div className="flex-1">
                                            <p className="font-medium text-white">{player?.nickname || 'Player'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-white">{result.score} pts</p>
                                            <p className="text-xs text-slate-400">
                                                {(result.timeMs / 1000).toFixed(1)}s
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {isHost && (
                            <Button
                                onClick={handleNextGame}
                                className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl"
                            >
                                {isLastGame ? (
                                    <>
                                        <Trophy className="w-5 h-5 mr-2" />
                                        ดูผลรวม
                                    </>
                                ) : (
                                    <>
                                        <ArrowRight className="w-5 h-5 mr-2" />
                                        เกมถัดไป
                                    </>
                                )}
                            </Button>
                        )}

                        {!isHost && (
                            <p className="text-center text-slate-400">
                                <Loader2 className="w-4 h-4 inline animate-spin mr-2" />
                                รอ Host ไปเกมถัดไป...
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Render current game
    const currentGameType = currentRoom.selectedGames[currentRoom.currentGameIndex];
    const flashcards = getGameFlashcards();

    // Handle return to lobby
    const handleReturnToLobby = async () => {
        // Reset room to waiting state (host only)
        if (isHost) {
            await supabase
                .from('game_rooms')
                .update({
                    status: 'waiting',
                    current_game_index: 0,
                    selected_games: []
                })
                .eq('id', currentRoom.id);

            // Clear game results
            await supabase
                .from('game_results')
                .delete()
                .eq('room_id', currentRoom.id);

            // Reset player scores
            await supabase
                .from('room_players')
                .update({
                    is_ready: false,
                    total_score: 0,
                    total_time_ms: 0,
                    final_rank: null
                })
                .eq('room_id', currentRoom.id);

            // Clear vocabulary for new game
            await supabase
                .from('room_vocabulary')
                .delete()
                .eq('room_id', currentRoom.id);
        }

        // Reload room to get updated state
        loadRoom(currentRoom.roomCode);
    };

    if (currentRoom.status === 'finished') {
        // Show final leaderboard
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 flex items-center justify-center p-4">
                <Card className="bg-black/30 backdrop-blur-xl border-white/10 w-full max-w-lg">
                    <CardContent className="p-6">
                        <div className="text-center mb-6">
                            <Trophy className="w-16 h-16 mx-auto text-yellow-400 mb-2" />
                            <h2 className="text-3xl font-bold text-white">การแข่งขันจบลง!</h2>
                        </div>

                        <div className="space-y-3 mb-6">
                            {currentRoom.players
                                .sort((a, b) => (a.finalRank || 99) - (b.finalRank || 99))
                                .map((player, index) => {
                                    const isMe = player.userId === currentPlayer?.userId;

                                    return (
                                        <motion.div
                                            key={player.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.15 }}
                                            className={`flex items-center gap-3 p-4 rounded-xl ${isMe ? 'bg-purple-500/20 border border-purple-500/50' : 'bg-white/5'
                                                }`}
                                        >
                                            <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${player.finalRank === 1 ? 'bg-yellow-500 text-white' :
                                                player.finalRank === 2 ? 'bg-slate-400 text-white' :
                                                    player.finalRank === 3 ? 'bg-amber-700 text-white' :
                                                        'bg-white/10 text-white'
                                                }`}>
                                                {player.finalRank === 1 ? <Crown className="w-5 h-5" /> : player.finalRank}
                                            </span>
                                            <div className="flex-1">
                                                <p className="font-bold text-white text-lg">{player.nickname}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-xl text-white">{player.totalScore} pts</p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                        </div>

                        <div className="space-y-2">
                            {isHost ? (
                                <Button
                                    onClick={handleReturnToLobby}
                                    className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl"
                                >
                                    <RotateCcw className="w-5 h-5 mr-2" />
                                    เล่นอีกครั้ง (กลับห้อง)
                                </Button>
                            ) : (
                                <p className="text-center text-slate-400 py-2">
                                    <Loader2 className="w-4 h-4 inline animate-spin mr-2" />
                                    รอ Host ตัดสินใจ...
                                </p>
                            )}
                            <Button
                                onClick={onComplete}
                                variant="outline"
                                className="w-full h-10 border-white/20 text-white hover:bg-white/10 rounded-xl"
                            >
                                ออกจากห้อง
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Render game based on type
    const renderGame = () => {
        const gameProps = {
            flashcards,
            onComplete: handleGameComplete,
            isMultiplayer: true
        };

        switch (currentGameType) {
            case 'quiz':
                return <QuizGameComponent {...gameProps} />;
            case 'matching':
                return <MatchingGameComponent {...gameProps} />;
            case 'word-scramble':
                return <WordScrambleComponent {...gameProps} />;
            case 'hangman':
                return <HangmanComponent {...gameProps} />;
            case 'word-search':
                return <WordSearchComponent {...gameProps} />;
            case 'listen-choose':
                return <ListenChooseComponent {...gameProps} />;
            case 'vocab-blinder':
                return <VocabBlinderComponent {...gameProps} />;
            case 'honeycomb':
                return <HoneycombComponent {...gameProps} />;
            case 'ninja-slice':
                return <NinjaSliceComponent {...gameProps} />;
            default:
                return (
                    <div className="min-h-screen flex items-center justify-center text-white">
                        <div className="text-center">
                            <p className="text-xl mb-4">เกม {GAME_NAMES[currentGameType]} ยังไม่รองรับ Multiplayer</p>
                            <Button onClick={() => handleGameComplete(0, 0, 0)}>
                                ข้าม
                            </Button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900">
            {/* Game Header */}
            <div className="sticky top-0 z-50 bg-black/50 backdrop-blur-md border-b border-white/10 p-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-white font-bold">
                            {GAME_NAMES[currentGameType]}
                        </span>
                        <span className="text-slate-400 text-sm">
                            ({currentRoom.currentGameIndex + 1}/{currentRoom.selectedGames.length})
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                        <Users className="w-4 h-4" />
                        <span>{currentRoom.players.length} players</span>
                    </div>
                </div>
            </div>

            {/* Game Content */}
            <div className="p-4">
                {renderGame()}
            </div>
        </div>
    );
}
