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

    // Use useAuth hook for immediate user access if possible, otherwise fetch once
    // Assuming useAuth is not imported or we want to be safe with Supabase auth

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

        const initTest = async () => {
            try {
                setLoading(true);
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // PARALLEL EXECUTION: Check Completion AND Fetch Card IDs simultaneously
                const completionPromise = supabase.from('goal_assessments')
                    .select('id')
                    .eq('goal_id', goalId)
                    .eq('assessment_type', 'interim')
                    .maybeSingle();

                // Step 1: Get all Card IDs in the target decks
                const cardIdsPromise = supabase
                    .from('user_flashcards')
                    .select('id')
                    .in('flashcard_set_id', deckIds);

                const [completionResult, cardIdsResult] = await Promise.all([
                    completionPromise,
                    cardIdsPromise
                ]);

                // 1. Check Completion
                if (completionResult.data) {
                    toast({
                        title: 'Test Completed',
                        description: 'คุณทำแบบทดสอบระหว่างภาค (Interim) สำหรับเป้าหมายนี้ไปแล้ว',
                        variant: 'default'
                    });
                    navigate('/dashboard');
                    return;
                }

                // 2. Check Card IDs
                if (cardIdsResult.error) throw cardIdsResult.error;
                const cardIds = cardIdsResult.data?.map(c => c.id) || [];

                if (cardIds.length === 0) {
                    console.log("No cards found in decks");
                    setLoading(false);
                    return;
                }

                // Step 2: Fetch Progress for these IDs
                const { data: progressData, error: progressError } = await supabase
                    .from('user_flashcard_progress')
                    .select('*, flashcard:user_flashcards(id, front_text, back_text, part_of_speech)')
                    .eq('user_id', user.id)
                    .in('flashcard_id', cardIds);

                if (progressError) throw progressError;

                if (!progressData || progressData.length === 0) {
                    console.log("No progress found for cards");
                    setLoading(false);
                    return;
                }

                // USER REQUEST: 50% Lowest SRS Score, 50% Random from Reviewed

                // 1. Get 20 Weakest (Lowest SRS Score)
                const weakestCards = [...progressData]
                    .sort((a, b) => a.srs_score - b.srs_score) // Ascending SRS Score
                    .slice(0, 20);

                // 2. Get 20 Random Reviewed (times_reviewed > 0) from the REST
                const weakestIds = new Set(weakestCards.map(c => c.flashcard_id));

                const remainingReviewed = progressData.filter(p =>
                    !weakestIds.has(p.flashcard_id) && p.times_reviewed > 0
                );

                const randomReviewedCount = Math.min(40 - weakestCards.length, remainingReviewed.length);

                const randomReviewed = remainingReviewed
                    .sort(() => 0.5 - Math.random())
                    .slice(0, randomReviewedCount);

                const allSelectedCards = [...weakestCards, ...randomReviewed];

                // Use progressData as the pool for distractors
                const pool = progressData;

                // Generate quiz questions
                const quizQuestions: InterimTestQuestion[] = allSelectedCards.map(card => {
                    const flashcard = card.flashcard as any;
                    // Mark as weak if it came from the weakest set
                    const isWeak = weakestIds.has(card.flashcard_id);

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
                        part_of_speech: flashcard.part_of_speech, // Pass part_of_speech
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

        initTest();
    }, []);

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

                try {
                    const { error: leechError } = await supabase
                        .from('user_flashcard_progress')
                        .upsert(leechUpdates);

                    if (leechError) {
                        if (leechError.code === '23503') {
                            console.warn('Skipped SRS update for leeches (Custom Deck FK)');
                        } else {
                            console.error('Error applying leech detection:', leechError);
                        }
                    }
                } catch (e) {
                    console.error('Exception applying leech detection:', e);
                }
            }

            // Apply Bonus Scoring (Increase SRS score for correct answers)
            if (results.bonusIds.length > 0) {
                // Note: Bonus loop already checks if record exists, so maybe less prone to FK error, 
                // but good to wrap anyway or leave as is if it reads first.
                // The logic in original code: selects first, then updates. 
                // If select returns null (custom card not in progress), it skips update. So it's safe!
                // I will leave Bonus logic alone as it safeguards itself by reading first.
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
                    goal_id: goalId, // Fixed: Added goal_id
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
                    user_id: user.id, // CRITICAL FIX: Add user_id
                    goal_id: goalId,
                    assessment_type: 'interim',
                    test_size_percentage: Math.round((results.total / (results.total || 1)) * 100), // Simplified for now as we don't have total deck size here easily without refetching
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
            <div className="flex items-center justify-center min-h-screen bg-[#050505] p-4 relative overflow-hidden font-sans">
                {/* Cosmic Background Effects */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#050505] to-[#050505] pointer-events-none" />
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />

                <Card className="w-full max-w-3xl border-white/5 bg-[#0a0a0b]/60 backdrop-blur-2xl shadow-2xl relative z-10 overflow-hidden ring-1 ring-white/10">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

                    <CardHeader className="text-center pb-4 pt-8 relative z-10">
                        {/* Premium Icon Badge */}
                        <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] border border-white/20 relative group">
                            <div className="absolute inset-0 bg-white/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50" />
                            <Zap className="h-10 w-10 text-white fill-white drop-shadow-md" />
                            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full animate-pulse border-[3px] border-[#0a0a0b]" />
                        </div>

                        <div className="space-y-1.5">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[9px] uppercase tracking-widest font-bold mb-1">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                Interim Checkpoint
                            </div>
                            <CardTitle className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-indigo-100 to-slate-400 tracking-tight pb-1">
                                Interim Test #{testNumber}
                            </CardTitle>
                            <CardDescription className="text-slate-400 text-xs max-w-lg mx-auto leading-relaxed">
                                การทดสอบระหว่างภาคเพื่อวัดผลความก้าวหน้าของคุณ (Day {currentDay})
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6 px-6 pb-8 relative z-10">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                                <div className="text-2xl font-bold text-white mb-0.5">{questions.length}</div>
                                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Total Questions</div>
                            </div>
                            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-center">
                                <div className="text-2xl font-bold text-rose-400 mb-0.5">{weakCount}</div>
                                <div className="text-[10px] text-rose-300/70 uppercase tracking-wider">Weak Words</div>
                            </div>
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                                <div className="text-2xl font-bold text-emerald-400 mb-0.5">{masteredCount}</div>
                                <div className="text-[10px] text-emerald-300/70 uppercase tracking-wider">Mastered</div>
                            </div>
                        </div>

                        {/* Info & Warning */}
                        <div className="space-y-3">
                            <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4 flex items-start gap-3">
                                <div className="bg-indigo-500/20 p-1.5 rounded-lg shrink-0">
                                    <Zap className="w-4 h-4 text-indigo-400" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-indigo-200 mb-0.5">Bonus SRS Score</h4>
                                    <p className="text-xs text-indigo-300/70 leading-relaxed">
                                        ตอบถูกจะได้รับคะแนนพิเศษ +2 SRS Score ช่วยให้จำแม่นขึ้น
                                    </p>
                                </div>
                            </div>

                            <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-4 flex items-start gap-3">
                                <div className="bg-rose-500/20 p-1.5 rounded-lg shrink-0">
                                    <XCircle className="w-4 h-4 text-rose-400" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-rose-200 mb-0.5">Leech Detection Active</h4>
                                    <p className="text-xs text-rose-300/70 leading-relaxed">
                                        หากตอบผิด คำศัพท์จะถูกรีเซ็ตเป็น Stage 0 เพื่อเริ่มเรียนใหม่ (Anti-Forgetting)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 space-y-3">
                            <Button
                                onClick={() => setTestStarted(true)}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white h-12 text-base font-bold rounded-xl shadow-[0_0_30px_-10px_rgba(99,102,241,0.5)] transition-all hover:scale-[1.02] hover:shadow-[0_0_50px_-10px_rgba(99,102,241,0.6)]"
                            >
                                เริ่มทำข้อสอบ (Start Test)
                            </Button>
                            <Button
                                onClick={() => navigate('/dashboard')}
                                variant="ghost"
                                className="w-full text-slate-500 hover:text-slate-300 hover:bg-white/5 h-10 rounded-xl text-xs font-medium tracking-wide uppercase"
                            >
                                Do Later (ทำทีหลัง)
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
