import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Search, RotateCcw, ChevronDown, ChevronRight, CheckCircle2, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderSelectionDialog } from '@/components/FolderSelectionDialog';
import { useCloneFolderSets } from '@/hooks/useCloneFolderSets';

interface Flashcard {
    id: string;
    front: string;
    back: string;
    setName: string;
}

interface FolderBundlePreviewProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    folderName: string;
    flashcards: Flashcard[];
    onClone?: (selectedSetNames: string[]) => void;
}

export function FolderBundlePreview({
    open,
    onOpenChange,
    folderName,
    flashcards,
    onClone
}: FolderBundlePreviewProps) {
    const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [collapsedSets, setCollapsedSets] = useState<Set<string>>(new Set());
    const [selectedSets, setSelectedSets] = useState<Set<string>>(new Set());

    // Preview mode state
    const [previewMode, setPreviewMode] = useState<'list' | 'grid'>('list');
    const [previewSetName, setPreviewSetName] = useState<string | null>(null);

    // Folder selection state
    const [showFolderDialog, setShowFolderDialog] = useState(false);
    const { cloneSets, loading: cloning } = useCloneFolderSets();

    // Group flashcards by set
    const groupedBySet = useMemo(() => {
        return flashcards.reduce((acc, card) => {
            if (!acc[card.setName]) {
                acc[card.setName] = [];
            }
            acc[card.setName].push(card);
            return acc;
        }, {} as Record<string, Flashcard[]>);
    }, [flashcards]);

    const setNames = Object.keys(groupedBySet);

    // Filter by search term
    const filteredGroupedSets = useMemo(() => {
        if (!searchTerm) return groupedBySet;

        const search = searchTerm.toLowerCase();
        const filtered: Record<string, Flashcard[]> = {};

        Object.entries(groupedBySet).forEach(([setName, cards]) => {
            const matchingCards = cards.filter(
                card =>
                    card.front.toLowerCase().includes(search) ||
                    card.back.toLowerCase().includes(search)
            );
            if (matchingCards.length > 0) {
                filtered[setName] = matchingCards;
            }
        });

        return filtered;
    }, [groupedBySet, searchTerm]);

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

    const toggleSetCollapse = (setName: string) => {
        setCollapsedSets(prev => {
            const newSet = new Set(prev);
            if (newSet.has(setName)) {
                newSet.delete(setName);
            } else {
                newSet.add(setName);
            }
            return newSet;
        });
    };

    const toggleSetSelection = (setName: string) => {
        setSelectedSets(prev => {
            const newSet = new Set(prev);
            if (newSet.has(setName)) {
                newSet.delete(setName);
            } else {
                newSet.add(setName);
            }
            return newSet;
        });
    };

    const toggleSelectAll = () => {
        if (selectedSets.size === setNames.length) {
            setSelectedSets(new Set());
        } else {
            setSelectedSets(new Set(setNames));
        }
    };

    const resetAllFlips = () => {
        setFlippedCards(new Set());
    };

    const handleClone = () => {
        if (selectedSets.size === 0) return;
        setShowFolderDialog(true);
    };

    const handleFolderSelect = async (folderId: string, folderName: string) => {
        const selectedSetNames = Array.from(selectedSets);

        const success = await cloneSets(selectedSetNames, flashcards, folderId);

        if (success) {
            setShowFolderDialog(false);
            onOpenChange(false);

            // Call original onClone callback if provided
            if (onClone) {
                onClone(selectedSetNames);
            }
        }
    };

    const totalCards = Object.values(filteredGroupedSets).reduce(
        (sum, cards) => sum + cards.length,
        0
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-full max-h-screen h-screen overflow-hidden bg-slate-900 border-0 text-white flex flex-col p-0 m-0 rounded-none">
                <DialogHeader className="flex-shrink-0 px-4 sm:px-8 pt-4 sm:pt-8 pb-2 sm:pb-4">
                    <div className="flex items-center justify-between mb-2 sm:mb-4">
                        <DialogTitle className="text-lg sm:text-2xl md:text-3xl font-bold flex items-center gap-2 sm:gap-3">
                            {previewMode === 'grid' && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setPreviewMode('list');
                                        setPreviewSetName(null);
                                    }}
                                    className="text-white/60 hover:text-white hover:bg-white/10 rounded-xl -ml-2 text-xs sm:text-sm"
                                >
                                    ← กลับ
                                </Button>
                            )}
                            <span className="truncate">📁 {previewMode === 'grid' ? previewSetName : folderName}</span>
                            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-[10px] sm:text-xs">
                                {previewMode === 'grid'
                                    ? `${filteredGroupedSets[previewSetName || '']?.length || 0} คำ`
                                    : `${totalCards} คำ`
                                }
                            </Badge>
                        </DialogTitle>
                    </div>

                    {/* Search Bar + Select All - Same Row */}
                    {previewMode === 'list' && (
                        <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-4">
                            {/* Search Bar */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                <Input
                                    type="text"
                                    placeholder="ค้นหาคำศัพท์..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 pr-3 py-2 h-9 sm:h-10 text-sm rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:ring-2 focus:ring-primary/50"
                                />
                            </div>

                            {/* Select All Checkbox */}
                            <div className="flex items-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-xl bg-white/5 border border-white/10 flex-shrink-0">
                                <Checkbox
                                    checked={selectedSets.size === setNames.length}
                                    onCheckedChange={toggleSelectAll}
                                    className="border-white/30"
                                />
                                <label className="text-white font-medium cursor-pointer text-xs sm:text-sm whitespace-nowrap" onClick={toggleSelectAll}>
                                    เลือกทั้งหมด ({setNames.length} ชุด)
                                </label>
                            </div>
                        </div>
                    )}
                </DialogHeader>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-3 sm:py-4 custom-scrollbar">
                    {previewMode === 'grid' && previewSetName ? (
                        // Grid View - Show flip cards for selected set
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-4">
                            {(filteredGroupedSets[previewSetName] || []).map((card) => (
                                <FlipCard
                                    key={card.id}
                                    card={card}
                                    isFlipped={flippedCards.has(card.id)}
                                    onFlip={() => toggleFlip(card.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        // List View - Show all sets
                        <div className="space-y-4">
                            {Object.entries(filteredGroupedSets).map(([setName, cards]) => (
                                <SetCard
                                    key={setName}
                                    setName={setName}
                                    cards={cards}
                                    isSelected={selectedSets.has(setName)}
                                    onToggle={() => toggleSetSelection(setName)}
                                    onPreview={() => {
                                        setPreviewMode('grid');
                                        setPreviewSetName(setName);
                                    }}
                                />
                            ))}

                            {totalCards === 0 && (
                                <div className="text-center py-20 text-white/40">
                                    <p className="text-lg">ไม่พบคำศัพท์ที่ตรงกับการค้นหา</p>
                                    <p className="text-sm mt-2">ลองค้นหาด้วยคำอื่น</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer with Clone Button - Always show in list mode */}
                {previewMode === 'list' && (
                    <DialogFooter className="flex-shrink-0 border-t border-white/10 px-4 sm:px-8 py-3 sm:py-4">
                        <div className="flex items-center justify-between w-full gap-3 sm:gap-4">
                            <div className="text-xs sm:text-sm text-white/60">
                                เลือก {selectedSets.size} จาก {setNames.length} ชุด
                            </div>
                            <Button
                                onClick={handleClone}
                                disabled={selectedSets.size === 0 || cloning}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold px-4 sm:px-8 py-2 sm:py-3 text-sm rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {cloning ? '⏳ กำลังโคลน...' : `📥 โคลน`}
                            </Button>
                        </div>
                    </DialogFooter>
                )}
            </DialogContent>

            {/* Folder Selection Dialog */}
            <FolderSelectionDialog
                open={showFolderDialog}
                onOpenChange={setShowFolderDialog}
                onSelectFolder={handleFolderSelect}
            />
        </Dialog >
    );
}

// Set Card Component (List View)
function SetCard({
    setName,
    cards,
    isSelected,
    onToggle,
    onPreview
}: {
    setName: string;
    cards: Flashcard[];
    isSelected: boolean;
    onToggle: () => void;
    onPreview: () => void;
}) {
    return (
        <div
            onClick={onToggle}
            className={`glass-card rounded-xl sm:rounded-2xl border transition-all p-3 sm:p-6 cursor-pointer min-h-[100px] sm:min-h-[120px] ${isSelected
                ? 'border-purple-500/50 bg-purple-500/10'
                : 'border-white/10 hover:border-white/30 bg-black/40'
                }`}
        >
            <div className="flex items-start justify-between gap-2 sm:gap-4">
                {/* Left Side - Content */}
                <div className="flex items-start gap-2 sm:gap-4 flex-1 min-w-0">
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={onToggle}
                        className="border-white/30 mt-0.5 sm:mt-1 pointer-events-none"
                    />

                    <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-xl font-bold text-white mb-1 sm:mb-2 truncate">
                            {setName}
                        </h3>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                            <Badge className="bg-white/10 text-white/60 border-white/10 text-[10px] sm:text-xs">
                                📝 {cards.length} คำศัพท์
                            </Badge>
                        </div>

                        {/* Sample words preview */}
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {cards.slice(0, 4).map((card) => (
                                <span key={card.id} className="text-[11px] sm:text-sm text-white/40">
                                    {card.front}
                                </span>
                            ))}
                            {cards.length > 4 && (
                                <span className="text-[11px] sm:text-sm text-white/40">
                                    +{cards.length - 4} more
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side - Action Button */}
                <Button
                    onClick={(e) => {
                        e.stopPropagation();
                        onPreview();
                    }}
                    size="sm"
                    className="gap-1 sm:gap-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 flex-shrink-0 h-7 sm:h-9 px-2 sm:px-3 text-[10px] sm:text-sm"
                >
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                    Preview
                </Button>
            </div>
        </div>
    );
}

// Flip Card Component
function FlipCard({
    card,
    isFlipped,
    onFlip
}: {
    card: Flashcard;
    isFlipped: boolean;
    onFlip: () => void;
}) {
    return (
        <div
            className="relative h-40 cursor-pointer group"
            onClick={onFlip}
            style={{ perspective: '1000px' }}
        >
            <motion.div
                className="relative w-full h-full"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Front Side */}
                <div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-white/20 backdrop-blur-md p-4 flex items-center justify-center text-center group-hover:border-white/40 transition-colors"
                    style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden'
                    }}
                >
                    <div>
                        <p className="text-xl font-bold text-white break-words">
                            {card.front}
                        </p>
                        <p className="text-xs text-white/40 mt-2">คลิกเพื่อพลิก</p>
                    </div>
                </div>

                {/* Back Side */}
                <div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-white/20 backdrop-blur-md p-4 flex items-center justify-center text-center group-hover:border-white/40 transition-colors"
                    style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                    }}
                >
                    <div>
                        <p className="text-lg font-medium text-white break-words">
                            {card.back}
                        </p>
                        <p className="text-xs text-white/40 mt-2">คลิกเพื่อพลิกกลับ</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
