import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, ChevronRight } from 'lucide-react';

interface University {
    id: string;
    name: string;
    short_name: string;
    total_score: number;
}

interface MiniRankingWidgetProps {
    userUniversityId?: string;
    onViewFullRanking?: () => void;
}

export default function MiniRankingWidget({
    userUniversityId,
    onViewFullRanking
}: MiniRankingWidgetProps) {
    const [rankings, setRankings] = useState<University[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchRankings();
    }, []);

    const fetchRankings = async () => {
        setIsLoading(true);
        try {
            // @ts-ignore - Table will exist after migration
            const { data, error } = await supabase
                .from('universities')
                .select('*')
                .order('total_score', { ascending: false })
                .limit(3);

            if (error) throw error;
            setRankings((data as unknown as University[]) || []);
        } catch (error) {
            console.error('Error fetching rankings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatScore = (score: number) => {
        if (score >= 1000000) return `${(score / 1000000).toFixed(1)}M`;
        if (score >= 1000) return `${(score / 1000).toFixed(0)}K`;
        return score.toString();
    };

    const getMedalEmoji = (index: number) => {
        const medals = ['🥇', '🥈', '🥉'];
        return medals[index] || '';
    };

    const getMedalColor = (index: number) => {
        const colors = [
            'from-yellow-400 to-amber-500',
            'from-gray-300 to-gray-400',
            'from-orange-400 to-orange-600'
        ];
        return colors[index] || 'from-purple-400 to-pink-500';
    };

    if (isLoading) {
        return (
            <Card className="border-0 shadow-lg">
                <CardContent className="p-4">
                    <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-0 shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
            <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Trophy className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="font-bold text-sm">Live Ranking</h3>
                    </div>
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <TrendingUp className="w-4 h-4 text-green-500" />
                    </motion.div>
                </div>

                {/* Rankings */}
                <div className="space-y-2">
                    {rankings.map((uni, index) => (
                        <motion.div
                            key={uni.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className={`
                                flex items-center justify-between p-2 rounded-xl
                                ${userUniversityId === uni.id
                                    ? 'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 ring-2 ring-purple-300'
                                    : 'bg-slate-50 dark:bg-slate-800'
                                }
                            `}
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-lg">{getMedalEmoji(index)}</span>
                                <div className={`
                                    w-8 h-8 rounded-full bg-gradient-to-br ${getMedalColor(index)}
                                    flex items-center justify-center text-white font-bold text-xs
                                `}>
                                    {uni.short_name.slice(0, 2)}
                                </div>
                                <span className="font-semibold text-sm truncate max-w-[80px]">
                                    {uni.short_name}
                                </span>
                            </div>
                            <span className="font-bold text-sm text-purple-600 dark:text-purple-400">
                                {formatScore(uni.total_score)}
                            </span>
                        </motion.div>
                    ))}
                </div>

                {/* View All Button */}
                {onViewFullRanking && (
                    <motion.button
                        onClick={onViewFullRanking}
                        whileHover={{ x: 5 }}
                        className="w-full mt-3 flex items-center justify-center gap-1 text-purple-600 hover:text-purple-700 text-sm font-bold py-2"
                    >
                        ดูทั้งหมด
                        <ChevronRight className="w-4 h-4" />
                    </motion.button>
                )}
            </CardContent>
        </Card>
    );
}
