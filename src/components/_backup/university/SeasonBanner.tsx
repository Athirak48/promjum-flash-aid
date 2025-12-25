import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Snowflake, Timer, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SeasonBannerProps {
    seasonName: string;
    seasonType: 'summer' | 'winter';
    daysRemaining: number;
    onViewRanking?: () => void;
}

export default function SeasonBanner({
    seasonName,
    seasonType,
    daysRemaining,
    onViewRanking
}: SeasonBannerProps) {
    const isSummer = seasonType === 'summer';

    const gradientClass = isSummer
        ? 'from-orange-400 via-pink-500 to-rose-500'
        : 'from-blue-400 via-purple-500 to-indigo-500';

    const SeasonIcon = isSummer ? Sun : Snowflake;

    return (
        <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`bg-gradient-to-r ${gradientClass} rounded-2xl p-4 shadow-lg mb-6`}
        >
            <div className="flex items-center justify-between flex-wrap gap-4">
                {/* Season Title */}
                <div className="flex items-center gap-3">
                    <motion.div
                        animate={{ rotate: isSummer ? [0, 15, -15, 0] : [0, 360] }}
                        transition={{
                            duration: isSummer ? 2 : 8,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
                    >
                        <SeasonIcon className="w-7 h-7 text-white" />
                    </motion.div>
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tight">
                            {seasonName}
                        </h2>
                        <div className="flex items-center gap-2">
                            <Badge className="bg-white/20 text-white text-xs border-0">
                                <Trophy className="w-3 h-3 mr-1" />
                                University War
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Countdown */}
                <motion.div
                    className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2"
                    whileHover={{ scale: 1.05 }}
                >
                    <Timer className="w-4 h-4 text-white" />
                    <span className="text-white font-bold">
                        {daysRemaining} วันเหลือ
                    </span>
                    {daysRemaining <= 7 && (
                        <motion.span
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="text-lg"
                        >
                            🔥
                        </motion.span>
                    )}
                </motion.div>

                {/* View Ranking Button */}
                {onViewRanking && (
                    <motion.button
                        onClick={onViewRanking}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white text-purple-600 font-bold px-4 py-2 rounded-full text-sm shadow-lg hover:shadow-xl transition-shadow"
                    >
                        ดูอันดับ 🏆
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
}
