import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, RotateCcw, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ReviewResult {
    word: string;
    meaning: string;
    remembered: boolean;
    attemptCount: number;
    missCount: number;
}

export default function AIListeningFlashcardSummaryPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { language } = useLanguage();

    const results: ReviewResult[] = location.state?.results || [];
    const totalCards = location.state?.totalCards || 10;

    // Sort: forgotten first (by missCount descending), then remembered
    const sortedResults = [...results].sort((a, b) => {
        if (a.missCount !== b.missCount) {
            return b.missCount - a.missCount;
        }
        return a.remembered ? 1 : -1;
    });

    const forgottenWords = sortedResults.filter(r => r.missCount > 0);
    const rememberedWords = sortedResults.filter(r => r.missCount === 0);

    const handleRetry = () => {
        navigate('/ai-listening-flashcard-play', {
            state: { selectedVocab: results.map(r => ({ id: r.word, word: r.word, meaning: r.meaning })) }
        });
    };

    const selectedVocab = location.state?.selectedVocab || [];

    const handleContinue = () => {
        navigate('/ai-listening-section3-intro', {
            state: { selectedVocab }
        });
    };

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
                        <h1 className="text-xl font-bold text-muted-foreground">
                            {language === 'th' ? 'สรุปผล Flashcard' : 'Flashcard Summary'}
                        </h1>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
                <div className="space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-6">
                        <Card className="p-4 sm:p-8 text-center bg-gradient-to-br from-emerald-50 via-emerald-50/50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/10 border-emerald-100/50 dark:border-emerald-900/50 shadow-lg shadow-emerald-100/50 dark:shadow-none hover:shadow-xl hover:shadow-emerald-100/60 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="w-12 h-12 sm:w-20 sm:h-20 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4 shadow-inner">
                                <CheckCircle className="w-6 h-6 sm:w-10 sm:h-10 text-emerald-600" />
                            </div>
                            <p className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 mb-0 sm:mb-1">{rememberedWords.length}</p>
                            <p className="text-[10px] sm:text-sm font-bold text-emerald-600/70 dark:text-emerald-400/80 uppercase tracking-wider">
                                {language === 'th' ? 'จำได้ทันที' : 'Remembered'}
                            </p>
                        </Card>
                        <Card className="p-4 sm:p-8 text-center bg-gradient-to-br from-rose-50 via-rose-50/50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/10 border-rose-100/50 dark:border-rose-900/50 shadow-lg shadow-rose-100/50 dark:shadow-none hover:shadow-xl hover:shadow-rose-100/60 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="w-12 h-12 sm:w-20 sm:h-20 bg-rose-100 dark:bg-rose-900/50 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4 shadow-inner">
                                <XCircle className="w-6 h-6 sm:w-10 sm:h-10 text-rose-600" />
                            </div>
                            <p className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600 dark:from-rose-400 dark:to-pink-400 mb-0 sm:mb-1">{forgottenWords.length}</p>
                            <p className="text-[10px] sm:text-sm font-bold text-rose-600/70 dark:text-rose-400/80 uppercase tracking-wider">
                                {language === 'th' ? 'ต้องทบทวน' : 'Needs Review'}
                            </p>
                        </Card>
                    </div>

                    {/* Words that needed review */}
                    {forgottenWords.length > 0 && (
                        <div className="space-y-3 sm:space-y-4">
                            <h3 className="font-bold flex items-center gap-2 text-rose-600 text-sm sm:text-lg">
                                <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                {language === 'th' ? 'คำที่ต้องทบทวนเพิ่ม' : 'Words to Review'}
                            </h3>
                            <div className="grid gap-2 sm:gap-3">
                                {forgottenWords.map((result, index) => (
                                    <div key={index} className="flex justify-between items-center p-3 sm:p-5 bg-white rounded-xl shadow-sm border border-rose-100 hover:shadow-md hover:border-rose-200 transition-all">
                                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-3">
                                            <span className="text-sm sm:text-lg font-bold text-slate-800">{result.word}</span>
                                            <span className="text-xs sm:text-base text-slate-500">{result.meaning}</span>
                                        </div>
                                        <span className="text-[10px] sm:text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/30 px-2 py-1 sm:px-3 sm:py-1 rounded-full border border-rose-100">
                                            {result.missCount} {language === 'th' ? 'ครั้ง' : 'times'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Words remembered */}
                    {rememberedWords.length > 0 && (
                        <div className="space-y-3 sm:space-y-4">
                            <h3 className="font-bold flex items-center gap-2 text-emerald-600 text-sm sm:text-lg">
                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                {language === 'th' ? 'คำที่จำได้ทันที' : 'Words Remembered'}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {rememberedWords.map((result, index) => (
                                    <span key={index} className="px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-50 hover:bg-emerald-100 transition-colors text-emerald-700 border border-emerald-200/50 rounded-full text-xs sm:text-sm font-medium shadow-sm">
                                        {result.word}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-row gap-3 pt-4 pb-8 sm:gap-4 sm:pt-8 sm:pb-12">
                        <Button
                            variant="outline"
                            size="lg"
                            className="flex-1 h-12 sm:h-14 text-sm sm:text-base rounded-2xl border-2 hover:bg-slate-50 hover:text-slate-900"
                            onClick={handleRetry}
                        >
                            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                            {language === 'th' ? 'ทบทวนอีกครั้ง' : 'Review Again'}
                        </Button>
                        <Button
                            size="lg"
                            className="flex-1 h-12 sm:h-14 text-sm sm:text-base rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-lg hover:shadow-rose-200 hover:-translate-y-0.5 transition-all duration-300"
                            onClick={handleContinue}
                        >
                            {language === 'th' ? 'ไปกันต่อ' : 'Continue'}
                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
