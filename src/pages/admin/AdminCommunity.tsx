import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Upload, Eye, EyeOff, GripVertical, Trash2, BookOpen, Layers, FileText, CheckCircle, Users, RefreshCw, FileUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CreateDeckDialog } from '@/components/admin/CreateDeckDialog';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useAuth } from '@/hooks/useAuth';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

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

export default function AdminCommunity() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('admin');
    const [adminDecks, setAdminDecks] = useState<any[]>([]);
    const [userDecks, setUserDecks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateDeck, setShowCreateDeck] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deckToDelete, setDeckToDelete] = useState<any>(null);

    // CSV Upload state
    const [showCsvDialog, setShowCsvDialog] = useState(false);
    const [csvDeckName, setCsvDeckName] = useState('');
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchDecks();
    }, []);

    const fetchDecks = async () => {
        setIsLoading(true);
        try {
            // Fetch all decks
            const { data, error } = await supabase
                .from('decks')
                .select('*, sub_decks(count)')
                .order('display_order', { ascending: true });

            if (error) throw error;

            // All decks are admin decks since 'decks' table is for admin content
            setAdminDecks(data || []);
            setUserDecks([]);
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
        setAdminDecks((prevDecks) => {
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

    // CSV Upload handler
    const handleCsvUpload = async () => {
        if (!csvDeckName.trim()) {
            toast.error('กรุณาใส่ชื่อ Deck');
            return;
        }
        if (!csvFile) {
            toast.error('กรุณาเลือกไฟล์ CSV');
            return;
        }

        setIsUploading(true);
        try {
            // Read CSV file
            const text = await csvFile.text();
            const lines = text.split('\n').filter(line => line.trim());

            if (lines.length < 2) {
                throw new Error('ไฟล์ CSV ต้องมีอย่างน้อย 1 row ของข้อมูล');
            }

            // Parse header - support multiple formats
            const header = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
            const frontIndex = header.findIndex(h =>
                h === 'front' || h === 'คำศัพท์' || h === 'word' || h === 'term' || h === 'vocabulary'
            );
            const backIndex = header.findIndex(h =>
                h === 'back' || h === 'ความหมาย' || h === 'meaning' || h === 'definition' || h === 'translation'
            );
            const posIndex = header.findIndex(h =>
                h === 'part of speech' || h === 'pos' || h === 'part_of_speech' || h === 'ชนิดคำ' || h === 'partofspeech'
            );

            if (frontIndex === -1 || backIndex === -1) {
                throw new Error('CSV ต้องมี column "front" และ "back" (หรือ คำศัพท์/ความหมาย)');
            }

            // Create deck first
            const { data: newDeck, error: deckError } = await supabase
                .from('decks')
                .insert({
                    name: csvDeckName.trim(),
                    name_en: csvDeckName.trim(),
                    description: `Uploaded from CSV - ${csvFile.name}`,
                    is_published: false,
                    category: 'อื่นๆ',
                    level: 'mixed'
                })
                .select()
                .single();

            if (deckError) throw deckError;

            // Create sub_deck linked to deck
            const { data: newSubDeck, error: subDeckError } = await supabase
                .from('sub_decks')
                .insert({
                    name: csvDeckName.trim(),
                    name_en: csvDeckName.trim(),
                    description: `Uploaded from CSV - ${csvFile.name}`,
                    deck_id: newDeck.id,
                    is_published: false,
                    creator_user_id: user?.id
                })
                .select()
                .single();

            if (subDeckError) throw subDeckError;

            // Parse flashcards - handle CSV with or without part of speech
            const flashcards: { subdeck_id: string; front_text: string; back_text: string; part_of_speech?: string }[] = [];
            for (let i = 1; i < lines.length; i++) {
                // Handle CSV values that may contain commas inside quotes
                const values = parseCSVLine(lines[i]);
                const front = values[frontIndex]?.trim().replace(/^"|"$/g, '');
                const back = values[backIndex]?.trim().replace(/^"|"$/g, '');
                const partOfSpeech = posIndex !== -1 ? values[posIndex]?.trim().replace(/^"|"$/g, '') : undefined;

                if (front && back) {
                    const flashcard: { subdeck_id: string; front_text: string; back_text: string; part_of_speech?: string } = {
                        subdeck_id: newSubDeck.id,
                        front_text: front,
                        back_text: back
                    };
                    if (partOfSpeech) {
                        flashcard.part_of_speech = partOfSpeech;
                    }
                    flashcards.push(flashcard);
                }
            }

            if (flashcards.length === 0) {
                throw new Error('ไม่พบ flashcard ที่ถูกต้องในไฟล์');
            }

            // Insert flashcards
            const { error: flashcardsError } = await supabase
                .from('flashcards')
                .insert(flashcards);

            if (flashcardsError) throw flashcardsError;

            // Update sub_deck flashcard_count
            await supabase
                .from('sub_decks')
                .update({ flashcard_count: flashcards.length })
                .eq('id', newSubDeck.id);

            // Update deck total_flashcards count
            await supabase
                .from('decks')
                .update({ total_flashcards: flashcards.length })
                .eq('id', newDeck.id);

            const posInfo = posIndex !== -1 ? ' พร้อม Part of Speech' : '';
            toast.success(`สร้าง Deck "${csvDeckName}" สำเร็จ! (${flashcards.length} flashcards${posInfo})`);
            setShowCsvDialog(false);
            setCsvDeckName('');
            setCsvFile(null);
            fetchDecks();
        } catch (error: any) {
            console.error('Error uploading CSV:', error);
            toast.error(error.message || 'เกิดข้อผิดพลาดในการอัพโหลด CSV');
        } finally {
            setIsUploading(false);
        }
    };

    // Helper function to parse CSV line with quoted values
    const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    };

    const currentDecks = activeTab === 'admin' ? adminDecks : userDecks;
    const filteredDecks = currentDecks.filter(deck =>
        deck.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deck.name_en?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Stats
    const totalAdminDecks = adminDecks.length;
    const totalUserDecks = userDecks.length;
    const publishedDecks = currentDecks.filter(d => d.is_published).length;
    const totalFlashcards = currentDecks.reduce((sum, d) => sum + (d.total_flashcards || 0), 0);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
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
                            <Users className="h-8 w-8 text-primary" />
                            Community
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">จัดการ Decks จาก Users และ Admin</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={fetchDecks}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            รีเฟรช
                        </Button>
                        {activeTab === 'admin' && (
                            <>
                                <Button variant="outline" onClick={() => setShowCsvDialog(true)}>
                                    <FileUp className="w-4 h-4 mr-2" />
                                    อัพโหลด CSV
                                </Button>
                                <Button onClick={() => setShowCreateDeck(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    เพิ่ม Deck
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                        <CardContent className="pt-6 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm">Admin Decks</p>
                                    <p className="text-3xl font-bold mt-1">{totalAdminDecks}</p>
                                </div>
                                <BookOpen className="h-10 w-10 text-blue-200" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                        <CardContent className="pt-6 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm">User Decks</p>
                                    <p className="text-3xl font-bold mt-1">{totalUserDecks}</p>
                                </div>
                                <Users className="h-10 w-10 text-purple-200" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
                        <CardContent className="pt-6 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm">Published</p>
                                    <p className="text-3xl font-bold mt-1">{publishedDecks}</p>
                                </div>
                                <CheckCircle className="h-10 w-10 text-green-200" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
                        <CardContent className="pt-6 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-amber-100 text-sm">Flashcards</p>
                                    <p className="text-3xl font-bold mt-1">{totalFlashcards}</p>
                                </div>
                                <Layers className="h-10 w-10 text-amber-200" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Card>
                    <CardHeader className="border-b">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full max-w-md grid-cols-2">
                                <TabsTrigger value="admin" className="gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    Admin Decks ({totalAdminDecks})
                                </TabsTrigger>
                                <TabsTrigger value="user" className="gap-2">
                                    <Users className="h-4 w-4" />
                                    User Decks ({totalUserDecks})
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <Input
                            placeholder="ค้นหา Deck..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />

                        {filteredDecks.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                <BookOpen className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                                <p>ไม่พบ Deck</p>
                                {activeTab === 'admin' && (
                                    <Button className="mt-4" onClick={() => setShowCsvDialog(true)}>
                                        <FileUp className="h-4 w-4 mr-2" />
                                        อัพโหลด CSV เพื่อสร้าง Deck แรก
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50 dark:bg-slate-900">
                                            {activeTab === 'admin' && <TableHead className="w-8"></TableHead>}
                                            <TableHead>ชื่อ</TableHead>
                                            <TableHead>หมวดหมู่</TableHead>
                                            {activeTab === 'user' && <TableHead>สร้างโดย</TableHead>}
                                            <TableHead>Flashcards</TableHead>
                                            <TableHead>สถานะ</TableHead>
                                            <TableHead>การกระทำ</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {activeTab === 'admin' ? (
                                            filteredDecks.map((deck, index) => (
                                                <DraggableRow key={deck.id} deck={deck} index={index} moveRow={moveRow}>
                                                    <TableCell className="font-medium" onClick={() => navigate(`/admin/decks/${deck.id}`)}>
                                                        {deck.name}
                                                    </TableCell>
                                                    <TableCell onClick={() => navigate(`/admin/decks/${deck.id}`)}>
                                                        {deck.category || '-'}
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
                                            ))
                                        ) : (
                                            filteredDecks.map((deck) => (
                                                <TableRow key={deck.id} className="hover:bg-muted/50">
                                                    <TableCell className="font-medium" onClick={() => navigate(`/admin/decks/${deck.id}`)}>
                                                        {deck.name}
                                                    </TableCell>
                                                    <TableCell onClick={() => navigate(`/admin/decks/${deck.id}`)}>
                                                        {deck.category || '-'}
                                                    </TableCell>
                                                    <TableCell onClick={() => navigate(`/admin/decks/${deck.id}`)}>
                                                        <span className="text-slate-600 dark:text-slate-400">
                                                            {deck.profiles?.display_name || deck.profiles?.username || 'Unknown'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell onClick={() => navigate(`/admin/decks/${deck.id}`)}>
                                                        {deck.total_flashcards || 0}
                                                    </TableCell>
                                                    <TableCell>
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
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Create Deck Dialog */}
                <CreateDeckDialog open={showCreateDeck} onOpenChange={setShowCreateDeck} onSuccess={fetchDecks} />

                {/* CSV Upload Dialog */}
                <Dialog open={showCsvDialog} onOpenChange={setShowCsvDialog}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <FileUp className="h-5 w-5" />
                                อัพโหลด CSV เพื่อสร้าง Deck
                            </DialogTitle>
                            <DialogDescription>
                                อัพโหลดไฟล์ CSV ที่มี column "front", "part of speech", "back"
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>ชื่อ Deck</Label>
                                <Input
                                    placeholder="เช่น TOEIC Vocabulary"
                                    value={csvDeckName}
                                    onChange={(e) => setCsvDeckName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>ไฟล์ CSV</Label>
                                <div
                                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".csv"
                                        className="hidden"
                                        onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                                    />
                                    {csvFile ? (
                                        <div className="flex items-center justify-center gap-2 text-green-600">
                                            <CheckCircle className="h-5 w-5" />
                                            <span>{csvFile.name}</span>
                                        </div>
                                    ) : (
                                        <div className="text-slate-500">
                                            <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                                            <p>คลิกเพื่อเลือกไฟล์ CSV</p>
                                            <p className="text-xs mt-1">รองรับ: front, part of speech, back</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowCsvDialog(false)}>
                                ยกเลิก
                            </Button>
                            <Button onClick={handleCsvUpload} disabled={isUploading || !csvDeckName.trim() || !csvFile}>
                                {isUploading ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        กำลังอัพโหลด...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4 mr-2" />
                                        อัพโหลดและสร้าง Deck
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>ยืนยันการลบ Deck</AlertDialogTitle>
                            <AlertDialogDescription>
                                คุณต้องการลบ "{deckToDelete?.name}" หรือไม่? การลบนี้จะลบ Flashcards ทั้งหมดในนี้ด้วย
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
