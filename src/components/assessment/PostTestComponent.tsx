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
    const [timeLeft, setTimeLeft] = useState(10); // 10 seconds for final test

    // Pagination / Set Logic
    const [currentSet, setCurrentSet] = useState(1);
    const totalSets = Math.ceil(questions.length / 20);

    const currentQuestion = questions[currentIndex];
    const progressPercent = ((currentIndex + 1) / questions.length) * 100;

    // Timer countdown
    useEffect(() => {
        if (!currentQuestion || showFeedback || showBreak) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleTimeout();
                    return 10;
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
        setTimeLeft(10);
    };

    const handleNext = () => {
        setShowFeedback(false);
        setSelectedAnswer(null);

        // Check for break after every 20 questions
        if ((currentIndex + 1) % 20 === 0 && currentIndex + 1 < questions.length) {
            setShowBreak(true);
        } else if (currentIndex + 1 >= questions.length) {
            finishTest();
        } else {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handleContinueAfterBreak = () => {
        setShowBreak(false);
        setCurrentSet(currentSet + 1);
        setCurrentIndex(currentIndex + 1);
    };

    const finishTest = () => {
        const correctCount = results.filter(r => r.correct).length;
        const score = Math.round((correctCount / results.length) * 100);

        const wrongWords = results
            .filter(r => !r.correct)
            .map(r => {
                const q = questions.find(q => q.id === r.questionId);
                return {
                    front: q?.front_text || '',
                    back: r.userAnswer,
                    correct: q?.back_text || ''
                };
            });

        onComplete({
            correct: correctCount,
            total: results.length,
            wrongWords,
            score
        });
    };

    if (!currentQuestion) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6">
                        <p className="text-center text-muted-foreground">Loading questions...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Break Screen
    if (showBreak) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-md"
                >
                    <Card className="border-2 border-purple-200 dark:border-purple-800">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30">
                                <Trophy className="h-8 w-8 text-white" />
                            </div>
                            <CardTitle className="text-2xl">Set {currentSet} Completed! 🎯</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-center text-muted-foreground">
                                You've completed {currentIndex + 1} questions.
                            </p>
                            <p className="text-center">
                                <span className="text-3xl font-bold text-purple-600">
                                    {results.filter(r => r.correct).length}
                                </span>
                                <span className="text-muted-foreground"> / {results.length} correct so far</span>
                            </p>
                            <Button
                                onClick={handleContinueAfterBreak}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 h-12 text-lg font-bold"
                            >
                                Continue to Set {currentSet + 1}
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-6">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Trophy className="h-6 w-6 text-purple-600" />
                            Post-test - Final Exam
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs px-2 py-1 rounded-md border border-purple-200 dark:border-purple-800 font-medium">
                                Set {currentSet} of {totalSets}
                            </span>
                            <span className="text-slate-400 text-sm">•</span>
                            <span className="text-sm text-muted-foreground">
                                Question {currentIndex + 1}/{questions.length}
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
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-medium">{Math.round(progressPercent)}%</span>
                            </div>
                            <Progress value={progressPercent} className="h-2" />
                        </div>
                    </CardContent>
                </Card>

                {/* Timer */}
                <Card className="border-2 border-purple-200 dark:border-purple-800">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-center gap-2">
                            <Clock className={`h-5 w-5 ${timeLeft <= 3 ? 'text-red-600 animate-pulse' : 'text-purple-600'}`} />
                            <span className={`text-2xl font-bold ${timeLeft <= 3 ? 'text-red-600' : 'text-purple-600'}`}>
                                {timeLeft}s
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Question Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Card className="border-2 border-purple-200 dark:border-purple-800">
                            <CardHeader>
                                <CardTitle className="text-center text-xl">
                                    {currentQuestion.front_text}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {currentQuestion.options.map((option, idx) => {
                                    const isSelected = selectedAnswer === option;
                                    const isCorrectOption = option === currentQuestion.correctAnswer;

                                    let buttonClass = '';
                                    if (showFeedback) {
                                        if (isCorrectOption) {
                                            buttonClass = 'bg-green-600 hover:bg-green-700 border-green-600';
                                        } else if (isSelected) {
                                            buttonClass = 'bg-red-600 hover:bg-red-700 border-red-600';
                                        }
                                    } else if (isSelected) {
                                        buttonClass = 'bg-purple-600 hover:bg-purple-700';
                                    }

                                    return (
                                        <Button
                                            key={idx}
                                            onClick={() => handleAnswerSelect(option)}
                                            disabled={showFeedback}
                                            variant="outline"
                                            className={`w-full h-auto py-4 text-left justify-start ${buttonClass}`}
                                        >
                                            <span className="mr-3 flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-semibold">
                                                {String.fromCharCode(65 + idx)}
                                            </span>
                                            <span className="flex-1">{option}</span>
                                            {showFeedback && isCorrectOption && (
                                                <CheckCircle2 className="h-5 w-5 text-white ml-2" />
                                            )}
                                            {showFeedback && isSelected && !isCorrectOption && (
                                                <XCircle className="h-5 w-5 text-white ml-2" />
                                            )}
                                        </Button>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </motion.div>
                </AnimatePresence>

                {/* Feedback & Next Button */}
                {showFeedback && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                    >
                        <Card className={isCorrect ? 'bg-green-50 dark:bg-green-950 border-green-200' : 'bg-red-50 dark:bg-red-950 border-red-200'}>
                            <CardContent className="p-4 text-center">
                                <div className="flex items-center justify-center gap-2 mb-3">
                                    {isCorrect ? (
                                        <>
                                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                                            <span className="text-lg font-bold text-green-700 dark:text-green-300">Correct!</span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-6 w-6 text-red-600" />
                                            <span className="text-lg font-bold text-red-700 dark:text-red-300">Wrong</span>
                                        </>
                                    )}
                                </div>
                                <Button
                                    onClick={handleNext}
                                    className="w-full"
                                    size="lg"
                                >
                                    Next Question
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Info Note */}
                <Card className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
                    <CardContent className="p-4">
                        <p className="text-sm text-center text-muted-foreground">
                            💡 Instant Feedback Mode - See results immediately after each answer
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
