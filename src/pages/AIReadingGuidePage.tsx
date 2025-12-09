import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, BookOpen, Layers, Gamepad2, PenTool, CheckCircle } from 'lucide-react'; // Changed Headphones to PenTool or BookOpen
import { useLanguage } from '@/contexts/LanguageContext';

export default function AIReadingGuidePage() {
    const navigate = useNavigate();
    const { language } = useLanguage();

    const steps = [
        {
            id: 1,
            title: language === 'th' ? 'เลือกคำศัพท์' : 'Select Vocabulary',
            description: language === 'th' ? 'เลือกชุดคำศัพท์ที่ต้องการฝึก' : 'Choose vocabulary set to practice',
            icon: <BookOpen className="w-6 h-6 text-blue-500" />,
            color: 'bg-blue-50 border-blue-100'
        },
        {
            id: 2,
            title: language === 'th' ? 'ทวนด้วย Flashcard' : 'Review with Flashcard',
            description: language === 'th' ? 'ทบทวนคำศัพท์ด้วยแฟลชการ์ด' : 'Review vocabulary with flashcards',
            icon: <Layers className="w-6 h-6 text-purple-500" />,
            color: 'bg-purple-50 border-purple-100'
        },
        {
            id: 3,
            title: language === 'th' ? 'ทวนด้วยเกม' : 'Review with Games',
            description: language === 'th' ? 'เล่นเกมเพื่อทดสอบความจำ' : 'Play games to test memory',
            icon: <Gamepad2 className="w-6 h-6 text-orange-500" />,
            color: 'bg-orange-50 border-orange-100'
        },
        {
            id: 4,
            title: language === 'th' ? 'AI Reading' : 'AI Reading',
            description: language === 'th' ? 'ฝึกการอ่านกับ AI' : 'Practice reading with AI',
            icon: <BookOpen className="w-6 h-6 text-green-500" />,
            color: 'bg-green-50 border-green-100'
        },
        {
            id: 5,
            title: language === 'th' ? 'สรุปผล' : 'Summary',
            description: language === 'th' ? 'ดูสรุปผลการฝึก' : 'View practice summary',
            icon: <CheckCircle className="w-6 h-6 text-pink-500" />,
            color: 'bg-pink-50 border-pink-100'
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
                            {language === 'th' ? 'เส้นทางการฝึก (Training Roadmap)' : 'Training Roadmap'}
                        </h1>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 max-w-3xl">
                <div className="relative space-y-8">
                    {/* Connecting Line */}
                    <div className="absolute left-[27px] top-8 bottom-8 w-0.5 bg-border -z-10" />

                    {steps.map((step, index) => (
                        <div key={step.id} className="relative flex items-start gap-6 group">
                            {/* Step Number/Icon */}
                            <div className={`relative z-10 flex items-center justify-center w-14 h-14 rounded-full border-4 border-background shadow-sm ${step.color} transition-transform group-hover:scale-110`}>
                                {step.icon}
                                <div className="absolute -right-1 -top-1 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {step.id}
                                </div>
                            </div>

                            {/* Content Card */}
                            <Card className="flex-1 p-5 hover:shadow-md transition-all duration-300 border-l-4 border-l-primary/20 hover:border-l-primary">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">{step.title}</h3>
                                        <p className="text-sm text-muted-foreground">{step.description}</p>
                                    </div>
                                    {index === 0 && (
                                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full animate-pulse">
                                            {language === 'th' ? 'เริ่มที่นี่' : 'Start Here'}
                                        </span>
                                    )}
                                </div>
                            </Card>
                        </div>
                    ))}
                </div>

                {/* Footer Action */}
                <div className="mt-12 flex justify-center">
                    <Button
                        size="lg"
                        className="w-full sm:w-auto min-w-[200px] text-lg h-12 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                        onClick={() => {
                            navigate('/ai-reading-section1-intro');
                        }}
                    >
                        {language === 'th' ? 'เริ่มการฝึกฝน' : 'Start Training'} <ArrowLeft className="ml-2 h-5 w-5 rotate-180" />
                    </Button>
                </div>
            </main>
        </div>
    );
}
