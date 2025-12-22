import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { ModeSelectionStep, LearningModes } from './ModeSelectionStep';
import { VocabSelectionStep, VocabItem } from './VocabSelectionStep';
import { AudioSetupStep, AudioSettings } from './AudioSetupStep';
import { ReadyToStartStep } from './ReadyToStartStep';

type FlowStep = 'mode' | 'vocab' | 'audio' | 'ready';

interface LearningFlowDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function LearningFlowDialog({ open, onOpenChange }: LearningFlowDialogProps) {
    const navigate = useNavigate();

    // Flow state
    const [currentStep, setCurrentStep] = useState<FlowStep>('mode');

    // Mode selection state
    const [selectedModes, setSelectedModes] = useState<LearningModes>({
        flashcard: true,
        game: true,
        listening: false,
        reading: false,
    });

    // Vocab selection state
    const [selectedVocab, setSelectedVocab] = useState<VocabItem[]>([]);

    // Audio settings state
    const [audioSettings, setAudioSettings] = useState<AudioSettings>({
        accent: 'us',
        level: 'B1', // Default level
    });

    // Reset state when dialog closes
    const handleClose = () => {
        onOpenChange(false);
        // Reset after animation completes
        setTimeout(() => {
            setCurrentStep('mode');
            setSelectedModes({
                flashcard: true,
                game: true,
                listening: false,
                reading: false,
            });
            setSelectedVocab([]);
            setAudioSettings({ accent: 'us', level: 'B1' });
        }, 300);
    };

    // Navigation handlers
    const handleModeNext = () => {
        setCurrentStep('vocab');
    };

    const handleVocabNext = () => {
        // Skip audio setup if listening is not selected
        if (selectedModes.listening) {
            setCurrentStep('audio');
        } else {
            setCurrentStep('ready');
        }
    };

    const handleVocabBack = () => {
        setCurrentStep('mode');
    };

    const handleAudioNext = () => {
        setCurrentStep('ready');
    };

    const handleAudioBack = () => {
        setCurrentStep('vocab');
    };

    const handleReadyBack = () => {
        if (selectedModes.listening) {
            setCurrentStep('audio');
        } else {
            setCurrentStep('vocab');
        }
    };

    // Start learning session
    const handleStartLearning = () => {
        // Determine phases based on selected modes
        const phases: string[] = [];

        // Order: flashcard → game → listening → reading
        if (selectedModes.flashcard) phases.push('flashcard');
        if (selectedModes.game) phases.push('game');
        if (selectedModes.listening) phases.push('listening');
        if (selectedModes.reading) phases.push('reading');

        // Close dialog
        onOpenChange(false);

        // Navigate to learning session page
        navigate('/learning-session', {
            state: {
                phases,
                selectedVocab,
                audioSettings: selectedModes.listening ? audioSettings : undefined,
                selectedModes,
            }
        });
    };

    // Get step progress
    const getStepNumber = () => {
        const steps: FlowStep[] = ['mode', 'vocab'];
        if (selectedModes.listening) steps.push('audio');
        steps.push('ready');

        return {
            current: steps.indexOf(currentStep) + 1,
            total: steps.length,
        };
    };

    const stepProgress = getStepNumber();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent hideCloseButton className="sm:max-w-[600px] max-h-[90vh] p-0 overflow-hidden bg-gradient-to-br from-slate-50 to-purple-50/30 dark:from-slate-900 dark:to-purple-950/30 border-0 shadow-2xl">
                {/* Cute Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-purple-100 dark:border-purple-900/50 bg-gradient-to-r from-pink-50/80 via-purple-50/80 to-indigo-50/80 dark:from-pink-900/20 dark:via-purple-900/20 dark:to-indigo-900/20">
                    <div className="flex items-center gap-2">
                        {/* Cute step indicators */}
                        <div className="flex items-center gap-1.5">
                            {Array.from({ length: stepProgress.total }).map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={false}
                                    animate={{
                                        scale: i + 1 === stepProgress.current ? 1.2 : 0.9,
                                    }}
                                    className={`
                                        w-2.5 h-2.5 rounded-full transition-all duration-300
                                        ${i + 1 < stepProgress.current
                                            ? 'bg-gradient-to-r from-green-400 to-emerald-400'
                                            : i + 1 === stepProgress.current
                                                ? 'bg-gradient-to-r from-pink-400 to-purple-400'
                                                : 'bg-slate-200 dark:bg-slate-600'
                                        }
                                    `}
                                />
                            ))}
                        </div>
                        <span className="text-xs font-medium text-purple-500 dark:text-purple-300">
                            {stepProgress.current}/{stepProgress.total} ✨
                        </span>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClose}
                        className="rounded-full w-7 h-7 hover:bg-pink-100 dark:hover:bg-pink-900/30 text-slate-400 hover:text-pink-500 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                    <AnimatePresence mode="wait">
                        {currentStep === 'mode' && (
                            <motion.div
                                key="mode"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ModeSelectionStep
                                    selectedModes={selectedModes}
                                    onModeChange={setSelectedModes}
                                    onNext={handleModeNext}
                                />
                            </motion.div>
                        )}

                        {currentStep === 'vocab' && (
                            <motion.div
                                key="vocab"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <VocabSelectionStep
                                    selectedVocab={selectedVocab}
                                    onVocabChange={setSelectedVocab}
                                    onNext={handleVocabNext}
                                    onBack={handleVocabBack}
                                    maxSelection={12}
                                />
                            </motion.div>
                        )}

                        {currentStep === 'audio' && (
                            <motion.div
                                key="audio"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <AudioSetupStep
                                    settings={audioSettings}
                                    onSettingsChange={setAudioSettings}
                                    onNext={handleAudioNext}
                                    onBack={handleAudioBack}
                                />
                            </motion.div>
                        )}

                        {currentStep === 'ready' && (
                            <motion.div
                                key="ready"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ReadyToStartStep
                                    selectedModes={selectedModes}
                                    selectedVocab={selectedVocab}
                                    onStart={handleStartLearning}
                                    onBack={handleReadyBack}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Re-export types for convenience
export type { LearningModes } from './ModeSelectionStep';
export type { VocabItem } from './VocabSelectionStep';
export type { AudioSettings } from './AudioSetupStep';
