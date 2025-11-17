import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, CheckCircle2, Folder, BookOpen } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VocabSelectionStepProps {
  onNext: (selectedVocab: string[]) => void;
}

// Mock data
const mockFolders = [
  { id: '1', name: 'Business English' },
  { id: '2', name: 'Travel Phrases' },
  { id: '3', name: 'Daily Conversation' },
];

const mockDecks = {
  '1': [
    { id: 'd1', name: 'Meeting Vocabulary' },
    { id: 'd2', name: 'Email Writing' },
  ],
  '2': [
    { id: 'd3', name: 'Airport & Hotel' },
    { id: 'd4', name: 'Ordering Food' },
  ],
  '3': [
    { id: 'd5', name: 'Greetings' },
    { id: 'd6', name: 'Shopping' },
  ],
};

const mockVocab = [
  { front: 'schedule', back: 'กำหนดการ' },
  { front: 'deadline', back: 'กำหนดเวลา' },
  { front: 'meeting', back: 'การประชุม' },
  { front: 'presentation', back: 'การนำเสนอ' },
  { front: 'colleague', back: 'เพื่อนร่วมงาน' },
  { front: 'project', back: 'โครงการ' },
  { front: 'budget', back: 'งบประมาณ' },
  { front: 'report', back: 'รายงาน' },
  { front: 'approve', back: 'อนุมัติ' },
  { front: 'revise', back: 'แก้ไข' },
  { front: 'confirm', back: 'ยืนยัน' },
  { front: 'postpone', back: 'เลื่อน' },
  { front: 'urgent', back: 'เร่งด่วน' },
  { front: 'priority', back: 'ความสำคัญ' },
  { front: 'forward', back: 'ส่งต่อ' },
];

export default function VocabSelectionStep({ onNext }: VocabSelectionStepProps) {
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [selectedDeck, setSelectedDeck] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVocab, setSelectedVocab] = useState<string[]>([]);

  const handleVocabToggle = (vocab: string) => {
    if (selectedVocab.includes(vocab)) {
      setSelectedVocab(selectedVocab.filter(v => v !== vocab));
    } else if (selectedVocab.length < 10) {
      setSelectedVocab([...selectedVocab, vocab]);
    }
  };

  const handleRecommended = () => {
    // Mock: Select 10 recommended vocab
    const recommended = mockVocab.slice(0, 10).map(v => v.front);
    setSelectedVocab(recommended);
  };

  const handleTodayReview = () => {
    // Mock: Select 10 today's review vocab
    const todayReview = mockVocab.slice(2, 12).map(v => v.front);
    setSelectedVocab(todayReview);
  };

  const filteredVocab = mockVocab.filter(v =>
    v.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.back.includes(searchTerm)
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Choose vocab: เลือกคำศัพท์ 10 คำ</h2>
        <p className="text-muted-foreground">เลือกคำศัพท์ที่คุณต้องการทบทวน</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left: Selection Area */}
        <div className="md:col-span-2">
          <Card className="p-6">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 mb-6">
              <Button
                variant="outline"
                className="flex-1 min-w-[150px]"
                onClick={handleRecommended}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                แนะนำคำศัพท์
              </Button>
              <Button
                variant="outline"
                className="flex-1 min-w-[150px]"
                onClick={handleTodayReview}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                ทบทวนล่าสุด
              </Button>
            </div>

            {/* Folder & Deck Selection */}
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Folder className="w-4 h-4" />
                  เลือก Folder
                </label>
                <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือก Folder" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockFolders.map(folder => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  เลือกชุด Deck
                </label>
                <Select 
                  value={selectedDeck} 
                  onValueChange={setSelectedDeck}
                  disabled={!selectedFolder}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือก Deck" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedFolder && mockDecks[selectedFolder as keyof typeof mockDecks]?.map(deck => (
                      <SelectItem key={deck.id} value={deck.id}>
                        {deck.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search */}
            <Input
              placeholder="ค้นหาคำศัพท์..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4"
            />

            {/* Vocabulary List */}
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {filteredVocab.map((vocab, index) => {
                  const isSelected = selectedVocab.includes(vocab.front);
                  return (
                    <Card
                      key={index}
                      className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => handleVocabToggle(vocab.front)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{vocab.front}</div>
                          <div className="text-sm text-muted-foreground">{vocab.back}</div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-primary" />}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </Card>
        </div>

        {/* Right: Selected Vocab */}
        <div>
          <Card className="p-6 sticky top-24">
            <h3 className="font-semibold mb-4 flex items-center justify-between">
              คำที่เลือกแล้ว
              <Badge variant={selectedVocab.length === 10 ? "default" : "secondary"}>
                {selectedVocab.length}/10
              </Badge>
            </h3>

            <ScrollArea className="h-[400px] mb-4">
              <div className="space-y-2">
                {selectedVocab.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    ยังไม่ได้เลือกคำศัพท์
                  </p>
                ) : (
                  selectedVocab.map((vocab, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted rounded"
                    >
                      <span className="text-sm">{vocab}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVocabToggle(vocab)}
                      >
                        ×
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            <Button
              className="w-full"
              disabled={selectedVocab.length < 10}
              onClick={() => onNext(selectedVocab)}
            >
              ไปต่อ (ขั้นต่ำ 10 คำ)
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
