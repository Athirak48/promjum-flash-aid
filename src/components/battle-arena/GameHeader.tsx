import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gem, Mail, Settings, ShoppingBag, Star } from "lucide-react";

const GameHeader = () => {
    return (
        <div className="w-full bg-white dark:bg-slate-800 rounded-xl p-2 px-3 shadow-sm flex items-center justify-between shrink-0 h-14">
            <div className="flex items-center gap-2">
                <div className="relative">
                    <Avatar className="h-9 w-9 border-2 border-indigo-100 dark:border-indigo-900/50">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-indigo-500 text-white text-[10px]">PO</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full border border-white dark:border-slate-800 font-bold">
                        1
                    </div>
                </div>
                <div className="leading-tight">
                    <h2 className="font-bold text-sm">PlayerOne</h2>
                    <Badge variant="outline" className="text-[9px] h-3.5 font-normal bg-slate-100 dark:bg-slate-700/50 border-0 px-1">No Rank</Badge>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 rounded-full px-2 py-1">
                    <div className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center text-yellow-800 text-[9px] font-bold">$</div>
                    <span className="font-bold text-xs">20k</span>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 rounded-full px-2 py-1">
                    <Gem className="w-3 h-3 text-cyan-400 fill-current" />
                    <span className="font-bold text-xs">0</span>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 rounded-full px-2 py-1">
                    <Star className="w-3 h-3 text-purple-400 fill-current" />
                    <span className="font-bold text-xs">0</span>
                </div>

                <div className="flex items-center gap-1 ml-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full relative">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full border border-white dark:border-slate-800"></span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                        <Settings className="w-3.5 h-3.5 text-slate-500" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default GameHeader;
