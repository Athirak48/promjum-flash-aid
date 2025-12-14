import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { BookOpen, Plus, Edit, Trash2, Search, Upload, Volume2, Image, Eye, Filter, Download, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Flashcard {
    id: string;
    word: string;
    meaning: string;
    example_sentence: string | null;
    pronunciation: string | null;
    image_url: string | null;
    audio_url: string | null;
    deck_name: string;
    sub_deck_name: string;
    difficulty: 'easy' | 'medium' | 'hard';
    created_at: string;
}

interface Deck {
    id: string;
    name: string;
    sub_decks: { id: string; name: string }[];
}

// Mock data
const mockDecks: Deck[] = [
    {
        id: '1', name: 'TOEIC Vocabulary', sub_decks: [
            { id: '1a', name: 'Business Words' },
            { id: '1b', name: 'Office Terms' },
        ]
    },
    {
        id: '2', name: 'IELTS Vocabulary', sub_decks: [
            { id: '2a', name: 'Academic Words' },
            { id: '2b', name: 'Common Phrases' },
        ]
    },
    {
        id: '3', name: 'Daily English', sub_decks: [
            { id: '3a', name: 'Greetings' },
            { id: '3b', name: 'Food & Restaurant' },
        ]
    },
];

const mockFlashcards: Flashcard[] = [
    {
        id: '1',
        word: 'accomplish',
        meaning: 'สำเร็จ, ทำให้สำเร็จ',
        example_sentence: 'She accomplished all her goals this year.',
        pronunciation: '/əˈkɑːmplɪʃ/',
        image_url: null,
        audio_url: null,
        deck_name: 'TOEIC Vocabulary',
        sub_deck_name: 'Business Words',
        difficulty: 'medium',
        created_at: '2024-12-14T10:00:00',
    },
    {
        id: '2',
        word: 'negotiate',
        meaning: 'เจรจาต่อรอง',
        example_sentence: 'They negotiated a new contract with the supplier.',
        pronunciation: '/nɪˈɡoʊʃieɪt/',
        image_url: null,
        audio_url: null,
        deck_name: 'TOEIC Vocabulary',
        sub_deck_name: 'Business Words',
        difficulty: 'hard',
        created_at: '2024-12-14T09:00:00',
    },
    {
        id: '3',
        word: 'analyze',
        meaning: 'วิเคราะห์',
        example_sentence: 'The team analyzed the market trends carefully.',
        pronunciation: '/ˈænəlaɪz/',
        image_url: null,
        audio_url: null,
        deck_name: 'IELTS Vocabulary',
        sub_deck_name: 'Academic Words',
        difficulty: 'medium',
        created_at: '2024-12-13T15:00:00',
    },
];

export default function AdminFlashcards() {
    const [flashcards, setFlashcards] = useState<Flashcard[]>(mockFlashcards);
    const [decks] = useState<Deck[]>(mockDecks);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedFlashcard, setSelectedFlashcard] = useState<Flashcard | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDeck, setFilterDeck] = useState('all');
    const [filterDifficulty, setFilterDifficulty] = useState('all');
    const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        word: '',
        meaning: '',
        example_sentence: '',
        pronunciation: '',
        deck_id: '',
        sub_deck_id: '',
        difficulty: 'medium' as 'easy' | 'medium' | 'hard',
        image_url: '',
        audio_url: '',
    });

    const [selectedDeckForForm, setSelectedDeckForForm] = useState<Deck | null>(null);

    const resetForm = () => {
        setFormData({
            word: '',
            meaning: '',
            example_sentence: '',
            pronunciation: '',
            deck_id: '',
            sub_deck_id: '',
            difficulty: 'medium',
            image_url: '',
            audio_url: '',
        });
        setSelectedDeckForForm(null);
    };

    const handleCreateFlashcard = () => {
        const deck = decks.find(d => d.id === formData.deck_id);
        const subDeck = deck?.sub_decks.find(s => s.id === formData.sub_deck_id);

        const newFlashcard: Flashcard = {
            id: Date.now().toString(),
            word: formData.word,
            meaning: formData.meaning,
            example_sentence: formData.example_sentence || null,
            pronunciation: formData.pronunciation || null,
            image_url: formData.image_url || null,
            audio_url: formData.audio_url || null,
            deck_name: deck?.name || '',
            sub_deck_name: subDeck?.name || '',
            difficulty: formData.difficulty,
            created_at: new Date().toISOString(),
        };

        setFlashcards([newFlashcard, ...flashcards]);
        setIsCreateDialogOpen(false);
        resetForm();
        toast.success('สร้าง Flashcard สำเร็จ!');
    };

    const handleEditFlashcard = () => {
        if (!selectedFlashcard) return;

        const deck = decks.find(d => d.id === formData.deck_id);
        const subDeck = deck?.sub_decks.find(s => s.id === formData.sub_deck_id);

        setFlashcards(flashcards.map(f =>
            f.id === selectedFlashcard.id
                ? {
                    ...f,
                    word: formData.word,
                    meaning: formData.meaning,
                    example_sentence: formData.example_sentence || null,
                    pronunciation: formData.pronunciation || null,
                    deck_name: deck?.name || f.deck_name,
                    sub_deck_name: subDeck?.name || f.sub_deck_name,
                    difficulty: formData.difficulty,
                }
                : f
        ));
        setIsEditDialogOpen(false);
        setSelectedFlashcard(null);
        resetForm();
        toast.success('แก้ไข Flashcard สำเร็จ!');
    };

    const handleDeleteFlashcard = (id: string) => {
        setFlashcards(flashcards.filter(f => f.id !== id));
        toast.success('ลบ Flashcard สำเร็จ');
    };

    const openEditDialog = (flashcard: Flashcard) => {
        setSelectedFlashcard(flashcard);
        setFormData({
            word: flashcard.word,
            meaning: flashcard.meaning,
            example_sentence: flashcard.example_sentence || '',
            pronunciation: flashcard.pronunciation || '',
            deck_id: '',
            sub_deck_id: '',
            difficulty: flashcard.difficulty,
            image_url: flashcard.image_url || '',
            audio_url: flashcard.audio_url || '',
        });
        setIsEditDialogOpen(true);
    };

    const getDifficultyBadge = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return <Badge className="bg-green-500">ง่าย</Badge>;
            case 'medium': return <Badge className="bg-amber-500">ปานกลาง</Badge>;
            case 'hard': return <Badge className="bg-red-500">ยาก</Badge>;
            default: return <Badge>{difficulty}</Badge>;
        }
    };

    const filteredFlashcards = flashcards.filter(f => {
        const matchesSearch = f.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.meaning.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDeck = filterDeck === 'all' || f.deck_name === filterDeck;
        const matchesDifficulty = filterDifficulty === 'all' || f.difficulty === filterDifficulty;
        return matchesSearch && matchesDeck && matchesDifficulty;
    });

    // Stats
    const totalCards = flashcards.length;
    const easyCount = flashcards.filter(f => f.difficulty === 'easy').length;
    const mediumCount = flashcards.filter(f => f.difficulty === 'medium').length;
    const hardCount = flashcards.filter(f => f.difficulty === 'hard').length;

    const FlashcardForm = ({ isEdit = false }: { isEdit?: boolean }) => (
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>คำศัพท์ *</Label>
                    <Input
                        placeholder="เช่น accomplish"
                        value={formData.word}
                        onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label>การออกเสียง</Label>
                    <Input
                        placeholder="เช่น /əˈkɑːmplɪʃ/"
                        value={formData.pronunciation}
                        onChange={(e) => setFormData({ ...formData, pronunciation: e.target.value })}
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label>ความหมาย *</Label>
                <Input
                    placeholder="ความหมายภาษาไทย"
                    value={formData.meaning}
                    onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
                />
            </div>
            <div className="space-y-2">
                <Label>ประโยคตัวอย่าง</Label>
                <Textarea
                    placeholder="ตัวอย่างการใช้ในประโยค"
                    rows={2}
                    value={formData.example_sentence}
                    onChange={(e) => setFormData({ ...formData, example_sentence: e.target.value })}
                />
                <Button variant="outline" size="sm" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    AI สร้างประโยค
                </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Deck</Label>
                    <Select
                        value={formData.deck_id}
                        onValueChange={(value) => {
                            setFormData({ ...formData, deck_id: value, sub_deck_id: '' });
                            setSelectedDeckForForm(decks.find(d => d.id === value) || null);
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="เลือก Deck" />
                        </SelectTrigger>
                        <SelectContent>
                            {decks.map(deck => (
                                <SelectItem key={deck.id} value={deck.id}>{deck.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Sub Deck</Label>
                    <Select
                        value={formData.sub_deck_id}
                        onValueChange={(value) => setFormData({ ...formData, sub_deck_id: value })}
                        disabled={!selectedDeckForForm}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="เลือก Sub Deck" />
                        </SelectTrigger>
                        <SelectContent>
                            {selectedDeckForForm?.sub_decks.map(sub => (
                                <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-2">
                <Label>ระดับความยาก</Label>
                <Select
                    value={formData.difficulty}
                    onValueChange={(value: 'easy' | 'medium' | 'hard') => setFormData({ ...formData, difficulty: value })}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="easy">ง่าย</SelectItem>
                        <SelectItem value="medium">ปานกลาง</SelectItem>
                        <SelectItem value="hard">ยาก</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>รูปภาพ</Label>
                    <div className="flex gap-2">
                        <Input placeholder="URL รูปภาพ" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} />
                        <Button variant="outline" size="icon"><Image className="h-4 w-4" /></Button>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>เสียง</Label>
                    <div className="flex gap-2">
                        <Input placeholder="URL เสียง" value={formData.audio_url} onChange={(e) => setFormData({ ...formData, audio_url: e.target.value })} />
                        <Button variant="outline" size="icon"><Volume2 className="h-4 w-4" /></Button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <BookOpen className="h-8 w-8 text-primary" />
                        Flashcard Management
                    </h1>
                    <p className="text-muted-foreground mt-1">สร้าง แก้ไข และจัดการ Flashcard ในระบบ</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isBulkImportOpen} onOpenChange={setIsBulkImportOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Upload className="h-4 w-4" />
                                นำเข้า Excel
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>นำเข้า Flashcard จาก Excel</DialogTitle>
                                <DialogDescription>อัพโหลดไฟล์ Excel หรือ CSV เพื่อนำเข้า Flashcard หลายรายการ</DialogDescription>
                            </DialogHeader>
                            <div className="py-8 border-2 border-dashed rounded-lg text-center">
                                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์</p>
                                <p className="text-xs text-muted-foreground mt-2">รองรับ .xlsx, .csv</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <Button variant="link" className="gap-2 p-0">
                                    <Download className="h-4 w-4" />
                                    ดาวน์โหลดเทมเพลต
                                </Button>
                                <Button>นำเข้า</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                สร้าง Flashcard
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>สร้าง Flashcard ใหม่</DialogTitle>
                                <DialogDescription>กรอกข้อมูลเพื่อสร้างการ์ดคำศัพท์ใหม่</DialogDescription>
                            </DialogHeader>
                            <FlashcardForm />
                            <DialogFooter>
                                <Button variant="outline" onClick={() => { setIsCreateDialogOpen(false); resetForm(); }}>ยกเลิก</Button>
                                <Button onClick={handleCreateFlashcard} disabled={!formData.word || !formData.meaning}>
                                    สร้าง Flashcard
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-primary/10">
                                <BookOpen className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{totalCards}</p>
                                <p className="text-sm text-muted-foreground">การ์ดทั้งหมด</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                                <span className="text-2xl">🟢</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{easyCount}</p>
                                <p className="text-sm text-muted-foreground">ระดับง่าย</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                                <span className="text-2xl">🟡</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{mediumCount}</p>
                                <p className="text-sm text-muted-foreground">ระดับปานกลาง</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30">
                                <span className="text-2xl">🔴</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{hardCount}</p>
                                <p className="text-sm text-muted-foreground">ระดับยาก</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="ค้นหาคำศัพท์..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={filterDeck} onValueChange={setFilterDeck}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="เลือก Deck" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ทุก Deck</SelectItem>
                                {decks.map(deck => (
                                    <SelectItem key={deck.id} value={deck.name}>{deck.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="ระดับความยาก" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ทุกระดับ</SelectItem>
                                <SelectItem value="easy">ง่าย</SelectItem>
                                <SelectItem value="medium">ปานกลาง</SelectItem>
                                <SelectItem value="hard">ยาก</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Flashcards Table */}
            <Card>
                <CardHeader>
                    <CardTitle>รายการ Flashcard ({filteredFlashcards.length})</CardTitle>
                    <CardDescription>การ์ดคำศัพท์ทั้งหมดในระบบ</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>คำศัพท์</TableHead>
                                    <TableHead>ความหมาย</TableHead>
                                    <TableHead>Deck / Sub Deck</TableHead>
                                    <TableHead>ระดับ</TableHead>
                                    <TableHead>สื่อ</TableHead>
                                    <TableHead>วันที่สร้าง</TableHead>
                                    <TableHead>การกระทำ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredFlashcards.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                            ไม่พบ Flashcard
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredFlashcards.map((card) => (
                                        <TableRow key={card.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{card.word}</p>
                                                    {card.pronunciation && (
                                                        <p className="text-xs text-muted-foreground">{card.pronunciation}</p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate">{card.meaning}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium text-sm">{card.deck_name}</p>
                                                    <p className="text-xs text-muted-foreground">{card.sub_deck_name}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getDifficultyBadge(card.difficulty)}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    {card.image_url && <Image className="h-4 w-4 text-muted-foreground" />}
                                                    {card.audio_url && <Volume2 className="h-4 w-4 text-muted-foreground" />}
                                                    {!card.image_url && !card.audio_url && <span className="text-muted-foreground">-</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(card.created_at).toLocaleDateString('th-TH', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openEditDialog(card)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => handleDeleteFlashcard(card.id)}
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

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>แก้ไข Flashcard</DialogTitle>
                        <DialogDescription>แก้ไขข้อมูลการ์ดคำศัพท์</DialogDescription>
                    </DialogHeader>
                    <FlashcardForm isEdit />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); setSelectedFlashcard(null); resetForm(); }}>ยกเลิก</Button>
                        <Button onClick={handleEditFlashcard} disabled={!formData.word || !formData.meaning}>
                            บันทึก
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
