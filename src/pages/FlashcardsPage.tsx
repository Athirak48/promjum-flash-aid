import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, Brain, GamepadIcon, Settings, BookOpen, Clock, Zap, Folder, FolderPlus, MoreVertical, Edit, Trash, Move, Type, Upload, X } from 'lucide-react';
import { FlashcardSwiper } from '@/components/FlashcardSwiper';
import { FlashcardReviewPage } from '@/components/FlashcardReviewPage';
import { FlashcardQuizGame } from '@/components/FlashcardQuizGame';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFlashcards } from '@/hooks/useFlashcards';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';


interface FlashcardSet {
  id: string;
  title: string;
  cardCount: number;
  source: 'created' | 'uploaded' | 'marketcard';
  lastReviewed: string;
  nextReview: string;
  progress: number;
  folderId?: string;
}
interface Folder {
  id: string;
  title: string;
  cardSetsCount: number;
  createdAt: string;
}
interface FlashcardData {
  id: string;
  front: string;
  back: string;
}
const ItemTypes = {
  FLASHCARD_SET: 'flashcard_set'
};
function FlashcardActions({
  setId
}: {
  setId: string;
}) {
  const {
    t
  } = useLanguage();
  const [showSwiper, setShowSwiper] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showQuizGame, setShowQuizGame] = useState(false);
  const {
    flashcards,
    loading: flashcardsLoading
  } = useFlashcards();
  const navigate = useNavigate();
  const cards: FlashcardData[] = flashcards.map(card => ({
    id: card.id,
    front: card.front_text,
    back: card.back_text
  }));
  const handleReviewComplete = (results: {
    correct: number;
    incorrect: number;
    needsReview: number;
  }) => {
    setShowSwiper(false);
    setShowReview(false);
    console.log('Review results:', results);
  };
  if (flashcardsLoading) {
    return <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>;
  }
  return <>
    <div className="flex gap-2">
      <Button className="flex-1" size="sm" onClick={() => {
        console.log('Review button clicked');
        navigate('/flashcards/review', {
          state: {
            setId
          }
        });
      }}>
        <Brain className="h-4 w-4 mr-1" />
        {t('flashcards.review')}
      </Button>
      <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowQuizGame(true)}>
        <GamepadIcon className="h-4 w-4 mr-1" />
        {t('flashcards.playGame')}
      </Button>
    </div>

    {showSwiper && <FlashcardSwiper cards={cards} onClose={() => setShowSwiper(false)} onComplete={handleReviewComplete} />}

    {showReview && <>
      {console.log('Rendering FlashcardReviewPage with cards:', cards)}
      <FlashcardReviewPage cards={cards} onClose={() => {
        console.log('Closing review page');
        setShowReview(false);
      }} onComplete={handleReviewComplete} />
    </>}

    {showQuizGame && <FlashcardQuizGame flashcards={flashcards} onClose={() => setShowQuizGame(false)} />}
  </>;
}
function DraggableFlashcardSet({
  set,
  onMoveToFolder
}: {
  set: FlashcardSet;
  onMoveToFolder: (setId: string, folderId: string) => void;
}) {
  const {
    t
  } = useLanguage();
  const [{
    isDragging
  }, drag] = useDrag(() => ({
    type: ItemTypes.FLASHCARD_SET,
    item: {
      id: set.id
    },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  }));
  const getSourceBadge = (source: FlashcardSet['source']) => {
    const variants = {
      created: {
        variant: 'default' as const,
        label: t('source.created'),
        icon: Plus
      },
      uploaded: {
        variant: 'secondary' as const,
        label: t('source.uploaded'),
        icon: BookOpen
      },
      marketcard: {
        variant: 'outline' as const,
        label: t('source.marketcard'),
        icon: Zap
      }
    };
    const config = variants[source] || variants.created;
    const Icon = config.icon;
    return <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>;
  };
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-emerald-500';
    if (progress >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };
  return <div ref={drag} className={`transition-all cursor-move group relative ${isDragging ? 'opacity-50 rotate-1 scale-105' : 'hover:scale-[1.02]'}`}>
    <div className="glass-card rounded-[2rem] border border-white/20 hover:border-white/40 bg-white/10 backdrop-blur-md p-5 relative overflow-hidden shadow-lg">
      {/* Light Reflection */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-50" />

      {/* Hover Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-white line-clamp-2 leading-tight group-hover:text-primary transition-colors">{set.title}</h3>
          <div className="flex items-center gap-2 pl-2">
            {getSourceBadge(set.source)}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/50 hover:text-white hover:bg-white/10 rounded-full">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-black/90 border-white/20 text-white">
                <DropdownMenuItem className="focus:bg-white/10 focus:text-white">
                  <Type className="h-4 w-4 mr-2" />
                  แก้ไขข้อความ
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-white/10 focus:text-white">
                  <Upload className="h-4 w-4 mr-2" />
                  อัปโหลดรูปภาพ
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-white/10 focus:text-white">
                  <Edit className="h-4 w-4 mr-2" />
                  {t('common.edit')}
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-white/10 focus:text-white">
                  <Move className="h-4 w-4 mr-2" />
                  {t('common.move')}
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-400 focus:bg-red-500/10 focus:text-red-400">
                  <Trash className="h-4 w-4 mr-2" />
                  {t('common.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-white/50 mb-4">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium text-white/70">{set.cardCount} {t('flashcards.cards')}</span>
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span className="font-medium text-white/70">Mastery {set.progress}%</span>
          </span>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-white/40">
              <span>Mastery Progress</span>
              <span className="text-primary">{set.progress}%</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
              <div className={`h-full transition-all duration-1000 ease-out ${getProgressColor(set.progress)} shadow-[0_0_10px_rgba(var(--primary),0.5)]`} style={{
                width: `${set.progress}%`
              }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] text-white/30">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              <span>{t('flashcards.lastReviewed')}: {new Date(set.lastReviewed).toLocaleDateString('th-TH')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              <span>{t('flashcards.nextReview')}: {new Date(set.nextReview).toLocaleDateString('th-TH')}</span>
            </div>
          </div>

          <div className="pt-2">
            <FlashcardActions setId={set.id} />
          </div>
        </div>
      </div>
    </div>
  </div>;
}
function DroppableFolder({
  folder,
  onDrop,
  onRename,
  onDelete
}: {
  folder: Folder;
  onDrop: (setId: string, folderId: string) => void;
  onRename: (folder: Folder) => void;
  onDelete: (folder: Folder) => void;
}) {
  const {
    t
  } = useLanguage();
  const [{
    isOver
  }, drop] = useDrop(() => ({
    accept: ItemTypes.FLASHCARD_SET,
    drop: (item: {
      id: string;
    }) => onDrop(item.id, folder.id),
    collect: monitor => ({
      isOver: monitor.isOver()
    })
  }));
  const navigate = useNavigate();
  const handleFolderClick = () => {
    navigate(`/flashcards/${folder.id}`);
  };
  return <div
    ref={drop}
    className={`
      transition-all duration-300 cursor-pointer group
      ${isOver ? 'scale-105' : 'hover:-translate-y-1'}
    `}
    onClick={handleFolderClick}
  >
    <div className={`
      relative overflow-hidden rounded-xl sm:rounded-2xl p-3 sm:p-4 h-full
      ${isOver ? 'border-primary/50 shadow-[0_0_50px_rgba(var(--primary),0.3)] bg-white/20' : 'border-white/20 hover:border-white/40 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]'}
      bg-white/10 backdrop-blur-md border shadow-lg
    `}>
      {/* Light Reflection */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-50" />

      {/* Decorative Gradient Blob - Lighter */}
      <div className="absolute -right-10 -top-10 w-24 h-24 bg-white/10 blur-3xl rounded-full pointer-events-none group-hover:bg-white/20 transition-colors" />

      <div className="flex items-center gap-3 relative z-10">
        {/* Cute Folder Icon - Glass Style */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/10 border border-white/10 flex items-center justify-center shadow-lg backdrop-blur-md group-hover:scale-110 transition-transform duration-500">
          <Folder className="h-5 w-5 sm:h-6 sm:w-6 text-purple-300 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base sm:text-lg text-white mb-0.5 truncate group-hover:text-primary transition-colors">{folder.title}</h3>
          <p className="text-xs sm:text-sm text-white/50 flex items-center gap-1.5">
            <span className="flex items-center justify-center bg-white/10 min-w-[20px] h-5 px-1.5 rounded-full text-[10px] sm:text-xs font-bold text-white/90">
              {folder.cardSetsCount}
            </span>
            <span>{t('common.sets')}</span>
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl text-white/40 hover:text-white hover:bg-white/10">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl bg-black/90 border-white/20 text-white">
            <DropdownMenuItem className="rounded-lg focus:bg-white/10 focus:text-white" onClick={(e) => { e.stopPropagation(); onRename(folder); }}>
              <Edit className="h-4 w-4 mr-2" />
              {t('common.rename')}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-400 focus:text-red-300 focus:bg-red-500/10 rounded-lg" onClick={(e) => { e.stopPropagation(); onDelete(folder); }}>
              <Trash className="h-4 w-4 mr-2" />
              {t('common.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </div>;
}
export default function FlashcardsPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [showCreateFlashcardDialog, setShowCreateFlashcardDialog] = useState(false);
  const [newFlashcardSetTitle, setNewFlashcardSetTitle] = useState('');
  const [selectedFolderForFlashcard, setSelectedFolderForFlashcard] = useState<string>('');
  const [flashcardRows, setFlashcardRows] = useState([
    { id: 1, front: '', back: '', partOfSpeech: 'Noun', frontImage: null as File | null, backImage: null as File | null },
    { id: 2, front: '', back: '', partOfSpeech: 'Noun', frontImage: null as File | null, backImage: null as File | null },
    { id: 3, front: '', back: '', partOfSpeech: 'Noun', frontImage: null as File | null, backImage: null as File | null },
    { id: 4, front: '', back: '', partOfSpeech: 'Noun', frontImage: null as File | null, backImage: null as File | null },
    { id: 5, front: '', back: '', partOfSpeech: 'Noun', frontImage: null as File | null, backImage: null as File | null },
  ]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(true);

  // Rename/Delete folder states
  const [folderToRename, setFolderToRename] = useState<Folder | null>(null);
  const [renameText, setRenameText] = useState('');
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { flashcards, loading } = useFlashcards();
  const { trackPageView, trackButtonClick } = useAnalytics();

  useEffect(() => {
    trackPageView('Deck', 'flashcards');
  }, [trackPageView]);

  // Fetch folders from Supabase
  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      setLoadingFolders(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoadingFolders(false);
        return;
      }

      // Fetch flashcard sets first to count them per folder
      const { data: setsData, error: setsError } = await supabase
        .from('user_flashcard_sets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (setsError) throw setsError;

      const formattedSets: FlashcardSet[] = (setsData || []).map(set => ({
        id: set.id,
        title: set.title,
        cardCount: set.card_count || 0,
        source: set.source as 'created' | 'uploaded' | 'marketcard',
        lastReviewed: set.last_reviewed || new Date().toISOString(),
        nextReview: set.next_review || new Date().toISOString(),
        progress: set.progress || 0,
        folderId: set.folder_id || undefined
      }));

      setFlashcardSets(formattedSets);

      // Fetch folders
      const { data, error } = await supabase
        .from('user_folders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Count actual flashcard sets per folder from real data
      const formattedFolders: Folder[] = (data || []).map(folder => {
        const setsInFolder = formattedSets.filter(set => set.folderId === folder.id).length;
        return {
          id: folder.id,
          title: folder.title,
          cardSetsCount: setsInFolder, // Count from actual data, not from database column
          createdAt: folder.created_at
        };
      });

      setFolders(formattedFolders);
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลโฟลเดอร์ได้",
        variant: "destructive"
      });
    } finally {
      setLoadingFolders(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "กรุณาเข้าสู่ระบบ",
          description: "คุณต้องเข้าสู่ระบบก่อนสร้างโฟลเดอร์",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from('user_folders')
        .insert([{
          user_id: user.id,
          title: newFolderName.trim(),
          card_sets_count: 0
        }])
        .select()
        .single();

      if (error) throw error;

      const newFolder: Folder = {
        id: data.id,
        title: data.title,
        cardSetsCount: 0,
        createdAt: data.created_at
      };

      setFolders([newFolder, ...folders]);
      setNewFolderName('');
      setShowNewFolderDialog(false);

      toast({
        title: "สร้างโฟลเดอร์สำเร็จ",
        description: `สร้างโฟลเดอร์ "${newFolderName}" เรียบร้อยแล้ว`,
      });
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถสร้างโฟลเดอร์ได้",
        variant: "destructive"
      });
    }
  };
  const handleMoveToFolder = async (setId: string, folderId: string) => {
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('user_flashcard_sets')
        .update({ folder_id: folderId })
        .eq('id', setId);

      if (error) throw error;

      // Refresh folders and sets to get accurate counts
      await fetchFolders();

      toast({
        title: "ย้ายชุดแฟลชการ์ดสำเร็จ",
        description: "ย้ายชุดแฟลชการ์ดไปยังโฟลเดอร์แล้ว",
      });
    } catch (error) {
      console.error('Error moving flashcard set:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถย้ายชุดแฟลชการ์ดได้",
        variant: "destructive"
      });
    }
  };

  // Rename folder handler
  const handleOpenRenameDialog = (folder: Folder) => {
    setFolderToRename(folder);
    setRenameText(folder.title);
    setShowRenameDialog(true);
  };

  const handleRenameFolder = async () => {
    if (!folderToRename || !renameText.trim()) return;

    try {
      const { error } = await supabase
        .from('user_folders')
        .update({ title: renameText.trim() })
        .eq('id', folderToRename.id);

      if (error) throw error;

      setFolders(prev => prev.map(f =>
        f.id === folderToRename.id ? { ...f, title: renameText.trim() } : f
      ));
      setShowRenameDialog(false);
      setFolderToRename(null);
      setRenameText('');

      toast({
        title: "เปลี่ยนชื่อสำเร็จ",
        description: `เปลี่ยนชื่อโฟลเดอร์เป็น "${renameText.trim()}" แล้ว`,
      });
    } catch (error) {
      console.error('Error renaming folder:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเปลี่ยนชื่อโฟลเดอร์ได้",
        variant: "destructive"
      });
    }
  };

  // Delete folder handler
  const handleOpenDeleteDialog = (folder: Folder) => {
    setFolderToDelete(folder);
    setShowDeleteDialog(true);
  };

  const handleDeleteFolder = async () => {
    if (!folderToDelete) return;

    try {
      // First, move all flashcard sets in this folder to no folder
      const { error: updateError } = await supabase
        .from('user_flashcard_sets')
        .update({ folder_id: null })
        .eq('folder_id', folderToDelete.id);

      if (updateError) throw updateError;

      // Then delete the folder
      const { error } = await supabase
        .from('user_folders')
        .delete()
        .eq('id', folderToDelete.id);

      if (error) throw error;

      setFolders(prev => prev.filter(f => f.id !== folderToDelete.id));
      setShowDeleteDialog(false);
      setFolderToDelete(null);

      // Refresh to update flashcard sets
      await fetchFolders();

      toast({
        title: "ลบโฟลเดอร์สำเร็จ",
        description: `ลบโฟลเดอร์ "${folderToDelete.title}" แล้ว`,
      });
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบโฟลเดอร์ได้",
        variant: "destructive"
      });
    }
  };

  const flashcardScrollRef = React.useRef<HTMLDivElement>(null);

  const handleAddFlashcardRow = () => {
    const newRow = {
      id: Date.now(),
      front: '',
      back: '',
      partOfSpeech: 'Noun',
      frontImage: null as File | null,
      backImage: null as File | null
    };
    setFlashcardRows([...flashcardRows, newRow]);
    // Scroll to bottom after adding
    setTimeout(() => {
      if (flashcardScrollRef.current) {
        flashcardScrollRef.current.scrollTop = flashcardScrollRef.current.scrollHeight;
      }
    }, 100);
  };
  const handleRemoveFlashcardRow = (id: number) => {
    if (flashcardRows.length > 1) {
      setFlashcardRows(flashcardRows.filter(row => row.id !== id));
    }
  };
  const handleFlashcardTextChange = (id: number, field: 'front' | 'back' | 'partOfSpeech', value: string) => {
    setFlashcardRows(rows => rows.map(row => row.id === id ? {
      ...row,
      [field]: value
    } : row));
  };
  const handleImageUpload = (id: number, side: 'front' | 'back') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setFlashcardRows(rows => rows.map(row => row.id === id ? {
          ...row,
          [`${side}Image`]: file
        } : row));
      }
    };
    input.click();
  };


  const handleCreateFlashcards = async () => {
    if (!newFlashcardSetTitle.trim()) {
      toast({
        title: "กรุณาใส่ชื่อชุดแฟลชการ์ด",
        description: "ชื่อชุดแฟลชการ์ดต้องไม่ว่างเปล่า",
        variant: "destructive"
      });
      return;
    }

    const validFlashcards = flashcardRows.filter(row =>
      row.front.trim() && row.back.trim()
    );

    if (validFlashcards.length === 0) {
      toast({
        title: "กรุณาเพิ่มแฟลชการ์ด",
        description: "ต้องมีแฟลชการ์ดอย่างน้อย 1 ใบและต้องมีข้อมูลครบถ้วน",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "กรุณาเข้าสู่ระบบ",
          description: "คุณต้องเข้าสู่ระบบก่อนสร้างแฟลชการ์ด",
          variant: "destructive"
        });
        return;
      }

      // Create flashcard set first
      const { data: flashcardSet, error: setError } = await supabase
        .from('user_flashcard_sets')
        .insert([{
          user_id: user.id,
          folder_id: (selectedFolderForFlashcard && selectedFolderForFlashcard !== 'none') ? selectedFolderForFlashcard : null,
          title: newFlashcardSetTitle.trim(),
          card_count: validFlashcards.length,
          source: 'created'
        }])
        .select()
        .single();

      if (setError) throw setError;

      // Create individual flashcards
      // Upload images in parallel and check for errors
      const flashcardsToInsert = await Promise.all(validFlashcards.map(async (row) => {
        let frontImageUrl = null;
        let backImageUrl = null;

        // Upload Front Image
        if (row.frontImage) {
          try {
            const fileName = `${user.id}/${Date.now()}_front_${row.id}`;
            const { data, error } = await supabase.storage
              .from('flashcard-images')
              .upload(fileName, row.frontImage);

            if (error) {
              console.error('Error uploading front image:', error);
            } else if (data) {
              // Use signed URLs for security instead of public URLs
              const { data: signedUrlData, error: signedError } = await supabase.storage
                .from('flashcard-images')
                .createSignedUrl(fileName, 86400); // 24 hour expiry
              if (!signedError && signedUrlData) {
                frontImageUrl = signedUrlData.signedUrl;
              }
            }
          } catch (err) {
            console.error('Exception uploading front image:', err);
          }
        }

        // Upload Back Image
        if (row.backImage) {
          try {
            const fileName = `${user.id}/${Date.now()}_back_${row.id}`;
            const { data, error } = await supabase.storage
              .from('flashcard-images')
              .upload(fileName, row.backImage);

            if (error) {
              console.error('Error uploading back image:', error);
            } else if (data) {
              // Use signed URLs for security instead of public URLs
              const { data: signedUrlData, error: signedError } = await supabase.storage
                .from('flashcard-images')
                .createSignedUrl(fileName, 86400); // 24 hour expiry
              if (!signedError && signedUrlData) {
                backImageUrl = signedUrlData.signedUrl;
              }
            }
          } catch (err) {
            console.error('Exception uploading back image:', err);
          }
        }

        return {
          user_id: user.id,
          flashcard_set_id: flashcardSet.id,
          front_text: row.front.trim() || ' ', // Placeholder
          back_text: row.back.trim() || ' ',   // Placeholder
          part_of_speech: row.partOfSpeech || 'Noun',
          front_image_url: frontImageUrl,
          back_image_url: backImageUrl
        };
      }));

      const { error: flashcardsError } = await supabase
        .from('user_flashcards')
        .insert(flashcardsToInsert);

      if (flashcardsError) throw flashcardsError;

      // Refresh folders and flashcard sets (will auto-count from real data)
      await fetchFolders();

      // Reset form
      setShowCreateFlashcardDialog(false);
      setNewFlashcardSetTitle('');
      setSelectedFolderForFlashcard('');
      setFlashcardRows([
        { id: 1, front: '', back: '', partOfSpeech: 'Noun', frontImage: null, backImage: null },
        { id: 2, front: '', back: '', partOfSpeech: 'Noun', frontImage: null, backImage: null },
        { id: 3, front: '', back: '', partOfSpeech: 'Noun', frontImage: null, backImage: null },
        { id: 4, front: '', back: '', partOfSpeech: 'Noun', frontImage: null, backImage: null },
        { id: 5, front: '', back: '', partOfSpeech: 'Noun', frontImage: null, backImage: null },
      ]);

      toast({
        title: "สร้างแฟลชการ์ดสำเร็จ",
        description: `สร้างชุด "${newFlashcardSetTitle}" พร้อม ${validFlashcards.length} ใบเรียบร้อยแล้ว`,
      });
    } catch (error) {
      console.error('Error creating flashcards:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถสร้างแฟลชการ์ดได้",
        variant: "destructive"
      });
    }
  };

  const filteredSets = flashcardSets.filter(set =>
    !set.folderId && set.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <DndProvider backend={HTML5Backend}>
        <div className="min-h-screen bg-transparent">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {t('flashcards.title')}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {t('flashcards.subtitle')}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {/* Search */}
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('flashcards.search')}
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Create Flashcard Button */}
                <Dialog open={showCreateFlashcardDialog} onOpenChange={setShowCreateFlashcardDialog}>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full md:w-auto bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-semibold shadow-lg hover:shadow-cyan-500/25"
                      onClick={() => trackButtonClick('Create Flashcard', 'flashcards')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t('flashcards.createFlashcard')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-6 rounded-[2rem] border border-white/20 bg-black/80 backdrop-blur-xl shadow-[0_0_50px_rgba(168,85,247,0.2)] text-white" style={{ transform: 'translate(-50%, -50%)' }}>
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">สร้างแฟลชการ์ดใหม่</DialogTitle>
                      <DialogDescription className="text-white/50">
                        สร้างชุดคำศัพท์ใหม่สำหรับการเรียนรู้ของคุณ
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 flex-1 flex flex-col min-h-0 mt-4">
                      {/* Title + Folder Row - Inline Layout */}
                      <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                        {/* Flashcard Set Title */}
                        <div className="flex-1">
                          <Label htmlFor="flashcard-set-title" className="text-sm font-medium mb-1.5 block text-slate-200">
                            ชื่อชุดแฟลชการ์ด *
                          </Label>
                          <Input
                            id="flashcard-set-title"
                            placeholder="เช่น คำศัพท์ภาษาอังกฤษพื้นฐาน"
                            value={newFlashcardSetTitle}
                            onChange={(e) => setNewFlashcardSetTitle(e.target.value)}
                            className="w-full bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:bg-white/10 focus:border-purple-500/50"
                          />
                        </div>

                        {/* Folder Selection */}
                        <div className="md:w-[280px]">
                          <Label className="text-sm font-medium mb-1.5 block text-slate-200">โฟลเดอร์</Label>
                          <div className="flex gap-2">
                            <Button variant="outline" size="icon" onClick={() => setShowNewFolderDialog(true)} className="h-10 w-10 flex-shrink-0 bg-white/5 border-white/10 hover:bg-white/10 hover:text-white" title="สร้างโฟลเดอร์ใหม่">
                              <FolderPlus className="h-4 w-4" />
                            </Button>
                            <Select value={selectedFolderForFlashcard} onValueChange={setSelectedFolderForFlashcard}>
                              <SelectTrigger className="flex-1 bg-white/5 border-white/10 text-white focus:ring-purple-500/50">
                                <SelectValue placeholder="เลือกโฟลเดอร์" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">ไม่เลือกโฟลเดอร์</SelectItem>
                                {folders.map(folder => (
                                  <SelectItem key={folder.id} value={folder.id}>
                                    <div className="flex items-center gap-2">
                                      <Folder className="h-4 w-4" />
                                      {folder.title}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Section Header */}
                      <div className="flex items-center justify-between border-t border-white/10 pt-3">
                        <Label className="text-sm font-semibold text-white/80">รายการคำศัพท์</Label>
                        <span className="text-xs font-bold text-white bg-white/10 border border-white/10 px-3 py-1 rounded-full">{flashcardRows.length} ใบ</span>
                      </div>

                      {/* Flashcard Rows - Expanded Area - With Custom Scrollbar */}
                      <div ref={flashcardScrollRef} className="space-y-3 flex-1 overflow-y-auto pr-2 min-h-[250px] max-h-[40vh] custom-scrollbar">
                        {flashcardRows.map((row, index) => (
                          <div key={row.id} className="group flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-white/20 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300 relative overflow-hidden">
                            {/* Decorative gradient blob */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                            <div className="flex items-center justify-between w-full sm:w-auto sm:justify-center relative z-10">
                              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-purple-500/30 text-white font-bold text-sm sm:text-base">
                                {index + 1}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="sm:hidden text-white/40 hover:text-red-400 hover:bg-red-400/10 h-8 w-8 rounded-full"
                                onClick={() => handleRemoveFlashcardRow(row.id)}
                                disabled={flashcardRows.length === 1}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 md:gap-4 w-full items-center">
                              <Input
                                value={row.front}
                                onChange={(e) => handleFlashcardTextChange(row.id, 'front', e.target.value)}
                                placeholder="คำศัพท์ (ด้านหน้า)"
                                className="bg-white/10 border-white/10 text-white placeholder:text-white/40 focus:bg-white/20 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-500/20 h-11 rounded-xl transition-all"
                              />

                              {/* Part of Speech Dropdown */}
                              <Select
                                value={row.partOfSpeech}
                                onValueChange={(value) => handleFlashcardTextChange(row.id, 'partOfSpeech', value)}
                              >
                                <SelectTrigger className="w-full md:w-[140px] h-11 rounded-xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-500/20 text-pink-100 focus:ring-pink-500/30 hover:bg-pink-500/20 transition-all">
                                  <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                  <SelectItem value="Noun" className="focus:bg-white/10">Noun</SelectItem>
                                  <SelectItem value="Verb" className="focus:bg-white/10">Verb</SelectItem>
                                  <SelectItem value="Adjective" className="focus:bg-white/10">Adjective</SelectItem>
                                  <SelectItem value="Adverb" className="focus:bg-white/10">Adverb</SelectItem>
                                  <SelectItem value="Preposition" className="focus:bg-white/10">Preposition</SelectItem>
                                  <SelectItem value="Conjunction" className="focus:bg-white/10">Conjunction</SelectItem>
                                  <SelectItem value="Pronoun" className="focus:bg-white/10">Pronoun</SelectItem>
                                  <SelectItem value="Interjection" className="focus:bg-white/10">Interjection</SelectItem>
                                  <SelectItem value="Article" className="focus:bg-white/10">Article</SelectItem>
                                  <SelectItem value="Phrase" className="focus:bg-white/10">Phrase</SelectItem>
                                </SelectContent>
                              </Select>

                              <Input
                                value={row.back}
                                onChange={(e) => handleFlashcardTextChange(row.id, 'back', e.target.value)}
                                placeholder="ความหมาย (ด้านหลัง)"
                                className="bg-white/10 border-white/10 text-white placeholder:text-white/40 focus:bg-white/20 focus:border-pink-400/50 focus:ring-2 focus:ring-pink-500/20 h-11 rounded-xl transition-all"
                              />
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="hidden sm:flex text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 h-9 w-9 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                              onClick={() => handleRemoveFlashcardRow(row.id)}
                              disabled={flashcardRows.length === 1}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}

                        {/* Add Row Button - Inside Scroll Area */}
                        <div className="flex justify-center py-4">
                          <Button
                            variant="outline"
                            onClick={handleAddFlashcardRow}
                            className="text-purple-600 border-purple-200 hover:bg-purple-50 hover:border-purple-300 rounded-full px-6"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            เพิ่มแถว
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Footer - Fixed at bottom */}
                    <div className="flex items-center justify-between pt-4 border-t mt-2">
                      <Button
                        variant="ghost"
                        onClick={() => setShowCreateFlashcardDialog(false)}
                        className="text-muted-foreground"
                      >
                        ยกเลิก
                      </Button>
                      <Button
                        onClick={handleCreateFlashcards}
                        className="bg-gradient-primary text-primary-foreground hover:shadow-glow px-6"
                      >
                        สร้างชุดแฟลชการ์ด
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Create Folder Button */}
                <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full md:w-auto">
                      <FolderPlus className="h-4 w-4 mr-2" />
                      {t('flashcards.createFolder')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-[2rem] border border-white/20 bg-black/80 backdrop-blur-xl shadow-[0_0_50px_rgba(168,85,247,0.2)] text-white" style={{ transform: 'translate(-50%, -50%)' }}>
                    <DialogHeader>
                      <DialogTitle className="text-white">{t('flashcards.createFolder')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder={t('flashcards.enterFolderName')}
                        value={newFolderName}
                        onChange={e => setNewFolderName(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleCreateFolder} className="flex-1">
                          {t('flashcards.create')}
                        </Button>
                        <Button variant="outline" onClick={() => setShowNewFolderDialog(false)}>
                          {t('flashcards.cancel')}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Folders Section */}
            {folders.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Folder className="h-5 w-5" />
                  {t('common.folders')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {folders.map(folder => (
                    <DroppableFolder key={folder.id} folder={folder} onDrop={handleMoveToFolder} onRename={handleOpenRenameDialog} onDelete={handleOpenDeleteDialog} />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {folders.length === 0 && (
              <div className="text-center py-12">
                <Folder className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('flashcards.noSets')}</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? t('flashcards.noSearchResults') : t('flashcards.noSetsDesc')}
                </p>
                <Button onClick={() => setShowNewFolderDialog(true)}>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  {t('flashcards.createFolder')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DndProvider>

      {/* Rename Folder Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="rounded-[2rem] border border-white/20 bg-black/80 backdrop-blur-xl shadow-[0_0_50px_rgba(168,85,247,0.2)] text-white" style={{ transform: 'translate(-50%, -50%)' }}>
          <DialogHeader>
            <DialogTitle className="text-white">เปลี่ยนชื่อโฟลเดอร์</DialogTitle>
            <DialogDescription className="text-white/50">
              กรุณาใส่ชื่อใหม่สำหรับโฟลเดอร์
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="ชื่อโฟลเดอร์"
              value={renameText}
              onChange={e => setRenameText(e.target.value)}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRenameDialog(false)}>
                ยกเลิก
              </Button>
              <Button onClick={handleRenameFolder}>
                บันทึก
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-[2rem] border border-white/20 bg-black/80 backdrop-blur-xl shadow-[0_0_50px_rgba(244,63,94,0.2)] text-white" style={{ transform: 'translate(-50%, -50%)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">ลบโฟลเดอร์นี้?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/50">
              คุณแน่ใจหรือว่าต้องการลบโฟลเดอร์ "{folderToDelete?.title}" ชุดแฟลชการ์ดที่อยู่ในโฟลเดอร์จะถูกย้ายออกมา
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white">ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFolder} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
              ลบโฟลเดอร์
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}