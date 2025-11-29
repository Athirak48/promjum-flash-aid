import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { X, CheckCircle, Clock, Trophy } from 'lucide-react';
import { useSRSProgress } from '@/hooks/useSRSProgress';

interface Flashcard {
  id: string;
  front_text: string;
  back_text: string;
}

interface FlashcardMatchingGameProps {
  flashcards: Flashcard[];
  onClose: () => void;
}

interface MatchingCard {
  id: string;
  text: string;
  type: 'question' | 'answer';
  originalId: string;
  isMatched: boolean;
  isSelected: boolean;
}

export function FlashcardMatchingGame({ flashcards, onClose }: FlashcardMatchingGameProps) {
  const { updateFromMatching } = useSRSProgress();
  const [cards, setCards] = useState<MatchingCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<MatchingCard | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [gameTime, setGameTime] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [wrongMatch, setWrongMatch] = useState<Set<string>>(new Set());
  // Track first-try status for each card
  const attemptedCards = useRef<Set<string>>(new Set());

  // Generate matching cards
  useEffect(() => {
    if (flashcards.length < 2) return;

    const maxPairs = Math.min(6, flashcards.length);
    const selectedFlashcards = [...flashcards]
      .sort(() => 0.5 - Math.random())
      .slice(0, maxPairs);

    const gameCards: MatchingCard[] = [];

    selectedFlashcards.forEach(flashcard => {
      gameCards.push({
        id: `q-${flashcard.id}`,
        text: flashcard.front_text,
        type: 'question',
        originalId: flashcard.id,
        isMatched: false,
        isSelected: false
      });
      gameCards.push({
        id: `a-${flashcard.id}`,
        text: flashcard.back_text,
        type: 'answer',
        originalId: flashcard.id,
        isMatched: false,
        isSelected: false
      });
    });

    // Shuffle cards
    const shuffledCards = gameCards.sort(() => 0.5 - Math.random());
    setCards(shuffledCards);
    setStartTime(Date.now());
  }, [flashcards]);

  // Update game timer
  useEffect(() => {
    if (isGameComplete) return;

    const interval = setInterval(() => {
      setGameTime(Date.now() - startTime);
    }, 100);

    return () => clearInterval(interval);
  }, [startTime, isGameComplete]);

  const handleCardClick = (card: MatchingCard) => {
    if (card.isMatched || card.isSelected) return;

    // Clear any wrong match highlighting
    setWrongMatch(new Set());

    if (!selectedCard) {
      // First card selection
      setSelectedCard(card);
      setCards(prev => 
        prev.map(c => 
          c.id === card.id 
            ? { ...c, isSelected: true }
            : { ...c, isSelected: false }
        )
      );
    } else {
      // Second card selection - check for match
      const isFirstTry = !attemptedCards.current.has(selectedCard.originalId);
      
      if (selectedCard.originalId === card.originalId && selectedCard.type !== card.type) {
        // Correct match!
        const newMatchedPairs = new Set(matchedPairs);
        newMatchedPairs.add(selectedCard.originalId);
        setMatchedPairs(newMatchedPairs);
        setScore(prev => prev + 1);

        setCards(prev =>
          prev.map(c => {
            if (c.originalId === card.originalId) {
              return { ...c, isMatched: true, isSelected: false };
            }
            return { ...c, isSelected: false };
          })
        );

        // Update SRS: Q=3 first try correct, Q=0 not first try
        updateFromMatching(selectedCard.originalId, true, isFirstTry);

        // Check if game is complete
        if (newMatchedPairs.size === cards.length / 2) {
          setIsGameComplete(true);
        }
      } else {
        // Wrong match - mark as attempted and update SRS with Q=-1 (treated as Q=0)
        attemptedCards.current.add(selectedCard.originalId);
        attemptedCards.current.add(card.originalId);
        
        // Update SRS for wrong match (Q=-1 -> Q=0)
        updateFromMatching(selectedCard.originalId, false, false);
        
        setWrongMatch(new Set([selectedCard.id, card.id]));
        
        // Reset selection after a short delay
        setTimeout(() => {
          setCards(prev =>
            prev.map(c => ({ ...c, isSelected: false }))
          );
          setWrongMatch(new Set());
        }, 1000);
      }

      setSelectedCard(null);
    }
  };

  const getCardStyle = (card: MatchingCard) => {
    if (card.isMatched) {
      return "bg-green-500/20 border-green-500 text-green-700 dark:text-green-400 cursor-not-allowed";
    }
    
    if (wrongMatch.has(card.id)) {
      return "bg-red-500/20 border-red-500 text-red-700 dark:text-red-400 animate-pulse";
    }
    
    if (card.isSelected) {
      return "bg-primary/20 border-primary text-primary-foreground ring-2 ring-primary/50";
    }
    
    if (card.type === 'question') {
      return "bg-card border-border hover:bg-muted text-foreground";
    } else {
      return "bg-card border-border hover:bg-muted text-foreground";
    }
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (flashcards.length < 2) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-foreground mb-4">ไม่สามารถเล่นเกมได้</h3>
            <p className="text-muted-foreground mb-4">
              ต้องมีแฟลชการ์ดอย่างน้อย 2 ใบเพื่อเล่นเกมจับคู่
            </p>
            <Button onClick={onClose}>ปิด</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isGameComplete) {
    const finalTime = formatTime(gameTime);
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-green-950 dark:via-emerald-900 dark:to-green-950 z-50">
        <div className="flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 bg-card/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl max-w-md w-full border border-border"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-foreground mb-2">ยินดีด้วย!</h2>
            <div className="bg-muted rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                <span className="text-xl font-bold text-foreground">จับคู่ครบทุกคู่!</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{score}</div>
                  <div className="text-muted-foreground">คู่ที่ถูกต้อง</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{finalTime}</div>
                  <div className="text-muted-foreground">เวลาที่ใช้</div>
                </div>
              </div>
            </div>
            <Button
              onClick={onClose}
              className="w-full py-3 text-lg font-semibold"
            >
              เสร็จสิ้น
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  const progress = (matchedPairs.size / (cards.length / 2)) * 100;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 dark:from-purple-950 dark:via-pink-900 dark:to-indigo-950 z-50">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-card/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-foreground">Matching Game</h2>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{formatTime(gameTime)}</span>
              </div>
              <div>
                {matchedPairs.size}/{cards.length / 2} คู่
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress */}
        <div className="px-4 py-2 bg-card/80 backdrop-blur-sm">
          <Progress value={progress} className="w-full" />
        </div>

        {/* Game Board */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <AnimatePresence>
                {cards.map((card, index) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${getCardStyle(card)} ${
                      !card.isMatched && !wrongMatch.has(card.id) ? 'hover:scale-105' : ''
                    }`}
                    onClick={() => handleCardClick(card)}
                  >
                    <div className="text-center">
                      <div className={`text-xs font-medium mb-2 ${
                        card.type === 'question' ? 'text-primary' : 'text-accent'
                      }`}>
                        {card.type === 'question' ? 'คำถาม' : 'คำตอบ'}
                      </div>
                      <div className="text-sm font-medium break-words text-foreground">
                        {card.text}
                      </div>
                      {card.isMatched && (
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mx-auto mt-2" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Instructions */}
            <div className="text-center mt-6">
              <div className="inline-flex items-center space-x-2 bg-card/80 rounded-full px-4 py-2 text-sm text-muted-foreground border border-border">
                <span>คลิกการ์ดเพื่อจับคู่คำถามกับคำตอบ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}