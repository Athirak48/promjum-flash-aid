import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
const subDeckSchema = z.object({
  name: z.string().min(1, 'กรุณาใส่ชื่อภาษาไทย'),
  name_en: z.string().min(1, 'กรุณาใส่ชื่อภาษาอังกฤษ'),
  description: z.string().optional(),
  description_en: z.string().optional(),
  difficulty_level: z.string().min(1, 'กรุณาเลือกระดับความยาก'),
  level: z.string().min(1, 'กรุณาเลือกระดับ CEFR'),
  flashcard_count: z.number().min(0, 'กรุณาใส่จำนวน Flashcards'),
  estimated_duration_minutes: z.number().min(1, 'กรุณาใส่ระยะเวลา'),
  tags: z.string().optional(),
  is_free: z.boolean()
});
type SubDeckFormData = z.infer<typeof subDeckSchema>;
interface CreateSubDeckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  deckId: string;
  subdeck?: any;
}
const difficultyLevels = [{
  value: 'beginner',
  label: 'เริ่มต้น'
}, {
  value: 'intermediate',
  label: 'กลาง'
}, {
  value: 'advanced',
  label: 'ขั้นสูง'
}];
const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
export function CreateSubDeckDialog({
  open,
  onOpenChange,
  onSuccess,
  deckId,
  subdeck
}: CreateSubDeckDialogProps) {
  const [isFree, setIsFree] = useState(subdeck?.is_free ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: {
      errors
    },
    setValue,
    watch,
    reset
  } = useForm<SubDeckFormData>({
    resolver: zodResolver(subDeckSchema),
    defaultValues: {
      name: subdeck?.name || '',
      name_en: subdeck?.name_en || '',
      description: subdeck?.description || '',
      description_en: subdeck?.description_en || '',
      difficulty_level: subdeck?.difficulty_level || 'beginner',
      level: subdeck?.level || 'B1',
      flashcard_count: subdeck?.flashcard_count || 0,
      estimated_duration_minutes: subdeck?.estimated_duration_minutes || 10,
      tags: subdeck?.tags?.join(', ') || '',
      is_free: subdeck?.is_free ?? true
    }
  });
  const formValues = watch();
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'intermediate':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'advanced':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-muted';
    }
  };
  const getDifficultyText = (level: string) => {
    const found = difficultyLevels.find(d => d.value === level);
    return found?.label || level;
  };
  const onSubmit = async (data: SubDeckFormData) => {
    setIsSubmitting(true);
    try {
      const tagsArray = data.tags ? data.tags.split(',').map(t => t.trim()).filter(t => t) : [];
      const subDeckData = {
        name: data.name,
        name_en: data.name_en,
        description: data.description || null,
        description_en: data.description_en || null,
        difficulty_level: data.difficulty_level,
        level: data.level,
        flashcard_count: data.flashcard_count,
        estimated_duration_minutes: data.estimated_duration_minutes,
        deck_id: deckId,
        tags: tagsArray,
        is_free: isFree
      };
      if (subdeck?.id) {
        const {
          error
        } = await supabase.from('sub_decks').update(subDeckData).eq('id', subdeck.id);
        if (error) throw error;
        toast.success('แก้ไข Subdeck สำเร็จ');
      } else {
        const {
          error
        } = await supabase.from('sub_decks').insert([subDeckData]);
        if (error) throw error;
        toast.success('สร้าง Subdeck สำเร็จ');
      }
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error saving subdeck:', error);
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {subdeck ? 'แก้ไข Subdeck' : 'สร้าง Subdeck ใหม่'}
          </DialogTitle>
          <DialogDescription>
            กรอกข้อมูลเพื่อสร้าง Subdeck ใหม่
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Form */}
            <div className="space-y-4">
              {/* Free Toggle */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                <Label htmlFor="free-toggle" className="font-semibold">
                  {isFree ? 'ฟรี' : 'ล็อค (Premium)'}
                </Label>
                <Switch id="free-toggle" checked={isFree} onCheckedChange={checked => {
                setIsFree(checked);
                setValue('is_free', checked);
              }} />
              </div>

              {/* Basic Info */}
              <div className="space-y-2">
                <Label htmlFor="name">ชื่อภาษาไทย *</Label>
                <Input id="name" {...register('name')} placeholder="คำศัพท์พื้นฐาน" />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name_en">ชื่อภาษาอังกฤษ *</Label>
                <Input id="name_en" {...register('name_en')} placeholder="Basic Vocabulary" />
                {errors.name_en && <p className="text-sm text-destructive">{errors.name_en.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">รายละเอียดภาษาไทย</Label>
                <Textarea id="description" {...register('description')} placeholder="คำศัพท์พื้นฐานสำหรับผู้เริ่มต้น" rows={3} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description_en">รายละเอียดภาษาอังกฤษ</Label>
                <Textarea id="description_en" {...register('description_en')} placeholder="Basic vocabulary for beginners" rows={3} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty_level">ระดับความยาก *</Label>
                  <Select value={formValues.difficulty_level} onValueChange={value => setValue('difficulty_level', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกระดับความยาก" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyLevels.map(diff => <SelectItem key={diff.value} value={diff.value}>
                          {diff.label}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.difficulty_level && <p className="text-sm text-destructive">{errors.difficulty_level.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">ระดับ CEFR *</Label>
                  <Select value={formValues.level} onValueChange={value => setValue('level', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกระดับ" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map(level => <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.level && <p className="text-sm text-destructive">{errors.level.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="flashcard_count">จำนวน Flashcards *</Label>
                  <Input id="flashcard_count" type="number" {...register('flashcard_count', {
                  valueAsNumber: true
                })} placeholder="20" />
                  {errors.flashcard_count && <p className="text-sm text-destructive">{errors.flashcard_count.message}</p>}
                </div>

                
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (คั่นด้วยเครื่องหมายจุลภาค)</Label>
                <Input id="tags" {...register('tags')} placeholder="พื้นฐาน, สนทนา, ทั่วไป" />
              </div>
            </div>

            {/* Right: Preview */}
            <div className="space-y-4">
              <Label>Preview</Label>
              <Card className="hover:shadow-lg transition-all duration-300 border-l-4">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-xl">
                            {formValues.name || 'ชื่อ Subdeck'}
                          </CardTitle>
                        </div>
                        <CardDescription className="text-sm">
                          {formValues.name_en || 'Subdeck Name'}
                        </CardDescription>
                      </div>
                    </div>

                    <p className="text-sm text-foreground/70">
                      {formValues.description || 'รายละเอียด Subdeck จะแสดงที่นี่'}
                    </p>

                    <div className="flex items-center gap-4 flex-wrap">
                      <Badge className={`${getDifficultyColor(formValues.difficulty_level)} border`}>
                        {getDifficultyText(formValues.difficulty_level)}
                      </Badge>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen className="w-4 h-4" />
                        <span>{formValues.flashcard_count || 0} คำศัพท์</span>
                      </div>
                      {!isFree && <Badge variant="secondary" className="gap-1">
                          <Lock className="w-3 h-3" />
                          Locked
                        </Badge>}
                    </div>

                    {formValues.tags && <div className="flex flex-wrap gap-2">
                        {formValues.tags.split(',').map((tag, idx) => tag.trim() && <Badge key={idx} variant="outline" className="text-xs">
                              {tag.trim()}
                            </Badge>)}
                      </div>}

                    
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'กำลังบันทึก...' : subdeck ? 'บันทึกการแก้ไข' : 'สร้าง Subdeck'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>;
}