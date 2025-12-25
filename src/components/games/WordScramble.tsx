import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RotateCcw, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FlashcardData {
    id: string;
    front_text: string;
    back_text: string;
}

interface WordScrambleComponentProps {
    flashcards: FlashcardData[];
    onComplete: (score: number, correctCount: number, totalCount: number) => void;
    isMultiplayer?: boolean;
}

export function WordScrambleComponent({ flashcards, onComplete, isMultiplayer }: WordScrambleComponentProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [scrambledLetters, setScrambledLetters] = useState<string[]>([]);
    const [answer, setAnswer] = useState<string[]>([]);
    const [hints, setHints] = useState<number[]>([]);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    const totalQuestions = Math.min(flashcards.length, 8);
    const currentCard = flashcards[currentIndex];

    // Scramble word
    const scrambleWord = useCallback((word: string) => {
        const letters = word.split('');
        for (let i = letters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [letters[i], letters[j]] = [letters[j], letters[i]];
        }
        return letters;
    }, []);

    // Initialize current word
    useEffect(() => {
        if (!currentCard) return;
        const word = currentCard.back_text.toUpperCase();
        setScrambledLetters(scrambleWord(word));
        setAnswer([]);
        setHints([]);
        setShowResult(false);
    }, [currentIndex, currentCard, scrambleWord]);

    const handleLetterClick = (letter: string, index: number) => {
        if (showResult) return;

        // Add to answer
        const newAnswer = [...answer, letter];
        setAnswer(newAnswer);

        // Remove from scrambled
        const newScrambled = [...scrambledLetters];
        newScrambled.splice(index, 1);
        setScrambledLetters(newScrambled);

        // Check if complete
        const correctWord = currentCard.back_text.toUpperCase();
        if (newAnswer.length === correctWord.length) {
            const userAnswer = newAnswer.join('');
            const correct = userAnswer === correctWord;

            setIsCorrect(correct);
            setShowResult(true);

            if (correct) {
                const bonus = Math.max(0, 100 - hints.length * 20);
                setScore(prev => prev + bonus);
                setCorrectCount(prev => prev + 1);
            }

            setTimeout(() => {
                if (currentIndex < totalQuestions - 1) {
                    setCurrentIndex(prev => prev + 1);
                } else {
                    const finalScore = correct ? score + Math.max(0, 100 - hints.length * 20) : score;
                    const finalCorrect = correct ? correctCount + 1 : correctCount;
                    onComplete(finalScore, finalCorrect, totalQuestions);
                }
            }, 1500);
        }
    };

    const handleAnswerClick = (index: number) => {
        if (showResult || hints.includes(index)) return;

        const letter = answer[index];

        // Remove from answer
        const newAnswer = [...answer];
        newAnswer.splice(index, 1);
        setAnswer(newAnswer);

        // Add back to scrambled
        setScrambledLetters(prev => [...prev, letter]);
    };

    const handleHint = () => {
        const correctWord = currentCard.back_text.toUpperCase();
        const nextHintIndex = answer.length;

        if (nextHintIndex < correctWord.length) {
            const neededLetter = correctWord[nextHintIndex];
            const letterIndex = scrambledLetters.indexOf(neededLetter);

            if (letterIndex !== -1) {
                const newAnswer = [...answer, neededLetter];
                setAnswer(newAnswer);
                setHints(prev => [...prev, nextHintIndex]);

                const newScrambled = [...scrambledLetters];
                newScrambled.splice(letterIndex, 1);
                setScrambledLetters(newScrambled);
            }
        }
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
            <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6 text-center">
                <p className="text-slate-400 text-sm mb-2">เรียงตัวอักษรให้ถูกต้อง</p>
                <p className="text-2xl font-bold text-white">{currentCard.front_text}</p>
            </div>

            {/* Answer Slots */}
            <div className="flex flex-wrap justify-center gap-2 mb-6 min-h-[60px]">
                <AnimatePresence>
                    {Array(currentCard.back_text.length).fill(null).map((_, i) => (
                        <motion.button
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`w-10 h-12 rounded-lg flex items-center justify-center text-xl font-bold border-2 transition-all ${answer[i]
                                    ? showResult
                                        ? isCorrect
                                            ? 'bg-green-500/30 border-green-500 text-green-300'
                                            : 'bg-red-500/30 border-red-500 text-red-300'
                                        : hints.includes(i)
                                            ? 'bg-yellow-500/30 border-yellow-500 text-yellow-300'
                                            : 'bg-purple-500/30 border-purple-500 text-white'
                                    : 'bg-white/5 border-dashed border-white/30 text-white/30'
                                }`}
                            onClick={() => handleAnswerClick(i)}
                            disabled={showResult || hints.includes(i)}
                        >
                            {answer[i] || '_'}
                        </motion.button>
                    ))}
                </AnimatePresence>
            </div>

            {/* Scrambled Letters */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
                <AnimatePresence>
                    {scrambledLetters.map((letter, i) => (
                        <motion.button
                            key={`${letter}-${i}`}
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleLetterClick(letter, i)}
                            disabled={showResult}
                            className="w-12 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl font-bold text-white shadow-lg hover:shadow-purple-500/50 transition-all"
                        >
                            {letter}
                        </motion.button>
                    ))}
                </AnimatePresence>
            </div>

            {/* Hint Button */}
            {!showResult && (
                <div className="text-center">
                    <Button
                        variant="ghost"
                        onClick={handleHint}
                        className="text-yellow-400 hover:text-yellow-300"
                    >
                        <Lightbulb className="w-4 h-4 mr-2" />
                        ขอคำใบ้ (-20 pts)
                    </Button>
                </div>
            )}
        </div>
    );
}
