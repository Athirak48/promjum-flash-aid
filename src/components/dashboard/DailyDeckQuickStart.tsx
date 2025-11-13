import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { Flame, Star, BookOpen, Play, Brain, GamepadIcon } from 'lucide-react';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { GameSelectionDialog } from '@/components/GameSelectionDialog';
interface DailyDeckQuickStartProps {
  streak?: number;
  totalXP?: number;
  wordsLearnedToday?: number;
}
export function DailyDeckQuickStart({
  streak = 0,
  totalXP = 0,
  wordsLearnedToday = 0
}: DailyDeckQuickStartProps) {
  const navigate = useNavigate();
  const [showModeDialog, setShowModeDialog] = useState(false);
  const [showGameSelection, setShowGameSelection] = useState(false);
  const { flashcards } = useFlashcards();
  const { toast } = useToast();

  // Get 12 cards: prioritize cards due for review, then random from same folder
  const getReviewCards = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get cards that are due for review (next_review_date <= now)
      const { data: dueCards } = await supabase
        .from('user_flashcard_progress')
        .select(`
          flashcard_id,
          flashcards:flashcard_id (
            id,
            front_text,
            back_text,
            upload_id
          )
        `)
        .eq('user_id', user.id)
        .lte('next_review_date', new Date().toISOString())
        .order('next_review_date', { ascending: true })
        .limit(12);

      let reviewCards = (dueCards || [])
        .filter(item => item.flashcards)
        .map(item => ({
          id: item.flashcards.id,
          front: item.flashcards.front_text,
          back: item.flashcards.back_text,
          upload_id: item.flashcards.upload_id,
        }));

      // If we have 12 or more cards, return the first 12
      if (reviewCards.length >= 12) {
        return reviewCards.slice(0, 12);
      }

      // Need more cards - find the most common upload_id from existing cards
      const uploadIdCounts = reviewCards.reduce((acc, card) => {
        if (card.upload_id) {
          acc[card.upload_id] = (acc[card.upload_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      let targetUploadId = null;
      if (Object.keys(uploadIdCounts).length > 0) {
        // Get the upload_id with most cards
        targetUploadId = Object.entries(uploadIdCounts)
          .sort(([, a], [, b]) => b - a)[0][0];
      } else if (reviewCards.length > 0 && reviewCards[0].upload_id) {
        // If no upload_id counts, use the first card's upload_id
        targetUploadId = reviewCards[0].upload_id;
      }

      // Fill remaining cards from the same folder
      const neededCards = 12 - reviewCards.length;
      const existingIds = reviewCards.map(c => c.id);

      if (targetUploadId) {
        const { data: folderCards } = await supabase
          .from('flashcards')
          .select('id, front_text, back_text, upload_id')
          .eq('upload_id', targetUploadId)
          .not('id', 'in', `(${existingIds.join(',')})`)
          .limit(neededCards);

        if (folderCards && folderCards.length > 0) {
          reviewCards = [
            ...reviewCards,
            ...folderCards.map(c => ({
              id: c.id,
              front: c.front_text,
              back: c.back_text,
              upload_id: c.upload_id || undefined,
            }))
          ];
        }
      }

      // If still not enough, fill with random cards
      if (reviewCards.length < 12) {
        const stillNeeded = 12 - reviewCards.length;
        const allExistingIds = reviewCards.map(c => c.id);
        
        const { data: randomCards } = await supabase
          .from('flashcards')
          .select('id, front_text, back_text')
          .not('id', 'in', `(${allExistingIds.join(',')})`)
          .limit(stillNeeded);

        if (randomCards && randomCards.length > 0) {
          reviewCards = [
            ...reviewCards,
            ...randomCards.map(c => ({
              id: c.id,
              front: c.front_text,
              back: c.back_text,
              upload_id: undefined,
            }))
          ];
        }
      }

      return reviewCards;
    } catch (error) {
      console.error('Error getting review cards:', error);
      // Fallback to first 12 cards
      return flashcards.slice(0, 12).map(card => ({
        id: card.id,
        front: card.front_text,
        back: card.back_text,
      }));
    }
  };

  const handleModeSelect = async (mode: 'review' | 'game') => {
    setShowModeDialog(false);
    
    // Get cards for review/game
    const cards = await getReviewCards();
    
    if (cards.length === 0) {
      toast({
        title: "ไม่มีคำศัพท์",
        description: "กรุณาเพิ่มคำศัพท์หรือตั้งเวลาทบทวนก่อน",
        variant: "destructive"
      });
      return;
    }
    
    // Navigate to fullpage review with cards data
    navigate('/flashcards-review', {
      state: {
        mode,
        cards,
        isQuickReview: true
      }
    });
  };

  const handleGameSelect = async (gameType: 'quiz' | 'matching' | 'listen') => {
    setShowGameSelection(false);
    
    // Get cards for game
    const cards = await getReviewCards();
    
    if (cards.length === 0) {
      toast({
        title: "ไม่มีคำศัพท์",
        description: "กรุณาเพิ่มคำศัพท์หรือตั้งเวลาทบทวนก่อน",
        variant: "destructive"
      });
      return;
    }
    
    // Navigate to fullpage review with game mode
    navigate('/flashcards-review', {
      state: {
        mode: 'game',
        gameType,
        cards,
        isQuickReview: true
      }
    });
  };
  return <Card className="bg-gradient-primary/10 backdrop-blur-sm shadow-glow border border-primary/30 hover:shadow-large transition-all h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-3 rounded-xl bg-primary/20 shadow-soft">
            <Flame className="w-8 h-8 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              ความก้าวหน้าต่อเนื่อง
            </div>
            <div className="text-sm text-muted-foreground font-normal mt-1">
              สถิติการเรียนของคุณวันนี้
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* Streak */}
          <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-500/30">
            <div className="flex flex-col items-center gap-2">
              <Flame className="w-8 h-8 text-orange-500" />
              <div className="text-3xl font-bold text-foreground">{streak}</div>
              <div className="text-xs text-muted-foreground text-center">วันติดต่อกัน</div>
            </div>
          </div>

          {/* Total XP */}
          <div className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-xl p-4 border border-yellow-500/30">
            <div className="flex flex-col items-center gap-2">
              <Star className="w-8 h-8 text-yellow-500" />
              <div className="text-3xl font-bold text-foreground">{totalXP.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground text-center">XP ทั้งหมด</div>
            </div>
          </div>

          {/* Words Today */}
          <div className="bg-gradient-to-br from-primary/20 to-primary/30 rounded-xl p-4 border border-primary/40">
            <div className="flex flex-col items-center gap-2">
              <BookOpen className="w-8 h-8 text-primary" />
              <div className="text-3xl font-bold text-foreground">{wordsLearnedToday}</div>
              <div className="text-xs text-muted-foreground text-center">คำวันนี้</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        

        {/* Review Button */}
        <Button 
          onClick={() => setShowModeDialog(true)} 
          className="w-full bg-gradient-primary hover:shadow-glow transition-all text-lg py-6" 
          size="lg"
        >
          <Play className="w-5 h-5 mr-2" />
          ทบทวนทันที
        </Button>

        {/* Mode Selection Dialog */}
        <Dialog open={showModeDialog} onOpenChange={setShowModeDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center mb-2">
                🎯 เลือกโหมดการเรียนรู้
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 py-6">
              {/* Review Mode */}
              <Card 
                className="cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-large border-2 hover:border-primary group"
                onClick={() => handleModeSelect('review')}
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all">
                    <Brain className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">ทบทวน</h3>
                    <p className="text-sm text-muted-foreground">
                      ทบทวนคำศัพท์แบบพลิกการ์ด
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Game Mode */}
              <Card 
                className="cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-large border-2 hover:border-primary group"
                onClick={() => handleModeSelect('game')}
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-pink-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center group-hover:from-pink-500/30 group-hover:to-orange-500/30 transition-all">
                    <GamepadIcon className="h-10 w-10 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">เล่นเกม</h3>
                    <p className="text-sm text-muted-foreground">
                      เรียนรู้ผ่านเกมสนุกๆ
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>

        {/* Game Selection Dialog */}
        <GameSelectionDialog
          open={showGameSelection}
          onOpenChange={setShowGameSelection}
          onSelectGame={handleGameSelect}
        />
      </CardContent>
    </Card>;
}