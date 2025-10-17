import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSubDecks } from '@/hooks/useSubDecks';
import { SubDeckCard } from '@/components/SubDeckCard';
import { Skeleton } from '@/components/ui/skeleton';
import BackgroundDecorations from '@/components/BackgroundDecorations';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';

interface DeckInfo {
  name: string;
  name_en: string;
  description: string;
  description_en: string;
  total_flashcards: number;
}

export default function SubDecksPage() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const { subDecks, loading } = useSubDecks(deckId || '');
  const [deckInfo, setDeckInfo] = useState<DeckInfo | null>(null);
  const [deckProgress, setDeckProgress] = useState<number>(0);

  useEffect(() => {
    const fetchDeckInfo = async () => {
      if (!deckId) return;

      const { data: deck } = await supabase
        .from('decks')
        .select('name, name_en, description, description_en, total_flashcards')
        .eq('id', deckId)
        .single();

      if (deck) {
        setDeckInfo(deck);
      }

      // Fetch user progress
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: progress } = await supabase
          .from('user_deck_progress')
          .select('progress_percentage')
          .eq('user_id', user.id)
          .eq('deck_id', deckId)
          .single();

        if (progress) {
          setDeckProgress(progress.progress_percentage);
        }
      }
    };

    fetchDeckInfo();
  }, [deckId]);

  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundDecorations />
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/decks')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับไป Deck
          </Button>

          {deckInfo && (
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
                {deckInfo.name}
              </h1>
              <p className="text-xl text-muted-foreground mb-4">
                {deckInfo.name_en}
              </p>
              <p className="text-foreground/80 mb-6 max-w-2xl mx-auto">
                {deckInfo.description}
              </p>

              {deckProgress > 0 && (
                <div className="max-w-md mx-auto space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">ความคืบหน้าทั้งหมด</span>
                    <span className="font-medium text-primary">{deckProgress}%</span>
                  </div>
                  <Progress value={deckProgress} />
                </div>
              )}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[300px]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subDecks.map((subdeck) => (
                <SubDeckCard key={subdeck.id} subdeck={subdeck} />
              ))}
            </div>
          )}

          {!loading && subDecks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">ยังไม่มี Sub-deck</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
