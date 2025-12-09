
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useIsMobile } from '@/hooks/use-mobile';
import {
    X,
    Edit3,
    Star,
    ChevronLeft,
    ChevronRight,
    SkipBack,
    SkipForward,
    Play,
    Pause,
    Maximize,
    Settings,
    RotateCcw,
    Check,
    X as XIcon,
    MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useSRSProgress } from '@/hooks/useSRSProgress';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface FlashcardData {
    id: string;
    front: string;
    back: string;
    frontImage?: string | null;
    backImage?: string | null;
    isFavorite?: boolean;
    isUserFlashcard?: boolean;
}

interface FlashcardReviewPageProps {
    cards: FlashcardData[];
    onClose: () => void;
    onComplete?: (results: any) => void;
    setId?: string;
}

export function FlashcardReviewPage({ cards, onClose, onComplete, setId }: FlashcardReviewPageProps) {
    const { updateFromFlashcardReview } = useSRSProgress();
    const [reviewQueue, setReviewQueue] = useState<FlashcardData[]>(cards);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [trackProgress, setTrackProgress] = useState(true);
    const [isAutoPlay, setIsAutoPlay] = useState(false);
    const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
    const [progress, setProgress] = useState({ correct: 0, incorrect: 0 });
    const [showSwipeFeedback, setShowSwipeFeedback] = useState<'left' | 'right' | null>(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const isMobile = useIsMobile();
    const [totalCards] = useState(cards.length);

    // Motion values for drag animation
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

    // Track attempt counts for each card (for SRS scoring)
    const attemptCounts = useRef<Map<string, number>>(new Map());

    // Timer for tracking time spent on each card
    const cardStartTime = useRef<number>(Date.now());
    const cardTimings = useRef<Map<string, number>>(new Map());
    const missedCardIds = useRef<Set<string>>(new Set());

    // Reset x motion value and timer when current index changes
    useEffect(() => {
        x.set(0);
        cardStartTime.current = Date.now();
    }, [currentIndex, x]);

    // Save progress when review is completed
    useEffect(() => {
        const saveProgress = async () => {
            if (!isCompleted || !setId || !trackProgress) return;

            try {
                const { supabase } = await import('@/integrations/supabase/client');
                const progressPercentage = Math.round((progress.correct / totalCards) * 100);
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    await supabase
                        .from('user_flashcard_sets')
                        .update({
                            progress: progressPercentage,
                            last_reviewed: new Date().toISOString()
                        })
                        .eq('id', setId)
                        .eq('user_id', user.id);

                    if (onComplete) {
                        onComplete({ progress: progressPercentage, ...progress });
                    }
                }
            } catch (error) {
                console.error('Error updating progress:', error);
            }
        };

        saveProgress();
    }, [isCompleted, setId, trackProgress, progress.correct, totalCards, onComplete]);

    const currentCard = reviewQueue[currentIndex];

    // Auto-play functionality
    useEffect(() => {
        if (isAutoPlay && !isFlipped) {
            const timer = setTimeout(() => {
                setIsFlipped(true);
            }, 2000);
            return () => clearTimeout(timer);
        }
        if (isAutoPlay && isFlipped) {
            const timer = setTimeout(() => {
                handleNext();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isAutoPlay, isFlipped, currentIndex]);

    // Keyboard controls
    useEffect(() => {
        if (isCompleted) return; // Disable keyboard controls when completed

        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Tab' || e.key === ' ') {
                e.preventDefault();
                setIsFlipped(!isFlipped);
            } else if (e.key === 'ArrowLeft') {
                handleKnow(false);
            } else if (e.key === 'ArrowRight') {
                handleKnow(true);
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isFlipped, isCompleted]);

    const handleNext = () => {
        if (currentIndex < reviewQueue.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsFlipped(false);
            setSwipeDirection(null);
        } else {
            // Reached the end, mark as completed
            setIsCompleted(true);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setIsFlipped(false);
            setSwipeDirection(null);
        }
    };

    const handleKnow = async (knows: boolean) => {
        const currentCard = reviewQueue[currentIndex];

        // Calculate time taken
        const endTime = Date.now();
        const timeTakenSeconds = (endTime - cardStartTime.current) / 1000;

        // Track attempt count for this card
        const currentAttempts = attemptCounts.current.get(currentCard.id) || 0;
        attemptCounts.current.set(currentCard.id, currentAttempts + 1);

        // Store timing for first attempt only
        if (currentAttempts === 0) {
            cardTimings.current.set(currentCard.id, timeTakenSeconds);
        }

        // Show feedback first
        setShowSwipeFeedback(knows ? 'right' : 'left');

        if (!knows) {
            missedCardIds.current.add(currentCard.id);
        }

        if (trackProgress) {
            setProgress(prev => ({
                ...prev,
                correct: knows ? prev.correct + 1 : prev.correct,
                incorrect: !knows ? prev.incorrect + 1 : prev.incorrect
            }));
        }

        setSwipeDirection(knows ? 'right' : 'left');

        // Update SRS based on new scoring:
        // Q=3: Correct first attempt ≤7s | Q=1: Correct first attempt >7s | Q=0: Wrong or subsequent
        const attemptCount = attemptCounts.current.get(currentCard.id) || 1;
        const firstAttemptTime = cardTimings.current.get(currentCard.id) ?? timeTakenSeconds;
        await updateFromFlashcardReview(currentCard.id, knows, attemptCount, firstAttemptTime, currentCard.isUserFlashcard);

        // Hide feedback and move to next card after delay
        setTimeout(() => {
            setShowSwipeFeedback(null);

            if (!knows) {
                // If user doesn't know, move card to end of queue (Q=0 must be reviewed again)
                if (reviewQueue.length === 1) {
                    // Only one card left, mark as completed
                    setIsCompleted(true);
                } else {
                    setReviewQueue(prev => {
                        const newQueue = [...prev];
                        const card = newQueue[currentIndex];
                        // Remove current card and add to end
                        newQueue.splice(currentIndex, 1);
                        newQueue.push(card);
                        return newQueue;
                    });
                    // Stay at same index (which now shows next card), unless we're at the end
                    if (currentIndex >= reviewQueue.length - 1) {
                        setCurrentIndex(0);
                    }
                    setIsFlipped(false);
                    setSwipeDirection(null);
                }
            } else {
                // If user knows, remove card from queue
                if (reviewQueue.length === 1) {
                    // Last card, mark as completed
                    setIsCompleted(true);
                } else {
                    setReviewQueue(prev => {
                        const newQueue = [...prev];
                        newQueue.splice(currentIndex, 1);
                        return newQueue;
                    });

                    // Adjust index if we removed the last card
                    if (currentIndex >= reviewQueue.length - 1) {
                        setCurrentIndex(Math.max(0, reviewQueue.length - 2));
                    }
                    setIsFlipped(false);
                    setSwipeDirection(null);
                }
            }
        }, 200); // Faster transition to match animation
    };

    const handleDragEnd = (event: any, info: any) => {
        const offset = info.offset.x;
        const velocity = info.velocity.x;

        if (offset > 100 || velocity > 500) {
            handleKnow(true);
        } else if (offset < -100 || velocity < -500) {
            handleKnow(false);
        }
    };

    const handleRestart = () => {
        setReviewQueue(cards);
        setCurrentIndex(0);
        setIsFlipped(false);
        setSwipeDirection(null);
        setProgress({ correct: 0, incorrect: 0 });
        setIsCompleted(false);
        missedCardIds.current.clear();
        attemptCounts.current.clear();
        cardTimings.current.clear();
        cardStartTime.current = Date.now();
        x.set(0);
    };

    const handleReviewMissed = () => {
        const missedCards = cards.filter(card => missedCardIds.current.has(card.id));
        if (missedCards.length > 0) {
            setReviewQueue(missedCards);
            setCurrentIndex(0);
            setIsFlipped(false);
            setSwipeDirection(null);
            setProgress({ correct: 0, incorrect: 0 });
            setIsCompleted(false);
            missedCardIds.current.clear();
            attemptCounts.current.clear();
            cardTimings.current.clear();
            cardStartTime.current = Date.now();
            x.set(0);
        }
    };

    const handleSwipe = (direction: 'left' | 'right') => {
        handleKnow(direction === 'right');
    };

    const handleCardTap = (e?: React.MouseEvent | React.TouchEvent) => {
        if (isCompleted) return; // Disable card interaction when completed
        // Flip on all devices; ignore clicks on action buttons inside the card
        const target = (e?.target as HTMLElement | null);
        if (target && target.closest('button,[role="button"]')) return;
        setIsFlipped((prev) => !prev);
    };

    if (!currentCard && !isCompleted) return null;

    // Show completion screen when all cards are reviewed
    if (isCompleted) {
        const accuracy = progress.correct + progress.incorrect > 0
            ? Math.round((progress.correct / (progress.correct + progress.incorrect)) * 100)
            : 0;

        const circleCircumference = 2 * Math.PI * 40; // radius 40
        const strokeDashoffset = circleCircumference - (accuracy / 100) * circleCircumference;

        return (
            <div className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-8 bg-card rounded-[2rem] p-8 sm:p-12 shadow-2xl max-w-md w-full border border-border/50 relative overflow-hidden"
                >
                    {/* Background decoration */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400" />

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="relative"
                    >
                        <div className="relative w-40 h-40 mx-auto mb-6 flex items-center justify-center">
                            {/* Progress Ring */}
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="40"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    className="text-muted/20"
                                />
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="40"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    strokeDasharray={circleCircumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    className={`transition-all duration-1000 ease-out ${accuracy >= 80 ? 'text-green-500' :
                                        accuracy >= 50 ? 'text-yellow-500' : 'text-red-500'
                                        }`}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-bold">{accuracy}%</span>
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">ความแม่นยำ</span>
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold mb-2">ยอดเยี่ยมมาก! 🎉</h2>
                        <p className="text-muted-foreground">
                            คุณทบทวนครบ {cards.length} ใบแล้ว
                        </p>
                    </motion.div>

                    {trackProgress && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="grid grid-cols-2 gap-4"
                        >
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl border border-green-100 dark:border-green-900/50">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">{progress.correct}</div>
                                <div className="text-xs font-medium text-green-700 dark:text-green-300">จำได้</div>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-100 dark:border-red-900/50">
                                <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">{progress.incorrect}</div>
                                <div className="text-xs font-medium text-red-700 dark:text-red-300">จำไม่ได้</div>
                            </div>
                        </motion.div>
                    )}

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="space-y-3 pt-4"
                    >
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                onClick={handleRestart}
                                variant="outline"
                                className="w-full py-6 text-base font-semibold rounded-xl hover:bg-muted border-2"
                            >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                ทบทวนใหม่
                            </Button>
                            <Button
                                onClick={handleReviewMissed}
                                disabled={progress.incorrect === 0}
                                variant="outline"
                                className="w-full py-6 text-base font-semibold rounded-xl hover:bg-muted border-2 disabled:opacity-50"
                            >
                                <XIcon className="mr-2 h-4 w-4" />
                                ทบทวนที่ผิด
                            </Button>
                        </div>

                        <Button
                            onClick={onClose}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-bold rounded-xl shadow-lg shadow-primary/20"
                        >
                            กลับไปหน้าหลัก
                        </Button>
                    </motion.div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 flex flex-col">
            {/* Top Bar */}
            <div className="flex items-center justify-between p-4 sm:p-6 z-10">
                <div className="flex items-center gap-4 flex-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="rounded-full hover:bg-muted shrink-0"
                    >
                        <X className="h-5 w-5" />
                    </Button>

                    {/* Progress Bar */}
                    <div className="flex-1 max-w-xs sm:max-w-md">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1.5 font-medium">
                            <span>ความคืบหน้า</span>
                            <span>{progress.correct} / {totalCards}</span>
                        </div>
                        <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-primary rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${(progress.correct / totalCards) * 100}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {trackProgress && (
                        <div className="flex items-center gap-3">
                            <motion.div
                                key={`correct-${progress.correct}`}
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className="flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-full border border-green-200 dark:border-green-800"
                            >
                                <div className="p-0.5 bg-green-500 rounded-full text-white">
                                    <Check className="w-3 h-3" strokeWidth={3} />
                                </div>
                                <span className="text-sm font-bold text-green-700 dark:text-green-400">{progress.correct}</span>
                            </motion.div>

                            <motion.div
                                key={`incorrect-${progress.incorrect}`}
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className="flex items-center gap-1.5 bg-red-100 dark:bg-red-900/30 px-3 py-1.5 rounded-full border border-red-200 dark:border-red-800"
                            >
                                <div className="p-0.5 bg-red-500 rounded-full text-white">
                                    <X className="w-3 h-3" strokeWidth={3} />
                                </div>
                                <span className="text-sm font-bold text-red-700 dark:text-red-400">{progress.incorrect}</span>
                            </motion.div>
                        </div>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                                <MoreHorizontal className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>การตั้งค่า</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <div className="flex items-center justify-between px-2 py-2">
                                <span className="text-sm">ติดตามผล</span>
                                <Switch
                                    checked={trackProgress}
                                    onCheckedChange={setTrackProgress}
                                />
                            </div>
                            <div className="flex items-center justify-between px-2 py-2">
                                <span className="text-sm">เล่นอัตโนมัติ</span>
                                <Switch
                                    checked={isAutoPlay}
                                    onCheckedChange={setIsAutoPlay}
                                />
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
                <div className="w-full max-w-3xl relative h-[60vh] sm:h-[65vh] perspective-1000">
                    {/* Stacked Cards Effect */}
                    <AnimatePresence>
                        {reviewQueue.length > currentIndex + 1 && (
                            <motion.div
                                key="stack-1"
                                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                                animate={{ scale: 0.95, y: 10, opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-card border shadow-lg rounded-3xl z-0"
                                style={{ transformOrigin: 'bottom center' }}
                            />
                        )}
                        {reviewQueue.length > currentIndex + 2 && (
                            <motion.div
                                key="stack-2"
                                initial={{ scale: 0.85, y: 40, opacity: 0 }}
                                animate={{ scale: 0.9, y: 20, opacity: 0.5 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-card border shadow-md rounded-3xl -z-10"
                                style={{ transformOrigin: 'bottom center' }}
                            />
                        )}
                    </AnimatePresence>

                    {/* Swipe Feedback Overlay */}
                    <AnimatePresence>
                        {showSwipeFeedback && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
                            >
                                <div className={`text-4xl sm:text-6xl font-bold px-8 py-6 rounded-3xl backdrop-blur-md shadow-2xl ${showSwipeFeedback === 'left'
                                    ? 'text-red-500 bg-red-50/90 border-4 border-red-100'
                                    : 'text-green-500 bg-green-50/90 border-4 border-green-100'
                                    }`}>
                                    {showSwipeFeedback === 'left' ? 'จำไม่ได้' : 'จำได้!'}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentCard.id}
                            style={{ x, rotate, opacity }}
                            drag={swipeDirection ? false : "x"}
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.7}
                            onDragEnd={handleDragEnd}
                            initial={{
                                opacity: 1,
                                scale: 0.95,
                                y: 10,
                                x: 0
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                                x: swipeDirection === 'left' ? -1000 : swipeDirection === 'right' ? 1000 : 0,
                                rotate: swipeDirection === 'left' ? -45 : swipeDirection === 'right' ? 45 : 0
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.5,
                                x: swipeDirection === 'left' ? -1000 : swipeDirection === 'right' ? 1000 : 0,
                                transition: { duration: 0.2 }
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 20,
                                mass: 0.8
                            }}
                            className="h-full w-full absolute top-0 left-0 z-10"
                        >
                            <Card
                                className="h-full w-full bg-card border shadow-xl hover:shadow-2xl transition-shadow duration-300 cursor-grab active:cursor-grabbing overflow-hidden rounded-3xl relative group"
                                onClick={handleCardTap}
                            >
                                <CardContent className="h-full p-0">
                                    <motion.div
                                        initial={false}
                                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                                        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                                        className="h-full w-full relative"
                                        style={{ transformStyle: 'preserve-3d' }}
                                    >
                                        {/* Front Face */}
                                        <div
                                            className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 sm:p-12 bg-gradient-to-br from-background via-background to-muted/30"
                                            style={{ backfaceVisibility: 'hidden' }}
                                        >
                                            {currentCard.frontImage && (
                                                <div className="relative w-full h-1/2 mb-6">
                                                    <img
                                                        src={currentCard.frontImage}
                                                        alt="Front"
                                                        className="w-full h-full object-contain rounded-xl"
                                                    />
                                                </div>
                                            )}
                                            <h2 className="text-3xl sm:text-5xl font-bold text-foreground text-center leading-tight">
                                                {currentCard.front}
                                            </h2>
                                            <p className="absolute bottom-8 text-sm text-muted-foreground font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                แตะเพื่อดูคำตอบ
                                            </p>
                                        </div>

                                        {/* Back Face */}
                                        <div
                                            className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 sm:p-12 bg-gradient-to-br from-primary/5 via-background to-background"
                                            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                        >
                                            {currentCard.backImage && (
                                                <div className="relative w-full h-1/2 mb-6">
                                                    <img
                                                        src={currentCard.backImage}
                                                        alt="Back"
                                                        className="w-full h-full object-contain rounded-xl"
                                                    />
                                                </div>
                                            )}
                                            <h2 className="text-3xl sm:text-5xl font-bold text-primary text-center leading-tight">
                                                {currentCard.back}
                                            </h2>
                                        </div>
                                    </motion.div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom Floating Controls */}
            <div className="p-6 flex justify-center pb-8 sm:pb-10">
                <div className="flex items-center gap-4 sm:gap-6 bg-card/80 backdrop-blur-md border shadow-lg rounded-full px-6 py-3 sm:px-8 sm:py-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleKnow(false)}
                        className="h-12 w-12 sm:h-14 sm:w-14 rounded-full border-2 border-red-100 bg-red-50 hover:bg-red-100 hover:border-red-200 text-red-600 transition-all hover:scale-105"
                        title="จำไม่ได้"
                    >
                        <XIcon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.5} />
                    </Button>

                    <div className="w-px h-8 bg-border mx-2" />

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                        className="h-10 w-10 rounded-full text-muted-foreground hover:text-foreground"
                    >
                        <SkipBack className="h-5 w-5" />
                    </Button>

                    <Button
                        variant="default"
                        size="icon"
                        onClick={() => setIsFlipped(!isFlipped)}
                        className="h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-glow bg-primary hover:bg-primary/90 transition-all hover:scale-105"
                        title="พลิกการ์ด"
                    >
                        <RotateCcw className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.5} />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleNext}
                        disabled={currentIndex === reviewQueue.length - 1}
                        className="h-10 w-10 rounded-full text-muted-foreground hover:text-foreground"
                    >
                        <SkipForward className="h-5 w-5" />
                    </Button>

                    <div className="w-px h-8 bg-border mx-2" />

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleKnow(true)}
                        className="h-12 w-12 sm:h-14 sm:w-14 rounded-full border-2 border-green-100 bg-green-50 hover:bg-green-100 hover:border-green-200 text-green-600 transition-all hover:scale-105"
                        title="จำได้"
                    >
                        <Check className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.5} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
