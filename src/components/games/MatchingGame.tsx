import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Flag, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BackgroundDecorations from '@/components/BackgroundDecorations';

// --- Types ---
interface FlashcardData {
    id: string;
    front_text: string;
    back_text: string;
}

interface MatchingGameComponentProps {
    flashcards: FlashcardData[];
    onComplete: (score: number, correctCount: number, totalCount: number, answers: Array<{ wordId: string; isCorrect: boolean; timeTaken: number }>) => void;
    isMultiplayer?: boolean;
}

interface MatchingCard {
    id: string;
    content: string;
    type: 'front' | 'back';
    pairId: string;
    isMatched: boolean;
    // Metadata for tracking
    originalId: string;
}

const MAX_ROUNDS = 5;

export function MatchingGameComponent({ flashcards, onComplete, isMultiplayer }: MatchingGameComponentProps) {
    const navigate = useNavigate();
    const [cards, setCards] = useState<MatchingCard[]>([]);
    const [selectedCards, setSelectedCards] = useState<MatchingCard[]>([]);
    const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
    const [score, setScore] = useState(0);

    // Timers
    const [startTime, setStartTime] = useState(Date.now());
    const [wrongMatch, setWrongMatch] = useState<string[]>([]);
    const [currentRound, setCurrentRound] = useState(1);

    // SRS Tracking
    const [answers, setAnswers] = useState<Array<{ wordId: string; isCorrect: boolean; timeTaken: number }>>([]);
    const [pairStartTime, setPairStartTime] = useState<number>(0);

    // Game config
    const maxPairs = 6;

    useEffect(() => {
        if (flashcards.length > 0) {
            initializeGame();
        }
    }, [flashcards]);

    const initializeGame = () => {
        // Select random cards from the pool
        // Note: session usually passes exact cards. If length > maxPairs, we pick subset.
        // If we want rounds, we might need to pick DIFFERENT cards.
        // For simplicity in this port: we shuffle available flashcards and pick top N.
        // Ideally, we rotate through them if we have many rounds.

        // Simple Rotation Logic:
        // Round 1: 0-6, Round 2: 6-12 ...
        // Calculate offset based on round.
        const startIndex = (currentRound - 1) * maxPairs;
        // Wrap around if not enough cards? Or just shuffle?
        // Let's just shuffle widely to ensure mix if we have enough.
        // Actually, `flashcards` prop usually comes with *just enough* cards for the session (e.g. 20).

        const available = [...flashcards].sort(() => Math.random() - 0.5);
        const selectedFlashcards = available.slice(0, maxPairs);

        // Create matching pairs
        const gameCards: MatchingCard[] = [];
        selectedFlashcards.forEach(card => {
            gameCards.push({
                id: `${card.id}-front`,
                content: card.front_text,
                type: 'front',
                pairId: card.id,
                isMatched: false,
                originalId: card.id
            });
            gameCards.push({
                id: `${card.id}-back`,
                content: card.back_text,
                type: 'back',
                pairId: card.id,
                isMatched: false,
                originalId: card.id
            });
        });

        // Shuffle
        setCards(gameCards.sort(() => Math.random() - 0.5));
        setPairStartTime(performance.now());
    };

    const handleCardClick = (card: MatchingCard) => {
        if (
            card.isMatched ||
            selectedCards.find(c => c.id === card.id) ||
            selectedCards.length >= 2 ||
            wrongMatch.length > 0
        ) return;

        const newSelected = [...selectedCards, card];
        setSelectedCards(newSelected);

        if (newSelected.length === 2) {
            checkMatch(newSelected[0], newSelected[1]);
        }
    };

    const checkMatch = async (card1: MatchingCard, card2: MatchingCard) => {
        const timeTaken = (performance.now() - pairStartTime) / 1000;

        if (card1.pairId === card2.pairId) {
            // Match found
            const newMatched = [...matchedPairs, card1.pairId];
            setMatchedPairs(newMatched);
            setScore(score + 10);

            setCards(cards.map(c =>
                c.pairId === card1.pairId ? { ...c, isMatched: true } : c
            ));

            setSelectedCards([]);

            // SRS Tracker: Success
            setAnswers(prev => [...prev, { wordId: card1.pairId, isCorrect: true, timeTaken }]);
            setPairStartTime(performance.now()); // Reset for next pair

            // Check Round Completion
            const pairsInRound = new Set(cards.map(c => c.pairId)).size;
            if (newMatched.length === pairsInRound) {
                if (currentRound < MAX_ROUNDS) {
                    // Verify if we actually have enough cards for another round, 
                    // or if we should just repeat for drill?
                    // FlashcardMatchingGame blindly increments round.
                    setTimeout(() => {
                        setCurrentRound(prev => prev + 1);
                        setMatchedPairs([]);
                        setSelectedCards([]);
                        initializeGame();
                    }, 500);
                } else {
                    finishGame();
                }
            }
        } else {
            // No match
            setWrongMatch([card1.id, card2.id]);

            // SRS Tracker: Failure
            // Track BOTH words as failed? Or just the one the user *intended*?
            // Hard to know intention. Safest is to penalize both slightly, OR just track "incorrect match".
            // Our SRS system usually needs `wordId`.
            // Let's Record errors for both involved IDs.
            setAnswers(prev => [
                ...prev,
                { wordId: card1.pairId, isCorrect: false, timeTaken },
                { wordId: card2.pairId, isCorrect: false, timeTaken }
            ]);

            setTimeout(() => {
                setSelectedCards([]);
                setWrongMatch([]);
            }, 400);
        }
    };

    const finishGame = () => {
        // Calculate final stats
        const correctCount = answers.filter(a => a.isCorrect).length;
        // Total count is vague here because of potential repeats/rounds. 
        // But usually `totalCount` implies unique words engaged.
        // Let's just pass `flashcards.length` as the total denominator.
        onComplete(score, correctCount, flashcards.length, answers);
    };

    const getCardStyle = (card: MatchingCard) => {
        if (card.isMatched) {
            return "opacity-0 pointer-events-none"; // Hide matched cards
        }

        const isSelected = selectedCards.find(c => c.id === card.id);
        const isWrong = wrongMatch.includes(card.id);

        if (isWrong) {
            return "bg-red-500 border-red-600 text-white animate-shake";
        }

        if (isSelected) {
            return "bg-cyan-600 border-cyan-700 text-white shadow-lg scale-105 ring-4 ring-cyan-200";
        }

        return "bg-white hover:bg-cyan-50 border-2 border-cyan-100 text-cyan-900 hover:-translate-y-1 hover:shadow-md";
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-cyan-50 via-sky-50 to-cyan-100 dark:from-cyan-950 dark:via-sky-900 dark:to-cyan-950 overflow-auto z-50">
            <BackgroundDecorations />

            <div className="container mx-auto px-2 md:px-4 py-4 md:py-6 relative z-10 min-h-screen flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 md:mb-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/dashboard')}
                        className="text-slate-500 hover:text-slate-700 hover:bg-white/50"
                    >
                        <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
                    </Button>

                    <div className="flex items-center gap-2 md:gap-3">
                        {/* Round Indicator */}
                        <div className="flex items-center gap-1.5 md:gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-xl shadow-md border border-white/20">
                            <Flag className="h-4 w-4 md:h-5 md:w-5" />
                            <span className="font-bold text-base md:text-lg">Round {currentRound}/{MAX_ROUNDS}</span>
                        </div>

                        <div className="flex items-center gap-1.5 md:gap-2 bg-white/80 backdrop-blur-md px-3 md:px-4 py-1.5 md:py-2 rounded-xl shadow-sm border border-white/50">
                            <Trophy className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
                            <span className="font-bold text-base md:text-lg">{score}</span>
                        </div>
                    </div>
                    <div />
                </div>

                {/* Main Game Area */}
                <div className="flex-1 flex items-center justify-center max-w-5xl mx-auto w-full">
                    <Card className="w-full bg-white/90 backdrop-blur-xl border-white/50 shadow-2xl rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="pb-0 md:pb-2 pt-4 md:pt-6">
                            <CardTitle className="text-center text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-600 to-sky-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
                                <span className="text-2xl md:text-3xl">🧩</span> Matching Pair
                                <span className="text-sm font-normal text-muted-foreground ml-2">(Round {currentRound})</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 md:p-8">

                            <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
                                <AnimatePresence>
                                    {cards.map((card) => (
                                        <motion.button
                                            key={card.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: card.isMatched ? 0 : 1, scale: card.isMatched ? 0.9 : 1 }}
                                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.1 } }}
                                            whileHover={!card.isMatched && !selectedCards.find(c => c.id === card.id) ? { scale: 1.05 } : {}}
                                            whileTap={{ scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            onClick={() => handleCardClick(card)}
                                            className={`
                        aspect-[4/3] md:aspect-video rounded-lg md:rounded-xl p-1 md:p-4 flex items-center justify-center text-center transition-colors duration-100
                        ${getCardStyle(card)}
                      `}
                                        >
                                            <span className="text-xs md:text-lg font-bold line-clamp-3 break-words w-full px-1">
                                                {card.content}
                                            </span>
                                        </motion.button>
                                    ))}
                                </AnimatePresence>
                            </div>

                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
