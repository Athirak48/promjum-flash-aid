import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Sparkles, Trophy, Users, Star, Zap,
    Gamepad2, ShoppingBag, Pickaxe, Cat,
    Search, Filter, Lock, Pizza, ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAnalytics } from '@/hooks/useAnalytics';


// --- MOCK DATA ---
const MOCK_PET = {
    name: "Cosmo",
    level: 12,
    xp: 75,
    xpMax: 100,
    status: "Ready to explore!",
    image: "https://api.dicebear.com/7.x/bottts/svg?seed=Cosmo&backgroundColor=transparent"
};

const MOCK_ITEMS = [
    { id: 1, name: "Star Dust", type: "material", qty: 5, rarity: "common", image: "✨", desc: "Material for basic upgrades." },
    { id: 2, name: "Ink Splash", type: "sabotage", qty: 3, rarity: "rare", image: "🦑", desc: "Blinds opponent screen with ink for 3s." },
    { id: 3, name: "Cosmic Key", type: "key", qty: 0, rarity: "epic", image: "🗝️", desc: "Unlocks special event raids." },
    { id: 4, name: "Freeze Ray", type: "sabotage", qty: 1, rarity: "epic", image: "❄️", desc: "Freezes enemy inputs for 2s." },
    { id: 5, name: "Plasma Battery", type: "energy", qty: 2, rarity: "rare", image: "🔋", desc: "Restores 50% energy instantly." },
    { id: 6, name: "Void Essence", type: "material", qty: 0, rarity: "legendary", image: "🌑", desc: "Rare material from the void." },
    { id: 7, name: "Space Helmet", type: "gear", qty: 1, rarity: "rare", image: "👨‍🚀", desc: "+10 Defense." },
    { id: 8, name: "Rocket Booster", type: "gear", qty: 0, rarity: "epic", image: "🚀", desc: "Speed boost for 5s." },
];

const MOCK_PETS_DEX = [
    { id: 1, name: "Cosmo", type: "Robot", unlocked: true, level: 12, rarity: "rare" },
    { id: 2, name: "Luna", type: "Alien", unlocked: false, level: 1, rarity: "legendary" },
    { id: 3, name: "Star", type: "Star", unlocked: false, level: 1, rarity: "common" },
    { id: 4, name: "Rocky", type: "Asteroid", unlocked: true, level: 5, rarity: "common" },
    { id: 5, name: "Nova", type: "Gas", unlocked: false, level: 1, rarity: "epic" },
];

// --- COMPONENTS ---

// 1. Lobby View
const LobbyHome = ({ onNavigate }: { onNavigate: (view: string) => void }) => {
    const { trackButtonClick } = useAnalytics();

    // Countdown State for Gacha
    const [timeLeft, setTimeLeft] = useState("02:59:00");

    useEffect(() => {
        // Mock countdown logic - resets every 3 hours
        const target = new Date();
        target.setHours(target.getHours() + 3);

        const interval = setInterval(() => {
            const now = new Date();
            // Just a visual loop for demo purposes
            // In real app, this would calculate diff to next free summon time
            const date = new Date();
            const h = 2 - (date.getHours() % 3);
            const m = 59 - date.getMinutes();
            const s = 59 - date.getSeconds();

            setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative h-full flex flex-col items-center justify-center p-4">
            {/* Header Stats */}
            {/* Header Stats & Gacha */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
                {/* Left: Rank */}
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center border-2 border-white/30">
                        <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">Rank #428</div>
                        <div className="text-sm font-black text-white">Space Cadet</div>
                    </div>
                </div>

                {/* Right: Currency & Gacha Banner */}
                <div className="flex flex-col items-end gap-3 scale-90 origin-top-right">
                    {/* Currency Bar */}
                    <div className="flex gap-2">
                        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                            <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-xs">💎</div>
                            <span className="font-bold text-white">1,250</span>
                        </div>
                        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs">🪙</div>
                            <span className="font-bold text-white">50,000</span>
                        </div>
                    </div>

                    {/* Gacha Capsule Button (Enhanced - Bigger & Eye-catching) */}
                    <motion.button
                        onClick={() => {
                            trackButtonClick('Gacha Warp', 'lobby');
                            onNavigate('gacha');
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        animate={{
                            y: [0, -8, 0],
                            rotate: [0, 5, 0, -5, 0]
                        }}
                        transition={{
                            y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                            rotate: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="relative group flex flex-col items-center mt-1 mr-1"
                    >
                        {/* Animated Glow Ring */}
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 0.8, 0.5]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="absolute inset-0 w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 blur-xl opacity-50"
                        />

                        {/* Capsule Orb - BIGGER */}
                        <div className="relative w-20 h-20 rounded-full border-[4px] border-black/30 shadow-[0_0_30px_rgba(255,255,255,0.6)] overflow-hidden bg-white z-10">
                            {/* Top Half (White/Glass) */}
                            <div className="absolute inset-x-0 top-0 h-[50%] bg-gradient-to-b from-white to-slate-200" />

                            {/* Bottom Half (Pink/Magenta) with Pulse */}
                            <motion.div
                                animate={{
                                    background: [
                                        "linear-gradient(to bottom, #ec4899, #c026d3)",
                                        "linear-gradient(to bottom, #f472b6, #d946ef)",
                                        "linear-gradient(to bottom, #ec4899, #c026d3)"
                                    ]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="absolute inset-x-0 bottom-0 h-[50%]"
                            />

                            {/* Divider Line */}
                            <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-black/10 -mt-0.5 z-10" />

                            {/* Center Button */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full border-2 border-slate-200 shadow-lg z-20"
                            />

                            {/* Multiple Shines */}
                            <div className="absolute top-2 left-2 w-4 h-3 bg-white rounded-full opacity-70 rotate-[-45deg] z-30" />
                            <motion.div
                                animate={{
                                    opacity: [0.3, 0.8, 0.3],
                                    scale: [1, 1.2, 1]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="absolute top-3 right-3 w-2 h-2 bg-pink-200 rounded-full z-30"
                            />
                        </div>

                        {/* Label Badge - BIGGER TEXT */}
                        <motion.div
                            animate={{
                                scale: [1, 1.05, 1]
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="relative z-30 -mt-2"
                        >
                            <span className="font-black text-base text-yellow-400 tracking-wider drop-shadow-[0_2px_0_rgba(0,0,0,0.8)]" style={{ textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 0 10px rgba(251, 191, 36, 0.8)' }}>
                                GACHA
                            </span>
                        </motion.div>

                        {/* Timer Pills - Enhanced */}
                        <motion.div
                            animate={{
                                boxShadow: [
                                    "0 0 5px rgba(34, 197, 94, 0.3)",
                                    "0 0 15px rgba(34, 197, 94, 0.6)",
                                    "0 0 5px rgba(34, 197, 94, 0.3)"
                                ]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="mt-1 bg-black/70 rounded-full px-3 py-1 border border-green-500/40 backdrop-blur-md"
                        >
                            <div className="text-[9px] font-mono text-green-300 flex items-center gap-1 font-bold">
                                <motion.span
                                    animate={{
                                        scale: [1, 1.3, 1],
                                        opacity: [1, 0.5, 1]
                                    }}
                                    transition={{
                                        duration: 1,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="w-1.5 h-1.5 rounded-full bg-green-500"
                                />
                                {timeLeft}
                            </div>
                        </motion.div>

                        {/* NEW: Sparkle effects around button */}
                        <motion.div
                            animate={{
                                rotate: [0, 360]
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute inset-0 pointer-events-none"
                        >
                            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400" />
                            <Sparkles className="absolute -bottom-2 -left-1 w-3 h-3 text-pink-400" />
                        </motion.div>
                    </motion.button>
                </div>
            </div>

            {/* Main Stage: Pet */}
            <div className="relative z-10 flex flex-col items-center">

                {/* Pet Speech Bubble */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mb-4 bg-white text-slate-900 px-4 py-2 rounded-2xl rounded-bl-sm shadow-lg font-bold text-sm relative"
                >
                    {MOCK_PET.status}
                </motion.div>

                {/* Pet Image with Float Animation */}
                <motion.div
                    animate={{ y: [-10, 10, -10] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-64 h-64 md:w-80 md:h-80 relative"
                >
                    {/* Glow behind pet */}
                    <div className="absolute inset-0 bg-cyan-500/20 blur-[60px] rounded-full" />
                    <img
                        src={MOCK_PET.image}
                        alt={MOCK_PET.name}
                        className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(0,240,255,0.3)] transition-transform hover:scale-105 cursor-pointer"
                        onClick={() => onNavigate('pet')}
                    />
                </motion.div>

                {/* Pet Name */}
                <div className="mt-4 text-center">
                    <h2 className="text-3xl font-black text-white tracking-wide drop-shadow-md">{MOCK_PET.name}</h2>
                    <div className="flex items-center justify-center gap-2 mt-1">
                        <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/50">Lvl {MOCK_PET.level}</Badge>
                        <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                                style={{ width: `${MOCK_PET.xp}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
};

// 2. Gacha World View
const GachaWorld = () => {
    const [activeTab, setActiveTab] = useState<'pet' | 'item'>('pet');
    const { toast } = useToast();

    const handleSummon = (count: number) => {
        // Animation simulation would go here
        toast({
            title: `Summoning ${count}x...`,
            description: "Good luck! 🍀",
            className: "bg-purple-900 border-purple-700 text-white"
        });

        // Shake effect helper could be added to parent
        if (navigator.vibrate) navigator.vibrate(200);
    };

    return (
        <div className="h-full flex flex-col p-4">
            {/* Tabs */}
            <div className="flex bg-black/20 p-1 rounded-2xl mx-auto mb-6 backdrop-blur-md border border-white/10 w-full max-w-md">
                <button
                    onClick={() => setActiveTab('pet')}
                    className={cn(
                        "flex-1 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                        activeTab === 'pet' ? "bg-yellow-400 text-yellow-900 shadow-lg" : "text-white/50 hover:text-white"
                    )}
                >
                    <Cat className="w-4 h-4" /> Pet Capsule
                </button>
                <button
                    onClick={() => setActiveTab('item')}
                    className={cn(
                        "flex-1 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                        activeTab === 'item' ? "bg-purple-500 text-purple-100 shadow-lg" : "text-white/50 hover:text-white"
                    )}
                >
                    <ShoppingBag className="w-4 h-4" /> Item Supply
                </button>
            </div>

            {/* Machine Area */}
            <div className="flex-1 flex flex-col items-center justify-center relative">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-sm aspect-square bg-white/5 rounded-[3rem] border border-white/10 backdrop-blur-sm flex items-center justify-center relative overflow-hidden group p-8"
                >
                    {/* Machine Graphic Placeholder */}
                    <div className={cn(
                        "w-full h-full rounded-[2rem] border-4 flex flex-col items-center justify-center relative shadow-inner",
                        activeTab === 'pet' ? "bg-yellow-500/10 border-yellow-400/30" : "bg-purple-500/10 border-purple-400/30"
                    )}>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30" />

                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="text-8xl"
                        >
                            {activeTab === 'pet' ? '🛸' : '🎁'}
                        </motion.div>

                        <div className="mt-8 text-center">
                            <h3 className="text-2xl font-black text-white uppercase tracking-widest drop-shadow-lg">
                                {activeTab === 'pet' ? 'Cosmic Pets' : 'Galactic Gear'}
                            </h3>
                            <p className="text-white/60 text-xs mt-1">
                                {activeTab === 'pet' ? 'Contains Rare & Legendary Pets' : 'Upgrade materials & Boosters'}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Odds Button */}
                <button className="absolute top-0 right-4 text-xs text-white/40 hover:text-white underline decoration-dotted">
                    Show Odds %
                </button>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 grid grid-cols-2 gap-4 max-w-md mx-auto w-full">
                <Button
                    variant="outline"
                    className="h-14 border-white/20 bg-white/5 hover:bg-white/10 text-white flex flex-col items-center justify-center gap-1"
                    onClick={() => handleSummon(1)}
                >
                    <span className="text-sm font-bold">Summon 1x</span>
                    <span className="text-xs text-cyan-300 font-mono">50 💎</span>
                </Button>
                <Button
                    className="h-14 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 flex flex-col items-center justify-center gap-1 relative overflow-hidden"
                    onClick={() => handleSummon(10)}
                >
                    <span className="relative z-10 text-sm font-bold">Summon 10x</span>
                    <span className="relative z-10 text-xs text-yellow-300 font-mono">450 💎</span>

                    {/* Badge */}
                    <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[9px] font-black px-1.5 py-0.5 rounded-bl-lg">
                        SR GUARANTEE!
                    </div>
                </Button>
            </div>
        </div>
    );
};

// 3. Inventory View
const InventoryView = ({ onNavigate }: { onNavigate: (view: string) => void }) => {
    const [filter, setFilter] = useState('all');
    const [selectedLockedItem, setSelectedLockedItem] = useState<{ id: number, name: string, image: string } | null>(null);
    const [flippedItems, setFlippedItems] = useState<number[]>([]);

    const handleFlip = (id: number) => {
        setFlippedItems(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };

    // Filter items logic (mock)
    const filteredItems = filter === 'all'
        ? MOCK_ITEMS
        : MOCK_ITEMS.filter(item => item.type === filter);

    return (
        <div className="h-full flex flex-col p-4 relative">
            <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-pink-500" />
                Inventory
            </h2>

            {/* Filter */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide shrink-0">
                {['all', 'sabotage', 'material', 'gear'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-xs font-bold capitalize whitespace-nowrap border transition-all",
                            filter === f
                                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                                : "bg-white/5 text-slate-400 border-white/10 hover:border-white/30 hover:text-white"
                        )}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 overflow-y-auto pb-24 pr-1 content-start">
                {filteredItems.map(item => {
                    const isFlipped = flippedItems.includes(item.id);

                    return (
                        <div
                            key={item.id}
                            className="aspect-square relative group perspective-1000"
                            onClick={() => {
                                if (item.qty === 0) {
                                    setSelectedLockedItem(item);
                                } else {
                                    handleFlip(item.id);
                                }
                            }}
                        >
                            <motion.div
                                className="w-full h-full relative"
                                initial={false}
                                animate={{ rotateY: isFlipped ? 180 : 0 }}
                                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                                style={{ transformStyle: "preserve-3d" }}
                            >
                                {/* FRONT SIDE */}
                                <div className={cn(
                                    "absolute inset-0 w-full h-full rounded-2xl border flex flex-col items-center justify-center relative overflow-hidden backface-hidden",
                                    item.qty > 0
                                        ? "bg-white/10 border-white/20 hover:border-white/40 cursor-pointer shadow-lg"
                                        : "bg-[#0B0B15] border-white/5 cursor-not-allowed grayscale"
                                )}>
                                    {/* Unlocked Background */}
                                    {item.qty > 0 && (
                                        <div className={cn(
                                            "absolute inset-0 opacity-20 bg-gradient-to-br",
                                            item.rarity === 'common' ? "from-slate-500 to-transparent" :
                                                item.rarity === 'rare' ? "from-blue-400 to-transparent" :
                                                    item.rarity === 'epic' ? "from-yellow-400 to-orange-500" :
                                                        "from-purple-500 to-pink-500"
                                        )} />
                                    )}

                                    {/* Item Image */}
                                    <div className={cn(
                                        "text-3xl relative z-10 transition-all",
                                        item.qty === 0 && "brightness-0 opacity-30 blur-[1px] scale-90"
                                    )}>
                                        {item.image}
                                    </div>

                                    {/* Lock Overlay */}
                                    {item.qty === 0 && (
                                        <div className="absolute inset-0 flex items-center justify-center z-20">
                                            <Lock className="w-6 h-6 text-white/40 drop-shadow-md" />
                                        </div>
                                    )}

                                    {/* Qty Badge (Front) */}
                                    {item.qty > 0 && (
                                        <div className={cn(
                                            "absolute bottom-1 right-1 text-[8px] font-black px-1 rounded border border-white/10 shadow-sm leading-tight",
                                            item.rarity === 'epic' || item.rarity === 'legendary'
                                                ? "bg-yellow-500 text-yellow-950"
                                                : "bg-black/60 text-white"
                                        )}>
                                            x{item.qty}
                                        </div>
                                    )}
                                </div>

                                {/* BACK SIDE - Skill Description */}
                                <div className="absolute inset-0 w-full h-full bg-slate-900/90 backdrop-blur-md rounded-2xl border border-white/20 flex flex-col items-center justify-center p-2 text-center backface-hidden" style={{ transform: "rotateY(180deg)" }}>
                                    <div className="text-[10px] font-bold text-cyan-300 mb-1 truncate w-full">{item.name}</div>
                                    <p className="text-[9px] text-white/80 leading-tight line-clamp-3">
                                        {item.desc}
                                    </p>
                                    <div className="mt-1 text-[8px] uppercase tracking-widest text-slate-500 font-bold">Skill</div>
                                </div>
                            </motion.div>
                        </div>
                    );
                })}

                {/* Empty Slots Filler */}
                {[...Array(Math.max(0, 20 - filteredItems.length))].map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square rounded-2xl bg-white/5 border border-dashed border-white/5 opacity-30" />
                ))}
            </div>

            {/* Locked Item Popup */}
            <AnimatePresence>
                {selectedLockedItem && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#1A1A2E] border border-white/20 p-6 rounded-3xl shadow-2xl w-full max-w-xs text-center relative overflow-hidden"
                        >
                            {/* Close Button */}
                            <button
                                onClick={(e) => { e.stopPropagation(); setSelectedLockedItem(null); }}
                                className="absolute top-4 right-4 text-white/50 hover:text-white"
                            >
                                <Lock className="w-5 h-5" />
                            </button>

                            <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
                                <span className="text-4xl grayscale brightness-50 contrast-125 opacity-50">{selectedLockedItem.image}</span>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Lock className="w-8 h-8 text-purple-300" />
                                </div>
                            </div>

                            <h3 className="text-xl font-black text-white mb-1">Item Locked!</h3>
                            <p className="text-sm text-slate-400 mb-6">
                                ไอเทมนี้หาได้จาก <span className="text-purple-400 font-bold">Gacha ตู้ม่วง</span> เท่านั้น!
                            </p>

                            <Button
                                onClick={() => { setSelectedLockedItem(null); onNavigate('gacha'); }}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold h-12 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] animate-pulse"
                            >
                                ไปสุ่มเลย! 🎲
                            </Button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// 4. Pet Room View
const PetRoomView = () => {
    const [selectedPetId, setSelectedPetId] = useState(1);
    const selectedPet = MOCK_PETS_DEX.find(p => p.id === selectedPetId);

    return (
        <div className="h-full flex flex-col md:flex-row gap-4 p-4 overflow-hidden">
            {/* Sidebar List (Mobile: Top, Desktop: Left) - Enhanced */}
            <div className="h-32 md:h-full md:w-1/3 flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto pr-2 pb-2 scrollbar-none shrink-0">
                {MOCK_PETS_DEX.map(pet => (
                    <motion.button
                        key={pet.id}
                        onClick={() => setSelectedPetId(pet.id)}
                        whileHover={{ scale: 1.02, x: 2 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                            "min-w-[90px] md:w-full p-3 rounded-2xl border flex flex-col md:flex-row items-center gap-3 transition-all relative overflow-hidden",
                            selectedPetId === pet.id
                                ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                                : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                        )}
                    >
                        {/* Selected Indicator */}
                        {selectedPetId === pet.id && (
                            <motion.div
                                layoutId="selectedPet"
                                className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-purple-400/10 rounded-2xl"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}

                        {/* Pet Avatar with Rarity Glow */}
                        <div className="relative">
                            <div className={cn(
                                "w-14 h-14 rounded-xl flex items-center justify-center text-2xl border-2 relative overflow-hidden transition-all",
                                pet.unlocked
                                    ? pet.rarity === 'legendary'
                                        ? "bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border-yellow-400/50 shadow-[0_0_15px_rgba(251,191,36,0.4)]"
                                        : pet.rarity === 'epic'
                                            ? "bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-purple-400/50"
                                            : pet.rarity === 'rare'
                                                ? "bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border-blue-400/50"
                                                : "bg-slate-800/80 border-white/20"
                                    : "bg-black/50 border-dashed border-white/10"
                            )}>
                                {/* Rarity Shine Effect */}
                                {pet.unlocked && pet.rarity === 'legendary' && (
                                    <motion.div
                                        animate={{
                                            opacity: [0.3, 0.6, 0.3],
                                            scale: [1, 1.1, 1]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                        className="absolute inset-0 bg-gradient-to-tr from-yellow-400/30 to-transparent rounded-xl"
                                    />
                                )}

                                <span className="relative z-10">{pet.unlocked ? '👾' : <Lock className="w-5 h-5 text-white/30" />}</span>
                            </div>
                        </div>

                        {/* Pet Info */}
                        <div className="flex-1 text-center md:text-left relative z-10">
                            <div className={cn(
                                "text-sm font-bold truncate",
                                pet.unlocked ? "text-white" : "text-white/40"
                            )}>
                                {pet.unlocked ? pet.name : '???'}
                            </div>
                            {pet.unlocked && (
                                <div className="flex items-center gap-1 justify-center md:justify-start">
                                    <span className="text-[10px] text-cyan-300 font-semibold">Lv.{pet.level}</span>
                                    <span className={cn(
                                        "text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase",
                                        pet.rarity === 'legendary' ? "bg-yellow-400/20 text-yellow-300" :
                                            pet.rarity === 'epic' ? "bg-purple-400/20 text-purple-300" :
                                                pet.rarity === 'rare' ? "bg-blue-400/20 text-blue-300" :
                                                    "bg-slate-400/20 text-slate-300"
                                    )}>
                                        {pet.rarity}
                                    </span>
                                </div>
                            )}
                        </div>
                    </motion.button>
                ))}
            </div>

            {/* Inspector - Enhanced */}
            <div className="flex-1 bg-gradient-to-br from-white/5 to-white/10 rounded-3xl border border-white/20 backdrop-blur-md p-8 flex flex-col items-center justify-between relative overflow-hidden shadow-2xl">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
                </div>

                {selectedPet?.unlocked ? (
                    <>
                        <div className="relative z-10 flex flex-col items-center w-full">
                            {/* Rarity Badge - Enhanced */}
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border-2 shadow-lg",
                                    selectedPet.rarity === 'legendary'
                                        ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-950 border-yellow-300 shadow-yellow-400/50"
                                        : selectedPet.rarity === 'epic'
                                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-300 shadow-purple-400/50"
                                            : selectedPet.rarity === 'rare'
                                                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-300 shadow-blue-400/50"
                                                : "bg-gradient-to-r from-slate-600 to-slate-700 text-white border-slate-400"
                                )}
                            >
                                {selectedPet.rarity}
                            </motion.span>

                            {/* Pet Avatar - With Glow */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 200 }}
                                className="relative w-40 h-40 md:w-56 md:h-56 flex items-center justify-center"
                            >
                                {/* Rarity Glow Ring */}
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        opacity: [0.3, 0.5, 0.3]
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className={cn(
                                        "absolute inset-0 rounded-full blur-2xl",
                                        selectedPet.rarity === 'legendary' ? "bg-yellow-400/40" :
                                            selectedPet.rarity === 'epic' ? "bg-purple-500/40" :
                                                selectedPet.rarity === 'rare' ? "bg-cyan-500/40" :
                                                    "bg-slate-500/40"
                                    )}
                                />

                                <motion.img
                                    animate={{ y: [-5, 5, -5] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    src={`https://api.dicebear.com/7.x/bottts/svg?seed=${selectedPet.name}`}
                                    alt={selectedPet.name}
                                    className="w-full h-full object-contain drop-shadow-2xl relative z-10"
                                />
                            </motion.div>

                            {/* Pet Name & Type */}
                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-2xl md:text-3xl font-black text-white mt-3 tracking-tight"
                            >
                                {selectedPet.name}
                            </motion.h2>
                            <p className="text-white/60 text-sm font-medium">Type: <span className="text-cyan-300">{selectedPet.type}</span></p>

                            {/* Stats - Enhanced */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="w-full max-w-sm space-y-2 mt-4 bg-black/20 p-3 rounded-2xl border border-white/10"
                            >
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm text-white/90 font-semibold">
                                        <span className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-pink-500" />
                                            Power
                                        </span>
                                        <span className="text-pink-400">150</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/10">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "60%" }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-pink-500 to-pink-600 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm text-white/90 font-semibold">
                                        <span className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-cyan-500" />
                                            Speed
                                        </span>
                                        <span className="text-cyan-400">90</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/10">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "40%" }}
                                            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                            className="h-full bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Action Buttons - Enhanced */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="relative z-10 flex gap-3 w-full max-w-sm mt-4"
                        >
                            <Button className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 font-bold h-11 rounded-xl shadow-lg hover:shadow-orange-500/30 transition-all">
                                <Pizza className="w-4 h-4 mr-2" /> Feed
                            </Button>
                            <Button className="flex-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border-2 border-green-500/50 text-green-300 font-bold h-11 rounded-xl shadow-lg hover:shadow-green-500/20 transition-all">
                                Equip
                            </Button>
                        </motion.div>
                    </>
                ) : (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center justify-center h-full text-white/40 gap-6"
                    >
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, 0, -5, 0]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <Lock className="w-20 h-20 opacity-50 drop-shadow-lg" />
                        </motion.div>
                        <div className="text-center">
                            <p className="text-xl font-black text-white/60 mb-2">LOCKED</p>
                            <p className="text-sm text-white/40 font-medium">Find in Gacha to unlock</p>
                        </div>
                        <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-pink-500/30 border-0 flex items-center gap-2">
                            Go to Gacha <ArrowRight className="w-4 h-4" />
                        </Button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

// --- MAIN PAGE ---
export default function LobbyPage() {
    const [activeView, setActiveView] = useState('lobby');
    const { trackPageView, trackButtonClick } = useAnalytics();


    useEffect(() => {
        trackPageView('Lobby', 'lobby');
    }, [trackPageView]);

    return (
        <div className="h-[calc(100vh-4rem)] bg-[#1A1A2E] relative overflow-hidden flex flex-col font-sans">
            {/* --- Global Background (Deep Space) --- */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-[#1A1A2E] to-[#1A1A2E]" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
                {/* Nebula Effects */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-pink-500/10 blur-[100px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[120px] rounded-full" />
            </div>

            {/* --- VIEW CONTENT --- */}
            <div className="flex-1 overflow-hidden relative z-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeView}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                        {activeView === 'lobby' && <LobbyHome onNavigate={setActiveView} />}
                        {activeView === 'gacha' && <GachaWorld />}
                        {activeView === 'inventory' && <InventoryView onNavigate={setActiveView} />}
                        {activeView === 'pet' && <PetRoomView />}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* --- BOTTOM NAVIGATION --- */}
            <div className="h-20 bg-white/5 backdrop-blur-xl border-t border-white/10 relative z-20 flex items-center justify-around px-2 pb-2">
                <button
                    onClick={() => setActiveView('inventory')}
                    className={cn(
                        "flex flex-col items-center gap-1 p-2 rounded-2xl transition-all w-20",
                        activeView === 'inventory' ? "text-cyan-300 bg-white/5" : "text-slate-400 hover:text-white"
                    )}
                >
                    <ShoppingBag className={cn("w-6 h-6", activeView === 'inventory' && "fill-current")} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Bag</span>
                </button>

                {/* Main Play / Home Button */}
                <div className="relative -top-6">
                    <button
                        onClick={() => setActiveView('lobby')}
                        className="w-16 h-16 bg-gradient-to-t from-pink-600 to-purple-500 rounded-full border-4 border-[#1A1A2E] shadow-[0_4px_20px_rgba(236,72,153,0.5)] flex items-center justify-center text-white hover:scale-110 transition-transform"
                    >
                        <Gamepad2 className="w-8 h-8 fill-white/20" />
                    </button>
                    {/* Ripple/Glow behind main button */}
                    <div className="absolute inset-0 bg-pink-500/30 blur-xl -z-10 rounded-full" />
                </div>

                <button
                    onClick={() => {
                        trackButtonClick('Pet Lab', 'lobby');
                        setActiveView('pet');
                    }}
                    className={cn(
                        "flex flex-col items-center gap-1 p-2 rounded-2xl transition-all w-20",
                        activeView === 'pet' ? "text-cyan-300 bg-white/5" : "text-slate-400 hover:text-white"
                    )}
                >
                    <Pickaxe className={cn("w-6 h-6", activeView === 'pet' && "fill-current")} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Pet Lab</span>
                </button>

            </div>
        </div>
    );
}
