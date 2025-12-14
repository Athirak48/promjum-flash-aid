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
  Palette,
  Laptop
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
      icon: <BookOpen className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      title: "Flashcards",
      desc: "เรียนรู้ผ่านบัตรคำศัพท์ที่มีภาพและเสียงประกอบ ช่วยให้จดจำได้ง่ายและแม่นยำ"
    },
    {
      icon: <Zap className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-br from-yellow-500 to-orange-500",
      title: "SRS System",
      desc: "ระบบจัดตารางทบทวนอัจฉริยะ ช่วยให้คุณจำศัพท์ใหม่ได้โดยไม่ลืมคำเก่า Magic! ✨"
    },
    {
      icon: <Layers className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-br from-orange-500 to-red-500",
      title: "Custom Decks",
      desc: "เลือกเรียนรู้เฉพาะหมวดหมู่ที่คุณสนใจ หรือสร้างชุดคำศัพท์ได้ด้วยตัวเอง"
    },
    {
      icon: <Headphones className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-br from-purple-500 to-pink-500",
      title: "Smart Practice",
      desc: "ฝึกฟัง-อ่านเรื่องราวที่แต่งขึ้นเฉพาะคุณ โดยรวมคำศัพท์ประจำวัน ผสมกับคำที่ยังจำไม่ได้และคำเก่าที่ไม่ได้ทวนนาน ให้คุณแม่นเป๊ะ! 🎧📖"
    },
    {
      icon: <Gamepad2 className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-br from-green-500 to-emerald-500",
      title: "Mini Games",
      desc: "สนุกกับการทบทวนคำศัพท์ผ่านเกมหลากหลายรูปแบบ ยิ่งเล่น ยิ่งจำได้ 🎮"
    },
    {
      icon: <MessageCircle className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-br from-pink-500 to-rose-500",
      title: "Vocab Challenge",
      desc: "ท้าทายความจำกับบททดสอบวัดระดับ ชิงความเป็นหนึ่งใน Leaderboard ประจำเดือน! 🏆"
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-background text-foreground font-prompt transition-colors duration-500">
      {/* Background Decorations - Theme Aware */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-secondary/30 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={promjumLogo} alt="Promjum" className="w-8 h-8" />
              <span className="font-bold text-xl text-primary">Promjum</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <Globe className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-semibold text-gray-700">
                  {language === 'th' ? 'TH' : 'EN'}
                </span>
              </button>

              {/* Theme Toggle */}
              {/* Theme Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 rounded-full hover:bg-gray-100 transition-colors border border-gray-200 outline-none focus:ring-2 focus:ring-primary/20">
                    <Palette className="w-5 h-5 text-gray-600" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Light</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("warm")}>
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Warm</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("christmas")}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    <span>Christmas</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    <Laptop className="mr-2 h-4 w-4" />
                    <span>System</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <a href="#features" className="text-muted-foreground hover:text-primary transition-colors font-medium">Features</a>
              <a href="#reviews" className="text-muted-foreground hover:text-primary transition-colors font-medium">Stories</a>
              <Link to="/auth" className="text-muted-foreground hover:text-primary transition-colors font-medium">Log In</Link>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 font-medium shadow-md hover:shadow-lg active:scale-95 transition-all font-cute" asChild>
                <Link to="/auth">
                  Sign Up
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-full shadow-sm"
              >
                <Rocket className="w-4 h-4 text-primary" />
                <span className="text-sm text-card-foreground">
                  Join <span className="text-primary font-bold">30,000+</span> happy students!
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative"
              >
                {/* Star decoration */}
                {/* Star decoration */}
                <Star className="w-12 h-12 text-accent fill-accent absolute -top-8 right-0 lg:right-20 z-0" />

                <h1 className="text-5xl md:text-6xl font-black text-foreground leading-tight font-cute mb-6 relative z-10">
                  จำคำศัพท์ใหม่
                </h1>
                <h1 className="text-5xl md:text-6xl font-black leading-tight font-cute relative z-10">
                  <span className="text-primary italic">ไม่ลืมคำศัพท์เก่า</span>
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-muted-foreground leading-relaxed max-w-lg font-cute"
              >
                เลิกท่องจำแบบไร้ทิศทาง... จำคำศัพท์ด้วย <span className="text-primary font-bold">Flashcard</span> มินิเกม จัดตารางทบทวนตามต้องการ พร้อมโหมดฝึกฟัง-อ่าน ที่จะเตรียมคุณให้พร้อมที่สุดสำหรับ <span className="text-accent font-bold">Global Vocab Challenge</span> สนามแข่งประจำเดือนที่วัดผลจริงกับคนทั่วโลก 🌍✨
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-4 pt-2"
              >
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-6 text-lg font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all font-cute"
                  asChild
                >
                  <Link to="/auth">
                    <Play className="w-5 h-5 mr-2 fill-current" />
                    Start Free
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full px-8 py-6 text-lg border-2 border-border hover:border-primary/50 bg-card hover:bg-muted text-foreground hover:-translate-y-1 active:scale-95 transition-all font-cute"
                  asChild
                >
                  <Link to="/decks">
                    <span className="mr-2">🍋</span>
                    Explore Decks
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-6 pt-4 text-sm"
              >
                <span className="flex items-center gap-2 text-gray-600">
                  <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </span>
                  Free Forever
                </span>
                <span className="flex items-center gap-2 text-gray-600">
                  <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <Gamepad2 className="w-4 h-4 text-blue-600" />
                  </span>
                  Gamified
                </span>
                <span className="flex items-center gap-2 text-gray-600">
                  <span className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-rose-600" />
                  </span>
                  Community
                </span>
              </motion.div>
            </div>

            {/* Right: Flashcard Preview */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative hidden lg:block"
            >
              {/* Streak Badge - Top Right with floating animation */}
              <motion.div
                className="absolute -top-6 right-0 z-20"
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="bg-card rounded-full shadow-lg pl-3 pr-5 py-2 flex items-center gap-3 border border-border">
                  <motion.div
                    className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center"
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <span className="text-xl">🔥</span>
                  </motion.div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Streak</p>
                    <p className="font-black text-lg text-primary">7 Days!</p>
                  </div>
                </div>
              </motion.div>

              {/* Main Flashcard Container with subtle float */}
              <motion.div
                className="glass-jelly rounded-[2.5rem] p-5"
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* Coral Header Card */}
                <div className="bg-primary rounded-2xl p-6 mb-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />

                  {/* Question indicator */}
                  <motion.div
                    className="text-center mb-3"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="bg-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full tracking-wider shadow-sm backdrop-blur-sm">
                      QUESTION 1/10
                    </span>
                  </motion.div>
                  {/* Main word with pulse */}
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3 className="text-4xl font-black text-primary-foreground mb-1">status</h3>
                    <p className="text-primary-foreground/90 text-sm font-medium">(ความสัมพันธ์กับคำศัพท์)</p>
                  </motion.div>
                </div>

                {/* Answer Options with staggered animations - CUTE DESIGN */}
                <div className="grid grid-cols-2 gap-4">
                  {/* คนคุย - Light Blue Theme */}
                  <motion.div
                    className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-3xl py-6 px-5 cursor-pointer border-2 border-blue-100 dark:border-blue-800 shadow-lg hover:shadow-xl flex flex-col items-center gap-3 group"
                    whileHover={{ scale: 1.08, y: -5, rotateZ: 1 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 rounded-2xl flex items-center justify-center shadow-md"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span className="text-4xl filter drop-shadow-md">💬</span>
                    </motion.div>
                    <span className="font-bold text-blue-700 dark:text-blue-300 text-lg group-hover:scale-105 transition-transform">คนคุย</span>
                    <span className="text-[10px] text-blue-500/70 dark:text-blue-400/70">เพิ่งเริ่มรู้จัก</span>
                  </motion.div>

                  {/* เพื่อนสนิท - Pink Theme */}
                  <motion.div
                    className="relative overflow-hidden bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/30 dark:to-rose-900/30 rounded-3xl py-6 px-5 cursor-pointer border-2 border-pink-100 dark:border-pink-800 shadow-lg hover:shadow-xl flex flex-col items-center gap-3 group"
                    whileHover={{ scale: 1.08, y: -5, rotateZ: -1 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.4 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-pink-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-800 dark:to-pink-700 rounded-2xl flex items-center justify-center shadow-md"
                      animate={{ y: [0, -6, 0], scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                    >
                      <span className="text-4xl filter drop-shadow-md">💕</span>
                    </motion.div>
                    <span className="font-bold text-pink-700 dark:text-pink-300 text-lg group-hover:scale-105 transition-transform">เพื่อนสนิท</span>
                    <span className="text-[10px] text-pink-500/70 dark:text-pink-400/70">จำได้บ้าง</span>
                  </motion.div>

                  {/* คนรู้ใจ - Red/Heart Theme */}
                  <motion.div
                    className="relative overflow-hidden bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 rounded-3xl py-6 px-5 cursor-pointer border-2 border-red-100 dark:border-red-800 shadow-lg hover:shadow-xl flex flex-col items-center gap-3 group"
                    whileHover={{ scale: 1.08, y: -5, rotateZ: 1 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.8 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-red-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-800 dark:to-red-700 rounded-2xl flex items-center justify-center shadow-md"
                      animate={{ scale: [1, 1.2, 1, 1.15, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    >
                      <span className="text-4xl filter drop-shadow-md">❤️</span>
                    </motion.div>
                    <span className="font-bold text-red-700 dark:text-red-300 text-lg group-hover:scale-105 transition-transform">คนรู้ใจ</span>
                    <span className="text-[10px] text-red-500/70 dark:text-red-400/70">จำได้แม่น</span>
                  </motion.div>

                  {/* คนรู้จัก - Amber/Gold Theme */}
                  <motion.div
                    className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-3xl py-6 px-5 cursor-pointer border-2 border-amber-100 dark:border-amber-800 shadow-lg hover:shadow-xl flex flex-col items-center gap-3 group"
                    whileHover={{ scale: 1.08, y: -5, rotateZ: -1 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1.2 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-800 dark:to-amber-700 rounded-2xl flex items-center justify-center shadow-md"
                      animate={{ rotate: [0, 8, -8, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    >
                      <span className="text-4xl filter drop-shadow-md">🤝</span>
                    </motion.div>
                    <span className="font-bold text-amber-700 dark:text-amber-300 text-lg group-hover:scale-105 transition-transform">คนรู้จัก</span>
                    <span className="text-[10px] text-amber-500/70 dark:text-amber-400/70">พอรู้จักกัน</span>
                  </motion.div>
                </div>
              </motion.div>

              {/* Mode Unlocked Badge - Bottom Left with floating */}
              <motion.div
                className="absolute -bottom-20 -left-8 z-20"
                animate={{
                  y: [0, -6, 0],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              >
                <div className="bg-card rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3 border border-border">
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center"
                    animate={{
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                    }}
                  >
                    <Headphones className="w-6 h-6 text-primary-foreground" />
                  </motion.div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Mode Unlocked</p>
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Badge className="bg-success/20 text-success text-[9px] px-1.5 py-0 font-semibold border-success/20">NEW</Badge>
                      </motion.div>
                    </div>
                    <p className="font-bold text-foreground">Listening</p>
                    <p className="text-xs text-muted-foreground">Train your ears! 🎧</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div >
      </section >

      {/* Feature Icons Row */}
      < section className="py-16 bg-card mt-8 border-t border-b border-border/50" >
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="grid grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 bg-secondary/30 rounded-[2rem] flex items-center justify-center mb-4 shadow-sm border border-secondary">
                <Headphones className="w-12 h-12 text-primary" />
              </div>
              <h3 className="font-bold text-foreground text-lg">Real Listening</h3>
              <p className="text-sm text-muted-foreground">Authentic audio only!</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 bg-accent/20 rounded-[2rem] flex items-center justify-center mb-4 shadow-sm border border-accent/20">
                <div className="relative">
                  <MapPin className="w-12 h-12 text-accent" />
                </div>
              </div>
              <h3 className="font-bold text-foreground text-lg">Smart Memory</h3>
              <p className="text-sm text-muted-foreground">Scientific repetition</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 bg-primary/20 rounded-[2rem] flex items-center justify-center mb-4 shadow-sm border border-primary/20">
                <Gamepad2 className="w-12 h-12 text-primary" />
              </div>
              <h3 className="font-bold text-foreground text-lg">Fun Games</h3>
              <p className="text-sm text-muted-foreground">Play to learn ✨</p>
            </motion.div>
          </div>
        </div>
      </section >

      {/* Features Grid */}
      < section id="features" className="py-20 bg-background" >
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">
              Features that make you{" "}
              <span className="text-primary">fluent</span>
            </h2>
            <p className="text-muted-foreground text-lg">Complete all your study skills in one happy place</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-border shadow-lg hover:shadow-xl transition-shadow bg-card rounded-3xl overflow-hidden h-full">
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-4 shadow-md`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-card-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section >

      {/* Social Proof */}
      < section id="reviews" className="py-20 bg-background/50" >
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-4 text-foreground">
            Loved by Real Learners{" "}
            <span className="text-primary">❤️</span>
          </h2>
          <p className="text-muted-foreground text-center mb-12">See what our community has to say</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-border shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 bg-card rounded-3xl h-full">
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <div className="text-4xl bg-secondary/50 p-3 rounded-2xl">
                      {review.avatar}
                    </div>
                    <div>
                      <CardTitle className="text-lg text-card-foreground">{review.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{review.role}</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex text-yellow-400 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-card-foreground/80 leading-relaxed">"{review.content}"</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section >

      {/* CTA Footer */}
      <section className="py-20 bg-primary text-primary-foreground text-center px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(135deg,rgba(255,255,255,0.1)_0%,rgba(0,0,0,0.1)_100%)] pointer-events-none" />
        <div className="container mx-auto max-w-4xl space-y-6 relative z-10">
          <h2 className="text-4xl md:text-5xl font-black">Ready to become fluent?</h2>
          <p className="text-xl text-primary-foreground/90">
            Join thousands of happy students mastering new languages today.
            <br />
            Start your adventure now! 🚀
          </p>
          <Button
            size="lg"
            className="bg-background text-primary hover:bg-muted font-bold text-lg px-10 py-6 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all mt-4 border border-border font-cute"
            asChild
          >
            <Link to="/auth">Create Free Account</Link>
          </Button>
          <div className="flex justify-center gap-8 pt-8 text-sm text-primary-foreground/90">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" /> No credit card
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-accent" /> Cancel anytime
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" /> Full access
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-card border-t border-border">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <img src={promjumLogo} alt="Promjum" className="w-6 h-6" />
              <span className="font-bold text-primary">Promjum</span>
              <span className="text-muted-foreground text-sm">© 2024 Promjum. Made with ❤️ for students.</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;