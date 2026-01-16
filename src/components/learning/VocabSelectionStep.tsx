import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ArrowRight,
    ArrowLeft,
    Check,
    X,
    Sparkles,
    Clock,
    BookOpen,
    Loader2,
    AlertCircle,
    Folder,
    Layers,
    Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VocabItem {
    id: string;
    front_text: string;
    back_text: string;
    part_of_speech?: string;
    srs_score?: number | null;
    srs_level?: number | null;
    isUserFlashcard?: boolean;
}

interface FlashcardSet {
    id: string;
    title: string;
    folder_id: string | null;
}

interface UserFolder {
    id: string;
    title: string;
}

interface WordCountSettings {
    wordCount: number;
    learningMode: 'review-only' | 'review-and-new';
    breakdown: { review: number; new: number };
}

interface VocabSelectionStepProps {
    selectedVocab: VocabItem[];
    onVocabChange: (vocab: VocabItem[]) => void;
    onNext: () => void;
    onBack: () => void;
    maxSelection?: number;
    wordCountSettings?: WordCountSettings | null;
}

const getSrsLevelInfo = (level: number | null | undefined) => {
    const levels = [
        { label: 'ใหม่', color: 'bg-slate-100 text-slate-600', level: 0 },
        { label: 'เริ่มต้น', color: 'bg-red-100 text-red-600', level: 1 },
        { label: 'กำลังเรียน', color: 'bg-orange-100 text-orange-600', level: 2 },
        { label: 'ทบทวน', color: 'bg-yellow-100 text-yellow-600', level: 3 },
        { label: 'จำได้', color: 'bg-green-100 text-green-600', level: 4 },
        { label: 'เชี่ยวชาญ', color: 'bg-emerald-100 text-emerald-600', level: 5 },
    ];
    return levels[level ?? 0] || levels[0];
};

export function VocabSelectionStep({
    selectedVocab,
    onVocabChange,
    onNext,
    onBack,
    maxSelection = 12,
    wordCountSettings
}: VocabSelectionStepProps) {
    // Use wordCountSettings from parent, or fallback to defaults
    const wordCount = wordCountSettings?.wordCount || maxSelection;
    const learningMode = wordCountSettings?.learningMode || 'review-and-new';
    const defaultBreakdown = wordCountSettings?.breakdown || { review: Math.ceil(wordCount * 0.3), new: wordCount - Math.ceil(wordCount * 0.3) };

    // Calculate display breakdown (Merge smart breakdown if available)


    // State for Smart Generator
    const [folders, setFolders] = useState<UserFolder[]>([]);
    const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
    const [selectedFolderId, setSelectedFolderId] = useState<string>('');
    const [selectedSetId, setSelectedSetId] = useState<string>('');
    const [libraryVocab, setLibraryVocab] = useState<VocabItem[]>([]);
    const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
    const [filteredSets, setFilteredSets] = useState<FlashcardSet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [autoSelected, setAutoSelected] = useState<Set<string>>(new Set());

    const { toast } = useToast();

    // Calculate display breakdown (Merge smart breakdown if available)
    const breakdown = useMemo(() => {
        return defaultBreakdown;
    }, [defaultBreakdown]);

    // Fetch vocabulary data (Folders & Sets only)
    useEffect(() => {
        const fetchVocab = async () => {
            setIsLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setIsLoading(false);
                    return;
                }

                // Fetch folders for library tab
                const { data: foldersData } = await supabase
                    .from('user_folders')
                    .select('id, title')
                    .eq('user_id', user.id)
                    .order('title');

                if (foldersData) {
                    setFolders(foldersData);
                }

                // Fetch all flashcard sets
                const { data: setsData } = await supabase
                    .from('user_flashcard_sets')
                    .select('id, title, folder_id')
                    .eq('user_id', user.id)
                    .order('title');

                if (setsData) {
                    setFlashcardSets(setsData);
                    setFilteredSets(setsData);
                }

            } catch (error) {
                console.error('Error fetching vocab:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVocab();
    }, []);

    // Filter flashcard sets when folder changes
    useEffect(() => {
        if (selectedFolderId === '') {
            setFilteredSets(flashcardSets);
        } else if (selectedFolderId === 'no-folder') {
            setFilteredSets(flashcardSets.filter(set => !set.folder_id));
        } else {
            setFilteredSets(flashcardSets.filter(set => set.folder_id === selectedFolderId));
        }
        setSelectedSetId('');
        setLibraryVocab([]);
    }, [selectedFolderId, flashcardSets]);

    // Fetch vocab when flashcard set is selected
    useEffect(() => {
        const fetchSetVocab = async () => {
            if (!selectedSetId) {
                setLibraryVocab([]);
                return;
            }

            setIsLoadingLibrary(true);
            try {
                const { data } = await supabase
                    .from('user_flashcards')
                    .select('id, front_text, back_text')
                    .eq('flashcard_set_id', selectedSetId)
                    .order('created_at', { ascending: false });

                if (data && data.length > 0) {
                    // Fetch SRS progress for these cards
                    const cardIds = data.map(d => d.id);
                    const { data: progressData } = await supabase
                        .from('user_flashcard_progress')
                        .select('user_flashcard_id, srs_score, srs_level')
                        .in('user_flashcard_id', cardIds)
                        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

                    // Create a map for quick lookup
                    const progressMap = new Map();
                    progressData?.forEach(p => {
                        if (p.user_flashcard_id) {
                            progressMap.set(p.user_flashcard_id, { score: p.srs_score, level: p.srs_level });
                        }
                    });

                    setLibraryVocab(data.map(item => {
                        const progress = progressMap.get(item.id);
                        return {
                            id: item.id,
                            front_text: item.front_text,
                            back_text: item.back_text,
                            srs_score: progress?.score ?? null,
                            srs_level: progress?.level ?? null
                        };
                    }));
                } else {
                    setLibraryVocab([]);
                }
            } catch (error) {
                console.error('Error fetching set vocab:', error);
            } finally {
                setIsLoadingLibrary(false);
            }
        };

        fetchSetVocab();
    }, [selectedSetId]);

    const handleToggleVocab = (vocab: VocabItem) => {
        const isSelected = selectedVocab.some(v => v.id === vocab.id);

        if (isSelected) {
            // Remove from selection
            onVocabChange(selectedVocab.filter(v => v.id !== vocab.id));
        } else if (selectedVocab.length < wordCount) {
            // Add to selection
            onVocabChange([...selectedVocab, vocab]);
        }
    };

    const handleRemoveVocab = (vocabId: string) => {
        onVocabChange(selectedVocab.filter(v => v.id !== vocabId));
    };

    // --- Smart Logic Implementation ---
    const handleSmartGenerate = async () => {
        if (!selectedSetId) return;

        setIsLoadingLibrary(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // 1. Fetch vocab for the selected set
            const { data: cardsData, error: cardsError } = await supabase
                .from('user_flashcards')
                .select('*')
                .eq('flashcard_set_id', selectedSetId)
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false });

            if (cardsError) throw cardsError;
            if (!cardsData || cardsData.length === 0) {
                toast({
                    title: "ไม่พบคำศัพท์",
                    description: "ชุดคำศัพท์นี้ไม่มีคำศัพท์อยู่เลย",
                    variant: "destructive",
                });
                return;
            }

            // 2. Fetch SRS Progress
            const cardIds = cardsData.map(c => c.id);
            const { data: progressData, error: progressError } = await supabase
                .from('user_flashcard_progress')
                .select('user_flashcard_id, srs_score, srs_level')
                .in('user_flashcard_id', cardIds)
                .eq('user_id', user?.id);

            if (progressError) throw progressError;

            // 3. Merge Data
            const progressMap = new Map();
            progressData?.forEach(p => progressMap.set(p.user_flashcard_id, p));

            const allVocab: VocabItem[] = cardsData.map(c => {
                const progress = progressMap.get(c.id);
                return {
                    id: c.id,
                    front_text: c.front_text,
                    back_text: c.back_text,
                    part_of_speech: c.part_of_speech, // Ensure this exists on type or is optional
                    srs_score: progress?.srs_score ?? null,
                    srs_level: progress?.srs_level ?? null
                } as VocabItem;
            });

            // 4. Categorize: New (60%) vs Review (40%)
            const newVocab = allVocab.filter(v => v.srs_level === null);
            const reviewVocab = allVocab.filter(v => v.srs_level !== null);

            // 5. Calculate Quotas
            // Use user-defined settings if available, otherwise default to 60/40
            let targetNewCount = wordCountSettings?.breakdown?.new ?? Math.ceil(wordCount * 0.6);
            let targetReviewCount = wordCountSettings?.breakdown?.review ?? (wordCount - targetNewCount);

            // 6. Smart Balancing Logic
            // If we don't have enough Review words, take more New words
            if (reviewVocab.length < targetReviewCount) {
                const deficit = targetReviewCount - reviewVocab.length;
                targetNewCount += deficit;
                targetReviewCount = reviewVocab.length;
            }

            // If we don't have enough New words, take more Review words
            if (newVocab.length < targetNewCount) {
                const deficit = targetNewCount - newVocab.length;
                targetReviewCount += deficit;
                targetNewCount = newVocab.length;
            }

            // Ensure we don't exceed total available (sanity check)
            // (Though the above logic should handle it, this is safe)

            // 7. Selection Logic
            const finalSelection: VocabItem[] = [];

            // A. Select New Words
            const shuffledNew = [...newVocab].sort(() => Math.random() - 0.5);
            const selectedNew = shuffledNew.slice(0, targetNewCount);
            finalSelection.push(...selectedNew);

            // B. Select Review Words
            const shuffledReview = [...reviewVocab].sort(() => Math.random() - 0.5);
            const selectedReview = shuffledReview.slice(0, targetReviewCount);
            finalSelection.push(...selectedReview);

            // 7. Update State
            onVocabChange(finalSelection);
            setAutoSelected(new Set(finalSelection.map(v => v.id)));

            if (finalSelection.length < wordCount) {
                toast({
                    title: "จำนวนคำศัพท์ไม่ครบ",
                    description: `ในชุดนี้มีคำศัพท์เพียง ${finalSelection.length} คำ (จากที่ต้องการ ${wordCount} คำ) ระบบได้เลือกมาทั้งหมดแล้ว`,
                    variant: "destructive", // Or default with a warning icon if possible, but destructive grabs attention
                });
            } else {
                toast({
                    title: "จัดชุดคำศัพท์สำเร็จ!",
                    description: `เลือกมาให้แล้ว ${finalSelection.length} คำ`,
                    variant: "default",
                });
            }

        } catch (error) {
            console.error("Smart Gen Error", error);
            toast({
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถจัดชุดคำศัพท์ได้ กรุณาลองใหม่อีกครั้ง",
                variant: "destructive",
            });
        } finally {
            setIsLoadingLibrary(false);
        }
    };

    const canProceed = selectedVocab.length >= wordCount;

    return (
        <div className="flex flex-col h-full max-h-[70vh]">
            {/* Header */}
            <div className="text-center space-y-2 mb-2 flex-shrink-0">
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-extrabold text-slate-800 dark:text-slate-100"
                >
                    เลือกคำศัพท์
                </motion.h2>
            </div>

            {/* Two Column Layout - Always 2 columns */}
            {/* Two Column Layout - 1:2 Ratio */}
            <div className="flex-1 grid grid-cols-3 gap-3 min-h-0 overflow-hidden">

                {/* Left: Selected Items */}
                <div className="flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-2 flex-shrink-0">
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            รายการที่เลือก
                            <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                                {selectedVocab.length}
                            </Badge>
                        </h3>
                    </div>

                    <Card className="flex-1 border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
                        <ScrollArea className="h-[400px] pr-3">
                            <CardContent className="p-2 space-y-1.5">
                                <AnimatePresence mode="popLayout">
                                    {selectedVocab.map((vocab, index) => {
                                        const isAutoSelected = autoSelected.has(vocab.id);
                                        const levelInfo = getSrsLevelInfo(vocab.srs_level);

                                        return (
                                            <motion.div
                                                key={vocab.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                layout
                                                className={`
                                                    group relative p-2 rounded-lg border transition-all
                                                    ${isAutoSelected
                                                        ? 'bg-gradient-to-r from-purple-600 to-pink-500 border-purple-400 text-white shadow-md shadow-purple-500/20'
                                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                                                    }
                                                `}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 min-w-0 overflow-hidden">
                                                        <p className={`font-semibold text-xs truncate ${isAutoSelected ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
                                                            {vocab.front_text}
                                                        </p>
                                                        <p className={`text-[10px] truncate ${isAutoSelected ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                                                            {vocab.back_text}
                                                        </p>
                                                    </div>

                                                    <Badge className={`text-[8px] px-1 py-0 whitespace-nowrap ${isAutoSelected ? 'bg-white/20 text-white' : levelInfo.color}`}>
                                                        {levelInfo.label}
                                                    </Badge>

                                                    <button
                                                        onClick={() => handleRemoveVocab(vocab.id)}
                                                        className={`
                                                            p-0.5 rounded-full transition-all flex-shrink-0
                                                            ${isAutoSelected
                                                                ? 'hover:bg-white/20 text-white'
                                                                : 'hover:bg-red-100 text-slate-400 hover:text-red-500'
                                                            }
                                                        `}
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>

                                {selectedVocab.length === 0 && (
                                    <div className="text-center py-8 text-slate-400">
                                        <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">ยังไม่ได้เลือกคำศัพท์</p>
                                    </div>
                                )}
                            </CardContent>
                        </ScrollArea>
                    </Card>
                </div>

                {/* Right: Vocab Source */}
                {/* Right: Vocab Source - Spans 2 columns */}
                <div className="flex flex-col min-h-0 col-span-2">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex-shrink-0">
                        เลือกคำศัพท์จาก
                    </h3>

                    {/* Right: Smart Generator */}
                    <div className="flex flex-col min-h-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-900 dark:to-slate-800/50 rounded-2xl p-5 border border-purple-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">

                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-200/20 to-cyan-200/20 rounded-full blur-xl -ml-5 -mb-5 pointer-events-none" />

                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-5 flex items-center gap-2 relative z-10">
                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-purple-100 dark:border-slate-700">
                                <Sparkles className="w-4 h-4 text-purple-600" />
                            </div>
                            ตัวช่วยจัดชุดคำศัพท์
                        </h3>

                        <div className="space-y-4 flex-1 relative z-10">
                            <div className="bg-white dark:bg-slate-800/80 rounded-xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Folder Select */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-500 ml-1">เลือกโฟลเดอร์</label>
                                        <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
                                            <SelectTrigger className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-purple-400 focus:ring-purple-400">
                                                <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                                                    <Folder className="w-4 h-4 text-purple-500 flex-shrink-0" />
                                                    <span className="truncate"><SelectValue placeholder="เลือก..." /></span>
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                                {folders.map(folder => (
                                                    <SelectItem key={folder.id} value={folder.id} className="text-slate-800 dark:text-slate-200">📂 {folder.title}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Set Select */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-500 ml-1">เลือกชุดคำศัพท์</label>
                                        <Select
                                            value={selectedSetId}
                                            onValueChange={setSelectedSetId}
                                            disabled={!selectedFolderId}
                                        >
                                            <SelectTrigger className={`w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-pink-400 focus:ring-pink-400 transition-all ${!selectedFolderId && 'opacity-50 cursor-not-allowed'}`}>
                                                <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                                                    <Layers className="w-4 h-4 text-pink-500 flex-shrink-0" />
                                                    <span className="truncate"><SelectValue placeholder={selectedFolderId ? "เลือก..." : "รอเลือก Folder"} /></span>
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                                {filteredSets.length > 0 ? (
                                                    filteredSets.map(set => (
                                                        <SelectItem key={set.id} value={set.id} className="text-slate-800 dark:text-slate-200">🗂️ {set.title}</SelectItem>
                                                    ))
                                                ) : (
                                                    <SelectItem value="none" disabled>ไม่พบชุดคำศัพท์</SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Info Card - REMOVED (Backend Logic) */}

                            {/* Generate Button */}
                            <Button
                                onClick={handleSmartGenerate}
                                disabled={!selectedSetId || isLoadingLibrary}
                                className={`
                                w-full h-12 rounded-xl text-base font-bold shadow-lg transition-all mt-auto
                                ${selectedSetId
                                        ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 hover:from-purple-700 hover:via-pink-600 hover:to-rose-600 text-white hover:scale-[1.02] hover:shadow-purple-500/25 ring-2 ring-white/20'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    }
                            `}
                            >
                                {isLoadingLibrary ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        กำลังคำนวณ...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-5 h-5 mr-2 fill-current" />
                                        จัดชุดคำศัพท์อัตโนมัติ
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-4 flex-shrink-0">
                <Button
                    onClick={onBack}
                    variant="outline"
                    className="flex-1 h-11 rounded-xl font-bold bg-transparent border-slate-600 text-white hover:bg-white/10 hover:text-white"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    ย้อนกลับ
                </Button>
                <Button
                    onClick={onNext}
                    disabled={!canProceed}
                    className={`
            flex-[2] h-11 rounded-xl font-bold transition-all
            ${canProceed
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }
          `}
                >
                    ถัดไป ({selectedVocab.length}/{wordCount})
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    );
}

// Sub-component: VocabCard
function VocabCard({
    vocab,
    isSelected,
    isDisabled,
    onClick
}: {
    vocab: VocabItem;
    isSelected: boolean;
    isDisabled: boolean;
    onClick: () => void;
}) {
    const levelInfo = getSrsLevelInfo(vocab.srs_level);

    return (
        <motion.div
            whileHover={{ scale: isDisabled ? 1 : 1.01 }}
            whileTap={{ scale: isDisabled ? 1 : 0.99 }}
            onClick={isDisabled ? undefined : onClick}
            className={`
        p-3 rounded-xl border-2 transition-all cursor-pointer
        ${isSelected
                    ? 'bg-gradient-to-r from-red-500 to-rose-500 border-red-400 text-white shadow-md'
                    : isDisabled
                        ? 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-50 cursor-not-allowed'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-purple-300 hover:shadow-sm'
                }
      `}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm truncate ${isSelected ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
                        {vocab.front_text}
                    </p>
                    <p className={`text-xs truncate ${isSelected ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                        {vocab.back_text}
                    </p>
                    {vocab.part_of_speech && (
                        <span className={`text-[10px] italic opacity-70 ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                            ({vocab.part_of_speech})
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    {vocab.srs_level !== null && vocab.srs_level !== undefined && (
                        <Badge className={`text-[10px] px-1.5 py-0 ${isSelected ? 'bg-white/20 text-white' : levelInfo.color}`}>
                            {levelInfo.label}
                        </Badge>
                    )}
                    {isSelected && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center"
                        >
                            <Check className="w-3 h-3 text-white" />
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// Sub-component: EmptyState
function EmptyState({ message, subMessage }: { message: string; subMessage?: string }) {
    return (
        <div className="text-center py-8 text-slate-400">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{message}</p>
            {subMessage && <p className="text-xs mt-1 opacity-70">{subMessage}</p>}
        </div>
    );
}

