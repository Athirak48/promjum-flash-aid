import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PostTestComponent from '@/components/assessment/PostTestComponent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface PostTestQuestion {
    id: string;
    front_text: string;
    back_text: string;
    options: string[];
    correctAnswer: string;
}

export default function PostTestPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState<PostTestQuestion[]>([]);
    const [testStarted, setTestStarted] = useState(false);
    const [testMode, setTestMode] = useState<'pretest_retest' | 'all_words'>('pretest_retest');

    const goalId = location.state?.goalId;
    const deckIds = location.state?.deckIds || [];
    const goalName = location.state?.goalName || 'Study Goal';

    useEffect(() => {
        if (!goalId || deckIds.length === 0) {
            toast({
                title: 'Error',
                description: 'Missing goal information',
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
                .eq('assessment_type', 'posttest');

            if (data && data.length > 0) {
                toast({
                    title: 'Test Completed',
                    description: 'คุณทำแบบทดสอบหลังเรียน (Post-Test) สำหรับเป้าหมายนี้ไปแล้ว',
                    variant: 'default'
                });
                navigate('/dashboard');
            } else {
                loadQuestions();
            }
        };

        checkCompletionAndLoad();
    }, [testMode]);

    const loadQuestions = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            let selectedCards: any[] = [];

            if (testMode === 'pretest_retest') {
                // Re-test only the words from pre-test (those marked as "known")
                const { data: knownCards } = await supabase
                    .from('user_flashcard_progress')
                    .select('*, flashcard:user_flashcards(id, front_text, back_text)')
                    .eq('user_id', user.id)
                    .in('flashcard_id', deckIds)
                    .gte('srs_level', 3); // Words marked as "known" in pre-test

                selectedCards = knownCards || [];
            } else {
                // Test ALL words
                const { data: allCards } = await supabase
                    .from('user_flashcard_progress')
                    .select('*, flashcard:user_flashcards(id, front_text, back_text)')
                    .eq('user_id', user.id)
                    .in('flashcard_id', deckIds);

                selectedCards = allCards || [];
            }

            const pool = [...selectedCards]; // Copy for distractor pool

            if (selectedCards.length === 0) {
                toast({
                    title: 'No Words to Test',
                    description: 'No words available for this test mode',
                    variant: 'destructive'
                });
                navigate('/dashboard');
                return;
            }

            // OPTIMIZATION: Sample 60 questions if pool is large
            if (selectedCards.length > 60) {
                selectedCards = selectedCards
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 60);
            }

            // Generate quiz questions
            const quizQuestions: PostTestQuestion[] = selectedCards.map(card => {
                const flashcard = card.flashcard as any;

                // Optimized: Get 3 distinct wrong answers using random indices from POOL
                const wrongOptions: string[] = [];
                const maxAttempts = 20;
                let attempts = 0;

                while (wrongOptions.length < 3 && attempts < maxAttempts) {
                    const randomIndex = Math.floor(Math.random() * pool.length);
                    const randomCard = pool[randomIndex].flashcard as any; // Access nested flashcard

                    if (randomCard.id !== card.flashcard_id && !wrongOptions.includes(randomCard.back_text)) {
                        wrongOptions.push(randomCard.back_text);
                    }
                    attempts++;
                }

                // Fallback
                if (wrongOptions.length < 3 && pool.length > 3) {
                    // Simple fallback if random fails
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
                    correctAnswer: flashcard.back_text
                };
            });

            setQuestions(quizQuestions);
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
        wrongWords: Array<{ front: string; back: string; correct: string }>;
        score: number;
    }) => {
        try {
            // 1. Record Practice Session (CRITICAL for tracking completion)
            const { data: { user } } = await supabase.auth.getUser();

            if (user && goalId) {
                const { error: sessionError } = await supabase
                    .from('practice_sessions')
                    .insert({
                        user_id: user.id,
                        deck_id: null, // Linked to goal, not specific deck necessarily
                        session_type: 'assessment',
                        session_mode: 'posttest',
                        words_learned: results.correct,
                        words_reviewed: results.total,
                        duration_minutes: 10, // Approx
                        completed: true,
                        completed_at: new Date().toISOString(),
                        created_at: new Date().toISOString()
                    });

                if (sessionError) console.error('Error recording session:', sessionError);

                // 2. Record in Goal Assessments
                const percentage = results.total > 0 ? Math.round((results.correct / results.total) * 100) : 0;

                // @ts-ignore
                const { error: assessmentError } = await supabase
                    .from('goal_assessments')
                    .insert({
                        goal_id: goalId,
                        assessment_type: 'posttest',
                        test_size_percentage: 100, // Post-test is usually full or large sample
                        total_questions: results.total,
                        correct_answers: results.correct,
                        wrong_answers: results.total - results.correct,
                        time_spent_seconds: 600,
                        completed_at: new Date().toISOString()
                    });

                if (assessmentError) console.error('Error recording goal assessment:', assessmentError);

                // 2. Mark Goal as Completed
                const { error: goalError } = await supabase
                    .from('user_goals')
                    .update({
                        is_completed: true,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', goalId);

                if (goalError) console.error('Error completing goal:', goalError);
            }

            // Navigate to results/certificate page
            navigate('/post-test-results', {
                state: {
                    ...results,
                    goalId,
                    goalName,
                    testMode
                }
            });
        } catch (error: any) {
            console.error('Error processing results:', error);
            toast({
                title: 'Error',
                description: 'Failed to process results',
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
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-6">
                <Card className="w-full max-w-2xl border-2 border-purple-200 dark:border-purple-800">
                    <CardHeader>
                        <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                            <Trophy className="h-8 w-8 text-white" />
                        </div>
                        <CardTitle className="text-center text-3xl">Post-test - Final Exam 🏆</CardTitle>
                        <CardDescription className="text-center text-base">
                            Verify your mastery of {goalName}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Test Mode Selection */}
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant={testMode === 'pretest_retest' ? 'default' : 'outline'}
                                onClick={() => setTestMode('pretest_retest')}
                                className={testMode === 'pretest_retest' ? 'bg-purple-600' : ''}
                            >
                                Pre-test Re-test
                            </Button>
                            <Button
                                variant={testMode === 'all_words' ? 'default' : 'outline'}
                                onClick={() => setTestMode('all_words')}
                                className={testMode === 'all_words' ? 'bg-purple-600' : ''}
                            >
                                All Words
                            </Button>
                        </div>

                        {/* Test Info */}
                        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 space-y-2">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-blue-600" />
                                Test Details
                            </h3>
                            <ul className="space-y-1 text-sm text-muted-foreground ml-7">
                                <li>• {questions.length} questions total</li>
                                <li>• {testMode === 'pretest_retest' ? 'Re-testing known words' : 'Testing all words'}</li>
                                <li>• 10 seconds per question</li>
                                <li>• Instant feedback (Green = Correct, Red = Wrong)</li>
                                <li>• Victory certificate upon completion</li>
                            </ul>
                        </div>

                        {/* Info */}
                        <div className="bg-purple-50 dark:bg-purple-950 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-semibold text-purple-800 dark:text-purple-200">Final Assessment</p>
                                    <p className="text-purple-700 dark:text-purple-300 text-xs mt-1">
                                        This is your final test. You'll receive instant feedback and a mastery report at the end.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Button
                                onClick={() => setTestStarted(true)}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                size="lg"
                            >
                                Start Final Exam
                            </Button>
                            <Button
                                onClick={() => navigate('/dashboard')}
                                variant="outline"
                                className="w-full"
                            >
                                Back to Dashboard
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <PostTestComponent
            questions={questions}
            onComplete={handleTestComplete}
            onCancel={() => navigate('/dashboard')}
            isRetestMode={testMode === 'pretest_retest'}
        />
    );
}
