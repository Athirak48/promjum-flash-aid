import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Trophy, ArrowLeft, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface FlashcardData {
    id: string;
    front_text: string;
    back_text: string;
}

interface QuizGameComponentProps {
    flashcards: FlashcardData[];
    onComplete: (score: number, correctCount: number, totalCount: number, answers: Array<{ wordId: string; isCorrect: boolean; timeTaken: number }>) => void;
    isMultiplayer?: boolean;
    onExit?: () => void;
}

export function QuizGameComponent({ flashcards, onComplete, isMultiplayer, onExit }: QuizGameComponentProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);

    // Stats State
    const [stats, setStats] = useState({
        correct: 0,
        incorrect: 0,
        streak: 0
    });

    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [options, setOptions] = useState<string[]>([]);

    // Timer States
    const [startTime, setStartTime] = useState<number>(0);
    const [timeLeft, setTimeLeft] = useState(5.0000);
    const [progress, setProgress] = useState(100); // 100% to 0%

    // Game States
    const [isChecking, setIsChecking] = useState(false);
    const [answerState, setAnswerState] = useState<'idle' | 'correct' | 'wrong'>('idle');
    const [answers, setAnswers] = useState<Array<{ wordId: string; isCorrect: boolean; timeTaken: number }>>([]);

    const totalQuestions = flashcards.length;
    const currentCard = flashcards[currentIndex];

    // Initialize Options for Question
    useEffect(() => {
        if (!currentCard) return;

        const correctAnswer = currentCard.back_text;
        const wrongAnswers = flashcards
            .filter(f => f.id !== currentCard.id)
            .map(f => f.back_text)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        const allOptions = [...wrongAnswers, correctAnswer].sort(() => Math.random() - 0.5);
        setOptions(allOptions);

        // Reset Round
        if (currentIndex < flashcards.length && !showResult) {
            setStartTime(performance.now());
            setTimeLeft(5.0000);
            setProgress(100);
            setAnswerState('idle');
            setSelectedAnswer(null);
            setIsChecking(false);
        }
    }, [currentIndex, flashcards, currentCard, showResult]);

    // Timer Loop
    useEffect(() => {
        if (showResult || isChecking || !currentCard) return;

        const duration = 5000; // 5 seconds
        const interval = 10; // Update every 10ms

        const timer = setInterval(() => {
            const now = performance.now();
            const elapsed = now - startTime;
            const remaining = Math.max(0, 5 - (elapsed / 1000));

            // Update Progress Bar
            const newProgress = Math.max(0, 100 - (elapsed / duration) * 100);

            setTimeLeft(remaining);
            setProgress(newProgress);

            if (remaining <= 0) {
                clearInterval(timer);
                handleTimeout();
            }
        }, interval);

        return () => clearInterval(timer);
    }, [startTime, showResult, isChecking, currentIndex, currentCard]);

    const handleTimeout = () => {
        setIsChecking(true);
        const currentQ = flashcards[currentIndex];
        if (!currentQ) return;

        setAnswerState('wrong');
        setSelectedAnswer(null);

        const timeTaken = 5000;
        const newAnswer = { wordId: currentQ.id, isCorrect: false, timeTaken };
        const updatedAnswers = [...answers, newAnswer];
        setAnswers(updatedAnswers);

        setStats(prev => ({ ...prev, incorrect: prev.incorrect + 1, streak: 0 }));

        setTimeout(() => nextQuestion(updatedAnswers), 1500);
    };

    const handleAnswer = (answer: string) => {
        if (isChecking) return;
        setIsChecking(true);
        setSelectedAnswer(answer);

        const currentQ = flashcards[currentIndex];
        const isCorrect = answer === currentQ.back_text;
        const timeTaken = performance.now() - startTime;

        const newAnswer = { wordId: currentQ.id, isCorrect, timeTaken };
        const updatedAnswers = [...answers, newAnswer];
        setAnswers(updatedAnswers);

        if (isCorrect) {
            setAnswerState('correct');
            // Bonus points for speed
            const speedBonus = Math.floor(timeLeft * 20);
            setScore(prev => prev + 100 + speedBonus);

            setStats(prev => ({
                ...prev,
                correct: prev.correct + 1,
                streak: prev.streak + 1
            }));

            confetti({
                particleCount: 50,
                spread: 70,
                origin: { y: 0.8 },
                colors: ['#34d399', '#10b981', '#ffffff']
            });
        } else {
            setAnswerState('wrong');
            setStats(prev => ({
                ...prev,
                incorrect: prev.incorrect + 1,
                streak: 0
            }));
            // Gentle vibration, no flash
            if (navigator.vibrate) navigator.vibrate(50);
        }

        setTimeout(() => nextQuestion(updatedAnswers), 1000);
    };

    const nextQuestion = (currentAnswers: any[]) => {
        if (currentIndex < flashcards.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            const finalCorrect = currentAnswers.filter((a: any) => a.isCorrect).length;
            // Calculate final score if needed or use state
            onComplete(score, finalCorrect, totalQuestions, currentAnswers);
            setShowResult(true);
        }
    };

    // --- RENDER HELPERS ---

    if (showResult) {
        return (
            <div className="flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500 min-h-[600px] w-full bg-[#09090b] relative overflow-hidden">
                {/* Background FX */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#09090b] to-[#09090b]" />

                <div className="mb-8 relative z-10">
                    <div className="absolute inset-0 bg-purple-500 blur-[80px] opacity-30 rounded-full" />
                    <Trophy className="w-32 h-32 text-yellow-400 drop-shadow-[0_0_25px_rgba(250,204,21,0.6)] animate-bounce" />
                </div>

                <h2 className="relative z-10 text-5xl font-black text-white italic tracking-tighter mb-2 drop-shadow-2xl">
                    LEVEL COMPLETE
                </h2>
                <div className="h-1 w-24 bg-gradient-to-r from-transparent via-purple-500 to-transparent mb-8" />

                <div className="relative z-10 grid grid-cols-2 gap-4 w-full max-w-sm mb-10">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl">
                        <div className="text-4xl font-black text-white mb-1">{score}</div>
                        <div className="text-xs text-purple-300 font-bold tracking-[0.2em] uppercase">Score</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl">
                        <div className="text-4xl font-black text-white mb-1">{stats.correct}/{totalQuestions}</div>
                        <div className="text-xs text-green-300 font-bold tracking-[0.2em] uppercase">Accuracy</div>
                    </div>
                </div>

                <div className="relative z-10 flex gap-4 w-full max-w-sm">
                    <Button
                        variant="outline"
                        onClick={onExit}
                        className="flex-1 h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold tracking-wide"
                    >
                        EXIT
                    </Button>
                    <Button
                        onClick={() => {
                            setScore(0);
                            setStats({ correct: 0, incorrect: 0, streak: 0 });
                            setCurrentIndex(0);
                            setShowResult(false);
                            setAnswers([]);
                        }}
                        className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold tracking-wide shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                    >
                        REPLAY Let's Go!
                    </Button>
                </div>
            </div>
        );
    }

    if (!currentCard) return <div className="text-white">Loading Deck...</div>;

    return (
        <div className="w-full min-h-[600px] flex flex-col relative overflow-hidden rounded-[2.5rem] bg-[#0f172a] shadow-2xl border-4 border-slate-900">

            {/* --- TOP BAR: TIMER & PROGRESS --- */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-slate-900/50 z-30">
                <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                    initial={{ width: '100%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "linear", duration: 0 }} // Updated via state instantly
                />
            </div>

            {/* --- HEADER: STATS --- */}
            <div className="relative z-20 flex justify-between items-center px-6 pt-8 pb-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onExit}
                    className="rounded-full bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>

                {/* Score Pill */}
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-white/10 backdrop-blur-md">
                    <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-white font-bold font-mono text-lg">{score}</span>
                </div>

                {/* Question Counter */}
                <div className="px-4 py-1.5 rounded-full bg-slate-900/80 border border-white/10 text-slate-400 font-mono text-sm font-medium">
                    {currentIndex + 1} <span className="text-slate-600">/</span> {totalQuestions}
                </div>
            </div>

            {/* --- STAR BACKGROUND --- */}
            <div className="absolute inset-0 z-0 opacity-60">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 mix-blend-overlay"></div>
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>
            </div>

            {/* --- MAIN GAME AREA --- */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 pb-12">

                {/* QUESTION CARD */}
                <div className="mb-12 w-full max-w-sm text-center">
                    <motion.div
                        key={currentCard.id}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative"
                    >
                        <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                            {currentCard.front_text}
                        </h2>
                        {/* Decorative underline */}
                        <div className="mt-4 mx-auto w-16 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/30" />
                    </motion.div>
                </div>

                {/* ANSWER GRID */}
                <div className="w-full max-w-sm grid gap-3">
                    <AnimatePresence mode="popLayout">
                        {options.map((option, idx) => {
                            let visualState = 'idle';
                            if (isChecking) {
                                if (option === currentCard.back_text) visualState = 'correct';
                                else if (selectedAnswer === option) visualState = 'wrong';
                                else visualState = 'dimmed';
                            }

                            return (
                                <motion.button
                                    key={`${currentIndex}-${option}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => handleAnswer(option)}
                                    disabled={isChecking}
                                    className={cn(
                                        "relative group w-full p-4 rounded-2xl text-lg font-bold transition-all duration-200 border-2 overflow-hidden",
                                        // Default Idle State
                                        visualState === 'idle' && "bg-slate-800/40 border-slate-700/50 text-slate-200 hover:bg-slate-800/80 hover:border-purple-500/50 hover:text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] active:scale-95",
                                        // Correct State
                                        visualState === 'correct' && "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] scale-105 z-10",
                                        // Wrong State
                                        visualState === 'wrong' && "bg-rose-500/20 border-rose-500 text-rose-400 scale-95 opacity-80",
                                        // Dimmed State
                                        visualState === 'dimmed' && "bg-slate-900/20 border-transparent text-slate-600 opacity-50 blur-[1px]"
                                    )}
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {option}
                                        {visualState === 'correct' && <Check className="w-5 h-5 animate-bounce stroke-[3]" />}
                                        {visualState === 'wrong' && <X className="w-5 h-5 animate-pulse stroke-[3]" />}
                                    </span>
                                </motion.button>
                            );
                        })}
                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
}
