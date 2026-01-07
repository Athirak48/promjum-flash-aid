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
// import { ScrollArea } from '@/components/ui/scroll-area'; // Removed to use flex-1 native scroll

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
    const [targetWordsPerSession, setTargetWordsPerSession] = useState(15);
    const [targetSessionsPerDay, setTargetSessionsPerDay] = useState(2);

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
        setShowRequirements(true);
    };

    const handleCreate = async () => {
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
            {/* Added flex flex-col and w-full to ensure layout behaves correctly */}
            <DialogContent className="sm:max-w-[550px] w-full max-h-[90vh] flex flex-col p-0 gap-0 bg-[#0a0a0b] border border-white/10 text-slate-200 shadow-2xl overflow-hidden rounded-3xl">

                {/* Header - Fixed */}
                <div className="flex-none p-6 bg-gradient-to-br from-indigo-950/40 via-[#0a0a0b] to-[#0a0a0b] border-b border-white/5 relative">
                    <div className="absolute top-0 right-0 p-6 opacity-20 pointer-events-none">
                        <Sparkles className="h-24 w-24 text-indigo-500 blur-xl -mr-6 -mt-6" />
                    </div>
                    <DialogHeader className="relative z-10 space-y-1">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-bold text-indigo-300 w-fit mb-2 shadow-[0_0_15px_-5px_#6366f1]">
                            <Target className="h-3 w-3" />
                            <span>AI PLANNING</span>
                        </div>
                        <DialogTitle className="text-2xl font-bold text-white tracking-tight">
                            สร้างเป้าหมายการเรียน
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 text-sm">
                            ออกแบบตารางเรียนที่เหมาะกับสมองของคุณด้วยระบบ SRS
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Scrollable Content - Flexible height */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    <div className="p-6 space-y-6">

                        {/* 1. Goal Name */}
                        <div className="space-y-3">
                            <Label htmlFor="goal-name" className="text-slate-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                <span className="bg-indigo-500/20 text-indigo-400 w-5 h-5 rounded-full flex items-center justify-center text-[10px]">1</span>
                                ชื่อเป้าหมาย
                            </Label>
                            <Input
                                id="goal-name"
                                value={goalName}
                                onChange={(e) => setGoalName(e.target.value)}
                                placeholder="เช่น: เตรียมสอบ TGAT (พ.ย.)"
                                className="h-11 bg-white/5 border-white/10 focus:border-indigo-500/50 focus:bg-indigo-950/20 text-white placeholder:text-slate-600 rounded-xl"
                            />
                        </div>

                        {/* 2. Selection Area */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-slate-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                    <span className="bg-indigo-500/20 text-indigo-400 w-5 h-5 rounded-full flex items-center justify-center text-[10px]">2</span>
                                    เลือกชุดคำศัพท์
                                </Label>
                                {totalWordsFromSets > 0 && (
                                    <span className="text-xs font-medium text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                        <CheckCircle2 className="w-3 h-3" />
                                        รวม {totalWordsFromSets} คำ
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-5 gap-0 rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden min-h-[180px]">
                                {/* Left: Browser (3 cols) */}
                                <div className="col-span-3 border-r border-white/10 flex flex-col">
                                    <div className="p-2 border-b border-white/5 bg-white/[0.02]">
                                        <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
                                            <SelectTrigger className="h-8 bg-transparent border-0 text-slate-300 text-xs focus:ring-0 px-2 hover:bg-white/5 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <Folder className="w-3.5 h-3.5 text-indigo-400" />
                                                    <SelectValue placeholder="เลือกโฟลเดอร์..." />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#1a1d24] border-white/10 text-slate-300">
                                                {decks?.map((deck) => (
                                                    <SelectItem key={deck.id} value={deck.id} className="text-xs">📂 {deck.deck_name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex-1 overflow-y-auto h-[140px]">
                                        <div className="p-2 space-y-1">
                                            {flashcardSetsLoading ? (
                                                <div className="text-center py-4 text-xs text-slate-500">Loading...</div>
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
                                                                "w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between group",
                                                                isSelected
                                                                    ? "bg-indigo-500/20 text-indigo-200"
                                                                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                                                            )}
                                                        >
                                                            <span className="truncate pr-2 font-medium">{set.title}</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="opacity-50 text-[10px]">{set.card_count}</span>
                                                                {isSelected && <CheckCircle2 className="w-3 h-3 text-indigo-400" />}
                                                            </div>
                                                        </button>
                                                    );
                                                })
                                            ) : (
                                                <div className="text-center py-8 text-xs text-slate-600">
                                                    {selectedFolderId ? "ไม่มีชุดคำศัพท์" : "กรุณาเลือกโฟลเดอร์"}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Selected (2 cols) */}
                                <div className="col-span-2 bg-black/20 flex flex-col">
                                    <div className="p-2.5 border-b border-white/5 flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Selected</span>
                                        <span className="text-[10px] text-slate-600 bg-white/5 px-1.5 rounded-full">{selectedSets.length}</span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto h-[140px]">
                                        <div className="p-2 space-y-1.5">
                                            {selectedSets.map((set) => (
                                                <div key={set.id} className="group flex items-center justify-between p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs font-medium text-indigo-200 truncate">{set.title}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setSelectedSets(selectedSets.filter(s => s.id !== set.id))}
                                                        className="ml-2 text-indigo-400/50 hover:text-red-400 transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                            {selectedSets.length === 0 && (
                                                <div className="text-center py-8 text-xs text-slate-600 italic">
                                                    ยังไม่ได้เลือก
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Duration & Stats */}
                        {!showRequirements ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-slate-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                        <span className="bg-indigo-500/20 text-indigo-400 w-5 h-5 rounded-full flex items-center justify-center text-[10px]">3</span>
                                        โหมดการวางแผน
                                    </Label>
                                    <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/5">
                                        <button
                                            onClick={() => setPlanningMode('duration')}
                                            className={cn(
                                                "px-2 py-1 text-[10px] rounded-md transition-all font-medium",
                                                planningMode === 'duration' ? "bg-indigo-500 text-white shadow" : "text-slate-400 hover:text-slate-300"
                                            )}
                                        >
                                            กำหนดวันจบ
                                        </button>
                                        <button
                                            onClick={() => setPlanningMode('intensity')}
                                            className={cn(
                                                "px-2 py-1 text-[10px] rounded-md transition-all font-medium",
                                                planningMode === 'intensity' ? "bg-indigo-500 text-white shadow" : "text-slate-400 hover:text-slate-300"
                                            )}
                                        >
                                            กำหนดจำนวนคำ
                                        </button>
                                    </div>
                                </div>

                                {planningMode === 'duration' ? (
                                    // MODE A: Duration Based
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-indigo-900/10 to-purple-900/10 border border-white/5">
                                        <div className="flex-1">
                                            <Label className="text-xs text-slate-400 mb-1.5 block">ต้องการให้จบภายใน (วัน)</Label>
                                            <NumberSpinner
                                                value={durationDays}
                                                onChange={setDurationDays}
                                                min={3}
                                                max={365}
                                                className="bg-white/5 border-white/10 text-white h-10 w-full"
                                            />
                                        </div>
                                        <div className="w-px h-10 bg-white/10 mx-2" />
                                        <div className="flex-1 text-center opacity-80">
                                            <div className="text-xs text-slate-500 mb-1">คำใหม่ที่จะได้เรียน</div>
                                            <div className="text-xl font-black text-white">
                                                {Math.ceil(totalWordsFromSets / durationDays) || 0}
                                            </div>
                                            <div className="text-[10px] text-slate-500">คำใหม่/วัน</div>
                                        </div>
                                    </div>
                                ) : (
                                    // MODE B: Intensity Based
                                    <div className="space-y-3 p-4 rounded-xl bg-gradient-to-r from-indigo-900/10 to-purple-900/10 border border-white/5">
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <Label className="text-xs text-slate-400 mb-1.5 block">คำใหม่ต่อรอบ</Label>
                                                <NumberSpinner
                                                    value={targetWordsPerSession}
                                                    onChange={(val) => {
                                                        setTargetWordsPerSession(val);
                                                        // Auto-update duration
                                                        const daily = val * targetSessionsPerDay;
                                                        if (daily > 0) {
                                                            const dur = Math.ceil(totalWordsFromSets / daily);
                                                            setDurationDays(Math.max(1, dur));
                                                        }
                                                    }}
                                                    min={5}
                                                    max={50}
                                                    className="bg-white/5 border-white/10 text-white h-10 w-full"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <Label className="text-xs text-slate-400 mb-1.5 block">จำนวนรอบต่อวัน</Label>
                                                <NumberSpinner
                                                    value={targetSessionsPerDay}
                                                    onChange={(val) => {
                                                        setTargetSessionsPerDay(val);

                                                        // Auto-update duration
                                                        const daily = targetWordsPerSession * val;
                                                        if (daily > 0) {
                                                            const dur = Math.ceil(totalWordsFromSets / daily);
                                                            setDurationDays(Math.max(1, dur));
                                                        }
                                                    }}
                                                    min={1}
                                                    max={6}
                                                    className="bg-white/5 border-white/10 text-white h-10 w-full"
                                                />
                                            </div>
                                        </div>
                                        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                                            <span className="text-xs text-slate-400">จะเรียนจบในประมาณ</span>
                                            <span className="text-sm font-bold text-indigo-300">
                                                {requirements.smartDuration || durationDays} วัน
                                                <span className="text-[10px] font-normal text-slate-400 ml-1">
                                                    (รวมวันพัก+สอบ)
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Results View
                            <div className="animate-in fade-in zoom-in-95 duration-300 space-y-4">
                                <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-5 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <TrendingUp className="w-20 h-20 text-indigo-500" />
                                    </div>

                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="p-1.5 rounded-lg bg-indigo-500 text-white shadow-lg shadow-indigo-500/30">
                                                <Sparkles className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white text-sm">AI Analysis Complete</h4>
                                                <p className="text-[10px] text-indigo-300">สร้างแผนการเรียนที่เหมาะสมที่สุดแล้ว</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="bg-black/30 rounded-lg p-3 text-center border border-indigo-500/20">
                                                <div className="text-[10px] text-indigo-200/60 mb-1">เป้าหมายต่อวัน</div>
                                                <div className="text-2xl font-black text-white">{requirements.wordsPerDay} คำ</div>

                                            </div>
                                            <div className="bg-black/30 rounded-lg p-3 text-center border border-indigo-500/20">
                                                <div className="text-[10px] text-indigo-200/60 mb-1">แบ่งเป็น</div>
                                                <div className="text-2xl font-black text-white">{requirements.sessionsPerDay} รอบ</div>

                                            </div>
                                        </div>

                                        {/* Smart Stats Breakdown */}
                                        <div className="mt-3 bg-indigo-900/20 rounded-lg p-3 border border-indigo-500/10 mb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="text-[11px] font-semibold text-indigo-200 flex items-center gap-1">
                                                    <Sparkles className="w-3 h-3 text-amber-400" />
                                                    แผนการเรียนอัจฉริยะ (AI Smart Plan)
                                                </div>
                                                {/* Difficulty Badge */}
                                                <div className={cn(
                                                    "px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1",
                                                    requirements.difficulty === 'Easy' && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                                                    requirements.difficulty === 'Moderate' && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                                                    requirements.difficulty === 'Challenging' && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                                                    requirements.difficulty === 'Intense' && "bg-orange-500/10 text-orange-400 border-orange-500/20",
                                                    requirements.difficulty === 'Extreme' && "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse"
                                                )}>
                                                    {requirements.difficulty === 'Extreme' && <AlertCircle className="w-3 h-3" />}
                                                    {requirements.difficulty} Level
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 text-center">
                                                <div className="bg-black/20 rounded p-1.5 border border-white/5">
                                                    <div className="text-[10px] text-slate-400">งานจริง (Reps)</div>
                                                    <div className="text-sm font-bold text-white">{requirements.totalReps} ครั้ง</div>
                                                </div>
                                                <div className="bg-black/20 rounded p-1.5 border border-white/5">
                                                    <div className="text-[10px] text-slate-400">วันตกผลึก</div>
                                                    <div className="text-sm font-bold text-emerald-400">{requirements.consolidationDays} วัน</div>
                                                </div>
                                                <div className="bg-black/20 rounded p-1.5 border border-white/5">
                                                    <div className="text-[10px] text-slate-400">วันสอบ</div>
                                                    <div className="text-sm font-bold text-rose-400">{requirements.assessmentDays} ครั้ง</div>
                                                    <div className="text-[8px] text-slate-400 mt-0.5 flex flex-wrap justify-center gap-x-1">
                                                        <span>Pre: 1</span>
                                                        <span>•</span>
                                                        <span>Int: {Math.max(0, requirements.assessmentDays - 2)}</span>
                                                        <span>•</span>
                                                        <span>Post: 1</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Overload Warning */}
                                            {requirements.difficulty === 'Extreme' && (
                                                <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-2">
                                                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <div className="text-[11px] font-bold text-red-400">⚠️ OVERLOAD WARNING</div>
                                                        <p className="text-[10px] text-red-300/80 leading-tight">
                                                            คุณกำลังพยายามเรียนหนักเกินไป ({requirements.sessionsPerDay} รอบ/วัน) เสี่ยงต่อการ Burnout สูงมาก!
                                                            <br />แนะนำ: เพิ่มเวลาเรียนเป็น <strong>{Math.ceil(totalWordsFromSets / (3 * targetWordsPerSession))} วัน</strong> เพื่อลดความเครียด
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            {requirements.difficulty === 'Intense' && (
                                                <div className="mt-3 p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg flex gap-2">
                                                    <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <div className="text-[11px] font-bold text-orange-400">⚠️ High Intensity</div>
                                                        <p className="text-[10px] text-orange-300/80 leading-tight">
                                                            ตารางค่อนข้างแน่น ({requirements.sessionsPerDay} รอบ/วัน) ต้องมีวินัยสูงมาก
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mt-2 text-[10px] text-slate-500 text-center">
                                                *รวมวันพักและวันสอบในแผนแล้ว
                                            </div>
                                        </div>

                                        <div className="space-y-2 bg-black/20 rounded-lg p-3">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Schedule Preview</p>
                                            {(() => {
                                                const defaultTimes = ['08:00', '11:00', '14:00', '17:00', '20:00', '22:00'];
                                                const getDefault = (i: number) => defaultTimes[i] || '23:00';

                                                // Prepare sorted times for display to ensure strict order
                                                const validSortedTimes = Array.from({ length: requirements.sessionsPerDay })
                                                    .map((_, i) => scheduleTimes[i] || getDefault(i));
                                                validSortedTimes.sort();

                                                return validSortedTimes.map((time, idx) => {
                                                    const prevTime = idx > 0 ? validSortedTimes[idx - 1] : undefined;
                                                    return (
                                                        <div key={idx} className="flex items-center justify-between text-xs bg-white/5 p-2 rounded border border-white/5 hover:bg-white/10 transition-colors">
                                                            <span className="text-slate-300 font-medium flex items-center gap-2">
                                                                <Clock className="w-3 h-3 text-indigo-400" />
                                                                Session {idx + 1}
                                                            </span>
                                                            <TimePicker
                                                                size="sm"
                                                                min={prevTime}
                                                                value={time}
                                                                onChange={(val) => {
                                                                    // Update based on the current sorted view
                                                                    const nextTimes = [...validSortedTimes];
                                                                    nextTimes[idx] = val;
                                                                    nextTimes.sort(); // Re-sort to maintain chronological order
                                                                    setScheduleTimes(nextTimes);
                                                                }}
                                                            />
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* Footer Action - Fixed at bottom */}
                <div className="flex-none p-4 border-t border-white/5 bg-[#0a0a0b]/50 backdrop-blur-sm z-10">
                    {!showRequirements ? (
                        <Button
                            onClick={handleCalculate}
                            disabled={!goalName || selectedSets.length === 0}
                            className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                คำนวณแผนการเรียน (AI)
                            </span>
                        </Button>
                    ) : (
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowRequirements(false)}
                                className="flex-1 h-12 border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white rounded-xl"
                            >
                                แก้ไขข้อมูล
                            </Button>
                            <Button
                                onClick={handleCreate}
                                disabled={isCreating}
                                className="flex-[2] h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20"
                            >
                                {isCreating ? 'กำลังสร้าง...' : (
                                    <span className="flex items-center gap-2">
                                        ยืนยันเริ่มเรียนทันที
                                        <ChevronRight className="w-4 h-4" />
                                    </span>
                                )}
                            </Button>
                        </div>
                    )}
                </div>

            </DialogContent>
        </Dialog>
    );
}
