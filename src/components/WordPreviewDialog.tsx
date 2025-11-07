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

  // Mock data for preview if no flashcards provided
  const mockFlashcards: Flashcard[] = [
    { id: '1', front_text: 'Hello', back_text: 'สวัสดี' },
    { id: '2', front_text: 'Thank you', back_text: 'ขอบคุณ' },
    { id: '3', front_text: 'Good morning', back_text: 'สวัสดีตอนเช้า' },
    { id: '4', front_text: 'Goodbye', back_text: 'ลาก่อน' },
    { id: '5', front_text: 'How are you?', back_text: 'สบายดีไหม?' },
    { id: '6', front_text: 'I love you', back_text: 'ฉันรักคุณ' },
    { id: '7', front_text: 'Beautiful', back_text: 'สวยงาม' },
    { id: '8', front_text: 'Delicious', back_text: 'อร่อย' },
    { id: '9', front_text: 'Happy', back_text: 'มีความสุข' },
    { id: '10', front_text: 'Friend', back_text: 'เพื่อน' },
  ];

  const displayCards = flashcards.length > 0 ? flashcards : mockFlashcards;

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
            {subdeckName} - คำศัพท์ทั้งหมด ({displayCards.length} คำ)
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[65vh] pr-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {displayCards.map((card) => {
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
