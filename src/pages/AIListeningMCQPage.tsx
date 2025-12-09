import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Volume2, CheckCircle, XCircle, ArrowRight, Sparkles, PlayCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import BackgroundDecorations from '@/components/BackgroundDecorations';

interface Question {
    id: number;
    story: string;
    storyTh: string;
    question: string;
    questionTh: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    explanationTh: string;
    vocabUsed: string[];
}

export default function AIListeningMCQPage() {
    const navigate = useNavigate();
    const { language } = useLanguage();

    const questions: Question[] = [
        {
            id: 1,
            story: "Sarah felt very happy when she learned how to create beautiful paintings. She had to adjust her technique many times, but each method she tried made her better.",
            storyTh: "ซาร่ารู้สึกมีความสุขมากเมื่อเธอเรียนรู้วิธีสร้างภาพวาดที่สวยงาม เธอต้องปรับเทคนิคหลายครั้ง แต่แต่ละวิธีที่เธอลองทำให้เธอดีขึ้น",
            question: "How did Sarah feel when she learned to paint?",
            questionTh: "How did Sarah feel when she learned to paint?",
            options: ["Sad", "Happy", "Angry", "Tired"],
            correctAnswer: 1,
            explanation: "The story says Sarah felt 'happy' when she learned to create beautiful paintings.",
            explanationTh: "เรื่องบอกว่าซาร่ารู้สึก 'happy' (มีความสุข) เมื่อเธอเรียนรู้การสร้างภาพวาดที่สวยงาม",
            vocabUsed: ['happy', 'create', 'adjust', 'method']
        },
        {
            id: 2,
            story: "Tom loves to eat an apple every morning. His cat watches him eat while the dog plays outside. Yesterday, Tom saw a big elephant at the zoo.",
            storyTh: "ทอมชอบกินแอปเปิ้ลทุกเช้า แมวของเขาดูเขากินในขณะที่สุนัขเล่นข้างนอก เมื่อวานทอมเห็นช้างตัวใหญ่ที่สวนสัตว์",
            question: "What does Tom eat every morning?",
            questionTh: "What does Tom eat every morning?",
            options: ["Banana", "Apple", "Fish", "Orange"],
            correctAnswer: 1,
            explanation: "The story clearly states that Tom loves to eat an 'apple' every morning.",
            explanationTh: "เรื่องบอกชัดเจนว่าทอมชอบกิน 'apple' (แอปเปิ้ล) ทุกเช้า",
            vocabUsed: ['apple', 'cat', 'dog', 'elephant']
        },
        {
            id: 3,
            story: "The banana tree in my garden has grown very tall. A fish swims in the pond nearby. My happy dog likes to watch the fish swim around all day.",
            storyTh: "ต้นกล้วยในสวนของฉันสูงมาก ปลาว่ายในสระน้ำใกล้ๆ สุนัขที่มีความสุขของฉันชอบดูปลาว่ายไปมาทั้งวัน",
            question: "What does the dog like to watch?",
            questionTh: "What does the dog like to watch?",
            options: ["Birds", "Cats", "Fish", "Elephants"],
            correctAnswer: 2,
            explanation: "The story says the dog likes to watch the 'fish' swim around all day.",
            explanationTh: "เรื่องบอกว่าสุนัขชอบดู 'fish' (ปลา) ว่ายไปมาทั้งวัน",
            vocabUsed: ['banana', 'fish', 'happy', 'dog']
        }
    ];

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [answers, setAnswers] = useState<{ questionId: number; correct: boolean; selectedAnswer: number }[]>([]);

    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    const isCorrect = selectedAnswer === question.correctAnswer;

    const handleSelectAnswer = (index: number) => {
        if (showFeedback) return;
        setSelectedAnswer(index);
        setShowFeedback(true);
        setAnswers(prev => [...prev, {
            questionId: question.id,
            correct: index === question.correctAnswer,
            selectedAnswer: index
        }]);
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
            setSelectedAnswer(null);
            setShowFeedback(false);
            setIsPlaying(false);
        } else {
            // Navigate to grand summary
            navigate('/ai-listening-final-summary', { state: { answers, questions } });
        }
    };

    const handlePlayAudio = () => {
        setIsPlaying(true);
        const utterance = new SpeechSynthesisUtterance(question.story);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.onend = () => setIsPlaying(false);
        speechSynthesis.speak(utterance);
    };

    return (
        <div className="h-[100dvh] w-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-900 dark:to-pink-950 flex flex-col items-center overflow-hidden">
            <BackgroundDecorations />

            {/* Header - Fixed at top */}
            <header className="flex-none w-full max-w-4xl mx-auto px-4 py-4 flex items-center justify-between relative z-10 bg-transparent">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/ai-listening-section4-intro')}
                    className="rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-sm border border-white/50 hover:bg-white text-slate-600 h-10 w-10 p-0 sm:w-auto sm:px-4"
                >
                    <ArrowLeft className="h-5 w-5 sm:mr-2" />
                    <span className="hidden sm:inline">ออก</span>
                </Button>

                <div className="flex-1 max-w-xs mx-4">
                    <div className="flex justify-between text-xs font-medium text-slate-500 mb-1.5 px-1">
                        <span>Progress</span>
                        <span>{currentQuestion + 1} / {questions.length}</span>
                    </div>
                    <div className="h-2.5 bg-white/50 rounded-full p-0.5 backdrop-blur-sm border border-white/30">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 shadow-sm"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <div className="w-10" />
            </header>

            {/* Scrollable Content Area */}
            <main className="flex-1 w-full max-w-3xl px-4 pb-64 overflow-y-auto custom-scrollbar relative z-10 mask-fade-bottom">
                <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-white/50 shadow-2xl rounded-[1.5rem] overflow-hidden flex flex-col min-h-min">
                    <CardContent className="p-5 md:p-6 lg:p-8 space-y-6">

                        {/* Audio Section */}
                        <div className="text-center space-y-4">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="relative inline-block"
                            >
                                <div className={`absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-20 ${isPlaying ? 'animate-pulse' : ''}`} />
                                <Button
                                    onClick={handlePlayAudio}
                                    className={`
                                        h-20 w-20 md:h-24 md:w-24 rounded-full shadow-xl transition-all duration-300 relative z-10 border-4 border-white dark:border-slate-800
                                        ${isPlaying
                                            ? 'bg-gradient-to-r from-pink-500 to-rose-500 scale-105 shadow-pink-500/30'
                                            : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105 shadow-indigo-500/30'
                                        }
                                    `}
                                >
                                    {isPlaying ? (
                                        <Volume2 className="w-8 h-8 md:w-10 md:h-10 text-white animate-pulse" />
                                    ) : (
                                        <PlayCircle className="w-8 h-8 md:w-10 md:h-10 text-white ml-1" />
                                    )}
                                </Button>
                            </motion.div>
                            <div>
                                <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-100">
                                    {isPlaying ? 'กำลังเล่นเสียง...' : 'ฟังเรื่องราว'}
                                </h3>
                            </div>

                            {/* Transcript - Limited Height & Scrollable */}
                            <AnimatePresence>
                                {showFeedback && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="w-full"
                                    >
                                        <div className="bg-slate-50/90 dark:bg-slate-800/80 p-4 rounded-xl border border-indigo-100 dark:border-slate-700 text-left overflow-y-auto max-h-[25vh] custom-scrollbar shadow-inner mt-2">
                                            <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-2 sticky top-0 bg-slate-50/90 dark:bg-slate-800/90 w-full py-1">
                                                <Volume2 className="h-3 w-3" />
                                                TRANSCRIPT
                                            </h4>
                                            <p className="text-slate-700 dark:text-slate-200 text-sm md:text-base leading-relaxed font-medium mb-3">
                                                {question.story}
                                            </p>
                                            <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed border-t border-slate-200 dark:border-slate-700 pt-3">
                                                {question.storyTh}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Question */}
                        <div className="text-center max-w-2xl mx-auto mt-2">
                            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100 leading-tight">
                                {language === 'th' ? question.questionTh : question.question}
                            </h2>
                            <div className="h-1 w-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mx-auto mt-3 opacity-50" />
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-1 gap-3 content-center">
                            <AnimatePresence mode="wait">
                                {question.options.map((option, index) => {
                                    const isSelected = selectedAnswer === index;
                                    const isCorrectOption = index === question.correctAnswer;
                                    const showStatus = showFeedback;

                                    let cardStyle = "relative p-3 md:p-4 rounded-xl border-2 text-left transition-all duration-300 cursor-pointer flex items-center gap-3 group";

                                    if (showStatus) {
                                        if (isCorrectOption) {
                                            cardStyle += " bg-green-500 border-green-600 text-white shadow-md";
                                        } else if (isSelected && !isCorrectOption) {
                                            cardStyle += " bg-red-100 border-red-200 text-red-800 opacity-60";
                                        } else {
                                            cardStyle += " bg-gray-50 border-transparent opacity-40";
                                        }
                                    } else {
                                        cardStyle += isSelected
                                            ? " bg-indigo-50 border-indigo-500 shadow-md transform scale-[1.01]"
                                            : " bg-white border-slate-100 hover:border-indigo-200 hover:shadow-md";
                                    }

                                    return (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={cardStyle}
                                            onClick={() => handleSelectAnswer(index)}
                                        >
                                            <div className={`
                                                flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors
                                                ${showStatus && isCorrectOption
                                                    ? 'bg-white border-white text-green-600'
                                                    : 'border-slate-200 text-slate-500 group-hover:border-indigo-500 group-hover:text-indigo-600'
                                                }
                                            `}>
                                                {['A', 'B', 'C', 'D'][index]}
                                            </div>

                                            <span className={`text-base md:text-lg font-medium flex-1 ${showStatus && isCorrectOption ? 'text-white' : 'text-slate-700'}`}>
                                                {option}
                                            </span>

                                            {showStatus && isCorrectOption && <CheckCircle className="h-5 w-5 text-white" />}
                                            {showStatus && isSelected && !isCorrectOption && <XCircle className="h-5 w-5 text-red-500" />}
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>

                    </CardContent>
                </Card>
            </main>

            {/* Fixed Bottom Bar - Feedback & Next */}
            <AnimatePresence>
                {showFeedback && (
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className={`absolute bottom-0 left-0 right-0 z-50 p-4 pt-6 pb-6 border-t shadow-[0_-10px_40px_rgba(0,0,0,0.15)] backdrop-blur-xl
                            ${isCorrect
                                ? 'bg-gradient-to-t from-green-50 to-white/95 border-green-200/50 dark:from-green-950 dark:to-slate-900/95'
                                : 'bg-gradient-to-t from-red-50 to-white/95 border-red-200/50 dark:from-red-950 dark:to-slate-900/95'
                            }
                        `}
                    >
                        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-4">
                            <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
                                <div className={`p-2 rounded-full shrink-0 ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                    {isCorrect ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                                </div>
                                <div className="min-w-0">
                                    <h4 className={`font-bold text-base ${isCorrect ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                                        {isCorrect ? 'ถูกต้อง!' : 'ยังไม่ถูก'}
                                    </h4>
                                    <p className={`text-xs truncate ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {language === 'th' ? question.explanationTh : question.explanation}
                                    </p>
                                </div>
                            </div>

                            <Button
                                onClick={handleNext}
                                size="lg"
                                className={`
                                    w-full sm:w-auto min-w-[140px] h-11 rounded-xl text-base font-bold shadow-lg 
                                    ${isCorrect
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                                        : 'bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white'
                                    }
                                `}
                            >
                                {currentQuestion < questions.length - 1 ? 'ข้อถัดไป' : 'ดูสรุปผล'}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
