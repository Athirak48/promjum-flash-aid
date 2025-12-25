import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Swords, Flame, Crown } from 'lucide-react';

interface University {
    id: string;
    name: string;
    short_name: string;
    total_score: number;
}

interface RivalryWidgetProps {
    userUniversityId: string;
}

export default function RivalryWidget({ userUniversityId }: RivalryWidgetProps) {
    const [userUni, setUserUni] = useState<University | null>(null);
    const [rivalUni, setRivalUni] = useState<University | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (userUniversityId) {
            fetchRivalry();
        }
    }, [userUniversityId]);

    const fetchRivalry = async () => {
        setIsLoading(true);
        try {
            // Get user's university with rival
            // @ts-ignore - Table will exist after migration
            const { data: userData, error: userError } = await supabase
                .from('universities')
                .select('*, rival:rival_id(*)')
                .eq('id', userUniversityId)
                .single();

            if (userError) throw userError;

            const uni = userData as unknown as University & { rival?: University };
            setUserUni(uni);
            if (uni?.rival) {
                setRivalUni(uni.rival);
            }
        } catch (error) {
            console.error('Error fetching rivalry:', error);
        } finally {
            setIsLoading(false);
        }
    };


    const formatScore = (score: number) => {
        if (score >= 1000000) return `${(score / 1000000).toFixed(1)}M`;
        if (score >= 1000) return `${(score / 1000).toFixed(0)}K`;
        return score.toString();
    };

    if (isLoading || !userUni || !rivalUni) {
        return null;
    }

    const isWinning = userUni.total_score > rivalUni.total_score;
    const scoreDiff = Math.abs(userUni.total_score - rivalUni.total_score);

    return (
        <Card className="border-0 shadow-xl overflow-hidden bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500">
            <CardContent className="p-0">
                {/* Header */}
                <div className="p-4 text-white text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Swords className="w-5 h-5" />
                        <h3 className="font-bold">คู่ปรับตลอดกาล</h3>
                    </div>
                </div>

                {/* VS Section */}
                <div className="bg-white dark:bg-slate-900 rounded-t-3xl p-4">
                    <div className="flex items-center justify-between gap-4">
                        {/* User's University */}
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="flex-1 text-center"
                        >
                            <div className={`relative inline-block ${isWinning ? 'scale-110' : ''}`}>
                                {isWinning && (
                                    <motion.div
                                        animate={{ y: [-2, 2, -2] }}
                                        transition={{ repeat: Infinity, duration: 1 }}
                                        className="absolute -top-6 left-1/2 -translate-x-1/2"
                                    >
                                        <Crown className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                                    </motion.div>
                                )}
                                <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center font-bold text-lg ${isWinning
                                    ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white'
                                    : 'bg-slate-100 text-slate-600'
                                    }`}>
                                    {userUni.short_name.slice(0, 2)}
                                </div>
                            </div>
                            <p className="font-bold text-sm mt-2 truncate">{userUni.short_name}</p>
                            <p className={`text-xl font-black ${isWinning ? 'text-green-500' : 'text-slate-700'}`}>
                                {formatScore(userUni.total_score)}
                            </p>
                        </motion.div>

                        {/* VS */}
                        <div className="flex flex-col items-center">
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-black text-sm shadow-lg"
                            >
                                VS
                            </motion.div>
                        </div>

                        {/* Rival University */}
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="flex-1 text-center"
                        >
                            <div className={`relative inline-block ${!isWinning ? 'scale-110' : ''}`}>
                                {!isWinning && (
                                    <motion.div
                                        animate={{ y: [-2, 2, -2] }}
                                        transition={{ repeat: Infinity, duration: 1 }}
                                        className="absolute -top-6 left-1/2 -translate-x-1/2"
                                    >
                                        <Crown className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                                    </motion.div>
                                )}
                                <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center font-bold text-lg ${!isWinning
                                    ? 'bg-gradient-to-br from-red-400 to-rose-500 text-white'
                                    : 'bg-slate-100 text-slate-600'
                                    }`}>
                                    {rivalUni.short_name.slice(0, 2)}
                                </div>
                            </div>
                            <p className="font-bold text-sm mt-2 truncate">{rivalUni.short_name}</p>
                            <p className={`text-xl font-black ${!isWinning ? 'text-red-500' : 'text-slate-700'}`}>
                                {formatScore(rivalUni.total_score)}
                            </p>
                        </motion.div>
                    </div>

                    {/* Status Message */}
                    <div className={`mt-4 p-3 rounded-xl text-center ${isWinning
                        ? 'bg-green-50 dark:bg-green-900/30'
                        : 'bg-red-50 dark:bg-red-900/30'
                        }`}>
                        <p className={`text-sm font-bold flex items-center justify-center gap-1 ${isWinning ? 'text-green-600' : 'text-red-600'
                            }`}>
                            <Flame className="w-4 h-4" />
                            {isWinning
                                ? `🔥 นำอยู่ ${formatScore(scoreDiff)} แต้ม!`
                                : `⚠️ ตามหลัง ${formatScore(scoreDiff)} แต้ม ต้องแบกทีม!`
                            }
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
