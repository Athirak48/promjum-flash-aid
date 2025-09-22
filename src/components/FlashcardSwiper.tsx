import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, RotateCcw, X, Check, AlertCircle } from 'lucide-react';
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
  const { t } = useLanguage();

  const currentCard = cards[currentIndex];

  const handleSwipe = (direction: 'left' | 'right' | 'up') => {
    if (!isFlipped) {
      setIsFlipped(true);
      return;
    }

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

  const handleDragEnd = (event: any, info: PanInfo) => {
    const { offset, velocity } = info;
    const swipeThreshold = 100;
    const swipeVelocityThreshold = 500;

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
          <Button variant="ghost" size="sm" onClick={() => setIsFlipped(false)}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2 mb-8">
          <div 
            className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Card */}
        <div className="relative h-80 mb-8">
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
              onDragEnd={handleDragEnd}
              whileDrag={{ scale: 1.05 }}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
            >
              <Card 
                className="h-full bg-gradient-card shadow-large border-0 cursor-pointer"
                onClick={() => !isFlipped && setIsFlipped(true)}
              >
                <CardContent className="h-full flex items-center justify-center p-6">
                  <div className="text-center">
                    <p className="text-lg font-medium leading-relaxed">
                      {isFlipped ? currentCard.back : currentCard.front}
                    </p>
                    {!isFlipped && (
                      <p className="text-sm text-muted-foreground mt-4">
                        Tap to reveal answer
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
            "Tap the card to see the answer"
          ) : (
            "Swipe left (don't know), up (almost), or right (know it)"
          )}
        </div>
      </div>
    </div>
  );
}