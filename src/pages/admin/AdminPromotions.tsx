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
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Tag className="h-8 w-8 text-primary" />
            Promotions
          </h1>
          <p className="text-muted-foreground mt-1">จัดการโค้ดส่วนลดและโปรโมชั่น</p>
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
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50">
                <ToggleRight className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{activePromos}</p>
                <p className="text-xs text-muted-foreground">Active Codes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{totalUsage}</p>
                <p className="text-xs text-muted-foreground">Total Usage</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                <Tag className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{promotions.length}</p>
                <p className="text-xs text-muted-foreground">Total Codes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{expiredPromos}</p>
                <p className="text-xs text-muted-foreground">Expired</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>โค้ดโปรโมชั่นทั้งหมด</CardTitle>
          <CardDescription>จัดการและติดตามโค้ดส่วนลด</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="ค้นหาโค้ด..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>โค้ด</TableHead>
                  <TableHead>ประเภท</TableHead>
                  <TableHead>มูลค่า</TableHead>
                  <TableHead>ใช้แล้ว/ทั้งหมด</TableHead>
                  <TableHead>วันหมดอายุ</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>การกระทำ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPromotions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      ไม่พบโค้ดโปรโมชั่น
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPromotions.map((promo) => (
                    <TableRow key={promo.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold">{promo.code}</span>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleCopyCode(promo.code)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          {promo.discount_type === 'percentage' ? <Percent className="h-3 w-3" /> : <DollarSign className="h-3 w-3" />}
                          {promo.discount_type === 'percentage' ? '%' : '฿'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {promo.discount_value}
                        {promo.discount_type === 'percentage' ? '%' : ' ฿'}
                      </TableCell>
                      <TableCell>
                        {promo.current_uses || 0}/{promo.max_uses || '∞'}
                      </TableCell>
                      <TableCell>
                        {new Date(promo.valid_until).toLocaleDateString('th-TH')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={promo.is_active ? 'default' : 'secondary'}>
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
                              <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
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
            <AlertDialogAction onClick={handleDeletePromo} className="bg-destructive text-destructive-foreground">
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

