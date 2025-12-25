import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Heart, Star } from 'lucide-react';

export interface LearningModes {
    flashcard: boolean;
    game: boolean;
    listening: boolean;
    reading: boolean;
}

interface ModeSelectionStepProps {
    selectedModes: LearningModes;
    onModeChange: (modes: LearningModes) => void;
    onNext: () => void;
}

const modeOptions = [
    {
        id: 'flashcard',
        emoji: '🃏',
        label: 'Flashcard',
        labelTh: 'ทบทวนความจำ',
        // Strong/Dark colors for selected state
        activeBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
        activeRing: 'ring-blue-300',
        activeShadow: 'shadow-blue-200',
    },
    {
        id: 'game',
        emoji: '🎮',
        label: 'Game',
        labelTh: 'เกมสนุก ๆ',
        activeBg: 'bg-gradient-to-br from-pink-500 to-rose-600',
        activeRing: 'ring-pink-300',
        activeShadow: 'shadow-pink-200',
    },
    {
        id: 'listening',
        emoji: '🎧',
        label: 'Listening',
        labelTh: 'ฝึกฟัง',
        activeBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
        activeRing: 'ring-purple-300',
        activeShadow: 'shadow-purple-200',
    },
    {
        id: 'reading',
        emoji: '📖',
        label: 'Reading',
        labelTh: 'ฝึกอ่าน',
        activeBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
        activeRing: 'ring-orange-300',
        activeShadow: 'shadow-orange-200',
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    show: { y: 0, opacity: 1 }
};

export function ModeSelectionStep({
    selectedModes,
    onModeChange,
    onNext
}: ModeSelectionStepProps) {
    const handleToggleMode = (modeId: keyof LearningModes) => {
        onModeChange({
            ...selectedModes,
            [modeId]: !selectedModes[modeId],
        });
    };

    const selectedCount = Object.values(selectedModes).filter(Boolean).length;
    const canProceed = selectedCount > 0;

    return (
        <div className="space-y-4 px-1 max-h-[80vh] flex flex-col">
            {/* Header Section - Compact but ALIVE */}
            <div className="text-center space-y-2 pt-1 shrink-0">
                <motion.div
                    className="relative inline-block cursor-help"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <motion.div
                        className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-b from-white to-pink-50 shadow-xl shadow-pink-200/50 flex items-center justify-center border-4 border-white relative z-10"
                        animate={{
                            y: [0, -6, 0],
                            rotate: [0, -2, 2, 0],
                            scale: [1, 1.02, 1]
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 3,
                            ease: "easeInOut"
                        }}
                    >
                        <motion.img
                            src="/logo.png"
                            alt="Promjum Logo"
                            className="w-16 h-16 object-contain drop-shadow-md"
                        />
                    </motion.div>

                    {/* Cute decorations appearing around logo */}
                    <motion.div
                        className="absolute -right-2 -top-2 bg-yellow-400 text-white p-1.5 rounded-full shadow-lg z-20"
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        <Star className="w-3.5 h-3.5 fill-current" />
                    </motion.div>
                </motion.div>

                <div>
                    <h2 className="text-2xl font-black text-slate-700 dark:text-white tracking-tight">
                        เลือกโหมดการเรียน <motion.span inline-block animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="inline-block text-2xl">🎀</motion.span>
                    </h2>
                    <p className="text-sm font-medium text-slate-400">
                        จิ้มเลือกโหมดที่อยากเรียนได้เลย!
                    </p>
                </div>
            </div>

            {/* Grid Options - Juicy & Bouncy */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 gap-3 shrink-0 px-2"
            >
                {modeOptions.map((mode) => {
                    const isSelected = selectedModes[mode.id as keyof LearningModes];
                    // "Pick Me" animation if nothing is selected
                    const isIdle = selectedCount === 0;

                    return (
                        <motion.button
                            key={mode.id}
                            variants={itemVariants}
                            whileHover={{ y: -4, scale: 1.02 }}
                            whileTap={{ scale: 0.92 }}
                            // Gentle pulse if idle
                            animate={isIdle ? {
                                scale: [1, 1.02, 1],
                                transition: {
                                    repeat: Infinity,
                                    duration: 2,
                                    delay: Math.random() // Randomize start for organic feel
                                }
                            } : {}}
                            onClick={() => handleToggleMode(mode.id as keyof LearningModes)}
                            className={`
                                relative group p-3.5 rounded-3xl border-2 text-left transition-all duration-300 w-full
                                flex flex-col items-center justify-center gap-2 overflow-visible
                                ${isSelected
                                    ? `${mode.activeBg} ${mode.activeRing} ring-4 ring-offset-2 ring-offset-white border-transparent text-white shadow-xl scale-[1.02] z-10`
                                    : 'bg-white border-slate-100 hover:border-pink-300 hover:bg-pink-50/50 text-slate-600 shadow-sm'
                                }
                            `}
                        >
                            {/* Checkmark Badge - Pops in */}
                            <motion.div
                                initial={false}
                                animate={{ scale: isSelected ? 1 : 0 }}
                                className={`
                                    absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md border-2 border-white
                                    ${isSelected ? 'bg-white text-pink-500' : 'bg-slate-200'}
                                `}
                            >
                                <Check className="w-3.5 h-3.5 stroke-[4px]" />
                            </motion.div>

                            {/* Icon/Emoji - Bounces when selected */}
                            <motion.div
                                animate={isSelected ? {
                                    rotate: [0, -10, 10, 0],
                                    scale: [1, 1.2, 1],
                                    y: [0, -2, 0]
                                } : {}}
                                transition={{ duration: 0.5 }}
                                className={`
                                    w-12 h-12 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-colors duration-300
                                    ${isSelected ? 'bg-white/20 backdrop-blur-md' : 'bg-slate-50 group-hover:bg-white'}
                                `}
                            >
                                {mode.emoji}
                            </motion.div>

                            {/* Text Info */}
                            <div className="text-center z-10 w-full">
                                <div className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                                    {mode.label}
                                </div>
                                <div className={`text-[10px] font-semibold ${isSelected ? 'text-white/90' : 'text-slate-400'}`}>
                                    {mode.labelTh}
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </motion.div>

            {/* Footer / CTA - Compact */}
            <div className="space-y-2 pt-1 shrink-0">
                <Button
                    onClick={onNext}
                    disabled={!canProceed}
                    className={`
                        w-full h-11 rounded-xl font-bold text-sm transition-all duration-300 shadow-md
                        ${canProceed
                            ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 hover:scale-[1.01] text-white hover:shadow-lg'
                            : 'bg-slate-100 text-slate-400 shadow-none'
                        }
                    `}
                >
                    {canProceed ? (
                        <>
                            <span className="mr-2">ไปกันเลย</span>
                            🚀
                        </>
                    ) : (
                        <>
                            <span className="mr-2">👆 จิ้มเลือกโหมดก่อนน้า</span>
                            ✨
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
