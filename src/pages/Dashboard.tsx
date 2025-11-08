import BackgroundDecorations from "@/components/BackgroundDecorations";
import { TopBar } from "@/components/dashboard/TopBar";
import { DailyDeckQuickStart } from "@/components/dashboard/DailyDeckQuickStart";
import { SuggestedDeck } from "@/components/dashboard/SuggestedDeck";
import { FriendsLeaderboard } from "@/components/dashboard/FriendsLeaderboard";
import { ScheduleCalendar } from "@/components/dashboard/ScheduleCalendar";
import { GoalsMotivation } from "@/components/dashboard/GoalsMotivation";
import { AITips } from "@/components/dashboard/AITips";
import { useAuth } from "@/hooks/useAuth";
export default function Dashboard() {
  const {
    user
  } = useAuth();
  const userProfile = user ? {
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || 'ผู้ใช้',
    role: user.app_metadata?.role || 'user',
    subscription: 'normal'
  } : null;

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
  return <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 relative overflow-hidden">
      <BackgroundDecorations />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 relative z-10 max-w-7xl">
        
        {/* แถว 1: Header / Top Bar */}
        <div className="mb-6 animate-fade-in">
          
        </div>

        {/* แถว 2: Quick Start & Friends Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 animate-fade-in" style={{
        animationDelay: '0.1s'
      }}>
          {/* Daily Progress (Column 1-2) */}
          <div className="lg:col-span-2">
            <DailyDeckQuickStart streak={userStats.streak} totalXP={userStats.totalXP} wordsLearnedToday={userStats.wordsLearnedToday} />
          </div>

          {/* Friends Leaderboard (Column 3) */}
          <div>
            <FriendsLeaderboard />
          </div>
        </div>

        {/* แถว 3: Calendar & Suggested Deck + Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {/* Calendar (Left Column) */}
          <div className="animate-fade-in" style={{
          animationDelay: '0.2s'
        }}>
            <ScheduleCalendar />
          </div>
          
          {/* Suggested Deck & Goals (Right Column) */}
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="animate-fade-in" style={{
            animationDelay: '0.25s'
          }}>
              <SuggestedDeck />
            </div>
            <div className="animate-fade-in" style={{
            animationDelay: '0.3s'
          }}>
              <GoalsMotivation />
            </div>
          </div>
        </div>

        {/* แถว 4: AI Tips */}
        <div className="mb-6 animate-fade-in" style={{
        animationDelay: '0.4s'
      }}>
          <AITips />
        </div>

        {/* แถว 8: Footer (Optional) */}
        <div className="mt-12 pt-6 border-t border-border/30 animate-fade-in" style={{
        animationDelay: '0.8s'
      }}>
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
    </div>;
}