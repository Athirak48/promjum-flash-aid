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

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsGameComplete(false);
    setCorrectCount(0);
    setWrongCount(0);
    generateQuestions();
  };

  useEffect(() => {
    generateQuestions();
  }, [flashcards]);

  const generateQuestions = () => {
    const newQuestions = flashcards.map(card => {
      const correctAnswer = card.back_text;
      const otherCards = flashcards.filter(c => c.id !== card.id);
      const wrongOptions = otherCards
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(c => c.back_text);

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
    }
  };

  const handleNext = async () => {
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    await updateFromQuiz(currentQuestion.card.id, isCorrect);

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
      <div className="fixed inset-0 bg-gradient-to-br from-violet-50 via-fuchsia-50 to-violet-100 dark:from-violet-950 dark:via-fuchsia-900 dark:to-violet-950 overflow-auto flex items-center justify-center p-4">
        <BackgroundDecorations />
        <Card className="max-w-xl w-full shadow-2xl relative z-10 bg-white/90 backdrop-blur-xl border-white/50 rounded-[2rem]">
          <CardHeader className="text-center pb-2">
            <div className="text-6xl mb-4 animate-bounce">🏆</div>
            <CardTitle className="text-3xl font-bold text-foreground bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              สรุปผล Quiz Challenge
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-2xl p-6 text-white text-center shadow-lg transform hover:scale-105 transition-transform duration-300">
              <div className="text-6xl font-bold mb-2">{score}</div>
              <div className="text-xl opacity-90 font-medium">คะแนนรวม</div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-2xl border border-green-100">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {correctCount}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300 mt-1 font-medium">
                  ถูกต้อง
                </div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/30 rounded-2xl border border-red-100">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {wrongCount}
                </div>
                <div className="text-sm text-red-700 dark:text-red-300 mt-1 font-medium">
                  ผิด
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-2xl border border-blue-100">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {accuracy}%
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300 mt-1 font-medium">
                  ความแม่นยำ
                </div>
              </div>
            </div>

            <div className="flex flex-row gap-3 justify-center">
              <Button
                onClick={handleRestart}
                className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:shadow-lg hover:-translate-y-1 transition-all rounded-xl h-12 text-sm md:text-base"
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
                className="flex-1 rounded-xl h-12 text-sm md:text-base border-violet-200 text-violet-700 hover:bg-violet-50"
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
                  {currentQuestion.card.front_text}
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