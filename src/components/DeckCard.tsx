import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, Download, BookOpen } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Deck } from '@/hooks/useDecks';
import { useState } from 'react';
import { DownloadSelectionDialog } from './DownloadSelectionDialog';
import { useSubDecks, SubDeck } from '@/hooks/useSubDecks';

interface DeckCardProps {
  deck: Deck;
}

export function DeckCard({ deck, customSubDecks, customLabel }: DeckCardProps & { customSubDecks?: SubDeck[], customLabel?: string }) {
  const navigate = useNavigate();
  const IconComponent = (Icons as any)[deck.icon] || Icons.BookOpen;
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);

  // Use custom subdecks if provided, otherwise fetch them
  const hookResult = useSubDecks(deck.id);
  const subDecks = customSubDecks || hookResult.subDecks;
  const subDecksLoading = customSubDecks ? false : hookResult.loading;

  return (
    <>
      <div className="glass-card group h-full flex flex-col rounded-[2.5rem] border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all duration-300 relative overflow-visible bg-black/40">

        {/* Glow Effect on Hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem] pointer-events-none" />

        <div className="p-6 pb-3 relative z-10">
          <div className="flex items-start justify-between mb-3">
            {/* Cute Icon Circle - Glass Style */}
            <div className={`p-4 rounded-2xl border border-white/20 shadow-lg backdrop-blur-md ${deck.icon === 'Home' ? 'bg-green-500/20 text-green-400' :
              deck.icon === 'Plane' ? 'bg-cyan-500/20 text-cyan-400' :
                deck.icon === 'Briefcase' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-pink-500/20 text-pink-400'
              }`}>
              <IconComponent className="w-7 h-7 drop-shadow-md" />
            </div>

            {/* Premium/Free Badge */}
            {deck.is_premium ? (
              <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-0 shadow-[0_0_15px_rgba(251,191,36,0.5)] font-bold gap-1 px-3 py-1 rounded-full">
                <Star className="w-3 h-3 fill-current" />
                Premium
              </Badge>
            ) : (
              <Badge className="glass-card bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)] font-bold px-3 py-1 rounded-full">
                Free
              </Badge>
            )}
          </div>
          <h3 className="text-xl font-black text-white mb-1 drop-shadow-sm group-hover:text-primary transition-colors duration-300">{deck.name}</h3>
          <p className="text-sm text-white/50 font-medium">
            {deck.name_en}
          </p>
        </div>

        <div className="p-6 pt-0 space-y-4 flex-1 flex flex-col relative z-10">
          <p className="text-sm text-white/70 line-clamp-2 leading-relaxed font-light">{deck.description}</p>

          <div className="flex items-center gap-4 text-sm mt-2">
            <div className="flex items-center gap-1.5 text-white/60 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-medium">{deck.total_flashcards} {customLabel || 'คำศัพท์'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/60 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              <Star className="w-3.5 h-3.5 text-yellow-400" />
              <span className="font-medium">{subDecks.length} Sub-decks</span>
            </div>
          </div>

          {deck.progress && (
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-white/40">ความคืบหน้า</span>
                <span className="text-primary-foreground drop-shadow-sm">{deck.progress.progress_percentage}%</span>
              </div>
              <Progress value={deck.progress.progress_percentage} className="h-1.5 bg-white/10" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mt-auto pt-6">
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setShowDownloadDialog(true);
              }}
              className="gap-2 rounded-xl bg-transparent border-white/20 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/40 h-11"
              disabled={subDecksLoading || subDecks.length === 0}
            >
              <Download className="w-4 h-4" />
              ดาวน์โหลด
            </Button>
            <Button
              onClick={() => navigate(`/decks/${deck.id}/subdecks`)}
              className="gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold shadow-[0_4px_15px_rgba(168,85,247,0.4)] border-none h-11 relative overflow-hidden group/btn"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
              <span className="relative z-10 flex items-center gap-2">
                เข้า Deck <span className="text-lg leading-none">→</span>
              </span>
            </Button>
          </div>
        </div>
      </div>

      <DownloadSelectionDialog
        open={showDownloadDialog}
        onOpenChange={setShowDownloadDialog}
        subdecks={subDecks.map(sd => ({
          id: sd.id,
          name: sd.name,
          name_en: sd.name_en,
          flashcard_count: sd.flashcard_count,
          difficulty_level: sd.difficulty_level,
          is_free: sd.is_free
        }))}
        deckName={deck.name}
      />
    </>
  );
}
