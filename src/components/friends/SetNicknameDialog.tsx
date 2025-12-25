import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X, Loader2, User, Sparkles, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface SetNicknameDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    canClose?: boolean; // If false, user must set nickname before closing
}

export function SetNicknameDialog({
    open,
    onOpenChange,
    onSuccess,
    canClose = true
}: SetNicknameDialogProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [nickname, setNickname] = useState('');
    const [checking, setChecking] = useState(false);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ available: boolean; message: string } | null>(null);
    const [currentNickname, setCurrentNickname] = useState<string | null>(null);

    // Load current nickname
    useEffect(() => {
        if (open && user) {
            loadCurrentNickname();
        }
    }, [open, user]);

    const loadCurrentNickname = async () => {
        if (!user) return;

        const { data } = await supabase
            .from('profiles')
            .select('nickname')
            .eq('id', user.id)
            .single();

        if (data?.nickname) {
            setCurrentNickname(data.nickname);
            setNickname(data.nickname);
        }
    };

    // Debounced check nickname availability
    useEffect(() => {
        if (!nickname.trim() || nickname.length < 3) {
            setStatus(null);
            return;
        }

        // Don't check if it's the same as current nickname
        if (currentNickname && nickname.toLowerCase() === currentNickname.toLowerCase()) {
            setStatus({ available: true, message: 'ชื่อปัจจุบันของคุณ' });
            return;
        }

        const timer = setTimeout(async () => {
            setChecking(true);
            try {
                const { data, error } = await supabase.rpc('check_nickname_available', {
                    p_nickname: nickname.trim(),
                    p_current_user_id: user?.id || null
                });

                if (error) {
                    console.error('Error checking nickname:', error);
                    setStatus({ available: false, message: 'เกิดข้อผิดพลาด กรุณาลองใหม่' });
                } else if (data && data.length > 0) {
                    setStatus({ available: data[0].available, message: data[0].message });
                }
            } catch (err) {
                console.error('Error:', err);
                setStatus({ available: false, message: 'เกิดข้อผิดพลาด' });
            } finally {
                setChecking(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [nickname, user, currentNickname]);

    const handleSave = async () => {
        if (!user || !nickname.trim() || !status?.available) return;

        setSaving(true);
        try {
            const { data, error } = await supabase.rpc('set_nickname', {
                p_user_id: user.id,
                p_nickname: nickname.trim()
            });

            if (error) {
                toast({
                    title: "❌ ไม่สำเร็จ",
                    description: error.message,
                    variant: "destructive"
                });
            } else if (data && data.length > 0) {
                if (data[0].success) {
                    toast({
                        title: "✅ สำเร็จ!",
                        description: `ตั้งชื่อเป็น "${nickname}" เรียบร้อย`,
                    });
                    setCurrentNickname(nickname);
                    onSuccess?.();
                    onOpenChange(false);
                } else {
                    toast({
                        title: "❌ ไม่สำเร็จ",
                        description: data[0].message,
                        variant: "destructive"
                    });
                }
            }
        } catch (err) {
            console.error('Error saving nickname:', err);
            toast({
                title: "❌ ไม่สำเร็จ",
                description: "เกิดข้อผิดพลาด กรุณาลองใหม่",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    const handleClose = (isOpen: boolean) => {
        if (!isOpen && !canClose && !currentNickname) {
            // Cannot close without setting nickname
            toast({
                title: "⚠️ กรุณาตั้งชื่อก่อน",
                description: "คุณต้องตั้งชื่อก่อนจึงจะใช้งานได้",
                variant: "destructive"
            });
            return;
        }
        onOpenChange(isOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                        </div>
                        ตั้งชื่อของคุณ
                    </DialogTitle>
                    <DialogDescription className="text-slate-300">
                        ชื่อนี้จะใช้แสดงในเกมและให้เพื่อนค้นหาคุณได้
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Nickname Input */}
                    <div className="space-y-2">
                        <div className="relative">
                            <Input
                                placeholder="พิมพ์ชื่อของคุณ..."
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                maxLength={20}
                                className={`pr-10 bg-white/10 border-2 text-white placeholder:text-slate-400 focus:ring-0 transition-all ${status === null
                                        ? 'border-white/20'
                                        : status.available
                                            ? 'border-green-500/50 focus:border-green-500'
                                            : 'border-red-500/50 focus:border-red-500'
                                    }`}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {checking ? (
                                    <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                                ) : status ? (
                                    status.available ? (
                                        <Check className="w-4 h-4 text-green-400" />
                                    ) : (
                                        <X className="w-4 h-4 text-red-400" />
                                    )
                                ) : null}
                            </div>
                        </div>

                        {/* Status Message */}
                        <AnimatePresence mode="wait">
                            {status && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className={`flex items-center gap-2 text-sm ${status.available ? 'text-green-400' : 'text-red-400'
                                        }`}
                                >
                                    {status.available ? (
                                        <Sparkles className="w-4 h-4" />
                                    ) : (
                                        <AlertCircle className="w-4 h-4" />
                                    )}
                                    {status.message}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Character Count */}
                        <div className="text-xs text-slate-400 text-right">
                            {nickname.length}/20 ตัวอักษร
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="bg-white/5 rounded-xl p-3 text-xs text-slate-300 space-y-1">
                        <p>💡 <strong>Tips:</strong></p>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                            <li>ใช้ได้ทั้งภาษาไทย อังกฤษ ตัวเลข และ _</li>
                            <li>ต้องมีอย่างน้อย 3 ตัวอักษร</li>
                            <li>ชื่อจะต้องไม่ซ้ำกับคนอื่น</li>
                        </ul>
                    </div>

                    {/* Save Button */}
                    <Button
                        onClick={handleSave}
                        disabled={!nickname.trim() || !status?.available || saving || checking}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl h-12"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                กำลังบันทึก...
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4 mr-2" />
                                บันทึกชื่อ
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
