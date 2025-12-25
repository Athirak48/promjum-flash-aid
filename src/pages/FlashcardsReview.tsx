import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FlashcardReviewWithSidebar } from '@/components/FlashcardReviewWithSidebar';
import { FlashcardReviewPage } from '@/components/FlashcardReviewPage'; // We might be able to remove this if fully replaced
import { FlashcardSwiper } from '@/components/FlashcardSwiper';
import { FlashcardQuizGame } from '@/components/FlashcardQuizGame';
import { FlashcardMatchingGame } from '@/components/FlashcardMatchingGame';
import { FlashcardListenChooseGame } from '@/components/FlashcardListenChooseGame';
import { FlashcardHangmanGame } from '@/components/FlashcardHangmanGame';
import { FlashcardVocabBlinderGame } from '@/components/FlashcardVocabBlinderGame';
import { FlashcardWordSearchGame } from '@/components/FlashcardWordSearchGame';
import { FlashcardWordScrambleGame } from '@/components/FlashcardWordScrambleGame';
import { FlashcardNinjaSliceGame } from '@/components/FlashcardNinjaSliceGame';

import { GameSelectionDialog } from '@/components/GameSelectionDialog';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useSRSProgress } from '@/hooks/useSRSProgress';
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import BackgroundDecorations from '@/components/BackgroundDecorations';

interface FlashcardData {
  id: string;
  front: string;
  back: string;
  isUserFlashcard?: boolean;
}

export default function FlashcardsReview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { flashcards, loading } = useFlashcards();
  const [showGameSelection, setShowGameSelection] = React.useState(false);

  // Check if this is a quick review from dashboard
  const state = location.state as {
    mode?: 'review' | 'game';
    gameType?: 'quiz' | 'matching' | 'listen' | 'hangman' | 'vocabBlinder' | 'wordSearch' | 'scramble' | 'ninja';
    cards?: FlashcardData[];
    isQuickReview?: boolean;
    fromAIListening?: boolean;
    fromAIReading?: boolean;
  } | null;

  useEffect(() => {
    document.title = `ทบทวนแฟลชการ์ด | Promjum`;
  }, []);

  // Use cards from state if available, otherwise use all flashcards
  const cards: FlashcardData[] = state?.cards || flashcards.map(card => ({
    id: card.id,
    front: card.front_text,
    back: card.back_text,
  }));

  const handleClose = () => {
    if (state?.fromAIListening) {
      // Navigate back to AI Listening Section 3 (Game Selection)
      // We need to reconstruct selectedVocab from cards
      const selectedVocab = cards.map(c => ({
        id: c.id,
        word: c.front,
        meaning: c.back
      }));
      navigate('/ai-listening-section3-intro', {
        state: {
          selectedVocab,
          // Preserve other AI states if needed, though mostly selectedVocab is key
        }
      });
    } else if (state?.isQuickReview) {
      navigate('/dashboard');
    } else {
      navigate('/flashcards');
    }
  };

  const handleComplete = (results?: any) => {
    console.log('Review results:', results);
    if (state?.fromAIListening) {
      // If game is complete, we might still want to go back to Section 3 or proceed to Section 4?
      // Usually games in Section 3 are "practice". 
      // If the user finishes a game, they likely want to choose another game or "continue" to next section.
      // The "Next" button in games usually calls onNext which calls handleNext (line 111).
      // handleNext handles progression.
      // handleComplete is usually for "Review Mode" completion or when Game calls onComplete?
      // Let's check where handleComplete is used.
      // It's used in FlashcardSwiper (line 276).
      // Games usually use onNext (line 128, 140, 152 etc).
      // If a game calls onComplete, we should probably treat it similar to Close or Next?
      // But wait, FlashcardReviewPage calls onComplete.
      // Games in this file don't seem to call onComplete directly, they call onNext or onClose.
      // However, let's play safe and keep handleComplete consistent with handleClose for now, 
      // or maybe handleComplete should just do nothing for games if they don't use it?
      // Actually, let's just apply the same logic to be safe, or direct to Section 4 if "complete" implies success?
      // But handleNext is strictly for moving forward.
      // Let's stick to returning to Section 3 for "Close" and "Complete" (if it implies finishing the set in a non-progressive way).
      // Actually, if they finish a review session, maybe they want to go to Section 4?
      // For now, let's map it to Section 3 to give them control, unless handleNext is called.

      const selectedVocab = cards.map(c => ({
        id: c.id,
        word: c.front,
        meaning: c.back
      }));
      navigate('/ai-listening-section3-intro', { state: { selectedVocab } });

    } else if (state?.isQuickReview) {
      navigate('/dashboard');
    } else {
      navigate('/flashcards');
    }
  };

  if (loading && !state?.cards) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-purple-950 dark:via-pink-900 dark:to-purple-950 relative overflow-hidden">
        <BackgroundDecorations />
        <div className="space-y-4 w-full max-w-md p-6 relative z-10">
          <Skeleton className="h-10 w-2/3 mx-auto bg-white/20" />
          <Skeleton className="h-64 w-full bg-white/20" />
          <div className="flex justify-center gap-4">
            <Skeleton className="h-10 w-24 bg-white/20" />
            <Skeleton className="h-10 w-24 bg-white/20" />
          </div>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-purple-950 dark:via-pink-900 dark:to-purple-950 relative overflow-hidden">
        <BackgroundDecorations />
        <div className="text-center space-y-4 relative z-10">
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">ไม่มีแฟลชการ์ดสำหรับทบทวน</h2>
          <p className="text-gray-500 dark:text-gray-400">กรุณาสร้างแฟลชการ์ดก่อนที่จะเริ่มทบทวน</p>
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            กลับ
          </button>
        </div>
      </div>
    );
  }

  // Game selection handlers
  const handleSelectNewGame = () => {
    setShowGameSelection(true);
  };

  const handleGameSelect = (gameType: 'quiz' | 'matching' | 'listen' | 'hangman' | 'vocabBlinder' | 'wordSearch' | 'scramble' | 'ninja') => {
    setShowGameSelection(false);
    navigate('/flashcards/review', {
      state: {
        mode: 'game',
        gameType: gameType,
        cards: cards,
        ...state
      }
    });
  };

  const handleReviewComplete = async (results: any) => {
    // If we have a setId and this isn't a game, we might want to update set progress
    // But updateFromFlashcardReview handles individual card updates.
    // FlashcardReviewPage also did a bulk update to 'user_flashcard_sets' for progress %
    // We can try to replicate that if needed, or rely on individual updates.
    // FlashcardReviewPage used:
    // supabase.from('user_flashcard_sets').update({ progress: ..., last_reviewed: ... }).eq('id', setId)
    // Here we don't have setId easily available unless passed in location.state?
    // Usually FlashcardsPage passes it? 
    // FlashcardsPage passes: navigate('/flashcards/review', { state: { cards, setId, ... } })

    // Let's check state for setId
    const setId = (state as any)?.setId;

    if (setId) {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data: { user } } = await supabase.auth.getUser();

        const total = cards.length;
        const correct = results.correct;
        // Note: FlashcardSwiper results structure: { correct, incorrect, needsReview, cardStats }
        // correct in FlashcardSwiper counts how many are MASTERED.
        // This is accurate for progress.

        const progressPercentage = Math.round((correct / total) * 100);

        if (user) {
          await supabase
            .from('user_flashcard_sets')
            .update({
              progress: progressPercentage,
              last_reviewed: new Date().toISOString()
            })
            .eq('id', setId)
            .eq('user_id', user.id);
        }
      } catch (e) {
        console.error("Failed to update set progress", e);
      }
    }

    handleComplete(results);
  };

  // Render game mode if specified
  if (state?.mode === 'game' && state?.gameType) {
    const gameFlashcards = cards.map(c => ({
      id: c.id,
      front_text: c.front,
      back_text: c.back,
      created_at: new Date().toISOString(),
      isUserFlashcard: c.isUserFlashcard
    }));

    const handleNext = () => {
      if (state?.fromAIListening) {
        // Navigate to Section 4 Intro instead of MCQ directly
        navigate('/ai-listening-section4-intro', { state: { cards } });
      } else if (state?.fromAIReading) {
        navigate('/ai-reading-section4-intro', { state: { cards } });
      } else {
        handleClose();
      }
    };

    if (state.gameType === 'quiz') {
      return (
        <>
          <div className="min-h-screen bg-background">
            <FlashcardQuizGame
              flashcards={gameFlashcards}
              onClose={handleClose}
              onNext={handleNext}
              onSelectNewGame={handleSelectNewGame}
            />
          </div>
          {showGameSelection && (
            <GameSelectionDialog
              open={showGameSelection}
              onOpenChange={setShowGameSelection}
              onSelectGame={handleGameSelect}
            />
          )}
        </>
      );
    }

    if (state.gameType === 'matching') {
      return (
        <>
          <div className="min-h-screen bg-background">
            <FlashcardMatchingGame
              flashcards={gameFlashcards}
              onClose={handleClose}
              onNext={handleNext}
              onSelectNewGame={handleSelectNewGame}
            />
          </div>
          {showGameSelection && (
            <GameSelectionDialog
              open={showGameSelection}
              onOpenChange={setShowGameSelection}
              onSelectGame={handleGameSelect}
            />
          )}
        </>
      );
    }

    if (state.gameType === 'listen') {
      return (
        <>
          <div className="min-h-screen bg-background">
            <FlashcardListenChooseGame
              flashcards={gameFlashcards}
              onClose={handleClose}
              onNext={handleNext}
              onSelectNewGame={handleSelectNewGame}
            />
          </div>
          {showGameSelection && (
            <GameSelectionDialog
              open={showGameSelection}
              onOpenChange={setShowGameSelection}
              onSelectGame={handleGameSelect}
            />
          )}
        </>
      );
    }

    if (state.gameType === 'hangman') {
      return (
        <>
          <div className="min-h-screen bg-background">
            <FlashcardHangmanGame
              flashcards={gameFlashcards}
              onClose={handleClose}
              onNext={handleNext}
              onSelectNewGame={handleSelectNewGame}
            />
          </div>
          {showGameSelection && (
            <GameSelectionDialog
              open={showGameSelection}
              onOpenChange={setShowGameSelection}
              onSelectGame={handleGameSelect}
            />
          )}
        </>
      );
    }

    if (state.gameType === 'vocabBlinder') {
      return (
        <>
          <div className="min-h-screen bg-background">
            <FlashcardVocabBlinderGame
              flashcards={gameFlashcards}
              onClose={handleClose}
              onNext={handleNext}
              onSelectNewGame={handleSelectNewGame}
            />
          </div>
          {showGameSelection && (
            <GameSelectionDialog
              open={showGameSelection}
              onOpenChange={setShowGameSelection}
              onSelectGame={handleGameSelect}
            />
          )}
        </>
      );
    }

    if (state.gameType === 'wordSearch') {
      return (
        <>
          <div className="min-h-screen bg-background">
            <FlashcardWordSearchGame
              flashcards={gameFlashcards}
              onClose={handleClose}
              onNext={handleNext}
              onSelectNewGame={handleSelectNewGame}
            />
          </div>
          {showGameSelection && (
            <GameSelectionDialog
              open={showGameSelection}
              onOpenChange={setShowGameSelection}
              onSelectGame={handleGameSelect}
            />
          )}
        </>
      );
    }

    if (state.gameType === 'scramble') {
      return (
        <>
          <div className="min-h-screen bg-background">
            <FlashcardWordScrambleGame
              vocabList={gameFlashcards.map(f => ({
                id: f.id,
                word: f.front_text,
                meaning: f.back_text,
                isUserFlashcard: f.isUserFlashcard
              }))}
              onExit={handleClose}
              onGameFinish={handleReviewComplete}
            />
          </div>
          {showGameSelection && (
            <GameSelectionDialog
              open={showGameSelection}
              onOpenChange={setShowGameSelection}
              onSelectGame={handleGameSelect}
            />
          )}
        </>
      );
    }

    if (state.gameType === 'ninja') {
      return (
        <>
          <FlashcardNinjaSliceGame
            vocabList={gameFlashcards.map(f => ({
              id: f.id,
              word: f.front_text,
              meaning: f.back_text,
              isUserFlashcard: f.isUserFlashcard
            }))}
            onExit={handleClose}
            onGameFinish={handleReviewComplete}
            onSelectNewGame={handleSelectNewGame}
          />
          {showGameSelection && (
            <GameSelectionDialog
              open={showGameSelection}
              onOpenChange={setShowGameSelection}
              onSelectGame={handleGameSelect}
            />
          )}
        </>
      );
    }

  }

  // Render game selection dialog
  if (showGameSelection) {
    return (
      <>
        <GameSelectionDialog
          open={showGameSelection}
          onOpenChange={setShowGameSelection}
          onSelectGame={handleGameSelect}
        />
      </>
    );
  }

  // SRS Hook
  const { updateFromFlashcardReview } = useSRSProgress();
  // Track attempts locally to match logic from FlashcardReviewPage
  const attemptCounts = React.useRef<Map<string, number>>(new Map());

  const handleAnswer = async (cardId: string, known: boolean, timeTaken: number) => {
    // Find the card to check if it's user flashcard
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    // Track attempt count
    const currentAttempts = attemptCounts.current.get(cardId) || 0;
    attemptCounts.current.set(cardId, currentAttempts + 1);

    // Determines if it is a user flashcard (default to false if prop missing/undefined, but FlashcardData usually has it if passed correctly)
    // The current FlashcardData in this file doesn't explicitly have isUserFlashcard type definition 
    // but the object passed from FlashcardsPage usually has it.
    // Let's cast or check safely. 
    // Actually, let's update FlashcardData definition in this file to match.
    const isUserCard = (card as any).isUserFlashcard;

    await updateFromFlashcardReview(cardId, known, currentAttempts + 1, timeTaken, isUserCard);
  };

  // Default to review mode with sidebar -> NOW CHANGED TO SWIPER
  return (
    <FlashcardSwiper
      cards={cards.map(c => ({
        id: c.id,
        front: c.front,
        back: c.back,
        // Map images if they exist in source but maybe not in type
        frontImage: (c as any).frontImage,
        backImage: (c as any).backImage
      }))}
      onClose={handleClose}
      onComplete={handleReviewComplete}
      onAnswer={handleAnswer}
    />
  );
}
