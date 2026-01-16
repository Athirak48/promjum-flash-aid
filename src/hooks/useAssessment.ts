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

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

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

    // Save assessment answer
    // Note: assessment_answers table doesn't exist in the current schema
    // This function is kept for API compatibility but will return false
    const saveAnswer = useCallback(async (
        _assessment_id: string,
        _flashcard_id: string,
        _question: string,
        _correct_answer: string,
        _user_answer: string | null,
        _is_correct: boolean,
        _time_taken_seconds: number
    ): Promise<boolean> => {
        console.log('saveAnswer called but assessment_answers table not available');
        return false;
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

            // Note: assessment_answers table doesn't exist in the current schema
            // Return assessment data without individual answers
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
    // FIX 3: Query practice_sessions (actual table) instead of non-existent assessment_results
    // Get goal assessments with robust fallback
    const getGoalAssessments = useCallback(async (
        goalId: string
    ): Promise<any[]> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            // 0. Fetch Goal Start Date to filter out old history (from previous resets)
            const { data: goalData, error: goalError } = await supabase
                .from('user_goals')
                .select('created_at')
                .eq('id', goalId)
                .single();

            if (goalError) {
                console.error('Error fetching goal details:', goalError);
                return [];
            }

            const goalStartDate = new Date(goalData.created_at);
            // Relax the filter: Go back 24 hours to handle Client vs Server clock skew.
            // This prevents hiding assessments created "immediately" after goal creation if client clock is slow.
            goalStartDate.setHours(goalStartDate.getHours() - 24);
            const effectiveStartDate = goalStartDate.toISOString();

            // 1. Fetch High-Quality Records (with Score) from goal_assessments
            const { data: assessments, error: fetchError } = await supabase
                .from('goal_assessments')
                .select('*')
                .eq('goal_id', goalId)
                .gte('created_at', effectiveStartDate) // Relaxed Filter
                .order('created_at', { ascending: true });

            if (fetchError) throw fetchError;

            // 2. Fetch Fallback Records (Session Logs) from practice_sessions
            // This ensures meaningful history even if the detailed score record was lost
            const { data: sessions, error: sessionError } = await supabase
                .from('practice_sessions')
                .select('*')
                .eq('goal_id', goalId)
                .eq('user_id', user.id)
                .gte('created_at', effectiveStartDate) // Relaxed Filter
                .in('session_mode', ['pre-test', 'interim', 'post-test', 'mid-term']); // include variants

            const realAssessments = (assessments || []).map(a => ({
                id: a.id,
                assessment_type: a.assessment_type,
                correct_answers: a.correct_answers,
                total_questions: a.total_questions,
                completed_at: a.completed_at,
                created_at: a.created_at,
                test_size_percentage: a.test_size_percentage,
                source: 'detailed'
            }));

            // 3. Merge: Add sessions only if no matching detailed assessment exists for that type?

            // Map sessions to assessment format
            const sessionAssessments = (sessions || []).map(s => {
                return {
                    id: s.id,
                    assessment_type: s.session_mode,
                    correct_answers: null, // Unknown score implies fallback
                    total_questions: s.words_reviewed,
                    completed_at: s.completed_at || s.created_at,
                    created_at: s.created_at,
                    test_size_percentage: 100,
                    source: 'session'
                };
            });

            const allItems = [...realAssessments, ...sessionAssessments];

            // Deduplicate: Keep ONLY the LATEST record for each assessment_type
            // This ensures we don't show multiple Pre-tests (e.g. from retries or bugs).
            // Users only care about their *current* valid result for this goal.

            const uniqueMap = new Map();

            // Sort by date descending (newest first)
            const sortedAll = allItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            for (const item of sortedAll) {
                if (!uniqueMap.has(item.assessment_type)) {
                    uniqueMap.set(item.assessment_type, item);
                } else {
                    // Smart Deduplication:
                    // If we already have a record, but it's a 'session' (no score), 
                    // and the current item is 'detailed' (has score), REPLACE IT.
                    // This handles the race condition where `practice_sessions` might be milliseconds newer
                    // than `goal_assessments`, causing the score to be hidden.
                    const existing = uniqueMap.get(item.assessment_type);
                    if (existing.source === 'session' && item.source === 'detailed') {
                        uniqueMap.set(item.assessment_type, item);
                    }
                }
            }

            const finalUniqueItems = Array.from(uniqueMap.values());

            // Return sorted by date (Oldest -> Newest) for the timeline view
            return finalUniqueItems.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

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
