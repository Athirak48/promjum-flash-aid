import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, MessageSquare, Mic, Play, Send, CheckCircle, AlertCircle, RefreshCw, Volume2, MoveRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Flashcard {
    id: string;
    front: string;
    back: string;
}

interface FlashcardSet {
    id: string;
    title: string;
    folderId?: string;
}

interface Folder {
    id: string;
    title: string;
}

type Stage = 'selection' | 'intro' | 'quiz' | 'mistake' | 'simulation' | 'summary';
type QuizType = 'mcq' | 'reorder' | 'typing';

export default function AIPracticeSentencePage() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { toast } = useToast();

    // Global State
    const [stage, setStage] = useState<Stage>('selection');
    const [selectedCards, setSelectedCards] = useState<Flashcard[]>([]);

    // Data Loading
    const [folders, setFolders] = useState<Folder[]>([]);
    const [sets, setSets] = useState<FlashcardSet[]>([]);
    const [cards, setCards] = useState<Flashcard[]>([]);

    const [selectedFolderId, setSelectedFolderId] = useState<string>('');
    const [selectedSetId, setSelectedSetId] = useState<string>('');

    // Selection Logic
    useEffect(() => {
        fetchFolders();
    }, []);

    const fetchFolders = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: foldersData } = await supabase.from('user_folders').select('*').eq('user_id', user.id);
        if (foldersData) setFolders(foldersData.map(f => ({ id: f.id, title: f.title })));

        const { data: setsData } = await supabase.from('user_flashcard_sets').select('*').eq('user_id', user.id);
        if (setsData) setSets(setsData.map(s => ({ id: s.id, title: s.title, folderId: s.folder_id })));
    };

    const handleFolderSelect = (folderId: string) => {
        setSelectedFolderId(folderId);
        setSelectedSetId(''); // Reset set selection
        setCards([]); // proper reset
    };

    const handleSetSelect = async (setId: string) => {
        setSelectedSetId(setId);
        setCards([]); // Clear current cards

        const { data: cardsData } = await supabase.from('user_flashcards').select('*').eq('flashcard_set_id', setId);
        if (cardsData) {
            setCards(cardsData.map(c => ({ id: c.id, front: c.front_text, back: c.back_text })));
        }
    };

    const toggleCardSelection = (card: Flashcard) => {
        if (selectedCards.find(c => c.id === card.id)) {
            setSelectedCards(selectedCards.filter(c => c.id !== card.id));
        } else {
            if (selectedCards.length < 2) {
                setSelectedCards([...selectedCards, card]);
            } else {
                toast({ title: "เลือกได้สูงสุด 2 ประโยค", description: "กรุณาลบรายการที่เลือกออกก่อนเลือกใหม่" });
            }
        }
    };

    // Filter sets based on selected folder
    const availableSets = sets.filter(s => s.folderId === selectedFolderId);

    // --- RENDERERS ---

    if (stage === 'selection') {
        return (
            <div className="min-h-screen bg-[#FDFBF7] p-4 flex flex-col">
                <header className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/practice')}>
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <h1 className="text-2xl font-bold">เลือกประโยคที่ต้องการฝึก</h1>
                </header>

                <div className="flex gap-6 flex-1 overflow-hidden h-full max-h-[80vh]">
                    {/* Filters Panel */}
                    <div className="w-1/3 bg-white rounded-xl shadow-sm p-6 space-y-6">
                        <h2 className="font-semibold text-lg border-b pb-2">ขั้นตอนที่ 1: เลือกแหล่งข้อมูล</h2>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">เลือกโฟลเดอร์</label>
                                <Select value={selectedFolderId} onValueChange={handleFolderSelect}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="เลือกโฟลเดอร์..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {folders.map(folder => (
                                            <SelectItem key={folder.id} value={folder.id}>
                                                {folder.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">เลือกชุดคำศัพท์</label>
                                <Select value={selectedSetId} onValueChange={handleSetSelect} disabled={!selectedFolderId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={!selectedFolderId ? "กรุณาเลือกโฟลเดอร์ก่อน" : "เลือกชุดคำศัพท์..."} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableSets.length > 0 ? (
                                            availableSets.map(set => (
                                                <SelectItem key={set.id} value={set.id}>
                                                    {set.title}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="p-2 text-sm text-center text-muted-foreground">ไม่มีชุดคำศัพท์ในโฟลเดอร์นี้</div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Card List Panel */}
                    <div className="flex-1 bg-white rounded-xl shadow-sm p-6 overflow-y-auto">
                        <h2 className="font-semibold text-lg border-b pb-2 mb-4">
                            ขั้นตอนที่ 2: เลือก 2 ประโยค ({selectedCards.length}/2)
                        </h2>

                        {!selectedSetId ? (
                            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                                <MessageSquare className="w-12 h-12 mb-2 opacity-20" />
                                <p>กรุณาเลือกโฟลเดอร์และชุดคำศัพท์ทางซ้ายมือ</p>
                            </div>
                        ) : cards.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                                <p>ไม่พบประโยคในชุดนี้</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {cards.map(card => (
                                    <div key={card.id} className="flex items-start gap-4 p-4 border rounded-xl hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => toggleCardSelection(card)}>
                                        <Checkbox
                                            checked={!!selectedCards.find(c => c.id === card.id)}
                                            onCheckedChange={() => toggleCardSelection(card)}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium text-slate-900 mb-1">{card.front}</div>
                                            <div className="text-sm text-slate-500">{card.back}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <Button
                        disabled={selectedCards.length !== 2}
                        onClick={() => setStage('intro')}
                        className="min-w-[200px] h-12 text-lg shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        เริ่มฝึกฝน (Start Practice)
                    </Button>
                </div>
            </div>
        );
    }

    if (stage === 'intro') {
        return <IntroView cards={selectedCards} onNext={() => setStage('quiz')} />;
    }

    if (stage === 'quiz') {
        return <QuizView cards={selectedCards} onNext={() => setStage('mistake')} />;
    }

    if (stage === 'mistake') {
        return <MistakeView cards={selectedCards} onNext={() => setStage('simulation')} />;
    }

    if (stage === 'simulation') {
        return <SimulationView cards={selectedCards} onNext={() => setStage('summary')} />;
    }

    if (stage === 'summary') {
        return <SummaryView cards={selectedCards} onHome={() => navigate('/practice')} />;
    }

    return null;
}

// --- SUB COMPONENTS ---

function IntroView({ cards, onNext }: { cards: Flashcard[], onNext: () => void }) {
    return (
        <div className="min-h-screen bg-[#FDFBF7] p-6 flex flex-col items-center justify-center max-w-2xl mx-auto">
            <div className="w-full bg-white rounded-2xl shadow-lg p-6 space-y-6">
                <div className="flex items-center gap-4 border-b pb-4">
                    <Avatar className="h-12 w-12 bg-blue-100">
                        <AvatarImage src="/ai-avatar.png" />
                        <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="font-bold text-lg">AI Assistant</h2>
                        <p className="text-sm text-slate-500">นี่คือประโยคที่เราจะฝึกกันในวันนี้ครับ</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {cards.map((card, idx) => (
                        <div key={idx} className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <div className="flex items-center justify-between mb-2">
                                <Badge variant="secondary">ประโยคที่ {idx + 1}</Badge>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                                    <Volume2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-1">{card.front}</h3>
                            <p className="text-slate-600">{card.back}</p>
                        </div>
                    ))}
                </div>

                <div className="pt-4 text-center">
                    <p className="mb-4 text-slate-600">พร้อมฝึกแล้วหรือยัง?</p>
                    <Button onClick={onNext} className="w-full h-12 text-lg rounded-xl">
                        พร้อมแล้ว! เริ่มเลย
                    </Button>
                </div>
            </div>
        </div>
    );
}

function QuizView({ cards, onNext }: { cards: Flashcard[], onNext: () => void }) {
    // 3 sub-stages per card: MCQ -> Reorder -> Type
    // Flow: Card1(MCQ->Reorder->Type) -> Card2(MCQ->Reorder->Type)
    const [currentCardIdx, setCurrentCardIdx] = useState(0);
    const [subStage, setSubStage] = useState<QuizType>('mcq');

    const card = cards[currentCardIdx];

    // MCQ Helpers
    const generateOptions = (correct: string) => {
        // Mock options
        return [
            correct,
            "This is a wrong sentence.",
            "Another incorrect option here.",
            "Completely different meaning."
        ].sort(() => Math.random() - 0.5);
    };

    const [options, setOptions] = useState<string[]>([]);
    const [scrambleWords, setScrambleWords] = useState<string[]>([]);
    const [reorderSelection, setReorderSelection] = useState<string[]>([]);
    const [typeInput, setTypeInput] = useState("");

    useEffect(() => {
        if (subStage === 'mcq') setOptions(generateOptions(card.front));
        if (subStage === 'reorder') {
            setScrambleWords(card.front.split(' ').sort(() => Math.random() - 0.5));
            setReorderSelection([]);
        }
        if (subStage === 'typing') setTypeInput("");
    }, [currentCardIdx, subStage, card]);

    const handleNext = () => {
        if (subStage === 'mcq') setSubStage('reorder');
        else if (subStage === 'reorder') setSubStage('typing');
        else if (subStage === 'typing') {
            if (currentCardIdx < cards.length - 1) {
                setCurrentCardIdx(prev => prev + 1);
                setSubStage('mcq');
            } else {
                onNext();
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] p-6 flex flex-col max-w-2xl mx-auto">
            <div className="mb-8">
                <Progress value={((currentCardIdx * 3) + (subStage === 'mcq' ? 1 : subStage === 'reorder' ? 2 : 3)) / (cards.length * 3) * 100} />
                <p className="text-center text-sm text-slate-400 mt-2">Quiz Mode</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg flex-1 flex flex-col items-center">
                <h2 className="text-2xl font-bold mb-6 text-center">
                    {subStage === 'mcq' && "เลือกประโยคที่ถูกต้อง"}
                    {subStage === 'reorder' && "เรียงประโยคให้ถูกต้อง"}
                    {subStage === 'typing' && "พิมพ์ประโยคให้ถูกต้อง"}
                </h2>

                <div className="mb-8 text-xl text-slate-600 font-medium">
                    ความหมาย: "{card.back}"
                </div>

                {/* MCQ */}
                {subStage === 'mcq' && (
                    <div className="grid gap-4 w-full">
                        {options.map((opt, i) => (
                            <Button
                                key={i}
                                variant="outline"
                                className="h-auto py-4 text-lg justify-start px-6 rounded-xl hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                                onClick={handleNext}
                            >
                                {opt}
                            </Button>
                        ))}
                    </div>
                )}

                {/* REORDER */}
                {subStage === 'reorder' && (
                    <div className="w-full space-y-6">
                        <div className="flex flex-wrap gap-2 justify-center min-h-[60px] p-4 bg-slate-50 rounded-xl border border-dashed">
                            {reorderSelection.map((word, i) => (
                                <Badge key={i} className="text-lg py-1 px-3 cursor-pointer" onClick={() => {
                                    setReorderSelection(prev => prev.filter((_, idx) => idx !== i));
                                    setScrambleWords(prev => [...prev, word]);
                                }}>
                                    {word}
                                </Badge>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {scrambleWords.map((word, i) => (
                                <Button key={i} variant="secondary" onClick={() => {
                                    setReorderSelection(prev => [...prev, word]);
                                    setScrambleWords(prev => prev.filter((_, idx) => idx !== i));
                                }}>
                                    {word}
                                </Button>
                            ))}
                        </div>
                        <Button className="w-full mt-4" onClick={handleNext} disabled={scrambleWords.length > 0}>
                            ยืนยัน
                        </Button>
                    </div>
                )}

                {/* TYPING */}
                {subStage === 'typing' && (
                    <div className="w-full space-y-4">
                        <Input
                            value={typeInput}
                            onChange={(e) => setTypeInput(e.target.value)}
                            className="text-lg p-6"
                            placeholder="Type the sentence here..."
                        />
                        <Button className="w-full" onClick={handleNext} disabled={!typeInput.trim()}>
                            ส่งคำตอบ
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

function MistakeView({ cards, onNext }: { cards: Flashcard[], onNext: () => void }) {
    // 2 rounds per card (total 4 rounds as requested "รวมทั้งหมด 4 รอบ")
    // For simplicity, let's do 1 round per card for "Find Mistake" x 2 variations = 4 rounds total?
    // Let's implement 1 round per card where we modify the sentence.

    const [round, setRound] = useState(0);
    const totalRounds = cards.length * 2; // 2 rounds per card

    const currentCard = cards[Math.floor(round / 2)];

    // Simplistic mistake generation: Duplicate a word or remove strict check
    const makeMistake = (text: string) => {
        const words = text.split(' ');
        if (words.length > 2) {
            const r = Math.random();
            if (r > 0.5) {
                // Duplicate random word
                const idx = Math.floor(Math.random() * words.length);
                words.splice(idx, 0, words[idx]);
            } else {
                // Replace 'a' with 'e' in a random word
                const idx = Math.floor(Math.random() * words.length);
                words[idx] = words[idx] + "s"; // subtle grammar error?
            }
        }
        return words.join(' ');
    };

    const [mistakeSentence, setMistakeSentence] = useState("");

    useEffect(() => {
        setMistakeSentence(makeMistake(currentCard.front));
    }, [round, currentCard]);

    const handleNext = () => {
        if (round < totalRounds - 1) {
            setRound(prev => prev + 1);
        } else {
            onNext();
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] p-6 flex flex-col max-w-2xl mx-auto">
            <div className="mb-8">
                <Progress value={(round + 1) / totalRounds * 100} />
                <p className="text-center text-sm text-slate-400 mt-2">Find the Mistake ({round + 1}/{totalRounds})</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg flex-1 flex flex-col items-center justify-center">
                <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
                <h2 className="text-2xl font-bold mb-2">หาจุดที่ผิด</h2>
                <p className="text-slate-500 mb-8">คลิกที่คำที่ผิดเพื่อแก้ไข</p>

                <div className="text-2xl font-medium p-6 bg-red-50 rounded-xl border border-red-100 text-center cursor-pointer hover:bg-red-100 transition-colors"
                    onClick={() => {
                        toast({ title: "ถูกต้อง!", className: "bg-green-500 text-white" });
                        setTimeout(handleNext, 1000);
                    }}
                >
                    {mistakeSentence}
                </div>

                <p className="mt-8 text-sm text-slate-400">
                    (Simulation: Click the sentence to simulate finding and fixing the mistake)
                </p>
            </div>
        </div>
    );
}

function SimulationView({ cards, onNext }: { cards: Flashcard[], onNext: () => void }) {
    const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string }[]>([
        { role: 'ai', text: "สวัสดีครับ! ลองแต่งประโยคคุยกับผมโดยใช้ประโยคที่เราฝึกกันหน่อยนะครับ เริ่มทักทายได้เลย!" }
    ]);
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleSend = () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { role: 'user', text: input } as const];
        setMessages(newMessages);
        setInput("");

        // Simple AI Logic
        setTimeout(() => {
            setMessages(prev => [...prev, {
                role: 'ai',
                text: "เยี่ยมมากครับ! ลองใช้ประโยคถัดไปได้เลย (Simulation: Conversation simulates roleplay)."
            }]);

            // Check if enough interaction
            if (newMessages.filter(m => m.role === 'user').length >= 2) {
                setTimeout(() => onNext(), 3000); // Auto finish after 2 exchanges
            }
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] flex flex-col max-w-2xl mx-auto h-screen">
            <header className="bg-white border-b p-4 flex items-center gap-3">
                <Avatar>
                    <AvatarImage src="/ai-avatar.png" />
                    <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="font-bold">ฝึกสนทนา</h1>
                    <p className="text-xs text-green-500">ออนไลน์</p>
                </div>
            </header>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 pb-4">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-4 rounded-2xl ${m.role === 'user'
                                    ? 'bg-primary text-white rounded-tr-none'
                                    : 'bg-white shadow-sm border rounded-tl-none'
                                }`}>
                                {m.text}
                            </div>
                        </div>
                    ))}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            <div className="p-4 bg-white border-t">
                <div className="flex gap-2 relative">
                    <Input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="พิมพ์ข้อความของคุณ..."
                        className="pr-12 rounded-full"
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                    />
                    <Button
                        size="icon"
                        className="absolute right-1 top-1 h-8 w-8 rounded-full"
                        onClick={handleSend}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

function SummaryView({ cards, onHome }: { cards: Flashcard[], onHome: () => void }) {
    return (
        <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center">
            <div className="mb-6 bg-green-100 p-6 rounded-full">
                <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">ยินดีด้วย! คุณเก่งมาก</h1>
            <p className="text-slate-500 mb-8 max-w-md">
                คุณได้ฝึกฝนครบทุกขั้นตอนแล้ว ทั้งการเรียนรู้ การทดสอบ และการนำไปใช้จริง
            </p>

            <Card className="w-full max-w-md mb-8">
                <CardHeader>
                    <CardTitle className="text-lg">ประโยคที่เรียนรู้</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-left">
                    {cards.map((c, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <div>
                                <div className="font-medium">{c.front}</div>
                                <div className="text-xs text-slate-500">{c.back}</div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Button onClick={onHome} className="w-full max-w-xs rounded-full h-12 text-lg">
                กลับสู่หน้าหลัก
            </Button>
        </div>
    );
}
