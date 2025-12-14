import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, CheckCircle, XCircle, Home, RotateCcw, ArrowRight, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import BackgroundDecorations from '@/components/BackgroundDecorations';
import { useSRSProgress } from '@/hooks/useSRSProgress';

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
}

interface QuizQuestion {
  card: Flashcard;
  options: string[];
  correctAnswer: string;
}

export function FlashcardQuizGame({ flashcards, onClose, onNext }: FlashcardQuizGameProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { updateFromQuiz } = useSRSProgress();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isGameComplete, setIsGameComplete] = useState(false);

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
    generateQuestions();
  };

  useEffect(() => {
    generateQuestions();
  }, [flashcards]);

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

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);

    const isCorrect = answer === currentQuestion.correctAnswer;

    if (isCorrect) {
      setScore(score + 10 + (streak * 2));
      setStreak(streak + 1);
      setCorrectCount(correctCount + 1);
    } else {
      setStreak(0);
      setWrongCount(wrongCount + 1);
      setWrongWords(prev => [...prev, { word: currentQuestion.card.front_text, meaning: currentQuestion.card.back_text }]);
    }
  };

  const handleNext = async () => {
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    await updateFromQuiz(currentQuestion.card.id, isCorrect, currentQuestion.card.isUserFlashcard);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setIsGameComplete(true);
    }
  };

  if (questions.length === 0) return null;

  const currentQuestion = questions[currentIndex];

  if (isGameComplete) {
    const total = correctCount + wrongCount;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm overflow-auto flex items-center justify-center p-2 sm:p-4 z-50">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="bg-white rounded-2xl sm:rounded-[2rem] p-4 sm:p-8 max-w-sm w-full shadow-2xl text-center border border-white/50 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-24 sm:h-32 bg-gradient-to-b from-violet-50 to-transparent -z-10"></div>

          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl sm:rounded-3xl shadow-lg flex items-center justify-center mx-auto mb-4 sm:mb-6 border border-slate-50">
            <Trophy className="h-8 w-8 sm:h-10 sm:w-10 text-yellow-500 drop-shadow-sm" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2 tracking-tight">{t('games.excellent')}</h2>
          <p className="text-slate-500 mb-4 sm:mb-6 font-medium text-sm sm:text-base">
            {t('games.completedQuiz')}
          </p>

          <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-3 sm:mb-4 border border-slate-100">
            <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">{t('games.totalScore')}</p>
            <p className="text-xl sm:text-2xl font-black text-violet-600 tracking-tight">{score} {t('common.points')}</p>
          </div>

          {/* Wrong Words Section */}
          {wrongWords.length > 0 ? (
            <div className="bg-red-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-red-100 mb-4 sm:mb-6 text-left">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <span className="text-red-500">❌</span>
                <span className="font-bold text-sm sm:text-base text-red-700">{t('games.wrongWords')} ({wrongWords.length})</span>
              </div>
              <div className="space-y-1.5 sm:space-y-2 max-h-20 sm:max-h-28 overflow-y-auto">
                {wrongWords.map((w, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm">
                    <span className="font-medium text-red-800 truncate mr-2">{w.word}</span>
                    <span className="text-red-500 truncate">{w.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-green-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-green-100 mb-4 sm:mb-6 text-center">
              <span className="text-2xl sm:text-3xl mb-2 block">🎉</span>
              <span className="font-bold text-sm sm:text-base text-green-700">{t('games.noWrongWords')}</span>
            </div>
          )}

          <div className="flex flex-row gap-2 justify-center w-full">
            <Button
              onClick={handleRestart}
              className="flex-1 bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200 transition-all rounded-xl h-10 sm:h-12 text-[10px] sm:text-sm font-bold active:scale-95 px-2 sm:px-4"
            >
              <span className="hidden sm:inline">{t('games.playAgain')}</span>
              <span className="sm:hidden">{t('games.playAgainShort')}</span>
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
              className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-800 border-0 rounded-xl h-10 sm:h-12 text-[10px] sm:text-sm font-bold active:scale-95 transition-all px-2 sm:px-4"
            >
              <Gamepad2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 shrink-0" />
              <span className="hidden sm:inline">{t('games.selectGame')}</span>
              <span className="sm:hidden">{t('games.selectGameShort')}</span>
            </Button>

            <Button
              onClick={onNext || onClose}
              className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-800 border-0 rounded-xl h-10 sm:h-12 text-[10px] sm:text-sm font-bold active:scale-95 transition-all px-2 sm:px-4"
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
                {currentIndex + 1} / {questions.length}
              </span>
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="flex-1 flex items-center justify-center max-w-3xl mx-auto w-full">
          <Card className="w-full bg-white/90 backdrop-blur-xl border-white/50 shadow-2xl rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden">
            <CardHeader className="pb-0 md:pb-2 pt-4 md:pt-6">
              <CardTitle className="text-center text-xl md:text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
                <span className="text-2xl md:text-3xl">⚡</span> Quiz Challenge
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-8 p-4 md:p-8">

              {/* Question Display */}
              <div className="text-center py-4 md:py-6">
                <div className="mb-2 text-xs md:text-sm font-medium text-gray-500 uppercase tracking-widest">คำศัพท์</div>
                <h2 className="text-3xl md:text-5xl font-bold text-violet-900 dark:text-violet-100 mb-2 md:mb-4 break-words">
                  {currentQuestion.card.back_text}
                </h2>
                <div className="h-1 w-16 md:w-24 bg-gradient-to-r from-violet-500 to-fuchsia-500 mx-auto rounded-full opacity-50"></div>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <AnimatePresence mode="wait">
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
                          relative p-4 md:p-6 text-base md:text-lg font-medium rounded-xl md:rounded-2xl text-left transition-all duration-300 flex items-center
                          ${buttonStyle}
                          ${!isAnswered && 'hover:-translate-y-1 hover:shadow-md'}
                        `}
                      >
                        <span className="mr-2">{option}</span>
                        {icon}
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Next Button */}
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-2 md:pt-4"
                >
                  <Button
                    onClick={handleNext}
                    className="w-full h-12 md:h-14 text-lg md:text-xl rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all bg-gradient-to-r from-violet-600 to-fuchsia-600 border-0"
                    size="lg"
                  >
                    {currentIndex < questions.length - 1 ? 'ข้อถัดไป' : 'ดูสรุปผล'}
                  </Button>
                </motion.div>
              )}

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}