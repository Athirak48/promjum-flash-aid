import { useRef } from "react";
import { DailyDeckQuickStart } from "@/components/dashboard/DailyDeckQuickStart";
import { SuggestedDeck } from "@/components/dashboard/SuggestedDeck";
import { FriendsLeaderboard } from "@/components/dashboard/FriendsLeaderboard";
import { AITips } from "@/components/dashboard/AITips";
import { TodaySchedule } from "@/components/dashboard/TodaySchedule";
import SM2FocusDashboard from "@/components/dashboard/SM2FocusDashboard";
import { useAuth } from "@/hooks/useAuth";
import { useUserStats } from "@/hooks/useUserStats";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useStudyGoals } from "@/hooks/useStudyGoals";
import { OnboardingSpotlight } from "@/components/onboarding/OnboardingSpotlight";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Sparkles, TrendingUp, Target, Users, BookOpen, Award, Brain } from "lucide-react";
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

    const isPro = false; // TODO: Check from user subscription

    // Handle navigation from Pre-Test Results (auto-switch to Focus Mode)
    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
        }
    }, [location.state]);

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
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
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

            <div className="container mx-auto px-3 py-2 relative z-10 max-w-7xl">
                {/* Compact Header */}


                {/* Compact Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-2">
                    <TabsList className="grid w-full grid-cols-3 bg-slate-900/50 backdrop-blur-xl border border-white/10">
                        <TabsTrigger value="overview" className="text-sm">
                            <TrendingUp className="mr-1 h-4 w-4" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="focus" className="text-sm">
                            <Brain className="mr-1 h-4 w-4" />
                            Focus Mode
                        </TabsTrigger>
                        <TabsTrigger value="social" className="text-sm">
                            <Users className="mr-1 h-4 w-4" />
                            Social
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab - OPTIMIZED FOR SINGLE SCREEN */}
                    <TabsContent value="overview" className="mt-0">
                        <div className="scale-[0.85] origin-top">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                                {/* Main Section */}
                                <div className="lg:col-span-2">
                                    <DailyDeckQuickStart
                                        streak={stats?.streak || 0}
                                        totalXP={stats?.totalXP || 0}
                                        wordsLearnedToday={stats?.wordsLearnedToday || 0}
                                        wordsLearned={stats?.wordsLearned || 0}
                                        timeSpentToday={stats?.timeSpentToday || 0}
                                        ranking={stats?.ranking || 0}
                                    />
                                </div>

                                {/* Sidebar */}
                                <div className="space-y-2">
                                    <TodaySchedule
                                        activeGoal={activeGoal}
                                        refetch={refetch}
                                        deleteGoal={deleteGoal}
                                        startSmartSession={startSmartSession}
                                    />
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Focus Mode Tab - FULLY FUNCTIONAL */}
                    <TabsContent value="focus" className="mt-4">
                        <SM2FocusDashboard
                            activeGoal={activeGoal}
                            refetch={refetch}
                            deleteGoal={deleteGoal}
                            startSmartSession={startSmartSession}
                            loading={isLoading}
                        />
                    </TabsContent>

                    {/* Social */}
                    <TabsContent value="social" className="mt-0">
                        <Card className="bg-slate-900/50 backdrop-blur-xl border-white/10">
                            <CardHeader className="p-4">
                                <CardTitle className="text-white">Friends & Leaderboard</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <FriendsLeaderboard isWidget={false} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
