import { useAuth } from "@/hooks/useAuth";
import { useUserStats } from "@/hooks/useUserStats";
import { useXP } from "@/hooks/useXP";
import { Flame, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function DashboardHeader() {
    const { user } = useAuth();
    const { stats } = useUserStats();
    const { xpData } = useXP();

    // Use real stats or fallbacks (Fix property access: streak_days -> streak, total_xp -> totalXP)
    const streak = stats?.streak || 0;
    const totalXP = xpData?.totalXP ?? stats?.totalXP ?? 0;

    return (
        <div className="flex items-center justify-between py-6 mb-4 gap-4">

            {/* LEFT: Stats & Profile (User requested to move all to left) */}
            <div className="flex items-center gap-6">
                {/* Avatar - Enhanced Glow */}
                <div className="relative group cursor-pointer hover:scale-110 transition-transform duration-500">
                    <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-full opacity-70 group-hover:opacity-100 blur-[8px] group-hover:blur-[12px] transition duration-500 animate-pulse-slow"></div>
                    <Avatar className="relative h-14 w-14 border-2 border-slate-950 shadow-[0_0_30px_rgba(168,85,247,0.6)] ring-2 ring-white/20">
                        <AvatarImage src={user?.user_metadata?.avatar_url} style={{ objectFit: 'cover' }} />
                        <AvatarFallback className="bg-slate-950 text-white font-bold text-xl border border-white/10">
                            {user?.user_metadata?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                    </Avatar>
                </div>

                {/* Stats Pills */}
                <div className="flex items-center gap-3">
                    {/* Streak Pill */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-orange-500/10 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)] backdrop-blur-sm cursor-help active:scale-95 transition-all hover:bg-orange-500/20 hover:border-orange-500/40"
                    >
                        <div className="p-1 rounded-full bg-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.3)]">
                            <Flame className="w-4 h-4 text-orange-400 fill-orange-400 animate-pulse" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-orange-500/80 leading-none tracking-wider mb-0.5">Streak</span>
                            <span className="text-base font-black text-orange-100 leading-none drop-shadow-md">{streak}</span>
                        </div>
                    </motion.div>

                    {/* XP Pill */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)] backdrop-blur-sm cursor-help active:scale-95 transition-all hover:bg-yellow-500/20 hover:border-yellow-500/40"
                    >
                        <div className="p-1 rounded-full bg-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.3)]">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-spin-slow" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-yellow-500/80 leading-none tracking-wider mb-0.5">XP</span>
                            <span className="text-base font-black text-yellow-100 leading-none drop-shadow-md">{totalXP.toLocaleString()}</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* RIGHT SECTION REMOVED */}
        </div>
    );
}
