import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Globe, Lock, Tag, Folder } from 'lucide-react';
import { useToggleDeckPublic } from '@/hooks/useToggleDeckPublic';

interface DeckSharingToggleProps {
    deckId: string;
    isPublic: boolean;
    currentCategory?: string | null;
    currentTags?: string[];
    onToggle?: () => void;
}

const CATEGORIES = [
    'Language',
    'Science',
    'Medical',
    'Engineering',
    'History',
    'Mathematics',
    'Literature',
    'Business',
    'Other'
];

export function DeckSharingToggle({
    deckId,
    isPublic: initialIsPublic,
    currentCategory,
    currentTags,
    onToggle
}: DeckSharingToggleProps) {
    const [isPublic, setIsPublic] = useState(initialIsPublic);
    const [showDialog, setShowDialog] = useState(false);
    const [category, setCategory] = useState(currentCategory || '');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>(currentTags || []);
    const { togglePublic, loading } = useToggleDeckPublic();

    const handleToggle = async (checked: boolean) => {
        if (checked) {
            // Show dialog to set category and tags when making public
            setShowDialog(true);
        } else {
            // Directly toggle to private
            const success = await togglePublic(deckId, false);
            if (success) {
                setIsPublic(false);
                onToggle?.();
            }
        }
    };

    const handleMakePublic = async () => {
        const success = await togglePublic(deckId, true, category, tags);
        if (success) {
            setIsPublic(true);
            setShowDialog(false);
            onToggle?.();
        }
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim().toLowerCase()]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    return (
        <>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 flex-1">
                    {isPublic ? (
                        <Globe className="w-5 h-5 text-green-400" />
                    ) : (
                        <Lock className="w-5 h-5 text-white/40" />
                    )}
                    <div>
                        <Label className="text-white font-medium">
                            {isPublic ? 'แชร์สู่ชุมชน' : 'Deck ส่วนตัว'}
                        </Label>
                        <p className="text-xs text-white/50">
                            {isPublic
                                ? 'ทุกคนสามารถโคลน Deck นี้ได้'
                                : 'เฉพาะคุณเท่านั้นที่เห็น Deck นี้'
                            }
                        </p>
                    </div>
                </div>
                <Switch
                    checked={isPublic}
                    onCheckedChange={handleToggle}
                    disabled={loading}
                />
            </div>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="bg-slate-900 border-white/20 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Globe className="w-5 h-5 text-green-400" />
                            แชร์ Deck สู่ชุมชน
                        </DialogTitle>
                        <DialogDescription className="text-white/60">
                            เพิ่มข้อมูลเพื่อให้คนอื่นค้นหา Deck ของคุณได้ง่ายขึ้น
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Category Selection */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-white/80">
                                <Folder className="w-4 h-4" />
                                หมวดหมู่
                            </Label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                <option value="">เลือกหมวดหมู่...</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Tags Input */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-white/80">
                                <Tag className="w-4 h-4" />
                                Tags (เช่น #ielts, #anatomy)
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddTag();
                                        }
                                    }}
                                    placeholder="พิมพ์แล้วกด Enter"
                                    className="flex-1 bg-white/5 border-white/10 text-white"
                                />
                                <Button
                                    type="button"
                                    onClick={handleAddTag}
                                    variant="outline"
                                    className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                                >
                                    เพิ่ม
                                </Button>
                            </div>

                            {/* Tags Display */}
                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {tags.map(tag => (
                                        <Badge
                                            key={tag}
                                            className="bg-purple-500/20 text-purple-300 border-purple-500/30 cursor-pointer hover:bg-purple-500/30"
                                            onClick={() => handleRemoveTag(tag)}
                                        >
                                            #{tag} ×
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDialog(false)}
                            className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            onClick={handleMakePublic}
                            disabled={loading || !category}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                        >
                            {loading ? 'กำลังแชร์...' : 'แชร์ Deck'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
