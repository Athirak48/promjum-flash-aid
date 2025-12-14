import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
      <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group h-full flex flex-col bg-white dark:bg-slate-800 rounded-3xl border-0 shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between mb-3">
            {/* Cute Icon Circle */}
            <div className={`p-4 rounded-2xl shadow-md ${deck.icon === 'Home' ? 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40' :
                deck.icon === 'Plane' ? 'bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/40 dark:to-blue-900/40' :
                  deck.icon === 'Briefcase' ? 'bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/40 dark:to-violet-900/40' :
                    'bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/40 dark:to-rose-900/40'
              }`}>
              <IconComponent className={`w-7 h-7 ${deck.icon === 'Home' ? 'text-green-600' :
                  deck.icon === 'Plane' ? 'text-cyan-600' :
                    deck.icon === 'Briefcase' ? 'text-purple-600' :
                      'text-pink-600'
                }`} />
            </div>
            {/* Premium/Free Badge */}
            {deck.is_premium ? (
              <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-0 shadow-md font-bold gap-1 px-3 py-1 rounded-full">
                <Star className="w-3 h-3 fill-current" />
                Premium
              </Badge>
            ) : (
              <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 shadow-md font-bold px-3 py-1 rounded-full">
                Free
              </Badge>
            )}
          </div>
          <CardTitle className="text-xl font-black text-slate-800 dark:text-white mb-1">{deck.name}</CardTitle>
          <CardDescription className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {deck.name_en}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 flex-1 flex flex-col pt-0">
          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{deck.description}</p>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="font-medium">{deck.total_flashcards} {customLabel || 'คำศัพท์'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <Star className="w-4 h-4 text-amber-500" />
              <span className="font-medium">{subDecks.length} Sub-decks</span>
            </div>
          </div>

          {deck.progress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">ความคืบหน้า</span>
                <span className="font-bold text-primary">{deck.progress.progress_percentage}%</span>
              </div>
              <Progress value={deck.progress.progress_percentage} className="h-2" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mt-auto pt-4">
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setShowDownloadDialog(true);
              }}
              className="gap-2 rounded-xl border-2 hover:bg-slate-50 dark:hover:bg-slate-700"
              disabled={subDecksLoading || subDecks.length === 0}
            >
              <Download className="w-4 h-4" />
              ดาวน์โหลด
            </Button>
            <Button
              onClick={() => navigate(`/decks/${deck.id}/subdecks`)}
              className="gap-2 rounded-xl bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-400 text-white font-bold shadow-md"
            >
              เข้า Deck →
            </Button>
          </div>
        </CardContent>
      </Card>

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
