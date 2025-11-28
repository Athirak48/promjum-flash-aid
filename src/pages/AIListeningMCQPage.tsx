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
            // Navigate to summary
            navigate('/ai-listening-summary', { state: { answers, questions } });
        }
    };

    const handlePlayAudio = () => {
        const utterance = new SpeechSynthesisUtterance(question.story);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="border-b bg-card sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate('/ai-listening-section4-intro')}
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <h1 className="text-xl font-bold">AI Listening</h1>
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {language === 'th' ? `ข้อที่ ${currentQuestion + 1}/${questions.length}` : `Question ${currentQuestion + 1}/${questions.length}`}
                        </span>
                    </div>
                    <Progress value={progress} className="mt-2 h-2" />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-6">
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Audio Button */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold">
                                {language === 'th' ? 'ฟังเรื่องสั้น' : 'Listen to the Story'}
                            </h2>
                            <Button onClick={handlePlayAudio} variant="outline" size="sm">
                                <Volume2 className="w-4 h-4 mr-2" />
                                {language === 'th' ? 'เล่นเสียง' : 'Play Audio'}
                            </Button>
                        </div>
                        
                        {showFeedback && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-secondary/50 p-4 rounded-lg text-sm"
                            >
                                <p className="font-medium mb-2">{language === 'th' ? 'เรื่องเต็ม:' : 'Full Story:'}</p>
                                <p className="text-muted-foreground">{question.story}</p>
                                <p className="text-muted-foreground mt-2 text-xs">{question.storyTh}</p>
                            </motion.div>
                        )}
                    </Card>

                    {/* Question */}
                    <Card className="p-6">
                        <h3 className="font-semibold text-lg mb-4">
                            {language === 'th' ? question.questionTh : question.question}
                        </h3>

                        {/* Options */}
                        <div className="space-y-3">
                            {question.options.map((option, index) => {
                                const isSelected = selectedAnswer === index;
                                const isCorrectOption = index === question.correctAnswer;
                                let optionClass = "p-4 border rounded-lg cursor-pointer transition-all";

                                if (showFeedback) {
                                    if (isCorrectOption) {
                                        optionClass += " bg-green-50 dark:bg-green-950/30 border-green-500";
                                    } else if (isSelected && !isCorrectOption) {
                                        optionClass += " bg-red-50 dark:bg-red-950/30 border-red-500";
                                    } else {
                                        optionClass += " opacity-50";
                                    }
                                } else {
                                    optionClass += " hover:bg-secondary/50";
                                    if (isSelected) {
                                        optionClass += " border-primary bg-primary/10";
                                    }
                                }

                                return (
                                    <div
                                        key={index}
                                        className={optionClass}
                                        onClick={() => handleSelectAnswer(index)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-medium">
                                                    {String.fromCharCode(65 + index)}
                                                </span>
                                                <span>{option}</span>
                                            </div>
                                            {showFeedback && isCorrectOption && (
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            )}
                                            {showFeedback && isSelected && !isCorrectOption && (
                                                <XCircle className="w-5 h-5 text-red-500" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Feedback */}
                        {showFeedback && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`mt-6 p-4 rounded-lg ${isCorrect ? 'bg-green-50 dark:bg-green-950/30' : 'bg-red-50 dark:bg-red-950/30'}`}
                            >
                                <div className="flex items-start gap-3">
                                    {isCorrect ? (
                                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                                    )}
                                    <div>
                                        <p className={`font-medium ${isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                                            {isCorrect 
                                                ? (language === 'th' ? 'ถูกต้อง!' : 'Correct!') 
                                                : (language === 'th' ? 'ไม่ถูกต้อง' : 'Incorrect')}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {language === 'th' ? question.explanationTh : question.explanation}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </Card>

                    {/* Next Button */}
                    {showFeedback && (
                        <Button size="lg" className="w-full" onClick={handleNext}>
                            {currentQuestion < questions.length - 1 
                                ? (language === 'th' ? 'ข้อถัดไป' : 'Next Question')
                                : (language === 'th' ? 'ดูสรุปผล' : 'View Summary')}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    )}
                </div>
            </main>
        </div>
    );
}
