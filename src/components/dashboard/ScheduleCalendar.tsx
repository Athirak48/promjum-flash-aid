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
import { Calendar as CalendarIcon, Clock, Edit2, Sparkles, BookOpen, MessageCircle, Headphones, Target, ChevronDown, Bell, CheckCircle, PenTool, Mic, Video, Music, Star, Heart, Zap, Coffee, Sun, Moon, X, Trash2, LucideIcon, Trophy, Flame, TrendingUp, CalendarDays, Plus, ChevronLeft, ChevronRight, ChevronsUpDown, Check, Brain, GraduationCap, Lightbulb, Puzzle, Timer, Layers, FileText, Award, Repeat, Bookmark, Loader2, Settings } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TimePicker } from './TimePicker';
import { DurationPicker } from './DurationPicker';
import { DatePicker } from './DatePicker';
import { AutoReviewDialog } from './AutoReviewDialog';
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
    zap: Zap,
    calendar: CalendarDays
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

    // Auto Review State
    const [autoReviewConfig, setAutoReviewConfig] = useState<{ mode: 'today' | 'tomorrow' | null, isOpen: boolean }>({ mode: null, isOpen: false });
    const [autoReviewTargetCount, setAutoReviewTargetCount] = useState<number>(0);
    const [isAutoGenerating, setIsAutoGenerating] = useState<boolean>(false);

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

    // Reschedule State
    const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
    const [rescheduleActivityId, setRescheduleActivityId] = useState<string | null>(null);
    const [rescheduleActivityTitle, setRescheduleActivityTitle] = useState<string>("");
    const [rescheduleNewDate, setRescheduleNewDate] = useState<Date>(new Date());
    const [rescheduleNewTime, setRescheduleNewTime] = useState<string>("09:00");

    // Fetch Weak Cards (lowest srs_score from user's flashcards - bottom 15)
    useEffect(() => {
        const fetchRecommended = async () => {
            setIsLoadingRecommended(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setIsLoadingRecommended(false);
                return;
            }

            const allWeakCards: Flashcard[] = [];

            // 1. Get user's flashcard progress with lowest srs_score (user_flashcards)
            const { data: userProgressData } = await supabase
                .from('user_flashcard_progress')
                .select('srs_score, srs_level, user_flashcards!user_flashcard_id(*)')
                .eq('user_id', user.id)
                .not('user_flashcard_id', 'is', null)
                .not('srs_score', 'is', null)
                .order('srs_score', { ascending: true, nullsFirst: false })
                .limit(50); // Increased limit for better merge accuracy

            if (userProgressData && userProgressData.length > 0) {
                userProgressData
                    .filter(p => p.user_flashcards)
                    .forEach(p => {
                        allWeakCards.push({
                            id: p.user_flashcards.id,
                            front_text: p.user_flashcards.front_text,
                            back_text: p.user_flashcards.back_text,
                            created_at: p.user_flashcards.created_at,
                            user_id: p.user_flashcards.user_id,
                            set_id: p.user_flashcards.flashcard_set_id,
                            image_url: p.user_flashcards.front_image_url || undefined,
                            srs_score: p.srs_score,
                            srs_level: p.srs_level
                        });
                    });
            }

            // 2. Get system flashcard progress with lowest srs_score
            const { data: systemProgressData } = await supabase
                .from('user_flashcard_progress')
                .select('srs_score, srs_level, flashcard_id, flashcards!flashcard_id(*)')
                .eq('user_id', user.id)
                .not('flashcard_id', 'is', null)
                .not('srs_score', 'is', null)
                .order('srs_score', { ascending: true, nullsFirst: false })
                .limit(50); // Increased limit for better merge accuracy

            if (systemProgressData && systemProgressData.length > 0) {
                systemProgressData
                    .filter(p => p.flashcards)
                    .forEach(p => {
                        allWeakCards.push({
                            id: p.flashcards.id,
                            front_text: p.flashcards.front_text,
                            back_text: p.flashcards.back_text,
                            created_at: p.flashcards.created_at || new Date().toISOString(),
                            user_id: 'system',
                            set_id: p.flashcards.subdeck_id || '',
                            image_url: undefined,
                            srs_score: p.srs_score,
                            srs_level: p.srs_level
                        });
                    });
            }

            // Sort all cards by srs_score ascending and take top 15
            const sortedWeakCards = allWeakCards
                .sort((a, b) => (a.srs_score ?? Infinity) - (b.srs_score ?? Infinity))
                .slice(0, 15);

            setRecommendedCards(sortedWeakCards);
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
        }
        fetchVocab();
    }, [selectedSetId]);

    // Update Schedule Data when reviews change
    useEffect(() => {
        const mappedSchedule: DaySchedule[] = [];

        reviews.forEach(review => {
            const date = new Date(review.scheduled_date);
            const dayIndex = date.getDay();

            const activity: Activity = {
                id: review.id,
                type: 'vocabulary' as Activity['type'],
                time: review.scheduled_time.substring(0, 5),
                duration: review.duration_minutes || 30,
                title: review.title || 'Review Session',
                icon: AVAILABLE_ICONS[review.icon as keyof typeof AVAILABLE_ICONS] || BookOpen,
                color: review.color || 'blue'
            };

            const existingDay = mappedSchedule.find(d => d.dayIndex === dayIndex);
            if (existingDay) {
                existingDay.activities.push(activity);
            } else {
                mappedSchedule.push({ dayIndex, activities: [activity] });
            }
        });

        setScheduleData(mappedSchedule);
    }, [reviews]);

    // Auto Review Logic
    const generateAutoToday = async (count: number, time: string) => {
        try {
            const count60 = Math.ceil(count * 0.6); // Target for Latest
            const count40 = count - count60;        // Target for Weak

            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            // 1. Fetch latest reviewed today
            const { data: recentReviews } = await supabase
                .from('user_flashcard_progress')
                .select('flashcard_id, user_flashcard_id, updated_at')
                .gte('updated_at', todayStart.toISOString())
                .order('updated_at', { ascending: false })
                .limit(count60);

            // 2. Fetch hard words (low retention)
            const { data: hardWords } = await supabase
                .from('user_flashcard_progress')
                .select('flashcard_id, user_flashcard_id, srs_level')
                .lt('srs_level', 2)
                .limit(count40);

            const recentSystemIds = recentReviews?.map(r => r.flashcard_id).filter(Boolean) as string[] || [];
            const recentUserIds = recentReviews?.map(r => r.user_flashcard_id).filter(Boolean) as string[] || [];

            const hardSystemIds = hardWords?.map(r => r.flashcard_id).filter(Boolean) as string[] || [];
            const hardUserIds = hardWords?.map(r => r.user_flashcard_id).filter(Boolean) as string[] || [];

            const allSystemIds = [...recentSystemIds, ...hardSystemIds];
            const allUserIds = [...recentUserIds, ...hardUserIds];

            let fetchedCards: Flashcard[] = [];

            if (allSystemIds.length > 0) {
                const { data: systemCards } = await supabase
                    .from('flashcards')
                    .select('*')
                    .in('id', allSystemIds);

                if (systemCards) {
                    fetchedCards = [...fetchedCards, ...systemCards.map(c => ({
                        id: c.id,
                        front_text: c.front_text,
                        back_text: c.back_text,
                        created_at: c.created_at || new Date().toISOString(),
                        user_id: 'system', // Placeholder
                        set_id: c.subdeck_id || '',
                        image_url: undefined,
                        srs_score: null // System cards might not have progress joined here directly, handled separately if needed
                    }))];
                }
            }

            if (allUserIds.length > 0) {
                const { data: userCards } = await supabase
                    .from('user_flashcards')
                    .select('*')
                    .in('id', allUserIds);

                if (userCards) {
                    fetchedCards = [...fetchedCards, ...userCards.map(c => ({
                        id: c.id,
                        front_text: c.front_text,
                        back_text: c.back_text,
                        created_at: c.created_at,
                        user_id: c.user_id,
                        set_id: c.flashcard_set_id,
                        image_url: c.front_image_url || undefined,
                        srs_score: null // Placeholder
                    }))];
                }
            }

            // Remove duplicates
            let uniqueCards = Array.from(new Map(fetchedCards.map(item => [item.id, item])).values());
            const currentCount = uniqueCards.length;

            // 3. Fallback: Fill with random cards from other sets if needed
            if (currentCount < count) {
                const needed = count - currentCount;
                const existingIds = uniqueCards.map(c => c.id);

                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    // Try to fetch random user cards not in existing set
                    // Note: Supabase doesn't have native random(). using range or rpc is better but for simple approach:
                    // We'll fetch a chunk and shuffle JS side, or just order by random if we had function.
                    // Simple approach: fetch recent created or random offset? 
                    // Let's just fetch recent created not in list.
                    const { data: fillData } = await supabase
                        .from('user_flashcards')
                        .select('*')
                        .eq('user_id', user.id)
                        .not('id', 'in', `(${existingIds.join(',')})`) // Exclude existing
                        .limit(50); // Fetch more than needed to shuffle

                    if (fillData && fillData.length > 0) {
                        // Shuffle locally
                        const shuffled = fillData.sort(() => 0.5 - Math.random()).slice(0, needed);

                        const fillCards: Flashcard[] = shuffled.map(c => ({
                            id: c.id,
                            front_text: c.front_text,
                            back_text: c.back_text,
                            created_at: c.created_at,
                            user_id: c.user_id,
                            set_id: c.flashcard_set_id,
                            image_url: c.front_image_url || undefined
                        }));

                        uniqueCards = [...uniqueCards, ...fillCards];
                    }
                }
            }

            // Final slice to ensure exact count (in case we over-filled or something, though logic ensures we don't)
            // But if hardWords overlapped with recentReviews, we removed dupes, so count decreased.
            // The fill step handles the gap.

            setSelectedItems(uniqueCards);

            // Auto-fill details
            setReviewTitle(`ทบทวน ${format(new Date(), 'd MMM', { locale: th })}`);
            setReviewIcon("zap"); // Use component reference key
            setReviewColor("bg-purple-100 text-purple-600");
            setReviewTime(time);
            setReviewDuration(15);

            toast({
                title: "จัดเตรียมเนื้อหาทบทวนเสร็จสิ้น",
                description: `คัดเลือก ${uniqueCards.length} คำศัพท์สำหรับวันนี้ (ล่าสุด/จำไม่ได้/สุ่มเสริม)`,
            });

        } catch (error) {
            console.error("Auto Today Error:", error);
            toast({
                variant: "destructive",
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถจัดเตรียมเนื้อหาอัตโนมัติได้",
            });
        } finally {
            setIsAutoGenerating(false);
        }
    };

    const generateAutoTomorrow = async (count: number, setId: string, time: string = '10:00') => {
        try {
            const count60 = Math.ceil(count * 0.6);
            const count40 = count - count60;

            // 1. Fetch new words from selected set
            const { data: setCards } = await supabase
                .from('user_flashcards')
                .select('*, user_flashcard_progress(times_reviewed)')
                .eq('flashcard_set_id', setId);

            const newCardsRaw = setCards
                ?.filter(c => !c.user_flashcard_progress?.[0] || c.user_flashcard_progress[0].times_reviewed === 0)
                .slice(0, count60) || [];

            const newCards: Flashcard[] = newCardsRaw.map(c => ({
                id: c.id,
                front_text: c.front_text,
                back_text: c.back_text,
                created_at: c.created_at,
                user_id: c.user_id,
                set_id: c.flashcard_set_id,
                image_url: c.front_image_url || undefined
            }));

            // 2. Fetch hard words (global)
            const { data: hardWords } = await supabase
                .from('user_flashcard_progress')
                .select('flashcard_id, user_flashcard_id, srs_level')
                .lt('srs_level', 2)
                .limit(count40);

            const hardSystemIds = hardWords?.map(r => r.flashcard_id).filter(Boolean) as string[] || [];
            const hardUserIds = hardWords?.map(r => r.user_flashcard_id).filter(Boolean) as string[] || [];

            let hardCards: Flashcard[] = [];

            if (hardSystemIds.length > 0) {
                const { data: systemCards } = await supabase
                    .from('flashcards')
                    .select('*')
                    .in('id', hardSystemIds);

                if (systemCards) {
                    hardCards = [...hardCards, ...systemCards.map(c => ({
                        id: c.id,
                        front_text: c.front_text,
                        back_text: c.back_text,
                        created_at: c.created_at || new Date().toISOString(),
                        user_id: 'system',
                        set_id: c.subdeck_id || '',
                        image_url: undefined
                    }))];
                }
            }

            if (hardUserIds.length > 0) {
                const { data: userCards } = await supabase
                    .from('user_flashcards')
                    .select('*')
                    .in('id', hardUserIds);

                if (userCards) {
                    hardCards = [...hardCards, ...userCards.map(c => ({
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

            const allCards = [...newCards, ...hardCards];
            const uniqueCards = Array.from(new Map(allCards.map(item => [item.id, item])).values());

            setSelectedItems(uniqueCards);

            setReviewTitle(`ทบทวน ${format(addDays(new Date(), 1), 'd MMM', { locale: th })}`);
            setReviewIcon("calendar");
            setReviewColor("bg-orange-100 text-orange-600");
            setReviewTime(time);
            setReviewDuration(15);

            toast({
                title: "จัดเตรียมเนื้อหาทบทวนเสร็จสิ้น",
                description: `คัดเลือก ${uniqueCards.length} คำศัพท์สำหรับวันพรุ่งนี้`,
            });

        } catch (error) {
            console.error("Auto Tomorrow Error:", error);
            toast({
                variant: "destructive",
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถจัดเตรียมเนื้อหาอัตโนมัติได้",
            });
        } finally {
            setIsAutoGenerating(false);
        }
    };

    useEffect(() => {
        if (isAutoGenerating && autoReviewConfig.mode === 'tomorrow' && selectedSetId) {
            generateAutoTomorrow(autoReviewTargetCount, selectedSetId);
        }
    }, [selectedSetId, isAutoGenerating, autoReviewConfig.mode, autoReviewTargetCount]);

    const handleAutoClick = (mode: 'today' | 'tomorrow') => {
        setAutoReviewConfig({ mode, isOpen: true });
        setReviewDate(mode === 'today' ? new Date() : addDays(new Date(), 1));
    };

    const handleAutoConfirm = async (count: number, time: string, folderId?: string, setId?: string) => {
        setAutoReviewTargetCount(count);
        if (autoReviewConfig.mode === 'today') {
            setIsAutoGenerating(true);
            await generateAutoToday(count, time);
        } else if (autoReviewConfig.mode === 'tomorrow' && setId) {
            setIsAutoGenerating(true);
            await generateAutoTomorrow(count, setId, time);
        }
    };

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

    // Reschedule Handlers
    const handleOpenReschedule = (activity: Activity, date: Date) => {
        setRescheduleActivityId(activity.id);
        setRescheduleActivityTitle(activity.title);
        setRescheduleNewDate(date);
        setRescheduleNewTime(activity.time);
        setIsRescheduleDialogOpen(true);
    };

    const handleReschedule = async () => {
        if (!rescheduleActivityId) return;

        await updateReview(rescheduleActivityId, {
            scheduled_date: format(rescheduleNewDate, 'yyyy-MM-dd'),
            scheduled_time: rescheduleNewTime
        });

        setIsRescheduleDialogOpen(false);
        setRescheduleActivityId(null);
        toast({
            title: "เลื่อนเวลาสำเร็จ",
            description: "เปลี่ยนเวลากิจกรรมเรียบร้อยแล้ว"
        });
    };

    const handleOpenReviewDialog = () => {
        const isMobile = window.matchMedia('(max-width: 767px)').matches;
        if (isMobile) {
            setActiveTab("vocabulary");
        } else {
            setActiveTab("latest");
        }
        setIsReviewDialogOpen(true);
    };

    return (
        <div className="h-full flex flex-col gap-6 p-6 bg-background/50">
            {/* Header Row 1: Title and Main Action */}
            <div className="flex flex-row items-center justify-between gap-3 w-full">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 sm:p-3 bg-purple-100/50 rounded-xl sm:rounded-2xl text-purple-600 shadow-sm border border-purple-100">
                        <CalendarIcon className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">ตารางเรียนรู้</h1>
                        <p className="text-muted-foreground text-xs sm:text-sm font-medium">จัดการเวลาเรียนรู้ของคุณ</p>
                    </div>
                </div>
                <Button
                    onClick={handleOpenReviewDialog}
                    className="h-9 sm:h-10 px-4 sm:px-5 text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300 rounded-xl font-semibold"
                >
                    <Clock className="w-4 h-4 mr-2" />
                    ตั้งเวลาทบทวน
                </Button>
            </div>

            {/* Header Row 2: Controls - Same row on all screens */}
            <div className="flex flex-row items-center justify-between gap-1.5 sm:gap-2 w-full">
                {/* View Switcher */}
                <div className="bg-card p-0.5 rounded-lg sm:rounded-2xl border shadow-sm grid grid-cols-4 gap-0.5 flex-1 sm:flex-none sm:w-auto max-w-[180px] sm:max-w-none">
                    {(['day', 'week', 'month', 'year'] as const).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={cn(
                                "px-1 sm:px-2 py-0.5 sm:py-1.5 rounded-md sm:rounded-xl text-[9px] sm:text-xs font-semibold transition-all duration-200 w-full text-center whitespace-nowrap",
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
                <div className="flex items-center bg-pink-50/50 p-0.5 rounded-lg sm:rounded-2xl border border-pink-100/50 shadow-sm flex-shrink-0">
                    <div className="flex items-center">
                        <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-8 sm:w-8 text-pink-400 hover:text-pink-600 hover:bg-pink-100 rounded-md sm:rounded-xl" onClick={() => handleNavigate('prev')}>
                            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" className="h-6 sm:h-8 px-1.5 sm:px-3 text-pink-700 hover:bg-pink-100 hover:text-pink-800 font-semibold text-[10px] sm:text-sm rounded-md sm:rounded-xl justify-center">
                                    <CalendarIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-2 opacity-70" />
                                    {format(selectedDate, 'd MMMM yyyy', { locale: th })}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => date && setSelectedDate(date)}
                                    initialFocus
                                    className="p-3 pointer-events-auto"
                                />
                            </PopoverContent>
                        </Popover>

                        <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-8 sm:w-8 text-pink-400 hover:text-pink-600 hover:bg-pink-100 rounded-md sm:rounded-xl" onClick={() => handleNavigate('next')}>
                            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
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
                                            {Array.from({ length: startDayOfWeek }).map((_, i) => <div key={"empty-" + i} />)}
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
                    </ScrollArea>
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
                            <div className={cn("grid gap-0 sticky top-0 z-40 bg-card border-b pb-2 pt-4", (viewMode === 'week' || viewMode === 'day') ? "grid-cols-[35px_1fr] md:grid-cols-[60px_1fr]" : "grid-cols-7", viewMode === 'week' ? "min-w-full" : "min-w-full")}>
                                <div className="text-center text-xs font-bold py-2 text-muted-foreground/50 sticky left-0 z-50 bg-card"></div>
                                <div className={cn("grid gap-0", viewMode === 'day' ? "grid-cols-1" : "grid-cols-7")}>
                                    {getDaysToRender().map((date, index) => {
                                        if (!date) return null;
                                        const isCurrentDay = isToday(date);
                                        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                                        if (viewMode === 'day') {
                                            return (
                                                <div key={index} className={"text-center text-sm font-bold py-2 rounded-md " + (isCurrentDay ? 'text-primary' : isWeekend ? 'text-muted-foreground' : 'text-foreground')}>
                                                    {format(date, 'EEEE d MMMM yyyy', { locale: th })}
                                                </div>
                                            );
                                        }

                                        return (
                                            <div key={index} className="flex flex-col items-center justify-center py-2 gap-1 border-l border-transparent">
                                                <span className={"text-sm uppercase font-bold " + (isCurrentDay ? 'text-primary' : 'text-foreground')}>
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
                                <div className="w-[35px] md:w-[60px] flex-shrink-0 border-r border-border/40 bg-muted sticky left-0 z-30">
                                    {HOURS.map(hour => (
                                        <div key={hour} className="h-[60px] text-[10px] md:text-sm text-foreground p-1 text-right pr-1 md:pr-3 relative font-semibold">
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
                                            <div key={dayIndex} className={"border-r border-border/30 relative min-h-[1440px] " + (isCurrentDay ? 'bg-primary/[0.02]' : '')}>
                                                {HOURS.map(hour => (
                                                    <div key={hour} className="h-[60px] border-b border-dashed border-border/30" />
                                                ))}

                                                {/* Current Time Indicator (Visual only, static for now) */}
                                                {isCurrentDay && (
                                                    <div
                                                        className="absolute w-full border-t-2 border-red-500 z-20 pointer-events-none flex items-center"
                                                        style={{ top: getPixelPosition(format(new Date(), 'HH:mm')) + "px" }}
                                                    >
                                                        <div className="w-2 h-2 rounded-full bg-red-500 -ml-1"></div>
                                                    </div>
                                                )}

                                                {daySchedule?.activities.map(activity => (
                                                    <div
                                                        key={activity.id}
                                                        className={"absolute left-0.5 right-0.5 md:left-1 md:right-1 rounded-sm md:rounded-lg p-0.5 md:p-2 text-[9px] md:text-xs border-l-2 md:border-l-4 overflow-hidden cursor-pointer hover:brightness-95 transition-all shadow-sm z-10 " + activity.color}
                                                        style={{
                                                            top: getPixelPosition(activity.time) + "px",
                                                            height: Math.max(getPixelHeight(activity.duration), viewMode === 'day' ? 50 : 30) + "px"
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditSchedule(date.getDay());
                                                        }}
                                                    >
                                                        <div className={cn("font-semibold flex items-center gap-1", viewMode === 'day' ? "text-sm mb-1" : "justify-center md:justify-start")}>
                                                            <activity.icon className={cn("flex-shrink-0 opacity-70", viewMode === 'day' ? "w-4 h-4" : "w-3 h-3")} />
                                                            <span className="truncate leading-tight">{viewMode === 'week' ? (
                                                                <span className="md:hidden font-normal hidden">{activity.title}</span>
                                                            ) : null}
                                                                <span className="hidden md:inline">{activity.time} - {activity.title}</span>
                                                            </span>
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
                ) : null}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>แก้ไขกิจกรรม</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {selectedDay !== null && getDaysToRender().find(d => d?.getDay() === selectedDay) && getDaySchedule(selectedDay).activities.map((activity) => {
                            const activityDate = getDaysToRender().find(d => d?.getDay() === selectedDay) || new Date();
                            return (
                                <div key={activity.id} className="flex items-center gap-3 border-b pb-4 last:border-0">
                                    <Input
                                        id={"time-" + activity.id}
                                        defaultValue={activity.time}
                                        className="w-20 flex-shrink-0"
                                        onChange={(e) => handleUpdateActivityTime(selectedDay, activity.id, e.target.value)}
                                    />
                                    <Input
                                        id={"title-" + activity.id}
                                        defaultValue={activity.title}
                                        className="flex-1"
                                        onChange={(e) => handleUpdateActivityTitle(selectedDay, activity.id, e.target.value)}
                                    />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="flex-shrink-0 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                                        onClick={() => {
                                            setIsDialogOpen(false);
                                            handleOpenReschedule(activity, activityDate);
                                        }}
                                        title="เลื่อนเวลา"
                                    >
                                        <CalendarIcon className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="flex-shrink-0"
                                        onClick={() => handleRemoveActivity(selectedDay, activity.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            );
                        })}
                        <Button
                            onClick={() => {
                                setIsDialogOpen(false);
                                handleOpenReviewDialog();
                            }}
                            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                        >
                            + เพิ่มกิจกรรม
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Reschedule Dialog */}
            <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-purple-700">
                            <CalendarIcon className="w-5 h-5" />
                            เลื่อนเวลากิจกรรม
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {/* Current Activity Info */}
                        <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                            <div className="text-xs text-purple-500 mb-1">กิจกรรม</div>
                            <div className="font-semibold text-purple-700">{rescheduleActivityTitle}</div>
                        </div>

                        {/* Date Picker */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">เลือกวันใหม่</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal border-gray-200"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 text-purple-500" />
                                        {format(rescheduleNewDate, 'd MMMM yyyy', { locale: th })}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={rescheduleNewDate}
                                        onSelect={(date) => date && setRescheduleNewDate(date)}
                                        initialFocus
                                        className="p-3 pointer-events-auto"
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Time Picker */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">เลือกเวลาใหม่</Label>
                            <TimePicker value={rescheduleNewTime} onChange={setRescheduleNewTime} />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsRescheduleDialogOpen(false)}
                            className="flex-1"
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            onClick={handleReschedule}
                            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                        >
                            บันทึก
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                <DialogContent className="w-[95vw] max-w-6xl h-[85vh] max-h-[700px] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl border-none shadow-2xl bg-white">
                    {/* Header - Clean and Simple */}
                    <DialogHeader className="px-4 py-3 border-b bg-white flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-base font-bold flex items-center gap-2 text-gray-800">
                                <Clock className="w-5 h-5 text-purple-600" />
                                ตั้งเวลาทบทวน
                            </DialogTitle>
                            {/* Auto buttons - show on all screen sizes */}
                            <div className="flex gap-2 mr-8">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-3 text-xs rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200 font-medium gap-1.5"
                                    onClick={() => handleAutoClick('today')}
                                >
                                    <Zap className="w-4 h-4" />
                                    วันนี้
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-3 text-xs rounded-full bg-orange-100 text-orange-700 hover:bg-orange-200 font-medium gap-1.5"
                                    onClick={() => handleAutoClick('tomorrow')}
                                >
                                    <CalendarDays className="w-4 h-4" />
                                    พรุ่งนี้
                                </Button>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Main Content - 3-column layout on desktop */}
                    <div className="flex-1 overflow-hidden">
                        <div className="flex flex-col lg:flex-row h-full">
                            {/* Left Column: Selected Items (hidden on mobile, show in tabs) */}
                            <div className="hidden lg:flex lg:w-[200px] xl:w-[240px] flex-col border-r bg-gray-50/50 flex-shrink-0">
                                <div className="p-3 border-b bg-white flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-purple-700 font-semibold text-xs">
                                        <CheckCircle className="w-4 h-4" />
                                        <span>รายการที่เลือก</span>
                                    </div>
                                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100 text-[10px] px-1.5 py-0">
                                        {selectedItems.length}
                                    </Badge>
                                </div>
                                <ScrollArea className="flex-1">
                                    <div className="p-2 space-y-1.5">
                                        {selectedItems.length > 0 ? (
                                            selectedItems.map((item) => {
                                                // Get SRS level color
                                                const level = item.srs_level ?? 0;
                                                let levelColor = '#B71C1C';
                                                if (level === 0) levelColor = '#B71C1C';
                                                else if (level === 1) levelColor = '#E53935';
                                                else if (level === 2) levelColor = '#FF5722';
                                                else if (level === 3) levelColor = '#FF8A65';
                                                else levelColor = '#FFCCBC';

                                                return (
                                                    <div key={item.id} className="flex items-start gap-2 p-2 rounded-lg bg-white border border-gray-100 group hover:border-purple-200 hover:shadow-sm transition-all">
                                                        <div
                                                            className="mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ring-2 ring-white shadow-sm"
                                                            style={{ backgroundColor: levelColor }}
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[11px] font-medium text-gray-800">{item.front_text}</p>
                                                            <p className="text-[10px] text-gray-400">{item.back_text}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => setSelectedItems(prev => prev.filter(i => i.id !== item.id))}
                                                            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-100 text-red-400 hover:text-red-500 rounded transition-all"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="py-8 flex flex-col items-center justify-center text-center text-gray-400 space-y-2">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                                    <CheckCircle className="w-5 h-5 text-gray-300" />
                                                </div>
                                                <p className="text-[10px] text-gray-400">เลือกคำศัพท์จากรายการ</p>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>

                            {/* Center Column: Vocabulary Selection Tabs */}
                            <div className="flex-1 flex flex-col min-w-0 bg-white">
                                <Tabs value={activeTab} className="flex-1 flex flex-col h-full" onValueChange={setActiveTab}>
                                    <div className="px-3 py-2 border-b bg-gray-50/50 flex-shrink-0">
                                        {/* Mobile: 2 simple tabs */}
                                        <TabsList className="w-full grid grid-cols-2 md:hidden bg-white border p-0.5 h-10 rounded-lg shadow-sm">
                                            <TabsTrigger value="vocabulary" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 rounded-md text-xs font-medium">คำศัพท์</TabsTrigger>
                                            <TabsTrigger value="settings" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 rounded-md text-xs font-medium">ตั้งค่า</TabsTrigger>
                                        </TabsList>
                                        {/* Tablet/Desktop: Full tabs */}
                                        <TabsList className="hidden md:grid w-full grid-cols-4 lg:grid-cols-3 bg-white border p-0.5 h-8 rounded-lg shadow-sm">
                                            <TabsTrigger value="selected" className="lg:hidden data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 rounded-md text-[10px] font-medium">เลือก ({selectedItems.length})</TabsTrigger>
                                            <TabsTrigger value="weak" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 rounded-md text-[10px] font-medium">ยังจำไม่ได้</TabsTrigger>
                                            <TabsTrigger value="latest" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 rounded-md text-[10px] font-medium">ล่าสุด</TabsTrigger>
                                            <TabsTrigger value="library" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 rounded-md text-[10px] font-medium">คลังคำศัพท์</TabsTrigger>
                                        </TabsList>
                                    </div>

                                    <div className="flex-1 overflow-hidden relative flex flex-col">
                                        {/* Mobile: Vocabulary Tab with 2-Column Layout */}
                                        <TabsContent value="vocabulary" className="h-full m-0 absolute inset-0 md:hidden">
                                            <div className="flex h-full">
                                                {/* Left: Selected Items */}
                                                <div className="w-[120px] flex-shrink-0 border-r bg-gray-50/50 flex flex-col">
                                                    <div className="p-2 border-b bg-white flex items-center justify-between">
                                                        <div className="flex items-center gap-1 text-purple-700 font-semibold text-[10px]">
                                                            <CheckCircle className="w-3 h-3" />
                                                            <span>รายการที่เลือก</span>
                                                        </div>
                                                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-[9px] px-1 py-0">{selectedItems.length}</Badge>
                                                    </div>
                                                    <ScrollArea className="flex-1">
                                                        <div className="p-1.5 space-y-1">
                                                            {selectedItems.length > 0 ? (
                                                                selectedItems.map((item) => {
                                                                    // Get SRS level color
                                                                    const level = item.srs_level ?? 0;
                                                                    let levelColor = '#B71C1C';
                                                                    if (level === 0) levelColor = '#B71C1C';
                                                                    else if (level === 1) levelColor = '#E53935';
                                                                    else if (level === 2) levelColor = '#FF5722';
                                                                    else if (level === 3) levelColor = '#FF8A65';
                                                                    else levelColor = '#FFCCBC';

                                                                    return (
                                                                        <div key={item.id} className="flex items-start gap-1 p-1.5 rounded-lg bg-white border border-gray-100 group">
                                                                            <div
                                                                                className="mt-1 w-2 h-2 rounded-full flex-shrink-0 ring-1 ring-white shadow-sm"
                                                                                style={{ backgroundColor: levelColor }}
                                                                            />
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-[9px] font-medium text-gray-800">{item.front_text}</p>
                                                                                <p className="text-[8px] text-gray-400">{item.back_text}</p>
                                                                            </div>
                                                                            <button onClick={() => setSelectedItems(prev => prev.filter(i => i.id !== item.id))} className="p-0.5 text-gray-300 hover:text-red-500 rounded">
                                                                                <X className="w-2.5 h-2.5" />
                                                                            </button>
                                                                        </div>
                                                                    );
                                                                })
                                                            ) : (
                                                                <div className="py-6 flex flex-col items-center text-center text-gray-400 space-y-1">
                                                                    <CheckCircle className="w-5 h-5 text-gray-200" />
                                                                    <p className="text-[8px]">เลือกคำศัพท์<br />จากรายการ</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </ScrollArea>
                                                </div>
                                                {/* Right: Vocabulary Sub-tabs */}
                                                <div className="flex-1 flex flex-col min-w-0">
                                                    <Tabs defaultValue="latest" className="flex flex-col h-full">
                                                        <div className="px-2 py-1.5 border-b bg-gray-50/30 flex-shrink-0">
                                                            <TabsList className="w-full grid grid-cols-3 bg-white border p-0.5 h-7 rounded-lg shadow-sm">
                                                                <TabsTrigger value="weak" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 rounded-md text-[9px] font-medium">ยังจำไม่ได้</TabsTrigger>
                                                                <TabsTrigger value="latest" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 rounded-md text-[9px] font-medium">ล่าสุด</TabsTrigger>
                                                                <TabsTrigger value="library" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 rounded-md text-[9px] font-medium">คลังคำศัพท์</TabsTrigger>
                                                            </TabsList>
                                                        </div>
                                                        <div className="flex-1 overflow-hidden relative">
                                                            <TabsContent value="weak" className="h-full m-0 absolute inset-0 data-[state=active]:flex flex-col bg-white">
                                                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                                                    <div className="p-4 space-y-3">
                                                                        <h3 className="text-sm font-semibold text-gray-700 mb-2">คำศัพท์ที่ต้องทบทวน</h3>
                                                                        {recommendedCards.length > 0 ? recommendedCards.map((card, index) => {
                                                                            // SRS Level Color Logic
                                                                            const level = card.srs_level ?? 0;
                                                                            let levelColor = '#B71C1C';
                                                                            let ringColor = 'ring-red-100';
                                                                            let badgeText = 'วิกฤต';

                                                                            if (level === 0) {
                                                                                levelColor = '#B71C1C';
                                                                                badgeText = 'วิกฤต';
                                                                                ringColor = 'ring-red-100';
                                                                            } else if (level === 1) {
                                                                                levelColor = '#E53935';
                                                                                badgeText = 'เร่งด่วน';
                                                                                ringColor = 'ring-red-50';
                                                                            } else if (level === 2) {
                                                                                levelColor = '#FF5722';
                                                                                badgeText = 'ปานกลาง';
                                                                                ringColor = 'ring-orange-100';
                                                                            } else if (level === 3) {
                                                                                levelColor = '#FF8A65';
                                                                                badgeText = 'พอใช้';
                                                                                ringColor = 'ring-orange-50';
                                                                            } else {
                                                                                levelColor = '#FFCCBC';
                                                                                badgeText = 'ดี';
                                                                                ringColor = 'ring-slate-100';
                                                                            }

                                                                            const isSelected = selectedItems.some(i => i.id === card.id);
                                                                            const isDarkBackground = level <= 2;
                                                                            const mainTextColor = isSelected ? 'text-slate-900' : (isDarkBackground ? 'text-white' : 'text-slate-900');
                                                                            const subTextColor = isSelected ? 'text-slate-500' : (isDarkBackground ? 'text-white/80' : 'text-slate-600');

                                                                            return (
                                                                                <div
                                                                                    key={card.id || index}
                                                                                    className={"flex items-center gap-4 p-3 border rounded-2xl transition-all cursor-pointer group " + (isSelected ? 'border-purple-500' : 'border-transparent shadow-sm hover:shadow-md')}
                                                                                    style={{
                                                                                        backgroundColor: levelColor,
                                                                                    }}
                                                                                    onClick={() => {
                                                                                        setSelectedItems(prev =>
                                                                                            prev.some(i => i.id === card.id)
                                                                                                ? prev.filter(i => i.id !== card.id)
                                                                                                : [...prev, card]
                                                                                        );
                                                                                    }}
                                                                                >
                                                                                    <div
                                                                                        className={"w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors " + (isSelected ? 'bg-white border-white' : (isDarkBackground ? 'border-white/50 bg-black/10' : 'border-slate-400 bg-white/50'))}
                                                                                    >
                                                                                        {isSelected && (
                                                                                            <Check className="w-3.5 h-3.5 text-purple-600" />
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <div className="flex items-center gap-2">
                                                                                            <div className={"text-sm font-semibold " + mainTextColor}>{card.front_text}</div>
                                                                                            <div
                                                                                                className="px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm"
                                                                                                style={{ backgroundColor: 'rgba(0,0,0,0.15)', color: '#fff' }}
                                                                                            >
                                                                                                {badgeText}
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className={"text-xs " + subTextColor}>{card.back_text}</div>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        }) : (
                                                                            <div className="py-12 text-center text-xs text-gray-400">
                                                                                ไม่มีคำศัพท์ที่ต้องทบทวนในขณะนี้
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </TabsContent>

                                                            <TabsContent value="latest" className="h-full m-0 absolute inset-0 data-[state=active]:flex flex-col bg-white">
                                                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                                                    <div className="p-4 space-y-3">
                                                                        <h3 className="text-sm font-semibold text-gray-700 mb-2">คำศัพท์ที่เรียนล่าสุด</h3>
                                                                        {flashcards.map((card) => (
                                                                            <div
                                                                                key={card.id}
                                                                                className={cn(
                                                                                    "flex items-center gap-4 p-3 rounded-2xl border transition-all cursor-pointer",
                                                                                    selectedItems.some(i => i.id === card.id)
                                                                                        ? "bg-purple-50 border-purple-200"
                                                                                        : "bg-white border-gray-100 hover:border-purple-100 hover:bg-purple-50/30"
                                                                                )}
                                                                                onClick={() => {
                                                                                    setSelectedItems(prev =>
                                                                                        prev.some(i => i.id === card.id)
                                                                                            ? prev.filter(i => i.id !== card.id)
                                                                                            : [...prev, card]
                                                                                    );
                                                                                }}
                                                                            >
                                                                                <div className={cn(
                                                                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                                                                    selectedItems.some(i => i.id === card.id)
                                                                                        ? "border-purple-500 bg-purple-500"
                                                                                        : "border-purple-200"
                                                                                )}>
                                                                                    {selectedItems.some(i => i.id === card.id) && <Check className="w-3.5 h-3.5 text-white" />}
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <p className="text-sm font-semibold text-gray-800">{card.front_text}</p>
                                                                                    <p className="text-xs text-gray-500">{card.back_text}</p>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </TabsContent>

                                                            <TabsContent value="library" className="h-full m-0 absolute inset-0">
                                                                <div className="flex flex-col h-full">
                                                                    <div className="p-3 bg-white border-b space-y-2 flex-shrink-0">
                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            <Select value={selectedFolderId} onValueChange={(v) => { setSelectedFolderId(v); setSelectedSetId(""); }}>
                                                                                <SelectTrigger className="h-8 text-xs bg-gray-50 border-gray-200"><SelectValue placeholder="เลือกโฟลเดอร์" /></SelectTrigger>
                                                                                <SelectContent>
                                                                                    {userFolders.map((f) => (<SelectItem key={f.id} value={f.id} className="text-xs">{f.title}</SelectItem>))}
                                                                                </SelectContent>
                                                                            </Select>
                                                                            <Select value={selectedSetId} onValueChange={setSelectedSetId} disabled={!selectedFolderId}>
                                                                                <SelectTrigger className="h-8 text-xs bg-gray-50 border-gray-200"><SelectValue placeholder="เลือกชุดคำศัพท์" /></SelectTrigger>
                                                                                <SelectContent>
                                                                                    {userSets.map((s) => (<SelectItem key={s.id} value={s.id} className="text-xs">{s.title}</SelectItem>))}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </div>
                                                                    </div>
                                                                    <ScrollArea className="flex-1">
                                                                        <div className="p-3 space-y-1.5">
                                                                            {isLoadingLibrary ? (
                                                                                <div className="py-12 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
                                                                                    <Loader2 className="w-5 h-5 animate-spin" />กำลังโหลด...
                                                                                </div>
                                                                            ) : !selectedSetId ? (
                                                                                <div className="py-12 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
                                                                                    <BookOpen className="w-8 h-8 text-gray-200" />เลือกชุดคำศัพท์
                                                                                </div>
                                                                            ) : libraryVocabulary.length > 0 ? (
                                                                                libraryVocabulary.map((card) => (
                                                                                    <div
                                                                                        key={card.id}
                                                                                        className={cn(
                                                                                            "flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer",
                                                                                            selectedItems.some(i => i.id === card.id)
                                                                                                ? "bg-purple-50 border-purple-200"
                                                                                                : "bg-white border-gray-100 hover:border-purple-100 hover:bg-purple-50/30"
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
                                                                                            <p className="text-xs font-medium text-gray-800 truncate">{card.front_text}</p>
                                                                                            <p className="text-[10px] text-gray-400 truncate">{card.back_text}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                ))
                                                                            ) : (
                                                                                <div className="py-12 text-center text-xs text-gray-400">
                                                                                    ไม่พบคำศัพท์ในชุดนี้
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </ScrollArea>
                                                                </div>
                                                            </TabsContent>
                                                        </div>
                                                    </Tabs>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        {/* Mobile Settings Tab */}
                                        <TabsContent value="settings" className="h-full m-0 absolute inset-0 md:hidden">
                                            <ScrollArea className="h-full">
                                                <div className="p-4 space-y-4">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-semibold text-gray-700">ชื่อกิจกรรม</Label>
                                                        <Input
                                                            value={reviewTitle}
                                                            onChange={(e) => {
                                                                setReviewTitle(e.target.value);
                                                                if (e.target.value.trim()) setShowError(false);
                                                            }}
                                                            className={cn(
                                                                "h-10 text-sm bg-white border-gray-200 rounded-lg",
                                                                showError && !reviewTitle.trim() ? "border-red-400 bg-red-50" : ""
                                                            )}
                                                            placeholder="ทบทวนคำศัพท์บทที่ 1"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-semibold text-gray-700">ไอคอน</Label>
                                                        <div className="grid grid-cols-8 gap-2">
                                                            {Object.entries(AVAILABLE_ICONS).map(([key, Icon]) => (
                                                                <button
                                                                    key={key}
                                                                    type="button"
                                                                    onClick={() => setReviewIcon(key)}
                                                                    className={cn(
                                                                        "w-9 h-9 flex items-center justify-center rounded-lg transition-all",
                                                                        reviewIcon === key
                                                                            ? "bg-purple-100 text-purple-600 ring-2 ring-purple-400"
                                                                            : "bg-white border border-gray-200 text-gray-500"
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
                                                                        "w-8 h-8 rounded-full transition-all",
                                                                        color.class.split(' ')[0],
                                                                        reviewColor === color.value ? `ring - 2 ${color.ring} scale - 110` : ""
                                                                    )}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-3">
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs font-semibold text-gray-700">วันที่</Label>
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <Button variant="outline" className="w-full h-10 justify-start text-left text-xs bg-white">
                                                                        <CalendarIcon className="mr-1 h-4 w-4 text-purple-500" />
                                                                        {reviewDate ? format(reviewDate, "d MMM", { locale: th }) : "เลือก"}
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto p-0" align="start">
                                                                    <Calendar mode="single" selected={reviewDate} onSelect={(d) => d && setReviewDate(d)} initialFocus />
                                                                </PopoverContent>
                                                            </Popover>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs font-semibold text-gray-700">เวลา</Label>
                                                            <Input type="time" value={reviewTime} onChange={(e) => setReviewTime(e.target.value)} className="h-10 text-xs bg-white" />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs font-semibold text-gray-700">นาที</Label>
                                                            <Select value={reviewDuration.toString()} onValueChange={(v) => setReviewDuration(parseInt(v))}>
                                                                <SelectTrigger className="h-10 text-xs bg-white"><SelectValue /></SelectTrigger>
                                                                <SelectContent>
                                                                    {[10, 15, 20, 30, 45, 60, 90, 120].map((t) => (
                                                                        <SelectItem key={t} value={t.toString()}>{t} นาที</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </ScrollArea>
                                        </TabsContent>

                                        {/* Desktop Tabs: Weak, Latest, Library (Hidden on Mobile) */}
                                        <TabsContent value="weak" className="h-full m-0 absolute inset-0 data-[state=active]:flex flex-col bg-white">
                                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                                <div className="p-4 space-y-3">
                                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">คำศัพท์ที่ต้องทบทวน</h3>
                                                    {recommendedCards.length > 0 ? recommendedCards.map((card, index) => {
                                                        // SRS Level Color Logic
                                                        const level = card.srs_level ?? 0;
                                                        let levelColor = '#B71C1C';
                                                        let ringColor = 'ring-red-100';
                                                        let badgeText = 'วิกฤต';

                                                        if (level === 0) {
                                                            levelColor = '#B71C1C';
                                                            badgeText = 'วิกฤต';
                                                            ringColor = 'ring-red-100';
                                                        } else if (level === 1) {
                                                            levelColor = '#E53935';
                                                            badgeText = 'เร่งด่วน';
                                                            ringColor = 'ring-red-50';
                                                        } else if (level === 2) {
                                                            levelColor = '#FF5722';
                                                            badgeText = 'ปานกลาง';
                                                            ringColor = 'ring-orange-100';
                                                        } else if (level === 3) {
                                                            levelColor = '#FF8A65';
                                                            badgeText = 'พอใช้';
                                                            ringColor = 'ring-orange-50';
                                                        } else {
                                                            levelColor = '#FFCCBC';
                                                            badgeText = 'ดี';
                                                            ringColor = 'ring-slate-100';
                                                        }

                                                        const isSelected = selectedItems.some(i => i.id === card.id);
                                                        const isDarkBackground = level <= 2;
                                                        const mainTextColor = isSelected ? 'text-slate-900' : (isDarkBackground ? 'text-white' : 'text-slate-900');
                                                        const subTextColor = isSelected ? 'text-slate-500' : (isDarkBackground ? 'text-white/80' : 'text-slate-600');

                                                        return (
                                                            <div
                                                                key={card.id || index}
                                                                className={"flex items-center gap-4 p-3 border rounded-2xl transition-all cursor-pointer group " + (isSelected ? 'border-purple-500' : 'border-transparent shadow-sm hover:shadow-md')}
                                                                style={{
                                                                    backgroundColor: levelColor,
                                                                }}
                                                                onClick={() => {
                                                                    setSelectedItems(prev =>
                                                                        prev.some(i => i.id === card.id)
                                                                            ? prev.filter(i => i.id !== card.id)
                                                                            : [...prev, card]
                                                                    );
                                                                }}
                                                            >
                                                                <div
                                                                    className={"w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors " + (isSelected ? 'bg-white border-white' : (isDarkBackground ? 'border-white/50 bg-black/10' : 'border-slate-400 bg-white/50'))}
                                                                >
                                                                    {isSelected && (
                                                                        <Check className="w-3.5 h-3.5 text-purple-600" />
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={"text-sm font-semibold " + mainTextColor}>{card.front_text}</div>
                                                                        <div
                                                                            className="px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm"
                                                                            style={{ backgroundColor: 'rgba(0,0,0,0.15)', color: '#fff' }}
                                                                        >
                                                                            {badgeText}
                                                                        </div>
                                                                    </div>
                                                                    <div className={"text-xs " + subTextColor}>{card.back_text}</div>
                                                                </div>
                                                            </div>
                                                        );
                                                    }) : (
                                                        <div className="py-12 text-center text-xs text-gray-400">
                                                            ไม่มีคำศัพท์ที่ต้องทบทวนในขณะนี้
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="latest" className="h-full m-0 absolute inset-0 data-[state=active]:flex flex-col bg-white">
                                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                                <div className="p-4 space-y-3">
                                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">คำศัพท์ที่เรียนล่าสุด</h3>
                                                    {flashcards.map((card) => (
                                                        <div
                                                            key={card.id}
                                                            className={cn(
                                                                "flex items-center gap-4 p-3 rounded-2xl border transition-all cursor-pointer",
                                                                selectedItems.some(i => i.id === card.id)
                                                                    ? "bg-purple-50 border-purple-200"
                                                                    : "bg-white border-gray-100 hover:border-purple-100 hover:bg-purple-50/30"
                                                            )}
                                                            onClick={() => {
                                                                setSelectedItems(prev =>
                                                                    prev.some(i => i.id === card.id)
                                                                        ? prev.filter(i => i.id !== card.id)
                                                                        : [...prev, card]
                                                                );
                                                            }}
                                                        >
                                                            <div className={cn(
                                                                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                                                selectedItems.some(i => i.id === card.id)
                                                                    ? "border-purple-500 bg-purple-500"
                                                                    : "border-purple-200"
                                                            )}>
                                                                {selectedItems.some(i => i.id === card.id) && <Check className="w-3.5 h-3.5 text-white" />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-semibold text-gray-800">{card.front_text}</p>
                                                                <p className="text-xs text-gray-500">{card.back_text}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="library" className="flex-1 flex flex-col min-h-0">
                                            <div className="flex flex-col h-full">
                                                <div className="p-3 bg-white border-b space-y-2 flex-shrink-0">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <Select value={selectedFolderId} onValueChange={(v) => { setSelectedFolderId(v); setSelectedSetId(""); }}>
                                                            <SelectTrigger className="h-8 text-xs bg-gray-50 border-gray-200"><SelectValue placeholder="เลือกโฟลเดอร์" /></SelectTrigger>
                                                            <SelectContent>
                                                                {userFolders.map((f) => (<SelectItem key={f.id} value={f.id} className="text-xs">{f.title}</SelectItem>))}
                                                            </SelectContent>
                                                        </Select>
                                                        <Select value={selectedSetId} onValueChange={setSelectedSetId} disabled={!selectedFolderId}>
                                                            <SelectTrigger className="h-8 text-xs bg-gray-50 border-gray-200"><SelectValue placeholder="เลือกชุดคำศัพท์" /></SelectTrigger>
                                                            <SelectContent>
                                                                {userSets.map((s) => (<SelectItem key={s.id} value={s.id} className="text-xs">{s.title}</SelectItem>))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                                    <div className="p-3 space-y-1.5">
                                                        {isLoadingLibrary ? (
                                                            <div className="py-12 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
                                                                <Loader2 className="w-5 h-5 animate-spin" />กำลังโหลด...
                                                            </div>
                                                        ) : !selectedSetId ? (
                                                            <div className="py-12 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
                                                                <BookOpen className="w-8 h-8 text-gray-200" />เลือกชุดคำศัพท์
                                                            </div>
                                                        ) : libraryVocabulary.length > 0 ? (
                                                            libraryVocabulary.map((card) => (
                                                                <div
                                                                    key={card.id}
                                                                    className={cn(
                                                                        "flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer",
                                                                        selectedItems.some(i => i.id === card.id)
                                                                            ? "bg-purple-50 border-purple-200"
                                                                            : "bg-white border-gray-100 hover:border-purple-100 hover:bg-purple-50/30"
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
                                                                        <p className="text-xs font-medium text-gray-800">{card.front_text}</p>
                                                                        <p className="text-[10px] text-gray-400">{card.back_text}</p>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="py-12 text-center text-xs text-gray-400">
                                                                ไม่พบคำศัพท์ในชุดนี้
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </div>
                                </Tabs>
                            </div>

                            {/* Right Column: Settings (hidden on mobile - use tab instead) */}
                            <div className="hidden md:flex md:w-[200px] lg:w-[220px] xl:w-[260px] flex-col border-l bg-gradient-to-b from-purple-50/50 to-white flex-shrink-0 overflow-y-auto">
                                <div className="p-3 border-b bg-white">
                                    <div className="flex items-center gap-2 text-purple-700 font-semibold text-xs">
                                        <Settings className="w-4 h-4" />
                                        <span>ตั้งค่าการทบทวน</span>
                                    </div>
                                </div>
                                <div className="p-3 space-y-3">
                                    {/* Activity Title */}
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-semibold text-gray-600">ชื่อกิจกรรม</Label>
                                        <Input
                                            value={reviewTitle}
                                            onChange={(e) => {
                                                setReviewTitle(e.target.value);
                                                if (e.target.value.trim()) setShowError(false);
                                            }}
                                            className={cn(
                                                "h-9 text-xs bg-white border-gray-200 rounded-lg",
                                                showError && !reviewTitle.trim() ? "border-red-400 bg-red-50" : ""
                                            )}
                                            placeholder="ทบทวนคำศัพท์บทที่ 1"
                                        />
                                        {showError && !reviewTitle.trim() && (
                                            <p className="text-[10px] text-red-500">กรุณาระบุชื่อ</p>
                                        )}
                                    </div>

                                    {/* Icons Grid */}
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-semibold text-gray-600">ไอคอน</Label>
                                        <div className="grid grid-cols-6 gap-1">
                                            {Object.entries(AVAILABLE_ICONS).map(([key, Icon]) => (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => setReviewIcon(key)}
                                                    className={cn(
                                                        "w-7 h-7 flex items-center justify-center rounded-lg transition-all",
                                                        reviewIcon === key
                                                            ? "bg-purple-100 text-purple-600 ring-2 ring-purple-400 ring-offset-1"
                                                            : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
                                                    )}
                                                >
                                                    <Icon className="w-3.5 h-3.5" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Colors */}
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-semibold text-gray-600">สี</Label>
                                        <div className="flex flex-wrap gap-1.5">
                                            {AVAILABLE_COLORS.map((color) => (
                                                <button
                                                    key={color.value}
                                                    type="button"
                                                    onClick={() => setReviewColor(color.value)}
                                                    className={cn(
                                                        "w-6 h-6 rounded-full transition-all ring-offset-2",
                                                        color.class.split(' ')[0],
                                                        reviewColor === color.value
                                                            ? "ring-2 " + color.ring + " scale-110"
                                                            : "hover:scale-105 opacity-80 hover:opacity-100"
                                                    )}
                                                    title={color.label}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Date, Time, Duration Row */}
                                    <div className="grid grid-cols-3 gap-1.5">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-semibold text-gray-600">วันที่</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full h-8 justify-start text-left font-normal text-[10px] bg-white border-gray-200 px-1.5 rounded-lg",
                                                            !reviewDate && "text-gray-400"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-0.5 h-3 w-3 text-purple-500" />
                                                        <span className="truncate">
                                                            {reviewDate ? format(reviewDate, "d MMM", { locale: th }) : "เลือก"}
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

                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-semibold text-gray-600">เวลา</Label>
                                            <Input
                                                type="time"
                                                value={reviewTime}
                                                onChange={(e) => setReviewTime(e.target.value)}
                                                className="h-8 text-[10px] bg-white border-gray-200 rounded-lg px-1.5"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-semibold text-gray-600">นาที</Label>
                                            <Select value={reviewDuration.toString()} onValueChange={(v) => setReviewDuration(parseInt(v))}>
                                                <SelectTrigger className="h-8 text-[10px] bg-white border-gray-200 rounded-lg px-1.5">
                                                    <SelectValue placeholder="นาที" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {[10, 15, 20, 30, 45, 60, 90, 120].map((time) => (
                                                        <SelectItem key={time} value={time.toString()} className="text-xs">
                                                            {time} นาที
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="px-4 py-3 border-t bg-white flex-shrink-0 flex flex-row justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsReviewDialogOpen(false)}
                            className="h-9 px-4 rounded-lg border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-medium"
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            onClick={handleSaveReview}
                            className="h-9 px-5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-200 text-xs font-medium"
                        >
                            บันทึก
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AutoReviewDialog
                isOpen={autoReviewConfig.isOpen}
                onClose={() => setAutoReviewConfig(prev => ({ ...prev, isOpen: false }))}
                mode={autoReviewConfig.mode}
                onConfirm={(count, time, folderId, setId) => {
                    handleAutoConfirm(count, time, folderId, setId);
                }}
            />
        </div>
    );
}
