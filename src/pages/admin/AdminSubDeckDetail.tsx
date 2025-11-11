import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Upload, Plus, Edit, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

  const handleDeleteFlashcard = async (flashcardId: string) => {
    try {
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('id', flashcardId);

      if (error) throw error;

      toast.success('ลบคำศัพท์สำเร็จ');
      fetchSubDeckAndFlashcards();
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      toast.error('ไม่สามารถลบคำศัพท์ได้');
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
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มคำศัพท์
          </Button>
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
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFlashcard(flashcard.id)}
                        >
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
    </div>
  );
}
