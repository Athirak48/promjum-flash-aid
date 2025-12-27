import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useOnboarding() {
    const { user } = useAuth();
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [onboardingData, setOnboardingData] = useState<any>(null);

    useEffect(() => {
        checkOnboardingStatus();
    }, [user]);

    const checkOnboardingStatus = async () => {
        if (!user) {
            setIsLoading(false);
            setHasCompletedOnboarding(null);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('user_onboarding')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (error) {
                console.error('Error checking onboarding:', error);
                setHasCompletedOnboarding(false);
            } else {
                setHasCompletedOnboarding(!!data);
                setOnboardingData(data);
            }
        } catch (err) {
            console.error('Onboarding check failed:', err);
            setHasCompletedOnboarding(false);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        hasCompletedOnboarding,
        isLoading,
        onboardingData,
        refetch: checkOnboardingStatus
    };
}
