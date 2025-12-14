import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, FolderPlus, Search, Plus, X, FolderOpen, Heart, Waves } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FolderSelectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectFolder: (folderId: string, folderName: string) => Promise<void> | void;
}

export const FolderSelectionDialog = ({ open, onOpenChange, onSelectFolder }: FolderSelectionDialogProps) => {
    const [folders, setFolders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFolder, setSelectedFolder] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [creatingLoading, setCreatingLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false); // New state for save operation
    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            fetchFolders();
            setSearchTerm('');
            setIsCreating(false);
            setNewFolderName('');
            setSelectedFolder('');
            setIsSaving(false);
        }
    }, [open]);

    const fetchFolders = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setFolders([]);
                return;
            }

            // Fetch folders
            const { data: foldersData, error: foldersError } = await supabase
                .from('user_folders')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (foldersError) throw foldersError;

            // Fetch sets count for each folder
            const { data: setsData } = await supabase
                .from('user_flashcard_sets')
                .select('id, folder_id')
                .eq('user_id', user.id);

            const foldersWithCount = (foldersData || []).map(folder => {
                const count = (setsData || []).filter(set => set.folder_id === folder.id).length;
                return {
                    ...folder,
                    card_sets_count: count
                };
            });

            setFolders(foldersWithCount);
        } catch (error) {
            console.error('Error fetching folders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFolder = async (folderName: string = newFolderName) => {
        if (!folderName.trim()) return null;

        try {
            setCreatingLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return null;

            const { data, error } = await supabase
                .from('user_folders')
                .insert([{
                    user_id: user.id,
                    title: folderName.trim(),
                    card_sets_count: 0
                }])
                .select()
                .single();

            if (error) throw error;

            const newFolder = { ...data, card_sets_count: 0 };
            setFolders([newFolder, ...folders]);
            setNewFolderName('');
            setIsCreating(false);
            setSelectedFolder(data.id);

            toast({
                title: "สร้างโฟลเดอร์สำเร็จ ✨",
                description: `พร้อมเก็บ deck ลงใน ${newFolder.title} แล้ว`,
                className: "bg-sky-50 border-sky-200 text-sky-800"
            });

            return { id: data.id, title: data.title };
        } catch (error) {
            console.error('Error creating folder:', error);
            toast({
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถสร้างโฟลเดอร์ได้",
                variant: "destructive"
            });
            return null;
        } finally {
            setCreatingLoading(false);
        }
    };

    const handleSave = async () => {
        let targetFolderId = selectedFolder;
        let targetFolderName = folders.find(f => f.id === selectedFolder)?.title;

        // Smart Save: Auto-create if typing implies intent
        if (isCreating && newFolderName.trim()) {
            const created = await handleCreateFolder(newFolderName);
            if (created) {
                targetFolderId = created.id;
                targetFolderName = created.title;
            } else {
                return;
            }
        }

        if (targetFolderId && targetFolderName) {
            try {
                setIsSaving(true);
                await onSelectFolder(targetFolderId, targetFolderName);
            } catch (err) {
                console.error("Save failed", err);
            } finally {
                setIsSaving(false);
            }
        } else {
            toast({
                title: "กรุณาเลือกโฟลเดอร์",
                description: "เลือกโฟลเดอร์ที่จะเก็บ Deck ก่อนนะ",
                variant: "destructive"
            });
        }
    };

    const filteredFolders = folders.filter(folder =>
        folder.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString: string) => {
        try { return format(new Date(dateString), 'd/MM/yyyy', { locale: th }); } catch { return ''; }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md w-full p-0 gap-0 rounded-[32px] overflow-hidden bg-white dark:bg-slate-900 border-0 shadow-2xl">

                {/* Header */}
                <div className="bg-gradient-to-r from-sky-100 via-cyan-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 p-6 flex justify-between items-start relative overflow-hidden">
                    <div className="relative z-10 w-full">
                        <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-cyan-600 flex items-center gap-2">
                            <span>เลือกโฟลเดอร์เก็บ Deck</span>
                            <span className="text-xl animate-pulse">🌊</span>
                        </DialogTitle>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 font-medium">
                            จัดระเบียบให้ค้นหาง่ายๆ
                        </p>
                    </div>
                    {/* Blobs */}
                    <div className="absolute -top-6 -right-6 w-32 h-32 bg-sky-200/40 rounded-full blur-3xl"></div>
                </div>

                <div className="p-6 pt-4">
                    {/* Search and Create Section */}
                    <div className="mb-4">
                        {isCreating ? (
                            <div className="flex gap-2 animate-in fade-in slide-in-from-top-1">
                                <Input
                                    placeholder="ชื่อโฟลเดอร์ใหม่..."
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    autoFocus
                                    className="flex-1 rounded-2xl border-sky-300 focus:ring-sky-400 bg-white h-11 text-sm shadow-sm"
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                                />
                                <Button
                                    onClick={() => handleCreateFolder()}
                                    disabled={creatingLoading}
                                    className="rounded-2xl px-4 bg-sky-500 hover:bg-sky-600 text-white font-bold h-11 shadow-sm"
                                >
                                    {creatingLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'สร้าง'}
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="rounded-2xl h-11 w-11">
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                                    <Input
                                        placeholder="ค้นหาโฟลเดอร์..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-sky-400 h-11 transition-all"
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setIsCreating(true)}
                                    className="rounded-2xl w-11 h-11 border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-slate-500 hover:text-sky-600 transition-all shrink-0"
                                >
                                    <FolderPlus className="h-5 w-5" />
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Folder List */}
                    <ScrollArea className="h-[280px] -mx-2 px-2">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                                <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
                                <span className="text-xs">กำลังค้นหา...</span>
                            </div>
                        ) : filteredFolders.length === 0 ? (
                            <div className="text-center py-10 space-y-3">
                                <div className="bg-sky-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <FolderOpen className="w-8 h-8 text-sky-300" />
                                </div>
                                <p className="text-sm text-slate-500">
                                    {searchTerm ? 'ไม่พบโฟลเดอร์ที่ค้นหา' : 'ยังไม่มีโฟลเดอร์เลย'}
                                </p>
                                {!searchTerm && (
                                    <Button variant="link" onClick={() => setIsCreating(true)} className="text-sky-600 font-bold">
                                        สร้างใบแรกกันเถอะ!
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <RadioGroup value={selectedFolder} onValueChange={setSelectedFolder} className="space-y-2 pb-2">
                                {filteredFolders.map((folder) => (
                                    <motion.div
                                        key={folder.id}
                                        layoutId={folder.id}
                                        className={`group relative flex items-center p-3 rounded-2xl border-2 transition-all cursor-pointer ${selectedFolder === folder.id
                                                ? 'border-sky-400 bg-sky-50 dark:bg-sky-900/20 shadow-sm'
                                                : 'border-transparent bg-white dark:bg-slate-800 hover:border-sky-100 hover:bg-slate-50'
                                            }`}
                                        onClick={() => setSelectedFolder(folder.id)}
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <RadioGroupItem value={folder.id} id={folder.id} className="text-sky-500 border-sky-200" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <Label htmlFor={folder.id} className={`font-bold cursor-pointer text-sm truncate ${selectedFolder === folder.id ? 'text-sky-700' : 'text-slate-700'
                                                        }`}>
                                                        {folder.title}
                                                    </Label>
                                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md shrink-0">
                                                        {folder.card_sets_count}
                                                    </span>
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                                                    {formatDate(folder.created_at)}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </RadioGroup>
                        )}
                    </ScrollArea>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full text-slate-500 hover:bg-white">
                        ยกเลิก
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={loading || isSaving || (!selectedFolder && (!isCreating || !newFolderName.trim()))}
                        className="rounded-full px-8 bg-sky-500 hover:bg-sky-600 text-white font-bold shadow-lg shadow-sky-200 dark:shadow-none transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                        {creatingLoading || isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Heart className="w-4 h-4 mr-2 fill-white/20" />
                        )}
                        {isCreating && newFolderName.trim() ? 'สร้างและบันทึก' : (isSaving ? 'กำลังบันทึก...' : 'บันทึกเลย')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
