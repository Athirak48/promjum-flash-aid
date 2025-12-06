import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Folder, FileText } from 'lucide-react';

interface UserFlashcardsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userEmail: string;
}

interface UserFolder {
  id: string;
  title: string;
  card_sets_count: number;
}

interface FlashcardSet {
  id: string;
  title: string;
  card_count: number;
  source: string;
}

interface Flashcard {
  id: string;
  front_text: string;
  back_text: string;
  srs_score?: number | null;
}

export function UserFlashcardsDialog({ open, onOpenChange, userId, userEmail }: UserFlashcardsDialogProps) {
  const [folders, setFolders] = useState<UserFolder[]>([]);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [selectedSetId, setSelectedSetId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && userId) {
      fetchUserFolders();
    }
  }, [open, userId]);

  useEffect(() => {
    if (selectedFolderId) {
      fetchFlashcardSets();
      setSelectedSetId('');
      setFlashcards([]);
    }
  }, [selectedFolderId]);

  useEffect(() => {
    if (selectedSetId) {
      fetchFlashcards();
    }
  }, [selectedSetId]);

  const fetchUserFolders = async () => {
    try {
      setLoading(true);

      // Fetch folders
      const { data: foldersData, error: foldersError } = await supabase
        .from('user_folders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (foldersError) throw foldersError;

      // Fetch all flashcard sets to count per folder
      const { data: setsData, error: setsError } = await supabase
        .from('user_flashcard_sets')
        .select('id, folder_id')
        .eq('user_id', userId);

      if (setsError) throw setsError;

      // Calculate real counts per folder
      const foldersWithCounts = (foldersData || []).map(folder => {
        const setsInFolder = (setsData || []).filter(s => s.folder_id === folder.id).length;
        return {
          ...folder,
          card_sets_count: setsInFolder
        };
      });

      setFolders(foldersWithCounts);
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast.error('ไม่สามารถโหลดโฟลเดอร์ได้');
    } finally {
      setLoading(false);
    }
  };

  const fetchFlashcardSets = async () => {
    try {
      setLoading(true);

      // Fetch flashcard sets
      const { data: setsData, error: setsError } = await supabase
        .from('user_flashcard_sets')
        .select('*')
        .eq('user_id', userId)
        .eq('folder_id', selectedFolderId)
        .order('created_at', { ascending: false });

      if (setsError) throw setsError;

      // Fetch all flashcards to count per set
      if (setsData && setsData.length > 0) {
        const setIds = setsData.map(s => s.id);
        const { data: cardsData, error: cardsError } = await supabase
          .from('user_flashcards')
          .select('id, flashcard_set_id')
          .in('flashcard_set_id', setIds);

        if (cardsError) throw cardsError;

        // Calculate real card counts per set
        const setsWithCounts = setsData.map(set => {
          const cardsInSet = (cardsData || []).filter(c => c.flashcard_set_id === set.id).length;
          return {
            ...set,
            card_count: cardsInSet
          };
        });

        setFlashcardSets(setsWithCounts);
      } else {
        setFlashcardSets([]);
      }
    } catch (error) {
      console.error('Error fetching flashcard sets:', error);
      toast.error('ไม่สามารถโหลดชุดแฟลชการ์ดได้');
    } finally {
      setLoading(false);
    }
  };

  const fetchFlashcards = async () => {
    try {
      setLoading(true);

      // First, get the flashcards
      const { data: cardsData, error: cardsError } = await supabase
        .from('user_flashcards')
        .select('*')
        .eq('flashcard_set_id', selectedSetId)
        .order('created_at', { ascending: true });

      if (cardsError) throw cardsError;

      // Then get the progress data for these flashcards using user_flashcard_id
      if (cardsData && cardsData.length > 0) {
        const flashcardIds = cardsData.map(card => card.id);
        const { data: progressData, error: progressError } = await supabase
          .from('user_flashcard_progress')
          .select('user_flashcard_id, srs_score')
          .eq('user_id', userId)
          .in('user_flashcard_id', flashcardIds);

        if (progressError) throw progressError;

        // Create a map for quick lookup using user_flashcard_id
        const progressMap = new Map(
          progressData?.map(p => [p.user_flashcard_id, p.srs_score]) || []
        );

        // Merge the data
        const flashcardsWithProgress = cardsData.map(card => ({
          ...card,
          srs_score: progressMap.get(card.id) ?? null
        }));

        setFlashcards(flashcardsWithProgress);
      } else {
        setFlashcards([]);
      }
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      toast.error('ไม่สามารถโหลดคำศัพท์ได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Flashcards ของ {userEmail}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Folder Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Folder className="h-4 w-4" />
              เลือก Folder
            </label>
            <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
              <SelectTrigger>
                <SelectValue placeholder="กรุณาเลือก folder" />
              </SelectTrigger>
              <SelectContent>
                {folders.length === 0 ? (
                  <SelectItem value="no-folders" disabled>
                    ไม่มี folder
                  </SelectItem>
                ) : (
                  folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.title} ({folder.card_sets_count} sets)
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Flashcard Set Selection */}
          {selectedFolderId && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                เลือก Flashcard Set
              </label>
              <Select value={selectedSetId} onValueChange={setSelectedSetId}>
                <SelectTrigger>
                  <SelectValue placeholder="กรุณาเลือก flashcard set" />
                </SelectTrigger>
                <SelectContent>
                  {flashcardSets.length === 0 ? (
                    <SelectItem value="no-sets" disabled>
                      ไม่มี flashcard set
                    </SelectItem>
                  ) : (
                    flashcardSets.map((set) => (
                      <SelectItem key={set.id} value={set.id}>
                        {set.title} ({set.card_count} cards) - {set.source}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Flashcards Table */}
          {selectedSetId && (
            <div className="border rounded-lg">
              <ScrollArea className="h-[400px]">
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : flashcards.length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground">
                    ไม่มีคำศัพท์ใน set นี้
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">No.</TableHead>
                        <TableHead>Front</TableHead>
                        <TableHead>Back</TableHead>
                        <TableHead className="w-24">SRS Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {flashcards.map((card, index) => (
                        <TableRow key={card.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>{card.front_text}</TableCell>
                          <TableCell>{card.back_text}</TableCell>
                          <TableCell className="font-semibold">{'-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </ScrollArea>
            </div>
          )}

          {!selectedFolderId && (
            <div className="text-center p-8 text-muted-foreground">
              กรุณาเลือก folder เพื่อดูข้อมูล
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
