import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, X, Book, Clock, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AIListeningVocabSelectionPage() {
    const navigate = useNavigate();
    const { language } = useLanguage();

    // Mock data for selected items
    const [selectedItems, setSelectedItems] = useState<string[]>([
        'happy', 'create', 'method', 'adjust'
    ]);
    const [isRecentFetched, setIsRecentFetched] = useState(false);

    const handleRemoveItem = (itemToRemove: string) => {
        setSelectedItems(selectedItems.filter(item => item !== itemToRemove));
    };

    const handleFetchRecent = () => {
        // Mock fetching logic
        const recentWords = ['apple', 'banana', 'cat', 'dog', 'elephant', 'fish'];
        const weakWords = ['ghost', 'house', 'ice', 'jump'];
        const allWords = [...recentWords, ...weakWords];

        setSelectedItems(prev => {
            // Avoid duplicates
            const newItems = [...prev];
            allWords.forEach(word => {
                if (!newItems.includes(word)) {
                    newItems.push(word);
                }
            });
            return newItems;
        });
        setIsRecentFetched(true);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="border-b bg-card sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/ai-listening-section1-intro')}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                            {language === 'th' ? 'เลือกคำศัพท์' : 'Select Vocabulary'}
                        </h1>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">

                    {/* Left Column: Selected Items */}
                    <Card className="lg:col-span-1 p-6 flex flex-col h-full max-h-[calc(100vh-140px)]">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            {language === 'th' ? 'รายการที่เลือก' : 'Selected Items'}
                            <span className="bg-primary/10 text-primary text-sm px-2 py-0.5 rounded-full">
                                {selectedItems.length}
                            </span>
                        </h2>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                            {selectedItems.length > 0 ? (
                                selectedItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors group"
                                    >
                                        <span className="font-medium">{item}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => handleRemoveItem(item)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    {language === 'th' ? 'ยังไม่ได้เลือกคำศัพท์' : 'No items selected'}
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Right Column: Selection Source */}
                    <Card className="lg:col-span-2 p-6 flex flex-col h-full max-h-[calc(100vh-140px)]">
                        <h2 className="text-xl font-semibold mb-4">
                            {language === 'th' ? 'เลือกคำศัพท์จาก' : 'Select From'}
                        </h2>

                        <Tabs defaultValue="recent" className="flex-1 flex flex-col">
                            <TabsList className="grid w-full grid-cols-3 mb-6">
                                <TabsTrigger value="recommend" className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    <span className="hidden sm:inline">{language === 'th' ? 'แนะนำ' : 'Recommend'}</span>
                                </TabsTrigger>
                                <TabsTrigger value="recent" className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span className="hidden sm:inline">{language === 'th' ? 'ทวนล่าสุด' : 'Recent'}</span>
                                </TabsTrigger>
                                <TabsTrigger value="bank" className="flex items-center gap-2">
                                    <Book className="w-4 h-4" />
                                    <span className="hidden sm:inline">{language === 'th' ? 'คลังคำศัพท์' : 'Vocab Bank'}</span>
                                </TabsTrigger>
                            </TabsList>

                            <div className="flex-1 overflow-y-auto">
                                <TabsContent value="recommend" className="mt-0 h-full">
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
                                        <Sparkles className="w-12 h-12 opacity-20" />
                                        <p>{language === 'th' ? 'คำศัพท์แนะนำสำหรับคุณ' : 'Recommended vocabulary for you'}</p>
                                    </div>
                                    <div className="mt-6 flex justify-end pt-4 border-t">
                                        <Button
                                            size="lg"
                                            className="w-full sm:w-auto"
                                            onClick={() => console.log('Next')}
                                        >
                                            {language === 'th' ? 'ถัดไป' : 'Next'} &gt;
                                        </Button>
                                    </div>
                                </TabsContent>

                                <TabsContent value="recent" className="mt-0 h-full">
                                    {!isRecentFetched ? (
                                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-6">
                                            <Clock className="w-12 h-12 opacity-20" />
                                            <div className="text-center space-y-2">
                                                <p className="font-medium text-foreground">
                                                    {language === 'th' ? 'ทบทวนคำศัพท์ล่าสุด' : 'Review Recent Vocabulary'}
                                                </p>
                                                <p className="text-sm max-w-xs mx-auto">
                                                    {language === 'th'
                                                        ? 'ระบบจะดึงคำศัพท์ที่คุณทบทวนล่าสุด 6 คำ และคำศัพท์ที่ยังจำไม่ได้อีก 4 คำ มาให้คุณฝึกฝน'
                                                        : 'The system will fetch 6 recently reviewed words and 4 words you struggle with.'}
                                                </p>
                                            </div>
                                            <Button onClick={handleFetchRecent}>
                                                {language === 'th' ? 'ตกลง' : 'OK'}
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col">
                                            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                                                <div className="text-sm font-medium text-muted-foreground mb-2">
                                                    {language === 'th' ? 'คำศัพท์ที่พบทวนล่าสุด' : 'Recently Reviewed'}
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {['apple', 'banana', 'cat', 'dog', 'elephant', 'fish'].map(w => (
                                                        <div key={w} className="p-2 bg-secondary/30 rounded text-center text-sm">{w}</div>
                                                    ))}
                                                </div>
                                                <div className="text-sm font-medium text-muted-foreground mt-4 mb-2">
                                                    {language === 'th' ? 'คำศัพท์ที่ยังจำไม่ได้' : 'Needs Review'}
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {['ghost', 'house', 'ice', 'jump'].map(w => (
                                                        <div key={w} className="p-2 bg-red-50 text-red-700 rounded text-center text-sm">{w}</div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-4 border-t flex justify-end">
                                                <Button
                                                    onClick={() => navigate('/ai-listening-section2-flashcard')}
                                                    className="w-full sm:w-auto"
                                                >
                                                    {language === 'th' ? 'ถัดไป' : 'Next'} &gt;
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="bank" className="mt-0 h-full space-y-4">
                                    <div className="w-full max-w-xs">
                                        <Select defaultValue="all">
                                            <SelectTrigger>
                                                <SelectValue placeholder={language === 'th' ? 'เลือกแหล่งที่มา' : 'Select Source'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">{language === 'th' ? 'คลังคำศัพท์ทั้งหมด' : 'All Vocabulary Bank'}</SelectItem>
                                                <SelectItem value="sets">{language === 'th' ? 'ชุดคำศัพท์ (Sets)' : 'Vocabulary Sets'}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground border-2 border-dashed rounded-lg">
                                        <Book className="w-8 h-8 opacity-20 mb-2" />
                                        <p>{language === 'th' ? 'เลือกคำศัพท์จากคลัง' : 'Select from bank'}</p>
                                    </div>
                                    <div className="mt-6 flex justify-end pt-4 border-t">
                                        <Button
                                            size="lg"
                                            className="w-full sm:w-auto"
                                            onClick={() => console.log('Next')}
                                        >
                                            {language === 'th' ? 'ถัดไป' : 'Next'} &gt;
                                        </Button>
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </Card>
                </div>
            </main>
        </div>
    );
}
