import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, X, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FlashcardData {
    id: string;
    front_text: string;
    back_text: string;
}

interface VocabBlinderComponentProps {
    flashcards: FlashcardData[];
    onComplete: (score: number, correctCount: number, totalCount: number) => void;
    isMultiplayer?: boolean;
}

export function VocabBlinderComponent({ flashcards, onComplete, isMultiplayer }: VocabBlinderComponentProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [revealedChars, setRevealedChars] = useState(0);

    const totalQuestions = Math.min(flashcards.length, 10);
    const currentCard = flashcards[currentIndex];

    // Reset on new question
    useEffect(() => {
        setUserInput('');
        setShowResult(false);
        setShowHint(false);
        setRevealedChars(0);
    }, [currentIndex]);

    const getDisplayWord = () => {
        if (!currentCard) return '';
        const word = currentCard.back_text;

        if (showHint || showResult) {
            return word.split('').map((char, i) => {
                if (char === ' ') return ' ';
                return i < revealedChars || showResult ? char : '●';
            }).join('');
        }

        // Return bullets but preserve spaces
        return word.split('').map(char => char === ' ' ? ' ' : '●').join('');
    };

    const handleReveal = () => {
        if (!currentCard) return;
        const word = currentCard.back_text;

        if (revealedChars < word.length) {
            setRevealedChars(prev => prev + 1);
            setShowHint(true);
        }
    };

    const handleSubmit = () => {
        if (!currentCard || showResult) return;

        const correct = userInput.toLowerCase().trim() === currentCard.back_text.toLowerCase().trim();
        setIsCorrect(correct);
        setShowResult(true);

        if (correct) {
            const bonus = Math.max(0, 100 - revealedChars * 15);
            setScore(prev => prev + bonus);
            setCorrectCount(prev => prev + 1);
        }

        setTimeout(() => {
            if (currentIndex < totalQuestions - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                const finalScore = correct ? score + Math.max(0, 100 - revealedChars * 15) : score;
                const finalCorrect = correct ? correctCount + 1 : correctCount;
                onComplete(finalScore, finalCorrect, totalQuestions);
            }
        }, 2000);
    };

    if (!currentCard) {
        return <div className="text-white text-center">กำลังโหลด...</div>;
    }

    return (
        <div className="max-w-xl mx-auto py-8">
            {/* Progress */}
            <div className="mb-6">
                <div className="flex justify-between text-sm text-slate-400 mb-2">
                    <span>คำที่ {currentIndex + 1}/{totalQuestions}</span>
                    <span>คะแนน: {score}</span>
                </div>
                <Progress value={(currentIndex / totalQuestions) * 100} className="h-2" />
            </div>

            {/* Question */}
            <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-4">
                <p className="text-slate-400 text-sm mb-2 text-center">พิมพ์คำศัพท์จากความหมาย</p>
                <p className="text-xl font-bold text-white text-center">{currentCard.front_text}</p>
            </div>

            {/* Blinded Word */}
            <div className="bg-white/5 rounded-2xl p-6 mb-4 text-center">
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                    {getDisplayWord().split(' ').map((wordPart, wordIndex) => (
                        <div key={wordIndex} className="flex whitespace-nowrap">
                            {wordPart.split('').map((char, charIndex) => (
                                <span
                                    key={charIndex}
                                    className="inline-block text-3xl sm:text-4xl md:text-5xl font-mono font-bold tracking-widest transition-all duration-300 text-purple-400"
                                >
                                    {char}
                                </span>
                            ))}
                        </div>
                    ))}
                </div>
                <p className="text-sm text-slate-400 mt-4">
                    {currentCard.back_text.length} ตัวอักษร
                </p>
            </div>

            {/* Reveal Hint Button */}
            <div className="flex justify-center mb-4">
                <Button
                    variant="ghost"
                    onClick={handleReveal}
                    disabled={revealedChars >= currentCard.back_text.length || showResult}
                    className="text-yellow-400 hover:text-yellow-300"
                >
                    {showHint ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                    เปิดตัวอักษร ({revealedChars}/{currentCard.back_text.length})
                </Button>
            </div>

            {/* Input */}
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    disabled={showResult}
                    placeholder="พิมพ์คำตอบ..."
                    className="flex-1 h-12 px-4 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder:text-slate-400 focus:border-purple-500 focus:outline-none"
                />
                <Button
                    onClick={handleSubmit}
                    disabled={!userInput.trim() || showResult}
                    className="h-12 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl"
                >
                    ตอบ
                </Button>
            </div>

            {/* Result */}
            <AnimatePresence>
                {showResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl text-center ${isCorrect ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'
                            }`}
                    >
                        {isCorrect ? (
                            <div className="text-green-400">
                                <Check className="w-8 h-8 mx-auto mb-2" />
                                <p className="font-bold">ถูกต้อง!</p>
                            </div>
                        ) : (
                            <div className="text-red-400">
                                <X className="w-8 h-8 mx-auto mb-2" />
                                <p className="font-bold">คำตอบที่ถูกต้อง: {currentCard.back_text}</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
