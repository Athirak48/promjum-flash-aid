import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AIReadingSection4IntroPage() {
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
                            onClick={() => navigate('/ai-reading-section3-intro')}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                            {language === 'th' ? 'AI Reading' : 'AI Reading'}
                        </h1>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center">
                <Card className="w-full max-w-2xl p-12 flex flex-col items-center text-center space-y-10 shadow-2xl border-2 border-primary/10 animate-in fade-in zoom-in duration-500">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
                        <div className="relative p-8 bg-blue-50 rounded-full border-4 border-white shadow-lg">
                            <BookOpen className="w-20 h-20 text-blue-600" />
                        </div>
                    </div>

                    <div className="space-y-4 max-w-lg">
                        <div className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-bold tracking-wider uppercase mb-2">
                            Section 4
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                            {language === 'th' ? 'AI Reading' : 'AI Reading'}
                        </h2>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            {language === 'th'
                                ? 'ฝึกทักษะการอ่านกับบทความที่น่าสนใจ และตอบคำถามเพื่อทดสอบความเข้าใจ'
                                : 'Practice reading skills with interesting articles and answer questions to test your comprehension.'}
                        </p>
                    </div>

                    <Button
                        size="lg"
                        className="w-full max-w-xs text-lg h-14 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 rounded-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => navigate('/ai-reading-mcq', { state: { cards: state?.cards } })}
                    >
                        {language === 'th' ? 'เริ่มฝึกอ่าน' : 'Start Reading'} <ArrowLeft className="ml-2 h-5 w-5 rotate-180" />
                    </Button>
                </Card>
            </main>
        </div>
    );
}
