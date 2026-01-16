import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Shuffle, Puzzle, Hexagon, GalleryVerticalEnd, Lock, Info, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameOption {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    gradient: string;
    estimatedTime: number;
}

const AVAILABLE_GAMES: GameOption[] = [
    {
        id: 'flashcard',
        name: 'Flashcard',
        description: 'ทบทวนแบบ Flashcard',
        icon: <GalleryVerticalEnd className="h-6 w-6 md:h-8 md:w-8" />,
        color: 'from-indigo-500 to-violet-500',
        gradient: 'bg-gradient-to-br from-indigo-500/20 to-violet-500/20',
        estimatedTime: 5
    },
    {
        id: 'quiz',
        name: 'Quiz 3sec',
        description: 'Multiple Choice (3 วินาที/ข้อ)',
        icon: <Brain className="h-6 w-6 md:h-8 md:w-8" />,
        color: 'from-blue-500 to-cyan-500',
        gradient: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
        estimatedTime: 3
    },
    {
        id: 'scramble',
        name: 'Word Scramble',
        description: 'เรียงคำอักษรให้ถูกต้อง',
        icon: <Shuffle className="h-6 w-6 md:h-8 md:w-8" />,
        color: 'from-green-500 to-emerald-500',
        gradient: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20',
        estimatedTime: 5
    },
    {
        id: 'matching',
        name: 'Matching Game',
        description: 'จับคู่คำศัพท์',
        icon: <Puzzle className="h-6 w-6 md:h-8 md:w-8" />,
        color: 'from-purple-500 to-pink-500',
        gradient: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20',
        estimatedTime: 4
    },
    {
        id: 'honeyhive',
        name: 'Honey Hive',
        description: 'เกมรังผึ้งหาคำศัพท์',
        icon: <Hexagon className="h-6 w-6 md:h-8 md:w-8" />,
        color: 'from-yellow-500 to-orange-500',
        gradient: 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20',
        estimatedTime: 5
    }
];

interface GameSelectionDialogProps {
    open: boolean;
    mode: 'start' | 'bonus';
    onConfirm: (selectedGames: string[]) => void;
    onCancel: () => void;
}

export default function GameSelectionDialog({ open, mode, onConfirm, onCancel }: GameSelectionDialogProps) {
    const [selectedGames, setSelectedGames] = useState<string[]>(
        mode === 'start' ? ['flashcard'] : []
    );

    const toggleGame = (gameId: string) => {
        // Flashcard is locked in start mode
        if (mode === 'start' && gameId === 'flashcard') return;

        // User Constraint: 
        // Start Mode: Flashcard (1) + 1 or 2 Games = Max 3
        // Bonus Mode: Max 3 games
        const maxGames = 3;

        if (selectedGames.includes(gameId)) {
            setSelectedGames(selectedGames.filter(id => id !== gameId));
        } else {
            if (selectedGames.length < maxGames) {
                setSelectedGames([...selectedGames, gameId]);
            }
        }
    };

    const isValid = () => {
        // Common baseline
        if (selectedGames.length === 0) return false;

        if (mode === 'start') {
            // Start: Must be Flashcard + 1 or 2 games
            // Since Flashcard is locked, length must be 2 or 3
            return selectedGames.length >= 2 && selectedGames.length <= 3;
        } else {
            // Bonus: Max 3 games, Min 1
            return selectedGames.length >= 1 && selectedGames.length <= 3;
        }
    };

    const totalTime = selectedGames.reduce((sum, gameId) => {
        const game = AVAILABLE_GAMES.find(g => g.id === gameId);
        return sum + (game?.estimatedTime || 0);
    }, 0);

    const getValidationMessage = () => {
        if (selectedGames.length === 0) return 'เลือกอย่างน้อย 1 เกม';

        if (mode === 'start') {
            if (selectedGames.length < 2) return 'โปรดเลือกเกมเพิ่มอย่างน้อย 1 เกม';
            if (selectedGames.length > 3) return 'เลือกเกมเพิ่มได้สูงสุด 2 เกม';
        } else {
            if (selectedGames.length > 3) return 'เลือกได้สูงสุด 3 เกม';
        }

        return '';
    };

    return (
        <Dialog open={open} onOpenChange={() => onCancel()}>
            <DialogContent hideCloseButton className="max-w-2xl bg-[#0B0F19] border-slate-800 p-0 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                {/* Vibrant Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-500" />
                    <div className="absolute -top-[30%] -left-[10%] w-[60%] h-[60%] bg-violet-600/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-fuchsia-600/20 rounded-full blur-[100px]" />
                </div>

                {/* Header with Colorful Badge */}
                <div className="relative z-10 px-4 pt-4 pb-2 md:px-6 md:pt-6">
                    {/* Explicit Close Button */}
                    <div className="absolute top-4 right-4 z-50">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-black/20 text-white/70 hover:bg-black/40 hover:text-white backdrop-blur-sm transition-all"
                            onClick={(e) => {
                                e.stopPropagation();
                                onCancel();
                            }}
                        >
                            <span className="sr-only">Close</span>
                            {/* @ts-ignore */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </Button>
                    </div>

                    <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/30 ring-1 ring-white/10">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent text-lg">
                                Select Game Mode
                            </span>
                            <span className="text-[10px] font-normal text-slate-400 -mt-0.5">
                                Choose your learning adventure
                            </span>
                        </div>
                    </DialogTitle>
                </div>

                {/* Main Content - Vibrant Cards */}
                <div className="p-3 md:p-6 pt-0 relative z-10 overflow-y-auto custom-scrollbar flex-1">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                        {AVAILABLE_GAMES.map((game) => {
                            const isSelected = selectedGames.includes(game.id);
                            const isLocked = mode === 'start' && game.id === 'flashcard';

                            return (
                                <div key={game.id} className="relative group">
                                    <div
                                        onClick={() => toggleGame(game.id)}
                                        className={`
                                            relative cursor-pointer rounded-xl border-2 transition-all duration-300 overflow-hidden h-full min-h-[110px] md:min-h-[140px]
                                            flex flex-col items-center justify-between p-2 md:p-3 text-center active:scale-95
                                            ${isSelected
                                                ? `bg-gradient-to-br ${game.color} border-white/20 shadow-lg scale-[1.02]`
                                                : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/60 hover:border-slate-600 hover:shadow-md'
                                            }
                                        `}
                                    >
                                        {/* Locked Indicator */}
                                        {isLocked && (
                                            <div className="absolute top-2 left-2 z-20 bg-black/40 rounded-full p-1.5 backdrop-blur-md border border-white/10">
                                                <Lock className="h-3 w-3 text-white/70" />
                                            </div>
                                        )}

                                        {/* Numbered Badge (Selection Order) */}
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 z-20 animate-in zoom-in duration-300">
                                                <div className="w-6 h-6 rounded-full bg-white text-violet-600 font-bold text-xs flex items-center justify-center shadow-lg ring-2 ring-white/20">
                                                    {selectedGames.indexOf(game.id) + 1}
                                                </div>
                                            </div>
                                        )}

                                        {/* Icon Container */}
                                        <div className={`
                                            mb-1.5 md:mb-2 rounded-2xl p-2 md:p-3.5 flex items-center justify-center transition-all duration-300
                                            ${isSelected
                                                ? 'bg-white/20 text-white backdrop-blur-sm shadow-inner ring-1 ring-white/30'
                                                : `bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200`
                                            }
                                        `}>
                                            <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center">
                                                {game.icon}
                                            </div>
                                        </div>

                                        <div className="w-full space-y-0.5 md:space-y-1 relative z-10">
                                            <h3 className={`font-bold text-xs md:text-sm transition-colors ${isSelected ? 'text-white drop-shadow-sm' : 'text-slate-300'}`}>
                                                {game.name}
                                            </h3>
                                            <div className={`text-[9px] md:text-[10px] transition-colors line-clamp-1 ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                                                {game.description}
                                            </div>
                                        </div>

                                        <div className={`
                                            mt-3 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 transition-colors relative z-10
                                            ${isSelected
                                                ? 'bg-black/20 text-white backdrop-blur-md border border-white/10'
                                                : 'bg-slate-800 text-slate-500 border border-slate-700'
                                            }
                                        `}>
                                            <Zap className="h-3 w-3" />
                                            {game.estimatedTime}m
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer Stats & Action */}
                    <div className="mt-3 md:mt-5 flex items-center justify-between bg-slate-900/80 p-2 md:p-3 rounded-xl border border-slate-800 backdrop-blur-md">
                        <div className="flex items-center gap-3 md:gap-6 px-1 md:px-2">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Games</span>
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-lg font-bold ${isValid() ? 'bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent' : 'text-slate-400'}`}>
                                        {selectedGames.length}
                                    </span>
                                    <span className="text-xs text-slate-600 font-medium">/ 3</span>
                                </div>
                            </div>

                            <div className="w-px h-8 bg-slate-800" />

                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Time</span>
                                <div className="text-slate-300 font-semibold text-sm flex items-center gap-1">
                                    ~{totalTime} <span className="text-[10px] font-normal text-slate-500">mins</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                onClick={onCancel}
                                className="text-slate-400 hover:text-white hover:bg-slate-800 h-10 px-4 text-xs font-medium rounded-lg"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => onConfirm(selectedGames)}
                                disabled={!isValid()}
                                className={`
                                    h-10 px-6 text-xs font-bold rounded-lg transition-all duration-300
                                    ${isValid()
                                        ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5'
                                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    }
                                `}
                            >
                                <Sparkles className="h-3.5 w-3.5 mr-2" />
                                {mode === 'start' ? 'Start Journey' : 'Play Bonus'}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
