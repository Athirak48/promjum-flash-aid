import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Gamepad2, Grid2X2, CheckCircle, Swords } from 'lucide-react';

type GameMode = 'mcq' | 'matching';

interface GameModeSelectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    universityName: string;
    onSelect: (mode: GameMode) => void;
}

export default function GameModeSelectionDialog({
    open,
    onOpenChange,
    universityName,
    onSelect
}: GameModeSelectionDialogProps) {
    const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);

    const modes = [
        {
            id: 'mcq' as GameMode,
            name: '4 ช้อย',
            description: 'เลือกความหมายที่ถูกต้อง',
            icon: CheckCircle,
            color: 'from-blue-500 to-indigo-500',
            bgColor: 'bg-blue-50 dark:bg-blue-900/30',
            borderColor: 'border-blue-200 dark:border-blue-800'
        },
        {
            id: 'matching' as GameMode,
            name: 'จับคู่',
            description: 'จับคู่คำศัพท์กับความหมาย',
            icon: Grid2X2,
            color: 'from-purple-500 to-pink-500',
            bgColor: 'bg-purple-50 dark:bg-purple-900/30',
            borderColor: 'border-purple-200 dark:border-purple-800'
        }
    ];

    const handleConfirm = () => {
        if (selectedMode) {
            onSelect(selectedMode);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader className="text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center"
                    >
                        <Gamepad2 className="w-8 h-8 text-white" />
                    </motion.div>
                    <DialogTitle className="text-xl font-black">เลือกโหมดเกม</DialogTitle>
                    <DialogDescription>
                        Battle for <span className="font-bold text-purple-600">{universityName}</span>
                    </DialogDescription>
                </DialogHeader>

                {/* Game Modes */}
                <div className="grid gap-3 my-4">
                    {modes.map((mode, index) => (
                        <motion.button
                            key={mode.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => setSelectedMode(mode.id)}
                            className={`p-4 rounded-xl text-left transition-all flex items-center gap-4 border-2 ${selectedMode === mode.id
                                    ? `bg-gradient-to-r ${mode.color} text-white shadow-lg`
                                    : `${mode.bgColor} ${mode.borderColor} hover:shadow-md`
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedMode === mode.id
                                    ? 'bg-white/20'
                                    : 'bg-white dark:bg-slate-800'
                                }`}>
                                <mode.icon className={`w-6 h-6 ${selectedMode === mode.id
                                        ? 'text-white'
                                        : 'text-slate-600 dark:text-slate-400'
                                    }`} />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold">{mode.name}</p>
                                <p className={`text-sm ${selectedMode === mode.id
                                        ? 'text-white/70'
                                        : 'text-slate-500'
                                    }`}>{mode.description}</p>
                            </div>
                            {selectedMode === mode.id && (
                                <CheckCircle className="w-6 h-6 text-white" />
                            )}
                        </motion.button>
                    ))}
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => onOpenChange(false)}
                    >
                        ยกเลิก
                    </Button>
                    <Button
                        disabled={!selectedMode}
                        onClick={handleConfirm}
                        className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
                    >
                        <Swords className="w-4 h-4 mr-2" />
                        เริ่มแบทเทิล!
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
