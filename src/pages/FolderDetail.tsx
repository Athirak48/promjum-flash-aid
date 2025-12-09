import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Plus, Search, BookOpen, Calendar, Clock, MoreVertical, Play, Edit, Trash, ImagePlus, X, GamepadIcon, Check } from 'lucide-react';
import { FlashcardSwiper } from '@/components/FlashcardSwiper';
import { FlashcardReviewPage } from '@/components/FlashcardReviewPage';
import { GameSelectionDialog } from '@/components/GameSelectionDialog';
import { FlashcardQuizGame } from '@/components/FlashcardQuizGame';
import { FlashcardMatchingGame } from '@/components/FlashcardMatchingGame';
import { FlashcardListenChooseGame } from '@/components/FlashcardListenChooseGame';
import { FlashcardHangmanGame } from '@/components/FlashcardHangmanGame';
import { FlashcardVocabBlinderGame } from '@/components/FlashcardVocabBlinderGame';
import { FlashcardWordSearchGame } from '@/components/FlashcardWordSearchGame';
import { FlashcardSelectionDialog } from '@/components/FlashcardSelectionDialog';
import BackgroundDecorations from '@/components/BackgroundDecorations';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useSRSProgress } from '@/hooks/useSRSProgress';

interface FlashcardData {
  id: string;
  front: string;
  back: string;
  frontImage?: string | null;
  backImage?: string | null;
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

interface FlashcardRow {
  id: number;
  front: string;
  back: string;
  frontImage: File | null;
  backImage: File | null;
}

export function FolderDetail() {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [folder, setFolder] = useState<Folder | null>(null);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [filteredSets, setFilteredSets] = useState<FlashcardSet[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewCardDialog, setShowNewCardDialog] = useState(false);
  const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null);
  const [gameMode, setGameMode] = useState<'swiper' | 'review' | 'quiz' | 'matching' | 'listen' | 'hangman' | 'vocabBlinder' | 'wordSearch' | null>(null);
  const [showGameSelection, setShowGameSelection] = useState(false);
  const [showFlashcardSelection, setShowFlashcardSelection] = useState(false);
  const [showReviewFlashcardSelection, setShowReviewFlashcardSelection] = useState(false);
  const [selectedFlashcards, setSelectedFlashcards] = useState<FlashcardData[]>([]);
  const [availableFlashcards, setAvailableFlashcards] = useState<FlashcardData[]>([]);
  const [flashcardRows, setFlashcardRows] = useState<FlashcardRow[]>(
    Array(5).fill(null).map((_, i) => ({ id: i + 1, front: '', back: '', frontImage: null, backImage: null }))
  );
  const [newSetTitle, setNewSetTitle] = useState('');


  // New state for actions
  const [showEditSetDialog, setShowEditSetDialog] = useState(false);
  const [editingSetTitle, setEditingSetTitle] = useState('');
  const [selectedSetForEdit, setSelectedSetForEdit] = useState<FlashcardSet | null>(null);

  const [setToDelete, setSetToDelete] = useState<FlashcardSet | null>(null);

  // SRS Hook
  const { updateFromFlashcardReview } = useSRSProgress();
  const attemptCountsRef = React.useRef<Map<string, number>>(new Map());

  const handleSRSUpdate = async (cardId: string, known: boolean, timeTaken: number) => {
    // Determine if user card (in FolderDetail they are usually user cards)
    // We can assume they are user cards if source is 'สร้างเอง' or similar, but for now defaulting true is safer for user_flashcards table access
    // Actually, in updateFromFlashcardReview, if isUserFlashcard is true, it updates user_flashcards.
    // In FolderDetail, we are dealing with user_flashcards table, so YES, always true.

    const currentAttempts = attemptCountsRef.current.get(cardId) || 0;
    attemptCountsRef.current.set(cardId, currentAttempts + 1);

    await updateFromFlashcardReview(cardId, known, currentAttempts + 1, timeTaken, true);
  };

  // Move dialog states
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [setToMove, setSetToMove] = useState<FlashcardSet | null>(null);
  const [moveSearchTerm, setMoveSearchTerm] = useState('');
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [allFolders, setAllFolders] = useState<Folder[]>([]);

  // Fetch folder data from Supabase
  useEffect(() => {
    const fetchFolderData = async () => {
      if (!folderId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          toast({
            title: "กรุณาเข้าสู่ระบบ",
            description: "คุณต้องเข้าสู่ระบบเพื่อดูโฟลเดอร์",
            variant: "destructive"
          });
          navigate('/auth');
          return;
        }

        // Fetch folder
        const { data: folderData, error: folderError } = await supabase
          .from('user_folders')
          .select('*')
          .eq('id', folderId)
          .eq('user_id', user.id)
          .single();

        if (folderError || !folderData) {
          toast({
            title: "ไม่พบโฟลเดอร์",
            description: "ไม่พบโฟลเดอร์ที่คุณต้องการดู",
            variant: "destructive"
          });
          navigate('/flashcards');
          return;
        }

        // Fetch flashcard sets in this folder
        const { data: setsData, error: setsError } = await supabase
          .from('user_flashcard_sets')
          .select('*')
          .eq('folder_id', folderId)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (setsError) throw setsError;

        // For each set, count the flashcards
        const setsWithCounts = await Promise.all((setsData || []).map(async (set) => {
          const { count } = await supabase
            .from('user_flashcards')
            .select('*', { count: 'exact', head: true })
            .eq('flashcard_set_id', set.id);

          return {
            id: set.id,
            title: set.title,
            cardCount: count || 0,
            source: set.source,
            progress: set.progress || 0,
            lastReviewed: set.last_reviewed ? new Date(set.last_reviewed) : null,
            nextReview: set.next_review ? new Date(set.next_review) : null,
            isArchived: false,
            folderId: set.folder_id || undefined
          };
        }));

        setFolder({
          id: folderData.id,
          title: folderData.title,
          cardSetsCount: setsWithCounts.length
        });

        setFlashcardSets(setsWithCounts);
        setFilteredSets(setsWithCounts);
      } catch (error) {
        console.error('Error fetching folder data:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลโฟลเดอร์ได้",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFolderData();
  }, [folderId, navigate, toast]);

  // Filter flashcard sets based on search term
  useEffect(() => {
    const filtered = flashcardSets.filter(set =>
      set.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      set.source.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSets(filtered);
  }, [searchTerm, flashcardSets]);

  const getFlashcardsForSet = async (setId: string) => {
    const { data, error } = await supabase
      .from('user_flashcards')
      .select('*')
      .eq('flashcard_set_id', setId);

    if (error) {
      console.error('Error fetching flashcards:', error);
      return [];
    }

    return data.map(card => ({
      id: card.id,
      front: card.front_text,
      back: card.back_text,
      frontImage: card.front_image_url,
      backImage: card.back_image_url,
      source: ''
    }));
  };

  const handlePlayGame = async (set: FlashcardSet) => {
    setSelectedSet(set);
    const flashcards = await getFlashcardsForSet(set.id);
    setAvailableFlashcards(flashcards);
    setShowFlashcardSelection(true);
  };

  const handleFlashcardsSelected = (flashcards: { id: string; front_text: string; back_text: string; front_image?: string | null; back_image?: string | null }[]) => {
    const converted: FlashcardData[] = flashcards.map(card => ({
      id: card.id,
      front: card.front_text,
      back: card.back_text,
      frontImage: card.front_image,
      backImage: card.back_image
    }));
    setSelectedFlashcards(converted);
    setShowFlashcardSelection(false);
    setShowGameSelection(true);
  };

  const handleGameSelect = (game: 'quiz' | 'matching' | 'listen' | 'hangman' | 'vocabBlinder' | 'wordSearch') => {
    setGameMode(game);
    setShowGameSelection(false);
    setShowFlashcardSelection(false);
  };

  const handleReviewCards = async (set: FlashcardSet) => {
    setSelectedSet(set);
    const flashcards = await getFlashcardsForSet(set.id);
    setAvailableFlashcards(flashcards);
    setShowReviewFlashcardSelection(true);
  };

  const handleReviewFlashcardsSelected = (flashcards: { id: string; front_text: string; back_text: string; front_image?: string | null; back_image?: string | null }[]) => {
    const converted: FlashcardData[] = flashcards.map(card => ({
      id: card.id,
      front: card.front_text,
      back: card.back_text,
      frontImage: card.front_image,
      backImage: card.back_image
    }));

    // Shuffle the flashcards array
    const shuffled = [...converted].sort(() => Math.random() - 0.5);

    setSelectedFlashcards(shuffled);
    setShowReviewFlashcardSelection(false);
    setGameMode('review');
  };

  const handleReviewComplete = () => {
    // Refresh the flashcard sets to get updated progress
    const refreshData = async () => {
      if (!folderId) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: setsData } = await supabase
          .from('user_flashcard_sets')
          .select('*')
          .eq('folder_id', folderId)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (setsData) {
          const setsWithCounts = await Promise.all(setsData.map(async (set) => {
            const { count } = await supabase
              .from('user_flashcards')
              .select('*', { count: 'exact', head: true })
              .eq('flashcard_set_id', set.id);

            return {
              id: set.id,
              title: set.title,
              cardCount: count || 0,
              source: set.source,
              progress: set.progress || 0,
              lastReviewed: set.last_reviewed ? new Date(set.last_reviewed) : null,
              nextReview: set.next_review ? new Date(set.next_review) : null,
              isArchived: false,
              folderId: set.folder_id || undefined
            };
          }));

          setFlashcardSets(setsWithCounts);
          setFilteredSets(setsWithCounts);
        }
      } catch (error) {
        console.error('Error refreshing data:', error);
      }
    };

    refreshData();
    handleGameClose();
  };

  const handleGameClose = () => {
    setSelectedSet(null);
    setGameMode(null);
  };

  const handleAddFlashcardRow = () => {
    const newRow = { id: Date.now() + Math.random(), front: '', back: '', frontImage: null as File | null, backImage: null as File | null };
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

  const handleCreateFlashcards = async () => {
    if (!newSetTitle.trim()) {
      toast({
        title: "กรุณาใส่ชื่อชุดแฟลชการ์ด",
        variant: "destructive"
      });
      return;
    }

    const validRows = flashcardRows.filter(row =>
      (row.front.trim() || row.frontImage) && (row.back.trim() || row.backImage)
    );
    if (validRows.length < 1) {
      toast({
        title: "กรุณาเพิ่มแฟลชการ์ดอย่างน้อย 1 ใบ",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "กรุณาเข้าสู่ระบบ",
          variant: "destructive"
        });
        return;
      }

      // 1. Create the set
      const { data: newSet, error: setError } = await supabase
        .from('user_flashcard_sets')
        .insert({
          user_id: user.id,
          folder_id: folderId,
          title: newSetTitle.trim(),
          source: 'created'
        })
        .select()
        .single();

      if (setError) throw setError;

      // 2. Create flashcards with image upload
      if (validRows.length > 0) {
        const flashcardsToInsert = await Promise.all(validRows.map(async (row) => {
          let frontImageUrl = null;
          let backImageUrl = null;

          if (row.frontImage) {
            const fileName = `${user.id}/${Date.now()}_front_${row.id}`;
            const { data, error } = await supabase.storage
              .from('flashcard-images')
              .upload(fileName, row.frontImage);

            if (!error && data) {
              const { data: { publicUrl } } = supabase.storage
                .from('flashcard-images')
                .getPublicUrl(fileName);
              frontImageUrl = publicUrl;
            }
          }

          if (row.backImage) {
            const fileName = `${user.id}/${Date.now()}_back_${row.id}`;
            const { data, error } = await supabase.storage
              .from('flashcard-images')
              .upload(fileName, row.backImage);

            if (!error && data) {
              const { data: { publicUrl } } = supabase.storage
                .from('flashcard-images')
                .getPublicUrl(fileName);
              backImageUrl = publicUrl;
            }
          }

          return {
            user_id: user.id,
            flashcard_set_id: newSet.id,
            front_text: row.front.trim(),
            back_text: row.back.trim(),
            front_image_url: frontImageUrl,
            back_image_url: backImageUrl
          };
        }));

        const { error: cardsError } = await supabase
          .from('user_flashcards')
          .insert(flashcardsToInsert);

        if (cardsError) throw cardsError;
      }

      // 3. Update local state
      const newSetWithCount: FlashcardSet = {
        id: newSet.id,
        title: newSet.title,
        cardCount: validRows.length,
        source: newSet.source,
        progress: 0,
        lastReviewed: null,
        nextReview: null,
        isArchived: false,
        folderId: newSet.folder_id
      };

      setFlashcardSets(prev => [newSetWithCount, ...prev]);

      // 4. Reset form
      setNewSetTitle('');

      setFlashcardRows(
        Array(5).fill(null).map((_, i) => ({ id: Date.now() + Math.random(), front: '', back: '', frontImage: null, backImage: null }))
      );
      setShowNewCardDialog(false);

      toast({
        title: "สร้างชุดแฟลชการ์ดสำเร็จ",
        description: `สร้างชุด "${newSet.title}" เรียบร้อยแล้ว`
      });

    } catch (error) {
      console.error('Error creating flashcards:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถสร้างชุดแฟลชการ์ดได้",
        variant: "destructive"
      });
    }
  };

  const handleEditSetClick = (set: FlashcardSet) => {
    setSelectedSetForEdit(set);
    setEditingSetTitle(set.title);
    setShowEditSetDialog(true);
  };

  const handleSaveSetEdit = async () => {
    if (!selectedSetForEdit || !editingSetTitle.trim()) return;

    try {
      const { error } = await supabase
        .from('user_flashcard_sets')
        .update({ title: editingSetTitle.trim() })
        .eq('id', selectedSetForEdit.id);

      if (error) throw error;

      setFlashcardSets(prev => prev.map(s => s.id === selectedSetForEdit.id ? { ...s, title: editingSetTitle.trim() } : s));
      setShowEditSetDialog(false);
      toast({ title: "บันทึกสำเร็จ", description: "แก้ไขชื่อชุดแฟลชการ์ดเรียบร้อยแล้ว" });
    } catch (error) {
      console.error('Error updating set:', error);
      toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถแก้ไขชื่อชุดแฟลชการ์ดได้", variant: "destructive" });
    }
  };

  const handleMoveClick = async (set: FlashcardSet) => {
    setSetToMove(set);
    setShowMoveDialog(true);
    setMoveSearchTerm('');
    fetchFolders();
  };

  const fetchFolders = async () => {
    try {
      setLoadingFolders(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_folders')
        .select('*')
        .eq('user_id', user.id)
        .order('title');

      if (error) throw error;

      // Map to Folder interface (simplified)
      const folders: Folder[] = data.map(f => ({
        id: f.id,
        title: f.title,
        cardSetsCount: 0 // Not needed for this list
      }));

      setAllFolders(folders);
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถดึงข้อมูลโฟลเดอร์ได้", variant: "destructive" });
    } finally {
      setLoadingFolders(false);
    }
  };

  const handleConfirmMove = async (targetFolderId: string | null) => {
    if (!setToMove) return;

    try {
      const { error } = await supabase
        .from('user_flashcard_sets')
        .update({ folder_id: targetFolderId })
        .eq('id', setToMove.id);

      if (error) throw error;

      // Remove from current view if moved to a different folder (or root)
      // If targetFolderId is null (root) and we are in a folder, it should be removed.
      // If targetFolderId is different from current folderId, it should be removed.
      // Since we are in FolderDetail, any move out of THIS folder means removal.
      if (targetFolderId !== folderId) {
        setFlashcardSets(prev => prev.filter(s => s.id !== setToMove.id));
        setFilteredSets(prev => prev.filter(s => s.id !== setToMove.id));
      }

      setShowMoveDialog(false);
      setSetToMove(null);
      toast({ title: "ย้ายสำเร็จ", description: "ย้ายชุดแฟลชการ์ดเรียบร้อยแล้ว" });
    } catch (error) {
      console.error('Error moving set:', error);
      toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถย้ายชุดแฟลชการ์ดได้", variant: "destructive" });
    }
  };

  const handleDeleteSetClick = (set: FlashcardSet) => {
    setSetToDelete(set);
  };

  const handleConfirmDelete = async () => {
    if (!setToDelete) return;

    try {
      const { error } = await supabase
        .from('user_flashcard_sets')
        .delete()
        .eq('id', setToDelete.id);

      if (error) throw error;

      setFlashcardSets(prev => prev.filter(s => s.id !== setToDelete.id));
      setSetToDelete(null);
      toast({ title: "ลบสำเร็จ", description: "ลบชุดแฟลชการ์ดเรียบร้อยแล้ว" });
    } catch (error) {
      console.error('Error deleting set:', error);
      toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถลบชุดแฟลชการ์ดได้", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <BackgroundDecorations />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center mb-8">
            <Skeleton className="h-10 w-10 rounded-full mr-4" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (gameMode && selectedSet) {
    if (gameMode === 'review') {
      return (
        <FlashcardSwiper
          cards={selectedFlashcards.map(c => ({
            id: c.id,
            front: c.front,
            back: c.back,
            frontImage: c.frontImage,
            backImage: c.backImage
          }))}
          onClose={handleReviewComplete}
          onComplete={handleReviewComplete}
          onAnswer={async (cardId, known, timeTaken) => {
            // We need to implement SRS update here
            // But we need the updateFromFlashcardReview function from useSRSProgress hook
            // I'll ensure hook is called at top level and used here
            await handleSRSUpdate(cardId, known, timeTaken);
          }}
        />
      );
    }
    if (gameMode === 'quiz') {
      return (
        <FlashcardQuizGame
          flashcards={selectedFlashcards.map(c => ({
            id: c.id,
            front_text: c.front,
            back_text: c.back,
            front_image: c.frontImage,
            back_image: c.backImage,
            created_at: new Date().toISOString()
          }))}
          onClose={handleGameClose}
        />
      );
    }
    if (gameMode === 'matching') {
      return (
        <FlashcardMatchingGame
          flashcards={selectedFlashcards.map(c => ({
            id: c.id,
            front_text: c.front,
            back_text: c.back,
            front_image: c.frontImage,
            back_image: c.backImage,
            created_at: new Date().toISOString()
          }))}
          onClose={handleGameClose}
        />
      );
    }
    if (gameMode === 'listen') {
      return (
        <FlashcardListenChooseGame
          flashcards={selectedFlashcards.map(c => ({
            id: c.id,
            front_text: c.front,
            back_text: c.back,
            front_image: c.frontImage,
            back_image: c.backImage,
            created_at: new Date().toISOString()
          }))}
          onClose={handleGameClose}
        />
      );
    }
    if (gameMode === 'hangman') {
      return (
        <FlashcardHangmanGame
          flashcards={selectedFlashcards.map(c => ({
            id: c.id,
            front_text: c.front,
            back_text: c.back,
            created_at: new Date().toISOString()
          }))}
          onClose={handleGameClose}
        />
      );
    }
    if (gameMode === 'vocabBlinder') {
      return (
        <FlashcardVocabBlinderGame
          flashcards={selectedFlashcards.map(c => ({
            id: c.id,
            front_text: c.front,
            back_text: c.back,
            created_at: new Date().toISOString()
          }))}
          onClose={handleGameClose}
        />
      );
    }
    if (gameMode === 'wordSearch') {
      return (
        <FlashcardWordSearchGame
          flashcards={selectedFlashcards.map(c => ({
            id: c.id,
            front_text: c.front,
            back_text: c.back,
            created_at: new Date().toISOString()
          }))}
          onClose={handleGameClose}
        />
      );
    }
    return (
      <FlashcardSwiper
        cards={selectedFlashcards.map(c => ({
          id: c.id,
          front: c.front,
          back: c.back
        }))}
        onClose={handleGameClose}
        onComplete={() => handleGameClose()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <BackgroundDecorations />
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => navigate('/flashcards')} className="mr-4">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                {folder?.title || 'Folder'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {folder?.cardSetsCount || 0} ชุดแฟลชการ์ด
              </p>
            </div>
          </div>

          <Dialog open={showNewCardDialog} onOpenChange={setShowNewCardDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary text-primary-foreground hover:shadow-glow transition-all duration-300">
                <Plus className="h-5 w-5 mr-2" />
                สร้างชุดใหม่
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>สร้างชุดแฟลชการ์ดใหม่</DialogTitle>
                <DialogDescription>
                  สร้างชุดคำศัพท์ใหม่ในโฟลเดอร์นี้
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4 flex-1 flex flex-col min-h-0">
                <div className="space-y-2">
                  <Label htmlFor="title">ชื่อชุดแฟลชการ์ด</Label>
                  <Input
                    id="title"
                    placeholder="เช่น คำศัพท์บทที่ 1"
                    value={newSetTitle}
                    onChange={(e) => setNewSetTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                  <div className="flex items-center justify-between">
                    <Label>รายการคำศัพท์</Label>
                    <span className="text-sm text-muted-foreground">
                      {flashcardRows.length} ใบ
                    </span>
                  </div>

                  {flashcardRows.map((row, index) => (
                    <div key={row.id} className="group flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-xl bg-card hover:shadow-md transition-all duration-200 relative">
                      <div className="flex items-center justify-between w-full sm:w-auto sm:justify-center">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted/50 sm:bg-transparent">
                          <span className="text-sm sm:text-lg font-semibold text-muted-foreground/70">
                            {index + 1}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="sm:hidden text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 h-8 w-8 rounded-full"
                          onClick={() => handleRemoveFlashcardRow(row.id)}
                          disabled={flashcardRows.length === 1}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 w-full">
                        <div className="relative group/input">
                          <Input
                            value={row.front}
                            onChange={(e) => handleFlashcardTextChange(row.id, 'front', e.target.value)}
                            placeholder="คำศัพท์ (ด้านหน้า)"
                            className="pr-10 h-10 sm:h-11 rounded-full bg-muted/30 border-transparent focus:bg-background focus:border-primary/50 transition-all font-medium text-sm sm:text-base"
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            {row.frontImage && (
                              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden border border-border">
                                <img
                                  src={URL.createObjectURL(row.frontImage)}
                                  alt="Front"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full ${row.frontImage ? 'text-green-600 bg-green-50' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'}`}
                              onClick={() => handleImageUpload(row.id, 'front')}
                              title={row.frontImage ? 'เปลี่ยนรูปภาพ' : 'เพิ่มรูปภาพ'}
                            >
                              <ImagePlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="relative group/input">
                          <Input
                            value={row.back}
                            onChange={(e) => handleFlashcardTextChange(row.id, 'back', e.target.value)}
                            placeholder="ความหมาย (ด้านหลัง)"
                            className="pr-10 h-10 sm:h-11 rounded-full bg-muted/30 border-transparent focus:bg-background focus:border-primary/50 transition-all font-medium text-sm sm:text-base"
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            {row.backImage && (
                              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden border border-border">
                                <img
                                  src={URL.createObjectURL(row.backImage)}
                                  alt="Back"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full ${row.backImage ? 'text-green-600 bg-green-50' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'}`}
                              onClick={() => handleImageUpload(row.id, 'back')}
                              title={row.backImage ? 'เปลี่ยนรูปภาพ' : 'เพิ่มรูปภาพ'}
                            >
                              <ImagePlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        </div>
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

                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={handleCreateFlashcards}
                      className="bg-gradient-primary text-primary-foreground hover:shadow-glow px-8 py-2"
                    >
                      สร้าง
                    </Button>
                  </div>
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
                        <DropdownMenuItem onClick={() => handleEditSetClick(set)}>
                          <Edit className="h-4 w-4 mr-2" />
                          แก้ไข
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteSetClick(set)} className="text-destructive">
                          <Trash className="h-4 w-4 mr-2" />
                          ลบ
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

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

      {/* Dialogs */}
      {selectedSet && (
        <FlashcardSelectionDialog
          open={showFlashcardSelection}
          onOpenChange={setShowFlashcardSelection}
          flashcards={availableFlashcards.map(card => ({
            id: card.id,
            front_text: card.front,
            back_text: card.back,
            front_image: card.frontImage,
            back_image: card.backImage
          }))}
          onSelect={handleFlashcardsSelected}
        />
      )}

      {selectedSet && (
        <FlashcardSelectionDialog
          open={showReviewFlashcardSelection}
          onOpenChange={setShowReviewFlashcardSelection}
          flashcards={availableFlashcards.map(card => ({
            id: card.id,
            front_text: card.front,
            back_text: card.back,
            front_image: card.frontImage,
            back_image: card.backImage
          }))}
          onSelect={handleReviewFlashcardsSelected}
        />
      )}

      <GameSelectionDialog
        open={showGameSelection}
        onOpenChange={setShowGameSelection}
        onSelectGame={handleGameSelect}
      />

      <Dialog open={showEditSetDialog} onOpenChange={setShowEditSetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขชื่อชุดแฟลชการ์ด</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">ชื่อชุดแฟลชการ์ด</Label>
              <Input
                id="edit-title"
                value={editingSetTitle}
                onChange={(e) => setEditingSetTitle(e.target.value)}
                placeholder="ใส่ชื่อชุดแฟลชการ์ด"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditSetDialog(false)}>
                ยกเลิก
              </Button>
              <Button onClick={handleSaveSetEdit}>
                บันทึก
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>



      <AlertDialog open={!!setToDelete} onOpenChange={(open) => !open && setSetToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>คุณแน่ใจหรือไม่?</AlertDialogTitle>
            <AlertDialogDescription>
              การกระทำนี้ไม่สามารถย้อนกลับได้ ชุดแฟลชการ์ด "{setToDelete?.title}" จะถูกลบถาวร
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
}
