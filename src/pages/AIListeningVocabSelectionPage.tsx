import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Clock, Sparkles, Book, User, Settings, Sun, Languages, Check, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AIListeningVocabSelectionPage() {
    const navigate = useNavigate();
    const { language } = useLanguage();

    // Mock data for selected items
    const recommendedWords = [
        { word: 'ephemeral', meaning: 'ไม่ยั่งยืน, ชั่วคราว', level: 5 },
        { word: 'serendipity', meaning: 'การมีโชคในการค้นพบ', level: 4 },
        { word: 'articulate', meaning: 'พูดชัดเจน, สื่อสารได้ดี', level: 3 },
        { word: 'resilient', meaning: 'ยืดหยุ่น, ฟื้นตัวเร็ว', level: 2 }
    ];

    // Mock data for selected items - Pre-select top 4 highest level words
    const [selectedItems, setSelectedItems] = useState<string[]>(() => {
        const sorted = [...recommendedWords].sort((a, b) => b.level - a.level);
        return sorted.slice(0, 4).map(w => w.word);
    });

    const getLevelBorderColor = (level: number) => {
        switch (level) {
            case 5: return 'border-red-900 bg-red-50 text-red-900'; // Critical - Darkest Red
            case 4: return 'border-red-600 bg-red-50 text-red-700'; // High - Red
            case 3: return 'border-orange-500 bg-orange-50 text-orange-700'; // Medium - Orange
            case 2: return 'border-yellow-500 bg-yellow-50 text-yellow-700'; // Low - Yellow
            case 1: return 'border-green-500 bg-green-50 text-green-700'; // Fine - Green
            default: return 'border-gray-200 text-gray-700';
        }
    };

    const getLevelLabel = (level: number) => {
        if (level === 5) return 'ต้องเน้นย้ำ';
        if (level === 4) return 'ควรทบทวน';
        if (level === 3) return 'พอจำได้';
        if (level === 2) return 'จำได้ดี';
        return 'แม่นยำ';
    };

    const recentWords = [
        { word: 'ambiguous', meaning: 'กำกวม, คลุมเครือ' },
        { word: 'metaphor', meaning: 'อุปมาอุปไมย' },
        { word: 'paradox', meaning: 'ความขัดแย้งในตัวเอง' },
        { word: 'aesthetic', meaning: 'สุนทรียศาสตร์' },
        { word: 'pragmatic', meaning: 'เน้นการปฏิบัติจริง' },
        { word: 'cognitive', meaning: 'เกี่ยวกับการรู้คิด' }
    ];

    const handleToggleItem = (word: string) => {
        if (selectedItems.includes(word)) {
            setSelectedItems(selectedItems.filter(item => item !== word));
        } else {
            if (selectedItems.length < 10) {
                setSelectedItems([...selectedItems, word]);
            }
        }
    };

    const handleRemoveItem = (itemToRemove: string) => {
        setSelectedItems(selectedItems.filter(item => item !== itemToRemove));
    };

    const handleFetchRecent = () => {
        const recentWords = ['ambiguous', 'metaphor', 'paradox', 'aesthetic', 'pragmatic', 'cognitive'];
        setSelectedItems(recentWords);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">


            {/* Sub-header / Page Title */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => navigate('/ai-listening-section1-intro')}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-2xl font-bold text-pink-300">
                        {language === 'th' ? 'เลือกคำศัพท์' : 'Select Vocabulary'}
                    </h1>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-8 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* Left Column: Selected Items (4 cols) */}
                    <Card className="lg:col-span-4 p-6 border-none shadow-sm bg-white rounded-xl min-h-[400px]">
                        <div className="flex items-center gap-2 mb-6">
                            <h2 className="text-xl font-bold text-gray-800">
                                {language === 'th' ? 'รายการที่เลือก' : 'Selected Items'}
                            </h2>
                            <span className="flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-600 text-xs font-bold rounded-full">
                                {selectedItems.length}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {selectedItems.map((item, index) => {
                                const recWord = recommendedWords.find(w => w.word === item);
                                const level = recWord?.level;
                                let itemClass = "px-6 py-4 bg-gray-50/80 hover:bg-gray-100 transition-colors rounded-xl text-gray-700 font-medium text-base";

                                if (level) {
                                    // Reuse the same logic for consistency
                                    const colorClass = getLevelBorderColor(level);
                                    itemClass = `px-6 py-4 border-2 rounded-xl font-medium text-base shadow-sm ${colorClass}`;
                                }

                                return (
                                    <div
                                        key={index}
                                        className={itemClass}
                                    >
                                        {item}
                                    </div>
                                );
                            })}
                            {selectedItems.length === 0 && (
                                <div className="text-center py-8 text-gray-400 italic">
                                    {language === 'th' ? 'ยังไม่ได้เลือกคำศัพท์' : 'No words selected'}
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Right Column: Selection Source (8 cols) */}
                    <Card className="lg:col-span-8 p-6 border-none shadow-sm bg-white rounded-xl min-h-[400px]">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">
                            {language === 'th' ? 'เลือกคำศัพท์จาก' : 'Select vocabulary from'}
                        </h2>

                        <Tabs defaultValue="recent" className="w-full">
                            <TabsList className="w-full grid grid-cols-3 bg-gray-100/50 p-1 rounded-xl mb-8">
                                <TabsTrigger
                                    value="recommend"
                                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-2.5 text-gray-500 data-[state=active]:text-gray-800"
                                >
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    {language === 'th' ? 'คำที่ยังจำไม่ได้' : 'Not Remembered'}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="recent"
                                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-2.5 text-gray-500 data-[state=active]:text-gray-800"
                                >
                                    <Clock className="w-4 h-4 mr-2" />
                                    {language === 'th' ? 'ทวนล่าสุด' : 'Recent'}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="bank"
                                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-2.5 text-gray-500 data-[state=active]:text-gray-800"
                                >
                                    <Book className="w-4 h-4 mr-2" />
                                    {language === 'th' ? 'คลังคำศัพท์' : 'Vocab Bank'}
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="recent" className="mt-0">
                                <div className="p-1">
                                    <div className="text-center mb-6 pt-4">
                                        <h3 className="text-lg font-bold text-gray-800 mb-1">
                                            {language === 'th' ? 'ทบทวนคำศัพท์ล่าสุด' : 'Review Recent Vocabulary'}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {language === 'th' ? 'เลือกคำศัพท์จากที่คุณเพิ่งเรียนไป' : 'Select words from your recent studies'}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {recentWords.map((item) => {
                                            const isSelected = selectedItems.includes(item.word);
                                            return (
                                                <button
                                                    key={item.word}
                                                    onClick={() => handleToggleItem(item.word)}
                                                    disabled={!isSelected && selectedItems.length >= 10}
                                                    className={`
                                                        relative p-5 rounded-2xl border-2 text-left transition-all duration-200
                                                        ${isSelected
                                                            ? 'border-purple-400 bg-white text-purple-700 shadow-sm'
                                                            : 'border-transparent bg-gray-50/80 text-gray-500 hover:bg-gray-100'
                                                        }
                                                        ${!isSelected && selectedItems.length >= 10 ? 'opacity-40 cursor-not-allowed' : ''}
                                                    `}
                                                >
                                                    <span className={`font-bold text-lg block mb-1 ${isSelected ? 'text-purple-700' : 'text-gray-700'}`}>{item.word}</span>
                                                    <span className={`text-sm font-medium ${isSelected ? 'text-purple-400' : 'text-gray-400'}`}>{item.meaning}</span>
                                                    {isSelected && (
                                                        <div className="absolute top-4 right-4 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center animate-in zoom-in duration-200">
                                                            <Check className="w-3.5 h-3.5 text-white" />
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="recommend" className="mt-0">
                                <div className="p-1">
                                    <div className="text-center mb-6 pt-4">
                                        <h3 className="text-lg font-bold text-gray-800 mb-1">
                                            {language === 'th' ? 'คำศัพท์ที่ยังจำไม่ได้' : 'Words Not Yet Remembered'}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {language === 'th' ? 'เลือกคำศัพท์ที่คุณต้องการฝึกฝนเพิ่มเติม' : 'Select words you want to practice more'}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap justify-center gap-3 mb-6 px-4">
                                        <div className="flex items-center gap-1.5 bg-red-50 border border-red-900 px-2 py-1 rounded-md">
                                            <div className="w-2 h-2 rounded-full bg-red-900"></div>
                                            <span className="text-[10px] text-red-900 font-bold">{language === 'th' ? 'Lv.5 (ต้องเน้นย้ำ)' : 'Lv.5 (Critical)'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-red-50 border border-red-600 px-2 py-1 rounded-md">
                                            <div className="w-2 h-2 rounded-full bg-red-600"></div>
                                            <span className="text-[10px] text-red-700 font-medium">{language === 'th' ? 'Lv.4 (ควรทบทวน)' : 'Lv.4 (Review)'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-500 px-2 py-1 rounded-md">
                                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                            <span className="text-[10px] text-orange-700 font-medium">{language === 'th' ? 'Lv.3 (พอจำได้)' : 'Lv.3 (Medium)'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-500 px-2 py-1 rounded-md">
                                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                            <span className="text-[10px] text-yellow-700 font-medium">{language === 'th' ? 'Lv.2 (จำได้ดี)' : 'Lv.2 (Good)'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-green-50 border border-green-500 px-2 py-1 rounded-md">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            <span className="text-[10px] text-green-700 font-medium">{language === 'th' ? 'Lv.1 (แม่นยำ)' : 'Lv.1 (Perfect)'}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {recommendedWords.map((item) => {
                                            const isSelected = selectedItems.includes(item.word);
                                            const colorClass = getLevelBorderColor(item.level);

                                            // Extract border color for the badge and icon
                                            const borderColor = colorClass.split(' ').find(c => c.startsWith('border-'))?.replace('border-', '') || 'gray-200';
                                            const textColor = colorClass.split(' ').find(c => c.startsWith('text-'))?.replace('text-', '') || 'gray-700';

                                            return (
                                                <button
                                                    key={item.word}
                                                    onClick={() => handleToggleItem(item.word)}
                                                    disabled={!isSelected && selectedItems.length >= 10}
                                                    className={`
                                                        relative p-5 rounded-2xl border-2 text-left transition-all duration-200
                                                        ${isSelected
                                                            ? `${colorClass} shadow-md`
                                                            : `${colorClass} opacity-70 hover:opacity-100 hover:shadow-sm bg-white`
                                                        }
                                                        ${!isSelected && selectedItems.length >= 10 ? 'opacity-40 cursor-not-allowed' : ''}
                                                    `}
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className={`font-bold text-lg block`}>{item.word}</span>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border bg-white/50 border-current`}>
                                                            Lv.{item.level}
                                                        </span>
                                                    </div>
                                                    <span className={`text-sm font-medium opacity-80`}>{item.meaning}</span>

                                                    {isSelected && (
                                                        <div className={`absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center animate-in zoom-in duration-200 bg-${borderColor}`}>
                                                            <Check className="w-3.5 h-3.5 text-white" />
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="bank">
                                <div className="text-center py-12 text-gray-400">
                                    Vocabulary Bank content placeholder
                                </div>
                            </TabsContent>
                        </Tabs>
                    </Card>
                </div>
            </main>

            {/* Fixed Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        {language === 'th'
                            ? `เลือกแล้ว ${selectedItems.length}/10 คำ`
                            : `Selected ${selectedItems.length}/10 words`}
                    </div>
                    <Button
                        size="lg"
                        className={`rounded-full px-10 font-bold transition-all duration-300 ${selectedItems.length === 10
                            ? 'bg-pink-500 hover:bg-pink-600 text-white shadow-lg hover:shadow-pink-200 hover:-translate-y-0.5'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        disabled={selectedItems.length < 10}
                        onClick={() => {
                            const allWords = [...recommendedWords, ...recentWords];
                            const selectedVocab = selectedItems.map((word, index) => {
                                const found = allWords.find(w => w.word === word);
                                return {
                                    id: String(index + 1),
                                    word: word,
                                    meaning: found?.meaning || ''
                                };
                            });
                            navigate('/ai-listening-section2-intro', { state: { selectedVocab } });
                        }}
                    >
                        {language === 'th' ? 'ถัดไป' : 'Next'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
