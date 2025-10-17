import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Lock, CheckCircle2, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SubDeck } from '@/hooks/useSubDecks';

interface SubDeckCardProps {
  subdeck: SubDeck;
}

export function SubDeckCard({ subdeck }: SubDeckCardProps) {
  const navigate = useNavigate();

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500/10 text-green-500';
      case 'intermediate': return 'bg-yellow-500/10 text-yellow-500';
      case 'advanced': return 'bg-red-500/10 text-red-500';
      default: return 'bg-muted';
    }
  };

  const getDifficultyText = (level: string) => {
    switch (level) {
      case 'beginner': return 'เริ่มต้น';
      case 'intermediate': return 'กลาง';
      case 'advanced': return 'ขั้นสูง';
      default: return level;
    }
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow ${subdeck.is_free ? 'border-primary/50' : 'border-muted'}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{subdeck.name}</CardTitle>
              {subdeck.progress?.is_completed && (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              )}
            </div>
            <CardDescription className="text-sm">
              {subdeck.name_en}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2 items-end">
            {!subdeck.is_free && (
              <Badge variant="secondary" className="gap-1">
                <Lock className="w-3 h-3" />
                Locked
              </Badge>
            )}
            <Badge className={getDifficultyColor(subdeck.difficulty_level)}>
              {getDifficultyText(subdeck.difficulty_level)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-foreground/80">{subdeck.description}</p>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="w-4 h-4" />
          <span>{subdeck.flashcard_count} คำศัพท์</span>
        </div>

        {subdeck.progress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">เรียนไปแล้ว</span>
              <span className="font-medium text-primary">
                {subdeck.progress.cards_learned}/{subdeck.flashcard_count} คำ
              </span>
            </div>
            <Progress 
              value={(subdeck.progress.cards_learned / subdeck.flashcard_count) * 100} 
            />
          </div>
        )}

        {subdeck.is_free ? (
          <Button 
            className="w-full"
            onClick={() => navigate(`/subdecks/${subdeck.id}/learn`)}
          >
            เริ่มเรียน
          </Button>
        ) : (
          <Button 
            className="w-full"
            variant="outline"
            onClick={() => navigate('/pricing')}
          >
            <Lock className="w-4 h-4 mr-2" />
            ปลดล็อค
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
