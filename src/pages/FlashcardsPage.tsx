import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, Plus, Brain, GamepadIcon, Settings, BookOpen, Clock, Zap, Folder, FolderPlus, Filter, MoreVertical, Edit, Trash, Move } from 'lucide-react';
import { FlashcardSwiper } from '@/components/FlashcardSwiper';
import { useLanguage } from '@/contexts/LanguageContext';
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
          <span>{t('flashcards.progress')} {set.progress}%</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t('flashcards.progress')}</span>
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

function FlashcardActions({ setId }: { setId: string }) {
  const { t } = useLanguage();
  const [showSwiper, setShowSwiper] = useState(false);

  // Mock flashcard data - replace with real data
  const mockCards: FlashcardData[] = [
    { id: '1', front: 'Hello', back: 'สวัสดี' },
    { id: '2', front: 'Thank you', back: 'ขอบคุณ' },
    { id: '3', front: 'Good morning', back: 'อรุณสวัสดิ์' },
  ];

  const handleReviewComplete = (results: { correct: number; incorrect: number; needsReview: number }) => {
    setShowSwiper(false);
    // Handle SRS results here
    console.log('Review results:', results);
  };

  return (
    <>
      <div className="flex gap-2">
        <Button 
          className="flex-1" 
          size="sm"
          onClick={() => setShowSwiper(true)}
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
          cards={mockCards}
          onClose={() => setShowSwiper(false)}
          onComplete={handleReviewComplete}
        />
      )}
    </>
  );
}

export default function FlashcardsPage() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);

  // Mock data - replace with real data from Supabase
  const [folders, setFolders] = useState<Folder[]>([
    {
      id: '1',
      title: 'ภาษาอังกฤษ',
      cardSetsCount: 3,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      title: 'คณิตศาสตร์',
      cardSetsCount: 2,
      createdAt: '2024-01-10'
    }
  ]);

  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([
    {
      id: '1',
      title: 'คำศัพท์ภาษาอังกฤษ TOEIC',
      cardCount: 150,
      source: 'uploaded',
      lastReviewed: '2024-01-20',
      nextReview: '2024-01-22',
      progress: 75,
      folderId: '1'
    },
    {
      id: '2', 
      title: 'ประวัติศาสตร์ไทย',
      cardCount: 85,
      source: 'created',
      lastReviewed: '2024-01-19',
      nextReview: '2024-01-21',
      progress: 60
    },
    {
      id: '3',
      title: 'คณิตศาสตร์ ม.6',
      cardCount: 200,
      source: 'marketcard',
      lastReviewed: '2024-01-18',
      nextReview: '2024-01-23',
      progress: 40,
      folderId: '2'
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

  const filteredSets = flashcardSets.filter(set => {
    const matchesSearch = set.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSource === 'all' || set.source === filterSource;
    return matchesSearch && matchesFilter;
  });

  const unorganizedSets = filteredSets.filter(set => !set.folderId);

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

            <Button className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              {t('flashcards.createFlashcard')}
            </Button>
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

          {/* Unorganized Flashcard Sets */}
          {unorganizedSets.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {t('common.unorganized')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unorganizedSets.map((set) => (
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