import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Headphones, BookOpen, Sparkles, Star, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

export default function AIPracticeLandingPage() {
    const navigate = useNavigate();
    const { language } = useLanguage();

    const practiceOptions = [
        {
            id: 'listening',
            title: 'Listening Mode',
            subtitle: language === 'th' ? 'ฝึกฟัง' : 'Practice Listening',
            description: language === 'th' ? 'ฝึกทักษะการฟังจากเรื่องราวที่น่าสนใจ' : 'Practice listening with engaging stories',
            icon: <Headphones className="w-8 h-8" />,
            gradient: 'from-sky-400 via-blue-500 to-indigo-500',
            lightGradient: 'from-sky-50 to-blue-50',
            accentColor: 'sky',
            path: '/ai-listening-guide',
            available: true,
            emoji: '🎧',
            mascot: '🦋'
        },
        {
            id: 'reading',
            title: 'Story Mode',
            subtitle: language === 'th' ? 'อ่านเรื่อง' : 'Read Stories',
            description: language === 'th' ? 'ฝึกอ่านบทความและตอบคำถาม' : 'Read articles and answer questions',
            icon: <BookOpen className="w-8 h-8" />,
            gradient: 'from-pink-400 via-rose-500 to-red-500',
            lightGradient: 'from-pink-50 to-rose-50',
            accentColor: 'pink',
            path: '/ai-reading-guide',
            available: true,
            emoji: '📖',
            mascot: '🌸'
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 relative overflow-hidden font-sans">

            {/* Animated Background Decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Gradient Orbs */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-sky-200/40 to-blue-300/20 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
                    transition={{ duration: 10, repeat: Infinity, delay: 2 }}
                    className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-pink-200/40 to-rose-300/20 rounded-full blur-3xl"
                />

                {/* Floating Stars */}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [0, -20, 0],
                            rotate: [0, 360],
                            opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{
                            duration: 4 + i,
                            repeat: Infinity,
                            delay: i * 0.5
                        }}
                        className="absolute text-yellow-400/60"
                        style={{
                            top: `${15 + i * 12}%`,
                            left: `${10 + i * 15}%`,
                            fontSize: `${12 + i * 4}px`
                        }}
                    >
                        ✦
                    </motion.div>
                ))}
            </div>

            {/* Header */}
            <header className="relative z-20 px-4 sm:px-6 py-4 sm:py-6">
                <div className="flex items-center gap-3 max-w-6xl mx-auto">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/dashboard')}
                        className="rounded-2xl bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm border border-slate-100 transition-all hover:scale-105 h-11 w-11"
                    >
                        <ArrowLeft className="h-5 w-5 text-slate-600" />
                    </Button>
                    <div className="flex items-center gap-2">
                        <motion.span
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-2xl sm:text-3xl"
                        >
                            🤖
                        </motion.span>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500">
                                Practice Juuu
                            </h1>
                            <p className="text-xs text-slate-400 font-medium hidden sm:block">
                                {language === 'th' ? 'เลือกโหมดที่คุณต้องการฝึก' : 'Choose your practice mode'}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 relative z-10 py-8 sm:py-12">

                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10 sm:mb-14"
                >
                    <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 px-5 py-2.5 rounded-full mb-4 border border-purple-200/50"
                    >
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-bold text-purple-600">
                            {language === 'th' ? 'เลือกโหมดฝึกซ้อม' : 'Select Practice Mode'}
                        </span>
                        <Sparkles className="w-4 h-4 text-pink-500" />
                    </motion.div>
                    <h2 className="text-2xl sm:text-4xl font-black text-slate-800 mb-3">
                        {language === 'th' ? 'วันนี้อยากฝึกอะไร?' : 'What would you like to practice?'}
                    </h2>
                    <p className="text-slate-500 max-w-md mx-auto">
                        {language === 'th'
                            ? 'เลือกโหมดที่เหมาะกับคุณ แล้วเริ่มฝึกได้เลย!'
                            : 'Pick the mode that suits you and start practicing!'}
                    </p>
                </motion.div>

                {/* Cards Grid */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-10 max-w-4xl mx-auto">
                    {practiceOptions.map((option, index) => (
                        <motion.div
                            key={option.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.15 }}
                            whileHover={{ y: -12, scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => option.available && navigate(option.path)}
                            className="relative w-full sm:w-[340px] cursor-pointer group"
                        >
                            {/* Card */}
                            <div className={`
                                relative bg-white/90 backdrop-blur-xl
                                border-2 border-${option.accentColor}-100 hover:border-${option.accentColor}-300
                                rounded-[2rem] p-6 sm:p-8
                                shadow-xl shadow-${option.accentColor}-100/30
                                transition-all duration-500
                                overflow-hidden
                            `}>
                                {/* Inner Gradient Blob */}
                                <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${option.lightGradient} rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-80`} />

                                {/* Floating Mascot */}
                                <motion.div
                                    animate={{ y: [0, -6, 0], rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="absolute top-3 right-3 text-3xl z-20"
                                >
                                    {option.mascot}
                                </motion.div>

                                {/* Icon Container */}
                                <div className="relative z-10 mb-5">
                                    <motion.div
                                        animate={{ rotate: [0, 5, -5, 0] }}
                                        transition={{ duration: 6, repeat: Infinity }}
                                        className={`
                                            w-20 h-20 rounded-[1.5rem]
                                            bg-gradient-to-br ${option.gradient}
                                            flex items-center justify-center
                                            text-white shadow-lg shadow-${option.accentColor}-200/50
                                            group-hover:shadow-xl group-hover:shadow-${option.accentColor}-300/50
                                            transition-all duration-300
                                        `}
                                    >
                                        {option.icon}
                                    </motion.div>

                                    {/* Floating Emoji Badge */}
                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className={`
                                            absolute -top-2 -right-2 w-10 h-10 
                                            bg-white rounded-xl shadow-lg border-2 border-${option.accentColor}-100
                                            flex items-center justify-center text-xl
                                        `}
                                    >
                                        {option.emoji}
                                    </motion.div>
                                </div>

                                {/* Content */}
                                <div className="relative z-10">
                                    <p className={`text-xs font-bold uppercase tracking-wider text-${option.accentColor}-400 mb-1`}>
                                        {option.subtitle}
                                    </p>
                                    <h3 className={`text-2xl sm:text-3xl font-black mb-2 bg-gradient-to-r ${option.gradient} bg-clip-text text-transparent`}>
                                        {option.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm leading-relaxed mb-6">
                                        {option.description}
                                    </p>

                                    {/* CTA Button */}
                                    <motion.div
                                        whileHover={{ x: 5 }}
                                        className={`
                                            w-full py-3.5 rounded-xl font-bold text-white
                                            bg-gradient-to-r ${option.gradient}
                                            flex items-center justify-center gap-2
                                            shadow-md shadow-${option.accentColor}-200/50
                                            group-hover:shadow-lg transition-all duration-300
                                        `}
                                    >
                                        <span>{language === 'th' ? 'เริ่มเลย!' : 'Start Now!'}</span>
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Decoration */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center mt-12 sm:mt-16"
                >
                    <div className="inline-flex items-center gap-3 text-slate-400 text-sm">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span>{language === 'th' ? 'เลือกโหมดแล้วเริ่มฝึกได้เลย!' : 'Pick a mode and start practicing!'}</span>
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
