import React from 'react';
import { FlashcardReviewPage } from './FlashcardReviewPage';
import { VocabularyReviewSidebar } from './VocabularyReviewSidebar';
import { useIsMobile } from '@/hooks/use-mobile';

interface FlashcardData {
    id: string;
    front: string;
    back: string;
}

interface FlashcardReviewWithSidebarProps {
    cards: FlashcardData[];
    onClose: () => void;
    onComplete?: (results: any) => void;
    setId?: string;
}

export function FlashcardReviewWithSidebar({
    cards,
    onClose,
    onComplete,
    setId
}: FlashcardReviewWithSidebarProps) {
    const isMobile = useIsMobile();
    const [currentCards, setCurrentCards] = React.useState<FlashcardData[]>(cards);

    const handleSidebarSelectSet = (setId: string, flashcards: any[]) => {
        // Convert flashcards to the format expected by review
        const formattedCards: FlashcardData[] = flashcards.map(fc => ({
            id: fc.id,
            front: fc.front_text,
            back: fc.back_text,
            isUserFlashcard: true
        }));

        setCurrentCards(formattedCards);
    };

    return (
        <div className="fixed inset-0 flex z-50">
            {/* Sidebar - Hidden on mobile */}
            {!isMobile && (
                <div className="w-80 h-full">
                    <VocabularyReviewSidebar onSelectSet={handleSidebarSelectSet} />
                </div>
            )}

            {/* Review Page */}
            <div className="flex-1">
                <FlashcardReviewPage
                    cards={currentCards}
                    onClose={onClose}
                    onComplete={onComplete}
                    setId={setId}
                />
            </div>
        </div>
    );
}
