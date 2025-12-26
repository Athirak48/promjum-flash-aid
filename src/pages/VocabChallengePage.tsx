import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Lock, Unlock, Users, ArrowLeft, Sparkles, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const UNLOCK_GOAL = 1000;

export default function VocabChallengePage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [unlockCount, setUnlockCount] = useState(0);
    const [hasUnlocked, setHasUnlocked] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    // Load current count and check if user has unlocked
    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Get total unlock count
            const { count } = await supabase
                .from('vocab_challenge_unlocks')
                .select('*', { count: 'exact', head: true });

            setUnlockCount(count || 0);

            // Check if current user has unlocked
            if (user) {
                const { data } = await supabase
                    .from('vocab_challenge_unlocks')
                    .select('id')
                    .eq('user_id', user.id)
                    .single();

                setHasUnlocked(!!data);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUnlock = async () => {
        if (!user) {
            toast.error('กรุณาเข้าสู่ระบบก่อน');
            return;
        }

        if (hasUnlocked) {
            toast.info('คุณกดปลดล็อคไปแล้ว! 🔓');
            return;
        }

        setIsUnlocking(true);

        try {
            const { error } = await supabase
                .from('vocab_challenge_unlocks')
                .insert({ user_id: user.id });

            if (error) {
                if (error.code === '23505') {
                    toast.info('คุณกดปลดล็อคไปแล้ว!');
                    setHasUnlocked(true);
                } else {
                    throw error;
                }
            } else {
                setHasUnlocked(true);
                setUnlockCount(prev => prev + 1);
                setShowConfetti(true);
                toast.success('🔓 ขอบคุณที่ช่วยปลดล็อค!');
                setTimeout(() => setShowConfetti(false), 3000);
            }
        } catch (error) {
            console.error('Error unlocking:', error);
            toast.error('เกิดข้อผิดพลาด');
        } finally {
            setIsUnlocking(false);
        }
    };

    const progress = Math.min((unlockCount / UNLOCK_GOAL) * 100, 100);
    const isFullyUnlocked = unlockCount >= UNLOCK_GOAL;

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Mysterious Forest Background */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: `linear-gradient(to bottom, rgba(0,20,10,0.7), rgba(0,0,0,0.9)), url('https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920')`,
                    filter: 'brightness(0.5) saturate(0.7)'
                }}
            />

            {/* Fog/Mist Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/50 via-transparent to-slate-900/70" />

            {/* Back Button */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute top-4 left-4 z-20"
            >
                <Button
                    variant="ghost"
                    onClick={() => navigate('/dashboard')}
                    className="text-white/70 hover:text-white hover:bg-white/10 rounded-full px-4"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    กลับหน้าหลัก
                </Button>
            </motion.div>

            {/* Confetti Effect */}
            <AnimatePresence>
                {showConfetti && (
                    <div className="absolute inset-0 pointer-events-none z-50">
                        {['🔓', '✨', '🎉', '⭐', '🔑', '🏆'].map((emoji, i) => (
                            Array.from({ length: 5 }).map((_, j) => (
                                <motion.div
                                    key={`${i}-${j}`}
                                    initial={{
                                        opacity: 1,
                                        scale: 0,
                                        x: '50vw',
                                        y: '50vh'
                                    }}
                                    animate={{
                                        opacity: [1, 1, 0],
                                        scale: [0, 1.5, 1],
                                        x: `${50 + (Math.random() - 0.5) * 80}vw`,
                                        y: `${50 + (Math.random() - 0.5) * 80}vh`,
                                        rotate: [0, 180, 360]
                                    }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 2, delay: (i * 5 + j) * 0.05 }}
                                    className="absolute text-4xl"
                                >
                                    {emoji}
                                </motion.div>
                            ))
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="relative z-10 h-screen flex flex-col items-center justify-start p-4 pt-20">
                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-4"
                >
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-1 tracking-tight">
                        Vocab Challenge
                    </h1>
                    <p className="text-slate-400 text-sm">
                        โหมดลับ • กำลังจะเปิดให้เล่นเร็วๆ นี้
                    </p>
                </motion.div>

                {/* Gate with Padlock */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative flex-shrink-0"
                >
                    {/* Gate Frame - Larger size */}
                    <div className="relative w-72 h-80 md:w-80 md:h-[360px] rounded-t-[60px] border-6 border-slate-600 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 shadow-2xl overflow-hidden">
                        {/* Metallic Rivets */}
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-4 h-4 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 border border-slate-400 shadow-inner"
                                style={{
                                    top: i < 4 ? '20px' : 'auto',
                                    bottom: i >= 4 ? '20px' : 'auto',
                                    left: i % 2 === 0 ? '20px' : 'auto',
                                    right: i % 2 === 1 ? '20px' : 'auto',
                                }}
                            />
                        ))}

                        {/* Wooden Planks Effect */}
                        <div className="absolute inset-4 flex flex-col gap-1">
                            {[...Array(8)].map((_, i) => (
                                <div
                                    key={i}
                                    className="flex-1 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded border border-slate-500/30"
                                />
                            ))}
                        </div>

                        {/* Center Metal Strip */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-full bg-gradient-to-b from-slate-600 via-slate-500 to-slate-600 border-x border-slate-400/50 shadow-xl" />

                        {/* The Padlock - Centered */}
                        <motion.button
                            onClick={handleUnlock}
                            disabled={loading || isUnlocking || isFullyUnlocked}
                            whileTap={!hasUnlocked && !isFullyUnlocked ? { scale: 0.95 } : {}}
                            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 focus:outline-none transition-all duration-300 ${hasUnlocked ? 'cursor-default' : 'cursor-pointer'
                                }`}
                        >


                            {/* Padlock Body */}
                            <motion.div
                                animate={isUnlocking ? { rotate: [0, -10, 10, -10, 0] } : {}}
                                transition={{ duration: 0.5 }}
                                className={`relative w-24 h-28 md:w-32 md:h-36 rounded-b-xl shadow-2xl ${hasUnlocked
                                    ? 'bg-gradient-to-b from-emerald-500 to-emerald-700'
                                    : 'bg-gradient-to-b from-slate-500 to-slate-700'
                                    }`}
                            >
                                {/* Padlock Shackle */}
                                <motion.div
                                    animate={hasUnlocked ? { rotate: -30, y: -5, x: 8 } : {}}
                                    className={`absolute -top-10 left-1/2 -translate-x-1/2 w-16 h-14 md:w-20 md:h-16 border-8 rounded-t-full ${hasUnlocked
                                        ? 'border-emerald-400 origin-bottom-left'
                                        : 'border-slate-400'
                                        }`}
                                    style={{ borderBottom: 'none' }}
                                />

                                {/* Keyhole */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-slate-900 shadow-inner" />
                                    <div className="w-3 h-6 md:w-4 md:h-8 bg-slate-900 mx-auto -mt-1 rounded-b" />
                                </div>

                                {/* Shine Effect */}
                                <div className="absolute top-2 left-2 w-4 h-4 md:w-6 md:h-6 rounded-full bg-white/20" />
                            </motion.div>
                        </motion.button>
                    </div>

                    {/* Door Handles */}
                    <div className="absolute top-1/2 left-4 -translate-y-1/2 w-4 h-12 bg-gradient-to-r from-slate-500 to-slate-600 rounded-full shadow-lg" />
                    <div className="absolute top-1/2 right-4 -translate-y-1/2 w-4 h-12 bg-gradient-to-l from-slate-500 to-slate-600 rounded-full shadow-lg" />
                </motion.div>

                {/* Progress Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-4 text-center w-full max-w-sm"
                >
                    {/* Counter */}
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-slate-400" />
                        <div className="text-3xl font-black text-white">
                            {loading ? '...' : unlockCount.toLocaleString()}
                            <span className="text-slate-500 text-xl">/{UNLOCK_GOAL.toLocaleString()}</span>
                        </div>
                        <span className="text-slate-400">คน</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-6 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className={`absolute inset-y-0 left-0 rounded-full ${isFullyUnlocked
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                : 'bg-gradient-to-r from-amber-500 to-orange-500'
                                }`}
                        />
                        {/* Percentage Text */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-xs font-bold text-white drop-shadow-md">
                                {progress.toFixed(3)}%
                            </span>
                        </div>
                    </div>

                    {/* Status Text */}
                    <p className="mt-2 text-slate-400 text-sm">
                        {isFullyUnlocked ? (
                            <span className="text-emerald-400 font-bold flex items-center justify-center gap-2">
                                <Unlock className="w-4 h-4" />
                                ปลดล็อคแล้ว!
                            </span>
                        ) : hasUnlocked ? (
                            <span className="text-amber-400 flex items-center justify-center gap-1">
                                <Sparkles className="w-4 h-4" />
                                คุณช่วยปลดล็อคแล้ว!
                            </span>
                        ) : (
                            <span>กดแม่กุญแจเพื่อช่วยปลดล็อค</span>
                        )}
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
