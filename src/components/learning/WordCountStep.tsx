import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Sparkles, RefreshCw, BookOpen, Target } from 'lucide-react';

export type WordCountOption = '10' | '12' | '15' | '20';
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
    const [learningMode, setLearningMode] = useState<LearningModeOption>('review-and-new');

    const wordCount = parseInt(wordCountOption);

    const breakdown = useMemo(() => {
        if (learningMode === 'review-only') {
            return { review: wordCount, new: 0 };
        }
        const reviewCount = Math.ceil(wordCount * 0.3);
        return { review: reviewCount, new: wordCount - reviewCount };
    }, [wordCount, learningMode]);

    const handleNext = () => {
        onNext({
            wordCount,
            learningMode,
            breakdown
        });
    };

    return (
        <div className="flex flex-col h-full">
            {/* Cute Header */}
            <div className="text-center mb-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 mb-3"
                >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                        <Target className="w-6 h-6 text-white" />
                    </div>
                </motion.div>
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                >
                    วันนี้อยากเรียนกี่คำ?
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="text-sm text-slate-500 dark:text-slate-400 mt-1"
                >
                    เลือกจำนวนที่พอดีกับเวลาของคุณ
                </motion.p>
            </div>

            {/* Word Count Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-4 gap-3 mb-6"
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
                        onClick={() => setWordCountOption(option.count as WordCountOption)}
                        className={`
                            relative p-4 rounded-2xl transition-all duration-300
                            ${wordCountOption === option.count
                                ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-xl scale-105 ring-4 ring-purple-200 dark:ring-purple-900'
                                : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border-2 border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600'
                            }
                        `}
                    >
                        {option.recommended && (
                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-emerald-400 to-green-500 text-white rounded-full shadow-lg">
                                ✨ แนะนำ
                            </span>
                        )}
                        <span className="text-2xl mb-1 block">{option.emoji}</span>
                        <span className={`text-2xl font-black ${wordCountOption === option.count ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
                            {option.count}
                        </span>
                        <span className={`text-xs block mt-1 ${wordCountOption === option.count ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                            {option.time}
                        </span>
                    </motion.button>
                ))}
            </motion.div>

            {/* Learning Mode Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="grid grid-cols-2 gap-3 mb-6"
            >
                <button
                    onClick={() => setLearningMode('review-only')}
                    className={`
                        p-4 rounded-2xl transition-all duration-300 text-left
                        ${learningMode === 'review-only'
                            ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-xl ring-4 ring-orange-200 dark:ring-orange-900'
                            : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-orange-300'
                        }
                    `}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${learningMode === 'review-only' ? 'bg-white/20' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
                            <RefreshCw className={`w-5 h-5 ${learningMode === 'review-only' ? 'text-white' : 'text-orange-500'}`} />
                        </div>
                        <div>
                            <p className={`font-bold ${learningMode === 'review-only' ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
                                ทวนเก่าอย่างเดียว
                            </p>
                            <p className={`text-xs ${learningMode === 'review-only' ? 'text-white/70' : 'text-slate-500'}`}>
                                เน้นทบทวนคำที่เรียนไปแล้ว
                            </p>
                        </div>
                    </div>
                </button>

                <button
                    onClick={() => setLearningMode('review-and-new')}
                    className={`
                        p-4 rounded-2xl transition-all duration-300 text-left
                        ${learningMode === 'review-and-new'
                            ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-xl ring-4 ring-purple-200 dark:ring-purple-900'
                            : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                        }
                    `}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${learningMode === 'review-and-new' ? 'bg-white/20' : 'bg-purple-100 dark:bg-purple-900/30'}`}>
                            <BookOpen className={`w-5 h-5 ${learningMode === 'review-and-new' ? 'text-white' : 'text-purple-500'}`} />
                        </div>
                        <div>
                            <p className={`font-bold ${learningMode === 'review-and-new' ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
                                ทวนเก่า + เรียนใหม่
                            </p>
                            <p className={`text-xs ${learningMode === 'review-and-new' ? 'text-white/70' : 'text-slate-500'}`}>
                                ผสมผสาน = จำได้ดีกว่า
                            </p>
                        </div>
                    </div>
                </button>
            </motion.div>

            {/* Summary Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-slate-100 to-purple-50 dark:from-slate-800 dark:to-purple-900/20 rounded-2xl p-4 mb-6"
            >
                <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                        <span className="text-3xl font-black text-orange-500">{breakdown.review}</span>
                        <p className="text-xs text-slate-500 dark:text-slate-400">ทบทวน</p>
                    </div>
                    {learningMode === 'review-and-new' && (
                        <>
                            <span className="text-2xl text-slate-300 dark:text-slate-600">+</span>
                            <div className="text-center">
                                <span className="text-3xl font-black text-emerald-500">{breakdown.new}</span>
                                <p className="text-xs text-slate-500 dark:text-slate-400">ใหม่</p>
                            </div>
                        </>
                    )}
                    <span className="text-2xl text-slate-300 dark:text-slate-600">=</span>
                    <div className="text-center">
                        <span className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{wordCount}</span>
                        <p className="text-xs text-slate-500 dark:text-slate-400">คำ</p>
                    </div>
                </div>
            </motion.div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-auto">
                <Button
                    onClick={onBack}
                    variant="outline"
                    className="flex-1 h-12 rounded-2xl font-bold text-base border-2"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    ย้อนกลับ
                </Button>
                <Button
                    onClick={handleNext}
                    className="flex-[2] h-12 rounded-2xl font-bold text-base bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
                >
                    ถัดไป
                    <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
            </div>
        </div>
    );
}
