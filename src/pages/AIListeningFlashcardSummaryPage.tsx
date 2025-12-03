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
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-6">
                        <Card className="p-8 text-center bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50 shadow-sm">
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-emerald-600" />
                            </div>
                            <p className="text-4xl font-bold text-emerald-700 dark:text-emerald-400 mb-1">{rememberedWords.length}</p>
                            <p className="text-sm font-medium text-emerald-600/80 dark:text-emerald-400/80 uppercase tracking-wide">
                                {language === 'th' ? 'จำได้ทันที' : 'Remembered'}
                            </p>
                        </Card>
                        <Card className="p-8 text-center bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/50 shadow-sm">
                            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <XCircle className="w-8 h-8 text-rose-600" />
                            </div>
                            <p className="text-4xl font-bold text-rose-700 dark:text-rose-400 mb-1">{forgottenWords.length}</p>
                            <p className="text-sm font-medium text-rose-600/80 dark:text-rose-400/80 uppercase tracking-wide">
                                {language === 'th' ? 'ต้องทบทวน' : 'Needs Review'}
                            </p>
                        </Card>
                    </div>

                    {/* Words that needed review */}
                    {forgottenWords.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="font-semibold flex items-center gap-2 text-rose-600">
                                <XCircle className="w-5 h-5" />
                                {language === 'th' ? 'คำที่ต้องทบทวนเพิ่ม' : 'Words to Review'}
                            </h3>
                            <div className="grid gap-3">
                                {forgottenWords.map((result, index) => (
                                    <Card key={index} className="flex justify-between items-center p-4 hover:shadow-md transition-shadow border-l-4 border-l-rose-500">
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-lg font-bold">{result.word}</span>
                                            <span className="text-muted-foreground">{result.meaning}</span>
                                        </div>
                                        <span className="text-xs font-medium text-rose-600 bg-rose-50 dark:bg-rose-900/30 px-3 py-1 rounded-full">
                                            {result.missCount} {language === 'th' ? 'ครั้ง' : 'times'}
                                        </span>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Words remembered */}
                    {rememberedWords.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="font-semibold flex items-center gap-2 text-emerald-600">
                                <CheckCircle className="w-5 h-5" />
                                {language === 'th' ? 'คำที่จำได้ทันที' : 'Words Remembered'}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {rememberedWords.map((result, index) => (
                                    <span key={index} className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 rounded-full text-sm font-medium">
                                        {result.word}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-8 pb-12">
                        <Button
                            variant="outline"
                            size="lg"
                            className="flex-1 h-14 text-base"
                            onClick={handleRetry}
                        >
                            <RotateCcw className="w-5 h-5 mr-2" />
                            {language === 'th' ? 'ทบทวนอีกครั้ง' : 'Review Again'}
                        </Button>
                        <Button
                            size="lg"
                            className="flex-1 h-14 text-base shadow-lg hover:shadow-xl transition-all"
                            onClick={handleContinue}
                        >
                            {language === 'th' ? 'ไปกันต่อ' : 'Continue'}
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
