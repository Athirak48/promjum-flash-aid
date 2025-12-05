import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, CalendarDays } from 'lucide-react';

interface AutoReviewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'today' | 'tomorrow' | null;
    onConfirm: (count: number) => void;
}

export const AutoReviewDialog: React.FC<AutoReviewDialogProps> = ({ isOpen, onClose, mode, onConfirm }) => {
    const [customCount, setCustomCount] = useState<string>('');
    const [selectedCount, setSelectedCount] = useState<number | null>(null);

    const handleConfirm = () => {
        const count = selectedCount || parseInt(customCount);
        if (count > 0) {
            onConfirm(count);
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
                        {mode === 'today' ? 'Auto ทวนวันนี้' : 'Auto วันพรุ่งนี้'}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>จำนวนคำศัพท์ที่ต้องการทบทวน</Label>
                        <div className="grid grid-cols-4 gap-2">
                            {options.map((count) => (
                                <Button
                                    key={count}
                                    variant={selectedCount === count ? "default" : "outline"}
                                    className={selectedCount === count ? (mode === 'today' ? "bg-purple-600 hover:bg-purple-700" : "bg-orange-500 hover:bg-orange-600") : ""}
                                    onClick={() => {
                                        setSelectedCount(count);
                                        setCustomCount('');
                                    }}
                                >
                                    {count}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-px flex-1 bg-gray-100" />
                        <span className="text-xs text-gray-400">หรือกำหนดเอง</span>
                        <div className="h-px flex-1 bg-gray-100" />
                    </div>
                    <div className="space-y-2">
                        <Label>จำนวนอื่นๆ</Label>
                        <Input
                            type="number"
                            placeholder="ระบุจำนวนคำ"
                            value={customCount}
                            onChange={(e) => {
                                setCustomCount(e.target.value);
                                setSelectedCount(null);
                            }}
                        />
                    </div>
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
