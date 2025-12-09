import { useDecks } from '@/hooks/useDecks';
import { DeckCard } from '@/components/DeckCard';
import { Skeleton } from '@/components/ui/skeleton';
import BackgroundDecorations from '@/components/BackgroundDecorations';

import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SubDeck } from '@/hooks/useSubDecks';
import { Deck } from '@/hooks/useDecks';

const SENTENCE_SUBDECKS: SubDeck[] = [
  {
    id: 'mock-sub-1', deck_id: 'mock-sentence-1', name: 'การทักทายและการแนะนำตัว', name_en: 'Greetings & Introductions',
    description: '', description_en: '', flashcard_count: 50, is_free: true, display_order: 1, difficulty_level: 'Beginner', created_at: new Date().toISOString()
  },
  {
    id: 'mock-sub-2', deck_id: 'mock-sentence-1', name: 'การซื้อของและร้านอาหาร', name_en: 'Shopping & Dining',
    description: '', description_en: '', flashcard_count: 50, is_free: true, display_order: 2, difficulty_level: 'Beginner', created_at: new Date().toISOString()
  },
  {
    id: 'mock-sub-3', deck_id: 'mock-sentence-1', name: 'การเดินทางและบอกทิศทาง', name_en: 'Travel & Directions',
    description: '', description_en: '', flashcard_count: 50, is_free: true, display_order: 3, difficulty_level: 'Beginner', created_at: new Date().toISOString()
  }
];

const SENTENCE_DECKS: Deck[] = [
  {
    id: 'mock-sentence-1',
    name: 'ชีวิตประจำวัน',
    name_en: 'Daily Life',
    description: 'ประโยคที่ใช้ในชีวิตประจำวัน',
    description_en: 'Common sentences for daily life',
    icon: 'Home',
    category: 'General',
    total_flashcards: 500,
    is_premium: false,
    created_at: new Date().toISOString(),
    progress: {
      progress_percentage: 0,
      last_accessed: new Date().toISOString()
    }
  }
];

export default function DecksPage() {
  const { decks, loading } = useDecks();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('view') || 'vocab';

  const handleTabChange = (value: string) => {
    setSearchParams({ view: value });
  };

  const filteredDecks = useMemo(() => {
    if (!searchTerm) return decks;

    const search = searchTerm.toLowerCase();

    // Vocab tab: just filter by name since we are showing all decks here
    // (Sentence tab shows blank page, so no need to complex filter for 'sentence' vs 'vocab' data logic for now)

    return decks.filter(deck =>
      deck.name.toLowerCase().includes(search) ||
      deck.name_en.toLowerCase().includes(search) ||
      deck.description.toLowerCase().includes(search)
    );
  }, [decks, searchTerm]);

  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundDecorations />

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Deck ของฉัน
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              เลือกหมวดที่คุณสนใจเพื่อเริ่มเรียนคำศัพท์และประโยคใหม่
            </p>

            {/* Tabs for switching between Vocab and Sentences */}
            <div className="flex justify-center mb-8">
              <Tabs defaultValue="vocab" value={activeTab} onValueChange={handleTabChange} className="w-[400px]">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="vocab">คำศัพท์</TabsTrigger>
                  <TabsTrigger value="sentence">ประโยค</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="ค้นหา Deck ตามชื่อหรือหมวดหมู่..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
          </div>

          {activeTab === 'vocab' ? (
            <>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-[400px]" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDecks.map((deck) => (
                    <DeckCard key={deck.id} deck={deck} />
                  ))}
                </div>
              )}

              {!loading && filteredDecks.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    {searchTerm ? 'ไม่พบ Deck ที่ค้นหา' : 'ยังไม่มี Deck'}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SENTENCE_DECKS.map((deck) => (
                <DeckCard
                  key={deck.id}
                  deck={deck}
                  customSubDecks={SENTENCE_SUBDECKS}
                  customLabel="ประโยค"
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
