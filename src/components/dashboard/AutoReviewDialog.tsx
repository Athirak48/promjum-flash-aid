import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, CalendarDays, Folder, Layers, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { TimePicker } from './TimePicker';

interface AutoReviewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'today' | 'tomorrow' | null;
    onConfirm: (count: number, time: string, folderId?: string, setId?: string) => void;
}

interface UserFolder {
    id: string;
    title: string;
}

interface UserSet {
    id: string;
    title: string;
}

export const AutoReviewDialog: React.FC<AutoReviewDialogProps> = ({ isOpen, onClose, mode, onConfirm }) => {
    const [customCount, setCustomCount] = useState<string>('');
    const [selectedCount, setSelectedCount] = useState<number | null>(null);
    const [reviewTime, setReviewTime] = useState<string>('09:00');

    // Folder & Set Selection State
    const [folders, setFolders] = useState<UserFolder[]>([]);
    const [sets, setSets] = useState<UserSet[]>([]);
    const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
    const [selectedSetId, setSelectedSetId] = useState<string>('all');

    useEffect(() => {
        if (isOpen) {
            fetchFolders();
            // Set default time based on current time or fixed default
            // For now, keep it simple or maybe default to next rounded hour? 
            // '09:00' is fine as initial default or user preferred.
        }
    }, [isOpen]);

    useEffect(() => {
        if (selectedFolderId && selectedFolderId !== 'all') {
            fetchSets(selectedFolderId);
        } else {
            setSets([]);
            setSelectedSetId('all');
        }
    }, [selectedFolderId]);

    const fetchFolders = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('user_folders')
            .select('id, title')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (data) {
            setFolders(data);
        }
    };

    const fetchSets = async (folderId: string) => {
        const { data } = await supabase
            .from('user_flashcard_sets')
            .select('id, title')
            .eq('folder_id', folderId)
            .order('created_at', { ascending: false });

        if (data) {
            setSets(data);
        }
    };

    const handleConfirm = () => {
        const count = selectedCount || parseInt(customCount);
        if (count > 0) {
            onConfirm(
                count,
                reviewTime,
                selectedFolderId === 'all' ? undefined : selectedFolderId,
                selectedSetId === 'all' ? undefined : selectedSetId
            );
            onClose();
        }
    };

    const options = [10, 12, 15, 20];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {mode === 'today' ? (
                            <Sparkles className="w-5 h-5 text-purple-500" />
                        ) : (
                            <CalendarDays className="w-5 h-5 text-orange-500" />
                        )}
                        {mode === 'today' ? 'ทวนวันนี้อีกครั้ง' : 'Auto วันพรุ่งนี้'}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>จำนวนคำศัพท์ที่ต้องการทบทวน</Label>
                        <div className="grid grid-cols-5 gap-2">
                            {options.map((count) => (
                                <Button
                                    key={count}
                                    variant={selectedCount === count ? "default" : "outline"}
                                    className={`h-10 px-0 ${selectedCount === count ? (mode === 'today' ? "bg-purple-600 hover:bg-purple-700" : "bg-orange-500 hover:bg-orange-600") : ""}`}
                                    onClick={() => {
                                        setSelectedCount(count);
                                        setCustomCount('');
                                    }}
                                >
                                    {count}
                                </Button>
                            ))}
                            <Input
                                type="number"
                                placeholder="กำหนดเอง"
                                min={1}
                                value={customCount}
                                className={`h-10 text-center px-1 font-medium ${customCount ? (mode === 'today' ? "border-purple-500 ring-1 ring-purple-500" : "border-orange-500 ring-1 ring-orange-500") : "placeholder:text-gray-400 text-xs"}`}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    // Allow empty string or positive numbers only (prevent 0 and negatives)
                                    if (val === '' || (parseInt(val) > 0 && !val.includes('-'))) {
                                        setCustomCount(val);
                                        setSelectedCount(null);
                                    }
                                }}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            เวลาที่ต้องการทบทวน
                        </Label>
                        <div className="flex justify-center p-2 border rounded-xl bg-gray-50/50">
                            <TimePicker value={reviewTime} onChange={setReviewTime} />
                        </div>
                    </div>

                    {mode === 'tomorrow' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Folder className="w-3.5 h-3.5" />
                                    เลือกโฟลเดอร์
                                </Label>
                                <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="ทั้งหมด" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">ทั้งหมด</SelectItem>
                                        {folders.map(folder => (
                                            <SelectItem key={folder.id} value={folder.id}>
                                                {folder.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Layers className="w-3.5 h-3.5" />
                                    เลือกชุดคำศัพท์
                                </Label>
                                <Select value={selectedSetId} onValueChange={setSelectedSetId} disabled={selectedFolderId === 'all' || sets.length === 0}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="ทั้งหมด" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">ทั้งหมด</SelectItem>
                                        {sets.map(set => (
                                            <SelectItem key={set.id} value={set.id}>
                                                {set.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>ยกเลิก</Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!selectedCount && !customCount}
                        className={mode === 'today' ? "bg-purple-600 hover:bg-purple-700" : "bg-orange-500 hover:bg-orange-600"}
                    >
                        ยืนยัน
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
