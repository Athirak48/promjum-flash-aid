import { useState, useEffect } from 'react';
import { useSM2Standard } from '@/hooks/useSM2Standard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Brain, Target, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SM2ReviewPage() {
    const { loading, getDueCards, getDifficultCards, getTodayReviewCards } = useSM2Standard();
    const [dueCount, setDueCount] = useState(0);
    const [difficultCount, setDifficultCount] = useState(0);
    const [todayCards, setTodayCards] = useState<any[]>([]);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        const due = await getDueCards();
        const difficult = await getDifficultCards();
        const today = await getTodayReviewCards(20);

        setDueCount(due.length);
        setDifficultCount(difficult.length);
        setTodayCards(today);
    };

    const handleStartReview = () => {
        // Navigate to review session
        console.log('Starting review with', todayCards.length, 'cards');
    };

    if (loading) {
        return (
            <div className="p-6 max-w-4xl mx-auto space-y-6">
                <Skeleton className="h-12 w-64" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">SM-2 Daily Review</h1>
                <p className="text-muted-foreground">
                    Your personalized spaced repetition schedule
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Due Cards */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">Due Today</CardTitle>
                            <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dueCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Cards waiting for review
                        </p>
                    </CardContent>
                </Card>

                {/* Difficult Cards */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">Weak Words</CardTitle>
                            <Brain className="h-4 w-4 text-orange-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{difficultCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Need extra practice
                        </p>
                    </CardContent>
                </Card>

                {/* Today's Session */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">Today's Goal</CardTitle>
                            <Target className="h-4 w-4 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{todayCards.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Recommended cards
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Start Review Button */}
            <Card>
                <CardHeader>
                    <CardTitle>Ready to Review?</CardTitle>
                    <CardDescription>
                        We've selected {todayCards.length} cards for optimal learning today
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        onClick={handleStartReview}
                        disabled={todayCards.length === 0}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Start Review Session
                    </Button>
                </CardContent>
            </Card>

            {/* Card Preview */}
            {todayCards.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Session Preview</CardTitle>
                        <CardDescription>First 5 cards you'll review</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {todayCards.slice(0, 5).map((card, index) => (
                            <div
                                key={card.flashcard_id}
                                className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                            >
                                <div className="flex-1">
                                    <p className="font-medium">{card.flashcard.front_text}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {card.flashcard.back_text}
                                    </p>
                                </div>
                                <Badge variant={card.times_reviewed === 0 ? 'default' : 'secondary'}>
                                    {card.times_reviewed === 0 ? 'New' : `Reviewed ${card.times_reviewed}x`}
                                </Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
