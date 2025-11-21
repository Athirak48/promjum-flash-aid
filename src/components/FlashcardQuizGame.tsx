import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { X, CheckCircle, XCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Flashcard {
  id: string;
  front_text: string;
  back_text: string;
}

interface FlashcardQuizGameProps {
  flashcards: Flashcard[];
  onClose: () => void;
}

interface QuizQuestion {
  flashcard: Flashcard;
  options: string[];
  correctAnswer: string;
}

export function FlashcardQuizGame({ flashcards, onClose }: FlashcardQuizGameProps) {
  const { t } = useLanguage();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);

  // Generate quiz questions
  useEffect(() => {
    if (flashcards.length < 4) return; // Need at least 4 cards for multiple choice

    const generateQuestions = () => {
      const quizQuestions: QuizQuestion[] = [];
      const maxQuestions = Math.min(10, flashcards.length);
      const selectedCards = [...flashcards].sort(() => 0.5 - Math.random()).slice(0, maxQuestions);

      selectedCards.forEach(card => {
        const correctAnswer = card.back_text;
        const otherAnswers = flashcards
          .filter(c => c.id !== card.id && c.back_text !== correctAnswer)
          .map(c => c.back_text)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);

        const options = [correctAnswer, ...otherAnswers].sort(() => 0.5 - Math.random());

        quizQuestions.push({
          flashcard: card,
          options,
          correctAnswer
        });
      });

      setQuestions(quizQuestions);
    };

    generateQuestions();
  }, [flashcards]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
  };

  const handleConfirmAnswer = () => {
    if (!selectedAnswer || isAnswered) return;
    
    setIsAnswered(true);
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setIsGameComplete(true);
    }
  };

  const getOptionStyle = (option: string) => {
    if (!isAnswered) {
      return selectedAnswer === option
        ? "bg-primary/20 border-primary text-primary-foreground"
        : "bg-card hover:bg-muted border-border text-foreground";
    }

    if (option === currentQuestion.correctAnswer) {
      return "bg-green-500/20 border-green-500 text-green-700 dark:text-green-400";
    }

    if (option === selectedAnswer && option !== currentQuestion.correctAnswer) {
      return "bg-red-500/20 border-red-500 text-red-700 dark:text-red-400";
    }

    return "bg-muted border-border text-muted-foreground";
  };

  if (flashcards.length < 4) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-foreground mb-4">ไม่สามารถเล่นเกมได้</h3>
            <p className="text-muted-foreground mb-4">
              ต้องมีแฟลชการ์ดอย่างน้อย 4 ใบเพื่อเล่นเกม Quiz
            </p>
            <Button onClick={onClose}>ปิด</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isGameComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    const wrongAnswers = questions.length - score;
    
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-purple-950 dark:via-pink-900 dark:to-purple-950 z-50">
        <div className="flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 bg-card/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl max-w-lg w-full border border-border"
          >
            <div className="text-6xl mb-4">
              {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '📚'}
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">สรุปผล Quiz Game</h2>
            
            {/* Main Score */}
            <div className="bg-gradient-primary rounded-xl p-6 text-white">
              <div className="text-5xl font-bold mb-2">
                {score}/{questions.length}
              </div>
              <div className="text-2xl mb-1">
                {percentage}%
              </div>
              <div className="text-lg opacity-90">
                {percentage >= 80 ? '🏆 ยอดเยี่ยม!' : 
                 percentage >= 60 ? '⭐ ดีมาก!' : 
                 percentage >= 40 ? '👍 พอใช้' : '💪 ลองใหม่!'}
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                  {score}
                </div>
                <div className="text-sm text-green-900 dark:text-green-100 mt-1">
                  ตอบถูก
                </div>
              </div>
              <div className="text-center p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <div className="text-3xl font-bold text-red-700 dark:text-red-300">
                  {wrongAnswers}
                </div>
                <div className="text-sm text-red-900 dark:text-red-100 mt-1">
                  ตอบผิด
                </div>
              </div>
            </div>

            {/* Knowledge Level */}
            <div className="bg-muted rounded-xl p-4">
              <p className="font-semibold text-foreground mb-2">ระดับความรู้</p>
              <div className="flex justify-center items-center gap-2">
                {percentage >= 90 ? '⭐⭐⭐⭐⭐' :
                 percentage >= 70 ? '⭐⭐⭐⭐' :
                 percentage >= 50 ? '⭐⭐⭐' :
                 percentage >= 30 ? '⭐⭐' : '⭐'}
                <span className="text-sm text-muted-foreground">
                  ({percentage >= 90 ? 'ผู้เชี่ยวชาญ' :
                    percentage >= 70 ? 'ดีเยี่ยม' :
                    percentage >= 50 ? 'ดี' :
                    percentage >= 30 ? 'พอใช้' : 'ต้องพัฒนา'})
                </span>
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

  if (!currentQuestion) return null;

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-blue-950 dark:via-indigo-900 dark:to-purple-950 z-50">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-card/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-foreground">Quiz Mode</h2>
            <div className="text-sm text-muted-foreground">
              คำถามที่ {currentQuestionIndex + 1}/{questions.length}
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

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full space-y-6">
            {/* Question */}
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl p-6 shadow-lg text-center border border-border"
            >
              <h3 className="text-xl font-semibold text-foreground mb-4">คำถาม</h3>
              <p className="text-lg text-foreground">{currentQuestion.flashcard.front_text}</p>
            </motion.div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3">
              <AnimatePresence mode="wait">
                {currentQuestion.options.map((option, index) => (
                  <motion.button
                    key={`${currentQuestionIndex}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={isAnswered}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${getOptionStyle(option)} ${
                      !isAnswered ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option}</span>
                      {isAnswered && option === currentQuestion.correctAnswer && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                      {isAnswered && option === selectedAnswer && option !== currentQuestion.correctAnswer && (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            {/* Action Button */}
            <div className="text-center">
              {!isAnswered ? (
                <Button
                  onClick={handleConfirmAnswer}
                  disabled={!selectedAnswer}
                  className="px-8 py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  ยืนยันคำตอบ
                </Button>
              ) : (
                <Button
                  onClick={handleNextQuestion}
                  className="px-8 py-3 text-lg font-semibold bg-purple-600 hover:bg-purple-700"
                >
                  {currentQuestionIndex < questions.length - 1 ? 'คำถามถัดไป' : 'ดูผลลัพธ์'}
                </Button>
              )}
            </div>

            {/* Score */}
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-card/80 rounded-full px-4 py-2 border border-border">
                <span className="text-sm text-muted-foreground">คะแนน:</span>
                <span className="font-bold text-primary">{score}/{questions.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}