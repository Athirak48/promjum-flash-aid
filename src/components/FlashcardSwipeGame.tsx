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
            <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-900 overflow-auto flex items-center justify-center p-4">
                <BackgroundDecorations />
                <Card className="max-w-lg w-full shadow-2xl relative z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-0 rounded-3xl overflow-hidden">
                    <div className="p-8 text-center space-y-6">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            เสร็จสิ้น!
                        </h2>

                        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white">
                            <div className="text-5xl font-bold mb-2">{successRate}%</div>
                            <div className="text-lg opacity-90">อัตราความสำเร็จ</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-green-50 dark:bg-green-900/30 rounded-2xl p-4 border border-green-200 dark:border-green-800">
                                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                                <div className="text-3xl font-bold text-green-600 dark:text-green-400">{remembered}</div>
                                <div className="text-sm text-green-700 dark:text-green-300 mt-1">จำได้</div>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/30 rounded-2xl p-4 border border-red-200 dark:border-red-800">
                                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
                                <div className="text-3xl font-bold text-red-600 dark:text-red-400">{needPractice}</div>
                                <div className="text-sm text-red-700 dark:text-red-300 mt-1">ต้องฝึก</div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                onClick={handleRestart}
                                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
                            >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                เล่นอีกครั้ง
                            </Button>
                            <Button
                                onClick={onClose}
                                variant="outline"
                                className="flex-1 h-12 rounded-xl border-2"
                            >
                                <X className="h-4 w-4 mr-2" />
                                ปิด
                            </Button>
                        </div>
                    </div>
                </Card>
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
                                            <div className="text-6xl font-bold mb-4">{currentCard.front_text}</div>
                                            <div className="text-sm opacity-75 mt-4">คลิกเพื่อดูคำแปล</div>
                                        </div>
                                    </Card>

                                    {/* Back side */}
                                    <Card
                                        className="absolute inset-0 backface-hidden bg-white dark:bg-slate-800 border-0 shadow-2xl rounded-3xl flex items-center justify-center p-8"
                                        style={{ transform: 'rotateY(180deg)' }}
                                    >
                                        <div className="text-center">
                                            <div className="text-5xl font-bold text-slate-800 dark:text-white mb-4">
                                                {currentCard.back_text}
                                            </div>
                                            <div className="text-lg text-slate-500 dark:text-slate-400 mt-4">
                                                {currentCard.front_text}
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
