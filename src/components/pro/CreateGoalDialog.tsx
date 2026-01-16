import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NumberSpinner } from '@/components/ui/number-spinner';
import { TimePicker } from '@/components/ui/time-picker';
import { useStudyGoals } from '@/hooks/useStudyGoals';
import { useUserDecks } from '@/hooks/useUserDecks';
import { useUserFlashcardSets } from '@/hooks/useUserFlashcardSets';
import { calculateGoalRequirements } from '@/types/goals';
import { AlertCircle, Target, Calendar, BookOpen, Clock, Folder, FileText, Sparkles, TrendingUp, X, CheckCircle2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { PricingDialog } from './PricingDialog';

interface CreateGoalDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onGoalCreated?: () => void;
}

export function CreateGoalDialog({ open, onOpenChange, onGoalCreated }: CreateGoalDialogProps) {
    const { createGoal, goals } = useStudyGoals();
    const { decks } = useUserDecks();
    const { toast } = useToast();
    const navigate = useNavigate();

    const [goalName, setGoalName] = useState('');
    const [targetWords, setTargetWords] = useState(200);
    const [durationDays, setDurationDays] = useState(10);
    const [selectedFolderId, setSelectedFolderId] = useState('');
    const [selectedSets, setSelectedSets] = useState<Array<{
        id: string;
        title: string;
        card_count: number;
        folderName: string;
    }>>([]);
    const [showRequirements, setShowRequirements] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [goalNameSuggestions, setGoalNameSuggestions] = useState<string[]>([]);
    const [scheduleTimes, setScheduleTimes] = useState<string[]>(['08:00', '20:00']);

    // Planning Mode State
    const [planningMode, setPlanningMode] = useState<'duration' | 'intensity'>('duration');
    const [targetWordsPerSession, setTargetWordsPerSession] = useState(20);
    const [targetSessionsPerDay, setTargetSessionsPerDay] = useState(2);

    // Business Logic State
    const [showPricing, setShowPricing] = useState(false);
    // Mock isPro - In real app, fetch from useUserStats/useAuth
    const isPro = false;
    const hasActiveGoal = goals && goals.length > 0;

    // Get unique goal names from previous goals for autocomplete
    useEffect(() => {
        if (goals && goals.length > 0) {
            const uniqueNames = Array.from(new Set(goals.map(g => g.goal_name).filter(Boolean)));
            setGoalNameSuggestions(uniqueNames);
        }
    }, [goals]);

    // Force Schedule Times Sunc with Sessions Count
    useEffect(() => {
        let newTimes = ['08:00'];
        if (targetSessionsPerDay === 1) newTimes = ['20:00'];
        else if (targetSessionsPerDay === 2) newTimes = ['08:00', '20:00'];
        else if (targetSessionsPerDay === 3) newTimes = ['08:00', '14:00', '20:00'];
        else if (targetSessionsPerDay === 4) newTimes = ['08:00', '12:00', '16:00', '20:00'];
        else if (targetSessionsPerDay === 5) newTimes = ['06:00', '10:00', '14:00', '18:00', '22:00'];

        // Prevent infinite loop if already matches (by value)
        const currentStr = JSON.stringify(scheduleTimes);
        const newStr = JSON.stringify(newTimes);
        if (currentStr !== newStr) {
            setScheduleTimes(newTimes);
        }
    }, [targetSessionsPerDay]);

    // Load flashcard sets when folder is selected
    const { flashcardSets, loading: flashcardSetsLoading } = useUserFlashcardSets(selectedFolderId);

    // Calculate total words from selected sets
    const totalWordsFromSets = Array.isArray(selectedSets)
        ? selectedSets.reduce((sum, set) => sum + (set.card_count || 0), 0)
        : 0;

    // Safe requirement calculation
    const requirements = useMemo(() => {
        try {
            return calculateGoalRequirements(
                totalWordsFromSets || targetWords || 0,
                durationDays || 1,
                targetWordsPerSession,
                targetSessionsPerDay,
                planningMode
            );
        } catch (e) {
            console.error('Error calculating requirements:', e);
            // Fallback with default params
            return calculateGoalRequirements(0, 10, 20, 2, 'duration');
        }
    }, [totalWordsFromSets, targetWords, durationDays, targetWordsPerSession, targetSessionsPerDay, planningMode]);

    const handleCalculate = () => {
        if (!goalName || selectedSets.length === 0) {
            return;
        }

        if (totalWordsFromSets < 50) {
            toast({
                title: "คำศัพท์น้อยเกินไป ⚠️",
                description: "เป้าหมายการเรียนต้องมีคำศัพท์อย่างน้อย 50 คำ เพื่อประสิทธิภาพสูงสุด",
                variant: "destructive"
            });
            return;
        }

        setShowRequirements(true);
    };

    const handleCreate = async () => {
        // 1. LIMIT CHECK
        // 1. LIMIT CHECK - BYPASSED (Free for 2 months)
        // if (hasActiveGoal && !isPro) {
        //     setShowPricing(true);
        //     return;
        // }

        if (!goalName || selectedSets.length === 0) return;

        const firstSet = selectedSets[0];
        const allDeckIds = selectedSets.map(s => s.id);

        setIsCreating(true);
        const result = await createGoal({
            goalName,
            targetWords: totalWordsFromSets,
            durationDays,
            deckId: firstSet.id,
            deckIds: allDeckIds,
            // Pass smart params
            planningMode,
            targetSessionCap: targetWordsPerSession,
            targetSessionsPerDay: targetSessionsPerDay
        });

        if (result) {
            toast({
                title: "สร้างเป้าหมายสำเร็จ!",
                description: "กำลังเข้าสู่ Pre-test...",
                className: "bg-green-500 text-white border-green-600"
            });

            // Reset form
            setGoalName('');
            setTargetWords(200);
            setDurationDays(10);
            setSelectedFolderId('');
            setSelectedSets([]);
            setShowRequirements(false);
            onOpenChange(false);

            // Navigate to Pre-test
            navigate('/pre-test', {
                state: {
                    goalId: result.id,
                    deckIds: allDeckIds,
                    totalWords: totalWordsFromSets
                }
            });

            if (onGoalCreated) onGoalCreated();
        }
        setIsCreating(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] w-full max-h-[85vh] flex flex-col p-0 gap-0 bg-[#0a0a0b]/95 backdrop-blur-xl border border-indigo-500/20 text-slate-200 shadow-[0_0_50px_-12px_rgba(99,102,241,0.25)] rounded-2xl">

                {/* Header - Premium */}
                <div className="flex-none p-5 bg-gradient-to-br from-indigo-950/40 via-[#0a0a0b] to-[#0a0a0b] border-b border-indigo-500/10 relative overflow-hidden">
                    <DialogHeader className="relative z-10 space-y-1">
                        <DialogTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200 tracking-tight">
                            สร้างเป้าหมายการเรียน
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 text-xs text-indigo-200/70">
                            ออกแบบตารางเรียนที่เหมาะกับสมองของคุณด้วยระบบ SRS
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Content - Compact & Premium */}
                <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar relative">
                    {/* Ambient Glow */}
                    <div className="absolute top-0 left-0 w-full h-full bg-indigo-500/5 pointer-events-none" />

                    <div className="p-5 space-y-5 relative z-10">

                        {/* 1. Goal Name */}
                        <div className="space-y-2 group">
                            <Label htmlFor="goal-name" className="text-slate-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 group-focus-within:text-indigo-300 transition-colors">
                                <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-[0_0_10px_-4px_#6366f1]">1</div>
                                ชื่อเป้าหมาย
                            </Label>
                            <Input
                                id="goal-name"
                                value={goalName}
                                onChange={(e) => setGoalName(e.target.value)}
                                placeholder="เช่น: เตรียมสอบ TGAT (พ.ย.)"
                                className="h-10 text-xs bg-white/[0.03] backdrop-blur-md border-white/10 focus:border-indigo-500/50 focus:bg-indigo-950/20 focus:ring-2 focus:ring-indigo-500/10 text-white placeholder:text-slate-600 rounded-xl transition-all duration-300"
                            />
                        </div>

                        {/* 2. Selection Area */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-slate-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                                    <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-[0_0_10px_-4px_#6366f1]">2</div>
                                    เลือกชุดคำศัพท์ (เลือกได้มากกว่า 1)
                                </Label>
                                {totalWordsFromSets > 0 && (
                                    <span className="text-[10px] font-medium text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shadow-[0_0_10px_-4px_#10b981]">
                                        <CheckCircle2 className="w-3 h-3" />
                                        {totalWordsFromSets} คำ
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-5 gap-0 rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden h-[150px] shadow-inner">
                                {/* Left: Browser (3 cols) */}
                                <div className="col-span-3 border-r border-white/10 flex flex-col h-full bg-white/[0.01]">
                                    <div className="p-2 border-b border-white/5">
                                        <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
                                            <SelectTrigger className="h-8 bg-transparent border-white/5 text-slate-300 text-[10px] focus:ring-0 px-2 hover:bg-white/5 rounded-lg transition-colors">
                                                <div className="flex items-center gap-1.5">
                                                    <Folder className="w-3.5 h-3.5 text-indigo-400" />
                                                    <SelectValue placeholder="เลือกโฟลเดอร์..." />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#1a1d24] border-white/10 text-slate-300 backdrop-blur-xl">
                                                {decks?.map((deck) => (
                                                    <SelectItem key={deck.id} value={deck.id} className="text-xs focus:bg-indigo-500/20 focus:text-indigo-200">📂 {deck.deck_name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                                        <div className="space-y-0.5">
                                            {flashcardSetsLoading ? (
                                                <div className="text-center py-4 text-[10px] text-slate-500 animate-pulse">Loading sets...</div>
                                            ) : flashcardSets && flashcardSets.length > 0 ? (
                                                flashcardSets.map((set) => {
                                                    const isSelected = selectedSets.some(s => s.id === set.id);
                                                    return (
                                                        <button
                                                            key={set.id}
                                                            onClick={() => isSelected
                                                                ? setSelectedSets(selectedSets.filter(s => s.id !== set.id))
                                                                : setSelectedSets([...selectedSets, {
                                                                    id: set.id,
                                                                    title: set.title,
                                                                    card_count: set.card_count,
                                                                    folderName: decks?.find(d => d.id === selectedFolderId)?.deck_name || ''
                                                                }])
                                                            }
                                                            className={cn(
                                                                "w-full text-left px-2.5 py-2 rounded-lg text-[10px] transition-all flex items-center justify-between group relative overflow-hidden",
                                                                isSelected
                                                                    ? "bg-indigo-500/20 text-indigo-100 font-medium"
                                                                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                                                            )}
                                                        >
                                                            {isSelected && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-500" />}
                                                            <span className="truncate pr-2">{set.title}</span>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="opacity-50 text-[9px]">{set.card_count}</span>
                                                                {isSelected && <CheckCircle2 className="w-3 h-3 text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />}
                                                            </div>
                                                        </button>
                                                    );
                                                })
                                            ) : (
                                                <div className="text-center py-8 text-[10px] text-slate-600">
                                                    {selectedFolderId ? "ไม่มีชุดคำศัพท์" : "กรุณาเลือกโฟลเดอร์"}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Selected (2 cols) */}
                                <div className="col-span-2 bg-black/40 flex flex-col h-full shadow-[inset_10px_0_20px_-10px_rgba(0,0,0,0.5)]">
                                    <div className="p-2 border-b border-white/5 flex items-center justify-between">
                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Selected</span>
                                        <span className="text-[9px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-1.5 rounded-full">{selectedSets.length}</span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                                        <div className="space-y-1">
                                            {selectedSets.map((set) => (
                                                <div key={set.id} className="group flex items-center justify-between p-2 rounded-lg bg-indigo-500/5 border border-indigo-500/10 hover:bg-indigo-500/10 transition-colors">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-[10px] font-medium text-indigo-200 truncate">{set.title}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setSelectedSets(selectedSets.filter(s => s.id !== set.id))}
                                                        className="ml-1 text-slate-500 hover:text-red-400 transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                            {selectedSets.length === 0 && (
                                                <div className="flex flex-col items-center justify-center h-full text-center pb-8 opacity-40">
                                                    <Folder className="w-8 h-8 text-slate-600 mb-2" />
                                                    <div className="text-[10px] text-slate-500 italic">
                                                        ยังไม่ได้เลือก
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Duration & Stats */}
                        {!showRequirements ? (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-slate-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                                        <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-[0_0_10px_-4px_#6366f1]">3</div>
                                        โหมดวางแผน
                                    </Label>
                                    {/* Toggle Removed */}
                                </div>

                                {planningMode === 'duration' ? (
                                    // MODE A: Duration Based
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-indigo-950/30 to-purple-950/30 border border-indigo-500/10 relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
                                        <div className="absolute top-0 right-0 p-8 bg-indigo-500/5 blur-3xl rounded-full -mr-10 -mt-10 group-hover:bg-indigo-500/10 transition-colors" />

                                        <div className="flex-1 relative z-10 block">
                                            <Label className="text-[10px] text-slate-400 mb-2 block uppercase tracking-wider">ต้องการให้จบภายใน (วัน)</Label>
                                            <NumberSpinner
                                                value={durationDays}
                                                onChange={setDurationDays}
                                                min={3}
                                                max={365}
                                                className="bg-black/20 border-white/10 text-white h-9 w-full text-xs hover:border-indigo-500/30 focus-within:border-indigo-500/50 transition-colors"
                                            />
                                        </div>
                                        <div className="w-px h-10 bg-gradient-to-b from-transparent via-white/10 to-transparent mx-2" />
                                        <div className="flex-1 text-center opacity-90 relative z-10">
                                            <div className="text-[9px] text-slate-500 mb-1 uppercase tracking-wider">เฉลี่ยเรียนวันละ</div>
                                            <div className="text-2xl font-black text-white leading-none drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                                                {Math.ceil(totalWordsFromSets / durationDays) || 0}
                                            </div>
                                            <div className="text-[9px] text-indigo-400/80 mt-1">คำใหม่</div>
                                        </div>
                                    </div>
                                ) : (
                                    // MODE B: Intensity Based
                                    <div className="flex gap-4 p-4 rounded-xl bg-gradient-to-r from-indigo-950/30 to-purple-950/30 border border-indigo-500/10 relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
                                        <div className="flex-1 relative z-10">
                                            <Label className="text-[10px] text-slate-400 mb-2 block uppercase tracking-wider">คำใหม่/รอบ</Label>
                                            <NumberSpinner
                                                value={targetWordsPerSession}
                                                onChange={(val) => {
                                                    setTargetWordsPerSession(val);
                                                    const daily = val * targetSessionsPerDay;
                                                    if (daily > 0) {
                                                        const dur = Math.ceil(totalWordsFromSets / daily);
                                                        setDurationDays(Math.max(1, dur));
                                                    }
                                                }}
                                                min={5}
                                                max={50}
                                                className="bg-black/20 border-white/10 text-white h-9 w-full text-xs hover:border-indigo-500/30 transition-colors"
                                            />
                                        </div>
                                        <div className="flex-1 relative z-10">
                                            <Label className="text-[10px] text-slate-400 mb-2 block uppercase tracking-wider">รอบ/วัน</Label>
                                            <NumberSpinner
                                                value={targetSessionsPerDay}
                                                onChange={(val) => {
                                                    setTargetSessionsPerDay(val);
                                                    const daily = targetWordsPerSession * val;
                                                    if (daily > 0) {
                                                        const dur = Math.ceil(totalWordsFromSets / daily);
                                                        setDurationDays(Math.max(1, dur));
                                                    }
                                                }}
                                                min={1}
                                                max={6}
                                                className="bg-black/20 border-white/10 text-white h-9 w-full text-xs hover:border-indigo-500/30 transition-colors"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Results View - Compacted & Visual
                            <div className="animate-in fade-in zoom-in-95 duration-500 space-y-3">
                                <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4 relative overflow-hidden shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]">
                                    {/* Decoration */}
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <TrendingUp className="w-24 h-24 text-indigo-500 blur-sm" />
                                    </div>

                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-[0_0_15px_-3px_#6366f1]">
                                                <Sparkles className="w-4 h-4 animate-pulse" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white text-sm tracking-tight">AI Strategy Certified</h4>
                                                <p className="text-[10px] text-indigo-300">แผนการเรียนที่เหมาะสมกับคุณที่สุด</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                            <div className="bg-black/40 rounded-lg p-3 text-center border border-white/5 shadow-lg backdrop-blur mx-auto w-full">
                                                <div className="text-[9px] text-indigo-200/60 mb-1 uppercase tracking-wider">Target / Day</div>
                                                <div className="text-2xl font-black text-white tracking-tight">{requirements.wordsPerDay} <span className="text-xs font-normal text-slate-500">words</span></div>
                                            </div>
                                            <div className="bg-black/40 rounded-lg p-3 text-center border border-white/5 shadow-lg backdrop-blur mx-auto w-full">
                                                <div className="text-[9px] text-indigo-200/60 mb-1 uppercase tracking-wider">Sessions</div>
                                                <div className="text-2xl font-black text-white tracking-tight">{requirements.sessionsPerDay} <span className="text-xs font-normal text-slate-500">times</span></div>
                                            </div>
                                        </div>

                                        {/* Smart Stats Breakdown - Glassy */}
                                        <div className="bg-white/[0.02] rounded-lg p-2.5 border border-white/5 mb-3 backdrop-blur-sm">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="text-[10px] font-semibold text-indigo-200 flex items-center gap-1.5">
                                                    <Sparkles className="w-3 h-3 text-amber-400" />
                                                    DIFFICULTY LEVEL
                                                </div>
                                                <div className={cn(
                                                    "px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 shadow-sm",
                                                    requirements.difficulty === 'Easy' && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                                                    requirements.difficulty === 'Moderate' && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                                                    requirements.difficulty === 'Challenging' && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                                                    requirements.difficulty === 'Intense' && "bg-orange-500/10 text-orange-400 border-orange-500/20",
                                                    requirements.difficulty === 'Extreme' && "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse"
                                                )}>
                                                    {requirements.difficulty}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 text-center">
                                                <div className="bg-black/20 rounded p-1.5 border border-white/5">
                                                    <div className="text-[8px] text-slate-400 uppercase">Total Reps</div>
                                                    <div className="text-xs font-bold text-white">{requirements.totalReps}</div>
                                                </div>
                                                <div className="bg-black/20 rounded p-1.5 border border-white/5">
                                                    <div className="text-[8px] text-slate-400 uppercase">Consolidation</div>
                                                    <div className="text-xs font-bold text-emerald-400">{requirements.consolidationDays} Days</div>
                                                </div>
                                                <div className="bg-black/20 rounded p-1.5 border border-white/5">
                                                    <div className="text-[8px] text-slate-400 uppercase">Exam</div>
                                                    <div className="text-xs font-bold text-rose-400">{requirements.assessmentDays} Times</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 bg-black/30 rounded-lg p-3 border border-indigo-500/10">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1 flex items-center gap-2">
                                                <Clock className="w-3 h-3" />
                                                ตารางเรียนที่แนะนำ (Schedule)
                                            </p>
                                            {(() => {
                                                const defaultTimes = ['08:00', '11:00', '14:00', '17:00', '20:00', '22:00'];
                                                const getDefault = (i: number) => defaultTimes[i] || '23:00';
                                                const validSortedTimes = Array.from({ length: requirements.sessionsPerDay })
                                                    .map((_, i) => scheduleTimes[i] || getDefault(i));
                                                validSortedTimes.sort();

                                                return (
                                                    <div className="grid grid-cols-1 gap-2">
                                                        {validSortedTimes.map((time, idx) => (
                                                            <div key={idx} className="flex items-center justify-between text-[11px] bg-white/5 hover:bg-white/10 p-2.5 rounded-lg border border-white/5 hover:border-indigo-500/30 transition-all group">
                                                                <span className="text-slate-300 font-medium flex items-center gap-2">
                                                                    <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
                                                                    รอบที่ {idx + 1}
                                                                </span>
                                                                <div className="flex items-center gap-2 bg-black/40 px-2 py-1 rounded border border-white/5 group-hover:border-indigo-500/20 transition-colors">
                                                                    <TimePicker
                                                                        size="sm"
                                                                        value={time}
                                                                        onChange={(val) => {
                                                                            const nextTimes = [...validSortedTimes];
                                                                            nextTimes[idx] = val;
                                                                            nextTimes.sort();
                                                                            setScheduleTimes(nextTimes);
                                                                        }}
                                                                        className="h-6 text-xs p-0 border-0 bg-transparent focus:ring-0 text-indigo-300 font-mono font-bold"
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* Footer Action - Premium */}
                <div className="flex-none p-5 border-t border-white/5 bg-[#0a0a0b]/80 backdrop-blur-xl z-20 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)]">
                    {!showRequirements ? (
                        <Button
                            onClick={handleCalculate}
                            disabled={!goalName || selectedSets.length === 0}
                            className="w-full h-11 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 hover:from-indigo-500 hover:via-violet-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-[0_0_25px_-5px_#6366f1] transition-all hover:scale-[1.01] hover:shadow-[0_0_35px_-5px_#6366f1] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none border border-white/10"
                        >
                            <span className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 fill-white text-white animate-pulse" />
                                คำนวณแผนการเรียน (AI Analysis)
                            </span>
                        </Button>
                    ) : (
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowRequirements(false)}
                                className="flex-1 h-11 text-sm border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white rounded-xl backdrop-blur-sm transition-colors"
                            >
                                แก้ไขข้อมูล
                            </Button>
                            <Button
                                onClick={handleCreate}
                                disabled={isCreating}
                                className="flex-[2] h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-[0_0_20px_-5px_#10b981] transition-all hover:shadow-[0_0_30px_-5px_#10b981] border border-white/10"
                            >
                                {isCreating ? 'กำลังสร้าง...' : (
                                    <span className="flex items-center gap-2">
                                        ยืนยันเริ่มเรียน
                                        <ChevronRight className="w-4 h-4" />
                                    </span>
                                )}
                            </Button>
                        </div>
                    )}
                </div>

                <PricingDialog open={showPricing} onOpenChange={setShowPricing} />

            </DialogContent>
        </Dialog>
    );
}
