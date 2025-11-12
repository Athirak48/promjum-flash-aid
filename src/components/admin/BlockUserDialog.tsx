import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BlockUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  isBlocked: boolean;
  onSuccess?: () => void;
}

export default function BlockUserDialog({
  open,
  onOpenChange,
  userId,
  userName,
  isBlocked,
  onSuccess,
}: BlockUserDialogProps) {
  const [blockReason, setBlockReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBlockUser = async () => {
    if (!isBlocked && !blockReason.trim()) {
      toast.error('กรุณาระบุเหตุผลในการระงับบัญชี');
      return;
    }

    setLoading(true);
    try {
      if (isBlocked) {
        // Unblock user
        const { error } = await supabase
          .from('profiles')
          .update({
            is_blocked: false,
            blocked_at: null,
            blocked_reason: null,
          })
          .eq('user_id', userId);

        if (error) throw error;
        toast.success(`ปลดการระงับบัญชี ${userName} สำเร็จ`);
      } else {
        // Block user
        const { error } = await supabase
          .from('profiles')
          .update({
            is_blocked: true,
            blocked_at: new Date().toISOString(),
            blocked_reason: blockReason.trim(),
          })
          .eq('user_id', userId);

        if (error) throw error;
        toast.success(`ระงับบัญชี ${userName} สำเร็จ`);
      }

      onOpenChange(false);
      onSuccess?.();
      setBlockReason('');
    } catch (error: any) {
      console.error('Error blocking/unblocking user:', error);
      toast.error('ไม่สามารถดำเนินการได้: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isBlocked ? 'ปลดการระงับบัญชีผู้ใช้' : 'ระงับบัญชีผู้ใช้'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isBlocked ? (
              <>
                คุณต้องการปลดการระงับบัญชีของ <strong>{userName}</strong> หรือไม่?
                <br />
                ผู้ใช้จะสามารถเข้าสู่ระบบและใช้งานได้ตามปกติอีกครั้ง
              </>
            ) : (
              <>
                คุณต้องการระงับบัญชีของ <strong>{userName}</strong> หรือไม่?
                <br />
                <span className="text-destructive font-medium">
                  ผู้ใช้จะไม่สามารถเข้าสู่ระบบหรือใช้งาน Promjum ได้อีก
                </span>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {!isBlocked && (
          <div className="space-y-2 py-4">
            <Label htmlFor="block-reason">
              เหตุผลในการระงับ <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="block-reason"
              placeholder="เช่น: ละเมิดกฎ, โกงคะแนน Leaderboard, สแปมระบบ"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              เหตุผลนี้จะถูกบันทึกไว้เพื่อการอ้างอิงของผู้ดูแลระบบ
            </p>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>ยกเลิก</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleBlockUser}
            disabled={loading}
            className={isBlocked ? '' : 'bg-destructive hover:bg-destructive/90'}
          >
            {loading
              ? 'กำลังดำเนินการ...'
              : isBlocked
              ? 'ยืนยันการปลดระงับ'
              : 'ยืนยันการระงับบัญชี'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
