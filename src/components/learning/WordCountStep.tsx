import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Target, Settings2, Plus, Minus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

export type WordCountOption = '10' | '12' | '15' | '20' | 'custom';
export type LearningModeOption = 'review-only' | 'review-and-new';

export interface WordCountSettings {
    wordCount: number;
    learningMode: LearningModeOption;
    breakdown: { review: number; new: number };
}

interface WordCountStepProps {
    onNext: (settings: WordCountSettings) => void;
    onBack: () => void;
}

export function WordCountStep({ onNext, onBack }: WordCountStepProps) {
    const [wordCountOption, setWordCountOption] = useState<WordCountOption>('12');

    // State: Total Count and New Word Ratio (0-100)
    const [customCount, setCustomCount] = useState<number>(12);
    const [newRatio, setNewRatio] = useState<number>(60); // Default 60% New

    const [learningMode, setLearningMode] = useState<LearningModeOption>('review-and-new');

    const wordCount = useMemo(() => customCount, [customCount]);

    const breakdown = useMemo(() => {
        if (learningMode === 'review-only') {
            return { review: customCount, new: 0 };
        }

        const newCount = Math.round(customCount * (newRatio / 100));
        const reviewCount = customCount - newCount;
        return { review: reviewCount, new: newCount };
    }, [customCount, learningMode, newRatio]);

    const handleNext = () => {
        onNext({
            wordCount,
            learningMode,
            breakdown
        });
    };

    const handlePresetClick = (option: string) => {
        setWordCountOption(option as WordCountOption);
        setCustomCount(parseInt(option));
        // We keep the current ratio or reset? optional. Keeping ratio is friendlier.
    };

    const adjustTotal = (amount: number) => {
        setCustomCount(prev => {
            const val = Math.max(5, Math.min(100, prev + amount));
            setWordCountOption('custom');
            return val;
        });
    };

    return (
        <div className="flex flex-col h-full">
            {/* Cute Header - Compacted */}
            <div className="text-center mb-2">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 mb-1"
                >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                        <Target className="w-5 h-5 text-white" />
                    </div>
                </motion.div>
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                >
                    วันนี้อยากเรียนกี่คำ?
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="text-xs text-slate-500 dark:text-slate-400"
                >
                    เลือกจำนวนที่พอดีกับเวลาของคุณ
                </motion.p>
            </div>

            {/* Word Count Presets - Compacted */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-4 gap-2 mb-3"
            >
                {[
                    { count: '10', emoji: '☕', time: '~5 นาที' },
                    { count: '12', emoji: '🎯', time: '~7 นาที', recommended: true },
                    { count: '15', emoji: '💪', time: '~10 นาที' },
                    { count: '20', emoji: '🔥', time: '~15 นาที' }
                ].map((option, index) => (
                    <motion.button
                        key={option.count}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.05 }}
                        onClick={() => handlePresetClick(option.count)}
                        className={`
                            relative p-2 rounded-xl transition-all duration-300
                            ${wordCountOption === option.count
                                ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-105 ring-2 ring-purple-200 dark:ring-purple-900'
                                : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600'
                            }
                        `}
                    >
                        {option.recommended && (
                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 text-[9px] font-bold bg-gradient-to-r from-emerald-400 to-green-500 text-white rounded-full shadow-md whitespace-nowrap z-10">
                                ✨ แนะนำ
                            </span>
                        )}
                        <span className="text-lg mb-0.5 block">{option.emoji}</span>
                        <span className={`text-xl font-black ${wordCountOption === option.count ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
                            {option.count}
                        </span>
                        <span className={`text-[10px] block ${wordCountOption === option.count ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                            {option.time}
                        </span>
                    </motion.button>
                ))}
            </motion.div>

            {/* Total Count Fine-Tune - Compacted */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-4 mb-3"
            >
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => adjustTotal(-1)}
                    className="h-10 w-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                    <Minus className="w-5 h-5 text-slate-400" />
                </Button>
                <div className="text-center w-24">
                    <div className="text-xs font-medium text-slate-500 mb-0.5">จำนวนทั้งหมด</div>
                    <div className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">
                        {customCount}
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => adjustTotal(1)}
                    className="h-10 w-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                    <Plus className="w-5 h-5 text-slate-400" />
                </Button>
            </motion.div>

            {/* Gradient Slider Ratio Control - Compacted */}
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-4 px-1"
            >
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-visible">

                    {/* Labels Above */}
                    <div className="flex justify-between items-end mb-3 px-1">
                        <div className="text-left group cursor-pointer" onClick={() => setNewRatio(0)}>
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                                <span className="text-[10px] font-bold text-slate-500 group-hover:text-orange-500 transition-colors">ทบทวน (เก่า)</span>
                            </div>
                            <div className="text-2xl font-black text-orange-500 transition-transform group-hover:scale-110 origin-left">
                                {breakdown.review}
                            </div>
                        </div>

                        <div className="text-right group cursor-pointer" onClick={() => setNewRatio(100)}>
                            <div className="flex items-center gap-1.5 justify-end mb-0.5">
                                <span className="text-[10px] font-bold text-slate-500 group-hover:text-emerald-500 transition-colors">เรียนรู้ (ใหม่)</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            </div>
                            <div className="text-2xl font-black text-emerald-500 transition-transform group-hover:scale-110 origin-right">
                                {breakdown.new}
                            </div>
                        </div>
                    </div>

                    {/* The Slider */}
                    <div className="relative h-4 w-full flex items-center">
                        {/* Background Gradient Track - decorative */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-emerald-500 opacity-20" />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-emerald-500 h-1.5 my-auto" />

                        <Slider
                            value={[newRatio]}
                            max={100}
                            min={0}
                            step={5}
                            onValueChange={(val) => setNewRatio(val[0])}
                            // Customizing internal classes using arbitrary variants
                            className={`
                                [&_[role=track]]:bg-transparent 
                                [&_[role=range]]:bg-transparent
                                [&_[role=thumb]]:h-6 [&_[role=thumb]]:w-6 [&_[role=thumb]]:border-3 [&_[role=thumb]]:bg-white [&_[role=thumb]]:shadow-md
                                ${newRatio > 50 ? '[&_[role=thumb]]:border-emerald-500' : '[&_[role=thumb]]:border-orange-500'}
                                transition-colors duration-300
                            `}
                        />
                    </div>

                    <div className="flex justify-between mt-2 text-[9px] text-slate-400 font-medium px-1 select-none">
                        <span>เน้นทบทวน</span>
                        <span>50/50</span>
                        <span>เน้นของใหม่</span>
                    </div>

                </div>
            </motion.div>

            {/* Navigation Buttons - Compacted */}
            <div className="flex gap-3 mt-auto pt-2">
                <Button
                    onClick={onBack}
                    variant="outline"
                    className="flex-1 h-10 rounded-xl font-bold text-sm bg-transparent border-slate-600 text-white hover:bg-white/10 hover:text-white"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    ย้อนกลับ
                </Button>
                <Button
                    onClick={handleNext}
                    className="flex-[2] h-10 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
                >
                    ถัดไป
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    );
}
