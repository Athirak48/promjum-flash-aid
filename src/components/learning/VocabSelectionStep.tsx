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
import { useOptimalCards, type LearningMode, type OptimalCardsResult } from '@/hooks/useOptimalCards';

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
    const breakdown = wordCountSettings?.breakdown || { review: Math.ceil(wordCount * 0.3), new: wordCount - Math.ceil(wordCount * 0.3) };

    const [activeTab, setActiveTab] = useState<'due' | 'latest' | 'library'>('due');
    const [dueVocab, setDueVocab] = useState<VocabItem[]>([]);
    const [latestVocab, setLatestVocab] = useState<VocabItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [autoSelected, setAutoSelected] = useState<Set<string>>(new Set());

    // Smart algorithm hook
    const { getOptimalCards, isLoading: isLoadingOptimal } = useOptimalCards();
    const [smartBreakdown, setSmartBreakdown] = useState<OptimalCardsResult['breakdown'] | null>(null);

    // Auto-select using smart algorithm
    const handleAutoSelect = useCallback(async () => {
        const result = await getOptimalCards(wordCount, learningMode);
        if (result.cards.length > 0) {
            onVocabChange(result.cards);
            setAutoSelected(new Set(result.cards.map(c => c.id)));
            setSmartBreakdown(result.breakdown);
        }
    }, [getOptimalCards, wordCount, learningMode, onVocabChange]);

    // Library tab state
    const [folders, setFolders] = useState<UserFolder[]>([]);
    const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
    const [selectedFolderId, setSelectedFolderId] = useState<string>('');
    const [selectedSetId, setSelectedSetId] = useState<string>('');
    const [libraryVocab, setLibraryVocab] = useState<VocabItem[]>([]);
    const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
    const [filteredSets, setFilteredSets] = useState<FlashcardSet[]>([]);

    // Fetch vocabulary data
    useEffect(() => {
        const fetchVocab = async () => {
            setIsLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setIsLoading(false);
                    return;
                }

                // Fetch due vocab (lowest SRS scores)
                const { data: dueData } = await supabase
                    .from('user_flashcard_progress')
                    .select(`
            srs_score, 
            srs_level,
            flashcard_id,
            user_flashcard_id,
            flashcards:flashcard_id(id, front_text, back_text),
            user_flashcards:user_flashcard_id(id, front_text, back_text)
          `)
                    .eq('user_id', user.id)
                    .not('srs_score', 'is', null)
                    .order('srs_score', { ascending: true })
                    .limit(20);

                if (dueData) {
                    const mappedDue: VocabItem[] = dueData
                        .map(item => {
                            const card = item.flashcards || item.user_flashcards;
                            if (!card) return null;
                            return {
                                id: card.id,
                                front_text: card.front_text,
                                back_text: card.back_text,
                                srs_score: item.srs_score,
                                srs_level: item.srs_level
                            } as VocabItem;
                        })
                        .filter((item): item is VocabItem => item !== null);

                    setDueVocab(mappedDue);

                    // Auto-fill review cards using smart algorithm
                    if (selectedVocab.length === 0) {
                        // Get optimal cards for review (based on breakdown.review count)
                        const result = await getOptimalCards(breakdown.review, 'review-only');
                        if (result.cards.length > 0) {
                            onVocabChange(result.cards);
                            setAutoSelected(new Set(result.cards.map(c => c.id)));
                            setSmartBreakdown(result.breakdown);
                        }
                    }
                }

                // Fetch latest vocab
                const { data: latestData } = await supabase
                    .from('user_flashcards')
                    .select('id, front_text, back_text')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(20);

                if (latestData) {
                    setLatestVocab(latestData.map(item => ({
                        id: item.id,
                        front_text: item.front_text,
                        back_text: item.back_text,
                        srs_score: null,
                        srs_level: null
                    } as VocabItem)));
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

                if (data) {
                    setLibraryVocab(data.map(item => ({
                        id: item.id,
                        front_text: item.front_text,
                        back_text: item.back_text,
                        srs_score: null,
                        srs_level: null
                    })));
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

    const canProceed = selectedVocab.length >= wordCount;

    return (
        <div className="flex flex-col h-full max-h-[70vh]">
            {/* Header - Show selected settings summary */}
            <div className="text-center space-y-2 mb-4 flex-shrink-0">
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xl font-bold text-slate-800 dark:text-slate-100"
                >
                    เลือกคำศัพท์
                </motion.h2>

                {/* Settings Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center justify-center gap-3 text-sm"
                >
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {breakdown.review} ทบทวน
                    </span>
                    {learningMode === 'review-and-new' && (
                        <>
                            <span className="text-slate-400">+</span>
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-semibold">
                                <Sparkles className="w-3.5 h-3.5" />
                                {breakdown.new} ใหม่
                            </span>
                        </>
                    )}
                    <span className="text-slate-400">=</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                        {wordCount} คำ
                    </span>
                </motion.div>
            </div>

            {/* Two Column Layout - Always 2 columns */}
            <div className="flex-1 grid grid-cols-2 gap-3 min-h-0 overflow-hidden">

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

                    <Card className="flex-1 border-slate-200 dark:border-slate-700 overflow-hidden">
                        <ScrollArea className="h-full max-h-[300px]">
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
                                                        ? 'bg-gradient-to-r from-red-500 to-rose-500 border-red-400 text-white'
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
                <div className="flex flex-col min-h-0">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex-shrink-0">
                        เลือกคำศัพท์จาก
                    </h3>

                    <Card className="flex-1 border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
                        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 flex flex-col">
                            <TabsList className="w-full grid grid-cols-3 p-1 bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                                <TabsTrigger value="due" className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    ยังจำไม่ได้
                                </TabsTrigger>
                                <TabsTrigger value="latest" className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
                                    <Clock className="w-3 h-3 mr-1" />
                                    ล่าสุด
                                </TabsTrigger>
                                <TabsTrigger value="library" className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
                                    <BookOpen className="w-3 h-3 mr-1" />
                                    คลัง
                                </TabsTrigger>
                            </TabsList>

                            <ScrollArea className="flex-1 max-h-[280px]">
                                <CardContent className="p-2">
                                    {isLoading ? (
                                        <div className="space-y-2">
                                            {[1, 2, 3, 4].map(i => (
                                                <Skeleton key={i} className="h-14 w-full rounded-xl" />
                                            ))}
                                        </div>
                                    ) : (
                                        <>
                                            <TabsContent value="due" className="mt-0 space-y-1.5">
                                                {dueVocab.length > 0 ? (
                                                    <>
                                                        {dueVocab.map((vocab) => (
                                                            <VocabCard
                                                                key={vocab.id}
                                                                vocab={vocab}
                                                                isSelected={selectedVocab.some(v => v.id === vocab.id)}
                                                                isDisabled={selectedVocab.length >= wordCount && !selectedVocab.some(v => v.id === vocab.id)}
                                                                onClick={() => handleToggleVocab(vocab)}
                                                            />
                                                        ))}
                                                    </>
                                                ) : (
                                                    <EmptyState message="ยังไม่มีคำศัพท์ที่ต้องทบทวน" />
                                                )}
                                            </TabsContent>

                                            <TabsContent value="latest" className="mt-0 space-y-1.5">
                                                {latestVocab.length > 0 ? (
                                                    latestVocab.map((vocab) => (
                                                        <VocabCard
                                                            key={vocab.id}
                                                            vocab={vocab}
                                                            isSelected={selectedVocab.some(v => v.id === vocab.id)}
                                                            isDisabled={selectedVocab.length >= wordCount && !selectedVocab.some(v => v.id === vocab.id)}
                                                            onClick={() => handleToggleVocab(vocab)}
                                                        />
                                                    ))
                                                ) : (
                                                    <EmptyState message="ยังไม่มีคำศัพท์ล่าสุด" />
                                                )}
                                            </TabsContent>

                                            <TabsContent value="library" className="mt-0 space-y-2">
                                                {/* Compact Dropdowns Row */}
                                                <div className="flex gap-2">
                                                    {/* Folder Dropdown - Compact */}
                                                    <div className="flex-1">
                                                        <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
                                                            <SelectTrigger className="w-full h-8 text-xs rounded-lg border-purple-200 dark:border-purple-800 focus:ring-purple-400 bg-white/90 text-black">
                                                                <div className="flex items-center gap-1.5 truncate">
                                                                    {!selectedFolderId && <Folder className="w-3 h-3 text-purple-400 flex-shrink-0" />}
                                                                    <SelectValue placeholder="โฟลเดอร์" />
                                                                </div>
                                                            </SelectTrigger>
                                                            <SelectContent portal={false} className="bg-white dark:bg-white border-slate-200 shadow-lg">
                                                                {/* <SelectItem value="all" className="text-xs">📁 ทั้งหมด</SelectItem>
                                                                <SelectItem value="no-folder" className="text-xs">📄 ไม่มีโฟลเดอร์</SelectItem> */}
                                                                {folders.map(folder => (
                                                                    <SelectItem key={folder.id} value={folder.id} className="text-xs text-black focus:text-black dark:text-black dark:focus:text-black">
                                                                        📂 {folder.title}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    {/* Set Dropdown - Compact */}
                                                    <div className="flex-1">
                                                        <Select
                                                            value={selectedSetId}
                                                            onValueChange={setSelectedSetId}
                                                            disabled={!selectedFolderId}
                                                        >
                                                            <SelectTrigger className={`w-full h-8 text-xs rounded-lg border-pink-200 dark:border-pink-800 focus:ring-pink-400 bg-white/90 text-black ${!selectedFolderId && 'opacity-50 cursor-not-allowed'}`}>
                                                                <div className="flex items-center gap-1.5 truncate">
                                                                    {!selectedSetId && <Layers className="w-3 h-3 text-pink-400 flex-shrink-0" />}
                                                                    <SelectValue placeholder={selectedFolderId ? "ชุดคำศัพท์" : "เลือกโฟลเดอร์ก่อน"} />
                                                                </div>
                                                            </SelectTrigger>
                                                            <SelectContent portal={false} className="bg-white dark:bg-white border-slate-200 shadow-lg">
                                                                {filteredSets.length > 0 ? (
                                                                    filteredSets.map(set => (
                                                                        <SelectItem key={set.id} value={set.id} className="text-xs text-black focus:text-black dark:text-black dark:focus:text-black">
                                                                            🗂️ {set.title}
                                                                        </SelectItem>
                                                                    ))
                                                                ) : (
                                                                    <SelectItem value="none" disabled className="text-xs text-black/50">
                                                                        ไม่พบชุดคำศัพท์
                                                                    </SelectItem>
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>

                                                {/* Vocab list from selected set */}
                                                {isLoadingLibrary ? (
                                                    <div className="space-y-1.5">
                                                        {[1, 2].map(i => (
                                                            <Skeleton key={i} className="h-11 w-full rounded-lg" />
                                                        ))}
                                                    </div>
                                                ) : libraryVocab.length > 0 ? (
                                                    <div className="space-y-1.5">
                                                        <p className="text-[10px] text-purple-500 flex items-center gap-1">
                                                            ✨ พบ {libraryVocab.length} คำ
                                                        </p>
                                                        {libraryVocab.map((vocab) => (
                                                            <VocabCard
                                                                key={vocab.id}
                                                                vocab={vocab}
                                                                isSelected={selectedVocab.some(v => v.id === vocab.id)}
                                                                isDisabled={selectedVocab.length >= wordCount && !selectedVocab.some(v => v.id === vocab.id)}
                                                                onClick={() => handleToggleVocab(vocab)}
                                                            />
                                                        ))}
                                                    </div>
                                                ) : selectedSetId ? (
                                                    <div className="text-center py-3 text-slate-400">
                                                        <p className="text-xs">ไม่พบคำศัพท์ในชุดนี้ 😅</p>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-4 text-slate-400">
                                                        <Layers className="w-6 h-6 mx-auto mb-2 opacity-50" />
                                                        <p className="text-xs">เลือกชุดคำศัพท์เพื่อดูรายการ</p>
                                                    </div>
                                                )}
                                            </TabsContent>
                                        </>
                                    )}
                                </CardContent>
                            </ScrollArea>
                        </Tabs>
                    </Card>
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-4 flex-shrink-0">
                <Button
                    onClick={onBack}
                    variant="outline"
                    className="flex-1 h-11 rounded-xl font-bold"
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

