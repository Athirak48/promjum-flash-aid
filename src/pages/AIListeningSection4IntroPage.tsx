import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Headphones } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AIListeningSection4IntroPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { language } = useLanguage();

    // Get cards from state if passed from FlashcardsReview
    const state = location.state as {
        cards?: any[];
    } | null;

    return (
        <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
            {/* Header */}
            <header className="border-b bg-card sticky top-0 z-10 flex-none">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/ai-listening-section3-intro')}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                            {language === 'th' ? 'AI Listening' : 'AI Listening'}
                        </h1>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 flex flex-col items-center justify-center w-full">
                <Card className="w-full max-w-2xl p-6 sm:p-12 flex flex-col items-center text-center space-y-6 sm:space-y-10 shadow-2xl border-2 border-primary/10 animate-in fade-in zoom-in duration-500">
                    <div className="relative">
                        <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full" />
                        <div className="relative p-5 sm:p-8 bg-green-50 rounded-full border-4 border-white shadow-lg">
                            <Headphones className="w-12 h-12 sm:w-20 sm:h-20 text-green-600" />
                        </div>
                    </div>

                    <div className="space-y-3 sm:space-y-4 max-w-lg">
                        <div className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-bold tracking-wider uppercase mb-1 sm:mb-2">
                            Section 4
                        </div>
                        <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                            {language === 'th' ? 'AI Listening' : 'AI Listening'}
                        </h2>
                        <p className="text-base sm:text-xl text-muted-foreground leading-relaxed">
                            {language === 'th'
                                ? 'ฝึกการฟังภาษาอังกฤษกับเรื่องสั้นที่ใช้คำศัพท์ของคุณ AI จะอ่านให้คุณฟังอย่างเป็นธรรมชาติ'
                                : 'Practice listening with short stories using your vocabulary. AI will read to you naturally.'}
                        </p>
                    </div>

                    <Button
                        size="lg"
                        className="w-full max-w-xs text-base sm:text-lg h-11 sm:h-14 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 rounded-full bg-green-600 hover:bg-green-700"
                        onClick={() => navigate('/ai-listening-mcq', { state: { cards: state?.cards } })}
                    >
                        {language === 'th' ? 'เริ่มฝึกฟัง' : 'Start Listening'} <ArrowLeft className="ml-2 h-4 w-4 sm:h-5 sm:w-5 rotate-180" />
                    </Button>
                </Card>
            </main>
        </div>
    );
}
