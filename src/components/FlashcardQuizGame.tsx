import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Check, X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSRSProgress } from '@/hooks/useSRSProgress';
import { useXP } from '@/hooks/useXP';
import { XPGainAnimation } from '@/components/xp/XPGainAnimation';
import { useAnalytics } from '@/hooks/useAnalytics';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

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

  // New Timer Logic
  const [startTime, setStartTime] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState(5.0000);
  const [progress, setProgress] = useState(100);
  const [isTimedOut, setIsTimedOut] = useState(false);

  // Stats
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [wrongWords, setWrongWords] = useState<{ word: string; meaning: string }[]>([]);

  useEffect(() => {
    generateQuestions();
    trackGame('quiz', 'start', undefined, { totalCards: flashcards.length });
  }, [flashcards]);

  // Generate Questions
  const generateQuestions = () => {
    const newQuestions = flashcards.map(card => {
      const correctAnswer = card.front_text;
      const otherCards = flashcards.filter(c => c.id !== card.id);
      const wrongOptions = otherCards
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(c => c.front_text);
      const options = [...wrongOptions, correctAnswer].sort(() => Math.random() - 0.5);
      return { card, options, correctAnswer };
    });
    setQuestions(newQuestions);
  };

  // Reset Timer per Question
  useEffect(() => {
    if (questions.length > 0 && !isGameComplete) {
      setStartTime(Date.now());
      setTimeLeft(5.0000);
      setProgress(100);
      setIsTimedOut(false);
    }
  }, [currentIndex, questions, isGameComplete]);

  // Timer Countdown loop
  useEffect(() => {
    if (isAnswered || isGameComplete || questions.length === 0) return;

    const duration = 5000; // 5 seconds
    const interval = 10;

    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      const remaining = Math.max(0, 5 - (elapsed / 1000));
      const newProgress = Math.max(0, 100 - (elapsed / duration) * 100);

      setTimeLeft(remaining);
      setProgress(newProgress);

      if (remaining <= 0) {
        clearInterval(timer);
        handleTimeout();
      }
    }, interval);

    return () => clearInterval(timer);
  }, [startTime, isAnswered, isGameComplete, questions]);


  const handleTimeout = () => {
    setIsTimedOut(true);
    setIsAnswered(true);
    setSelectedAnswer(null); // No answer selected
    setStreak(0);
    setWrongCount(prev => prev + 1);

    if (questions[currentIndex]) {
      setWrongWords(prev => [...prev, {
        word: questions[currentIndex].card.front_text,
        meaning: questions[currentIndex].card.back_text
      }]);
    }
  };

  // Auto-proceed effect
  useEffect(() => {
    if (!isAnswered) return;

    const proceedTimer = setTimeout(async () => {
      // Logic from original code preserved
      if (questions[currentIndex]) {
        const isCorrect = selectedAnswer === questions[currentIndex].correctAnswer;
        const timeTaken = (Date.now() - startTime) / 1000;
        await updateFromQuiz(questions[currentIndex].card.id, isCorrect, timeTaken, questions[currentIndex].card.isUserFlashcard);
      }

      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
      } else {
        setIsGameComplete(true);
      }
    }, 1500); // 1.5s delay to see feedback

    return () => clearTimeout(proceedTimer);
  }, [isAnswered]);

  const handleAnswerSelect = async (answer: string) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
    setIsAnswered(true);

    const isCorrect = answer === questions[currentIndex].correctAnswer;

    if (isCorrect) {
      // Speed Bonus
      const speedBonus = Math.floor(timeLeft * 20);
      setScore(score + 100 + speedBonus + (streak * 10));
      setStreak(prev => prev + 1);
      setCorrectCount(prev => prev + 1);

      const xpResult = await addGameXP('quiz', true, false);
      if (xpResult?.xpAdded) setTotalXPEarned(prev => prev + xpResult.xpAdded);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#34d399', '#10b981', '#ffffff']
      });
    } else {
      setStreak(0);
      setWrongCount(prev => prev + 1);
      setWrongWords(prev => [...prev, {
        word: questions[currentIndex].card.front_text,
        meaning: questions[currentIndex].card.back_text
      }]);
      // Gentle Vibrate
      if (navigator.vibrate) navigator.vibrate(50);
    }
  };

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

  if (questions.length === 0) return null;
  const currentQuestion = questions[currentIndex];

  // --- RESULT SCREEN ---
  if (isGameComplete) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500 fixed inset-0 z-50 bg-[#09090b] overflow-hidden">
        {/* Background FX */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#09090b] to-[#09090b]" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_20px_rgba(168,85,247,0.5)]"></div>

        <div className="mb-8 relative z-10">
          <div className="absolute inset-0 bg-purple-500 blur-[80px] opacity-30 rounded-full" />
          <Trophy className="w-32 h-32 text-yellow-400 drop-shadow-[0_0_25px_rgba(250,204,21,0.6)] animate-bounce" />
        </div>

        <h2 className="relative z-10 text-5xl font-black text-white italic tracking-tighter mb-2 drop-shadow-2xl">
          RUN COMPLETE
        </h2>

        {/* Stats Grid */}
        <div className="relative z-10 grid grid-cols-2 gap-4 w-full max-w-sm mb-10">
          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl">
            <div className="text-4xl font-black text-white mb-1">{score}</div>
            <div className="text-xs text-purple-300 font-bold tracking-[0.2em] uppercase">Score</div>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl">
            <div className="text-4xl font-black text-white mb-1">+{totalXPEarned}</div>
            <div className="text-xs text-yellow-300 font-bold tracking-[0.2em] uppercase">XP Earned</div>
          </div>
        </div>

        {/* Wrong Words Summary */}
        {wrongWords.length > 0 ? (
          <div className="relative z-10 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 w-full max-w-sm mb-8 text-left max-h-40 overflow-y-auto">
            <div className="text-red-400 text-xs font-bold uppercase mb-2 flex items-center gap-2">
              <X className="w-4 h-4" /> Review Needed
            </div>
            {wrongWords.map((w, idx) => (
              <div key={idx} className="flex justify-between text-sm text-red-200 mb-1">
                <span>{w.word}</span>
                <span className="opacity-70">{w.meaning}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative z-10 bg-green-500/10 border border-green-500/30 rounded-2xl p-4 w-full max-w-sm mb-8 text-center text-green-400 font-bold">
            PERFECT RUN! 🎉
          </div>
        )}

        <div className="relative z-10 flex gap-4 w-full max-w-sm">
          <Button variant="outline" onClick={onClose} className="flex-1 h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold">
            EXIT
          </Button>
          <Button onClick={handleRestart} className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-[0_0_20px_rgba(168,85,247,0.4)]">
            PLAY AGAIN
          </Button>
        </div>
      </div>
    );
  }

  // --- GAME UI ---
  return (
    <div className="fixed inset-0 bg-[#0f172a] overflow-hidden flex flex-col items-center justify-center z-[100]">
      {/* --- TOP BAR: PROGRESS --- */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-slate-900 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]"
          animate={{ width: `${progress}%` }}
          transition={{ ease: "linear", duration: 0 }}
        />
      </div>

      {/* --- HEADER --- */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-40">
        <Button variant="ghost" onClick={onClose} className="rounded-full text-slate-400 hover:text-white hover:bg-white/10">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-white/10 text-yellow-400 font-mono font-bold">
            <Zap className="w-4 h-4" /> {score}
          </div>
          <div className="px-3 py-1 rounded-full bg-slate-800/80 border border-white/10 text-slate-400 font-mono text-xs">
            {currentIndex + 1}/{questions.length}
          </div>
        </div>
      </div>

      {/* --- BACKGROUND --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 bg-repeat brightness-150 contrast-150 mix-blend-overlay"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px]"></div>
      </div>

      {/* --- CARD --- */}
      <div className="relative z-10 w-full max-w-md px-6 pb-10">
        <div className="mb-12 text-center">
          <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight drop-shadow-[0_0_25px_rgba(255,255,255,0.2)]">
            {currentQuestion.card.back_text}
          </h2>
          <div className="mt-6 mx-auto w-20 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/30" />
        </div>

        <div className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {currentQuestion.options.map((option, idx) => {
              let visualState = 'idle';
              if (isAnswered) {
                if (option === currentQuestion.correctAnswer) visualState = 'correct';
                else if (selectedAnswer === option) visualState = 'wrong';
                else visualState = 'dimmed';
              }

              return (
                <motion.button
                  key={`${currentIndex}-${idx}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={isAnswered}
                  className={cn(
                    "relative group w-full p-4 rounded-xl text-lg font-bold transition-all duration-200 border-2 overflow-hidden flex items-center justify-between",
                    visualState === 'idle' && "bg-slate-800/40 border-slate-700/50 text-slate-200 hover:bg-slate-800/80 hover:border-purple-500/50 hover:text-white hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] active:scale-95",
                    visualState === 'correct' && "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)] scale-105 z-10",
                    visualState === 'wrong' && "bg-rose-500/20 border-rose-500 text-rose-400 scale-95 opacity-80",
                    visualState === 'dimmed' && "bg-slate-900/20 border-transparent text-slate-600 opacity-30"
                  )}
                >
                  <span>{option}</span>
                  {visualState === 'correct' && <Check className="w-6 h-6" />}
                  {visualState === 'wrong' && <X className="w-6 h-6" />}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Feedback Footer */}
        {isAnswered && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-0 left-0 w-full text-center pb-4">
            <span className={cn("text-lg font-bold flex items-center justify-center gap-2",
              isTimedOut ? "text-orange-400" : selectedAnswer === currentQuestion.correctAnswer ? "text-green-400" : "text-red-400"
            )}>
              {isTimedOut ? '⏰ TIME UP!' : selectedAnswer === currentQuestion.correctAnswer ? '✨ AWESOME!' : '❌ WRONG'}
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}