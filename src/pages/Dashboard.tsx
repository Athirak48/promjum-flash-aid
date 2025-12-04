import BackgroundDecorations from "@/components/BackgroundDecorations";

import { DailyDeckQuickStart } from "@/components/dashboard/DailyDeckQuickStart";
import { SuggestedDeck } from "@/components/dashboard/SuggestedDeck";
import { FriendsLeaderboard } from "@/components/dashboard/FriendsLeaderboard";
import { ScheduleCalendar } from "@/components/dashboard/ScheduleCalendar";
import { GoalsMotivation } from "@/components/dashboard/GoalsMotivation";
import { AITips } from "@/components/dashboard/AITips";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();

  // Mock data - in real app, fetch from backend
  const userStats = {
    streak: 7,
    starlightScore: 245,
    totalXP: 1250,
    wordsLearnedToday: 23,
    decksCompleted: 0,
    wordsLearned: 20,
    progressPercentage: 15,
    totalWords: 5000,
    subdecksCompleted: 0,
    totalSubdecks: 25
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-prompt">
      <BackgroundDecorations />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 relative z-10 max-w-7xl">

        {/* Quick Start & Friends Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {/* Daily Progress (Column 1-2) */}
          <div className="lg:col-span-2">
            <DailyDeckQuickStart
              streak={userStats.streak}
              totalXP={userStats.totalXP}
              wordsLearnedToday={userStats.wordsLearnedToday}
            />
          </div>

          {/* Friends Leaderboard (Column 3) */}
          <div className="h-full">
            <FriendsLeaderboard />
          </div>
        </div>

        {/* Calendar & Suggested Deck + Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          {/* Calendar (3/5 width) */}
          <div className="lg:col-span-3 animate-fade-in h-[700px]" style={{ animationDelay: '0.2s' }}>
            <ScheduleCalendar />
          </div>

          {/* Suggested Deck & Goals (2/5 width) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="animate-fade-in" style={{ animationDelay: '0.25s' }}>
              <SuggestedDeck />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <GoalsMotivation />
            </div>
          </div>
        </div>

        {/* AI Tips */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <AITips />
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-border/30 animate-fade-in" style={{ animationDelay: '0.8s' }}>
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