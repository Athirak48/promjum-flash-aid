import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    BookOpen,
    CheckCircle2,
    XCircle,
    ArrowRight,
    Loader2,
    Turtle,
    Zap,
} from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { GeneratedQuestion, generateReadingStories, VocabWord } from '@/services/storyGenerationService';
import { useXP } from '@/hooks/useXP';

// 3D Walking Turtle Component
const WalkingTurtle = ({ isWalking }: { isWalking: boolean }) => (
    <div className="relative flex items-center justify-center w-12 h-12" style={{ perspective: '300px' }}>
        <motion.div
            animate={isWalking ? {
                rotateX: [0, 15, 0, 15, 0],
                rotateZ: [0, -10, 10, -10, 0],
                y: [0, -6, 0, -6, 0],
                scale: [1, 1.1, 0.9, 1.1, 1]
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

interface LearningSessionReadingPhaseProps {
    vocabList: VocabWord[];
    onComplete: (result: { correct: number; total: number }) => void;
    onClose: () => void;
}

export function LearningSessionReadingPhase({
    vocabList,
    onComplete,
    onClose
}: LearningSessionReadingPhaseProps) {
    const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [xpGained, setXpGained] = useState(0);

    const { addXP } = useXP();

    // Create dictionary from vocab list
    const dictionary: Record<string, string> = {};
    vocabList.forEach(v => {
        dictionary[v.word.toLowerCase()] = v.meaning;
    });

    // Generate questions on mount
    useEffect(() => {
        const loadQuestions = async () => {
            setIsLoading(true);
            try {
                const generated = await generateReadingStories(vocabList, 2);
                setQuestions(generated);
            } catch (error) {
                console.error('Failed to generate questions:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadQuestions();
    }, [vocabList]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-6 p-8 bg-sky-50/50">
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="relative"
                >
                    <div className="absolute inset-0 bg-sky-200 rounded-full blur-xl opacity-50"></div>
                    <div className="bg-white p-4 rounded-3xl shadow-xl relative z-10">
                        <Loader2 className="w-12 h-12 text-sky-500 animate-spin" />
                    </div>
                </motion.div>
                <div className="text-center">
                    <h3 className="text-xl font-black text-slate-700 mb-2">
                        Writing Story...
                    </h3>
                    <p className="text-slate-500 font-medium bg-white/50 px-4 py-1 rounded-full text-sm">
                        ✨ Compiling vocabulary magic...
                    </p>
                </div>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
                <p className="text-rose-500 font-bold bg-rose-50 px-4 py-2 rounded-xl border border-rose-100">
                    Unable to generate story for this set.
                </p>
                <Button variant="outline" onClick={() => onComplete({ correct: 0, total: 0 })} className="rounded-xl">
                    Skip Setup
                </Button>
            </div>
        );
    }

    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    const isCorrect = selectedAnswer === question.correctAnswer;

    // Interactive word component - Cuter & Friendlier
    const InteractiveWord = ({ word }: { word: string }) => {
        const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").toLowerCase();
        const translation = dictionary[cleanWord];

        // Only define word if it has meaning and isn't empty
        if (!word.trim() || !translation) return <span>{word} </span>;

        return (
            <HoverCard openDelay={0} closeDelay={100}>
                <HoverCardTrigger asChild>
                    <span
                        className="cursor-pointer relative group inline-block mx-0.5 rounded-md px-0.5 transition-colors hover:bg-pink-50"
                    >
                        <span className="relative z-10 text-slate-700 font-medium group-hover:text-pink-500 transition-colors">
                            {word}
                        </span>
                        {/* Cute dotted underline */}
                        <span className="absolute bottom-0 left-0 w-full border-b-2 border-dotted border-pink-200 group-hover:border-pink-400 transition-colors"></span>
                    </span>
                </HoverCardTrigger>
                <HoverCardContent
                    className="w-auto p-0 border-none bg-transparent shadow-none"
                    align="center"
                    sideOffset={8}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 5, rotate: -2 }}
                        animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
                        className="bg-white rounded-2xl shadow-xl shadow-pink-100/50 border-2 border-pink-100 p-3 flex flex-col items-center min-w-[120px] relative overflow-hidden"
                    >
                        <div className="absolute top-0 w-full h-1.5 bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300"></div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 mt-1">{cleanWord}</span>
                        <span className="text-pink-500 font-black text-lg bg-pink-50/50 px-4 py-1.5 rounded-xl">
                            {translation}
                        </span>
                        <div className="absolute -bottom-2 -right-2 text-2xl opacity-10 rotate-12">🍄</div>
                    </motion.div>
                </HoverCardContent>
            </HoverCard>
        );
    };

    const handleSelectAnswer = (index: number) => {
        if (showFeedback) return;
        setSelectedAnswer(index);
        setShowFeedback(true);

        if (index === question.correctAnswer) {
            setCorrectCount(prev => prev + 1);
            // Add XP for correct answer (+2 XP)
            addXP('learning_reading');
            setXpGained(prev => prev + 2);
        }
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
            setSelectedAnswer(null);
            setShowFeedback(false);
        } else {
            onComplete({ correct: correctCount, total: questions.length });
        }
    };

    // Split story into words with readable typography
    const renderInteractiveStory = (story: string) => {
        const paragraphs = story.split('\n\n');
        return paragraphs.map((paragraph, pIdx) => (
            <div key={pIdx} className="mb-8 last:mb-0 relative group">
                <p className="text-slate-600 font-medium text-lg leading-[2.5rem] tracking-wide">
                    {paragraph.split(' ').map((word, wIdx) => (
                        <InteractiveWord key={`${pIdx}-${wIdx}`} word={word} />
                    ))}
                </p>
                {/* Paragraph decor */}
                <div className="hidden group-hover:block absolute -left-4 top-2 text-pink-200 text-xl select-none">✨</div>
            </div>
        ));
    };

    return (
        <div className="h-full flex flex-col bg-[#FDF7F9]">
            {/* Cute Header */}
            <div className="px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-20">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-pink-400 to-rose-400 text-white w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-200 transform -rotate-3 hover:rotate-0 transition-transform cursor-pointer">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-slate-700">Reading Time</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm font-bold text-slate-500">
                                    Passage {Math.floor(currentQuestion / 2) + 1} of {Math.ceil(questions.length / 2)}
                                </span>
                                <span className="bg-[#FFF0F5] text-pink-400 font-bold px-3 py-1 rounded-full text-xs box-decoration-clone">
                                    (Question {(currentQuestion % 2) + 1}/2)
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-white border-[3px] border-[#FCE7F3] px-5 py-1.5 rounded-full flex items-center gap-2.5 shadow-sm">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#34D399]"></div>
                            <span className="text-sm font-extrabold text-slate-600">{correctCount} Correct</span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar with Walking Turtle */}
                <div className="relative h-3 bg-pink-50 dark:bg-slate-800 rounded-full overflow-visible mx-1">
                    <div className="absolute inset-0 bg-white/50 rounded-full border border-white/60" />
                    <motion.div
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.6, type: "spring", bounce: 0 }}
                        className="relative h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full shadow-sm z-10"
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20">
                            <div className="bg-white p-1 rounded-full shadow-md border border-pink-100 transform scale-110">
                                <WalkingTurtle isWalking={true} />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto h-full">

                    {/* STORY CARD - REDESIGNED */}
                    <div className="lg:col-span-7 h-full flex flex-col">
                        <Card className="bg-white border-2 border-pink-50 shadow-xl shadow-pink-100/50 rounded-[2.5rem] overflow-hidden flex-1 relative ring-4 ring-white/50">
                            {/* Decorative header matching reference */}
                            <div className="h-20 bg-pink-50/30 border-b border-pink-100 flex items-center px-8 justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl filter drop-shadow-sm animate-bounce-slow">🍄</span>
                                    <span className="font-black text-xl text-slate-700 tracking-tight">Funny Story</span>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-pink-300 shadow-sm"></div>
                                    <div className="w-3 h-3 rounded-full bg-sky-300 shadow-sm"></div>
                                    <div className="w-3 h-3 rounded-full bg-amber-300 shadow-sm"></div>
                                </div>
                            </div>

                            {/* Story body with paper lines decoration */}
                            <CardContent
                                className="p-8 lg:p-10 overflow-y-auto custom-scrollbar relative"
                                style={{
                                    backgroundImage: 'linear-gradient(#f1f5f9 1px, transparent 1px)',
                                    backgroundSize: '100% 2.5rem',
                                    backgroundColor: '#fff',
                                    backgroundPosition: '0 0.5rem' // Align lines with text
                                }}
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="relative z-10"
                                >
                                    {renderInteractiveStory(question.story)}
                                </motion.div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* QUESTION CARD - Compact Mode */}
                    <div className="lg:col-span-5 h-full flex flex-col gap-2 min-h-0">
                        <Card className="bg-white/80 backdrop-blur-md border-2 border-white shadow-xl shadow-indigo-100/50 rounded-[2rem] overflow-hidden flex flex-col flex-1 min-h-0">
                            <CardContent className="p-5 flex flex-col h-full">
                                {/* Question Bubble */}
                                <div className="mb-3 flex-shrink-0">
                                    <div className="bg-[#eef2ff] p-4 rounded-[1.5rem] rounded-tl-none relative">
                                        <h2 className="text-base font-bold text-[#4338ca] leading-snug">
                                            {question.question}
                                        </h2>
                                        {/* Little tail for bubble */}
                                        <svg className="absolute -top-3 left-0 w-6 h-6 text-[#eef2ff] fill-current transform rotate-180" viewBox="0 0 20 20">
                                            <path d="M0 0 L20 0 L20 20 Z" />
                                        </svg>
                                    </div>
                                    <div className="ml-2 mt-1 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-[10px] shadow-md">
                                            AI
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400">Question Bot</span>
                                    </div>
                                </div>

                                {/* Options - Scrollable Fallback */}
                                <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2 min-h-0 content-start">
                                    {question.options.map((option, index) => {
                                        const isSelected = selectedAnswer === index;
                                        const isCorrectOption = index === question.correctAnswer;
                                        const showStatus = showFeedback;

                                        let cardStyle = "group relative w-full py-3 px-4 rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer flex items-center gap-3 overflow-hidden shrink-0";

                                        if (showStatus) {
                                            if (isCorrectOption) {
                                                cardStyle += " bg-emerald-50 border-emerald-400 shadow-lg shadow-emerald-100";
                                            } else if (isSelected && !isCorrectOption) {
                                                cardStyle += " bg-rose-50 border-rose-300 opacity-60";
                                            } else {
                                                cardStyle += " bg-slate-50 border-slate-100 opacity-40 grayscale";
                                            }
                                        } else {
                                            cardStyle += isSelected
                                                ? " bg-indigo-50 border-indigo-400 shadow-md ring-2 ring-indigo-200"
                                                : " bg-white border-slate-100 hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5";
                                        }

                                        return (
                                            <div key={index} className={cardStyle} onClick={() => handleSelectAnswer(index)}>
                                                {/* Selection Circle */}
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all shrink-0
                                                    ${showStatus && isCorrectOption ? 'bg-emerald-500 border-emerald-500 text-white' :
                                                        isSelected ? 'bg-indigo-500 border-indigo-500 text-white' :
                                                            'bg-white border-slate-200 text-slate-400 group-hover:border-indigo-300 group-hover:text-indigo-400'}
                                                `}>
                                                    {showStatus && isCorrectOption ? <CheckCircle2 className="w-4 h-4" /> :
                                                        String.fromCharCode(65 + index)}
                                                </div>

                                                <span className={`font-semibold text-sm flex-1 leading-tight ${isSelected ? 'text-indigo-900' : 'text-slate-600'}`}>
                                                    {option}
                                                </span>

                                                {/* Shine Effect */}
                                                {!showStatus && !isSelected && (
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Feedback / Next Button - Fixed at bottom of column */}
                        <AnimatePresence>
                            {showFeedback && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-1 rounded-[2rem] bg-gradient-to-r ${isCorrect ? 'from-emerald-400 to-teal-400' : 'from-rose-400 to-pink-500'} flex-shrink-0`}
                                >
                                    <div className="bg-white rounded-[1.8rem] p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xl shadow-md ${isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                                {isCorrect ? '🎉' : '💪'}
                                            </div>
                                            <div>
                                                <div className={`font-black uppercase text-xs tracking-wider ${isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {isCorrect ? 'Excellent!' : 'Keep Trying!'}
                                                </div>
                                                <div className="text-xs text-slate-400 font-medium">
                                                    {isCorrect ? '+100 XP gained' : 'New word added to review'}
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={handleNext}
                                            className={`rounded-xl px-6 font-bold shadow-lg ${isCorrect ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'}`}
                                        >
                                            Next <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
