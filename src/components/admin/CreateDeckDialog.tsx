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
import { Lock, Unlock, BookOpen, Star } from 'lucide-react';
import * as Icons from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const deckSchema = z.object({
  name: z.string().min(1, 'กรุณาใส่ชื่อภาษาไทย'),
  name_en: z.string().min(1, 'กรุณาใส่ชื่อภาษาอังกฤษ'),
  description: z.string().optional(),
  description_en: z.string().optional(),
  category: z.string().min(1, 'กรุณาเลือกหมวดหมู่'),
  level: z.string().min(1, 'กรุณาเลือกระดับ'),
  icon: z.string().min(1, 'กรุณาเลือกไอคอน'),
  total_flashcards: z.number().min(0, 'กรุณาใส่จำนวนคำศัพท์'),
  is_premium: z.boolean(),
  price: z.number().optional(),
});

type DeckFormData = z.infer<typeof deckSchema>;

interface CreateDeckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  deck?: any;
}

const iconOptions = [
  'BookOpen', 'Book', 'GraduationCap', 'Languages', 'Globe', 
  'MessageSquare', 'Briefcase', 'Plane', 'Coffee', 'Heart',
  'Music', 'Film', 'ShoppingBag', 'Utensils', 'Home'
];

const categories = [
  'ทั่วไป', 'ธุรกิจ', 'การท่องเที่ยว', 'การศึกษา', 
  'เทคโนโลยี', 'อาหาร', 'กีฬา', 'ดนตรี', 'ภาพยนตร์'
];

const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export function CreateDeckDialog({ open, onOpenChange, onSuccess, deck }: CreateDeckDialogProps) {
  const [isPremium, setIsPremium] = useState(deck?.is_premium || false);
  const [selectedIcon, setSelectedIcon] = useState(deck?.icon || 'BookOpen');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<DeckFormData>({
    resolver: zodResolver(deckSchema),
    defaultValues: {
      name: deck?.name || '',
      name_en: deck?.name_en || '',
      description: deck?.description || '',
      description_en: deck?.description_en || '',
      category: deck?.category || '',
      level: deck?.level || 'B1',
      icon: deck?.icon || 'BookOpen',
      total_flashcards: deck?.total_flashcards || 0,
      is_premium: deck?.is_premium || false,
      price: deck?.price || undefined,
    }
  });

  const formValues = watch();

  const onSubmit = async (data: DeckFormData) => {
    setIsSubmitting(true);
    try {
      const deckData = {
        name: data.name,
        name_en: data.name_en,
        description: data.description || null,
        description_en: data.description_en || null,
        category: data.category,
        level: data.level,
        icon: selectedIcon,
        total_flashcards: data.total_flashcards,
        is_premium: isPremium,
        is_published: false,
      };

      if (deck?.id) {
        const { error } = await supabase
          .from('decks')
          .update(deckData)
          .eq('id', deck.id);

        if (error) throw error;
        toast.success('แก้ไข Deck สำเร็จ');
      } else {
        const { error } = await supabase
          .from('decks')
          .insert([deckData]);

        if (error) throw error;
        toast.success('สร้าง Deck สำเร็จ');
      }

      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error saving deck:', error);
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const IconComponent = (Icons as any)[selectedIcon] || Icons.BookOpen;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {deck ? 'แก้ไข Deck' : 'สร้าง Deck ใหม่'}
          </DialogTitle>
          <DialogDescription>
            กรอกข้อมูลเพื่อสร้าง Deck ใหม่สำหรับผู้ใช้
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Form */}
            <div className="space-y-4">
              {/* Premium Toggle */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-2">
                  {isPremium ? (
                    <Lock className="w-5 h-5 text-destructive" />
                  ) : (
                    <Unlock className="w-5 h-5 text-green-500" />
                  )}
                  <Label htmlFor="premium-toggle" className="font-semibold">
                    {isPremium ? 'Premium Deck' : 'Free Deck'}
                  </Label>
                </div>
                <Switch
                  id="premium-toggle"
                  checked={isPremium}
                  onCheckedChange={(checked) => {
                    setIsPremium(checked);
                    setValue('is_premium', checked);
                  }}
                />
              </div>

              {isPremium && (
                <div className="space-y-2">
                  <Label htmlFor="price">ราคา (บาท)</Label>
                  <Input
                    id="price"
                    type="number"
                    {...register('price', { valueAsNumber: true })}
                    placeholder="99"
                  />
                  {errors.price && (
                    <p className="text-sm text-destructive">{errors.price.message}</p>
                  )}
                </div>
              )}

              {/* Basic Info */}
              <div className="space-y-2">
                <Label htmlFor="name">ชื่อภาษาไทย *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="คำศัพท์ทั่วไป"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name_en">ชื่อภาษาอังกฤษ *</Label>
                <Input
                  id="name_en"
                  {...register('name_en')}
                  placeholder="General Vocabulary"
                />
                {errors.name_en && (
                  <p className="text-sm text-destructive">{errors.name_en.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">รายละเอียดภาษาไทย</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="คำศัพท์พื้นฐานสำหรับการสนทนาทั่วไป"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description_en">รายละเอียดภาษาอังกฤษ</Label>
                <Textarea
                  id="description_en"
                  {...register('description_en')}
                  placeholder="Basic vocabulary for daily conversations"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">หมวดหมู่ *</Label>
                  <Select
                    value={formValues.category}
                    onValueChange={(value) => setValue('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกหมวดหมู่" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-destructive">{errors.category.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">ระดับ *</Label>
                  <Select
                    value={formValues.level}
                    onValueChange={(value) => setValue('level', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกระดับ" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.level && (
                    <p className="text-sm text-destructive">{errors.level.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">ไอคอน *</Label>
                <Select
                  value={selectedIcon}
                  onValueChange={(value) => {
                    setSelectedIcon(value);
                    setValue('icon', value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกไอคอน" />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((icon) => {
                      const Icon = (Icons as any)[icon];
                      return (
                        <SelectItem key={icon} value={icon}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {icon}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_flashcards">จำนวนคำศัพท์โดยประมาณ *</Label>
                <Input
                  id="total_flashcards"
                  type="number"
                  {...register('total_flashcards', { valueAsNumber: true })}
                  placeholder="50"
                />
                {errors.total_flashcards && (
                  <p className="text-sm text-destructive">{errors.total_flashcards.message}</p>
                )}
              </div>
            </div>

            {/* Right: Preview */}
            <div className="space-y-4">
              <Label>Preview</Label>
              <Card className="hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-4 rounded-xl bg-gradient-primary shadow-soft">
                      <IconComponent className="w-8 h-8 text-primary-foreground" />
                    </div>
                    {isPremium && (
                      <Badge variant="secondary" className="gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-2xl mb-2">
                    {formValues.name || 'ชื่อ Deck'}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {formValues.name_en || 'Deck Name'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col">
                  <p className="text-sm text-foreground/80 line-clamp-2">
                    {formValues.description || 'รายละเอียด Deck จะแสดงที่นี่'}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 rounded-lg p-2">
                      <BookOpen className="w-4 h-4" />
                      <span>{formValues.total_flashcards || 0} คำศัพท์</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 rounded-lg p-2">
                      <Star className="w-4 h-4" />
                      <span>0 Sub-decks</span>
                    </div>
                  </div>

                  {isPremium && formValues.price && (
                    <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                      <p className="text-sm font-semibold text-primary">
                        ราคา: ฿{formValues.price}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'กำลังบันทึก...' : deck ? 'บันทึกการแก้ไข' : 'สร้าง Deck'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}