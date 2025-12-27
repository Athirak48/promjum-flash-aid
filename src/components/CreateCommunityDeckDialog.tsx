import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Plus, Folder, BookOpen, Globe, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface CreateCommunityDeckDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

interface UserFolder {
    id: string;
    name: string;
}

interface SubDeck {
    id: string;
    name: string;
    total_cards: number;
}

export function CreateCommunityDeckDialog({ open, onOpenChange, onSuccess }: CreateCommunityDeckDialogProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [emoji, setEmoji] = useState('📦');
    const [category, setCategory] = useState<string>('English');
    const [tags, setTags] = useState<string>('');

    // Selection State
    const [folders, setFolders] = useState<UserFolder[]>([]);
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
    const [folderDecks, setFolderDecks] = useState<SubDeck[]>([]);
    const [selectedSourceDeckIds, setSelectedSourceDeckIds] = useState<Set<string>>(new Set());

    // Fetch Folders on Open
    useEffect(() => {
        if (open) {
            fetchFolders();
        }
    }, [open]);

    // Fetch Decks when Folder Changes
    useEffect(() => {
        if (selectedFolderId) {
            fetchFolderDecks(selectedFolderId);
        } else {
            setFolderDecks([]);
        }
    }, [selectedFolderId]);

    const fetchFolders = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('user_folders')
                .select('id, title')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            // Filter out 'Community Uploads' folder and map title to name
            const filteredFolders = (data || [])
                .filter((f: any) => f.title !== 'Community Uploads')
                .map((f: any) => ({ id: f.id, name: f.title }));

            setFolders(filteredFolders);
            if (filteredFolders.length > 0) setSelectedFolderId(filteredFolders[0].id);
        } catch (error) {
            console.error('Error fetching folders:', error);
        }
    };

    const fetchFolderDecks = async (folderId: string) => {
        try {
            const { data, error } = await supabase
                .from('user_flashcard_sets')
                .select('id, title, card_count')
                .eq('folder_id', folderId);

            if (error) throw error;

            const formatted = (data || []).map((d: any) => ({
                id: d.id,
                name: d.title,
                total_cards: d.card_count || 0
            }));
            setFolderDecks(formatted);
        } catch (error) {
            console.error('Error fetching decks:', error);
        }
    };

    const toggleDeckSelection = (deckId: string) => {
        const newSet = new Set(selectedSourceDeckIds);
        if (newSet.has(deckId)) {
            newSet.delete(deckId);
        } else {
            newSet.add(deckId);
        }
        setSelectedSourceDeckIds(newSet);
    };

    const handleSubmit = async () => {
        if (!name) {
            toast.error('กรุณาใส่ชื่อ Deck');
            return;
        }
        if (selectedSourceDeckIds.size === 0) {
            toast.error('กรุณาเลือกชุดคำศัพท์อย่างน้อย 1 ชุด');
            return;
        }

        setLoading(true);
        try {
            const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);

            const { data, error } = await supabase.rpc('create_combined_community_deck', {
                p_name: name,
                p_description: description,
                p_category: category,
                p_tags: tagArray,
                p_source_sub_deck_ids: Array.from(selectedSourceDeckIds),
                p_emoji: emoji
            });

            if (error) throw error;

            toast.success('สร้าง Community Deck สำเร็จ! 🎉');
            onSuccess?.();
            onOpenChange(false);
            resetForm();

        } catch (error: any) {
            console.error('Error creating deck:', error);
            toast.error('เกิดข้อผิดพลาด: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setStep(1);
        setName('');
        setDescription('');
        setEmoji('📦');
        setSelectedSourceDeckIds(new Set());
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-slate-900 text-white border-slate-700">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Globe className="w-6 h-6 text-purple-400" />
                        สร้างและแชร์ Deck
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        สร้าง Deck ใหม่โดยรวบรวมชุดคำศัพท์จาก Folder ส่วนตัวของคุณเพื่อแบ่งปันให้ชุมชน
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {step === 1 ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-4 gap-4">
                                <div className="col-span-1">
                                    <Label>Emoji</Label>
                                    <div className="mt-1.5 flex items-center justify-center">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-16 h-14 text-3xl bg-slate-800 border-slate-700 hover:bg-slate-700 p-0"
                                                >
                                                    {emoji}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 border-none bg-transparent">
                                                <EmojiPicker
                                                    theme={Theme.DARK}
                                                    onEmojiClick={(emojiData) => setEmoji(emojiData.emoji)}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                                <div className="col-span-3">
                                    <Label>ชื่อ Deck</Label>
                                    <Input
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="เช่น รวมศัพท์ TOEIC, ศัพท์หมวดสัตว์..."
                                        className="mt-1.5 bg-slate-800 border-slate-700 focus:border-purple-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>คำอธิบาย</Label>
                                <Textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="อธิบายเกี่ยวกับ Deck ของคุณ..."
                                    className="mt-1.5 bg-slate-800 border-slate-700 focus:border-purple-500 min-h-[80px]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>หมวดหมู่ภาษา</Label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger className="mt-1.5 bg-slate-800 border-slate-700">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                            <SelectItem value="English">🇬🇧 อังกฤษ</SelectItem>
                                            <SelectItem value="Chinese">🇨🇳 จีน</SelectItem>
                                            <SelectItem value="Japanese">🇯🇵 ญี่ปุ่น</SelectItem>
                                            <SelectItem value="Korean">🇰🇷 เกาหลี</SelectItem>
                                            <SelectItem value="French">🇫🇷 ฝรั่งเศส</SelectItem>
                                            <SelectItem value="German">🇩🇪 เยอรมัน</SelectItem>
                                            <SelectItem value="Spanish">🇪🇸 สเปน</SelectItem>
                                            <SelectItem value="Other">🗣️ อื่นๆ</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Tags (คั่นด้วยจุลภาค)</Label>
                                    <Input
                                        value={tags}
                                        onChange={e => setTags(e.target.value)}
                                        placeholder="easy, exam, daily..."
                                        className="mt-1.5 bg-slate-800 border-slate-700 focus:border-purple-500"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Folder Selector */}
                            <div className="flex items-center gap-2 mb-4">
                                <Folder className="w-5 h-5 text-purple-400" />
                                <Select value={selectedFolderId || ''} onValueChange={setSelectedFolderId}>
                                    <SelectTrigger className="flex-1 bg-slate-800 border-slate-700">
                                        <SelectValue placeholder="เลือก Folder" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                        {folders.map(f => (
                                            <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex justify-between items-center text-sm text-slate-400 px-1">
                                <span>เลือกชุดคำศัพท์ที่จะรวม:</span>
                                <Badge variant="secondary" className="bg-purple-900/50 text-purple-300 hover:bg-purple-900/50">
                                    เลือกแล้ว {selectedSourceDeckIds.size} ชุด
                                </Badge>
                            </div>

                            <ScrollArea className="h-[300px] pr-4 border rounded-lg border-slate-700 bg-slate-900/50 p-2">
                                <div className="space-y-2">
                                    {folderDecks.length === 0 ? (
                                        <div className="text-center py-8 text-slate-500">
                                            ไม่พบชุดคำศัพท์ใน Folder นี้
                                        </div>
                                    ) : (
                                        folderDecks.map(deck => (
                                            <div
                                                key={deck.id}
                                                className={`
                          flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all
                          ${selectedSourceDeckIds.has(deck.id)
                                                        ? 'bg-purple-500/20 border-purple-500/50'
                                                        : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'}
                        `}
                                                onClick={() => toggleDeckSelection(deck.id)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Checkbox checked={selectedSourceDeckIds.has(deck.id)} className="border-slate-500 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500" />
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{deck.name}</p>
                                                        <p className="text-xs text-slate-400">{deck.total_cards} คำศัพท์</p>
                                                    </div>
                                                </div>
                                                {selectedSourceDeckIds.has(deck.id) && <Check className="w-4 h-4 text-purple-400" />}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>

                            <p className="text-xs text-slate-500 mt-2">
                                * คุณสามารถเปลี่ยน Folder เพื่อเลือกชุดคำศัพท์เพิ่มได้ โดยที่รายการที่เลือกไว้ก่อนหน้าจะไม่หายไป
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex gap-2 sm:justify-between">
                    {step === 2 && (
                        <Button variant="ghost" onClick={() => setStep(1)} disabled={loading} className="text-slate-400 hover:text-white">
                            กลับ
                        </Button>
                    )}
                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                        {step === 1 ? (
                            <Button onClick={() => setStep(2)} className="bg-purple-600 hover:bg-purple-700 text-white">
                                ต่อไป
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={loading || selectedSourceDeckIds.size === 0}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] border-none"
                            >
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                แชร์ไปยัง Community
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
