import { useDecks } from '@/hooks/useDecks';
import { DeckCard } from '@/components/DeckCard';
import { Skeleton } from '@/components/ui/skeleton';
import BackgroundDecorations from '@/components/BackgroundDecorations';
import Navbar from '@/components/Navbar';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState, useMemo } from 'react';

export default function DecksPage() {
  const { decks, loading } = useDecks();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDecks = useMemo(() => {
    if (!searchTerm) return decks;
    
    const search = searchTerm.toLowerCase();
    return decks.filter(deck => 
      deck.name.toLowerCase().includes(search) ||
      deck.name_en.toLowerCase().includes(search) ||
      deck.description.toLowerCase().includes(search)
    );
  }, [decks, searchTerm]);

  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundDecorations />
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Deck ของฉัน
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              เลือกหมวดที่คุณสนใจเพื่อเริ่มเรียนคำศัพท์และประโยคใหม่
            </p>
            
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
        </div>
      </main>
    </div>
  );
}
