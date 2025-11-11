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
import { useSubDecks } from '@/hooks/useSubDecks';

interface DeckCardProps {
  deck: Deck;
}

export function DeckCard({ deck }: DeckCardProps) {
  const navigate = useNavigate();
  const IconComponent = (Icons as any)[deck.icon] || Icons.BookOpen;
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const { subDecks, loading: subDecksLoading } = useSubDecks(deck.id);

  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group h-full flex flex-col">
        <CardHeader>
          <div className="flex items-start justify-between mb-4">
            <div className="p-4 rounded-xl bg-gradient-primary shadow-soft">
              <IconComponent className="w-8 h-8 text-primary-foreground" />
            </div>
            {deck.is_premium && (
              <Badge variant="secondary" className="gap-1">
                <Star className="w-3 h-3 fill-current" />
                Premium
              </Badge>
            )}
          </div>
          <CardTitle className="text-2xl mb-2">{deck.name}</CardTitle>
          <CardDescription className="text-base">
            {deck.name_en}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 flex-1 flex flex-col">
          <p className="text-sm text-foreground/80 line-clamp-2">{deck.description}</p>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 rounded-lg p-2">
              <BookOpen className="w-4 h-4" />
              <span>{deck.total_flashcards} คำศัพท์</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 rounded-lg p-2">
              <Star className="w-4 h-4" />
              <span>{subDecks.length} Sub-decks</span>
            </div>
          </div>

          {deck.progress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ความคืบหน้า</span>
                <span className="font-medium text-primary">{deck.progress.progress_percentage}%</span>
              </div>
              <Progress value={deck.progress.progress_percentage} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 mt-auto pt-4">
            <Button 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setShowDownloadDialog(true);
              }}
              className="gap-2"
              disabled={subDecksLoading || subDecks.length === 0}
            >
              <Download className="w-4 h-4" />
              ดาวน์โหลด
            </Button>
            <Button 
              onClick={() => navigate(`/decks/${deck.id}/subdecks`)}
              variant="default"
            >
              เข้า Deck
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
