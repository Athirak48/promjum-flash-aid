import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Volume2, CheckCircle2, XCircle, ArrowRight, Pause, RotateCcw, Home, Trophy, ArrowLeft, Gamepad2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import BackgroundDecorations from '@/components/BackgroundDecorations';
import { useSRSProgress } from '@/hooks/useSRSProgress';

interface Flashcard {
  id: string;
  front_text: string;
  back_text: string;
  created_at: string;
}

interface FlashcardListenChooseGameProps {
  flashcards: Flashcard[];
  onClose: () => void;
  onNext?: () => void;
}

interface Question {
  flashcardId: string;
  word: string;
  correctAnswer: string;
  choices: string[];
}

export const FlashcardListenChooseGame = ({ flashcards, onClose, onNext }: FlashcardListenChooseGameProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { updateFromListenChoose } = useSRSProgress();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<Question[]>([]);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const maxPlayCount = 3;

  useEffect(() => {
    // Generate questions from flashcards
    const generatedQuestions = flashcards.slice(0, 10).map((card) => {
      const correctAnswer = card.back_text;

      // Generate wrong choices
      const otherCards = flashcards.filter(c => c.id !== card.id);
      const wrongChoices = otherCards
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(c => c.back_text);

      // Combine and shuffle
      const choices = [correctAnswer, ...wrongChoices].sort(() => Math.random() - 0.5);

      return {
        flashcardId: card.id,
        word: card.front_text,
        correctAnswer,
        choices
      };
    });

    setQuestions(generatedQuestions);
  }, [flashcards]);

  const currentQuestion = questions[currentQuestionIndex];

  const handlePlayAudio = () => {
    if (playCount >= maxPlayCount) return;

    setPlayCount(playCount + 1);

    // Use Web Speech API for TTS
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentQuestion.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAnswerSelect = async (answer: string) => {
    if (showFeedback) return;

    setSelectedAnswer(answer);
    setShowFeedback(true);

    const isCorrect = answer === currentQuestion.correctAnswer;

    if (isCorrect) {
      setScore(score + 1);
    } else {
      setWrongAnswers([...wrongAnswers, currentQuestion]);
    }

    // Update SRS: Q=5 first listen correct, Q=2 replayed, Q=0 wrong
    await updateFromListenChoose(currentQuestion.flashcardId, isCorrect, playCount);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setPlayCount(0);
    } else {
      setIsGameComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore(0);
    setWrongAnswers([]);
    setIsGameComplete(false);
    setPlayCount(0);
  };

  const getScoreLevel = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 90) return { text: 'ยอดเยี่ยม! 🥇', color: 'text-green-600' };
    if (percentage >= 70) return { text: 'ดีมาก! 🥈', color: 'text-blue-600' };
    if (percentage >= 50) return { text: 'พอใช้ 🥉', color: 'text-orange-600' };
    return { text: 'ควรฝึกฝนเพิ่มเติม 📚', color: 'text-red-600' };
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 dark:from-pink-950 dark:via-rose-900 dark:to-pink-950 flex items-center justify-center">
        <BackgroundDecorations />
        <Card className="p-6 relative z-10">
          <p className="text-center">กำลังโหลดคำถาม...</p>
        </Card>
      </div>
    );
  }

  // Summary Page
  if (isGameComplete) {
    const scoreLevel = getScoreLevel();
    const percentage = Math.round((score / questions.length) * 100);
    const totalWrong = wrongAnswers.length;
    const avgAccuracy = percentage;

    return (
      <div className="fixed inset-0 bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 dark:from-pink-950 dark:via-rose-900 dark:to-pink-950 overflow-auto flex items-center justify-center p-4">
        <BackgroundDecorations />
        <Card className="max-w-xl w-full shadow-2xl relative z-10 bg-white/90 backdrop-blur-xl border-white/50 rounded-[2rem]">
          <CardHeader className="text-center pb-2">
            <div className="text-6xl mb-4 animate-bounce">🎧</div>
            <CardTitle className="text-3xl font-bold text-foreground bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              สรุปผล Listen & Choose
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 text-white text-center shadow-lg transform hover:scale-105 transition-transform duration-300">
              <div className="text-6xl font-bold mb-2">{score}/{questions.length}</div>
              <div className="text-xl opacity-90 font-medium">{scoreLevel.text}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-2xl border border-green-100">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {score}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300 mt-1 font-medium">
                  ถูกต้อง
                </div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/30 rounded-2xl border border-red-100">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {totalWrong}
                </div>
                <div className="text-sm text-red-700 dark:text-red-300 mt-1 font-medium">
                  ผิด
                </div>
              </div>
            </div>

            <div className="flex flex-row gap-3 justify-center">
              <Button
                onClick={handleRestart}
                className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 hover:shadow-lg hover:-translate-y-1 transition-all rounded-xl h-12 text-sm md:text-base"
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
                className="flex-1 rounded-xl h-12 text-sm md:text-base border-pink-200 text-pink-700 hover:bg-pink-50"
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

  // Game Play
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 dark:from-pink-950 dark:via-rose-900 dark:to-pink-950 overflow-auto">
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
                {currentQuestionIndex + 1} / {questions.length}
              </span>
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="flex-1 flex items-center justify-center max-w-2xl mx-auto w-full">
          <Card className="w-full bg-white/90 backdrop-blur-xl border-white/50 shadow-2xl rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden">
            <CardHeader className="pb-0 md:pb-2 pt-4 md:pt-6">
              <CardTitle className="text-center text-xl md:text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
                <span className="text-2xl md:text-3xl">🎧</span> Listen & Choose
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-8">
              {/* Audio Button */}
              <div className="text-center mb-4 md:mb-8">
                <div className="relative inline-block">
                  <Button
                    onClick={handlePlayAudio}
                    size="lg"
                    disabled={playCount >= maxPlayCount}
                    className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 hover:shadow-glow transition-all duration-300 hover:scale-105 shadow-xl border-4 border-white/50"
                  >
                    <Volume2 className="h-12 w-12 md:h-16 md:w-16 text-white" />
                  </Button>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-2 md:px-3 py-0.5 md:py-1 rounded-full shadow-md border border-gray-100 text-xs md:text-sm font-bold text-pink-600 whitespace-nowrap">
                    {playCount >= maxPlayCount ? 'หมดโควต้า' : `ฟังได้อีก ${maxPlayCount - playCount} ครั้ง`}
                  </div>
                </div>
              </div>

              {/* Choices */}
              <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                {currentQuestion.choices.map((choice, index) => {
                  const isSelected = selectedAnswer === choice;
                  const isCorrect = choice === currentQuestion.correctAnswer;
                  const showCorrect = showFeedback && isCorrect;
                  const showWrong = showFeedback && isSelected && !isCorrect;

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(choice)}
                      disabled={showFeedback}
                      className={`w-full p-3 md:p-4 rounded-xl md:rounded-2xl border-2 text-left transition-all duration-200 hover:scale-102 ${showCorrect
                        ? 'bg-green-50 border-green-500 dark:bg-green-900/20 shadow-md'
                        : showWrong
                          ? 'bg-red-50 border-red-500 dark:bg-red-900/20 shadow-md'
                          : isSelected
                            ? 'border-pink-500 bg-pink-50'
                            : 'bg-white border-pink-100 hover:border-pink-300 hover:bg-pink-50 shadow-sm'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-base md:text-lg ${showCorrect
                            ? 'bg-green-500 text-white'
                            : showWrong
                              ? 'bg-red-500 text-white'
                              : 'bg-pink-100 text-pink-600'
                            }`}>
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span className="font-medium text-base md:text-lg">{choice}</span>
                        </div>
                        {showCorrect && <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-green-600" />}
                        {showWrong && <XCircle className="h-5 w-5 md:h-6 md:w-6 text-red-600" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              {showFeedback && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <Button
                    onClick={handleNext}
                    className="w-full h-12 md:h-14 text-lg md:text-xl rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all bg-gradient-to-r from-pink-600 to-rose-600 border-0"
                    size="lg"
                  >
                    {currentQuestionIndex < questions.length - 1 ? (
                      <>
                        คำถามถัดไป
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </>
                    ) : (
                      'ดูผลคะแนน'
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
