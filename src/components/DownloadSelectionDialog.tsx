import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Download, Folder, Plus, FolderOpen, X, Search, Star, Check, Library, FolderPlus, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface SubDeck {
  id: string;
  name: string;
  name_en: string;
  flashcard_count: number;
  difficulty_level: string;
  is_free: boolean;
}

interface UserFolder {
  id: string;
  title: string;
  card_sets_count: number;
  created_at: string;
}

interface DownloadSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subdecks: SubDeck[];
  deckName: string;
}

export function DownloadSelectionDialog({
  open,
  onOpenChange,
  subdecks,
  deckName
}: DownloadSelectionDialogProps) {
  const [selectedSubdecks, setSelectedSubdecks] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);

  // Folder State
  const [folders, setFolders] = useState<UserFolder[]>([]);
  const [filteredFolders, setFilteredFolders] = useState<UserFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [loadingFolders, setLoadingFolders] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchUserFolders();
      // Default to "Create New" with deck name if no folders, or just reset
      setSelectedFolderId('');
      setSearchQuery('');
      setIsCreatingFolder(false);
      setNewFolderName('');
    }
  }, [open, deckName]);

  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    setFilteredFolders(
      folders.filter(f => f.title.toLowerCase().includes(lowerQuery))
    );
  }, [searchQuery, folders]);

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
        return {
          id: folder.id,
          title: folder.title,
          card_sets_count: count,
          created_at: folder.created_at
        };
      });

      setFolders(foldersWithCount);
    } catch (error) {
      console.error('Error fetching folders:', error);
    } finally {
      setLoadingFolders(false);
    }
  };

  const toggleSubdeck = (subdeckId: string) => {
    setSelectedSubdecks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subdeckId)) {
        newSet.delete(subdeckId);
      } else {
        newSet.add(subdeckId);
      }
      return newSet;
    });
  };

  const handleCreateFolder = async (folderName: string = newFolderName) => {
    if (!folderName.trim()) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: newFolder, error } = await supabase
        .from('user_folders')
        .insert({
          user_id: user.id,
          title: folderName.trim(),
          card_sets_count: 0
        })
        .select()
        .single();

      if (error) throw error;

      const newFolderObj: UserFolder = {
        id: newFolder.id,
        title: newFolder.title,
        card_sets_count: 0,
        created_at: newFolder.created_at
      };

      setFolders([newFolderObj, ...folders]);
      setSelectedFolderId(newFolder.id);
      setIsCreatingFolder(false);
      setNewFolderName('');
      toast({
        title: "สร้างโฟลเดอร์สำเร็จ ✨",
        description: `พร้อมเก็บ deck ลงใน ${newFolderObj.title} แล้ว`,
      });
      return newFolder.id;
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถสร้างโฟลเดอร์ได้",
        variant: "destructive"
      });
      return null;
    }
  };

  const handleDownload = async () => {
    if (selectedSubdecks.size === 0) {
      toast({
        title: "เลือกเนื้อหาก่อนนะ 🥺",
        description: "เลือกอย่างน้อย 1 รายการทางซ้ายมือ",
        variant: "destructive"
      });
      return;
    }

    let targetFolderId = selectedFolderId;

    // Smart Save
    if (isCreatingFolder && newFolderName.trim()) {
      const newId = await handleCreateFolder(newFolderName);
      if (newId) {
        targetFolderId = newId;
      } else {
        return;
      }
    }

    if (!targetFolderId) {
      toast({
        title: "เลือกโฟลเดอร์ด้วยนะ 📂",
        description: "เลือกโฟลเดอร์ทางขวามือ หรือสร้างใหม่ได้เลย",
        variant: "destructive"
      });
      return;
    }

    setIsDownloading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let totalCardsImported = 0;
      const selectedIds = Array.from(selectedSubdecks);

      for (const subdeckId of selectedIds) {
        const subdeck = subdecks.find(s => s.id === subdeckId);
        if (!subdeck) continue;

        const { data: systemCards } = await supabase
          .from('flashcards')
          .select('*')
          .eq('subdeck_id', subdeckId);

        if (!systemCards || systemCards.length === 0) continue;

        const { data: newSet, error: setError } = await supabase
          .from('user_flashcard_sets')
          .insert({
            user_id: user.id,
            folder_id: targetFolderId,
            title: subdeck.name,
            card_count: systemCards.length,
            source: 'marketcard'
          })
          .select()
          .single();

        if (setError) throw setError;

        const userFlashcards = systemCards.map(card => ({
          user_id: user.id,
          flashcard_set_id: newSet.id,
          front_text: card.front_text,
          back_text: card.back_text
        }));

        const { error: insertError } = await supabase
          .from('user_flashcards')
          .insert(userFlashcards);

        if (insertError) throw insertError;
        totalCardsImported += userFlashcards.length;
      }

      toast({
        title: "ดาวน์โหลดสำเร็จแล้ว! 🎉",
        description: `เก็บ ${selectedSubdecks.size} Deck ลงในโฟลเดอร์เรียบร้อย`,
        className: "bg-purple-50 border-purple-200 text-purple-800"
      });

      setSelectedSubdecks(new Set());
      onOpenChange(false);
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: `ไม่สามารถบันทึกได้: ${(error as any).message || 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-teal-100 text-teal-600';
      case 'intermediate': return 'bg-orange-100 text-orange-600';
      case 'advanced': return 'bg-rose-100 text-rose-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const formatDate = (dateString: string) => {
    try { return format(new Date(dateString), 'd/MM/yyyy', { locale: th }); } catch { return ''; }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 rounded-[32px] overflow-hidden bg-white dark:bg-slate-900 border-0 shadow-2xl">

        {/* Header */}
        <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-indigo-100 dark:from-slate-800 dark:to-slate-900 p-6 flex justify-between items-start relative overflow-hidden">
          <div className="relative z-10">
            <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600 flex items-center gap-2">
              <span>ดาวน์โหลด Deck</span>
              <span className="text-2xl animate-bounce">✨</span>
            </DialogTitle>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 font-medium">
              เพิ่มเนื้อหาจาก <span className="text-pink-500 font-bold">{deckName}</span> ไปยังคลังของคุณ
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-white/50 text-slate-400 hover:text-slate-600 transition-colors"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Decorative background blobs */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-200/40 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-200/40 rounded-full blur-3xl"></div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800 bg-slate-50/50">

          {/* LEFT: Select Content */}
          <div className="flex-1 p-5 flex flex-col min-h-0 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <span className="bg-pink-100 text-pink-600 p-1.5 rounded-lg"><Star className="w-4 h-4 fill-pink-600" /></span>
                เลือกบทเรียน
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSubdecks(new Set(subdecks.map(s => s.id)))}
                className="text-xs text-pink-500 hover:text-pink-600 hover:bg-pink-50 rounded-full h-8"
              >
                เลือกทั้งหมด ({selectedSubdecks.size})
              </Button>
            </div>

            <ScrollArea className="flex-1 -mx-2 px-2">
              <div className="space-y-3 pb-2">
                {subdecks.map((subdeck) => (
                  <motion.div
                    key={subdeck.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`relative p-3 rounded-2xl border-2 transition-all cursor-pointer group ${selectedSubdecks.has(subdeck.id)
                      ? 'border-pink-300 bg-pink-50/50 dark:bg-pink-900/20'
                      : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-pink-200'
                      }`}
                    onClick={() => toggleSubdeck(subdeck.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-colors ${selectedSubdecks.has(subdeck.id) ? 'bg-pink-500 border-pink-500' : 'border-slate-300'
                        }`}>
                        {selectedSubdecks.has(subdeck.id) && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{subdeck.name}</span>
                          <Badge className={`${getDifficultyColor(subdeck.difficulty_level)} text-[10px] rounded-full px-1.5 py-0 shadow-none border-0`}>
                            {subdeck.difficulty_level}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Library className="w-3 h-3" /> {subdeck.flashcard_count} คำ
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* RIGHT: Select Folder (Advanced) */}
          <div className="flex-1 p-5 flex flex-col min-h-0 bg-slate-50/30 dark:bg-slate-900/50">
            <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 mb-4">
              <span className="bg-amber-100 text-amber-600 p-1.5 rounded-lg"><FolderOpen className="w-4 h-4 fill-amber-600" /></span>
              เก็บไว้ที่ไหนดี?
            </h3>

            {/* Search/Create Bar */}
            <div className="mb-4">
              {isCreatingFolder ? (
                <div className="flex gap-2 animate-in fade-in slide-in-from-top-1">
                  <Input
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="ชื่อโฟลเดอร์ใหม่..."
                    className="flex-1 rounded-xl border-amber-300 focus:ring-amber-400 bg-white h-10 text-sm"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                  />
                  <Button onClick={() => handleCreateFolder()} size="sm" className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-sm">
                    สร้าง
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setIsCreatingFolder(false)} className="rounded-xl">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ค้นหาโฟลเดอร์..."
                      className="pl-9 rounded-xl border-slate-200 bg-white focus:ring-amber-400 h-10 text-sm"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsCreatingFolder(true)}
                    className="rounded-xl w-10 h-10 border-slate-200 hover:border-amber-300 hover:bg-amber-50 text-slate-500 hover:text-amber-600"
                  >
                    <FolderPlus className="w-5 h-5" />
                  </Button>
                </div>
              )}
            </div>

            <ScrollArea className="flex-1 -mx-2 px-2">
              <RadioGroup value={selectedFolderId} onValueChange={setSelectedFolderId} className="space-y-2 pb-2">
                {loadingFolders ? (
                  <div className="text-center py-8 text-slate-400 text-xs">กำลังโหลด...</div>
                ) : filteredFolders.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    {searchQuery ? 'ไม่พบโฟลเดอร์' : 'ยังไม่มีโฟลเดอร์ กด + เพื่อสร้างเลย'}
                  </div>
                ) : (
                  filteredFolders.map((folder) => (
                    <motion.div
                      key={folder.id}
                      layoutId={folder.id}
                      className={`flex items-center p-3 rounded-2xl border-2 transition-all cursor-pointer ${selectedFolderId === folder.id
                        ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-transparent bg-white dark:bg-slate-800 hover:border-indigo-100'
                        }`}
                      onClick={() => setSelectedFolderId(folder.id)}
                    >
                      <RadioGroupItem value={folder.id} id={folder.id} className="mr-3 text-indigo-500 border-indigo-200" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={folder.id} className={`font-bold text-sm cursor-pointer truncate ${selectedFolderId === folder.id ? 'text-indigo-700' : 'text-slate-700'
                            }`}>{folder.title}</Label>
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md shrink-0 ml-2">
                            {folder.card_sets_count}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(folder.created_at)}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </RadioGroup>
            </ScrollArea>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 z-10">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full text-slate-500 hover:bg-slate-100">
            ยกเลิก
          </Button>
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="rounded-full px-8 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold shadow-lg shadow-purple-200 dark:shadow-none transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {isDownloading ? (
              <span className="flex items-center gap-2"><span className="animate-spin">⏳</span> กำลังบันทึก...</span>
            ) : (
              <>
                <Heart className="w-4 h-4 mr-2 fill-white/20" />
                บันทึก ({selectedSubdecks.size})
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
