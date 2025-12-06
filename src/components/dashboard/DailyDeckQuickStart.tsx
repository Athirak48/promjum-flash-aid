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
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';

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
  const { t } = useLanguage();

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

  // Get cards: prioritize scheduled review near now, then fallback to smart selection
  const getReviewCards = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return getMockFlashcards();

      // 1. Check for Scheduled Reviews TODAY
      const today = format(new Date(), 'yyyy-MM-dd');
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeVal = currentHour * 60 + currentMinute;

      const { data: scheduledReviews } = await supabase
        .from('scheduled_reviews')
        .select('*')
        .eq('user_id', user.id)
        .eq('scheduled_date', today);

      let targetReview = null;

      if (scheduledReviews && scheduledReviews.length > 0) {
        // Find the review closest to current time
        // Prioritize UPCOMING reviews (e.g. Now 12:00, Session 13:00 -> Pick 13:00)
        // If no upcoming, pick the latest past review.

        const sortedReviews = scheduledReviews.sort((a, b) => {
          return a.scheduled_time.localeCompare(b.scheduled_time);
        });

        const upcoming = sortedReviews.find(review => {
          const [h, m] = review.scheduled_time.split(':').map(Number);
          const reviewTimeVal = h * 60 + m;
          return reviewTimeVal >= currentTimeVal;
        });

        if (upcoming) {
          targetReview = upcoming;
        } else {
          // No upcoming, pick the last one (latest past)
          targetReview = sortedReviews[sortedReviews.length - 1];
        }

        console.log("Found scheduled review:", targetReview);
      }

      // 2. If scheduled review found, use its vocabulary
      if (targetReview && targetReview.vocabulary_ids && targetReview.vocabulary_ids.length > 0) {
        let textIds = targetReview.vocabulary_ids;
        let foundCards: any[] = [];

        // 2a. Try fetching from 'flashcards' (System)
        const { data: systemCards } = await supabase
          .from('flashcards')
          .select('id, front_text, back_text, upload_id')
          .in('id', textIds);

        if (systemCards) {
          foundCards = [...foundCards, ...systemCards];
          // Filter out IDs we already found
          const foundIds = new Set(systemCards.map(c => c.id));
          textIds = textIds.filter(id => !foundIds.has(id));
        }

        // 2b. If IDs remain, try fetching from 'user_flashcards' (User)
        if (textIds.length > 0) {
          const { data: userCards } = await supabase
            .from('user_flashcards')
            .select('id, front_text, back_text')
            .in('id', textIds);

          if (userCards) {
            foundCards = [...foundCards, ...userCards.map(c => ({
              ...c,
              upload_id: undefined // User cards don't have upload_id usually
            }))];
          }
        }

        if (foundCards.length > 0) {
          return foundCards.map(c => ({
            id: c.id,
            front: c.front_text,
            back: c.back_text,
            upload_id: c.upload_id
          }));
        }
      }

      // 3. Fallback: Existing "Smart Random" Logic
      console.log("No scheduled review or cards found, using fallback logic");

      let reviewCards: Array<{ id: string; front: string; back: string; upload_id?: string }> = [];

      // Need more cards - find the most common upload_id from existing cards
      // (Simplified: Fetch a batch of recent reviews to find common theme, or just random)
      // Since reviewCards is empty here, we start fresh.

      // Fetch some recent cards to establish a theme? Or specific query?
      // Let's stick to the original logic of filling up to 12.

      // Attempt 1: Get cards from a random upload_id (simulating 'current topic')
      // For now, let's just get purely random cards if we don't have a starting point

      const { data: randomStart } = await supabase
        .from('flashcards')
        .select('id, front_text, back_text, upload_id')
        .limit(12);

      if (randomStart && randomStart.length > 0) {
        return randomStart.map(c => ({
          id: c.id,
          front: c.front_text,
          back: c.back_text,
          upload_id: c.upload_id
        }));
      }

      // If still no cards, mock
      return getMockFlashcards();

    } catch (error) {
      console.error('Error getting review cards:', error);
      return getMockFlashcards();
    }
  };

  const handleModeSelect = async (mode: 'review' | 'game') => {
    setShowModeDialog(false);

    // Get cards for review/game
    const cards = await getReviewCards();

    if (cards.length === 0) {
      toast({
        title: t('dashboard.noCards'),
        description: t('dashboard.noCardsDesc'),
        variant: "destructive"
      });
      return;
    }

    // Navigate to fullpage review with cards data
    navigate('/flashcards/review', {
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
        title: t('dashboard.noCards'),
        description: t('dashboard.noCardsDesc'),
        variant: "destructive"
      });
      return;
    }

    // Navigate to fullpage review with game mode
    navigate('/flashcards/review', {
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
          <div className="w-14 h-14 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
            <Flame className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-primary">
              {t('dashboard.continuousProgress')}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('dashboard.learningStats')}
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
            <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">{t('dashboard.streak')}</div>
          </div>

          {/* Total XP */}
          <div className="bg-[#FFF4DE] dark:bg-yellow-900/20 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 min-h-[120px]">
            <Star className="w-6 h-6 text-[#FFC107]" />
            <div className="text-3xl font-bold text-slate-800 dark:text-slate-200">{totalXP.toLocaleString()}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">{t('dashboard.totalXP')}</div>
          </div>

          {/* Words Today */}
          <div className="bg-[#E8DEF8] dark:bg-purple-900/20 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 min-h-[120px]">
            <BookOpen className="w-6 h-6 text-[#9C27B0]" />
            <div className="text-3xl font-bold text-slate-800 dark:text-slate-200">{wordsLearnedToday}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">{t('dashboard.wordsToday')}</div>
          </div>
        </div>

        {/* Review Button */}
        <Button
          onClick={() => setShowModeDialog(true)}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl h-14 text-lg font-bold shadow-md hover:shadow-lg transition-all"
        >
          <Play className="w-5 h-5 mr-2 fill-current" />
          {t('dashboard.reviewNow')}
        </Button>

        {/* Mode Selection Dialog */}
        <Dialog open={showModeDialog} onOpenChange={setShowModeDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center mb-2">
                🎯 {t('dashboard.selectMode')}
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
                    <h3 className="text-xl font-bold mb-2">{t('dashboard.reviewMode')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('dashboard.reviewModeDesc')}
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
                    <h3 className="text-xl font-bold mb-2">{t('dashboard.gameMode')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('dashboard.gameModeDesc')}
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