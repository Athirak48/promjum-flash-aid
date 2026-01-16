import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PreTestQuestion {
    id: string;
    front_text: string;
    back_text: string;
    options: string[];
    correctAnswer: string;
}

interface PreTestProps {
    questions: PreTestQuestion[];
    onComplete: (results: { correct: number; total: number; wrongIds: string[] }) => void;
    onCancel: () => void;
}

export default function PreTestComponent({ questions, onComplete, onCancel }: PreTestProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [results, setResults] = useState<{ questionId: string; correct: boolean }[]>([]);
    const [timeLeft, setTimeLeft] = useState(5);
    const [isBreakTime, setIsBreakTime] = useState(false);
    const [currentSet, setCurrentSet] = useState(1);

    const totalSets = Math.ceil(questions.length / 20);
    const questionsInCurrentSet = questions.slice((currentSet - 1) * 20, currentSet * 20);
    const currentQuestion = questionsInCurrentSet[currentIndex % 20];
    const progressPercent = ((currentIndex + 1) / questionsInCurrentSet.length) * 100;

    // Timer countdown
    useEffect(() => {
        if (isBreakTime || !currentQuestion) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    // Auto-move to next if time runs out
                    handleNextQuestion(null);
                    return 5;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [currentIndex, isBreakTime]);

    const handleAnswerSelect = (answer: string) => {
        if (selectedAnswer) return; // Already answered

        setSelectedAnswer(answer);

        // Auto-advance immediately (no feedback delay)
        setTimeout(() => {
            handleNextQuestion(answer);
        }, 100);
    };

    const handleNextQuestion = (answer: string | null) => {
        // Calculate result for current question immediately
        const isCorrect = answer === null ? false : (answer === currentQuestion.correctAnswer);
        const newResult = {
            questionId: currentQuestion.id,
            correct: isCorrect
        };
        const updatedResults = [...results, newResult];

        // Update state
        setResults(updatedResults);

        setSelectedAnswer(null);
        setTimeLeft(5);

        // Check if we finished current set
        if (currentIndex + 1 >= questionsInCurrentSet.length) {
            if (currentSet < totalSets) {
                // Show break screen
                setIsBreakTime(true);
            } else {
                // Finished all sets
                finishTest(updatedResults);
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

    const finishTest = (finalResults?: typeof results) => {
        const useResults = finalResults || results;
        const correctCount = useResults.filter(r => r.correct).length;
        const wrongIds = useResults.filter(r => !r.correct).map(r => r.questionId);

        onComplete({
            correct: correctCount,
            total: useResults.length,
            wrongIds
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
    if (isBreakTime) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-950 p-6">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-md"
                >
                    <Card className="border-2 border-purple-500/30 bg-slate-900/95 backdrop-blur-xl shadow-2xl">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30">
                                <AlertCircle className="h-8 w-8 text-white" />
                            </div>
                            <CardTitle className="text-2xl text-white">Take a Break! 🎯</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-center text-slate-300">
                                You've completed Set {currentSet} of {totalSets}
                            </p>
                            <Button
                                onClick={handleContinueAfterBreak}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold h-12 shadow-lg shadow-purple-500/30"
                            >
                                Continue to Set {currentSet + 1}
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    // Main Quiz Screen
    return (
        <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center">
            <div className="w-full max-w-3xl space-y-6 relative">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Pre-test</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="bg-blue-500/10 text-blue-400 text-xs px-2 py-1 rounded-md border border-blue-500/20 font-medium">
                                Set {currentSet} of {totalSets}
                            </span>
                            <span className="text-slate-400 text-sm">•</span>
                            <span className="text-slate-300 text-sm font-medium">
                                Question {(currentIndex % 20) + 1}/20
                            </span>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={onCancel}
                        className="text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                        Exit
                    </Button>
                </div>

                {/* Progress Bar & Timer Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="md:col-span-3 border-none bg-slate-900/50">
                        <CardContent className="p-4 flex flex-col justify-center h-full">
                            <div className="flex justify-between text-xs mb-2">
                                <span className="text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded">Progress</span>
                                <span className="font-bold text-white">{Math.round(progressPercent)}%</span>
                            </div>
                            <Progress value={progressPercent} className="h-3 bg-slate-800 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-cyan-400" />
                        </CardContent>
                    </Card>

                    <Card className="border border-orange-500/30 bg-orange-950/20 shadow-[0_0_15px_-3px_rgba(249,115,22,0.3)]">
                        <CardContent className="p-4 flex items-center justify-center h-full">
                            <div className="flex items-center gap-2">
                                <Clock className={`h-5 w-5 ${timeLeft <= 1 ? 'text-red-500 animate-pulse' : 'text-orange-500'}`} />
                                <span className={`text-2xl font-black ${timeLeft <= 1 ? 'text-red-500' : 'text-orange-400'}`}>
                                    {timeLeft}s
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Question Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -50, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                    >
                        <Card className="border-0 bg-slate-900 shadow-2xl overflow-hidden relative">
                            {/* Top decorative line */}
                            <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

                            <CardHeader className="pb-2 pt-8">
                                <CardTitle className="text-center">
                                    <span className="inline-block bg-blue-600 text-white px-4 py-1 rounded-lg text-2xl font-bold shadow-lg shadow-blue-500/30">
                                        {currentQuestion.front_text}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 p-6 pt-4">
                                {currentQuestion.options.map((option, idx) => (
                                    <Button
                                        key={idx}
                                        onClick={() => handleAnswerSelect(option)}
                                        disabled={selectedAnswer !== null}
                                        className={`w-full h-auto py-5 text-left justify-start relative overflow-hidden transition-all duration-200 group border-2 ${selectedAnswer === option
                                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/40 opacity-100 ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900'
                                            : 'bg-slate-950 border-slate-800 text-slate-200 hover:bg-slate-800 hover:border-slate-700 hover:text-white'
                                            }`}
                                    >
                                        <div className={`mr-4 flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg transition-colors ${selectedAnswer === option
                                            ? 'bg-white/20 text-white'
                                            : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white'
                                            }`}>
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <span className="flex-1 text-lg font-medium">{option}</span>
                                    </Button>
                                ))}
                            </CardContent>
                        </Card>
                    </motion.div>
                </AnimatePresence>

            </div>

            {/* Mascot Helper */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="fixed bottom-6 right-6 flex flex-col items-end pointer-events-none"
            >
                <div className="bg-gradient-to-br from-pink-600 to-purple-600 text-white px-4 py-2 rounded-2xl rounded-br-none shadow-lg mb-2 max-w-[200px] text-xs font-medium text-center animate-bounce">
                    มีอะไรจะบอกไหมครับ? 💭
                </div>

                {/* Note: In a real app, replace with actual mascot image */}
                <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden shadow-xl">
                    <span className="text-3xl">🐵</span>
                </div>
            </motion.div>
        </div>
    );
}
