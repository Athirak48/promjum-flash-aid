import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Volume2, CheckCircle2, XCircle, ArrowRight, Pause, RotateCcw, Home, Trophy, ArrowLeft, Gamepad2, X, MoreHorizontal, Check, Flame } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import BackgroundDecorations from '@/components/BackgroundDecorations';
import { useSRSProgress } from '@/hooks/useSRSProgress';
import { useXP } from '@/hooks/useXP';

interface Flashcard {
  id: string;
  front_text: string;
  back_text: string;
  created_at: string;
  isUserFlashcard?: boolean;
}

interface FlashcardListenChooseGameProps {
  flashcards: Flashcard[];
  onClose: () => void;
  onNext?: () => void;
  onSelectNewGame?: () => void;
}

interface Question {
  flashcardId: string;
  word: string;
  correctAnswer: string;
  choices: string[];
  isUserFlashcard?: boolean;
}

export const FlashcardListenChooseGame = ({ flashcards, onClose, onNext, onSelectNewGame }: FlashcardListenChooseGameProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { updateFromListenChoose } = useSRSProgress();
  const { addGameXP } = useXP();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<Question[]>([]);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const maxPlayCount = 3;
  const [totalXPEarned, setTotalXPEarned] = useState(0);

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
        choices,
        isUserFlashcard: card.isUserFlashcard
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
      // Add XP for correct answer
      addGameXP('listen-choose', true, false).then(xpResult => {
        if (xpResult?.xpAdded) {
          setTotalXPEarned(prev => prev + xpResult.xpAdded);
        }
      });
    } else {
      setWrongAnswers([...wrongAnswers, currentQuestion]);
    }

    // Update SRS: Q=5 first listen correct, Q=2 replayed, Q=0 wrong
    await updateFromListenChoose(currentQuestion.flashcardId, isCorrect, playCount, currentQuestion.isUserFlashcard);
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
      <div className="fixed inset-0 bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 dark:from-pink-950 dark:via-rose-900 dark:to-pink-950 overflow-auto flex items-center justify-center p-2 sm:p-4">
        <BackgroundDecorations />
        <Card className="max-w-sm w-full shadow-2xl relative z-10 bg-white/90 backdrop-blur-xl border-white/50 rounded-2xl sm:rounded-[2rem]">
          <CardHeader className="text-center pb-1 pt-3">
            <div className="text-3xl mb-1 animate-bounce">🎧</div>
            <CardTitle className="text-lg font-bold text-foreground bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              {t('games.summary')} {t('games.listenChoose')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-3">
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl p-3 text-white text-center shadow-lg">
              <div className="text-3xl font-bold mb-1">{score}/{questions.length}</div>
              <div className="text-sm opacity-90 font-medium">{scoreLevel.text}</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100">
                <div className="text-xl font-bold text-green-600 dark:text-green-400">
                  {score}
                </div>
                <div className="text-xs text-green-700 dark:text-green-300 font-medium">
                  {t('common.correct')}
                </div>
              </div>
              <div className="text-center p-2 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-100">
                <div className="text-xl font-bold text-red-600 dark:text-red-400">
                  {totalWrong}
                </div>
                <div className="text-xs text-red-700 dark:text-red-300 font-medium">
                  {t('common.incorrect')}
                </div>
              </div>
            </div>

            {/* Wrong Words Section */}
            {wrongAnswers.length > 0 ? (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2 border border-red-100">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-red-500 text-sm">❌</span>
                  <span className="font-bold text-xs text-red-700 dark:text-red-300">{t('games.wrongWords')} ({wrongAnswers.length})</span>
                </div>
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {wrongAnswers.map((q, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white dark:bg-red-900/30 rounded px-2 py-1 text-xs">
                      <span className="font-medium text-red-800 dark:text-red-200 truncate mr-2">{q.word}</span>
                      <span className="text-red-500 dark:text-red-400 truncate">{q.correctAnswer}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 border border-green-100 text-center">
                <span className="text-2xl mb-1 block">🎉</span>
                <span className="font-bold text-xs text-green-700 dark:text-green-300">{t('games.noWrongWords')}</span>
              </div>
            )}

            <div className="flex flex-row gap-1.5 justify-center">
              {/* ปุ่ม 1: เล่นใหม่ */}
              <Button
                onClick={handleRestart}
                className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 hover:shadow-lg transition-all rounded-lg h-8 text-[9px] px-1.5"
              >
                <RotateCcw className="h-3 w-3 mr-0.5 shrink-0" />
                <span>{t('games.playAgainShort')}</span>
              </Button>

              {/* ปุ่ม 2: เกมใหม่ */}
              <Button
                onClick={() => {
                  if (onSelectNewGame) {
                    onSelectNewGame();
                  }
                }}
                variant="outline"
                className="flex-1 rounded-lg h-8 text-[9px] border-pink-200 text-pink-700 hover:bg-pink-50 px-1.5"
              >
                <Gamepad2 className="h-3 w-3 mr-0.5 shrink-0" />
                <span>{t('games.selectGameShort')}</span>
              </Button>

              {/* ปุ่ม 3: ถัดไป - กลับชุดคำศัพท์ */}
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 rounded-lg h-8 text-[9px] border-gray-200 px-1.5"
              >
                {t('common.next')}
                <ArrowRight className="h-3 w-3 ml-0.5 shrink-0" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div >
    );
  }

  // Game Play
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 dark:from-pink-950 dark:via-rose-900 dark:to-pink-950 overflow-auto">
      <BackgroundDecorations />

      <div className="container mx-auto px-2 md:px-4 py-4 md:py-6 relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6 px-2 relative">
          {/* Left: Back Button & Progress Label */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onClose} className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200">
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">ความคืบหน้า</span>
              <div className="h-1.5 w-[30vw] rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300 ease-in-out"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Center: Count */}
          <div className="absolute left-1/2 -translate-x-1/2 font-medium text-slate-500 dark:text-slate-400">
            {currentQuestionIndex + 1} / {questions.length}
          </div>

          {/* Right: Stats Section */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-full">
              <div className="bg-green-500 rounded-full p-0.5">
                <Check className="h-3 w-3 text-white" />
              </div>
              <span className="font-bold text-green-700 dark:text-green-400">{score}</span>
            </div>

            <div className="flex items-center gap-1.5 bg-red-100 dark:bg-red-900/30 px-3 py-1.5 rounded-full">
              <div className="bg-red-500 rounded-full p-0.5">
                <X className="h-3 w-3 text-white" />
              </div>
              <span className="font-bold text-red-700 dark:text-red-400">{wrongAnswers.length}</span>
            </div>

            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
              <MoreHorizontal className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="flex-1 flex items-center justify-center max-w-2xl mx-auto w-full">
          <Card className="w-full bg-white/90 backdrop-blur-xl border-white/50 shadow-2xl rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden">
            <CardHeader className="pb-1 pt-3">
              <CardTitle className="text-center text-lg font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
                <span className="text-xl">🎧</span> Listen & Choose
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {/* Audio Button */}
              <div className="text-center mb-4">
                <div className="relative inline-block">
                  <Button
                    onClick={handlePlayAudio}
                    size="lg"
                    disabled={playCount >= maxPlayCount}
                    className="h-20 w-20 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 hover:shadow-glow transition-all duration-300 hover:scale-105 shadow-xl border-3 border-white/50"
                  >
                    <Volume2 className="h-10 w-10 text-white" />
                  </Button>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-2.5 py-1 rounded-full shadow-md border border-gray-100 text-xs font-bold text-pink-600 whitespace-nowrap">
                    {playCount >= maxPlayCount ? 'หมดโควต้า' : `ฟังได้อีก ${maxPlayCount - playCount} ครั้ง`}
                  </div>
                </div>
              </div>

              {/* Choices */}
              <div className="space-y-2 mb-4">
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
                      className={`w-full p-2.5 rounded-xl border-2 text-left transition-all duration-200 hover:scale-102 ${showCorrect
                        ? 'bg-green-50 border-green-500 dark:bg-green-900/20 shadow-md'
                        : showWrong
                          ? 'bg-red-50 border-red-500 dark:bg-red-900/20 shadow-md'
                          : isSelected
                            ? 'border-pink-500 bg-pink-50'
                            : 'bg-white border-pink-100 hover:border-pink-300 hover:bg-pink-50 shadow-sm'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${showCorrect
                            ? 'bg-green-500 text-white'
                            : showWrong
                              ? 'bg-red-500 text-white'
                              : 'bg-pink-100 text-pink-600'
                            }`}>
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span className="font-medium text-sm text-black">{choice}</span>
                        </div>
                        {showCorrect && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                        {showWrong && <XCircle className="h-5 w-5 text-red-600" />}
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
                    className="w-full h-11 text-base rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all bg-gradient-to-r from-pink-600 to-rose-600 border-0"
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
