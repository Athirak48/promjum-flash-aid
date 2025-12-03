import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Check, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';

interface VocabItem {
    id: string;
    word: string;
    meaning: string;
}

interface ReviewResult {
    word: string;
    meaning: string;
    remembered: boolean;
    attemptCount: number;
    missCount: number;
}

export default function AIListeningFlashcardPlayPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { language } = useLanguage();

    // Get vocabulary from navigation state
    const initialVocab: VocabItem[] = location.state?.selectedVocab || [];

    const [queue, setQueue] = useState<VocabItem[]>(() =>
        [...initialVocab].sort(() => Math.random() - 0.5)
    );
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [results, setResults] = useState<ReviewResult[]>([]);
    const [completedCount, setCompletedCount] = useState(0);
    const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

    const currentCard = queue[currentIndex];
    const totalCards = initialVocab.length;
    const progress = (completedCount / totalCards) * 100;

    const handleSwipe = (remembered: boolean) => {
        if (!currentCard) return;

        // Set swipe direction for exit animation
        setSwipeDirection(remembered ? 'right' : 'left');

        // Update results with miss count
        setResults(prev => {
            const existing = prev.find(r => r.word === currentCard.word);
            if (existing) {
                return prev.map(r => r.word === currentCard.word
                    ? {
                        ...r,
                        remembered: remembered && r.remembered,
                        attemptCount: r.attemptCount + 1,
                        missCount: remembered ? r.missCount : r.missCount + 1
                    }
                    : r
                );
            }
            return [...prev, {
                word: currentCard.word,
                meaning: currentCard.meaning,
                remembered,
                attemptCount: 1,
                missCount: remembered ? 0 : 1
            }];
        });

        if (remembered) {
            setCompletedCount(prev => prev + 1);
        }

        // Wait for exit animation then move to next card
        setTimeout(() => {
            if (remembered) {
                // Remove from queue
                if (currentIndex < queue.length - 1) {
                    setQueue(prev => prev.filter((_, i) => i !== currentIndex));
                } else if (queue.length > 1) {
                    setQueue(prev => prev.filter((_, i) => i !== currentIndex));
                    setCurrentIndex(0);
                } else {
                    // All done
                    navigateToSummary();
                }
            } else {
                // Move to end of queue
                setQueue(prev => {
                    const newQueue = [...prev];
                    const card = newQueue.splice(currentIndex, 1)[0];
                    newQueue.push(card);
                    return newQueue;
                });
            }

            setIsFlipped(false);
            setSwipeDirection(null);
        }, 300);
    };

    const navigateToSummary = () => {
        navigate('/ai-listening-flashcard-summary', {
            state: {
                results,
                totalCards,
                selectedVocab: initialVocab
            }
        });
    };

    useEffect(() => {
        if (queue.length === 0 || (completedCount >= totalCards)) {
            navigateToSummary();
        }
    }, [queue, completedCount]);

    const handleDragEnd = (event: any, info: PanInfo) => {
        const { offset, velocity } = info;

        if (Math.abs(offset.x) > 100 || Math.abs(velocity.x) > 500) {
            handleSwipe(offset.x > 0);
        }
    };

    if (!currentCard) return null;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="border-b bg-card sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate('/ai-listening-section2-intro')}
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <h1 className="text-xl font-bold">
                                {language === 'th' ? 'ทวน Flashcard' : 'Flashcard Review'}
                            </h1>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {completedCount}/{totalCards}
                        </div>
                    </div>
                    <Progress value={progress} className="mt-2 h-2" />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center">
                <div className="w-full max-w-md">
                    {/* Card Stack */}
                    <div className="relative h-80 mb-8">
                        {/* Current card */}
                        <AnimatePresence mode="wait">
                            {!swipeDirection && (
                                <motion.div
                                    key={`${currentCard.id}-${isFlipped}`}
                                    initial={{ scale: 0.8, opacity: 0, z: -100 }}
                                    animate={{ scale: 1, opacity: 1, z: 0 }}
                                    exit={swipeDirection ? {
                                        x: swipeDirection === 'right' ? 500 : -500,
                                        opacity: 0,
                                        rotate: swipeDirection === 'right' ? 15 : -15
                                    } : {
                                        scale: 0.8,
                                        opacity: 0
                                    }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 30
                                    }}
                                    drag={isFlipped ? "x" : false}
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragElastic={0.7}
                                    onDragEnd={handleDragEnd}
                                    whileDrag={{ scale: 1.05 }}
                                    className="absolute inset-0 cursor-grab active:cursor-grabbing"
                                >
                                    <Card
                                        className="h-full shadow-lg cursor-pointer relative overflow-hidden"
                                        onClick={() => !isFlipped && setIsFlipped(true)}
                                    >
                                        <div className="h-full flex flex-col items-center justify-center p-8">
                                            <p className="text-4xl font-bold text-center mb-4">
                                                {isFlipped ? currentCard.meaning : currentCard.word}
                                            </p>
                                            {!isFlipped && (
                                                <p className="text-sm text-muted-foreground">
                                                    {language === 'th' ? 'แตะเพื่อดูความหมาย' : 'Tap to see meaning'}
                                                </p>
                                            )}
                                        </div>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Controls */}
                    {isFlipped && !swipeDirection && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-center gap-4"
                        >
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => handleSwipe(false)}
                                className="bg-red-50 border-red-200 hover:bg-red-100 text-red-600 dark:bg-red-950 dark:border-red-900 dark:hover:bg-red-900"
                            >
                                <X className="h-5 w-5 mr-2" />
                                {language === 'th' ? 'จำไม่ได้' : "Don't Know"}
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => handleSwipe(true)}
                                className="bg-green-50 border-green-200 hover:bg-green-100 text-green-600 dark:bg-green-950 dark:border-green-900 dark:hover:bg-green-900"
                            >
                                <Check className="h-5 w-5 mr-2" />
                                {language === 'th' ? 'จำได้' : 'Know'}
                            </Button>
                        </motion.div>
                    )}

                    {/* Instructions */}
                    <p className="text-center text-sm text-muted-foreground mt-6">
                        {!isFlipped
                            ? (language === 'th' ? 'แตะการ์ดเพื่อดูความหมาย' : 'Tap card to see meaning')
                            : (language === 'th' ? 'ปัดซ้าย/ขวา หรือกดปุ่ม' : 'Swipe or tap buttons')
                        }
                    </p>
                </div>
            </main>
        </div>
    );
}
