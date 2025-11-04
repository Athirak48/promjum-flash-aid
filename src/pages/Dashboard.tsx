import BackgroundDecorations from "@/components/BackgroundDecorations";
import { DailyDeckQuickStart } from "@/components/dashboard/DailyDeckQuickStart";
import { StreakProgress } from "@/components/dashboard/StreakProgress";
import { AIRecommendation } from "@/components/dashboard/AIRecommendation";
import { ScheduleCalendar } from "@/components/dashboard/ScheduleCalendar";
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 relative z-10 max-w-7xl">
        {/* Enhanced Header with User Info */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 p-6 rounded-2xl bg-gradient-to-br from-card/80 via-card/50 to-card/80 backdrop-blur-xl border border-border/50 shadow-lg">
            <div className="flex items-center gap-4 sm:gap-5">
              <Avatar className="h-14 w-14 sm:h-16 sm:w-16 lg:h-20 lg:w-20 ring-4 ring-primary/20 shadow-xl">
                <AvatarImage src="" alt={userProfile?.full_name} />
                <AvatarFallback className="text-lg sm:text-xl lg:text-2xl bg-gradient-primary text-primary-foreground font-bold">
                  {userProfile?.full_name?.charAt(0) || userProfile?.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-1">
                  สวัสดี, {userProfile?.full_name}! 👋
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground font-medium">พร้อมเรียนรู้สิ่งใหม่วันนี้แล้วหรือยัง?</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="h-6 w-6 text-muted-foreground cursor-pointer hover:text-primary transition-all duration-300 hover:scale-110" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* AI Tips */}
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <AITips />
        </div>

        {/* Main Grid Layout with improved spacing */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          {/* Daily Deck Quick Start */}
          <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <DailyDeckQuickStart />
          </div>

          {/* Streak & Progress */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <StreakProgress 
              streak={userStats.streak}
              starlightScore={userStats.starlightScore}
              decksCompleted={userStats.decksCompleted}
              wordsLearned={userStats.wordsLearned}
            />
          </div>
        </div>

        {/* Second Row with improved spacing */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          {/* Schedule Calendar */}
          <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <ScheduleCalendar />
          </div>

          {/* AI Recommendation */}
          <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <AIRecommendation />
          </div>
        </div>

        {/* Third Row with improved spacing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Quick Notes */}
          <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <QuickNotes />
          </div>

          {/* Mini Achievements */}
          <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <MiniAchievements />
          </div>
        </div>
      </div>
    </div>
  );
}
