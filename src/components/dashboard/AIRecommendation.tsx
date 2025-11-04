import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Sparkles, TrendingUp, Clock } from 'lucide-react';
import { useDecks } from '@/hooks/useDecks';
import * as Icons from 'lucide-react';

export function AIRecommendation() {
  const navigate = useNavigate();
  const { decks } = useDecks();

  // Simple AI logic: recommend decks that are started but not completed
  const recommendations = decks
    .filter(d => d.progress && d.progress.progress_percentage > 0 && d.progress.progress_percentage < 100)
    .slice(0, 3);

  // If no in-progress decks, recommend new decks
  const finalRecommendations = recommendations.length > 0 
    ? recommendations 
    : decks.filter(d => !d.progress || d.progress.progress_percentage === 0).slice(0, 3);

  if (finalRecommendations.length === 0) return null;

  return (
    <Card className="bg-gradient-card backdrop-blur-sm shadow-soft border border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          AI แนะนำสำหรับคุณ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {finalRecommendations.map((deck) => {
          const IconComponent = (Icons as any)[deck.icon] || Icons.BookOpen;
          const isInProgress = deck.progress && deck.progress.progress_percentage > 0;
          
          return (
            <div 
              key={deck.id}
              className="p-4 rounded-lg border border-border/50 bg-background/50 hover:bg-muted/30 transition-all cursor-pointer group"
              onClick={() => navigate(`/decks/${deck.id}`)}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <IconComponent className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground truncate">{deck.name}</h4>
                    {isInProgress && (
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        กำลังเรียน
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>📚 {deck.total_flashcards} คำ</span>
                    {deck.progress && (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {deck.progress.progress_percentage}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div className="pt-2">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate('/decks')}
          >
            ดู Deck ทั้งหมด
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
