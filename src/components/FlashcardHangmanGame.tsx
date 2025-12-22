import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Home, Lightbulb, X, RotateCcw, Gamepad2, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import BackgroundDecorations from '@/components/BackgroundDecorations';
import { useSRSProgress } from '@/hooks/useSRSProgress';
import { motion, AnimatePresence } from 'framer-motion';

interface Flashcard {
  id: string;
  front_text: string;
  back_text: string;
  created_at: string;
  front_image?: string | null;
  isUserFlashcard?: boolean;
}

interface FlashcardHangmanGameProps {
  flashcards: Flashcard[];
  onClose: () => void;
  onNext?: () => void;
  onSelectNewGame?: () => void;
}

export function FlashcardHangmanGame({ flashcards, onClose, onNext, onSelectNewGame }: FlashcardHangmanGameProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { updateFromHangman } = useSRSProgress();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [showResult, setShowResult] = useState(false);
  const [wonCount, setWonCount] = useState(0);
  const [lostCount, setLostCount] = useState(0);
  const [lostWords, setLostWords] = useState<{ word: string; meaning: string }[]>([]);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [hintPositions, setHintPositions] = useState<number[]>([]);

  const maxWrongGuesses = 7;
  const currentCard = flashcards[currentIndex];
  const targetWord = currentCard.front_text.toUpperCase().trim();

  // Calculate how many hints to show
  const getHintPositions = (word: string): number[] => {
    const wordLength = word.length;
    const hintCount = wordLength <= 6 ? 1 : 2;
    const positions: number[] = [];

    // Randomly select hint positions
    const availablePositions = Array.from({ length: wordLength }, (_, i) => i);
    for (let i = 0; i < hintCount; i++) {
      const randomIndex = Math.floor(Math.random() * availablePositions.length);
      positions.push(availablePositions[randomIndex]);
      availablePositions.splice(randomIndex, 1);
    }

    return positions;
  };

  useEffect(() => {
    setHintPositions(getHintPositions(targetWord));
  }, [currentIndex, flashcards]);

  const handleRestart = () => {
    setCurrentIndex(0);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setScore(0);
    setGameStatus('playing');
    setShowResult(false);
    setWonCount(0);
    setLostCount(0);
    setLostWords([]);
    setIsGameComplete(false);
  };

  // Generate alphabet buttons
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Check if letter is in word
  const handleLetterClick = (letter: string) => {
    if (guessedLetters.includes(letter) || gameStatus !== 'playing') return;

    const newGuessedLetters = [...guessedLetters, letter];
    setGuessedLetters(newGuessedLetters);

    if (!targetWord.includes(letter)) {
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);

      if (newWrongGuesses >= maxWrongGuesses) {
        setGameStatus('lost');
        setShowResult(true);
      }
    } else {
      // Check if word is complete
      const isComplete = targetWord.split('').every(
        char => newGuessedLetters.includes(char) || hintPositions.includes(targetWord.indexOf(char))
      );

      if (isComplete) {
        const wordScore = targetWord.length * 10;
        setScore(score + wordScore);
        setGameStatus('won');
        setShowResult(true);
      }
    }
  };

  // Display word with guessed letters
  const displayWord = () => {
    return targetWord.split('').map((letter, index) => {
      if (guessedLetters.includes(letter) || hintPositions.includes(index)) {
        return letter;
      }
      return '_';
    }).join(' ');
  };

  // Move to next word
  const handleNext = async () => {
    // Update SRS: Q=5 perfect (0 wrong), Q=2 (<=3 wrong), Q=0 (lost or >5 wrong)
    await updateFromHangman(currentCard.id, gameStatus === 'won', wrongGuesses, currentCard.isUserFlashcard);

    // Update stats
    if (gameStatus === 'won') {
      setWonCount(wonCount + 1);
    } else if (gameStatus === 'lost') {
      setLostCount(lostCount + 1);
      setLostWords(prev => [...prev, { word: currentCard.front_text, meaning: currentCard.back_text }]);
    }

    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setGuessedLetters([]);
      setWrongGuesses(0);
      setGameStatus('playing');
      setShowResult(false);
    } else {
      // Game finished - show summary
      setIsGameComplete(true);
    }
  };

  // Game Complete Summary
  if (isGameComplete) {
    const totalGames = wonCount + lostCount;
    const successRate = totalGames > 0 ? Math.round((wonCount / totalGames) * 100) : 0;

    return (
      <div className="fixed inset-0 bg-orange-50/95 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4">
        <BackgroundDecorations />
        <Card className="max-w-md w-full shadow-2xl relative z-10 bg-white/90 backdrop-blur-xl border-white/50 rounded-2xl sm:rounded-[2.5rem] overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 sm:h-32 bg-gradient-to-b from-orange-100/50 to-transparent pointer-events-none" />
          <CardHeader className="text-center pb-2 pt-4 sm:pt-8 relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-5xl sm:text-7xl mb-2 sm:mb-4 mx-auto bg-white rounded-full w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center shadow-lg"
            >
              🎮
            </motion.div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-orange-800">
              {t('games.summary')} {t('games.hangman')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-6 p-4 sm:p-8">
            {/* Score Summary */}
            <div className="bg-orange-500 rounded-xl sm:rounded-3xl p-4 sm:p-6 text-white text-center shadow-lg shadow-orange-200 transform hover:scale-105 transition-transform duration-300">
              <div className="text-3xl sm:text-5xl font-black mb-1">{score}</div>
              <div className="text-xs sm:text-sm font-medium opacity-90">{t('games.totalScore')}</div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg sm:rounded-2xl border border-green-100">
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  {wonCount}
                </div>
                <div className="text-[10px] sm:text-xs text-green-700 mt-1 font-medium">
                  {t('games.won')}
                </div>
              </div>
              <div className="text-center p-2 sm:p-3 bg-red-50 rounded-lg sm:rounded-2xl border border-red-100">
                <div className="text-xl sm:text-2xl font-bold text-red-600">
                  {lostCount}
                </div>
                <div className="text-[10px] sm:text-xs text-red-700 mt-1 font-medium">
                  {t('games.lost')}
                </div>
              </div>
              <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg sm:rounded-2xl border border-blue-100">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">
                  {successRate}%
                </div>
                <div className="text-[10px] sm:text-xs text-blue-700 mt-1 font-medium">
                  {t('games.success')}
                </div>
              </div>
            </div>

            {/* Lost Words Section */}
            {lostWords.length > 0 ? (
              <div className="bg-red-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-red-100">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <span className="text-red-500">❌</span>
                  <span className="font-bold text-sm sm:text-base text-red-700">{t('games.lostWords')} ({lostWords.length})</span>
                </div>
                <div className="space-y-1.5 sm:space-y-2 max-h-24 sm:max-h-32 overflow-y-auto">
                  {lostWords.map((w, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm">
                      <span className="font-medium text-red-800 truncate mr-2">{w.word}</span>
                      <span className="text-red-500 truncate">{w.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-green-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-green-100 text-center">
                <span className="text-3xl sm:text-4xl mb-2 block">🎉</span>
                <span className="font-bold text-sm sm:text-base text-green-700">{t('games.noWrongWords')}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-row gap-2 justify-center">
              {/* ปุ่ม 1: เล่นใหม่ - เล่นเกมนี้อีกครั้ง */}
              <Button
                onClick={handleRestart}
                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-lg transition-all rounded-xl h-10 sm:h-12 text-[10px] sm:text-sm px-2 sm:px-4"
              >
                <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 shrink-0" />
                <span className="hidden sm:inline">{t('games.playAgain')}</span>
                <span className="sm:hidden">{t('games.playAgainShort')}</span>
              </Button>

              {/* ปุ่ม 2: เกมใหม่ - กลับไปหน้าเลือกเกมในคลังคำศัพท์ */}
              <Button
                onClick={() => {
                  if (onSelectNewGame) {
                    onSelectNewGame();
                  }
                }}
                variant="outline"
                className="flex-1 rounded-xl h-10 sm:h-12 text-[10px] sm:text-sm border-orange-200 text-orange-700 hover:bg-orange-50 px-2 sm:px-4"
              >
                <Gamepad2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 shrink-0" />
                <span className="hidden sm:inline">{t('games.selectGame')}</span>
                <span className="sm:hidden">{t('games.selectGameShort')}</span>
              </Button>

              {/* ปุ่ม 3: ถัดไป - กลับไปหน้าชุดคำศัพท์ */}
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 rounded-xl h-10 sm:h-12 text-[10px] sm:text-sm border-gray-200 px-2 sm:px-4"
              >
                {t('common.next')}
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2 shrink-0" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-orange-50/90 backdrop-blur-sm z-50 overflow-y-auto">
      <BackgroundDecorations />

      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-white shadow-2xl rounded-[2.5rem] border-4 border-white overflow-hidden relative">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 left-4 z-20 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>

          <CardContent className="p-0">
            {/* Header */}
            <div className="pt-8 pb-4 px-8 flex items-center justify-center relative">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white">
                  <span className="text-lg">🍊</span>
                </div>
                <h1 className="text-2xl font-bold text-orange-600">Hangman Master</h1>
              </div>

              <div className="absolute right-8 top-8 bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-bold">
                {currentIndex + 1}/{flashcards.length}
              </div>
            </div>

            {/* Main Game Area */}
            <div className="flex flex-col items-center px-4 pb-8">

              {/* Target Icon/Image */}
              <div className="mb-6 relative">
                <div className="w-32 h-32 rounded-full bg-orange-50 border-4 border-orange-100 flex items-center justify-center shadow-inner overflow-hidden">
                  {currentCard.front_image ? (
                    <img src={currentCard.front_image} alt="Target" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-6xl animate-bounce-slow">
                      {/* Emoji เปลี่ยนตามจำนวนครั้งที่ผิด */}
                      {wrongGuesses === 0 && '😊'}
                      {wrongGuesses === 1 && '🙂'}
                      {wrongGuesses === 2 && '😐'}
                      {wrongGuesses === 3 && '😟'}
                      {wrongGuesses === 4 && '😰'}
                      {wrongGuesses === 5 && '😨'}
                      {wrongGuesses === 6 && '😱'}
                      {wrongGuesses >= 7 && '💀'}
                    </div>
                  )}
                </div>
                {/* Mistakes Badge */}
                <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full shadow-md border text-xs font-bold whitespace-nowrap ${wrongGuesses >= 5 ? 'border-red-200 text-red-500' : 'border-orange-100 text-orange-500'
                  }`}>
                  ผิดได้อีก {maxWrongGuesses - wrongGuesses} ครั้ง
                </div>
              </div>

              {/* Word Puzzle */}
              <div className="mb-8 mt-4 text-center">
                <div className="w-full overflow-x-auto pb-4 no-scrollbar flex justify-center">
                  <div className="flex flex-nowrap gap-1 sm:gap-2 mb-2 min-w-min px-4">
                    {displayWord().split(' ').map((char, i) => (
                      <span key={i} className={`
                                      text-2xl sm:text-4xl font-bold w-8 sm:w-10 text-center border-b-4 rounded-sm shrink-0
                                      ${char === '_' ? 'border-gray-200 text-transparent' : 'border-orange-400 text-orange-600'}
                                      transition-all duration-300
                                  `}>
                        {char === '_' ? 'A' : char}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hint */}
              <div className="mb-8 bg-orange-50/80 px-6 py-3 rounded-2xl border border-orange-100 flex items-center gap-3">
                <Lightbulb className="w-5 h-5 text-orange-400 fill-orange-400" />
                <span className="text-orange-800 font-medium">คำใบ้: <span className="font-bold text-orange-900">{currentCard.back_text}</span></span>
              </div>

              {/* Result Overlay */}
              <AnimatePresence>
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute inset-0 bg-white/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-8 text-center"
                  >
                    <div className={`text-6xl mb-4 ${gameStatus === 'won' ? 'animate-bounce' : 'animate-shake'}`}>
                      {gameStatus === 'won' ? '🎉' : '💀'}
                    </div>
                    <h2 className={`text-3xl font-bold mb-2 ${gameStatus === 'won' ? 'text-green-600' : 'text-red-600'}`}>
                      {gameStatus === 'won' ? 'ถูกต้อง!' : 'เสียใจด้วย!'}
                    </h2>
                    <p className="text-gray-600 mb-8 text-lg">
                      คำตอบคือ <span className="font-bold text-gray-900">{targetWord}</span>
                    </p>
                    <Button
                      onClick={handleNext}
                      className="h-14 px-8 rounded-2xl text-lg font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200"
                    >
                      {currentIndex < flashcards.length - 1 ? 'ไปข้อถัดไป' : 'ดูสรุปผล'}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Keyboard */}
              <div className="w-full max-w-lg">
                <div className="flex flex-wrap justify-center gap-2">
                  {alphabet.map((letter) => {
                    const isGuessed = guessedLetters.includes(letter);
                    const isCorrect = isGuessed && targetWord.includes(letter);

                    return (
                      <button
                        key={letter}
                        onClick={() => handleLetterClick(letter)}
                        disabled={isGuessed}
                        className={`
                                            w-10 h-12 rounded-xl font-bold text-lg transition-all duration-200 shadow-[0_2px_0_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-[2px]
                                            ${isGuessed
                            ? isCorrect
                              ? 'bg-green-500 text-white border-green-600'
                              : 'bg-red-100 text-red-300 border-red-100'
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600'
                          }
                                        `}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
