import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useDecks } from '@/hooks/useDecks';
import { Loader2 } from 'lucide-react';

interface DeckSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectDeck: (deckId: string, deckName: string) => void;
}

export const DeckSelectionDialog = ({ open, onOpenChange, onSelectDeck }: DeckSelectionDialogProps) => {
  const { decks, loading } = useDecks();
  const [selectedDeck, setSelectedDeck] = useState<string>('');
  const [mode, setMode] = useState<'my-decks' | 'random'>('my-decks');

  const handleStart = () => {
    if (mode === 'random') {
      onSelectDeck('random', 'สุ่มคำที่ยังไม่แม่น');
    } else if (selectedDeck) {
      const deck = decks.find(d => d.id === selectedDeck);
      if (deck) {
        onSelectDeck(deck.id, deck.name);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>เลือก Deck สำหรับฝึก</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <RadioGroup value={mode} onValueChange={(v) => setMode(v as any)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="my-decks" id="my-decks" />
              <Label htmlFor="my-decks">Deck ของฉัน</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="random" id="random" />
              <Label htmlFor="random">สุ่มคำที่ยังไม่แม่น</Label>
            </div>
          </RadioGroup>

          {mode === 'my-decks' && (
            <div className="space-y-2">
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : decks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  ยังไม่มี Deck
                </p>
              ) : (
                <RadioGroup value={selectedDeck} onValueChange={setSelectedDeck}>
                  {decks.map((deck) => (
                    <div key={deck.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent">
                      <RadioGroupItem value={deck.id} id={deck.id} />
                      <Label htmlFor={deck.id} className="flex-1 cursor-pointer">
                        <div className="font-medium">{deck.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {deck.total_flashcards} คำ
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </div>
          )}

          <Button 
            onClick={handleStart} 
            className="w-full"
            disabled={mode === 'my-decks' && !selectedDeck}
          >
            เริ่มฝึกเลย
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
