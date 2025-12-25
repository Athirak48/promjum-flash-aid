import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, ChevronRight, School, Flame } from 'lucide-react';

interface UniversityRanking {
    id: string;
    name: string;
    short_name: string;
    total_score: number;
    total_players: number;
}

interface UniversityRankingWidgetProps {
    userUniversityId?: string;
    onViewFullRanking?: () => void;
}

export default function UniversityRankingWidget({
    userUniversityId,
    onViewFullRanking
}: UniversityRankingWidgetProps) {
    const [rankings, setRankings] = useState<UniversityRanking[]>([]);
    const [userRank, setUserRank] = useState<number | null>(null);
    const [userUniversity, setUserUniversity] = useState<UniversityRanking | null>(null);
    const [nextUniversity, setNextUniversity] = useState<UniversityRanking | null>(null);
    const [pointsToNext, setPointsToNext] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchRankings();
    }, [userUniversityId]);

    const fetchRankings = async () => {
        setIsLoading(true);
        try {
            // @ts-ignore - Table will exist after migration
            const { data, error } = await supabase
                .from('universities')
                .select('*')
                .order('total_score', { ascending: false })
                .limit(10);

            if (error) throw error;
            const rankings = (data as unknown as UniversityRanking[]) || [];
            setRankings(rankings);


            // Find user's university rank
            if (userUniversityId) {
                const userIndex = rankings.findIndex(u => u.id === userUniversityId);

                if (userIndex >= 0) {
                    setUserRank(userIndex + 1);
                    setUserUniversity(rankings[userIndex]);

                    // Find next university to beat
                    if (userIndex > 0) {
                        setNextUniversity(rankings[userIndex - 1]);
                        setPointsToNext(rankings[userIndex - 1].total_score - rankings[userIndex].total_score);
                    }
                }
            }


        } catch (error) {
            console.error('Error fetching rankings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return rank.toString();
        }
    };

    const formatScore = (score: number) => {
        if (score >= 1000000) return `${(score / 1000000).toFixed(1)}M`;
        if (score >= 1000) return `${(score / 1000).toFixed(0)}K`;
        return score.toString();
    };

    if (isLoading) {
        return (
            <Card className="border-0 shadow-xl bg-white dark:bg-slate-900">
                <CardContent className="p-6">
                    <div className="flex items-center justify-center h-40">
                        <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-0 shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
            <CardContent className="p-0">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
                    <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5" />
                        <h3 className="font-bold">Live University Ranking</h3>
                    </div>
                    <p className="text-xs text-white/70 mt-1">อันดับมหาวิทยาลัยแบบเรียลไทม์</p>
                </div>

                {/* Rankings */}
                <div className="p-4 space-y-2">
                    {rankings.slice(0, 5).map((uni, index) => (
                        <motion.div
                            key={uni.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex items-center gap-3 p-2 rounded-lg ${uni.id === userUniversityId
                                ? 'bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index < 3 ? 'text-xl' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                }`}>
                                {getRankIcon(index + 1)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate">
                                    {uni.name}
                                    {uni.id === userUniversityId && (
                                        <span className="ml-2 text-xs text-purple-500">(คุณ)</span>
                                    )}
                                </p>
                                <p className="text-xs text-slate-500">{uni.short_name}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-sm">{formatScore(uni.total_score)}</p>
                                <p className="text-xs text-slate-500">แต้ม</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* User's Position (if not in top 5) */}
                {userRank && userRank > 5 && userUniversity && (
                    <div className="border-t border-slate-100 dark:border-slate-800 p-4">
                        <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
                            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                                {userRank}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate flex items-center gap-1">
                                    <School className="w-3 h-3" />
                                    {userUniversity.short_name}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-sm">{formatScore(userUniversity.total_score)}</p>
                            </div>
                        </div>

                        {/* Points to next */}
                        {nextUniversity && (
                            <div className="mt-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                                <p className="text-xs text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                                    <Flame className="w-3 h-3" />
                                    อีก {formatScore(pointsToNext)} แต้มจะแซง {nextUniversity.short_name}!
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* View Full Ranking Button */}
                <div className="border-t border-slate-100 dark:border-slate-800 p-3">
                    <Button
                        variant="ghost"
                        className="w-full text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                        onClick={onViewFullRanking}
                    >
                        ดูตารางคะแนนรวม
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
