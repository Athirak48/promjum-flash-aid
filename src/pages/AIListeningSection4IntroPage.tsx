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
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="border-b bg-card sticky top-0 z-10">
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
            <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center">
                <Card className="w-full max-w-2xl p-12 flex flex-col items-center text-center space-y-10 shadow-2xl border-2 border-primary/10 animate-in fade-in zoom-in duration-500">
                    <div className="relative">
                        <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full" />
                        <div className="relative p-8 bg-green-50 rounded-full border-4 border-white shadow-lg">
                            <Headphones className="w-20 h-20 text-green-600" />
                        </div>
                    </div>

                    <div className="space-y-4 max-w-lg">
                        <div className="inline-block px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-bold tracking-wider uppercase mb-2">
                            Section 4
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                            {language === 'th' ? 'AI Listening' : 'AI Listening'}
                        </h2>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            {language === 'th'
                                ? 'ฝึกการฟังภาษาอังกฤษกับเรื่องสั้นที่ใช้คำศัพท์ของคุณ AI จะอ่านให้คุณฟังอย่างเป็นธรรมชาติ'
                                : 'Practice listening with short stories using your vocabulary. AI will read to you naturally.'}
                        </p>
                    </div>

                    <Button
                        size="lg"
                        className="w-full max-w-xs text-lg h-14 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 rounded-full bg-green-600 hover:bg-green-700"
                        onClick={() => navigate('/ai-listening-mcq', { state: { cards: state?.cards } })}
                    >
                        {language === 'th' ? 'เริ่มฝึกฟัง' : 'Start Listening'} <ArrowLeft className="ml-2 h-5 w-5 rotate-180" />
                    </Button>
                </Card>
            </main>
        </div>
    );
}
