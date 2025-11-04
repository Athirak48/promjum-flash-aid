import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { Play, BookOpen } from 'lucide-react';
import { useDecks } from '@/hooks/useDecks';
import * as Icons from 'lucide-react';

export function DailyDeckQuickStart() {
  const navigate = useNavigate();
  const { decks, loading } = useDecks();

  // Get today's recommended deck (first deck with progress < 100% or first deck)
  const todayDeck = decks.find(d => d.progress && d.progress.progress_percentage < 100) || decks[0];

  if (loading || !todayDeck) {
    return (
      <Card className="bg-gradient-card backdrop-blur-sm shadow-soft border border-border/50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const IconComponent = (Icons as any)[todayDeck.icon] || BookOpen;
  const completedCards = todayDeck.progress 
    ? Math.floor((todayDeck.progress.progress_percentage / 100) * todayDeck.total_flashcards)
    : 0;
  const remaining = todayDeck.total_flashcards - completedCards;

  return (
    <Card className="bg-gradient-primary/10 backdrop-blur-sm shadow-glow border border-primary/30 hover:shadow-large transition-all">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-3 rounded-xl bg-primary/20 shadow-soft">
            <IconComponent className="w-8 h-8 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Deck วันนี้
            </div>
            <div className="text-sm text-muted-foreground font-normal mt-1">
              เริ่มฝึกได้ทันที
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-foreground">{todayDeck.name}</h3>
            <span className="text-sm text-muted-foreground">{todayDeck.name_en}</span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>📚 {todayDeck.total_flashcards} คำทั้งหมด</span>
            {todayDeck.progress && (
              <span>✅ เหลือ {remaining} คำ</span>
            )}
          </div>
        </div>

        {todayDeck.progress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ความคืบหน้า</span>
              <span className="font-bold text-primary">{todayDeck.progress.progress_percentage}%</span>
            </div>
            <Progress value={todayDeck.progress.progress_percentage} className="h-3" />
          </div>
        )}

        <Button 
          onClick={() => navigate(`/decks/${todayDeck.id}`)}
          className="w-full bg-gradient-primary hover:shadow-glow transition-all text-lg py-6"
          size="lg"
        >
          <Play className="w-5 h-5 mr-2" />
          เริ่มฝึกเลย
        </Button>
      </CardContent>
    </Card>
  );
}
