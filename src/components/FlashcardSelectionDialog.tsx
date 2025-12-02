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
            <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-6">
                <DialogHeader className="pb-2">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Layers className="w-5 h-5 text-primary" />
                        เลือกแฟลชการ์ด
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-3 py-2">
                    {/* Random Selection Controls - Compact Premium Design */}
                    <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 p-3 rounded-xl border border-purple-100 dark:border-purple-900/50 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1 bg-purple-100 dark:bg-purple-900/50 rounded-md">
                                <Shuffle className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <span className="text-xs font-semibold text-purple-900 dark:text-purple-100">สุ่มเลือกจำนวนการ์ด</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1.5">
                                {[5, 10, 20].map((count) => (
                                    <Button
                                        key={count}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRandomSelect(count)}
                                        className="bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-800 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300 transition-all shadow-sm hover:shadow-md h-8 px-3 text-xs"
                                    >
                                        <Zap className="w-3 h-3 mr-1 text-yellow-500" />
                                        {count} ใบ
                                    </Button>
                                ))}
                            </div>

                            <div className="w-px h-6 bg-purple-200 dark:bg-purple-800 mx-1 hidden sm:block"></div>

                            <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 p-0.5 rounded-lg border border-purple-200 dark:border-purple-800 shadow-sm">
                                <Input
                                    type="number"
                                    placeholder="จำนวน"
                                    value={customCount}
                                    onChange={(e) => setCustomCount(e.target.value)}
                                    className="w-16 h-7 text-center border-0 focus-visible:ring-0 p-0 bg-transparent text-xs"
                                    min="1"
                                    max={flashcards.length}
                                />
                                <Button
                                    size="sm"
                                    onClick={() => handleRandomSelect(parseInt(customCount) || 0)}
                                    disabled={!customCount || parseInt(customCount) <= 0}
                                    className="h-7 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md shadow-sm text-xs"
                                >
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    สุ่ม
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-1">
                        <div className="text-xs text-muted-foreground font-medium">
                            เลือก <span className="text-primary font-bold">{selectedIds.length}</span> จาก {flashcards.length} ใบ
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleSelectAll} className="h-7 text-xs text-muted-foreground hover:text-primary hover:bg-primary/5">
                            {selectedIds.length === flashcards.length ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
                        </Button>
                    </div>
                </div>

                {/* Flashcard List - 2 Columns Compact Premium */}
                <div className="flex-1 border rounded-xl p-3 overflow-y-auto min-h-0 bg-slate-50/50 dark:bg-slate-900/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {flashcards.map(card => {
                            const isSelected = selectedIds.includes(card.id);
                            return (
                                <div
                                    key={card.id}
                                    className={`
                    relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer group
                    ${isSelected
                                            ? 'bg-white dark:bg-slate-800 border-primary shadow-md ring-1 ring-primary/20 scale-[1.01]'
                                            : 'bg-white dark:bg-slate-800 border-border/50 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5'}
                  `}
                                    onClick={() => handleToggle(card.id)}
                                >
                                    {/* Selection Indicator Background */}
                                    {isSelected && (
                                        <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-3xl -mr-2 -mt-2 z-0" />
                                    )}

                                    <div className="relative z-10 p-3 flex items-start gap-3">
                                        {/* Checkbox Container */}
                                        <div className={`
                      flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 mt-0.5
                      ${isSelected
                                                ? 'bg-primary border-primary scale-110'
                                                : 'bg-transparent border-muted-foreground/30 group-hover:border-primary/50'}
                    `}>
                                            {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <BookOpen className={`w-3.5 h-3.5 ${isSelected ? 'text-primary' : 'text-muted-foreground/50'}`} />
                                                <span className={`font-bold text-sm truncate ${isSelected ? 'text-primary' : 'text-slate-700 dark:text-slate-200'}`}>
                                                    {card.front_text}
                                                </span>
                                            </div>

                                            <div className="pl-5.5">
                                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
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

                <DialogFooter className="mt-3 pt-3 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg h-9 text-sm">
                        ยกเลิก
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={selectedIds.length === 0}
                        className="bg-gradient-to-r from-primary to-purple-600 hover:shadow-md hover:shadow-primary/25 transition-all rounded-lg px-6 h-9 text-sm"
                    >
                        ยืนยัน ({selectedIds.length})
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
