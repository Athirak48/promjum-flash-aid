import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type {
    GoalAssessment,
    AssessmentSetupOptions,
    AssessmentResults,
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
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { goal_id, assessment_type, test_size_percentage, total_words } = options;
            const total_questions = Math.round(total_words * (test_size_percentage / 100));

            const { data, error: insertError } = await supabase
                .from('goal_assessments')
                .insert({
                    user_id: user.id,
                    goal_id,
                    assessment_type,
                    test_size_percentage,
                    total_questions,
                })
                .select()
                .single();

            if (insertError) throw insertError;
            return data as GoalAssessment;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create assessment');
            return null;
        } finally {
            setLoading(false);
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
            const { data: assessment, error: assessmentError } = await supabase
                .from('goal_assessments')
                .select('*')
                .eq('id', assessment_id)
                .single();

            if (assessmentError) throw assessmentError;

            return {
                assessment: assessment as GoalAssessment,
                weak_words: [],
                strong_words: [],
            };
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get results');
            return null;
        }
    }, []);

    // Get goal assessments
    const getGoalAssessments = useCallback(async (
        goalId: string
    ): Promise<GoalAssessment[]> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('goal_assessments')
                .select('*')
                .eq('goal_id', goalId)
                .order('created_at', { ascending: true });

            if (fetchError) throw fetchError;
            return (data || []) as GoalAssessment[];
        } catch (err) {
            console.error('Error fetching assessments:', err);
            return [];
        }
    }, []);

    return {
        loading,
        error,
        createAssessment,
        completeAssessment,
        getAssessmentResults,
        getGoalAssessments,
    };
}
