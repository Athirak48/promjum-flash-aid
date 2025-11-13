import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, FolderOpen, BookOpen, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DeckDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  deckId: string;
  deckName: string;
}

interface SubDeck {
  id: string;
  name: string;
  flashcard_count: number;
}

interface Flashcard {
  id: string;
  front_text: string;
  back_text: string;
  times_reviewed: number;
}

export function DeckDetailDialog({ open, onOpenChange, userId, deckId, deckName }: DeckDetailDialogProps) {
  const [subDecks, setSubDecks] = useState<SubDeck[]>([]);
  const [selectedSubDeck, setSelectedSubDeck] = useState<SubDeck | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);
  const [totalFlashcards, setTotalFlashcards] = useState(0);

  useEffect(() => {
    if (open && userId && deckId) {
      fetchSubDecks();
    }
  }, [open, userId, deckId]);

  const fetchSubDecks = async () => {
    try {
      setLoading(true);

      // Fetch subdecks for this deck
      const { data: subDecksData, error: subDecksError } = await supabase
        .from('sub_decks')
        .select('id, name, flashcard_count')
        .eq('deck_id', deckId)
        .order('display_order', { ascending: true });

      if (subDecksError) throw subDecksError;

      setSubDecks(subDecksData || []);

      // Calculate total flashcards
      const total = (subDecksData || []).reduce((sum, sd) => sum + (sd.flashcard_count || 0), 0);
      setTotalFlashcards(total);

    } catch (error) {
      console.error('Error fetching subdecks:', error);
      // Use mock data if error
      const mockSubDecks = [
        { id: 'mock-1', name: 'Meeting Vocabulary', flashcard_count: 50 },
        { id: 'mock-2', name: 'Office Terms', flashcard_count: 75 },
        { id: 'mock-3', name: 'Business Writing', flashcard_count: 60 },
      ];
      setSubDecks(mockSubDecks);
      setTotalFlashcards(185);
    } finally {
      setLoading(false);
    }
  };

  const fetchFlashcards = async (subDeckId: string) => {
    try {
      setLoadingFlashcards(true);

      // Fetch flashcards for this subdeck
      const { data: flashcardsData, error: flashcardsError } = await supabase
        .from('flashcards')
        .select('id, front_text, back_text')
        .eq('subdeck_id', subDeckId)
        .order('created_at', { ascending: true });

      if (flashcardsError) throw flashcardsError;

      // Fetch user progress for these flashcards
      const flashcardIds = (flashcardsData || []).map(f => f.id);
      let progressMap: Record<string, number> = {};

      if (flashcardIds.length > 0) {
        const { data: progressData } = await supabase
          .from('user_flashcard_progress')
          .select('flashcard_id, times_reviewed')
          .eq('user_id', userId)
          .in('flashcard_id', flashcardIds);

        progressMap = (progressData || []).reduce((acc, p) => {
          acc[p.flashcard_id] = p.times_reviewed || 0;
          return acc;
        }, {} as Record<string, number>);
      }

      // Combine flashcards with progress
      const flashcardsWithProgress = (flashcardsData || []).map(f => ({
        id: f.id,
        front_text: f.front_text,
        back_text: f.back_text,
        times_reviewed: progressMap[f.id] || 0,
      }));

      setFlashcards(flashcardsWithProgress);

    } catch (error) {
      console.error('Error fetching flashcards:', error);
      // Use mock data if error
      const mockFlashcards = [
        { id: '1', front_text: 'Meeting', back_text: 'การประชุม', times_reviewed: 5 },
        { id: '2', front_text: 'Schedule', back_text: 'ตารางเวลา', times_reviewed: 3 },
        { id: '3', front_text: 'Presentation', back_text: 'การนำเสนอ', times_reviewed: 7 },
        { id: '4', front_text: 'Discussion', back_text: 'การอภิปราย', times_reviewed: 2 },
        { id: '5', front_text: 'Agreement', back_text: 'ข้อตกลง', times_reviewed: 4 },
      ];
      setFlashcards(mockFlashcards);
    } finally {
      setLoadingFlashcards(false);
    }
  };

  const handleSubDeckClick = (subDeck: SubDeck) => {
    setSelectedSubDeck(subDeck);
    fetchFlashcards(subDeck.id);
  };

  const handleBack = () => {
    setSelectedSubDeck(null);
    setFlashcards([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[90vh] p-0 gap-0">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="flex items-center gap-3">
            <FolderOpen className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-2xl font-bold">{deckName}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <span>{totalFlashcards} Flashcards</span>
                {selectedSubDeck && (
                  <>
                    <ChevronRight className="w-4 h-4" />
                    <span>{selectedSubDeck.name}</span>
                    <span>({selectedSubDeck.flashcard_count} cards)</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : selectedSubDeck ? (
            // Flashcards Table
            <div className="space-y-4">
              <Button
                variant="outline"
                onClick={handleBack}
                className="mb-4"
              >
                ← กลับไปดู Subfolders
              </Button>

              {loadingFlashcards ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : flashcards.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>ไม่มี Flashcard ใน Subfolder นี้</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-16">No.</TableHead>
                        <TableHead className="w-1/3">Front</TableHead>
                        <TableHead className="w-1/3">Back</TableHead>
                        <TableHead className="w-32 text-center">SRS Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {flashcards.map((card, index) => (
                        <TableRow key={card.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>{card.front_text}</TableCell>
                          <TableCell>{card.back_text}</TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                              {card.times_reviewed}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          ) : (
            // SubDecks Grid
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Subfolders ({subDecks.length})
              </h3>
              {subDecks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>ไม่มี Subfolder ใน Deck นี้</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subDecks.map((subDeck) => (
                    <Card
                      key={subDeck.id}
                      className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-primary"
                      onClick={() => handleSubDeckClick(subDeck)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-lg bg-primary/10">
                            <FolderOpen className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg mb-2">
                              {subDeck.name}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <BookOpen className="w-4 h-4" />
                              <span>{subDeck.flashcard_count} Flashcards</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
