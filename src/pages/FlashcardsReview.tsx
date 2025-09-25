import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FlashcardReviewPage } from '@/components/FlashcardReviewPage';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';

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

  useEffect(() => {
    document.title = `${t('flashcards.review')} | Promjum`;
  }, [t]);

  const cards: FlashcardData[] = flashcards.map(card => ({
    id: card.id,
    front: card.front_text,
    back: card.back_text,
  }));

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80">
        <div className="space-y-4 w-full max-w-md p-6">
          <Skeleton className="h-10 w-2/3 mx-auto" />
          <Skeleton className="h-64 w-full" />
          <div className="flex justify-center gap-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <FlashcardReviewPage
      cards={cards}
      onClose={() => navigate('/flashcards')}
      onComplete={(results) => {
        console.log('Review results:', results);
        navigate('/flashcards');
      }}
    />
  );
}
