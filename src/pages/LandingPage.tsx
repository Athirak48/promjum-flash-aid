import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
      <section className="relative pt-24 pb-12 px-4 md:pt-32 md:pb-20 md:px-6 min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Elements - Enhanced */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Main gradient orbs with richer colors */}
          <div className="absolute top-20 left-10 w-96 h-96 rounded-full blur-[140px] mix-blend-screen animate-pulse-slow" style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, rgba(168,85,247,0.1) 70%)' }} />
          <div className="absolute bottom-20 right-10 w-[28rem] h-[28rem] rounded-full blur-[140px] mix-blend-screen animate-pulse-slow" style={{ animationDelay: "2s", background: 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, rgba(59,130,246,0.15) 70%)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[120px] mix-blend-screen animate-float-random" style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.15) 0%, transparent 70%)' }} />

          {/* Additional accent orbs */}
          <div className="absolute top-40 right-1/4 w-64 h-64 bg-cyan-400/10 rounded-full blur-[100px] mix-blend-screen animate-pulse-slow" style={{ animationDelay: "1.5s" }} />

          {/* Enhanced Floating Stars/Particles */}
          <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-white rounded-full blur-[1px] animate-float opacity-80" />
          <div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-indigo-400 rounded-full blur-[2px] animate-float" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/4 right-1/3 w-2 h-2 bg-purple-300 rounded-full blur-[1px] animate-float opacity-60" style={{ animationDelay: "0.5s" }} />
          <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-pink-300 rounded-full blur-[1px] animate-float opacity-70" style={{ animationDelay: "1.8s" }} />
        </div>

        <div className="container mx-auto max-w-5xl relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6 md:space-y-8"
          >
            <div className="inline-block relative mt-4 md:mt-0">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight font-cute tracking-tight drop-shadow-2xl">
                <span className="inline-block animate-float" style={{ animationDelay: "0ms" }}>จำ</span>
                <span className="inline-block animate-float" style={{ animationDelay: "100ms" }}>คำ</span>
                <span className="inline-block animate-float" style={{ animationDelay: "200ms" }}>ศัพท์</span>
                <span className="inline-block animate-float" style={{ animationDelay: "300ms" }}>ใหม่</span>
              </h1>
              <div className="absolute -top-4 -right-4 md:-top-10 md:-right-10 text-2xl md:text-4xl animate-bounce">✨</div>
            </div>

            <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-purple-300 to-pink-300 transform -rotate-2 px-2 drop-shadow-[0_2px_10px_rgba(168,85,247,0.5)]">
              ไม่ลืมคำศัพท์เก่า
            </h2>

            <p className="text-balance text-lg md:text-2xl text-white/80 leading-relaxed max-w-3xl mx-auto font-light tracking-wide px-2 md:px-4">
              เลิกท่องจำแบบเดิมๆ... สนุกไปกับคำศัพท์ที่หลากหลาย และระบบที่จะให้คุณจำคำศัพท์ได้เหมือนกับคนเก่า
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center pt-4 md:pt-8 w-full px-4"
            >
              <div className="relative group w-full sm:w-auto">
                {/* Enhanced multi-layer glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 rounded-xl md:rounded-2xl blur-md opacity-75 group-hover:opacity-100 transition duration-500 animate-tilt"></div>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-xl md:rounded-2xl blur-sm opacity-50 group-hover:opacity-75 transition duration-500"></div>
                <Button
                  size="lg"
                  className="relative flex items-center justify-center gap-3 bg-gradient-to-r from-[#A855F7] via-[#EC4899] to-[#3B82F6] hover:from-[#9333EA] hover:via-[#DB2777] hover:to-[#2563EB] text-white px-8 py-6 md:px-10 md:py-8 h-auto rounded-xl text-lg md:text-xl font-bold border border-white/30 shadow-[0_0_25px_rgba(168,85,247,0.6),0_0_50px_rgba(236,72,153,0.3)] hover:shadow-[0_0_35px_rgba(168,85,247,0.8),0_0_70px_rgba(236,72,153,0.5)] transition-all duration-300 w-full sm:w-auto transform hover:-translate-y-1 hover:scale-[1.02] overflow-hidden"
                  asChild
                >
                  <Link to="/auth">
                    {/* Shimmer effect overlay */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <span className="text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] relative z-10">Start Learning Now</span>
                    <Rocket className="w-5 h-5 md:w-6 md:h-6 text-white animate-bounce relative z-10" />
                  </Link>
                </Button>
              </div>

              <Button
                variant="ghost"
                className="group/btn text-white/70 hover:text-white hover:bg-white/10 px-6 py-4 md:px-8 md:py-8 h-auto rounded-xl border border-white/10 hover:border-[#22D3EE]/40 transition-all w-full sm:w-auto text-base md:text-lg hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                asChild
              >
                <Link to="/decks">
                  <Gamepad2 className="w-5 h-5 md:w-6 md:h-6 mr-2 text-[#22D3EE] group-hover/btn:drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] transition-all" />
                  <span className="group-hover/btn:text-white transition-colors">Explore Games</span>
                </Link>
              </Button>
            </motion.div>

            {/* Trust Badges - Enhanced Glassmorphism */}
            <div className="pt-4 md:pt-6 flex flex-row flex-nowrap justify-center gap-1.5 md:gap-8 text-[10px] md:text-sm font-medium text-white/50 uppercase tracking-widest px-1 overflow-x-hidden">
              <span className="flex items-center justify-center px-3 py-2 md:px-5 md:py-2.5 border border-purple-400/20 rounded-full bg-white/8 backdrop-blur-md hover:bg-white/12 hover:border-purple-400/40 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all duration-300 cursor-default whitespace-nowrap group">
                <span className="group-hover:text-white/70 transition-colors">🎉 Free</span>
              </span>
              <span className="flex items-center justify-center px-3 py-2 md:px-5 md:py-2.5 border border-yellow-400/20 rounded-full bg-white/8 backdrop-blur-md hover:bg-white/12 hover:border-yellow-400/40 hover:shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all duration-300 cursor-default whitespace-nowrap group">
                <span className="group-hover:text-white/70 transition-colors">🏆 Leaderboard</span>
              </span>
              <span className="flex items-center justify-center px-3 py-2 md:px-5 md:py-2.5 border border-cyan-400/20 rounded-full bg-white/8 backdrop-blur-md hover:bg-white/12 hover:border-cyan-400/40 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all duration-300 cursor-default whitespace-nowrap group">
                <span className="group-hover:text-white/70 transition-colors">📱 Web-App</span>
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid - Glass Cards */}
      <section id="features" className="py-24 relative z-10">
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
              Features that make you <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent animate-pulse-glow">fluent</span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto font-light tracking-wide">
              Complete all your study skills in one <span className="text-white font-medium">Space Glass</span> environment.
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
                <div className="group relative h-full">
                  <div className={`absolute -inset-0.5 rounded-[2.1rem] opacity-30 group-hover:opacity-100 transition duration-500 blur ${feature.color}`}></div>
                  <Card className="glass-card relative h-full rounded-[2rem] border border-white/10 overflow-hidden bg-black/40 group-hover:bg-black/30 transition-colors">
                    {/* Inner Shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                    <CardContent className="p-8 flex flex-col h-full relative z-10">
                      <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300 border border-white/20 relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-white/20 blur-md" />
                        <div className="relative z-10">{feature.icon}</div>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3 tracking-wide group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/70 transition-all">{feature.title}</h3>
                      <p className="text-white/60 leading-relaxed font-light group-hover:text-white/80 transition-colors">{feature.desc}</p>

                      <div className="mt-auto pt-6 flex w-full">
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full ${feature.color} opacity-0 group-hover:opacity-100 transition-all duration-700 w-0 group-hover:w-full`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof - Holographic Container */}
      <section id="reviews" className="py-24 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16 text-white drop-shadow-lg">
            Loved by Real Learners <span className="text-accent drop-shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-pulse">❤️</span>
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
                <div className="glass-card p-8 rounded-[2rem] h-full relative group border border-white/10 hover:border-white/30 transition-all bg-white/5">
                  <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-100 transition-opacity">
                    <Zap className="w-12 h-12 text-yellow-400 rotate-12" />
                  </div>

                  <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className="text-4xl bg-black/30 p-4 rounded-full border border-white/10 shadow-inner">
                      {review.avatar}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{review.name}</h4>
                      <p className="text-sm text-white/50 uppercase tracking-wider font-semibold">{review.role}</p>
                    </div>
                  </div>
                  <div className="flex text-yellow-400 mb-4 gap-1 relative z-10">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current drop-shadow-[0_0_5px_rgba(250,204,21,0.6)]" />
                    ))}
                  </div>
                  <p className="text-white/80 leading-relaxed font-light italic relative z-10">"{review.content}"</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer - Floating Holographic Panel */}
      <section className="py-32 text-center px-6 relative overflow-visible mt-0">
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="glass-card rounded-[2rem] p-8 md:p-24 relative overflow-hidden border border-white/20 shadow-[0_0_100px_rgba(168,85,247,0.2)] bg-black/60 group">
            {/* Inner animated gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-xl"></div>
            <div className="absolute inset-0 bg-noise opacity-[0.05] mix-blend-overlay"></div>

            <div className="relative z-10 space-y-6 md:space-y-8">
              <h2 className="text-4xl md:text-7xl font-black text-white tracking-tight drop-shadow-2xl">
                Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">Launch?</span>
              </h2>
              <p className="text-lg md:text-2xl text-white/70 font-light max-w-2xl mx-auto leading-relaxed px-2">
                Join the galaxy's most beautiful language learning community today.
              </p>

              <div className="pt-6 md:pt-8 flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
                <Button
                  size="lg"
                  className="btn-space-glass px-8 py-6 md:px-12 md:py-8 h-auto text-lg md:text-xl rounded-2xl shadow-[0_20px_60px_rgba(168,85,247,0.4)] hover:shadow-[0_30px_80px_rgba(168,85,247,0.6)] w-full sm:w-auto overflow-hidden whitespace-nowrap"
                  asChild
                >
                  <Link to="/auth">Create Free Account 🚀</Link>
                </Button>
              </div>

              <div className="flex flex-col md:flex-row justify-center items-center gap-3 md:gap-8 pt-6 md:pt-12 text-xs md:text-sm text-white/50 font-medium uppercase tracking-widest px-4">
                <span className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/5 w-fit"><Star className="w-4 h-4 text-yellow-400" /> No credit card</span>
                <span className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/5 w-fit"><Globe className="w-4 h-4 text-cyan-400" /> Web & Mobile</span>
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

            <div className="text-white/30 text-xs">
              © 2024 Promjum. Made with <Heart className="w-3 h-3 inline mx-1 text-rose-500 animate-pulse" /> in Space.
            </div>

            <div className="flex items-center gap-8 text-xs text-white/40 font-bold tracking-widest uppercase">
              <a href="#" className="hover:text-white transition-colors relative group">
                Privacy
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-white transition-all group-hover:w-full"></span>
              </a>
              <a href="#" className="hover:text-white transition-colors relative group">
                Terms
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-white transition-all group-hover:w-full"></span>
              </a>
              <a href="#" className="hover:text-white transition-colors relative group">
                Contact
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-white transition-all group-hover:w-full"></span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;