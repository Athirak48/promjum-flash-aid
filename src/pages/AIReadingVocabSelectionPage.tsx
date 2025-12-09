import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Clock, Sparkles, Book, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AIReadingVocabSelectionPage() {
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

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            {/* Sub-header / Page Title */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => navigate('/ai-reading-section1-intro')}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-2xl font-bold text-pink-300">
                        {language === 'th' ? 'เลือกคำศัพท์' : 'Select Vocabulary'}
                    </h1>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-1 sm:px-4 py-2 sm:py-8 pb-24 lg:px-4 lg:py-8">
                <div className="grid grid-cols-2 lg:grid-cols-12 gap-2 sm:gap-6 items-start">

                    {/* Left Column: Selected Items (4 cols) */}
                    <Card className="col-span-1 lg:col-span-4 p-2 sm:p-3 lg:p-6 border-none shadow-sm bg-white rounded-xl min-h-[400px]">
                        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 mb-2 sm:mb-4 lg:mb-6">
                            <h2 className="text-xs sm:text-sm lg:text-xl font-bold text-gray-800 text-center sm:text-left">
                                {language === 'th' ? 'รายการที่เลือก' : 'Selected'}
                            </h2>
                            <span className="flex items-center justify-center w-5 h-5 lg:w-6 lg:h-6 bg-purple-100 text-purple-600 text-[10px] lg:text-xs font-bold rounded-full">
                                {selectedItems.length}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-1.5 sm:gap-2 lg:flex lg:flex-col lg:space-y-3 max-h-[300px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
                            {selectedItems.map((item, index) => {
                                const recWord = recommendedWords.find(w => w.word === item);
                                const level = recWord?.level;
                                let itemClass = "px-2 py-1.5 sm:px-3 sm:py-2 lg:px-6 lg:py-4 bg-gray-50/80 hover:bg-gray-100 transition-colors rounded-lg lg:rounded-xl text-gray-700 font-medium text-[10px] sm:text-xs lg:text-base break-words text-center lg:text-left";

                                if (level) {
                                    const colorClass = getLevelBorderColor(level);
                                    itemClass = `px-2 py-1.5 sm:px-3 sm:py-2 lg:px-6 lg:py-4 border lg:border-2 rounded-lg lg:rounded-xl font-medium text-[10px] sm:text-xs lg:text-base shadow-sm ${colorClass} break-words text-center lg:text-left`;
                                }

                                return (
                                    <div
                                        key={index}
                                        className={itemClass}
                                    >
                                        <div className="truncate">{item}</div>
                                    </div>
                                );
                            })}
                            {selectedItems.length === 0 && (
                                <div className="col-span-1 text-center py-4 sm:py-8 text-gray-400 italic text-[10px] sm:text-xs lg:text-base">
                                    {language === 'th' ? 'ยังไม่ได้เลือก' : 'No words'}
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Right Column: Selection Source (8 cols) */}
                    <Card className="col-span-1 lg:col-span-8 p-2 sm:p-3 lg:p-6 border-none shadow-sm bg-white rounded-xl min-h-[400px]">
                        <h2 className="text-xs sm:text-sm lg:text-xl font-bold text-gray-800 mb-2 sm:mb-4 lg:mb-6 text-center sm:text-left">
                            {language === 'th' ? 'เลือกคำศัพท์จาก' : 'Select from'}
                        </h2>

                        <Tabs defaultValue="recent" className="w-full">
                            <TabsList className="w-full grid grid-cols-3 bg-gray-100/50 p-1 rounded-lg lg:rounded-xl mb-2 sm:mb-4 lg:mb-8 gap-1 h-auto">
                                <TabsTrigger
                                    value="recommend"
                                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md lg:rounded-lg py-1.5 lg:py-2.5 text-[9px] sm:text-[10px] lg:text-sm text-gray-500 data-[state=active]:text-gray-800 px-1 flex-col lg:flex-row gap-0.5 lg:gap-2 h-full"
                                >
                                    <Sparkles className="w-3 h-3 lg:w-4 lg:h-4" />
                                    <span>{language === 'th' ? 'จำไม่ได้' : 'Hard'}</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="recent"
                                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md lg:rounded-lg py-1.5 lg:py-2.5 text-[9px] sm:text-[10px] lg:text-sm text-gray-500 data-[state=active]:text-gray-800 px-1 flex-col lg:flex-row gap-0.5 lg:gap-2 h-full"
                                >
                                    <Clock className="w-3 h-3 lg:w-4 lg:h-4" />
                                    <span>{language === 'th' ? 'ล่าสุด' : 'Recent'}</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="bank"
                                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md lg:rounded-lg py-1.5 lg:py-2.5 text-[9px] sm:text-[10px] lg:text-sm text-gray-500 data-[state=active]:text-gray-800 px-1 flex-col lg:flex-row gap-0.5 lg:gap-2 h-full"
                                >
                                    <Book className="w-3 h-3 lg:w-4 lg:h-4" />
                                    <span>{language === 'th' ? 'คลัง' : 'Bank'}</span>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="recent" className="mt-0">
                                <div className="p-0 sm:p-1 lg:p-1">
                                    <div className="text-center mb-2 sm:mb-4 lg:mb-6 pt-1 sm:pt-2 lg:pt-4 hidden sm:block">
                                        <h3 className="text-xs sm:text-sm lg:text-lg font-bold text-gray-800 mb-1">
                                            {language === 'th' ? 'ทบทวนคำศัพท์ล่าสุด' : 'Review Recent Vocabulary'}
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 lg:gap-3">
                                        {recentWords.map((item) => {
                                            const isSelected = selectedItems.includes(item.word);
                                            return (
                                                <button
                                                    key={item.word}
                                                    onClick={() => handleToggleItem(item.word)}
                                                    disabled={!isSelected && selectedItems.length >= 10}
                                                    className={`
                                                        relative p-2 sm:p-3 lg:p-5 rounded-lg sm:rounded-xl lg:rounded-2xl border lg:border-2 text-left transition-all duration-200
                                                        ${isSelected
                                                            ? 'border-purple-400 bg-white text-purple-700 shadow-sm'
                                                            : 'border-transparent bg-gray-50/80 text-gray-500 hover:bg-gray-100'
                                                        }
                                                        ${!isSelected && selectedItems.length >= 10 ? 'opacity-40 cursor-not-allowed' : ''}
                                                    `}
                                                >
                                                    <span className={`font-bold text-[10px] sm:text-sm lg:text-lg block mb-0.5 sm:mb-1 truncate ${isSelected ? 'text-purple-700' : 'text-gray-700'}`}>{item.word}</span>
                                                    <span className={`text-[8px] sm:text-xs lg:text-sm font-medium ${isSelected ? 'text-purple-400' : 'text-gray-400'} truncate block`}>{item.meaning}</span>
                                                    {isSelected && (
                                                        <div className="absolute top-1 right-1 lg:top-4 lg:right-4 w-3 h-3 lg:w-6 lg:h-6 bg-purple-500 rounded-full flex items-center justify-center animate-in zoom-in duration-200">
                                                            <Check className="w-2 h-2 lg:w-3.5 lg:h-3.5 text-white" />
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="recommend" className="mt-0">
                                <div className="p-0 sm:p-1 lg:p-1">
                                    <div className="text-center mb-2 sm:mb-4 lg:mb-6 pt-1 sm:pt-2 lg:pt-4 hidden sm:block">
                                        <h3 className="text-xs sm:text-sm lg:text-lg font-bold text-gray-800 mb-1">
                                            {language === 'th' ? 'คำศัพท์ที่ยังจำไม่ได้' : 'Words Not Yet Remembered'}
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 lg:gap-3">
                                        {recommendedWords.map((item) => {
                                            const isSelected = selectedItems.includes(item.word);
                                            const colorClass = getLevelBorderColor(item.level);
                                            const borderColor = colorClass.split(' ').find(c => c.startsWith('border-'))?.replace('border-', '') || 'gray-200';
                                            return (
                                                <button
                                                    key={item.word}
                                                    onClick={() => handleToggleItem(item.word)}
                                                    disabled={!isSelected && selectedItems.length >= 10}
                                                    className={`
                                                        relative p-2 sm:p-3 lg:p-5 rounded-lg sm:rounded-xl lg:rounded-2xl border lg:border-2 text-left transition-all duration-200
                                                        ${isSelected
                                                            ? `${colorClass} shadow-md`
                                                            : `${colorClass} opacity-70 hover:opacity-100 hover:shadow-sm bg-white`
                                                        }
                                                        ${!isSelected && selectedItems.length >= 10 ? 'opacity-40 cursor-not-allowed' : ''}
                                                    `}
                                                >
                                                    <div className="flex justify-between items-center mb-0.5 sm:mb-1">
                                                        <span className={`font-bold text-[10px] sm:text-sm lg:text-lg block truncate`}>{item.word}</span>
                                                        <span className={`text-[8px] lg:text-[10px] px-1 lg:px-2 py-0 lg:py-0.5 rounded-full border bg-white/50 border-current ml-1 shrink-0`}>
                                                            Lv.{item.level}
                                                        </span>
                                                    </div>
                                                    <span className={`text-[8px] sm:text-xs lg:text-sm font-medium opacity-80 truncate block`}>{item.meaning}</span>

                                                    {isSelected && (
                                                        <div className={`absolute top-1 right-1 lg:top-4 lg:right-4 w-3 h-3 lg:w-6 lg:h-6 rounded-full flex items-center justify-center animate-in zoom-in duration-200 bg-${borderColor}`}>
                                                            <Check className="w-2 h-2 lg:w-3.5 lg:h-3.5 text-white" />
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="bank">
                                <div className="text-center py-4 sm:py-12 text-gray-400 text-[10px] sm:text-xs lg:text-base">
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
                            navigate('/ai-reading-section2-intro', { state: { selectedVocab } });
                        }}
                    >
                        {language === 'th' ? 'ถัดไป' : 'Next'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
