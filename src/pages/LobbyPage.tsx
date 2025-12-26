import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Egg, Sparkles, Trophy, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

export default function LobbyPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [count, setCount] = useState(0);
    const [hasJoined, setHasJoined] = useState(false);
    const [loading, setLoading] = useState(true);
    const [clicking, setClicking] = useState(false);
    const GOAL = 10000;

    useEffect(() => {
        fetchStats();

        // Real-time subscription
        const channel = supabase
            .channel('lobby_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'lobby_activities' }, () => {
                fetchStats();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const fetchStats = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase.rpc('get_lobby_stats', { p_user_id: user.id });
            if (data && data[0]) {
                setCount(data[0].total_count);
                setHasJoined(data[0].has_joined);
            }
        } catch (err) {
            console.error('Error fetching lobby stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleClick = async () => {
        if (!user || hasJoined || clicking) return;

        setClicking(true);
        triggerConfetti();

        // Optimistic update
        setCount(prev => prev + 1);
        setHasJoined(true);

        try {
            const { data, error } = await supabase.rpc('join_lobby_event', { p_user_id: user.id });

            if (data && data[0]) {
                if (data[0].success) {
                    toast({
                        title: "🎉 เย้! ร่วมกิจกรรมสำเร็จ",
                        description: "คุณได้ช่วยทุบไข่แล้ว! 🔨🥚",
                    });
                } else if (data[0].message === 'Already joined') {
                    // Sync back if mismatch
                    fetchStats();
                }
            }
        } catch (err) {
            console.error('Error joining lobby:', err);
            // Revert on error
            setHasJoined(false);
            setCount(prev => prev - 1);
            toast({
                title: "❌ เกิดข้อผิดพลาด",
                description: "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่",
                variant: "destructive"
            });
        } finally {
            setClicking(false);
        }
    };

    const triggerConfetti = () => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    return (
        <div className="h-[calc(100vh-4rem)] bg-[#0f0a1f] relative overflow-hidden flex flex-col items-center justify-center p-4">

            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0f0a1f] to-[#0f0a1f]" />
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[100px]" />
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]" />

                {/* Floating particles */}
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white/20 rounded-full"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -20, 0],
                            opacity: [0.2, 0.5, 0.2],
                        }}
                        transition={{
                            duration: Math.random() * 3 + 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 w-full max-w-4xl mx-auto text-center flex flex-col h-full justify-between py-6">

                {/* Header - Compact */}
                <div className="space-y-2 flex-none">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-2"
                    >
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        <span className="text-xs font-medium text-purple-100">Lobby Event 2025</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]"
                    >
                        Big Egg Smash!
                    </motion.h1>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col items-center gap-1 mt-2"
                    >
                        <p className="text-lg text-slate-300 font-medium">
                            ช่วยกันทุบไข่เพื่อปลดล็อครางวัลพิเศษ!
                        </p>
                        <p className="text-sm text-slate-500 font-normal bg-black/20 px-3 py-0.5 rounded-full border border-white/5 backdrop-blur-sm">
                            (1 คลิก = 1 แต้ม ต่อ 1 บัญชี)
                        </p>
                    </motion.div>
                </div>

                {/* Main Interaction Area - Flexible */}
                <div className="flex-1 flex items-center justify-center min-h-0 relative">

                    {/* The Egg & Surprise */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            className="relative cursor-pointer group"
                            whileHover={!hasJoined ? { scale: 1.05 } : {}}
                            whileTap={!hasJoined ? { scale: 0.95 } : {}}
                            onClick={handleClick}
                        >
                            {/* Glow behind egg */}
                            <div className={`absolute inset-0 rounded-full blur-[60px] animate-pulse transition-colors duration-500 ${hasJoined ? 'bg-purple-500/40' : 'bg-yellow-500/20'}`} />

                            {/* Surprise Character (Hidden initially, appears when cracked) */}
                            {hasJoined && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 260,
                                        damping: 20,
                                        delay: 0.2
                                    }}
                                    className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
                                >
                                    <div className="relative w-48 h-48 md:w-64 md:h-64">
                                        <img
                                            src="/mascots/purple_monkey_no_bg.png"
                                            alt="Surprise Mascot"
                                            className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]"
                                        />
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ delay: 0.5, repeat: Infinity, repeatDelay: 2 }}
                                            className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 font-bold px-4 py-1.5 rounded-full text-sm shadow-lg rotate-12"
                                        >
                                            Rare!
                                        </motion.div>
                                    </div>
                                </motion.div>
                            )}

                            {/* The Egg Container */}
                            <div className="relative w-56 h-72 md:w-64 md:h-80 drop-shadow-2xl filter">
                                {/* Top Half */}
                                <motion.div
                                    animate={hasJoined ? {
                                        y: -50,
                                        rotate: -10,
                                        scale: 0.9,
                                        opacity: 0
                                    } : {}}
                                    transition={{ duration: 0.8, ease: "backOut" }}
                                    className="absolute top-0 left-0 w-full h-[55%] z-10 overflow-hidden origin-bottom-left"
                                >
                                    <div className={`w-full h-[182%] rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%]
                                        border-4 border-white/30 
                                        bg-[radial-gradient(circle_at_30%_30%,_var(--tw-gradient-stops))] from-pink-400 via-purple-600 to-indigo-900
                                        shadow-[inset_-10px_-10px_30px_rgba(0,0,0,0.5),_inset_10px_10px_30px_rgba(255,255,255,0.4)]
                                        relative
                                    `}>
                                        {/* Magical Texture (Scales/Spots) */}
                                        <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay" />

                                        {/* Glossy Highlights */}
                                        <div className="absolute top-[15%] left-[15%] w-[40%] h-[25%] bg-gradient-to-br from-white/60 to-transparent rounded-full blur-md transform -rotate-12" />
                                        <div className="absolute top-[20%] left-[20%] w-[10%] h-[8%] bg-white/90 rounded-full blur-[1px]" />

                                        {/* Magical Glows */}
                                        <div className="absolute bottom-[20%] right-[20%] w-20 h-20 bg-pink-500/30 rounded-full blur-xl animate-pulse" />
                                        <motion.div
                                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                                            transition={{ duration: 3, repeat: Infinity }}
                                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-t from-purple-500/20 to-transparent mix-blend-screen"
                                        />
                                    </div>
                                </motion.div>

                                {/* Bottom Half */}
                                <motion.div
                                    animate={hasJoined ? {
                                        y: 50,
                                        rotate: 10,
                                        scale: 0.9,
                                        opacity: 0
                                    } : {}}
                                    transition={{ duration: 0.8, ease: "backOut" }}
                                    className="absolute bottom-0 left-0 w-full h-[45%] z-10 overflow-hidden origin-top-right"
                                >
                                    <div className={`absolute bottom-0 w-full h-[222%] rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%] 
                                        border-4 border-white/30 
                                        bg-[radial-gradient(circle_at_30%_30%,_var(--tw-gradient-stops))] from-pink-400 via-purple-600 to-indigo-900
                                        shadow-[inset_-10px_-10px_30px_rgba(0,0,0,0.5),_inset_10px_10px_30px_rgba(255,255,255,0.4)]
                                    `}>
                                        <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay" />

                                        {/* Reflection from ground */}
                                        <div className="absolute bottom-0 left-[20%] right-[20%] h-10 bg-purple-400/20 blur-xl" />
                                    </div>
                                </motion.div>

                                {/* Crack Line */}
                                <AnimatePresence>
                                    {!hasJoined && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute top-[54%] left-0 w-full h-[2px] bg-indigo-950/30 z-20 blur-[0.5px]"
                                            style={{ borderRadius: '50%' }}
                                        />
                                    )}
                                </AnimatePresence>

                                {/* Magical Floating Particles around Egg */}
                                {!hasJoined && (
                                    <>
                                        {[...Array(6)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                className="absolute w-2 h-2 bg-yellow-200 rounded-full blur-[1px] z-30"
                                                initial={{
                                                    x: Math.random() * 200 - 100,
                                                    y: Math.random() * 200 - 100,
                                                    opacity: 0
                                                }}
                                                animate={{
                                                    y: [null, -50],
                                                    opacity: [0, 1, 0],
                                                    scale: [0, 1.5, 0]
                                                }}
                                                transition={{
                                                    duration: 2 + Math.random(),
                                                    repeat: Infinity,
                                                    delay: Math.random() * 2
                                                }}
                                                style={{ left: '50%', top: '50%' }}
                                            />
                                        ))}
                                    </>
                                )}
                            </div>

                            {/* Status Badge */}
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-full">
                                {hasJoined ? (
                                    <motion.span
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.8 }}
                                        className="px-4 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/50 text-purple-300 font-bold text-sm shadow-[0_0_15px_rgba(168,85,247,0.3)] whitespace-nowrap block text-center"
                                    >
                                        You found a friend! 🐵
                                    </motion.span>
                                ) : (
                                    <span className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white font-bold text-sm animate-bounce whitespace-nowrap block text-center">
                                        Click to Hatched! 🥚
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                </div>

                {/* Progress Bar & Stats - Compact */}
                <div className="w-full max-w-xl mx-auto space-y-3 flex-none pb-4">
                    <div className="flex justify-between items-end text-white px-2">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-purple-400" />
                            <span className="font-bold text-lg">{count.toLocaleString()}</span>
                            <span className="text-slate-400 text-xs">/ {GOAL.toLocaleString()} Users</span>
                        </div>
                        <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                            {count >= GOAL ? "GOAL REACHED!" : `${((count / GOAL) * 100).toFixed(3)}%`}
                        </div>
                    </div>

                    <div className="h-4 w-full bg-slate-800/50 rounded-full p-0.5 border border-white/10 backdrop-blur-sm relative overflow-hidden">
                        {/* Progress Fill */}
                        <motion.div
                            className={`h-full rounded-full relative overflow-hidden ${count >= GOAL ? 'bg-gradient-to-r from-green-500 via-emerald-400 to-teal-500' : 'bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((count / GOAL) * 100, 100)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        >
                            {/* Shimmer effect */}
                            <motion.div
                                className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            />
                        </motion.div>
                    </div>

                    <p className="text-slate-500 text-xs">
                        {count >= GOAL ? "สุดยอด! เรามาดูกันว่าจะไปได้ไกลแค่ไหน 🚀" : `เมื่อครบ ${GOAL.toLocaleString()} คน จะปลดล็อคฟีเจอร์ใหม่ให้กับทุกคน!`}
                    </p>
                </div>

            </div>
        </div>
    );
}
