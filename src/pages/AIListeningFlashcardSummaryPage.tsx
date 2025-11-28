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
}

export default function AIListeningFlashcardSummaryPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { language } = useLanguage();

    const results: ReviewResult[] = location.state?.results || [];
    const totalCards = location.state?.totalCards || 10;

    // Sort: forgotten first, then remembered
    const sortedResults = [...results].sort((a, b) => {
        if (a.remembered === b.remembered) {
            return b.attemptCount - a.attemptCount;
        }
        return a.remembered ? 1 : -1;
    });

    const forgottenWords = sortedResults.filter(r => !r.remembered || r.attemptCount > 1);
    const rememberedWords = sortedResults.filter(r => r.remembered && r.attemptCount === 1);

    const handleRetry = () => {
        navigate('/ai-listening-flashcard-play', {
            state: { selectedVocab: results.map(r => ({ id: r.word, word: r.word, meaning: r.meaning })) }
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
                            onClick={() => navigate('/ai-listening-section2-flashcard')}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                            {language === 'th' ? 'สรุปผล Flashcard' : 'Flashcard Summary'}
                        </h1>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="p-6 text-center bg-green-50 dark:bg-green-950/30">
                            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                            <p className="text-3xl font-bold text-green-600">{rememberedWords.length}</p>
                            <p className="text-sm text-muted-foreground">
                                {language === 'th' ? 'จำได้ทันที' : 'Remembered'}
                            </p>
                        </Card>
                        <Card className="p-6 text-center bg-red-50 dark:bg-red-950/30">
                            <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                            <p className="text-3xl font-bold text-red-600">{forgottenWords.length}</p>
                            <p className="text-sm text-muted-foreground">
                                {language === 'th' ? 'จำไม่ได้ครั้งแรก' : 'Needed Review'}
                            </p>
                        </Card>
                    </div>

                    {/* Words that needed review */}
                    {forgottenWords.length > 0 && (
                        <Card className="p-6">
                            <h3 className="font-semibold mb-4 flex items-center gap-2 text-red-600">
                                <XCircle className="w-5 h-5" />
                                {language === 'th' ? 'คำที่ต้องทบทวนเพิ่ม' : 'Words to Review'}
                            </h3>
                            <div className="space-y-2">
                                {forgottenWords.map((result, index) => (
                                    <div key={index} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                                        <div>
                                            <span className="font-medium">{result.word}</span>
                                            <span className="text-muted-foreground mx-2">-</span>
                                            <span className="text-muted-foreground">{result.meaning}</span>
                                        </div>
                                        <span className="text-xs text-red-600 bg-red-100 dark:bg-red-900/50 px-2 py-1 rounded">
                                            {result.attemptCount} {language === 'th' ? 'ครั้ง' : 'tries'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Words remembered */}
                    {rememberedWords.length > 0 && (
                        <Card className="p-6">
                            <h3 className="font-semibold mb-4 flex items-center gap-2 text-green-600">
                                <CheckCircle className="w-5 h-5" />
                                {language === 'th' ? 'คำที่จำได้ทันที' : 'Words Remembered'}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {rememberedWords.map((result, index) => (
                                    <span key={index} className="px-3 py-1 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 rounded-full text-sm">
                                        {result.word}
                                    </span>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button
                            variant="outline"
                            size="lg"
                            className="flex-1"
                            onClick={handleRetry}
                        >
                            <RotateCcw className="w-5 h-5 mr-2" />
                            {language === 'th' ? 'ทบทวนอีกครั้ง' : 'Review Again'}
                        </Button>
                        <Button
                            size="lg"
                            className="flex-1"
                            onClick={() => navigate('/ai-listening-section3-intro')}
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
