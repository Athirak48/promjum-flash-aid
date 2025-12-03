import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Home, RotateCcw, ArrowRight, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import BackgroundDecorations from '@/components/BackgroundDecorations';
import { useSRSProgress } from '@/hooks/useSRSProgress';

interface Flashcard {
  id: string;
  front_text: string;
  back_text: string;
  created_at: string;
}

interface FlashcardMatchingGameProps {
  flashcards: Flashcard[];
  onClose: () => void;
  onNext?: () => void;
}

interface MatchingCard {
  id: string;
  content: string;
  type: 'front' | 'back';
  pairId: string;
  isMatched: boolean;
}

export function FlashcardMatchingGame({ flashcards, onClose, onNext }: FlashcardMatchingGameProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { updateFromMatching } = useSRSProgress();
  const [cards, setCards] = useState<MatchingCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<MatchingCard[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [endTime, setEndTime] = useState<number | null>(null);
  const [wrongMatch, setWrongMatch] = useState<string[]>([]); // IDs of cards currently showing wrong state

  const handleRestart = () => {
    setMatchedPairs([]);
    setScore(0);
    setEndTime(null);
    setWrongMatch([]);
    setSelectedCards([]);
    setStartTime(Date.now());
    initializeGame();
  };

  // Game config
  const maxPairs = 6; // 12 cards total for better mobile fit

  useEffect(() => {
    initializeGame();
  }, [flashcards]);

  const initializeGame = () => {
    // Select random cards
    const selectedFlashcards = [...flashcards]
      .sort(() => Math.random() - 0.5)
      .slice(0, maxPairs);

    // Create matching pairs
    const gameCards: MatchingCard[] = [];
    selectedFlashcards.forEach(card => {
      gameCards.push({
        id: `${card.id}-front`,
        content: card.front_text,
        type: 'front',
        pairId: card.id,
        isMatched: false
      });
      gameCards.push({
        id: `${card.id}-back`,
        content: card.back_text,
        type: 'back',
        pairId: card.id,
        isMatched: false
      });
    });

    // Shuffle
    setCards(gameCards.sort(() => Math.random() - 0.5));
  };

  const handleCardClick = (card: MatchingCard) => {
    if (
      card.isMatched ||
      selectedCards.find(c => c.id === card.id) ||
      selectedCards.length >= 2 ||
      wrongMatch.length > 0
    ) return;

    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      checkMatch(newSelected[0], newSelected[1]);
    }
  };

  const checkMatch = async (card1: MatchingCard, card2: MatchingCard) => {
    if (card1.pairId === card2.pairId) {
      // Match found
      const newMatched = [...matchedPairs, card1.pairId];
      setMatchedPairs(newMatched);
      setScore(score + 10);

      setCards(cards.map(c =>
        c.pairId === card1.pairId ? { ...c, isMatched: true } : c
      ));

      setSelectedCards([]);

      // Update SRS
      await updateFromMatching(card1.pairId, true, true); // Assume first try for now

      // Check win
      if (newMatched.length === Math.min(flashcards.length, maxPairs)) {
        setEndTime(Date.now());
      }
    } else {
      // No match
      setWrongMatch([card1.id, card2.id]);
      setTimeout(() => {
        setSelectedCards([]);
        setWrongMatch([]);
      }, 1000);

      // Update SRS penalty? Maybe not for matching game unless repeated errors
    }
  };

  const getCardStyle = (card: MatchingCard) => {
    if (card.isMatched) {
      return "opacity-0 pointer-events-none"; // Hide matched cards
    }

    const isSelected = selectedCards.find(c => c.id === card.id);
    const isWrong = wrongMatch.includes(card.id);

    if (isWrong) {
      return "bg-red-500 border-red-600 text-white animate-shake";
    }

    if (isSelected) {
      return "bg-cyan-600 border-cyan-700 text-white shadow-lg scale-105 ring-4 ring-cyan-200";
    }

    return "bg-white hover:bg-cyan-50 border-2 border-cyan-100 text-cyan-900 hover:-translate-y-1 hover:shadow-md";
  };

  if (endTime) {
    const timeSpent = Math.floor((endTime - startTime) / 1000);
    const minutes = Math.floor(timeSpent / 60);
    const seconds = timeSpent % 60;

    return (
      <div className="fixed inset-0 bg-gradient-to-br from-cyan-50 via-sky-50 to-cyan-100 dark:from-cyan-950 dark:via-sky-900 dark:to-cyan-950 overflow-auto flex items-center justify-center p-4">
        <BackgroundDecorations />
        <Card className="max-w-xl w-full shadow-2xl relative z-10 bg-white/90 backdrop-blur-xl border-white/50 rounded-[2rem]">
          <CardHeader className="text-center pb-2">
            <div className="text-6xl mb-4 animate-bounce">🧩</div>
            <CardTitle className="text-3xl font-bold text-foreground bg-gradient-to-r from-cyan-600 to-sky-600 bg-clip-text text-transparent">
              ยอดเยี่ยม! จับคู่ครบแล้ว
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-cyan-500 to-sky-500 rounded-2xl p-6 text-white text-center shadow-lg transform hover:scale-105 transition-transform duration-300">
              <div className="text-6xl font-bold mb-2">{score}</div>
              <div className="text-xl opacity-90 font-medium">คะแนนรวม</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-2xl border border-blue-100">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300 mt-1 font-medium">
                  เวลาที่ใช้
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-2xl border border-green-100">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {matchedPairs.length}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300 mt-1 font-medium">
                  คู่ที่จับได้
                </div>
              </div>
            </div>

            <div className="flex flex-row gap-3 justify-center">
              <Button
                onClick={handleRestart}
                className="flex-1 bg-gradient-to-r from-cyan-600 to-sky-600 hover:shadow-lg hover:-translate-y-1 transition-all rounded-xl h-12 text-sm md:text-base"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                เล่นอีกครั้ง
              </Button>

              <Button
                onClick={() => {
                  const selectedVocab = flashcards.map(f => ({
                    id: f.id,
                    word: f.front_text,
                    meaning: f.back_text
                  }));
                  navigate('/ai-listening-section3-intro', {
                    state: { selectedVocab }
                  });
                }}
                variant="outline"
                className="flex-1 rounded-xl h-12 text-sm md:text-base border-cyan-200 text-cyan-700 hover:bg-cyan-50"
              >
                <Gamepad2 className="h-4 w-4 mr-2" />
                เลือกเกมใหม่
              </Button>

              <Button
                onClick={onNext || onClose}
                variant="outline"
                className="flex-1 rounded-xl h-12 text-sm md:text-base border-gray-200"
              >
                ถัดไป
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-cyan-50 via-sky-50 to-cyan-100 dark:from-cyan-950 dark:via-sky-900 dark:to-cyan-950 overflow-auto">
      <BackgroundDecorations />

      <div className="container mx-auto px-2 md:px-4 py-4 md:py-6 relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <Button variant="ghost" onClick={onClose} className="rounded-full hover:bg-slate-200/50 text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft className="mr-2 h-5 w-5" />
            ออก
          </Button>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex items-center gap-1.5 md:gap-2 bg-white/80 backdrop-blur-md px-3 md:px-4 py-1.5 md:py-2 rounded-xl shadow-sm border border-white/50">
              <Trophy className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
              <span className="font-bold text-base md:text-lg">{score}</span>
            </div>
            <div className="bg-white/80 backdrop-blur-md px-3 md:px-4 py-1.5 md:py-2 rounded-xl shadow-sm border border-white/50">
              <span className="font-bold text-base md:text-lg text-primary">
                {matchedPairs.length} / {Math.min(flashcards.length, maxPairs)}
              </span>
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="flex-1 flex items-center justify-center max-w-5xl mx-auto w-full">
          <Card className="w-full bg-white/90 backdrop-blur-xl border-white/50 shadow-2xl rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden">
            <CardHeader className="pb-0 md:pb-2 pt-4 md:pt-6">
              <CardTitle className="text-center text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-600 to-sky-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
                <span className="text-2xl md:text-3xl">🧩</span> Matching Pair
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-8">

              <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
                <AnimatePresence>
                  {cards.map((card) => (
                    <motion.button
                      key={card.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: card.isMatched ? 0 : 1, scale: card.isMatched ? 0.8 : 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      onClick={() => handleCardClick(card)}
                      className={`
                        aspect-[4/3] md:aspect-video rounded-lg md:rounded-xl p-1 md:p-4 flex items-center justify-center text-center transition-all duration-300
                        ${getCardStyle(card)}
                      `}
                    >
                      <span className="text-xs md:text-lg font-bold line-clamp-3 break-words w-full">
                        {card.content}
                      </span>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}