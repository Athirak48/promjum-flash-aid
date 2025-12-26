import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  X, ChevronLeft, ChevronRight, RotateCcw, Undo2,
  Play, Pause, Flame, Check, MoreHorizontal, ArrowLeft
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import BackgroundDecorations from '@/components/BackgroundDecorations';
import { toast } from 'sonner';

interface FlashcardData {
  id: string;
  front: string;
  back: string;
  partOfSpeech?: string;
  frontImage?: string | null;
  backImage?: string | null;
}

interface FlashcardSwiperProps {
  cards: FlashcardData[];
  onClose: () => void;
  onComplete: (results: {
    correct: number;
    incorrect: number;
    needsReview: number;
    cardStats: Record<string, { missCount: number }>;
  }) => void;
  onAnswer?: (cardId: string, known: boolean, timeTaken: number) => void;
  /** Called when user wants to continue to next phase (for Learning Now flow) */
  onContinue?: (results?: {
    correct: number;
    incorrect: number;
    needsReview: number;
    cardStats: Record<string, { missCount: number }>;
  }) => void;
  /** Called when user wants to review again (for Learning Now flow) */
  onReviewAgain?: () => void;
}

export function FlashcardSwiper({ cards, onClose, onComplete, onAnswer, onContinue, onReviewAgain }: FlashcardSwiperProps) {
  const { t } = useLanguage();

  // Core state
  const [masteredCards, setMasteredCards] = useState<string[]>([]);
  const [reviewQueue, setReviewQueue] = useState<FlashcardData[]>([...cards]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasViewedAnswer, setHasViewedAnswer] = useState(false);

  // Swipe state
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [swipeRotation, setSwipeRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  // Statistics
  const [rememberedCount, setRememberedCount] = useState(0);
  const [needPracticeCount, setNeedPracticeCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [cardStats, setCardStats] = useState<Record<string, { missCount: number }>>({});


  // Auto-play state
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [autoPlaySpeed, setAutoPlaySpeed] = useState<1 | 1.5 | 2>(1);
  const [countdown, setCountdown] = useState(0);

  // History for undo
  const [history, setHistory] = useState<Array<{
    masteredCards: string[];
    reviewQueue: FlashcardData[];
    currentIndex: number;
    stats: { remember: number; needPractice: number; streak: number };
  }>>([]);

  const cardRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cardStartTimeRef = useRef<number>(Date.now());

  const [showTutorial, setShowTutorial] = useState(true);

  useEffect(() => {
    cardStartTimeRef.current = Date.now();
  }, [currentIndex]);

  const handleDismissTutorial = () => {
    setShowTutorial(false);
  };

  const currentCard = reviewQueue[currentIndex];
  const totalCards = cards.length;
  const progress = (masteredCards.length / totalCards) * 100;
  const isComplete = reviewQueue.length === 0;

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Game Control Logic
      if (showTutorial) return;

      if (isComplete) return;

      switch (e.key) {
        case 'Tab':
        case ' ':
          e.preventDefault();
          if (isAutoPlaying) {
            setIsAutoPlaying(false);
          } else {
            const newFlipped = !isFlipped;
            setIsFlipped(newFlipped);
            if (newFlipped) setHasViewedAnswer(true);
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (isFlipped || hasViewedAnswer) handleAnswer(false);
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (isFlipped || hasViewedAnswer) handleAnswer(true);
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          setIsAutoPlaying(!isAutoPlaying);
          break;
        case 'Escape':
          e.preventDefault();
          if (isAutoPlaying) {
            setIsAutoPlaying(false);
          }
          break;
        case '1':
          setAutoPlaySpeed(1);
          break;
        case '2':
          setAutoPlaySpeed(1.5);
          break;
        case '3':
          setAutoPlaySpeed(2);
          break;
      }

      // Ctrl+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, currentIndex, isComplete, isAutoPlaying, showTutorial]);

  // Dedicated Tutorial Key Listener
  useEffect(() => {
    if (!showTutorial) return;

    const handleTutorialKey = (e: KeyboardEvent) => {
      // Tab, Space, Enter, or Escape to dismiss tutorial
      if (e.key === 'Tab' || e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setShowTutorial(false);
      }
    };

    // Use keyup for better reliability
    window.addEventListener('keyup', handleTutorialKey, true);
    return () => window.removeEventListener('keyup', handleTutorialKey, true);
  }, [showTutorial]);

  // Mouse/Touch handlers
  const handleStart = (clientX: number) => {
    if (!isFlipped && !hasViewedAnswer) {
      toast.error("กรุณาพลิกการ์ดเพื่อดูเฉลยก่อน");
      return;
    }
    setIsDragging(true);
    startXRef.current = clientX;
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;

    const deltaX = clientX - startXRef.current;
    setSwipeOffset(deltaX);
    setSwipeRotation(deltaX * 0.05);

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
      handleAnswer(swipeOffset > 0);
    } else {
      resetSwipe();
    }
  };

  const resetSwipe = () => {
    setSwipeOffset(0);
    setSwipeRotation(0);
    setSwipeDirection(null);
  };

  const handleAnswer = (remembered: boolean) => {
    if (!currentCard) return;

    // Update stats if incorrect
    if (!remembered) {
      console.log('Incorrect answer for card:', currentCard.id);
      setCardStats(prev => {
        const newStats = {
          ...prev,
          [currentCard.id]: {
            missCount: (prev[currentCard.id]?.missCount || 0) + 1
          }
        };
        console.log('Updated cardStats:', newStats);
        return newStats;
      });
    } else {
      console.log('Correct answer for card:', currentCard.id);
    }

    if (onAnswer) {
      const timeTaken = (Date.now() - cardStartTimeRef.current) / 1000;
      onAnswer(currentCard.id, remembered, timeTaken);
    }

    // Save state for undo
    setHistory(prev => [...prev, {
      masteredCards: [...masteredCards],
      reviewQueue: [...reviewQueue],
      currentIndex,
      stats: { remember: rememberedCount, needPractice: needPracticeCount, streak },
      cardStats: { ...cardStats }
    }]);

    // Animate card out
    const targetOffset = remembered ? 1000 : -1000;
    setSwipeOffset(targetOffset);
    setSwipeRotation(remembered ? 30 : -30);
    setSwipeDirection(remembered ? 'right' : 'left');

    setTimeout(() => {
      if (remembered) {
        // Mastered!
        setMasteredCards(prev => [...prev, currentCard.id]);
        setRememberedCount(prev => prev + 1);
        setStreak(prev => prev + 1);

        // Remove from queue
        const newQueue = reviewQueue.filter((_, i) => i !== currentIndex);
        setReviewQueue(newQueue);

        if (newQueue.length === 0) {
          // All mastered!
          // We don't call onComplete here anymore, because we want to show the Summary Screen first.
          // The user will click "Finish" to trigger onClose/onComplete.
        } else {
          // Move to next (or loop to start)
          setCurrentIndex(prev => prev >= newQueue.length ? 0 : prev);
        }
      } else {
        // Need more practice - add to end of queue
        setNeedPracticeCount(prev => prev + 1);
        setStreak(0);

        const newQueue = [...reviewQueue];
        const cardToReview = newQueue.splice(currentIndex, 1)[0];
        newQueue.push(cardToReview);
        setReviewQueue(newQueue);

        // Stay at same index (which now has different card)
        if (currentIndex >= newQueue.length) {
          setCurrentIndex(0);
        }
      }

      resetSwipe();
      resetSwipe();
      setIsFlipped(false);
      setHasViewedAnswer(false);
    }, 300);
  };

  const handleUndo = () => {
    if (history.length === 0) return;

    const lastState = history[history.length - 1];
    setMasteredCards(lastState.masteredCards);
    setReviewQueue(lastState.reviewQueue);
    setCurrentIndex(lastState.currentIndex);
    setRememberedCount(lastState.stats.remember);
    setNeedPracticeCount(lastState.stats.needPractice);
    setStreak(lastState.stats.streak);
    if ((lastState as any).cardStats) {
      setCardStats((lastState as any).cardStats);
    }
    setHistory(prev => prev.slice(0, -1));
    setHistory(prev => prev.slice(0, -1));
    setIsFlipped(false);
    setHasViewedAnswer(false); // Reset for the undone card? Or should we keep it? Usually reset.
    resetSwipe();
  };

  if (isComplete) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-[#2e1065] via-[#4c1d95] to-[#1e1b4b] flex items-center justify-center p-4 z-50 backdrop-blur-md">
        <BackgroundDecorations />

        {/* Main Glass Card - Wider */}
        <Card className="max-w-[550px] w-full shadow-[0_0_60px_rgba(168,85,247,0.4)] relative z-10 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] overflow-hidden animate-in zoom-in-95 duration-300">
          {/* Decorative gradients */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-80" />
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-purple-500/30 rounded-full blur-[80px]" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-pink-500/30 rounded-full blur-[80px]" />

          <div className="p-6 text-center space-y-4 relative">
            <div className="text-4xl mb-1 animate-bounce">🎉</div>

            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white drop-shadow-md">
                ยอดเยี่ยมมาก!
              </h2>
              <p className="text-purple-200 text-xs">การฝึกฝนวันนี้เสร็จสิ้นแล้ว</p>
            </div>

            {/* Main Score Card */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-4 text-white relative overflow-hidden group shadow-lg">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-4xl font-bold mb-0.5 drop-shadow-lg text-white">{cards.length - Object.keys(cardStats).length}/{totalCards}</div>
              <div className="text-xs font-medium text-white/80">ปัดขวาครั้งแรก</div>
            </div>

            {/* Two Column Vocabulary Lists */}
            <div className="grid grid-cols-2 gap-3">
              {/* Remembered vocabulary list - LEFT */}
              <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20 text-left flex flex-col max-h-[30vh]">
                <div className="text-xs font-bold text-emerald-300 mb-2 flex items-center gap-1.5 flex-shrink-0">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check className="h-2.5 w-2.5" />
                  </div>
                  คำที่จำได้ ({cards.length - Object.keys(cardStats).length})
                </div>
                <div className="space-y-1.5 overflow-y-auto custom-scrollbar pr-1">
                  {cards.filter(card => !cardStats[card.id]?.missCount).map(card => (
                    <div key={card.id} className="text-[11px] bg-white/5 hover:bg-white/10 transition-colors rounded-lg px-2 py-1.5 border border-white/5">
                      <div className="font-medium text-purple-100 truncate">{card.front}</div>
                      <div className="text-purple-200/70 truncate text-[10px]">{card.back}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missed vocabulary list - RIGHT */}
              <div className="bg-rose-500/10 rounded-xl p-3 border border-rose-500/20 text-left flex flex-col max-h-[30vh]">
                <div className="text-xs font-bold text-rose-300 mb-2 flex items-center gap-1.5 flex-shrink-0">
                  <div className="w-4 h-4 rounded-full bg-rose-500/20 flex items-center justify-center">
                    <X className="h-2.5 w-2.5" />
                  </div>
                  คำที่ลืม ({Object.keys(cardStats).length})
                </div>
                <div className="space-y-1.5 overflow-y-auto custom-scrollbar pr-1">
                  {cards.filter(card => cardStats[card.id]?.missCount > 0).length > 0 ? (
                    cards.filter(card => cardStats[card.id]?.missCount > 0).map(card => (
                      <div key={card.id} className="text-[11px] bg-white/5 hover:bg-white/10 transition-colors rounded-lg px-2 py-1.5 border border-white/5">
                        <div className="font-medium text-purple-100 truncate">{card.front}</div>
                        <div className="text-purple-200/70 truncate text-[10px]">{card.back}</div>
                        <span className="text-rose-300 font-bold text-[9px]">
                          ลืม {cardStats[card.id]?.missCount || 0} ครั้ง
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-[11px] text-rose-200/50 text-center py-3">ไม่มี 🎉</div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => {
                  setMasteredCards([]);
                  setReviewQueue([...cards]);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                  setHasViewedAnswer(false);
                  setRememberedCount(0);
                  setNeedPracticeCount(0);
                  setStreak(0);
                  setCardStats({});
                  setHistory([]);
                  setIsAutoPlaying(false);
                }}
                variant="outline"
                className="flex-1 h-10 text-xs rounded-xl border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-all backdrop-blur-sm"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                ทบทวน
              </Button>

              <Button
                onClick={() => {
                  const results = {
                    correct: rememberedCount,
                    incorrect: needPracticeCount,
                    needsReview: needPracticeCount,
                    cardStats: cardStats
                  };
                  if (onContinue) {
                    onContinue(results);
                  } else {
                    onClose();
                  }
                }}
                className="flex-1 h-10 text-xs rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30 border-0 transition-all hover:scale-[1.02]"
              >
                <span className="mr-1.5">ไปกันต่อ</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!currentCard) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#1a1c2e] via-[#2d1b4e] to-[#1c1a2e]">
      <BackgroundDecorations />

      <div className="relative z-10 h-full flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-4 md:mb-6 px-3 pt-4 gap-2">
          {/* Left: Back Button & Progress */}
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <Button variant="ghost" onClick={onClose} className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-white/10 hover:bg-white/20 text-white shadow-sm flex-shrink-0 border border-white/10">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            <div className="flex flex-col gap-0.5 sm:gap-1 flex-1 max-w-[120px] sm:max-w-[200px]">
              <div className="flex items-center justify-between text-[10px] sm:text-sm font-bold text-white/90">
                <span className="hidden sm:inline">ความคืบหน้า</span>
                <span>{masteredCards.length} / {totalCards}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden backdrop-blur-sm">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-300 ease-in-out shadow-[0_0_10px_rgba(232,121,249,0.5)]"
                  style={{ width: `${(masteredCards.length / totalCards) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right: Stats Section */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            <div className="flex items-center gap-1 bg-emerald-500/20 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-emerald-500/30 backdrop-blur-sm">
              <div className="bg-emerald-500 rounded-full p-0.5">
                <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
              </div>
              <span className="font-bold text-xs sm:text-sm text-emerald-100">{rememberedCount}</span>
            </div>

            <div className="flex items-center gap-1 bg-rose-500/20 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-rose-500/30 backdrop-blur-sm">
              <div className="bg-rose-500 rounded-full p-0.5">
                <X className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
              </div>
              <span className="font-bold text-xs sm:text-sm text-rose-100">{needPracticeCount}</span>
            </div>

            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 text-white/40 hover:text-white hover:bg-white/10">
              <MoreHorizontal className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </div>
        </div>



        {/* Card Stack */}
        <div className="flex-1 flex items-center justify-center px-4 pb-40">
          <div className="relative w-full max-w-[85vw] sm:max-w-sm md:max-w-sm lg:max-w-sm aspect-[3/4] max-h-[60vh] sm:max-h-[450px] md:max-h-[500px] lg:max-h-[500px]">
            {/* Stacked cards behind */}
            {[2, 1].map((offset) => {
              const nextIndex = currentIndex + offset;
              if (nextIndex >= reviewQueue.length) return null;

              return (
                <div
                  key={nextIndex}
                  className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 dark:from-slate-800 dark:via-purple-900/30 dark:to-slate-700 shadow-lg border-2 border-purple-300/70 dark:border-purple-500/40"
                  style={{
                    transform: `translateY(${offset * 12}px) scale(${1 - offset * 0.05})`,
                    opacity: 1 - offset * 0.15,
                    zIndex: -offset,
                  }}
                />
              );
            })}

            {/* Main card */}
            <div
              ref={cardRef}
              className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
              style={{
                transform: `translateX(${swipeOffset}px) rotate(${swipeRotation}deg)`,
                transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                zIndex: 10,
              }}
              onMouseDown={(e) => handleStart(e.clientX)}
              onMouseMove={(e) => handleMove(e.clientX)}
              onMouseUp={handleEnd}
              onMouseLeave={handleEnd}
              onTouchStart={(e) => handleStart(e.touches[0].clientX)}
              onTouchMove={(e) => handleMove(e.touches[0].clientX)}
              onTouchEnd={handleEnd}
              onClick={() => {
                if (!isDragging) {
                  const newFlipped = !isFlipped;
                  setIsFlipped(newFlipped);
                  if (newFlipped) setHasViewedAnswer(true);
                }
              }}
            >
              <div className="relative w-full h-full" style={{ perspective: '1000px' }}>
                <div
                  className="relative w-full h-full transition-transform duration-500"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  {/* Front */}
                  <Card className="absolute inset-0 backface-hidden bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 dark:from-slate-800 dark:via-purple-900/40 dark:to-slate-700 border-2 border-purple-300 dark:border-purple-500/50 shadow-2xl rounded-3xl flex items-center justify-center p-6 sm:p-8 md:p-10 overflow-hidden">
                    {/* Decorative corners like playing cards */}
                    <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-purple-400/60 rounded-tl-lg" />
                    <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-purple-400/60 rounded-tr-lg" />
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-purple-400/60 rounded-bl-lg" />
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-purple-400/60 rounded-br-lg" />

                    {/* Subtle pattern overlay */}
                    <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_center,_#8b5cf6_1px,_transparent_1px)] bg-[length:20px_20px]" />

                    {/* Auto Badge on Card */}
                    {isAutoPlaying && (
                      <div className="absolute top-6 right-6 flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                        <span className="text-xs font-bold text-green-500 tracking-wider">AUTO</span>
                      </div>
                    )}

                    <div className="text-center w-full flex flex-col items-center justify-center h-full">
                      {currentCard.frontImage && (
                        <div className="relative w-full h-32 sm:h-40 md:h-56 lg:h-64 mb-4 flex items-center justify-center">
                          <img
                            src={currentCard.frontImage}
                            alt="Front"
                            className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                          />
                        </div>
                      )}

                      <div className="text-3xl sm:text-4xl md:text-4xl lg:text-4xl font-bold text-slate-800 dark:text-white mb-2 leading-normal py-2 break-words line-clamp-4">
                        {currentCard.front}
                      </div>
                      {currentCard.partOfSpeech && (
                        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/40 border border-purple-200 dark:border-purple-700 mb-4">
                          <span className="text-sm font-semibold text-purple-700 dark:text-purple-300 italic">
                            {currentCard.partOfSpeech}
                          </span>
                        </div>
                      )}
                      <div className="text-sm md:text-base text-slate-400 font-medium absolute bottom-8">แตะเพื่อดูความหมาย</div>
                    </div>
                  </Card>

                  {/* Back */}
                  <Card
                    className="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-slate-800 dark:via-indigo-900/40 dark:to-slate-700 border-2 border-indigo-300 dark:border-indigo-500/50 shadow-2xl rounded-3xl flex items-center justify-center p-6 sm:p-8 md:p-10 overflow-hidden"
                    style={{ transform: 'rotateY(180deg)' }}
                  >
                    {/* Decorative corners */}
                    <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-indigo-400/60 rounded-tl-lg" />
                    <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-indigo-400/60 rounded-tr-lg" />
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-indigo-400/60 rounded-bl-lg" />
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-indigo-400/60 rounded-br-lg" />

                    {/* Subtle pattern overlay */}
                    <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_center,_#6366f1_1px,_transparent_1px)] bg-[length:20px_20px]" />
                    <div className="text-center w-full flex flex-col items-center justify-center h-full">
                      {currentCard.backImage && (
                        <div className="relative w-full h-32 sm:h-40 md:h-56 lg:h-64 mb-4 flex items-center justify-center">
                          <img
                            src={currentCard.backImage}
                            alt="Front"
                            className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                          />
                        </div>
                      )}
                      <div className="text-2xl sm:text-3xl md:text-3xl lg:text-3xl font-bold text-slate-800 dark:text-white mb-6 leading-normal py-2 break-words line-clamp-4">
                        {currentCard.back}
                      </div>
                      <div className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium break-words line-clamp-2 absolute bottom-8">
                        {currentCard.front}
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Swipe indicators */}
              {swipeDirection === 'left' && (
                <div className="absolute top-12 right-12 bg-red-500 text-white px-6 py-2 rounded-xl font-bold text-xl shadow-lg rotate-[15deg] border-4 border-white">
                  AGAIN
                </div>
              )}
              {swipeDirection === 'right' && (
                <div className="absolute top-12 left-12 bg-green-500 text-white px-6 py-2 rounded-xl font-bold text-xl shadow-lg rotate-[-15deg] border-4 border-white">
                  GOOD
                </div>
              )}
            </div>

            {/* Countdown below card */}
            {isAutoPlaying && countdown > 0 && (
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-1.5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                  <span className="text-xs font-medium text-slate-500">Next: {countdown}s</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-8 pb-10">
          <div className="max-w-md mx-auto flex items-center justify-center gap-6">
            {/* 1. Don't Know (Red X) */}
            <Button
              onClick={() => handleAnswer(false)}
              disabled={!isFlipped && !hasViewedAnswer}
              className="h-14 w-14 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg hover:scale-110 transition-all disabled:opacity-30 border-4 border-white dark:border-slate-900"
            >
              <X className="h-6 w-6" />
            </Button>

            {/* 2. Previous (Gray Left) */}
            <Button
              onClick={() => {
                // If we want this to be "Previous Card" without undo logic, we might need new logic.
                // But typically "Left" in these apps means "Back" or "Undo".
                // The image has a "Undo" in header too.
                // Let's make this "Previous" in queue if possible, or just Undo.
                // For now, mapping to Undo as per plan assumption.
                handleUndo();
              }}
              disabled={history.length === 0}
              className="h-14 w-14 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 shadow-md border-4 border-white dark:border-slate-900 disabled:opacity-30"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            {/* 3. Play/Pause (Large Purple) */}
            <Button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="h-20 w-20 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white shadow-xl hover:scale-105 transition-all border-4 border-white dark:border-slate-900 flex items-center justify-center"
            >
              {isAutoPlaying ? (
                <Pause className="h-8 w-8 fill-current" />
              ) : (
                <Play className="h-8 w-8 fill-current ml-1" />
              )}
            </Button>

            {/* 4. Next (Gray Right) */}
            <Button
              onClick={() => {
                if (!isFlipped && !hasViewedAnswer) {
                  toast.error("กรุณาพลิกการ์ดเพื่อดูเฉลยก่อน");
                  return;
                }
                if (currentIndex < reviewQueue.length - 1) {
                  setCurrentIndex(prev => prev + 1);
                  setIsFlipped(false);
                  resetSwipe();
                }
              }}
              disabled={currentIndex >= reviewQueue.length - 1 || (!isFlipped && !hasViewedAnswer)}
              className="h-14 w-14 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 shadow-md border-4 border-white dark:border-slate-900 disabled:opacity-30"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>

            {/* 5. Know (Green Check) */}
            <Button
              onClick={() => handleAnswer(true)}
              disabled={!isFlipped && !hasViewedAnswer}
              className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:scale-110 transition-all disabled:opacity-30 border-4 border-white dark:border-slate-900"
            >
              <Check className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tutorial Overlay */}
      {showTutorial && (
        <div
          className="fixed inset-0 z-[100] flex cursor-pointer"
        >
          {/* Left Half - Forgot (Red) - Clicking also answers "forgot" */}
          <div
            className="w-1/2 h-full bg-red-500/80 hover:bg-red-500/90 transition-colors flex items-center justify-center relative backdrop-blur-sm"
            onClick={() => {
              setShowTutorial(false);
              // Auto flip and mark as "forgot"
              setIsFlipped(true);
              setHasViewedAnswer(true);
              setTimeout(() => handleAnswer(false), 100);
            }}
          >
            <div className="text-center animate-in fade-in slide-in-from-left duration-700">
              <div className="bg-white text-red-600 rounded-full p-6 mb-6 shadow-xl mx-auto w-24 h-24 flex items-center justify-center">
                <X className="w-12 h-12 stroke-[3]" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-md mb-2">จำไม่ได้</h2>
              <p className="text-white/80 text-lg font-medium">ปัดไปทางซ้าย</p>
            </div>
            {/* Arrow decoration */}
            <div className="absolute left-8 top-1/2 -translate-y-1/2 text-white/20">
              <ChevronLeft className="w-32 h-32" />
            </div>
          </div>

          {/* Right Half - Remember (Green) - Clicking also answers "remember" */}
          <div
            className="w-1/2 h-full bg-green-500/80 hover:bg-green-500/90 transition-colors flex items-center justify-center relative backdrop-blur-sm"
            onClick={() => {
              setShowTutorial(false);
              // Auto flip and mark as "remember"
              setIsFlipped(true);
              setHasViewedAnswer(true);
              setTimeout(() => handleAnswer(true), 100);
            }}
          >
            <div className="text-center animate-in fade-in slide-in-from-right duration-700">
              <div className="bg-white text-green-600 rounded-full p-6 mb-6 shadow-xl mx-auto w-24 h-24 flex items-center justify-center">
                <Check className="w-12 h-12 stroke-[3]" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-md mb-2">จำได้</h2>
              <p className="text-white/80 text-lg font-medium">ปัดไปทางขวา</p>
            </div>
            {/* Arrow decoration */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 text-white/20">
              <ChevronRight className="w-32 h-32" />
            </div>
          </div>

          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/90 text-sm font-medium animate-pulse bg-black/20 px-4 py-2 rounded-full backdrop-blur-md">
            กด Tab เพื่อปิด หรือ คลิกเลือก
          </div>
        </div>
      )}

      <style>{`
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
}
