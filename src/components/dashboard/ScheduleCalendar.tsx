import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Clock, Edit2, Sparkles, BookOpen, MessageCircle, Headphones, Target, ChevronDown, Bell, CheckCircle, PenTool, Mic, Video, Music, Star, Heart, Zap, Coffee, Sun, Moon, X, Trash2, LucideIcon, Trophy, Flame, TrendingUp, CalendarDays } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TimePicker } from './TimePicker';
import { DurationPicker } from './DurationPicker';
import { DatePicker } from './DatePicker';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { th } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useFlashcards, Flashcard } from '@/hooks/useFlashcards';

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
    message: MessageCircle,
    headphones: Headphones,
    target: Target,
    pen: PenTool,
    mic: Mic,
    video: Video,
    music: Music,
    star: Star,
    heart: Heart,
    zap: Zap,
    coffee: Coffee,
    sun: Sun,
    moon: Moon
};

const AVAILABLE_COLORS = [
    { value: 'blue', label: 'Blue', class: 'bg-blue-500/10 text-blue-600 border-blue-200', ring: 'ring-blue-500' },
    { value: 'purple', label: 'Purple', class: 'bg-purple-500/10 text-purple-600 border-purple-200', ring: 'ring-purple-500' },
    { value: 'green', label: 'Green', class: 'bg-green-500/10 text-green-600 border-green-200', ring: 'ring-green-500' },
    { value: 'orange', label: 'Orange', class: 'bg-orange-500/10 text-orange-600 border-orange-200', ring: 'ring-orange-500' },
    { value: 'pink', label: 'Pink', class: 'bg-pink-500/10 text-pink-600 border-pink-200', ring: 'ring-pink-500' },
    { value: 'red', label: 'Red', class: 'bg-red-500/10 text-red-600 border-red-200', ring: 'ring-red-500' },
    { value: 'teal', label: 'Teal', class: 'bg-teal-500/10 text-teal-600 border-teal-200', ring: 'ring-teal-500' },
    { value: 'indigo', label: 'Indigo', class: 'bg-indigo-500/10 text-indigo-600 border-indigo-200', ring: 'ring-indigo-500' }
];

type ViewMode = 'day' | 'week' | 'month' | 'year';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const PIXELS_PER_HOUR = 60;

const initialSchedule: DaySchedule[] = [
    { dayIndex: 1, activities: [{ id: '1', type: 'vocabulary', time: '08:00', duration: 30, title: 'Morning Vocab', icon: BookOpen, color: 'bg-blue-500/10 text-blue-600 border-blue-200' }] },
    { dayIndex: 3, activities: [{ id: '2', type: 'listening', time: '18:00', duration: 45, title: 'English Podcast', icon: Headphones, color: 'bg-green-500/10 text-green-600 border-green-200' }] },
    { dayIndex: 5, activities: [{ id: '3', type: 'review', time: '20:00', duration: 60, title: 'Weekly Quiz', icon: Target, color: 'bg-orange-500/10 text-orange-600 border-orange-200' }] }
];

export function ScheduleCalendar() {
    const { toast } = useToast();
    const { flashcards } = useFlashcards();

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('week');
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
    const [scheduleData, setScheduleData] = useState<DaySchedule[]>(initialSchedule);

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

    // Changed from ID array to Object array to support the new column
    const [selectedItems, setSelectedItems] = useState<Flashcard[]>([]);

    // Customization State
    const [reviewTitle, setReviewTitle] = useState<string>("ทบทวนคำศัพท์");
    const [reviewIcon, setReviewIcon] = useState<string>("book");
    const [reviewColor, setReviewColor] = useState<string>("blue");

    // Tab State
    const [activeTab, setActiveTab] = useState<string>("latest");

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
                .from('user_sets')
                .select('*')
                .eq('folder_id', selectedFolderId)
                .order('created_at', { ascending: false });

            if (data) setUserSets(data as UserSet[]);
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
                .from('flashcards')
                .select('*')
                .eq('set_id', selectedSetId);

            if (data) {
                // Map to Flashcard type
                const mappedData: Flashcard[] = data.map(item => ({
                    id: item.id,
                    front_text: item.front_text,
                    back_text: item.back_text,
                    set_id: item.set_id,
                    created_at: item.created_at,
                    user_id: item.user_id,
                    image_url: item.image_url,
                    audio_url: item.audio_url,
                    difficulty_level: item.difficulty_level,
                    next_review: item.next_review,
                    interval: item.interval,
                    ease_factor: item.ease_factor,
                    repetitions: item.repetitions
                }));
                setLibraryVocabulary(mappedData);
            }
            setIsLoadingLibrary(false);
        };
        fetchVocab();
    }, [selectedSetId]);

    // Fetch Recommended Cards
    useEffect(() => {
        const fetchRecommended = async () => {
            setIsLoadingRecommended(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch cards that are due for review (next_review <= now)
            const { data: progressData } = await supabase
                .from('user_flashcard_progress')
                .select('flashcard_id, next_review')
                .eq('user_id', user.id)
                .lte('next_review', new Date().toISOString())
                .limit(20);

            if (progressData && progressData.length > 0) {
                const cardIds = progressData.map(p => p.flashcard_id);
                const { data: cards } = await supabase
                    .from('flashcards')
                    .select('*')
                    .in('id', cardIds);

                if (cards) {
                    const mappedCards: Flashcard[] = cards.map(item => ({
                        id: item.id,
                        front_text: item.front_text,
                        back_text: item.back_text,
                        set_id: item.set_id,
                        created_at: item.created_at,
                        user_id: item.user_id,
                        image_url: item.image_url,
                        audio_url: item.audio_url,
                        difficulty_level: item.difficulty_level,
                        next_review: item.next_review,
                        interval: item.interval,
                        ease_factor: item.ease_factor,
                        repetitions: item.repetitions
                    }));
                    setRecommendedCards(mappedCards);
                }
            } else {
                setRecommendedCards([]);
            }
            setIsLoadingRecommended(false);
        };

        if (activeTab === 'recommended') {
            fetchRecommended();
        }
    }, [activeTab]);

    const getDaysToRender = () => {
        if (viewMode === 'day') {
            return [selectedDate];
        } else if (viewMode === 'week') {
            const start = startOfWeek(selectedDate, { weekStartsOn: 0 }); // Sunday start
            return Array.from({ length: 7 }, (_, i) => addDays(start, i));
        } else if (viewMode === 'month') {
            const start = startOfWeek(startOfMonth(selectedDate), { weekStartsOn: 0 });
            const end = endOfMonth(selectedDate);
            const days = [];
            let current = start;
            // Generate 42 days (6 weeks) to fill the grid
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

    const handleUpdateActivityTitle = (dayIndex: number, activityId: string, newTitle: string) => {
        setScheduleData(prev => prev.map(day => {
            if (day.dayIndex === dayIndex) {
                return {
                    ...day,
                    activities: day.activities.map(act => act.id === activityId ? { ...act, title: newTitle } : act)
                };
            }
            return day;
        }));
    };

    const handleUpdateActivityTime = (dayIndex: number, activityId: string, newTime: string) => {
        setScheduleData(prev => prev.map(day => {
            if (day.dayIndex === dayIndex) {
                return {
                    ...day,
                    activities: day.activities.map(act => act.id === activityId ? { ...act, time: newTime } : act)
                };
            }
            return day;
        }));
    };

    const handleUpdateActivityDuration = (dayIndex: number, activityId: string, newDuration: number) => {
        setScheduleData(prev => prev.map(day => {
            if (day.dayIndex === dayIndex) {
                return {
                    ...day,
                    activities: day.activities.map(act => act.id === activityId ? { ...act, duration: newDuration } : act)
                };
            }
            return day;
        }));
    };

    const handleRemoveActivity = (dayIndex: number, activityId: string) => {
        setScheduleData(prev => prev.map(day => {
            if (day.dayIndex === dayIndex) {
                return {
                    ...day,
                    activities: day.activities.filter(act => act.id !== activityId)
                };
            }
            return day;
        }));
    };

    const handleAddActivity = () => {
        if (selectedDay === null) return;
        const newActivity: Activity = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'vocabulary',
            time: '09:00',
            duration: 30,
            title: 'New Activity',
            icon: BookOpen,
            color: 'bg-blue-500/10 text-blue-600 border-blue-200'
        };

        setScheduleData(prev => {
            const dayExists = prev.find(d => d.dayIndex === selectedDay);
            if (dayExists) {
                return prev.map(d => d.dayIndex === selectedDay ? { ...d, activities: [...d.activities, newActivity] } : d);
            } else {
                return [...prev, { dayIndex: selectedDay, activities: [newActivity] }];
            }
        });
    };

    const getPixelPosition = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        return (hours * PIXELS_PER_HOUR) + (minutes / 60 * PIXELS_PER_HOUR);
    };

    const getPixelHeight = (duration: number) => {
        return (duration / 60) * PIXELS_PER_HOUR;
    };

    const weekDays = [
        new Date(2024, 0, 7), // Sun
        new Date(2024, 0, 1), // Mon
        new Date(2024, 0, 2), // Tue
        new Date(2024, 0, 3), // Wed
        new Date(2024, 0, 4), // Thu
        new Date(2024, 0, 5), // Fri
        new Date(2024, 0, 6), // Sat
    ];

    return (
        <Card className="w-full h-full min-h-[600px] flex flex-col bg-white/80 backdrop-blur-xl border border-white/50 shadow-soft rounded-[2rem] overflow-hidden hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4 space-y-4 border-b border-border/10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 rounded-xl shadow-inner">
                            <CalendarIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                ตารางเรียนรู้
                            </CardTitle>
                            <p className="text-xs text-muted-foreground font-medium mt-0.5">จัดการเวลาเรียนรู้ของคุณ</p>
                        </div>
                    </div>

                    <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="w-full sm:w-auto gap-1.5 shadow-lg hover:shadow-primary/25 transition-all duration-300">
                                <Clock className="w-4 h-4" />
                                ตั้งเวลาทบทวน
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl">
                            <DialogHeader className="p-6 pb-2 border-b bg-muted/30">
                                <DialogTitle className="flex items-center gap-2 text-xl">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                    ตั้งเวลาทบทวนอัตโนมัติ
                                </DialogTitle>
                            </DialogHeader>

                            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
                                {/* Column 1: Selection (Left) - 4 cols */}
                                <div className="lg:col-span-4 border-r bg-muted/10 flex flex-col h-full">
                                    <Tabs defaultValue="latest" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                                        <div className="p-4 pb-2">
                                            <TabsList className="w-full grid grid-cols-3">
                                                <TabsTrigger value="latest">ล่าสุด</TabsTrigger>
                                                <TabsTrigger value="recommended">แนะนำ</TabsTrigger>
                                                <TabsTrigger value="library">คลัง</TabsTrigger>
                                            </TabsList>
                                        </div>

                                        <div className="flex-1 overflow-hidden relative">
                                            <TabsContent value="latest" className="h-full absolute inset-0 m-0 p-4 pt-0 overflow-auto">
                                                <div className="space-y-2">
                                                    <Label className="text-xs text-muted-foreground">คำศัพท์ที่เพิ่งเรียนรู้</Label>
                                                    {flashcards.slice(0, 5).map((card) => (
                                                        <div key={card.id} className="flex items-center gap-3 p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer group" onClick={() => {
                                                            if (selectedItems.find(i => i.id === card.id)) {
                                                                setSelectedItems(selectedItems.filter(i => i.id !== card.id));
                                                            } else {
                                                                setSelectedItems([...selectedItems, card]);
                                                            }
                                                        }}>
                                                            <div className={cn("w-4 h-4 border-2 rounded flex items-center justify-center transition-colors", selectedItems.find(i => i.id === card.id) ? "bg-primary border-primary" : "border-muted-foreground/30 group-hover:border-primary/50")}>
                                                                {selectedItems.find(i => i.id === card.id) && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium truncate">{card.front_text}</p>
                                                                <p className="text-xs text-muted-foreground truncate">{card.back_text}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="recommended" className="h-full absolute inset-0 m-0 p-4 pt-0 overflow-auto">
                                                <div className="space-y-2">
                                                    <Label className="text-xs text-muted-foreground">คำศัพท์ที่ควรทบทวน (Spaced Repetition)</Label>
                                                    {isLoadingRecommended ? (
                                                        <div className="flex justify-center p-4"><span className="loading loading-spinner loading-sm"></span></div>
                                                    ) : recommendedCards.length > 0 ? (
                                                        recommendedCards.map((card) => (
                                                            <div key={card.id} className="flex items-center gap-3 p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer group" onClick={() => {
                                                                if (selectedItems.find(i => i.id === card.id)) {
                                                                    setSelectedItems(selectedItems.filter(i => i.id !== card.id));
                                                                } else {
                                                                    setSelectedItems([...selectedItems, card]);
                                                                }
                                                            }}>
                                                                <div className={cn("w-4 h-4 border-2 rounded flex items-center justify-center transition-colors", selectedItems.find(i => i.id === card.id) ? "bg-primary border-primary" : "border-muted-foreground/30 group-hover:border-primary/50")}>
                                                                    {selectedItems.find(i => i.id === card.id) && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex justify-between items-center">
                                                                        <p className="text-sm font-medium truncate">{card.front_text}</p>
                                                                        <Badge variant="outline" className="text-[10px] h-4 px-1 bg-orange-50 text-orange-600 border-orange-200">Due</Badge>
                                                                    </div>
                                                                    <p className="text-xs text-muted-foreground truncate">{card.back_text}</p>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-center text-xs text-muted-foreground py-8 border-2 border-dashed rounded-lg">
                                                            <Sparkles className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                                                            <p>ไม่มีคำศัพท์ที่ต้องทบทวนในขณะนี้</p>
                                                            <p className="text-[10px] mt-1">เก่งมาก! คุณทบทวนครบแล้ว</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="library" className="h-full absolute inset-0 m-0 p-4 pt-0 overflow-auto">
                                                <div className="space-y-3">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs">โฟลเดอร์</Label>
                                                        <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="เลือกโฟลเดอร์" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {userFolders.map(folder => (
                                                                    <SelectItem key={folder.id} value={folder.id}>{folder.title}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    {selectedFolderId && (
                                                        <div className="space-y-2">
                                                            <Label className="text-xs">ชุดคำศัพท์</Label>
                                                            <Select value={selectedSetId} onValueChange={setSelectedSetId}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="เลือกชุดคำศัพท์" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {userSets.map(set => (
                                                                        <SelectItem key={set.id} value={set.id}>{set.title}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    )}

                                                    <div className="space-y-2">
                                                        <Label className="text-xs">รายการคำศัพท์</Label>
                                                        <ScrollArea className="h-[200px] w-full rounded-md border p-2 bg-background">
                                                            {isLoadingLibrary ? (
                                                                <div className="flex justify-center p-4"><span className="loading loading-spinner loading-sm"></span></div>
                                                            ) : libraryVocabulary.length > 0 ? (
                                                                <div className="space-y-1">
                                                                    {libraryVocabulary.map((card) => (
                                                                        <div key={card.id} className="flex items-center gap-2 p-1.5 hover:bg-accent rounded-md cursor-pointer" onClick={() => {
                                                                            if (selectedItems.find(i => i.id === card.id)) {
                                                                                setSelectedItems(selectedItems.filter(i => i.id !== card.id));
                                                                            } else {
                                                                                setSelectedItems([...selectedItems, card]);
                                                                            }
                                                                        }}>
                                                                            <div className="w-3 h-3 border rounded flex items-center justify-center">
                                                                                {selectedItems.find(i => i.id === card.id) && <div className="w-1.5 h-1.5 bg-primary rounded-sm" />}
                                                                            </div>
                                                                            <span className="text-xs truncate">{card.front_text}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className="text-center text-xs text-muted-foreground py-4">เลือกชุดคำศัพท์เพื่อแสดงรายการ</div>
                                                            )}
                                                        </ScrollArea>
                                                    </div>
                                                </div>
                                            </TabsContent>
                                        </div>
                                    </Tabs>
                                </div>

                                {/* Column 2: Configuration (Right) - 8 cols */}
                                <div className="lg:col-span-8 p-6 flex flex-col h-full overflow-auto">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>ชื่อกิจกรรม</Label>
                                                <Input value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} placeholder="เช่น ทบทวนคำศัพท์บทที่ 1" />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>วันที่ทบทวน</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !reviewDate && "text-muted-foreground")}>
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {reviewDate ? format(reviewDate, "PPP", { locale: th }) : <span>เลือกวันที่</span>}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0">
                                                        <Calendar mode="single" selected={reviewDate} onSelect={(date) => date && setReviewDate(date)} initialFocus />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>เวลา</Label>
                                                    <TimePicker value={reviewTime} onChange={setReviewTime} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>ระยะเวลา (นาที)</Label>
                                                    <DurationPicker value={reviewDuration} onChange={setReviewDuration} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>ไอคอน</Label>
                                                <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/20">
                                                    {Object.entries(AVAILABLE_ICONS).map(([key, Icon]) => (
                                                        <div
                                                            key={key}
                                                            className={cn(
                                                                "p-2 rounded-md cursor-pointer hover:bg-accent transition-colors",
                                                                reviewIcon === key && "bg-primary/20 ring-2 ring-primary"
                                                            )}
                                                            onClick={() => setReviewIcon(key)}
                                                        >
                                                            <Icon className="w-4 h-4" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>สี</Label>
                                                <div className="flex flex-wrap gap-3 p-3 border rounded-lg bg-muted/20">
                                                    {AVAILABLE_COLORS.map((color) => (
                                                        <div
                                                            key={color.value}
                                                            className={cn(
                                                                "w-6 h-6 rounded-full cursor-pointer hover:scale-110 transition-transform",
                                                                color.class.split(' ')[0],
                                                                reviewColor === color.value && "ring-2 ring-offset-2 ring-primary"
                                                            )}
                                                            onClick={() => setReviewColor(color.value)}
                                                            title={color.label}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-6 border-t flex justify-between items-center">
                                        <div className="text-sm text-muted-foreground">
                                            เลือกแล้ว {selectedItems.length} รายการ
                                        </div>
                                        <div className="flex gap-2">
                                            <Button onClick={() => setIsReviewDialogOpen(false)} variant="outline">ยกเลิก</Button>
                                            <Button onClick={() => {
                                                toast({
                                                    title: "บันทึกการทบทวนสำเร็จ",
                                                    description: `ตั้งเวลาทบทวน ${reviewTitle} เรียบร้อยแล้ว`,
                                                });
                                                setIsReviewDialogOpen(false);
                                            }}>บันทึก</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-end gap-2">
                    <div className="w-full sm:w-auto flex items-center justify-center gap-2 p-1.5 bg-muted/50 rounded-lg border border-border/50">
                        <div className="flex items-center bg-background rounded-md border border-border/50 p-1 shadow-sm">
                            <Button
                                variant={viewMode === 'day' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('day')}
                                className={cn("h-7 px-3 text-xs font-medium transition-all", viewMode === 'day' && "bg-primary/10 text-primary hover:bg-primary/20")}
                            >
                                วัน
                            </Button>
                            <Button
                                variant={viewMode === 'week' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('week')}
                                className={cn("h-7 px-3 text-xs font-medium transition-all", viewMode === 'week' && "bg-primary/10 text-primary hover:bg-primary/20")}
                            >
                                สัปดาห์
                            </Button>
                            <Button
                                variant={viewMode === 'month' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('month')}
                                className={cn("h-7 px-3 text-xs font-medium transition-all", viewMode === 'month' && "bg-primary/10 text-primary hover:bg-primary/20")}
                            >
                                เดือน
                            </Button>
                            <Button
                                variant={viewMode === 'year' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('year')}
                                className={cn("h-7 px-3 text-xs font-medium transition-all", viewMode === 'year' && "bg-primary/10 text-primary hover:bg-primary/20")}
                            >
                                ปี
                            </Button>
                        </div>
                    </div>

                    <div className="w-full sm:w-auto">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full sm:w-[240px] justify-start text-left font-normal bg-background hover:bg-accent/50",
                                        !selectedDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                                    {selectedDate ? format(selectedDate, "PPP", { locale: th }) : <span>เลือกวันที่</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => date && setSelectedDate(date)}
                                    initialFocus
                                    className="rounded-md border shadow-md"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </CardHeader>

            {viewMode === 'year' ? (
                <ScrollArea className="h-[600px]">
                    <div className="p-6 space-y-8 max-w-7xl mx-auto w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 shadow-sm">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="p-3 bg-blue-500/10 rounded-full text-blue-600"><BookOpen className="w-6 h-6" /></div>
                                    <div><p className="text-xs text-muted-foreground font-medium">คำศัพท์ที่จำได้ทั้งปี</p><h3 className="text-2xl font-bold text-blue-700">2,543 <span className="text-xs font-normal text-muted-foreground">คำ</span></h3></div>
                                </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-100 shadow-sm">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="p-3 bg-orange-500/10 rounded-full text-orange-600"><Flame className="w-6 h-6" /></div>
                                    <div><p className="text-xs text-muted-foreground font-medium">เข้าใช้งานต่อเนื่องสูงสุด</p><h3 className="text-2xl font-bold text-orange-700">45 <span className="text-xs font-normal text-muted-foreground">วัน</span></h3></div>
                                </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100 shadow-sm">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="p-3 bg-green-500/10 rounded-full text-green-600"><CalendarDays className="w-6 h-6" /></div>
                                    <div><p className="text-xs text-muted-foreground font-medium">วันที่เรียนรู้ทั้งหมด</p><h3 className="text-2xl font-bold text-green-700">280 <span className="text-xs font-normal text-muted-foreground">วัน</span></h3></div>
                                </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100 shadow-sm">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="p-3 bg-purple-500/10 rounded-full text-purple-600"><Trophy className="w-6 h-6" /></div>
                                    <div><p className="text-xs text-muted-foreground font-medium">คะแนนเฉลี่ยแบบทดสอบ</p><h3 className="text-2xl font-bold text-purple-700">85%</h3></div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="border-border/50 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> สถิติการจำคำศัพท์รายเดือน</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={Array.from({ length: 12 }, (_, i) => ({ name: format(new Date(2025, i, 1), 'MMM', { locale: th }), words: Math.floor(Math.random() * 300) + 100 }))}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                        <Tooltip cursor={{ fill: 'transparent' }} />
                                        <Bar dataKey="words" radius={[4, 4, 0, 0]}>
                                            {Array.from({ length: 12 }).map((_, index) => <Cell key={index} fill={`hsl(var(--primary) / ${0.4 + (index % 2) * 0.2})`} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </ScrollArea>
            ) : (viewMode === 'week' || viewMode === 'day') ? (
                <ScrollArea className="h-[600px] border rounded-md">
                    <div className="flex flex-col min-w-full overflow-x-auto">
                        <div className={cn("grid gap-1 mb-1 sticky top-0 z-40 bg-background border-b pb-2 pt-2 min-w-[800px] sm:min-w-full", (viewMode === 'week' || viewMode === 'day') ? "grid-cols-[60px_1fr]" : "grid-cols-7")}>
                            <div className="text-center text-xs font-bold py-2 text-muted-foreground sticky left-0 z-50 bg-background">เวลา</div>
                            <div className={cn("grid gap-1", viewMode === 'day' ? "grid-cols-1" : "grid-cols-7")}>
                                {getDaysToRender().map((date, index) => {
                                    if (!date) return null;
                                    const isCurrentDay = isToday(date);
                                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                                    if (viewMode === 'day') {
                                        return (
                                            <div key={index} className={`text-center text-xs font-bold py-2 rounded-md ${isCurrentDay ? 'text-primary' : isWeekend ? 'text-destructive' : 'text-muted-foreground'}`}>
                                                {format(date, 'EEEE d MMMM yyyy', { locale: th })}
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={index} className="flex flex-col items-center justify-center py-2 gap-1">
                                            <span className={`text-[10px] uppercase font-medium ${isCurrentDay ? 'text-primary' : isWeekend ? 'text-destructive' : 'text-muted-foreground'}`}>
                                                {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'][date.getDay()]}
                                            </span>
                                            <div className={cn(
                                                "w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold transition-colors",
                                                isCurrentDay
                                                    ? "bg-primary text-primary-foreground shadow-sm"
                                                    : "text-foreground hover:bg-muted"
                                            )}>
                                                {date.getDate()}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex relative flex-1 min-w-[800px] sm:min-w-full">
                            <div className="w-[60px] flex-shrink-0 border-r bg-muted/5 sticky left-0 z-30 bg-background">
                                {HOURS.map(hour => (
                                    <div key={hour} className="h-[60px] border-b text-xs text-muted-foreground p-1 text-right pr-2 relative">
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
                                        <div key={dayIndex} className={`border-r relative min-h-[1440px] ${isCurrentDay ? 'bg-primary/5' : ''}`}>
                                            {HOURS.map(hour => (
                                                <div key={hour} className="h-[60px] border-b border-dashed border-border/50" />
                                            ))}

                                            {daySchedule?.activities.map(activity => (
                                                <div
                                                    key={activity.id}
                                                    className={`absolute left-1 right-1 rounded-md p-2 text-xs border overflow-hidden cursor-pointer hover:brightness-95 transition-all shadow-sm z-10 ${activity.color}`}
                                                    style={{
                                                        top: `${getPixelPosition(activity.time)}px`,
                                                        height: `${Math.max(getPixelHeight(activity.duration), viewMode === 'day' ? 50 : 30)}px`
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditSchedule(date.getDay());
                                                    }}
                                                >
                                                    <div className={cn("font-semibold flex items-center gap-1", viewMode === 'day' ? "text-sm mb-1" : "")}>
                                                        <activity.icon className={cn("flex-shrink-0", viewMode === 'day' ? "w-4 h-4" : "w-3 h-3")} />
                                                        <span className="truncate">{activity.time} - {activity.title}</span>
                                                    </div>
                                                    {viewMode === 'day' && (
                                                        <div className="text-xs opacity-80 pl-5">
                                                            ระยะเวลา: {activity.duration} นาที
                                                        </div>
                                                    )}
                                                </div>
                                            ))}

                                            <div
                                                className="absolute inset-0 z-0"
                                                onClick={() => handleEditSchedule(date.getDay())}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            ) : (
                <div className={cn("grid gap-1", "grid-cols-7")}>
                    {getDaysToRender().map((date, index) => {
                        if (!date) {
                            return <div key={`empty-${index}`} className="aspect-square min-h-[80px]" />;
                        }
                        const daySchedule = getDaySchedule(date.getDay());
                        const isCurrentDay = isToday(date);
                        const hasActivities = daySchedule && daySchedule.activities.length > 0;
                        const totalActivities = daySchedule?.activities.length || 0;
                        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                        return (
                            <div key={date.toDateString()} className={`
                                                  relative min-h-[80px] p-2 rounded-lg border-2 transition-all duration-200 cursor-pointer
                                                  hover:shadow-soft hover:scale-[1.02] hover:z-10
                                                  ${isCurrentDay ? 'bg-primary/10 border-primary shadow-sm ring-2 ring-primary/20' : hasActivities ? 'bg-accent/10 border-accent/50 hover:bg-accent/20' : 'bg-background border-border/30 hover:bg-muted/20'}
                                                `} onClick={() => handleEditSchedule(date.getDay())}>
                                <div className="flex justify-between items-start">
                                    <span className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${isCurrentDay ? 'bg-primary text-primary-foreground' : isWeekend ? 'text-destructive' : 'text-foreground'}`}>
                                        {date.getDate()}
                                    </span>
                                    {totalActivities > 0 && (
                                        <Badge variant="secondary" className="h-4 px-1 text-[10px] bg-primary/10 text-primary hover:bg-primary/20">
                                            {totalActivities}
                                        </Badge>
                                    )}
                                </div>

                                <div className="mt-1 space-y-1">
                                    {daySchedule?.activities.slice(0, 2).map((activity, i) => {
                                        const Icon = activity.icon;
                                        return (
                                            <div key={i} className={`text-[10px] px-1.5 py-0.5 rounded truncate flex items-center gap-1 ${activity.color}`}>
                                                <Icon className="w-3 h-3 flex-shrink-0" />
                                                <span className="truncate">{activity.title}</span>
                                            </div>
                                        );
                                    })}
                                    {totalActivities > 2 && (
                                        <div className="text-[10px] text-muted-foreground pl-1">
                                            +{totalActivities - 2} รายการ
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-primary" />
                            แก้ไขตารางเวลา
                            {selectedDay !== null && <span className="text-sm text-muted-foreground ml-2">
                                {weekDays[selectedDay]?.toLocaleDateString('th-TH', { weekday: 'long' })}
                            </span>}
                        </DialogTitle>
                    </DialogHeader>

                    <ScrollArea className="max-h-[60vh] pr-4">
                        <div className="space-y-4">
                            {selectedDay !== null && getDaySchedule(selectedDay)?.activities.map(activity => {
                                const Icon = activity.icon;
                                return (
                                    <div key={activity.id} className={`p-4 rounded-lg border ${activity.color}`}>
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2 flex-1">
                                                <Icon className="w-4 h-4 flex-shrink-0" />
                                                <Input
                                                    value={activity.title}
                                                    onChange={e => handleUpdateActivityTitle(selectedDay, activity.id, e.target.value)}
                                                    className="font-medium text-sm h-8 bg-background/50"
                                                    placeholder="ชื่อกิจกรรม"
                                                />
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => handleRemoveActivity(selectedDay, activity.id)}>
                                                ลบ
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label className="text-xs mb-1.5 block text-center">เวลาทบทวน</Label>
                                                <div className="flex justify-center p-2 bg-muted/20 rounded-lg border border-border/50">
                                                    <TimePicker
                                                        value={activity.time}
                                                        onChange={newTime => handleUpdateActivityTime(selectedDay, activity.id, newTime)}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-xs mb-1.5 block text-center">ระยะเวลาทบทวน</Label>
                                                <div className="flex justify-center p-2 bg-muted/20 rounded-lg border border-border/50">
                                                    <DurationPicker
                                                        value={activity.duration}
                                                        onChange={newDuration => handleUpdateActivityDuration(selectedDay, activity.id, newDuration)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            <Button variant="outline" className="w-full" onClick={handleAddActivity}>
                                + เพิ่มกิจกรรม
                            </Button>
                        </div>
                    </ScrollArea>

                    <DialogFooter>
                        <Button onClick={() => setIsDialogOpen(false)} className="w-full">
                            ตกลง
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}