import React, { useState } from 'react';
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
import { useLanguage } from '@/contexts/LanguageContext';
import { useFlashcards } from '@/hooks/useFlashcards';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

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
  FLASHCARD_SET: 'flashcard_set',
};

function FlashcardActions({ setId }: { setId: string }) {
  const { t } = useLanguage();
  const [showSwiper, setShowSwiper] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const { flashcards, loading: flashcardsLoading } = useFlashcards();
  
  const cards: FlashcardData[] = flashcards.map(card => ({
    id: card.id,
    front: card.front_text,
    back: card.back_text
  }));

  const handleReviewComplete = (results: { correct: number; incorrect: number; needsReview: number }) => {
    setShowSwiper(false);
    console.log('Review results:', results);
  };

  if (flashcardsLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="flex gap-2">
        <Button 
          className="flex-1" 
          size="sm"
          onClick={() => setShowReview(true)}
        >
          <Brain className="h-4 w-4 mr-1" />
          {t('flashcards.review')}
        </Button>
        <Button variant="outline" size="sm" className="flex-1">
          <GamepadIcon className="h-4 w-4 mr-1" />
          {t('flashcards.playGame')}
        </Button>
      </div>

      {showSwiper && (
        <FlashcardSwiper
          cards={cards}
          onClose={() => setShowSwiper(false)}
          onComplete={handleReviewComplete}
        />
      )}
      
      {showReview && (
        <FlashcardReviewPage
          cards={cards}
          onClose={() => setShowReview(false)}
          onComplete={handleReviewComplete}
        />
      )}
    </>
  );
}

function DraggableFlashcardSet({ set, onMoveToFolder }: { set: FlashcardSet; onMoveToFolder: (setId: string, folderId: string) => void }) {
  const { t } = useLanguage();
  
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.FLASHCARD_SET,
    item: { id: set.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const getSourceBadge = (source: FlashcardSet['source']) => {
    const variants = {
      created: { variant: 'default' as const, label: t('source.created'), icon: Plus },
      uploaded: { variant: 'secondary' as const, label: t('source.uploaded'), icon: BookOpen },
      marketcard: { variant: 'outline' as const, label: t('source.marketcard'), icon: Zap }
    };
    
    const config = variants[source];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-emerald-500';
    if (progress >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <Card 
      ref={drag}
      className={`transition-all cursor-move ${isDragging ? 'opacity-50 rotate-1 scale-105' : 'hover:shadow-large'}`}
    >
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
            <div 
              className={`h-2 rounded-full transition-all ${getProgressColor(set.progress)}`}
              style={{ width: `${set.progress}%` }}
            />
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
    </Card>
  );
}

function DroppableFolder({ folder, onDrop }: { folder: Folder; onDrop: (setId: string, folderId: string) => void }) {
  const { t } = useLanguage();
  
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.FLASHCARD_SET,
    drop: (item: { id: string }) => onDrop(item.id, folder.id),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <Card 
      ref={drop}
      className={`transition-all cursor-pointer ${isOver ? 'ring-2 ring-primary shadow-glow' : 'hover:shadow-medium'}`}
    >
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
    </Card>
  );
}

export default function FlashcardsPage() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [showCreateFlashcardDialog, setShowCreateFlashcardDialog] = useState(false);
  const [flashcardRows, setFlashcardRows] = useState([{ id: 1, front: '', back: '', frontImage: null as File | null, backImage: null as File | null }]);
  const { flashcards, loading } = useFlashcards();
  
  // Create folders based on flashcard categories (simplified approach)
  const [folders, setFolders] = useState<Folder[]>([
    {
      id: '1',
      title: 'ภาษาอังกฤษ',
      cardSetsCount: flashcards.length || 0,
      createdAt: new Date().toISOString().split('T')[0]
    }
  ]);

  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([
    {
      id: '1',
      title: 'คำศัพท์ภาษาอังกฤษพื้นฐาน',
      cardCount: flashcards.length || 20,
      source: 'uploaded',
      lastReviewed: new Date().toISOString().split('T')[0],
      nextReview: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      progress: 25,
      folderId: '1'
    }
  ]);

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    
    const newFolder: Folder = {
      id: Date.now().toString(),
      title: newFolderName,
      cardSetsCount: 0,
      createdAt: new Date().toISOString()
    };
    
    setFolders([...folders, newFolder]);
    setNewFolderName('');
    setShowNewFolderDialog(false);
  };

  const handleMoveToFolder = (setId: string, folderId: string) => {
    setFlashcardSets(sets => 
      sets.map(set => 
        set.id === setId ? { ...set, folderId } : set
      )
    );
    
    // Update folder card count
    setFolders(folders => 
      folders.map(folder => {
        const setsInFolder = flashcardSets.filter(set => set.folderId === folder.id).length;
        return { ...folder, cardSetsCount: setsInFolder };
      })
    );
  };

  const handleAddFlashcardRow = () => {
    const newRow = { id: Date.now(), front: '', back: '', frontImage: null as File | null, backImage: null as File | null };
    setFlashcardRows([...flashcardRows, newRow]);
  };

  const handleRemoveFlashcardRow = (id: number) => {
    if (flashcardRows.length > 1) {
      setFlashcardRows(flashcardRows.filter(row => row.id !== id));
    }
  };

  const handleFlashcardTextChange = (id: number, field: 'front' | 'back', value: string) => {
    setFlashcardRows(rows => 
      rows.map(row => 
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  const handleImageUpload = (id: number, side: 'front' | 'back') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setFlashcardRows(rows => 
          rows.map(row => 
            row.id === id ? { ...row, [`${side}Image`]: file } : row
          )
        );
      }
    };
    input.click();
  };

  const handleCreateFlashcards = () => {
    // TODO: Implement flashcard creation logic
    console.log('Creating flashcards:', flashcardRows);
    setShowCreateFlashcardDialog(false);
    setFlashcardRows([{ id: 1, front: '', back: '', frontImage: null, backImage: null }]);
  };

  const filteredSets = flashcardSets.filter(set => {
    const matchesSearch = set.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSource === 'all' || set.source === filterSource;
    return matchesSearch && matchesFilter;
  });

  const unorganizedSets = filteredSets.filter(set => !set.folderId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t('flashcards.title')}</h1>
            <p className="text-muted-foreground">{t('flashcards.description')}</p>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t('flashcards.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
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
                  {/* Folder Selection Section */}
                  <div className="border-t pt-4">
                    <Label className="text-sm font-medium mb-3 block">จัดเก็บในโฟลเดอร์</Label>
                    <div className="flex gap-3">
                      {/* Create New Folder Button */}
                      <Button
                        variant="outline"
                        onClick={() => setShowNewFolderDialog(true)}
                        className="flex items-center gap-2 flex-shrink-0"
                      >
                        <FolderPlus className="h-4 w-4" />
                        สร้างโฟลเดอร์ใหม่
                      </Button>

                      {/* Folder Dropdown with Search */}
                      <div className="flex-1">
                        <Select>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="เลือกโฟลเดอร์ (ไม่บังคับ)" />
                          </SelectTrigger>
                          <SelectContent>
                            <div className="p-2">
                              <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  placeholder="ค้นหาโฟลเดอร์..."
                                  className="pl-8"
                                />
                              </div>
                            </div>
                            <SelectItem value="none">ไม่เลือกโฟลเดอร์</SelectItem>
                            {folders.map((folder) => (
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
                    {flashcardRows.map((row, index) => (
                      <div key={row.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        {/* Front Side */}
                        <div className="relative">
                          <Textarea
                            placeholder="ใส่ข้อความด้านหน้า…"
                            value={row.front}
                            onChange={(e) => handleFlashcardTextChange(row.id, 'front', e.target.value)}
                            className="min-h-[100px] pr-10 resize-none focus:ring-2 focus:ring-primary/20 border-muted-foreground/20 rounded-lg"
                          />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="absolute top-2 right-2 h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                            onClick={() => handleImageUpload(row.id, 'front')}
                          >
                            <ImagePlus className="h-4 w-4" />
                          </Button>
                          {row.frontImage && (
                            <div className="absolute top-2 left-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                              รูปภาพแนบแล้ว
                            </div>
                          )}
                        </div>

                        {/* Back Side */}
                        <div className="relative">
                          <Textarea
                            placeholder="ใส่ข้อความด้านหลัง…"
                            value={row.back}
                            onChange={(e) => handleFlashcardTextChange(row.id, 'back', e.target.value)}
                            className="min-h-[100px] pr-10 resize-none focus:ring-2 focus:ring-primary/20 border-muted-foreground/20 rounded-lg"
                          />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="absolute top-2 right-2 h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                            onClick={() => handleImageUpload(row.id, 'back')}
                          >
                            <ImagePlus className="h-4 w-4" />
                          </Button>
                          {row.backImage && (
                            <div className="absolute top-2 left-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                              รูปภาพแนบแล้ว
                            </div>
                          )}
                        </div>

                        {/* Delete Button */}
                        {flashcardRows.length > 1 && (
                          <div className="md:col-span-2 flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFlashcardRow(row.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Row Button */}
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      onClick={handleAddFlashcardRow}
                      className="text-pink-600 border-pink-200 hover:bg-pink-50 hover:border-pink-300"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      เพิ่มแถว
                    </Button>
                  </div>

                  {/* Create Button */}
                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={handleCreateFlashcards}
                      className="bg-gradient-primary text-primary-foreground hover:shadow-glow px-8 py-2"
                    >
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
                  <Input
                    placeholder={t('flashcards.enterFolderName')}
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
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

          {/* Folders Section */}
          {folders.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Folder className="h-5 w-5" />
                {t('common.folders')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {folders.map((folder) => (
                  <DroppableFolder 
                    key={folder.id} 
                    folder={folder} 
                    onDrop={handleMoveToFolder}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Flashcard Sets */}
          {filteredSets.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                แฟลชการ์ดชุดของคุณ
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSets.map((set) => (
                  <DraggableFlashcardSet 
                    key={set.id} 
                    set={set} 
                    onMoveToFolder={handleMoveToFolder}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredSets.length === 0 && folders.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('flashcards.noSets')}</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterSource !== 'all' 
                  ? t('flashcards.noSearchResults')
                  : t('flashcards.noSetsDesc')
                }
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t('flashcards.createFlashcard')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
}