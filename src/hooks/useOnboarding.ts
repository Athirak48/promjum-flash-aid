import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type OnboardingStep =
    | 'welcome'
    | 'download_deck'
    | 'deck_downloaded'
    | 'show_learning'
    | 'tutorial_complete';

interface OnboardingState {
    hasCompletedOnboarding: boolean | null;
    isLoading: boolean;
    currentStep: OnboardingStep | null;
    isOnboarding: boolean;
}

const initialState: OnboardingState = {
    hasCompletedOnboarding: null,
    isLoading: true,
    currentStep: null,
    isOnboarding: false,
};

export function useOnboarding() {
    const { user } = useAuth();
    const [state, setState] = useState<OnboardingState>(initialState);

    const checkOnboardingStatus = useCallback(async () => {
        if (!user) {
            setState({
                hasCompletedOnboarding: null,
                isLoading: false,
                currentStep: null,
                isOnboarding: false,
            });
            return;
        }

        try {
            const { data, error } = await supabase
                .from('user_onboarding')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (error && error.code !== 'PGRST116') {
                console.error('Error checking onboarding:', error);
            }

            const completed = !!data?.completed_at;
            setState({
                hasCompletedOnboarding: completed,
                isLoading: false,
                currentStep: 'welcome',
                isOnboarding: !completed,
            });
        } catch (err) {
            console.error('Onboarding check failed:', err);
            setState({
                hasCompletedOnboarding: false,
                isLoading: false,
                currentStep: 'welcome',
                isOnboarding: true,
            });
        }
    }, [user]);

    useEffect(() => {
        checkOnboardingStatus();
    }, [checkOnboardingStatus]);

    const markStepComplete = useCallback(async (step: OnboardingStep) => {
        if (!user) return;

        try {
            await supabase
                .from('user_onboarding')
                .upsert({
                    user_id: user.id,
                    completed_at: step === 'tutorial_complete' ? new Date().toISOString() : null,
                }, {
                    onConflict: 'user_id'
                });

            setState(prev => ({
                ...prev,
                currentStep: step,
                hasCompletedOnboarding: step === 'tutorial_complete',
                isOnboarding: step !== 'tutorial_complete',
            }));
        } catch (err) {
            console.error('Error updating onboarding step:', err);
        }
    }, [user]);

    const completeOnboarding = useCallback(async () => {
        await markStepComplete('tutorial_complete');
    }, [markStepComplete]);

    const skipOnboarding = useCallback(async () => {
        await completeOnboarding();
    }, [completeOnboarding]);

    return {
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        isOnboarding: state.isOnboarding,
        currentStep: state.currentStep,
        isLoading: state.isLoading,
        markStepComplete,
        completeOnboarding,
        skipOnboarding,
        refetch: checkOnboardingStatus,
    };
}
