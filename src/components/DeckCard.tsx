import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Lock, Star } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Deck } from '@/hooks/useDecks';

interface DeckCardProps {
  deck: Deck;
}

export function DeckCard({ deck }: DeckCardProps) {
  const navigate = useNavigate();
  const IconComponent = (Icons as any)[deck.icon] || Icons.BookOpen;

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <IconComponent className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{deck.name}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {deck.name_en}
              </CardDescription>
            </div>
          </div>
          {deck.is_premium && (
            <Badge variant="secondary" className="gap-1">
              <Star className="w-3 h-3" />
              Premium
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-foreground/80">{deck.description}</p>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{deck.total_flashcards} คำศัพท์</span>
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

        <Button 
          className="w-full"
          onClick={() => navigate(`/decks/${deck.id}`)}
          variant={deck.is_premium ? "outline" : "default"}
        >
          {deck.is_premium ? (
            <>
              <Lock className="w-4 h-4 mr-2" />
              ดู Deck
            </>
          ) : (
            'เข้า Deck'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
