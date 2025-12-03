import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Clock, Edit2, Sparkles, BookOpen, MessageCircle, Headphones, Target, ChevronDown, Bell, CheckCircle, PenTool, Mic, Video, Music, Star, Heart, Zap, Coffee, Sun, Moon, X, Trash2, LucideIcon, Trophy, Flame, TrendingUp, CalendarDays, Plus, ChevronLeft, ChevronRight, ChevronsUpDown, Check, Brain, GraduationCap, Lightbulb, Puzzle, Timer, Layers, FileText, Award, Repeat, Bookmark } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TimePicker } from './TimePicker';
import { DurationPicker } from './DurationPicker';
import { DatePicker } from './DatePicker';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import { th } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useFlashcards, Flashcard } from '@/hooks/useFlashcards';
import { useScheduledReviews } from '@/hooks/useScheduledReviews';

interface Activity {
    id: string;
    type: 'vocabulary' | 'practice' | 'listening' | 'review';
    time: string;
    duration: number; // minutes
    title: string;
    icon: LucideIcon;
    color: string;
}

interface DaySchedule {
    dayIndex: number;
    activities: Activity[];
}

interface UserFolder {
    id: string;
    title: string;
    user_id: string;
    created_at: string;
}

interface UserSet {
    id: string;
    title: string;
    folder_id: string;
    created_at: string;
}

const activityTypes = [{
    value: 'vocabulary',
    label: 'ทบทวนคำศัพท์',
    icon: BookOpen,
    color: 'bg-blue-500/10 text-blue-600 border-blue-200'
}, {
    value: 'practice',
    label: 'ฝึกภาษาอังกฤษ',
    icon: MessageCircle,
    color: 'bg-purple-500/10 text-purple-600 border-purple-200'
}, {
    value: 'listening',
    label: 'ฟัง Podcast',
    icon: Headphones,
    color: 'bg-green-500/10 text-green-600 border-green-200'
}, {
    value: 'review',
    label: 'ทำแบบทดสอบ',
    icon: Target,
    color: 'bg-orange-500/10 text-orange-600 border-orange-200'
}];

const AVAILABLE_ICONS = {
    book: BookOpen,
    brain: Brain,
    graduation: GraduationCap,
    lightbulb: Lightbulb,
    puzzle: Puzzle,
    target: Target,
    timer: Timer,
    layers: Layers,
    file: FileText,
    award: Award,
    repeat: Repeat,
    bookmark: Bookmark,
    star: Star,
    zap: Zap
};

const AVAILABLE_COLORS = [
    { value: 'blue', label: 'Blue', class: 'bg-blue-200 text-blue-700 border-blue-300', ring: 'ring-blue-500' },
    { value: 'purple', label: 'Purple', class: 'bg-purple-200 text-purple-700 border-purple-300', ring: 'ring-purple-500' },
    { value: 'green', label: 'Green', class: 'bg-green-200 text-green-700 border-green-300', ring: 'ring-green-500' },
    { value: 'orange', label: 'Orange', class: 'bg-orange-200 text-orange-700 border-orange-300', ring: 'ring-orange-500' },
    { value: 'pink', label: 'Pink', class: 'bg-pink-200 text-pink-700 border-pink-300', ring: 'ring-pink-500' },
    { value: 'red', label: 'Red', class: 'bg-red-200 text-red-700 border-red-300', ring: 'ring-red-500' },
    { value: 'teal', label: 'Teal', class: 'bg-teal-200 text-teal-700 border-teal-300', ring: 'ring-teal-500' },
    { value: 'indigo', label: 'Indigo', class: 'bg-indigo-200 text-indigo-700 border-indigo-300', ring: 'ring-indigo-500' }
];

type ViewMode = 'day' | 'week' | 'month' | 'year';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const PIXELS_PER_HOUR = 60;

export function ScheduleCalendar() {
    const { toast } = useToast();
    const { flashcards } = useFlashcards();
    const { reviews, addReview, updateReview, deleteReview } = useScheduledReviews();

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('week');
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
    const [openDuration, setOpenDuration] = useState(false);
    const [scheduleData, setScheduleData] = useState<DaySchedule[]>([]);

    // Review Dialog State
    const [reviewDate, setReviewDate] = useState<Date>(new Date());
    const [reviewTime, setReviewTime] = useState<string>('09:00');
    const [reviewDuration, setReviewDuration] = useState<number>(15);

    // Library State
    const [userFolders, setUserFolders] = useState<UserFolder[]>([]);
    const [userSets, setUserSets] = useState<UserSet[]>([]);
    const [selectedFolderId, setSelectedFolderId] = useState<string>("");
    const [selectedSetId, setSelectedSetId] = useState<string>("");
    const [libraryVocabulary, setLibraryVocabulary] = useState<Flashcard[]>([]);
    const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

    // Recommended State
    const [recommendedCards, setRecommendedCards] = useState<Flashcard[]>([]);
    const [isLoadingRecommended, setIsLoadingRecommended] = useState(false);

    const [selectedItems, setSelectedItems] = useState<Flashcard[]>([]);

    // Customization State
    const [reviewTitle, setReviewTitle] = useState<string>("ทบทวนคำศัพท์");
    const [reviewIcon, setReviewIcon] = useState<string>("book");
    const [reviewColor, setReviewColor] = useState<string>("blue");
    const [showError, setShowError] = useState(false);

    // Tab State
    const [activeTab, setActiveTab] = useState<string>("latest");

    // Fetch Recommended Cards
    useEffect(() => {
        const fetchRecommended = async () => {
            setIsLoadingRecommended(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const today = new Date().toISOString();
            const { data: progressData } = await supabase
                .from('user_flashcard_progress')
                .select('*')
                .eq('user_id', user.id)
                .lte('next_review_date', today);

            if (progressData) {
                const systemCardIds = progressData.filter(p => p.flashcard_id).map(p => p.flashcard_id);
                const userCardIds = progressData.filter(p => p.user_flashcard_id).map(p => p.user_flashcard_id);

                let combinedCards: Flashcard[] = [];

                if (systemCardIds.length > 0) {
                    const { data: systemCards } = await supabase
                        .from('flashcards')
                        .select('*')
                        .in('id', systemCardIds);

                    if (systemCards) {
                        combinedCards = [...combinedCards, ...systemCards.map(c => ({
                            id: c.id,
                            front_text: c.front_text,
                            back_text: c.back_text,
                            created_at: c.created_at,
                        }))];
                    }
                }

                if (userCardIds.length > 0) {
                    const { data: userCards } = await supabase
                        .from('user_flashcards')
                        .select('*')
                        .in('id', userCardIds);

                    if (userCards) {
                        combinedCards = [...combinedCards, ...userCards.map(c => ({
                            id: c.id,
                            front_text: c.front_text,
                            back_text: c.back_text,
                            created_at: c.created_at,
                            user_id: c.user_id,
                            set_id: c.flashcard_set_id,
                            image_url: c.front_image_url || undefined
                        }))];
                    }
                }
                setRecommendedCards(combinedCards);
            }
            setIsLoadingRecommended(false);
        };
        fetchRecommended();
    }, []);

    // Fetch User Folders
    useEffect(() => {
        const fetchFolders = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('user_folders')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (data) setUserFolders(data as UserFolder[]);
        };
        fetchFolders();
    }, []);

    // Fetch User Sets when Folder is selected
    useEffect(() => {
        if (!selectedFolderId) {
            setUserSets([]);
            return;
        }
        const fetchSets = async () => {
            const { data } = await supabase
                .from('user_flashcard_sets')
                .select('*')
                .eq('folder_id', selectedFolderId)
                .order('created_at', { ascending: false });

            if (data) setUserSets(data as unknown as UserSet[]);
        };
        fetchSets();
    }, [selectedFolderId]);

    // Fetch Vocabulary when Set is selected
    useEffect(() => {
        if (!selectedSetId) {
            setLibraryVocabulary([]);
            return;
        }
        const fetchVocab = async () => {
            setIsLoadingLibrary(true);
            const { data } = await supabase
                .from('user_flashcards')
                .select('*')
                .eq('flashcard_set_id', selectedSetId);

            if (data) {
                const mappedData: Flashcard[] = data.map(item => ({
                    id: item.id,
                    front_text: item.front_text,
                    back_text: item.back_text,
                    set_id: item.flashcard_set_id,
                    created_at: item.created_at,
                    user_id: item.user_id,
                    image_url: item.front_image_url || undefined,
                }));
                setLibraryVocabulary(mappedData);
            }
            setIsLoadingLibrary(false);
            const mappedSchedule: DaySchedule[] = [];

            reviews.forEach(review => {
                const date = new Date(review.scheduled_date);
                const dayIndex = date.getDay();

                const activity: Activity = {
                    id: review.id,
                    type: 'vocabulary' as Activity['type'],
                    time: review.scheduled_time.substring(0, 5),
                    duration: 30,
                    title: 'Review Session',
                    icon: BookOpen,
                    color: 'blue'
                };

                const existingDay = mappedSchedule.find(d => d.dayIndex === dayIndex);
                if (existingDay) {
                    existingDay.activities.push(activity);
                } else {
                    mappedSchedule.push({ dayIndex, activities: [activity] });
                }
            });

            setScheduleData(mappedSchedule);
        }
    }, [reviews]);

    const getDaysToRender = () => {
        if (viewMode === 'day') {
            return [selectedDate];
        } else if (viewMode === 'week') {
            const start = startOfWeek(selectedDate, { weekStartsOn: 0 });
            return Array.from({ length: 7 }, (_, i) => addDays(start, i));
        } else if (viewMode === 'month') {
            const start = startOfWeek(startOfMonth(selectedDate), { weekStartsOn: 0 });
            const days = [];
            let current = start;
            while (days.length < 42) {
                days.push(current);
                current = addDays(current, 1);
            }
            return days;
        }
        return [];
    };

    const getDaySchedule = (dayIndex: number) => {
        return scheduleData.find(d => d.dayIndex === dayIndex) || { dayIndex, activities: [] };
    };

    const handleEditSchedule = (dayIndex: number) => {
        setSelectedDay(dayIndex);
        setIsDialogOpen(true);
    };

    const handleUpdateActivityTitle = async (dayIndex: number, activityId: string, newTitle: string) => {
        // Title field not in database schema - skip update
        console.log('Title update requested but not persisted:', newTitle);
    };

    const handleUpdateActivityTime = async (dayIndex: number, activityId: string, newTime: string) => {
        await updateReview(activityId, { scheduled_time: newTime });
    };

    const handleUpdateActivityDuration = async (dayIndex: number, activityId: string, newDuration: number) => {
        // Duration field not in database schema - skip update
        console.log('Duration update requested but not persisted:', newDuration);
    };

    const handleRemoveActivity = async (dayIndex: number, activityId: string) => {
        await deleteReview(activityId);
    };

    const handleAddActivity = async () => {
        if (selectedDay === null) return;

        const targetDate = new Date(selectedDate);
        const currentDay = targetDate.getDay();
        const diff = selectedDay - currentDay;
        targetDate.setDate(targetDate.getDate() + diff);

        const newReview = {
            scheduled_date: format(targetDate, 'yyyy-MM-dd'),
            scheduled_time: '09:00',
            duration_minutes: 30,
            title: 'New Activity',
            activity_type: 'vocabulary' as const,
            icon: 'book',
            color: 'blue',
            vocabulary_ids: []
        };

        await addReview(newReview);
    };

    const handleSaveReview = async () => {
        if (!reviewTitle.trim()) {
            setShowError(true);
            return;
        }

        const newReview = {
            scheduled_date: format(reviewDate, 'yyyy-MM-dd'),
            scheduled_time: reviewTime,
            duration_minutes: reviewDuration,
            title: reviewTitle,
            activity_type: 'vocabulary' as const,
            icon: reviewIcon,
            color: reviewColor,
            vocabulary_ids: selectedItems.map(i => i.id)
        };

        await addReview(newReview);
        setIsReviewDialogOpen(false);
        setShowError(false);
        toast({ title: "บันทึกสำเร็จ", description: "สร้างกิจกรรมทบทวนเรียบร้อยแล้ว" });
    };

    const getPixelPosition = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        return (hours * PIXELS_PER_HOUR) + (minutes / 60 * PIXELS_PER_HOUR);
    };

    const getPixelHeight = (duration: number) => {
        return (duration / 60) * PIXELS_PER_HOUR;
    };

    const handleNavigate = (direction: 'prev' | 'next') => {
        if (viewMode === 'day') {
            setSelectedDate(prev => direction === 'prev' ? addDays(prev, -1) : addDays(prev, 1));
        } else if (viewMode === 'week') {
            setSelectedDate(prev => direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1));
        } else if (viewMode === 'month') {
            setSelectedDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
        } else if (viewMode === 'year') {
            setSelectedDate(prev => direction === 'prev' ? subMonths(prev, 12) : addMonths(prev, 12));
        }
    };

    return (
        <div className="h-full flex flex-col gap-6 p-6 bg-background/50">
            {/* Header Row 1: Title and Main Action */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100/50 rounded-2xl text-purple-600 shadow-sm border border-purple-100">
                        <CalendarIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground tracking-tight">ตารางเรียนรู้</h1>
                        <p className="text-muted-foreground text-sm font-medium">จัดการเวลาเรียนรู้ของคุณ</p>
                    </div>
                </div>
                <div className="w-full md:w-auto flex justify-end">
                    <Button
                        onClick={() => setIsReviewDialogOpen(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-xl"
                    >
                        <Clock className="w-4 h-4 mr-2" />
                        ตั้งเวลาทบทวน
                    </Button>
                </div>
            </div>

            {/* Header Row 2: Controls */}
            <div className="flex flex-wrap items-center justify-end gap-3 w-full">
                <div className="flex flex-wrap items-center justify-end gap-3 w-full sm:w-auto">
                    {/* View Switcher */}
                    <div className="bg-card p-1 rounded-2xl border shadow-sm flex items-center gap-1 overflow-x-auto max-w-full">
                        {(['day', 'week', 'month', 'year'] as const).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={cn(
                                    "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200",
                                    viewMode === mode
                                        ? "bg-purple-100 text-purple-700 shadow-sm"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                {mode === 'day' && 'วัน'}
                                {mode === 'week' && 'สัปดาห์'}
                                {mode === 'month' && 'เดือน'}
                                {mode === 'year' && 'ปี'}
                            </button>
                        ))}
                    </div>

                    {/* Date Picker / Navigation */}
                    <div className="flex items-center gap-2 bg-pink-50/50 p-1 pr-3 rounded-2xl border border-pink-100/50 shadow-sm">
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-pink-400 hover:text-pink-600 hover:bg-pink-100 rounded-xl" onClick={() => handleNavigate('prev')}>
                                <ChevronLeft className="w-4 h-4" />
                            </Button>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" className="h-8 px-3 text-pink-700 hover:bg-pink-100 hover:text-pink-800 font-semibold text-sm rounded-xl">
                                        <CalendarIcon className="w-3.5 h-3.5 mr-2 opacity-70" />
                                        {format(selectedDate, 'd MMMM yyyy', { locale: th })}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={(date) => date && setSelectedDate(date)}
                                        initialFocus
                                        className="p-3 pointer-events-auto"
                                    />
                                </PopoverContent>
                            </Popover>

                            <Button variant="ghost" size="icon" className="h-8 w-8 text-pink-400 hover:text-pink-600 hover:bg-pink-100 rounded-xl" onClick={() => handleNavigate('next')}>
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>


            {
                viewMode === 'year' ? (
                    <ScrollArea className="flex-1 min-h-0 w-full border rounded-xl bg-card shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 p-4">
                            <Card className="border-border/40 shadow-sm hover:shadow-md transition-all duration-300">
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600"><BookOpen className="w-5 h-5" /></div>
                                    <div><p className="text-xs text-muted-foreground font-medium mb-0.5">คำศัพท์ที่จำได้</p><h3 className="text-2xl font-bold text-foreground">2,543</h3></div>
                                </CardContent>
                            </Card>
                            <Card className="border-border/40 shadow-sm hover:shadow-md transition-all duration-300">
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className="p-3 bg-orange-500/10 rounded-xl text-orange-600"><Flame className="w-5 h-5" /></div>
                                    <div><p className="text-xs text-muted-foreground font-medium mb-0.5">ต่อเนื่องสูงสุด</p><h3 className="text-2xl font-bold text-foreground">45 <span className="text-sm font-normal text-muted-foreground">วัน</span></h3></div>
                                </CardContent>
                            </Card>
                            <Card className="border-border/40 shadow-sm hover:shadow-md transition-all duration-300">
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className="p-3 bg-green-500/10 rounded-xl text-green-600"><CalendarDays className="w-5 h-5" /></div>
                                    <div><p className="text-xs text-muted-foreground font-medium mb-0.5">วันที่เรียนรู้</p><h3 className="text-2xl font-bold text-foreground">280 <span className="text-sm font-normal text-muted-foreground">วัน</span></h3></div>
                                </CardContent>
                            </Card>
                            <Card className="border-border/40 shadow-sm hover:shadow-md transition-all duration-300">
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className="p-3 bg-purple-500/10 rounded-xl text-purple-600"><Trophy className="w-5 h-5" /></div>
                                    <div><p className="text-xs text-muted-foreground font-medium mb-0.5">คะแนนเฉลี่ย</p><h3 className="text-2xl font-bold text-foreground">85%</h3></div>
                                </CardContent>
                            </Card>
                        </div >

                        <Card className="border-border/40 shadow-sm mb-8 mx-4">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-medium flex items-center gap-2 text-muted-foreground"><TrendingUp className="w-4 h-4" /> สถิติการจำคำศัพท์รายเดือน</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={Array.from({ length: 12 }, (_, i) => ({ name: format(new Date(2025, i, 1), 'MMM', { locale: th }), words: Math.floor(Math.random() * 300) + 100 }))}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                                        <Tooltip
                                            cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Bar dataKey="words" radius={[4, 4, 0, 0]}>
                                            {Array.from({ length: 12 }).map((_, index) => <Cell key={index} fill={`hsl(var(--primary) / ${0.6 + (index % 2) * 0.2})`} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-4 pb-8">
                            {Array.from({ length: 12 }).map((_, monthIndex) => {
                                const currentYear = selectedDate.getFullYear();
                                const monthStart = new Date(currentYear, monthIndex, 1);
                                const monthEnd = endOfMonth(monthStart);
                                const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
                                const startDayOfWeek = monthStart.getDay(); // 0 for Sunday

                                return (
                                    <div key={monthIndex} className="flex flex-col gap-3 p-4 rounded-2xl bg-card/50 border border-border/30 hover:border-border/60 hover:bg-card transition-all duration-300 shadow-sm">
                                        <h3 className="text-sm font-bold text-center text-foreground/90">{format(monthStart, 'MMMM', { locale: th })}</h3>
                                        <div className="grid grid-cols-7 gap-1 text-center text-[10px] mb-1">
                                            {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(d => <div key={d} className="text-muted-foreground/60 font-medium">{d}</div>)}
                                        </div>
                                        <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
                                            {Array.from({ length: startDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
                                            {daysInMonth.map(date => {
                                                const hasActivity = reviews.some(r => isSameDay(new Date(r.scheduled_date), date));
                                                const isTodayDate = isToday(date);
                                                return (
                                                    <div
                                                        key={date.toISOString()}
                                                        title={format(date, 'd MMMM yyyy', { locale: th })}
                                                        className={cn(
                                                            "aspect-square flex items-center justify-center rounded-full transition-all duration-300 cursor-default",
                                                            hasActivity
                                                                ? "bg-primary text-primary-foreground font-bold shadow-sm scale-105"
                                                                : "text-muted-foreground/70 hover:bg-accent hover:text-foreground",
                                                            isTodayDate && !hasActivity && "ring-1 ring-primary text-primary font-medium bg-primary/5"
                                                        )}
                                                    >
                                                        {date.getDate()}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea >
                ) : viewMode === 'month' ? (
                    <ScrollArea className="flex-1 min-h-0 w-full border rounded-xl bg-card shadow-sm">
                        <div className="p-2 md:p-4 w-full min-w-0">
                            <div className="grid grid-cols-7 gap-1 md:gap-4 mb-2 md:mb-4">
                                {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day) => (
                                    <div key={day} className="text-center text-xs md:text-sm font-semibold text-muted-foreground/70">
                                        {day}
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-px bg-border/30 rounded-lg overflow-hidden border border-border/30">
                                {getDaysToRender().map((date, index) => {
                                    const isCurrentMonth = isSameMonth(date, selectedDate);
                                    const isCurrentDay = isToday(date);
                                    const dayReviews = reviews?.filter(r => isSameDay(new Date(r.scheduled_date), date)) || [];

                                    return (
                                        <div
                                            key={index}
                                            className={cn(
                                                "min-h-[60px] md:min-h-[120px] p-1 md:p-2 bg-card transition-colors hover:bg-accent/20 cursor-pointer flex flex-col gap-1",
                                                !isCurrentMonth && "bg-muted/10 text-muted-foreground/50",
                                                isCurrentDay && "bg-primary/5"
                                            )}
                                            onClick={() => {
                                                setSelectedDate(date);
                                                setViewMode('day');
                                            }}
                                        >
                                            <div className={cn(
                                                "text-right text-xs md:text-sm font-medium mb-1 w-5 h-5 md:w-7 md:h-7 flex items-center justify-center ml-auto rounded-full",
                                                isCurrentDay && "bg-primary text-primary-foreground"
                                            )}>
                                                {date.getDate()}
                                            </div>

                                            {/* Mobile View: Dots */}
                                            <div className="flex md:hidden flex-wrap justify-end gap-1">
                                                {dayReviews.map(review => {
                                                    const colorClass = 'bg-primary';
                                                    return (
                                                        <div key={review.id} className={cn("w-1.5 h-1.5 rounded-full", colorClass)} />
                                                    );
                                                })}
                                            </div>

                                            {/* Desktop View: Pills */}
                                            <div className="hidden md:flex flex-col gap-1">
                                                {dayReviews.map(review => {
                                                    const colorClass = 'bg-primary/10 text-primary';
                                                    return (
                                                        <div key={review.id} className={cn("text-[10px] px-2 py-1 rounded-md truncate font-medium border-l-2", colorClass)}>
                                                            {review.scheduled_time.substring(0, 5)} Review
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                ) : (viewMode === 'week' || viewMode === 'day') ? (
                    <ScrollArea className="flex-1 min-h-0 w-full border rounded-xl bg-card shadow-sm">
                        <div className="flex flex-col min-w-full">
                            <div className={cn("grid gap-0 sticky top-0 z-40 bg-card border-b pb-2 pt-4", (viewMode === 'week' || viewMode === 'day') ? "grid-cols-[60px_1fr]" : "grid-cols-7", viewMode === 'week' ? "min-w-full" : "min-w-full")}>
                                <div className="text-center text-xs font-bold py-2 text-muted-foreground/50 sticky left-0 z-50 bg-card"></div>
                                <div className={cn("grid gap-0", viewMode === 'day' ? "grid-cols-1" : "grid-cols-7")}>
                                    {getDaysToRender().map((date, index) => {
                                        if (!date) return null;
                                        const isCurrentDay = isToday(date);
                                        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                                        if (viewMode === 'day') {
                                            return (
                                                <div key={index} className={`text-center text-sm font-bold py-2 rounded-md ${isCurrentDay ? 'text-primary' : isWeekend ? 'text-muted-foreground' : 'text-foreground'}`}>
                                                    {format(date, 'EEEE d MMMM yyyy', { locale: th })}
                                                </div>
                                            );
                                        }

                                        return (
                                            <div key={index} className="flex flex-col items-center justify-center py-2 gap-1 border-l border-transparent">
                                                <span className={`text-sm uppercase font-bold ${isCurrentDay ? 'text-primary' : 'text-foreground'}`}>
                                                    {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'][date.getDay()]}
                                                </span>
                                                <div className={cn(
                                                    "w-9 h-9 flex items-center justify-center rounded-full text-lg font-semibold transition-colors",
                                                    isCurrentDay
                                                        ? "bg-primary text-primary-foreground shadow-md"
                                                        : "text-foreground hover:bg-muted"
                                                )}>
                                                    {date.getDate()}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className={cn("flex relative flex-1", viewMode === 'week' ? "min-w-full" : "min-w-full")}>
                                <div className="w-[60px] flex-shrink-0 border-r border-border/40 bg-muted sticky left-0 z-30">
                                    {HOURS.map(hour => (
                                        <div key={hour} className="h-[60px] text-sm text-foreground p-1 text-right pr-3 relative font-semibold">
                                            <span className="-top-2 relative">{hour}:00</span>
                                        </div>
                                    ))}
                                </div>

                                <div className={cn("flex-1 grid", viewMode === 'day' ? "grid-cols-1" : "grid-cols-7")}>
                                    {getDaysToRender().map((date, dayIndex) => {
                                        if (!date) return null;
                                        const daySchedule = getDaySchedule(date.getDay());
                                        const isCurrentDay = isToday(date);

                                        return (
                                            <div key={dayIndex} className={`border-r border-border/30 relative min-h-[1440px] ${isCurrentDay ? 'bg-primary/[0.02]' : ''}`}>
                                                {HOURS.map(hour => (
                                                    <div key={hour} className="h-[60px] border-b border-dashed border-border/30" />
                                                ))}

                                                {/* Current Time Indicator (Visual only, static for now) */}
                                                {isCurrentDay && (
                                                    <div
                                                        className="absolute w-full border-t-2 border-red-500 z-20 pointer-events-none flex items-center"
                                                        style={{ top: `${getPixelPosition(format(new Date(), 'HH:mm'))}px` }}
                                                    >
                                                        <div className="w-2 h-2 rounded-full bg-red-500 -ml-1"></div>
                                                    </div>
                                                )}

                                                {daySchedule?.activities.map(activity => (
                                                    <div
                                                        key={activity.id}
                                                        className={`absolute left-1 right-1 rounded-lg p-2 text-xs border-l-4 overflow-hidden cursor-pointer hover:brightness-95 transition-all shadow-sm z-10 ${activity.color}`}
                                                        style={{
                                                            top: `${getPixelPosition(activity.time)}px`,
                                                            height: `${Math.max(getPixelHeight(activity.duration), viewMode === 'day' ? 50 : 30)}px`
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditSchedule(date.getDay());
                                                        }}
                                                    >
                                                        <div className={cn("font-semibold flex items-center gap-1.5", viewMode === 'day' ? "text-sm mb-1" : "")}>
                                                            <activity.icon className={cn("flex-shrink-0 opacity-70", viewMode === 'day' ? "w-4 h-4" : "w-3 h-3")} />
                                                            <span className="truncate">{activity.time} - {activity.title}</span>
                                                        </div>
                                                        {viewMode === 'day' && (
                                                            <div className="text-xs opacity-70 pl-6">
                                                                {activity.duration} นาที
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                ) : null
            }

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>แก้ไขกิจกรรม</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {selectedDay !== null && getDaySchedule(selectedDay).activities.map((activity) => (
                            <div key={activity.id} className="grid grid-cols-4 items-center gap-4 border-b pb-4 last:border-0">
                                <Input
                                    id={`time-${activity.id}`}
                                    defaultValue={activity.time}
                                    className="col-span-1"
                                    onChange={(e) => handleUpdateActivityTime(selectedDay, activity.id, e.target.value)}
                                />
                                <Input
                                    id={`title-${activity.id}`}
                                    defaultValue={activity.title}
                                    className="col-span-2"
                                    onChange={(e) => handleUpdateActivityTitle(selectedDay, activity.id, e.target.value)}
                                />
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => handleRemoveActivity(selectedDay, activity.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <Button onClick={handleAddActivity} className="w-full">
                            + เพิ่มกิจกรรม
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                <DialogContent className="max-w-4xl h-[75vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl border-none shadow-2xl">
                    <DialogHeader className="px-5 py-3 border-b bg-white flex-shrink-0">
                        <DialogTitle className="text-lg font-bold flex items-center gap-2 text-gray-800">
                            <Clock className="w-5 h-5 text-purple-600" />
                            ตั้งเวลาทบทวนคำศัพท์
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden bg-gray-50/30">
                        <div className="flex flex-col lg:grid lg:grid-cols-12 h-full">
                            {/* Left Column: Selected Items Summary */}
                            <div className="hidden lg:flex lg:col-span-3 flex-col border-r bg-white h-full">
                                <div className="p-3 border-b flex items-center justify-between bg-purple-50/30">
                                    <div className="flex items-center gap-2 text-purple-700 font-semibold text-sm">
                                        <CheckCircle className="w-4 h-4" />
                                        <span>รายการที่เลือก</span>
                                    </div>
                                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100 text-xs">
                                        {selectedItems.length}
                                    </Badge>
                                </div>
                                <ScrollArea className="flex-1 p-3">
                                    {selectedItems.length > 0 ? (
                                        <div className="space-y-2">
                                            {selectedItems.map((item) => (
                                                <div key={item.id} className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100 group hover:border-purple-200 hover:bg-purple-50/30 transition-all">
                                                    <div className="mt-1 min-w-[3px] h-3 rounded-full bg-purple-400" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-medium text-gray-900 truncate">{item.front_text}</p>
                                                        <p className="text-[10px] text-gray-500 truncate">{item.back_text}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setSelectedItems(prev => prev.filter(i => i.id !== item.id))}
                                                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-100 text-red-500 rounded transition-all"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-4 text-gray-400 space-y-2">
                                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                                <CheckCircle className="w-6 h-6 text-gray-300" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-500 text-sm">ยังไม่ได้เลือกรายการ</p>
                                                <p className="text-[10px]">เลือกคำศัพท์จากรายการด้านขวา</p>
                                            </div>
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>

                            {/* Middle Column: Source Selection */}
                            <div className="lg:col-span-5 flex flex-col border-r bg-white h-auto lg:h-full flex-shrink-0">
                                <Tabs defaultValue="latest" className="flex-1 flex flex-col h-full" onValueChange={setActiveTab}>
                                    <div className="px-3 py-2 border-b bg-white">
                                        <TabsList className="w-full grid grid-cols-4 lg:grid-cols-3 bg-gray-100/50 p-1 h-9">
                                            <TabsTrigger value="selected" className="lg:hidden data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md text-xs">
                                                เลือก ({selectedItems.length})
                                            </TabsTrigger>
                                            <TabsTrigger value="weak" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md text-xs">ยังจำไม่ได้</TabsTrigger>
                                            <TabsTrigger value="latest" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md text-xs">ล่าสุด</TabsTrigger>
                                            <TabsTrigger value="library" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md text-xs">คลังคำศัพท์</TabsTrigger>
                                        </TabsList>
                                    </div>

                                    <div className="flex-1 overflow-hidden relative min-h-[300px] lg:min-h-0">
                                        <TabsContent value="selected" className="h-full m-0 absolute inset-0 lg:hidden">
                                            <ScrollArea className="h-full">
                                                <div className="p-2">
                                                    <div className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">รายการที่เลือก</div>
                                                    {selectedItems.length > 0 ? (
                                                        <div className="space-y-1 p-1">
                                                            {selectedItems.map((item) => (
                                                                <div key={item.id} className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100 group hover:border-purple-200 hover:bg-purple-50/30 transition-all">
                                                                    <div className="mt-1 min-w-[3px] h-3 rounded-full bg-purple-400" />
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-xs font-medium text-gray-900 truncate">{item.front_text}</p>
                                                                        <p className="text-[10px] text-gray-500 truncate">{item.back_text}</p>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => setSelectedItems(prev => prev.filter(i => i.id !== item.id))}
                                                                        className="p-1 hover:bg-red-100 text-red-500 rounded transition-all"
                                                                    >
                                                                        <X className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400 space-y-2">
                                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                                                <CheckCircle className="w-5 h-5 text-gray-300" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-500 text-xs">ยังไม่ได้เลือกรายการ</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </ScrollArea>
                                        </TabsContent>

                                        <TabsContent value="weak" className="h-full m-0 absolute inset-0">
                                            <ScrollArea className="h-full">
                                                <div className="p-2">
                                                    <div className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">คำศัพท์ที่ต้องทบทวน</div>
                                                    <div className="space-y-1 p-1">
                                                        {recommendedCards.length > 0 ? recommendedCards.map((card) => (
                                                            <div
                                                                key={card.id}
                                                                className={cn(
                                                                    "flex items-center gap-3 p-2 rounded-lg border transition-all cursor-pointer hover:bg-gray-50",
                                                                    selectedItems.some(i => i.id === card.id)
                                                                        ? "bg-purple-50 border-purple-200 shadow-sm"
                                                                        : "bg-white border-transparent hover:border-gray-200"
                                                                )}
                                                                onClick={() => {
                                                                    setSelectedItems(prev =>
                                                                        prev.some(i => i.id === card.id)
                                                                            ? prev.filter(i => i.id !== card.id)
                                                                            : [...prev, card]
                                                                    );
                                                                }}
                                                            >
                                                                <Checkbox
                                                                    checked={selectedItems.some(i => i.id === card.id)}
                                                                    onCheckedChange={() => { }}
                                                                    className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 w-4 h-4"
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className={cn("text-xs font-medium truncate", selectedItems.some(i => i.id === card.id) ? "text-purple-900" : "text-gray-700")}>
                                                                        {card.front_text}
                                                                    </p>
                                                                    <p className="text-[10px] text-gray-500 truncate">{card.back_text}</p>
                                                                </div>
                                                            </div>
                                                        )) : (
                                                            <div className="p-4 text-center text-xs text-gray-400">
                                                                ไม่มีคำศัพท์ที่ต้องทบทวนในขณะนี้
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </ScrollArea>
                                        </TabsContent>

                                        <TabsContent value="latest" className="h-full m-0 absolute inset-0">
                                            <ScrollArea className="h-full">
                                                <div className="p-2">
                                                    <div className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">คำศัพท์ที่เรียนล่าสุด</div>
                                                    <div className="space-y-1 p-1">
                                                        {flashcards.slice(0, 20).map((card) => (
                                                            <div
                                                                key={card.id}
                                                                className={cn(
                                                                    "flex items-center gap-3 p-2 rounded-lg border transition-all cursor-pointer hover:bg-gray-50",
                                                                    selectedItems.some(i => i.id === card.id)
                                                                        ? "bg-purple-50 border-purple-200 shadow-sm"
                                                                        : "bg-white border-transparent hover:border-gray-200"
                                                                )}
                                                                onClick={() => {
                                                                    setSelectedItems(prev =>
                                                                        prev.some(i => i.id === card.id)
                                                                            ? prev.filter(i => i.id !== card.id)
                                                                            : [...prev, card]
                                                                    );
                                                                }}
                                                            >
                                                                <Checkbox
                                                                    checked={selectedItems.some(i => i.id === card.id)}
                                                                    onCheckedChange={() => { }} // Handled by parent div click
                                                                    className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 w-4 h-4"
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className={cn("text-xs font-medium truncate", selectedItems.some(i => i.id === card.id) ? "text-purple-900" : "text-gray-700")}>
                                                                        {card.front_text}
                                                                    </p>
                                                                    <p className="text-[10px] text-gray-500 truncate">{card.back_text}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </ScrollArea>
                                        </TabsContent>

                                        <TabsContent value="library" className="h-full m-0 absolute inset-0">
                                            <ScrollArea className="h-full">
                                                <div className="p-2">
                                                    <div className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">คำศัพท์ทั้งหมด</div>
                                                    <div className="space-y-1 p-1">
                                                        {flashcards.map((card) => (
                                                            <div
                                                                key={card.id}
                                                                className={cn(
                                                                    "flex items-center gap-3 p-2 rounded-lg border transition-all cursor-pointer hover:bg-gray-50",
                                                                    selectedItems.some(i => i.id === card.id)
                                                                        ? "bg-purple-50 border-purple-200 shadow-sm"
                                                                        : "bg-white border-transparent hover:border-gray-200"
                                                                )}
                                                                onClick={() => {
                                                                    setSelectedItems(prev =>
                                                                        prev.some(i => i.id === card.id)
                                                                            ? prev.filter(i => i.id !== card.id)
                                                                            : [...prev, card]
                                                                    );
                                                                }}
                                                            >
                                                                <Checkbox
                                                                    checked={selectedItems.some(i => i.id === card.id)}
                                                                    onCheckedChange={() => { }}
                                                                    className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 w-4 h-4"
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className={cn("text-xs font-medium truncate", selectedItems.some(i => i.id === card.id) ? "text-purple-900" : "text-gray-700")}>
                                                                        {card.front_text}
                                                                    </p>
                                                                    <p className="text-[10px] text-gray-500 truncate">{card.back_text}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </ScrollArea>
                                        </TabsContent>
                                    </div>
                                </Tabs>
                            </div>

                            {/* Right Column: Settings */}
                            <div className="lg:col-span-4 flex flex-col bg-white h-auto lg:h-full overflow-y-auto border-t lg:border-t-0">
                                <div className="p-4 space-y-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="review-title" className="text-xs font-semibold text-gray-700">ชื่อกิจกรรม</Label>
                                        <Input
                                            id="review-title"
                                            value={reviewTitle}
                                            onChange={(e) => {
                                                setReviewTitle(e.target.value);
                                                if (e.target.value.trim()) setShowError(false);
                                            }}
                                            className={cn(
                                                "h-9 text-sm bg-gray-50 border-gray-200 focus:bg-white transition-all rounded-lg",
                                                showError && !reviewTitle.trim() ? "border-red-500 focus-visible:ring-red-500 bg-red-50" : ""
                                            )}
                                            placeholder="เช่น ทบทวนคำศัพท์บทที่ 1"
                                        />
                                        {showError && !reviewTitle.trim() && (
                                            <p className="text-[10px] text-red-500 font-medium">กรุณาระบุชื่อกิจกรรม</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-gray-700">ไอคอน</Label>
                                        <div className="grid grid-cols-7 gap-1.5">
                                            {Object.entries(AVAILABLE_ICONS).map(([key, Icon]) => (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => setReviewIcon(key)}
                                                    className={cn(
                                                        "h-9 w-9 flex items-center justify-center rounded-lg transition-all duration-200",
                                                        reviewIcon === key
                                                            ? "bg-purple-100 text-purple-600 ring-2 ring-purple-500 ring-offset-2"
                                                            : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                                    )}
                                                >
                                                    <Icon className="w-4 h-4" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-gray-700">สี</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {AVAILABLE_COLORS.map((color) => (
                                                <button
                                                    key={color.value}
                                                    type="button"
                                                    onClick={() => setReviewColor(color.value)}
                                                    className={cn(
                                                        "w-6 h-6 rounded-full transition-all duration-200 ring-offset-2",
                                                        color.class.split(' ')[0], // Use background color class
                                                        reviewColor === color.value
                                                            ? `ring-2 ${color.ring} scale-110`
                                                            : "hover:scale-105 opacity-70 hover:opacity-100"
                                                    )}
                                                    title={color.label}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                                        <div className="space-y-1.5 min-w-0">
                                            <Label className="text-xs font-semibold text-gray-700">วันที่ทบทวน</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full h-9 justify-start text-left font-normal text-xs bg-gray-50 border-gray-200 hover:bg-white px-2",
                                                            !reviewDate && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-3.5 w-3.5 text-gray-500 shrink-0" />
                                                        <span>
                                                            {reviewDate ? format(reviewDate, "d MMM yyyy", { locale: th }) : "เลือกวันที่"}
                                                        </span>
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={reviewDate}
                                                        onSelect={(date) => date && setReviewDate(date)}
                                                        initialFocus
                                                        className="rounded-lg border shadow-lg"
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        <div className="space-y-1.5 min-w-0">
                                            <Label className="text-xs font-semibold text-gray-700">ระยะเวลา (นาที)</Label>
                                            <Popover open={openDuration} onOpenChange={setOpenDuration}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={openDuration}
                                                        className="w-full h-9 justify-between text-xs bg-gray-50 border-gray-200 hover:bg-white px-2"
                                                    >
                                                        <span className="truncate">
                                                            {reviewDuration ? `${reviewDuration} นาที` : "เลือกเวลา"}
                                                        </span>
                                                        <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[200px] p-0">
                                                    <Command>
                                                        <CommandInput
                                                            placeholder="ระบุเวลา..."
                                                            className="h-9 text-xs"
                                                            onValueChange={(v) => {
                                                                const val = parseInt(v);
                                                                if (!isNaN(val)) setReviewDuration(val);
                                                            }}
                                                        />
                                                        <CommandList>
                                                            <CommandEmpty>ไม่พบตัวเลือก</CommandEmpty>
                                                            <CommandGroup>
                                                                {[10, 15, 20, 30, 45, 60, 90, 120].map((time) => (
                                                                    <CommandItem
                                                                        key={time}
                                                                        value={time.toString()}
                                                                        onSelect={(currentValue) => {
                                                                            setReviewDuration(parseInt(currentValue));
                                                                            setOpenDuration(false);
                                                                        }}
                                                                        className="text-xs"
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-3 w-3",
                                                                                reviewDuration === time ? "opacity-100" : "opacity-0"
                                                                            )}
                                                                        />
                                                                        {time} นาที
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="px-5 py-3 border-t bg-white flex-shrink-0 gap-2">
                        <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)} className="h-9 px-4 rounded-lg border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 text-sm">
                            ยกเลิก
                        </Button>
                        <Button onClick={handleSaveReview} className="h-9 px-6 rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200 hover:shadow-purple-300 transition-all text-sm">
                            บันทึก
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
