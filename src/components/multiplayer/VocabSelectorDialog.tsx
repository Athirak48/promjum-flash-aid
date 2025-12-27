import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    BookOpen,
    Search,
    Check,
    Folder,
    Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

interface VocabSelectorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (flashcards: Array<{ id: string; front: string; back: string }>) => void;
    minCount?: number;
    maxCount?: number;
}

interface Flashcard {
    id: string;
    front: string;
    back: string;
    uploadId?: string;
    uploadName?: string;
}

interface Upload {
    id: string;
    name: string;
    folder_id?: string;
}

export function VocabSelectorDialog({
    open,
    onOpenChange,
    onConfirm,
    minCount = 10,
    maxCount = 50
}: VocabSelectorDialogProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [uploads, setUploads] = useState<Upload[]>([]);
    const [folders, setFolders] = useState<{ id: string; title: string }[]>([]);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
    const [selectedUpload, setSelectedUpload] = useState<string | null>(null);
    const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');

    // Load initial data
    useEffect(() => {
        if (open && user) {
            loadInitialData();
        }
    }, [open, user]);

    // Load flashcards when upload selected
    useEffect(() => {
        if (selectedUpload) {
            loadFlashcards(selectedUpload);
        } else {
            setFlashcards([]);
            setSelectedCards(new Set());
        }
    }, [selectedUpload]);

    const loadInitialData = async () => {
        if (!user) return;
        setLoading(true);

        try {
            // Fetch Folders
            const { data: foldersData } = await (supabase as any)
                .from('user_folders')
                .select('id, title')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (foldersData) {
                setFolders(foldersData);
            }

            // Fetch Sets with folder_id
            const { data: setsData } = await (supabase as any)
                .from('user_flashcard_sets')
                .select('id, title, folder_id')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (setsData) {
                setUploads(setsData.map((u: any) => ({
                    id: u.id,
                    name: u.title,
                    folder_id: u.folder_id
                })));
            }
        } catch (err) {
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadFlashcards = async (uploadId: string) => {
        setLoading(true);

        try {
            const { data } = await supabase
                .from('user_flashcards')
                .select('id, front_text, back_text')
                .eq('flashcard_set_id', uploadId);

            if (data) {
                setFlashcards(data.map(f => ({
                    id: f.id,
                    front: f.front_text,
                    back: f.back_text
                })));
            }
        } catch (err) {
            console.error('Error loading flashcards:', err);
        } finally {
            setLoading(false);
        }
    };

    // Filter sets based on selected folder
    const filteredUploads = uploads.filter(u => u.folder_id === selectedFolderId);

    // ... (rest of logic)

    const toggleCard = (cardId: string) => {
        const newSelected = new Set(selectedCards);
        if (newSelected.has(cardId)) {
            newSelected.delete(cardId);
        } else if (newSelected.size < maxCount) {
            newSelected.add(cardId);
        }
        setSelectedCards(newSelected);
    };

    const selectAll = () => {
        const filtered = filteredCards;
        const toSelect = filtered.slice(0, maxCount);
        setSelectedCards(new Set(toSelect.map(c => c.id)));
    };

    const deselectAll = () => {
        setSelectedCards(new Set());
    };

    const handleConfirm = () => {
        const selected = flashcards.filter(f => selectedCards.has(f.id));
        onConfirm(selected);
    };

    const filteredCards = flashcards.filter(card =>
        searchQuery === '' ||
        card.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.back.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isValid = selectedCards.size >= minCount && selectedCards.size <= maxCount;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 border-white/10 text-white flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-pink-400" />
                        เลือกคำศัพท์ ({minCount}-{maxCount} คำ)
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        {/* 1. Folder Selection */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-300">1. เลือก Folder</label>
                            <Select
                                value={selectedFolderId || undefined}
                                onValueChange={(value) => {
                                    setSelectedFolderId(value);
                                    setSelectedUpload(null); // Reset set selection
                                }}
                            >
                                <SelectTrigger className="w-full bg-white/5 border-white/20 text-white h-12 rounded-xl">
                                    <div className="flex items-center gap-2">
                                        <Folder className="w-4 h-4 text-sky-400" />
                                        <SelectValue placeholder="เลือก Folder..." />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-white/10 text-white">
                                    {folders.map((folder) => (
                                        <SelectItem key={folder.id} value={folder.id} className="focus:bg-white/10 cursor-pointer">
                                            {folder.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* 2. Set Selection */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-300">2. เลือกชุดคำศัพท์</label>
                            <Select
                                value={selectedUpload || undefined}
                                onValueChange={(value) => setSelectedUpload(value)}
                                disabled={!selectedFolderId}
                            >
                                <SelectTrigger className={`w-full h-12 rounded-xl transition-all ${!selectedFolderId
                                    ? 'bg-white/5 border-white/10 text-slate-500 cursor-not-allowed'
                                    : 'bg-white/5 border-white/20 text-white'
                                    }`}>
                                    <div className="flex items-center gap-2">
                                        <BookOpen className={`w-4 h-4 ${!selectedFolderId ? 'text-slate-600' : 'text-pink-400'}`} />
                                        <SelectValue placeholder={!selectedFolderId ? "กรุณาเลือก Folder ก่อน" : "เลือกชุดคำศัพท์..."} />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-white/10 text-white">
                                    {filteredUploads.length === 0 ? (
                                        <div className="p-2 text-sm text-slate-400 text-center">ไม่มีชุดคำศัพท์ใน Folder นี้</div>
                                    ) : (
                                        filteredUploads.map((upload) => (
                                            <SelectItem key={upload.id} value={upload.id} className="focus:bg-white/10 cursor-pointer">
                                                {upload.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="ค้นหาคำศัพท์..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                        />
                    </div>

                    {/* Selection controls */}
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">
                            เลือกแล้ว: <span className={`font-bold ${isValid ? 'text-green-400' : 'text-yellow-400'}`}>
                                {selectedCards.size}
                            </span> / {maxCount} คำ
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={selectAll}
                                className="text-xs text-purple-400 hover:text-purple-300"
                            >
                                เลือกทั้งหมด
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={deselectAll}
                                className="text-xs text-slate-400 hover:text-white"
                            >
                                ยกเลิกทั้งหมด
                            </Button>
                        </div>
                    </div>

                    {/* Flashcards list */}
                    <div className="flex-1 overflow-y-auto pr-4 min-h-0">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                            </div>
                        ) : filteredCards.length > 0 ? (
                            <div className="space-y-2">
                                {filteredCards.map((card, index) => (
                                    <motion.div
                                        key={card.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.02 }}
                                        onClick={() => toggleCard(card.id)}
                                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedCards.has(card.id)
                                            ? 'bg-pink-500/20 border-pink-500/50'
                                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                                            }`}
                                    >
                                        <Checkbox
                                            checked={selectedCards.has(card.id)}
                                            onCheckedChange={() => toggleCard(card.id)}
                                            className="border-white/30 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-white truncate">{card.front}</p>
                                            <p className="text-sm text-slate-400 truncate">{card.back}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-400">
                                <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                <p>ไม่พบคำศัพท์</p>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        onClick={handleConfirm}
                        disabled={!isValid}
                        className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold rounded-xl h-12 disabled:opacity-50"
                    >
                        <Check className="w-5 h-5 mr-2" />
                        ยืนยัน ({selectedCards.size} คำ)
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
