import React, { useState, useEffect, useCallback } from 'react';
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
  ThumbsUp,
  ThumbsDown
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
  setId?: string;
}

export function FlashcardReviewPage({ cards, onClose, onComplete, setId }: FlashcardReviewPageProps) {
  const [reviewQueue, setReviewQueue] = useState<FlashcardData[]>(cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [trackProgress, setTrackProgress] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [progress, setProgress] = useState({ correct: 0, incorrect: 0 });
  const [showSwipeFeedback, setShowSwipeFeedback] = useState<'left' | 'right' | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const isMobile = useIsMobile();
  const [totalCards] = useState(cards.length);
  const [showQScoreOptions, setShowQScoreOptions] = useState(false);
  const [reviewCount, setReviewCount] = useState<Map<string, number>>(new Map());

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

  const handleCardFlip = () => {
    if (!isCompleted) {
      setIsFlipped(!isFlipped);
      if (!isFlipped) {
        setShowQScoreOptions(true);
      }
    }
  };

  const saveFlashcardProgress = async (flashcardId: string, qScore: number) => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Check if progress exists
        const { data: existing } = await supabase
          .from('user_flashcard_progress')
          .select('*')
          .eq('flashcard_id', flashcardId)
          .eq('user_id', user.id)
          .single();

        if (existing) {
          // Update existing progress with Q score
          const newSrsScore = Math.max(0, (existing.srs_score || 0) + qScore);
          await supabase
            .from('user_flashcard_progress')
            .update({
              srs_score: newSrsScore,
              times_reviewed: (existing.times_reviewed || 0) + 1,
              times_correct: qScore > 0 ? (existing.times_correct || 0) + 1 : existing.times_correct,
              last_review_score: qScore,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);
        } else {
          // Create new progress
          await supabase
            .from('user_flashcard_progress')
            .insert({
              user_id: user.id,
              flashcard_id: flashcardId,
              srs_score: Math.max(0, qScore),
              times_reviewed: 1,
              times_correct: qScore > 0 ? 1 : 0,
              last_review_score: qScore
            });
        }
      }
    } catch (error) {
      console.error('Error saving flashcard progress:', error);
    }
  };

  const handleQScore = useCallback(async (qScore: number) => {
    if (!currentCard || isCompleted) return;

    // Track review count for this card
    const currentReviewCount = reviewCount.get(currentCard.id) || 0;
    const newReviewCount = currentReviewCount + 1;
    reviewCount.set(currentCard.id, newReviewCount);

    // Calculate final Q score based on review count
    let finalQScore = qScore;
    if (newReviewCount === 1 && qScore === 5) {
      finalQScore = 5; // จำได้ดี ครั้งแรก
    } else if (newReviewCount === 1 && qScore === 2) {
      finalQScore = 2; // จำได้บ้าง ครั้งแรก
    } else if (newReviewCount > 1) {
      finalQScore = 0; // ทวนซ้ำครั้งที่ 2, 3, 4...
    }

    // Save progress
    await saveFlashcardProgress(currentCard.id, finalQScore);

    if (trackProgress) {
      if (qScore >= 2) {
        // Q=5 หรือ Q=2 = จำได้
        setProgress(prev => ({
          ...prev,
          correct: prev.correct + 1
        }));
      } else {
        // Q=0 = จำไม่ได้
        setProgress(prev => ({
          ...prev,
          incorrect: prev.incorrect + 1
        }));
      }
    }

    setIsFlipped(false);
    setShowQScoreOptions(false);

    // ถ้า Q >= 2 ถือว่าจำได้ ไม่ต้องทบทวนอีก
    if (qScore >= 2) {
      const newQueue = reviewQueue.filter((_, idx) => idx !== currentIndex);
      if (newQueue.length === 0) {
        setReviewQueue(newQueue);
        setIsCompleted(true);
      } else {
        setReviewQueue(newQueue);
        if (currentIndex >= newQueue.length) {
          setCurrentIndex(Math.max(0, newQueue.length - 1));
        }
      }
    } else {
      // Q=0 = ย้ายไปท้ายคิว
      const newQueue = [...reviewQueue];
      const card = newQueue.splice(currentIndex, 1)[0];
      newQueue.push(card);
      setReviewQueue(newQueue);
      if (currentIndex >= newQueue.length) {
        setCurrentIndex(0);
      }
    }
  }, [currentCard, reviewQueue, currentIndex, trackProgress, reviewCount, isCompleted]);

  const handleCardTap = (e?: React.MouseEvent | React.TouchEvent) => {
    if (isCompleted) return;
    const target = (e?.target as HTMLElement | null);
    if (target && target.closest('button,[role="button"]')) return;
    handleCardFlip();
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
                คุณได้ทบทวนแฟลชการ์ดครบทั้งหมด {totalCards} ใบแล้ว
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
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <Card 
                className="relative min-h-[350px] sm:min-h-[400px] bg-white/95 backdrop-blur-sm border-0 shadow-2xl cursor-pointer overflow-hidden"
                onClick={handleCardTap}
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

                <CardContent className="flex flex-col items-center justify-center min-h-[350px] sm:min-h-[400px] p-4 sm:p-8">
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
                        คลิกการ์ดเพื่อดูคำตอบ
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
                      <p className="text-gray-500 text-sm sm:text-base mb-4">ประเมินความมั่นใจของคุณ</p>
                    </div>
                  </motion.div>

                  {/* Q Score Options */}
                  {showQScoreOptions && isFlipped && (
                    <div className="flex flex-col gap-3 mt-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="default"
                        onClick={() => handleQScore(5)}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 h-auto py-4"
                      >
                        <ThumbsUp className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-bold">จำได้ดี (Q=5)</div>
                          <div className="text-xs opacity-90">จำได้ชัดเจนทันที</div>
                        </div>
                      </Button>
                      <Button
                        variant="default"
                        onClick={() => handleQScore(2)}
                        className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 h-auto py-4"
                      >
                        <div className="text-left">
                          <div className="font-bold">จำได้บ้าง (Q=2)</div>
                          <div className="text-xs opacity-90">ต้องคิดนาน/เดาถูก</div>
                        </div>
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleQScore(0)}
                        className="flex items-center gap-2 h-auto py-4"
                      >
                        <ThumbsDown className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-bold">จำไม่ได้ (Q=0)</div>
                          <div className="text-xs opacity-90">ลืม</div>
                        </div>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Progress Bar */}
      <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6">
        <div className="flex items-center justify-center bg-white rounded-2xl p-3 sm:p-4 shadow-xl border border-gray-200">
          <div className="text-lg font-bold text-gray-900">
            {currentIndex + 1} / {reviewQueue.length}
          </div>
        </div>
      </div>
    </div>
  );
}