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
  const [showSwipeFeedback, setShowSwipeFeedback] = useState<'left' | 'right' | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
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
    if (isCompleted) return; // Disable keyboard controls when completed
    
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
  }, [isFlipped, isCompleted]);

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
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

  const handleKnow = (knows: boolean) => {
    // Show feedback first
    setShowSwipeFeedback(knows ? 'right' : 'left');
    
    if (trackProgress) {
      setProgress(prev => ({
        ...prev,
        correct: knows ? prev.correct + 1 : prev.correct,
        incorrect: !knows ? prev.incorrect + 1 : prev.incorrect
      }));
    }
    
    setSwipeDirection(knows ? 'right' : 'left');
    
    // Hide feedback and move to next card after delay
    setTimeout(() => {
      setShowSwipeFeedback(null);
      handleNext();
    }, 800);
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
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-purple-950 dark:via-pink-900 dark:to-purple-950 z-50">
        <div className="flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl max-w-md w-full"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">ทบทวนจบแล้ว!</h2>
              <p className="text-gray-600 mb-6">
                คุณได้ทบทวนแฟลชการ์ดครบทั้งหมด {cards.length} ใบแล้ว
              </p>
            </motion.div>
            
            {trackProgress && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-50 rounded-xl p-4 space-y-2"
              >
                <h3 className="font-semibold text-gray-700">สรุปผลการทบทวน</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">จำได้: {progress.correct} ใบ</span>
                  <span className="text-red-600">จำไม่ได้: {progress.incorrect} ใบ</span>
                </div>
                <div className="text-xs text-gray-500">
                  ความแม่นยำ: {progress.correct + progress.incorrect > 0 ? Math.round((progress.correct / (progress.correct + progress.incorrect)) * 100) : 0}%
                </div>
              </motion.div>
            )}
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                onClick={onClose}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-semibold"
              >
                กลับไปหน้าแฟลชการ์ด
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

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
      <div className="flex items-center justify-center min-h-screen p-3 sm:p-6">
        <div className="w-full max-w-2xl relative">
          {/* Swipe Feedback Overlay */}
          <AnimatePresence>
            {showSwipeFeedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-2xl"
              >
                <div className={`text-4xl sm:text-6xl font-bold px-6 py-4 rounded-2xl ${
                  showSwipeFeedback === 'left' 
                    ? 'text-red-500 bg-red-50/90' 
                    : 'text-green-500 bg-green-50/90'
                }`}>
                  {showSwipeFeedback === 'left' ? 'จำไม่ได้' : 'จำได้แล้ว'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ 
                opacity: 0, 
                scale: 0.9,
                x: swipeDirection === 'left' ? -100 : swipeDirection === 'right' ? 100 : 0,
                rotateY: swipeDirection === 'left' ? -15 : swipeDirection === 'right' ? 15 : 0
              }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                x: 0,
                rotateY: 0
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.9,
                x: swipeDirection === 'left' ? -100 : swipeDirection === 'right' ? 100 : 0,
                rotateY: swipeDirection === 'left' ? -15 : swipeDirection === 'right' ? 15 : 0
              }}
              transition={{ 
                duration: 0.4,
                ease: "easeInOut"
              }}
            >
              <Card 
                className="relative min-h-[350px] sm:min-h-[400px] bg-white/95 backdrop-blur-sm border-0 shadow-2xl cursor-pointer overflow-hidden"
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
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex gap-2 z-10">
                  <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/50 hover:bg-white/70">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/50 hover:bg-white/70">
                    <Star className={`h-4 w-4 ${currentCard.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  </Button>
                </div>

                <CardContent className="flex items-center justify-center min-h-[350px] sm:min-h-[400px] p-4 sm:p-8">
                  <motion.div
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="text-center w-full"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <div 
                      className={`${isFlipped ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                      style={{ transform: 'rotateY(0deg)', backfaceVisibility: 'hidden' }}
                    >
                      <motion.h2 
                        className="text-2xl sm:text-4xl font-bold text-gray-800 mb-4 leading-tight"
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {currentCard.front}
                      </motion.h2>
                      <p className="text-gray-500 text-sm sm:text-base">
                        {isMobile && window.innerWidth < 768 ? 'กดเพื่อดูคำตอบ' : 'คลิกการ์ดหรือกด Tab เพื่อพลิก'}
                      </p>
                    </div>
                    
                    <div 
                      className={`${isFlipped ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 absolute inset-0 flex flex-col justify-center`}
                      style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
                    >
                      <motion.h2 
                        className="text-xl sm:text-3xl font-semibold text-purple-700 mb-4 leading-tight"
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {currentCard.back}
                      </motion.h2>
                      <p className="text-gray-500 text-sm sm:text-base">จำได้หรือไม่?</p>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6">
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-2xl p-3 sm:p-4 shadow-xl border border-gray-200 gap-3 sm:gap-0">
          
          {/* Mobile: Stacked layout */}
          <div className="w-full sm:hidden">
            {/* Card Counter */}
            <div className="text-center mb-3">
              <div className="text-lg font-bold text-gray-900">
                {currentIndex + 1} / {cards.length}
              </div>
            </div>
            
            {/* Main Controls */}
            <div className="flex items-center justify-center gap-4 mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleKnow(false)}
                className="bg-red-100 hover:bg-red-200 border-red-300 flex-1 font-bold text-red-700 h-12 text-base"
              >
                <ChevronLeft className="h-5 w-5 mr-1 text-red-700" strokeWidth={2.5} />
                จำไม่ได้
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsFlipped(!isFlipped)}
                title="พลิกการ์ด"
                className="bg-blue-100 hover:bg-blue-200 h-12 w-12"
              >
                <RotateCcw className="h-5 w-5 text-blue-700" strokeWidth={2.5} />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleKnow(true)}
                className="bg-green-100 hover:bg-green-200 border-green-300 flex-1 font-bold text-green-700 h-12 text-base"
              >
                จำได้แล้ว
                <ChevronRight className="h-5 w-5 ml-1 text-green-700" strokeWidth={2.5} />
              </Button>
            </div>
            
            {/* Secondary Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={trackProgress}
                  onCheckedChange={setTrackProgress}
                  id="track-progress-mobile"
                />
                <label htmlFor="track-progress-mobile" className="text-xs font-semibold text-gray-900">
                  Track
                </label>
              </div>
              
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={handlePrevious} disabled={currentIndex === 0} className="h-10 w-10 text-gray-900">
                  <SkipBack className="h-4 w-4" strokeWidth={2.5} />
                </Button>
                
                <Button variant="ghost" size="icon" onClick={handleNext} disabled={currentIndex === cards.length - 1} className="h-10 w-10 text-gray-900">
                  <SkipForward className="h-4 w-4" strokeWidth={2.5} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsAutoPlay(!isAutoPlay)}
                  className={`h-10 w-10 text-gray-900 ${isAutoPlay ? 'bg-purple-100' : ''}`}
                >
                  {isAutoPlay ? <Pause className="h-4 w-4" strokeWidth={2.5} /> : <Play className="h-4 w-4" strokeWidth={2.5} />}
                </Button>
              </div>
            </div>
          </div>

          {/* Desktop: Horizontal layout */}
          <div className="hidden sm:flex items-center justify-between w-full">
            {/* Left: Track Progress Toggle */}
            <div className="flex items-center gap-3">
              <Switch
                checked={trackProgress}
                onCheckedChange={setTrackProgress}
                id="track-progress"
              />
              <label htmlFor="track-progress" className="text-base font-bold text-gray-900">
                Track progress
              </label>
            </div>

            {/* Center: Card Counter & Navigation */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleKnow(false)}
                className="bg-red-100 hover:bg-red-200 border-red-300 h-11 w-11"
                title="จำไม่ได้ (←)"
              >
                <ChevronLeft className="h-6 w-6 text-red-700" strokeWidth={2.5} />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleKnow(true)}
                className="bg-green-100 hover:bg-green-200 border-green-300 h-11 w-11"
                title="จำได้ (→)"
              >
                <ChevronRight className="h-6 w-6 text-green-700" strokeWidth={2.5} />
              </Button>
              
              <Button variant="ghost" size="icon" onClick={handlePrevious} disabled={currentIndex === 0} className="text-gray-900 h-11 w-11">
                <SkipBack className="h-5 w-5" strokeWidth={2.5} />
              </Button>
              
              <div className="text-xl font-bold text-gray-900 px-4">
                {currentIndex + 1} / {cards.length}
              </div>
              
              <Button variant="ghost" size="icon" onClick={handleNext} disabled={currentIndex === cards.length - 1} className="text-gray-900 h-11 w-11">
                <SkipForward className="h-5 w-5" strokeWidth={2.5} />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsFlipped(!isFlipped)}
                title="พลิกการ์ด (Tab)"
                className="text-gray-900 h-11 w-11"
              >
                <RotateCcw className="h-5 w-5" strokeWidth={2.5} />
              </Button>
            </div>

            {/* Right: Control Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAutoPlay(!isAutoPlay)}
                className={`h-11 w-11 text-gray-900 ${isAutoPlay ? 'bg-purple-100' : ''}`}
              >
                {isAutoPlay ? <Pause className="h-5 w-5" strokeWidth={2.5} /> : <Play className="h-5 w-5" strokeWidth={2.5} />}
              </Button>
              
              <Button variant="ghost" size="icon" className="h-11 w-11 text-gray-900">
                <Maximize className="h-5 w-5" strokeWidth={2.5} />
              </Button>
              
              <Button variant="ghost" size="icon" className="h-11 w-11 text-gray-900">
                <Settings className="h-5 w-5" strokeWidth={2.5} />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Swipe Instructions */}
        {isMobile && window.innerWidth < 768 && !isFlipped && (
          <div className="text-center mt-3 text-xs text-gray-600 bg-white/70 backdrop-blur-sm rounded-lg px-3 py-2">
            <p>ปัดซ้าย = จำไม่ได้ | ปัดขวา = จำได้แล้ว | กดการ์ด = พลิก</p>
          </div>
        )}

        {/* Progress Display */}
        {trackProgress && (
          <div className="text-center mt-2 text-sm text-gray-600 bg-white/70 backdrop-blur-sm rounded-lg px-3 py-1">
            จำได้: {progress.correct} | จำไม่ได้: {progress.incorrect}
          </div>
        )}
      </div>
    </div>
  );
}