import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Plus, Search, BookOpen, Calendar, Clock, MoreVertical, Play, Edit, Trash, Archive, ImagePlus, X, GamepadIcon } from 'lucide-react';
import { FlashcardSwiper } from '@/components/FlashcardSwiper';
import { FlashcardReviewPage } from '@/components/FlashcardReviewPage';
import { GameSelectionDialog } from '@/components/GameSelectionDialog';
import { FlashcardQuizGame } from '@/components/FlashcardQuizGame';
import { FlashcardMatchingGame } from '@/components/FlashcardMatchingGame';
import { FlashcardListenChooseGame } from '@/components/FlashcardListenChooseGame';
import BackgroundDecorations from '@/components/BackgroundDecorations';

interface FlashcardData {
  id: string;
  front: string;
  back: string;
  source?: string;
}

interface FlashcardSet {
  id: string;
  title: string;
  cardCount: number;
  source: string;
  progress: number;
  lastReviewed: Date | null;
  nextReview: Date | null;
  isArchived: boolean;
  folderId?: string;
}

interface Folder {
  id: string;
  title: string;
  cardSetsCount: number;
}

export function FolderDetail() {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  // Mock data - replace with real data fetching
  const [folder, setFolder] = useState<Folder | null>(null);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [filteredSets, setFilteredSets] = useState<FlashcardSet[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewCardDialog, setShowNewCardDialog] = useState(false);
  const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null);
  const [gameMode, setGameMode] = useState<'swiper' | 'review' | 'quiz' | 'matching' | 'listen' | null>(null);
  const [showGameSelection, setShowGameSelection] = useState(false);
  const [flashcardRows, setFlashcardRows] = useState([{ id: 1, front: '', back: '', frontImage: null as File | null, backImage: null as File | null }]);

  // Mock data - replace with real data fetching based on folderId
  useEffect(() => {
    const fetchFolderData = async () => {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock folder data
      const mockFolder: Folder = {
        id: folderId || '1',
        title: 'โฟลเดอร์วิชาคณิตศาสตร์',
        cardSetsCount: 3
      };

      // Mock flashcard sets in this folder
      const mockSets: FlashcardSet[] = [
        {
          id: '1',
          title: 'สมการเชิงเส้น',
          cardCount: 25,
          source: 'คณิตศาสตร์ ม.3',
          progress: 80,
          lastReviewed: new Date(2024, 2, 15),
          nextReview: new Date(2024, 2, 20),
          isArchived: false,
          folderId: folderId
        },
        {
          id: '2',
          title: 'เรขาคณิต',
          cardCount: 30,
          source: 'คณิตศาสตร์ ม.3',
          progress: 60,
          lastReviewed: new Date(2024, 2, 10),
          nextReview: new Date(2024, 2, 18),
          isArchived: false,
          folderId: folderId
        },
        {
          id: '3',
          title: 'สถิติและความน่าจะเป็น',
          cardCount: 20,
          source: 'คณิตศาสตร์ ม.3',
          progress: 40,
          lastReviewed: null,
          nextReview: new Date(2024, 2, 16),
          isArchived: false,
          folderId: folderId
        }
      ];

      setFolder(mockFolder);
      setFlashcardSets(mockSets);
      setFilteredSets(mockSets);
      setLoading(false);
    };

    fetchFolderData();
  }, [folderId]);

  // Filter flashcard sets based on search term
  useEffect(() => {
    const filtered = flashcardSets.filter(set =>
      set.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      set.source.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSets(filtered);
  }, [searchTerm, flashcardSets]);

  const handlePlayGame = (set: FlashcardSet) => {
    setSelectedSet(set);
    setShowGameSelection(true);
  };

  const handleReviewCards = (set: FlashcardSet) => {
    setSelectedSet(set);
    setGameMode('review');
  };

  const handleGameClose = () => {
    setSelectedSet(null);
    setGameMode(null);
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
    setShowNewCardDialog(false);
    setFlashcardRows([{ id: 1, front: '', back: '', frontImage: null, backImage: null }]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-purple-950 dark:via-pink-900 dark:to-purple-950">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-purple-950 dark:via-pink-900 dark:to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">ไม่พบโฟลเดอร์</h2>
          <Button onClick={() => navigate('/flashcards')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            กลับไปหน้าแฟลชการ์ด
          </Button>
        </div>
      </div>
    );
  }

  // Show game modes
  if (selectedSet && gameMode) {
    const mockFlashcards: FlashcardData[] = [
      { id: '1', front: '2x + 3 = 7', back: 'x = 2' },
      { id: '2', front: '3x - 5 = 10', back: 'x = 5' },
      { id: '3', front: 'x/2 + 4 = 6', back: 'x = 4' },
      { id: '4', front: 'What is the capital of Thailand?', back: 'Bangkok' },
      { id: '5', front: 'What is 5 + 5?', back: '10' },
      { id: '6', front: 'What color do you get when you mix red and blue?', back: 'Purple' }
    ];

    // Convert to flashcard format for quiz and matching games
    const quizFlashcards = mockFlashcards.map(card => ({
      id: card.id,
      front_text: card.front,
      back_text: card.back
    }));

    if (gameMode === 'swiper') {
      return <FlashcardSwiper cards={mockFlashcards} onClose={handleGameClose} onComplete={handleGameClose} />;
    }

    if (gameMode === 'review') {
      return <FlashcardReviewPage cards={mockFlashcards} onComplete={handleGameClose} onClose={handleGameClose} />;
    }

    if (gameMode === 'quiz') {
      return <FlashcardQuizGame flashcards={quizFlashcards} onClose={handleGameClose} />;
    }

    if (gameMode === 'matching') {
      return <FlashcardMatchingGame flashcards={quizFlashcards} onClose={handleGameClose} />;
    }

    if (gameMode === 'listen') {
      return <FlashcardListenChooseGame flashcards={quizFlashcards} onClose={handleGameClose} />;
    }
  }

  const handleGameSelect = (gameType: 'quiz' | 'matching' | 'listen') => {
    setGameMode(gameType);
    setShowGameSelection(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-purple-950 dark:via-pink-900 dark:to-purple-950 relative overflow-hidden">
      <BackgroundDecorations />
      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/flashcards')}
              className="h-10 w-10 p-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{folder.title}</h1>
              <p className="text-muted-foreground">{folder.cardSetsCount} ชุดแฟลชการ์ด</p>
            </div>
          </div>
          
          <Dialog open={showNewCardDialog} onOpenChange={setShowNewCardDialog}>
            <DialogTrigger asChild>
              <Button variant="hero" className="gap-2">
                <Plus className="h-4 w-4" />
                สร้างแฟลชการ์ดใหม่
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">สร้างแฟลชการ์ดใหม่</DialogTitle>
                <DialogDescription>
                  สร้างแฟลชการ์ดใหม่ในโฟลเดอร์ "{folder.title}"
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Current Folder Display */}
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium mb-3 block">จัดเก็บในโฟลเดอร์</Label>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-muted">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{folder.title}</p>
                      <p className="text-sm text-muted-foreground">โฟลเดอร์ปัจจุบัน</p>
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
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="ค้นหาชุดแฟลชการ์ด..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Flashcard Sets Grid */}
        {filteredSets.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">ไม่มีชุดแฟลชการ์ดในโฟลเดอร์นี้</h3>
            <p className="text-muted-foreground mb-4">เริ่มต้นด้วยการสร้างชุดแฟลชการ์ดใหม่</p>
            <Button onClick={() => setShowNewCardDialog(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              สร้างชุดแรกของคุณ
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSets.map((set) => (
              <Card key={set.id} className="group hover:shadow-glow transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{set.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <BookOpen className="h-4 w-4" />
                        <span>{set.cardCount} การ์ด</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {set.source}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          แก้ไข
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Archive className="h-4 w-4 mr-2" />
                          ย้ายออกจากโฟลเดอร์
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash className="h-4 w-4 mr-2" />
                          ลบ
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>ความก้าวหน้า</span>
                      <span>{set.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${set.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Review Info */}
                  <div className="space-y-2 text-xs text-muted-foreground mb-4">
                    {set.lastReviewed && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>ทบทวนล่าสุด: {set.lastReviewed.toLocaleDateString('th-TH')}</span>
                      </div>
                    )}
                    {set.nextReview && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>ทบทวนครั้งต่อไป: {set.nextReview.toLocaleDateString('th-TH')}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleReviewCards(set)}
                    >
                      <BookOpen className="h-3 w-3 mr-1" />
                      ทบทวน
                    </Button>
                    <Button 
                      size="sm" 
                      variant="default" 
                      className="flex-1"
                      onClick={() => handlePlayGame(set)}
                    >
                      <GamepadIcon className="h-3 w-3 mr-1" />
                      เล่นเกม
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Game Selection Dialog */}
      <GameSelectionDialog
        open={showGameSelection}
        onOpenChange={setShowGameSelection}
        onSelectGame={handleGameSelect}
      />
    </div>
  );
}