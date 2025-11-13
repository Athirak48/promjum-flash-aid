import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, Brain, GamepadIcon, Settings, BookOpen, Clock, Zap, Folder, FolderPlus, Filter, MoreVertical, Edit, Trash, Move, Type, Upload, ImagePlus, X } from 'lucide-react';
import { FlashcardSwiper } from '@/components/FlashcardSwiper';
import { FlashcardReviewPage } from '@/components/FlashcardReviewPage';
import { FlashcardQuizGame } from '@/components/FlashcardQuizGame';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFlashcards } from '@/hooks/useFlashcards';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import BackgroundDecorations from '@/components/BackgroundDecorations';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
    const config = variants[source];
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
  return <Card ref={drag} className={`transition-all cursor-move ${isDragging ? 'opacity-50 rotate-1 scale-105' : 'hover:shadow-large'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-lg line-clamp-2">{set.title}</CardTitle>
          <div className="flex items-center gap-2">
            {getSourceBadge(set.source)}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
               <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Type className="h-4 w-4 mr-2" />
                  แก้ไขข้อความ
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Upload className="h-4 w-4 mr-2" />
                  อัปโหลดรูปภาพ
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  {t('common.edit')}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Move className="h-4 w-4 mr-2" />
                  {t('common.move')}
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Trash className="h-4 w-4 mr-2" />
                  {t('common.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <CardDescription className="flex items-center gap-4 text-sm">
          <span>{set.cardCount} {t('flashcards.cards')}</span>
          <span>•</span>
          <span>Mastery {set.progress}%</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Mastery Level</span>
            <span>{set.progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className={`h-2 rounded-full transition-all ${getProgressColor(set.progress)}`} style={{
            width: `${set.progress}%`
          }} />
          </div>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{t('flashcards.lastReviewed')}: {new Date(set.lastReviewed).toLocaleDateString('th-TH')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{t('flashcards.nextReview')}: {new Date(set.nextReview).toLocaleDateString('th-TH')}</span>
          </div>
        </div>

        <FlashcardActions setId={set.id} />
      </CardContent>
    </Card>;
}
function DroppableFolder({
  folder,
  onDrop
}: {
  folder: Folder;
  onDrop: (setId: string, folderId: string) => void;
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
  return <Card ref={drop} className={`transition-all cursor-pointer ${isOver ? 'ring-2 ring-primary shadow-glow' : 'hover:shadow-medium'}`} onClick={handleFolderClick}>
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-primary rounded-lg">
            <Folder className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{folder.title}</h3>
            <p className="text-sm text-muted-foreground">
              {folder.cardSetsCount} {t('common.sets')}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                {t('common.rename')}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash className="h-4 w-4 mr-2" />
                {t('common.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>;
}
export default function FlashcardsPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [showCreateFlashcardDialog, setShowCreateFlashcardDialog] = useState(false);
  const [newFlashcardSetTitle, setNewFlashcardSetTitle] = useState('');
  const [selectedFolderForFlashcard, setSelectedFolderForFlashcard] = useState<string>('');
  const [flashcardRows, setFlashcardRows] = useState([{
    id: 1,
    front: '',
    back: '',
    frontImage: null as File | null,
    backImage: null as File | null
  }]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(true);
  const { flashcards, loading } = useFlashcards();

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
  const handleAddFlashcardRow = () => {
    const newRow = {
      id: Date.now(),
      front: '',
      back: '',
      frontImage: null as File | null,
      backImage: null as File | null
    };
    setFlashcardRows([...flashcardRows, newRow]);
  };
  const handleRemoveFlashcardRow = (id: number) => {
    if (flashcardRows.length > 1) {
      setFlashcardRows(flashcardRows.filter(row => row.id !== id));
    }
  };
  const handleFlashcardTextChange = (id: number, field: 'front' | 'back', value: string) => {
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

    const validFlashcards = flashcardRows.filter(row => row.front.trim() && row.back.trim());
    
    if (validFlashcards.length === 0) {
      toast({
        title: "กรุณาเพิ่มแฟลชการ์ด",
        description: "ต้องมีแฟลชการ์ดอย่างน้อย 1 ใบที่มีข้อมูลครบ",
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
          folder_id: selectedFolderForFlashcard || null,
          title: newFlashcardSetTitle.trim(),
          card_count: validFlashcards.length,
          source: 'created'
        }])
        .select()
        .single();

      if (setError) throw setError;

      // Create individual flashcards
      const flashcardsToInsert = validFlashcards.map(row => ({
        user_id: user.id,
        flashcard_set_id: flashcardSet.id,
        front_text: row.front.trim(),
        back_text: row.back.trim()
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
      setFlashcardRows([{
        id: 1,
        front: '',
        back: '',
        frontImage: null,
        backImage: null
      }]);

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
  const filteredSets = flashcardSets.filter(set => {
    const matchesSearch = set.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSource === 'all' || set.source === filterSource;
    return matchesSearch && matchesFilter;
  });
  const unorganizedSets = filteredSets.filter(set => !set.folderId);
  if (loading || loadingFolders) {
    return <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({
            length: 6
          }).map((_, i) => <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>)}
          </div>
        </div>
      </div>;
  }
  return <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8 relative overflow-hidden">
        <BackgroundDecorations />
        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t('flashcards.title')}</h1>
            <p className="text-muted-foreground">{t('flashcards.description')}</p>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder={t('flashcards.search')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            
            <Select value={filterSource} onValueChange={setFilterSource}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder={t('common.filter')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filter.all')}</SelectItem>
                <SelectItem value="created">{t('filter.created')}</SelectItem>
                <SelectItem value="uploaded">{t('filter.uploaded')}</SelectItem>
                <SelectItem value="marketcard">{t('filter.marketcard')}</SelectItem>
              </SelectContent>
            </Select>

            {/* Primary CTA - Create Flashcard */}
            <Dialog open={showCreateFlashcardDialog} onOpenChange={setShowCreateFlashcardDialog}>
              <DialogTrigger asChild>
                <Button className="w-full md:w-auto bg-gradient-primary text-primary-foreground shadow-elegant hover:shadow-glow">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('flashcards.createFlashcard')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">สร้างแฟลชการ์ดใหม่</DialogTitle>
                  <DialogDescription>
                    สร้างแฟลชการ์ดใหม่สำหรับการเรียนรู้ของคุณ
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Flashcard Set Title */}
                  <div className="space-y-2">
                    <Label htmlFor="flashcard-set-title" className="text-sm font-medium">
                      ชื่อชุดแฟลชการ์ด *
                    </Label>
                    <Input
                      id="flashcard-set-title"
                      placeholder="เช่น คำศัพท์ภาษาอังกฤษพื้นฐาน"
                      value={newFlashcardSetTitle}
                      onChange={(e) => setNewFlashcardSetTitle(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* Folder Selection Section */}
                  <div className="border-t pt-4">
                    <Label className="text-sm font-medium mb-3 block">จัดเก็บในโฟลเดอร์</Label>
                    <div className="flex gap-3">
                      {/* Create New Folder Button */}
                      <Button variant="outline" onClick={() => setShowNewFolderDialog(true)} className="flex items-center gap-2 flex-shrink-0">
                        <FolderPlus className="h-4 w-4" />
                        สร้างโฟลเดอร์ใหม่
                      </Button>

                      {/* Folder Dropdown with Search */}
                      <div className="flex-1">
                        <Select value={selectedFolderForFlashcard} onValueChange={setSelectedFolderForFlashcard}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="เลือกโฟลเดอร์ (ไม่บังคับ)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">ไม่เลือกโฟลเดอร์</SelectItem>
                            {folders.map(folder => <SelectItem key={folder.id} value={folder.id}>
                                <div className="flex items-center gap-2">
                                  <Folder className="h-4 w-4" />
                                  {folder.title}
                                </div>
                              </SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  {/* Headers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">ด้านหน้า</Label>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">ด้านหลัง</Label>
                    </div>
                  </div>

                  {/* Flashcard Rows */}
                  <div className="space-y-4">
                    {flashcardRows.map((row, index) => <div key={row.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        {/* Front Side */}
                        <div className="relative">
                          <Textarea placeholder="ใส่ข้อความด้านหน้า…" value={row.front} onChange={e => handleFlashcardTextChange(row.id, 'front', e.target.value)} className="min-h-[100px] pr-10 resize-none focus:ring-2 focus:ring-primary/20 border-muted-foreground/20 rounded-lg" />
                          <Button variant="ghost" size="sm" className="absolute top-2 right-2 h-8 w-8 p-0 text-muted-foreground hover:text-primary" onClick={() => handleImageUpload(row.id, 'front')}>
                            <ImagePlus className="h-4 w-4" />
                          </Button>
                          {row.frontImage && <div className="absolute top-2 left-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                              รูปภาพแนบแล้ว
                            </div>}
                        </div>

                        {/* Back Side */}
                        <div className="relative">
                          <Textarea placeholder="ใส่ข้อความด้านหลัง…" value={row.back} onChange={e => handleFlashcardTextChange(row.id, 'back', e.target.value)} className="min-h-[100px] pr-10 resize-none focus:ring-2 focus:ring-primary/20 border-muted-foreground/20 rounded-lg" />
                          <Button variant="ghost" size="sm" className="absolute top-2 right-2 h-8 w-8 p-0 text-muted-foreground hover:text-primary" onClick={() => handleImageUpload(row.id, 'back')}>
                            <ImagePlus className="h-4 w-4" />
                          </Button>
                          {row.backImage && <div className="absolute top-2 left-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                              รูปภาพแนบแล้ว
                            </div>}
                        </div>

                        {/* Delete Button */}
                        {flashcardRows.length > 1 && <div className="md:col-span-2 flex justify-end">
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveFlashcardRow(row.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>}
                      </div>)}
                  </div>

                  {/* Add Row Button */}
                  <div className="flex justify-center">
                    <Button variant="outline" onClick={handleAddFlashcardRow} className="text-pink-600 border-pink-200 hover:bg-pink-50 hover:border-pink-300">
                      <Plus className="h-4 w-4 mr-2" />
                      เพิ่มแถว
                    </Button>
                  </div>

                  {/* Create Button */}
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleCreateFlashcards} className="bg-gradient-primary text-primary-foreground hover:shadow-glow px-8 py-2">
                      สร้าง
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                  <FolderPlus className="h-4 w-4 mr-2" />
                  {t('flashcards.createFolder')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('flashcards.createFolder')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input placeholder={t('flashcards.enterFolderName')} value={newFolderName} onChange={e => setNewFolderName(e.target.value)} />
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

          {/* Folders Section */}
          {folders.length > 0 && <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Folder className="h-5 w-5" />
                {t('common.folders')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {folders.map(folder => <DroppableFolder key={folder.id} folder={folder} onDrop={handleMoveToFolder} />)}
              </div>
            </div>}

          {/* Flashcard Sets */}
          {filteredSets.length > 0}

          {/* Empty State */}
          {filteredSets.length === 0 && folders.length === 0 && <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('flashcards.noSets')}</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterSource !== 'all' ? t('flashcards.noSearchResults') : t('flashcards.noSetsDesc')}
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t('flashcards.createFlashcard')}
              </Button>
            </div>}
        </div>
      </div>
    </DndProvider>;
}