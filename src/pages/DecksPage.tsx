import { useDecks } from '@/hooks/useDecks';
import { DeckCard } from '@/components/DeckCard';
import { Skeleton } from '@/components/ui/skeleton';
import BackgroundDecorations from '@/components/BackgroundDecorations';
import Navbar from '@/components/Navbar';

export default function DecksPage() {
  const { decks, loading } = useDecks();

  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundDecorations />
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Deck ของฉัน
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              เลือกหมวดที่คุณสนใจเพื่อเริ่มเรียนคำศัพท์และประโยคใหม่
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-[280px]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {decks.map((deck) => (
                <DeckCard key={deck.id} deck={deck} />
              ))}
            </div>
          )}

          {!loading && decks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">ยังไม่มี Deck</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
