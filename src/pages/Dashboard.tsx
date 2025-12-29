import { DailyDeckQuickStart } from "@/components/dashboard/DailyDeckQuickStart";
import { SuggestedDeck } from "@/components/dashboard/SuggestedDeck";
import { FriendsLeaderboard } from "@/components/dashboard/FriendsLeaderboard";
// import { ScheduleCalendar } from "@/components/dashboard/ScheduleCalendar"; // Removed - backed up to _backup folder
import { GoalsMotivation } from "@/components/dashboard/GoalsMotivation";
import { AITips } from "@/components/dashboard/AITips";
import { useAuth } from "@/hooks/useAuth";
import { useUserStats } from "@/hooks/useUserStats";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useEffect } from "react";
import { useOnboarding } from "@/hooks/useOnboarding";
import { OnboardingSpotlight } from "@/components/onboarding/OnboardingSpotlight";

export default function Dashboard() {
    const { user } = useAuth();
    const { stats } = useUserStats();
    const { trackPageView } = useAnalytics();
    const { isOnboarding, currentStep, markStepComplete } = useOnboarding();

    useEffect(() => {
        trackPageView('Dashboard', 'dashboard');
    }, [trackPageView]);


    return (
        <div className="min-h-screen bg-transparent relative overflow-hidden font-prompt">
            {/* Onboarding Spotlight for Learning Now */}
            {isOnboarding && currentStep === 'deck_downloaded' && (
                <OnboardingSpotlight
                    targetSelector=".learning-now-button"
                    title="มาลองเรียนกันเลย! 🎉"
                    message="กดที่นี่เพื่อเริ่มเรียนคำศัพท์ที่คุณเพิ่งดาวน์โหลด ระบบจะพาคุณฝึกฝนอย่างมีประสิทธิภาพ"
                    position="bottom"
                    onNext={() => markStepComplete('tutorial_complete')}
                    onSkip={() => markStepComplete('tutorial_complete')}
                />
            )}

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 relative z-10 max-w-7xl">

                {/* Quick Start & Friends Leaderboard */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    {/* Daily Progress (Column 1-2) */}
                    <div className="lg:col-span-2">
                        <DailyDeckQuickStart
                            streak={stats.streak}
                            totalXP={stats.totalXP}
                            wordsLearnedToday={stats.wordsLearnedToday}
                            wordsLearned={stats.wordsLearned}
                            timeSpentToday={stats.timeSpentToday}
                            ranking={stats.ranking}
                        />
                    </div>

                    {/* Friends Leaderboard (Column 3) */}
                    <div className="h-full">
                        <FriendsLeaderboard />
                    </div>
                </div>

                {/* Suggested Deck & Goals - Updated layout without Calendar */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        <SuggestedDeck />
                    </div>
                    <div className="animate-fade-in" style={{ animationDelay: '0.25s' }}>
                        <GoalsMotivation />
                    </div>
                </div>

                {/* AI Tips */}
                <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <AITips />
                </div>

                {/* Footer */}
                <div className="mt-12 pt-6 border-t border-border/30 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                        <p>© 2024 Promjum. All rights reserved.</p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="hover:text-primary transition-colors">About</a>
                            <a href="#" className="hover:text-primary transition-colors">Contact</a>
                            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
