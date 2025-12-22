import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { Flame, Star, BookOpen, Play, Brain, GamepadIcon, Sparkles, Trophy } from 'lucide-react';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { GameSelectionDialog } from '@/components/GameSelectionDialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { LearningFlowDialog } from '@/components/learning/LearningFlowDialog';

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
  const [showLearningFlow, setShowLearningFlow] = useState(false);
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

  const handleGameSelect = async (gameType: 'quiz' | 'matching' | 'listen' | 'hangman' | 'vocabBlinder' | 'wordSearch') => {
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
    <Card className="bg-white dark:bg-slate-900 shadow-lg border border-slate-100 dark:border-slate-800 h-full p-2 overflow-hidden relative">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-500/10 to-transparent rounded-full blur-xl" />

      <CardHeader className="pb-2 relative">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <motion.div
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-pink-500/20 dark:from-primary/30 dark:to-pink-500/30 flex items-center justify-center shadow-md"
            animate={{
              y: [0, -3, 0],
              rotate: [0, 2, -2, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Flame className="w-8 h-8 text-primary" />
          </motion.div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Continuous Progress
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Keep your learning streak alive!
            </p>
          </div>
        </motion.div>
      </CardHeader>
      <CardContent className="space-y-5 pt-4">
        {/* Stats Grid - Matching Deck Card Style */}
        <div className="grid grid-cols-3 gap-4">
          {/* 🔥 Day Streak */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.03, y: -2 }}
            className="bg-white dark:bg-slate-800 rounded-3xl p-5 flex flex-col items-center gap-3 shadow-lg hover:shadow-xl transition-all border border-slate-100 dark:border-slate-700"
          >
            {/* Icon Circle */}
            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/40 dark:to-red-900/40 flex items-center justify-center"
            >
              <Flame className="w-7 h-7 text-orange-500" />
            </motion.div>
            {/* Content */}
            <div className="text-center">
              <div className="text-3xl font-black text-slate-800 dark:text-white">{streak}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Day Streak</div>
            </div>
          </motion.div>

          {/* ⭐ XP Points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.03, y: -2 }}
            className="bg-white dark:bg-slate-800 rounded-3xl p-5 flex flex-col items-center gap-3 shadow-lg hover:shadow-xl transition-all border border-slate-100 dark:border-slate-700 relative"
          >
            {/* Today Badge */}
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
              +120 today
            </div>
            {/* Icon Circle */}
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/40 dark:to-amber-900/40 flex items-center justify-center"
            >
              <Star className="w-7 h-7 text-amber-500 fill-amber-500" />
            </motion.div>
            {/* Content */}
            <div className="text-center">
              <div className="text-3xl font-black text-slate-800 dark:text-white">{totalXP.toLocaleString()}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">XP Points</div>
            </div>
          </motion.div>

          {/* 📚 Vocab */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.03, y: -2 }}
            className="bg-white dark:bg-slate-800 rounded-3xl p-5 flex flex-col items-center gap-3 shadow-lg hover:shadow-xl transition-all border border-slate-100 dark:border-slate-700 relative"
          >
            {/* Today Badge */}
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
              +{wordsLearnedToday} today
            </div>
            {/* Icon Circle */}
            <motion.div
              animate={{ y: [0, -3, 0], x: [0, 2, -2, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/40 dark:to-violet-900/40 flex items-center justify-center"
            >
              <BookOpen className="w-7 h-7 text-purple-500" />
            </motion.div>
            {/* Content */}
            <div className="text-center">
              <div className="text-3xl font-black text-slate-800 dark:text-white">342</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Vocab Learned</div>
            </div>
          </motion.div>
        </div>

        {/* Daily Snapshot */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">📊</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">Daily Snapshot</span>
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">TODAY</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Words Learned</div>
              <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{wordsLearnedToday}</div>
            </div>
            <div className="border-x border-slate-200 dark:border-slate-600">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Time Spent</div>
              <div className="text-xl font-bold text-slate-800 dark:text-slate-100">45.2104<span className="text-sm">m</span></div>
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Ranking</div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">#15</div>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-auto">
          {/* Learning Now Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1"
          >
            <Button
              onClick={() => setShowLearningFlow(true)}
              className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-xl sm:rounded-2xl h-11 sm:h-14 text-sm sm:text-lg font-bold shadow-lg hover:shadow-xl transition-all"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 fill-current" />
              <span className="sm:hidden">เรียนเลย</span>
              <span className="hidden sm:inline">Learning Now</span>
            </Button>
          </motion.div>

          {/* Vocab Challenge Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1"
          >
            <Button
              onClick={() => navigate('/vocab-challenge')}
              variant="outline"
              className="w-full rounded-xl sm:rounded-2xl h-11 sm:h-14 text-sm sm:text-lg font-bold shadow-sm hover:shadow-md transition-all border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
            >
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-purple-500" />
              <span className="sm:hidden">ท้าทาย</span>
              <span className="hidden sm:inline">Vocab Challenge</span>
            </Button>
          </motion.div>
        </div>

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
                onClick={() => {
                  setShowModeDialog(false);
                  setShowGameSelection(true);
                }}
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

        {/* Learning Flow Dialog */}
        <LearningFlowDialog
          open={showLearningFlow}
          onOpenChange={setShowLearningFlow}
        />
      </CardContent>
    </Card>
  );
}