import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap, TrendingDown, Award, AlertTriangle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InterimTestQuestion {
    id: string;
    front_text: string;
    back_text: string;
    part_of_speech?: string;
    options: string[];
    correctAnswer: string;
    isWeak: boolean;
}

interface InterimTestProps {
    questions: InterimTestQuestion[];
    onComplete: (results: {
        correct: number;
        total: number;
        leechIds: string[];
        bonusIds: string[];
    }) => void;
    onCancel: () => void;
    testNumber: number;
}

export default function InterimTestComponent({
    questions,
    onComplete,
    onCancel,
    testNumber
}: InterimTestProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [results, setResults] = useState<{ questionId: string; correct: boolean; isWeak: boolean }[]>([]);
    const [timeLeft, setTimeLeft] = useState(5);
    const [isBreakTime, setIsBreakTime] = useState(false);
    const [currentSet, setCurrentSet] = useState(1);

    const totalSets = Math.ceil(questions.length / 20);
    const questionsInCurrentSet = questions.slice((currentSet - 1) * 20, currentSet * 20);
    const currentQuestion = questionsInCurrentSet[currentIndex];

    // Global Progress
    const globalIndex = (currentSet - 1) * 20 + currentIndex;
    const progressPercent = ((globalIndex) / questions.length) * 100;

    // Timer logic
    useEffect(() => {
        if (isBreakTime || !currentQuestion || selectedAnswer) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleNextQuestion(null);
                    return 5;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [currentIndex, isBreakTime, selectedAnswer]);

    const handleAnswerSelect = (answer: string) => {
        if (selectedAnswer) return;
        setSelectedAnswer(answer);

        const isCorrect = answer === currentQuestion.correctAnswer;
        setResults(prev => [...prev, {
            questionId: currentQuestion.id,
            correct: isCorrect,
            isWeak: currentQuestion.isWeak
        }]);

        setTimeout(() => {
            handleNextQuestion(answer);
        }, 500); // 500ms feedback delay
    };

    const handleNextQuestion = (answer: string | null) => {
        // Handle timeout
        if (answer === null) {
            setResults(prev => [...prev, {
                questionId: currentQuestion.id,
                correct: false,
                isWeak: currentQuestion.isWeak
            }]);
        }

        setSelectedAnswer(null);
        setTimeLeft(5);

        // Check if finished current set
        if (currentIndex + 1 >= questionsInCurrentSet.length) {
            if (currentSet < totalSets) {
                setIsBreakTime(true);
            } else {
                // Determine completion will be handled by effect, but need to ensure last result is registered
                // The effect dependency on results will catch it.
            }
        } else {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handleContinueAfterBreak = () => {
        setIsBreakTime(false);
        setCurrentSet(currentSet + 1);
        setCurrentIndex(0);
    };

    // Completion Handler
    useEffect(() => {
        if (results.length > 0 && results.length === questions.length) {
            const correctCount = results.filter(r => r.correct).length;
            const leechIds = results.filter(r => !r.correct).map(r => r.questionId);
            const bonusIds = results.filter(r => r.correct).map(r => r.questionId);
            onComplete({ correct: correctCount, total: results.length, leechIds, bonusIds });
        }
    }, [results, questions.length]);

    // Loading State
    if (!currentQuestion && !isBreakTime && results.length !== questions.length) {
        return <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-indigo-400">Loading...</div>;
    }

    // Processing State
    if (results.length === questions.length) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center relative overflow-hidden font-sans">
                {/* Cosmic Background */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0a0a0b] to-[#0a0a0b]" />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 animate-pulse" />

                <div className="relative z-10 text-center space-y-6">
                    <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20" />
                        <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Zap className="w-8 h-8 text-indigo-400 animate-pulse" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 animate-pulse">
                            Processing Results...
                        </h2>
                        <p className="text-slate-500 text-sm">
                            Calculating SRS Score & Leech Detection
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Break Screen
    if (isBreakTime) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0a0a0b] p-6 text-slate-200">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-md"
                >
                    <Card className="border-0 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10" />
                        <CardContent className="p-8 text-center space-y-6 relative z-10">
                            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4 animate-bounce">
                                <Zap className="h-10 w-10 text-white fill-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Set {currentSet} Completed!</h2>
                            <p className="text-slate-400">
                                พักหายใจสักนิด แล้วไปลุยต่อ! <br />
                                เหลืออีก {totalSets - currentSet} ชุด
                            </p>
                            <Button
                                onClick={handleContinueAfterBreak}
                                className="w-full h-12 text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-[0_0_20px_-5px_#6366f1] transition-all hover:scale-[1.02] rounded-xl"
                            >
                                ลุยต่อเลย (Continue)
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-slate-100 font-sans selection:bg-indigo-500/30 overflow-hidden relative">
            {/* Cosmic Background */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen" />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-6 max-w-2xl flex flex-col min-h-screen">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30">
                            <Zap className="h-5 w-5 text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-tight">Interim Test #{testNumber}</h1>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span>Set {currentSet}/{totalSets}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-600" />
                                <span>Question {currentIndex + 1}/{questionsInCurrentSet.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Timer */}
                        <div className={`
                            flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono font-bold text-lg 
                            transition-colors duration-300
                            ${timeLeft <= 2
                                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse'
                                : 'bg-white/5 border-white/10 text-indigo-300'}
                        `}>
                            <Clock className="w-4 h-4" />
                            <span>00:0{timeLeft}</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onCancel}
                            className="text-slate-400 hover:text-white hover:bg-white/10 rounded-lg"
                        >
                            <span className="sr-only">Exit</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </Button>
                    </div>
                </div>

                {/* Question Area */}
                <div className="flex-1 flex flex-col justify-center pb-20">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={globalIndex}
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -50, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "circOut" }}
                            className="w-full"
                        >
                            {/* Question Card */}
                            <div className="mb-6 relative">
                                {/* Weak Word Warning */}
                                {currentQuestion.isWeak && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                                        <Badge variant="destructive" className="bg-rose-500 text-white border-0 shadow-lg shadow-rose-900/40 px-3 py-1 flex items-center gap-1.5">
                                            <TrendingDown className="w-3 h-3" />
                                            Weak Word
                                        </Badge>
                                    </div>
                                )}

                                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 p-8 text-center shadow-[0_0_40px_-10px_rgba(99,102,241,0.15)] backdrop-blur-md">
                                    <div className="absolute inset-0 bg-white/5 mix-blend-overlay" />

                                    <div className="relative z-10 space-y-3">
                                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-xl mb-2">
                                            {currentQuestion.front_text}
                                        </h2>

                                        {currentQuestion.part_of_speech && (
                                            <span className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/5 text-slate-300 text-sm italic font-medium">
                                                {currentQuestion.part_of_speech}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Options */}
                            <div className="grid gap-3">
                                {currentQuestion.options.map((option, idx) => {
                                    const isSelected = selectedAnswer === option;
                                    const isCorrect = option === currentQuestion.correctAnswer;

                                    // Show correct/incorrect state if answer selected
                                    let stateStyles = "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-indigo-500/30";
                                    if (selectedAnswer) {
                                        if (isSelected && isCorrect) {
                                            stateStyles = "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_-5px_#10b981]";
                                        } else if (isSelected && !isCorrect) {
                                            stateStyles = "bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-[0_0_15px_-5px_#f43f5e]";
                                        } else if (!isSelected && isCorrect) {
                                            // Show correct answer even if wrong one selected
                                            stateStyles = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400/70";
                                        } else {
                                            stateStyles = "opacity-40 bg-black/20 border-transparent";
                                        }
                                    }

                                    return (
                                        <motion.button
                                            key={idx}
                                            disabled={selectedAnswer !== null}
                                            onClick={() => handleAnswerSelect(option)}
                                            whileHover={!selectedAnswer ? { scale: 1.01, x: 4 } : {}}
                                            whileTap={!selectedAnswer ? { scale: 0.98 } : {}}
                                            className={`
                                                relative w-full p-4 rounded-xl border text-left flex items-center gap-4 transition-all duration-200
                                                ${stateStyles}
                                            `}
                                        >
                                            <div className={`
                                                w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border transition-colors
                                                ${isSelected
                                                    ? 'bg-transparent border-current'
                                                    : 'bg-black/20 border-white/10 text-slate-500'}
                                            `}>
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            <span className="text-lg font-medium truncate flex-1">{option}</span>

                                            {selectedAnswer && isSelected && (
                                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                                    {isCorrect ? <Award className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-rose-400" />}
                                                </motion.div>
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>

                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Progress Footer */}
                <div className="fixed bottom-0 left-0 w-full p-1 z-50">
                    <Progress value={progressPercent} className="h-1 w-full bg-slate-800 rounded-none" indicatorClassName="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                </div>
            </div>
        </div>
    );
}
