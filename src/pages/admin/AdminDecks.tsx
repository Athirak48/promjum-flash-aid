import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Upload, Download, Eye, EyeOff, GripVertical, Trash2, BookOpen, Layers, FileText, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CreateDeckDialog } from '@/components/admin/CreateDeckDialog';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
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
          <GripVertical className="w-4 h-4 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300" />
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deckToDelete, setDeckToDelete] = useState<any>(null);

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      const { data, error } = await supabase
        .from('decks')
        .select('*, sub_decks(count)')
        .order('display_order', { ascending: true });
      if (error) throw error;
      setDecks(data || []);
    } catch (error) {
      console.error('Error fetching decks:', error);
      toast.error('ไม่สามารถโหลดข้อมูล Deck ได้');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDeck = async () => {
    if (!deckToDelete) return;
    try {
      const { error } = await supabase.from('decks').delete().eq('id', deckToDelete.id);
      if (error) throw error;
      toast.success('ลบ Deck สำเร็จ');
      fetchDecks();
    } catch (error) {
      console.error('Error deleting deck:', error);
      toast.error('ไม่สามารถลบ Deck ได้');
    } finally {
      setDeleteDialogOpen(false);
      setDeckToDelete(null);
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

      const updatedDecks = newDecks.map((deck, index) => ({
        ...deck,
        display_order: index
      }));

      Promise.all(
        updatedDecks.map(deck =>
          supabase.from('decks').update({ display_order: deck.display_order }).eq('id', deck.id)
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

  const filteredDecks = decks.filter(deck =>
    deck.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deck.name_en?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const totalDecks = decks.length;
  const publishedDecks = decks.filter(d => d.is_published).length;
  const draftDecks = decks.filter(d => !d.is_published).length;
  const totalFlashcards = decks.reduce((sum, d) => sum + (d.total_flashcards || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              Deck / Subdeck
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">จัดการ Deck, Subdeck และ Flashcard</p>
          </div>
          <Button onClick={() => setShowCreateDeck(true)}>
            <Plus className="w-4 h-4 mr-2" />
            เพิ่ม Deck
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{totalDecks}</p>
                  <p className="text-sm font-medium text-slate-500">Decks ทั้งหมด</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{publishedDecks}</p>
                  <p className="text-sm font-medium text-slate-500">Published</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{draftDecks}</p>
                  <p className="text-sm font-medium text-slate-500">Draft</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                  <Layers className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{totalFlashcards}</p>
                  <p className="text-sm font-medium text-slate-500">Flashcards</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table Card */}
        <Card>
          <CardHeader>
            <CardTitle>จัดการ Decks</CardTitle>
            <CardDescription>แก้ไข เพิ่ม หรือลบ Deck และ Subdeck</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="ค้นหา Deck..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>ชื่อ</TableHead>
                    <TableHead>หมวดหมู่</TableHead>
                    <TableHead>ระดับ</TableHead>
                    <TableHead>Sub-decks</TableHead>
                    <TableHead>Flashcards</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>การกระทำ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDecks.map((deck, index) => (
                    <DraggableRow key={deck.id} deck={deck} index={index} moveRow={moveRow}>
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
                        <Badge variant="secondary">{deck.sub_decks?.[0]?.count || 0}</Badge>
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
                              <><Eye className="w-4 h-4 mr-1" />แสดง</>
                            ) : (
                              <><EyeOff className="w-4 h-4 mr-1" />ซ่อน</>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={e => {
                              e.stopPropagation();
                              navigate(`/admin/decks/${deck.id}`);
                            }}
                          >
                            จัดการ
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={e => {
                              e.stopPropagation();
                              setDeckToDelete(deck);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>ยืนยันการลบ Deck</AlertDialogTitle>
              <AlertDialogDescription>
                คุณต้องการลบ "{deckToDelete?.name}" หรือไม่? การลบนี้จะลบ Sub-decks และ Flashcards ทั้งหมดในนี้ด้วย
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteDeck} className="bg-destructive text-destructive-foreground">
                ลบ
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DndProvider>
  );
}
