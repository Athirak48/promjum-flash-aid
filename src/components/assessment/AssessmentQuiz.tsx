import { useEffect, useState } from "react";
import { useAssessment } from "@/hooks/useAssessment";
import { FlashcardQuizGame } from "@/components/FlashcardQuizGame";
import type { Flashcard } from "@/types/flashcard";
import type { GoalAssessment } from "@/types/assessment";
import { Loader2 } from "lucide-react";

interface AssessmentQuizProps {
    assessmentId: string;
    cards: Flashcard[];
    onComplete: (results: {
        correct: number;
        wrong: number;
        timeSpent: number;
    }) => void;
}

export function AssessmentQuiz({
    assessmentId,
    cards,
    onComplete,
}: AssessmentQuizProps) {
    const { saveAnswer } = useAssessment();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [results, setResults] = useState({
        correct: 0,
        wrong: 0,
        startTime: Date.now(),
    });

    const handleAnswer = async (
        cardId: string,
        question: string,
        correctAnswer: string,
        userAnswer: string,
        isCorrect: boolean,
        timeTaken: number
    ) => {
        // Save to database
        await saveAnswer(
            assessmentId,
            cardId,
            question,
            correctAnswer,
            userAnswer,
            isCorrect,
            timeTaken
        );

        // Update local results
        setResults(prev => ({
            ...prev,
            correct: prev.correct + (isCorrect ? 1 : 0),
            wrong: prev.wrong + (isCorrect ? 0 : 1),
        }));

        // Move to next question
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            // Quiz complete
            const timeSpent = Math.round((Date.now() - results.startTime) / 1000);
            onComplete({
                correct: results.correct + (isCorrect ? 1 : 0),
                wrong: results.wrong + (isCorrect ? 0 : 1),
                timeSpent,
            });
        }
    };

    if (cards.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">กำลังเตรียมข้อสอบ...</p>
                </div>
            </div>
        );
    }

    const currentCard = cards[currentIndex];

    return (
        <div className="space-y-4">
            {/* Progress */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>ข้อที่ {currentIndex + 1} / {cards.length}</span>
                <span>ถูก: {results.correct} | ผิด: {results.wrong}</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-secondary rounded-full h-2">
                <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                />
            </div>

            {/* Quiz Component */}
            <FlashcardQuizGame
                card={currentCard}
                onAnswer={(isCorrect, userAnswer, timeTaken) => {
                    handleAnswer(
                        currentCard.id,
                        currentCard.front_text,
                        currentCard.back_text,
                        userAnswer,
                        isCorrect,
                        timeTaken
                    );
                }}
            />
        </div>
    );
}
