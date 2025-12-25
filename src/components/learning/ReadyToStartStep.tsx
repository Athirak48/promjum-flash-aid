import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Rocket,
    Layers,
    Gamepad2,
    Headphones,
    BookOpen,
    Sparkles,
    ArrowLeft,
    Clock,
    Star
} from 'lucide-react';
import { LearningModes } from './ModeSelectionStep';
import { VocabItem } from './VocabSelectionStep';

interface ReadyToStartStepProps {
    selectedModes: LearningModes;
    selectedVocab: VocabItem[];
    onStart: () => void;
    onBack: () => void;
}

const modeIcons = {
    flashcard: { icon: Layers, label: 'Flashcard', color: 'bg-blue-100 text-blue-600', emoji: '🃏' },
    game: { icon: Gamepad2, label: 'Game', color: 'bg-pink-100 text-pink-600', emoji: '🎮' },
    listening: { icon: Headphones, label: 'Listening', color: 'bg-indigo-100 text-indigo-600', emoji: '🎧' },
    reading: { icon: BookOpen, label: 'Reading', color: 'bg-orange-100 text-orange-600', emoji: '📖' },
};

export function ReadyToStartStep({
    selectedModes,
    selectedVocab,
    onStart,
    onBack
}: ReadyToStartStepProps) {
    const activeModes = Object.entries(selectedModes)
        .filter(([_, isActive]) => isActive)
        .map(([mode]) => mode as keyof LearningModes);

    // Estimate time (rough calculation)
    const estimateMinutes = () => {
        let mins = 0;
        if (selectedModes.flashcard) mins += Math.ceil(selectedVocab.length * 0.3);
        if (selectedModes.listening) mins += 5;
        if (selectedModes.reading) mins += 4;
        if (selectedModes.game) mins += 3;
        return Math.max(mins, 2);
    };

    return (
        <div className="space-y-4 px-1 flex flex-col items-center">
            {/* Header with Animation - Compact & Alive */}
            <div className="text-center space-y-2 shrink-0">
                <motion.div
                    className="relative inline-block"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                    <motion.div
                        className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 shadow-xl shadow-purple-500/30 flex items-center justify-center relative z-10"
                        animate={{
                            y: [0, -6, 0],
                            rotate: [0, -2, 2, 0],
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 3,
                            ease: "easeInOut"
                        }}
                    >
                        <Rocket className="w-10 h-10 text-white drop-shadow-md" />
                    </motion.div>

                    {/* Floating Star */}
                    <motion.div
                        className="absolute -right-3 -top-1 bg-yellow-400 text-white p-1.5 rounded-full shadow-lg z-20"
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 15, -15, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        <Star className="w-3 h-3 fill-current" />
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                        พร้อมลุยแล้ว! <motion.span inline-block animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="inline-block text-xl">🎉</motion.span>
                    </h2>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        เตรียมตัวให้พร้อม แล้วกดเริ่มได้เลย
                    </p>
                </motion.div>
            </div>

            {/* Stats - Cute Badges */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="flex gap-3 justify-center w-full"
            >
                {/* Words Stat - Target/Goal */}
                <div className="flex-1 bg-purple-50 border border-purple-100 rounded-2xl p-2.5 flex flex-col items-center shadow-sm relative overflow-hidden group">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 5, -5, 0]
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 2,
                            ease: "easeInOut"
                        }}
                        className="text-3xl mb-1 drop-shadow-sm filter"
                    >
                        🎯
                    </motion.div>
                    <div className="text-lg font-black text-purple-700">{selectedVocab.length}</div>
                    <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wide">Target Words</div>

                    {/* Decorative shine */}
                    <div className="absolute top-0 right-0 w-8 h-8 bg-white opacity-20 rounded-full blur-xl transform translate-x-4 -translate-y-4"></div>
                </div>

                {/* Time Stat - Hourglass */}
                <div className="flex-1 bg-pink-50 border border-pink-100 rounded-2xl p-2.5 flex flex-col items-center shadow-sm relative overflow-hidden group">
                    <motion.div
                        animate={{
                            rotate: [0, 180, 180, 360],
                            y: [0, -2, 0, -2, 0]
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 4,
                            times: [0, 0.4, 0.6, 1],
                            ease: "easeInOut"
                        }}
                        className="text-3xl mb-1 drop-shadow-sm"
                    >
                        ⏳
                    </motion.div>
                    <div className="text-lg font-black text-pink-700">~{estimateMinutes()}</div>
                    <div className="text-[10px] font-bold text-pink-400 uppercase tracking-wide">Minutes</div>

                    {/* Decorative shine */}
                    <div className="absolute top-0 right-0 w-8 h-8 bg-white opacity-20 rounded-full blur-xl transform translate-x-4 -translate-y-4"></div>
                </div>
            </motion.div>

            {/* Learning Path - Clean & Modern Timeline with "Dug-Dik" (Wiggles) */}
            <div className="w-full">
                <h3 className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-center gap-2">
                    <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }}>✨</motion.span>
                    ลำดับการเรียนรู้
                    <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2, delay: 1 }}>✨</motion.span>
                </h3>

                <div className="bg-white/50 rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-center gap-2 flex-wrap min-h-[100px]">
                    {activeModes.map((mode, index) => {
                        const modeInfo = modeIcons[mode];
                        // @ts-ignore
                        const emoji = modeInfo.emoji || '✨';

                        return (
                            <React.Fragment key={mode}>
                                {/* Mode Item - Now with "Dug-Dik" Animation */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0, rotate: -10 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 260,
                                        damping: 20,
                                        delay: 0.4 + (index * 0.15)
                                    }}
                                    className="flex flex-col items-center gap-1.5 cursor-pointer group"
                                    whileHover={{ scale: 1.1 }}
                                >
                                    <motion.div
                                        className={`
                                            w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm border-2 border-white
                                            ${modeInfo.color.replace('text-', 'bg-').replace('100', '50')}
                                        `}
                                        animate={{ y: [0, -3, 0] }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 2,
                                            delay: index * 0.2, // Stagger the floating
                                            ease: "easeInOut"
                                        }}
                                        whileHover={{
                                            rotate: [0, -10, 10, -5, 5, 0],
                                            transition: { duration: 0.5 }
                                        }}
                                    >
                                        <span className="drop-shadow-sm filter">{emoji}</span>
                                    </motion.div>

                                    <div className="text-[10px] font-bold text-slate-600 bg-white/80 px-2 py-0.5 rounded-full shadow-sm border border-slate-100 backdrop-blur-sm group-hover:text-pink-500 transition-colors">
                                        {modeInfo.label}
                                    </div>
                                </motion.div>

                                {/* Connector Arrow - Wiggling forward */}
                                {index < activeModes.length - 1 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.5 + (index * 0.1) }}
                                        className="text-slate-300"
                                    >
                                        <motion.div
                                            animate={{ x: [-2, 2, -2] }}
                                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                        >
                                            <ArrowLeft className="w-4 h-4 rotate-180" />
                                        </motion.div>
                                    </motion.div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {/* Start Button & Back */}
            <div className="space-y-2 pt-2 w-full">
                <Button
                    onClick={onStart}
                    className="w-full h-12 text-base font-bold rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:scale-[1.02] active:scale-95 text-white shadow-lg shadow-purple-500/30 transition-all duration-200"
                >
                    <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="flex items-center"
                    >
                        <Rocket className="w-5 h-5 mr-2" />
                        ลุยกันเลย!
                    </motion.div>
                </Button>

                <Button
                    onClick={onBack}
                    variant="ghost"
                    className="w-full h-8 text-slate-400 hover:text-slate-600 text-xs font-medium"
                >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                    เปลี่ยนโหมด
                </Button>
            </div>
        </div >
    );
}
