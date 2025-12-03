import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Volume2, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

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
            questionTh: "ซาร่ารู้สึกอย่างไรเมื่อเธอเรียนรู้การวาดภาพ?",
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
            questionTh: "ทอมกินอะไรทุกเช้า?",
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
            questionTh: "สุนัขชอบดูอะไร?",
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
        } else {
            // Navigate to grand summary
            navigate('/ai-listening-final-summary', { state: { answers, questions } });
        }
    };

    const handlePlayAudio = () => {
        const utterance = new SpeechSynthesisUtterance(question.story);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center">
            {/* Minimal Header */}
            <header className="w-full max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-secondary/80"
                    onClick={() => navigate('/ai-listening-section4-intro')}
                >
                    <ArrowLeft className="h-6 w-6 text-muted-foreground" />
                </Button>
                <div className="w-32">
                    <Progress value={progress} className="h-1.5 bg-secondary" indicatorClassName="bg-green-500" />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-2xl px-6 flex flex-col justify-center pb-20">
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">

                    {/* Audio Section - Minimal */}
                    <div className="flex flex-col items-center space-y-6">
                        <Button
                            onClick={handlePlayAudio}
                            variant="outline"
                            className="h-16 w-16 rounded-full border-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 shadow-sm"
                        >
                            <Volume2 className="w-8 h-8 text-primary" />
                        </Button>
                        <p className="text-sm text-muted-foreground font-medium tracking-wide uppercase">
                            {language === 'th' ? 'ฟังเรื่องราว' : 'Listen to the story'}
                        </p>

                        {/* Hidden Story for reference/debugging or if user wants to peek */}
                        {showFeedback && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="text-center max-w-lg text-muted-foreground/80 text-sm leading-relaxed"
                            >
                                "{question.story}"
                            </motion.div>
                        )}
                    </div>

                    {/* Question - Large & Centered */}
                    <div className="text-center space-y-4">
                        <h2 className="text-2xl md:text-3xl font-semibold leading-tight text-foreground">
                            {language === 'th' ? question.questionTh : question.question}
                        </h2>
                    </div>

                    {/* Options - Clean Cards */}
                    <div className="grid gap-4">
                        {question.options.map((option, index) => {
                            const isSelected = selectedAnswer === index;
                            const isCorrectOption = index === question.correctAnswer;

                            let cardStyle = "group relative p-5 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer hover:shadow-md";

                            if (showFeedback) {
                                if (isCorrectOption) {
                                    cardStyle += " bg-green-50/50 border-green-500/50 dark:bg-green-900/20";
                                } else if (isSelected && !isCorrectOption) {
                                    cardStyle += " bg-red-50/50 border-red-500/50 dark:bg-red-900/20";
                                } else {
                                    cardStyle += " border-transparent bg-secondary/30 opacity-50";
                                }
                            } else {
                                cardStyle += isSelected
                                    ? " border-primary bg-primary/5 shadow-sm"
                                    : " border-transparent bg-secondary/50 hover:bg-secondary hover:border-primary/20";
                            }

                            return (
                                <div
                                    key={index}
                                    className={cardStyle}
                                    onClick={() => handleSelectAnswer(index)}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className={`text-lg font-medium ${isSelected || (showFeedback && isCorrectOption) ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
                                            {option}
                                        </span>

                                        {/* Status Icons */}
                                        {showFeedback && isCorrectOption && (
                                            <CheckCircle className="w-6 h-6 text-green-500" />
                                        )}
                                        {showFeedback && isSelected && !isCorrectOption && (
                                            <XCircle className="w-6 h-6 text-red-500" />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Feedback & Next Action */}
                    <div className="h-24 flex items-center justify-center">
                        {showFeedback && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="w-full"
                            >
                                <Button
                                    size="lg"
                                    className="w-full h-14 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
                                    onClick={handleNext}
                                >
                                    {currentQuestion < questions.length - 1
                                        ? (language === 'th' ? 'ข้อถัดไป' : 'Next Question')
                                        : (language === 'th' ? 'ดูสรุปผล' : 'View Summary')}
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                                <p className="text-center mt-4 text-muted-foreground text-sm">
                                    {isCorrect
                                        ? (language === 'th' ? 'ถูกต้อง! ' : 'Correct! ')
                                        : (language === 'th' ? 'ผิด! ' : 'Incorrect! ')}
                                    {language === 'th' ? question.explanationTh : question.explanation}
                                </p>
                            </motion.div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
