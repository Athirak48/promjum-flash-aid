import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
    ArrowLeft,
    Layers,
    Headphones,
    BookOpen,
    Gamepad2,
    ChevronRight,
    Loader2,
    Sparkles,
    RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { FlashcardSwiper } from '@/components/FlashcardSwiper';
import { GameSelectionDialog } from '@/components/GameSelectionDialog';
import { FlashcardQuizGame } from '@/components/FlashcardQuizGame';
import { FlashcardMatchingGame } from '@/components/FlashcardMatchingGame';
import { FlashcardListenChooseGame } from '@/components/FlashcardListenChooseGame';
import { FlashcardHangmanGame } from '@/components/FlashcardHangmanGame';
import { FlashcardVocabBlinderGame } from '@/components/FlashcardVocabBlinderGame';
import { FlashcardWordSearchGame } from '@/components/FlashcardWordSearchGame';
import { FlashcardWordScrambleGame } from '@/components/FlashcardWordScrambleGame';
import { FlashcardNinjaSliceGame } from '@/components/FlashcardNinjaSliceGame';
import { LearningModes, VocabItem, AudioSettings, ListeningMCQPhase, ReadingMCQPhase } from '@/components/learning';
import { useAnalytics } from '@/hooks/useAnalytics';
import { VocabWord } from '@/services/storyGenerationService';
import { LearningErrorBoundary } from '@/components/common/LearningErrorBoundary';

interface LearningSessionState {
    phases: string[];
    selectedVocab: VocabItem[];
    audioSettings?: AudioSettings;
    selectedModes: LearningModes;
}

interface PhaseResult {
    correct: number;
    total: number;
    timeSpent?: number;
}

const phaseInfo = {
    flashcard: { icon: Layers, label: 'Flashcard', color: 'from-blue-500 to-indigo-600' },
    listening: { icon: Headphones, label: 'Listening', color: 'from-indigo-500 to-purple-600' },
    reading: { icon: BookOpen, label: 'Reading', color: 'from-orange-500 to-amber-600' },
    game: { icon: Gamepad2, label: 'Game', color: 'from-pink-500 to-rose-600' },
};

export default function LearningSessionPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as LearningSessionState | null;

    // Session state
    const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
    const [phaseResults, setPhaseResults] = useState<Record<string, PhaseResult>>({});
    const [showGameSelection, setShowGameSelection] = useState(false);
    const [selectedGameType, setSelectedGameType] = useState<string | null>(null);
    const [isPhaseComplete, setIsPhaseComplete] = useState(false);
    const { trackFeatureUsage } = useAnalytics();

    // Redirect if no state
    useEffect(() => {
        if (!state || !state.phases || state.phases.length === 0) {
            navigate('/dashboard');
        }
    }, [state, navigate]);

    if (!state || !state.phases || state.phases.length === 0) {
        return null;
    }

    const { phases, selectedVocab, audioSettings, selectedModes } = state;
    const currentPhase = phases[currentPhaseIndex];
    const totalPhases = phases.length;
    const progress = ((currentPhaseIndex) / totalPhases) * 100;

    // Convert vocab to format needed by components
    const flashcardData = selectedVocab.map(v => ({
        id: v.id,
        front: v.front_text,
        back: v.back_text,
        partOfSpeech: v.part_of_speech,
        isUserFlashcard: v.isUserFlashcard
    }));

    const gameFlashcards = selectedVocab.map(v => ({
        id: v.id,
        front_text: v.front_text,
        back_text: v.back_text,
        created_at: new Date().toISOString(),
        isUserFlashcard: v.isUserFlashcard
    }));

    // Convert to VocabWord format for AI story generation
    const vocabWordList: VocabWord[] = selectedVocab.map(v => ({
        word: v.front_text,
        meaning: v.back_text,
    }));

    // Handle phase completion
    const handlePhaseComplete = (result?: any) => {
        const timeSpent = result?.timeSpent || 0;
        const phaseResult: PhaseResult = {
            correct: result?.correct || 0,
            total: result?.total || selectedVocab.length,
            timeSpent: timeSpent,
        };

        setPhaseResults(prev => ({
            ...prev,
            [currentPhase]: phaseResult,
        }));

        // Track time spent
        trackFeatureUsage(
            currentPhase === 'game' ? `game_${selectedGameType || 'unknown'}` : `learning_${currentPhase}`,
            'complete',
            timeSpent,
            { correct: phaseResult.correct, total: phaseResult.total }
        );

        setIsPhaseComplete(true);
    };

    // Move to next phase
    const handleNextPhase = () => {
        if (currentPhaseIndex < totalPhases - 1) {
            setCurrentPhaseIndex(prev => prev + 1);
            setIsPhaseComplete(false);
            setSelectedGameType(null);
        } else {
            // All phases complete - go to results
            navigate('/learning-results', {
                state: {
                    results: phaseResults,
                    selectedVocab,
                    selectedModes,
                    phases,
                }
            });
        }
    };

    // Handle game selection
    const handleGameSelect = (gameType: string) => {
        setSelectedGameType(gameType);
        setShowGameSelection(false);
    };

    // Handle close/exit
    const handleClose = () => {
        if (window.confirm('คุณต้องการออกจากการเรียนหรือไม่? ความคืบหน้าจะไม่ถูกบันทึก')) {
            navigate('/dashboard');
        }
    };

    // Trigger confetti when phase is complete
    useEffect(() => {
        if (isPhaseComplete) {
            const duration = 3000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 60 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);

                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                    colors: ['#F472B6', '#C084FC', '#818CF8']
                });
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                    colors: ['#F472B6', '#fbbf24', '#34d399']
                });
            }, 250);

            return () => clearInterval(interval);
        }
    }, [isPhaseComplete]);

    // Render current phase content
    const renderPhaseContent = () => {
        switch (currentPhase) {
            case 'flashcard':
                return (
                    <FlashcardSwiper
                        cards={flashcardData}
                        onClose={handleClose}
                        onComplete={(result) => {
                            // Save results for the phase
                            const phaseResult: PhaseResult = {
                                correct: result?.correct || 0,
                                total: (result?.correct || 0) + (result?.incorrect || 0),
                            };
                            setPhaseResults(prev => ({
                                ...prev,
                                [currentPhase]: phaseResult,
                            }));
                        }}
                        onReviewAgain={() => {
                            // Reset flashcard to review again
                            window.location.reload();
                        }}
                        onContinue={(results) => {
                            // If results are passed (from "Contniue" button), save them
                            if (results) {
                                const phaseResult: PhaseResult = {
                                    correct: results.correct || 0,
                                    total: (results.correct || 0) + (results.incorrect || 0),
                                };
                                setPhaseResults(prev => ({
                                    ...prev,
                                    [currentPhase]: phaseResult,
                                }));
                            }

                            // Go directly to next phase (skipping overlay)
                            if (currentPhaseIndex < totalPhases - 1) {
                                setCurrentPhaseIndex(prev => prev + 1);
                                setSelectedGameType(null);
                            } else {
                                navigate('/learning-results', {
                                    state: { results: phaseResults, selectedVocab, selectedModes, phases }
                                });
                            }
                        }}
                    />
                );

            case 'listening':
                return (
                    <LearningErrorBoundary onRetry={() => window.location.reload()}>
                        <ListeningMCQPhase
                            vocabList={vocabWordList}
                            audioSettings={audioSettings}
                            onComplete={handlePhaseComplete}
                            onClose={handleClose}
                        />
                    </LearningErrorBoundary>
                );

            case 'reading':
                return (
                    <LearningErrorBoundary onRetry={() => window.location.reload()}>
                        <ReadingMCQPhase
                            vocabList={vocabWordList}
                            onComplete={handlePhaseComplete}
                            onClose={handleClose}
                        />
                    </LearningErrorBoundary>
                );

            case 'game':
                if (!selectedGameType) {
                    return (
                        <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-24 h-24 rounded-3xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-2xl"
                            >
                                <Gamepad2 className="w-12 h-12 text-white" />
                            </motion.div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 text-center">
                                เลือกเกมที่อยากเล่น
                            </h2>
                            <Button
                                onClick={() => setShowGameSelection(true)}
                                size="lg"
                                className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold rounded-xl px-8"
                            >
                                <Gamepad2 className="w-5 h-5 mr-2" />
                                เลือกเกม
                            </Button>

                            <GameSelectionDialog
                                open={showGameSelection}
                                onOpenChange={setShowGameSelection}
                                onSelectGame={handleGameSelect}
                            />
                        </div>
                    );
                }

                // Render selected game
                const gameProps = {
                    flashcards: gameFlashcards,
                    onClose: handleClose,
                    onNext: () => {
                        // Game has its own summary, so go directly to next phase (skip overlay)
                        const phaseResult: PhaseResult = { correct: 0, total: 0 };
                        setPhaseResults(prev => ({
                            ...prev,
                            [currentPhase]: phaseResult,
                        }));
                        // Go directly to next phase
                        if (currentPhaseIndex < totalPhases - 1) {
                            setCurrentPhaseIndex(prev => prev + 1);
                            setSelectedGameType(null);
                        } else {
                            navigate('/learning-results', {
                                state: { results: phaseResults, selectedVocab, selectedModes, phases }
                            });
                        }
                    },
                    onSelectNewGame: () => {
                        setSelectedGameType(null);
                        setShowGameSelection(true);
                    },
                };

                switch (selectedGameType) {
                    case 'quiz':
                        return <FlashcardQuizGame {...gameProps} />;
                    case 'matching':
                        return <FlashcardMatchingGame {...gameProps} />;
                    case 'listen':
                        return <FlashcardListenChooseGame {...gameProps} />;
                    case 'hangman':
                        return <FlashcardHangmanGame {...gameProps} />;
                    case 'vocabBlinder':
                        return <FlashcardVocabBlinderGame {...gameProps} />;
                    case 'wordSearch':
                        return <FlashcardWordSearchGame {...gameProps} />;
                    case 'scramble':
                        return <FlashcardWordScrambleGame
                            vocabList={gameFlashcards.map(c => ({
                                id: c.id,
                                word: c.front_text,
                                meaning: c.back_text
                            }))}
                            onExit={gameProps.onClose}
                            onGameFinish={(results) => {
                                // Map results if necessary, or just call onNext
                                gameProps.onNext();
                            }}
                        />;
                    case 'ninja':
                        return <FlashcardNinjaSliceGame
                            vocabList={gameFlashcards.map(c => ({
                                id: c.id,
                                word: c.front_text,
                                meaning: c.back_text
                            }))}
                            onExit={gameProps.onClose}
                            onGameFinish={(results) => {
                                gameProps.onNext();
                            }}
                        />;
                    default:
                        return <FlashcardQuizGame {...gameProps} />;
                }

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-transparent">


            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClose}
                        className="rounded-full"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        ออก
                    </Button>

                    {/* Phase Progress */}
                    <div className="flex items-center gap-3 flex-1 max-w-md mx-4">
                        <div className="flex gap-1">
                            {phases.map((phase, idx) => {
                                const info = phaseInfo[phase as keyof typeof phaseInfo];
                                const Icon = info?.icon || Sparkles;
                                const isActive = idx === currentPhaseIndex;
                                const isComplete = idx < currentPhaseIndex;

                                return (
                                    <motion.div
                                        key={phase}
                                        initial={false}
                                        animate={{
                                            scale: isActive ? 1.1 : 1,
                                            opacity: isComplete ? 0.5 : 1,
                                        }}
                                        className={`
                      p-2 rounded-xl transition-all
                      ${isActive
                                                ? `bg-gradient-to-r ${info?.color || 'from-purple-500 to-pink-500'} text-white shadow-lg`
                                                : isComplete
                                                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                                            }
                    `}
                                    >
                                        <Icon className="w-4 h-4" />
                                    </motion.div>
                                );
                            })}
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between text-xs text-slate-500 mb-1">
                                <span>ขั้นตอน {currentPhaseIndex + 1}/{totalPhases}</span>
                                <span>{phaseInfo[currentPhase as keyof typeof phaseInfo]?.label}</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>
                    </div>

                    <div className="w-16" />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentPhase + (selectedGameType || '')}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-[calc(100vh-64px)]"
                    >
                        {renderPhaseContent()}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Phase Complete Overlay */}
            <AnimatePresence>
                {isPhaseComplete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: 50 }} // Exit animation for smoothness
                            transition={{ type: "spring", duration: 0.5, bounce: 0.4 }} // Bouncy spring
                            className="bg-white/90 backdrop-blur-2xl dark:bg-slate-800/90 rounded-[3rem] p-8 max-w-sm w-full shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-white/60 dark:border-slate-700/50 text-center relative overflow-hidden"
                        >
                            {/* Background decoration */}
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-pink-50/50 to-transparent pointer-events-none -z-10" />

                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                                className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200 ring-4 ring-white/50"
                            >
                                <motion.div
                                    animate={{
                                        rotate: [0, 15, -15, 0],
                                        scale: [1, 1.1, 1, 1.1, 1]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        repeatType: "loop",
                                        ease: "easeInOut"
                                    }}
                                >
                                    <Sparkles className="w-12 h-12 text-white drop-shadow-md" />
                                </motion.div>
                            </motion.div>

                            <h2 className="flex items-center justify-center gap-3 text-4xl font-black mb-6 transform hover:scale-105 transition-transform duration-300">
                                <span className="bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">เยี่ยมมาก!</span>
                                <span className="text-4xl animate-bounce">🎉</span>
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 mb-10 font-semibold text-lg leading-relaxed">
                                {currentPhaseIndex < totalPhases - 1
                                    ? <span>
                                        ผ่าด่าน <span className={`bg-gradient-to-r ${phaseInfo[currentPhase as keyof typeof phaseInfo]?.color || 'from-emerald-400 to-teal-500'} bg-clip-text text-transparent font-black underline decoration-2 decoration-white/50 underline-offset-4`}>
                                            {phaseInfo[currentPhase as keyof typeof phaseInfo]?.label}
                                        </span> สำเร็จแล้ว!
                                    </span>
                                    : 'เก่งมาก! เรียนครบทุกด่านแล้ว'
                                }
                            </p>

                            {/* Buttons row */}
                            <div className={`flex flex-col gap-3 ${currentPhase === 'flashcard' ? '' : ''}`}>
                                <Button
                                    onClick={handleNextPhase}
                                    size="lg"
                                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-full h-14 text-lg shadow-xl shadow-purple-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    {currentPhaseIndex < totalPhases - 1 ? (
                                        <div className="flex items-center gap-2">
                                            <span>ไปด่านถัดไป</span>
                                            <ChevronRight className="w-6 h-6" />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span>ดูสรุปผล</span>
                                            <Sparkles className="w-5 h-5" />
                                        </div>
                                    )}
                                </Button>

                                {/* Review Again button - only for Flashcard phase - moved to bottom text link or secondary button */}
                                {currentPhase === 'flashcard' && (
                                    <button
                                        onClick={() => {
                                            setIsPhaseComplete(false);
                                            setSelectedGameType(null);
                                        }}
                                        className="text-slate-400 hover:text-purple-500 text-sm font-semibold py-2 transition-colors"
                                    >
                                        ทวนอีกรอบ
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Placeholder for coming soon phases
function PhaseComingSoon({ phase, onComplete }: { phase: string; onComplete: () => void }) {
    const info = phaseInfo[phase as keyof typeof phaseInfo];
    const Icon = info?.icon || Sparkles;

    return (
        <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${info?.color} flex items-center justify-center shadow-2xl`}
            >
                <Icon className="w-12 h-12 text-white" />
            </motion.div>

            <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                    {info?.label} Mode
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                    AI กำลังสร้างเนื้อหาสำหรับคุณ...
                </p>
                <div className="flex items-center justify-center gap-2 text-purple-600">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm font-medium">Coming Soon</span>
                </div>
            </div>

            <Button
                onClick={onComplete}
                className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl"
            >
                ข้ามไปก่อน (Demo)
            </Button>
        </div>
    );
}
