import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Award, ChevronLeft, ChevronRight, Globe, Users } from "lucide-react";

const ArenaView = () => {
    const [activeTab, setActiveTab] = useState("friends");
    const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);

    const categories = [
        {
            name: "หมวดธุรกิจ",
            rankGradient: "from-blue-500 to-indigo-600",
            buttonGradient: "from-blue-500 via-indigo-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400"
        },
        {
            name: "ท่องเที่ยว",
            rankGradient: "from-orange-500 to-red-500",
            buttonGradient: "from-orange-500 via-red-500 to-pink-500 hover:from-orange-400 hover:to-pink-400"
        },
        {
            name: "คำศัพท์ในชีวิตประจำวัน",
            rankGradient: "from-emerald-500 to-green-600",
            buttonGradient: "from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400"
        },
        {
            name: "หมวดอื่นๆ",
            rankGradient: "from-purple-500 to-pink-600",
            buttonGradient: "from-purple-500 via-pink-500 to-rose-500 hover:from-purple-400 hover:to-rose-400"
        }
    ];

    const currentCategory = categories[currentCategoryIndex];

    const handlePrev = () => {
        setCurrentCategoryIndex((prev) => (prev === 0 ? categories.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentCategoryIndex((prev) => (prev === categories.length - 1 ? 0 : prev + 1));
    };

    // Mock data
    const friends = [
        { id: 1, name: "Alex", status: "Online", avatar: "", isOnline: true },
        { id: 2, name: "Maria", status: "Offline", avatar: "", isOnline: false },
        { id: 3, name: "John", status: "In Game", avatar: "", isOnline: true },
        { id: 4, name: "Sarah", status: "Online", avatar: "", isOnline: true },
        { id: 5, name: "Mike", status: "Online", avatar: "", isOnline: true },
    ];

    return (
        <div className="flex flex-1 gap-2 overflow-hidden min-h-0 justify-center w-full max-w-7xl">
            {/* Left Sidebar - Ultra Compact */}
            <Card className="w-56 h-full rounded-2xl border-0 shadow-sm flex flex-col bg-white dark:bg-slate-800 shrink-0">
                <div className="p-1.5 grid grid-cols-2 gap-1 bg-slate-50 dark:bg-slate-900/50 m-1.5 rounded-xl shrink-0">
                    <Button
                        variant={activeTab === "friends" ? "secondary" : "ghost"}
                        className={`rounded-lg text-[10px] font-bold h-7 ${activeTab === "friends" ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-800" : "text-slate-500"}`}
                        onClick={() => setActiveTab("friends")}
                    >
                        <Users className="w-3 h-3 mr-1" />
                        Friends
                    </Button>
                    <Button
                        variant={activeTab === "guild" ? "secondary" : "ghost"}
                        className={`rounded-lg text-[10px] font-bold h-7 ${activeTab === "guild" ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-800" : "text-slate-500"}`}
                        onClick={() => setActiveTab("guild")}
                    >
                        <Globe className="w-3 h-3 mr-1" />
                        Guild
                    </Button>
                </div>

                <ScrollArea className="flex-1 px-2 py-1">
                    <div className="space-y-1">
                        {friends.map((friend) => (
                            <div key={friend.id} className="flex items-center gap-2 p-1 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg cursor-pointer transition-colors group">
                                <div className="relative">
                                    <Avatar className="h-7 w-7">
                                        <AvatarImage src={friend.avatar} />
                                        <AvatarFallback className="text-[9px] bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300">
                                            {friend.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    {friend.isOnline && (
                                        <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 truncate">{friend.name}</h4>
                                    <p className="text-[9px] text-slate-500 truncate">{friend.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <div className="p-2 bg-slate-50 dark:bg-slate-900/50 mt-auto shrink-0">
                    <Button className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-600 dark:bg-indigo-900/50 dark:hover:bg-indigo-900 dark:text-indigo-300 rounded-lg font-bold text-[10px] shadow-none border-0 h-8">
                        + Invite
                    </Button>
                </div>
            </Card>

            {/* Center - Main Content (Scalable Card - Larger) */}
            <div className="flex-1 flex flex-col items-center justify-center h-full relative min-w-0">
                {/* Card */}
                <div className="relative w-full max-w-[320px] aspect-[3/4] max-h-full bg-white rounded-[2rem] p-2 shadow-xl ring-4 ring-white/50 transform transition-transform hover:scale-[1.01] duration-300 mb-16">
                    {/* Inner Content Area */}
                    <div className="w-full h-full rounded-[1.5rem] overflow-hidden relative bg-gradient-to-b from-green-300 to-green-400">
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 2px, transparent 2px)', backgroundSize: '16px 16px' }}></div>

                        {/* Decorative Stars */}
                        <div className="absolute top-4 right-8 text-yellow-400 animate-pulse"><Award className="w-6 h-6 fill-current drop-shadow-md" /></div>

                        {/* Rank Badge S+ */}
                        <div className="absolute top-3 left-3 z-20 transform -rotate-12">
                            <div className="relative bg-yellow-400 text-white font-black text-3xl px-2 py-0.5 rounded-full border-2 border-white shadow-lg min-w-[50px] h-[50px] flex items-center justify-center">
                                <span className="drop-shadow-sm">S</span><span className="text-lg ml-0.5 align-top drop-shadow-sm">+</span>
                            </div>
                        </div>

                        {/* Character Image */}
                        <div className="absolute inset-0 z-10 flex items-center justify-center pt-8">
                            <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=Felix&clothing=graphicShirt&eyes=happy&mouth=smile" alt="Character" className="w-[110%] h-[110%] object-cover object-top transform translate-y-6" />
                        </div>

                        {/* Name Plate */}
                        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-400 z-30 flex items-center px-3 shadow-md rounded-t-[1.2rem] border-t border-white/50">
                            {/* Mascot Icon */}
                            <div className="absolute -top-5 left-1 w-12 h-12 bg-white rounded-full border-2 border-yellow-400 shadow-md flex items-center justify-center z-40 transform -rotate-12">
                                <span className="text-2xl">🐣</span>
                            </div>
                            <div className="flex-1 flex items-baseline justify-center gap-1.5 pl-10 text-slate-800">
                                <span className="font-bold text-sm tracking-tight text-slate-900">[Rookie]</span>
                                <h2 className="font-black text-xl text-slate-800 tracking-tight">PlayerOne</h2>
                                <div className="flex items-baseline gap-0.5 ml-1">
                                    <span className="text-orange-600 font-bold text-xs">Lv</span>
                                    <span className="text-orange-700 font-black text-lg italic">1</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right - Ranked Match Panel (Larger) */}
            <div className="w-80 flex flex-col items-center justify-center h-full shrink-0">
                <div className="bg-slate-900/10 dark:bg-slate-900/50 backdrop-blur-sm rounded-[2rem] p-6 w-full shadow-inner flex flex-col items-center gap-4 h-auto max-h-full">

                    <div className="text-center space-y-1">
                        <h3 className="text-slate-500 font-bold tracking-widest text-base">{currentCategory.name}</h3>
                        <h2 className="text-4xl font-black text-white drop-shadow-xl tracking-tight">Diamond I</h2>
                    </div>

                    <div className="flex items-center justify-between w-full px-2 py-2">
                        <Button size="icon" variant="ghost" onClick={handlePrev} className="rounded-full bg-black/10 hover:bg-black/20 text-white w-10 h-10"><ChevronLeft className="w-6 h-6" /></Button>
                        <div className={`w-24 h-24 rounded-full bg-gradient-to-b ${currentCategory.rankGradient} shadow-xl flex items-center justify-center border-4 border-white/20 transform hover:scale-105 cursor-pointer transition-all duration-300`}>
                            <span className="text-white font-black text-lg tracking-wider">RANK</span>
                        </div>
                        <Button size="icon" variant="ghost" onClick={handleNext} className="rounded-full bg-black/10 hover:bg-black/20 text-white w-10 h-10"><ChevronRight className="w-6 h-6" /></Button>
                    </div>

                    <Button className={`w-full h-14 bg-gradient-to-r ${currentCategory.buttonGradient} text-white rounded-2xl font-black text-xl shadow-lg border-t border-white/20 active:scale-95 transition-all duration-300`}>
                        START
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ArenaView;
