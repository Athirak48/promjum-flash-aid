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
            <DialogContent className="max-w-md sm:max-w-lg h-[85vh] sm:h-[80vh] flex flex-col p-4 gap-3 rounded-[2rem] border border-white/20 bg-black/80 backdrop-blur-xl shadow-[0_0_50px_rgba(168,85,247,0.2)] text-white">
                <DialogHeader className="pb-0">
                    <DialogTitle className="text-lg font-bold flex items-center gap-2 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                        <Layers className="w-4 h-4 text-purple-400" />
                        เลือกแฟลชการ์ด
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-2.5 py-1">
                    {/* Random Selection Controls - Space Glass Design */}
                    <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1 bg-white/10 rounded-md">
                                <Shuffle className="h-3 w-3 text-purple-300" />
                            </div>
                            <span className="text-[11px] font-semibold text-white/90">สุ่มเลือกจำนวนการ์ด</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1.5">
                                {[5, 10, 20].map((count) => (
                                    <Button
                                        key={count}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRandomSelect(count)}
                                        className="bg-white/5 border-white/10 hover:border-purple-400/50 hover:bg-purple-500/20 hover:text-white transition-all shadow-sm hover:shadow-glow h-7 px-2.5 text-[10px] text-white/70"
                                    >
                                        <Zap className="w-2.5 h-2.5 mr-1 text-yellow-400" />
                                        {count} ใบ
                                    </Button>
                                ))}
                            </div>

                            <div className="w-px h-5 bg-white/10 mx-0.5 hidden sm:block"></div>

                            <div className="flex items-center gap-1.5 bg-white/5 p-0.5 rounded-lg border border-white/10 shadow-sm">
                                <Input
                                    type="number"
                                    placeholder="จำนวน"
                                    value={customCount}
                                    onChange={(e) => setCustomCount(e.target.value)}
                                    className="w-14 h-6 text-center border-0 focus-visible:ring-0 p-0 bg-transparent text-[10px] text-white placeholder:text-white/30"
                                    min="1"
                                    max={flashcards.length}
                                />
                                <Button
                                    size="sm"
                                    onClick={() => handleRandomSelect(parseInt(customCount) || 0)}
                                    disabled={!customCount || parseInt(customCount) <= 0}
                                    className="h-6 px-2.5 bg-purple-600/80 hover:bg-purple-500 text-white rounded-md shadow-sm text-[10px]"
                                >
                                    <Sparkles className="w-2.5 h-2.5 mr-1" />
                                    สุ่ม
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-1">
                        <div className="text-[10px] text-white/60 font-medium">
                            เลือก <span className="text-purple-300 font-bold">{selectedIds.length}</span> จาก {flashcards.length} ใบ
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleSelectAll} className="h-6 text-[10px] text-white/60 hover:text-white hover:bg-white/10 px-2">
                            {selectedIds.length === flashcards.length ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
                        </Button>
                    </div>
                </div>

                {/* Flashcard List - Space Glass */}
                <div className="flex-1 border border-white/10 rounded-xl p-2 overflow-y-auto min-h-0 bg-black/20 custom-scrollbar">
                    <div className="grid grid-cols-1 gap-2">
                        {flashcards.map(card => {
                            const isSelected = selectedIds.includes(card.id);
                            return (
                                <div
                                    key={card.id}
                                    className={`
                    relative overflow-hidden rounded-lg border transition-all duration-200 cursor-pointer group
                    ${isSelected
                                            ? 'bg-purple-500/20 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/20'
                                            : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'}
                  `}
                                    onClick={() => handleToggle(card.id)}
                                >
                                    {/* Selection Indicator Background */}
                                    {isSelected && (
                                        <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-bl-2xl -mr-1 -mt-1 z-0" />
                                    )}

                                    <div className="relative z-10 p-2.5 flex items-start gap-2.5">
                                        {/* Checkbox Container */}
                                        <div className={`
                      flex-shrink-0 w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-200 mt-0.5
                      ${isSelected
                                                ? 'bg-purple-500 border-purple-500'
                                                : 'bg-transparent border-white/30 group-hover:border-white/50'}
                    `}>
                                            {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <BookOpen className={`w-3 h-3 ${isSelected ? 'text-purple-300' : 'text-white/40'}`} />
                                                <span className={`font-bold text-xs truncate ${isSelected ? 'text-white' : 'text-white/80'}`}>
                                                    {card.front_text}
                                                </span>
                                            </div>

                                            <div className="pl-4.5">
                                                <p className="text-[10px] text-white/50 line-clamp-1 leading-relaxed">
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

                <DialogFooter className="mt-1 pt-2 border-t border-white/10 flex-row gap-2 sm:gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 rounded-lg h-8 text-xs border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white hover:border-white/20">
                        ยกเลิก
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={selectedIds.length === 0}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-glow transition-all rounded-lg h-8 text-xs text-white"
                    >
                        ยืนยัน ({selectedIds.length})
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
