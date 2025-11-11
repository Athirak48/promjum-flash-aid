import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Upload, Plus, Edit, Trash2, Trash } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as XLSX from 'xlsx';

interface Flashcard {
  id: string;
  front_text: string;
  back_text: string;
}

export default function AdminSubDeckDetail() {
  const { deckId, subdeckId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [subdeck, setSubdeck] = useState<any>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [selectedFlashcard, setSelectedFlashcard] = useState<Flashcard | null>(null);
  const [editForm, setEditForm] = useState({ front_text: '', back_text: '' });
  const [addForm, setAddForm] = useState({ front_text: '', back_text: '' });

  useEffect(() => {
    fetchSubDeckAndFlashcards();
  }, [subdeckId]);

  const fetchSubDeckAndFlashcards = async () => {
    try {
      setIsLoading(true);

      // Fetch subdeck
      const { data: subdeckData, error: subdeckError } = await supabase
        .from('sub_decks')
        .select('*')
        .eq('id', subdeckId)
        .single();

      if (subdeckError) throw subdeckError;
      setSubdeck(subdeckData);

      // Fetch flashcards
      const { data: flashcardsData, error: flashcardsError } = await supabase
        .from('flashcards')
        .select('*')
        .eq('subdeck_id', subdeckId)
        .order('created_at', { ascending: true });

      if (flashcardsError) throw flashcardsError;
      setFlashcards(flashcardsData || []);
    } catch (error) {
      console.error('Error fetching subdeck data:', error);
      toast.error('ไม่สามารถโหลดข้อมูล Subdeck ได้');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Delete existing flashcards
        const { error: deleteError } = await supabase
          .from('flashcards')
          .delete()
          .eq('subdeck_id', subdeckId);

        if (deleteError) throw deleteError;

        // Insert new flashcards
        const newFlashcards = jsonData.map((row: any) => ({
          subdeck_id: subdeckId,
          front_text: row.Front || row.front || '',
          back_text: row.Back || row.back || '',
          is_published: true,
          published_at: new Date().toISOString(),
        }));

        const { error: insertError } = await supabase
          .from('flashcards')
          .insert(newFlashcards);

        if (insertError) throw insertError;

        // Update flashcard count in subdeck
        const { error: updateError } = await supabase
          .from('sub_decks')
          .update({ flashcard_count: newFlashcards.length })
          .eq('id', subdeckId);

        if (updateError) throw updateError;

        toast.success('อัปโหลดคำศัพท์สำเร็จ');
        fetchSubDeckAndFlashcards();
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('ไม่สามารถอัปโหลดไฟล์ได้');
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEditClick = (flashcard: Flashcard) => {
    setSelectedFlashcard(flashcard);
    setEditForm({ front_text: flashcard.front_text, back_text: flashcard.back_text });
    setIsEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!selectedFlashcard) return;
    
    try {
      const { error } = await supabase
        .from('flashcards')
        .update({
          front_text: editForm.front_text,
          back_text: editForm.back_text,
        })
        .eq('id', selectedFlashcard.id);

      if (error) throw error;

      // Update state directly to preserve order
      setFlashcards(flashcards.map(fc => 
        fc.id === selectedFlashcard.id 
          ? { ...fc, front_text: editForm.front_text, back_text: editForm.back_text }
          : fc
      ));

      toast.success('แก้ไขคำศัพท์สำเร็จ');
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating flashcard:', error);
      toast.error('ไม่สามารถแก้ไขคำศัพท์ได้');
    }
  };

  const handleDeleteClick = (flashcard: Flashcard) => {
    setSelectedFlashcard(flashcard);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedFlashcard) return;

    try {
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('id', selectedFlashcard.id);

      if (error) throw error;

      // Update flashcard count
      const { error: updateError } = await supabase
        .from('sub_decks')
        .update({ flashcard_count: flashcards.length - 1 })
        .eq('id', subdeckId);

      if (updateError) throw updateError;

      // Update state directly to preserve order
      setFlashcards(flashcards.filter(fc => fc.id !== selectedFlashcard.id));

      toast.success('ลบคำศัพท์สำเร็จ');
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      toast.error('ไม่สามารถลบคำศัพท์ได้');
    }
  };

  const handleAddClick = () => {
    setAddForm({ front_text: '', back_text: '' });
    setIsAddDialogOpen(true);
  };

  const handleAddSave = async () => {
    if (!addForm.front_text || !addForm.back_text) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('flashcards')
        .insert({
          subdeck_id: subdeckId,
          front_text: addForm.front_text,
          back_text: addForm.back_text,
          is_published: true,
          published_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update flashcard count
      const { error: updateError } = await supabase
        .from('sub_decks')
        .update({ flashcard_count: flashcards.length + 1 })
        .eq('id', subdeckId);

      if (updateError) throw updateError;

      // Add to state directly to preserve order
      setFlashcards([...flashcards, data]);

      toast.success('เพิ่มคำศัพท์สำเร็จ');
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding flashcard:', error);
      toast.error('ไม่สามารถเพิ่มคำศัพท์ได้');
    }
  };

  const handleDeleteAllClick = () => {
    setIsDeleteAllDialogOpen(true);
  };

  const handleDeleteAllConfirm = async () => {
    try {
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('subdeck_id', subdeckId);

      if (error) throw error;

      // Update flashcard count
      const { error: updateError } = await supabase
        .from('sub_decks')
        .update({ flashcard_count: 0 })
        .eq('id', subdeckId);

      if (updateError) throw updateError;

      // Clear state directly
      setFlashcards([]);

      toast.success('ลบคำศัพท์ทั้งหมดสำเร็จ');
      setIsDeleteAllDialogOpen(false);
    } catch (error) {
      console.error('Error deleting all flashcards:', error);
      toast.error('ไม่สามารถลบคำศัพท์ทั้งหมดได้');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!subdeck) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">ไม่พบข้อมูล Subdeck</h1>
          <Button onClick={() => navigate(`/admin/decks/${deckId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับไปหน้า Deck
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/admin/decks/${deckId}`)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{subdeck.name}</h1>
              <p className="text-muted-foreground text-lg">{subdeck.name_en}</p>
              <p className="text-foreground/80 mt-2">จำนวนคำศัพท์ทั้งหมด: {flashcards.length}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              อัปโหลดไฟล์ .xlsx
            </Button>
            <Button onClick={handleAddClick}>
              <Plus className="w-4 h-4 mr-2" />
              เพิ่มคำศัพท์
            </Button>
            {flashcards.length > 0 && (
              <Button variant="destructive" onClick={handleDeleteAllClick}>
                <Trash className="w-4 h-4 mr-2" />
                ลบทั้งหมด
              </Button>
            )}
          </div>
        </div>

      {/* Flashcards Table */}
      <Card>
        <CardHeader>
          <CardTitle>คำศัพท์ทั้งหมด</CardTitle>
          <CardDescription>จัดการคำศัพท์ใน Subdeck นี้</CardDescription>
        </CardHeader>
        <CardContent>
          {flashcards.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">ยังไม่มีคำศัพท์ใน subdeck นี้</p>
              <p className="text-muted-foreground text-sm mt-2">
                อัปโหลดไฟล์ .xlsx หรือเพิ่มคำศัพท์ด้วยตนเอง
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">No.</TableHead>
                  <TableHead>Front</TableHead>
                  <TableHead>Back</TableHead>
                  <TableHead className="w-[150px]">การจัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flashcards.map((flashcard, index) => (
                  <TableRow key={flashcard.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{flashcard.front_text}</TableCell>
                    <TableCell>{flashcard.back_text}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditClick(flashcard)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(flashcard)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขคำศัพท์</DialogTitle>
            <DialogDescription>แก้ไขข้อมูล Front และ Back ของคำศัพท์</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-front">Front</Label>
              <Input
                id="edit-front"
                value={editForm.front_text}
                onChange={(e) => setEditForm({ ...editForm, front_text: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-back">Back</Label>
              <Input
                id="edit-back"
                value={editForm.back_text}
                onChange={(e) => setEditForm({ ...editForm, back_text: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleEditSave}>บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เพิ่มคำศัพท์</DialogTitle>
            <DialogDescription>กรอกข้อมูล Front และ Back ของคำศัพท์ใหม่</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="add-front">Front</Label>
              <Input
                id="add-front"
                value={addForm.front_text}
                onChange={(e) => setAddForm({ ...addForm, front_text: e.target.value })}
                placeholder="กรอก Front text"
              />
            </div>
            <div>
              <Label htmlFor="add-back">Back</Label>
              <Input
                id="add-back"
                value={addForm.back_text}
                onChange={(e) => setAddForm({ ...addForm, back_text: e.target.value })}
                placeholder="กรอก Back text"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleAddSave}>บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบคำศัพท์นี้หรือไม่?</AlertDialogTitle>
            <AlertDialogDescription>
              การดำเนินการนี้ไม่สามารถย้อนกลับได้ คำศัพท์จะถูกลบออกจากระบบอย่างถาวร
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              ลบถาวร
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete All Confirmation Dialog */}
      <AlertDialog open={isDeleteAllDialogOpen} onOpenChange={setIsDeleteAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ต้องการลบคำศัพท์ทั้งหมดใน deck นี้หรือไม่?</AlertDialogTitle>
            <AlertDialogDescription>
              การดำเนินการนี้จะลบคำศัพท์ทั้งหมด {flashcards.length} คำ ออกจากระบบอย่างถาวร และไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAllConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              ลบทั้งหมด
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
