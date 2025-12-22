import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    ArrowRight,
    ArrowLeft,
    Volume2,
    Turtle
} from 'lucide-react';

export interface AudioSettings {
    accent: 'us' | 'uk';
    level: string;
}

interface AudioSetupStepProps {
    settings: AudioSettings;
    onSettingsChange: (settings: AudioSettings) => void;
    onNext: () => void;
    onBack: () => void;
}

export function AudioSetupStep({
    settings,
    onSettingsChange,
    onNext,
    onBack
}: AudioSetupStepProps) {

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="text-center space-y-1">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30"
                >
                    <Volume2 className="w-6 h-6 text-white" />
                </motion.div>
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xl font-bold text-slate-800 dark:text-slate-100"
                >
                    ตั้งค่าการเรียนรู้
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-sm text-slate-500 dark:text-slate-400"
                >
                    เลือกสำเนียงและระดับความยาก
                </motion.p>
            </div>

            {/* Accent Selection */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-indigo-500" />
                    สำเนียง (Accent)
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    <AccentCard
                        emoji="🇺🇸"
                        label="US English"
                        subLabel="American"
                        isSelected={settings.accent === 'us'}
                        onClick={() => onSettingsChange({ ...settings, accent: 'us' })}
                    />
                    <AccentCard
                        emoji="🇬🇧"
                        label="UK English"
                        subLabel="British"
                        isSelected={settings.accent === 'uk'}
                        onClick={() => onSettingsChange({ ...settings, accent: 'uk' })}
                    />
                </div>
            </motion.div>

            {/* Level Selection */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    <span className="text-lg">📊</span>
                    ระดับภาษา (Level)
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    {['A1', 'A2', 'B1'].map((level) => (
                        <LevelCard
                            key={level}
                            level={level}
                            isSelected={settings.level === level}
                            onClick={() => onSettingsChange({ ...settings, level })}
                        />
                    ))}
                    {['B2', 'C1', 'C2'].map((level) => (
                        <LevelCard
                            key={level}
                            level={level}
                            isSelected={settings.level === level}
                            onClick={() => onSettingsChange({ ...settings, level })}
                        />
                    ))}
                </div>
            </motion.div>

            {/* Preview (Optional) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center"
            >
                <Button
                    variant="ghost"
                    onClick={() => {
                        const utterance = new SpeechSynthesisUtterance(`This is an example of ${settings.accent.toUpperCase()} English at level ${settings.level}.`);
                        utterance.lang = settings.accent === 'us' ? 'en-US' : 'en-GB';
                        utterance.rate = 1.0;
                        speechSynthesis.speak(utterance);
                    }}
                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                >
                    <Volume2 className="w-4 h-4 mr-2" />
                    ทดสอบเสียง
                </Button>
            </motion.div>

            {/* Navigation Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex gap-3"
            >
                <Button
                    onClick={onBack}
                    variant="outline"
                    className="flex-1 h-10 rounded-xl font-bold"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    ย้อนกลับ
                </Button>
                <Button
                    onClick={onNext}
                    className="flex-[2] h-10 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
                >
                    เริ่มเรียนรู้
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </motion.div>
        </div>
    );
}

// Sub-component: AccentCard
function AccentCard({
    emoji,
    label,
    subLabel,
    isSelected,
    onClick
}: {
    emoji: string;
    label: string;
    subLabel: string;
    isSelected: boolean;
    onClick: () => void;
}) {
    return (
        <Card
            onClick={onClick}
            className={`
        cursor-pointer transition-all duration-300 overflow-hidden
        ${isSelected
                    ? 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border-2 border-indigo-500 shadow-lg scale-[1.02]'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-indigo-300'
                }
      `}
        >
            <CardContent className="p-3 text-center">
                <motion.div
                    animate={{ scale: isSelected ? 1.1 : 1 }}
                    className="text-3xl mb-1"
                >
                    {emoji}
                </motion.div>
                <h4 className={`font-bold text-sm ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                    {label}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    {subLabel}
                </p>
            </CardContent>
        </Card>
    );
}

// Sub-component: LevelCard
function LevelCard({
    level,
    isSelected,
    onClick
}: {
    level: string;
    isSelected: boolean;
    onClick: () => void;
}) {
    return (
        <Card
            onClick={onClick}
            className={`
        cursor-pointer transition-all duration-300 overflow-hidden
        ${isSelected
                    ? 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border-2 border-indigo-500 shadow-lg scale-[1.05]'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-indigo-300'
                }
      `}
        >
            <CardContent className="p-3 text-center">
                <h4 className={`font-black text-xl mb-1 ${isSelected ? 'text-indigo-600' : 'text-slate-700'}`}>
                    {level}
                </h4>
            </CardContent>
        </Card>
    );
}
