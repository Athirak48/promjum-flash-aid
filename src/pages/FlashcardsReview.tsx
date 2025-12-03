import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FlashcardReviewWithSidebar } from '@/components/FlashcardReviewWithSidebar';
import { FlashcardReviewPage } from '@/components/FlashcardReviewPage';
import { FlashcardQuizGame } from '@/components/FlashcardQuizGame';
import { FlashcardMatchingGame } from '@/components/FlashcardMatchingGame';
import { FlashcardListenChooseGame } from '@/components/FlashcardListenChooseGame';
import { FlashcardHangmanGame } from '@/components/FlashcardHangmanGame';
import { FlashcardVocabBlinderGame } from '@/components/FlashcardVocabBlinderGame';
import { FlashcardWordSearchGame } from '@/components/FlashcardWordSearchGame';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import BackgroundDecorations from '@/components/BackgroundDecorations';

interface FlashcardData {
  id: string;
  front: string;
  back: string;
}

export default function FlashcardsReview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { flashcards, loading } = useFlashcards();

  // Check if this is a quick review from dashboard
  const state = location.state as {
    mode?: 'review' | 'game';
    gameType?: 'quiz' | 'matching' | 'listen' | 'hangman' | 'vocabBlinder' | 'wordSearch';
    cards?: FlashcardData[];
    isQuickReview?: boolean;
    fromAIListening?: boolean;
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
    if (state?.isQuickReview) {
      navigate('/dashboard');
    } else {
      navigate('/flashcards');
    }
  };

  const handleComplete = (results?: any) => {
    console.log('Review results:', results);
    if (state?.isQuickReview) {
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

  // Render game mode if specified
  if (state?.mode === 'game' && state?.gameType) {
    const gameFlashcards = cards.map(c => ({
      id: c.id,
      front_text: c.front,
      back_text: c.back,
      created_at: new Date().toISOString()
    }));

    const handleNext = () => {
      if (state?.fromAIListening) {
        // Navigate to Section 4 Intro instead of MCQ directly
        navigate('/ai-listening-section4-intro', { state: { cards } });
      } else {
        handleClose();
      }
    };

    if (state.gameType === 'quiz') {
      return (
        <div className="min-h-screen bg-background">
          <FlashcardQuizGame
            flashcards={gameFlashcards}
            onClose={handleClose}
            onNext={handleNext}
          />
        </div>
      );
    }

    if (state.gameType === 'matching') {
      return (
        <div className="min-h-screen bg-background">
          <FlashcardMatchingGame
            flashcards={gameFlashcards}
            onClose={handleClose}
            onNext={handleNext}
          />
        </div>
      );
    }

    if (state.gameType === 'listen') {
      return (
        <div className="min-h-screen bg-background">
          <FlashcardListenChooseGame
            flashcards={gameFlashcards}
            onClose={handleClose}
            onNext={handleNext}
          />
        </div>
      );
    }

    if (state.gameType === 'hangman') {
      return (
        <div className="min-h-screen bg-background">
          <FlashcardHangmanGame
            flashcards={gameFlashcards}
            onClose={handleClose}
            onNext={handleNext}
          />
        </div>
      );
    }

    if (state.gameType === 'vocabBlinder') {
      return (
        <div className="min-h-screen bg-background">
          <FlashcardVocabBlinderGame
            flashcards={gameFlashcards}
            onClose={handleClose}
            onNext={handleNext}
          />
        </div>
      );
    }

    if (state.gameType === 'wordSearch') {
      return (
        <div className="min-h-screen bg-background">
          <FlashcardWordSearchGame
            flashcards={gameFlashcards}
            onClose={handleClose}
            onNext={handleNext}
          />
        </div>
      );
    }
  }

  // Default to review mode with sidebar
  return (
    <FlashcardReviewPage
      cards={cards}
      onClose={handleClose}
      onComplete={handleComplete}
    />
  );
}
