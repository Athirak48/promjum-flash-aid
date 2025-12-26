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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Plus, Search, BookOpen, Calendar, Clock, MoreVertical, Play, Edit, Trash, X, GamepadIcon, Check, Smile } from 'lucide-react';
import { FlashcardSwiper } from '@/components/FlashcardSwiper';
import { FlashcardReviewPage } from '@/components/FlashcardReviewPage';
import { GameSelectionDialog } from '@/components/GameSelectionDialog';
import { FlashcardQuizGame } from '@/components/FlashcardQuizGame';
import { FlashcardMatchingGame } from '@/components/FlashcardMatchingGame';
import { FlashcardListenChooseGame } from '@/components/FlashcardListenChooseGame';
import { FlashcardHangmanGame } from '@/components/FlashcardHangmanGame';
import { FlashcardVocabBlinderGame } from '@/components/FlashcardVocabBlinderGame';
import { FlashcardWordSearchGame } from '@/components/FlashcardWordSearchGame';
import { FlashcardWordScrambleGame } from '@/components/FlashcardWordScrambleGame';
import { FlashcardNinjaSliceGame } from '@/components/FlashcardNinjaSliceGame';
import { FlashcardHoneyCombGame } from '@/components/FlashcardHoneyCombGame';
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
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface FlashcardData {
  id: string;
  front: string;
  back: string;
  partOfSpeech?: string;
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
  id: number | string;
  front: string;
  back: string;
  partOfSpeech: string;
  frontImage?: File | null;
  backImage?: File | null;
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
  const [gameMode, setGameMode] = useState<'swiper' | 'review' | 'quiz' | 'matching' | 'listen' | 'hangman' | 'vocabBlinder' | 'wordSearch' | 'scramble' | 'ninja' | 'honeycomb' | null>(null);
  const [showGameSelection, setShowGameSelection] = useState(false);
  const [showFlashcardSelection, setShowFlashcardSelection] = useState(false);
  const [showReviewFlashcardSelection, setShowReviewFlashcardSelection] = useState(false);
  const [selectedFlashcards, setSelectedFlashcards] = useState<FlashcardData[]>([]);
  const [availableFlashcards, setAvailableFlashcards] = useState<FlashcardData[]>([]);
  const [flashcardRows, setFlashcardRows] = useState<FlashcardRow[]>(
    Array(5).fill(null).map((_, i) => ({ id: i + 1, front: '', back: '', partOfSpeech: 'Noun' }))
  );
  const [newSetTitle, setNewSetTitle] = useState('');


  // New state for actions
  const [editingSetTitle, setEditingSetTitle] = useState('');
  const [selectedSetForEdit, setSelectedSetForEdit] = useState<FlashcardSet | null>(null);
  const [isEditing, setIsEditing] = useState(false);

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
      partOfSpeech: card.part_of_speech || 'Noun',
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

  const handleFlashcardsSelected = (flashcards: { id: string; front_text: string; back_text: string; front_image?: string | null; back_image?: string | null; part_of_speech?: string }[]) => {
    const converted: FlashcardData[] = flashcards.map(card => ({
      id: card.id,
      front: card.front_text,
      back: card.back_text,
      partOfSpeech: card.part_of_speech || 'Noun',
      frontImage: card.front_image,
      backImage: card.back_image
    }));
    setSelectedFlashcards(converted);
    setShowFlashcardSelection(false);
    setShowGameSelection(true);
  };

  const handleGameSelect = (game: 'quiz' | 'matching' | 'listen' | 'hangman' | 'vocabBlinder' | 'wordSearch' | 'scramble' | 'ninja' | 'honeycomb') => {
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

  const handleReviewFlashcardsSelected = (flashcards: { id: string; front_text: string; back_text: string; front_image?: string | null; back_image?: string | null; part_of_speech?: string }[]) => {
    const converted: FlashcardData[] = flashcards.map(card => ({
      id: card.id,
      front: card.front_text,
      back: card.back_text,
      partOfSpeech: card.part_of_speech || 'Noun',
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

  const handleSelectNewGame = () => {
    setGameMode(null);
    setShowGameSelection(true);
  };

  const handleAddFlashcardRow = () => {
    const newRow = { id: Date.now() + Math.random(), front: '', back: '', partOfSpeech: 'Noun', frontImage: null as File | null, backImage: null as File | null };
    setFlashcardRows([...flashcardRows, newRow]);
  };

  const handleRemoveFlashcardRow = (id: number | string) => {
    if (flashcardRows.length > 1) {
      setFlashcardRows(flashcardRows.filter(row => row.id !== id));
    }
  };

  const handleFlashcardTextChange = (id: number | string, field: 'front' | 'back' | 'partOfSpeech', value: string) => {
    setFlashcardRows(rows =>
      rows.map(row =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };



  const handleCreateFlashcards = async () => {
    if ((isEditing ? editingSetTitle : newSetTitle).trim() === '') {
      toast({
        title: "กรุณาใส่ชื่อชุดแฟลชการ์ด",
        variant: "destructive"
      });
      return;
    }

    const validRows = flashcardRows.filter(row =>
      row.front.trim() && row.back.trim()
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

      let targetSetId = '';
      let targetSetTitle = '';

      if (isEditing && selectedSetForEdit) {
        // UPDATE EXISTING SET
        const { error: updateError } = await supabase
          .from('user_flashcard_sets')
          .update({ title: editingSetTitle.trim() })
          .eq('id', selectedSetForEdit.id);

        if (updateError) throw updateError;
        targetSetId = selectedSetForEdit.id;
        targetSetTitle = editingSetTitle.trim();

        // Delete existing cards to replace them (simplest approach for full sync)
        // Or better: Upsert based on ID if we tracked it, but here rows only have temp IDs for new ones usually.
        // The `getFlashcardsForSet` mapped real IDs. If row.id is a string (UUID), it's existing. If number, it's new.
        // Strategy: 
        // 1. Delete all cards NOT in the current validRows (if we were tracking removals). 
        //    But simpler: Delete all for this set, re-insert. (Safe for small sets, but loses SRS history!)
        //    
        //    CRITICAL: Preserving SRS history is likely desired. 
        //    WE MUST MATCH IDs.

        const existingCardIds = validRows.filter(r => typeof r.id === 'string').map(r => r.id);

        // Delete cards that are no longer in the list
        const { error: deleteError } = await supabase
          .from('user_flashcards')
          .delete()
          .eq('flashcard_set_id', targetSetId)
          .not('id', 'in', `(${existingCardIds.length > 0 ? existingCardIds.join(',') : '00000000-0000-0000-0000-000000000000'})`); // if empty, delete all (using dummy UUID) involves logic check

        if (existingCardIds.length === 0) {
          // If no existing cards kept, delete all
          await supabase.from('user_flashcards').delete().eq('flashcard_set_id', targetSetId);
        } else {
          await supabase.from('user_flashcards').delete().eq('flashcard_set_id', targetSetId).not('id', 'in', `(${existingCardIds.join(',')})`);
        }

        // Upsert (Update or Insert)
        // We handle this by splitting: existing (update) vs new (insert)
        const rowsToUpdate = validRows.filter(r => typeof r.id === 'string');
        const rowsToInsert = validRows.filter(r => typeof r.id === 'number');

        // Handle Updates
        for (const row of rowsToUpdate) {
          const updatePayload: any = {
            front_text: row.front.trim(),
            back_text: row.back.trim(),
            part_of_speech: row.partOfSpeech || 'Noun'
          };

          await supabase.from('user_flashcards').update(updatePayload).eq('id', String(row.id));
        }

        // Handle Inserts
        if (rowsToInsert.length > 0) {
          const flashcardsToInsert = await Promise.all(rowsToInsert.map(async (row) => {
            return {
              user_id: user.id,
              flashcard_set_id: targetSetId,
              front_text: row.front.trim(),
              back_text: row.back.trim(),
              part_of_speech: row.partOfSpeech || 'Noun',
              front_image_url: null,
              back_image_url: null
            };
          }));

          await supabase.from('user_flashcards').insert(flashcardsToInsert);
        }

        // Refetch to sync state UI
        setFlashcardSets(prev => prev.map(s => s.id === targetSetId ? { ...s, title: targetSetTitle, cardCount: validRows.length } : s));

      } else {
        // CREATE NEW SET
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
        targetSetId = newSet.id;
        targetSetTitle = newSet.title;

        // 2. Create flashcards with image upload
        if (validRows.length > 0) {
          const flashcardsToInsert = await Promise.all(validRows.map(async (row) => {
            return {
              user_id: user.id,
              flashcard_set_id: newSet.id,
              front_text: row.front.trim(),
              back_text: row.back.trim(),
              part_of_speech: row.partOfSpeech || 'Noun',
              front_image_url: null,
              back_image_url: null
            };
          }));

          const { error: cardsError } = await supabase
            .from('user_flashcards')
            .insert(flashcardsToInsert);

          if (cardsError) throw cardsError;
        }

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
      }

      // 4. Reset form
      setNewSetTitle('');
      setEditingSetTitle('');
      setIsEditing(false);
      setSelectedSetForEdit(null);

      setFlashcardRows(
        Array(5).fill(null).map((_, i) => ({ id: Date.now() + Math.random(), front: '', back: '', partOfSpeech: 'Noun', frontImage: null, backImage: null }))
      );
      setShowNewCardDialog(false);

      toast({
        title: isEditing ? "แก้ไขชุดแฟลชการ์ดสำเร็จ" : "สร้างชุดแฟลชการ์ดสำเร็จ",
        description: `ดำเนินการกับชุด "${targetSetTitle}" เรียบร้อยแล้ว`
      });

    } catch (error) {
      console.error('Error creating/updating flashcards:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลได้",
        variant: "destructive"
      });
    }
  };


  const handleOpenEditSet = async (set: FlashcardSet) => {

    // 1. Fetch Flashcards
    const flashcards = await getFlashcardsForSet(set.id);

    // 2. Populate Rows
    const rows = flashcards.map(c => ({
      id: c.id, // Keep the real ID (string)
      front: c.front,
      back: c.back,
      partOfSpeech: (c as any).partOfSpeech || 'Noun'
    }));

    // Add empty rows if less than 5
    while (rows.length < 5) {
      rows.push({ id: String(Date.now() + Math.random()), front: '', back: '', partOfSpeech: 'Noun' });
    }

    setFlashcardRows(rows as any); // Cast to any because ID type mismatch (number vs string) - verify FlashcardRow interface?
    // Need to update FlashcardRow interface to allow string ID for existing records.

    setSelectedSetForEdit(set);
    setEditingSetTitle(set.title);
    setIsEditing(true);
    setShowNewCardDialog(true);
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
            partOfSpeech: (c as any).partOfSpeech,
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
          onSelectNewGame={handleSelectNewGame}
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
          onSelectNewGame={handleSelectNewGame}
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
          onSelectNewGame={handleSelectNewGame}
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
          onSelectNewGame={handleSelectNewGame}
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
          onSelectNewGame={handleSelectNewGame}
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
          onSelectNewGame={handleSelectNewGame}
        />
      );
    }

    if (gameMode === 'scramble') {
      return (
        <FlashcardWordScrambleGame
          vocabList={selectedFlashcards.map(c => ({
            id: c.id,
            word: c.front,
            meaning: c.back
          }))}
          onExit={handleGameClose}
          onGameFinish={(results) => handleReviewComplete()}
          onNewGame={handleSelectNewGame}
        />
      );
    }
    if (gameMode === 'ninja') {
      return (
        <FlashcardNinjaSliceGame
          vocabList={selectedFlashcards.map(c => ({
            id: c.id,
            word: c.front,
            meaning: c.back
          }))}
          onExit={handleGameClose}
          onGameFinish={(results) => handleReviewComplete()}
          onSelectNewGame={handleSelectNewGame}
        />
      );
    }
    if (gameMode === 'honeycomb') {
      return (
        <FlashcardHoneyCombGame
          vocabList={selectedFlashcards.map(c => ({
            id: c.id,
            word: c.front,
            meaning: c.back
          }))}
          onExit={handleGameClose}
          onGameFinish={(results) => handleReviewComplete()}
          onNewGame={handleSelectNewGame}
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
              <Button onClick={() => { setIsEditing(false); setNewSetTitle(''); setFlashcardRows(Array(5).fill(null).map((_, i) => ({ id: Date.now() + Math.random(), front: '', back: '', partOfSpeech: 'Noun', frontImage: null, backImage: null }))); setShowNewCardDialog(true); }} className="bg-black/40 hover:bg-black/60 text-white border border-purple-500/50 hover:border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.15)] hover:shadow-[0_0_25px_rgba(168,85,247,0.3)] transition-all duration-300 rounded-full px-6 backdrop-blur-sm group">
                <Plus className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform text-purple-400" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 font-semibold">สร้างชุดใหม่</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-6 rounded-[2rem] border border-white/20 bg-black/80 backdrop-blur-xl shadow-[0_0_50px_rgba(168,85,247,0.2)] text-white" style={{ transform: 'translate(-50%, -50%)' }}>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                  {isEditing ? 'แก้ไขชุดแฟลชการ์ด' : 'สร้างชุดแฟลชการ์ดใหม่'}
                </DialogTitle>
                <DialogDescription className="text-white/50">
                  {isEditing ? 'แก้ไขข้อมูลชุดแฟลชการ์ดของคุณ' : 'สร้างชุดคำศัพท์ใหม่ในโฟลเดอร์นี้'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 flex-1 flex flex-col min-h-0 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-semibold text-white/80">ชื่อชุดแฟลชการ์ด</Label>
                  <div className="relative">
                    <Input
                      id="title"
                      value={isEditing ? editingSetTitle : newSetTitle}
                      onChange={(e) => isEditing ? setEditingSetTitle(e.target.value) : setNewSetTitle(e.target.value)}
                      placeholder="เช่น คำศัพท์บทที่ 1"
                      className="bg-white/10 border-white/10 text-white placeholder:text-white/30 focus:bg-white/20 focus:border-purple-500/50 focus:ring-purple-500/20 h-12 rounded-xl transition-all pr-12"
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-white/50 hover:text-yellow-400 hover:bg-white/10 rounded-full transition-colors"
                        >
                          <Smile className="h-5 w-5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 border-none bg-transparent shadow-none" align="end">
                        <EmojiPicker
                          theme={Theme.DARK}
                          onEmojiClick={(emojiObject) => {
                            if (isEditing) {
                              setEditingSetTitle(prev => prev + emojiObject.emoji);
                            } else {
                              setNewSetTitle(prev => prev + emojiObject.emoji);
                            }
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="flex items-center justify-between sticky top-0 bg-black/40 backdrop-blur-md z-10 py-3 border-b border-white/10">
                    <Label className="text-sm font-semibold text-white/80">รายการคำศัพท์</Label>
                    <span className="text-xs font-bold text-white bg-white/10 border border-white/10 px-3 py-1 rounded-full">
                      {flashcardRows.length} ใบ
                    </span>
                  </div>

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
                        className="hidden sm:flex text-white/20 hover:text-red-400 hover:bg-white/5 h-10 w-10 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                        onClick={() => handleRemoveFlashcardRow(row.id)}
                        disabled={flashcardRows.length === 1}
                      >
                        <Trash className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={handleAddFlashcardRow}
                    className="w-full border-dashed border-2 border-white/20 hover:border-white/40 text-white/60 hover:text-white hover:bg-white/5 transition-all h-12 rounded-xl"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    เพิ่มคำศัพท์
                  </Button>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-auto">
                  <Button variant="ghost" onClick={() => setShowNewCardDialog(false)} className="text-white/40 hover:text-white hover:bg-white/5">
                    ยกเลิก
                  </Button>
                  <Button onClick={handleCreateFlashcards} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white min-w-[120px] shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 border border-purple-500/50 transition-all rounded-xl">
                    <Check className="w-4 h-4 mr-2" />
                    {isEditing ? 'บันทึกการแก้ไข' : 'สร้างชุดแฟลชการ์ด'}
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
        {
          filteredSets.length === 0 ? (
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
                <div key={set.id} className="group relative transition-all duration-300 hover:scale-[1.02]">
                  <div className="glass-card rounded-[2rem] border border-white/20 hover:border-white/40 bg-white/10 backdrop-blur-md p-6 relative overflow-hidden shadow-lg h-full flex flex-col">
                    {/* Light Reflection */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-50" />

                    {/* Hover Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-xl text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors">{set.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
                            <BookOpen className="h-4 w-4 text-cyan-400" />
                            <span>{set.cardCount} การ์ด</span>
                          </div>
                          <Badge variant="outline" className="text-[10px] border-white/20 text-white/50 bg-white/5 hover:bg-white/10">
                            {set.source}
                          </Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/40 hover:text-white hover:bg-white/10 rounded-full">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-black/90 border-white/20 text-white rounded-xl">
                            <DropdownMenuItem onClick={() => handleOpenEditSet(set)} className="focus:bg-white/10 focus:text-white rounded-lg">
                              <Edit className="h-4 w-4 mr-2" />
                              แก้ไข
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteSetClick(set)} className="text-red-400 focus:bg-red-500/10 focus:text-red-300 rounded-lg">
                              <Trash className="h-4 w-4 mr-2" />
                              ลบ
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="mb-4 mt-auto">
                        <div className="flex justify-between text-xs font-medium text-white/50 mb-1">
                          <span>ความก้าวหน้า</span>
                          <span className="text-primary">{set.progress}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                            style={{ width: `${set.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="space-y-2 text-[10px] text-white/40 mb-4">
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

                      <div className="flex gap-2 mt-auto pt-2 border-t border-white/5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 bg-transparent border-white/10 text-white hover:bg-white/10 hover:text-white hover:border-white/30 rounded-xl"
                          onClick={() => handleReviewCards(set)}
                        >
                          <BookOpen className="h-3 w-3 mr-1" />
                          ทบทวน
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-white/10 hover:bg-primary hover:text-white text-white/90 border-0 shadow-lg hover:shadow-glow transition-all rounded-xl"
                          onClick={() => handlePlayGame(set)}
                        >
                          <GamepadIcon className="h-3 w-3 mr-1" />
                          เล่นเกม
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        {/* Dialogs */}
        {
          selectedSet && (
            <FlashcardSelectionDialog
              open={showFlashcardSelection}
              onOpenChange={setShowFlashcardSelection}
              flashcards={availableFlashcards.map(card => ({
                id: card.id,
                front_text: card.front,
                back_text: card.back,
                part_of_speech: card.partOfSpeech,
                front_image: card.frontImage,
                back_image: card.backImage
              }))}
              onSelect={handleFlashcardsSelected}
            />
          )
        }

        {
          selectedSet && (
            <FlashcardSelectionDialog
              open={showReviewFlashcardSelection}
              onOpenChange={setShowReviewFlashcardSelection}
              flashcards={availableFlashcards.map(card => ({
                id: card.id,
                front_text: card.front,
                back_text: card.back,
                part_of_speech: card.partOfSpeech,
                front_image: card.frontImage,
                back_image: card.backImage
              }))}
              onSelect={handleReviewFlashcardsSelected}
            />
          )
        }

        <GameSelectionDialog
          open={showGameSelection}
          onOpenChange={setShowGameSelection}
          onSelectGame={handleGameSelect}
        />





        <AlertDialog open={!!setToDelete} onOpenChange={(open) => !open && setSetToDelete(null)}>
          <AlertDialogContent className="rounded-[2rem] border border-white/20 bg-black/80 backdrop-blur-xl shadow-[0_0_50px_rgba(244,63,94,0.2)] text-white" style={{ transform: 'translate(-50%, -50%)' }}>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">คุณแน่ใจหรือไม่?</AlertDialogTitle>
              <AlertDialogDescription className="text-white/50">
                การกระทำนี้ไม่สามารถย้อนกลับได้ ชุดแฟลชการ์ด "{setToDelete?.title}" จะถูกลบถาวร
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white">ยกเลิก</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border border-purple-500/50 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 rounded-xl transition-all">
                ลบ
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
