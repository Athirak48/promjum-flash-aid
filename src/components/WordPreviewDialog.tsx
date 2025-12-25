import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';

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
      <DialogContent className="max-w-5xl max-h-[85vh] bg-slate-900/95 backdrop-blur-xl border-white/20 text-white p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {subdeckName} - คำศัพท์ทั้งหมด ({displayCards.length} คำ)
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh] mt-4">
          <div className="grid grid-cols-5 gap-3 pr-4">
            {displayCards.map((card) => {
              const isFlipped = flippedCards.has(card.id);

              return (
                <motion.div
                  key={card.id}
                  className="aspect-square cursor-pointer perspective-1000"
                  onClick={() => toggleFlip(card.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="relative w-full h-full"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.4 }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Front */}
                    <div
                      className="absolute inset-0 rounded-xl bg-slate-800 border border-purple-500/30 flex flex-col items-center justify-center p-3 text-center"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <p className="text-sm font-bold text-white line-clamp-3">
                        {card.front_text}
                      </p>
                      <p className="text-[9px] text-slate-400 mt-2">
                        แตะดูคำแปล
                      </p>
                    </div>

                    {/* Back */}
                    <div
                      className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-700 to-pink-700 border border-purple-400/50 flex items-center justify-center p-3 text-center"
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                      <p className="text-sm font-semibold text-white line-clamp-4">
                        {card.back_text}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
