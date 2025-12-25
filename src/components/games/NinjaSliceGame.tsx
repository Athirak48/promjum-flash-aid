import { useState, useEffect, useCallback, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { Clock, Heart, Sword } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FlashcardData {
    id: string;
    front_text: string;
    back_text: string;
}

interface NinjaSliceComponentProps {
    flashcards: FlashcardData[];
    onComplete: (score: number, correctCount: number, totalCount: number) => void;
    isMultiplayer?: boolean;
}

interface FallingItem {
    id: string;
    text: string;
    isCorrect: boolean;
    x: number;
    y: number;
    speed: number;
    isSliced: boolean;
}

export function NinjaSliceComponent({ flashcards, onComplete, isMultiplayer }: NinjaSliceComponentProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [items, setItems] = useState<FallingItem[]>([]);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [correctHits, setCorrectHits] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const gameAreaRef = useRef<HTMLDivElement>(null);

    const totalWords = Math.min(flashcards.length, 10);
    const currentCard = flashcards[currentIndex];

    // Timer
    useEffect(() => {
        if (gameOver) return;
        const timer = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
        return () => clearInterval(timer);
    }, [gameOver]);

    // Spawn items
    useEffect(() => {
        if (gameOver || !currentCard) return;

        const spawnItem = () => {
            const correctAnswer = currentCard.back_text;
            const wrongAnswers = flashcards
                .filter(f => f.id !== currentCard.id)
                .map(f => f.back_text)
                .slice(0, 3);

            const allAnswers = [correctAnswer, ...wrongAnswers];
            const randomAnswer = allAnswers[Math.floor(Math.random() * allAnswers.length)];

            const newItem: FallingItem = {
                id: `item-${Date.now()}-${Math.random()}`,
                text: randomAnswer,
                isCorrect: randomAnswer === correctAnswer,
                x: 10 + Math.random() * 80,
                y: -10,
                speed: 0.5 + Math.random() * 0.5,
                isSliced: false
            };

            setItems(prev => [...prev, newItem]);
        };

        const spawnInterval = setInterval(spawnItem, 1500);
        return () => clearInterval(spawnInterval);
    }, [currentIndex, currentCard, gameOver, flashcards]);

    // Move items
    useEffect(() => {
        if (gameOver) return;

        const moveInterval = setInterval(() => {
            setItems(prev => {
                const updated = prev.map(item => ({
                    ...item,
                    y: item.y + item.speed
                }));

                // Check for missed items
                updated.forEach(item => {
                    if (item.y > 100 && !item.isSliced && item.isCorrect) {
                        setLives(l => {
                            const newLives = l - 1;
                            if (newLives <= 0) {
                                setGameOver(true);
                            }
                            return newLives;
                        });
                    }
                });

                return updated.filter(item => item.y <= 110);
            });
        }, 50);

        return () => clearInterval(moveInterval);
    }, [gameOver]);

    const handleSlice = (item: FallingItem) => {
        if (item.isSliced) return;

        setItems(prev => prev.map(i =>
            i.id === item.id ? { ...i, isSliced: true } : i
        ));

        if (item.isCorrect) {
            setScore(prev => prev + 100);
            setCorrectHits(prev => prev + 1);

            // Move to next word
            if (currentIndex < totalWords - 1) {
                setTimeout(() => setCurrentIndex(prev => prev + 1), 500);
            } else {
                // Game complete
                const timeBonus = Math.max(0, 1000 - elapsedTime * 10);
                onComplete(score + 100 + timeBonus, correctHits + 1, totalWords);
            }
        } else {
            setLives(prev => {
                const newLives = prev - 1;
                if (newLives <= 0) {
                    setGameOver(true);
                }
                return newLives;
            });
        }
    };

    // Game over
    useEffect(() => {
        if (gameOver) {
            const timeBonus = Math.max(0, 500 - elapsedTime * 5);
            onComplete(score + timeBonus, correctHits, totalWords);
        }
    }, [gameOver]);

    if (!currentCard) {
        return <div className="text-white text-center">กำลังโหลด...</div>;
    }

    return (
        <div className="max-w-xl mx-auto py-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span>{elapsedTime}s</span>
                </div>
                <div className="flex items-center gap-1">
                    {Array(3).fill(null).map((_, i) => (
                        <Heart
                            key={i}
                            className={`w-5 h-5 ${i < lives ? 'text-red-500 fill-red-500' : 'text-slate-600'}`}
                        />
                    ))}
                </div>
                <span className="text-white font-bold">{score} pts</span>
            </div>

            {/* Target word */}
            <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-4 text-center">
                <p className="text-slate-400 text-sm mb-1">ฟันคำที่ตรงกับ</p>
                <p className="text-xl font-bold text-white">{currentCard.front_text}</p>
            </div>

            {/* Game Area */}
            <div
                ref={gameAreaRef}
                className="relative h-[400px] bg-gradient-to-b from-slate-800/50 to-purple-900/50 rounded-2xl overflow-hidden border border-white/10"
            >
                <AnimatePresence>
                    {items.map(item => (
                        <motion.button
                            key={item.id}
                            onClick={() => handleSlice(item)}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                                opacity: item.isSliced ? 0 : 1,
                                scale: item.isSliced ? 0 : 1,
                                rotate: item.isSliced ? 720 : 0
                            }}
                            exit={{ opacity: 0, scale: 0 }}
                            className={`absolute px-3 py-2 rounded-xl font-bold text-sm transition-all cursor-pointer ${item.isSliced
                                    ? item.isCorrect
                                        ? 'bg-green-500/50'
                                        : 'bg-red-500/50'
                                    : 'bg-gradient-to-br from-amber-400 to-orange-500 text-white hover:scale-110'
                                }`}
                            style={{
                                left: `${item.x}%`,
                                top: `${item.y}%`,
                                transform: 'translateX(-50%)'
                            }}
                        >
                            <Sword className="w-4 h-4 inline mr-1" />
                            {item.text}
                        </motion.button>
                    ))}
                </AnimatePresence>

                {/* Instructions */}
                <div className="absolute bottom-4 left-0 right-0 text-center text-slate-400 text-sm">
                    กดคำที่ถูกต้องเพื่อฟัน!
                </div>
            </div>
        </div>
    );
}
