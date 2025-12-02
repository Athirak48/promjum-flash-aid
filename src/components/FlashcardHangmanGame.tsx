import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, RotateCcw, Home, Heart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import BackgroundDecorations from '@/components/BackgroundDecorations';
import { useSRSProgress } from '@/hooks/useSRSProgress';

interface Flashcard {
  id: string;
  front_text: string;
  back_text: string;
  created_at: string;
}

interface FlashcardHangmanGameProps {
  flashcards: Flashcard[];
  onClose: () => void;
}

export function FlashcardHangmanGame({ flashcards, onClose }: FlashcardHangmanGameProps) {
  const { t } = useLanguage();
  const { updateFromHangman } = useSRSProgress();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [showResult, setShowResult] = useState(false);
  const [wonCount, setWonCount] = useState(0);
  const [lostCount, setLostCount] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);

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

  const [hintPositions] = useState(() => getHintPositions(targetWord));

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
    await updateFromHangman(currentCard.id, gameStatus === 'won', wrongGuesses);

    // Update stats
    if (gameStatus === 'won') {
      setWonCount(wonCount + 1);
    } else if (gameStatus === 'lost') {
      setLostCount(lostCount + 1);
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

  // Draw hangman
  const drawHangman = () => {
    const stages = [
      // Stage 0 - empty
      <div key="0" className="text-6xl md:text-8xl animate-bounce-slow">🎯</div>,
      // Stage 1
      <div key="1" className="text-6xl md:text-8xl animate-pulse">😐</div>,
      // Stage 2
      <div key="2" className="text-6xl md:text-8xl animate-pulse">😟</div>,
      // Stage 3
      <div key="3" className="text-6xl md:text-8xl animate-pulse">😧</div>,
      // Stage 4
      <div key="4" className="text-6xl md:text-8xl animate-pulse">😨</div>,
      // Stage 5
      <div key="5" className="text-6xl md:text-8xl animate-pulse">😰</div>,
      // Stage 6
      <div key="6" className="text-6xl md:text-8xl animate-pulse">😱</div>,
      // Stage 7 - complete (lost)
      <div key="7" className="text-6xl md:text-8xl animate-shake">💀</div>,
    ];

    return stages[wrongGuesses];
  };

  // Game Complete Summary
  if (isGameComplete) {
    const totalGames = wonCount + lostCount;
    const successRate = totalGames > 0 ? Math.round((wonCount / totalGames) * 100) : 0;

    return (
      <div className="fixed inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-orange-950 dark:via-amber-900 dark:to-orange-950 overflow-auto flex items-center justify-center p-4">
        <BackgroundDecorations />
        <Card className="max-w-xl w-full shadow-2xl relative z-10 bg-white/90 backdrop-blur-xl border-white/50 rounded-[2rem]">
          <CardHeader className="text-center pb-2">
            <div className="text-6xl mb-4 animate-bounce">🎮</div>
            <CardTitle className="text-3xl font-bold text-foreground bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              สรุปผล Hangman Master
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Summary */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white text-center shadow-lg transform hover:scale-105 transition-transform duration-300">
              <div className="text-6xl font-bold mb-2">{score}</div>
              <div className="text-xl opacity-90 font-medium">คะแนนรวม</div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-2xl border border-green-100">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {wonCount}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300 mt-1 font-medium">
                  ชนะ
                </div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/30 rounded-2xl border border-red-100">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {lostCount}
                </div>
                <div className="text-sm text-red-700 dark:text-red-300 mt-1 font-medium">
                  แพ้
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-2xl border border-blue-100">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {successRate}%
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300 mt-1 font-medium">
                  อัตราสำเร็จ
                </div>
              </div>
            </div>

            {/* Performance Message */}
            <div className="text-center p-4 bg-muted/50 rounded-2xl border border-border/50">
              <p className="text-lg font-semibold text-foreground">
                {successRate >= 80 ? '🏆 ยอดเยี่ยม! คุณคือเซียนคำศัพท์!' :
                  successRate >= 60 ? '👍 ดีมาก! คุณทำได้ดี' :
                    successRate >= 40 ? '📖 พอใช้ ฝึกฝนอีกนิดนะ' :
                      '💪 ไม่เป็นไร ลองใหม่อีกครั้ง!'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={onClose}
                className="flex-1 rounded-xl h-12 text-lg font-medium"
                size="lg"
                variant="outline"
              >
                <Home className="h-5 w-5 mr-2" />
                กลับหน้าหลัก
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-orange-950 dark:via-amber-900 dark:to-orange-950 overflow-auto">
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
                {currentIndex + 1} / {flashcards.length}
              </span>
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="flex-1 flex items-center justify-center max-w-4xl mx-auto w-full">
          <Card className="w-full bg-white/90 backdrop-blur-xl border-white/50 shadow-2xl rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden relative">
            <div className="absolute top-4 right-4 md:top-6 md:right-6 bg-orange-100/80 px-3 py-1 rounded-full text-orange-700 font-bold text-sm shadow-sm border border-orange-200 z-20">
              {currentIndex + 1}/{flashcards.length}
            </div>
            <CardHeader className="pb-0 md:pb-2 pt-4 md:pt-6">
              <CardTitle className="text-center text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
                <span className="text-2xl md:text-3xl">🎯</span> Hangman Master
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-8 p-4 md:p-8">

              {/* Game Status Area */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-16">
                {/* Hangman Drawing */}
                <div className="relative">
                  <div className="flex justify-center items-center h-24 w-24 md:h-32 md:w-32 bg-orange-50 rounded-full border-4 border-orange-100 shadow-inner">
                    <div className="scale-75 md:scale-100 transform origin-center">
                      {drawHangman()}
                    </div>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-2 md:px-3 py-0.5 md:py-1 rounded-full shadow-md border border-gray-100 text-xs md:text-sm font-bold text-orange-600 whitespace-nowrap">
                    ผิดได้อีก {maxWrongGuesses - wrongGuesses} ครั้ง
                  </div>
                </div>

                {/* Word Display */}
                <div className="text-center flex-1 w-full">
                  <div className="mb-4 md:mb-6 min-h-[3rem] md:min-h-[4rem] flex items-center justify-center flex-wrap gap-1 md:gap-2 px-2">
                    {displayWord().split(' ').map((char, i) => (
                      <span key={i} className={`
                        text-3xl md:text-5xl font-mono font-bold w-8 md:w-14 border-b-2 md:border-b-4 
                        ${char === '_' ? 'border-gray-300 text-transparent' : 'border-orange-500 text-orange-600'}
                        transition-all duration-300
                      `}>
                        {char === '_' ? 'A' : char}
                      </span>
                    ))}
                  </div>
                  <div className="bg-orange-50/80 px-4 py-2 md:px-6 md:py-3 rounded-xl inline-block border border-orange-100 max-w-full">
                    <p className="text-gray-600 dark:text-gray-400 font-medium flex items-center justify-center gap-2 text-sm md:text-base">
                      <span className="text-lg md:text-xl">💡</span> คำใบ้: <span className="text-base md:text-lg text-gray-800 font-bold truncate max-w-[200px] md:max-w-none">{currentCard.back_text}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Result Message */}
              {showResult && (
                <div className="text-center animate-in fade-in zoom-in duration-300">
                  {gameStatus === 'won' ? (
                    <div className="bg-green-50 border border-green-200 p-4 md:p-6 rounded-2xl mb-4 md:mb-6">
                      <p className="text-2xl md:text-3xl font-bold text-green-600 mb-1 md:mb-2">
                        🎉 ถูกต้อง! +{targetWord.length * 10} คะแนน
                      </p>
                      <p className="text-lg md:text-xl text-green-800">คำตอบคือ: <span className="font-bold">{targetWord}</span></p>
                    </div>
                  ) : (
                    <div className="bg-red-50 border border-red-200 p-4 md:p-6 rounded-2xl mb-4 md:mb-6">
                      <p className="text-2xl md:text-3xl font-bold text-red-600 mb-1 md:mb-2">
                        💀 เสียใจด้วย!
                      </p>
                      <p className="text-lg md:text-xl text-red-800">คำตอบที่ถูกคือ: <span className="font-bold">{targetWord}</span></p>
                    </div>
                  )}

                  <Button
                    onClick={handleNext}
                    className="h-12 md:h-14 px-6 md:px-8 text-lg md:text-xl rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all bg-gradient-to-r from-orange-500 to-amber-500 border-0"
                    size="lg"
                  >
                    {currentIndex < flashcards.length - 1 ? (
                      <>ไปข้อถัดไป <ArrowLeft className="ml-2 h-5 w-5 rotate-180" /></>
                    ) : (
                      <>ดูสรุปผล <Trophy className="ml-2 h-5 w-5" /></>
                    )}
                  </Button>
                </div>
              )}

              {/* Alphabet Buttons */}
              {!showResult && (
                <div className="flex flex-wrap justify-center gap-1.5 md:gap-3 max-w-3xl mx-auto pb-2">
                  {alphabet.map((letter) => {
                    const isGuessed = guessedLetters.includes(letter);
                    const isCorrect = isGuessed && targetWord.includes(letter);
                    const isWrong = isGuessed && !targetWord.includes(letter);

                    return (
                      <button
                        key={letter}
                        onClick={() => handleLetterClick(letter)}
                        disabled={isGuessed}
                        className={`
                          w-8 h-10 md:w-12 md:h-14 rounded-lg md:rounded-xl font-bold text-base md:text-xl transition-all duration-200
                          ${isGuessed
                            ? isCorrect
                              ? 'bg-green-500 text-white shadow-inner scale-95'
                              : 'bg-red-500 text-white shadow-inner scale-95 opacity-50'
                            : 'bg-white border md:border-2 border-orange-100 text-gray-700 hover:border-orange-400 hover:bg-orange-50 hover:-translate-y-1 shadow-sm'
                          }
                        `}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
