import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Upload, Download, Eye, EyeOff, GripVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CreateDeckDialog } from '@/components/admin/CreateDeckDialog';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const DraggableRow = ({ deck, index, moveRow, children }: any) => {
  const ref = useRef<HTMLTableRowElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'row',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'row',
    hover: (item: { index: number }) => {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      moveRow(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  preview(drop(ref));

  return (
    <TableRow
      ref={ref}
      className="cursor-pointer hover:bg-muted/50"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <TableCell className="w-8">
        <div ref={drag} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
      </TableCell>
      {children}
    </TableRow>
  );
};
export default function AdminDecks() {
  const navigate = useNavigate();
  const [decks, setDecks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDeck, setShowCreateDeck] = useState(false);
  useEffect(() => {
    fetchDecks();
  }, []);
  const fetchDecks = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('decks').select('*, sub_decks(count)').order('display_order', {
        ascending: true
      });
      if (error) throw error;
      setDecks(data || []);
    } catch (error) {
      console.error('Error fetching decks:', error);
      toast.error('ไม่สามารถโหลดข้อมูล Deck ได้');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePublish = async (deckId: string, currentStatus: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('decks')
        .update({
          is_published: !currentStatus,
          published_at: !currentStatus ? new Date().toISOString() : null
        })
        .eq('id', deckId);

      if (error) throw error;

      toast.success(!currentStatus ? 'เผยแพร่ Deck สำเร็จ' : 'ซ่อน Deck จาก User แล้ว');
      fetchDecks();
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast.error('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ');
    }
  };

  const moveRow = useCallback(async (dragIndex: number, hoverIndex: number) => {
    setDecks((prevDecks) => {
      const newDecks = [...prevDecks];
      const [removed] = newDecks.splice(dragIndex, 1);
      newDecks.splice(hoverIndex, 0, removed);
      
      // Update display_order for all decks after reordering
      const updatedDecks = newDecks.map((deck, index) => ({
        ...deck,
        display_order: index
      }));
      
      // Save to database
      Promise.all(
        updatedDecks.map(deck =>
          supabase
            .from('decks')
            .update({ display_order: deck.display_order })
            .eq('id', deck.id)
        )
      ).then(() => {
        toast.success('บันทึกลำดับสำเร็จ');
      }).catch((error) => {
        console.error('Error saving order:', error);
        toast.error('เกิดข้อผิดพลาดในการบันทึกลำดับ');
      });
      
      return updatedDecks;
    });
  }, []);
  const filteredDecks = decks.filter(deck => deck.name?.toLowerCase().includes(searchTerm.toLowerCase()) || deck.name_en?.toLowerCase().includes(searchTerm.toLowerCase()));
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
  }
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Deck / Subdeck</h1>
            <p className="text-muted-foreground">จัดการ Deck, Subdeck และ Flashcard</p>
          </div>
          <div className="flex gap-2">
            
            
            <Button onClick={() => setShowCreateDeck(true)}>
              <Plus className="w-4 h-4 mr-2" />
              เพิ่ม Deck
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>จัดการ Decks</CardTitle>
            <CardDescription>แก้ไข เพิ่ม หรือลบ Deck และ Subdeck</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="ค้นหา Deck..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="max-w-sm" />
            
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>ชื่อ</TableHead>
                    <TableHead>หมวดหมู่</TableHead>
                    <TableHead>ระดับ</TableHead>
                    <TableHead>Flashcards</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>การกระทำ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDecks.map((deck, index) => (
                    <DraggableRow 
                      key={deck.id} 
                      deck={deck} 
                      index={index} 
                      moveRow={moveRow}
                    >
                      <TableCell className="font-medium" onClick={() => navigate(`/admin/decks/${deck.id}`)}>
                        {deck.name}
                      </TableCell>
                      <TableCell onClick={() => navigate(`/admin/decks/${deck.id}`)}>
                        {deck.category}
                      </TableCell>
                      <TableCell onClick={() => navigate(`/admin/decks/${deck.id}`)}>
                        <Badge variant="outline">{deck.level}</Badge>
                      </TableCell>
                      <TableCell onClick={() => navigate(`/admin/decks/${deck.id}`)}>
                        {deck.total_flashcards || 0}
                      </TableCell>
                      <TableCell onClick={() => navigate(`/admin/decks/${deck.id}`)}>
                        <Badge variant={deck.is_published ? 'default' : 'secondary'}>
                          {deck.is_published ? 'Published' : 'Draft'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant={deck.is_published ? "default" : "outline"}
                            size="sm" 
                            onClick={(e) => handleTogglePublish(deck.id, deck.is_published, e)}
                          >
                            {deck.is_published ? (
                              <>
                                <Eye className="w-4 h-4 mr-2" />
                                แสดงให้ User
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-4 h-4 mr-2" />
                                ซ่อนจาก User
                              </>
                            )}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={e => {
                            e.stopPropagation();
                            navigate(`/admin/decks/${deck.id}`);
                          }}>
                            จัดการ
                          </Button>
                        </div>
                      </TableCell>
                    </DraggableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <CreateDeckDialog open={showCreateDeck} onOpenChange={setShowCreateDeck} onSuccess={fetchDecks} />
      </div>
    </DndProvider>
  );
}