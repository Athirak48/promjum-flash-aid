import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, RotateCcw, X, Check, AlertCircle, Undo } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface FlashcardData {
  id: string;
  front: string;
  back: string;
}

interface FlashcardSwiperProps {
  cards: FlashcardData[];
  onClose: () => void;
  onComplete: (results: { correct: number; incorrect: number; needsReview: number }) => void;
}

export function FlashcardSwiper({ cards, onClose, onComplete }: FlashcardSwiperProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState({ correct: 0, incorrect: 0, needsReview: 0 });
  const [swipeHistory, setSwipeHistory] = useState<Array<{ cardIndex: number; direction: 'left' | 'right' | 'up'; results: any }>>([]);
  const [overlayText, setOverlayText] = useState<string>('');
  const [overlayColor, setOverlayColor] = useState<string>('');
  const { t } = useLanguage();

  const currentCard = cards[currentIndex];

  const handleSwipe = (direction: 'left' | 'right' | 'up') => {
    if (!isFlipped) {
      setIsFlipped(true);
      return;
    }

    // Save current state to history for undo
    setSwipeHistory(prev => [...prev, { 
      cardIndex: currentIndex, 
      direction, 
      results: { ...results } 
    }]);

    const newResults = { ...results };
    
    if (direction === 'left') {
      newResults.incorrect++;
    } else if (direction === 'right') {
      newResults.correct++;
    } else if (direction === 'up') {
      newResults.needsReview++;
    }

    setResults(newResults);

    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      onComplete(newResults);
    }
  };

  const handleUndo = () => {
    if (swipeHistory.length === 0) return;
    
    const lastAction = swipeHistory[swipeHistory.length - 1];
    setCurrentIndex(lastAction.cardIndex);
    setResults(lastAction.results);
    setSwipeHistory(prev => prev.slice(0, -1));
    setIsFlipped(false);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const { offset, velocity } = info;
    const swipeThreshold = 100;
    const swipeVelocityThreshold = 500;

    setOverlayText('');
    setOverlayColor('');

    if (Math.abs(offset.x) > swipeThreshold || Math.abs(velocity.x) > swipeVelocityThreshold) {
      if (offset.x > 0) {
        handleSwipe('right');
      } else {
        handleSwipe('left');
      }
    } else if (offset.y < -swipeThreshold || velocity.y < -swipeVelocityThreshold) {
      handleSwipe('up');
    }
  };

  const handleDrag = (event: any, info: PanInfo) => {
    const { offset } = info;
    const swipeThreshold = 50;

    if (Math.abs(offset.x) > swipeThreshold) {
      if (offset.x > 0) {
        setOverlayText('จำได้ ✓');
        setOverlayColor('bg-emerald-500/20 text-emerald-600');
      } else {
        setOverlayText('จำไม่ได้ ✗');
        setOverlayColor('bg-rose-500/20 text-rose-600');
      }
    } else if (offset.y < -swipeThreshold) {
      setOverlayText('เกือบได้ ~');
      setOverlayColor('bg-amber-500/20 text-amber-600');
    } else {
      setOverlayText('');
      setOverlayColor('');
    }
  };

  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div className="text-sm text-muted-foreground">
            {currentIndex + 1} / {cards.length}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleUndo}
              disabled={swipeHistory.length === 0}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsFlipped(false)}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2 mb-8">
          <div 
            className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Card Stack */}
        <div className="relative h-80 mb-8">
          {/* Next card preview */}
          {currentIndex + 1 < cards.length && (
            <Card className="absolute inset-0 bg-gradient-card/50 shadow-medium border-0 transform translate-x-2 translate-y-2 rotate-1">
              <CardContent className="h-full flex items-center justify-center p-6 opacity-50">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    การ์ดถัดไป...
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Current card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentIndex}-${isFlipped}`}
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
                className="h-full bg-gradient-card shadow-large border-0 cursor-pointer relative overflow-hidden"
                onClick={() => !isFlipped && setIsFlipped(true)}
              >
                {/* Overlay Text */}
                {overlayText && (
                  <div className={`absolute inset-0 flex items-center justify-center z-10 ${overlayColor} backdrop-blur-sm`}>
                    <div className="text-2xl font-bold">
                      {overlayText}
                    </div>
                  </div>
                )}
                
                <CardContent className="h-full flex items-center justify-center p-6">
                  <div className="text-center">
                    <p className="text-lg font-medium leading-relaxed">
                      {isFlipped ? currentCard.back : currentCard.front}
                    </p>
                    {!isFlipped && (
                      <p className="text-sm text-muted-foreground mt-4">
                        แตะเพื่อดูคำตอบ
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        {isFlipped && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center space-x-4"
          >
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => handleSwipe('left')}
              className="bg-red-50 border-red-200 hover:bg-red-100 text-red-600"
            >
              <X className="h-5 w-5 mr-2" />
              Don't Know
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => handleSwipe('up')}
              className="bg-yellow-50 border-yellow-200 hover:bg-yellow-100 text-yellow-600"
            >
              <AlertCircle className="h-5 w-5 mr-2" />
              Almost
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => handleSwipe('right')}
              className="bg-green-50 border-green-200 hover:bg-green-100 text-green-600"
            >
              <Check className="h-5 w-5 mr-2" />
              Know It
            </Button>
          </motion.div>
        )}

        {/* Instructions */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          {!isFlipped ? (
            "แตะการ์ดเพื่อดูคำตอบ"
          ) : (
            "ปัดซ้าย (จำไม่ได้) • ปัดขึ้น (เกือบได้) • ปัดขวา (จำได้)"
          )}
        </div>
      </div>
    </div>
  );
}