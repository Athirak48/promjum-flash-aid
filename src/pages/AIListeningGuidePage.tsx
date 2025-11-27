import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, BookOpen, Layers, Gamepad2, Headphones, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AIListeningGuidePage() {
    const navigate = useNavigate();
    const { language } = useLanguage();

    const steps = [
        {
            id: 1,
            title: language === 'th' ? 'เลือกคำศัพท์' : 'Select Vocabulary',
            description: language === 'th' ? 'เลือกชุดคำศัพท์ที่ต้องการฝึก' : 'Choose vocabulary set to practice',
            icon: <BookOpen className="w-6 h-6 text-blue-500" />,
            color: 'bg-blue-50'
        },
        {
            id: 2,
            title: language === 'th' ? 'ทวนด้วย Flashcard' : 'Review with Flashcard',
            description: language === 'th' ? 'ทบทวนคำศัพท์ด้วยแฟลชการ์ด' : 'Review vocabulary with flashcards',
            icon: <Layers className="w-6 h-6 text-purple-500" />,
            color: 'bg-purple-50'
        },
        {
            id: 3,
            title: language === 'th' ? 'ทวนด้วยเกม' : 'Review with Games',
            description: language === 'th' ? 'เล่นเกมเพื่อทดสอบความจำ' : 'Play games to test memory',
            icon: <Gamepad2 className="w-6 h-6 text-orange-500" />,
            color: 'bg-orange-50'
        },
        {
            id: 4,
            title: language === 'th' ? 'AI Listening' : 'AI Listening',
            description: language === 'th' ? 'ฝึกการฟังกับ AI' : 'Practice listening with AI',
            icon: <Headphones className="w-6 h-6 text-green-500" />,
            color: 'bg-green-50'
        },
        {
            id: 5,
            title: language === 'th' ? 'สรุปผล' : 'Summary',
            description: language === 'th' ? 'ดูสรุปผลการฝึก' : 'View practice summary',
            icon: <CheckCircle className="w-6 h-6 text-pink-500" />,
            color: 'bg-pink-50'
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/practice')}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                            {language === 'th' ? 'วิธีฝึก AI Listening' : 'AI Listening Guide'}
                        </h1>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 max-w-3xl">
                <div className="space-y-6">
                    {steps.map((step) => (
                        <Card key={step.id} className="p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl ${step.color}`}>
                                    {step.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                                            Step {step.id}
                                        </span>
                                        <h3 className="font-semibold text-lg">{step.title}</h3>
                                    </div>
                                    <p className="text-muted-foreground">{step.description}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Footer Action */}
                <div className="mt-8 flex justify-end">
                    <Button
                        size="lg"
                        className="w-full sm:w-auto"
                        onClick={() => {
                            navigate('/ai-listening-section1-intro');
                        }}
                    >
                        {language === 'th' ? 'ถัดไป' : 'Next'} &gt;
                    </Button>
                </div>
            </main>
        </div>
    );
}
