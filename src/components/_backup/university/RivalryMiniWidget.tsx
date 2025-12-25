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

interface RivalryMiniWidgetProps {
    userUniversityId: string;
}

export default function RivalryMiniWidget({ userUniversityId }: RivalryMiniWidgetProps) {
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

    return (
        <Card className="border-0 shadow-xl overflow-hidden">
            <CardContent className="p-0">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-500 to-orange-500 p-3 text-white text-center">
                    <div className="flex items-center justify-center gap-2">
                        <Swords className="w-4 h-4" />
                        <span className="font-bold text-sm">คู่ปรับ</span>
                        <Flame className="w-4 h-4" />
                    </div>
                </div>

                {/* VS Display */}
                <div className="bg-white dark:bg-slate-900 p-4">
                    <div className="flex items-center justify-between">
                        {/* User's Uni */}
                        <div className="text-center flex-1">
                            {isWinning && (
                                <motion.div
                                    animate={{ y: [-2, 2, -2] }}
                                    transition={{ repeat: Infinity, duration: 1 }}
                                    className="flex justify-center mb-1"
                                >
                                    <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                </motion.div>
                            )}
                            <div className={`
                                w-10 h-10 mx-auto rounded-full flex items-center justify-center font-bold text-sm
                                ${isWinning
                                    ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white'
                                    : 'bg-slate-100 text-slate-600'
                                }
                            `}>
                                {userUni.short_name.slice(0, 2)}
                            </div>
                            <p className="font-bold text-xs mt-1">{userUni.short_name}</p>
                            <p className={`font-black text-sm ${isWinning ? 'text-green-500' : 'text-slate-600'}`}>
                                {formatScore(userUni.total_score)}
                            </p>
                        </div>

                        {/* VS */}
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-black text-xs"
                        >
                            VS
                        </motion.div>

                        {/* Rival */}
                        <div className="text-center flex-1">
                            {!isWinning && (
                                <motion.div
                                    animate={{ y: [-2, 2, -2] }}
                                    transition={{ repeat: Infinity, duration: 1 }}
                                    className="flex justify-center mb-1"
                                >
                                    <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                </motion.div>
                            )}
                            <div className={`
                                w-10 h-10 mx-auto rounded-full flex items-center justify-center font-bold text-sm
                                ${!isWinning
                                    ? 'bg-gradient-to-br from-red-400 to-rose-500 text-white'
                                    : 'bg-slate-100 text-slate-600'
                                }
                            `}>
                                {rivalUni.short_name.slice(0, 2)}
                            </div>
                            <p className="font-bold text-xs mt-1">{rivalUni.short_name}</p>
                            <p className={`font-black text-sm ${!isWinning ? 'text-red-500' : 'text-slate-600'}`}>
                                {formatScore(rivalUni.total_score)}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
