import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const editUserSchema = z.object({
  full_name: z.string()
    .trim()
    .min(1, { message: 'กรุณากรอกชื่อ' })
    .max(100, { message: 'ชื่อต้องมีความยาวไม่เกิน 100 ตัวอักษร' }),
  email: z.string()
    .trim()
    .email({ message: 'รูปแบบอีเมลไม่ถูกต้อง' })
    .max(255, { message: 'อีเมลต้องมีความยาวไม่เกิน 255 ตัวอักษร' }),
  plan_type: z.enum(['Free', 'Premium', 'Basic', 'Pro'], {
    required_error: 'กรุณาเลือก Plan Type',
  }),
  xp_adjustment: z.string()
    .regex(/^-?\d*$/, { message: 'กรุณากรอกตัวเลขเท่านั้น' }),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  userEmail: string;
  onSuccess?: () => void;
}

export default function EditUserModal({
  open,
  onOpenChange,
  userId,
  userName,
  userEmail,
  onSuccess,
}: EditUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [currentPlanType, setCurrentPlanType] = useState<string>('Free');
  const [currentXP, setCurrentXP] = useState<number>(0);

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      full_name: userName,
      email: userEmail,
      plan_type: 'Free',
      xp_adjustment: '0',
    },
  });

  useEffect(() => {
    if (open && userId) {
      fetchCurrentData();
    }
  }, [open, userId]);

  const fetchCurrentData = async () => {
    try {
      // Fetch current subscription
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('plan_type, status')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      const planType = subData?.plan_type || 'Free';
      setCurrentPlanType(planType);

      // Fetch current total XP
      const { data: sessionsData } = await supabase
        .from('practice_sessions')
        .select('xp_gained')
        .eq('user_id', userId)
        .eq('completed', true);

      const totalXP = sessionsData?.reduce((sum, s) => sum + (s.xp_gained || 0), 0) || 0;
      setCurrentXP(totalXP);

      // Update form with current values
      form.reset({
        full_name: userName,
        email: userEmail,
        plan_type: planType as any,
        xp_adjustment: '0',
      });
    } catch (error) {
      console.error('Error fetching current data:', error);
      toast.error('ไม่สามารถโหลดข้อมูลปัจจุบันได้');
    }
  };

  const onSubmit = async (values: EditUserFormValues) => {
    setLoading(true);
    try {
      // Update profile (name and email)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: values.full_name,
          email: values.email,
        })
        .eq('user_id', userId);

      if (profileError) throw profileError;

      // Update subscription if plan type changed
      if (values.plan_type !== currentPlanType) {
        // Check if user has an active subscription
        const { data: existingSub } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('user_id', userId)
          .eq('status', 'active')
          .maybeSingle();

        if (existingSub && values.plan_type === 'Free') {
          // Cancel existing subscription
          const { error: cancelError } = await supabase
            .from('subscriptions')
            .update({ 
              status: 'cancelled',
              cancelled_at: new Date().toISOString(),
            })
            .eq('id', existingSub.id);

          if (cancelError) throw cancelError;
        } else if (!existingSub && values.plan_type !== 'Free') {
          // Create new subscription
          const { error: insertError } = await supabase
            .from('subscriptions')
            .insert({
              user_id: userId,
              plan_type: values.plan_type,
              status: 'active',
              started_at: new Date().toISOString(),
              price_paid: 0, // Admin-granted, no payment
            });

          if (insertError) throw insertError;
        } else if (existingSub && values.plan_type !== 'Free') {
          // Update existing subscription
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({ plan_type: values.plan_type })
            .eq('id', existingSub.id);

          if (updateError) throw updateError;
        }
      }

      // Apply XP adjustment if not zero
      const xpAdjustment = parseInt(values.xp_adjustment || '0', 10);
      if (xpAdjustment !== 0) {
        // Create a special adjustment session
        const { error: xpError } = await supabase
          .from('practice_sessions')
          .insert({
            user_id: userId,
            xp_gained: xpAdjustment,
            session_type: 'admin_adjustment',
            session_mode: 'manual',
            completed: true,
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
            duration_minutes: 0,
          });

        if (xpError) throw xpError;
      }

      toast.success('อัปเดตข้อมูลผู้ใช้สำเร็จ');
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error('ไม่สามารถอัปเดตข้อมูลได้: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>แก้ไขข้อมูลผู้ใช้</DialogTitle>
          <DialogDescription>
            แก้ไขข้อมูลส่วนตัว, Plan Type และ XP ของผู้ใช้
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อ</FormLabel>
                  <FormControl>
                    <Input placeholder="กรอกชื่อผู้ใช้" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>อีเมล</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="กรอกอีเมล" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Plan Type Field */}
            <FormField
              control={form.control}
              name="plan_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือก Plan Type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Free">Free</SelectItem>
                      <SelectItem value="Basic">Basic</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                      <SelectItem value="Pro">Pro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    ปัจจุบัน: {currentPlanType}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* XP Adjustment Field */}
            <FormField
              control={form.control}
              name="xp_adjustment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ปรับ XP</FormLabel>
                  <FormControl>
                    <Input 
                      type="text" 
                      placeholder="0" 
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    XP ปัจจุบัน: {currentXP.toLocaleString()} | ใส่ค่าบวกเพื่อเพิ่ม หรือค่าลบเพื่อลด
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
