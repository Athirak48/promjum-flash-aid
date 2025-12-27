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
    return (
        <div className="relative h-full flex flex-col items-center justify-center p-4">
            {/* Header Stats */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center border-2 border-white/30">
                        <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">Rank #428</div>
                        <div className="text-sm font-black text-white">Space Cadet</div>
                    </div>
                </div>

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

            {/* FAB: Gacha Portal */}
            <motion.button
                onClick={() => {
                    trackButtonClick('Gacha Warp', 'lobby');
                    onNavigate('gacha');
                }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="absolute bottom-24 right-4 md:right-8 z-20 group"
            >
                <div className="relative flex flex-col items-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-full border-4 border-white/20 shadow-[0_0_30px_rgba(236,72,153,0.6)] flex items-center justify-center animate-pulse">
                        <Sparkles className="w-8 h-8 text-white animate-spin-slow" />
                    </div>
                    <span className="absolute -bottom-6 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded-full border border-pink-500/50 font-bold uppercase tracking-wider backdrop-blur-sm whitespace-nowrap">
                        Gacha Warp
                    </span>
                </div>
            </motion.button>
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
            {/* Sidebar List (Mobile: Top, Desktop: Left) */}
            <div className="h-32 md:h-full md:w-1/3 flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto pr-2 pb-2 scrollbar-none shrink-0">
                {MOCK_PETS_DEX.map(pet => (
                    <button
                        key={pet.id}
                        onClick={() => setSelectedPetId(pet.id)}
                        className={cn(
                            "min-w-[80px] md:w-full p-2 rounded-xl border flex flex-col md:flex-row items-center gap-2 transition-all",
                            selectedPetId === pet.id
                                ? "bg-white/20 border-white/40 shadow-lg"
                                : "bg-white/5 border-white/10 hover:bg-white/10"
                        )}
                    >
                        <div className={cn(
                            "w-12 h-12 rounded-lg flex items-center justify-center text-2xl border relative overflow-hidden",
                            pet.unlocked ? "bg-slate-800 border-white/20" : "bg-black/50 border-dashed border-white/10"
                        )}>
                            {/* Unlocked Rarity Border */}
                            {pet.unlocked && pet.rarity === 'legendary' && (
                                <div className="absolute inset-0 border-2 border-yellow-400 animate-pulse rounded-lg" />
                            )}
                            {pet.unlocked ? '👾' : <Lock className="w-4 h-4 text-white/30" />}
                        </div>
                        <div className="text-center md:text-left">
                            <div className={cn("text-xs font-bold truncate", pet.unlocked ? "text-white" : "text-white/40")}>
                                {pet.unlocked ? pet.name : '???'}
                            </div>
                            {pet.unlocked && (
                                <div className="text-[10px] text-cyan-300">Lv.{pet.level}</div>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {/* Inspector */}
            <div className="flex-1 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md p-6 flex flex-col items-center justify-between relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5" />

                {selectedPet?.unlocked ? (
                    <>
                        <div className="relative z-10 flex flex-col items-center">
                            <span className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest mb-4",
                                selectedPet.rarity === 'legendary' ? "bg-yellow-400 text-yellow-900" :
                                    selectedPet.rarity === 'epic' ? "bg-purple-500 text-white" :
                                        selectedPet.rarity === 'rare' ? "bg-blue-500 text-white" :
                                            "bg-slate-500 text-white"
                            )}>
                                {selectedPet.rarity}
                            </span>

                            <div className="w-48 h-48 md:w-64 md:h-64 flex items-center justify-center animate-float">
                                <img
                                    src={`https://api.dicebear.com/7.x/bottts/svg?seed=${selectedPet.name}`}
                                    alt={selectedPet.name}
                                    className="w-full h-full object-contain drop-shadow-2xl"
                                />
                            </div>

                            <h2 className="text-3xl font-black text-white mt-6">{selectedPet.name}</h2>
                            <p className="text-white/50 text-sm">Type: {selectedPet.type}</p>

                            {/* Stats */}
                            <div className="w-full max-w-xs space-y-2 mt-6">
                                <div className="flex justify-between text-xs text-white/70">
                                    <span>Power</span>
                                    <span>150</span>
                                </div>
                                <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                                    <div className="h-full w-[60%] bg-pink-500 rounded-full" />
                                </div>
                                <div className="flex justify-between text-xs text-white/70">
                                    <span>Speed</span>
                                    <span>90</span>
                                </div>
                                <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                                    <div className="h-full w-[40%] bg-cyan-500 rounded-full" />
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 flex gap-3 w-full max-w-xs mt-6">
                            <Button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white border-0 font-bold">
                                <Pizza className="w-4 h-4 mr-2" /> Feed
                            </Button>
                            <Button variant="outline" className="flex-1 border-green-500/50 text-green-400 bg-green-500/10 hover:bg-green-500/20 font-bold">
                                Equip
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-white/40 gap-4">
                        <Lock className="w-16 h-16 opacity-50" />
                        <p className="text-center font-bold">
                            LOCKED <br />
                            <span className="text-xs font-normal">Find in Gacha to unlock</span>
                        </p>
                        <Button variant="ghost" className="text-pink-400 hover:text-pink-300 hover:bg-transparent">
                            Go to Gacha <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
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
