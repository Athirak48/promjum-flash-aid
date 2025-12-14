import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ArrowRight, Clock, Sparkles, Book, Check, Search, Filter } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Interface for Real Flashcard Data
interface Flashcard {
    id: string;
    front_text: string;
    back_text: string;
    created_at?: string;
    srs_score?: number;
    last_reviewed?: string;
    flashcard_set_id?: string;
}

interface Folder {
    id: string;
    title: string;
}

interface FlashcardSet {
    id: string;
    title: string;
    folder_id: string | null;
}

export default function AIListeningVocabSelectionPage() {
    const navigate = useNavigate();
    const { language } = useLanguage();

    // Data State
    const [recentWords, setRecentWords] = useState<Flashcard[]>([]);
    const [allWords, setAllWords] = useState<Flashcard[]>([]); // Filtered for display
    const [masterWordList, setMasterWordList] = useState<Flashcard[]>([]); // Original full list
    const [weakWords, setWeakWords] = useState<Flashcard[]>([]);

    // Filter State
    const [folders, setFolders] = useState<Folder[]>([]);
    const [sets, setSets] = useState<FlashcardSet[]>([]);
    const [selectedFolderId, setSelectedFolderId] = useState<string>("all");
    const [selectedSetId, setSelectedSetId] = useState<string>("all");

    const [loading, setLoading] = useState(true);

    // Selection State
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // 1. Fetch Folders
                const { data: folderData } = await supabase
                    .from('user_folders')
                    .select('id, title')
                    .eq('user_id', user.id);
                if (folderData) setFolders(folderData);

                // 2. Fetch Sets
                const { data: setData } = await supabase
                    .from('user_flashcard_sets')
                    .select('id, title, folder_id')
                    .eq('user_id', user.id);
                if (setData) setSets(setData);

                // 3. Fetch ALL user flashcards
                const { data: cardsData, error: cardsError } = await supabase
                    .from('user_flashcards')
                    .select('id, front_text, back_text, created_at, flashcard_set_id')
                    .eq('user_id', user.id);

                if (cardsError) throw cardsError;

                // 4. Fetch Progress (to get SRS and Last Reviewed)
                const { data: progressData } = await supabase
                    .from('user_flashcard_progress')
                    .select('user_flashcard_id, srs_score, updated_at')
                    .eq('user_id', user.id);

                if (cardsData) {
                    // Merge SRS data into cards
                    const mergedCards = cardsData.map(card => {
                        const prog = progressData?.find(p => p.user_flashcard_id === card.id);
                        return {
                            ...card,
                            srs_score: prog?.srs_score ?? undefined,
                            last_reviewed: prog?.updated_at ?? undefined
                        };
                    });

                    // Master List (All cards sorted by created)
                    const sortedAll = [...mergedCards].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
                    setMasterWordList(sortedAll);
                    setAllWords(sortedAll); // Initially show all

                    // Weak Words: Has SRS score -> Sorted Lowest First -> Top 15
                    const weak = mergedCards
                        .filter(c => c.srs_score !== undefined)
                        .sort((a, b) => (a.srs_score || 0) - (b.srs_score || 0))
                        .slice(0, 15);
                    setWeakWords(weak);

                    // AUTO-SELECT: Top 4 lowest SRS words
                    const top4Weak = weak.slice(0, 4).map(w => w.front_text);
                    setSelectedItems(top4Weak);

                    // Recent: Reviewed TODAY
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const recent = mergedCards
                        .filter(c => c.last_reviewed && new Date(c.last_reviewed) >= today)
                        .sort((a, b) => new Date(b.last_reviewed!).getTime() - new Date(a.last_reviewed!).getTime());
                    setRecentWords(recent);
                }
            } catch (error) {
                console.error('Error fetching flashcards:', error);
                toast({
                    title: "Error",
                    description: "Failed to load vocabulary.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Effect to filter words in Library Tab
    useEffect(() => {
        let filtered = [...masterWordList];

        if (selectedFolderId && selectedFolderId !== "all") {
            // Filter Sets belonging to this Folder
            const setsInFolder = sets.filter(s => s.folder_id === selectedFolderId).map(s => s.id);
            filtered = filtered.filter(card => card.flashcard_set_id && setsInFolder.includes(card.flashcard_set_id));
        }

        if (selectedSetId && selectedSetId !== "all") {
            filtered = filtered.filter(card => card.flashcard_set_id === selectedSetId);
        }

        setAllWords(filtered);
    }, [selectedFolderId, selectedSetId, masterWordList, sets]);


    // Handle Folder Change
    const handleFolderChange = (value: string) => {
        setSelectedFolderId(value);
        setSelectedSetId("all"); // Reset set selection
    };

    const handleToggleItem = (word: string) => {
        if (selectedItems.includes(word)) {
            setSelectedItems(selectedItems.filter(item => item !== word));
        } else {
            if (selectedItems.length < 10) {
                setSelectedItems([...selectedItems, word]);
            } else {
                toast({
                    title: language === 'th' ? "ครบ 10 คำแล้ว" : "Limit Reached",
                    description: language === 'th' ? "คุณเลือกคำศัพท์ครบ 10 คำแล้ว" : "You have selected 10 words.",
                });
            }
        }
    };

    // Filter available sets based on selected folder
    const availableSets = selectedFolderId === "all"
        ? [] // No sets if no folder selected (per requirement: Set works when Folder selected)
        : sets.filter(s => s.folder_id === selectedFolderId);

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            {/* Header */}
            <div className="bg-white border-b px-6 py-4 flex items-center gap-4 sticky top-0 z-30 shadow-sm/50">
                <Button variant="ghost" size="icon" onClick={() => navigate('/ai-listening-section1-intro')}>
                    <ArrowLeft className="h-5 w-5 text-slate-500" />
                </Button>
                <h1 className="text-xl font-bold text-slate-800">
                    {language === 'th' ? 'เลือกคำศัพท์' : 'Select Vocabulary'}
                </h1>
            </div>

            <main className="flex-1 container mx-auto px-2 sm:px-4 py-4 sm:py-6 pb-24 max-w-7xl">
                <div className="grid grid-cols-2 lg:grid-cols-12 gap-2 sm:gap-4 lg:gap-8 items-start h-[calc(100vh-140px)]">

                    {/* Left Sidebar: Selected Items (Fixed/Sticky feel) */}
                    <div className="col-span-1 lg:col-span-4 h-full flex flex-col">
                        <Card className="flex-1 p-3 sm:p-6 border-none shadow-xl shadow-slate-200/50 bg-white rounded-2xl sm:rounded-[2rem] flex flex-col overflow-hidden">
                            <div className="flex items-center justify-between mb-3 sm:mb-6">
                                <h2 className="text-sm sm:text-lg font-bold text-slate-800 flex items-center gap-1 sm:gap-2">
                                    {language === 'th' ? 'รายการที่เลือก' : 'Selected Items'}
                                    <span className="bg-purple-100 text-purple-600 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-extrabold">
                                        {selectedItems.length}
                                    </span>
                                </h2>
                            </div>

                            <ScrollArea className="flex-1 -mx-3 px-3 sm:-mx-6 sm:px-6">
                                <AnimatePresence>
                                    <div className="space-y-2 sm:space-y-3 pb-4">
                                        {selectedItems.length === 0 ? (
                                            <div className="h-20 sm:h-40 flex flex-col items-center justify-center text-slate-400 text-xs sm:text-sm border-2 border-dashed border-slate-100 rounded-xl">
                                                <Search className="w-5 h-5 sm:w-8 sm:h-8 mb-1 sm:mb-2 opacity-50" />
                                                <p className="text-center px-2">{language === 'th' ? 'ยังไม่มีรายการที่เลือก' : 'No items selected'}</p>
                                            </div>
                                        ) : (
                                            selectedItems.map((word) => {
                                                const found = masterWordList.find(w => w.front_text === word);
                                                const srsScore = found?.srs_score ?? 100;

                                                // Determine color based on SRS score
                                                let bgClass = 'bg-orange-50/50 border-orange-100';
                                                let textColor = 'text-slate-800';
                                                let badge = null;

                                                if (srsScore < 30) {
                                                    // Critical - darkest red
                                                    bgClass = 'bg-[#b91c1c] border-red-700';
                                                    textColor = 'text-white';
                                                    badge = <span className="px-1 sm:px-2 py-0.5 bg-white/20 text-white text-[8px] sm:text-xs font-bold rounded-full hidden sm:inline">{language === 'th' ? 'วิกฤต' : 'Critical'}</span>;
                                                } else if (srsScore < 50) {
                                                    // Urgent - medium red
                                                    bgClass = 'bg-[#ef4444] border-red-400';
                                                    textColor = 'text-white';
                                                    badge = <span className="px-1 sm:px-2 py-0.5 bg-white/20 text-white text-[8px] sm:text-xs font-bold rounded-full hidden sm:inline">{language === 'th' ? 'เร่งด่วน' : 'Urgent'}</span>;
                                                } else if (srsScore < 70) {
                                                    // Review - light pink
                                                    bgClass = 'bg-[#fee2e2] border-red-200';
                                                    textColor = 'text-red-800';
                                                    badge = <span className="px-1 sm:px-2 py-0.5 bg-red-100 text-red-600 text-[8px] sm:text-xs font-bold rounded-full hidden sm:inline">{language === 'th' ? 'ทบทวน' : 'Review'}</span>;
                                                }

                                                return (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        key={word}
                                                        className={`group flex flex-col p-2 sm:p-4 ${bgClass} border rounded-xl sm:rounded-2xl relative`}
                                                    >
                                                        <div className="flex items-center justify-between pr-4 sm:pr-0">
                                                            <span className={`font-bold ${textColor} text-xs sm:text-lg truncate`}>{word}</span>
                                                            {badge}
                                                        </div>
                                                        <span className={`text-[10px] sm:text-sm ${srsScore < 50 ? 'text-white/70' : 'text-slate-500'} truncate`}>{found?.back_text}</span>
                                                        <button
                                                            onClick={() => handleToggleItem(word)}
                                                            className={`absolute top-1.5 right-1 sm:top-2 sm:right-2 p-0.5 sm:p-1 ${srsScore < 50 ? 'text-white/50 hover:text-white hover:bg-white/20' : 'text-red-300 hover:text-red-500 hover:bg-red-50'} rounded-full transition-colors sm:opacity-0 sm:group-hover:opacity-100`}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                                        </button>
                                                    </motion.div>
                                                );
                                            })
                                        )}
                                    </div>
                                </AnimatePresence>
                            </ScrollArea>
                        </Card>
                    </div>

                    {/* Right Main Area: Selection */}
                    <div className="col-span-1 lg:col-span-8 h-full flex flex-col">
                        <Card className="flex-1 p-3 sm:p-8 border-none shadow-sm bg-white rounded-2xl sm:rounded-[2rem] flex flex-col overflow-hidden">
                            <h2 className="text-sm sm:text-xl font-bold text-slate-800 mb-3 sm:mb-6">
                                {language === 'th' ? 'เลือกคำศัพท์จาก' : 'Select Vocabulary From'}
                            </h2>

                            <Tabs defaultValue="weak" className="flex-1 flex flex-col">
                                <TabsList className="w-full bg-slate-50 p-0.5 sm:p-1 rounded-xl sm:rounded-2xl mb-3 sm:mb-6 grid grid-cols-3 h-8 sm:h-12">
                                    <TabsTrigger value="weak" className="rounded-lg sm:rounded-xl data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm text-slate-500 font-medium transition-all text-[10px] sm:text-sm px-1 sm:px-3">
                                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-2" />
                                        <span className="hidden sm:inline">{language === 'th' ? 'ยังจำไม่ได้' : 'Not Remembered'}</span>
                                        <span className="sm:hidden">{language === 'th' ? 'จำไม่ได้' : 'Weak'}</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="recent" className="rounded-lg sm:rounded-xl data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm text-slate-500 font-medium transition-all text-[10px] sm:text-sm px-1 sm:px-3">
                                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-2" />
                                        {language === 'th' ? 'ล่าสุด' : 'Recent'}
                                    </TabsTrigger>
                                    <TabsTrigger value="bank" className="rounded-lg sm:rounded-xl data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm text-slate-500 font-medium transition-all text-[10px] sm:text-sm px-1 sm:px-3">
                                        <Book className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-2" />
                                        {language === 'th' ? 'คลัง' : 'Library'}
                                    </TabsTrigger>
                                </TabsList>

                                <ScrollArea className="flex-1 pr-4">

                                    {/* Weak Tab */}
                                    <TabsContent value="weak" className="mt-0">
                                        <div className="text-center mb-3 sm:mb-8">
                                            <h3 className="text-xs sm:text-lg font-bold text-slate-800">{language === 'th' ? 'คำศัพท์ที่ต้องทบทวน' : 'Words to Review'}</h3>
                                            <p className="text-slate-400 text-[10px] sm:text-sm hidden sm:block">{language === 'th' ? 'คำศัพท์ที่มีคะแนน SRS ต่ำสุด' : 'Words with lowest SRS scores'}</p>
                                        </div>
                                        <WordGrid words={weakWords} selectedItems={selectedItems} onToggle={handleToggleItem} loading={loading} isWeakTab={true} weakWords={weakWords} />
                                    </TabsContent>

                                    {/* Recent Tab Info Header */}
                                    <TabsContent value="recent" className="mt-0">
                                        <div className="text-center mb-3 sm:mb-8">
                                            <h3 className="text-xs sm:text-lg font-bold text-slate-800">{language === 'th' ? 'ทบทวนคำศัพท์ล่าสุด' : 'Review Recent Words'}</h3>
                                            <p className="text-slate-400 text-[10px] sm:text-sm hidden sm:block">{language === 'th' ? 'เลือกคำศัพท์จากที่คุณเพิ่งเรียนไป' : 'Select words you recently studied'}</p>
                                        </div>
                                        <WordGrid words={recentWords} selectedItems={selectedItems} onToggle={handleToggleItem} loading={loading} weakWords={weakWords} />
                                    </TabsContent>

                                    {/* Bank Tab */}
                                    <TabsContent value="bank" className="mt-0">

                                        {/* Guided Filter Section */}
                                        <div className="bg-slate-50/80 p-6 sm:p-8 rounded-[2rem] border border-slate-100 mb-8 relative overflow-hidden">
                                            {/* Decor */}
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                                            <div className="flex flex-col sm:flex-row gap-4 mb-2 relative z-10">

                                                {/* Step 1: Folder */}
                                                <div className="flex-1">
                                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block pl-1">
                                                        {language === 'th' ? 'ขั้นที่ 1: เลือกโฟลเดอร์' : 'Step 1: Select Folder'}
                                                    </label>
                                                    <div className="relative">
                                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                                                            <Book className={`w-5 h-5 transition-colors ${selectedFolderId !== 'all' ? 'text-purple-600' : 'text-slate-400'}`} />
                                                        </div>
                                                        <Select value={selectedFolderId} onValueChange={handleFolderChange}>
                                                            <SelectTrigger className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white border-2 border-slate-200 hover:border-purple-300 focus:ring-4 focus:ring-purple-100 transition-all text-slate-700 font-bold shadow-sm">
                                                                <SelectValue placeholder={language === 'th' ? "เลือกโฟลเดอร์" : "Select Folder"} />
                                                            </SelectTrigger>
                                                            <SelectContent className="rounded-2xl border-slate-100 shadow-xl shadow-purple-500/10 p-1">
                                                                <SelectItem value="all" className="rounded-xl my-1 cursor-pointer">{language === 'th' ? "เลือกโฟลเดอร์..." : "Select Folder..."}</SelectItem>
                                                                {folders.map(f => (
                                                                    <SelectItem key={f.id} value={f.id} className="rounded-xl my-1 cursor-pointer focus:bg-purple-50 focus:text-purple-700 font-medium">{f.title}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>

                                                {/* Arrow Connector */}
                                                <div className={`sm:pt-8 flex items-center justify-center transition-opacity duration-300 ${selectedFolderId !== 'all' ? 'opacity-100 text-purple-400' : 'opacity-30 text-slate-300'}`}>
                                                    <ArrowRight className="hidden sm:block w-6 h-6" />
                                                    <ArrowLeft className="block sm:hidden w-6 h-6 rotate-[-90deg]" /> {/* Down arrow on mobile equiv */}
                                                </div>

                                                {/* Step 2: Set */}
                                                <div className={`flex-1 transition-all duration-300 ${selectedFolderId === 'all' ? 'opacity-50 grayscale' : 'opacity-100'}`}>
                                                    <label className={`text-xs font-bold uppercase tracking-wider mb-2 block pl-1 transition-colors ${selectedFolderId === 'all' ? 'text-slate-300' : 'text-purple-500'}`}>
                                                        {language === 'th' ? 'ขั้นที่ 2: เลือกชุดคำศัพท์' : 'Step 2: Select Set'}
                                                    </label>
                                                    <div className="relative">
                                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                                                            <div className={`w-5 h-5 flex items-center justify-center transition-colors ${selectedSetId !== 'all' ? 'text-purple-600' : 'text-slate-400'}`}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
                                                            </div>
                                                        </div>
                                                        <Select
                                                            value={selectedSetId}
                                                            onValueChange={setSelectedSetId}
                                                            disabled={selectedFolderId === "all"}
                                                        >
                                                            <SelectTrigger className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white border-2 border-slate-200 hover:border-purple-300 focus:ring-4 focus:ring-purple-100 transition-all text-slate-700 font-bold shadow-sm disabled:opacity-70 disabled:bg-slate-50 disabled:border-slate-100">
                                                                <SelectValue placeholder={language === 'th' ? "เลือกชุดคำศัพท์" : "Select Set"} />
                                                            </SelectTrigger>
                                                            <SelectContent className="rounded-2xl border-slate-100 shadow-xl shadow-purple-500/10 p-1">
                                                                <SelectItem value="all" className="rounded-xl my-1 cursor-pointer">{language === 'th' ? "ทุกชุดคำศัพท์" : "All Sets"}</SelectItem>
                                                                {availableSets.map(s => (
                                                                    <SelectItem key={s.id} value={s.id} className="rounded-xl my-1 cursor-pointer focus:bg-purple-50 focus:text-purple-700 font-medium">{s.title}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content - Only show if Set selected */}
                                        {selectedSetId !== "all" ? (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="space-y-6"
                                            >
                                                <div className="text-center mb-8 bg-gradient-to-b from-purple-50/50 to-transparent py-4 rounded-3xl">
                                                    <h3 className="text-xl font-bold text-slate-800 mb-1">
                                                        {sets.find(s => s.id === selectedSetId)?.title || "Selected Set"}
                                                    </h3>
                                                    <div className="flex items-center justify-center gap-2 text-slate-500">
                                                        <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                                                        <span className="text-sm font-medium">{language === 'th' ? `พบ ${allWords.length} คำ` : `Found ${allWords.length} words`}</span>
                                                    </div>
                                                </div>
                                                <WordGrid words={allWords} selectedItems={selectedItems} onToggle={handleToggleItem} loading={loading} weakWords={weakWords} />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="flex flex-col items-center justify-center py-10 text-center"
                                            >
                                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                                    <Sparkles className="w-8 h-8" />
                                                </div>
                                                <p className="text-slate-400 text-sm font-medium">
                                                    {selectedFolderId === 'all'
                                                        ? (language === 'th' ? "เริ่มจากเลือกโฟลเดอร์ทางด้านบน" : "Start by selecting a folder above")
                                                        : (language === 'th' ? "ดีมาก! ทีนี้เลือกชุดคำศัพท์ต่อเลย" : "Great! Now select a vocabulary set")
                                                    }
                                                </p>
                                            </motion.div>
                                        )}
                                    </TabsContent>
                                </ScrollArea>
                            </Tabs>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t p-4 z-40">
                <div className="container mx-auto max-w-7xl flex justify-between items-center">
                    <div className="text-slate-500 font-medium">
                        {language === 'th' ? `เลือกแล้ว ${selectedItems.length}/10 คำ` : `Selected ${selectedItems.length}/10 words`}
                    </div>
                    <Button
                        onClick={() => {
                            const selectedVocab = selectedItems.map((word, i) => {
                                const found = allWords.find(w => w.front_text === word);
                                return {
                                    id: String(i + 1),
                                    word: word,
                                    meaning: found?.back_text || ''
                                };
                            });
                            navigate('/ai-listening-section2-intro', { state: { selectedVocab } });
                        }}
                        disabled={selectedItems.length < 10}
                        className={`rounded-full px-8 h-12 text-base font-bold shadow-lg transition-all ${selectedItems.length >= 10 ? 'bg-purple-600 hover:bg-purple-700 hover:scale-105 shadow-purple-200' : 'bg-slate-200 text-slate-400'}`}
                    >
                        {language === 'th' ? 'ถัดไป' : 'Next'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// Sub-component for Grid
function WordGrid({ words, selectedItems, onToggle, loading, isWeakTab = false, weakWords = [] }: { words: Flashcard[], selectedItems: string[], onToggle: (w: string) => void, loading: boolean, isWeakTab?: boolean, weakWords?: Flashcard[] }) {
    if (loading) {
        return <div className="grid grid-cols-1 gap-2 sm:gap-4 animate-pulse">
            {[...Array(6)].map((_, i) => <div key={i} className="h-14 sm:h-20 bg-slate-50 rounded-xl sm:rounded-2xl" />)}
        </div>;
    }

    if (words.length === 0) {
        return <div className="text-center py-6 sm:py-12 text-slate-400 text-xs sm:text-sm">No words found.</div>;
    }

    return (
        <div className="grid grid-cols-1 gap-2 sm:gap-4 pb-4 px-0 sm:px-2">
            {words.map((card, index) => {
                const isSelected = selectedItems.includes(card.front_text);

                // Check if this word is in the weak words list (for cross-tab coloring)
                const weakIndex = weakWords.findIndex(w => w.front_text === card.front_text);
                const isWeakWord = weakIndex !== -1;

                // Weak Tab Specific Styles (Red Gradients)
                let cardStyle = "bg-white border-transparent hover:border-slate-100 hover:shadow-md";
                let textClass = "text-slate-800";
                let subTextClass = "text-slate-400";
                let badge = null;
                let circleClass = isSelected
                    ? 'border-purple-500 bg-purple-500 shadow-md shadow-purple-200'
                    : 'border-slate-200 bg-white group-hover:border-purple-300';
                let checkColor = "text-white";

                // Determine which index to use for coloring
                const colorIndex = isWeakTab ? index : weakIndex;

                // Apply red coloring if this is weak tab OR if word is in weak words list
                if (isWeakTab || isWeakWord) {
                    // Group 1: Top 3 Critical (Lowest Scores) -> Dark Red
                    if (colorIndex < 3) {
                        cardStyle = "bg-[#b91c1c] border-transparent text-white hover:brightness-110 shadow-md shadow-red-200";
                        textClass = "text-white";
                        subTextClass = "text-white/80";
                        circleClass = "border-white/30 bg-white/10 group-hover:bg-white/20";
                        if (isSelected) circleClass = "border-white bg-white text-red-600";
                        checkColor = "text-red-600";
                        badge = <span className="ml-1 sm:ml-2 bg-black/20 text-white text-[8px] sm:text-[10px] px-1 sm:px-2 py-0.5 rounded-full font-bold hidden sm:inline">
                            วิกฤต
                        </span>;
                    }
                    // Group 2: Next 2 Urgent -> Lighter Red
                    else if (colorIndex < 5) {
                        cardStyle = "bg-[#ef4444] border-transparent text-white hover:brightness-110 shadow-md shadow-red-200";
                        textClass = "text-white";
                        subTextClass = "text-white/80";
                        circleClass = "border-white/30 bg-white/10 group-hover:bg-white/20";
                        if (isSelected) circleClass = "border-white bg-white text-red-600";
                        checkColor = "text-red-600";
                        badge = <span className="ml-1 sm:ml-2 bg-black/20 text-white text-[8px] sm:text-[10px] px-1 sm:px-2 py-0.5 rounded-full font-bold hidden sm:inline">
                            เร่งด่วน
                        </span>;
                    }
                    // Group 3: The rest (6-15) -> Light Pink
                    else {
                        cardStyle = "bg-[#fee2e2] border-transparent text-red-950 hover:brightness-105";
                        textClass = "text-red-950";
                        subTextClass = "text-red-800";
                        circleClass = "border-red-300 bg-white/50";
                        if (isSelected) circleClass = "border-red-600 bg-red-600 text-white";
                        checkColor = "text-white";
                        badge = <span className="ml-1 sm:ml-2 bg-red-200 text-red-800 text-[8px] sm:text-[10px] px-1 sm:px-2 py-0.5 rounded-full font-bold hidden sm:inline">
                            ทบทวน
                        </span>;
                    }
                } else if (isSelected) {
                    cardStyle = "bg-white border-purple-100 shadow-lg shadow-purple-50";
                }

                return (
                    <div
                        key={card.id}
                        onClick={() => onToggle(card.front_text)}
                        className={`cursor-pointer group flex items-center gap-2 sm:gap-4 p-2 sm:p-5 rounded-xl sm:rounded-2xl border transition-all duration-200 ${cardStyle}`}
                    >
                        {/* Status Circle */}
                        <div className={`w-5 h-5 sm:w-8 sm:h-8 shrink-0 rounded-full border-2 sm:border-[3px] flex items-center justify-center transition-all duration-300 ${circleClass}`}>
                            {isSelected && <Check className={`w-2.5 h-2.5 sm:w-4 sm:h-4 stroke-[3] ${checkColor}`} />}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                                <h4 className={`text-xs sm:text-xl font-bold leading-none truncate ${textClass}`}>
                                    {card.front_text}
                                </h4>
                                {badge}
                            </div>
                            <p className={`text-[10px] sm:text-base font-medium leading-normal truncate ${subTextClass}`}>
                                {card.back_text}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
