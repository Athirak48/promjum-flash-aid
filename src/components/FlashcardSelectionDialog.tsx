import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shuffle, CheckSquare, Square } from 'lucide-react';

interface Flashcard {
  id: string;
  front_text: string;
  back_text: string;
}

interface FlashcardSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flashcards: Flashcard[];
  onConfirm: (selectedFlashcards: Flashcard[]) => void;
}

export function FlashcardSelectionDialog({ 
  open, 
  onOpenChange, 
  flashcards,
  onConfirm 
}: FlashcardSelectionDialogProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Select all by default when dialog opens
    if (open) {
      setSelectedIds(new Set(flashcards.map(f => f.id)));
    }
  }, [open, flashcards]);

  const handleToggle = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(flashcards.map(f => f.id)));
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleRandomSelect = (count: number) => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, flashcards.length));
    setSelectedIds(new Set(selected.map(f => f.id)));
  };

  const handleConfirm = () => {
    const selected = flashcards.filter(f => selectedIds.has(f.id));
    if (selected.length > 0) {
      onConfirm(selected);
      onOpenChange(false);
    }
  };

  const isAllSelected = selectedIds.size === flashcards.length;
  const selectedCount = selectedIds.size;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>เลือกคำศัพท์ที่ต้องการฝึก</span>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {selectedCount} / {flashcards.length}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 pb-4 border-b">
          <Button
            variant="outline"
            size="sm"
            onClick={isAllSelected ? handleDeselectAll : handleSelectAll}
            className="gap-1.5"
          >
            {isAllSelected ? <Square className="h-3.5 w-3.5" /> : <CheckSquare className="h-3.5 w-3.5" />}
            {isAllSelected ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRandomSelect(5)}
            className="gap-1.5"
          >
            <Shuffle className="h-3.5 w-3.5" />
            สุ่ม 5
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRandomSelect(10)}
            className="gap-1.5"
          >
            <Shuffle className="h-3.5 w-3.5" />
            สุ่ม 10
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRandomSelect(20)}
            className="gap-1.5"
          >
            <Shuffle className="h-3.5 w-3.5" />
            สุ่ม 20
          </Button>
        </div>

        {/* Flashcard List */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[450px]">
            <div className="grid grid-cols-2 gap-3 pr-4">
              {flashcards.map((flashcard, index) => (
                <div
                  key={flashcard.id}
                  className={`group relative p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                    selectedIds.has(flashcard.id) 
                      ? 'border-primary bg-primary/5 shadow-sm' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleToggle(flashcard.id)}
                >
                  <div className="absolute top-2 left-2 z-10">
                    <Checkbox
                      checked={selectedIds.has(flashcard.id)}
                      onCheckedChange={() => handleToggle(flashcard.id)}
                    />
                  </div>
                  <div className="pl-7">
                    <Badge variant="secondary" className="text-xs mb-2">
                      {index + 1}
                    </Badge>
                    <p className="font-medium text-sm mb-2 line-clamp-2">
                      {flashcard.front_text}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {flashcard.back_text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedCount === 0}
            className="gap-2"
          >
            ตกลง ({selectedCount} คำ)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
