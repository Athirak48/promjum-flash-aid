import { useRef, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import SM2FocusDashboard from "@/components/dashboard/SM2FocusDashboard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ArcadeGrid } from "@/components/dashboard/ArcadeGrid";
import { useAuth } from "@/hooks/useAuth";
import { useUserStats } from "@/hooks/useUserStats";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useStudyGoals } from "@/hooks/useStudyGoals";
import { OnboardingSpotlight } from "@/components/onboarding/OnboardingSpotlight";
import { motion } from "framer-motion";

export default function Dashboard() {
    const { user } = useAuth();
    const { stats } = useUserStats();
    const { trackPageView } = useAnalytics();
    const { isOnboarding, currentStep, markStepComplete } = useOnboarding();
    const { activeGoal, refetch, deleteGoal, startSmartSession } = useStudyGoals();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('overview');
    const [isLoading, setIsLoading] = useState(true);
    const hasRefetched = useRef(false);

    const isPro = false; // TODO: Check from user subscription

    // Handle navigation from Pre-Test Results (auto-switch to Focus Mode) & Refetch
    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
        }
        // Only Refetch Once per navigation to prevent loop
        if (location.state?.shouldRefetch && !hasRefetched.current) {
            console.log("Dashboard: Refetching data as requested...");
            hasRefetched.current = true;
            refetch();

            // Optional: Clear state to clean up history (requires re-navigation or just ignoring)
            // But tracking via Ref is sufficient for this session.
        }
    }, [location.state, refetch]);

    useEffect(() => {
        try {
            trackPageView('Dashboard', 'dashboard');
            setIsLoading(false);
        } catch (error) {
            console.error('Dashboard error:', error);
            setIsLoading(false);
        }
    }, [trackPageView]);

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    // Error catch - if stats is undefined
    if (!stats) {
        console.warn('Stats not loaded yet');
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/50 via-slate-950 to-bg-slate-950 relative overflow-hidden pb-20">
            {/* Animated Background - Reduced */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"></div>
            </div>

            {/* Onboarding */}
            {isOnboarding && currentStep === 'deck_downloaded' && (
                <OnboardingSpotlight
                    targetSelector=".learning-now-button"
                    title="มาลองเรียนกันเลย! 🎉"
                    message="กดที่นี่เพื่อเริ่มเรียน"
                    position="bottom"
                    onNext={() => markStepComplete('tutorial_complete')}
                    onSkip={() => markStepComplete('tutorial_complete')}
                />
            )}

            <div className="container mx-auto px-4 py-2 relative z-10 max-w-7xl">

                {/* 1. Slim Header (Stats) */}
                <DashboardHeader />

                {/* 2. Hero Section (Focus Mode - The 'North Star') */}
                <div className="mt-2"> {/* Reduced Margin */}
                    <SM2FocusDashboard
                        activeGoal={activeGoal}
                        refetch={refetch}
                        deleteGoal={deleteGoal}
                        startSmartSession={startSmartSession}
                        loading={isLoading}
                    />
                </div>

                {/* 3. Secondary 'Playground' Grid */}
                <ArcadeGrid />

            </div>
        </div>
    );
}
