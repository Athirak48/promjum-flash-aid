import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
    Star,
    BookOpen,
    Gamepad2,
    Zap,
    Layers,
    Headphones,
    MessageCircle,
    CheckCircle2,
    Sparkles,
    Heart,
    Play,
    Moon,
    Sun,
    Globe,
    MapPin,
    ArrowRight,
    Rocket,
    GalleryVerticalEnd,
    Palette,
    Laptop,
    Cat,
    PawPrint,
    Egg,
    Crown
} from "lucide-react";
import { Link } from "react-router-dom";
import promjumLogo from "@/assets/promjum-logo.png";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


// Define Space Glass Theme Colors for manual overrides only where tailwind classes aren't enough
const SpaceColors = {
    primary: "#a855f7", // Purple
    secondary: "#14b8a6", // Teal
    accent: "#f43f5e", // Rose
};

const LandingPage = () => {
    const { theme, setTheme } = useTheme();
    const { language, setLanguage } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(language === 'th' ? 'en' : 'th');
    };

    const reviews = [
        {
            name: "มายด์",
            role: "นักศึกษา",
            content: "ฝึก 10 วัน พูดได้คล่องขึ้นจริง ระบบ AI แนะนำตรงจุดมาก รู้สึกว่าภาษาไม่ยากอีกต่อไป",
            rating: 5,
            avatar: "👩‍🎓"
        },
        {
            name: "ป้อม",
            role: "พนักงานออฟฟิศ",
            content: "ระบบให้คำแนะนำตรงจุด เหมือนครูส่วนตัวเลย ชอบมาก! เรียนทุกวันไม่เบื่อ",
            rating: 5,
            avatar: "👨‍💻"
        },
        {
            name: "พี่นัท",
            role: "ฟรีแลนซ์",
            content: "พูดกับลูกค้าต่างชาติได้มั่นใจขึ้นเยอะ แนะนำเลยครับ ดีเกินคาด",
            rating: 5,
            avatar: "🎨"
        }
    ];

    const features = [
        {
            icon: <Zap className="w-6 h-6 text-white" />,
            color: "bg-gradient-to-br from-purple-500 to-indigo-600",
            title: "Smart SRS System",
            desc: "ระบบทบทวนอัจฉริยะ คำนวณเวลาลืมและเตือนทันที จำศัพท์ใหม่โดยไม่ลืมคำเก่า Magic! ✨"
        },
        {
            icon: <BookOpen className="w-6 h-6 text-white" />,
            color: "bg-gradient-to-br from-orange-500 to-red-500",
            title: "Focus Mode",
            desc: "กำหนดเป้าหมายเวลาที่ต้องการ ระบบจัดแผนการเรียนและแจ้งเตือนอัตโนมัติ พร้อมบททดสอบให้ฝึกได้ง่ายๆ"
        },
        {
            icon: <Gamepad2 className="w-6 h-6 text-white" />,
            color: "bg-gradient-to-br from-green-500 to-emerald-500",
            title: "Game & Multiplayer",
            desc: "ท่องศัพท์ให้สนุก ท้าเพื่อนในโหมด Battle หรือไต่ Tower ชิงรางวัล 🎮"
        },
        {
            icon: <Layers className="w-6 h-6 text-white" />,
            color: "bg-gradient-to-br from-blue-500 to-cyan-500",
            title: "Community Decks",
            desc: "คลังศัพท์สอบ TGAT, A-Level, IELTS และศัพท์ชีวิตประจำวันจากเพื่อนๆ และติวเตอร์ทั่วประเทศ"
        },
        {
            icon: <MessageCircle className="w-6 h-6 text-white" />,
            color: "bg-gradient-to-br from-pink-500 to-rose-500",
            title: "Vocab Challenge",
            desc: "แข่งขันวัดระดับความรู้ประจำเดือน ชิงที่หนึ่งใน Leaderboard ระดับประเทศ 🏆"
        },
        {
            icon: <GalleryVerticalEnd className="w-6 h-6 text-white" />,
            color: "bg-gradient-to-br from-indigo-500 to-purple-500",
            title: "Smart Learning",
            desc: "โหมดฝึกฝนหลากหลายทั้ง Flashcard, Matching และ Listening ครบทุกทักษะในที่เดียว"
        }
    ];

    return (
        <div className="min-h-screen relative overflow-hidden bg-transparent text-foreground font-prompt selection:bg-primary/30">


            {/* Navigation - Glassmorphism */}
            <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md bg-background/20 border-b border-white/10">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="p-1.5 bg-white/95 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.3)] backdrop-blur-md border border-white/50 group-hover:bg-white transition-all">
                                <img src={promjumLogo} alt="Promjum" className="w-8 h-8 object-contain" />
                            </div>
                            <span className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-white tracking-wide font-cute drop-shadow">
                                Promjum
                            </span>
                        </Link>

                        <div className="hidden md:flex items-center gap-6">
                            {/* Language Toggle */}
                            <button
                                onClick={toggleLanguage}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors border border-white/20 hover:border-white/40"
                            >
                                <Globe className="w-4 h-4 text-white/80" />
                                <span className="text-sm font-semibold text-white/90">
                                    {language === 'th' ? 'TH' : 'EN'}
                                </span>
                            </button>

                            {/* Theme Toggle */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="p-2 rounded-full hover:bg-white/10 transition-colors border border-white/20 hover:border-white/40 outline-none focus:ring-2 focus:ring-primary/50">
                                        <Palette className="w-5 h-5 text-white/80" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="glass-card border border-white/20 bg-black/60 backdrop-blur-xl text-white">
                                    <DropdownMenuItem onClick={() => setTheme("dark")} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                                        <Moon className="mr-2 h-4 w-4 text-purple-400" />
                                        <span>Space Mode</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <a href="#features" className="text-white/70 hover:text-white transition-colors font-medium text-sm tracking-wide">Features</a>
                            <a href="#reviews" className="text-white/70 hover:text-white transition-colors font-medium text-sm tracking-wide">Stories</a>
                            <Link to="/auth" className="text-white/90 hover:text-white transition-colors font-bold text-sm tracking-wide">Log In</Link>

                            <Button
                                className="btn-space-glass px-6 py-2 h-auto text-sm"
                                asChild
                            >
                                <Link to="/auth">
                                    Sign Up
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section - Cosmic Playground Split Layout 🌌 */}
            <section className="relative pt-16 pb-12 px-4 md:pt-20 md:pb-24 overflow-hidden min-h-[90vh] flex items-start">
                {/* Background Elements */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-b from-purple-500/10 to-transparent rounded-full blur-[120px] mix-blend-screen" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-t from-blue-500/10 to-transparent rounded-full blur-[100px] mix-blend-screen" />
                </div>

                <div className="container mx-auto px-6 max-w-7xl relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center -mt-8 md:-mt-12">
                        {/* LEFT COLUMN: Typography & Action */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="text-left space-y-8"
                        >
                            {/* Chip */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-white/20 bg-white/5 animate-float" style={{ animationDuration: '4s' }}>
                                <Sparkles className="w-4 h-4 text-yellow-400" />
                                <span className="text-sm font-medium text-white/90">#1 Vocab App for Gen Z</span>
                            </div>

                            <div className="space-y-4 md:space-y-6">
                                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.4] md:leading-[1.6] font-cute tracking-tight drop-shadow-2xl">
                                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-white py-2 md:py-4 -my-2">จำคำศัพท์</span>
                                    <span className="block text-shimmer py-2 md:py-4 -my-2">แบบเร่งด่วน</span>
                                </h1>
                                <div className="h-2 w-24 md:w-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mt-4" />
                            </div>

                            <p className="text-lg md:text-2xl text-white/70 font-light max-w-xl leading-relaxed">
                                เลิกท่องจำแบบเดิมๆ... มาสนุกกับ <span className="text-white font-semibold">Smart SRS</span> และเกมสุดมันส์ที่จะทำให้คุณเก่งอังกฤษแบบไม่รู้ตัว 🚀
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 pt-4 md:pt-6">
                                <Button
                                    size="lg"
                                    className="relative group overflow-hidden px-6 py-5 md:px-10 md:py-8 text-lg md:text-2xl h-auto rounded-[1.5rem] md:rounded-[2rem] w-full sm:w-auto hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_30px_rgba(168,85,247,0.4)] md:shadow-[0_0_50px_rgba(168,85,247,0.5)] hover:shadow-[0_0_80px_rgba(168,85,247,0.7)] bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 border border-white/20"
                                    asChild
                                >
                                    <Link to="/auth" className="flex items-center justify-center">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                        <span className="relative z-10 flex items-center font-bold text-white tracking-wide">
                                            เริ่มจำศัพท์กันเลย!
                                            <Zap className="w-5 h-5 md:w-8 md:h-8 ml-2 md:ml-3 fill-yellow-400 text-yellow-400 animate-pulse drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
                                        </span>
                                    </Link>
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="px-6 py-5 md:px-8 md:py-8 text-lg md:text-xl h-auto rounded-[1.5rem] md:rounded-[2rem] w-full sm:w-auto text-white/90 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 transition-all backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
                                    asChild
                                >
                                    <a href="#features" className="flex items-center justify-center">
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center mr-3 md:mr-4 border border-white/20 group-hover:bg-white/20 transition-colors">
                                            <Play className="w-4 h-4 md:w-5 md:h-5 fill-white text-white translate-x-0.5" />
                                        </div>
                                        ดูตัวอย่าง
                                    </a>
                                </Button>
                            </div>


                        </motion.div>

                        {/* RIGHT COLUMN: 3D Composition */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="relative h-[600px] w-full flex items-center justify-center perspective-1000"
                        >
                            {/* Main Planet/Core */}
                            <div className="absolute w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 shadow-[0_0_100px_rgba(124,58,237,0.5)] animate-pulse-glow z-10 flex items-center justify-center border-4 border-white/10 backdrop-blur-3xl">
                                <div className="text-8xl animate-bounce">🧠</div>
                            </div>

                            {/* Orbiting Elements */}
                            {/* 1. Fun Mode (Bottom Right - Pushed Up) */}
                            <motion.div
                                animate={{ y: [-15, 15, -15], rotate: [0, 5, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute bottom-40 -right-2 md:bottom-32 md:-right-32 p-4 md:p-6 glass-card-teal rounded-[1.5rem] md:rounded-[2rem] z-20"
                            >
                                <Gamepad2 className="w-8 h-8 md:w-12 md:h-12 text-teal-400 mb-2" />
                                <div className="text-white font-bold text-sm md:text-lg">Fun Mode</div>
                                <div className="text-white/50 text-[10px] md:text-xs">Play & Learn</div>
                            </motion.div>

                            {/* 2. Smart SRS (Bottom Left) */}
                            <motion.div
                                animate={{ y: [20, -20, 20], rotate: [0, -5, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="absolute -bottom-24 -left-2 md:-bottom-10 md:-left-32 p-4 md:p-6 glass-card-rose-violet rounded-[1.5rem] md:rounded-[2rem] z-20"
                            >
                                <Layers className="w-8 h-8 md:w-12 md:h-12 text-rose-400 mb-2" />
                                <div className="text-white font-bold text-sm md:text-lg">Smart SRS</div>
                                <div className="text-white/50 text-[10px] md:text-xs">No Forgetting</div>
                            </motion.div>

                            {/* 3. Community Badge (Far Right Center - Background) */}
                            <motion.div
                                animate={{ x: [-10, 10, -10], y: [-10, 10, -10] }}
                                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                className="absolute top-1/2 -right-10 md:-right-48 transform -translate-y-1/2 p-3 md:p-4 glass-card rounded-2xl z-0 blur-[2px] opacity-60 scale-75"
                            >
                                <Globe className="w-8 h-8 md:w-10 md:h-10 text-blue-400" />
                            </motion.div>

                            {/* 4. Pet System (Top Left) */}
                            <motion.div
                                animate={{ y: [-20, 20, -20], rotate: [0, -10, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                                className="absolute top-0 -left-2 md:-left-24 p-4 md:p-5 glass-card-cyan-rose rounded-[1.5rem] md:rounded-[2rem] z-20"
                            >
                                <Cat className="w-8 h-8 md:w-10 md:h-10 text-pink-400 mb-2" />
                                <div className="text-white font-bold text-xs md:text-sm">My Pet</div>
                            </motion.div>

                            {/* 5. Focus Mode (Top Right) */}
                            <motion.div
                                animate={{ y: [15, -15, 15], rotate: [0, 5, 0] }}
                                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                                className="absolute top-12 -right-2 md:top-10 md:-right-20 p-4 md:p-5 glass-card-teal rounded-[1.5rem] md:rounded-[2rem] z-20"
                            >
                                <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-teal-300 mb-2" />
                                <div className="text-white font-bold text-xs md:text-sm">Focus</div>
                                <div className="text-white/50 text-[10px] md:text-xs">Goal & Plan</div>
                            </motion.div>

                            {/* Orbit Rings */}
                            <div className="absolute inset-0 border border-white/5 rounded-full rotate-[60deg] scale-150 pointer-events-none" />
                            <div className="absolute inset-0 border border-white/5 rounded-full -rotate-[30deg] scale-125 pointer-events-none" />

                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section - Cosmic Bento Grid 🍱✨ */}
            <section id="features" className="py-32 relative z-10 bg-gradient-to-b from-[#0B0F17] to-transparent">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-12 md:mb-24 space-y-4 md:space-y-6">
                        <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] whitespace-nowrap">
                            ฟีเจอร์เด็ด <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 animate-pulse-glow">มัดรวม</span> มาให้แล้ว
                        </h2>
                        <p className="text-white/60 text-xl font-light tracking-wide">
                            ครบจบในที่เดียว ทั้งเรียน เล่น และแข่งขัน
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[minmax(250px,auto)]">
                        {/* 1. Smart SRS (Large, Top Left) - 2x2 */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="md:col-span-2 md:row-span-2 group"
                        >
                            <div className="glass-card-purple-teal h-full rounded-[2.5rem] p-10 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-purple-900/20 to-black/40 hover:scale-[1.02] transition-transform duration-500">
                                <div className="absolute top-0 right-0 p-32 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

                                <div className="space-y-4 relative z-10">
                                    <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                                        <Zap className="w-8 h-8 text-purple-300" />
                                    </div>
                                    <h3 className="text-4xl font-bold text-white leading-tight">Smart SRS <br /><span className="text-purple-300">System</span></h3>
                                    <p className="text-lg text-white/60 leading-relaxed font-light">
                                        ระบบทบทวนอัจฉริยะที่จะคำนวณช่วงเวลาที่คุณ "กำลังจะลืม" แล้วเตือนให้ทบทวนทันที ทำให้จำได้แม่นขึ้น 300% 🧠⚡
                                    </p>
                                </div>

                                <div className="mt-8 relative h-32 w-full bg-white/5 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
                                    <p className="text-white/30 text-sm italic">Interactive Graph Visualization Coming Soon...</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* 2. Games (Wide, Top Right) - 2x1 */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="md:col-span-2 group"
                        >
                            <div className="glass-card-teal h-full rounded-[2.5rem] p-8 flex items-center gap-8 relative overflow-hidden bg-gradient-to-r from-teal-900/20 to-emerald-900/20 hover:scale-[1.02] transition-transform duration-500">
                                <div className="flex-1 space-y-3 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <Gamepad2 className="w-8 h-8 text-emerald-400" />
                                        <h3 className="text-3xl font-bold text-white">Minigames</h3>
                                    </div>
                                    <p className="text-white/70 font-light">
                                        ท่องศัพท์เบื่อแล้ว? มาเล่นเกมกัน! ท้าเพื่อนในโหมด Battle หรือไต่หอคอย Tower Defense 🎮🔥
                                    </p>
                                </div>
                                <div className="hidden md:block text-8xl opacity-20 rotate-12 group-hover:rotate-0 transition-transform duration-700">👾</div>
                            </div>
                        </motion.div>

                        {/* 3. Focus Mode (1x1) */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="md:col-span-1 group"
                        >
                            <div className="glass-card h-full rounded-[2.5rem] p-8 flex flex-col justify-center text-center items-center relative overflow-hidden hover:bg-white/10 hover:scale-[1.02] transition-all">
                                <div className="w-14 h-14 rounded-full bg-orange-500/20 flex items-center justify-center mb-6 animate-pulse-slow">
                                    <BookOpen className="w-7 h-7 text-orange-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Focus Mode</h3>
                                <p className="text-sm text-white/50">ตั้งเป้าหมาย แล้วลุยให้จบ!</p>
                            </div>
                        </motion.div>

                        {/* 4. Community (1x1) */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="md:col-span-1 group"
                        >
                            <div className="glass-card h-full rounded-[2.5rem] p-8 flex flex-col justify-center text-center items-center relative overflow-hidden hover:bg-white/10 hover:scale-[1.02] transition-all">
                                <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center mb-6">
                                    <Globe className="w-7 h-7 text-blue-400 animate-spin-slow" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Community</h3>
                                <p className="text-sm text-white/50">โหลดศัพท์ฟรีจากเพื่อนๆ ทั่วไทย</p>
                            </div>
                        </motion.div>

                        {/* 5. Pet System - New Feature 🐾 */}
                        <motion.div
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            initial={{ opacity: 0, y: 20 }}
                            className="col-span-1 md:col-span-2 glass-card-cyan-rose p-8 rounded-3xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 min-h-[220px] flex flex-col justify-between"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Cat className="w-32 h-32 md:w-40 md:h-40 rotate-12" />
                            </div>

                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4 backdrop-blur-md border border-white/20">
                                    <PawPrint className="w-6 h-6 text-pink-300" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Pet Companions</h3>
                                <p className="text-white/60 mb-4 leading-relaxed max-w-md">
                                    เลี้ยงน้องจากไข่ไปจนร่างเทพ! ยิ่งจำศัพท์ได้เยอะ น้องยิ่งโตไว แถมมีสกิลช่วยบูสต์ XP และหยุดเวลาตอนตอบผิดได้ด้วย 🥚🐉✨
                                </p>
                                <div className="flex items-center gap-3 pt-2">
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm">
                                        <Egg className="w-5 h-5 text-yellow-300" />
                                        <ArrowRight className="w-4 h-4 text-white/30" />
                                        <Cat className="w-5 h-5 text-pink-300" />
                                        <ArrowRight className="w-4 h-4 text-white/30" />
                                        <Crown className="w-5 h-5 text-amber-400 animate-pulse" />
                                    </div>
                                    <span className="text-xs text-white/60 pl-2">Evolution System</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* 6. Mobile & Web (Wide Lower) - 2x1 */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className="md:col-span-2 group"
                        >
                            <div className="glass-card h-full rounded-[2.5rem] p-8 flex items-center justify-between relative overflow-hidden bg-gradient-to-r from-pink-900/20 to-rose-900/20 hover:scale-[1.02] transition-transform duration-500">
                                <div className="space-y-3 z-10">
                                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                        <Laptop className="w-6 h-6 text-pink-400" />
                                        Anywhere, Anytime
                                    </h3>
                                    <p className="text-white/60 text-sm">เรียนได้ทั้งบนคอมและมือถือ ข้อมูลซิงค์กัน 100%</p>
                                </div>
                                <div className="flex gap-2 opacity-50">
                                    <div className="w-12 h-20 border-2 border-white/20 rounded-xl bg-black/40 backdrop-blur-sm" />
                                    <div className="w-24 h-20 border-2 border-white/20 rounded-xl bg-black/40 backdrop-blur-sm mt-8" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Social Proof - Holographic Floating Reviews 💬🛸 */}
            <section id="reviews" className="py-24 relative overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

                <div className="container mx-auto px-6 max-w-7xl relative z-10">
                    <h2 className="text-4xl md:text-5xl font-black text-center mb-16 text-white drop-shadow-lg">
                        จากใจคนใช้งานจริง <span className="text-accent drop-shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-pulse">❤️</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {reviews.map((review, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                                className={`relative group ${index === 1 ? 'md:-mt-12' : ''}`} // Staggered layout
                            >
                                {/* Chat Bubble Tail */}
                                <div className={`absolute -bottom-2 left-8 w-6 h-6 rotate-45 border-b border-r border-white/20 bg-[#0B0F17] z-0 transition-colors group-hover:bg-white/5`}></div>

                                <div className="glass-card p-8 rounded-[2rem] rounded-bl-sm h-full relative z-10 border border-white/20 bg-black/40 hover:bg-black/60 transition-all hover:scale-[1.03] duration-300">
                                    <div className="absolute top-4 right-4 text-4xl opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 transform rotate-12">
                                        ❝
                                    </div>

                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/20 flex items-center justify-center text-2xl shadow-inner backdrop-blur-md">
                                            {review.avatar}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{review.name}</h4>
                                            <Badge variant="secondary" className="bg-white/10 text-white/70 hover:bg-white/20 border-0 text-[10px] uppercase tracking-wider h-5">
                                                {review.role}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <div className="flex text-yellow-500 gap-0.5 mb-2 text-sm">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="w-3.5 h-3.5 fill-current" />
                                            ))}
                                        </div>
                                        <p className="text-white/90 leading-relaxed font-light text-lg">"{review.content}"</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Footer - Floating Holographic Panel 🚀 */}
            <section className="py-24 md:py-32 text-center px-4 md:px-6 relative overflow-visible mt-0">
                <div className="container mx-auto max-w-5xl relative z-10">
                    <div className="glass-card rounded-[2rem] md:rounded-[3rem] p-8 md:p-24 relative overflow-hidden border border-white/20 shadow-[0_0_100px_rgba(168,85,247,0.2)] bg-black/60 group">
                        {/* Inner animated gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-xl"></div>
                        <div className="absolute inset-0 bg-noise opacity-[0.05] mix-blend-overlay"></div>

                        <div className="relative z-10 space-y-6 md:space-y-8">
                            <h2 className="text-4xl md:text-7xl font-black text-white tracking-tight drop-shadow-2xl">
                                Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">Launch?</span>
                            </h2>
                            <p className="text-lg md:text-2xl text-white/70 font-light max-w-2xl mx-auto leading-relaxed px-2">
                                เข้าร่วมจักรวาลการเรียนรู้ที่สวยและสนุกที่สุดได้แล้ววันนี้
                            </p>

                            <div className="pt-6 md:pt-8 flex flex-col sm:flex-row gap-6 justify-center items-center px-2 md:px-4">
                                <Button
                                    size="lg"
                                    className="btn-space-glass px-8 py-5 md:px-12 md:py-8 h-auto text-lg md:text-xl rounded-2xl shadow-[0_20px_60px_rgba(168,85,247,0.4)] hover:shadow-[0_30px_80px_rgba(168,85,247,0.6)] w-full sm:w-auto overflow-hidden whitespace-nowrap transform hover:scale-105 transition-transform duration-300"
                                    asChild
                                >
                                    <Link to="/auth">
                                        <Rocket className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 animate-pulse" />
                                        สร้างบัญชีฟรี!
                                    </Link>
                                </Button>
                            </div>

                            <div className="flex flex-col md:flex-row justify-center items-center gap-3 md:gap-4 pt-4 md:pt-8 text-xs md:text-sm text-white/50 font-medium uppercase tracking-widest">
                                <span className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-white/5 bg-white/5"><Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-400" /> ไม่ต้องใช้บัตรเครดิต</span>
                                <span className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-white/5 bg-white/5"><Globe className="w-3 h-3 md:w-4 md:h-4 text-cyan-400" /> ใช้งานได้ทุกที่</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 bg-black/40 backdrop-blur-md relative z-10">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-3 opacity-70 hover:opacity-100 transition-opacity">
                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md border border-white/10">
                                <img src={promjumLogo} alt="Promjum" className="w-6 h-6 grayscale brightness-200" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-white text-sm tracking-wide">Promjum</span>
                                <span className="text-white/40 text-[10px] uppercase tracking-widest">Language Universe</span>
                            </div>
                        </div>

                        <div className="text-white/30 text-xs flex items-center gap-2">
                            Made with <Heart className="w-3 h-3 text-rose-500 animate-pulse" /> for Thai Students
                        </div>

                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-all"
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            >
                                <ArrowRight className="w-5 h-5 -rotate-90" />
                            </Button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;