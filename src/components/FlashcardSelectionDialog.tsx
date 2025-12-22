import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Shuffle, Sparkles, Zap, Layers, BookOpen, Check } from 'lucide-react';

interface Flashcard {
    id: string;
    front_text: string;
    back_text: string;
    part_of_speech?: string;
    front_image?: string | null;
    back_image?: string | null;
}

interface FlashcardSelectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    flashcards: Flashcard[];
    onSelect: (selectedCards: Flashcard[]) => void;
}

export function FlashcardSelectionDialog({
    open,
    onOpenChange,
    flashcards,
    onSelect
}: FlashcardSelectionDialogProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [customCount, setCustomCount] = useState('');

    useEffect(() => {
        if (open) {
            // Select all by default
            setSelectedIds(flashcards.map(f => f.id));
        }
    }, [open, flashcards]);

    const handleToggle = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedIds.length === flashcards.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(flashcards.map(f => f.id));
        }
    };

    const handleRandomSelect = (count: number) => {
        if (count <= 0) return;
        const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(count, flashcards.length)).map(f => f.id);
        setSelectedIds(selected);
    };

    const handleConfirm = () => {
        const selected = flashcards.filter(f => selectedIds.includes(f.id));
        onSelect(selected);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md sm:max-w-lg h-[85vh] sm:h-[80vh] flex flex-col p-4 gap-3 rounded-[1.5rem]">
                <DialogHeader className="pb-0">
                    <DialogTitle className="text-lg font-bold flex items-center gap-2">
                        <Layers className="w-4 h-4 text-primary" />
                        เลือกแฟลชการ์ด
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-2.5 py-1">
                    {/* Random Selection Controls - Compact Premium Design */}
                    <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 p-2.5 rounded-xl border border-purple-100 dark:border-purple-900/50 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1 bg-purple-100 dark:bg-purple-900/50 rounded-md">
                                <Shuffle className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                            </div>
                            <span className="text-[11px] font-semibold text-purple-900 dark:text-purple-100">สุ่มเลือกจำนวนการ์ด</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1.5">
                                {[5, 10, 20].map((count) => (
                                    <Button
                                        key={count}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRandomSelect(count)}
                                        className="bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-800 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300 transition-all shadow-sm hover:shadow-md h-7 px-2.5 text-[10px]"
                                    >
                                        <Zap className="w-2.5 h-2.5 mr-1 text-yellow-500" />
                                        {count} ใบ
                                    </Button>
                                ))}
                            </div>

                            <div className="w-px h-5 bg-purple-200 dark:bg-purple-800 mx-0.5 hidden sm:block"></div>

                            <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 p-0.5 rounded-lg border border-purple-200 dark:border-purple-800 shadow-sm">
                                <Input
                                    type="number"
                                    placeholder="จำนวน"
                                    value={customCount}
                                    onChange={(e) => setCustomCount(e.target.value)}
                                    className="w-14 h-6 text-center border-0 focus-visible:ring-0 p-0 bg-transparent text-[10px]"
                                    min="1"
                                    max={flashcards.length}
                                />
                                <Button
                                    size="sm"
                                    onClick={() => handleRandomSelect(parseInt(customCount) || 0)}
                                    disabled={!customCount || parseInt(customCount) <= 0}
                                    className="h-6 px-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md shadow-sm text-[10px]"
                                >
                                    <Sparkles className="w-2.5 h-2.5 mr-1" />
                                    สุ่ม
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-1">
                        <div className="text-[10px] text-muted-foreground font-medium">
                            เลือก <span className="text-primary font-bold">{selectedIds.length}</span> จาก {flashcards.length} ใบ
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleSelectAll} className="h-6 text-[10px] text-muted-foreground hover:text-primary hover:bg-primary/5 px-2">
                            {selectedIds.length === flashcards.length ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
                        </Button>
                    </div>
                </div>

                {/* Flashcard List - Compact */}
                <div className="flex-1 border rounded-xl p-2 overflow-y-auto min-h-0 bg-slate-50/50 dark:bg-slate-900/20 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
                    <div className="grid grid-cols-1 gap-2">
                        {flashcards.map(card => {
                            const isSelected = selectedIds.includes(card.id);
                            return (
                                <div
                                    key={card.id}
                                    className={`
                    relative overflow-hidden rounded-lg border transition-all duration-200 cursor-pointer group
                    ${isSelected
                                            ? 'bg-white dark:bg-slate-800 border-primary shadow-sm ring-1 ring-primary/20'
                                            : 'bg-white dark:bg-slate-800 border-border/50 hover:border-primary/40 hover:shadow-sm'}
                  `}
                                    onClick={() => handleToggle(card.id)}
                                >
                                    {/* Selection Indicator Background */}
                                    {isSelected && (
                                        <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-2xl -mr-1 -mt-1 z-0" />
                                    )}

                                    <div className="relative z-10 p-2.5 flex items-start gap-2.5">
                                        {/* Checkbox Container */}
                                        <div className={`
                      flex-shrink-0 w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-200 mt-0.5
                      ${isSelected
                                                ? 'bg-primary border-primary'
                                                : 'bg-transparent border-muted-foreground/30 group-hover:border-primary/50'}
                    `}>
                                            {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <BookOpen className={`w-3 h-3 ${isSelected ? 'text-primary' : 'text-muted-foreground/50'}`} />
                                                <span className={`font-bold text-xs truncate ${isSelected ? 'text-primary' : 'text-slate-700 dark:text-slate-200'}`}>
                                                    {card.front_text}
                                                </span>
                                            </div>

                                            <div className="pl-4.5">
                                                <p className="text-[10px] text-muted-foreground line-clamp-1 leading-relaxed">
                                                    {card.back_text}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <DialogFooter className="mt-1 pt-2 border-t flex-row gap-2 sm:gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 rounded-lg h-8 text-xs">
                        ยกเลิก
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={selectedIds.length === 0}
                        className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:shadow-md hover:shadow-primary/25 transition-all rounded-lg h-8 text-xs"
                    >
                        ยืนยัน ({selectedIds.length})
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
