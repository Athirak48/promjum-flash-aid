import BackgroundDecorations from "@/components/BackgroundDecorations";
import { DailyDeckQuickStart } from "@/components/dashboard/DailyDeckQuickStart";
import { StreakProgress } from "@/components/dashboard/StreakProgress";
import { AIRecommendation } from "@/components/dashboard/AIRecommendation";
import { WeeklyCalendar } from "@/components/dashboard/WeeklyCalendar";
import { QuickNotes } from "@/components/dashboard/QuickNotes";
import { MiniAchievements } from "@/components/dashboard/MiniAchievements";
import { AITips } from "@/components/dashboard/AITips";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();

  const userProfile = user ? {
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || 'ผู้ใช้',
    role: user.app_metadata?.role || 'user',
    subscription: 'normal'
  } : null;

  // Mock data - in real app, fetch from backend
  const userStats = {
    streak: 1,
    starlightScore: 245,
    decksCompleted: 0,
    wordsLearned: 20
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 relative overflow-hidden">
      <BackgroundDecorations />
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header with User Info */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-primary/20">
              <AvatarImage src="" alt={userProfile?.full_name} />
              <AvatarFallback className="text-lg bg-gradient-primary text-primary-foreground">
                {userProfile?.full_name?.charAt(0) || userProfile?.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                สวัสดี, {userProfile?.full_name}! 👋
              </h1>
              <p className="text-muted-foreground">พร้อมเรียนรู้สิ่งใหม่วันนี้แล้วหรือยัง?</p>
            </div>
          </div>
          <Bell className="h-6 w-6 text-muted-foreground cursor-pointer hover:text-primary transition-colors" />
        </div>

        {/* AI Tips */}
        <div className="mb-6">
          <AITips />
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Daily Deck Quick Start - Full Width on Mobile, Spans 2 cols on Desktop */}
          <div className="lg:col-span-2">
            <DailyDeckQuickStart />
          </div>

          {/* Streak & Progress */}
          <div>
            <StreakProgress 
              streak={userStats.streak}
              starlightScore={userStats.starlightScore}
              decksCompleted={userStats.decksCompleted}
              wordsLearned={userStats.wordsLearned}
            />
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Weekly Calendar - Spans 2 cols */}
          <div className="lg:col-span-2">
            <WeeklyCalendar />
          </div>

          {/* AI Recommendation */}
          <div>
            <AIRecommendation />
          </div>
        </div>

        {/* Third Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Notes */}
          <div>
            <QuickNotes />
          </div>

          {/* Mini Achievements */}
          <div>
            <MiniAchievements />
          </div>
        </div>
      </div>
    </div>
  );
}
