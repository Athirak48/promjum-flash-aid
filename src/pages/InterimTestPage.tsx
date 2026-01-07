import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import InterimTestComponent from '@/components/assessment/InterimTestComponent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, CheckCircle2, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface InterimTestQuestion {
    id: string;
    front_text: string;
    back_text: string;
    options: string[];
    correctAnswer: string;
    isWeak: boolean;
}

export default function InterimTestPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState<InterimTestQuestion[]>([]);
    const [testStarted, setTestStarted] = useState(false);

    const goalId = location.state?.goalId;
    const deckIds = location.state?.deckIds || [];
    const testNumber = location.state?.testNumber || 1;
    const currentDay = location.state?.currentDay || 1;

    useEffect(() => {
        if (!goalId || deckIds.length === 0) {
            toast({
                title: 'Error',
                description: 'Missing test information',
                variant: 'destructive'
            });
            navigate('/dashboard');
            return;
        }

        const checkCompletionAndLoad = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // @ts-ignore
            const { data } = await supabase.from('goal_assessments')
                .select('id')
                .eq('goal_id', goalId)
                .eq('assessment_type', 'interim');

            if (data && data.length > 0) {
                toast({
                    title: 'Test Completed',
                    description: 'คุณทำแบบทดสอบระหว่างภาค (Interim) สำหรับเป้าหมายนี้ไปแล้ว',
                    variant: 'default'
                });
                navigate('/dashboard');
            } else {
                loadQuestions();
            }
        };

        checkCompletionAndLoad();
    }, []);

    const loadQuestions = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get flashcard progress to categorize weak vs mastered
            const { data: progressData, error: progressError } = await supabase
                .from('user_flashcard_progress')
                .select('*, flashcard:user_flashcards(id, front_text, back_text)')
                .eq('user_id', user.id)
                .in('flashcard_id', deckIds);

            if (progressError) throw progressError;

            // Categorize cards
            const weakCards = (progressData || []).filter(p =>
                p.srs_score < 5 || p.srs_level < 3
            );

            const masteredCards = (progressData || []).filter(p =>
                p.srs_score >= 5 && p.srs_level >= 3
            );

            // Select 40 questions: 60% weak, 40% mastered
            const weakCount = Math.min(Math.floor(40 * 0.6), weakCards.length);
            const masteredCount = Math.min(40 - weakCount, masteredCards.length);

            const selectedWeak = weakCards
                .sort(() => 0.5 - Math.random())
                .slice(0, weakCount);

            const selectedMastered = masteredCards
                .sort(() => 0.5 - Math.random())
                .slice(0, masteredCount);

            const allSelectedCards = [...selectedWeak, ...selectedMastered];

            // Use progressData as the pool for distractors
            // Note: progressData contains all cards user has studied (or initialized for this deck)
            const pool = progressData || [];

            // Generate quiz questions
            const quizQuestions: InterimTestQuestion[] = allSelectedCards.map(card => {
                const flashcard = card.flashcard as any;
                const isWeak = weakCards.some(w => w.flashcard_id === card.flashcard_id);

                // Optimized: Get 3 distinct wrong answers using random indices from POOL
                const wrongOptions: string[] = [];
                const maxAttempts = 20;
                let attempts = 0;

                while (wrongOptions.length < 3 && attempts < maxAttempts) {
                    const randomIndex = Math.floor(Math.random() * pool.length);
                    const randomCard = pool[randomIndex].flashcard as any;

                    if (randomCard.id !== card.flashcard_id && !wrongOptions.includes(randomCard.back_text)) {
                        wrongOptions.push(randomCard.back_text);
                    }
                    attempts++;
                }

                // Fallback
                if (wrongOptions.length < 3 && pool.length > 3) {
                    const candidates = pool
                        .filter(c => c.flashcard_id !== card.flashcard_id && !wrongOptions.includes((c.flashcard as any).back_text))
                        .slice(0, 3 - wrongOptions.length)
                        .map(c => (c.flashcard as any).back_text);
                    wrongOptions.push(...candidates);
                }

                const allOptions = [flashcard.back_text, ...wrongOptions]
                    .sort(() => 0.5 - Math.random());

                return {
                    id: card.flashcard_id,
                    front_text: flashcard.front_text,
                    back_text: flashcard.back_text,
                    options: allOptions,
                    correctAnswer: flashcard.back_text,
                    isWeak
                };
            });

            // Shuffle questions
            setQuestions(quizQuestions.sort(() => 0.5 - Math.random()));
        } catch (error: any) {
            console.error('Error loading questions:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to load questions',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleTestComplete = async (results: {
        correct: number;
        total: number;
        leechIds: string[];
        bonusIds: string[];
    }) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Apply Leech Detection (Reset wrong answers to Stage 0)
            if (results.leechIds.length > 0) {
                const leechUpdates = results.leechIds.map(id => ({
                    user_id: user.id,
                    flashcard_id: id,
                    times_reviewed: 0,
                    srs_level: 0, // Hard Reset
                    srs_score: 0,
                    easiness_factor: 2.5,
                    interval_days: 0,
                    next_review_date: new Date().toISOString().split('T')[0],
                    updated_at: new Date().toISOString()
                }));

                const { error: leechError } = await supabase
                    .from('user_flashcard_progress')
                    .upsert(leechUpdates);

                if (leechError) console.error('Error applying leech detection:', leechError);
            }

            // Apply Bonus Scoring (Increase SRS score for correct answers)
            if (results.bonusIds.length > 0) {
                for (const cardId of results.bonusIds) {
                    const { data: current } = await supabase
                        .from('user_flashcard_progress')
                        .select('*')
                        .eq('user_id', user.id)
                        .eq('flashcard_id', cardId)
                        .single();

                    if (current) {
                        const bonusScore = Math.min(current.srs_score + 2, 15); // +2 bonus, max 15
                        const bonusLevel = Math.min(current.srs_level + 1, 10); // +1 level, max 10

                        await supabase
                            .from('user_flashcard_progress')
                            .update({
                                srs_score: bonusScore,
                                srs_level: bonusLevel,
                                updated_at: new Date().toISOString()
                            })
                            .eq('user_id', user.id)
                            .eq('flashcard_id', cardId);
                    }
                }
            }

            // Show toast notification
            toast({
                title: 'Test Complete!',
                description: `${results.correct}/${results.total} correct. ${results.leechIds.length} leeches detected.`,
                className: results.correct >= results.total * 0.7 ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
            });

            // CRITICAL: Record Practice Session for Completion Tracking
            const { error: sessionError } = await supabase
                .from('practice_sessions')
                .insert({
                    user_id: user.id,
                    deck_id: null,
                    session_type: 'assessment',
                    session_mode: 'interim',
                    words_learned: results.correct,
                    words_reviewed: results.total,
                    duration_minutes: 10,
                    completed: true,
                    completed_at: new Date().toISOString(),
                    created_at: new Date().toISOString()
                });

            if (sessionError) console.error('Error recording interim session:', sessionError);

            // 2. Record in Goal Assessments
            // @ts-ignore
            const { error: assessmentError } = await supabase
                .from('goal_assessments')
                .insert({
                    goal_id: goalId,
                    assessment_type: 'interim',
                    test_size_percentage: Math.round((results.total / (progressData?.length || 1)) * 100),
                    total_questions: results.total,
                    correct_answers: results.correct,
                    wrong_answers: results.total - results.correct,
                    time_spent_seconds: 300,
                    completed_at: new Date().toISOString()
                });

            if (assessmentError) console.error('Error recording goal assessment:', assessmentError);

            // Navigate back to dashboard
            navigate('/dashboard');
        } catch (error: any) {
            console.error('Error saving results:', error);
            toast({
                title: 'Error',
                description: 'Failed to save results',
                variant: 'destructive'
            });
        }
    };

    if (loading) {
        return (
            <div className="p-6 max-w-4xl mx-auto space-y-6">
                <Skeleton className="h-12 w-64" />
                <Skeleton className="h-32" />
            </div>
        );
    }

    if (!testStarted) {
        const weakCount = questions.filter(q => q.isWeak).length;
        const masteredCount = questions.length - weakCount;

        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 p-6">
                <Card className="w-full max-w-2xl border-2 border-orange-200 dark:border-orange-800">
                    <CardHeader>
                        <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center">
                            <Zap className="h-8 w-8 text-white" />
                        </div>
                        <CardTitle className="text-center text-3xl">Interim Test #{testNumber} ⚡</CardTitle>
                        <CardDescription className="text-center text-base">
                            Day {currentDay} Checkpoint - Let's verify your progress
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Test Info */}
                        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 space-y-2">
                            <h3 className="font-semibold flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                                Test Details
                            </h3>
                            <ul className="space-y-1 text-sm text-muted-foreground ml-7">
                                <li>• {questions.length} questions total</li>
                                <li>• {weakCount} weak words ({Math.round(weakCount / questions.length * 100)}%)</li>
                                <li>• {masteredCount} mastered words ({Math.round(masteredCount / questions.length * 100)}%)</li>
                                <li>• 5 seconds per question</li>
                                <li>• Correct = +2 Bonus SRS Score</li>
                                <li>• Wrong = Leech Detection (Reset to Stage 0)</li>
                            </ul>
                        </div>

                        {/* Warning */}
                        <div className="bg-red-50 dark:bg-red-950 rounded-lg p-4 border border-red-200 dark:border-red-800">
                            <div className="flex items-start gap-2">
                                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-semibold text-red-800 dark:text-red-200">Leech Detection Active</p>
                                    <p className="text-red-700 dark:text-red-300 text-xs mt-1">
                                        Cards you get wrong will be reset to Stage 0 and moved back to the learning queue. This ensures true mastery.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Button
                                onClick={() => setTestStarted(true)}
                                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                                size="lg"
                            >
                                Start Test
                            </Button>
                            <Button
                                onClick={() => navigate('/dashboard')}
                                variant="outline"
                                className="w-full"
                            >
                                Skip for Now
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <InterimTestComponent
            questions={questions}
            onComplete={handleTestComplete}
            onCancel={() => navigate('/dashboard')}
            testNumber={testNumber}
        />
    );
}
