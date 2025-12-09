import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, RotateCcw, X, Trophy, CheckCircle, XCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import BackgroundDecorations from '@/components/BackgroundDecorations';

interface Flashcard {
    id: string;
    front_text: string;
    back_text: string;
    created_at: string;
}

interface FlashcardSwipeGameProps {
    flashcards: Flashcard[];
    onClose: () => void;
    onComplete?: (remembered: number, needPractice: number) => void;
}

export const FlashcardSwipeGame = ({ flashcards, onClose, onComplete }: FlashcardSwipeGameProps) => {
    const { t } = useLanguage();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [swipeOffset, setSwipeOffset] = useState(0);
    const [swipeRotation, setSwipeRotation] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [remembered, setRemembered] = useState(0);
    const [needPractice, setNeedPractice] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

    const cardRef = useRef<HTMLDivElement>(null);
    const startXRef = useRef(0);
    const startYRef = useRef(0);

    const currentCard = flashcards[currentIndex];
    const progress = ((currentIndex) / flashcards.length) * 100;

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isComplete) return;

            switch (e.key) {
                case 'Tab':
                    e.preventDefault();
                    setIsFlipped(!isFlipped);
                    break;
                case ' ':
                    e.preventDefault();
                    setIsFlipped(!isFlipped);
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    handleSwipe('left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    handleSwipe('right');
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFlipped, currentIndex, isComplete]);

    // Mouse/Touch event handlers
    const handleStart = (clientX: number, clientY: number) => {
        setIsDragging(true);
        startXRef.current = clientX;
        startYRef.current = clientY;
    };

    const handleMove = (clientX: number, clientY: number) => {
        if (!isDragging) return;

        const deltaX = clientX - startXRef.current;
        const deltaY = clientY - startYRef.current;

        // Only process horizontal swipes (ignore if moving more vertically)
        if (Math.abs(deltaY) > Math.abs(deltaX)) return;

        setSwipeOffset(deltaX);
        setSwipeRotation(deltaX * 0.05); // Subtle rotation

        if (Math.abs(deltaX) > 50) {
            setSwipeDirection(deltaX > 0 ? 'right' : 'left');
        } else {
            setSwipeDirection(null);
        }
    };

    const handleEnd = () => {
        if (!isDragging) return;
        setIsDragging(false);

        const threshold = 100;
        if (Math.abs(swipeOffset) > threshold) {
            handleSwipe(swipeOffset > 0 ? 'right' : 'left');
        } else {
            // Reset if not swiped far enough
            setSwipeOffset(0);
            setSwipeRotation(0);
            setSwipeDirection(null);
        }
    };

    const handleSwipe = (direction: 'left' | 'right') => {
        // Animate card out
        const targetOffset = direction === 'right' ? 1000 : -1000;
        setSwipeOffset(targetOffset);
        setSwipeRotation(direction === 'right' ? 30 : -30);
        setSwipeDirection(direction);

        // Update counters
        if (direction === 'right') {
            setRemembered(prev => prev + 1);
        } else {
            setNeedPractice(prev => prev + 1);
        }

        // Move to next card after animation
        setTimeout(() => {
            if (currentIndex < flashcards.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setIsFlipped(false);
                setSwipeOffset(0);
                setSwipeRotation(0);
                setSwipeDirection(null);
            } else {
                setIsComplete(true);
                onComplete?.(
                    direction === 'right' ? remembered + 1 : remembered,
                    direction === 'left' ? needPractice + 1 : needPractice
                );
            }
        }, 300);
    };

    const handleRestart = () => {
        setCurrentIndex(0);
        setIsFlipped(false);
        setSwipeOffset(0);
        setSwipeRotation(0);
        setRemembered(0);
        setNeedPractice(0);
        setIsComplete(false);
        setSwipeDirection(null);
    };

    // Summary screen
    if (isComplete) {
        const total = flashcards.length;
        const successRate = Math.round((remembered / total) * 100);

        return (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm overflow-auto flex items-center justify-center p-4 z-50">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl text-center border border-white/50 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-50 to-transparent -z-10"></div>

                    <div className="w-20 h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center mx-auto mb-6 border border-slate-50">
                        <Trophy className="h-10 w-10 text-yellow-500 drop-shadow-sm" />
                    </div>

                    <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">เสร็จสิ้น!</h2>
                    <p className="text-slate-500 mb-6 font-medium text-base">
                        คุณทบทวนคำศัพท์ครบแล้ว
                    </p>

                    <div className="bg-slate-50 rounded-2xl p-4 mb-8 border border-slate-100">
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">อัตราความสำเร็จ</p>
                        <p className="text-2xl font-black text-indigo-600 tracking-tight">{successRate}%</p>
                    </div>

                    <div className="flex flex-row gap-2 justify-center w-full">
                        <Button
                            onClick={handleRestart}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all rounded-xl h-12 text-sm font-bold active:scale-95"
                        >
                            เล่นอีกครั้ง
                        </Button>

                        <Button
                            onClick={onClose}
                            className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-800 border-0 rounded-xl h-12 text-sm font-bold active:scale-95 transition-all"
                        >
                            ปิด
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (!currentCard) return null;

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-900 overflow-hidden">
            <BackgroundDecorations />

            <div className="relative z-10 h-full flex flex-col">
                {/* Header */}
                <div className="p-4 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="rounded-full hover:bg-white/50 dark:hover:bg-slate-800/50"
                    >
                        <X className="h-5 w-5" />
                    </Button>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            <span className="font-bold">{remembered + needPractice}/{flashcards.length}</span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="px-6 pb-4">
                    <Progress value={progress} className="h-2 bg-white/50 dark:bg-slate-800/50" />
                    <div className="text-xs text-center mt-2 text-slate-600 dark:text-slate-400">
                        {currentIndex + 1} / {flashcards.length}
                    </div>
                </div>

                {/* Card Stack Container */}
                <div className="flex-1 flex items-center justify-center px-4 pb-24">
                    <div className="relative w-full max-w-md aspect-[3/4] max-h-[600px]">
                        {/* Background stacked cards */}
                        {[2, 1].map((offset) => {
                            const nextIndex = currentIndex + offset;
                            if (nextIndex >= flashcards.length) return null;

                            return (
                                <div
                                    key={nextIndex}
                                    className="absolute inset-0 rounded-3xl bg-white dark:bg-slate-800 shadow-xl"
                                    style={{
                                        transform: `translateY(${offset * 12}px) scale(${1 - offset * 0.05})`,
                                        opacity: 1 - offset * 0.2,
                                        zIndex: -offset,
                                    }}
                                />
                            );
                        })}

                        {/* Main active card */}
                        <div
                            ref={cardRef}
                            className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
                            style={{
                                transform: `translateX(${swipeOffset}px) rotate(${swipeRotation}deg)`,
                                transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                                zIndex: 10,
                            }}
                            onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
                            onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
                            onMouseUp={handleEnd}
                            onMouseLeave={handleEnd}
                            onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
                            onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
                            onTouchEnd={handleEnd}
                            onClick={() => setIsFlipped(!isFlipped)}
                        >
                            <div className="relative w-full h-full" style={{ perspective: '1000px' }}>
                                <div
                                    className="relative w-full h-full transition-transform duration-500 preserve-3d"
                                    style={{
                                        transformStyle: 'preserve-3d',
                                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                    }}
                                >
                                    {/* Front side */}
                                    <Card className="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 border-0 shadow-2xl rounded-3xl flex items-center justify-center p-8">
                                        <div className="text-center text-white">
                                            <div className="text-6xl font-bold mb-4">{currentCard.back_text}</div>
                                            <div className="text-sm opacity-75 mt-4">คลิกเพื่อดูคำศัพท์</div>
                                        </div>
                                    </Card>

                                    {/* Back side */}
                                    <Card
                                        className="absolute inset-0 backface-hidden bg-white dark:bg-slate-800 border-0 shadow-2xl rounded-3xl flex items-center justify-center p-8"
                                        style={{ transform: 'rotateY(180deg)' }}
                                    >
                                        <div className="text-center">
                                            <div className="text-5xl font-bold text-slate-800 dark:text-white mb-4">
                                                {currentCard.front_text}
                                            </div>
                                            <div className="text-lg text-slate-500 dark:text-slate-400 mt-4">
                                                {currentCard.back_text}
                                            </div>
                                            <div className="text-sm text-slate-400 dark:text-slate-500 mt-4">
                                                คลิกอีกครั้งเพื่อกลับด้านหน้า
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </div>

                            {/* Swipe indicators */}
                            {swipeDirection === 'left' && (
                                <div className="absolute top-1/2 left-8 -translate-y-1/2 bg-red-500 text-white px-6 py-3 rounded-2xl font-bold text-xl shadow-lg rotate-[-15deg]">
                                    ❌ ต้องฝึก
                                </div>
                            )}
                            {swipeDirection === 'right' && (
                                <div className="absolute top-1/2 right-8 -translate-y-1/2 bg-green-500 text-white px-6 py-3 rounded-2xl font-bold text-xl shadow-lg rotate-[15deg]">
                                    ✅ จำได้
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-indigo-100/80 via-purple-100/50 to-transparent dark:from-slate-900/80 dark:via-purple-900/50 backdrop-blur-lg">
                    <div className="max-w-md mx-auto flex items-center justify-center gap-8">
                        <Button
                            onClick={() => handleSwipe('left')}
                            size="lg"
                            className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 shadow-xl hover:scale-110 transition-transform"
                        >
                            <ChevronLeft className="h-8 w-8" />
                        </Button>

                        <div className="text-center">
                            <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                                กด Tab เพื่อพลิก
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-500">
                                ← ไม่จำได้ | จำได้ →
                            </div>
                        </div>

                        <Button
                            onClick={() => handleSwipe('right')}
                            size="lg"
                            className="h-16 w-16 rounded-full bg-green-500 hover:bg-green-600 shadow-xl hover:scale-110 transition-transform"
                        >
                            <ChevronRight className="h-8 w-8" />
                        </Button>
                    </div>
                </div>
            </div>

            <style>{`
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
      `}</style>
        </div>
    );
};
