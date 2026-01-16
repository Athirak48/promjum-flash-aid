import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Trophy, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PostTestQuestion {
    id: string;
    front_text: string;
    back_text: string;
    part_of_speech?: string;
    options: string[];
    correctAnswer: string;
}

interface PostTestProps {
    questions: PostTestQuestion[];
    onComplete: (results: {
        correct: number;
        total: number;
        wrongWords: Array<{ front: string; back: string; correct: string }>;
        score: number; // Percentage
        answers: Array<{ questionId: string; isCorrect: boolean }>; // NEW: For dual-score calculation
    }) => void;
    onCancel: () => void;
    isRetestMode: boolean; // Re-test pre-test set vs Test all words
}

export default function PostTestComponent({
    questions,
    onComplete,
    onCancel,
    isRetestMode
}: PostTestProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [results, setResults] = useState<{ questionId: string; correct: boolean; userAnswer: string }[]>([]);
    const [showBreak, setShowBreak] = useState(false);
    const [timeLeft, setTimeLeft] = useState(5); // 5 seconds for final test

    // Pagination / Set Logic
    const [currentSet, setCurrentSet] = useState(1);
    const totalSets = Math.ceil(questions.length / 20);

    const currentQuestion = questions[currentIndex];
    const progressPercent = ((currentIndex + 1) / questions.length) * 100;

    // Auto-advance timer ref
    useEffect(() => {
        if (showFeedback) {
            const timer = setTimeout(() => {
                handleNext();
            }, 500); // 0.5s delay (snappy feedback)
            return () => clearTimeout(timer);
        }
    }, [showFeedback]);

    // Timer countdown
    useEffect(() => {
        if (!currentQuestion || showFeedback || showBreak) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleTimeout();
                    return 5;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [currentIndex, showFeedback, showBreak]);

    const handleTimeout = () => {
        // Auto-select nothing (wrong)
        handleAnswerSelect(null);
    };

    const handleAnswerSelect = (answer: string | null) => {
        if (selectedAnswer !== null) return;

        setSelectedAnswer(answer || '');
        const correct = answer === currentQuestion.correctAnswer;
        setIsCorrect(correct);
        setShowFeedback(true);

        setResults([...results, {
            questionId: currentQuestion.id,
            correct,
            userAnswer: answer || 'No answer'
        }]);

        // Reset timer during feedback
        setTimeLeft(5);
    };

    const handleNext = () => {
        setSelectedAnswer(null);
        setShowFeedback(false);
        setIsCorrect(false);

        const nextIndex = currentIndex + 1;
        const questionsPerSet = 20;

        if (nextIndex < questions.length) {
            // Check if it's the end of a set (and not the very end of all questions)
            if (nextIndex > 0 && nextIndex % questionsPerSet === 0) {
                setShowBreak(true);
                setCurrentSet(prev => prev + 1);
            } else {
                setCurrentIndex(nextIndex);
            }
        } else {
            // All questions completed
            const correctCount = results.filter(r => r.correct).length;
            const totalCount = results.length;
            const score = (correctCount / totalCount) * 100;

            const wrongWords = results
                .filter(r => !r.correct)
                .map(r => {
                    const originalQuestion = questions.find(q => q.id === r.questionId);
                    return {
                        front: originalQuestion?.front_text || 'N/A',
                        back: originalQuestion?.back_text || 'N/A',
                        correct: originalQuestion?.correctAnswer || 'N/A'
                    };
                });

            onComplete({
                correct: correctCount,
                total: totalCount,
                wrongWords,
                score,
                answers: results.map(r => ({ questionId: r.questionId, isCorrect: r.correct }))
            });
        }
    };

    const handleContinueAfterBreak = () => {
        setShowBreak(false);
        setCurrentIndex(prev => prev + 1); // Move to the first question of the next set
    };

    if (!currentQuestion) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#050505] text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    // Break Screen
    if (showBreak) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#050505] relative overflow-hidden font-sans">
                {/* Background Effects */}
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-md relative z-10"
                >
                    <Card className="border-white/10 bg-[#0a0a0b]/80 backdrop-blur-2xl shadow-2xl">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-[0_0_30px_-5px_rgba(147,51,234,0.5)]">
                                <Trophy className="h-10 w-10 text-white" />
                            </div>
                            <CardTitle className="text-3xl font-bold text-white mb-2">Set {currentSet} Completed! 🎯</CardTitle>
                            <p className="text-slate-400">Rest your eyes for a moment...</p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex justify-center items-end gap-2 my-4">
                                <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                                    {results.filter(r => r.correct).length}
                                </span>
                                <span className="text-lg text-slate-500 font-medium mb-2">/ {results.length} Correct</span>
                            </div>

                            <Button
                                onClick={handleContinueAfterBreak}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white h-14 text-xl font-bold rounded-xl shadow-lg shadow-purple-900/40 hover:shadow-purple-500/20 transition-all hover:scale-[1.02]"
                            >
                                Continue Next Set 🚀
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] p-4 font-sans relative overflow-hidden flex flex-col items-center justify-center">
            {/* Cosmic Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#050505] to-[#050505] pointer-events-none" />
            <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-full max-w-2xl space-y-6 relative z-10">
                {/* Header & Stats */}
                <div className="flex items-end justify-between px-2">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-purple-500/10 text-purple-300 border-purple-500/20 px-2.5 py-0.5 text-[10px] uppercase tracking-wider">
                                Final Exam
                            </Badge>
                            <span className="text-slate-500 text-xs font-medium">Set {currentSet}/{totalSets}</span>
                        </div>
                        <div className="text-slate-400 text-sm">
                            Question <span className="text-white font-bold text-lg">{currentIndex + 1}</span><span className="text-slate-600">/{questions.length}</span>
                        </div>
                    </div>

                    {/* Timer */}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border backdrop-blur-md transition-all duration-300 ${timeLeft <= 3 ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/10'}`}>
                        <Clock className={`h-4 w-4 ${timeLeft <= 3 ? 'text-red-400 animate-pulse' : 'text-blue-400'}`} />
                        <span className={`text-xl font-mono font-bold ${timeLeft <= 3 ? 'text-red-400' : 'text-white'}`}>
                            {timeLeft}s
                        </span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                    />
                </div>

                {/* Question Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="border-0 bg-transparent shadow-none">
                            <CardContent className="p-0 space-y-6">
                                {/* Question Text */}
                                <div className="min-h-[140px] flex flex-col items-center justify-center p-8 rounded-3xl bg-[#0a0a0b]/60 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
                                    <h2 className="text-center text-3xl md:text-4xl font-bold text-white leading-tight tracking-tight drop-shadow-lg break-words max-w-full mb-2">
                                        {currentQuestion.front_text}
                                    </h2>
                                    {currentQuestion.part_of_speech && (
                                        <span className="text-slate-500 text-lg italic font-medium bg-white/5 px-4 py-1 rounded-full border border-white/5">
                                            {currentQuestion.part_of_speech}
                                        </span>
                                    )}
                                </div>

                                {/* Options Grid */}
                                <div className="grid gap-3">
                                    {currentQuestion.options.map((option, idx) => {
                                        const isSelected = selectedAnswer === option;
                                        const isCorrectOption = option === currentQuestion.correctAnswer;

                                        // Dynamic Style Logic
                                        let containerStyle = "bg-[#0f0f10] border-white/5 hover:bg-white/5";
                                        let textStyle = "text-slate-300 group-hover:text-white";
                                        let ringStyle = "";

                                        if (showFeedback) {
                                            if (isCorrectOption) {
                                                containerStyle = "bg-green-500/10 border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.2)]";
                                                textStyle = "text-green-400 font-bold";
                                            } else if (isSelected) {
                                                containerStyle = "bg-red-500/10 border-red-500/50";
                                                textStyle = "text-red-400";
                                            } else {
                                                containerStyle = "bg-[#0f0f10]/50 border-white/5 opacity-50";
                                            }
                                        } else if (isSelected) {
                                            containerStyle = "bg-purple-600 border-purple-500 shadow-lg shadow-purple-600/20";
                                            textStyle = "text-white font-bold";
                                        }

                                        return (
                                            <motion.button
                                                key={idx}
                                                whileHover={!showFeedback ? { scale: 1.01, y: -2 } : {}}
                                                whileTap={!showFeedback ? { scale: 0.98 } : {}}
                                                onClick={() => handleAnswerSelect(option)}
                                                disabled={showFeedback}
                                                className={`group relative w-full p-4 md:p-5 rounded-2xl border-2 text-left transition-all duration-300 flex items-center gap-4 ${containerStyle}`}
                                            >
                                                {/* Choice Letter Bubble */}
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${showFeedback && isCorrectOption ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' :
                                                    showFeedback && isSelected ? 'bg-red-500 text-white' :
                                                        isSelected ? 'bg-white text-purple-600' :
                                                            'bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white'
                                                    }`}>
                                                    {String.fromCharCode(65 + idx)}
                                                </div>

                                                <span className={`text-lg md:text-xl flex-1 ${textStyle}`}>
                                                    {option}
                                                </span>

                                                {/* Status Icons */}
                                                {showFeedback && isCorrectOption && (
                                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                                        <CheckCircle2 className="h-6 w-6 text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                                                    </motion.div>
                                                )}
                                                {showFeedback && isSelected && !isCorrectOption && (
                                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                                        <XCircle className="h-6 w-6 text-red-500" />
                                                    </motion.div>
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </AnimatePresence>

                {/* Cancel/Exit */}
                <div className="flex justify-center">
                    <Button
                        variant="ghost"
                        onClick={onCancel}
                        className="text-slate-600 hover:text-slate-400 hover:bg-white/5 text-xs uppercase tracking-widest"
                    >
                        Quit Exam
                    </Button>
                </div>
            </div>
        </div>
    );
}
