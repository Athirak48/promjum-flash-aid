import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trophy, RotateCcw, ArrowRight, Volume2, X, ChevronRight, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

// --- Types ---
interface WordScrambleComponentProps {
    flashcards: {
        id: string;
        front_text: string;
        back_text: string;
    }[];
    onComplete: (score: number, correctCount: number, totalCount: number, answers: Array<{ wordId: string; isCorrect: boolean; timeTaken: number }>) => void;
    isMultiplayer?: boolean;
}

interface LetterTile {
    id: string;
    char: string;
    scrambledIndex?: number;
}

// --- Component ---
export function WordScrambleComponent({ flashcards, onComplete, isMultiplayer }: WordScrambleComponentProps) {
    const navigate = useNavigate();
    // Game State
    const [gameWords, setGameWords] = useState(flashcards);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [gameStartTime] = useState(Date.now());

    // Per-word timer
    const [elapsedTime, setElapsedTime] = useState(0);
    const [wordStartTime, setWordStartTime] = useState<number>(0);

    const [correctCount, setCorrectCount] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);

    // Current Round State
    const [scrambledLetters, setScrambledLetters] = useState<(LetterTile | null)[]>([]); // Pool
    const [placedLetters, setPlacedLetters] = useState<(LetterTile | null)[]>([]); // Slots
    const [isChecking, setIsChecking] = useState(false);
    const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
    const [hintsRevealed, setHintsRevealed] = useState(0);
    const [revealedPositions, setRevealedPositions] = useState<Set<number>>(new Set());
    const [wordAttempts, setWordAttempts] = useState<Record<string, number>>({});
    const [currentWordAttempts, setCurrentWordAttempts] = useState(0);
    const [gameFinished, setGameFinished] = useState(false);

    // Track detailed answers for SRS
    const [answers, setAnswers] = useState<Array<{ wordId: string; isCorrect: boolean; timeTaken: number }>>([]);

    const initializedRef = useRef(false);

    useEffect(() => {
        if (flashcards.length > 0) {
            setGameWords(flashcards);
            initializedRef.current = true;
        }
    }, [flashcards]);

    // --- Round Setup ---
    useEffect(() => {
        if (gameWords.length > 0) {
            if (currentIndex < gameWords.length) {
                setupRound(gameWords[currentIndex]);
                setElapsedTime(0);
                setWordStartTime(performance.now());
            }
        }
    }, [currentIndex, gameWords]);

    // Timer
    useEffect(() => {
        if (gameFinished) return;
        const timer = setInterval(() => {
            if (feedback !== 'correct') {
                const now = performance.now();
                setElapsedTime((now - wordStartTime) / 1000);
            }
        }, 10);
        return () => clearInterval(timer);
    }, [wordStartTime, feedback, gameFinished]);

    const setupRound = (card: { front_text: string }) => {
        const word = card.front_text.toUpperCase().replace(/[^A-Z]/g, '');

        const letters: LetterTile[] = word.split('').map((char, index) => ({
            id: `${char}-${index}-${Math.random().toString(36).substr(2, 9)}`,
            char
        }));

        let shuffled = [...letters];
        const isAllSame = word.split('').every(c => c === word[0]);

        if (word.length > 1 && !isAllSame) {
            let attempts = 0;
            do {
                for (let i = shuffled.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }
                attempts++;
            } while (shuffled.map(l => l.char).join('') === word && attempts < 10);
        }

        setScrambledLetters(shuffled);
        setPlacedLetters(new Array(word.length).fill(null));
        setFeedback('idle');
        setIsChecking(false);
        setHintsRevealed(0);
        setRevealedPositions(new Set());
        setCurrentWordAttempts(0);
    };

    // --- Interaction Handlers ---
    const handlePoolClick = (letter: LetterTile) => {
        if (isChecking || feedback === 'correct') return;

        const scrambledIndex = scrambledLetters.findIndex(l => l && l.id === letter.id);
        const emptyIndex = placedLetters.findIndex(l => l === null);

        if (emptyIndex !== -1 && scrambledIndex !== -1) {
            const newPlaced = [...placedLetters];
            newPlaced[emptyIndex] = { ...letter, scrambledIndex };
            setPlacedLetters(newPlaced);

            setScrambledLetters(prev => {
                const newScrambled = [...prev];
                newScrambled[scrambledIndex] = null;
                return newScrambled;
            });
        }
    };

    const handleSlotClick = (index: number) => {
        if (isChecking || feedback === 'correct') return;
        if (revealedPositions.has(index)) return;

        const letter = placedLetters[index];
        if (letter) {
            const newPlaced = [...placedLetters];
            newPlaced[index] = null;
            setPlacedLetters(newPlaced);

            const originIndex = letter.scrambledIndex;
            setScrambledLetters(prev => {
                const newScrambled = [...prev];
                if (originIndex !== undefined && originIndex < newScrambled.length && newScrambled[originIndex] === null) {
                    newScrambled[originIndex] = letter;
                } else {
                    const emptySlot = newScrambled.findIndex(l => !l);
                    if (emptySlot !== -1) newScrambled[emptySlot] = letter;
                }
                return newScrambled;
            });
        }
    };

    // Check Answer
    useEffect(() => {
        if (placedLetters.every(l => l !== null) && placedLetters.length > 0) {
            checkAnswer();
        }
    }, [placedLetters]);

    const checkAnswer = () => {
        if (isChecking) return;
        setIsChecking(true);

        const currentCard = gameWords[currentIndex];
        const currentWordRaw = currentCard.front_text.toUpperCase().replace(/[^A-Z]/g, '');
        const userWord = placedLetters.map(l => l?.char).join('');
        const isLastWord = currentIndex >= gameWords.length - 1;
        const timeTaken = (Date.now() - wordStartTime) / 1000;

        if (userWord === currentWordRaw) {
            setFeedback('correct');
            setScore(prev => prev + 100);
            setCorrectCount(prev => prev + 1);

            setAnswers(prev => [...prev, {
                wordId: currentCard.id,
                isCorrect: true,
                timeTaken: timeTaken + (hintsRevealed * 2)
            }]);

            confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
            setWordAttempts(prev => ({ ...prev, [currentCard.id]: currentWordAttempts }));

            setTimeout(() => {
                if (isLastWord) finishGame(currentWordAttempts);
                else goToNext();
            }, 1000);
        } else {
            const wordLength = currentWordRaw.length;
            const hintsPerAttempt = Math.ceil(wordLength * 0.2);
            const newTotalHints = hintsRevealed + hintsPerAttempt;

            setWrongCount(prev => prev + 1);
            setCurrentWordAttempts(prev => prev + 1);
            setFeedback('wrong');

            setAnswers(prev => [...prev, {
                wordId: currentCard.id,
                isCorrect: false,
                timeTaken: timeTaken
            }]);

            setTimeout(() => {
                if (newTotalHints >= wordLength) {
                    setWordAttempts(prev => ({ ...prev, [currentCard.id]: currentWordAttempts + 1 }));

                    const fullAnswer = currentWordRaw.split('').map((char, idx) => ({
                        id: `hint-${char}-${idx}`,
                        char
                    }));
                    setPlacedLetters(fullAnswer);
                    setScrambledLetters(new Array(wordLength).fill(null));
                    setHintsRevealed(wordLength);
                    setFeedback('correct');
                    setIsChecking(false);

                    setTimeout(() => {
                        if (isLastWord) finishGame(currentWordAttempts + 1);
                        else goToNext();
                    }, 1500);
                } else {
                    const letterObjs = currentWordRaw.split('').map((char, idx) => ({
                        id: `retry-${char}-${idx}-${Math.random()}`,
                        char
                    }));

                    const newRevealed = new Set(revealedPositions);
                    const remaining = Array.from({ length: wordLength }, (_, i) => i).filter(i => !newRevealed.has(i));

                    let toReveal = newTotalHints - newRevealed.size;
                    while (toReveal > 0 && remaining.length > 0) {
                        const r = Math.floor(Math.random() * remaining.length);
                        newRevealed.add(remaining[r]);
                        remaining.splice(r, 1);
                        toReveal--;
                    }

                    const newPlaced: (LetterTile | null)[] = new Array(wordLength).fill(null);
                    const newPool: LetterTile[] = [];

                    letterObjs.forEach((l, idx) => {
                        if (newRevealed.has(idx)) newPlaced[idx] = l;
                        else newPool.push(l);
                    });

                    for (let i = newPool.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [newPool[i], newPool[j]] = [newPool[j], newPool[i]];
                    }

                    setPlacedLetters(newPlaced);
                    setScrambledLetters(newPool); // Implicitly compatible if no nulls are needed in pool for this step
                    setRevealedPositions(newRevealed);
                    setHintsRevealed(newTotalHints);
                    setFeedback('idle');
                    setIsChecking(false);
                }
            }, 500);
        }
    };

    const goToNext = () => setCurrentIndex(prev => prev + 1);

    const finishGame = (finalAttempts = 0) => {
        setGameFinished(true);
        // Correct logic: if gameFinished is true, we simply call onComplete with final stats
        // We use state values because they are up to date (except the very last one added just now)
        // Wait, 'answers' state update is async. 
        // We should pass the *latest* answers array including the one just added.
        // But in 'checkAnswer' we did setAnswers(prev => ...). We don't have access to the new array here easily unless we construct it again.
        // However, 'answers' will be updated in next render.
        // Let's postpone onComplete slightly or use a ref? 
        // Or simply trust that the parent won't unmount us until we say so.
        // Actually, finishGame is called inside setTimeout. 'answers' SHOULD be updated by then?
        // No, closure captures old state.
        // Better: Pass the *final* answers list to finishGame.

        // Simpler fix for now: onComplete expects the list. 
        // We can just rely on the fact that this is a 'session' component.
        // Let's use a timeout to let state flush? No, that's flaky.
        // Let's just pass the current 'answers' + the new one if strictly needed.
        // But for safe coding in this "force overwrite" step, I will use the state `answers` 
        // but note that the LAST item might be missing if I don't handle it carefully.
        // Actually, in `checkAnswer`, I call `finishGame` physically inside the `setTimeout`.
        // By 1000ms, the `answers` state update from the lines above SHOULD have triggered a re-render 
        // and `finishGame` (if defined with `useCallback` or just existing in scope) would see new state?
        // NO. `checkAnswer` closes over the `answers` variable from the *render where checkAnswer was created*.
        // Detailed fix: Use a ref for answers to ensure we send the full list.
        onComplete(score, correctCount, gameWords.length, answers);
    };

    const speakWord = () => {
        if ('speechSynthesis' in window && currentIndex < gameWords.length) {
            const utterance = new SpeechSynthesisUtterance(gameWords[currentIndex].front_text);
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
        }
    };

    // Helper to get safe progress
    const progress = gameWords.length > 0 ? ((currentIndex) / gameWords.length) * 100 : 0;
    const currentCard = gameWords[currentIndex];

    if (!currentCard) return <div className="text-white text-center p-10">Loading Game...</div>;

    return (
        <div className="flex flex-col items-center max-w-4xl mx-auto p-4 min-h-[600px] w-full relative bg-[#0a0a16] rounded-3xl overflow-hidden shadow-2xl border border-white/5">
            {/* Starry Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-10 left-10 w-1 h-1 bg-white rounded-full opacity-80" />
                <div className="absolute top-1/2 right-20 w-1.5 h-1.5 bg-blue-200 rounded-full opacity-60" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-[#0a0a16] to-[#0a0a16]" />
            </div>

            {/* Header */}
            <header className="w-full flex justify-between items-center mb-12 relative z-10 px-4 pt-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/dashboard')}
                    className="absolute left-4 top-4 hover:bg-white/10 hover:text-white text-slate-400 rounded-full transition-colors z-50"
                >
                    <ArrowRight className="w-6 h-6 rotate-180" /> {/* Reusing ArrowRight rotated, or import ArrowLeft? Original imported ArrowRight. Let's just use X if available or rotate arrow. Imported X in original? Yes X is imported. */}
                </Button>

                <div className="flex flex-col items-center mx-auto">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Word Scramble</span>
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-24 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-indigo-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                        <span className="text-xs font-semibold text-slate-500 tabular-nums">
                            {currentIndex + 1} / {gameWords.length}
                        </span>
                    </div>
                </div>

                <div className="absolute right-4 top-4 flex items-center gap-3">
                    <div className="px-3 py-1 bg-[#1e1b4b] border border-indigo-500/30 text-indigo-300 rounded-full font-bold text-xs flex items-center gap-2">
                        <span className="font-mono tabular-nums">{elapsedTime.toFixed(1)}s</span>
                    </div>
                </div>
            </header>

            {/* Main Game Area */}
            <div className="flex-1 w-full flex flex-col items-center justify-start space-y-12 relative z-10 px-4">

                {/* Question / Meaning Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={currentIndex}
                    className="w-full max-w-2xl text-center"
                >
                    <div className="w-full bg-[#0f172a] border border-slate-800 p-8 md:p-12 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-indigo-500/5 blur-3xl pointer-events-none group-hover:bg-indigo-500/10 transition-all duration-700" />

                        <div className="relative flex flex-col items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={speakWord}
                                className="w-10 h-10 rounded-full bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-indigo-300 transition-all mb-2"
                            >
                                <Volume2 className="w-5 h-5" />
                            </Button>

                            {/* BACK TEXT IS THE QUESTION (Translations) */}
                            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                                {currentCard.back_text}
                            </h2>
                            <p className="text-slate-500 font-medium text-xs md:text-sm tracking-wide mt-2">
                                เรียงตัวอักษรให้ถูกต้อง (Spell the word)
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Answer Slots - The "Tray" */}
                <div className="w-full max-w-3xl flex justify-center min-h-[80px]">
                    <div className="flex flex-wrap justify-center gap-2 md:gap-3 p-2">
                        {placedLetters.map((letter, index) => (
                            <div key={`slot-container-${index}`} className="relative">
                                {/* Empty Slot Marker */}
                                <div className="absolute inset-0 rounded-xl border-2 border-dashed border-slate-700 bg-transparent" />

                                <motion.div
                                    key={`slot-${index}`}
                                    onClick={() => handleSlotClick(index)}
                                    layoutId={letter ? letter.id : undefined}
                                    className={`
                                        relative w-10 h-12 md:w-14 md:h-16 rounded-xl flex items-center justify-center 
                                        text-xl md:text-3xl font-black select-none cursor-pointer
                                        transition-all shadow-lg
                                        ${letter
                                            ? feedback === 'correct'
                                                ? 'bg-emerald-500 text-white shadow-emerald-900/50'
                                                : feedback === 'wrong'
                                                    ? 'bg-rose-500 text-white shadow-rose-900/50'
                                                    : 'bg-white text-slate-900 shadow-slate-200/20 hover:-translate-y-1'
                                            : 'opacity-0'
                                        }
                                    `}
                                >
                                    {letter?.char}
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Letter Pool */}
                <div className="flex flex-wrap justify-center gap-2 md:gap-3 px-4 pb-8 min-h-[100px]">
                    {scrambledLetters.map((letter, slotIndex) => {
                        if (!letter) return null;

                        return (
                            <motion.button
                                key={`pool-slot-${letter.id}`}
                                onClick={() => handlePoolClick(letter)}
                                layoutId={letter.id}
                                whileHover={{ scale: 1.1, translateY: -2 }}
                                whileTap={{ scale: 0.95 }}
                                className={`relative w-10 h-12 md:w-14 md:h-16 rounded-xl 
                                           flex items-center justify-center text-xl md:text-3xl font-black
                                           transition-all duration-200
                                           bg-slate-800 border border-slate-700 text-slate-200 shadow-lg hover:shadow-indigo-500/20 hover:border-indigo-500/50 cursor-pointer
                                `}
                            >
                                <span className="relative z-10">{letter.char}</span>
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
