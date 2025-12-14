import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    ArrowLeft, Zap, Timer, Trophy, Play, Clock, Target, Users,
    Flame, Crown, Share2, Sparkles, ChevronRight, Volume2,
    Keyboard, Award, TrendingUp, Star, Heart, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

// Mock data for leaderboard
const MOCK_LEADERBOARD = [
    { rank: 1, name: 'Somchai_TH', avatar: '🦁', time: '01:12.4589', date: 'Just now', isChampion: true },
    { rank: 2, name: 'EmmaW', avatar: '🦊', time: '01:15.2044', date: '2m ago' },
    { rank: 3, name: 'Kenji_JP', avatar: '🐼', time: '01:18.0012', date: '5m ago' },
    { rank: 4, name: 'Lisa_KR', avatar: '🐰', time: '01:22.3341', date: '8m ago' },
    { rank: 5, name: 'Alex_US', avatar: '🦅', time: '01:25.1123', date: '12m ago' },
];

// Monthly Champions - Top 3 per month
const HALL_OF_FAME = [
    {
        month: 'JAN 2024',
        champions: [
            { rank: 1, name: 'ZenMaster', score: 4350, bestTime: '00:52.33' },
            { rank: 2, name: 'Alex_US', score: 4280, bestTime: '00:53.15' },
            { rank: 3, name: 'NinjaX', score: 4150, bestTime: '00:54.88' },
        ]
    },
    {
        month: 'FEB 2024',
        champions: [
            { rank: 1, name: 'NinjaX', score: 4410, bestTime: '00:51.05' },
            { rank: 2, name: 'Luna_TH', score: 4320, bestTime: '00:52.22' },
            { rank: 3, name: 'MaxPro', score: 4210, bestTime: '00:53.05' },
        ]
    },
    {
        month: 'MAR 2024',
        champions: [
            { rank: 1, name: 'MaxPro', score: 4580, bestTime: '00:49.21' },
            { rank: 2, name: 'DevMike', score: 4450, bestTime: '00:50.33' },
            { rank: 3, name: 'ZenMaster', score: 4380, bestTime: '00:51.21' },
        ]
    },
    {
        month: 'APR 2024',
        champions: [
            { rank: 1, name: 'Luna_TH', score: 4720, bestTime: '00:47.88' },
            { rank: 2, name: 'Sarah_BKK', score: 4650, bestTime: '00:48.33' },
            { rank: 3, name: 'Alex_US', score: 4580, bestTime: '00:49.21' },
        ]
    },
    {
        month: 'MAY 2024',
        champions: [
            { rank: 1, name: 'DevMike', score: 4950, bestTime: '00:45.11' },
            { rank: 2, name: 'NinjaX', score: 4820, bestTime: '00:46.22' },
            { rank: 3, name: 'ZenMaster', score: 4710, bestTime: '00:47.05' },
        ]
    },
    {
        month: 'JUN 2024',
        champions: [
            { rank: 1, name: 'Sarah_BKK', score: 5290, bestTime: '00:42.32' },
            { rank: 2, name: 'MaxPro', score: 5120, bestTime: '00:43.15' },
            { rank: 3, name: 'Luna_TH', score: 4980, bestTime: '00:44.88' },
        ]
    },
];

export default function VocabSpeedrunPage() {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const [leaderboardTab, setLeaderboardTab] = useState<'global' | 'friends'>('global');
    const [showLiveUpdate, setShowLiveUpdate] = useState(true);

    // Season countdown (mock: 2 days 14 hours)
    const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 14, minutes: 32, seconds: 45 });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
                if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
                if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
                return prev;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // My stats (mock)
    const myStats = {
        rank: 428,
        bestTime: '01:45.0000',
        nextRank: 400,
        neededTime: '-0.5s'
    };

    // Game State
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameTimer, setGameTimer] = useState(0); // milliseconds
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [combo, setCombo] = useState(0);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(5);
    const [isPaused, setIsPaused] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null); // 3, 2, 1, null
    const [correctCount, setCorrectCount] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [gameComplete, setGameComplete] = useState(false);
    const [finalTime, setFinalTime] = useState(0);
    const [isWarmup, setIsWarmup] = useState(false); // true = warmup mode, false = run mode
    const [showVocabList, setShowVocabList] = useState(false);

    // Mock Vocabulary for Game (30 questions)
    const gameVocab = [
        { word: 'Ephemeral', partOfSpeech: 'Adjective', correct: 'อยู่ชั่วคราว', choices: ['อยู่ชั่วคราว', 'มีความสุขมาก', 'รูปทรงเรขาคณิต', 'เดินเตร่'] },
        { word: 'Serendipity', partOfSpeech: 'Noun', correct: 'โชคดีโดยบังเอิญ', choices: ['โชคดีโดยบังเอิญ', 'ความเศร้า', 'ความกลัว', 'ความโกรธ'] },
        { word: 'Ubiquitous', partOfSpeech: 'Adjective', correct: 'มีอยู่ทุกหนทุกแห่ง', choices: ['หายาก', 'มีอยู่ทุกหนทุกแห่ง', 'สวยงาม', 'น่าเกลียด'] },
        { word: 'Eloquent', partOfSpeech: 'Adjective', correct: 'พูดจาคล่องแคล่ว', choices: ['เงียบ', 'ดัง', 'พูดจาคล่องแคล่ว', 'โง่'] },
        { word: 'Resilient', partOfSpeech: 'Adjective', correct: 'ยืดหยุ่น ฟื้นตัวเร็ว', choices: ['อ่อนแอ', 'ยืดหยุ่น ฟื้นตัวเร็ว', 'แข็ง', 'นุ่ม'] },
        { word: 'Pragmatic', partOfSpeech: 'Adjective', correct: 'เน้นปฏิบัติ', choices: ['เน้นปฏิบัติ', 'ฝันเฟื่อง', 'โรแมนติก', 'เศร้า'] },
        { word: 'Benevolent', partOfSpeech: 'Adjective', correct: 'ใจดี มีเมตตา', choices: ['โหดร้าย', 'ใจดี มีเมตตา', 'เห็นแก่ตัว', 'ขี้อิจฉา'] },
        { word: 'Ambiguous', partOfSpeech: 'Adjective', correct: 'คลุมเครือ', choices: ['ชัดเจน', 'คลุมเครือ', 'แม่นยำ', 'ตรงไปตรงมา'] },
        { word: 'Meticulous', partOfSpeech: 'Adjective', correct: 'พิถีพิถัน', choices: ['ประมาท', 'พิถีพิถัน', 'รวดเร็ว', 'เลินเล่อ'] },
        { word: 'Tenacious', partOfSpeech: 'Adjective', correct: 'มุ่งมั่น ดื้อรั้น', choices: ['มุ่งมั่น ดื้อรั้น', 'ยอมแพ้ง่าย', 'ขี้เกียจ', 'ไม่สนใจ'] },
        { word: 'Nostalgia', partOfSpeech: 'Noun', correct: 'ความคิดถึงอดีต', choices: ['ความกลัว', 'ความคิดถึงอดีต', 'ความหวัง', 'ความโกรธ'] },
        { word: 'Procrastinate', partOfSpeech: 'Verb', correct: 'ผัดวันประกันพรุ่ง', choices: ['รีบทำ', 'ผัดวันประกันพรุ่ง', 'ตัดสินใจเร็ว', 'ขยัน'] },
        { word: 'Inevitable', partOfSpeech: 'Adjective', correct: 'หลีกเลี่ยงไม่ได้', choices: ['หลีกเลี่ยงไม่ได้', 'หลีกเลี่ยงได้', 'ไม่แน่นอน', 'น่าสงสัย'] },
        { word: 'Compassion', partOfSpeech: 'Noun', correct: 'ความเห็นอกเห็นใจ', choices: ['ความเกลียด', 'ความเห็นอกเห็นใจ', 'ความอิจฉา', 'ความโลภ'] },
        { word: 'Perseverance', partOfSpeech: 'Noun', correct: 'ความอุตสาหะ', choices: ['ความขี้เกียจ', 'ความกลัว', 'ความอุตสาหะ', 'ความท้อแท้'] },
        { word: 'Authentic', partOfSpeech: 'Adjective', correct: 'แท้จริง', choices: ['ปลอม', 'แท้จริง', 'เลียนแบบ', 'น่าสงสัย'] },
        { word: 'Innovative', partOfSpeech: 'Adjective', correct: 'สร้างสรรค์ใหม่', choices: ['สร้างสรรค์ใหม่', 'ล้าสมัย', 'ธรรมดา', 'น่าเบื่อ'] },
        { word: 'Ambition', partOfSpeech: 'Noun', correct: 'ความทะเยอทะยาน', choices: ['ความขี้เกียจ', 'ความทะเยอทะยาน', 'ความเฉื่อยชา', 'ความท้อแท้'] },
        { word: 'Grateful', partOfSpeech: 'Adjective', correct: 'สำนึกบุญคุณ', choices: ['เนรคุณ', 'สำนึกบุญคุณ', 'ไม่สนใจ', 'โกรธ'] },
        { word: 'Optimistic', partOfSpeech: 'Adjective', correct: 'มองโลกในแง่ดี', choices: ['มองโลกในแง่ร้าย', 'มองโลกในแง่ดี', 'เฉยชา', 'สงสัย'] },
        { word: 'Skeptical', partOfSpeech: 'Adjective', correct: 'ไม่เชื่อง่าย', choices: ['เชื่อง่าย', 'ไม่เชื่อง่าย', 'โง่เขลา', 'ไร้เดียงสา'] },
        { word: 'Sincere', partOfSpeech: 'Adjective', correct: 'จริงใจ', choices: ['จริงใจ', 'หลอกลวง', 'เสแสร้ง', 'เจ้าเล่ห์'] },
        { word: 'Diligent', partOfSpeech: 'Adjective', correct: 'ขยันขันแข็ง', choices: ['ขี้เกียจ', 'ขยันขันแข็ง', 'ประมาท', 'เลินเล่อ'] },
        { word: 'Humble', partOfSpeech: 'Adjective', correct: 'ถ่อมตน', choices: ['หยิ่ง', 'ถ่อมตน', 'โอ้อวด', 'ทะนงตน'] },
        { word: 'Curious', partOfSpeech: 'Adjective', correct: 'อยากรู้อยากเห็น', choices: ['อยากรู้อยากเห็น', 'ไม่สนใจ', 'เฉยชา', 'น่าเบื่อ'] },
        { word: 'Courageous', partOfSpeech: 'Adjective', correct: 'กล้าหาญ', choices: ['ขี้ขลาด', 'กล้าหาญ', 'หวาดกลัว', 'ตื่นตระหนก'] },
        { word: 'Wisdom', partOfSpeech: 'Noun', correct: 'ปัญญา', choices: ['ความโง่', 'ปัญญา', 'ความไม่รู้', 'ความเขลา'] },
        { word: 'Patience', partOfSpeech: 'Noun', correct: 'ความอดทน', choices: ['ความใจร้อน', 'ความอดทน', 'ความหงุดหงิด', 'ความโกรธ'] },
        { word: 'Integrity', partOfSpeech: 'Noun', correct: 'ความซื่อสัตย์', choices: ['ความซื่อสัตย์', 'ความหลอกลวง', 'ความเจ้าเล่ห์', 'ความโกหก'] },
        { word: 'Empathy', partOfSpeech: 'Noun', correct: 'ความเข้าอกเข้าใจ', choices: ['ความเย็นชา', 'ความเข้าอกเข้าใจ', 'ความไม่สนใจ', 'ความเห็นแก่ตัว'] },
    ];

    const totalQuestions = 30;
    const currentQuestion = gameVocab[currentQuestionIndex];

    // Game Timer Effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying && !isPaused) {
            interval = setInterval(() => {
                setGameTimer(prev => prev + 10);
            }, 10);
        }
        return () => clearInterval(interval);
    }, [isPlaying, isPaused]);

    const formatGameTime = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const milliseconds = ms % 1000;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(4, '0')}`;
    };

    const handleStartGame = (warmupMode: boolean = false) => {
        // Start countdown
        setIsWarmup(warmupMode);
        setCountdown(3);
        setGameTimer(0);
        setCurrentQuestionIndex(0);
        setCombo(0);
        setScore(0);
        setLives(5);
        setIsPaused(false);
        setCorrectCount(0);
        setWrongCount(0);
    };

    // Countdown effect
    useEffect(() => {
        if (countdown === null) return;

        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            // Countdown finished, start game
            setCountdown(null);
            setIsPlaying(true);
        }
    }, [countdown]);

    const handleAnswer = (answer: string) => {
        if (showResult) return; // Prevent multiple clicks

        setSelectedAnswer(answer);
        setShowResult(true);

        const isCorrect = answer === currentQuestion.correct;

        if (isCorrect) {
            setCorrectCount(prev => prev + 1);
            setCombo(prev => prev + 1);
            setScore(prev => prev + 100 + (combo * 10));
        } else {
            setWrongCount(prev => prev + 1);
            setCombo(0);
            // Only reduce lives in RUN mode, not in Warm-up
            if (!isWarmup) {
                setLives(prev => prev - 1);
            }
        }

        // Move to next question after delay
        setTimeout(() => {
            setShowResult(false);
            setSelectedAnswer(null);

            if (currentQuestionIndex >= totalQuestions - 1) {
                // Game complete - show summary
                setFinalTime(gameTimer);
                setIsPlaying(false);
                setGameComplete(true);
            } else {
                setCurrentQuestionIndex(prev => prev + 1);
            }
        }, 800); // Show result for 800ms
    };

    const handleKeyPress = (e: KeyboardEvent) => {
        if (isPlaying && !isPaused) {
            if (e.key >= '1' && e.key <= '4') {
                const index = parseInt(e.key) - 1;
                if (currentQuestion.choices[index]) {
                    handleAnswer(currentQuestion.choices[index]);
                }
            }
            if (e.key === 'Escape') {
                setIsPaused(true);
            }
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isPlaying, isPaused, currentQuestion]);

    // Game Complete Summary UI
    if (gameComplete) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center max-w-md w-full"
                >
                    {/* Trophy Icon */}
                    <motion.div
                        animate={{
                            y: [0, -8, 0],
                            rotate: [0, -3, 3, 0]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="text-8xl mb-6"
                    >
                        🏆
                    </motion.div>

                    {/* Title */}
                    <h1 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                        COMPLETE!
                    </h1>
                    <p className="text-slate-400 mb-8">คุณทำสำเร็จครบ 30 ข้อแล้ว</p>

                    {/* Stats Cards */}
                    <div className="space-y-4 mb-8">
                        {/* Time */}
                        <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700">
                            <p className="text-slate-400 text-sm mb-1">เวลาที่ใช้</p>
                            <p className="text-4xl font-mono font-bold text-cyan-400">
                                {formatGameTime(finalTime)}
                            </p>
                        </div>

                        {/* Correct & Wrong */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-green-500/20 rounded-2xl p-6 border border-green-500/30">
                                <p className="text-green-400/70 text-sm mb-1">ตอบถูก</p>
                                <p className="text-4xl font-bold text-green-400">{correctCount}</p>
                            </div>
                            <div className="bg-red-500/20 rounded-2xl p-6 border border-red-500/30">
                                <p className="text-red-400/70 text-sm mb-1">ตอบผิด</p>
                                <p className="text-4xl font-bold text-red-400">{wrongCount}</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <Button
                            onClick={() => {
                                setGameComplete(false);
                                handleStartGame(isWarmup);
                            }}
                            className="w-full py-6 text-lg font-bold bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-full"
                        >
                            <Play className="w-5 h-5 mr-2" />
                            เล่นอีกครั้ง
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setGameComplete(false);
                            }}
                            className="w-full py-6 text-lg rounded-full bg-slate-200 hover:bg-slate-300 text-slate-900 border-0"
                        >
                            กลับหน้าหลัก
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Countdown UI
    if (countdown !== null) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
                <motion.div
                    key={countdown}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    className="text-center"
                >
                    {countdown > 0 ? (
                        <>
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.5 }}
                                className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-400 to-blue-500"
                            >
                                {countdown}
                            </motion.div>
                            <p className="text-slate-400 text-xl mt-4">Get Ready!</p>
                        </>
                    ) : (
                        <motion.div
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1 }}
                            className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500"
                        >
                            GO!
                        </motion.div>
                    )}
                </motion.div>
            </div>
        );
    }

    // Game UI
    if (isPlaying) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
                {/* Top Bar - Fixed Header */}
                <div className="p-4 md:p-6">
                    {/* Row 1: Progress | Timer | Actions */}
                    <div className="flex items-center justify-between mb-4">
                        {/* Left: Progress */}
                        <div className="flex items-center gap-3 w-1/4">
                            <div className="flex items-center gap-2">
                                <Flame className="w-5 h-5 text-orange-400" />
                                <span className="font-bold">{currentQuestionIndex + 1}</span>
                                <span className="text-slate-400">/ {totalQuestions}</span>
                            </div>
                        </div>

                        {/* Center: Timer */}
                        <div className="text-center flex-1">
                            <div className="bg-slate-800/80 px-6 py-2 rounded-full border border-slate-700 inline-block">
                                <span className="text-2xl md:text-3xl font-mono font-bold">{formatGameTime(gameTimer)}</span>
                            </div>
                            <p className="text-xs text-green-400 mt-1">● -0.5s PACE</p>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center justify-end gap-2 w-1/4">
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                                <Volume2 className="w-5 h-5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white" onClick={() => setIsPlaying(false)}>
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Row 2: Progress Bar (full width) */}
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-4">
                        <div
                            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all"
                            style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                        />
                    </div>

                    {/* Row 3: Score Counter (centered) */}
                    <div className="flex items-center justify-center gap-4">
                        <div className="flex items-center gap-2 bg-green-500/20 px-4 py-1.5 rounded-full">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                            <span className="text-green-400 font-bold">{correctCount}</span>
                            <span className="text-green-400/60 text-sm">ถูก</span>
                        </div>
                        <div className="flex items-center gap-2 bg-red-500/20 px-4 py-1.5 rounded-full">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                            <span className="text-red-400 font-bold">{wrongCount}</span>
                            <span className="text-red-400/60 text-sm">ผิด</span>
                        </div>
                    </div>
                </div>

                {/* Main Game Area */}
                <div className="flex-1 flex flex-col items-center px-4 mt-2">
                    {/* Combo - Always reserve space */}
                    <div className="h-10 mb-2 flex items-center justify-center">
                        {combo > 0 && (
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                            >
                                <span className="text-yellow-400 font-black text-xl italic tracking-wider">COMBO </span>
                                <span className="text-yellow-300 font-black text-2xl">x{combo}!</span>
                            </motion.div>
                        )}
                    </div>

                    {/* Word */}
                    <motion.h1
                        key={currentQuestionIndex}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-5xl md:text-7xl font-black mb-4 text-center"
                    >
                        {currentQuestion.word}
                    </motion.h1>

                    {/* Part of Speech */}
                    <p className="text-slate-400 uppercase tracking-widest text-sm mb-8">
                        {currentQuestion.partOfSpeech.toUpperCase()}
                    </p>

                    {/* Answer Choices */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-3xl">
                        {currentQuestion.choices.map((choice, idx) => {
                            const isCorrectAnswer = choice === currentQuestion.correct;
                            const isSelected = selectedAnswer === choice;
                            const showCorrect = showResult && isCorrectAnswer;
                            const showWrong = showResult && isSelected && !isCorrectAnswer;

                            return (
                                <motion.button
                                    key={idx}
                                    initial={{ x: idx % 2 === 0 ? -20 : 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    onClick={() => handleAnswer(choice)}
                                    disabled={showResult}
                                    className={`flex items-center gap-4 p-4 md:p-5 rounded-xl border transition-all group ${showCorrect
                                        ? 'bg-green-500/30 border-green-500 ring-2 ring-green-500'
                                        : showWrong
                                            ? 'bg-red-500/30 border-red-500 ring-2 ring-red-500'
                                            : 'bg-slate-800/60 hover:bg-slate-700/80 border-slate-700 hover:border-slate-500'
                                        }`}
                                >
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${showCorrect
                                        ? 'bg-green-500 text-white'
                                        : showWrong
                                            ? 'bg-red-500 text-white'
                                            : 'bg-slate-700 group-hover:bg-slate-600 text-slate-300'
                                        }`}>
                                        {showCorrect ? '✓' : showWrong ? '✗' : idx + 1}
                                    </span>
                                    <span className={`text-lg font-medium ${showCorrect ? 'text-green-400' : showWrong ? 'text-red-400' : ''
                                        }`}>{choice}</span>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Keyboard Shortcuts - Right below choices */}
                    {/* Keyboard Shortcuts - Right below choices */}
                    <div className="flex items-center justify-center mt-6 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-slate-800 rounded text-xs">1-4</kbd>
                            <span>Select Answer</span>
                        </div>
                    </div>
                </div>

                {/* Lives */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <Heart
                            key={i}
                            className={`w-5 h-5 ${i < lives ? 'text-red-500 fill-red-500' : 'text-slate-700'}`}
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-slate-950 dark:via-purple-950/30 dark:to-slate-950">
            {/* Live Update Banner */}
            <AnimatePresence>
                {showLiveUpdate && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 text-white text-sm py-2 px-4 overflow-hidden"
                    >
                        <div className="container mx-auto flex items-center justify-center gap-2 text-center flex-wrap">
                            <Badge className="bg-red-500 text-white text-[10px] font-bold animate-pulse">LIVE UPDATE</Badge>
                            <span>🏆 User <strong className="text-yellow-200">CyberMonkey</strong> just broke the Season record with <strong>01:24.4412</strong>!</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:inline">⚡ Double XP Weekend starts in 4 hours!</span>
                            <span className="hidden md:inline">•</span>
                            <span className="hidden md:inline">🌿 New "Space" vocab pack dropped</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center shadow-lg">
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold">Vocab Speedrun</h1>
                                <p className="text-xs text-muted-foreground">Race against time!</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6">
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Season Card */}
                        <Card className="overflow-hidden border-0 shadow-xl bg-white dark:bg-slate-900">
                            <div className="relative">
                                {/* Decorative background */}
                                <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 dark:from-green-900/20 dark:via-emerald-900/10 dark:to-teal-900/20" />
                                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-yellow-200/30 to-transparent rounded-full blur-3xl" />
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-300/20 to-transparent rounded-full blur-2xl" />

                                <CardContent className="relative p-6 md:p-8">
                                    {/* Lives - Top Right */}
                                    <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Heart
                                                key={i}
                                                className="w-6 h-6 text-red-500 fill-red-500 drop-shadow-md"
                                            />
                                        ))}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 mb-4">
                                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 font-bold">
                                            Jun 2026
                                        </Badge>
                                        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                                            <Clock className="w-3 h-3 mr-1" />
                                            Ends in {timeLeft.days}d {timeLeft.hours}h
                                        </Badge>
                                    </div>

                                    <h2 className="text-3xl md:text-4xl font-black mb-3">
                                        The <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">Nature</span> Expedition
                                    </h2>

                                    <p className="text-muted-foreground mb-6 max-w-lg">
                                        Race against the clock to match complex environment vocabulary.
                                        Top 100 players get the exclusive "Forest Guardian" badge. 🌲
                                    </p>

                                    <div className="flex flex-wrap gap-3 mb-6">
                                        <Button
                                            size="lg"
                                            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-lg shadow-orange-200 dark:shadow-orange-900/30 rounded-full px-8 font-bold"
                                            onClick={() => handleStartGame(false)}
                                        >
                                            <Play className="w-5 h-5 mr-2 fill-white" />
                                            START RUN
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className="rounded-full px-6 border-2 bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500"
                                            onClick={() => handleStartGame(true)}
                                        >
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Warm-up
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className="rounded-full px-6 border-2 border-green-500 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/20"
                                            onClick={() => setShowVocabList(true)}
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Vocab
                                        </Button>
                                    </div>

                                </CardContent>
                            </div>
                        </Card>

                        {/* Leaderboard */}
                        <Card className="border-0 shadow-xl bg-white dark:bg-slate-900">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                                            <TrendingUp className="w-4 h-4 text-white" />
                                        </div>
                                        <h3 className="text-lg font-bold">Live Leaderboard</h3>
                                    </div>
                                    <Tabs value={leaderboardTab} onValueChange={(v) => setLeaderboardTab(v as 'global' | 'friends')}>
                                        <TabsList className="bg-slate-100 dark:bg-slate-800">
                                            <TabsTrigger value="global" className="text-xs">Global</TabsTrigger>
                                            <TabsTrigger value="friends" className="text-xs">Friends</TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>

                                {/* Table Header */}
                                <div className="grid grid-cols-10 gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                                    <div className="col-span-1">Rank</div>
                                    <div className="col-span-4">Player</div>
                                    <div className="col-span-3 text-center">Time</div>
                                    <div className="col-span-2 text-right">Date</div>
                                </div>

                                {/* Leaderboard Rows */}
                                <div className="space-y-2">
                                    {MOCK_LEADERBOARD.map((player, idx) => (
                                        <motion.div
                                            key={player.rank}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className={`grid grid-cols-10 gap-2 items-center p-3 rounded-xl transition-all ${player.rank === 1
                                                ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800'
                                                : player.rank <= 3
                                                    ? 'bg-slate-50 dark:bg-slate-800/50'
                                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                                                }`}
                                        >
                                            <div className="col-span-1">
                                                {player.rank === 1 ? (
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                                                        <Crown className="w-4 h-4 text-white" />
                                                    </div>
                                                ) : player.rank === 2 ? (
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center">
                                                        <span className="text-sm font-bold text-white">2</span>
                                                    </div>
                                                ) : player.rank === 3 ? (
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center">
                                                        <span className="text-sm font-bold text-white">3</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm font-medium text-muted-foreground pl-2">{player.rank}</span>
                                                )}
                                            </div>
                                            <div className="col-span-4 flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 flex items-center justify-center text-lg">
                                                    {player.avatar}
                                                </div>
                                                <span className="font-semibold text-sm truncate">{player.name}</span>
                                            </div>
                                            <div className="col-span-3 text-center font-mono text-sm font-semibold">
                                                {player.time}
                                            </div>
                                            <div className="col-span-2 text-right text-xs text-muted-foreground">
                                                {player.date}
                                            </div>
                                        </motion.div>
                                    ))}

                                    {/* My Position */}
                                    <div className="grid grid-cols-10 gap-2 items-center p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 mt-4">
                                        <div className="col-span-1">
                                            <span className="text-sm font-bold text-blue-600">{myStats.rank}</span>
                                        </div>
                                        <div className="col-span-4 flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                                                B
                                            </div>
                                            <span className="font-semibold text-sm">You</span>
                                        </div>
                                        <div className="col-span-3 text-center font-mono text-sm font-semibold text-blue-600">
                                            {myStats.bestTime}
                                        </div>
                                        <div className="col-span-2 text-right text-xs text-muted-foreground">
                                            -
                                        </div>
                                    </div>
                                </div>

                                <Button variant="ghost" className="w-full mt-4 text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                                    View Top 100
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Stats & Info */}
                    <div className="space-y-6">
                        {/* My Stats Card */}
                        <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white overflow-hidden">
                            <CardContent className="p-6 relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                                <h3 className="text-sm font-medium text-white/80 uppercase tracking-wider mb-4">My Stats</h3>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-3xl font-black">#{myStats.rank}</p>
                                        <p className="text-xs text-white/70">Current Rank</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-mono font-bold">{myStats.bestTime}</p>
                                        <p className="text-xs text-white/70">Best Time</p>
                                    </div>
                                </div>

                                <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-white/80">Next Rank (#{myStats.nextRank})</span>
                                        <span className="font-semibold text-green-300">{myStats.neededTime} needed</span>
                                    </div>
                                    <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
                                        <div className="h-full w-3/4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pro Tip */}
                        <Card className="border-0 shadow-xl bg-white dark:bg-slate-900">
                            <CardContent className="p-5">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50 flex items-center justify-center shrink-0">
                                        <Keyboard className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-1">Pro Tip</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Use keyboard shortcuts (1, 2, 3, 4) to select answers faster than clicking!
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Hall of Fame */}
                        <Card className="border-0 shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
                                        <Award className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <h4 className="font-bold text-sm">Hall of Fame</h4>
                                </div>

                                {/* Monthly Champions - Scrollable */}
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                    {HALL_OF_FAME.map((monthData, monthIdx) => (
                                        <div
                                            key={monthIdx}
                                            className={`p-2 rounded-lg border ${monthIdx === 0
                                                ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800'
                                                : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700'
                                                }`}
                                        >
                                            {/* Month Badge */}
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <Badge className={`text-[9px] px-1.5 py-0 ${monthIdx === 0
                                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0'
                                                    : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                                    }`}>
                                                    {monthData.month}
                                                </Badge>
                                                {monthIdx === 0 && <Crown className="w-3 h-3 text-yellow-500" />}
                                            </div>

                                            {/* Rank 1 - Hero Champion */}
                                            <div className="relative flex items-center gap-3 p-2.5 rounded-xl bg-gradient-to-r from-yellow-200 via-amber-100 to-orange-200 dark:from-yellow-800/40 dark:via-amber-700/30 dark:to-orange-800/40 mb-1.5 border border-yellow-300 dark:border-yellow-700 shadow-sm">
                                                {/* Crown & Avatar */}
                                                <div className="relative">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-md ring-2 ring-yellow-300 dark:ring-yellow-600">
                                                        <span className="text-lg">👑</span>
                                                    </div>
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white shadow">
                                                        1
                                                    </div>
                                                </div>
                                                {/* Name */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-sm truncate text-amber-900 dark:text-amber-100">{monthData.champions[0].name}</p>
                                                    <p className="text-[9px] text-amber-700 dark:text-amber-400">Champion</p>
                                                </div>
                                                {/* Time & Accuracy */}
                                                <div className="text-right">
                                                    <p className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 font-mono">
                                                        {monthData.champions[0].bestTime}
                                                    </p>
                                                    <p className="text-[9px] font-bold text-green-600 dark:text-green-400">30/30</p>
                                                </div>
                                                {/* Sparkle effect */}
                                                <div className="absolute top-1 right-1">
                                                    <Sparkles className="w-3 h-3 text-yellow-500 animate-pulse" />
                                                </div>
                                            </div>

                                            {/* Rank 2 & 3 - Side by side */}
                                            <div className="grid grid-cols-2 gap-1">
                                                {/* Rank 2 */}
                                                <div className="flex items-center gap-1.5 p-1 rounded bg-slate-100/80 dark:bg-slate-700/40">
                                                    <span className="w-4 h-4 rounded-full bg-slate-400 text-white text-[9px] flex items-center justify-center font-bold">2</span>
                                                    <span className="flex-1 text-[10px] font-medium truncate">{monthData.champions[1].name}</span>
                                                    <div className="text-right">
                                                        <span className="text-[9px] text-slate-700 dark:text-slate-300 font-mono">{monthData.champions[1].bestTime}</span>
                                                    </div>
                                                </div>
                                                {/* Rank 3 */}
                                                <div className="flex items-center gap-1.5 p-1 rounded bg-amber-50/80 dark:bg-amber-900/20">
                                                    <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] flex items-center justify-center font-bold">3</span>
                                                    <span className="flex-1 text-[10px] font-medium truncate">{monthData.champions[2].name}</span>
                                                    <div className="text-right">
                                                        <span className="text-[9px] text-amber-700 dark:text-amber-400 font-mono">{monthData.champions[2].bestTime}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Share Card */}
                        <Card className="border-0 shadow-xl bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 border border-pink-200 dark:border-pink-800">
                            <CardContent className="p-5 text-center">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center mx-auto mb-3 shadow-lg">
                                    <Share2 className="w-6 h-6 text-white" />
                                </div>
                                <h4 className="font-bold mb-1">Show off your stats!</h4>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Generate a beautiful card of your current season performance.
                                </p>
                                <Button
                                    variant="outline"
                                    className="w-full border-pink-300 text-pink-600 hover:bg-pink-100 dark:border-pink-700 dark:text-pink-400 dark:hover:bg-pink-900/30"
                                >
                                    Create Share Card
                                    <span className="text-xs text-muted-foreground ml-2">(See Preview)</span>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Footer */}
                <footer className="text-center py-8 mt-8 text-sm text-muted-foreground">
                    © 2023 Promjum. Keep learning! 🚀
                </footer>
            </main>

            {/* Vocab List Dialog */}
            <Dialog open={showVocabList} onOpenChange={setShowVocabList}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <Eye className="w-6 h-6 text-green-500" />
                            Vocabulary List (30 Words)
                        </DialogTitle>
                    </DialogHeader>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">#</TableHead>
                                <TableHead className="font-bold">Front (Word)</TableHead>
                                <TableHead>Part of Speech</TableHead>
                                <TableHead className="font-bold">Back (Translation)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {gameVocab.map((vocab, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                                    <TableCell className="font-bold text-lg">{vocab.word}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-xs">
                                            {vocab.partOfSpeech}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-green-600 dark:text-green-400 font-medium">
                                        {vocab.correct}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </DialogContent>
            </Dialog>
        </div>
    );
}
