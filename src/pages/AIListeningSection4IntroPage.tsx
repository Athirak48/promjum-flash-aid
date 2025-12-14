import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Headphones, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

export default function AIListeningSection4IntroPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { language } = useLanguage();

    const state = location.state as {
        cards?: any[];
    } | null;

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col">

            {/* Header */}
            <header className="px-4 py-4 flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/ai-listening-section3-intro')}
                    className="rounded-full bg-white shadow-sm border border-slate-100 h-10 w-10"
                >
                    <ArrowLeft className="h-5 w-5 text-slate-600" />
                </Button>
                <span className="text-xl">🎧</span>
                <span className="font-bold text-slate-700">AI Listening</span>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md text-center"
                >
                    {/* Step Indicator */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 font-bold flex items-center justify-center text-sm">✓</div>
                        <div className="w-8 h-1 bg-green-200 rounded-full"></div>
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 font-bold flex items-center justify-center text-sm">✓</div>
                        <div className="w-8 h-1 bg-green-200 rounded-full"></div>
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 font-bold flex items-center justify-center text-sm">✓</div>
                        <div className="w-8 h-1 bg-emerald-200 rounded-full"></div>
                        <div className="w-10 h-10 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-lg shadow-lg shadow-emerald-200">
                            4
                        </div>
                    </div>

                    {/* Icon */}
                    <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="inline-block mb-6"
                    >
                        <div className="w-28 h-28 bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl flex items-center justify-center shadow-xl shadow-green-200/50 mx-auto">
                            <Headphones className="w-14 h-14 text-white" />
                        </div>
                    </motion.div>

                    {/* Title */}
                    <h1 className="text-3xl font-black text-slate-800 mb-3">
                        {language === 'th' ? 'ฝึกฟัง AI' : 'AI Listening'}
                    </h1>

                    {/* Description */}
                    <p className="text-slate-500 text-lg leading-relaxed mb-10 px-4">
                        {language === 'th'
                            ? 'ฟังเรื่องสั้นจาก AI แล้วตอบคำถาม'
                            : 'Listen to AI stories and answer questions'}
                    </p>

                    {/* CTA Button */}
                    <Button
                        size="lg"
                        className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-200/50"
                        onClick={() => navigate('/ai-listening-mcq', { state: { cards: state?.cards } })}
                    >
                        {language === 'th' ? 'เริ่มฝึกฟัง' : 'Start Listening'}
                        <ChevronRight className="ml-2 w-5 h-5" />
                    </Button>
                </motion.div>
            </main>
        </div>
    );
}
