import React from "react";
import { Button } from "@/components/ui/button";
import { Gamepad2, ShoppingBag, Box, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameBottomDockProps {
    currentView: string;
    onViewChange: (view: string) => void;
}

const GameBottomDock: React.FC<GameBottomDockProps> = ({ currentView, onViewChange }) => {
    const navItems = [
        { id: "arena", icon: Gamepad2, label: "Arena" },
        { id: "cards", icon: Layers, label: "Cards" },
        { id: "inventory", icon: Box, label: "Inventory" },
        { id: "shop", icon: ShoppingBag, label: "Shop" },
    ];

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-2 flex items-center justify-around gap-2 h-16 w-full max-w-lg mx-auto border border-slate-100 dark:border-slate-700">
            {navItems.map((item) => (
                <Button
                    key={item.id}
                    variant="ghost"
                    onClick={() => onViewChange(item.id)}
                    className={cn(
                        "flex flex-col items-center gap-1 h-auto py-1.5 px-3 rounded-xl transition-all flex-1",
                        currentView === item.id
                            ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                            : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                >
                    <item.icon className={cn("w-5 h-5", currentView === item.id && "fill-current")} />
                    <span className="text-[10px] font-bold">{item.label}</span>
                </Button>
            ))}
        </div>
    );
};

export default GameBottomDock;
