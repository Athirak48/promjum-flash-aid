import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Flame, Star, TrendingUp } from "lucide-react";

interface TopBarProps {
  userProfile: {
    full_name: string;
    email: string;
    avatar_url?: string;
  } | null;
  streak: number;
  starlightScore: number;
  progressPercentage: number;
}

export function TopBar({ userProfile, streak, starlightScore, progressPercentage }: TopBarProps) {
  return (
    <div className="bg-gradient-to-br from-card/80 via-card/50 to-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-4 sm:p-6 shadow-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src="/src/assets/promjum-logo.png" alt="Promjum" className="h-10 w-10 sm:h-12 sm:w-12" />
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Promjum
          </h1>
        </div>

        {/* Quick Stats Mini */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Streak */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
            <Flame className="h-5 w-5 text-orange-500" />
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{streak}</div>
              <div className="text-xs text-muted-foreground">วัน</div>
            </div>
          </div>

          {/* Starlight Score */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
            <Star className="h-5 w-5 text-primary" />
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{starlightScore}</div>
              <div className="text-xs text-muted-foreground">XP</div>
            </div>
          </div>

          {/* Progress Circle */}
          <div className="relative flex items-center justify-center">
            <svg className="w-14 h-14 transform -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="24"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-muted/20"
              />
              <circle
                cx="28"
                cy="28"
                r="24"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 24}`}
                strokeDashoffset={`${2 * Math.PI * 24 * (1 - progressPercentage / 100)}`}
                className="text-primary transition-all duration-300"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-foreground">{progressPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Avatar + User Info */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="h-6 w-6 text-muted-foreground cursor-pointer hover:text-primary transition-all duration-300 hover:scale-110" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full animate-pulse" />
          </div>
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-primary/20">
            <AvatarImage src={userProfile?.avatar_url} alt={userProfile?.full_name} />
            <AvatarFallback className="text-sm bg-gradient-primary text-primary-foreground font-bold">
              {userProfile?.full_name?.charAt(0) || userProfile?.email.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-foreground">{userProfile?.full_name}</p>
            <p className="text-xs text-muted-foreground">{userProfile?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
