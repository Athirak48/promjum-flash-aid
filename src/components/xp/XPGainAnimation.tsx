import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Zap, Crown, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface XPGainAnimationProps {
    amount: number;
    levelUp?: boolean;
    newLevel?: number;
    onComplete?: () => void;
}

export function XPGainAnimation({
    amount,
    levelUp = false,
    newLevel,
    onComplete
}: XPGainAnimationProps) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        // Trigger confetti for level up
        if (levelUp) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#a855f7', '#ec4899', '#f59e0b', '#10b981'],
            });
        }

        // Auto-hide after animation
        const timer = setTimeout(() => {
            setVisible(false);
            onComplete?.();
        }, levelUp ? 3000 : 1500);

        return () => clearTimeout(timer);
    }, [levelUp, onComplete]);

    if (amount <= 0) return null;

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -30, scale: 0.5 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="fixed top-20 right-4 z-[9999] pointer-events-none"
                >
                    {/* XP Gain Popup */}
                    <motion.div
                        className={`
              px-6 py-3 rounded-2xl backdrop-blur-xl border shadow-2xl
              ${levelUp
                                ? 'bg-gradient-to-r from-amber-500/90 to-orange-500/90 border-amber-300/50'
                                : 'bg-gradient-to-r from-purple-500/90 to-pink-500/90 border-purple-300/50'
                            }
            `}
                        animate={{
                            boxShadow: levelUp
                                ? ['0 0 20px rgba(251,191,36,0.5)', '0 0 40px rgba(251,191,36,0.8)', '0 0 20px rgba(251,191,36,0.5)']
                                : ['0 0 20px rgba(168,85,247,0.5)', '0 0 30px rgba(168,85,247,0.7)', '0 0 20px rgba(168,85,247,0.5)']
                        }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                    >
                        <div className="flex items-center gap-3">
                            {/* Icon */}
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.5, repeat: 2 }}
                            >
                                {levelUp ? (
                                    <Crown className="w-7 h-7 text-white drop-shadow-lg" />
                                ) : (
                                    <Zap className="w-6 h-6 text-white drop-shadow-lg" />
                                )}
                            </motion.div>

                            {/* Text */}
                            <div className="flex flex-col">
                                <motion.span
                                    className="text-lg font-black text-white drop-shadow-md"
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 0.3 }}
                                >
                                    +{amount} XP
                                </motion.span>
                                {levelUp && newLevel && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="text-xs font-bold text-amber-100"
                                    >
                                        🎉 Level Up! Lv.{newLevel}
                                    </motion.span>
                                )}
                            </div>

                            {/* Sparkles for level up */}
                            {levelUp && (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                >
                                    <Sparkles className="w-5 h-5 text-amber-200" />
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    {/* Floating particles */}
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute text-xl"
                            initial={{
                                opacity: 1,
                                x: 0,
                                y: 0,
                            }}
                            animate={{
                                opacity: 0,
                                x: (Math.random() - 0.5) * 100,
                                y: -50 - Math.random() * 30,
                            }}
                            transition={{
                                duration: 1 + Math.random() * 0.5,
                                delay: i * 0.1,
                            }}
                            style={{
                                left: `${20 + Math.random() * 60}%`,
                                top: '50%',
                            }}
                        >
                            {levelUp ? '⭐' : '✨'}
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Mini badge for inline XP display
export function XPBadge({ xp, level }: { xp: number; level: number }) {
    return (
        <div className="flex items-center gap-2">
            {/* Level Badge */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-black shadow-lg">
                <Star className="w-3 h-3 fill-current" />
                Lv.{level}
            </div>

            {/* XP Count */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold shadow-lg">
                <Zap className="w-3 h-3" />
                {xp.toLocaleString()} XP
            </div>
        </div>
    );
}

// Progress bar for XP
export function XPProgressBar({
    current,
    max = 100,
    level
}: {
    current: number;
    max?: number;
    level: number;
}) {
    const progress = Math.min((current / max) * 100, 100);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white/80">Level {level}</span>
                <span className="text-xs font-medium text-white/60">
                    {current}/{max} XP
                </span>
            </div>
            <div className="h-2.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-400 rounded-full relative"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                    {/* Shine effect */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                </motion.div>
            </div>
        </div>
    );
}
