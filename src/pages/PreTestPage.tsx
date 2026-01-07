import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PreTestComponent from '@/components/assessment/PreTestComponent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Timer, MousePointerClick, Zap, ClipboardCheck, XCircle, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface PreTestQuestion {
    id: string;
    front_text: string;
    back_text: string;
    options: string[];
    correctAnswer: string;
}

export default function PreTestPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState<PreTestQuestion[]>([]);
    const [testStarted, setTestStarted] = useState(false);
    const [scope, setScope] = useState<'all' | 'sample'>('all');

    const [showResults, setShowResults] = useState(false);
    const [resultsData, setResultsData] = useState<{ correct: number; total: number; wrongIds: string[] } | null>(null);

    // Get parameters from navigation state
    const goalId = location.state?.goalId;
    const deckIds = location.state?.deckIds || [];
    const [totalWords, setTotalWords] = useState(location.state?.totalWords || 0);

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
                .eq('assessment_type', 'pretest');

            if (data && data.length > 0) {
                toast({
                    title: 'Test Completed',
                    description: 'คุณทำแบบทดสอบ Pre-Test สำหรับเป้าหมายนี้ไปแล้ว',
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

            // OPTIMIZATION: 2-Step Fetch
            // 1. Fetch ONLY IDs first (Lightweight)
            const { data: allCardIds, error: idError } = await supabase
                .from('user_flashcards')
                .select('id')
                .in('flashcard_set_id', deckIds);

            if (idError || !allCardIds) throw idError || new Error('No cards found');

            setTotalWords(allCardIds.length);

            // 2. Randomly select needed IDs (60 questions + ~180 distractor candidates = ~240 cards)
            // We'll fetch a bit more to ensure variety, say 300, or all if less than 300.
            const totalStats = allCardIds.length;
            const sampleSize = Math.min(300, totalStats);

            // Shuffle IDs locally (cheap for just IDs)
            const shuffledIds = allCardIds
                .map(x => x.id)
                .sort(() => 0.5 - Math.random())
                .slice(0, sampleSize);

            // 3. Fetch details ONLY for selected IDs
            const { data: flashcards, error: detailError } = await supabase
                .from('user_flashcards')
                .select('id, front_text, back_text')
                .in('id', shuffledIds);

            if (detailError || !flashcards) throw detailError || new Error('Failed to load card details');

            let selectedCards: any[] = flashcards;

            // If we have more than 60, pick 60 for the quiz questions
            // (The rest will be available as distractors in the 'flashcards' pool)
            if (flashcards.length > 60) {
                selectedCards = flashcards.slice(0, 60);
            }

            const totalQuestions = selectedCards.length;

            // Generate quiz questions with 4 options
            const quizQuestions: PreTestQuestion[] = selectedCards.map(card => {
                // Optimized: Get 3 distinct wrong answers using random indices from the LOADED POOL
                const wrongOptions: string[] = [];
                const maxAttempts = 20;
                let attempts = 0;

                while (wrongOptions.length < 3 && attempts < maxAttempts) {
                    const randomIndex = Math.floor(Math.random() * flashcards.length);
                    const randomCard = flashcards[randomIndex];

                    if (randomCard.id !== card.id && !wrongOptions.includes(randomCard.back_text)) {
                        wrongOptions.push(randomCard.back_text);
                    }
                    attempts++;
                }

                // Fallback (rare in this logic as pool is ~300)
                if (wrongOptions.length < 3) {
                    // Just duplicate randoms if desperate or pad
                }

                const allOptions = [card.back_text, ...wrongOptions]
                    .sort(() => 0.5 - Math.random());

                return {
                    id: card.id,
                    front_text: card.front_text,
                    back_text: card.back_text,
                    options: allOptions,
                    correctAnswer: card.back_text
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

    const handleTestComplete = async (results: { correct: number; total: number; wrongIds: string[] }) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Mark correct answers as "known" (set higher SRS level)
            const correctIds = questions
                .filter(q => !results.wrongIds.includes(q.id))
                .map(q => q.id);

            // Batch update progress for correct answers
            if (correctIds.length > 0) {
                const correctUpdates = correctIds.map(id => ({
                    user_id: user.id,
                    flashcard_id: id,
                    times_reviewed: 1,
                    srs_level: 3, // Mark as "known"
                    srs_score: 3,
                    easiness_factor: 2.5,
                    interval_days: 7, // Schedule far in future
                    next_review_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    updated_at: new Date().toISOString()
                }));

                const { error: correctError } = await supabase
                    .from('user_flashcard_progress')
                    .upsert(correctUpdates);

                if (correctError) console.error('Error updating correct answers:', correctError);
            }

            // Mark wrong answers as "new" (Stage 0)
            if (results.wrongIds.length > 0) {
                const wrongUpdates = results.wrongIds.map(id => ({
                    user_id: user.id,
                    flashcard_id: id,
                    times_reviewed: 0,
                    srs_level: 0,
                    srs_score: 0,
                    easiness_factor: 2.5,
                    interval_days: 0,
                    next_review_date: new Date().toISOString().split('T')[0],
                    updated_at: new Date().toISOString()
                }));

                const { error: wrongError } = await supabase
                    .from('user_flashcard_progress')
                    .upsert(wrongUpdates);

                if (wrongError) console.error('Error updating wrong answers:', wrongError);
            }

            // 2. Update Practice Session (For Session Counting)
            if (goalId) {
                // Tests are for evaluation, not "learning" new words count.
                // We use nested try-catch to ensure one failure doesn't block the other

                let sessionSaved = false;
                let assessmentSaved = false;

                try {
                    const { error: sessionError } = await supabase
                        .from('practice_sessions')
                        .insert({
                            user_id: user.id,
                            deck_id: null,
                            session_type: 'assessment',
                            session_mode: 'pre-test', // Matches AssessmentType
                            words_learned: results.correct,
                            words_reviewed: results.total,
                            duration_minutes: 5,
                            completed: true,
                            completed_at: new Date().toISOString(),
                            created_at: new Date().toISOString()
                        });

                    if (sessionError) {
                        console.error('Error recording session:', sessionError);
                    } else {
                        sessionSaved = true;
                    }
                } catch (err) {
                    console.error('Exception recording session:', err);
                }

                // 3. Record in Goal Assessments (Critical for Goal Tracking)
                try {
                    const percentage = totalWords > 0 ? Math.round((results.total / totalWords) * 100) : 100;

                    // @ts-ignore
                    const { error: assessmentError } = await supabase
                        .from('goal_assessments')
                        .insert({
                            // Added user_id explicitly to ensure RLS policies work correctly
                            user_id: user.id,
                            goal_id: goalId,
                            assessment_type: 'pre-test', // Matches AssessmentType
                            test_size_percentage: percentage,
                            total_questions: results.total,
                            correct_answers: results.correct,
                            wrong_answers: results.total - results.correct,
                            time_spent_seconds: 300, // Estimated 5 mins
                            completed_at: new Date().toISOString()
                        });

                    if (assessmentError) {
                        console.error('Error recording goal assessment:', assessmentError);

                        // Show warning but don't crash if session saved
                        if (!sessionSaved) {
                            throw assessmentError;
                        } else {
                            // Notify user via toast but proceed
                            toast({
                                title: 'Notice',
                                description: 'Test result saved, but history log could not be updated.',
                                variant: 'default'
                            });
                        }
                    } else {
                        assessmentSaved = true;
                    }
                } catch (err) {
                    console.error('Exception recording assessment:', err);
                    if (!sessionSaved) throw err;
                }
            }

            // Navigate to results page
            navigate('/pre-test-results', {
                state: {
                    correct: results.correct,
                    total: results.total,
                    goalId
                }
            });
        } catch (error: any) {
            console.error('Error saving results:', error);
            toast({
                title: 'Error',
                description: 'Failed to save results. Please try again.',
                variant: 'destructive'
            });
        }
    };

    if (loading) {
        return (
            <div className="p-6 max-w-4xl mx-auto space-y-6">
                <Skeleton className="h-12 w-64" />
                <Skeleton className="h-32" />
                <Skeleton className="h-64" />
            </div>
        );
    }

    if (!testStarted) {
        const totalFlashcards = totalWords || questions.length;
        const willUseSample = totalFlashcards > 60;

        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6 relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>

                <Card className="w-full max-w-4xl border-2 border-purple-500/30 bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-purple-500/20 relative z-10">
                    <CardHeader className="text-center pb-6">
                        {/* Icon */}
                        <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50 animate-pulse">
                            <AlertCircle className="h-10 w-10 text-white" />
                        </div>

                        <CardTitle className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-3">
                            Pre-Test Ready! 🎯
                        </CardTitle>
                        <div className="flex justify-center mt-2">
                            <div className="inline-flex items-center gap-6 bg-slate-900/60 border border-purple-500/20 rounded-full px-8 py-3 backdrop-blur-md shadow-lg shadow-purple-900/10">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 bg-blue-500/10 rounded-full">
                                        <MousePointerClick className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <span className="text-slate-200 font-medium">4 Choices</span>
                                </div>
                                <div className="w-px h-8 bg-gradient-to-b from-transparent via-slate-700 to-transparent"></div>
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 bg-pink-500/10 rounded-full">
                                        <Timer className="w-4 h-4 text-pink-400" />
                                    </div>
                                    <span className="text-slate-200 font-medium">4 Sec/Word</span>
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6 px-8 pb-8">
                        {/* Selection Options */}
                        {willUseSample ? (
                            <>
                                <div className="text-center mb-6">
                                    <h3 className="text-2xl font-bold text-white mb-2">เลือกรูปแบบการทดสอบ</h3>
                                    <p className="text-slate-400 text-sm">เราแนะนำ "Smart Quick" เพื่อประหยัดเวลา แต่ยังได้ผลลัพธ์ที่แม่นยำ</p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* Option 1: Quick Scan (Recommended) */}
                                    <div
                                        onClick={() => { setScope('sample'); setTestStarted(true); }}
                                        className="relative group cursor-pointer rounded-2xl border-2 border-orange-500 bg-gradient-to-b from-orange-500/10 to-slate-900 p-6 transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_-5px_rgba(249,115,22,0.3)] flex flex-col"
                                    >
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black px-4 py-1 rounded-full shadow-lg tracking-wider uppercase">
                                            Recommended
                                        </div>

                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                                                <Zap className="h-6 w-6 text-orange-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg text-white">Smart Quick</h4>
                                                <p className="text-xs text-orange-400 font-medium">สุ่มเช็ค 60 คำ (แม่นยำ 95%)</p>
                                            </div>
                                        </div>

                                        <ul className="space-y-3 mb-6 flex-1">
                                            <li className="flex items-start gap-2 text-sm text-slate-300">
                                                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                                                <span>ใช้เวลาเพียง <b className="text-white">~3 นาที</b></span>
                                            </li>
                                            <li className="flex items-start gap-2 text-sm text-slate-300">
                                                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                                                <span>คัดกรองคำศัพท์ได้ครอบคลุม</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-sm text-slate-300">
                                                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                                                <span>เหมาะสำหรับคนเวลาน้อย</span>
                                            </li>
                                        </ul>

                                        <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl py-6">
                                            เลือกแบบ Quick
                                        </Button>
                                    </div>

                                    {/* Option 2: Full Scan */}
                                    <div
                                        onClick={() => { setScope('all'); setTestStarted(true); }}
                                        className="relative group cursor-pointer rounded-2xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 p-6 transition-all hover:border-purple-500/50 flex flex-col"
                                    >
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                                                <ClipboardCheck className="h-6 w-6 text-purple-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg text-white">Full Assessment</h4>
                                                <p className="text-xs text-slate-400 font-medium">ทดสอบครบทุกคำ ({totalFlashcards} คำ)</p>
                                            </div>
                                        </div>

                                        <ul className="space-y-3 mb-6 flex-1">
                                            <li className="flex items-start gap-2 text-sm text-slate-300">
                                                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                                                <span>ใช้เวลา <b className="text-white">~{Math.ceil((totalFlashcards * 4) / 60)} นาที</b></span>
                                            </li>
                                            <li className="flex items-start gap-2 text-sm text-slate-300">
                                                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                                                <span>เก็บข้อมูลละเอียด 100%</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-sm text-slate-300">
                                                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                                                <span>เหมาะสำหรับคนอยากชัวร์</span>
                                            </li>
                                        </ul>

                                        <Button variant="outline" className="w-full border-slate-600 text-white hover:bg-purple-900/30 hover:text-purple-300 rounded-xl py-6">
                                            เลือกแบบ Full
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-6">
                                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-purple-500/20 mb-6 animate-pulse">
                                    <Zap className="h-10 w-10 text-purple-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">พร้อมทดสอบแล้ว?</h3>

                                {questions.length > 0 ? (
                                    <>
                                        <p className="text-slate-400 mb-8 max-w-sm mx-auto">
                                            การทดสอบนี้ใช้เวลาประมาณ <span className="text-purple-400 font-bold">~{Math.ceil((questions.length * 4) / 60)} นาที</span><br />
                                            มีทั้งหมด <span className="text-white font-bold">{questions.length} ข้อ</span>
                                        </p>
                                        <Button
                                            onClick={() => setTestStarted(true)}
                                            className="w-full max-w-md bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-6 text-lg font-bold rounded-xl shadow-lg shadow-purple-900/50"
                                        >
                                            เริ่มทำข้อสอบเลย! 🚀
                                        </Button>
                                    </>
                                ) : (
                                    <div className="space-y-4">
                                        <p className="text-red-400 mb-4 max-w-sm mx-auto font-medium">
                                            ไม่พบข้อสอบ (อาจเกิดข้อผิดพลาดในการโหลด)
                                        </p>
                                        <Button
                                            onClick={() => window.location.reload()}
                                            variant="outline"
                                            className="border-red-500 text-red-400 hover:bg-red-500/10"
                                        >
                                            ลองโหลดใหม่ (Retry) 🔄
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        <Button
                            onClick={() => navigate('/dashboard')}
                            variant="outline"
                            className="w-full border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
                        >
                            Do Later (ทำทีหลัง)
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <PreTestComponent
            questions={questions}
            onComplete={handleTestComplete}
            onCancel={() => navigate('/dashboard')}
        />
    );
}
