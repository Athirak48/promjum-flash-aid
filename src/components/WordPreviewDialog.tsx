import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Flashcard {
  id: string;
  front_text: string;
  back_text: string;
  part_of_speech?: string;
  synonym?: string;
  example_sentence?: string;
}

interface WordPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flashcards: Flashcard[];
  subdeckName: string;
}

export function WordPreviewDialog({ open, onOpenChange, flashcards, subdeckName }: WordPreviewDialogProps) {
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  const toggleFlip = (cardId: string) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
            {subdeckName} - คำศัพท์ทั้งหมด ({flashcards.length} คำ)
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[65vh] pr-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {flashcards.map((card) => {
              const isFlipped = flippedCards.has(card.id);
              
              return (
                <div
                  key={card.id}
                  className="flip-card h-48 cursor-pointer"
                  onClick={() => toggleFlip(card.id)}
                >
                  <div className={cn(
                    "flip-card-inner",
                    isFlipped && "flipped"
                  )}>
                    {/* Front */}
                    <Card className="flip-card-front absolute inset-0 backface-hidden bg-card border-primary/20">
                      <div className="h-full p-4 flex flex-col items-center justify-center text-center">
                        <p className="text-lg font-semibold text-foreground">
                          {card.front_text}
                        </p>
                        <p className="text-xs text-muted-foreground mt-auto">
                          คลิกเพื่อดูคำแปล
                        </p>
                      </div>
                    </Card>
                    
                    {/* Back */}
                    <Card className="flip-card-back absolute inset-0 backface-hidden bg-primary/10 border-primary/30">
                      <div className="h-full p-4 flex items-center justify-center text-center">
                        <p className="text-base font-medium text-foreground">
                          {card.back_text}
                        </p>
                      </div>
                    </Card>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
