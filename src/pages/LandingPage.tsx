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
import { PreviewCardContent } from "@/components/landing/PreviewCardContent";

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
      desc: "ฝึกฟัง-อ่านเรื่องราวเฉพาะคุณ ผสมคำศัพท์ใหม่และคำที่ต้องทวน ให้คุณแม่นเป๊ะ! 🎧📖"
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

      {/* Hero Section */}
      <section className="relative pt-20 pb-8 px-6 h-screen flex items-center">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Left: Text Content */}
            <div className="space-y-6 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.2)]"
              >
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                <span className="text-sm font-medium text-white/90 tracking-wide">
                  Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent font-bold">30,000+</span> happy students!
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative"
              >
                {/* Floating Glow Elements */}
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none opacity-50" />

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-normal font-cute mb-4 relative z-10 drop-shadow-xl">
                  จำคำศัพท์ใหม่
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-accent animate-pulse-slow block mt-3 italic transform -rotate-1 origin-left">
                    ไม่ลืมคำศัพท์เก่า
                  </span>
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-base md:text-lg text-white/80 leading-loose max-w-lg font-light tracking-wide mt-2"
              >
                เลิกท่องจำแบบไร้ทิศทาง... จำคำศัพท์ด้วย <span className="text-white font-bold decoration-primary underline decoration-2 underline-offset-4 decoration-wavy">Flashcard</span> มินิเกม และ AI จัดตารางทบทวน พร้อม <span className="text-accent font-bold drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]">Global Vocab Challenge</span> สนามแข่งวัดผลจริงกับคนทั่วโลก 🌍✨
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-3 pt-2"
              >
                <Button
                  className="btn-space-glass text-base px-8 py-5 h-auto shadow-[0_0_30px_rgba(168,85,247,0.4)]"
                  asChild
                >
                  <Link to="/auth">
                    <Play className="w-4 h-4 mr-2 fill-white" />
                    Start Free Now
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="rounded-xl px-6 py-5 h-auto text-base border border-white/20 bg-white/5 hover:bg-white/10 text-white hover:text-white hover:border-white/40 backdrop-blur-md transition-all font-semibold"
                  asChild
                >
                  <Link to="/decks">
                    <span className="mr-2 text-xl">🚀</span>
                    Explore Decks
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-4 pt-3 text-sm font-medium border-t border-white/10 mt-4"
              >
                {["Free Forever", "Gamified", "Community"].map((item, i) => (
                  <span key={i} className="flex items-center gap-1.5 text-white/70">
                    <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                    {item}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Right: Glassmorphic Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              style={{ perspective: 1000 }}
              className="relative hidden lg:block scale-[0.7] origin-center -mt-8"
            >
              {/* Floating Badge */}
              <motion.div
                className="absolute -top-4 -right-4 z-30"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="glass-card border border-white/40 p-2.5 rounded-lg flex items-center gap-2.5 bg-black/40 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-400 to-red-500 flex items-center justify-center text-lg shadow-lg border border-white/30">
                    🔥
                  </div>
                  <div>
                    <div className="text-[9px] text-white/60 uppercase tracking-widest font-bold">Current Streak</div>
                    <div className="text-lg font-black text-white drop-shadow-md">7 Days!</div>
                  </div>
                </div>
              </motion.div>

              {/* Main App Preview Card - Mirror Glass Design */}
              <div className="glass-card-purple-teal rounded-[1.25rem] p-3 aspect-[4/3.5] relative flex flex-col items-center justify-center transform rotate-[-2deg] hover:rotate-0 transition-all duration-500 border border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                {/* Internal Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-[1.5rem]" />

                {/* Shiny Reflection Line */}
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-tr from-white/5 to-transparent opacity-50 pointer-events-none rounded-[1.5rem]" />

                {/* Card Content Mockup */}
                <div className="w-full h-full flex flex-col">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30" />
                    <div className="h-1.5 w-24 bg-white/20 rounded-full" />
                  </div>

                  {/* Question Card */}
                  <div className="flex-1 flex flex-col items-center justify-center glass-card border border-white/40 rounded-2xl p-4 mb-3 bg-gradient-to-br from-white/10 to-white/5 relative overflow-hidden group">
                    <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-white/5 rotate-45 group-hover:rotate-90 transition-all duration-1000 blur-3xl opacity-30" />

                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 mb-3 px-3 py-0.5 text-xs rounded-full backdrop-blur-md">Question 1/10</Badge>
                    <h2 className="text-3xl font-black text-white mb-1 drop-shadow-lg tracking-wide">status</h2>
                    <p className="text-white/70 text-sm font-light tracking-widest uppercase mb-4">(ความสัมพันธ์กับคำศัพท์)</p>

                    {/* Interactive Options Logic */}
                    <PreviewCardContent />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid - Glass Cards */}
      <section id="features" className="py-24 relative z-10">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-lg">
              Features that make you <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">fluent</span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto font-light">
              Complete all your study skills in one premium space
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="h-full"
              >
                <Card className={`glass-card group hover:bg-white/10 transition-all duration-500 border border-white/10 rounded-[2rem] h-full overflow-visible`}>
                  <CardContent className="p-8 flex flex-col h-full relative z-10">
                    <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)] group-hover:scale-110 transition-transform duration-300 border border-white/20`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3 tracking-wide group-hover:text-primary transition-colors">{feature.title}</h3>
                    <p className="text-white/60 leading-relaxed font-light">{feature.desc}</p>

                    {/* Hover Glow Effect */}
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full group-hover:bg-primary/30 transition-all opacity-0 group-hover:opacity-100" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof - Glass Container */}
      <section id="reviews" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16 text-white">
            Loved by Real Learners <span className="text-accent drop-shadow-[0_0_15px_rgba(244,63,94,0.6)]">❤️</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="glass-card-rose-violet p-8 rounded-[2rem] h-full relative group">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-4xl bg-white/5 p-4 rounded-3xl border border-white/10 shadow-inner">
                      {review.avatar}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">{review.name}</h4>
                      <p className="text-sm text-white/50 uppercase tracking-wider font-semibold">{review.role}</p>
                    </div>
                  </div>
                  <div className="flex text-yellow-400 mb-4 gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                    ))}
                  </div>
                  <p className="text-white/80 leading-relaxed font-light italic">"{review.content}"</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer - Holographic */}
      <section className="py-32 text-center px-6 relative overflow-hidden mt-12">
        {/* Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="glass-card max-w-5xl mx-auto rounded-[3rem] p-16 md:p-24 relative z-10 border border-white/20 shadow-[0_0_100px_rgba(168,85,247,0.15)] bg-black/40">
          <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay"></div>

          <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight drop-shadow-2xl">
            Ready to start?
          </h2>
          <p className="text-xl md:text-2xl text-white/70 mb-12 font-light max-w-2xl mx-auto leading-relaxed">
            Join thousands of students mastering languages in <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 font-bold">The Most Beautiful Space</span>
          </p>

          <Button
            size="lg"
            className="btn-space-glass px-12 py-8 h-auto text-xl rounded-2xl shadow-[0_20px_60px_rgba(168,85,247,0.4)]"
            asChild
          >
            <Link to="/auth">Create Free Account 🚀</Link>
          </Button>

          <div className="flex justify-center flex-wrap gap-8 pt-12 text-sm text-white/50 font-medium uppercase tracking-widest">
            <span className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/5"><Star className="w-4 h-4 text-yellow-400" /> No credit card</span>
            <span className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/5"><Globe className="w-4 h-4 text-cyan-400" /> Web & Mobile</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 bg-black/20 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
              <img src={promjumLogo} alt="Promjum" className="w-6 h-6 grayscale" />
              <span className="font-bold text-white text-sm">Promjum</span>
              <span className="text-white/40 text-xs ml-4">© 2024 Promjum. Made with ❤️ in Space.</span>
            </div>
            <div className="flex items-center gap-8 text-xs text-white/40 font-medium tracking-widest uppercase">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;