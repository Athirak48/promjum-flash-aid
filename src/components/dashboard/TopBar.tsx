import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Flame, Star } from "lucide-react";
import promjumLogo from "@/assets/promjum-logo.png";

interface TopBarProps {
  userProfile: {
    full_name: string;
    email: string;
    avatar_url?: string;
  } | null;
  streak?: number;
  starlightScore?: number;
  progressPercentage?: number;
  user?: any; // For compatibility if passed directly
}

export function TopBar({ userProfile, streak = 0, starlightScore = 0, progressPercentage = 0, user }: TopBarProps) {
  // Fallback if userProfile is null but user object is passed (or handle gracefully)
  const displayProfile = userProfile || (user ? {
    full_name: user.user_metadata?.full_name || 'User',
    email: user.email,
    avatar_url: user.user_metadata?.avatar_url
  } : null);

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-[2rem] p-4 sm:p-6 shadow-soft hover:shadow-lg transition-all duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src={promjumLogo} alt="Promjum" className="h-10 w-10 sm:h-12 sm:w-12 object-contain" />
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Promjum
          </h1>
        </div>

        {/* Quick Stats Mini */}
        <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end">
          {/* Streak */}
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-2xl border border-orange-100">
            <Flame className="h-5 w-5 text-orange-500 fill-orange-500" />
            <div className="text-center">
              <div className="text-lg font-bold text-orange-700 leading-none">{streak}</div>
              <div className="text-[10px] text-orange-600 font-medium">DAYS</div>
            </div>
          </div>

          {/* Starlight Score */}
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 rounded-2xl border border-yellow-100">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-700 leading-none">{starlightScore}</div>
              <div className="text-[10px] text-yellow-600 font-medium">XP</div>
            </div>
          </div>

          {/* Progress Circle */}
          <div className="relative flex items-center justify-center">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-muted/20"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - progressPercentage / 100)}`}
                className="text-primary transition-all duration-300"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold text-foreground">{progressPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Avatar + User Info */}
        <div className="hidden md:flex items-center gap-3 pl-4 border-l border-border/50">
          <div className="relative group">
            <Bell className="h-6 w-6 text-muted-foreground cursor-pointer hover:text-primary transition-all duration-300 group-hover:scale-110" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white" />
          </div>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-primary/20 transition-transform hover:scale-105">
              <AvatarImage src={displayProfile?.avatar_url} alt={displayProfile?.full_name} />
              <AvatarFallback className="text-sm bg-primary/10 text-primary font-bold">
                {displayProfile?.full_name?.charAt(0) || displayProfile?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="hidden lg:block">
              <p className="text-sm font-bold text-foreground leading-none mb-1">{displayProfile?.full_name}</p>
              <p className="text-xs text-muted-foreground">{displayProfile?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
