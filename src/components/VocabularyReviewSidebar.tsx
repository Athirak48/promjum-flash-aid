import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Clock, Folder } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FlashcardSet {
    id: string;
    title: string;
    cardCount: number;
    lastReviewed: string;
    progress: number;
}

interface Folder {
    id: string;
    title: string;
}

interface Flashcard {
    id: string;
    front_text: string;
    back_text: string;
}

interface VocabularyReviewSidebarProps {
    onSelectSet?: (setId: string, flashcards: Flashcard[]) => void;
}

export function VocabularyReviewSidebar({ onSelectSet }: VocabularyReviewSidebarProps) {
    const [activeTab, setActiveTab] = useState<string>('recent');
    const [recentSets, setRecentSets] = useState<FlashcardSet[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<string>('');
    const [folderSets, setFolderSets] = useState<FlashcardSet[]>([]);
    const [selectedSet, setSelectedSet] = useState<string>('');
    const [selectedSetFlashcards, setSelectedSetFlashcards] = useState<Flashcard[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch recent review sets
    useEffect(() => {
        fetchRecentSets();
        fetchFolders();
    }, []);

    const fetchRecentSets = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('user_flashcard_sets')
                .select('*')
                .eq('user_id', user.id)
                .not('last_reviewed', 'is', null)
                .order('last_reviewed', { ascending: false })
                .limit(10);

            if (error) throw error;

            const formattedSets: FlashcardSet[] = (data || []).map(set => ({
                id: set.id,
                title: set.title,
                cardCount: set.card_count || 0,
                lastReviewed: set.last_reviewed || new Date().toISOString(),
                progress: set.progress || 0
            }));

            setRecentSets(formattedSets);
        } catch (error) {
            console.error('Error fetching recent sets:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFolders = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            const { data, error } = await supabase
                .from('user_folders')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formattedFolders: Folder[] = (data || []).map(folder => ({
                id: folder.id,
                title: folder.title
            }));

            setFolders(formattedFolders);
        } catch (error) {
            console.error('Error fetching folders:', error);
        }
    };

    const fetchFolderSets = async (folderId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            const { data, error } = await supabase
                .from('user_flashcard_sets')
                .select('*')
                .eq('user_id', user.id)
                .eq('folder_id', folderId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formattedSets: FlashcardSet[] = (data || []).map(set => ({
                id: set.id,
                title: set.title,
                cardCount: set.card_count || 0,
                lastReviewed: set.last_reviewed || new Date().toISOString(),
                progress: set.progress || 0
            }));

            setFolderSets(formattedSets);
        } catch (error) {
            console.error('Error fetching folder sets:', error);
        }
    };

    const fetchSetFlashcards = async (setId: string) => {
        try {
            const { data, error } = await supabase
                .from('user_flashcards')
                .select('*')
                .eq('flashcard_set_id', setId)
                .order('created_at', { ascending: true });

            if (error) throw error;

            setSelectedSetFlashcards(data || []);

            if (onSelectSet && data) {
                onSelectSet(setId, data);
            }
        } catch (error) {
            console.error('Error fetching flashcards:', error);
        }
    };

    const handleFolderChange = (folderId: string) => {
        setSelectedFolder(folderId);
        setSelectedSet('');
        setSelectedSetFlashcards([]);
        if (folderId) {
            fetchFolderSets(folderId);
        } else {
            setFolderSets([]);
        }
    };

    const handleSetChange = (setId: string) => {
        setSelectedSet(setId);
        if (setId) {
            fetchSetFlashcards(setId);
        } else {
            setSelectedSetFlashcards([]);
        }
    };

    const handleRecentSetClick = (setId: string) => {
        fetchSetFlashcards(setId);
    };

    const getProgressColor = (progress: number) => {
        if (progress >= 80) return 'bg-emerald-500';
        if (progress >= 60) return 'bg-amber-500';
        return 'bg-rose-500';
    };

    return (
        <div className="h-full flex flex-col bg-background border-r">
            <div className="p-4 border-b">
                <h2 className="text-lg font-bold">คำศัพท์ทบทวน</h2>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="w-full grid grid-cols-2 mx-4 mt-2">
                    <TabsTrigger value="recent">ทบทวนล่าสุด</TabsTrigger>
                    <TabsTrigger value="collection">คลังส่วนตัว</TabsTrigger>
                </TabsList>

                {/* Recent Review Tab */}
                <TabsContent value="recent" className="flex-1 mt-4 px-4 overflow-hidden">
                    <ScrollArea className="h-full">
                        {loading ? (
                            <div className="text-center text-muted-foreground py-8">กำลังโหลด...</div>
                        ) : recentSets.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                ไม่มีชุดคำศัพท์
                            </div>
                        ) : (
                            <div className="space-y-3 pb-4">
                                {recentSets.map((set) => (
                                    <Card
                                        key={set.id}
                                        className="cursor-pointer hover:shadow-md transition-shadow"
                                        onClick={() => handleRecentSetClick(set.id)}
                                    >
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base line-clamp-2">{set.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                <span>{set.cardCount} คำ</span>
                                                <Badge variant="secondary">{set.progress}%</Badge>
                                            </div>

                                            <div className="w-full bg-muted rounded-full h-1.5">
                                                <div
                                                    className={`h-1.5 rounded-full transition-all ${getProgressColor(set.progress)}`}
                                                    style={{ width: `${set.progress}%` }}
                                                />
                                            </div>

                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                <span>ทบทวนล่าสุด: {new Date(set.lastReviewed).toLocaleDateString('th-TH')}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </TabsContent>

                {/* Personal Collection Tab */}
                <TabsContent value="collection" className="flex-1 mt-4 px-4 overflow-hidden flex flex-col">
                    <div className="space-y-3 mb-4">
                        {/* Folder Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">เลือกโฟลเดอร์</label>
                            <Select value={selectedFolder} onValueChange={handleFolderChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="เลือกโฟลเดอร์..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {folders.length === 0 ? (
                                        <SelectItem value="no-folders" disabled>ไม่มีโฟลเดอร์</SelectItem>
                                    ) : (
                                        folders.map((folder) => (
                                            <SelectItem key={folder.id} value={folder.id}>
                                                <div className="flex items-center gap-2">
                                                    <Folder className="h-4 w-4" />
                                                    {folder.title}
                                                </div>
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Set Selection */}
                        {selectedFolder && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">เลือกชุดคำศัพท์</label>
                                <Select value={selectedSet} onValueChange={handleSetChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="เลือกชุดคำศัพท์..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {folderSets.length === 0 ? (
                                            <SelectItem value="no-sets" disabled>ไม่มีชุดคำศัพท์</SelectItem>
                                        ) : (
                                            folderSets.map((set) => (
                                                <SelectItem key={set.id} value={set.id}>
                                                    {set.title} ({set.cardCount} คำ)
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    {/* Flashcards Display */}
                    <ScrollArea className="flex-1">
                        {selectedSetFlashcards.length > 0 ? (
                            <div className="space-y-3 pb-4">
                                {selectedSetFlashcards.map((flashcard, index) => (
                                    <Card key={flashcard.id}>
                                        <CardContent className="p-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className="text-xs">
                                                        {index + 1}
                                                    </Badge>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium">{flashcard.front_text}</div>
                                                    <div className="text-sm text-muted-foreground mt-1">{flashcard.back_text}</div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : selectedSet ? (
                            <div className="text-center text-muted-foreground py-8">
                                กำลังโหลดคำศัพท์...
                            </div>
                        ) : null}
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </div>
    );
}
