// Assessment System Types
export type AssessmentType = 'pre-test' | 'interim' | 'post-test';

export type TestSizePercentage = 30 | 50 | 100;

export interface GoalAssessment {
    id: string;
    user_id: string;
    goal_id: string;

    // Assessment Info
    assessment_type: AssessmentType;
    test_size_percentage: number;
    total_questions: number;

    // Results
    correct_answers: number;
    wrong_answers: number;

    // Performance
    time_spent_seconds: number;
    completed_at: string | null;

    // Metadata
    created_at: string;
}

export interface AssessmentSetupOptions {
    goal_id: string;
    assessment_type: AssessmentType;
    test_size_percentage: number;
    total_words: number;
}

export interface AssessmentResults {
    assessment: GoalAssessment;
    weak_words: string[];
    strong_words: string[];
    improvement?: number;
}

export interface WeakWord {
    flashcard_id: string;
    word: string;
    translation?: string;
    times_wrong: number;
    last_wrong_at: string;
    difficulty_score: number;
}

export interface AssessmentAnswer {
    id: string;
    assessment_id: string;
    flashcard_id: string;
    question: string;
    correct_answer: string;
    user_answer: string | null;
    is_correct: boolean;
    time_taken_seconds: number;
    created_at: string;
}
