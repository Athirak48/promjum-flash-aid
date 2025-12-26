import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Flag, RotateCcw, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import BackgroundDecorations from '@/components/BackgroundDecorations';
import { useSRSProgress } from '@/hooks/useSRSProgress';
import { useXP } from '@/hooks/useXP';
import { useAnalytics } from '@/hooks/useAnalytics';

interface Flashcard {
  id: string;
  front_text: string;
  back_text: string;
  created_at: string;
  isUserFlashcard?: boolean;
}

interface FlashcardMatchingGameProps {
  flashcards: Flashcard[];
  onClose: () => void;
  onNext?: () => void;
  onSelectNewGame?: () => void;
}

interface MatchingCard {
  id: string;
  content: string;
  type: 'front' | 'back';
  pairId: string;
  isMatched: boolean;
  isUserFlashcard?: boolean;
}

const MAX_ROUNDS = 5;

export function FlashcardMatchingGame({ flashcards, onClose, onNext, onSelectNewGame }: FlashcardMatchingGameProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { updateFromMatching } = useSRSProgress();
  const { addGameXP } = useXP();
  const { trackGame } = useAnalytics();
  const [cards, setCards] = useState<MatchingCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<MatchingCard[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [endTime, setEndTime] = useState<number | null>(null);
  const [wrongMatch, setWrongMatch] = useState<string[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalXPEarned, setTotalXPEarned] = useState(0);

  const handleRestart = () => {
    setMatchedPairs([]);
    setScore(0);
    setEndTime(null);
    setWrongMatch([]);
    setSelectedCards([]);
    setCurrentRound(1);
    setStartTime(Date.now());
    initializeGame();
  };

  // Game config
  const maxPairs = 6; // 12 cards total

  useEffect(() => {
    initializeGame();
    // Track game start
    trackGame('matching', 'start', undefined, {
      totalCards: flashcards.length
    });
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
        isMatched: false,
        isUserFlashcard: card.isUserFlashcard
      });
      gameCards.push({
        id: `${card.id}-back`,
        content: card.back_text,
        type: 'back',
        pairId: card.id,
        isMatched: false,
        isUserFlashcard: card.isUserFlashcard
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

  // Track first try status for each pair
  const pairAttempts = useRef<Map<string, number>>(new Map());

  const checkMatch = async (card1: MatchingCard, card2: MatchingCard) => {
    // Track attempts
    const attempts = pairAttempts.current.get(card1.pairId) || 0;
    pairAttempts.current.set(card1.pairId, attempts + 1);

    if (card1.pairId === card2.pairId) {
      // Match found
      const newMatched = [...matchedPairs, card1.pairId];
      setMatchedPairs(newMatched);
      setScore(score + 10);

      // Add XP for correct match
      addGameXP('matching', true, false).then(xpResult => {
        if (xpResult?.xpAdded) {
          setTotalXPEarned(prev => prev + xpResult.xpAdded);
        }
      });

      setCards(cards.map(c =>
        c.pairId === card1.pairId ? { ...c, isMatched: true } : c
      ));

      setSelectedCards([]);

      // Update SRS
      const isFirstTry = attempts === 0;
      await updateFromMatching(card1.pairId, true, isFirstTry, card1.isUserFlashcard);

      // Check Round Completion
      if (newMatched.length === Math.min(flashcards.length, maxPairs)) {
        if (currentRound < MAX_ROUNDS) {
          // Wait a bit then start next round
          setTimeout(() => {
            setCurrentRound(prev => prev + 1);
            setMatchedPairs([]);
            setSelectedCards([]);
            initializeGame();
          }, 50);
        } else {
          // Game Over (All rounds done)
          const endTimeNow = Date.now();
          setEndTime(endTimeNow);
          // Track game completion
          const gameDuration = Math.round((endTimeNow - startTime) / 1000);
          trackGame('matching', 'complete', score + 10, {
            totalCards: flashcards.length,
            totalRounds: MAX_ROUNDS,
            duration: gameDuration
          });
        }
      }
    } else {
      // No match
      setWrongMatch([card1.id, card2.id]);
      await updateFromMatching(card1.pairId, false, false, card1.isUserFlashcard);

      setTimeout(() => {
        setSelectedCards([]);
        setWrongMatch([]);
      }, 400);
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
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm overflow-auto flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 25, duration: 0.1 }}
          className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-sm w-full shadow-2xl text-center border border-white/50 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-20 sm:h-24 bg-gradient-to-b from-cyan-50 to-transparent -z-10"></div>

          <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white rounded-2xl sm:rounded-3xl shadow-lg flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-slate-50">
            <Trophy className="h-7 w-7 sm:h-10 sm:w-10 text-yellow-500 drop-shadow-sm" />
          </div>

          <h2 className="text-lg sm:text-xl font-black text-slate-800 mb-1 tracking-tight">{t('games.great')}</h2>
          <p className="text-slate-500 mb-3 sm:mb-4 font-medium text-xs sm:text-sm">
            {t('games.completedAllRounds')}
          </p>

          <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-2 sm:p-3 mb-3 sm:mb-6 border border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">{t('games.totalTime')}</p>
            <p className="text-lg sm:text-xl font-black text-cyan-600 tracking-tight">{minutes}:{seconds.toString().padStart(2, '0')}</p>
          </div>

          <div className="flex flex-row gap-2 justify-center w-full">
            <Button
              onClick={handleRestart}
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-200 transition-all rounded-lg sm:rounded-xl h-9 sm:h-10 text-[10px] sm:text-xs font-bold active:scale-95 px-1 sm:px-3"
            >
              <span className="hidden sm:inline">{t('games.playAgain')}</span>
              <span className="sm:hidden">{t('games.playAgainShort')}</span>
            </Button>

            <Button
              onClick={() => {
                if (onSelectNewGame) {
                  onSelectNewGame();
                } else {
                  const selectedVocab = flashcards.map(f => ({
                    id: f.id,
                    word: f.front_text,
                    meaning: f.back_text
                  }));
                  navigate('/ai-listening-section3-intro', {
                    state: { selectedVocab }
                  });
                }
              }}
              className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-800 border-0 rounded-lg sm:rounded-xl h-9 sm:h-10 text-[10px] sm:text-xs font-bold active:scale-95 transition-all px-1 sm:px-3"
            >
              <Gamepad2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 shrink-0" />
              <span className="hidden sm:inline">{t('games.otherGames')}</span>
              <span className="sm:hidden">{t('games.selectGameShort')}</span>
            </Button>

            <Button
              onClick={onClose}
              className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-800 border-0 rounded-lg sm:rounded-xl h-9 sm:h-10 text-[10px] sm:text-xs font-bold active:scale-95 transition-all px-1 sm:px-3"
            >
              {t('common.exit')}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-cyan-50 via-sky-50 to-cyan-100 dark:from-cyan-950 dark:via-sky-900 dark:to-cyan-950 overflow-auto z-50">
      <BackgroundDecorations />

      <div className="container mx-auto px-2 md:px-4 py-4 md:py-6 relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <Button variant="ghost" onClick={onClose} className="rounded-full hover:bg-slate-200/50 text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft className="mr-2 h-5 w-5" />
            ออก
          </Button>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Round Indicator */}
            <div className="flex items-center gap-1.5 md:gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-xl shadow-md border border-white/20">
              <Flag className="h-4 w-4 md:h-5 md:w-5" />
              <span className="font-bold text-base md:text-lg">Round {currentRound}/{MAX_ROUNDS}</span>
            </div>

            <div className="flex items-center gap-1.5 md:gap-2 bg-white/80 backdrop-blur-md px-3 md:px-4 py-1.5 md:py-2 rounded-xl shadow-sm border border-white/50">
              <Trophy className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
              <span className="font-bold text-base md:text-lg">{score}</span>
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="flex-1 flex items-center justify-center max-w-5xl mx-auto w-full">
          <Card className="w-full bg-white/90 backdrop-blur-xl border-white/50 shadow-2xl rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden">
            <CardHeader className="pb-0 md:pb-2 pt-4 md:pt-6">
              <CardTitle className="text-center text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-600 to-sky-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
                <span className="text-2xl md:text-3xl">🧩</span> Matching Pair
                <span className="text-sm font-normal text-muted-foreground ml-2">(Round {currentRound})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-8">

              <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
                <AnimatePresence>
                  {cards.map((card) => (
                    <motion.button
                      key={card.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: card.isMatched ? 0 : 1, scale: card.isMatched ? 0.9 : 1 }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.1 } }}
                      transition={{ duration: 0.15 }} // Quick transition, no layout movement
                      onClick={() => handleCardClick(card)}
                      className={`
                        aspect-[4/3] md:aspect-video rounded-lg md:rounded-xl p-1 md:p-4 flex items-center justify-center text-center transition-colors duration-100
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