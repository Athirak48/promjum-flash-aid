import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, FolderOpen } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UserDecksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userEmail: string;
}

interface DeckProgress {
  deck_id: string;
  deck_name: string;
  flashcard_count: number;
  progress_percentage: number;
}

interface SubDeckProgress {
  subdeck_id: string;
  subdeck_name: string;
  flashcard_count: number;
  cards_learned: number;
}

export default function UserDecksDialog({
  open,
  onOpenChange,
  userId,
  userEmail,
}: UserDecksDialogProps) {
  const [loading, setLoading] = useState(false);
  const [deckProgress, setDeckProgress] = useState<DeckProgress[]>([]);
  const [subDeckProgress, setSubDeckProgress] = useState<SubDeckProgress[]>([]);

  useEffect(() => {
    if (open && userId) {
      fetchUserDecks();
    }
  }, [open, userId]);

  const fetchUserDecks = async () => {
    try {
      setLoading(true);

      // Mock data for demonstration
      const mockDecks: DeckProgress[] = [
        {
          deck_id: '1',
          deck_name: 'Business English',
          flashcard_count: 150,
          progress_percentage: 75,
        },
        {
          deck_id: '2',
          deck_name: 'Travel Phrases',
          flashcard_count: 200,
          progress_percentage: 45,
        },
        {
          deck_id: '3',
          deck_name: 'Daily Conversation',
          flashcard_count: 120,
          progress_percentage: 90,
        },
      ];

      const mockSubDecks: SubDeckProgress[] = [
        {
          subdeck_id: '1',
          subdeck_name: 'Meeting Vocabulary',
          flashcard_count: 50,
          cards_learned: 30,
        },
        {
          subdeck_id: '2',
          subdeck_name: 'Airport & Flight',
          flashcard_count: 75,
          cards_learned: 60,
        },
        {
          subdeck_id: '3',
          subdeck_name: 'Hotel Check-in',
          flashcard_count: 40,
          cards_learned: 25,
        },
        {
          subdeck_id: '4',
          subdeck_name: 'Greetings & Introductions',
          flashcard_count: 30,
          cards_learned: 28,
        },
      ];

      setDeckProgress(mockDecks);
      setSubDeckProgress(mockSubDecks);
    } catch (error) {
      console.error('Error fetching user decks:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalDecks = deckProgress.length + subDeckProgress.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Decks & Folders</DialogTitle>
          <DialogDescription className="text-base font-medium text-foreground">
            {userEmail}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[500px] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : totalDecks === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <FolderOpen className="h-12 w-12 mb-2 opacity-50" />
              <p>ไม่มี Deck หรือ Folder</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Main Decks */}
              {deckProgress.map((deck) => (
                <Card key={deck.deck_id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FolderOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate mb-1">
                          {deck.deck_name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{deck.flashcard_count} cards</span>
                          <span>•</span>
                          <span>{deck.progress_percentage}% complete</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* SubDecks */}
              {subDeckProgress.map((subdeck) => (
                <Card key={subdeck.subdeck_id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-secondary/10">
                        <FolderOpen className="h-5 w-5 text-secondary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate mb-1">
                          {subdeck.subdeck_name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{subdeck.flashcard_count} cards</span>
                          <span>•</span>
                          <span>{subdeck.cards_learned} learned</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
