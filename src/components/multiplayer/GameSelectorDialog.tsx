import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Gamepad2,
    Clock,
    Target,
    Check,
    Hexagon,
    Puzzle,
    Sword,
    HelpCircle,
    Headphones,
    Eye,
    Search,
    Shuffle
} from 'lucide-react';
import { GAME_TYPES, GAME_NAMES } from '@/hooks/useGameRoom';
import { motion } from 'framer-motion';

interface GameSelectorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedGames: string[];
    onConfirm: (games: string[]) => void;
}

// Game icons mapping
const GAME_ICONS: Record<string, React.ReactNode> = {
    'honeycomb': <Hexagon className="w-5 h-5" />,
    'matching': <Puzzle className="w-5 h-5" />,
    'ninja-slice': <Sword className="w-5 h-5" />,
    'quiz': <HelpCircle className="w-5 h-5" />,
    'listen-choose': <Headphones className="w-5 h-5" />,
    'hangman': <span className="text-lg">🎯</span>,
    'vocab-blinder': <Eye className="w-5 h-5" />,
    'word-search': <Search className="w-5 h-5" />,
    'word-scramble': <Shuffle className="w-5 h-5" />
};

const ALL_GAMES = [
    ...GAME_TYPES.TIME_BASED,
    ...GAME_TYPES.SCORE_BASED
];

export function GameSelectorDialog({ open, onOpenChange, selectedGames, onConfirm }: GameSelectorDialogProps) {
    const [selected, setSelected] = useState<string[]>(selectedGames);

    const toggleGame = (game: string) => {
        if (selected.includes(game)) {
            setSelected(selected.filter(g => g !== game));
        } else if (selected.length < 3) {
            setSelected([...selected, game]);
        }
    };

    const handleConfirm = () => {
        onConfirm(selected);
    };

    const isTimeBased = (game: string) => GAME_TYPES.TIME_BASED.includes(game as any);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 border-white/10 text-white p-4">
                <DialogHeader className="pb-2">
                    <DialogTitle className="text-lg font-bold flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Gamepad2 className="w-5 h-5 text-teal-400" />
                            <span>เลือกเกม (สูงสุด 3 เกม)</span>
                        </div>
                        <span className="text-sm font-normal text-slate-400">
                            เลือกแล้ว {selected.length}/3
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4">
                    {/* Time-based games */}
                    <div>
                        <div className="flex items-center gap-1.5 mb-2 pb-1 border-b border-white/10">
                            <Clock className="w-3.5 h-3.5 text-orange-400" />
                            <span className="text-xs font-semibold text-orange-400">แข่งด้วยเวลา</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {GAME_TYPES.TIME_BASED.map((game) => (
                                <GameCard
                                    key={game}
                                    game={game}
                                    icon={GAME_ICONS[game]}
                                    isSelected={selected.includes(game)}
                                    isTimeBased={true}
                                    disabled={selected.length >= 3 && !selected.includes(game)}
                                    onClick={() => toggleGame(game)}
                                    order={selected.indexOf(game) + 1}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Score-based games */}
                    <div>
                        <div className="flex items-center gap-1.5 mb-2 pb-1 border-b border-white/10">
                            <Target className="w-3.5 h-3.5 text-teal-400" />
                            <span className="text-xs font-semibold text-teal-400">แข่งด้วยคะแนน (เสมอดูเวลา)</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {GAME_TYPES.SCORE_BASED.map((game) => (
                                <GameCard
                                    key={game}
                                    game={game}
                                    icon={GAME_ICONS[game]}
                                    isSelected={selected.includes(game)}
                                    isTimeBased={false}
                                    disabled={selected.length >= 3 && !selected.includes(game)}
                                    onClick={() => toggleGame(game)}
                                    order={selected.indexOf(game) + 1}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter className="mt-4 pt-2 border-t border-white/10">
                    <Button
                        onClick={handleConfirm}
                        disabled={selected.length === 0}
                        className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold rounded-lg h-10 text-sm shadow-lg shadow-teal-500/20"
                    >
                        <Check className="w-4 h-4 mr-2" />
                        ยืนยันการเลือก ({selected.length})
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface GameCardProps {
    game: string;
    icon: React.ReactNode;
    isSelected: boolean;
    isTimeBased: boolean;
    disabled: boolean;
    onClick: () => void;
    order: number;
}

function GameCard({ game, icon, isSelected, isTimeBased, disabled, onClick, order }: GameCardProps) {
    return (
        <motion.button
            onClick={onClick}
            disabled={disabled}
            whileHover={!disabled ? { scale: 1.01, x: 2 } : undefined}
            whileTap={!disabled ? { scale: 0.99 } : undefined}
            className={`flex items-center gap-2 p-2 rounded-lg border transition-all w-full text-left relative overflow-hidden h-12 ${isSelected
                ? isTimeBased
                    ? 'bg-orange-500/20 border-orange-500/50'
                    : 'bg-teal-500/20 border-teal-500/50'
                : disabled
                    ? 'bg-white/5 border-white/5 opacity-40 cursor-not-allowed'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
        >
            {isSelected && (
                <div className={`absolute inset-y-0 left-0 w-1 ${isTimeBased ? 'bg-orange-500' : 'bg-teal-500'}`} />
            )}

            <div className="ml-1 relative">
                <span className={`w-8 h-8 rounded-md flex items-center justify-center ${isTimeBased ? 'bg-orange-500/10 text-orange-400' : 'bg-teal-500/10 text-teal-400'
                    }`}>
                    {icon}
                </span>
                {isSelected && (
                    <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold border border-slate-900 ${isTimeBased ? 'bg-orange-500 text-white' : 'bg-teal-500 text-white'
                        }`}>
                        {order}
                    </span>
                )}
            </div>

            <span className={`text-sm font-medium truncate flex-1 ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                {GAME_NAMES[game]}
            </span>

            {isSelected && (
                <Check className={`w-4 h-4 mr-1 ${isTimeBased ? 'text-orange-400' : 'text-teal-400'}`} />
            )}
        </motion.button>
    );
}
