import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Headphones, BookOpen, Mic, PenTool } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AIPracticeLandingPage() {
    const navigate = useNavigate();
    const { language } = useLanguage();

    const practiceOptions = [
        {
            id: 'listening',
            title: language === 'th' ? 'AI Listening' : 'AI Listening',
            description: language === 'th' ? 'ฝึกทักษะการฟังจากเรื่องราวที่น่าสนใจ' : 'Practice listening with engaging stories',
            icon: <Headphones className="w-12 h-12 mb-4" />,
            color: 'text-blue-500',
            borderColor: 'border-blue-200 hover:border-blue-500',
            bgColor: 'bg-blue-50/30',
            bgHover: 'hover:bg-blue-50',
            path: '/ai-listening-guide',
            available: true
        },
        {
            id: 'reading',
            title: language === 'th' ? 'AI Reading' : 'AI Reading',
            description: language === 'th' ? 'ฝึกอ่านบทความและตอบคำถาม' : 'Read articles and answer questions',
            icon: <BookOpen className="w-12 h-12 mb-4" />,
            color: 'text-purple-500',
            borderColor: 'border-purple-200',
            bgColor: 'bg-purple-50/30',
            bgHover: 'hover:bg-purple-50',
            path: '/ai-reading-guide',
            available: true
        },
        {
            id: 'speaking',
            title: language === 'th' ? 'AI Speaking' : 'AI Speaking',
            description: language === 'th' ? 'ฝึกพูดและออกเสียงกับ AI' : 'Practice speaking and pronunciation',
            icon: <Mic className="w-12 h-12 mb-4" />,
            color: 'text-orange-500',
            borderColor: 'border-orange-200',
            bgColor: 'bg-orange-50/30',
            bgHover: '',
            path: '#',
            available: false
        },
        {
            id: 'writing',
            title: language === 'th' ? 'AI Writing' : 'AI Writing',
            description: language === 'th' ? 'ฝึกเขียนเรียงความและบทความ' : 'Write essays and articles',
            icon: <PenTool className="w-12 h-12 mb-4" />,
            color: 'text-green-500',
            borderColor: 'border-green-200',
            bgColor: 'bg-green-50/30',
            bgHover: '',
            path: '#',
            available: false
        }
    ];

    return (
        <div className="min-h-screen bg-[#FDFBF7] relative overflow-hidden font-sans flex flex-col">
            {/* Dotted Grid Background */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(#CBD5E1 1.5px, transparent 1.5px)',
                    backgroundSize: '24px 24px'
                }}
            ></div>

            {/* Decorative Background Blobs */}
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-200/20 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header */}
            <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10 border-slate-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/dashboard')}
                            className="rounded-full hover:bg-slate-100"
                        >
                            <ArrowLeft className="h-5 w-5 text-slate-600" />
                        </Button>
                        <h1 className="text-2xl font-bold text-slate-800">
                            {language === 'th' ? 'ฝึกฝนกับ AI' : 'AI Practice'}
                        </h1>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-12 max-w-7xl relative z-0 flex-1 flex flex-col justify-center">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                    {practiceOptions.map((option) => (
                        <div
                            key={option.id}
                            className={`
                                relative aspect-[4/5] flex flex-col items-center justify-center p-4 sm:p-8
                                ${option.bgColor} border-2 rounded-2xl sm:rounded-3xl transition-all duration-300 cursor-pointer
                                ${option.available
                                    ? `${option.borderColor} ${option.bgHover} shadow-sm hover:shadow-xl hover:-translate-y-2`
                                    : `${option.borderColor} opacity-60 cursor-not-allowed grayscale-[0.5]`
                                }
                            `}
                            onClick={() => {
                                if (option.available) {
                                    navigate(option.path);
                                }
                            }}
                        >
                            <div className={`${option.color} p-3 sm:p-4 bg-white rounded-xl sm:rounded-2xl shadow-sm mb-3 sm:mb-4 transition-transform duration-300 ${option.available ? 'group-hover:scale-110' : ''}`}>
                                {React.cloneElement(option.icon as React.ReactElement, { className: "w-8 h-8 sm:w-12 sm:h-12" })}
                            </div>
                            <h3 className={`text-base sm:text-xl md:text-2xl text-slate-800 text-center font-bold mb-1 sm:mb-2 leading-tight`}>
                                {option.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-500 text-center mb-3 sm:mb-6 px-1 leading-snug">
                                {option.description}
                            </p>

                            {option.available ? (
                                <span className="text-[10px] sm:text-xs font-semibold text-blue-600 bg-blue-100 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full scale-90 sm:scale-100 origin-center">
                                    {language === 'th' ? 'พร้อมใช้งาน' : 'Ready to Start'}
                                </span>
                            ) : (
                                <span className="text-[10px] sm:text-xs font-semibold text-slate-500 bg-slate-200 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full scale-90 sm:scale-100 origin-center">
                                    Coming Soon
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
