import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, Clock, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface FlashcardData {
    id: string;
    front_text: string;
    back_text: string;
}

interface ListenChooseComponentProps {
    flashcards: FlashcardData[];
    onComplete: (score: number, correctCount: number, totalCount: number) => void;
    isMultiplayer?: boolean;
}

export function ListenChooseComponent({ flashcards, onComplete, isMultiplayer }: ListenChooseComponentProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [options, setOptions] = useState<string[]>([]);
    const [hasPlayed, setHasPlayed] = useState(false);

    const totalQuestions = Math.min(flashcards.length, 10);
    const currentCard = flashcards[currentIndex];

    // Generate options
    useEffect(() => {
        if (!currentCard) return;

        const correctAnswer = currentCard.front_text;
        const wrongAnswers = flashcards
            .filter(f => f.id !== currentCard.id)
            .map(f => f.front_text)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        setOptions([...wrongAnswers, correctAnswer].sort(() => Math.random() - 0.5));
        setHasPlayed(false);
    }, [currentIndex, flashcards]);

    const playAudio = () => {
        if (!currentCard) return;

        const utterance = new SpeechSynthesisUtterance(currentCard.back_text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
        setHasPlayed(true);
    };

    const handleAnswer = (answer: string) => {
        if (showResult) return;

        setSelectedAnswer(answer);
        setShowResult(true);

        const isCorrect = answer === currentCard.front_text;
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
        <div className="max-w-xl mx-auto py-8">
            {/* Progress */}
            <div className="mb-6">
                <div className="flex justify-between text-sm text-slate-400 mb-2">
                    <span>คำถาม {currentIndex + 1}/{totalQuestions}</span>
                    <span>คะแนน: {score}</span>
                </div>
                <Progress value={(currentIndex / totalQuestions) * 100} className="h-2" />
            </div>

            {/* Audio Player */}
            <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-6 text-center">
                <p className="text-slate-400 text-sm mb-4">ฟังเสียงแล้วเลือกคำที่ถูกต้อง</p>
                <motion.button
                    onClick={playAudio}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto transition-all ${hasPlayed
                            ? 'bg-purple-500/30 border-2 border-purple-500'
                            : 'bg-gradient-to-br from-purple-500 to-pink-500'
                        }`}
                >
                    <Volume2 className="w-10 h-10 text-white" />
                </motion.button>
                <p className="text-slate-400 text-sm mt-4">
                    {hasPlayed ? 'กดอีกครั้งเพื่อฟังซ้ำ' : 'กดเพื่อฟังเสียง'}
                </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3">
                {options.map((option, index) => {
                    const isCorrect = option === currentCard.front_text;
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
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => handleAnswer(option)}
                            disabled={showResult || !hasPlayed}
                            className={`p-4 rounded-xl border-2 text-left font-medium text-white transition-all ${bgClass} disabled:opacity-50`}
                        >
                            <div className="flex items-center justify-between">
                                <span>{option}</span>
                                {showResult && isCorrect && (
                                    <Check className="w-5 h-5 text-green-400" />
                                )}
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
