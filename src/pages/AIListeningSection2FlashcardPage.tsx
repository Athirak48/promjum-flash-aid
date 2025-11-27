import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Layers } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AIListeningSection2FlashcardPage() {
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
                            onClick={() => navigate('/ai-listening-vocab-selection')}
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
                    <div className="p-6 bg-purple-50 rounded-full">
                        <Layers className="w-16 h-16 text-purple-500" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold">
                            {language === 'th' ? 'Section 2 – ทวนด้วย Flashcard' : 'Section 2 – Review with Flashcard'}
                        </h2>
                        <p className="text-muted-foreground">
                            {language === 'th'
                                ? 'ทบทวนคำศัพท์ที่คุณเลือกด้วยแฟลชการ์ด'
                                : 'Review your selected vocabulary with flashcards'}
                        </p>
                    </div>

                    <Button
                        size="lg"
                        className="w-full text-lg h-12"
                        onClick={() => {
                            console.log('Start Flashcard Session');
                        }}
                    >
                        {language === 'th' ? 'เริ่มทบทวน' : 'Start Review'}
                    </Button>
                </Card>
            </main>
        </div>
    );
}
