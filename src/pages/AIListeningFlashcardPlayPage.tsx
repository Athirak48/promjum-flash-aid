import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FlashcardSwiper } from '@/components/FlashcardSwiper';

interface VocabItem {
    id: string;
    word: string;
    meaning: string;
}

interface ReviewResult {
    word: string;
    meaning: string;
    remembered: boolean;
    attemptCount: number;
    missCount: number;
}

export default function AIListeningFlashcardPlayPage() {
    const navigate = useNavigate();
    const location = useLocation();

    // Get vocabulary from navigation state
    const initialVocab: VocabItem[] = location.state?.selectedVocab || [];

    // Convert vocab to flashcard format
    const flashcards = initialVocab.map(item => ({
        id: item.id,
        front: item.word,
        back: item.meaning
    }));

    const handleClose = () => {
        navigate('/ai-listening-section2-intro');
    };

    const handleComplete = (results: { correct: number; incorrect: number; needsReview: number; cardStats: Record<string, { missCount: number }> }) => {
        // Navigate to summary with results
        navigate('/ai-listening-flashcard-summary', {
            state: {
                results: flashcards.map(card => ({
                    word: card.front,
                    meaning: card.back,
                    remembered: (results.cardStats[card.id]?.missCount || 0) === 0,
                    attemptCount: 1 + (results.cardStats[card.id]?.missCount || 0),
                    missCount: results.cardStats[card.id]?.missCount || 0
                })),
                totalCards: flashcards.length,
                selectedVocab: initialVocab,
                stats: results
            }
        });
    };

    if (flashcards.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">No vocabulary selected</h2>
                    <button
                        onClick={() => navigate('/ai-listening-vocab-selection')}
                        className="px-6 py-2 bg-primary text-white rounded-lg"
                    >
                        Select Vocabulary
                    </button>
                </div>
            </div>
        );
    }

    return (
        <FlashcardSwiper
            cards={flashcards}
            onClose={handleClose}
            onComplete={handleComplete}
        />
    );
}
