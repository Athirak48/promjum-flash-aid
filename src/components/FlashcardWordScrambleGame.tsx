import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trophy, RotateCcw, ArrowRight, Volume2, X, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';
import { useXP } from '@/hooks/useXP';
import { useSRSProgress } from '@/hooks/useSRSProgress';
import { XPGainAnimation } from '@/components/xp/XPGainAnimation';

// --- Types ---
export interface ScrambleWord {
    id: string;
    word: string;
    meaning: string;
    isUserFlashcard?: boolean;
}

interface FlashcardWordScrambleGameProps {
    vocabList: ScrambleWord[];
    onGameFinish: (results: { score: number; correctWords: number; wrongWords: number; timeSpent: number }) => void;
    onExit?: () => void;
    onNewGame?: () => void;
}

interface LetterTile {
    id: string; // unique id for list rendering (e.g. "A-0", "A-1")
    char: string;
}

// --- Component ---
export function FlashcardWordScrambleGame({ vocabList, onGameFinish, onExit, onNewGame }: FlashcardWordScrambleGameProps) {
    const { addGameXP, lastGain, clearLastGain } = useXP();
    const { updateFromWordScramble } = useSRSProgress();

    // Game State
    const [gameWords, setGameWords] = useState<ScrambleWord[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [gameStartTime] = useState(Date.now());
    const [correctCount, setCorrectCount] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const [totalXPEarned, setTotalXPEarned] = useState(0);

    // Current Round State
    const [scrambledLetters, setScrambledLetters] = useState<LetterTile[]>([]); // Pool
    const [placedLetters, setPlacedLetters] = useState<(LetterTile | null)[]>([]); // Slots
    const [isChecking, setIsChecking] = useState(false);
    const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
    const [hintsRevealed, setHintsRevealed] = useState(0);
    const [revealedPositions, setRevealedPositions] = useState<Set<number>>(new Set());
    const [wordAttempts, setWordAttempts] = useState<Record<string, number>>({});
    const [currentWordAttempts, setCurrentWordAttempts] = useState(0);
    const [gameFinished, setGameFinished] = useState(false);
    const [gameResults, setGameResults] = useState<{ score: number; correctWords: number; wrongWords: number; timeSpent: number } | null>(null);

    const controls = useAnimation();
    const { toast } = useToast();

    // --- Initialization ---
    // Use a ref to prevent re-shuffling on every render if vocabList reference changes
    const initializedRef = useRef(false);

    useEffect(() => {
        if (!initializedRef.current && vocabList.length > 0) {
            // Select 5-10 words randomly or just take first 10
            const shuffled = [...vocabList].sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, 10);
            setGameWords(selected);
            initializedRef.current = true;
        }
    }, [vocabList]);

    // --- Round Setup ---
    useEffect(() => {
        if (gameWords.length > 0) {
            if (currentIndex < gameWords.length) {
                // Only setup round if the word actually changed
                setupRound(gameWords[currentIndex]);
            }
            // Note: We removed the else { finishGame() } here to avoid double-calling or premature finishing.
            // finishGame is now called explicitly when the last word is completed.
        }
    }, [currentIndex, gameWords]);

    const setupRound = (wordObj: ScrambleWord) => {
        const word = wordObj.word.toUpperCase().replace(/[^A-Z]/g, ''); // Clean word

        // Create letter objects with unique IDs and original positions
        const letters: LetterTile[] = word.split('').map((char, index) => ({
            id: `${char}-${index}-${Math.random().toString(36).substr(2, 9)}`,
            char
        }));

        // Shuffle for scrambling - Ensure it's not the same as original
        let shuffled = [...letters];
        const isAllSame = word.split('').every(c => c === word[0]);

        if (word.length > 1 && !isAllSame) {
            let attempts = 0;
            do {
                // Fisher-Yates Shuffle
                for (let i = shuffled.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }
                attempts++;
            } while (
                shuffled.map(l => l.char).join('') === word &&
                attempts < 10
            );
        } else {
            // Fallback for single char or identical chars
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
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

    // Move from Pool to Slot
    const handlePoolClick = (letter: LetterTile) => {
        if (isChecking || feedback === 'correct') return;

        // Find which index this letter is at in scrambledLetters
        const scrambledIndex = scrambledLetters.findIndex(l => l && l.id === letter.id);

        // Find first empty slot
        const emptyIndex = placedLetters.findIndex(l => l === null);
        if (emptyIndex !== -1) {
            const newPlaced = [...placedLetters];
            // Store the scrambled index in the letter so we can return it later
            newPlaced[emptyIndex] = { ...letter, scrambledIndex } as any;
            setPlacedLetters(newPlaced);

            // Remove from scrambledLetters but keep the array length
            setScrambledLetters(prev => {
                const newScrambled = [...prev];
                if (scrambledIndex !== -1) {
                    newScrambled[scrambledIndex] = null as any; // Keep slot empty
                }
                return newScrambled;
            });
        }
    };

    // Move from Slot back to Pool (return to exact scrambled position)
    const handleSlotClick = (index: number) => {
        if (isChecking || feedback === 'correct') return;

        // Prevent removing hint tiles
        if (revealedPositions.has(index)) return;

        const letter = placedLetters[index];
        if (letter) {
            const newPlaced = [...placedLetters];
            newPlaced[index] = null;
            setPlacedLetters(newPlaced);

            // Return to original scrambled position
            const scrambledIndex = (letter as any).scrambledIndex;
            setScrambledLetters(prev => {
                const newScrambled = [...prev];
                if (scrambledIndex !== undefined && scrambledIndex !== -1) {
                    newScrambled[scrambledIndex] = letter; // Put back at exact position
                } else {
                    // Fallback: find first empty slot
                    const emptySlot = newScrambled.findIndex(l => !l);
                    if (emptySlot !== -1) {
                        newScrambled[emptySlot] = letter;
                    } else {
                        newScrambled.push(letter);
                    }
                }
                return newScrambled;
            });
        }
    };

    // Check Answer
    useEffect(() => {
        // Only check if all slots are filled
        if (placedLetters.every(l => l !== null) && placedLetters.length > 0) {
            checkAnswer();
        }
    }, [placedLetters]);

    const checkAnswer = () => {
        if (isChecking) return; // Prevent double execution
        setIsChecking(true);

        const currentWordRaw = gameWords[currentIndex].word.toUpperCase().replace(/[^A-Z]/g, '');
        const userWord = placedLetters.map(l => l?.char).join('');

        const isLastWord = currentIndex >= gameWords.length - 1;

        if (userWord === currentWordRaw) {
            // CORRECT
            setFeedback('correct');
            setScore(prev => prev + 100);
            setCorrectCount(prev => prev + 1);

            // Add XP for correct answer
            addGameXP('word-scramble', true, false).then(xpResult => {
                if (xpResult?.xpAdded) {
                    setTotalXPEarned(prev => prev + xpResult.xpAdded);
                }
            });

            // Update SRS
            updateFromWordScramble(gameWords[currentIndex].id, true, hintsRevealed);
            console.log(`🔀 SRS Updated: ${gameWords[currentIndex].id} Hints=${hintsRevealed}`);

            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.7 }
            });

            // Record attempts
            setWordAttempts(prev => ({ ...prev, [gameWords[currentIndex].id]: currentWordAttempts }));

            // Go to next after delay
            setTimeout(() => {
                if (isLastWord) {
                    finishGame(currentWordAttempts);
                } else {
                    goToNext();
                }
            }, 1000);
        } else {
            // WRONG - Reset immediately with hints
            const wordLength = currentWordRaw.length;
            const hintsPerAttempt = Math.ceil(wordLength * 0.2);
            const newTotalHints = hintsRevealed + hintsPerAttempt;

            console.log('Wrong! Hints:', { current: hintsRevealed, adding: hintsPerAttempt, newTotal: newTotalHints, wordLength });

            // Update counters
            setWrongCount(prev => prev + 1);
            setCurrentWordAttempts(prev => prev + 1);

            // Show wrong feedback briefly
            setFeedback('wrong');

            setTimeout(() => {
                if (newTotalHints >= wordLength) {
                    // 100% revealed - Show full answer
                    setWordAttempts(prev => ({ ...prev, [gameWords[currentIndex].id]: currentWordAttempts + 1 }));

                    // Show complete word
                    const fullAnswer: (LetterTile | null)[] = currentWordRaw.split('').map((char, idx) => ({
                        id: `hint-${char}-${idx}`,
                        char: char
                    }));

                    setPlacedLetters(fullAnswer);
                    setScrambledLetters([]);
                    setHintsRevealed(wordLength);
                    setRevealedPositions(new Set(Array.from({ length: wordLength }, (_, i) => i)));
                    setFeedback('correct');
                    setIsChecking(false);

                    // Move to next word
                    setTimeout(() => {
                        if (isLastWord) {
                            finishGame(currentWordAttempts + 1);
                        } else {
                            goToNext();
                        }
                    }, 1500);
                } else {
                    // Add hints and reset for retry
                    const wordLetters = currentWordRaw.split('').map((char, idx) => ({
                        id: `letter-${char}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
                        char: char
                    }));

                    // Determine which positions to reveal
                    const newRevealedPositions = new Set(revealedPositions);
                    const remainingIndices = Array.from({ length: wordLength }, (_, i) => i)
                        .filter(i => !newRevealedPositions.has(i));

                    while (newRevealedPositions.size < newTotalHints && remainingIndices.length > 0) {
                        const randomIndex = Math.floor(Math.random() * remainingIndices.length);
                        newRevealedPositions.add(remainingIndices[randomIndex]);
                        remainingIndices.splice(randomIndex, 1);
                    }

                    // Build new placed and scrambled arrays
                    const newPlaced: (LetterTile | null)[] = new Array(wordLength).fill(null);
                    const newScrambled: LetterTile[] = [];

                    wordLetters.forEach((letter, idx) => {
                        if (newRevealedPositions.has(idx)) {
                            // This is a hint - place it in correct position
                            newPlaced[idx] = letter;
                        } else {
                            // This goes to scrambled pool
                            newScrambled.push(letter);
                        }
                    });

                    // Shuffle the scrambled letters
                    const shuffledScrambled = [...newScrambled].sort(() => 0.5 - Math.random());

                    setPlacedLetters(newPlaced);
                    setScrambledLetters(shuffledScrambled);
                    setRevealedPositions(newRevealedPositions);
                    setHintsRevealed(newTotalHints);
                    setFeedback('idle');
                    setIsChecking(false);
                }
            }, 300);
        }
    };

    const resetTilesToPool = (hintCount = 0) => {
        // 1. Gather all currently placed letters back to a temporary pool list
        // (We need to reconstruct the full available set to then pick hints from)
        const currentPlaced = placedLetters.filter((l): l is LetterTile => l !== null);
        let allAvailable = [...scrambledLetters, ...currentPlaced];

        const cleanWord = gameWords[currentIndex].word.toUpperCase().replace(/[^A-Z]/g, '');
        const wordLength = cleanWord.length;
        const newPlaced: (LetterTile | null)[] = new Array(wordLength).fill(null);

        if (hintCount > 0) {
            const actualHints = Math.min(hintCount, wordLength);

            // Start with previously revealed positions
            const newRevealedPositions = new Set(revealedPositions);

            // Calculate how many more positions we need to reveal
            const remainingIndices = Array.from({ length: wordLength }, (_, i) => i)
                .filter(i => !newRevealedPositions.has(i));

            // Add new random positions until we reach the target hint count
            while (newRevealedPositions.size < actualHints && remainingIndices.length > 0) {
                const randomIndex = Math.floor(Math.random() * remainingIndices.length);
                newRevealedPositions.add(remainingIndices[randomIndex]);
                remainingIndices.splice(randomIndex, 1);
            }

            // Update the revealed positions state
            setRevealedPositions(newRevealedPositions);

            // Place hints at ALL revealed positions (both old and new)
            newRevealedPositions.forEach(idx => {
                const charNeeded = cleanWord[idx];
                const foundLetterIdx = allAvailable.findIndex(l => l.char === charNeeded);

                if (foundLetterIdx !== -1) {
                    newPlaced[idx] = allAvailable[foundLetterIdx];
                    allAvailable.splice(foundLetterIdx, 1); // Remove from available
                }
            });
        }

        setPlacedLetters(newPlaced);
        setScrambledLetters(allAvailable);
    };

    const goToNext = () => {
        setCurrentIndex(prev => prev + 1);
    };

    const finishGame = (finalWordAttemptsOverride?: number) => {
        const timeSpent = Math.floor((Date.now() - gameStartTime) / 1000);

        // Merge current word stats
        const finalAttemptsMap = { ...wordAttempts };
        if (finalWordAttemptsOverride !== undefined && gameWords[currentIndex]) {
            finalAttemptsMap[gameWords[currentIndex].id] = finalWordAttemptsOverride;
        }

        // Calculate Stats Logic:
        // Correct (Perfect) = 0 attempts
        // Wrong = >0 attempts
        let perfectCount = 0;
        let imperfectCount = 0; // Wrong

        gameWords.forEach(w => {
            const att = finalAttemptsMap[w.id] || 0;
            if (att === 0) perfectCount++;
            else imperfectCount++;
        });

        // Ensure sum equals total
        // If word map isn't complete (bug safety), count remaining as imperfect or ignore?
        // Assuming map is complete because we play linearly.

        const results = {
            score,
            correctWords: perfectCount,
            wrongWords: imperfectCount,
            timeSpent
        };
        setWordAttempts(finalAttemptsMap); // Ensure UI sees the final map
        setGameResults(results);
        setGameFinished(true);
    };

    const speakWord = () => {
        if ('speechSynthesis' in window && currentIndex < gameWords.length) {
            const utterance = new SpeechSynthesisUtterance(gameWords[currentIndex].word);
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
        }
    };

    // Summary Screen - Render BEFORE checking gameWords length
    if (gameFinished && gameResults) {
        // Determine if it's a perfect game (all words correct on first try)
        const isPerfectGame = gameResults.correctWords === gameWords.length;

        return (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
                <Card className="w-full max-w-4xl h-[85vh] flex flex-col bg-slate-900 border border-white/10 shadow-2xl rounded-3xl relative overflow-hidden">
                    {/* Header */}
                    <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md p-6 border-b border-white/5 flex justify-between items-center">
                        <div className="flex flex-col">
                            {isPerfectGame ? (
                                <>
                                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 mb-2 animate-pulse">
                                        ✅ เยี่ยม! ตอบถูกทุกคำ! �
                                    </span>
                                    <p className="text-sm text-emerald-400 font-medium">Perfect Score! You're a word master!</p>
                                </>
                            ) : (
                                <>
                                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 mb-2">
                                        ✅ ไม่เป็นไร ได้เรียนรู้! 📚
                                    </span>
                                    <p className="text-sm text-blue-400 font-medium">Great effort! Keep practicing!</p>
                                </>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                                <span className="text-sm text-slate-400">Total Score:</span>
                                <div className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full font-bold text-sm flex items-center gap-2">
                                    <Trophy className="w-3 h-3" />
                                    <span>{gameResults.score}</span>
                                </div>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onExit}
                            className="hover:bg-white/10 hover:text-white text-slate-400 rounded-full"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Content - Flex wrapper to fill space */}
                    <div className="flex-1 overflow-hidden p-6 flex flex-col gap-6">
                        {/* Word List - Split Columns with Scrollbars - Flex 1 to take remaining space */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
                            {/* Left Column: Perfect Words */}
                            <div className="flex flex-col h-full">
                                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 mb-3 shrink-0">
                                    ✓ Perfect Matches
                                </h3>
                                <div className="space-y-2 overflow-y-scroll pr-2 flex-1 max-h-[300px] scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800/50 hover:scrollbar-thumb-slate-500 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-800/30 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full">
                                    {gameWords.filter(w => (wordAttempts[w.id] || 0) === 0).length === 0 && (
                                        <div className="p-4 rounded-xl border border-dashed border-white/10 text-slate-500 text-center text-sm">
                                            No perfect words this time. Keep practicing!
                                        </div>
                                    )}
                                    {gameWords
                                        .filter(w => (wordAttempts[w.id] || 0) === 0)
                                        .map((word) => (
                                            <div
                                                key={word.id}
                                                className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 transition-all"
                                            >
                                                <div className="flex-1 min-w-0 mr-3">
                                                    <div className="font-bold text-base text-white truncate">{word.word}</div>
                                                    <div className="text-xs text-emerald-400/70 truncate">{word.meaning}</div>
                                                </div>
                                                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-black font-bold text-xs shrink-0">
                                                    ✓
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            {/* Right Column: Wrong Words */}
                            <div className="flex flex-col h-full">
                                <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider flex items-center gap-2 mb-3 shrink-0">
                                    ! Review Needed
                                </h3>
                                <div className="space-y-2 overflow-y-scroll pr-2 flex-1 max-h-[300px] scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800/50 hover:scrollbar-thumb-slate-500 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-800/30 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full">
                                    {gameWords.filter(w => (wordAttempts[w.id] || 0) > 0).length === 0 && (
                                        <div className="p-4 rounded-xl border border-dashed border-white/10 text-slate-500 text-center text-sm">
                                            Amazing! No mistakes made.
                                        </div>
                                    )}
                                    {gameWords
                                        .filter(w => (wordAttempts[w.id] || 0) > 0)
                                        .sort((a, b) => (wordAttempts[b.id] || 0) - (wordAttempts[a.id] || 0)) // Sort Descending
                                        .map((word) => {
                                            const attempts = wordAttempts[word.id] || 0;
                                            return (
                                                <div
                                                    key={word.id}
                                                    className="flex items-center justify-between p-3 rounded-xl border border-red-500/20 bg-red-500/5 transition-all"
                                                >
                                                    <div className="flex-1 min-w-0 mr-3">
                                                        <div className="font-bold text-base text-red-400 truncate">{word.word}</div>
                                                        <div className="text-xs text-red-400/60 truncate">{word.meaning}</div>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <span className="text-xs font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
                                                            {attempts}x
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid - Outside scrollable area */}
                    <div className="px-6 pb-6 shrink-0">
                        <div className="grid grid-cols-3 gap-3">
                            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-center">
                                <div className="text-2xl font-bold text-emerald-400">{gameResults.correctWords}</div>
                                <div className="text-xs text-slate-500 font-bold uppercase">Correct</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-center">
                                <div className="text-2xl font-bold text-rose-400">{gameResults.wrongWords}</div>
                                <div className="text-xs text-slate-500 font-bold uppercase">Wrong</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-center">
                                <div className="text-2xl font-bold text-blue-400">{gameResults.timeSpent}s</div>
                                <div className="text-xs text-slate-500 font-bold uppercase">Time</div>
                            </div>
                        </div>
                    </div>

                    {/* Footer - 3 Action Buttons */}
                    <div className="bg-slate-900/95 backdrop-blur-md p-6 border-t border-white/5 grid grid-cols-3 gap-3 shrink-0">
                        {/* 1. Play Again */}
                        <Button
                            onClick={() => {
                                // Reset Game State
                                setScore(0);
                                setCorrectCount(0);
                                setWrongCount(0);
                                setCurrentIndex(0);
                                setGameFinished(false);
                                setGameResults(null);
                                setWordAttempts({});
                                setPlacedLetters([]);
                                setFeedback('idle');

                                // Re-shuffle words
                                const shuffled = [...vocabList].sort(() => 0.5 - Math.random());
                                const selected = shuffled.slice(0, 10);
                                setGameWords(selected);
                            }}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl h-12 shadow-lg shadow-amber-900/20"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            เล่นอีกครั้ง
                        </Button>

                        {/* 2. New Game */}
                        <Button
                            onClick={() => {
                                if (onNewGame) onNewGame();
                                else if (onExit) onExit();
                            }}
                            variant="outline"
                            className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white font-bold rounded-xl h-12"
                        >
                            <ArrowRight className="w-4 h-4 mr-2" />
                            เกมใหม่
                        </Button>

                        {/* 3. Continue to Next Session */}
                        <Button
                            onClick={() => {
                                if (onGameFinish && gameResults) {
                                    onGameFinish(gameResults);
                                }
                                // Don't call onExit - let the parent handle navigation
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-12 shadow-lg shadow-indigo-900/20"
                        >
                            <ChevronRight className="w-4 h-4 mr-2" />
                            ไปกันต่อ
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    if (gameWords.length === 0) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin text-4xl">⌛</div>
        </div>
    );

    const progress = ((currentIndex) / gameWords.length) * 100;

    return (
        <div className="flex flex-col items-center max-w-4xl mx-auto p-4 md:p-6 min-h-[600px] w-full relative">

            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-full max-h-[500px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

            {/* Header */}
            <header className="w-full flex justify-between items-center mb-8 relative z-10">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onExit}
                    className="hover:bg-white/10 hover:text-white text-slate-400 rounded-full transition-colors"
                >
                    <X className="w-6 h-6" />
                </Button>

                <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Word Scramble</span>
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 bg-slate-800/50 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-blue-400 to-indigo-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                        <span className="text-xs font-semibold text-slate-400 tabular-nums">
                            {currentIndex + 1} / {gameWords.length}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-full font-bold text-sm flex items-center gap-2 backdrop-blur-md">
                        <Trophy className="w-4 h-4 text-indigo-400" />
                        <span className="tabular-nums">{score}</span>
                    </div>
                </div>
            </header>

            {/* Main Game Area */}
            <div className="flex-1 w-full flex flex-col items-center justify-center space-y-12 relative z-10">

                {/* Question / Meaning Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={currentIndex}
                    className="w-full max-w-2xl text-center"
                >
                    <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        <Card className="relative p-8 md:p-12 bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[2.5rem] overflow-hidden">
                            {/* Decorative Grid */}
                            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" />

                            <div className="relative flex flex-col items-center gap-6">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={speakWord}
                                    className="w-12 h-12 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 transition-all hover:scale-110"
                                >
                                    <Volume2 className="w-6 h-6" />
                                </Button>

                                <div className="space-y-2">
                                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg leading-tight">
                                        {gameWords[currentIndex].meaning}
                                    </h2>
                                    <p className="text-indigo-200/60 font-medium text-sm md:text-base animate-pulse">
                                        Tap letters to spell the word
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </motion.div>

                {/* Answer Slots - The "Tray" */}
                <div className="w-full max-w-3xl flex justify-center">
                    <motion.div
                        animate={controls}
                        className="flex flex-wrap justify-center gap-2 md:gap-4 p-4 rounded-3xl bg-black/20 backdrop-blur-sm border border-white/5"
                    >
                        {placedLetters.length > 0 && placedLetters.map((letter, index) => (
                            <div key={`slot-container-${index}`} className="relative">
                                {/* Empty Slot Marker */}
                                <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-white/10 bg-white/5" />

                                <motion.div
                                    key={`slot-${index}`}
                                    onClick={() => handleSlotClick(index)}
                                    layoutId={letter ? letter.id : undefined}
                                    className={`
                                        relative w-12 h-14 md:w-14 md:h-16 rounded-xl flex items-center justify-center 
                                        text-2xl md:text-3xl font-black select-none
                                        shadow-[0_4px_0_rgba(0,0,0,0.2)] transition-all
                                        ${letter
                                            ? feedback === 'correct'
                                                ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 text-white shadow-emerald-900/50 scale-105 z-10'
                                                : feedback === 'wrong'
                                                    ? 'bg-gradient-to-t from-rose-600 to-rose-400 text-white shadow-rose-900/50'
                                                    : revealedPositions.has(index)
                                                        ? 'bg-gradient-to-t from-amber-600 to-yellow-500 text-white shadow-amber-900/50 cursor-not-allowed'
                                                        : 'bg-gradient-to-t from-indigo-600 to-blue-500 text-white shadow-indigo-900/50 hover:-translate-y-1 hover:shadow-lg cursor-pointer'
                                            : 'opacity-0'
                                        }
                                    `}
                                >
                                    {letter?.char}

                                    {/* Shine effect */}
                                    {letter && <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent rounded-t-2xl" />}
                                </motion.div>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Letter Pool - Fixed positions (scrambled but no shifting!) */}
                <div className="flex flex-wrap justify-center gap-2 md:gap-3 min-h-[100px] max-w-3xl px-4">
                    {gameWords[currentIndex] && Array.from({ length: gameWords[currentIndex].word.toUpperCase().replace(/[^A-Z]/g, '').length }).map((_, slotIndex) => {
                        // Get letter from scrambled array at this index
                        const letter = scrambledLetters[slotIndex];

                        return (
                            <motion.button
                                key={`pool-slot-${slotIndex}`}
                                onClick={() => letter && handlePoolClick(letter)}
                                disabled={!letter}
                                whileHover={letter ? { scale: 1.1, translateY: -4 } : {}}
                                whileTap={letter ? { scale: 0.95 } : {}}
                                className={`relative w-12 h-14 md:w-14 md:h-16 rounded-xl 
                                           flex items-center justify-center text-2xl md:text-3xl font-black
                                           border-2 transition-all duration-200
                                           ${letter
                                        ? 'bg-white text-slate-700 border-slate-100 hover:border-indigo-200 hover:text-indigo-600 shadow-[0_4px_0_#cbd5e1] active:shadow-none active:translate-y-[4px] cursor-pointer'
                                        : 'bg-transparent border-transparent shadow-none opacity-0 pointer-events-none'
                                    }`}
                                style={{ visibility: letter ? 'visible' : 'hidden' }}
                            >
                                <span className="relative z-10">{letter?.char || ''}</span>
                                {letter && <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white to-slate-50 rounded-t-xl opacity-50" />}
                            </motion.button>
                        );
                    })}
                </div>

            </div>
        </div>
    );
}
