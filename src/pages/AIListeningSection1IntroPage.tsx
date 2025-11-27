import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AIListeningSection1IntroPage() {
    const navigate = useNavigate();
    const { language } = useLanguage();

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="border-b bg-card sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/ai-listening-guide')}
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
                <Card className="w-full max-w-md p-12 flex flex-col items-center text-center space-y-8 shadow-xl border-2 border-primary/10">
                    <div className="p-6 bg-blue-50 rounded-full">
                        <BookOpen className="w-16 h-16 text-blue-500" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold">
                            {language === 'th' ? 'Section 1 – เลือกคำศัพท์' : 'Section 1 – Select Vocabulary'}
                        </h2>
                        <p className="text-muted-foreground">
                            {language === 'th'
                                ? 'เริ่มต้นด้วยการเลือกคำศัพท์ที่คุณต้องการฝึกฝน'
                                : 'Start by selecting the vocabulary you want to practice'}
                        </p>
                    </div>

                    <Button
                        size="lg"
                        className="w-full text-lg h-12"
                        onClick={() => navigate('/ai-listening-vocab-selection')}
                    >
                        {language === 'th' ? 'ไปกันต่อ' : 'Continue'}
                    </Button>
                </Card>
            </main>
        </div>
    );
}
