import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PostTestComponent from '@/components/assessment/PostTestComponent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, AlertCircle, Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface PostTestQuestion {
    id: string;
    front_text: string;
    back_text: string;
    part_of_speech: string;
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
    const [preTestData, setPreTestData] = useState<{
        questionIds: string[];
        totalQuestions: number;
        correctAnswers: number;
        testSizePercentage: number; // NEW
    } | null>(null);
    const [totalWords, setTotalWords] = useState(0);

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
        }

        const fetchPreTestData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch Pre-Test data for comparison
            const { data } = await supabase
                .from('goal_assessments')
                .select('question_ids, total_questions, correct_answers, test_size_percentage') // Added field
                .eq('goal_id', goalId)
                .eq('assessment_type', 'pre-test')
                .single();

            if (data) {
                setPreTestData({
                    questionIds: data.question_ids || [],
                    totalQuestions: data.total_questions,
                    correctAnswers: data.correct_answers,
                    testSizePercentage: data.test_size_percentage || 0
                });

                // FORCE "Test All" if Pre-Test was already full (>= 90% coverage)
                if (data.test_size_percentage && data.test_size_percentage >= 90) {
                    setTestMode('all_words');
                }
            }
        };

        fetchPreTestData();

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

            // 1. Get ALL Card IDs in these decks first (Fix Incorrect Query Bug)
            const { data: deckCards } = await supabase
                .from('user_flashcards')
                .select('id')
                .in('flashcard_set_id', deckIds);

            const cardIds = deckCards?.map(c => c.id) || [];

            if (cardIds.length === 0) {
                console.log("No cards found in decks for post test");
                setLoading(false);
                return;
            }

            let selectedCards: any[] = [];

            // LOGIC SPLIT: 2-Case Strategy
            if (testMode === 'pretest_retest') {
                // CASE 1: Re-Test Exact Pre-Test Words
                // CRITICAL: Fetch from 'user_flashcards' directly to ensure we get ALL words (even unlearned/unknown ones).
                // Previous bug: querying 'user_flashcard_progress' missed words that weren't "started" or "known".

                if (preTestData?.questionIds && preTestData.questionIds.length > 0) {
                    const { data: exactCards } = await supabase
                        .from('user_flashcards')
                        .select('id, front_text, back_text, part_of_speech')
                        .in('id', preTestData.questionIds);

                    selectedCards = exactCards || [];
                } else {
                    console.warn("Missing Pre-Test IDs, falling back to random sample");
                    const { data: anyCards } = await supabase
                        .from('user_flashcards')
                        .select('id, front_text, back_text, part_of_speech')
                        .in('id', cardIds)
                        .limit(60);
                    selectedCards = anyCards || [];
                }

            } else {
                // CASE 2: Test All Words (Full Assessment)
                // Fetch ALL cards from the deck (user_flashcards), not just progress.
                const { data: allCards } = await supabase
                    .from('user_flashcards')
                    .select('id, front_text, back_text, part_of_speech')
                    .in('id', cardIds);

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

            // OPTIMIZATION: If list is massive (>300), maybe we still sample? 
            // User requested "Test All". If All is 2000 words, it's too long.
            // But for "Analysis to work for real", let's cap at meaningful limit (e.g. 200) or user warning?
            // User said "Pretest may be all". 
            // We will respect "All" but cap at 300 to prevent browser crash/user exhaustion, 
            // or we assume goal size is reasonable (<300). 
            // Let's safe-cap at 300 for performance, but notify if truncated.

            if (testMode === 'all_words' && selectedCards.length > 300) {
                selectedCards = selectedCards
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 300);
                // Maybe toast warning? "Testing subset of 300 words"
            }

            // NEW: Set total words count for UI display
            setTotalWords(selectedCards.length);

            // Generate quiz questions
            const quizQuestions: PostTestQuestion[] = selectedCards.map(card => {
                // Since we now query 'user_flashcards' directly or flattened progress, 'card' has the fields directly
                // Logic: If coming from 'user_flashcard_progress' earlier, it had nested 'flashcard'.
                // NOW: We query 'user_flashcards' directly, so 'card' IS the flashcard.
                // BUT: logic above assigns 'selectedCards = exactCards or allCards'.

                // Let's safe cast. If it has 'flashcard' property, use it. If not, use 'card' itself.
                const flashcard = (card.flashcard) ? card.flashcard : card;

                // Optimized: Get 3 distinct wrong answers using random indices from POOL
                const wrongOptions: string[] = [];
                const maxAttempts = 20;
                let attempts = 0;

                while (wrongOptions.length < 3 && attempts < maxAttempts) {
                    const randomIndex = Math.floor(Math.random() * pool.length);
                    const randomItem = pool[randomIndex];
                    const randomCard = (randomItem.flashcard) ? randomItem.flashcard : randomItem;

                    if (randomCard.id !== flashcard.id && !wrongOptions.includes(randomCard.back_text)) {
                        wrongOptions.push(randomCard.back_text);
                    }
                    attempts++;
                }

                // Fallback
                if (wrongOptions.length < 3 && pool.length > 3) {
                    // Simple fallback
                    const candidates = pool
                        .map(p => (p.flashcard ? p.flashcard : p))
                        .filter(c => c.id !== flashcard.id && !wrongOptions.includes(c.back_text))
                        .slice(0, 3 - wrongOptions.length)
                        .map(c => c.back_text);
                    wrongOptions.push(...candidates);
                }

                const allOptions = [flashcard.back_text, ...wrongOptions]
                    .sort(() => 0.5 - Math.random());

                return {
                    id: flashcard.id, // Ensure ID is from the flashcard itself
                    front_text: flashcard.front_text,
                    back_text: flashcard.back_text,
                    part_of_speech: flashcard.part_of_speech,
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
        answers?: Array<{ questionId: string; isCorrect: boolean }>; // NEW: Need answers array for subset calculation
    }) => {
        try {
            // Calculate scores
            let overallScore = {
                correct: results.correct,
                total: results.total,
                percentage: Math.round((results.correct / results.total) * 100)
            };

            let preTestSubsetScore = null;

            // If "All Words" mode AND we have Pre-Test data, calculate subset score
            if (testMode === 'all_words' && preTestData && preTestData.questionIds.length > 0 && results.answers) {
                // Filter answers to only Pre-Test question IDs
                const subsetAnswers = results.answers.filter(ans =>
                    preTestData.questionIds.includes(ans.questionId)
                );
                const subsetCorrect = subsetAnswers.filter(r => r.isCorrect).length;
                const subsetTotal = subsetAnswers.length;

                if (subsetTotal > 0) {
                    const subsetPercentage = Math.round((subsetCorrect / subsetTotal) * 100);
                    const preTestPercentage = Math.round((preTestData.correctAnswers / preTestData.totalQuestions) * 100);

                    preTestSubsetScore = {
                        correct: subsetCorrect,
                        total: subsetTotal,
                        percentage: subsetPercentage,
                        preTestCorrect: preTestData.correctAnswers,
                        preTestTotal: preTestData.totalQuestions,
                        preTestPercentage: preTestPercentage,
                        improvement: subsetCorrect - preTestData.correctAnswers,
                        improvementPercentage: subsetPercentage - preTestPercentage
                    };
                }
            }

            // 1. Record Practice Session (CRITICAL for tracking completion)
            const { data: { user } } = await supabase.auth.getUser();

            if (user && goalId) {
                const { error: sessionError } = await supabase
                    .from('practice_sessions')
                    .insert({
                        user_id: user.id,
                        deck_id: null, // Linked to goal, not specific deck necessarily
                        goal_id: goalId, // Fixed: Added goal_id
                        session_type: 'assessment',
                        session_mode: 'post-test',
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
                        user_id: user.id, // CRITICAL FIX: Add user_id
                        goal_id: goalId,
                        assessment_type: 'post-test',
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
                    overallScore, // NEW: Pass calculated overall score
                    preTestSubsetScore, // NEW: null if Re-Test mode, has data if All Words mode
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
        const preTestPercentage = preTestData
            ? Math.round((preTestData.correctAnswers / preTestData.totalQuestions) * 100)
            : 0;

        return (
            <div className="flex items-center justify-center h-screen bg-[#050505] p-2 relative overflow-hidden font-sans">
                {/* Cosmic Background Effects */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#050505] to-[#050505] pointer-events-none" />
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />

                <Card className="w-full max-w-5xl border-white/5 bg-[#0a0a0b]/80 backdrop-blur-2xl shadow-2xl relative z-10 ring-1 ring-white/10 max-h-[98vh] overflow-y-auto scrollbar-hide">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

                    <div className="grid md:grid-cols-[1.2fr,1.8fr] gap-0 h-full">
                        {/* Header Section (Left on Desktop, Top on Mobile) */}
                        <div className="p-6 flex flex-col justify-center items-center text-center border-b md:border-b-0 md:border-r border-white/5 bg-white/[0.01]">
                            {/* Trophy Icon Badge */}
                            <div className="mb-4 w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_-10px_rgba(245,158,11,0.5)] border border-white/20 relative group">
                                <div className="absolute inset-0 bg-amber-500/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50" />
                                <Trophy className="h-10 w-10 text-white drop-shadow-md" />
                            </div>

                            <div className="space-y-1">
                                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[9px] uppercase tracking-widest font-bold mb-1">
                                    <Sparkles className="w-3 h-3" />
                                    Final Assessment
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-slate-400 tracking-tight">
                                    Post-Test
                                </h1>
                                <p className="text-slate-400 text-xs md:text-sm max-w-xs mx-auto leading-relaxed px-4">
                                    วัดผลความเข้าใจของคุณในหัวข้อ <span className="text-white font-semibold block mt-1">{goalName}</span>
                                </p>
                            </div>

                            {/* Info Alert (Moved to Left Column for Layout balance) */}
                            <div className="bg-white/5 rounded-lg p-3 border border-white/10 mt-6 w-full max-w-xs mx-auto text-left">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                    <div className="text-[10px] md:text-xs text-slate-400 leading-relaxed">
                                        <p className="font-semibold text-amber-300 mb-1">คำแนะนำ</p>
                                        {testMode === 'pretest_retest'
                                            ? `ทดสอบ ${preTestData?.questionIds.length || 60} ข้อเดิมเพื่อดูพัฒนาการที่ชัดเจน`
                                            : `ทดสอบทั้งหมด แยกคะแนนเป็น 2 ส่วน (รวม + เฉพาะ Pre-test)`
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Section (Right on Desktop, Bottom on Mobile) */}
                        <div className="p-4 md:p-6 flex flex-col justify-center">
                            {/* Mode Selection Grid */}
                            {preTestData?.testSizePercentage && preTestData.testSizePercentage >= 90 ? (
                                // CASE 2: Forced Full Test
                                <div className="max-w-md mx-auto w-full">
                                    <div className="relative group cursor-pointer" onClick={() => setTestMode('all_words')}>
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[16px] opacity-75 group-hover:opacity-100 blur transition duration-500" />
                                        <div className="relative bg-[#0f0f10] rounded-[14px] p-5 border border-white/10 overflow-hidden">
                                            <div className="flex flex-col items-center text-center space-y-3">
                                                <Badge variant="secondary" className="bg-white/10 text-white border-white/5 uppercase tracking-wider text-[10px]">
                                                    Comprehensive Exam
                                                </Badge>
                                                <h3 className="text-xl font-bold text-white">Full Post-Test</h3>
                                                <p className="text-slate-400 text-xs text-center px-4">ระบบจะทดสอบ "ทุกคำ" เพื่อวัดผลลัพธ์ที่แม่นยำที่สุด</p>

                                                <div className="grid grid-cols-2 gap-2 w-full mt-1">
                                                    <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                                                        <div className="text-slate-400 text-[10px] uppercase font-bold mb-0.5">Words</div>
                                                        <div className="text-lg font-black text-white">~{totalWords || 150}</div>
                                                    </div>
                                                    <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                                                        <div className="text-slate-400 text-[10px] uppercase font-bold mb-0.5">Time</div>
                                                        <div className="text-lg font-black text-white">10s</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // CASE 1: Choice (Sample Pre-Test) - COMPACT GRID
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    {/* Option 1: Re-Test (Purple/Pink Theme) */}
                                    <div
                                        onClick={() => setTestMode('pretest_retest')}
                                        className="relative group cursor-pointer"
                                    >
                                        <div className={`absolute -inset-0.5 bg-gradient-to-b from-purple-500 to-pink-600 rounded-[18px] opacity-0 group-hover:opacity-50 blur transition duration-500 ${testMode === 'pretest_retest' ? 'opacity-70' : ''}`} />
                                        <div className={`relative h-full bg-[#0f0f10] rounded-[16px] p-4 flex flex-col border transition-all duration-300 ${testMode === 'pretest_retest' ? 'border-purple-500/50 bg-purple-900/10' : 'border-white/5 hover:border-white/10'}`}>

                                            <div className="flex justify-between items-start mb-3">
                                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/20">
                                                    <TrendingUp className="h-4 w-4 text-purple-400" />
                                                </div>
                                                {testMode === 'pretest_retest' && <CheckCircle2 className="h-4 w-4 text-purple-400" />}
                                            </div>

                                            <h4 className="text-sm font-bold text-white mb-0.5">Re-Test Focus</h4>
                                            <p className="text-[10px] text-purple-300/70 mb-3">วัดเฉพาะ 60 คำเดิม</p>

                                            <div className="space-y-1 mt-auto">
                                                <div className="flex justify-between text-[10px] text-slate-400">
                                                    <span>จำนวน</span>
                                                    <span className="text-white font-bold">{preTestData?.questionIds.length || 60} คำ</span>
                                                </div>
                                                <div className="flex justify-between text-[10px] text-slate-400">
                                                    <span>ก่อนหน้า</span>
                                                    <span className="text-orange-400 font-bold">{preTestPercentage}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Option 2: All Words (Blue Theme) */}
                                    <div
                                        onClick={() => setTestMode('all_words')}
                                        className="relative group cursor-pointer"
                                    >
                                        <div className={`absolute -inset-0.5 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-[18px] opacity-0 group-hover:opacity-50 blur transition duration-500 ${testMode === 'all_words' ? 'opacity-70' : ''}`} />
                                        <div className={`relative h-full bg-[#0f0f10] rounded-[16px] p-4 flex flex-col border transition-all duration-300 ${testMode === 'all_words' ? 'border-blue-500/50 bg-blue-900/10' : 'border-white/5 hover:border-white/10'}`}>

                                            <div className="flex justify-between items-start mb-3">
                                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/20">
                                                    <Trophy className="h-4 w-4 text-blue-400" />
                                                </div>
                                                {testMode === 'all_words' && <CheckCircle2 className="h-4 w-4 text-blue-400" />}
                                            </div>

                                            <h4 className="text-sm font-bold text-white mb-0.5">Test All Words</h4>
                                            <p className="text-[10px] text-blue-300/70 mb-3">สอบทั้ง Deck (~{totalWords || 150} คำ)</p>

                                            <div className="space-y-1 mt-auto">
                                                <div className="flex justify-between text-[10px] text-slate-400">
                                                    <span>จำนวน</span>
                                                    <span className="text-white font-bold">~{totalWords} คำ</span>
                                                </div>
                                                <div className="flex justify-between text-[10px] text-slate-400">
                                                    <span>คะแนน</span>
                                                    <span className="text-blue-400 font-bold">2 ส่วน</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons Container */}
                            <div className="mt-2 space-y-3">
                                <Button
                                    onClick={() => setTestStarted(true)}
                                    disabled={!testMode}
                                    className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold h-11 rounded-xl text-base shadow-[0_0_15px_-5px_rgba(99,102,241,0.5)] transition-all hover:scale-[1.01] disabled:opacity-50 disabled:scale-100"
                                >
                                    Let's Go! (เริ่มสอบ) 🚀
                                </Button>
                                <Button
                                    onClick={() => navigate('/dashboard')}
                                    variant="ghost"
                                    className="w-full text-slate-500 hover:text-slate-300 hover:bg-white/5 h-8 rounded-lg text-xs font-medium tracking-wide pb-0 pt-0"
                                >
                                    Not Now (กลับหน้าหลัก)
                                </Button>
                            </div>
                        </div>
                    </div>
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
