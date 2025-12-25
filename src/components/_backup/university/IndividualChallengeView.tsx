import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Zap, Clock, Trophy, Share2, Crown, Flag, Lightbulb, ChevronRight, Play, X, BookOpen, Download, Folder, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

interface MyStats {
    rank: number;
    bestTime: string;
    nextRank: number;
}

interface IndividualChallengeViewProps {
    timeLeft: TimeLeft;
    myStats: MyStats;
    onStartGame: (isWarmup: boolean) => void;
}

export function IndividualChallengeView({ timeLeft, myStats, onStartGame }: IndividualChallengeViewProps) {
    const [showVocabDialog, setShowVocabDialog] = useState(false);
    const [showFolderDropdown, setShowFolderDropdown] = useState(false);
    const [folders, setFolders] = useState<{ id: string; title: string; card_sets_count: number }[]>([]);
    const [loadingFolders, setLoadingFolders] = useState(false);
    const [savingToFolder, setSavingToFolder] = useState<string | null>(null);
    const { toast } = useToast();

    // Fetch user folders when dialog opens
    useEffect(() => {
        if (showVocabDialog) {
            fetchUserFolders();
        }
    }, [showVocabDialog]);

    const fetchUserFolders = async () => {
        setLoadingFolders(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: setsData } = await supabase
                .from('user_flashcard_sets')
                .select('id, folder_id')
                .eq('user_id', user.id);

            const { data: foldersData } = await supabase
                .from('user_folders')
                .select('id, title, created_at')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            const foldersWithCount = (foldersData || []).map(folder => {
                const count = (setsData || []).filter(set => set.folder_id === folder.id).length;
                return { id: folder.id, title: folder.title, card_sets_count: count };
            });

            setFolders(foldersWithCount);
        } catch (error) {
            console.error('Error fetching folders:', error);
        } finally {
            setLoadingFolders(false);
        }
    };

    const handleSaveToFolder = async (folderId: string) => {
        setSavingToFolder(folderId);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Create a new flashcard set
            const { data: newSet, error: setError } = await supabase
                .from('user_flashcard_sets')
                .insert({
                    user_id: user.id,
                    folder_id: folderId,
                    title: 'Challenge คำศัพท์ JAN 2026',
                    card_count: vocabData.length,
                    source: 'marketcard'
                })
                .select()
                .single();

            if (setError) throw setError;

            // Insert flashcards
            const userFlashcards = vocabData.map(word => ({
                user_id: user.id,
                flashcard_set_id: newSet.id,
                front_text: word.front,
                back_text: word.back
            }));

            const { error: insertError } = await supabase
                .from('user_flashcards')
                .insert(userFlashcards);

            if (insertError) throw insertError;

            toast({
                title: "บันทึกสำเร็จ! 🎉",
                description: `เก็บ ${vocabData.length} คำศัพท์ลงในโฟลเดอร์เรียบร้อย`,
                className: "bg-green-50 border-green-200 text-green-800"
            });

            setShowFolderDropdown(false);
        } catch (error) {
            console.error('Save error:', error);
            toast({
                title: "เกิดข้อผิดพลาด",
                description: `ไม่สามารถบันทึกได้: ${(error as any).message || 'Unknown error'}`,
                variant: "destructive"
            });
        } finally {
            setSavingToFolder(null);
        }
    };

    // Sample vocabulary data for the challenge (30 words)
    const vocabData = [
        { no: 1, front: "apple", pos: "noun", back: "แอปเปิ้ล" },
        { no: 2, front: "book", pos: "noun", back: "หนังสือ" },
        { no: 3, front: "cat", pos: "noun", back: "แมว" },
        { no: 4, front: "dog", pos: "noun", back: "สุนัข" },
        { no: 5, front: "elephant", pos: "noun", back: "ช้าง" },
        { no: 6, front: "fish", pos: "noun", back: "ปลา" },
        { no: 7, front: "green", pos: "adj", back: "สีเขียว" },
        { no: 8, front: "happy", pos: "adj", back: "มีความสุข" },
        { no: 9, front: "ice", pos: "noun", back: "น้ำแข็ง" },
        { no: 10, front: "jump", pos: "verb", back: "กระโดด" },
        { no: 11, front: "kind", pos: "adj", back: "ใจดี" },
        { no: 12, front: "lemon", pos: "noun", back: "มะนาว" },
        { no: 13, front: "mountain", pos: "noun", back: "ภูเขา" },
        { no: 14, front: "night", pos: "noun", back: "กลางคืน" },
        { no: 15, front: "orange", pos: "noun", back: "ส้ม" },
        { no: 16, front: "play", pos: "verb", back: "เล่น" },
        { no: 17, front: "quiet", pos: "adj", back: "เงียบ" },
        { no: 18, front: "run", pos: "verb", back: "วิ่ง" },
        { no: 19, front: "sun", pos: "noun", back: "ดวงอาทิตย์" },
        { no: 20, front: "tree", pos: "noun", back: "ต้นไม้" },
        { no: 21, front: "umbrella", pos: "noun", back: "ร่ม" },
        { no: 22, front: "village", pos: "noun", back: "หมู่บ้าน" },
        { no: 23, front: "water", pos: "noun", back: "น้ำ" },
        { no: 24, front: "xylophone", pos: "noun", back: "ระนาด" },
        { no: 25, front: "yellow", pos: "adj", back: "สีเหลือง" },
        { no: 26, front: "zebra", pos: "noun", back: "ม้าลาย" },
        { no: 27, front: "beautiful", pos: "adj", back: "สวยงาม" },
        { no: 28, front: "computer", pos: "noun", back: "คอมพิวเตอร์" },
        { no: 29, front: "dance", pos: "verb", back: "เต้นรำ" },
        { no: 30, front: "exciting", pos: "adj", back: "น่าตื่นเต้น" },
    ];

    return (
        <>
            {/* Vocab Dialog */}
            <Dialog open={showVocabDialog} onOpenChange={setShowVocabDialog}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader className="border-b pb-4">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="flex items-center gap-3 text-xl font-black">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                    <BookOpen className="w-5 h-5 text-white" />
                                </div>
                                รายการคำศัพท์ประจำเดือน
                                <Badge className="bg-rose-100 text-rose-600 ml-2">30 คำ</Badge>
                            </DialogTitle>

                            {/* Download Button with Folder Dropdown */}
                            <Popover open={showFolderDropdown} onOpenChange={setShowFolderDropdown}>
                                <PopoverTrigger asChild>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-bold rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all shadow-md hover:shadow-lg">
                                        <Download className="w-4 h-4" />
                                        บันทึก
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-72 p-0" align="end">
                                    <div className="p-3 border-b bg-slate-50">
                                        <h4 className="font-bold text-slate-700 flex items-center gap-2">
                                            <Folder className="w-4 h-4 text-purple-500" />
                                            เลือกโฟลเดอร์
                                        </h4>
                                        <p className="text-xs text-slate-500 mt-1">บันทึก 30 คำศัพท์ลงในโฟลเดอร์ของคุณ</p>
                                    </div>
                                    <div className="max-h-60 overflow-auto">
                                        {loadingFolders ? (
                                            <div className="p-4 text-center text-slate-400">
                                                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                                                กำลังโหลด...
                                            </div>
                                        ) : folders.length === 0 ? (
                                            <div className="p-4 text-center text-slate-400 text-sm">
                                                ไม่พบโฟลเดอร์<br />
                                                <span className="text-xs">กรุณาสร้างโฟลเดอร์ก่อนในหน้า Deck</span>
                                            </div>
                                        ) : (
                                            folders.map((folder) => (
                                                <button
                                                    key={folder.id}
                                                    onClick={() => handleSaveToFolder(folder.id)}
                                                    disabled={savingToFolder !== null}
                                                    className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors flex items-center justify-between group border-b border-slate-100 last:border-0 disabled:opacity-50"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                                                            <Folder className="w-4 h-4 text-purple-600" />
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-slate-700 text-sm">{folder.title}</div>
                                                            <div className="text-xs text-slate-400">{folder.card_sets_count} ชุด</div>
                                                        </div>
                                                    </div>
                                                    {savingToFolder === folder.id ? (
                                                        <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
                                                    ) : (
                                                        <Check className="w-4 h-4 text-slate-300 group-hover:text-green-500 transition-colors" />
                                                    )}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </DialogHeader>

                    <div className="overflow-auto flex-1 mt-4">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 text-left font-bold text-slate-600 w-16">No.</th>
                                    <th className="px-4 py-3 text-left font-bold text-slate-600">Front</th>
                                    <th className="px-4 py-3 text-left font-bold text-slate-600 w-32">Part of speech</th>
                                    <th className="px-4 py-3 text-left font-bold text-slate-600">Back</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {vocabData.map((word) => (
                                    <tr key={word.no} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 text-slate-400 font-mono">{word.no}</td>
                                        <td className="px-4 py-3 font-semibold text-slate-800">{word.front}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${word.pos === 'noun' ? 'bg-blue-100 text-blue-600' :
                                                word.pos === 'verb' ? 'bg-green-100 text-green-600' :
                                                    'bg-orange-100 text-orange-600'
                                                }`}>
                                                {word.pos}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{word.back}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="grid lg:grid-cols-12 gap-4 lg:gap-6 pt-4">
                {/* Left Column (Main Content) */}
                <div className="lg:col-span-8 space-y-6">

                    {/* 1. Mission Header Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl lg:rounded-[2rem] p-4 lg:p-8 shadow-sm border border-slate-100 relative overflow-hidden"
                    >
                        <div className="flex flex-col lg:flex-row justify-between items-start gap-4 lg:gap-0 relative z-10">
                            <div className="space-y-4 max-w-lg">
                                {/* Badges */}
                                <div className="flex items-center gap-3">
                                    <span className="bg-rose-500 text-white text-[10px] font-black tracking-widest px-3 py-1 rounded skew-x-[-10deg] shadow-md shadow-rose-500/20">
                                        <span className="skew-x-[10deg] block">JAN 2026</span>
                                    </span>
                                    <span className="text-emerald-500 text-[11px] font-bold tracking-widest flex items-center gap-1.5 uppercase">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                        ACTIVE MISSION
                                    </span>
                                </div>

                                {/* Title */}
                                <div className="space-y-0">
                                    <h1 className="text-3xl lg:text-5xl font-black italic tracking-tighter text-slate-900 leading-[0.9]">INDIVIDUAL</h1>
                                    <h1 className="text-4xl lg:text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-green-400 to-teal-400 leading-[0.9]">CHALLENGE</h1>
                                </div>

                                {/* Description with border */}
                                <div className="flex gap-4 pl-0 py-2">
                                    <div className="w-1 bg-emerald-500 rounded-full self-stretch my-1"></div>
                                    <p className="text-slate-500 text-sm leading-relaxed max-w-md">
                                        แข่งขันคำศัพท์ทุกเดือน! พิชิตคะแนนสูงสุด ชิงความเป็นหนึ่ง ขึ้นแท่น Champion ก่อนใคร
                                    </p>
                                </div>

                                {/* Meta Info */}
                                <div className="flex flex-col gap-3 pt-2">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5 text-rose-500" />
                                            <span className="text-xs text-slate-500 font-medium">Ends in:</span>
                                            <span className="text-xs font-mono font-bold text-slate-800">
                                                {String(timeLeft.days).padStart(2, '0')}d : {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 bg-blue-50/50 border border-blue-100/50 w-fit px-3 py-1.5 rounded-lg">
                                        <Trophy className="w-3.5 h-3.5 text-blue-500" />
                                        <span className="text-xs text-slate-500">Reward:</span>
                                        <span className="text-xs font-bold text-blue-600">Forest Guardian Badge</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3 mt-auto self-stretch lg:self-end w-full lg:min-w-[240px] lg:max-w-[280px]">
                                {/* Hearts / Lives Indicator + Cooldown - Cute Design */}
                                <div className="flex items-center justify-between bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100 rounded-2xl px-4 py-3 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        {/* Filled hearts with bounce animation */}
                                        {[1, 2, 3].map((heart, i) => (
                                            <motion.div
                                                key={heart}
                                                animate={{ scale: [1, 1.1, 1] }}
                                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                                className="w-7 h-7 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center shadow-md shadow-pink-200"
                                                style={{ clipPath: 'path("M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z")' }}
                                            >
                                            </motion.div>
                                        ))}
                                        {/* Empty hearts */}
                                        {[4, 5].map((heart) => (
                                            <div
                                                key={heart}
                                                className="w-7 h-7 bg-slate-100 border-2 border-dashed border-slate-200 rounded-full flex items-center justify-center opacity-50"
                                                style={{ clipPath: 'path("M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z")' }}
                                            >
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-500 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-rose-100 shadow-sm">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span className="font-mono tracking-wide">1:23:45</span>
                                    </div>
                                </div>

                                {/* START RUN - Angular Button */}
                                <button
                                    onClick={() => onStartGame(false)}
                                    className="group relative w-full focus:outline-none"
                                >
                                    <div className="absolute inset-0 bg-[#7c3aed] group-hover:bg-[#6d28d9] transition-colors shadow-lg shadow-purple-500/30"
                                        style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}
                                    />
                                    <div className="relative z-10 px-6 py-5 flex items-center justify-between w-full">
                                        <div className="text-left">
                                            <div className="font-[900] italic text-2xl text-white tracking-wider font-mono leading-none">START RUN</div>
                                            <div className="text-[10px] font-bold text-white/80 uppercase tracking-widest mt-1 ml-0.5">RANKED MATCH</div>
                                        </div>
                                        <div className="bg-white text-[#7c3aed] rounded-full p-1.5 group-hover:scale-110 transition-transform shadow-sm">
                                            <Play className="w-5 h-5 fill-current ml-0.5" />
                                        </div>
                                    </div>

                                    {/* Corner accent */}
                                    <div className="absolute top-0 right-0 p-1.5 z-20 opacity-50">
                                        <div className="w-1.5 h-1.5 bg-white/40 rounded-sm"></div>
                                    </div>
                                </button>

                                {/* View Vocab + WARM-UP MODE Row */}
                                <div className="flex gap-2">
                                    {/* View Vocab Button - Same feel as WARM-UP */}
                                    <button
                                        onClick={() => setShowVocabDialog(true)}
                                        className="flex-1 bg-white group relative px-4 py-3 flex items-center justify-center gap-2 text-slate-500 hover:text-slate-700 font-bold uppercase tracking-wider text-[10px] border border-slate-200 hover:border-slate-300 transition-all hover:bg-slate-50 rounded-xl shadow-sm"
                                    >
                                        <span className="text-sm">📚</span> View Deck
                                    </button>

                                    {/* WARM-UP MODE */}
                                    <button
                                        onClick={() => onStartGame(true)}
                                        className="flex-1 bg-white group relative px-4 py-3 flex items-center justify-center gap-2 text-slate-500 hover:text-slate-700 font-bold uppercase tracking-wider text-[10px] border border-slate-200 hover:border-slate-300 transition-all hover:bg-slate-50 rounded-xl shadow-sm"
                                    >
                                        <Zap className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                                        WARM-UP
                                    </button>
                                </div>
                            </div>
                        </div>
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-purple-50/50 to-transparent pointer-events-none" />
                    </motion.div>

                    {/* 2. University War Zone Leaderboard */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-50">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                                    <Flag className="w-5 h-5 text-red-500 fill-red-500" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black uppercase tracking-wide text-slate-800">RANKING</h2>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                                        LIVE GLOBAL RANKING
                                    </div>
                                </div>
                            </div>
                            <div className="flex bg-slate-100 rounded-lg p-1">
                                {['GLOBAL', 'FRIENDS'].map((tab, i) => (
                                    <button
                                        key={tab}
                                        className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all ${i === 0 ? 'bg-[#0ea5e9] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Table Header - Hidden on mobile */}
                        <div className="hidden lg:grid grid-cols-12 gap-4 px-8 py-3 bg-slate-50/50 text-[10px] font-bold text-slate-400 tracking-widest border-b border-slate-50 uppercase">
                            <div className="col-span-1">Rank</div>
                            <div className="col-span-5">University / Player</div>
                            <div className="col-span-2 text-center">Score</div>
                            <div className="col-span-2 text-center">Time</div>
                            <div className="col-span-2 text-right">Status</div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-slate-50">
                            {/* Row 1 - Somchai */}
                            <div className="flex lg:grid lg:grid-cols-12 gap-2 lg:gap-4 px-4 lg:px-8 py-3 lg:py-4 items-center hover:bg-slate-50/50 transition-colors flex-wrap">
                                <div className="lg:col-span-1 hidden lg:block">
                                    <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-white shadow-sm">
                                        <Crown className="w-4 h-4 fill-white" />
                                    </div>
                                </div>
                                <div className="flex-1 lg:col-span-5">
                                    <div className="flex items-center gap-2 lg:gap-3">
                                        <div className="w-8 lg:w-10 h-8 lg:h-10 rounded-lg lg:rounded-xl bg-slate-800 shrink-0 overflow-hidden">
                                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Somchai" alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800 text-xs lg:text-sm">Somchai_TH</div>
                                            <div className="text-[9px] lg:text-[10px] font-semibold text-slate-500 flex items-center gap-1 uppercase">
                                                <span>🎓</span> CHULALONGKORN
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="lg:col-span-2 text-center">
                                    <span className="bg-emerald-100 text-emerald-600 text-[10px] lg:text-[11px] font-bold px-2 py-0.5 rounded">30/30</span>
                                </div>
                                <div className="hidden lg:block lg:col-span-2 text-center font-mono font-bold text-slate-700 text-sm">01:12.4589</div>
                                <div className="hidden lg:block lg:col-span-2 text-right">
                                    <span className="text-[10px] font-bold text-cyan-400 flex items-center justify-end gap-1">
                                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span> IN GAME
                                    </span>
                                </div>
                            </div>

                            {/* Row 2 - EmmaW */}
                            <div className="grid grid-cols-12 gap-4 px-8 py-4 items-center hover:bg-slate-50/50 transition-colors">
                                <div className="col-span-1">
                                    <span className="text-xl font-bold text-slate-300 font-mono">2</span>
                                </div>
                                <div className="col-span-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-800 shrink-0 overflow-hidden">
                                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Emma" alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800 text-sm">EmmaW</div>
                                            <div className="text-[10px] font-semibold text-slate-500 flex items-center gap-1 uppercase">
                                                <span>🎓</span> MAHIDOL UNIV.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-2 text-center">
                                    <span className="text-emerald-500 text-[11px] font-bold">29/30</span>
                                </div>
                                <div className="col-span-2 text-center font-mono font-bold text-slate-700 text-sm">01:15.2844</div>
                                <div className="col-span-2 text-right">
                                    <span className="text-[10px] font-medium text-slate-400">2m ago</span>
                                </div>
                            </div>

                            {/* Row 3 - Kenji */}
                            <div className="grid grid-cols-12 gap-4 px-8 py-4 items-center hover:bg-slate-50/50 transition-colors">
                                <div className="col-span-1">
                                    <span className="text-xl font-bold text-slate-300 font-mono">3</span>
                                </div>
                                <div className="col-span-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-800 shrink-0 overflow-hidden">
                                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Kenji" alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800 text-sm">Kenji_JP</div>
                                            <div className="text-[10px] font-semibold text-slate-500 flex items-center gap-1 uppercase">
                                                <span>🎓</span> THAMMASAT UNIV.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-2 text-center">
                                    <span className="text-emerald-500 text-[11px] font-bold">28/30</span>
                                </div>
                                <div className="col-span-2 text-center font-mono font-bold text-slate-700 text-sm">01:18.0012</div>
                                <div className="col-span-2 text-right">
                                    <span className="text-[10px] font-medium text-slate-400">5m ago</span>
                                </div>
                            </div>

                            {/* Row 4 - YOU */}
                            <div className="grid grid-cols-12 gap-4 px-8 py-4 items-center bg-purple-50/50 border-l-4 border-purple-500">
                                <div className="col-span-1">
                                    <span className="text-lg font-black text-purple-600 font-mono">428</span>
                                </div>
                                <div className="col-span-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl border-2 border-purple-500 bg-white shrink-0 flex items-center justify-center">
                                            <span className="text-purple-600 font-bold text-[10px]">YOU</span>
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800 text-sm">CyberPlayer</div>
                                            <div className="text-[10px] font-semibold text-purple-600 flex items-center gap-1 uppercase">
                                                <span>🎓</span> CHULALONGKORN UNIV.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-2 text-center">
                                    <span className="text-purple-600 text-[11px] font-black">30/30</span>
                                </div>
                                <div className="col-span-2 text-center font-mono font-bold text-slate-800 text-sm">01:45.0000</div>
                                <div className="col-span-2 text-right">
                                    <span className="bg-cyan-100/50 text-cyan-600 text-[9px] font-bold px-2 py-0.5 rounded border border-cyan-200 uppercase inline-block text-center leading-tight">
                                        +12<br />Ranks
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-50 text-center">
                            <button className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest flex items-center justify-center gap-1 transition-colors">
                                View Full Global Standing <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                    </motion.div>
                </div >

                {/* Right Column (Sidebar) - Hidden on mobile */}
                < div className="hidden lg:block lg:col-span-4 space-y-6" >

                    {/* 1. Combat Stats */}
                    < motion.div
                        initial={{ opacity: 0, x: 10 }
                        }
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-100 relative"
                    >
                        {/* Corner accents */}
                        < div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg mt-4 mr-4" ></div >
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg mb-4 ml-4"></div>

                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">COMBAT STATS</h3>
                            <Badge variant="secondary" className="bg-purple-100 text-purple-600 text-[9px] font-bold rounded-md uppercase tracking-wider">JAN 2026</Badge>
                        </div>

                        <div className="flex gap-4 mb-6">
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex-1">
                                <p className="text-3xl font-black text-slate-800 mb-1">#{myStats.rank}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">GLOBAL RANK</p>
                                <div className="flex gap-0.5 mt-2 items-end h-3">
                                    <div className="w-1 bg-slate-300 h-2 rounded-sm"></div>
                                    <div className="w-1 bg-slate-300 h-1.5 rounded-sm"></div>
                                    <div className="w-1 bg-purple-500 h-3 rounded-sm"></div>
                                </div>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex-1">
                                <p className="text-2xl font-black text-[#0ea5e9] mb-1 font-mono">01:45.00</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">BEST TIME</p>
                                <Clock className="w-3 h-3 text-slate-300 mt-2" />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider mb-2">
                                <span className="text-slate-500">XP Progress [Lvl 42]</span>
                                <span className="text-purple-600">Next Rank: #400 (-0.5s)</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 w-[70%] rounded-full"></div>
                            </div>
                        </div>
                    </motion.div >

                    {/* 2. Tactical Intel */}
                    < motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-[#eff6ff] rounded-[1.5rem] p-5 border border-blue-100 flex items-start gap-4"
                    >
                        <div className="bg-white p-2.5 rounded-xl text-blue-500 shadow-sm shrink-0">
                            <Lightbulb className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-[#1e293b] mb-1">TACTICAL INTEL</h4>
                            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                                Execute combos faster using keys <span className="bg-white border border-slate-200 px-1 rounded text-[9px] text-slate-700">1</span> - <span className="bg-white border border-slate-200 px-1 rounded text-[9px] text-slate-700">4</span>. Reduce input lag by anticipating the next node.
                            </p>
                        </div>
                    </motion.div >

                    {/* 3. Hall of Fame (Simplified for space) */}
                    < motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 }}
                        className="bg-[#fffbeb] rounded-[1.5rem] p-5 border border-yellow-100"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-yellow-600" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">HALL OF FAME</h3>
                            </div>
                            <Badge className="bg-yellow-200 text-yellow-800 text-[8px] font-bold rounded uppercase tracking-wider hover:bg-yellow-200">LEGENDS</Badge>
                        </div>

                        <div className="bg-white/60 p-3 rounded-xl border border-yellow-100/50 flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 bg-slate-900 rounded-lg overflow-hidden">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute -top-1 -right-1 bg-yellow-400 text-white text-[8px] w-4 h-4 flex items-center justify-center font-bold rounded-full border border-white">1</div>
                            </div>
                            <div>
                                <div className="text-[9px] font-bold text-yellow-600 uppercase tracking-wider">S4 CHAMPION</div>
                                <div className="text-xs font-black text-slate-800">Sarah_BKK</div>
                                <div className="text-[10px] text-slate-500 mt-0.5">Score: 5,700</div>
                            </div>
                            <Trophy className="w-3 h-3 text-yellow-400 ml-auto" />
                        </div>
                    </motion.div >

                    {/* 4. Flaunt Your Rank */}
                    < motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-100 relative overflow-hidden"
                    >
                        {/* Grid Background */}
                        < div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" ></div >

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-[#f43f5e] rounded-full flex items-center justify-center text-white shadow-lg shadow-rose-500/30 mb-4 ring-4 ring-rose-100">
                                <Share2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-[#1e293b] mb-1">FLAUNT YOUR RANK</h3>
                            <p className="text-[10px] text-slate-400 max-w-[200px] mb-5 font-medium">Generate a holographic battle card of your current season stats.</p>
                            <button className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white text-[11px] font-bold py-3 rounded-lg uppercase tracking-wide shadow-lg transition-all relative overflow-hidden group">
                                <span className="relative z-10">Create Battle Card <span className="text-slate-500 text-[9px] normal-case tracking-normal ml-1">(Preview)</span></span>
                                <div className="absolute inset-0 w-full h-full bg-slate-800 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                            </button>
                        </div>
                    </motion.div >
                </div >
            </div >
        </>
    );
}
