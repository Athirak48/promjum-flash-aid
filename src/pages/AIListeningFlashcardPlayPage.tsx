import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Check, X, RotateCcw } from 'lucide-react';
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
}

export default function AIListeningFlashcardPlayPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { language } = useLanguage();

    // Get vocabulary from navigation state or use mock data
    const initialVocab: VocabItem[] = location.state?.selectedVocab || [
        { id: '1', word: 'happy', meaning: 'มีความสุข' },
        { id: '2', word: 'create', meaning: 'สร้าง' },
        { id: '3', word: 'method', meaning: 'วิธีการ' },
        { id: '4', word: 'adjust', meaning: 'ปรับ' },
        { id: '5', word: 'apple', meaning: 'แอปเปิ้ล' },
        { id: '6', word: 'banana', meaning: 'กล้วย' },
        { id: '7', word: 'cat', meaning: 'แมว' },
        { id: '8', word: 'dog', meaning: 'สุนัข' },
        { id: '9', word: 'elephant', meaning: 'ช้าง' },
        { id: '10', word: 'fish', meaning: 'ปลา' },
    ];

    const [queue, setQueue] = useState<VocabItem[]>(() => 
        [...initialVocab].sort(() => Math.random() - 0.5)
    );
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [results, setResults] = useState<ReviewResult[]>([]);
    const [completedCount, setCompletedCount] = useState(0);
    const [overlayText, setOverlayText] = useState('');
    const [overlayColor, setOverlayColor] = useState('');

    const currentCard = queue[currentIndex];
    const totalCards = initialVocab.length;
    const progress = (completedCount / totalCards) * 100;

    const handleSwipe = (remembered: boolean) => {
        if (!currentCard) return;

        const existingResult = results.find(r => r.word === currentCard.word);
        
        if (remembered) {
            // Mark as completed
            setResults(prev => {
                const existing = prev.find(r => r.word === currentCard.word);
                if (existing) {
                    return prev.map(r => r.word === currentCard.word 
                        ? { ...r, remembered: true }
                        : r
                    );
                }
                return [...prev, {
                    word: currentCard.word,
                    meaning: currentCard.meaning,
                    remembered: true,
                    attemptCount: 1
                }];
            });
            setCompletedCount(prev => prev + 1);
            
            // Remove from queue and move to next
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
            setResults(prev => {
                const existing = prev.find(r => r.word === currentCard.word);
                if (existing) {
                    return prev.map(r => r.word === currentCard.word 
                        ? { ...r, attemptCount: r.attemptCount + 1 }
                        : r
                    );
                }
                return [...prev, {
                    word: currentCard.word,
                    meaning: currentCard.meaning,
                    remembered: false,
                    attemptCount: 1
                }];
            });

            // Move card to end
            setQueue(prev => {
                const newQueue = [...prev];
                const card = newQueue.splice(currentIndex, 1)[0];
                newQueue.push(card);
                return newQueue;
            });
        }

        setIsFlipped(false);
        setOverlayText('');
        setOverlayColor('');
    };

    const navigateToSummary = () => {
        navigate('/ai-listening-flashcard-summary', {
            state: { results, totalCards }
        });
    };

    useEffect(() => {
        if (queue.length === 0 || (completedCount >= totalCards)) {
            navigateToSummary();
        }
    }, [queue, completedCount]);

    const handleDrag = (event: any, info: PanInfo) => {
        const { offset } = info;
        if (offset.x > 50) {
            setOverlayText(language === 'th' ? 'จำได้ ✓' : 'Know ✓');
            setOverlayColor('bg-emerald-500/20 text-emerald-600');
        } else if (offset.x < -50) {
            setOverlayText(language === 'th' ? 'จำไม่ได้ ✗' : "Don't Know ✗");
            setOverlayColor('bg-rose-500/20 text-rose-600');
        } else {
            setOverlayText('');
            setOverlayColor('');
        }
    };

    const handleDragEnd = (event: any, info: PanInfo) => {
        const { offset, velocity } = info;
        setOverlayText('');
        setOverlayColor('');

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
                                onClick={() => navigate('/ai-listening-section2-flashcard')}
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
                        {/* Next card preview */}
                        {queue.length > 1 && (
                            <Card className="absolute inset-0 bg-secondary/50 transform translate-x-2 translate-y-2 rotate-1 opacity-50" />
                        )}

                        {/* Current card */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`${currentCard.id}-${isFlipped}`}
                                initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
                                animate={{ rotateY: 0, opacity: 1 }}
                                exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                drag={isFlipped}
                                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                                dragElastic={0.7}
                                onDrag={handleDrag}
                                onDragEnd={handleDragEnd}
                                whileDrag={{ scale: 1.05 }}
                                className="absolute inset-0 cursor-grab active:cursor-grabbing"
                            >
                                <Card
                                    className="h-full shadow-lg cursor-pointer relative overflow-hidden"
                                    onClick={() => !isFlipped && setIsFlipped(true)}
                                >
                                    {/* Overlay */}
                                    {overlayText && (
                                        <div className={`absolute inset-0 flex items-center justify-center z-10 ${overlayColor} backdrop-blur-sm`}>
                                            <span className="text-2xl font-bold">{overlayText}</span>
                                        </div>
                                    )}

                                    <div className="h-full flex flex-col items-center justify-center p-6">
                                        <p className="text-2xl font-bold text-center">
                                            {isFlipped ? currentCard.meaning : currentCard.word}
                                        </p>
                                        {!isFlipped && (
                                            <p className="text-sm text-muted-foreground mt-4">
                                                {language === 'th' ? 'แตะเพื่อดูความหมาย' : 'Tap to see meaning'}
                                            </p>
                                        )}
                                    </div>
                                </Card>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Controls */}
                    {isFlipped && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-center gap-4"
                        >
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => handleSwipe(false)}
                                className="bg-red-500/10 border-red-500 hover:bg-red-500/20 text-red-600"
                            >
                                <X className="h-5 w-5 mr-2" />
                                {language === 'th' ? 'จำไม่ได้' : "Don't Know"}
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => handleSwipe(true)}
                                className="bg-green-500/10 border-green-500 hover:bg-green-500/20 text-green-600"
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
                            : (language === 'th' ? 'ปัดซ้าย (จำไม่ได้) • ปัดขวา (จำได้)' : 'Swipe left (don\'t know) • Swipe right (know)')
                        }
                    </p>
                </div>
            </main>
        </div>
    );
}
