import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap, TrendingDown, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InterimTestQuestion {
    id: string;
    front_text: string;
    back_text: string;
    options: string[];
    correctAnswer: string;
    isWeak: boolean; // Track if this is a weak word
}

interface InterimTestProps {
    questions: InterimTestQuestion[];
    onComplete: (results: {
        correct: number;
        total: number;
        leechIds: string[]; // Cards that failed (need reset)
        bonusIds: string[]; // Cards that passed (get bonus)
    }) => void;
    onCancel: () => void;
    testNumber: number; // Which interim test (1, 2, 3, etc.)
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
    // Slice questions for the current set (1-based index converted to 0-based logic)
    const questionsInCurrentSet = questions.slice((currentSet - 1) * 20, currentSet * 20);
    const currentQuestion = questionsInCurrentSet[currentIndex];

    // Calculate global progress based on results count + current local index
    // Or simpler: (results.length / questions.length) * 100 ? 
    // Let's keep it consistent: local set progress or global? 
    // User wants "sets of 20", so progress bar could be for the current set or global.
    // Let's do Global Progress to keep context.
    const globalIndex = (currentSet - 1) * 20 + currentIndex;
    const progressPercent = ((globalIndex + 1) / questions.length) * 100;

    // Timer countdown
    useEffect(() => {
        if (isBreakTime || !currentQuestion) return;

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
    }, [currentIndex, isBreakTime]);

    const handleAnswerSelect = (answer: string) => {
        if (selectedAnswer) return;

        setSelectedAnswer(answer);

        const isCorrect = answer === currentQuestion.correctAnswer;
        setResults([...results, {
            questionId: currentQuestion.id,
            correct: isCorrect,
            isWeak: currentQuestion.isWeak
        }]);

        setTimeout(() => {
            handleNextQuestion(answer);
        }, 100);
    };

    const handleNextQuestion = (answer: string | null) => {
        // If timeout (answer is null), record as wrong
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
                finishTest();
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

    const finishTest = () => {
        const correctCount = results.filter(r => r.correct).length; // Note: results state might lag one cycle in strict mode, but here we append before calling function in handleAnswerSelect? No, we append to state. 
        // Actually, setResults is async. We should calculate based on prev state or pass the new result.
        // Wait, in handleAnswerSelect, I call setResults then setTimeout -> handleNextQuestion.
        // In handleNextQuestion, I check indices.
        // When finishTest is called, the LAST result is already in 'results' state from the previous render?
        // Let's be safe: we need to ensure the last result is included.
        // The 'results' array will update on next render. 
        // FIX: The current logic updates results state, triggers re-render. 
        // But handleNextQuestion is called inside setTimeout.
        // The 'results' variable in handleNextQuestion closure is the OLD one.
        // However, we are not using 'results' in handleNextQuestion logic, only for finishTest.
        // We should recalculate valid outcomes in finishTest using the latest state, but wait...
        // Actually, standard React pattern: we can't rely on 'results' being updated immediately in the same closure.
        // But since we use setTimeout(100ms), it's likely updated? No, closure captures the old scope.
        // We really should flush the last answer to the onComplete directly if it's the very last question.
        // OR better: rely on the fact that we push to state.

        // Let's refine: The `results` used in `finishTest` will be stale if called directly from the event handler closure of the last question.
        // BUT, `handleNextQuestion` is called 100ms later. It is possible the state has updated? 
        // No, `handleNextQuestion` is defined in the render scope. If it's called from a timeout set in a PREVIOUS render, it captures the scope of THAT previous render.
        // This is a common bug.
        // CORRECTION: use a ref for results or pass the complete list to finishTest.
        // For now, I'll trust the existing pattern used in `PreTestComponent` which seemed to work, 
        // but to be safe, I'll use a functional state update or `useEffect` for completion?
        // Actually, let's keep it simple: `results` is state. 
        // If I answer last question -> setResults -> setTimeout -> handleNextQuestion.
        // The handleNextQuestion captured in the timeout IS stale.
        // So `finishTest` will use stale `results`.
        // To fix this without refactoring everything: I will assume the `PreTest` works because of lucky timing or I missed something. 
        // Ah, `PreTest` was written by me? 
        // Wait, looking at PreTest code: `setResults([...results, newResult])`.
        // The easy fix is to pass the latest result accumulator to `finishTest` or use a `useEffect` to trigger finish.
        // But to avoid complex refactoring now, I will add the logic to calculate final metrics *including* the last answer if needed?
        // Actually, simplest fix: Use a `useEffect` to watch for `results.length` vs `questions.length`.

    };

    // Use Effect to trigger completion when all questions answered
    useEffect(() => {
        if (results.length > 0 && results.length === questions.length) {
            // Calculate completions
            const correctCount = results.filter(r => r.correct).length;
            const leechIds = results.filter(r => !r.correct).map(r => r.questionId);
            const bonusIds = results.filter(r => r.correct).map(r => r.questionId);
            onComplete({ correct: correctCount, total: results.length, leechIds, bonusIds });
        }
    }, [results, questions.length]);

    // Remove direct call to finishTest from handleNext logic for the very last item, 
    // OR just handle the index movement.
    // If we just rely on useEffect, we don't need finishTest() call in handleNextQuestion for the last item.
    // We just stop.

    /* 
       Refined Logic for 'handleNextQuestion':
       If finished current set, and it's NOT the last set -> Break.
       If finished current set, and it IS the last set -> Do nothing (useEffect will handle completion).
    */

    if (!currentQuestion && !isBreakTime && results.length !== questions.length) {
        return <div className="p-6 text-center text-white">Loading...</div>;
    }

    // Break Screen
    if (isBreakTime) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-950 p-6">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-md"
                >
                    <Card className="border-2 border-orange-500/30 bg-slate-900/95 backdrop-blur-xl shadow-2xl">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30">
                                <Zap className="h-8 w-8 text-white" />
                            </div>
                            <CardTitle className="text-2xl text-white">Set {currentSet} Completed! 🏁</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-center text-slate-300">
                                You've finished {currentSet * 20} questions. <br />
                                {totalSets - currentSet} sets remaining.
                            </p>
                            <Button
                                onClick={handleContinueAfterBreak}
                                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold h-12 shadow-lg shadow-orange-500/30"
                            >
                                Continue to Set {currentSet + 1}
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    if (results.length === questions.length) {
        return <div className="flex items-center justify-center min-h-screen"><p className="text-white">Processing Results...</p></div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 p-6">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2 dark:text-white">
                            <Zap className="h-6 w-6 text-orange-600" />
                            Interim Test #{testNumber}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs px-2 py-1 rounded-md border border-orange-200 dark:border-orange-800 font-medium">
                                Set {currentSet} of {totalSets}
                            </span>
                            <span className="text-slate-400 text-sm">•</span>
                            <span className="text-muted-foreground text-sm">
                                Question {(currentIndex) + 1}/{questionsInCurrentSet.length}
                            </span>
                        </div>
                    </div>
                    <Button variant="ghost" onClick={onCancel}>
                        Exit
                    </Button>
                </div>

                {/* Progress Bar */}
                <Card>
                    <CardContent className="p-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total Progress</span>
                                <span className="font-medium">{Math.round(progressPercent)}%</span>
                            </div>
                            <Progress value={progressPercent} className="h-2" />
                        </div>
                    </CardContent>
                </Card>

                {/* Timer */}
                <Card className="border-2 border-orange-200 dark:border-orange-800">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-center gap-2">
                            <Clock className={`h-5 w-5 ${timeLeft <= 2 ? 'text-red-600 animate-pulse' : 'text-orange-600'}`} />
                            <span className={`text-2xl font-bold ${timeLeft <= 2 ? 'text-red-600' : 'text-orange-600'}`}>
                                {timeLeft}s
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Word Type Badge */}
                {currentQuestion.isWeak && (
                    <Badge variant="destructive" className="w-full justify-center py-2">
                        <TrendingDown className="h-4 w-4 mr-2" />
                        Weak Word - Extra Focus Needed
                    </Badge>
                )}

                {/* Question Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={globalIndex}
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Card className="border-2 border-orange-200 dark:border-orange-800">
                            <CardHeader>
                                <CardTitle className="text-center text-xl">
                                    {currentQuestion.front_text}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {currentQuestion.options.map((option, idx) => (
                                    <Button
                                        key={idx}
                                        onClick={() => handleAnswerSelect(option)}
                                        disabled={selectedAnswer !== null}
                                        variant={selectedAnswer === option ? 'default' : 'outline'}
                                        className={`w-full h-auto py-4 text-left justify-start ${selectedAnswer === option
                                            ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                            : ''
                                            }`}
                                    >
                                        <span className="mr-3 flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-semibold text-gray-700 dark:text-gray-300">
                                            {String.fromCharCode(65 + idx)}
                                        </span>
                                        <span className="flex-1">{option}</span>
                                    </Button>
                                ))}
                            </CardContent>
                        </Card>
                    </motion.div>
                </AnimatePresence>

                {/* Info Note */}
                <Card className="bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Award className="h-4 w-4 text-orange-600" />
                            <div>
                                <p className="font-medium">Bonus Mode Active</p>
                                <p className="text-xs">Correct = Bonus SRS Point • Wrong = Leech Detection (Reset to Stage 0)</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
