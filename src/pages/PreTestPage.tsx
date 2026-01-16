import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PreTestComponent from '@/components/assessment/PreTestComponent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Timer, MousePointerClick, Zap, ClipboardCheck, XCircle, TrendingUp, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import promjumLogo from "@/assets/promjum-logo.png";

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
                .eq('assessment_type', 'pre-test');

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
            // If we have more than 60, we KEEP ALL of them in state.
            // We will slice to 60 ONLY if the user clicks "Quick Test".
            // if (flashcards.length > 60) {
            //    selectedCards = flashcards.slice(0, 60);
            // }

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

                try {
                    const { error: correctError } = await supabase
                        .from('user_flashcard_progress')
                        .upsert(correctUpdates);

                    if (correctError) {
                        // Ignore FK errors for Custom Decks (user_flashcards not in flashcards table)
                        if (correctError.code === '23503') {
                            console.warn('Skipped SRS update for custom deck cards (FK constraint)');
                        } else {
                            console.error('Error updating correct answers:', correctError);
                        }
                    }
                } catch (e) {
                    console.error('Exception updating correct answers:', e);
                }
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

                try {
                    const { error: wrongError } = await supabase
                        .from('user_flashcard_progress')
                        .upsert(wrongUpdates);

                    if (wrongError) {
                        // Ignore FK errors for Custom Decks
                        if (wrongError.code === '23503') {
                            console.warn('Skipped SRS update for custom deck cards (FK constraint)');
                        } else {
                            console.error('Error updating wrong answers:', wrongError);
                        }
                    }
                } catch (e) {
                    console.error('Exception updating wrong answers:', e);
                }
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
                            goal_id: goalId, // Fixed: Added goal_id for isolation
                            session_type: 'assessment',
                            session_mode: 'pre-test', // Matches AssessmentType
                            words_learned: 0, // Set to 0 to prevent Goal Progress from jumping (DB Trigger might be summing this)
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
                        // Goal progress is NOT updated here anymore, as per user request.
                        // Progress starts at 0% (Day 1) and grows only via learning sessions.
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
                            user_id: user.id, // CRITICAL FIX: RLS Policy likely requires user_id!
                            goal_id: goalId,
                            assessment_type: 'pre-test',
                            test_size_percentage: percentage,
                            total_questions: results.total,
                            correct_answers: results.correct,
                            wrong_answers: results.total - results.correct,
                            time_spent_seconds: 300,
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
            <div className="flex items-center justify-center min-h-screen bg-[#050505] p-4 relative overflow-hidden font-sans">
                {/* Cosmic Background Effects */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#050505] to-[#050505] pointer-events-none" />
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />

                <Card className="w-full max-w-3xl border-white/5 bg-[#0a0a0b]/60 backdrop-blur-2xl shadow-2xl relative z-10 overflow-hidden ring-1 ring-white/10">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

                    <CardHeader className="text-center pb-4 pt-6 relative z-10">
                        {/* Premium Icon Badge */}
                        <div className="mx-auto mb-6 w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] border border-white/50 relative group">
                            <div className="absolute inset-0 bg-white/50 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50" />
                            <img src={promjumLogo} alt="Promjum Logo" className="h-16 w-16 relative z-10 object-contain drop-shadow-sm" />
                            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full animate-pulse border-[3px] border-[#0a0a0b]" />
                        </div>

                        <div className="space-y-1.5">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[9px] uppercase tracking-widest font-bold mb-1">
                                <Sparkles className="w-2.5 h-2.5" />
                                AI Assessment Ready
                            </div>
                            <CardTitle className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-indigo-100 to-slate-400 tracking-tight pb-1">
                                Pre-Test Ready
                            </CardTitle>
                            <CardDescription className="text-slate-400 text-xs max-w-lg mx-auto leading-relaxed">
                                ระบบพร้อมทำการประเมินวัดระดับความรู้ของคุณแล้ว เลือกรูปแบบการทดสอบที่เหมาะสม
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6 px-6 pb-8 relative z-10">
                        {/* Selection Options */}
                        {willUseSample ? (
                            <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                                {/* Option 1: Quick Scan (Recommended) */}
                                <div
                                    onClick={() => {
                                        setScope('sample');
                                        setQuestions(prev => prev.slice(0, 60)); // Slice to 60 for Quick Mode
                                        setTestStarted(true);
                                    }}
                                    className="relative group cursor-pointer"
                                >
                                    <div className="absolute -inset-0.5 bg-gradient-to-b from-amber-500 to-orange-600 rounded-[16px] opacity-75 group-hover:opacity-100 blur transition duration-300" />
                                    <div className="relative h-full bg-[#0f0f10] rounded-[14px] p-4 flex flex-col border border-white/5 overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                            <Zap className="w-24 h-24 text-amber-500" />
                                        </div>

                                        <div className="flex justify-between items-start mb-4">
                                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 md:flex flex items-center justify-center border border-amber-500/20 hidden">
                                                <Zap className="h-5 w-5 text-amber-500" />
                                            </div>
                                            <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[9px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-orange-900/20 tracking-wider uppercase">
                                                Recommended
                                            </span>
                                        </div>

                                        <div className="mb-3 relative z-10">
                                            <h4 className="text-lg font-bold text-white mb-0.5 group-hover:text-amber-200 transition-colors">Smart Quick</h4>
                                            <p className="text-[10px] text-amber-500/80 font-medium">สุ่มเช็คแม่นยำ 95% (60 คำ)</p>
                                        </div>

                                        <div className="space-y-2 mb-6 relative z-10 flex-1">
                                            <div className="flex items-center gap-2 p-1.5 rounded-md bg-amber-500/5 border border-amber-500/10">
                                                <div className="bg-amber-500/20 p-0.5 rounded">
                                                    <Timer className="h-3 w-3 text-amber-400" />
                                                </div>
                                                <span className="text-xs text-slate-300">ใช้เวลา <b className="text-white">~3 นาที</b></span>
                                            </div>
                                            <div className="flex items-center gap-2 p-1.5 rounded-md bg-amber-500/5 border border-amber-500/10">
                                                <div className="bg-amber-500/20 p-0.5 rounded">
                                                    <TrendingUp className="h-3 w-3 text-amber-400" />
                                                </div>
                                                <span className="text-xs text-slate-300">ประหยัดเวลาแต่แม่นยำ</span>
                                            </div>
                                        </div>

                                        <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold h-10 text-sm rounded-lg shadow-lg shadow-orange-900/20 transition-all group-hover:shadow-orange-500/20 group-hover:scale-[1.02]">
                                            เลือกแบบ Quick
                                        </Button>
                                    </div>
                                </div>

                                {/* Option 2: Full Assessment (Blue) */}
                                <div
                                    onClick={() => { setScope('all'); setTestStarted(true); }}
                                    className="relative group cursor-pointer"
                                >
                                    <div className="absolute -inset-0.5 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-[16px] opacity-75 group-hover:opacity-100 blur transition duration-300" />
                                    <div className="relative h-full bg-[#0f0f10] rounded-[14px] p-4 flex flex-col border border-white/5 overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                            <ClipboardCheck className="w-24 h-24 text-blue-500" />
                                        </div>

                                        <div className="flex justify-between items-start mb-4">
                                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 md:flex flex items-center justify-center border border-blue-500/20 hidden">
                                                <ClipboardCheck className="h-5 w-5 text-blue-400" />
                                            </div>
                                            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-[9px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-blue-900/20 tracking-wider uppercase">
                                                Standard
                                            </span>
                                        </div>

                                        <div className="mb-3 relative z-10">
                                            <h4 className="text-lg font-bold text-white mb-0.5 group-hover:text-blue-200 transition-colors">Full Assessment</h4>
                                            <p className="text-[10px] text-blue-400/80 font-medium">ทดสอบครบทุกคำ ({totalFlashcards} คำ)</p>
                                        </div>

                                        <div className="space-y-2 mb-6 relative z-10 flex-1">
                                            <div className="flex items-center gap-2 p-1.5 rounded-md bg-blue-500/5 border border-blue-500/10">
                                                <div className="bg-blue-500/20 p-0.5 rounded">
                                                    <Timer className="h-3 w-3 text-blue-400" />
                                                </div>
                                                <span className="text-xs text-slate-300">ใช้เวลา <b className="text-white">~{Math.ceil((totalFlashcards * 4) / 60)} นาที</b></span>
                                            </div>
                                            <div className="flex items-center gap-2 p-1.5 rounded-md bg-blue-500/5 border border-blue-500/10">
                                                <div className="bg-blue-500/20 p-0.5 rounded">
                                                    <CheckCircle2 className="h-3 w-3 text-blue-400" />
                                                </div>
                                                <span className="text-xs text-slate-300">เก็บข้อมูลละเอียด 100%</span>
                                            </div>
                                        </div>

                                        <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold h-10 text-sm rounded-lg shadow-lg shadow-blue-900/20 transition-all group-hover:shadow-blue-500/20 group-hover:scale-[1.02]">
                                            เลือกแบบ Full
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            questions.length > 0 ? (
                                <div className="text-center py-6 max-w-sm mx-auto">
                                    <div className="relative w-20 h-20 mx-auto mb-6">
                                        <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
                                        <div className="relative w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl border border-white/20">
                                            <Zap className="h-8 w-8 text-white fill-white" />
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <div>
                                            <p className="text-base text-slate-300 mb-2">พร้อมเริ่มการทดสอบไหม?</p>
                                            <div className="flex items-center justify-center gap-3 text-xs text-slate-500">
                                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/5">
                                                    <Timer className="w-3 h-3" />
                                                    ~{Math.ceil((questions.length * 4) / 60)} นาที
                                                </span>
                                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/5">
                                                    <ClipboardCheck className="w-3 h-3" />
                                                    {questions.length} ข้อ
                                                </span>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={() => setTestStarted(true)}
                                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white h-12 text-base font-bold rounded-xl shadow-[0_0_30px_-10px_rgba(99,102,241,0.5)] transition-all hover:scale-[1.02] hover:shadow-[0_0_50px_-10px_rgba(99,102,241,0.6)]"
                                        >
                                            เริ่มทำข้อสอบ (Start)
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 text-center py-8">
                                    <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-red-500/20">
                                        <XCircle className="w-7 h-7 text-red-500" />
                                    </div>
                                    <div>
                                        <p className="text-red-400 text-sm font-medium">ไม่พบข้อสอบ (อาจเกิดข้อผิดพลาดในการโหลด)</p>
                                        <p className="text-[10px] text-red-400/60 mt-1">กรุณาลองใหม่อีกครั้ง</p>
                                    </div>
                                    <Button
                                        onClick={() => window.location.reload()}
                                        variant="outline"
                                        className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-9 px-5 rounded-lg text-sm"
                                    >
                                        ลองโหลดใหม่ (Retry)
                                    </Button>
                                </div>
                            )
                        )}

                        <div className="pt-0">
                            <Button
                                onClick={() => navigate('/dashboard')}
                                variant="ghost"
                                className="w-full text-slate-500 hover:text-slate-300 hover:bg-white/5 h-8 rounded-lg text-[10px] font-medium tracking-wide uppercase"
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
        <PreTestComponent
            questions={questions}
            onComplete={handleTestComplete}
            onCancel={() => navigate('/dashboard')}
        />
    );
}
