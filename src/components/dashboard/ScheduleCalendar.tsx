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
import { format } from 'date-fns';
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

export function ScheduleCalendar() {
    const { toast } = useToast();
    const { flashcards } = useFlashcards();

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('week');
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [selectedWeekDay, setSelectedWeekDay] = useState<number>(new Date().getDay());
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

    // Review Dialog State
    const [reviewDate, setReviewDate] = useState<Date>(new Date());
    const [reviewTime, setReviewTime] = useState<string>('09:00');
    const [reviewDuration, setReviewDuration] = useState<number>(15);

    // Changed from ID array to Object array to support the new column
    const [selectedItems, setSelectedItems] = useState<Flashcard[]>([]);

    // Customization State
    const [reviewTitle, setReviewTitle] = useState<string>("ทบทวนคำศัพท์");
    const [reviewIcon, setReviewIcon] = useState<string>("book");
    const [reviewColor, setReviewColor] = useState<string>("blue");

    // Tab State
    const [activeTab, setActiveTab] = useState<string>("latest");

    // Personal Library State
    const [userFolders, setUserFolders] = useState<UserFolder[]>([]);
    const [userSets, setUserSets] = useState<UserSet[]>([]);
    const [selectedFolderId, setSelectedFolderId] = useState<string>("");
    const [selectedSetId, setSelectedSetId] = useState<string>("");
    const [libraryVocabulary, setLibraryVocabulary] = useState<Flashcard[]>([]);
    const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

    useEffect(() => {
        if (activeTab === 'library') {
            fetchUserFolders();
        }
    }, [activeTab]);

    useEffect(() => {
        if (selectedFolderId) {
            fetchUserSets(selectedFolderId);
            setSelectedSetId("");
            setLibraryVocabulary([]);
        }
    }, [selectedFolderId]);

    useEffect(() => {
        if (selectedSetId) {
            fetchUserFlashcards(selectedSetId);
        }
    }, [selectedSetId]);

    const fetchUserFolders = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('user_folders')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUserFolders(data || []);
        } catch (error) {
            console.error('Error fetching folders:', error);
        }
    };

    const fetchUserSets = async (folderId: string) => {
        try {
            const { data, error } = await supabase
                .from('user_flashcard_sets')
                .select('*')
                .eq('folder_id', folderId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUserSets(data || []);
        } catch (error) {
            console.error('Error fetching sets:', error);
        }
    };

    const fetchUserFlashcards = async (setId: string) => {
        try {
            setIsLoadingLibrary(true);
            const { data, error } = await supabase
                .from('user_flashcards')
                .select('*')
                .eq('flashcard_set_id', setId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLibraryVocabulary(data || []);
        } catch (error) {
            console.error('Error fetching flashcards:', error);
        } finally {
            setIsLoadingLibrary(false);
        }
    };

    const today = new Date();
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() - today.getDay() + i);
        return date;
    });

    // AI recommended schedule - can be customized by user
    const [schedules, setSchedules] = useState<DaySchedule[]>([{
        dayIndex: 1,
        // Monday
        activities: [{
            id: '1',
            type: 'vocabulary',
            time: '07:00',
            duration: 15,
            title: 'ทบทวนคำศัพท์เช้า',
            icon: BookOpen,
            color: 'bg-blue-500/10 text-blue-600 border-blue-200'
        }, {
            id: '2',
            type: 'practice',
            time: '12:30',
            duration: 20,
            title: 'ฝึกสนทนาพักเที่ยง',
            icon: MessageCircle,
            color: 'bg-purple-500/10 text-purple-600 border-purple-200'
        }]
    }, {
        dayIndex: 2,
        // Tuesday
        activities: [{
            id: '3',
            type: 'listening',
            time: '08:00',
            duration: 30,
            title: 'ฟัง Podcast',
            icon: Headphones,
            color: 'bg-green-500/10 text-green-600 border-green-200'
        }]
    }, {
        dayIndex: 3,
        // Wednesday
        activities: [{
            id: '4',
            type: 'vocabulary',
            time: '07:00',
            duration: 15,
            title: 'ทบทวนคำศัพท์',
            icon: BookOpen,
            color: 'bg-blue-500/10 text-blue-600 border-blue-200'
        }, {
            id: '5',
            type: 'review',
            time: '20:00',
            duration: 25,
            title: 'ทำแบบทดสอบ',
            icon: Target,
            color: 'bg-orange-500/10 text-orange-600 border-orange-200'
        }]
    }, {
        dayIndex: 4,
        // Thursday
        activities: [{
            id: '6',
            type: 'practice',
            time: '19:00',
            duration: 30,
            title: 'ฝึกพูดกับ AI',
            icon: MessageCircle,
            color: 'bg-purple-500/10 text-purple-600 border-purple-200'
        }]
    }, {
        dayIndex: 5,
        // Friday
        activities: [{
            id: '7',
            type: 'vocabulary',
            time: '07:00',
            duration: 15,
            title: 'ทบทวนคำศัพท์',
            icon: BookOpen,
            color: 'bg-blue-500/10 text-blue-600 border-blue-200'
        }, {
            id: '8',
            type: 'listening',
            time: '18:00',
            duration: 20,
            title: 'ฟังเพลงภาษาอังกฤษ',
            icon: Headphones,
            color: 'bg-green-500/10 text-green-600 border-green-200'
        }]
    }]);

    const isToday = (date: Date) => date.toDateString() === today.toDateString();

    const getDaySchedule = (dayIndex: number) => {
        return schedules.find(s => s.dayIndex === dayIndex);
    };

    // Get all days in the current month for calendar view
    const getMonthDays = () => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay();
        const days: (Date | null)[] = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push(null);
        }

        // Add days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    const getWeekDays = () => {
        const currentDay = selectedDate.getDay(); // 0 (Sun) to 6 (Sat)
        const diff = selectedDate.getDate() - currentDay;
        const startOfWeek = new Date(selectedDate);
        startOfWeek.setDate(diff);

        const days: (Date | null)[] = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            days.push(day);
        }
        return days;
    };

    const getDaysToRender = () => {
        switch (viewMode) {
            case 'day':
                return [selectedDate];
            case 'week':
                return getWeekDays();
            case 'month':
            default:
                return getMonthDays();
        }
    };

    const getPixelPosition = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        return (hours * 60 + minutes) * (PIXELS_PER_HOUR / 60);
    };

    const getPixelHeight = (duration: number) => {
        return duration * (PIXELS_PER_HOUR / 60);
    };

    const handleAddActivity = () => {
        if (selectedDay === null) return;

        const newActivity: Activity = {
            id: Date.now().toString(),
            type: 'vocabulary',
            time: '09:00',
            duration: 15,
            title: 'กิจกรรมใหม่',
            icon: BookOpen,
            color: 'bg-blue-500/10 text-blue-600 border-blue-200'
        };

        const newSchedules = [...schedules];
        const daySchedule = newSchedules.find(s => s.dayIndex === selectedDay);

        if (daySchedule) {
            daySchedule.activities.push(newActivity);
        } else {
            newSchedules.push({
                dayIndex: selectedDay,
                activities: [newActivity]
            });
        }

        setSchedules(newSchedules);
    };

    const handleRemoveActivity = (dayIndex: number, activityId: string) => {
        const newSchedules = schedules.map(day => {
            if (day.dayIndex === dayIndex) {
                return {
                    ...day,
                    activities: day.activities.filter(a => a.id !== activityId)
                };
            }
            return day;
        });
        setSchedules(newSchedules);
    };

    const handleUpdateActivityTitle = (dayIndex: number, activityId: string, newTitle: string) => {
        const newSchedules = schedules.map(day => {
            if (day.dayIndex === dayIndex) {
                return {
                    ...day,
                    activities: day.activities.map(a => {
                        if (a.id === activityId) {
                            return { ...a, title: newTitle };
                        }
                        return a;
                    })
                };
            }
            return day;
        });
        setSchedules(newSchedules);
    };

    const handleUpdateActivityTime = (dayIndex: number, activityId: string, newTime: string) => {
        const newSchedules = schedules.map(day => {
            if (day.dayIndex === dayIndex) {
                return {
                    ...day,
                    activities: day.activities.map(a => {
                        if (a.id === activityId) {
                            return { ...a, time: newTime };
                        }
                        return a;
                    })
                };
            }
            return day;
        });
        setSchedules(newSchedules);
    };

    const handleUpdateActivityDuration = (dayIndex: number, activityId: string, newDuration: number) => {
        const newSchedules = schedules.map(day => {
            if (day.dayIndex === dayIndex) {
                return {
                    ...day,
                    activities: day.activities.map(a => {
                        if (a.id === activityId) {
                            return { ...a, duration: newDuration };
                        }
                        return a;
                    })
                };
            }
            return day;
        });
        setSchedules(newSchedules);
    };

    const handleEditSchedule = (dayIndex: number) => {
        setSelectedDay(dayIndex);
        setIsDialogOpen(true);
    };

    return (
        <Card className="w-full h-full min-h-[600px] flex flex-col shadow-md border-border/40">
            <CardHeader className="pb-2 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <CalendarIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                ตารางเรียนรู้
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">จัดการเวลาเรียนรู้ของคุณ</p>
                        </div>
                    </div>

                    <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="gap-1.5 shadow-lg hover:shadow-primary/25 transition-all duration-300">
                                <Clock className="w-4 h-4" />
                                ตั้งเวลาทบทวน
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[900px]">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-primary" />
                                    ตั้งเวลาทบทวนคำศัพท์
                                </DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-4">
                                {/* Column 1: Selected Items (Left) - 3 cols */}
                                <div className="lg:col-span-3 flex flex-col bg-muted/30 rounded-lg border border-border/50 overflow-hidden">
                                    <div className="p-3 border-b border-border/50 flex items-center justify-between bg-white/50">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-primary" />
                                            <h3 className="text-sm font-semibold">รายการที่เลือก</h3>
                                        </div>
                                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] min-w-[20px] justify-center">
                                            {selectedItems.length}
                                        </Badge>
                                    </div>

                                    <div className="flex-1 p-2 min-h-[300px] relative">
                                        {selectedItems.length > 0 ? (
                                            <ScrollArea className="h-[300px] pr-2">
                                                <div className="space-y-2">
                                                    {selectedItems.map((item, index) => (
                                                        <div key={`${item.id}-${index}`} className="group flex items-center justify-between p-2 rounded-md bg-background border border-border/50 shadow-sm hover:shadow-md transition-all">
                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                <div className="w-1.5 h-8 rounded-full bg-primary/20 flex-shrink-0" />
                                                                <div className="flex flex-col overflow-hidden">
                                                                    <span className="text-sm font-medium truncate">{item.front_text}</span>
                                                                    <span className="text-[10px] text-muted-foreground truncate">{item.back_text}</span>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                                                onClick={() => {
                                                                    const newItems = [...selectedItems];
                                                                    newItems.splice(index, 1);
                                                                    setSelectedItems(newItems);
                                                                }}
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/50 p-4">
                                                <CheckCircle className="w-12 h-12 mb-3 opacity-20" />
                                                <p className="text-sm font-medium text-center">ยังไม่ได้เลือกรายการ</p>
                                                <p className="text-xs text-center mt-1 opacity-70">เลือกคำศัพท์จากรายการด้านขวา</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Column 2: Library (Middle) - 5 cols */}
                                <div className="lg:col-span-5 border-r border-border/50 pr-6">
                                    <Tabs defaultValue="latest" className="w-full" onValueChange={setActiveTab}>
                                        <TabsList className="w-full grid grid-cols-2 mb-4">
                                            <TabsTrigger value="latest">ล่าสุด</TabsTrigger>
                                            <TabsTrigger value="library">คลังคำศัพท์</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="latest" className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs text-muted-foreground">คำศัพท์ที่เรียนล่าสุด</Label>
                                                <ScrollArea className="h-[200px] w-full rounded-md border p-2">
                                                    {flashcards.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {flashcards.slice(0, 5).map((card) => (
                                                                <div key={card.id} className="flex items-center gap-2 p-2 hover:bg-accent rounded-md cursor-pointer" onClick={() => {
                                                                    if (selectedItems.find(i => i.id === card.id)) {
                                                                        setSelectedItems(selectedItems.filter(i => i.id !== card.id));
                                                                    } else {
                                                                        setSelectedItems([...selectedItems, card]);
                                                                    }
                                                                }}>
                                                                    <div className="w-4 h-4 border rounded flex items-center justify-center">
                                                                        {selectedItems.find(i => i.id === card.id) && <div className="w-2 h-2 bg-primary rounded-sm" />}
                                                                    </div>
                                                                    <span className="text-sm truncate">{card.front_text}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                                            <BookOpen className="w-8 h-8 mb-2 opacity-20" />
                                                            <span className="text-xs">ไม่มีประวัติการเรียน</span>
                                                        </div>
                                                    )}
                                                </ScrollArea>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="library" className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs text-muted-foreground">เลือกจากคลังคำศัพท์</Label>
                                                <div className="space-y-2">
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

                                                    {selectedFolderId && (
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
                                                    )}

                                                    <ScrollArea className="h-[120px] w-full rounded-md border p-2">
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
                                    </Tabs>
                                </div>

                                {/* Column 3: Activity Details (Right) - 4 cols */}
                                <div className="lg:col-span-4 space-y-4">
                                    <div className="space-y-2">
                                        <Label>ชื่อกิจกรรม</Label>
                                        <Input value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} placeholder="เช่น ทบทวนคำศัพท์บทที่ 1" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>ไอคอน</Label>
                                        <div className="flex flex-wrap gap-2">
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
                                        <div className="flex flex-wrap gap-2">
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
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={() => setIsReviewDialogOpen(false)} variant="outline">ยกเลิก</Button>
                                <Button onClick={() => {
                                    toast({
                                        title: "บันทึกการทบทวนสำเร็จ",
                                        description: `ตั้งเวลาทบทวน ${reviewTitle} เรียบร้อยแล้ว`,
                                    });
                                    setIsReviewDialogOpen(false);
                                }}>บันทึก</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2">
                    {/* Header Controls */}
                    <div className="flex flex-wrap items-center gap-2 p-1.5 bg-muted/50 rounded-lg border border-border/50">
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

                        <div className="h-8 w-[1px] bg-border/60 mx-1 hidden sm:block" />

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-[240px] justify-start text-left font-normal bg-background hover:bg-accent/50",
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
            {
                (viewMode === 'week' || viewMode === 'day') ? (
                    <ScrollArea className="h-[600px] border rounded-md">
                        <div className="flex flex-col min-w-full">
                            {/* Header (Sticky) */}
                            <div className={cn("grid gap-1 mb-1 sticky top-0 z-40 bg-background border-b pb-2 pt-2", (viewMode === 'week' || viewMode === 'day') ? "grid-cols-[60px_1fr]" : "grid-cols-7")}>
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

                                        // Week View Header
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
                                    })
                                    }
                                </div >
                            </div >

                            {/* Time Grid Body */}
                            < div className="flex relative flex-1" >
                                {/* Time Axis (Sticky Left) */}
                                < div className="w-[60px] flex-shrink-0 border-r bg-muted/5 sticky left-0 z-30 bg-background" >
                                    {
                                        HOURS.map(hour => (
                                            <div key={hour} className="h-[60px] border-b text-xs text-muted-foreground p-1 text-right pr-2 relative">
                                                <span className="-top-2 relative">{hour}:00</span>
                                            </div>
                                        ))
                                    }
                                </div >

                                {/* Days Columns */}
                                < div className={cn("flex-1 grid", viewMode === 'day' ? "grid-cols-1" : "grid-cols-7")}>
                                    {
                                        getDaysToRender().map((date, dayIndex) => {
                                            if (!date) return null;
                                            const daySchedule = getDaySchedule(date.getDay());
                                            const isCurrentDay = isToday(date);

                                            return (
                                                <div key={dayIndex} className={`border-r relative min-h-[1440px] ${isCurrentDay ? 'bg-primary/5' : ''}`}>
                                                    {/* Hour Grid Lines */}
                                                    {HOURS.map(hour => (
                                                        <div key={hour} className="h-[60px] border-b border-dashed border-border/50" />
                                                    ))}

                                                    {/* Activities */}
                                                    {daySchedule?.activities.map(activity => (
                                                        <div
                                                            key={activity.id}
                                                            className={`absolute left-1 right-1 rounded-md p-2 text-xs border overflow-hidden cursor-pointer hover:brightness-95 transition-all shadow-sm z-10 ${activity.color}`}
                                                            style={{
                                                                top: `${getPixelPosition(activity.time)}px`,
                                                                height: `${Math.max(getPixelHeight(activity.duration), viewMode === 'day' ? 50 : 30)}px` // Minimum height
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

                                                    {/* Click to add/edit (background) */}
                                                    <div
                                                        className="absolute inset-0 z-0"
                                                        onClick={() => handleEditSchedule(date.getDay())}
                                                    />
                                                </div>
                                            );
                                        })
                                    }
                                </div >
                            </div >
                        </div >
                    </ScrollArea >
                ) : (
                    /* Standard Grid for Month View */
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
                )
            }

            {/* Year View (Enhanced with Stats) */}
            {
                viewMode === 'year' && (
                    <div className="absolute inset-0 bg-background z-20 overflow-auto flex flex-col">
                        <div className="p-6 space-y-8 max-w-7xl mx-auto w-full">
                            {/* Header Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 shadow-sm">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className="p-3 bg-blue-500/10 rounded-full text-blue-600">
                                            <BookOpen className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground font-medium">คำศัพท์ที่จำได้ทั้งปี</p>
                                            <h3 className="text-2xl font-bold text-blue-700">2,543 <span className="text-xs font-normal text-muted-foreground">คำ</span></h3>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-100 shadow-sm">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className="p-3 bg-orange-500/10 rounded-full text-orange-600">
                                            <Flame className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground font-medium">เข้าใช้งานต่อเนื่องสูงสุด</p>
                                            <h3 className="text-2xl font-bold text-orange-700">45 <span className="text-xs font-normal text-muted-foreground">วัน</span></h3>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100 shadow-sm">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className="p-3 bg-green-500/10 rounded-full text-green-600">
                                            <CalendarDays className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground font-medium">วันที่เรียนรู้ทั้งหมด</p>
                                            <h3 className="text-2xl font-bold text-green-700">280 <span className="text-xs font-normal text-muted-foreground">วัน</span></h3>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100 shadow-sm">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className="p-3 bg-purple-500/10 rounded-full text-purple-600">
                                            <Trophy className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground font-medium">คะแนนเฉลี่ยแบบทดสอบ</p>
                                            <h3 className="text-2xl font-bold text-purple-700">85%</h3>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Main Chart */}
                            <Card className="border-border/50 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-primary" />
                                        สถิติการจำคำศัพท์รายเดือน
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={Array.from({ length: 12 }, (_, i) => ({
                                                name: format(new Date(2025, i, 1), 'MMM', { locale: th }),
                                                fullMonth: format(new Date(2025, i, 1), 'MMMM', { locale: th }),
                                                words: Math.floor(Math.random() * 300) + 100,
                                                streak: Math.floor(Math.random() * 20) + 5
                                            }))}
                                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                            />
                                            <Tooltip
                                                cursor={{ fill: 'transparent' }}
                                                content={({ active, payload, label }) => {
                                                    if (active && payload && payload.length) {
                                                        return (
                                                            <div className="bg-white p-3 border rounded-lg shadow-lg text-xs">
                                                                <p className="font-bold mb-1">{payload[0].payload.fullMonth}</p>
                                                                <div className="flex items-center gap-2 text-primary">
                                                                    <BookOpen className="w-3 h-3" />
                                                                    <span>จำได้: {payload[0].value} คำ</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Bar dataKey="words" radius={[4, 4, 0, 0]}>
                                                {Array.from({ length: 12 }).map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${0.4 + (index % 2) * 0.2})`} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Monthly Grid */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <CalendarIcon className="w-5 h-5 text-primary" />
                                    ปฏิทินรายเดือน
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
                                    {Array.from({ length: 12 }, (_, i) => {
                                        const date = new Date(selectedDate.getFullYear(), i, 1);
                                        const isCurrentMonth = new Date().getMonth() === i && new Date().getFullYear() === selectedDate.getFullYear();
                                        const wordsCount = Math.floor(Math.random() * 200) + 50;
                                        const streakCount = Math.floor(Math.random() * 15) + 1;

                                        return (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "group border rounded-xl p-4 cursor-pointer transition-all duration-300 hover:shadow-md hover:border-primary/50 bg-card",
                                                    isCurrentMonth && "ring-2 ring-primary ring-offset-2"
                                                )}
                                                onClick={() => {
                                                    setSelectedDate(date);
                                                    setViewMode('month');
                                                }}
                                            >
                                                <div className="flex justify-between items-center mb-3">
                                                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                                                        {format(date, 'MMMM', { locale: th })}
                                                    </h3>
                                                    {isCurrentMonth && <Badge variant="default" className="text-[10px] h-5">เดือนนี้</Badge>}
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-muted-foreground flex items-center gap-1.5">
                                                            <BookOpen className="w-3.5 h-3.5" />
                                                            คำศัพท์
                                                        </span>
                                                        <span className="font-medium">{wordsCount}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-muted-foreground flex items-center gap-1.5">
                                                            <Flame className="w-3.5 h-3.5" />
                                                            Streak
                                                        </span>
                                                        <span className="font-medium">{streakCount} วัน</span>
                                                    </div>

                                                    <div className="pt-2 mt-2 border-t border-border/50">
                                                        <div className="grid grid-cols-7 gap-0.5 h-8 items-end">
                                                            {Array.from({ length: 31 }, (_, d) => {
                                                                const dayHeight = Math.random() > 0.7 ? 'h-2' : Math.random() > 0.4 ? 'h-1.5' : 'h-1';
                                                                const isActive = Math.random() > 0.3;
                                                                return (
                                                                    <div
                                                                        key={d}
                                                                        className={cn(
                                                                            "w-full rounded-sm transition-all",
                                                                            dayHeight,
                                                                            isActive ? "bg-primary/60" : "bg-muted"
                                                                        )}
                                                                    />
                                                                );
                                                            }).slice(0, new Date(date.getFullYear(), i + 1, 0).getDate())}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Dialog for editing schedule */}
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
        </Card >
    );
}