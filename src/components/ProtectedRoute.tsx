import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  skipOnboarding?: boolean; // Allow skipping onboarding check for the onboarding page itself
}

export const ProtectedRoute = ({ children, skipOnboarding = false }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user) {
        setChecking(false);
        return;
      }

      try {
        // Check if user just completed onboarding
        const justCompletedOnboarding = localStorage.getItem('onboarding_just_completed');

        // Check admin role and onboarding status in parallel
        const [adminResult, onboardingResult] = await Promise.all([
          supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .maybeSingle(),
          supabase
            .from('user_onboarding')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle()
        ]);

        if (adminResult.error) throw adminResult.error;
        setIsAdmin(!!adminResult.data);

        // If user just completed onboarding, set to true immediately
        if (justCompletedOnboarding === 'true') {
          setHasCompletedOnboarding(true);
          localStorage.removeItem('onboarding_just_completed'); // Clear flag
        } else {
          setHasCompletedOnboarding(!!onboardingResult.data);
        }
      } catch (error) {
        console.error('Error checking user status:', error);
        setIsAdmin(false);
        setHasCompletedOnboarding(true); // Default to true to not block users on error
      } finally {
        setChecking(false);
      }
    };

    checkUserStatus();
  }, [user]);

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If user is admin, redirect to admin dashboard
  if (isAdmin === true) {
    return <Navigate to="/admin" replace />;
  }

  // If user hasn't completed onboarding and we're not already on the onboarding page
  if (!skipOnboarding && hasCompletedOnboarding === false && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // If user is on onboarding page but has already completed it, redirect to dashboard
  if (skipOnboarding && hasCompletedOnboarding === true) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};