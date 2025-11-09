import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminFeedback() {
  const [feedback, setFeedback] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchFeedback();
  }, [selectedCategory]);

  const fetchFeedback = async () => {
    try {
      let query = supabase
        .from('feedback')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      setFeedback(data || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error('ไม่สามารถโหลดข้อมูล Feedback ได้');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFeedback = feedback.filter(item =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'reviewed': return 'default';
      case 'resolved': return 'default';
      case 'archived': return 'outline';
      default: return 'secondary';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bug': return 'destructive';
      case 'suggestion': return 'default';
      case 'complaint': return 'secondary';
      case 'compliment': return 'default';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Feedback</h1>
        <p className="text-muted-foreground">จัดการ Feedback จากผู้ใช้</p>
      </div>

      <div className="flex gap-4 items-center">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="เลือกหมวดหมู่" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            <SelectItem value="dashboard">Dashboard</SelectItem>
            <SelectItem value="deck">Deck</SelectItem>
            <SelectItem value="feature">Feature</SelectItem>
            <SelectItem value="flashcard">Flashcard</SelectItem>
            <SelectItem value="general">Main Feedback</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feedback ทั้งหมด</CardTitle>
          <CardDescription>ดูและจัดการ Feedback จากผู้ใช้</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="ค้นหา Feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ผู้ใช้</TableHead>
                  <TableHead>ประเภท</TableHead>
                  <TableHead>หมวดหมู่</TableHead>
                  <TableHead>หัวข้อ</TableHead>
                  <TableHead>คะแนน</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>วันที่</TableHead>
                  <TableHead>การกระทำ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedback.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.profiles?.full_name || item.profiles?.email || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTypeColor(item.feedback_type)}>
                        {item.feedback_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{item.title}</TableCell>
                    <TableCell>{item.rating ? `${item.rating}/5` : '-'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(item.created_at).toLocaleDateString('th-TH')}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">ดูรายละเอียด</Button>
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
