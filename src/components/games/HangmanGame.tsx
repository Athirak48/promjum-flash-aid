import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

interface FlashcardData {
    id: string;
    front_text: string;
    back_text: string;
}

interface HangmanComponentProps {
    flashcards: FlashcardData[];
    onComplete: (score: number, correctCount: number, totalCount: number) => void;
    isMultiplayer?: boolean;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const MAX_WRONG = 6;

export function HangmanComponent({ flashcards, onComplete, isMultiplayer }: HangmanComponentProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
    const [wrongCount, setWrongCount] = useState(0);
    const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');

    const totalWords = Math.min(flashcards.length, 6);
    const currentCard = flashcards[currentIndex];
    const word = currentCard?.back_text.toUpperCase() || '';

    // Reset for new word
    useEffect(() => {
        setGuessedLetters(new Set());
        setWrongCount(0);
        setGameStatus('playing');
    }, [currentIndex]);

    // Check win condition
    useEffect(() => {
        if (!word) return;

        const wordLetters = new Set(word.replace(/[^A-Z]/g, '').split(''));
        const found = [...wordLetters].every(letter => guessedLetters.has(letter));

        if (found && guessedLetters.size > 0) {
            setGameStatus('won');
            const bonus = Math.max(0, 100 - wrongCount * 15);
            setScore(prev => prev + bonus);
            setCorrectCount(prev => prev + 1);

            setTimeout(nextWord, 2000);
        }
    }, [guessedLetters, word]);

    // Check lose condition
    useEffect(() => {
        if (wrongCount >= MAX_WRONG) {
            setGameStatus('lost');
            setTimeout(nextWord, 2000);
        }
    }, [wrongCount]);

    const nextWord = () => {
        if (currentIndex < totalWords - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onComplete(score, correctCount, totalWords);
        }
    };

    const handleGuess = (letter: string) => {
        if (gameStatus !== 'playing' || guessedLetters.has(letter)) return;

        const newGuessed = new Set(guessedLetters);
        newGuessed.add(letter);
        setGuessedLetters(newGuessed);

        if (!word.includes(letter)) {
            setWrongCount(prev => prev + 1);
        }
    };

    const displayWord = word.split('').map(char => {
        if (char === ' ') return ' ';
        if (!/[A-Z]/.test(char)) return char;
        return guessedLetters.has(char) || gameStatus === 'lost' ? char : '_';
    });

    if (!currentCard) {
        return <div className="text-white text-center">กำลังโหลด...</div>;
    }

    return (
        <div className="max-w-xl mx-auto py-8">
            {/* Progress */}
            <div className="mb-6">
                <div className="flex justify-between text-sm text-slate-400 mb-2">
                    <span>คำที่ {currentIndex + 1}/{totalWords}</span>
                    <span>คะแนน: {score}</span>
                </div>
                <Progress value={(currentIndex / totalWords) * 100} className="h-2" />
            </div>

            {/* Hangman Visual */}
            <div className="flex justify-center mb-6">
                <div className="relative w-32 h-40">
                    {/* Gallows */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-white/30" />
                    <div className="absolute bottom-0 left-8 w-1 h-full bg-white/30" />
                    <div className="absolute top-0 left-8 w-16 h-1 bg-white/30" />
                    <div className="absolute top-0 right-8 w-1 h-4 bg-white/30" />

                    {/* Body parts */}
                    {wrongCount >= 1 && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full border-2 border-white" />
                    )}
                    {wrongCount >= 2 && (
                        <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                            className="absolute top-12 right-7 w-1 h-10 bg-white origin-top" />
                    )}
                    {wrongCount >= 3 && (
                        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                            className="absolute top-14 right-7 w-6 h-1 bg-white origin-right rotate-45" />
                    )}
                    {wrongCount >= 4 && (
                        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                            className="absolute top-14 right-3 w-6 h-1 bg-white origin-left -rotate-45" />
                    )}
                    {wrongCount >= 5 && (
                        <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                            className="absolute top-[88px] right-7 w-6 h-1 bg-white origin-top rotate-[30deg]" />
                    )}
                    {wrongCount >= 6 && (
                        <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                            className="absolute top-[88px] right-3 w-6 h-1 bg-white origin-top -rotate-[30deg]" />
                    )}
                </div>
            </div>

            {/* Hint */}
            <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-6 text-center">
                <p className="text-slate-400 text-sm mb-1">คำใบ้</p>
                <p className="text-lg font-bold text-white">{currentCard.front_text}</p>
            </div>

            {/* Word Display */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
                {displayWord.map((char, i) => (
                    <motion.span
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`w-8 h-10 flex items-center justify-center text-2xl font-bold ${char === '_' ? 'border-b-2 border-white' : ''
                            } ${gameStatus === 'won' ? 'text-green-400' : gameStatus === 'lost' && char !== '_' && !guessedLetters.has(word[i]) ? 'text-red-400' : 'text-white'}`}
                    >
                        {char}
                    </motion.span>
                ))}
            </div>

            {/* Wrong count */}
            <div className="text-center mb-4">
                <span className="text-red-400">{wrongCount}</span>
                <span className="text-slate-400">/{MAX_WRONG} ผิด</span>
            </div>

            {/* Keyboard */}
            <div className="flex flex-wrap justify-center gap-1">
                {ALPHABET.map(letter => {
                    const guessed = guessedLetters.has(letter);
                    const isCorrect = word.includes(letter);

                    return (
                        <Button
                            key={letter}
                            onClick={() => handleGuess(letter)}
                            disabled={guessed || gameStatus !== 'playing'}
                            size="sm"
                            className={`w-9 h-9 p-0 font-bold rounded-lg ${guessed
                                    ? isCorrect
                                        ? 'bg-green-500/30 text-green-300'
                                        : 'bg-red-500/30 text-red-300'
                                    : 'bg-white/10 hover:bg-white/20 text-white'
                                }`}
                        >
                            {letter}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
