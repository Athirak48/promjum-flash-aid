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
    document.title = `ทบทวนแฟลชการ์ด | Promjum`;
  }, []);

  const cards: FlashcardData[] = flashcards.map(card => ({
    id: card.id,
    front: card.front_text,
    back: card.back_text,
  }));

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-purple-950 dark:via-pink-900 dark:to-purple-950">
        <div className="space-y-4 w-full max-w-md p-6">
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
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-purple-950 dark:via-pink-900 dark:to-purple-950">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">ไม่มีแฟลชการ์ดสำหรับทบทวน</h2>
          <p className="text-gray-500 dark:text-gray-400">กรุณาสร้างแฟลชการ์ดก่อนที่จะเริ่มทบทวน</p>
          <button 
            onClick={() => navigate('/flashcards')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            กลับไปหน้าแฟลชการ์ด
          </button>
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
