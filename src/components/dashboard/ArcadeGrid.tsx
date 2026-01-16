import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Gamepad2, Swords, Globe, Crown, ArrowRight, Zap } from "lucide-react";
import { LearningFlowDialog } from "@/components/learning/LearningFlowDialog";
import { FriendsLeaderboard } from "@/components/dashboard/FriendsLeaderboard";
import { CreateJoinRoomDialog } from "@/components/multiplayer/CreateJoinRoomDialog";
import { useAnalytics } from "@/hooks/useAnalytics";
import { motion } from "framer-motion";

export function ArcadeGrid() {
    const navigate = useNavigate();
    const { trackButtonClick } = useAnalytics();

    // Dialog States
    const [showLearningFlow, setShowLearningFlow] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [showMultiplayer, setShowMultiplayer] = useState(false);

    const cards = [
        {
            title: "โหมดอิสระ",
            desc: "ฝึกซ้อมไร้ขีดจำกัด",
            stats: "XP สูงสุด: 1,240",
            icon: Gamepad2,
            action: () => {
                trackButtonClick("Free Play", "dashboard_arcade");
                setShowLearningFlow(true);
            },
            color: "text-cyan-400",
            bgHover: "hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:border-cyan-500/50",
            iconBg: "bg-cyan-500/10",
            delay: 0.1,
            colSpan: "col-span-1"
        },
        {
            title: "ประลองคำศัพท์",
            desc: "สร้างห้องแข่งกับเพื่อน",
            stats: "24 ห้องกำลังแข่ง 🔥",
            icon: Swords,
            action: () => {
                trackButtonClick("Multiplayer", "dashboard_arcade");
                setShowMultiplayer(true);
            },
            color: "text-pink-400",
            bgHover: "hover:shadow-[0_0_20px_rgba(236,72,153,0.2)] hover:border-pink-500/50",
            iconBg: "bg-pink-500/10",
            delay: 0.2,
            colSpan: "col-span-1"
        },
        {
            title: "แจกศัพท์ มช.", // CMU Vocab Giveaway
            desc: "คลิกเลย 👆", // Click Now
            stats: "ฟรี!", // FREE!
            icon: Crown,
            action: () => {
                trackButtonClick("CMU Promo", "dashboard_arcade");
                navigate("/decks");
            },
            // SUPER PROMINENT THEME - Vibrant Purple Gradient
            color: "text-white",
            bgHover: "hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] hover:scale-[1.02]",
            iconBg: "bg-white/20",
            delay: 0.3,
            colSpan: "col-span-2",
            isSpecial: true
        }
    ];

    return (
        <div className="mt-2"> {/* Reduced margin-top (was 8) */}
            <div className="flex items-center justify-between mb-3 px-1"> {/* Reduced margin-bottom */}
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-4 h-4 text-indigo-400" />
                    โซนฝึกซ้อม & แข่งขัน {/* Arcade Zone */}
                </h3>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: card.delay }}
                        className={`h-full ${card.colSpan || 'col-span-1'} ${(card as any).isSpecial ? 'col-span-2' : ''}`}
                    >
                        <div
                            className={`group relative h-full min-h-[100px] cursor-pointer overflow-hidden rounded-2xl border border-white/10 transition-all duration-500 shadow-xl ${card.bgHover} ${(card as any).isSpecial ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 border-none' : 'bg-[#0B0F19]'}`}
                            onClick={card.action}
                        >
                            {/* Ambient Background Glow (Standard Cards) */}
                            {!(card as any).isSpecial && (
                                <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br ${card.color.replace('text-', 'from-').replace('400', '600').replace('300', '600')} to-transparent`} />
                            )}

                            {/* Special Card Effects */}
                            {(card as any).isSpecial && (
                                <>
                                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/20 blur-[50px] rounded-full pointer-events-none group-hover:bg-white/30 transition-colors" />

                                    {/* Pulse Animation */}
                                    <div className="absolute inset-0 ring-4 ring-purple-400/20 rounded-2xl animate-pulse group-hover:ring-purple-300/40" />
                                </>
                            )}


                            {/* Standard Noise */}
                            {!(card as any).isSpecial && <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />}


                            <div className={`relative z-10 flex ${(card as any).isSpecial ? 'flex-row items-center justify-between px-6' : 'flex-col items-center justify-center text-center'} h-full p-3 space-y-2`}>

                                {(card as any).isSpecial ? (
                                    // Special PROMO Layout
                                    <>
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className="absolute -inset-2 bg-white/30 rounded-full blur-md animate-pulse" />
                                                <div className="relative p-2.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 shadow-inner">
                                                    <card.icon className="w-7 h-7 text-white drop-shadow-md" />
                                                </div>
                                            </div>

                                            <div className="text-left">
                                                <h4 className="font-black text-white text-2xl tracking-tight drop-shadow-sm group-hover:scale-105 transition-transform origin-left">
                                                    {card.title}
                                                </h4>
                                                <div className="inline-flex items-center gap-1.5 mt-0.5 bg-black/20 px-2.5 py-0.5 rounded-full backdrop-blur-sm border border-black/5">
                                                    <span className="text-[10px] text-white/90 font-bold uppercase tracking-wider">FREE</span>
                                                    <span className="text-[10px] text-white/80">แจกฟรี 100%</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Big CTA Button */}
                                        <div className="bg-white text-purple-700 rounded-xl px-6 py-2.5 text-base font-extrabold shadow-[0_4px_15px_rgba(0,0,0,0.1)] group-hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)] group-hover:scale-105 transition-all flex items-center gap-2 border-b-4 border-purple-200 group-active:border-b-0 group-active:translate-y-1">
                                            {card.desc}
                                        </div>
                                    </>
                                ) : (
                                    // Standard Vertical Layout
                                    <>
                                        {/* Large Floating Icon Box */}
                                        <div className={`relative p-3 rounded-2xl ${card.iconBg} backdrop-blur-md border border-white/5 ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                                            {/* Inner Glow */}
                                            <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr ${card.color.replace('text-', 'from-').replace('400', '500')}/20 to-transparent`} />

                                            <card.icon className={`w-5 h-5 ${card.color} drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]`} />

                                            {/* Notification Dot for Stats */}
                                            {idx === 1 && (
                                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0B0F19] animate-pulse" />
                                            )}
                                        </div>

                                        <div className="space-y-0.5">
                                            <h4 className="font-bold text-slate-100 text-base group-hover:text-white transition-colors">
                                                {card.title}
                                            </h4>
                                            <p className="text-[10px] text-slate-400 group-hover:text-slate-300 transition-colors line-clamp-1 px-1">
                                                {card.desc}
                                            </p>
                                        </div>

                                        {/* Stats Pill Removed */}
                                    </>
                                )}
                            </div>

                            {/* Hover Shine Effect */}
                            <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Learning Flow Dialog (Free Play) */}
            <LearningFlowDialog
                open={showLearningFlow}
                onOpenChange={setShowLearningFlow}
            />

            {/* Multiplayer Create/Join Dialog */}
            <CreateJoinRoomDialog
                open={showMultiplayer}
                onOpenChange={setShowMultiplayer}
                onRoomJoined={(code) => {
                    console.log("Joined Room:", code);
                    navigate(`/lobby/${code}`);
                }}
            />

            {/* Leaderboard Dialog */}
            <Dialog open={showLeaderboard} onOpenChange={setShowLeaderboard}>
                <DialogContent className="max-w-3xl bg-slate-950 border-white/10 p-0 overflow-hidden">
                    <FriendsLeaderboard isWidget={false} />
                </DialogContent>
            </Dialog>
        </div>
    );
}
