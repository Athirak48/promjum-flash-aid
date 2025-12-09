import React, { useState } from "react";
import GameHeader from "@/components/battle-arena/GameHeader";
import GameBottomDock from "@/components/battle-arena/GameBottomDock";
import ArenaView from "@/components/battle-arena/views/ArenaView";
import ShopView from "@/components/battle-arena/views/ShopView";
import { Box, Layers } from "lucide-react";

const BattleArenaPage = () => {
    const [view, setView] = useState("arena");

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-100 dark:bg-slate-900 p-2 sm:p-4 gap-3 overflow-hidden">
            {/* Header */}
            <GameHeader />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-0 items-center w-full overflow-hidden">
                {view === "arena" && <ArenaView />}
                {view === "shop" && <ShopView />}
                {view === "cards" && (
                    <div className="flex-1 w-full flex items-center justify-center text-slate-400 flex-col gap-4">
                        <Layers className="w-16 h-16 opacity-20" />
                        <p>Cards Collection (Coming Soon)</p>
                    </div>
                )}
                {view === "inventory" && (
                    <div className="flex-1 w-full flex items-center justify-center text-slate-400 flex-col gap-4">
                        <Box className="w-16 h-16 opacity-20" />
                        <p>Inventory (Coming Soon)</p>
                    </div>
                )}
            </div>

            {/* Bottom Dock */}
            <div className="shrink-0 w-full flex justify-center pb-2">
                <GameBottomDock currentView={view} onViewChange={setView} />
            </div>
        </div>
    );
};

export default BattleArenaPage;
