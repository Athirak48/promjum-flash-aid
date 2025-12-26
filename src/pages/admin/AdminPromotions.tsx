import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Tag, Copy, Trash2, ToggleLeft, ToggleRight, Percent, DollarSign, Users, Calendar } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminPromotions() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [promoToDelete, setPromoToDelete] = useState<any>(null);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    description: '',
    max_uses: '',
    valid_until: '',
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromotions(data || []);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast.error('ไม่สามารถโหลดข้อมูลโปรโมชั่นได้');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('promotions')
        .insert({
          code: formData.code.toUpperCase(),
          discount_type: formData.discount_type,
          discount_value: Number(formData.discount_value),
          description: formData.description,
          max_uses: formData.max_uses ? Number(formData.max_uses) : null,
          valid_until: formData.valid_until,
        });

      if (error) throw error;

      toast.success('สร้างโค้ดโปรโมชั่นสำเร็จ');
      setIsOpen(false);
      fetchPromotions();
      setFormData({
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        description: '',
        max_uses: '',
        valid_until: '',
      });
    } catch (error: any) {
      console.error('Error creating promotion:', error);
      toast.error(error.message || 'ไม่สามารถสร้างโค้ดโปรโมชั่นได้');
    }
  };

  const handleToggleActive = async (promoId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('promotions')
        .update({ is_active: !currentStatus })
        .eq('id', promoId);

      if (error) throw error;
      toast.success(!currentStatus ? 'เปิดใช้งานโค้ดแล้ว' : 'ปิดใช้งานโค้ดแล้ว');
      fetchPromotions();
    } catch (error) {
      console.error('Error toggling promotion:', error);
      toast.error('ไม่สามารถเปลี่ยนสถานะได้');
    }
  };

  const handleDeletePromo = async () => {
    if (!promoToDelete) return;
    try {
      const { error } = await supabase.from('promotions').delete().eq('id', promoToDelete.id);
      if (error) throw error;
      toast.success('ลบโค้ดสำเร็จ');
      fetchPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      toast.error('ไม่สามารถลบโค้ดได้');
    } finally {
      setDeleteDialogOpen(false);
      setPromoToDelete(null);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`คัดลอก "${code}" สำเร็จ`);
  };

  const filteredPromotions = promotions.filter(promo =>
    promo.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    promo.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const activePromos = promotions.filter(p => p.is_active).length;
  const totalUsage = promotions.reduce((sum, p) => sum + (p.current_uses || 0), 0);
  const expiredPromos = promotions.filter(p => new Date(p.valid_until) < new Date()).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Tag className="h-8 w-8 text-primary" />
            Promotions
          </h1>
          <p className="text-slate-500 mt-1">จัดการโค้ดส่วนลดและโปรโมชั่น</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              สร้างโค้ดใหม่
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>สร้างโค้ดโปรโมชั่น</DialogTitle>
              <DialogDescription>กรอกข้อมูลสำหรับโค้ดส่วนลดใหม่</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">โค้ด</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="เช่น NEWYEAR2024"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount_type">ประเภทส่วนลด</Label>
                <Select
                  value={formData.discount_type}
                  onValueChange={(value) => setFormData({ ...formData, discount_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">เปอร์เซ็นต์</SelectItem>
                    <SelectItem value="fixed">จำนวนเงิน</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount_value">มูลค่าส่วนลด</Label>
                <Input
                  id="discount_value"
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">คำอธิบาย</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_uses">จำนวนครั้งที่ใช้ได้ (เว้นว่างถ้าไม่จำกัด)</Label>
                <Input
                  id="max_uses"
                  type="number"
                  value={formData.max_uses}
                  onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valid_until">วันหมดอายุ</Label>
                <Input
                  id="valid_until"
                  type="datetime-local"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">สร้างโค้ด</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
          <CardContent className="pt-6 pb-4">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                <ToggleRight className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{activePromos}</p>
                <p className="text-xs font-medium text-slate-500">Active Codes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
          <CardContent className="pt-6 pb-4">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalUsage}</p>
                <p className="text-xs font-medium text-slate-500">Total Usage</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
          <CardContent className="pt-6 pb-4">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                <Tag className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{promotions.length}</p>
                <p className="text-xs font-medium text-slate-500">Total Codes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
          <CardContent className="pt-6 pb-4">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{expiredPromos}</p>
                <p className="text-xs font-medium text-slate-500">Expired</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Card */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/50">
          <CardTitle className="text-slate-800">โค้ดโปรโมชั่นทั้งหมด</CardTitle>
          <CardDescription className="text-slate-500">จัดการและติดตามโค้ดส่วนลด</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <Input
            placeholder="ค้นหาโค้ด..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
          />

          <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <TableHead className="font-semibold text-slate-700">โค้ด</TableHead>
                  <TableHead className="font-semibold text-slate-700">ประเภท</TableHead>
                  <TableHead className="font-semibold text-slate-700">มูลค่า</TableHead>
                  <TableHead className="font-semibold text-slate-700">ใช้แล้ว/ทั้งหมด</TableHead>
                  <TableHead className="font-semibold text-slate-700">วันหมดอายุ</TableHead>
                  <TableHead className="font-semibold text-slate-700">สถานะ</TableHead>
                  <TableHead className="font-semibold text-slate-700">การกระทำ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPromotions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                      ไม่พบโค้ดโปรโมชั่น
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPromotions.map((promo) => (
                    <TableRow key={promo.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">{promo.code}</span>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600" onClick={() => handleCopyCode(promo.code)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1 border-slate-200 dark:border-slate-700 text-slate-600">
                          {promo.discount_type === 'percentage' ? <Percent className="h-3 w-3" /> : <DollarSign className="h-3 w-3" />}
                          {promo.discount_type === 'percentage' ? '%' : '฿'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {promo.discount_value}
                        {promo.discount_type === 'percentage' ? '%' : ' ฿'}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {promo.current_uses || 0}/{promo.max_uses || '∞'}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {new Date(promo.valid_until).toLocaleDateString('th-TH')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={promo.is_active ? 'default' : 'secondary'} className={!promo.is_active ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' : ''}>
                          {promo.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(promo.id, promo.is_active)}
                          >
                            {promo.is_active ? (
                              <ToggleRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-slate-400" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => {
                              setPromoToDelete(promo);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบโค้ด</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบโค้ด "{promoToDelete?.code}" หรือไม่?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePromo} className="bg-red-600 hover:bg-red-700 text-white">
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

