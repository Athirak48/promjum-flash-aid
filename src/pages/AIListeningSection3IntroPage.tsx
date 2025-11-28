import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Gamepad2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AIListeningSection3IntroPage() {
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
                            onClick={() => navigate('/ai-listening-flashcard-summary')}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                            AI Listening
                        </h1>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center">
                <Card className="w-full max-w-md p-12 flex flex-col items-center text-center space-y-8 shadow-xl border-2 border-primary/10">
                    <div className="p-6 bg-orange-50 dark:bg-orange-950/30 rounded-full">
                        <Gamepad2 className="w-16 h-16 text-orange-500" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold">
                            {language === 'th' ? 'Section 3 – ทวนด้วย Game' : 'Section 3 – Review with Games'}
                        </h2>
                        <p className="text-muted-foreground">
                            {language === 'th'
                                ? 'เล่นเกมสนุกๆ เพื่อทดสอบความจำของคุณ'
                                : 'Play fun games to test your memory'}
                        </p>
                    </div>

                    <Button
                        size="lg"
                        className="w-full text-lg h-12"
                        onClick={() => navigate('/ai-listening-game-selection')}
                    >
                        {language === 'th' ? 'ไปกันต่อ' : 'Continue'}
                    </Button>
                </Card>
            </main>
        </div>
    );
}
