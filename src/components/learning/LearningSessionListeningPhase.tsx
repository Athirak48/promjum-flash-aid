import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Volume2,
    CheckCircle,
    XCircle,
    ArrowRight,
    Loader2,
    Sparkles,
    Heart,
    Play,
    Timer,
    Rabbit,
    Headphones,
    Zap
} from 'lucide-react';
import { GeneratedQuestion, generateListeningStories, VocabWord } from '@/services/storyGenerationService';
import { AudioSettings } from '@/components/learning';
import { useXP } from '@/hooks/useXP';

// Mock Data for Fallback
const MOCK_QUESTIONS: GeneratedQuestion[] = [
    {
        id: 1,
        story: "Last Sunday, Tom went to the park. He saw a big dog playing with a ball. It was a sunny day, and he ate vanilla ice cream.",
        storyTh: "วันอาทิตย์ที่แล้ว ทอมไปสวนสาธารณะ เขาเห็นสุนัขตัวใหญ่เล่นกับลูกบอล วันนั้นแดดจัด เขากินไอศกรีมวานิลลา",
        question: "What did Tom see in the park?",
        questionTh: "ทอมเห็นอะไรในสวนสาธารณะ?",
        options: ["A big cat", "A big dog", "A small bird", "A red car"],
        optionsTh: ["แมวตัวใหญ่", "สุนัขตัวใหญ่", "นกตัวเล็ก", "รถสีแดง"],
        correctAnswer: 1,
        explanation: "Tom saw a big dog playing with a ball.",
        explanationTh: "ทอมเห็นสุนัขตัวใหญ่เล่นกับลูกบอล",
        vocabUsed: ["park", "dog", "ice cream"]
    },
    {
        id: 2,
        story: "Last Sunday, Tom went to the park. He saw a big dog playing with a ball. It was a sunny day, and he ate vanilla ice cream.",
        storyTh: "วันอาทิตย์ที่แล้ว ทอมไปสวนสาธารณะ เขาเห็นสุนัขตัวใหญ่เล่นกับลูกบอล วันนั้นแดดจัด เขากินไอศกรีมวานิลลา",
        question: "What did Tom eat?",
        questionTh: "ทอมกินอะไร?",
        options: ["Pizza", "Burger", "Vanilla ice cream", "Sandwich"],
        optionsTh: ["พิซซ่า", "เบอร์เกอร์", "ไอศกรีมวานิลลา", "แซนวิช"],
        correctAnswer: 2,
        explanation: "The story says he ate vanilla ice cream.",
        explanationTh: "เรื่องบอกว่าเขากินไอศกรีมวานิลลา",
        vocabUsed: ["park", "dog", "ice cream"]
    }
];

interface LearningSessionListeningPhaseProps {
    vocabList: VocabWord[];
    audioSettings?: AudioSettings;
    onComplete: (result: { correct: number; total: number }) => void;
    onClose: () => void;
}

// Cute Audio Wave Animation
const AudioWaves = ({ isPlaying }: { isPlaying: boolean }) => (
    <div className="flex items-center justify-center gap-1 h-8">
        {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
                key={i}
                animate={isPlaying ? { height: [8, 24, 8] } : { height: 8 }}
                transition={{ repeat: isPlaying ? Infinity : 0, duration: 0.5, delay: i * 0.1, ease: "easeInOut" }}
                className="w-1.5 bg-white rounded-full"
            />
        ))}
    </div>
);

// Confetti burst for correct answers
const ConfettiBurst = () => (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
        {['🎉', '✨', '⭐', '💖', '🐰', '🌸'].map((emoji, i) => (
            <motion.div
                key={i}
                initial={{ opacity: 1, scale: 0, x: '50%', y: '50%' }}
                animate={{
                    opacity: [1, 1, 0],
                    scale: [0, 1.5, 1],
                    x: `${50 + (Math.random() - 0.5) * 120}%`,
                    y: `${50 + (Math.random() - 0.5) * 120}%`,
                    rotate: [0, 180, 360]
                }}
                transition={{ duration: 1, delay: i * 0.05, ease: "easeOut" }}
                className="absolute text-3xl"
            >
                {emoji}
            </motion.div>
        ))}
    </div>
);

// 3D Walking Turtle Component
const WalkingTurtle = ({ isWalking }: { isWalking: boolean }) => (
    <div className="relative flex items-center justify-center w-12 h-12" style={{ perspective: '300px' }}>
        <motion.div
            animate={isWalking ? {
                rotateX: [0, 15, 0, 15, 0], // Tilt forward/back
                rotateZ: [0, -10, 10, -10, 0], // Waddle left/right
                y: [0, -6, 0, -6, 0], // Hop higher
                scale: [1, 1.1, 0.9, 1.1, 1] // Squish
            } : {
                rotateX: 0,
                rotateZ: 0,
                y: 0,
                scale: 1
            }}
            transition={isWalking ? {
                duration: 0.8,
                repeat: Infinity,
                ease: "easeInOut"
            } : { duration: 0.3 }}
            className="text-4xl z-10 filter drop-shadow-lg origin-bottom cursor-pointer"
            style={{ transformStyle: 'preserve-3d' }}
        >
            🐢
        </motion.div>
        {/* Dynamic Shadow */}
        <motion.div
            animate={isWalking ? {
                scale: [1, 0.6, 1, 0.6, 1],
                opacity: [0.3, 0.1, 0.3, 0.1, 0.3]
            } : { scale: 1, opacity: 0.3 }}
            transition={isWalking ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
            className="absolute -bottom-1 w-8 h-2 bg-black/20 rounded-full blur-[2px]"
        />
    </div>
);

export function LearningSessionListeningPhase({
    vocabList,
    audioSettings,
    onComplete,
    onClose
}: LearningSessionListeningPhaseProps) {
    const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showLongLoading, setShowLongLoading] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [currentSpeed, setCurrentSpeed] = useState(1.0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [streak, setStreak] = useState(0);
    const [xpGained, setXpGained] = useState(0);
    const [showXpPopup, setShowXpPopup] = useState(false);
    const [lastXpAmount, setLastXpAmount] = useState(0);

    const { addXP } = useXP();

    useEffect(() => {
        const loadQuestions = async () => {
            setIsLoading(true);
            const longLoadingTimer = setTimeout(() => setShowLongLoading(true), 5000);
            try {
                const level = audioSettings?.level || 'B1';
                const generated = await generateListeningStories(vocabList, level, 5);
                setQuestions(generated);
            } catch (error) {
                console.error('Failed to generate questions, using mock:', error);
                setQuestions(MOCK_QUESTIONS);
            } finally {
                clearTimeout(longLoadingTimer);
                setIsLoading(false);
                setShowLongLoading(false);
            }
        };
        loadQuestions();
    }, [vocabList, audioSettings]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-6 p-6 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
                <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="w-24 h-24 rounded-3xl bg-white shadow-xl flex items-center justify-center relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-200 to-purple-200 opacity-50" />
                    <span className="text-5xl relative z-10">🎧</span>
                </motion.div>
                <div className="text-center space-y-3">
                    <h3 className="text-xl font-bold text-slate-700">
                        {showLongLoading ? 'Making it perfect...' : 'Creating your story...'}
                    </h3>
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm font-medium">Please wait a moment 🌸</span>
                    </div>
                </div>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-6 bg-gradient-to-br from-pink-50 to-purple-50">
                <span className="text-6xl">😅</span>
                <p className="text-lg font-bold text-slate-600">Could not generate stories</p>
                <Button onClick={() => onComplete({ correct: 0, total: 0 })} className="bg-slate-800 text-white rounded-full px-8">
                    Skip
                </Button>
            </div>
        );
    }

    const question = questions[currentQuestion];
    if (!question) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-gradient-to-br from-pink-50 to-purple-50">
                <span className="text-6xl mb-4">🔄</span>
                <p className="text-lg font-bold text-slate-600 mb-4">Something went wrong</p>
                <Button onClick={() => window.location.reload()} className="bg-slate-800 text-white rounded-full px-8">
                    Try Again
                </Button>
            </div>
        );
    }

    const progress = ((currentQuestion + 1) / questions.length) * 100;
    const isCorrect = selectedAnswer === question.correctAnswer;

    const handlePlayAudio = (speed: number) => {
        window.speechSynthesis.cancel();
        setIsPlaying(true);
        setCurrentSpeed(speed);
        const utterance = new SpeechSynthesisUtterance(question.story);
        utterance.lang = audioSettings?.accent === 'uk' ? 'en-GB' : 'en-US';
        utterance.rate = speed;
        utterance.onend = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
    };

    const handleSelectAnswer = (index: number) => {
        if (showFeedback) return;
        setSelectedAnswer(index);
        setShowFeedback(true);

        const isAnswerCorrect = index === question.correctAnswer;

        if (isAnswerCorrect) {
            const newStreak = streak + 1;
            setStreak(newStreak);
            setCorrectCount(prev => prev + 1);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 1200);

            // Add XP for correct answer
            let xpToAdd = 2; // Estimated for local display, actual logic in hook
            addXP('learning_listening', 'correct_answer');

            // Check streak bonuses
            if (newStreak === 3) {
                xpToAdd += 3;
                addXP('learning_listening_streak3', 'streak_bonus');
            } else if (newStreak === 5) {
                xpToAdd += 5;
                addXP('learning_listening_streak5', 'streak_bonus');
            } else if (newStreak === 10) {
                xpToAdd += 10;
                addXP('learning_listening_streak10', 'streak_bonus');
            }

            setXpGained(prev => prev + xpToAdd);
            setLastXpAmount(xpToAdd);
            setShowXpPopup(true);
            setTimeout(() => setShowXpPopup(false), 1500);
        } else {
            setStreak(0);
        }
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
            setSelectedAnswer(null);
            setShowFeedback(false);
            setIsPlaying(false);
        } else {
            onComplete({ correct: correctCount, total: questions.length });
        }
    };

    const optionConfig = [
        { emoji: 'A', gradient: 'from-pink-50 to-rose-50', selectedGradient: 'from-pink-400 to-rose-500', border: 'border-pink-200' },
        { emoji: 'B', gradient: 'from-emerald-50 to-teal-50', selectedGradient: 'from-emerald-400 to-teal-500', border: 'border-emerald-200' },
        { emoji: 'C', gradient: 'from-amber-50 to-yellow-50', selectedGradient: 'from-amber-400 to-yellow-500', border: 'border-amber-200' },
        { emoji: 'D', gradient: 'from-purple-50 to-violet-50', selectedGradient: 'from-purple-400 to-violet-500', border: 'border-purple-200' },
    ];

    return (
        <div className="relative h-full flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-950 dark:to-indigo-950 overflow-hidden font-sans">
            {showConfetti && <ConfettiBurst />}

            {/* Header Area - Redesigned to match request */}
            <div className="flex-shrink-0 px-4 py-4 z-20 space-y-4">
                <div className="flex items-center justify-between">
                    {/* Left Pill: Question Counter */}
                    <div className="flex items-center gap-3 bg-gradient-to-r from-fuchsia-600 to-pink-500 rounded-full p-1.5 pr-6 shadow-lg shadow-pink-200 text-white transition-transform hover:scale-105 cursor-default">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <Headphones className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">Story {Math.floor(currentQuestion / 2) + 1}</span>
                            <span className="text-sm font-black bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-sm">
                                Step {(currentQuestion % 2) + 1}/2
                            </span>
                        </div>
                    </div>

                    {/* Right Pill: Score Counter */}
                    <div className="flex items-center gap-2 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full p-1.5 pr-5 shadow-lg shadow-orange-200 text-white transition-transform hover:scale-105 cursor-default">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <Sparkles className="w-4 h-4 text-white fill-current" />
                        </div>
                        <span className="text-sm font-black">{correctCount} Correct</span>
                    </div>
                </div>

                {/* Progress Bar with Moving Bunny */}
                <div className="relative h-3 bg-indigo-50 dark:bg-slate-800 rounded-full overflow-visible mx-1">
                    <div className="absolute inset-0 bg-white/50 rounded-full border border-white/60" />
                    <motion.div
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.6, type: "spring", bounce: 0 }}
                        className="relative h-full bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-full shadow-sm z-10"
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20">
                            <div className="bg-white p-1 rounded-full shadow-md border border-pink-100 transform scale-110">
                                <span className="text-xs leading-none block">{isPlaying && currentSpeed === 0.75 ? '🐢' : '🐰'}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* 🎵 Compact Player & Controls */}
            <div className="flex-1 flex flex-col items-center justify-start gap-3 px-4 py-2 z-10 w-full max-w-lg mx-auto overflow-hidden">

                {/* Question Text */}
                <div className="text-center w-full">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" /> Question {(currentQuestion % 2) + 1}
                    </span>
                    <h2 className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-100 leading-snug mt-1">
                        {question.question}
                    </h2>
                </div>

                {/* Play Button - Larger */}
                <div className="flex items-center justify-center gap-4 w-full">
                    {/* Main Play Button (Left) - Increased size */}
                    <motion.button
                        onClick={() => handlePlayAudio(currentSpeed)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative w-24 h-24 rounded-full shadow-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 border-3 border-white ring-2 ring-indigo-100 flex items-center justify-center"
                    >
                        {isPlaying ? (
                            <AudioWaves isPlaying={isPlaying} />
                        ) : (
                            <Play className="w-10 h-10 text-white fill-white ml-1" />
                        )}
                    </motion.button>

                    {/* Turtle Button - Slow Speed (0.75x) - Increased size */}
                    <motion.button
                        onClick={() => handlePlayAudio(0.75)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-20 h-20 rounded-full shadow-md flex items-center justify-center text-3xl transition-all
                            ${currentSpeed === 0.75
                                ? 'bg-gradient-to-br from-emerald-400 to-teal-500 ring-2 ring-emerald-200 ring-offset-2'
                                : 'bg-white/70 hover:bg-white border border-white/80'}`}
                    >
                        🐢
                    </motion.button>
                </div>

                {/* Story Transcript - Shows only after answering */}
                <AnimatePresence>
                    {showFeedback && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-white/80 shadow-sm w-full"
                        >
                            <p className="text-xs text-slate-600 italic leading-relaxed text-center">"{question.story}"</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Answer Options - Compact */}
                <div className="w-full space-y-1.5 flex-1 overflow-y-auto px-1">
                    {question.options.map((option, index) => {
                        const showStatus = showFeedback;
                        const isCorrectOption = index === question.correctAnswer;
                        const isSelected = selectedAnswer === index;
                        const config = optionConfig[index];

                        return (
                            <motion.button
                                key={index}
                                onClick={() => handleSelectAnswer(index)}
                                whileHover={!showStatus ? { scale: 1.01 } : {}}
                                whileTap={!showStatus ? { scale: 0.98 } : {}}
                                className={`
                                    w-full relative p-2.5 rounded-xl border text-left transition-all duration-300
                                    flex items-center gap-2.5
                                    ${showStatus
                                        ? isCorrectOption
                                            ? 'bg-green-500 border-green-500 text-white shadow-md'
                                            : isSelected
                                                ? 'bg-red-500 border-red-500 text-white shadow-md'
                                                : 'bg-white/40 border-transparent opacity-50'
                                        : isSelected
                                            ? 'bg-white border-purple-500 shadow-md ring-2 ring-purple-100'
                                            : 'bg-white/60 border-white/60 hover:bg-white hover:border-purple-200'
                                    }
                                `}
                            >
                                <div className={`
                                    w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-sm flex-shrink-0
                                    ${showStatus && isCorrectOption
                                        ? 'bg-white/20 text-white'
                                        : index === 0 ? 'bg-pink-100 text-pink-600' :
                                            index === 1 ? 'bg-emerald-100 text-emerald-600' :
                                                index === 2 ? 'bg-amber-100 text-amber-600' :
                                                    'bg-purple-100 text-purple-600'
                                    }
                                `}>
                                    {showStatus && isCorrectOption ? '✓' : config.emoji}
                                </div>
                                <span className={`font-medium text-sm flex-1 ${showStatus && isCorrectOption ? 'text-black' : 'text-slate-700'}`}>
                                    {option}
                                </span>
                            </motion.button>
                        );
                    })}
                </div>

                {/* Next Button - Shows after answering */}
                <AnimatePresence>
                    {showFeedback && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full flex justify-center pb-2"
                        >
                            <Button
                                onClick={() => {
                                    if (currentQuestion < questions.length - 1) {
                                        setCurrentQuestion(prev => prev + 1);
                                        setSelectedAnswer(null);
                                        setShowFeedback(false);
                                        setIsPlaying(false);
                                    } else {
                                        onComplete({ correct: correctCount, total: questions.length });
                                    }
                                }}
                                className="bg-slate-800 text-white rounded-full px-6 py-2 shadow-lg hover:bg-slate-700 hover:scale-105 transition-all text-sm"
                            >
                                {currentQuestion < questions.length - 1 ? 'Next Question →' : 'Finish Quiz 🎉'}
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}
