import { useState } from "react";
import { useAssessment } from "@/hooks/useAssessment";
import { AssessmentSetup } from "./AssessmentSetup";
import { AssessmentQuiz } from "./AssessmentQuiz";
import { AssessmentResultsDisplay } from "./AssessmentResultsDisplay";
import type { AssessmentType } from "@/types/assessment";
import type { StudyGoal } from "@/types/goals";

type AssessmentPhase = 'setup' | 'quiz' | 'results';

interface AssessmentCard {
    id: string;
    front_text: string;
    back_text: string;
}

interface AssessmentManagerProps {
    goal: StudyGoal;
    assessmentType: AssessmentType;
    cards: AssessmentCard[];
    onComplete: () => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AssessmentManager({
    goal,
    assessmentType,
    cards,
    onComplete,
    open,
    onOpenChange,
}: AssessmentManagerProps) {
    const { createAssessment, completeAssessment, getAssessmentResults } = useAssessment();
    const [phase, setPhase] = useState<AssessmentPhase>('setup');
    const [assessmentId, setAssessmentId] = useState<string | null>(null);
    const [selectedCards, setSelectedCards] = useState<AssessmentCard[]>([]);
    const [results, setResults] = useState<any>(null);

    // Sample cards based on test size
    const sampleCards = (testSize: number) => {
        const totalQuestions = Math.round(cards.length * (testSize / 100));
        const shuffled = [...cards].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, totalQuestions);
    };

    const handleStartQuiz = async (testSize: number) => {
        const assessment = await createAssessment({
            goal_id: goal.id,
            assessment_type: assessmentType,
            test_size_percentage: testSize,
            total_words: cards.length,
        });

        if (!assessment) {
            alert('ไม่สามารถสร้าง assessment ได้');
            return;
        }

        setAssessmentId(assessment.id);
        setSelectedCards(sampleCards(testSize));
        setPhase('quiz');
    };

    const handleQuizComplete = async (quizResults: {
        correct: number;
        wrong: number;
        timeSpent: number;
    }) => {
        if (!assessmentId) return;

        await completeAssessment(
            assessmentId,
            quizResults.correct,
            quizResults.wrong,
            quizResults.timeSpent
        );

        const fullResults = await getAssessmentResults(assessmentId);
        if (fullResults) {
            setResults(fullResults);
            setPhase('results');
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        onComplete();

        setTimeout(() => {
            setPhase('setup');
            setAssessmentId(null);
            setSelectedCards([]);
            setResults(null);
        }, 300);
    };

    return (
        <>
            {phase === 'setup' && (
                <AssessmentSetup
                    open={open}
                    onOpenChange={onOpenChange}
                    assessmentType={assessmentType}
                    totalWords={cards.length}
                    onStart={handleStartQuiz}
                />
            )}

            {phase === 'quiz' && assessmentId && (
                <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
                    <div className="container mx-auto px-4 py-8 max-w-4xl">
                        <AssessmentQuiz
                            assessmentId={assessmentId}
                            cards={selectedCards}
                            onComplete={handleQuizComplete}
                        />
                    </div>
                </div>
            )}

            {phase === 'results' && results && (
                <div className="fixed inset-0 bg-background/95 z-50 overflow-y-auto flex items-center justify-center p-4">
                    <AssessmentResultsDisplay
                        results={results}
                        onClose={handleClose}
                    />
                </div>
            )}
        </>
    );
}
