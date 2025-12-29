import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type OnboardingStep =
    | 'welcome'
    | 'download_deck'
    | 'deck_downloaded'
    | 'show_learning'
    | 'tutorial_complete';

export function useOnboarding() {
    const { user } = useAuth();
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState<OnboardingStep | null>(null);
    const [isOnboarding, setIsOnboarding] = useState(false);

    useEffect(() => {
        checkOnboardingStatus();
    }, [user]);

    const checkOnboardingStatus = async () => {
        if (!user) {
            setIsLoading(false);
            setHasCompletedOnboarding(null);
            setIsOnboarding(false);
            return;
        }

        try {
            // Check if user has completed onboarding in database
            const { data, error } = await supabase
                .from('user_onboarding')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (error && error.code !== 'PGRST116') {
                console.error('Error checking onboarding:', error);
            }

            const completed = !!data?.completed;
            setHasCompletedOnboarding(completed);
            setCurrentStep(data?.current_step || 'welcome');
            setIsOnboarding(!completed);
        } catch (err) {
            console.error('Onboarding check failed:', err);
            setHasCompletedOnboarding(false);
            setIsOnboarding(true);
        } finally {
            setIsLoading(false);
        }
    };

    const markStepComplete = async (step: OnboardingStep) => {
        if (!user) return;

        try {
            await supabase
                .from('user_onboarding')
                .upsert({
                    user_id: user.id,
                    current_step: step,
                    completed: step === 'tutorial_complete',
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id'
                });

            setCurrentStep(step);
            if (step === 'tutorial_complete') {
                setHasCompletedOnboarding(true);
                setIsOnboarding(false);
            }
        } catch (err) {
            console.error('Error updating onboarding step:', err);
        }
    };

    const completeOnboarding = async () => {
        await markStepComplete('tutorial_complete');
    };

    const skipOnboarding = async () => {
        await completeOnboarding();
    };

    return {
        hasCompletedOnboarding,
        isOnboarding,
        currentStep,
        isLoading,
        markStepComplete,
        completeOnboarding,
        skipOnboarding,
        refetch: checkOnboardingStatus
    };
}
