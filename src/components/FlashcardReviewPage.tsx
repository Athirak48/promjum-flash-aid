import React, { useState, useEffect } from 'react';
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
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FlashcardData {
  id: string;
  front: string;
  back: string;
  isFavorite?: boolean;
}

interface FlashcardReviewPageProps {
  cards: FlashcardData[];
  onClose: () => void;
  onComplete?: (results: any) => void;
}

export function FlashcardReviewPage({ cards, onClose, onComplete }: FlashcardReviewPageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [trackProgress, setTrackProgress] = useState(true);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [progress, setProgress] = useState({ correct: 0, incorrect: 0 });
  const isMobile = useIsMobile();

  const currentCard = cards[currentIndex];

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
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
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
  }, [isFlipped]);

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      setSwipeDirection(null);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
      setSwipeDirection(null);
    }
  };

  const handleKnow = (knows: boolean) => {
    if (trackProgress) {
      setProgress(prev => ({
        ...prev,
        correct: knows ? prev.correct + 1 : prev.correct,
        incorrect: !knows ? prev.incorrect + 1 : prev.incorrect
      }));
    }
    
    setSwipeDirection(knows ? 'right' : 'left');
    setTimeout(() => handleNext(), 300);
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    handleKnow(direction === 'right');
  };

  const handleCardTap = () => {
    if (isMobile) {
      setIsFlipped(!isFlipped);
    }
  };

  if (!currentCard) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-purple-950 dark:via-pink-900 dark:to-purple-950 z-50">
      {/* Header */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Card */}
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: swipeDirection === 'left' ? -100 : swipeDirection === 'right' ? 100 : 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: swipeDirection === 'left' ? -100 : swipeDirection === 'right' ? 100 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card 
                className="relative min-h-[400px] bg-white/95 backdrop-blur-sm border-0 shadow-2xl cursor-pointer"
                onClick={handleCardTap}
                onTouchStart={(e) => {
                  const touch = e.touches[0];
                  const startX = touch.clientX;
                  
                  const handleTouchEnd = (endEvent: TouchEvent) => {
                    const endTouch = endEvent.changedTouches[0];
                    const diffX = endTouch.clientX - startX;
                    
                    if (Math.abs(diffX) > 100) {
                      handleSwipe(diffX > 0 ? 'right' : 'left');
                    }
                    
                    document.removeEventListener('touchend', handleTouchEnd);
                  };
                  
                  document.addEventListener('touchend', handleTouchEnd);
                }}
              >
                {/* Card Actions */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Star className={`h-4 w-4 ${currentCard.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  </Button>
                </div>

                <CardContent className="flex items-center justify-center min-h-[400px] p-8">
                  <motion.div
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center w-full"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <div 
                      className={`${isFlipped ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                      style={{ transform: 'rotateY(0deg)', backfaceVisibility: 'hidden' }}
                    >
                      <h2 className="text-4xl font-bold text-gray-800 mb-4">
                        {currentCard.front}
                      </h2>
                      <p className="text-gray-500">กดเพื่อดูคำตอบ</p>
                    </div>
                    
                    <div 
                      className={`${isFlipped ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 absolute inset-0 flex flex-col justify-center`}
                      style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
                    >
                      <h2 className="text-3xl font-semibold text-purple-700 mb-4">
                        {currentCard.back}
                      </h2>
                      <p className="text-gray-500">จำได้หรือไม่?</p>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="flex items-center justify-between bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
          {/* Left: Track Progress Toggle */}
          <div className="flex items-center gap-3">
            <Switch
              checked={trackProgress}
              onCheckedChange={setTrackProgress}
              id="track-progress"
            />
            <label htmlFor="track-progress" className="text-sm font-medium">
              Track progress
            </label>
          </div>

          {/* Center: Card Counter & Navigation */}
          <div className="flex items-center gap-4">
            {!isMobile && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="bg-red-100 hover:bg-red-200 border-red-200"
                  title="จำไม่ได้ (←)"
                >
                  <ChevronLeft className="h-4 w-4 text-red-600" />
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleKnow.bind(null, true)}
                  className="bg-green-100 hover:bg-green-200 border-green-200"
                  title="จำได้ (→)"
                >
                  <ChevronRight className="h-4 w-4 text-green-600" />
                </Button>
              </>
            )}
            
            <Button variant="ghost" size="icon" onClick={handlePrevious} disabled={currentIndex === 0}>
              <SkipBack className="h-4 w-4" />
            </Button>
            
            <div className="text-lg font-semibold px-4">
              {currentIndex + 1} / {cards.length}
            </div>
            
            <Button variant="ghost" size="icon" onClick={handleNext} disabled={currentIndex === cards.length - 1}>
              <SkipForward className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsFlipped(!isFlipped)}
              title="พลิกการ์ด (Tab)"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Right: Control Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className={isAutoPlay ? 'bg-purple-100' : ''}
            >
              {isAutoPlay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <Button variant="ghost" size="icon">
              <Maximize className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Swipe Instructions */}
        {isMobile && !isFlipped && (
          <div className="text-center mt-4 text-sm text-gray-600">
            <p>ปัดซ้าย = จำไม่ได้ | ปัดขวา = จำได้ | กดการ์ด = พลิก</p>
          </div>
        )}

        {/* Progress Display */}
        {trackProgress && (
          <div className="text-center mt-2 text-sm text-gray-600">
            จำได้: {progress.correct} | จำไม่ได้: {progress.incorrect}
          </div>
        )}
      </div>
    </div>
  );
}