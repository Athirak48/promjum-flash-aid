import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Heart, Star, Layers, Gamepad2, Headphones, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

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
        icon: Layers,
        label: 'Flashcard',
        labelTh: 'ทบทวนความจำ',
        // Pro Blue-Indigo Theme
        activeBg: 'bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700',
        activeRing: 'ring-indigo-300',
        activeShadow: 'shadow-indigo-500/30',
        iconColor: 'text-indigo-600',
        activeIconColor: 'text-white'
    },
    {
        id: 'game',
        icon: Gamepad2, // Better Gamepad Icon
        label: 'Game',
        labelTh: 'เกมสนุก ๆ',
        // Pro Pink-Rose Theme
        activeBg: 'bg-gradient-to-br from-pink-600 via-rose-600 to-rose-700',
        activeRing: 'ring-rose-300',
        activeShadow: 'shadow-rose-500/30',
        iconColor: 'text-rose-600',
        activeIconColor: 'text-white'
    },
    {
        id: 'listening',
        icon: Headphones,
        label: 'Listening',
        labelTh: 'ฝึกฟัง',
        // Pro Violet-Purple Theme
        activeBg: 'bg-gradient-to-br from-violet-600 via-purple-600 to-purple-700',
        activeRing: 'ring-purple-300',
        activeShadow: 'shadow-purple-500/30',
        iconColor: 'text-purple-600',
        activeIconColor: 'text-white'
    },
    {
        id: 'reading',
        icon: BookOpen,
        label: 'Reading',
        labelTh: 'ฝึกอ่าน',
        // Pro Amber-Orange Theme
        activeBg: 'bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600',
        activeRing: 'ring-orange-300',
        activeShadow: 'shadow-orange-500/30',
        iconColor: 'text-orange-600',
        activeIconColor: 'text-white'
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
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
};

export function ModeSelectionStep({
    selectedModes,
    onModeChange,
    onNext
}: ModeSelectionStepProps) {
    const handleToggleMode = (modeId: keyof LearningModes) => {
        // Disable Listening and Reading modes for now
        if (modeId === 'listening' || modeId === 'reading') {
            toast('Coming Soon! 🚧', {
                description: 'โหมดนี้กำลังพัฒนาครับ',
                duration: 2000,
                position: 'top-center',
            });
            return;
        }

        onModeChange({
            ...selectedModes,
            [modeId]: !selectedModes[modeId],
        });
    };

    const selectedCount = Object.values(selectedModes).filter(Boolean).length;
    const canProceed = selectedCount > 0;

    return (
        <div className="space-y-6 px-2 max-h-[80vh] flex flex-col">
            {/* Header Section - Clean & Pro */}
            <div className="text-center space-y-1 pt-2 shrink-0">
                <div className="relative inline-block mb-2">
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-white shadow-xl shadow-indigo-100 flex items-center justify-center border-[3px] border-white relative z-10">
                        <img
                            src="/logo.png"
                            alt="Promjum Logo"
                            className="w-14 h-14 object-contain"
                        />
                    </div>
                    <div className="absolute -right-2 -top-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-1.5 rounded-full shadow-lg z-20">
                        <Star className="w-3.5 h-3.5 fill-current" />
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                        เลือกโหมดการเรียน <span className="text-pink-500">✨</span>
                    </h2>
                    <p className="text-sm font-medium text-slate-400">
                        เลือกรูปแบบการเรียนที่คุณต้องการ
                    </p>
                </div>
            </div>

            {/* Grid Options - Pro Design */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 gap-4 shrink-0 px-2"
            >
                {modeOptions.map((mode) => {
                    const isSelected = selectedModes[mode.id as keyof LearningModes];

                    return (
                        <motion.button
                            key={mode.id}
                            variants={itemVariants}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleToggleMode(mode.id as keyof LearningModes)}
                            className={`
                                relative group p-4 rounded-3xl border-2 text-left transition-all duration-300 w-full h-[140px]
                                flex flex-col items-center justify-center gap-3 overflow-hidden
                                ${isSelected
                                    ? `${mode.activeBg} ${mode.activeRing} ring-2 ring-offset-2 ring-offset-white border-transparent text-white ${mode.activeShadow} shadow-lg z-10`
                                    : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-100 text-slate-600 shadow-sm'
                                }
                            `}
                        >
                            {/* Glass Shine Effect on Selected */}
                            {isSelected && (
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                            )}

                            {/* Checkmark Badge */}
                            <motion.div
                                initial={false}
                                animate={{ scale: isSelected ? 1 : 0, opacity: isSelected ? 1 : 0 }}
                                className="absolute top-3 right-3 bg-white text-indigo-600 rounded-full p-1 shadow-sm z-20"
                            >
                                <Check className="w-3 w-3 stroke-[4px]" />
                            </motion.div>

                            {/* Icon Container */}
                            <div
                                className={`
                                    w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-colors duration-300 relative z-10
                                    ${isSelected ? 'bg-white/20 backdrop-blur-md text-white' : `bg-slate-50 group-hover:bg-indigo-50/50 ${mode.iconColor}`}
                                `}
                            >
                                <mode.icon strokeWidth={2} className="w-7 h-7" />
                            </div>

                            {/* Text Info */}
                            <div className="text-center z-10 w-full">
                                <div className={`font-bold text-base leading-tight ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                                    {mode.label}
                                </div>
                                <div className={`text-xs font-medium mt-0.5 ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
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
