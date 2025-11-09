import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
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
          code: formData.code,
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

  const filteredPromotions = promotions.filter(promo =>
    promo.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    promo.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Promotion</h1>
          <p className="text-muted-foreground">จัดการโค้ดส่วนลดและโปรโมชั่น</p>
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
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
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
                <Label htmlFor="max_uses">จำนวนครั้งที่ใช้ได้ (ถ้ามี)</Label>
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
                {filteredPromotions.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell className="font-medium">{promo.code}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {promo.discount_type === 'percentage' ? '%' : '฿'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {promo.discount_value}
                      {promo.discount_type === 'percentage' ? '%' : ' ฿'}
                    </TableCell>
                    <TableCell>
                      {promo.current_uses}/{promo.max_uses || '∞'}
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
                      <Button variant="ghost" size="sm">แก้ไข</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
