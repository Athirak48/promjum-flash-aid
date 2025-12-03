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

  // Mock flashcards data for fallback
  const getMockFlashcards = (): Array<{ id: string; front: string; back: string; upload_id?: string }> => [
    { id: 'mock-1', front: 'Hello', back: 'สวัสดี' },
    { id: 'mock-2', front: 'Thank you', back: 'ขอบคุณ' },
    { id: 'mock-3', front: 'Goodbye', back: 'ลาก่อน' },
    { id: 'mock-4', front: 'Good morning', back: 'สวัสดีตอนเช้า' },
    { id: 'mock-5', front: 'How are you?', back: 'สบายดีไหม' },
    { id: 'mock-6', front: 'I am fine', back: 'ฉันสบายดี' },
    { id: 'mock-7', front: 'Please', back: 'กรุณา' },
    { id: 'mock-8', front: 'Excuse me', back: 'ขอโทษ' },
    { id: 'mock-9', front: 'Yes', back: 'ใช่' },
    { id: 'mock-10', front: 'No', back: 'ไม่' },
    { id: 'mock-11', front: 'Water', back: 'น้ำ' },
    { id: 'mock-12', front: 'Food', back: 'อาหาร' },
  ];

  // Get 12 cards: prioritize cards due for review, then random from same folder
  const getReviewCards = async () => {
    try {
      let reviewCards: Array<{ id: string; front: string; back: string; upload_id?: string }> = [];

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

      if (targetUploadId && existingIds.length > 0) {
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

      // If still not enough, fill with any random flashcards from DB
      if (reviewCards.length < 12) {
        const stillNeeded = 12 - reviewCards.length;
        const allExistingIds = reviewCards.map(c => c.id);

        let query = supabase
          .from('flashcards')
          .select('id, front_text, back_text')
          .limit(stillNeeded);

        if (allExistingIds.length > 0) {
          query = query.not('id', 'in', `(${allExistingIds.join(',')})`);
        }

        const { data: randomCards } = await query;

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

      // If still no cards after all attempts, use mock data
      if (reviewCards.length === 0) {
        console.log('No flashcards found in database, using mock data');
        return getMockFlashcards();
      }

      // If less than 12 cards, fill with mock data
      if (reviewCards.length < 12) {
        const mockCards = getMockFlashcards();
        const needed = 12 - reviewCards.length;
        reviewCards = [...reviewCards, ...mockCards.slice(0, needed)];
      }

      return reviewCards;
    } catch (error) {
      console.error('Error getting review cards:', error);
      // Use mock data on error
      return getMockFlashcards();
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

  return (
    <Card className="bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 h-full p-2">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Flame className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400">
              ความก้าวหน้าต่อเนื่อง
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              สถิติการเรียนของคุณวันนี้
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* Streak */}
          <div className="bg-[#FFE5D9] dark:bg-orange-900/20 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 min-h-[120px]">
            <Flame className="w-6 h-6 text-[#FF5722]" />
            <div className="text-3xl font-bold text-slate-800 dark:text-slate-200">{streak}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">วันติดต่อกัน</div>
          </div>

          {/* Total XP */}
          <div className="bg-[#FFF4DE] dark:bg-yellow-900/20 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 min-h-[120px]">
            <Star className="w-6 h-6 text-[#FFC107]" />
            <div className="text-3xl font-bold text-slate-800 dark:text-slate-200">{totalXP.toLocaleString()}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">XP ทั้งหมด</div>
          </div>

          {/* Words Today */}
          <div className="bg-[#E8DEF8] dark:bg-purple-900/20 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 min-h-[120px]">
            <BookOpen className="w-6 h-6 text-[#9C27B0]" />
            <div className="text-3xl font-bold text-slate-800 dark:text-slate-200">{wordsLearnedToday}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">คำวันนี้</div>
          </div>
        </div>

        {/* Review Button */}
        <Button
          onClick={() => setShowModeDialog(true)}
          className="w-full bg-[#A020F0] hover:bg-[#8e1cd6] text-white rounded-2xl h-14 text-lg font-bold shadow-md hover:shadow-lg transition-all"
        >
          <Play className="w-5 h-5 mr-2 fill-current" />
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
    </Card>
  );
}