import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type {
    GoalAssessment,
    AssessmentAnswer,
    AssessmentSetupOptions,
    AssessmentResults,
    WeakWord
} from '@/types/assessment';

export function useAssessment() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Create new assessment
    const createAssessment = useCallback(async (
        options: AssessmentSetupOptions
    ): Promise<GoalAssessment | null> => {
        setLoading(true);
        setError(null);

        try {
            const { goal_id, assessment_type, test_size_percentage, total_words } = options;

            // Calculate total questions based on percentage
            const total_questions = Math.round(total_words * (test_size_percentage / 100));

            const { data, error: insertError } = await supabase
                .from('goal_assessments')
                .insert({
                    goal_id,
                    assessment_type,
                    test_size_percentage,
                    total_questions,
                })
                .select()
                .single();

            if (insertError) throw insertError;
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create assessment');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Save assessment answer
    const saveAnswer = useCallback(async (
        assessment_id: string,
        flashcard_id: string,
        question: string,
        correct_answer: string,
        user_answer: string | null,
        is_correct: boolean,
        time_taken_seconds: number
    ): Promise<boolean> => {
        try {
            const { error: insertError } = await supabase
                .from('assessment_answers')
                .insert({
                    assessment_id,
                    flashcard_id,
                    question,
                    correct_answer,
                    user_answer,
                    is_correct,
                    time_taken_seconds,
                });

            if (insertError) throw insertError;
            return true;
        } catch (err) {
            console.error('Error saving answer:', err);
            return false;
        }
    }, []);

    // Complete assessment
    const completeAssessment = useCallback(async (
        assessment_id: string,
        correct_answers: number,
        wrong_answers: number,
        time_spent_seconds: number
    ): Promise<boolean> => {
        try {
            const { error: updateError } = await supabase
                .from('goal_assessments')
                .update({
                    correct_answers,
                    wrong_answers,
                    time_spent_seconds,
                    completed_at: new Date().toISOString(),
                })
                .eq('id', assessment_id);

            if (updateError) throw updateError;
            return true;
        } catch (err) {
            console.error('Error completing assessment:', err);
            return false;
        }
    }, []);

    // Get assessment results
    const getAssessmentResults = useCallback(async (
        assessment_id: string
    ): Promise<AssessmentResults | null> => {
        try {
            // Get assessment
            const { data: assessment, error: assessmentError } = await supabase
                .from('goal_assessments')
                .select('*')
                .eq('id', assessment_id)
                .single();

            if (assessmentError) throw assessmentError;

            // Get answers
            const { data: answers, error: answersError } = await supabase
                .from('assessment_answers')
                .select('*')
                .eq('assessment_id', assessment_id);

            if (answersError) throw answersError;

            // Separate weak and strong words
            const weak_words = answers
                .filter(a => !a.is_correct)
                .map(a => a.flashcard_id);

            const strong_words = answers
                .filter(a => a.is_correct)
                .map(a => a.flashcard_id);

            return {
                assessment,
                answers: answers || [],
                weak_words,
                strong_words,
            };
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get results');
            return null;
        }
    }, []);

    // Get goal assessments
    // FIX 3: Query practice_sessions (actual table) instead of non-existent assessment_results
    // Get goal assessments
    const getGoalAssessments = useCallback(async (
        goalId: string
    ): Promise<any[]> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('goal_assessments')
                .select('*')
                .eq('goal_id', goalId)
                .order('created_at', { ascending: true });

            if (fetchError) throw fetchError;

            return (data || []).map(assessment => ({
                id: assessment.id,
                assessment_type: assessment.assessment_type,
                correct_answers: assessment.correct_answers,
                total_questions: assessment.total_questions,
                completed_at: assessment.completed_at,
                created_at: assessment.created_at,
                test_size_percentage: assessment.test_size_percentage
            }));
        } catch (err) {
            console.error('Error fetching assessments:', err);
            return [];
        }
    }, []);

    return {
        loading,
        error,
        createAssessment,
        saveAnswer,
        completeAssessment,
        getAssessmentResults,
        getGoalAssessments,
    };
}
