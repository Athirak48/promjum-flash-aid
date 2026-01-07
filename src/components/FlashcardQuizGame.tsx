import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, CheckCircle, XCircle, Home, RotateCcw, ArrowRight, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import BackgroundDecorations from '@/components/BackgroundDecorations';
import { useSRSProgress } from '@/hooks/useSRSProgress';
import { useXP } from '@/hooks/useXP';
import { XPGainAnimation } from '@/components/xp/XPGainAnimation';
import { useAnalytics } from '@/hooks/useAnalytics';

interface Flashcard {
  id: string;
  front_text: string;
  back_text: string;
  created_at: string;
  isUserFlashcard?: boolean;
}

interface FlashcardQuizGameProps {
  flashcards: Flashcard[];
  onClose: () => void;
  onNext?: () => void;
  onSelectNewGame?: () => void;
}

interface QuizQuestion {
  card: Flashcard;
  options: string[];
  correctAnswer: string;
}

export function FlashcardQuizGame({ flashcards, onClose, onNext, onSelectNewGame }: FlashcardQuizGameProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { updateFromQuiz } = useSRSProgress();
  const { addGameXP, lastGain, clearLastGain } = useXP();
  const { trackGame } = useAnalytics();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [totalXPEarned, setTotalXPEarned] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [timeTakenForCurrent, setTimeTakenForCurrent] = useState(0);
  const [gameStartTime] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState(3); // 3 second countdown for extreme pressure!
  const [isTimedOut, setIsTimedOut] = useState(false);

  // Stats
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [wrongWords, setWrongWords] = useState<{ word: string; meaning: string }[]>([]);


  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsGameComplete(false);
    setCorrectCount(0);
    setWrongCount(0);
    setWrongWords([]);
    setCorrectCount(0);
    setWrongCount(0);
    setWrongWords([]);
    generateQuestions();
    setQuestionStartTime(Date.now());
  };

  useEffect(() => {
    setQuestionStartTime(Date.now());
    setTimeLeft(3.0000); // Reset timer for each question (3 seconds with decimals)
    setIsTimedOut(false);
  }, [currentIndex, questions]);

  useEffect(() => {
    generateQuestions();
    // Track game start
    trackGame('quiz', 'start', undefined, {
      totalCards: flashcards.length
    });
  }, [flashcards]);

  // Countdown timer effect - millisecond precision for excitement!
  useEffect(() => {
    if (isAnswered || isGameComplete || questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 0.01; // Decrease by 0.01 every 10ms
        if (newTime <= 0) {
          clearInterval(timer);
          // Time's up - mark as wrong
          setIsTimedOut(true);
          setIsAnswered(true);
          setSelectedAnswer(null);
          setStreak(0);
          setWrongCount(prev => prev + 1);
          if (questions[currentIndex]) {
            setWrongWords(prev => [...prev, {
              word: questions[currentIndex].card.front_text,
              meaning: questions[currentIndex].card.back_text
            }]);
          }
          return 0;
        }
        return newTime;
      });
    }, 10); // Update every 10ms for smooth countdown

    return () => clearInterval(timer);
  }, [currentIndex, isAnswered, isGameComplete, questions]);

  // Auto-proceed after answer/timeout
  useEffect(() => {
    if (!isAnswered) return;

    const proceedTimer = setTimeout(async () => {
      // Update SRS before proceeding
      if (questions[currentIndex]) {
        const isCorrect = selectedAnswer === questions[currentIndex].correctAnswer;
        const timeTaken = (Date.now() - questionStartTime) / 1000;
        await updateFromQuiz(questions[currentIndex].card.id, isCorrect, timeTaken, questions[currentIndex].card.isUserFlashcard);
      }

      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setIsTimedOut(false);
      } else {
        setIsGameComplete(true);
        const gameDuration = Math.round((Date.now() - gameStartTime) / 1000);
        trackGame('quiz', 'complete', score, {
          totalCards: flashcards.length,
          correctAnswers: correctCount,
          wrongAnswers: wrongCount,
          duration: gameDuration
        });
      }
    }, 200); // Reduce delay to 200ms for near-instant transition

    return () => clearTimeout(proceedTimer);
  }, [isAnswered]);


  const generateQuestions = () => {
    const newQuestions = flashcards.map(card => {
      const correctAnswer = card.front_text;
      const otherCards = flashcards.filter(c => c.id !== card.id);
      const wrongOptions = otherCards
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(c => c.front_text);

      const options = [...wrongOptions, correctAnswer].sort(() => Math.random() - 0.5);

      return {
        card,
        options,
        correctAnswer
      };
    });

    setQuestions(newQuestions);
  };

  const handleAnswerSelect = async (answer: string) => {
    if (isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);

    const timeTaken = (Date.now() - questionStartTime) / 1000;
    setTimeTakenForCurrent(timeTaken);

    const isCorrect = answer === currentQuestion.correctAnswer;

    if (isCorrect) {
      setScore(score + 10 + (streak * 2));
      setStreak(streak + 1);
      setCorrectCount(correctCount + 1);
      // Add XP for correct answer
      const xpResult = await addGameXP('quiz', true, false);
      if (xpResult?.xpAdded) {
        setTotalXPEarned(prev => prev + xpResult.xpAdded);
      }
    } else {
      setStreak(0);
      setWrongCount(wrongCount + 1);
      setWrongWords(prev => [...prev, { word: currentQuestion.card.front_text, meaning: currentQuestion.card.back_text }]);
    }
  };

  // handleNext is now automatic, but keep for manual override if needed
  const handleNext = async () => {
    // Manual next is disabled in timer mode - auto-proceed handles this
  };


  if (questions.length === 0) return null;

  const currentQuestion = questions[currentIndex];

  if (isGameComplete) {
    const total = correctCount + wrongCount;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm overflow-auto flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-sm w-full shadow-2xl text-center border border-white/50 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-20 sm:h-24 bg-gradient-to-b from-violet-50 to-transparent -z-10"></div>

          <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white rounded-2xl sm:rounded-3xl shadow-lg flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-slate-50">
            <Trophy className="h-7 w-7 sm:h-10 sm:w-10 text-yellow-500 drop-shadow-sm" />
          </div>

          <h2 className="text-lg sm:text-xl font-black text-slate-800 mb-1 tracking-tight">{t('games.excellent')}</h2>
          <p className="text-slate-500 mb-3 sm:mb-4 font-medium text-xs sm:text-sm">
            {t('games.completedQuiz')}
          </p>

          <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-2 sm:p-3 mb-3 sm:mb-4 border border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">{t('games.totalScore')}</p>
            <p className="text-lg sm:text-xl font-black text-violet-600 tracking-tight">{score} {t('common.points')}</p>
          </div>

          {/* XP Earned Section */}
          {totalXPEarned > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-2 sm:p-3 mb-3 sm:mb-4 border border-purple-100">
              <p className="text-[10px] text-purple-400 uppercase tracking-wider font-bold mb-0.5">XP Earned</p>
              <p className="text-lg sm:text-xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">+{totalXPEarned} XP ⚡</p>
            </div>
          )}

          {/* Wrong Words Section */}
          {wrongWords.length > 0 ? (
            <div className="bg-red-50 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-red-100 mb-3 sm:mb-4 text-left">
              <div className="flex items-center gap-1.5 mb-1.5 sm:mb-2">
                <span className="text-red-500 text-sm">❌</span>
                <span className="font-bold text-xs sm:text-sm text-red-700">{t('games.wrongWords')} ({wrongWords.length})</span>
              </div>
              <div className="space-y-1 sm:space-y-1.5 max-h-20 sm:max-h-24 overflow-y-auto custom-scrollbar">
                {wrongWords.map((w, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white rounded-md px-2 py-1 text-[10px] sm:text-xs">
                    <span className="font-medium text-red-800 truncate mr-2">{w.word}</span>
                    <span className="text-red-500 truncate">{w.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-green-50 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-green-100 mb-3 sm:mb-4 text-center">
              <span className="text-2xl sm:text-3xl mb-1 block">🎉</span>
              <span className="font-bold text-xs sm:text-sm text-green-700">{t('games.noWrongWords')}</span>
            </div>
          )}

          <div className="flex flex-row gap-2 justify-center w-full">
            <Button
              onClick={handleRestart}
              className="flex-1 bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200 transition-all rounded-lg sm:rounded-xl h-9 sm:h-10 text-[10px] sm:text-xs font-bold active:scale-95 px-1 sm:px-3"
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
              <span className="hidden sm:inline">{t('games.selectGame')}</span>
              <span className="sm:hidden">{t('games.selectGameShort')}</span>
            </Button>

            <Button
              onClick={onClose}
              className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-800 border-0 rounded-lg sm:rounded-xl h-9 sm:h-10 text-[10px] sm:text-xs font-bold active:scale-95 transition-all px-1 sm:px-3"
            >
              {t('common.next')}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-violet-50 via-fuchsia-50 to-violet-100 dark:from-violet-950 dark:via-fuchsia-900 dark:to-violet-950 overflow-auto">
      <BackgroundDecorations />

      {/* XP Gain Animation */}
      {lastGain && (
        <XPGainAnimation
          amount={lastGain.amount}
          levelUp={lastGain.levelUp}
          onComplete={clearLastGain}
        />
      )}

      {/* Critical Time Screen Flash */}
      <div className={`fixed inset-0 bg-red-500/20 z-0 pointer-events-none transition-opacity duration-100 ${timeLeft <= 2 && !isAnswered ? 'opacity-100 animate-pulse' : 'opacity-0'}`} />

      <div className="container mx-auto px-2 md:px-4 py-2 relative z-10 h-screen flex flex-col justify-center">
        {/* Header - Compact */}
        <div className="flex items-center justify-between mb-2">
          <Button variant="ghost" onClick={onClose} size="sm" className="rounded-full hover:bg-slate-200/50 text-slate-500 hover:text-slate-800 transition-colors h-8">
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
                {currentIndex + 1} / {questions.length}
              </span>
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="flex-1 flex items-center justify-center max-w-2xl mx-auto w-full mb-2">
          <Card className="w-full bg-white/90 backdrop-blur-xl border-white/50 shadow-2xl rounded-[1.5rem] overflow-hidden">
            <CardContent className="space-y-3 p-4 pt-10">

              {/* Question Display with Timer */}
              {/* Question Display with Timer */}
              <div className="text-center py-2 relative">
                {/* Countdown Timer - Large & Urgent */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-10">
                  <div className={`
                    min-w-[180px] h-20 rounded-2xl flex items-center justify-center font-mono font-black text-4xl tracking-wider
                    transition-all duration-75 shadow-2xl px-4 border-4 border-white/30 backdrop-blur-md
                    ${timeLeft <= 2 ? 'bg-red-600 text-white animate-pulse scale-110 shadow-red-500/80 rotate-1' :
                      timeLeft <= 3 ? 'bg-orange-500 text-white shadow-orange-500/50' :
                        'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-violet-500/50'}
                    ${isAnswered ? 'opacity-50 grayscale' : ''}
                  `}>
                    {isTimedOut ? 'TIMEOUT' : timeLeft.toFixed(4)}
                  </div>
                </div>

                <div className="mt-20">
                  <div className="mb-1 text-[10px] font-medium text-gray-500 uppercase tracking-widest">คำศัพท์</div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2 break-words text-shadow-sm">
                    {currentQuestion.card.back_text}
                  </h2>
                </div>
              </div>

              {/* Options Grid - Stacked Vertically */}
              {/* Options Grid - Stacked Vertically */}
              <div className="flex flex-col gap-2 md:gap-2.5 max-w-lg mx-auto w-full">
                <AnimatePresence mode="popLayout">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswer === option;
                    const isCorrect = option === currentQuestion.correctAnswer;

                    let buttonStyle = "bg-white hover:bg-violet-50 border-2 border-violet-100 text-violet-900";
                    let icon = null;

                    if (isAnswered) {
                      if (isCorrect) {
                        buttonStyle = "bg-green-500 border-green-600 text-white shadow-lg scale-105";
                        icon = <CheckCircle className="ml-auto h-5 w-5 md:h-6 md:w-6" />;
                      } else if (isSelected) {
                        buttonStyle = "bg-red-500 border-red-600 text-white opacity-50";
                        icon = <XCircle className="ml-auto h-5 w-5 md:h-6 md:w-6" />;
                      } else {
                        buttonStyle = "bg-gray-100 text-gray-400 border-gray-200 opacity-50";
                      }
                    } else if (isSelected) {
                      buttonStyle = "bg-violet-600 border-violet-700 text-white shadow-lg scale-95";
                    }

                    return (
                      <motion.button
                        key={`${currentIndex}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleAnswerSelect(option)}
                        disabled={isAnswered}
                        className={`
                          relative p-3 md:p-4 text-sm md:text-base font-medium rounded-xl text-left transition-all duration-300 flex items-center
                          ${buttonStyle}
                          ${!isAnswered && 'hover:-translate-y-0.5 hover:shadow-sm'}
                        `}
                      >
                        <span className="mr-2">{option}</span>
                        {icon}
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Auto-proceed indicator */}
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="pt-2 md:pt-4 text-center"
                >
                  <div className="inline-flex items-center gap-2 text-slate-500 text-sm font-medium">
                    <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>{isTimedOut ? 'หมดเวลา!' : (selectedAnswer === currentQuestion.correctAnswer ? 'ถูกต้อง! 🎉' : 'ผิด 😢')} กำลังไปข้อถัดไป...</span>
                  </div>
                </motion.div>
              )}

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}