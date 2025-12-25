import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FlashcardData {
    id: string;
    front_text: string;
    back_text: string;
}

interface MatchingGameComponentProps {
    flashcards: FlashcardData[];
    onComplete: (score: number, correctCount: number, totalCount: number) => void;
    isMultiplayer?: boolean;
}

interface MatchCard {
    id: string;
    text: string;
    type: 'front' | 'back';
    originalId: string;
    isMatched: boolean;
    isSelected: boolean;
}

export function MatchingGameComponent({ flashcards, onComplete, isMultiplayer }: MatchingGameComponentProps) {
    const [cards, setCards] = useState<MatchCard[]>([]);
    const [selectedCards, setSelectedCards] = useState<MatchCard[]>([]);
    const [matchedCount, setMatchedCount] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isChecking, setIsChecking] = useState(false);

    const totalPairs = Math.min(flashcards.length, 6);

    // Initialize cards
    useEffect(() => {
        const selectedFlashcards = flashcards.slice(0, totalPairs);
        const allCards: MatchCard[] = [];

        selectedFlashcards.forEach((f, i) => {
            allCards.push({
                id: `front-${i}`,
                text: f.front_text,
                type: 'front',
                originalId: f.id,
                isMatched: false,
                isSelected: false
            });
            allCards.push({
                id: `back-${i}`,
                text: f.back_text,
                type: 'back',
                originalId: f.id,
                isMatched: false,
                isSelected: false
            });
        });

        // Shuffle
        setCards(allCards.sort(() => Math.random() - 0.5));
    }, [flashcards]);

    // Timer
    useEffect(() => {
        const timer = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleCardClick = (card: MatchCard) => {
        if (isChecking || card.isMatched || card.isSelected || selectedCards.length >= 2) return;

        const newCards = cards.map(c =>
            c.id === card.id ? { ...c, isSelected: true } : c
        );
        setCards(newCards);

        const newSelected = [...selectedCards, card];
        setSelectedCards(newSelected);

        if (newSelected.length === 2) {
            setIsChecking(true);
            setAttempts(prev => prev + 1);

            const [first, second] = newSelected;
            const isMatch = first.originalId === second.originalId && first.type !== second.type;

            setTimeout(() => {
                if (isMatch) {
                    setCards(prev => prev.map(c =>
                        c.originalId === first.originalId ? { ...c, isMatched: true, isSelected: false } : c
                    ));
                    setMatchedCount(prev => {
                        const newCount = prev + 1;
                        if (newCount >= totalPairs) {
                            // Game complete - score based on time (faster = more points)
                            const timeBonus = Math.max(0, 1000 - elapsedTime * 10);
                            const accuracyBonus = Math.floor((newCount / attempts) * 500);
                            const score = timeBonus + accuracyBonus;
                            onComplete(score, newCount, totalPairs);
                        }
                        return newCount;
                    });
                } else {
                    setCards(prev => prev.map(c =>
                        c.id === first.id || c.id === second.id ? { ...c, isSelected: false } : c
                    ));
                }
                setSelectedCards([]);
                setIsChecking(false);
            }, 1000);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span>{elapsedTime}s</span>
                </div>
                <Progress value={(matchedCount / totalPairs) * 100} className="w-32 h-2" />
                <span className="text-white font-bold">{matchedCount}/{totalPairs}</span>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                <AnimatePresence>
                    {cards.map((card) => (
                        <motion.div
                            key={card.id}
                            initial={{ scale: 0, rotateY: 180 }}
                            animate={{
                                scale: card.isMatched ? 0.9 : 1,
                                rotateY: 0,
                                opacity: card.isMatched ? 0.5 : 1
                            }}
                            transition={{ duration: 0.3 }}
                        >
                            <button
                                onClick={() => handleCardClick(card)}
                                disabled={card.isMatched || isChecking}
                                className={`w-full aspect-[3/4] rounded-xl p-2 text-sm font-medium transition-all ${card.isMatched
                                        ? 'bg-green-500/30 border-2 border-green-500 text-green-300'
                                        : card.isSelected
                                            ? 'bg-purple-500/30 border-2 border-purple-500 text-white'
                                            : 'bg-white/10 border-2 border-white/20 text-white hover:bg-white/20'
                                    }`}
                            >
                                <span className="line-clamp-3">{card.text}</span>
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
