import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Check, X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FlashcardData {
    id: string;
    front_text: string;
    back_text: string;
}

interface QuizGameComponentProps {
    flashcards: FlashcardData[];
    onComplete: (score: number, correctCount: number, totalCount: number) => void;
    isMultiplayer?: boolean;
}

export function QuizGameComponent({ flashcards, onComplete, isMultiplayer }: QuizGameComponentProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [options, setOptions] = useState<string[]>([]);
    const [timeLeft, setTimeLeft] = useState(10);

    const totalQuestions = Math.min(flashcards.length, 10);
    const currentCard = flashcards[currentIndex];

    // Generate options for current question
    useEffect(() => {
        if (!currentCard) return;

        const correctAnswer = currentCard.back_text;
        const wrongAnswers = flashcards
            .filter(f => f.id !== currentCard.id)
            .map(f => f.back_text)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        const allOptions = [...wrongAnswers, correctAnswer].sort(() => Math.random() - 0.5);
        setOptions(allOptions);
        setTimeLeft(10);
    }, [currentIndex, flashcards]);

    // Timer
    useEffect(() => {
        if (showResult) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleAnswer(null);
                    return 10;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [currentIndex, showResult]);

    const handleAnswer = (answer: string | null) => {
        if (showResult) return;

        setSelectedAnswer(answer);
        setShowResult(true);

        const isCorrect = answer === currentCard.back_text;
        if (isCorrect) {
            setScore(prev => prev + 100);
            setCorrectCount(prev => prev + 1);
        }

        setTimeout(() => {
            if (currentIndex < totalQuestions - 1) {
                setCurrentIndex(prev => prev + 1);
                setSelectedAnswer(null);
                setShowResult(false);
            } else {
                // Game complete
                const finalScore = isCorrect ? score + 100 : score;
                const finalCorrect = isCorrect ? correctCount + 1 : correctCount;
                onComplete(finalScore, finalCorrect, totalQuestions);
            }
        }, 1500);
    };

    if (!currentCard) {
        return <div className="text-white text-center">กำลังโหลด...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto py-8">
            {/* Progress */}
            <div className="mb-6">
                <div className="flex justify-between text-sm text-slate-400 mb-2">
                    <span>คำถาม {currentIndex + 1}/{totalQuestions}</span>
                    <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {timeLeft}s
                    </span>
                </div>
                <Progress value={(currentIndex / totalQuestions) * 100} className="h-2" />
            </div>

            {/* Timer bar */}
            <div className="mb-6 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-teal-400 to-cyan-400"
                    initial={{ width: '100%' }}
                    animate={{ width: `${(timeLeft / 10) * 100}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            {/* Question Card */}
            <Card className="bg-black/30 backdrop-blur-xl border-white/10 mb-6">
                <CardContent className="p-8">
                    <p className="text-center text-2xl font-bold text-white">
                        {currentCard.front_text}
                    </p>
                </CardContent>
            </Card>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3">
                <AnimatePresence mode="wait">
                    {options.map((option, index) => {
                        const isCorrect = option === currentCard.back_text;
                        const isSelected = selectedAnswer === option;

                        let bgClass = 'bg-white/10 border-white/20 hover:bg-white/20';
                        if (showResult) {
                            if (isCorrect) {
                                bgClass = 'bg-green-500/30 border-green-500';
                            } else if (isSelected && !isCorrect) {
                                bgClass = 'bg-red-500/30 border-red-500';
                            }
                        }

                        return (
                            <motion.button
                                key={option}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => handleAnswer(option)}
                                disabled={showResult}
                                className={`p-4 rounded-xl border-2 text-left font-medium text-white transition-all ${bgClass} disabled:cursor-not-allowed`}
                            >
                                <div className="flex items-center justify-between">
                                    <span>{option}</span>
                                    {showResult && isCorrect && (
                                        <Check className="w-5 h-5 text-green-400" />
                                    )}
                                    {showResult && isSelected && !isCorrect && (
                                        <X className="w-5 h-5 text-red-400" />
                                    )}
                                </div>
                            </motion.button>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Score */}
            <div className="mt-6 text-center">
                <p className="text-slate-400">
                    คะแนน: <span className="text-white font-bold">{score}</span>
                </p>
            </div>
        </div>
    );
}
