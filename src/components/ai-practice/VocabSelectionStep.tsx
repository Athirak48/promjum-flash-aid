import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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

export default function VocabSelectionStep({ onNext }: VocabSelectionStepProps) {
  const { toast } = useToast();
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [selectedDeck, setSelectedDeck] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVocab, setSelectedVocab] = useState<string[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [sets, setSets] = useState<any[]>([]);
  const [vocab, setVocab] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFolders();
  }, []);

  useEffect(() => {
    if (selectedFolder) {
      fetchSets(selectedFolder);
    }
  }, [selectedFolder]);

  useEffect(() => {
    if (selectedDeck) {
      fetchVocab(selectedDeck);
    }
  }, [selectedDeck]);

  const fetchFolders = async () => {
    try {
      const { data, error } = await supabase
        .from('user_folders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFolders(data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลด folder ได้',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSets = async (folderId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_flashcard_sets')
        .select('*')
        .eq('folder_id', folderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSets(data || []);
    } catch (error) {
      console.error('Error fetching sets:', error);
    }
  };

  const fetchVocab = async (setId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_flashcards')
        .select('*')
        .eq('flashcard_set_id', setId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVocab(data || []);
    } catch (error) {
      console.error('Error fetching vocab:', error);
    }
  };

  const handleVocabToggle = (vocabFront: string) => {
    if (selectedVocab.includes(vocabFront)) {
      setSelectedVocab(selectedVocab.filter(v => v !== vocabFront));
    } else if (selectedVocab.length < 10) {
      setSelectedVocab([...selectedVocab, vocabFront]);
    }
  };

  const handleRecommended = () => {
    // Select first 10 vocab
    const recommended = vocab.slice(0, 10).map(v => v.front_text);
    setSelectedVocab(recommended);
  };

  const handleTodayReview = () => {
    // Select random 10 vocab
    const shuffled = [...vocab].sort(() => Math.random() - 0.5);
    const todayReview = shuffled.slice(0, 10).map(v => v.front_text);
    setSelectedVocab(todayReview);
  };

  const filteredVocab = vocab.filter(v =>
    v.front_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.back_text.includes(searchTerm)
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
                    {folders.map(folder => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.title}
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
                    {sets.map(set => (
                      <SelectItem key={set.id} value={set.id}>
                        {set.title}
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
                {loading ? (
                  <p className="text-center text-muted-foreground py-8">กำลังโหลด...</p>
                ) : filteredVocab.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {selectedDeck ? 'ไม่พบคำศัพท์' : 'กรุณาเลือก Folder และ Deck'}
                  </p>
                ) : (
                  filteredVocab.map((vocabItem, index) => {
                    const isSelected = selectedVocab.includes(vocabItem.front_text);
                    return (
                      <Card
                        key={index}
                        className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                          isSelected ? 'border-primary bg-primary/5' : ''
                        }`}
                        onClick={() => handleVocabToggle(vocabItem.front_text)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{vocabItem.front_text}</div>
                            <div className="text-sm text-muted-foreground">{vocabItem.back_text}</div>
                          </div>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-primary" />}
                        </div>
                      </Card>
                    );
                  })
                )}
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
