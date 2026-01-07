// Assessment System Types
export type AssessmentType =
    | 'pre-test'
    | 'progress-25'
    | 'progress-50'
    | 'progress-75'
    | 'post-test';

export type TestSizePercentage = 30 | 50 | 100;

export interface GoalAssessment {
    id: string;
    user_id: string;
    goal_id: string;

    // Assessment Info
    assessment_type: AssessmentType;
    test_size_percentage: TestSizePercentage;
    total_questions: number;

    // Results
    correct_answers: number;
    wrong_answers: number;
    accuracy: number; // Computed

    // Performance
    time_spent_seconds: number;
    completed_at: string | null;

    // Metadata
    created_at: string;
}

export interface AssessmentAnswer {
    id: string;
    assessment_id: string;
    flashcard_id: string;

    // Question Data
    question: string;
    correct_answer: string;
    user_answer: string | null;

    // Result
    is_correct: boolean;
    time_taken_seconds: number;

    // Metadata
    answered_at: string;
}

export interface AssessmentSetupOptions {
    goal_id: string;
    assessment_type: AssessmentType;
    test_size_percentage: TestSizePercentage;
    total_words: number; // From goal
}

export interface AssessmentResults {
    assessment: GoalAssessment;
    answers: AssessmentAnswer[];
    weak_words: string[]; // Words answered incorrectly
    strong_words: string[]; // Words answered correctly
    improvement?: number; // % improvement from pre-test (for post-test)
}

export interface WeakWord {
    flashcard_id: string;
    word: string;
    times_wrong: number;
    last_wrong_at: string;
    difficulty_score: number; // 0-1, higher = more difficult
}
