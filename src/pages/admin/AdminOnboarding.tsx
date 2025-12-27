import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Users, Target, Clock, Search, Eye, RefreshCw,
    GraduationCap, Briefcase, Plane, Gamepad2, MessageCircle,
    Baby, Bird, Feather, Crown,
    Zap, Coffee, Flame,
    Sun, UtensilsCrossed, Bus, Moon, BellOff,
    Brain, Ear, Frown, ShieldOff,
    Music, Film, Newspaper, Image,
    Cat, Dog, Turtle, Squirrel, Rabbit
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface OnboardingData {
    id: string;
    user_id: string;
    learning_goal: string;
    skill_level: string;
    target_languages: string[];
    daily_time: string;
    best_time: string;
    biggest_problem: string;
    preferred_media: string;
    spirit_animal: string;
    play_style: string;
    motivation_style: string;
    nickname: string;
    completed_at: string;
    created_at: string;
    // Joined from profiles
    profiles?: {
        email?: string;
        display_name?: string;
        username?: string;
    };
}

interface OverviewStats {
    total: number;
    byGoal: Record<string, number>;
    byLevel: Record<string, number>;
    byTime: Record<string, number>;
    byProblem: Record<string, number>;
    byAnimal: Record<string, number>;
}

// Label mappings for display
const goalLabels: Record<string, { emoji: string; label: string }> = {
    daily_life: { emoji: '🗣️', label: 'สื่อสารในชีวิตประจำวัน' },
    business: { emoji: '💼', label: 'อัพเงินเดือน/ย้ายงาน' },
    travel: { emoji: '✈️', label: 'เอาตัวรอดต่างแดน' },
    entertainment: { emoji: '🎮', label: 'เสพสื่อบันเทิง' },
    social: { emoji: '💬', label: 'หาเพื่อน/หาแฟน' },
    other: { emoji: '✏️', label: 'อื่นๆ' },
};

const levelLabels: Record<string, { emoji: string; label: string }> = {
    beginner: { emoji: '👶', label: 'เริ่มจากศูนย์' },
    basic: { emoji: '🐥', label: 'พอได้งูๆ ปลาๆ' },
    intermediate: { emoji: '🦜', label: 'สื่อสารได้' },
    advanced: { emoji: '🦅', label: 'เทพเจ้า' },
};

const timeLabels: Record<string, { emoji: string; label: string }> = {
    '5min': { emoji: '⚡', label: '5 นาที' },
    '15min': { emoji: '☕', label: '15 นาที' },
    '30min': { emoji: '🔥', label: '30 นาที+' },
};

const bestTimeLabels: Record<string, { emoji: string; label: string }> = {
    morning: { emoji: '☀️', label: 'ตื่นนอน' },
    lunch: { emoji: '🍱', label: 'พักเที่ยง' },
    commute: { emoji: '🚌', label: 'ระหว่างเดินทาง' },
    night: { emoji: '🌙', label: 'ก่อนนอน' },
    random: { emoji: '🚫', label: 'ไม่แน่นอน' },
};

const problemLabels: Record<string, { emoji: string; label: string }> = {
    vocabulary: { emoji: '🧠', label: 'จำศัพท์ไม่ได้' },
    listening: { emoji: '👂', label: 'ฟังไม่ออก' },
    boring: { emoji: '🥱', label: 'น่าเบื่อ/ขี้เกียจ' },
    shy: { emoji: '🤐', label: 'ไม่กล้าใช้' },
};

const mediaLabels: Record<string, { emoji: string; label: string }> = {
    music: { emoji: '🎵', label: 'เพลง' },
    movies: { emoji: '🎬', label: 'หนัง/ซีรีส์' },
    news: { emoji: '📰', label: 'ข่าว/บทความ' },
    memes: { emoji: '🖼️', label: 'รูปภาพ/Meme' },
};

const animalLabels: Record<string, { emoji: string; label: string }> = {
    owl: { emoji: '🦉', label: 'นกฮูก' },
    tiger: { emoji: '🐯', label: 'เสือ' },
    turtle: { emoji: '🐢', label: 'เต่า' },
    monkey: { emoji: '🐵', label: 'ลิง' },
    cat: { emoji: '🐱', label: 'แมว' },
    rabbit: { emoji: '🐰', label: 'กระต่าย' },
    shiba: { emoji: '🐕', label: 'หมาชิบะ' },
    dragon: { emoji: '🐉', label: 'มังกร' },
};

const languageLabels: Record<string, { emoji: string; label: string }> = {
    en: { emoji: '🇬🇧', label: 'อังกฤษ' },
    zh: { emoji: '🇨🇳', label: 'จีน' },
    ja: { emoji: '🇯🇵', label: 'ญี่ปุ่น' },
    ko: { emoji: '🇰🇷', label: 'เกาหลี' },
    other: { emoji: '🌍', label: 'อื่นๆ' },
};

const playStyleLabels: Record<string, { emoji: string; label: string }> = {
    fair_play: { emoji: '😇', label: 'Fair Play' },
    trickster: { emoji: '😈', label: 'Trickster' },
};

const motivationLabels: Record<string, { emoji: string; label: string }> = {
    soft: { emoji: '🌸', label: 'สายปลอบใจ' },
    hard: { emoji: '🔥', label: 'สายดุดัน' },
};

export default function AdminOnboarding() {
    const [isLoading, setIsLoading] = useState(true);
    const [onboardingList, setOnboardingList] = useState<OnboardingData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<OnboardingData | null>(null);
    const [stats, setStats] = useState<OverviewStats>({
        total: 0,
        byGoal: {},
        byLevel: {},
        byTime: {},
        byProblem: {},
        byAnimal: {},
    });

    useEffect(() => {
        fetchOnboardingData();
    }, []);

    const fetchOnboardingData = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('user_onboarding')
                .select(`
                    *,
                    profiles:user_id (
                        email,
                        display_name,
                        username
                    )
                `)
                .order('completed_at', { ascending: false });

            if (error) throw error;

            setOnboardingList(data || []);
            calculateStats(data || []);
        } catch (error) {
            console.error('Error fetching onboarding:', error);
            toast.error('ไม่สามารถโหลดข้อมูลได้');
        } finally {
            setIsLoading(false);
        }
    };

    const calculateStats = (data: OnboardingData[]) => {
        const newStats: OverviewStats = {
            total: data.length,
            byGoal: {},
            byLevel: {},
            byTime: {},
            byProblem: {},
            byAnimal: {},
        };

        data.forEach(item => {
            // Count goals
            if (item.learning_goal) {
                newStats.byGoal[item.learning_goal] = (newStats.byGoal[item.learning_goal] || 0) + 1;
            }
            // Count levels
            if (item.skill_level) {
                newStats.byLevel[item.skill_level] = (newStats.byLevel[item.skill_level] || 0) + 1;
            }
            // Count time
            if (item.daily_time) {
                newStats.byTime[item.daily_time] = (newStats.byTime[item.daily_time] || 0) + 1;
            }
            // Count problems
            if (item.biggest_problem) {
                newStats.byProblem[item.biggest_problem] = (newStats.byProblem[item.biggest_problem] || 0) + 1;
            }
            // Count animals
            if (item.spirit_animal) {
                newStats.byAnimal[item.spirit_animal] = (newStats.byAnimal[item.spirit_animal] || 0) + 1;
            }
        });

        setStats(newStats);
    };

    const filteredList = onboardingList.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        return (
            item.nickname?.toLowerCase().includes(searchLower) ||
            item.profiles?.email?.toLowerCase().includes(searchLower) ||
            item.profiles?.display_name?.toLowerCase().includes(searchLower) ||
            item.user_id.toLowerCase().includes(searchLower)
        );
    });

    const getLabel = (value: string, labels: Record<string, { emoji: string; label: string }>, defaultEmoji: string = '❓') => {
        return labels[value] || { emoji: defaultEmoji, label: value };
    };

    const StatCard = ({ title, data, labels, icon: Icon }: {
        title: string;
        data: Record<string, number>;
        labels: Record<string, { emoji: string; label: string }>;
        icon: React.ComponentType<{ className?: string }>;
    }) => (
        <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {Object.entries(data).sort((a, b) => b[1] - a[1]).map(([key, count]) => {
                    const { emoji, label } = getLabel(key, labels);
                    const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                    return (
                        <div key={key} className="flex items-center gap-2">
                            <span className="text-lg">{emoji}</span>
                            <span className="flex-1 text-sm text-slate-300 truncate">{label}</span>
                            <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <span className="text-xs text-slate-400 w-12 text-right">{count} ({percentage}%)</span>
                        </div>
                    );
                })}
                {Object.keys(data).length === 0 && (
                    <p className="text-slate-500 text-sm">ไม่มีข้อมูล</p>
                )}
            </CardContent>
        </Card>
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        📋 User Onboarding
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        ดูข้อมูลผู้ใช้ใหม่และคำตอบแบบสอบถาม
                    </p>
                </div>
                <Button onClick={fetchOnboardingData} variant="outline" className="gap-2">
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    รีเฟรช
                </Button>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="bg-slate-100 dark:bg-slate-800">
                    <TabsTrigger value="overview" className="gap-2">
                        <Target className="w-4 h-4" />
                        ภาพรวม
                    </TabsTrigger>
                    <TabsTrigger value="users" className="gap-2">
                        <Users className="w-4 h-4" />
                        รายบุคคล ({onboardingList.length})
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[...Array(6)].map((_, i) => (
                                <Skeleton key={i} className="h-48" />
                            ))}
                        </div>
                    ) : (
                        <>
                            {/* Total Count */}
                            <Card className="bg-gradient-to-r from-purple-500 to-pink-500 border-0">
                                <CardContent className="p-6 text-center">
                                    <p className="text-white/80 text-sm font-medium mb-1">ผู้ใช้ที่ทำ Onboarding แล้ว</p>
                                    <p className="text-5xl font-black text-white">{stats.total}</p>
                                    <p className="text-white/60 text-xs mt-1">คน</p>
                                </CardContent>
                            </Card>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <StatCard
                                    title="เป้าหมายการเรียน"
                                    data={stats.byGoal}
                                    labels={goalLabels}
                                    icon={Target}
                                />
                                <StatCard
                                    title="ระดับสกิล"
                                    data={stats.byLevel}
                                    labels={levelLabels}
                                    icon={GraduationCap}
                                />
                                <StatCard
                                    title="เวลาต่อวัน"
                                    data={stats.byTime}
                                    labels={timeLabels}
                                    icon={Clock}
                                />
                                <StatCard
                                    title="ปัญหาหลัก"
                                    data={stats.byProblem}
                                    labels={problemLabels}
                                    icon={Brain}
                                />
                                <StatCard
                                    title="สัตว์เลี้ยงคู่ใจ"
                                    data={stats.byAnimal}
                                    labels={animalLabels}
                                    icon={Cat}
                                />
                            </div>
                        </>
                    )}
                </TabsContent>

                {/* Users Tab */}
                <TabsContent value="users" className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="ค้นหาด้วย Nickname, Email, หรือ ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Table */}
                    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                                        <TableHead className="text-slate-700 dark:text-slate-300">Nickname</TableHead>
                                        <TableHead className="text-slate-700 dark:text-slate-300">Email</TableHead>
                                        <TableHead className="text-slate-700 dark:text-slate-300">เป้าหมาย</TableHead>
                                        <TableHead className="text-slate-700 dark:text-slate-300">ระดับ</TableHead>
                                        <TableHead className="text-slate-700 dark:text-slate-300">สัตว์เลี้ยง</TableHead>
                                        <TableHead className="text-slate-700 dark:text-slate-300">วันที่</TableHead>
                                        <TableHead className="text-slate-700 dark:text-slate-300 text-right">ดูเพิ่มเติม</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        [...Array(5)].map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell colSpan={7}><Skeleton className="h-10" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : filteredList.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                                                ไม่พบข้อมูล
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredList.map((item) => {
                                            const goal = getLabel(item.learning_goal, goalLabels, '✏️');
                                            const level = getLabel(item.skill_level, levelLabels);
                                            const animal = getLabel(item.spirit_animal, animalLabels);
                                            return (
                                                <TableRow key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg">{animal.emoji}</span>
                                                            <span className="font-medium text-slate-900 dark:text-white">
                                                                {item.nickname || '-'}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-slate-600 dark:text-slate-400 text-sm">
                                                        {item.profiles?.email || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="gap-1">
                                                            {goal.emoji} {goal.label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className="gap-1">
                                                            {level.emoji} {level.label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-2xl">{animal.emoji}</span>
                                                    </TableCell>
                                                    <TableCell className="text-slate-600 dark:text-slate-400 text-sm">
                                                        {item.completed_at
                                                            ? format(new Date(item.completed_at), 'dd MMM yyyy HH:mm', { locale: th })
                                                            : '-'
                                                        }
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => setSelectedUser(item)}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* User Detail Dialog */}
            <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <span className="text-2xl">
                                {selectedUser && getLabel(selectedUser.spirit_animal, animalLabels).emoji}
                            </span>
                            {selectedUser?.nickname || 'ไม่มีชื่อ'}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedUser && (
                        <ScrollArea className="max-h-[70vh] pr-4">
                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-medium">User ID</p>
                                        <p className="text-sm font-mono text-slate-700 dark:text-slate-300 break-all">
                                            {selectedUser.user_id}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-medium">Email</p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300">
                                            {selectedUser.profiles?.email || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-medium">Nickname</p>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                                            {selectedUser.nickname || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-medium">วันที่ทำ</p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300">
                                            {selectedUser.completed_at
                                                ? format(new Date(selectedUser.completed_at), 'dd MMMM yyyy เวลา HH:mm น.', { locale: th })
                                                : '-'
                                            }
                                        </p>
                                    </div>
                                </div>

                                {/* Answers */}
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-slate-700 dark:text-slate-200">คำตอบแบบสอบถาม</h3>

                                    <div className="grid gap-3">
                                        {/* Q1 */}
                                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                            <p className="text-xs text-slate-500 mb-1">1. เป้าหมายการเรียนภาษา</p>
                                            <Badge className="gap-1">
                                                {getLabel(selectedUser.learning_goal, goalLabels, '✏️').emoji}
                                                {getLabel(selectedUser.learning_goal, goalLabels, '✏️').label}
                                            </Badge>
                                        </div>

                                        {/* Q2 */}
                                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                            <p className="text-xs text-slate-500 mb-1">2. ระดับสกิลปัจจุบัน</p>
                                            <Badge variant="secondary" className="gap-1">
                                                {getLabel(selectedUser.skill_level, levelLabels).emoji}
                                                {getLabel(selectedUser.skill_level, levelLabels).label}
                                            </Badge>
                                        </div>

                                        {/* Q3 */}
                                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                            <p className="text-xs text-slate-500 mb-1">3. ภาษาที่สนใจ</p>
                                            <div className="flex flex-wrap gap-1">
                                                {(selectedUser.target_languages || []).map(lang => (
                                                    <Badge key={lang} variant="outline" className="gap-1">
                                                        {getLabel(lang, languageLabels, '🌍').emoji}
                                                        {getLabel(lang, languageLabels, '🌍').label}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Q4 */}
                                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                            <p className="text-xs text-slate-500 mb-1">4. เวลาต่อวัน</p>
                                            <Badge variant="outline" className="gap-1">
                                                {getLabel(selectedUser.daily_time, timeLabels).emoji}
                                                {getLabel(selectedUser.daily_time, timeLabels).label}
                                            </Badge>
                                        </div>

                                        {/* Q5 */}
                                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                            <p className="text-xs text-slate-500 mb-1">5. ช่วงเวลาที่ดีที่สุด</p>
                                            <Badge variant="outline" className="gap-1">
                                                {getLabel(selectedUser.best_time, bestTimeLabels).emoji}
                                                {getLabel(selectedUser.best_time, bestTimeLabels).label}
                                            </Badge>
                                        </div>

                                        {/* Q6 */}
                                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                            <p className="text-xs text-slate-500 mb-1">6. ปัญหาหลัก</p>
                                            <Badge variant="destructive" className="gap-1">
                                                {getLabel(selectedUser.biggest_problem, problemLabels).emoji}
                                                {getLabel(selectedUser.biggest_problem, problemLabels).label}
                                            </Badge>
                                        </div>

                                        {/* Q7 */}
                                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                            <p className="text-xs text-slate-500 mb-1">7. สื่อที่ชอบ</p>
                                            <Badge variant="outline" className="gap-1">
                                                {getLabel(selectedUser.preferred_media, mediaLabels).emoji}
                                                {getLabel(selectedUser.preferred_media, mediaLabels).label}
                                            </Badge>
                                        </div>

                                        {/* Q8 */}
                                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                            <p className="text-xs text-slate-500 mb-1">8. สัตว์เลี้ยงคู่ใจ</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-3xl">{getLabel(selectedUser.spirit_animal, animalLabels).emoji}</span>
                                                <Badge className="gap-1">
                                                    {getLabel(selectedUser.spirit_animal, animalLabels).label}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Q9 */}
                                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                            <p className="text-xs text-slate-500 mb-1">9. สไตล์การเล่นเกม</p>
                                            <Badge variant="outline" className="gap-1">
                                                {getLabel(selectedUser.play_style, playStyleLabels).emoji}
                                                {getLabel(selectedUser.play_style, playStyleLabels).label}
                                            </Badge>
                                        </div>

                                        {/* Q10 */}
                                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                            <p className="text-xs text-slate-500 mb-1">10. วิธีกระตุ้น</p>
                                            <Badge variant="outline" className="gap-1">
                                                {getLabel(selectedUser.motivation_style, motivationLabels).emoji}
                                                {getLabel(selectedUser.motivation_style, motivationLabels).label}
                                            </Badge>
                                        </div>

                                        {/* Q11 */}
                                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                            <p className="text-xs text-slate-500 mb-1">11. Nickname</p>
                                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                                                {selectedUser.nickname || '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
