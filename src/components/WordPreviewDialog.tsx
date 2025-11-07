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
                <Card
                  key={card.id}
                  className={cn(
                    "relative h-48 cursor-pointer transition-all duration-300 hover:shadow-glow",
                    "bg-card backdrop-blur-sm border-primary/20"
                  )}
                  onClick={() => toggleFlip(card.id)}
                >
                  <div className="absolute inset-0 p-4 flex flex-col items-center justify-center text-center">
                    {!isFlipped ? (
                      <>
                        <p className="text-lg font-semibold text-foreground mb-2">
                          {card.front_text}
                        </p>
                        {card.part_of_speech && (
                          <span className="text-xs text-muted-foreground italic px-2 py-1 bg-muted/50 rounded">
                            {card.part_of_speech}
                          </span>
                        )}
                        <p className="text-xs text-muted-foreground mt-auto">
                          คลิกเพื่อดูคำแปล
                        </p>
                      </>
                    ) : (
                      <div className="space-y-2 w-full">
                        <p className="text-base font-medium text-primary">
                          {card.back_text}
                        </p>
                        {card.synonym && (
                          <div className="text-xs text-muted-foreground">
                            <span className="font-semibold">Synonym: </span>
                            {card.synonym}
                          </div>
                        )}
                        {card.example_sentence && (
                          <div className="text-xs text-muted-foreground italic pt-2 border-t border-border/50">
                            "{card.example_sentence}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
