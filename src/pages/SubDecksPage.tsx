import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSubDecks } from '@/hooks/useSubDecks';
import { SubDeckCard } from '@/components/SubDeckCard';
import { Skeleton } from '@/components/ui/skeleton';

import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight, Home } from 'lucide-react';
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

  // Determine which subdecks to display
  const displaySubDecks = subDecks;
  const isLoading = loading;

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
    <div className="min-h-screen bg-transparent relative overflow-hidden">

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb Navigation - Glass Style */}
          <div className="flex items-center gap-2 text-sm text-white/50 mb-8 p-2 rounded-xl bg-white/5 backdrop-blur-sm shadow-sm inline-flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="h-8 gap-1 hover:text-white hover:bg-white/10"
            >
              <Home className="w-4 h-4" />
              หน้าแรก
            </Button>
            <ChevronRight className="w-4 h-4" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/decks')}
              className="h-8 hover:text-white hover:bg-white/10"
            >
              Deck ทั้งหมด
            </Button>
            {deckInfo && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="font-medium text-white px-2 bg-primary/20 rounded-md py-0.5 border border-primary/30">{deckInfo.name}</span>
              </>
            )}
          </div>

          {deckInfo && (
            <div className="mb-10 text-center relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[100px] -z-10" />

              <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                {deckInfo.name}
              </h1>
              <p className="text-xl text-white/60 mb-6 font-medium tracking-wide">
                {deckInfo.name_en}
              </p>
              <p className="text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl">
                {deckInfo.description}
              </p>

              {deckProgress > 0 && (
                <div className="max-w-md mx-auto space-y-2 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">ความคืบหน้าทั้งหมด</span>
                    <span className="font-bold text-primary text-lg drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">{deckProgress}%</span>
                  </div>
                  <Progress value={deckProgress} className="h-3 bg-black/50" />
                </div>
              )}
            </div>
          )}

          {/* Vertical List of Subdecks */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[180px] bg-white/5 rounded-3xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {displaySubDecks.map((subdeck) => (
                <SubDeckCard key={subdeck.id} subdeck={subdeck as any} />
              ))}
            </div>
          )}

          {!isLoading && displaySubDecks.length === 0 && (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
              <p className="text-white/40 text-lg">ยังไม่มี Sub-deck ในขณะนี้</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
