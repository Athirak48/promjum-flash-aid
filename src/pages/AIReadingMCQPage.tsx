import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, BookOpen, Sparkles, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"

interface Question {
    id: number;
    story: string;
    storyTh: string;
    question: string;
    questionTh: string;
    options: string[];
    optionsTh: string[];
    correctAnswer: number;
    explanation: string;
    explanationTh: string;
    vocabUsed: string[];
}

const mockDictionary: Record<string, string> = {
    "sunny": "แดดจ้า", "morning": "ตอนเช้า", "decided": "ตัดสินใจ", "walk": "เดิน", "park": "สวนสาธารณะ",
    "book": "หนังสือ", "blanket": "ผ้าห่ม", "flowers": "ดอกไม้", "bloom": "บาน", "painting": "ภาพวาด",
    "quiet": "เงียบสงบ", "spot": "จุด", "tree": "ต้นไม้", "soft": "นุ่ม", "grass": "หญ้า",
    "interesting": "น่าสนใจ", "friendly": "เป็นมิตร", "enthusiasm": "ความกระตือรือร้น", "apologized": "ขอโทษ",
    "authors": "นักเขียน", "birds": "นก", "singing": "ร้องเพลง", "favorite": "โปรด", "colorful": "มีสีสัน",
    "large": "ใหญ่", "opened": "เปิด", "golden": "สีทอง", "retriever": "สุนัขพันธุ์รีทรีฟเวอร์",
    "wagging": "กระดิก", "tail": "หาง", "happily": "อย่างมีความสุข", "owner": "เจ้าของ", "young": "หนุ่ม",
    "man": "ผู้ชาย", "quickly": "อย่างรวดเร็ว", "followed": "ตามมา", "talking": "คุย", "learned": "เรียนรู้",
    "lover": "คนรัก", "spent": "ใช้เวลา", "rest": "ส่วนที่เหลือ", "afternoon": "ตอนบ่าย", "discussing": "สนทนา"
};

const InteractiveWord = ({ word }: { word: string }) => {
    const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").toLowerCase();
    const translation = mockDictionary[cleanWord] || "";
    if (!word.trim()) return <span>{word}</span>;

    return (
        <HoverCard openDelay={0} closeDelay={100}>
            <HoverCardTrigger asChild>
                <span className="cursor-pointer hover:bg-orange-100 hover:text-orange-800 rounded px-0.5 transition-all duration-200 decoration-orange-300/50 underline-offset-2 border-b border-transparent hover:border-orange-300">
                    {word}
                </span>
            </HoverCardTrigger>
            <HoverCardContent className="w-auto p-3 text-xs font-medium shadow-xl border-orange-100 bg-white/95 backdrop-blur rounded-xl">
                <div className="text-center min-w-[70px]">
                    <div className="text-muted-foreground text-[10px] uppercase mb-1 tracking-wider font-semibold">{cleanWord}</div>
                    <div className="text-orange-600 font-bold text-sm bg-orange-50 px-2 py-1 rounded-md">{translation || "?"}</div>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
};

export default function AIReadingMCQPage() {
    const navigate = useNavigate();
    const { language } = useLanguage();

    const questions: Question[] = [
        {
            id: 1,
            story: "It was a sunny Saturday morning, and Emily decided to go for a walk in the park. She brought her favorite book and a small blanket to sit on. The birds were singing, and the flowers were in full bloom, making the park look like a colorful painting.\n\nAfter walking for a while, she found a quiet spot under a large oak tree. She spread her blanket on the soft grass and opened her book. Just as she started finding the story interesting, a friendly golden retriever ran up to her, wagging its tail happily.\n\nThe dog's owner, a young man named Daniel, quickly followed. He apologized for his dog's enthusiasm and they started talking. Emily learned that Daniel was also a book lover, and they spent the rest of the afternoon discussing their favorite authors.",
            storyTh: "มันเป็นเช้าวันเสาร์ที่แดดจ้า และเอมิลี่ตัดสินใจไปเดินเล่นในสวนสาธารณะ เธอนำหนังสือเล่มโปรดและผ้าห่มผืนเล็กไปปูนั่ง นกร้องเพลงและดอกไม้บานสะพรั่ง ทำให้สวนสาธารณะดูเหมือนภาพวาดที่มีสีสัน\n\nหลังจากเดินไปสักพัก เธอพบจุดเงียบสงบใต้ต้นโอ๊กใหญ่ เธอปูผ้าห่มบนหญ้านุ่มและเปิดหนังสือ ทันทีที่เธอเริ่มรู้สึกว่าเรื่องราวน่าสนใจ สุนัขโกลเด้นรีทรีฟเวอร์ที่เป็นมิตรก็วิ่งเข้ามาหาเธอพร้อมกระดิกหางอย่างมีความสุข\n\nเจ้าของสุนัข ชายหนุ่มชื่อแดเนียล รีบตามมา เขาขอโทษสำหรับความกระตือรือร้นของสุนัขและพวกเขาเริ่มคุยกัน เอมิลี่ได้เรียนรู้ว่าแดเนียลก็เป็นคนรักหนังสือเช่นกัน และพวกเขาใช้เวลาช่วงบ่ายที่เหลือคุยกันเรื่องนักเขียนคนโปรด",
            question: "Why did Daniel apologize to Emily?",
            questionTh: "ทำไมแดเนียลถึงขอโทษเอมิลี่?",
            options: ["He stepped on her blanket.", "His dog ran up to her enthusiastically.", "He interrupted her reading on purpose.", "He didn't like her book."],
            optionsTh: ["เขาเหยียบผ้าห่มของเธอ", "สุนัขของเขาวิ่งเข้าไปหาเธออย่างตื่นเต้น", "เขาขัดจังหวะการอ่านของเธอโดยเจตนา", "เขาไม่ชอบหนังสือของเธอ"],
            correctAnswer: 1,
            explanation: "From paragraph 3: The story says, 'The dog's owner... apologized for his dog's enthusiasm' when the dog ran up to Emily.",
            explanationTh: "จากย่อหน้าที่ 3: เรื่องราวระบุว่าเจ้าของสุนัข 'ขอโทษสำหรับความกระตือรือร้นของสุนัข' (apologized for his dog's enthusiasm) เมื่อสุนัขวิ่งเข้าไปหาเอมิลี่อย่างตื่นเต้น",
            vocabUsed: ['enthusiasm', 'apologize', 'retriever', 'painting']
        },
        {
            id: 2,
            story: "It was a sunny Saturday morning, and Emily decided to go for a walk in the park. She brought her favorite book and a small blanket to sit on. The birds were singing, and the flowers were in full bloom, making the park look like a colorful painting.\n\nAfter walking for a while, she found a quiet spot under a large oak tree. She spread her blanket on the soft grass and opened her book. Just as she started finding the story interesting, a friendly golden retriever ran up to her, wagging its tail happily.\n\nThe dog's owner, a young man named Daniel, quickly followed. He apologized for his dog's enthusiasm and they started talking. Emily learned that Daniel was also a book lover, and they spent the rest of the afternoon discussing their favorite authors.",
            storyTh: "มันเป็นเช้าวันเสาร์ที่แดดจ้า และเอมิลี่ตัดสินใจไปเดินเล่นในสวนสาธารณะ เธอนำหนังสือเล่มโปรดและผ้าห่มผืนเล็กไปปูนั่ง นกร้องเพลงและดอกไม้บานสะพรั่ง ทำให้สวนสาธารณะดูเหมือนภาพวาดที่มีสีสัน\n\nหลังจากเดินไปสักพัก เธอพบจุดเงียบสงบใต้ต้นโอ๊กใหญ่ เธอปูผ้าห่มบนหญ้านุ่มและเปิดหนังสือ ทันทีที่เธอเริ่มรู้สึกว่าเรื่องราวน่าสนใจ สุนัขโกลเด้นรีทรีฟเวอร์ที่เป็นมิตรก็วิ่งเข้ามาหาเธอพร้อมกระดิกหางอย่างมีความสุข\n\nเจ้าของสุนัข ชายหนุ่มชื่อแดเนียล รีบตามมา เขาขอโทษสำหรับความกระตือรือร้นของสุนัขและพวกเขาเริ่มคุยกัน เอมิลี่ได้เรียนรู้ว่าแดเนียลก็เป็นคนรักหนังสือเช่นกัน และพวกเขาใช้เวลาช่วงบ่ายที่เหลือคุยกันเรื่องนักเขียนคนโปรด",
            question: "What did Emily bring to the park?",
            questionTh: "เอมิลี่นำอะไรไปสวนสาธารณะ?",
            options: ["A large umbrella and a chair.", "Her favorite book and a small blanket.", "Some food for the birds.", "A painting kit."],
            optionsTh: ["ร่มคันใหญ่และเก้าอี้", "หนังสือเล่มโปรดและผ้าห่มผืนเล็ก", "อาหารสำหรับนก", "ชุดอุปกรณ์วาดภาพ"],
            correctAnswer: 1,
            explanation: "From paragraph 1: The text explicitly states, 'She brought her favorite book and a small blanket to sit on.'",
            explanationTh: "จากย่อหน้าที่ 1: เนื้อเรื่องระบุไว้อย่างชัดเจนว่า 'เธอนำหนังสือเล่มโปรดและผ้าห่มผืนเล็กไปปูนั่ง' (She brought her favorite book and a small blanket)",
            vocabUsed: ['book', 'blanket', 'painting']
        },
        {
            id: 3,
            story: "It was a sunny Saturday morning, and Emily decided to go for a walk in the park. She brought her favorite book and a small blanket to sit on. The birds were singing, and the flowers were in full bloom, making the park look like a colorful painting.\n\nAfter walking for a while, she found a quiet spot under a large oak tree. She spread her blanket on the soft grass and opened her book. Just as she started finding the story interesting, a friendly golden retriever ran up to her, wagging its tail happily.\n\nThe dog's owner, a young man named Daniel, quickly followed. He apologized for his dog's enthusiasm and they started talking. Emily learned that Daniel was also a book lover, and they spent the rest of the afternoon discussing their favorite authors.",
            storyTh: "มันเป็นเช้าวันเสาร์ที่แดดจ้า และเอมิลี่ตัดสินใจไปเดินเล่นในสวนสาธารณะ เธอนำหนังสือเล่มโปรดและผ้าห่มผืนเล็กไปปูนั่ง นกร้องเพลงและดอกไม้บานสะพรั่ง ทำให้สวนสาธารณะดูเหมือนภาพวาดที่มีสีสัน\n\nหลังจากเดินไปสักพัก เธอพบจุดเงียบสงบใต้ต้นโอ๊กใหญ่ เธอปูผ้าห่มบนหญ้านุ่มและเปิดหนังสือ ทันทีที่เธอเริ่มรู้สึกว่าเรื่องราวน่าสนใจ สุนัขโกลเด้นรีทรีฟเวอร์ที่เป็นมิตรก็วิ่งเข้ามาหาเธอพร้อมกระดิกหางอย่างมีความสุข\n\nเจ้าของสุนัข ชายหนุ่มชื่อแดเนียล รีบตามมา เขาขอโทษสำหรับความกระตือรือร้นของสุนัขและพวกเขาเริ่มคุยกัน เอมิลี่ได้เรียนรู้ว่าแดเนียลก็เป็นคนรักหนังสือเช่นกัน และพวกเขาใช้เวลาช่วงบ่ายที่เหลือคุยกันเรื่องนักเขียนคนโปรด",
            question: "What kind of dog ran up to Emily?",
            questionTh: "สุนัขพันธุ์อะไรที่วิ่งเข้ามาหาเอมิลี่?",
            options: ["A Poodle", "A Bulldog", "A Golden Retriever", "A Siberian Husky"],
            optionsTh: ["พุดเดิ้ล", "บูลด็อก", "โกลเด้น รีทรีฟเวอร์", "ไซบีเรียน ฮัสกี้"],
            correctAnswer: 2,
            explanation: "From paragraph 2: The text describes the dog as a 'friendly golden retriever' that ran up to her.",
            explanationTh: "จากย่อหน้าที่ 2: เนื้อเรื่องบรรยายว่ามี 'สุนัขโกลเด้นรีทรีฟเวอร์ที่เป็นมิตร' (friendly golden retriever) วิ่งเข้ามาหาเธอ",
            vocabUsed: ['retriever', 'friendly', 'tail']
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
            navigate('/ai-reading-final-summary', { state: { answers, questions } });
        }
    };

    return (
        <div className="h-screen flex flex-col font-sans bg-slate-50/50 overflow-hidden">
            {/* Soft Header */}
            <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md shrink-0 h-16 flex items-center shadow-sm z-10">
                <div className="container mx-auto px-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-slate-100" onClick={() => navigate('/ai-reading-section4-intro')}>
                            <ArrowLeft className="h-5 w-5 text-slate-600" />
                        </Button>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block -mb-1">Chapter 4</span>
                            <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                AI Reading <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Progress</span>
                            <span className="text-xs font-bold text-slate-700 leading-none">
                                {currentQuestion + 1} <span className="text-slate-300">/</span> {questions.length}
                            </span>
                        </div>
                        <div className="w-24">
                            <Progress value={progress} className="h-2 rounded-full bg-slate-200" indicatorClassName="bg-gradient-to-r from-blue-400 to-indigo-500" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-4 overflow-hidden h-[calc(100vh-64px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">

                    {/* Story Column - Paper Look */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="h-full"
                    >
                        <Card className="flex flex-col bg-[#fffdf9] border-none shadow-md ring-1 ring-black/5 relative overflow-hidden h-full rounded-2xl">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-300 to-amber-200 z-10"></div>

                            <div className="p-4 bg-[#fffdf9]/95 sticky top-0 z-10 border-b border-orange-100/50 flex items-center justify-between shrink-0 backdrop-blur-sm">
                                <div className="flex items-center gap-2.5">
                                    <div className="bg-orange-100 p-1.5 rounded-lg">
                                        <BookOpen className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">{language === 'th' ? 'บทความ' : 'Reading Story'}</span>
                                </div>
                                <div className="text-[10px] font-medium text-orange-400 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                                    Interactive
                                </div>
                            </div>

                            <div className="p-5 overflow-y-auto custom-scrollbar flex-1 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]">
                                <div className="prose prose-sm max-w-none text-slate-700 leading-7 font-medium">
                                    {question.story.split('\n\n').map((paragraph, idx) => (
                                        <p key={idx} className="mb-4 last:mb-0">
                                            {paragraph.split(' ').map((word, wIdx) => (
                                                <React.Fragment key={wIdx}>
                                                    <InteractiveWord word={word} />
                                                    {wIdx < paragraph.split(' ').length - 1 && ' '}
                                                </React.Fragment>
                                            ))}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Question & Interaction Column */}
                    <div className="flex flex-col h-full overflow-hidden">
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-2">
                            <motion.div
                                key={currentQuestion}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="mb-4">
                                    <div className="flex items-start gap-2 mb-2">
                                        <div className="bg-indigo-100/50 p-1.5 rounded-md mt-0.5">
                                            <HelpCircle className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <h2 className="text-lg font-bold text-slate-800 leading-snug pt-0.5">
                                            {question.question}
                                        </h2>
                                    </div>
                                </div>

                                <div className="grid gap-2.5 mb-2">
                                    {question.options.map((option, index) => {
                                        const isSelected = selectedAnswer === index;
                                        const isCorrectOption = index === question.correctAnswer;
                                        let cardStyle = "group relative p-3 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer flex flex-col gap-1 shadow-sm";

                                        // Colors & States
                                        if (showFeedback) {
                                            if (isCorrectOption) cardStyle += " bg-emerald-50 border-emerald-400 shadow-emerald-100";
                                            else if (isSelected && !isCorrectOption) cardStyle += " bg-rose-50 border-rose-400 shadow-rose-100 opacity-90";
                                            else cardStyle += " border-slate-100 bg-slate-50 opacity-50 grayscale-[0.5]";
                                        } else {
                                            cardStyle += isSelected
                                                ? " border-indigo-500 bg-indigo-50 shadow-indigo-100 ring-1 ring-indigo-500/20"
                                                : " border-slate-100 bg-white hover:border-indigo-200 hover:bg-slate-50 hover:shadow-md hover:-translate-y-0.5";
                                        }

                                        return (
                                            <div key={index} className={cardStyle} onClick={() => handleSelectAnswer(index)}>
                                                <div className="flex items-start gap-3">
                                                    {/* Letter Badge */}
                                                    <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] border-2 shadow-sm shrink-0 transition-colors
                                                        ${showFeedback && isCorrectOption ? 'bg-emerald-500 border-emerald-500 text-white' : ''}
                                                        ${showFeedback && isSelected && !isCorrectOption ? 'bg-rose-500 border-rose-500 text-white' : ''}
                                                        ${!showFeedback && isSelected ? 'bg-indigo-600 border-indigo-600 text-white scale-110' : ''}
                                                        ${!showFeedback && !isSelected ? 'bg-white border-slate-200 text-slate-400 group-hover:border-indigo-300 group-hover:text-indigo-500' : ''}
                                                    `}>
                                                        {String.fromCharCode(65 + index)}
                                                    </div>

                                                    <div className="flex-1">
                                                        <span className={`text-sm font-semibold leading-tight block transition-colors ${isSelected || (showFeedback && isCorrectOption) ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-800'}`}>
                                                            {option}
                                                        </span>

                                                        {/* Translated Option with animation */}
                                                        <AnimatePresence>
                                                            {showFeedback && question.optionsTh && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    className="overflow-hidden"
                                                                >
                                                                    <span className="text-xs text-slate-500/80 mt-1 block font-medium">
                                                                        {question.optionsTh[index]}
                                                                    </span>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>

                                                    {/* Status Icons */}
                                                    <div className="shrink-0">
                                                        {showFeedback && isCorrectOption && <CheckCircle2 className="w-5 h-5 text-emerald-500 drop-shadow-sm" />}
                                                        {showFeedback && isSelected && !isCorrectOption && <XCircle className="w-5 h-5 text-rose-500 drop-shadow-sm" />}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>

                            {/* Explanation - Engaging Card */}
                            <AnimatePresence>
                                {showFeedback && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className={`rounded-2xl p-4 mb-2 shadow-sm border relative overflow-hidden ${isCorrect ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100'}`}
                                    >
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${isCorrect ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                                        <h3 className={`font-bold text-sm mb-1.5 flex items-center gap-2 ${isCorrect ? 'text-emerald-800' : 'text-rose-800'}`}>
                                            {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2 border-rose-400 flex items-center justify-center text-[10px]">!</div>}
                                            {language === 'th' ? 'อธิบายคำตอบ' : 'Explanation'}
                                        </h3>
                                        <p className={`text-xs leading-relaxed font-medium ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                                            {language === 'th' ? question.explanationTh : question.explanation}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Floating Next Button */}
                        <AnimatePresence>
                            {showFeedback && (
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 20, opacity: 0 }}
                                    className="pt-2 mt-auto shrink-0 pb-1"
                                >
                                    <Button
                                        size="default"
                                        className="w-full h-11 text-base font-bold shadow-lg shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                                        onClick={handleNext}
                                    >
                                        {currentQuestion < questions.length - 1 ? (language === 'th' ? 'ไปข้อถัดไป' : 'Continue to Next') : (language === 'th' ? 'ดูสรุปผล' : 'View Summary')}
                                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </main>
        </div>
    );
}
