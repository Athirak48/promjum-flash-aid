import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ChevronRight, ChevronLeft, Sparkles, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface OnboardingData {
    learning_goal: string;
    skill_level: string;
    target_languages: string[];
    daily_time: string;
    best_time: string;
    biggest_problem: string;
    preferred_media: string;
    spirit_animal: string;
    play_style: string;
    motivation_style: string;
    nickname: string;
}

interface QuestionOption {
    value: string;
    emoji: string;
    label: string;
    description?: string;
}

interface Question {
    id: keyof OnboardingData;
    title: string;
    subtitle?: string;
    type: 'single' | 'multi' | 'text';
    options?: QuestionOption[];
    placeholder?: string;
}

const questions: Question[] = [
    {
        id: 'learning_goal',
        title: 'เป้าหมายสูงสุดของการฝึกภาษาในรอบนี้คืออะไร?',
        subtitle: 'เพื่อจัดเนื้อหาที่เหมาะกับคุณ',
        type: 'single',
        options: [
            { value: 'daily_life', emoji: '🗣️', label: 'สื่อสารในชีวิตประจำวัน', description: 'คุยกับคนต่างชาติ, ใช้ในที่ทำงาน' },
            { value: 'business', emoji: '💼', label: 'อัพเงินเดือน/ย้ายงาน', description: 'Business, Email' },
            { value: 'travel', emoji: '✈️', label: 'เอาตัวรอดต่างแดน', description: 'Travel, Ordering food' },
            { value: 'entertainment', emoji: '🎮', label: 'เสพสื่อบันเทิง', description: 'Netflix, Games, Songs' },
            { value: 'social', emoji: '💬', label: 'หาเพื่อน/หาแฟน', description: 'Chat, Social' },
            { value: 'other', emoji: '✏️', label: 'อื่นๆ', description: 'พิมพ์ระบุเอง' },
        ]
    },
    {
        id: 'skill_level',
        title: 'คิดว่าตอนนี้ "สกิลภาษา" ของตัวเองอยู่ระดับไหน?',
        subtitle: 'เพื่อปรับระดับความยากของ AI',
        type: 'single',
        options: [
            { value: 'beginner', emoji: '👶', label: 'เริ่มจากศูนย์', description: 'A-B-C ยังงงๆ' },
            { value: 'basic', emoji: '🐥', label: 'พอได้งูๆ ปลาๆ', description: 'รู้ศัพท์บ้าง แต่เรียงประโยคไม่ถูก' },
            { value: 'intermediate', emoji: '🦜', label: 'สื่อสารได้', description: 'คุยรู้เรื่อง ฟังออกบ้างไม่ออกบ้าง' },
            { value: 'advanced', emoji: '🦅', label: 'เทพเจ้า', description: 'ดูหนังไม่ต้องเปิดซับฯ' },
        ]
    },
    {
        id: 'target_languages',
        title: 'ภาษาที่อยากเน้นเป็นพิเศษในช่วงนี้?',
        subtitle: 'เลือกได้มากกว่า 1',
        type: 'multi',
        options: [
            { value: 'en', emoji: '🇬🇧', label: 'อังกฤษ', description: 'English' },
            { value: 'zh', emoji: '🇨🇳', label: 'จีน', description: 'Chinese' },
            { value: 'ja', emoji: '🇯🇵', label: 'ญี่ปุ่น', description: 'Japanese' },
            { value: 'ko', emoji: '🇰🇷', label: 'เกาหลี', description: 'Korean' },
            { value: 'other', emoji: '🌍', label: 'อื่นๆ', description: '' },
        ]
    },
    {
        id: 'daily_time',
        title: 'มีเวลาให้เราวันละกี่นาที?',
        subtitle: 'เอาแบบที่ไหวจริงๆ',
        type: 'single',
        options: [
            { value: '5min', emoji: '⚡', label: '5 นาที', description: 'ขอแบบไวๆ (5-10 คำ/วัน)' },
            { value: '15min', emoji: '☕', label: '15 นาที', description: 'กำลังดี จิบกาแฟไปเล่นไป (15-20 คำ/วัน)' },
            { value: '30min', emoji: '🔥', label: '30 นาที+', description: 'จัดมาหนักๆ พี่รีบเก่ง (30+ คำ/วัน)' },
        ]
    },
    {
        id: 'best_time',
        title: 'ช่วงเวลาไหนที่ "สมองแล่น" ที่สุด?',
        subtitle: 'เพื่อตั้งเวลาแจ้งเตือนให้ตรงจุด',
        type: 'single',
        options: [
            { value: 'morning', emoji: '☀️', label: 'ตื่นนอน', description: 'ล้างหน้าไก่แล้วเล่นเลย' },
            { value: 'lunch', emoji: '🍱', label: 'พักเที่ยง', description: 'กินข้าวไปเล่นไป' },
            { value: 'commute', emoji: '🚌', label: 'ระหว่างเดินทาง', description: 'นั่งรถเมล์/รถไฟฟ้า' },
            { value: 'night', emoji: '🌙', label: 'ก่อนนอน', description: 'ทบทวนก่อนหลับ' },
            { value: 'random', emoji: '🚫', label: 'ไม่แน่นอน', description: 'อย่าเตือนบ่อย เดี๋ยวเข้าเอง' },
        ]
    },
    {
        id: 'biggest_problem',
        title: 'ปัญหาใหญ่สุดเวลาเรียนภาษาคืออะไร?',
        subtitle: 'เพื่อเลือกมินิเกมที่เหมาะสมให้',
        type: 'single',
        options: [
            { value: 'vocabulary', emoji: '🧠', label: 'จำศัพท์ไม่ได้', description: 'ท่องหน้าลืมหลัง → เน้น Flashcard' },
            { value: 'listening', emoji: '👂', label: 'ฟังไม่ออก', description: 'ฝรั่งพูดรัวเกิน → เน้นเกม Listen' },
            { value: 'boring', emoji: '🥱', label: 'น่าเบื่อ/ขี้เกียจ', description: 'แพ้ความขยัน → เน้น Gamification' },
            { value: 'shy', emoji: '🤐', label: 'ไม่กล้าใช้', description: 'กลัวผิด → เน้น Conversation (อนาคต)' },
        ]
    },
    {
        id: 'preferred_media',
        title: 'ปกติชอบเรียนรู้ผ่านสื่อแบบไหนมากที่สุด?',
        subtitle: 'เพื่อ feed เนื้อหาในหน้าแรก',
        type: 'single',
        options: [
            { value: 'music', emoji: '🎵', label: 'เพลง', description: 'ชอบแปลเพลงสากล/K-Pop' },
            { value: 'movies', emoji: '🎬', label: 'หนัง/ซีรีส์', description: 'ชอบจำจากประโยคในหนัง' },
            { value: 'news', emoji: '📰', label: 'ข่าว/บทความ', description: 'ชอบอ่านอะไรที่มีสาระ' },
            { value: 'memes', emoji: '🖼️', label: 'รูปภาพ/Meme', description: 'ชอบดูรูปตลกๆ แล้วจำศัพท์' },
        ]
    },
    {
        id: 'spirit_animal',
        title: 'ถ้าต้องเลือกสัตว์เลี้ยงคู่ใจ 1 ตัว คุณจะเลือก...',
        subtitle: 'เพื่อสุ่ม "สัตว์เลี้ยงตัวแรก" ให้ตรงจริต',
        type: 'single',
        options: [
            { value: 'owl', emoji: '🦉', label: 'นกฮูก', description: '' },
            { value: 'tiger', emoji: '🐯', label: 'เสือ', description: '' },
            { value: 'turtle', emoji: '🐢', label: 'เต่า', description: '' },
            { value: 'monkey', emoji: '🐵', label: 'ลิง', description: '' },
            { value: 'cat', emoji: '🐱', label: 'แมว', description: '' },
            { value: 'rabbit', emoji: '🐰', label: 'กระต่าย', description: '' },
            { value: 'shiba', emoji: '🐕', label: 'หมาชิบะ', description: '' },
            { value: 'dragon', emoji: '🐉', label: 'มังกร', description: '' },
            { value: 'other', emoji: '🦄', label: 'อื่นๆ', description: 'ระบุเอง' },
        ]
    },
    {
        id: 'play_style',
        title: 'เวลาแข่งเกมกับเพื่อน คุณเป็นสายไหน?',
        subtitle: '',
        type: 'single',
        options: [
            { value: 'fair_play', emoji: '😇', label: 'Fair Play', description: 'แข่งกันด้วยฝีมือล้วนๆ → แจกโล่ป้องกัน' },
            { value: 'trickster', emoji: '😈', label: 'Trickster', description: 'ทีเผลอเจอกัน! ชอบป่วนเพื่อน → แจกหมึก/ระเบิด' },
        ]
    },
    {
        id: 'motivation_style',
        title: 'อยากให้เราช่วยกระตุ้นคุณแบบไหน?',
        subtitle: '',
        type: 'single',
        options: [
            { value: 'soft', emoji: '🌸', label: 'สายปลอบใจ', description: '"เหนื่อยไหม พักหน่อยแล้วค่อยมาเรียนนะ"' },
            { value: 'hard', emoji: '🔥', label: 'สายดุดัน', description: '"เฮ้ย! อย่าขี้เกียจ ลุกมาท่องศัพท์เดี๋ยวนี้"' },
        ]
    },
    {
        id: 'nickname',
        title: 'ตั้งชื่อเล่นให้ตัวเองหน่อย!',
        subtitle: 'ชื่อที่เพื่อนๆ จะเห็นตอนเล่นด้วยกัน',
        type: 'text',
        placeholder: 'ใส่ชื่อเล่นของคุณ...'
    }
];

export default function OnboardingFlow() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [answers, setAnswers] = useState<OnboardingData>({
        learning_goal: '',
        skill_level: '',
        target_languages: [],
        daily_time: '',
        best_time: '',
        biggest_problem: '',
        preferred_media: '',
        spirit_animal: '',
        play_style: '',
        motivation_style: '',
        nickname: ''
    });

    const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
    const [showCustomInput, setShowCustomInput] = useState(false);

    const currentQuestion = questions[currentStep];
    const progress = ((currentStep + 1) / questions.length) * 100;

    const handleSelect = (value: string) => {
        if (currentQuestion.type === 'multi') {
            const current = answers[currentQuestion.id] as string[];

            // Toggle logic
            let updated: string[];
            if (current.includes(value)) {
                updated = current.filter(v => v !== value);
            } else {
                updated = [...current, value];
            }

            setAnswers({ ...answers, [currentQuestion.id]: updated });
        } else {
            // Handle 'other' option - show custom input
            if (value === 'other') {
                setShowCustomInput(true);
                // For spirit_animal, we treat it same as learning_goal (single select with custom input)
                setAnswers({ ...answers, [currentQuestion.id]: 'other' });
            } else {
                setShowCustomInput(false);
                setAnswers({ ...answers, [currentQuestion.id]: value });
            }
        }
    };

    const handleTextChange = (value: string) => {
        if (currentQuestion.type === 'text') {
            setAnswers({ ...answers, [currentQuestion.id]: value });
        } else {
            setCustomInputs(prev => ({
                ...prev,
                [currentQuestion.id]: value
            }));
        }
    };

    const canProceed = () => {
        const answer = answers[currentQuestion.id];

        if (currentQuestion.type === 'multi') {
            const list = answer as string[];
            if (list.length === 0) return false;
            // If 'other' is selected, must type something
            if (list.includes('other') && (!customInputs[currentQuestion.id] || customInputs[currentQuestion.id].trim() === '')) return false;
            return true;
        }

        // Single select
        if (answer === 'other') return (customInputs[currentQuestion.id] && customInputs[currentQuestion.id].trim() !== '');
        return answer && answer !== '';
    };

    const handleNext = async () => {
        if (currentStep < questions.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            await submitOnboarding();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const submitOnboarding = async () => {
        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error('ไม่พบข้อมูลผู้ใช้');
                return;
            }

            // Prepare final data
            const finalAnswers = { ...answers };

            // Replace 'other' with custom text for learning_goal
            if (finalAnswers.learning_goal === 'other') {
                finalAnswers.learning_goal = customInputs['learning_goal'] || '';
            }

            // Replace 'other' with custom text for spirit_animal
            if (finalAnswers.spirit_animal === 'other') {
                finalAnswers.spirit_animal = customInputs['spirit_animal'] || '';
            }

            // Replace 'other' with custom text for target_languages
            if (finalAnswers.target_languages.includes('other')) {
                const customLang = customInputs['target_languages'];
                finalAnswers.target_languages = finalAnswers.target_languages
                    .filter(lang => lang !== 'other')
                    .concat(customLang ? customLang.split(',').map(s => s.trim()).filter(s => s !== '') : []);
            }

            const { error } = await supabase
                .from('user_onboarding')
                .insert({
                    user_id: user.id,
                    ...finalAnswers,
                    completed_at: new Date().toISOString()
                });

            if (error) throw error;

            // Update profile with nickname
            if (answers.nickname) {
                await supabase
                    .from('profiles')
                    .update({ display_name: answers.nickname })
                    .eq('id', user.id);
            }

            // Celebrate!
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });

            toast.success('ยินดีต้อนรับ! 🎉');

            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);

        } catch (error) {
            console.error('Onboarding error:', error);
            toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center overflow-hidden">
            {/* Safe Area Padding for iPhone notch */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 pb-8 pt-safe">

                {/* Background Effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-blue-500/20 rounded-full blur-[80px] sm:blur-[100px] animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-pink-500/20 rounded-full blur-[80px] sm:blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-purple-500/10 rounded-full blur-[120px] sm:blur-[150px]" />
                </div>

                {/* Floating Stars - fewer on mobile */}
                {[...Array(typeof window !== 'undefined' && window.innerWidth < 640 ? 10 : 20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        initial={{
                            x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 0,
                            y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : 0,
                            opacity: 0.3
                        }}
                        animate={{
                            y: [null, Math.random() * -100],
                            opacity: [0.3, 0.8, 0.3]
                        }}
                        transition={{
                            duration: 3 + Math.random() * 3,
                            repeat: Infinity,
                            repeatType: 'reverse'
                        }}
                    />
                ))}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-lg relative z-10 flex flex-col max-h-[100dvh] overflow-hidden"
                >
                    {/* Progress Section - Better Design */}
                    <div className="mb-4 sm:mb-6 flex-shrink-0 px-1">
                        {/* Promjum Logo */}
                        <div className="flex justify-center mb-4">
                            <motion.img
                                src="/promjum-logo.png"
                                alt="Promjum"
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl shadow-lg"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200 }}
                                onError={(e) => {
                                    // Fallback to text if image fails
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        </div>

                        {/* Better Progress Bar */}
                        <div className="relative">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-white/80 text-xs sm:text-sm font-semibold">
                                    คำถาม {currentStep + 1}/{questions.length}
                                </span>
                                <motion.span
                                    key={Math.round(progress)}
                                    initial={{ scale: 1.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-white text-xs sm:text-sm font-bold bg-white/20 px-2 py-0.5 rounded-full"
                                >
                                    {Math.round(progress)}%
                                </motion.span>
                            </div>

                            {/* Custom Progress Bar */}
                            <div className="h-2.5 sm:h-3 bg-white/10 rounded-full overflow-hidden shadow-inner">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 rounded-full relative"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                >
                                    {/* Shimmer effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                                </motion.div>
                            </div>
                        </div>

                        {/* Step Dots Indicator */}
                        <div className="flex items-center justify-center gap-1.5 mt-4">
                            {questions.map((_, idx) => (
                                <motion.div
                                    key={idx}
                                    className={`
                                        rounded-full transition-all duration-300
                                        ${idx < currentStep
                                            ? 'w-2 h-2 bg-green-400 shadow-green-400/50 shadow-sm'
                                            : idx === currentStep
                                                ? 'w-3 h-3 bg-white shadow-white/50 shadow-md ring-2 ring-white/30'
                                                : 'w-2 h-2 bg-white/20'
                                        }
                                    `}
                                    animate={idx === currentStep ? { scale: [1, 1.2, 1] } : {}}
                                    transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1 }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Question Card */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 50, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -50, scale: 0.95 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="flex-1 overflow-hidden"
                        >
                            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl overflow-hidden h-full flex flex-col rounded-2xl sm:rounded-3xl">
                                {/* Header - No icon, just title */}
                                <div className="p-4 sm:p-6 pb-3 sm:pb-4 text-center flex-shrink-0">
                                    <h2 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2 leading-tight px-2">
                                        {currentQuestion.title}
                                    </h2>
                                    {currentQuestion.subtitle && (
                                        <p className="text-white/60 text-xs sm:text-sm">
                                            {currentQuestion.subtitle}
                                        </p>
                                    )}
                                </div>

                                {/* Options - Scrollable */}
                                <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 sm:pb-6 overscroll-contain">
                                    {currentQuestion.type === 'text' ? (
                                        <div className="space-y-3">
                                            <Input
                                                value={answers[currentQuestion.id] as string}
                                                onChange={(e) => handleTextChange(e.target.value)}
                                                placeholder={currentQuestion.placeholder}
                                                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 sm:h-14 text-base sm:text-lg rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                maxLength={20}
                                                autoFocus
                                            />
                                            <p className="text-xs text-white/40 text-center">
                                                {(answers[currentQuestion.id] as string)?.length || 0}/20 ตัวอักษร
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className={`
                                                grid gap-2 sm:gap-3
                                                ${currentQuestion.options!.length > 6
                                                    ? 'grid-cols-2 sm:grid-cols-2'
                                                    : currentQuestion.options!.length > 4
                                                        ? 'grid-cols-1 sm:grid-cols-2'
                                                        : 'grid-cols-1'
                                                }
                                            `}>
                                                {currentQuestion.options!.map((option, optIdx) => {
                                                    const isSelected = currentQuestion.type === 'multi'
                                                        ? (answers[currentQuestion.id] as string[]).includes(option.value)
                                                        : answers[currentQuestion.id] === option.value;

                                                    return (
                                                        <motion.button
                                                            key={option.value}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: optIdx * 0.05 }}
                                                            whileHover={{ scale: 1.02, y: -2 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => handleSelect(option.value)}
                                                            className={`
                                                                relative p-3 sm:p-4 rounded-xl sm:rounded-2xl text-left transition-all duration-200
                                                                ${isSelected
                                                                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 border-transparent shadow-lg shadow-purple-500/30 ring-2 ring-white/30'
                                                                    : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 active:bg-white/15'
                                                                }
                                                            `}
                                                        >
                                                            <div className="flex items-center gap-2 sm:gap-3">
                                                                <span className="text-xl sm:text-2xl flex-shrink-0">{option.emoji}</span>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className={`font-semibold text-sm sm:text-base ${isSelected ? 'text-white' : 'text-white/90'}`}>
                                                                        {option.label}
                                                                    </p>
                                                                    {option.description && (
                                                                        <p className={`text-[10px] sm:text-xs mt-0.5 line-clamp-2 ${isSelected ? 'text-white/80' : 'text-white/50'}`}>
                                                                            {option.description}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                {isSelected && (
                                                                    <motion.div
                                                                        initial={{ scale: 0 }}
                                                                        animate={{ scale: 1 }}
                                                                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0"
                                                                    >
                                                                        <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                                                    </motion.div>
                                                                )}
                                                            </div>

                                                            {/* Selection Ripple Effect */}
                                                            {isSelected && (
                                                                <motion.div
                                                                    initial={{ scale: 0, opacity: 0.5 }}
                                                                    animate={{ scale: 2, opacity: 0 }}
                                                                    transition={{ duration: 0.5 }}
                                                                    className="absolute inset-0 bg-white rounded-xl sm:rounded-2xl pointer-events-none"
                                                                />
                                                            )}
                                                        </motion.button>
                                                    );
                                                })}
                                            </div>

                                            {/* Custom Text Input for 'อื่นๆ' (Single Select) */}
                                            {currentQuestion.id === 'learning_goal' && answers.learning_goal === 'other' && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="mt-3"
                                                >
                                                    <div className="p-4 bg-white/10 rounded-xl border border-white/20">
                                                        <p className="text-white/70 text-xs mb-2">โปรดระบุเป้าหมายของคุณ:</p>
                                                        <Input
                                                            value={customInputs['learning_goal'] || ''}
                                                            onChange={(e) => handleTextChange(e.target.value)}
                                                            placeholder="พิมพ์เป้าหมายของคุณ..."
                                                            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 text-base rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                            maxLength={50}
                                                            autoFocus
                                                        />
                                                        <p className="text-xs text-white/40 text-right mt-1">
                                                            {(customInputs['learning_goal'] || '').length}/50
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* Custom Text Input for 'spirit_animal' (Single Select) - reusing customGoalText logic */}
                                            {currentQuestion.id === 'spirit_animal' && answers.spirit_animal === 'other' && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="mt-3"
                                                >
                                                    <div className="p-4 bg-white/10 rounded-xl border border-white/20">
                                                        <p className="text-white/70 text-xs mb-2">โปรดระบุสัตว์เลี้ยงของคุณ:</p>
                                                        <Input
                                                            value={customInputs['spirit_animal'] || ''}
                                                            onChange={(e) => handleTextChange(e.target.value)}
                                                            placeholder="เช่น ยูนิคอร์น, แพนด้า..."
                                                            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 text-base rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                            maxLength={50}
                                                            autoFocus
                                                        />
                                                        <p className="text-xs text-white/40 text-right mt-1">
                                                            {(customInputs['spirit_animal'] || '').length}/50
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* Custom Text Input for 'อื่นๆ' (Multi Select) */}
                                            {currentQuestion.id === 'target_languages' && (answers.target_languages as string[]).includes('other') && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="mt-3"
                                                >
                                                    <div className="p-4 bg-white/10 rounded-xl border border-white/20">
                                                        <p className="text-white/70 text-xs mb-2">โปรดระบุภาษาอื่นๆ:</p>
                                                        <Input
                                                            value={customInputs['target_languages'] || ''}
                                                            onChange={(e) => handleTextChange(e.target.value)}
                                                            placeholder="เช่น ฝรั่งเศส, สเปน..."
                                                            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 text-base rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                            maxLength={50}
                                                            autoFocus
                                                        />
                                                        <p className="text-xs text-white/40 text-right mt-1">
                                                            {(customInputs['target_languages'] || '').length}/50
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="p-4 sm:p-6 pt-3 sm:pt-4 border-t border-white/10 flex gap-2 sm:gap-3 flex-shrink-0 bg-black/10">
                                    {currentStep > 0 && (
                                        <Button
                                            variant="ghost"
                                            onClick={handleBack}
                                            className="text-white/60 hover:text-white hover:bg-white/10 h-10 sm:h-12 px-3 sm:px-4 rounded-xl"
                                        >
                                            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-0.5 sm:mr-1" />
                                            <span className="hidden sm:inline">ย้อนกลับ</span>
                                            <span className="sm:hidden text-sm">กลับ</span>
                                        </Button>
                                    )}
                                    <Button
                                        onClick={handleNext}
                                        disabled={!canProceed() || isSubmitting}
                                        className={`
                                            flex-1 h-10 sm:h-12 rounded-xl font-bold text-sm sm:text-lg
                                            ${canProceed()
                                                ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white shadow-lg shadow-purple-500/30 active:scale-[0.98]'
                                                : 'bg-white/10 text-white/30 cursor-not-allowed'
                                            }
                                            transition-all duration-200
                                        `}
                                    >
                                        {isSubmitting ? (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white/30 border-t-white rounded-full"
                                            />
                                        ) : currentStep === questions.length - 1 ? (
                                            <>
                                                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                                                เริ่มต้นเลย!
                                            </>
                                        ) : (
                                            <>
                                                ถัดไป
                                                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5 sm:ml-1" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}

