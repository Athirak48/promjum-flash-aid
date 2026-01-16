import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface AssessmentQuizCard {
    id: string;
    front_text: string;
    back_text: string;
}

interface AssessmentQuizProps {
    assessmentId: string;
    cards: AssessmentQuizCard[];
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
    const [currentIndex, setCurrentIndex] = useState(0);
    const [results, setResults] = useState({
        correct: 0,
        wrong: 0,
        startTime: Date.now(),
    });
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);

    const handleAnswer = (userAnswer: string, isCorrect: boolean) => {
        setSelectedAnswer(userAnswer);
        setShowResult(true);

        // Update local results
        setResults(prev => ({
            ...prev,
            correct: prev.correct + (isCorrect ? 1 : 0),
            wrong: prev.wrong + (isCorrect ? 0 : 1),
        }));

        // Move to next question after delay
        setTimeout(() => {
            if (currentIndex < cards.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setSelectedAnswer(null);
                setShowResult(false);
            } else {
                // Quiz complete
                const timeSpent = Math.round((Date.now() - results.startTime) / 1000);
                onComplete({
                    correct: results.correct + (isCorrect ? 1 : 0),
                    wrong: results.wrong + (isCorrect ? 0 : 1),
                    timeSpent,
                });
            }
        }, 1000);
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
    
    // Generate options (correct + 3 random wrong)
    const generateOptions = () => {
        const correctAnswer = currentCard.back_text;
        const wrongAnswers = cards
            .filter(c => c.id !== currentCard.id)
            .map(c => c.back_text)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
        
        return [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
    };

    const options = generateOptions();

    return (
        <div className="space-y-6">
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

            {/* Question */}
            <div className="text-center p-8 bg-card rounded-xl border">
                <p className="text-2xl font-bold">{currentCard.front_text}</p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-4">
                {options.map((option, idx) => {
                    const isCorrect = option === currentCard.back_text;
                    const isSelected = selectedAnswer === option;
                    
                    let bgColor = 'bg-card hover:bg-accent';
                    if (showResult) {
                        if (isCorrect) bgColor = 'bg-green-500/20 border-green-500';
                        else if (isSelected) bgColor = 'bg-red-500/20 border-red-500';
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => !showResult && handleAnswer(option, isCorrect)}
                            disabled={showResult}
                            className={`p-4 rounded-lg border text-left transition-colors ${bgColor}`}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
