import { useDecks } from '@/hooks/useDecks';
import { DeckCard } from '@/components/DeckCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, MessageSquare, Sparkles, TrendingUp, Star, Zap, GraduationCap, Users, PlayCircle, Clock, Rocket, Crown } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DecksPage() {
  const { decks, loading } = useDecks();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  // "view" param now controls "vocab" vs "course" tab
  // Default to 'vocab'
  const activeTab = searchParams.get('type') || 'vocab';

  const handleTabChange = (value: string) => {
    setSearchParams({ type: value });
  };

  // Mock Data for Courses - Enhanced Colors
  const mockCourses = [
    {
      id: 1,
      title: "IELTS 7.0+ Intensive",
      instructor: "Kru Whan",
      rating: 4.9,
      students: 12500,
      price: "฿3,990",
      image: "👩‍🏫",
      color: "from-blue-600 to-cyan-400",
      glow: "shadow-cyan-500/50",
      duration: "20 Hrs",
      level: "Advanced",
      tags: ["Exam", "Speaking"]
    },
    {
      id: 2,
      title: "Business English Pro",
      instructor: "Teacher Greg",
      rating: 4.8,
      students: 8400,
      price: "฿2,590",
      image: "👨‍💼",
      color: "from-slate-600 to-indigo-400",
      glow: "shadow-indigo-500/50",
      duration: "15 Hrs",
      level: "Intermediate",
      tags: ["Work", "Email"]
    },
    {
      id: 3,
      title: "Korean for Beginners",
      instructor: "Oppa Kim",
      rating: 5.0,
      students: 5600,
      price: "฿1,990",
      image: "🇰🇷",
      color: "from-rose-500 to-pink-400",
      glow: "shadow-pink-500/50",
      duration: "10 Hrs",
      level: "Beginner",
      tags: ["Lifestyle", "Travel"]
    },
    {
      id: 4,
      title: "TOEIC 990 Speedrun",
      instructor: "Dr. English",
      rating: 4.7,
      students: 22000,
      price: "฿1,290",
      image: "⚡",
      color: "from-amber-400 to-orange-500",
      glow: "shadow-orange-500/50",
      duration: "8 Hrs",
      level: "All Levels",
      tags: ["Trick", "Fast"]
    }
  ];

  const filteredDecks = useMemo(() => {
    let result = decks;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(deck =>
        deck.name.toLowerCase().includes(search) ||
        deck.name_en.toLowerCase().includes(search) ||
        deck.description.toLowerCase().includes(search)
      );
    }

    return result;
  }, [decks, searchTerm]);

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-prompt">

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-7xl mx-auto">

          {/* Header Section - Space Glass Style */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-16 text-center"
          >
            <div className="inline-block relative">
              <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full pointer-events-none" />
              <h1 className="relative text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50 drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] mb-4 font-cute">
                Shop
                <span className="absolute -top-4 -right-12 text-4xl animate-bounce delay-700">🛒</span>
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto font-light leading-relaxed">
              อัพเกรดสกิลภาษาของคุณด้วย <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-bold">คอร์สระดับเทพ</span> และ <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-bold">คลังศัพท์คุณภาพ</span>
            </p>
          </motion.div>

          {/* Tabs Control - Holographic Pill */}
          <div className="flex justify-center mb-16 sticky top-20 z-40">
            <div className="glass-card p-1.5 rounded-full flex gap-1 shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/20 backdrop-blur-xl bg-black/40">
              <button
                onClick={() => handleTabChange('vocab')}
                className={`relative px-8 py-3 rounded-full text-lg font-bold transition-all duration-300 flex items-center gap-2 overflow-hidden ${activeTab === 'vocab'
                  ? 'text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                  }`}
              >
                {activeTab === 'vocab' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full -z-10"
                  />
                )}
                <BookOpen className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Vocab Deck</span>
              </button>

              <button
                onClick={() => handleTabChange('course')}
                className={`relative px-8 py-3 rounded-full text-lg font-bold transition-all duration-300 flex items-center gap-2 overflow-hidden ${activeTab === 'course'
                  ? 'text-white shadow-[0_0_20px_rgba(236,72,153,0.5)]'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                  }`}
              >
                {activeTab === 'course' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 rounded-full -z-10"
                  />
                )}
                <GraduationCap className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Tutor Course</span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <AnimatePresence mode="wait">
            {activeTab === 'vocab' ? (
              <motion.div
                key="vocab"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {/* Vocab Section Header */}
                <div className="flex items-center justify-between mb-8 px-2">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">📚</span>
                    คลังคำศัพท์ยอดฮิต
                  </h2>
                  <div className="flex gap-2">
                    {/* Add filters if needed */}
                  </div>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Skeleton key={i} className="h-[450px] rounded-[2rem] bg-white/5" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                    {filteredDecks.map((deck, index) => (
                      <motion.div
                        key={deck.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <DeckCard deck={deck} />
                      </motion.div>
                    ))}
                  </div>
                )}
                {!loading && filteredDecks.length === 0 && (
                  <div className="glass-card rounded-[2rem] p-16 text-center text-white/50 border border-white/10">
                    <p className="text-2xl font-bold mb-2">ยังไม่มี Deck ในตอนนี้</p>
                    <p>ลองค้นหาคำใหม่ หรือเปลี่ยนหมวดหมู่ดูนะ Check back later! 🚀</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="course"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {/* Course Section Header */}
                <div className="flex items-center justify-between mb-8 px-2">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-pink-500/20 text-pink-300 border border-pink-500/30">🎓</span>
                    คอร์สเรียนแนะนำ
                  </h2>
                  <div className="bg-white/5 px-4 py-1 rounded-full text-xs font-medium text-white/50 border border-white/10">
                    คัดมาแล้วเน้นๆ 🔥
                  </div>
                </div>

                {/* Course Grid - Premium Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-20">
                  {mockCourses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="group relative"
                    >
                      {/* Glow Behind */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${course.color} blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-[2.5rem]`} />

                      <div className="glass-card h-full rounded-[2.5rem] p-5 hover:translate-y-[-5px] transition-all duration-500 border border-white/10 hover:border-white/30 bg-black/40 group-hover:bg-black/60 overflow-visible relative flex flex-col">

                        {/* Featured Image Area */}
                        <div className={`h-44 w-full rounded-[2rem] bg-gradient-to-br ${course.color} flex flex-col items-center justify-center relative overflow-hidden shadow-lg group-hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all mb-5`}>
                          {/* Pattern overlay */}
                          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                          <span className="text-7xl drop-shadow-2xl transform group-hover:scale-110 grooup-hover:rotate-3 transition-transform duration-500 ease-out z-10">
                            {course.image}
                          </span>

                          {/* Level Badge */}
                          <div className="absolute top-3 left-3 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white border border-white/20 flex items-center gap-1">
                            <Crown className="w-3 h-3 text-yellow-400" />
                            {course.level}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col">
                          {/* Tags */}
                          <div className="flex gap-2 mb-3">
                            {course.tags.map(tag => (
                              <span key={tag} className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 bg-white/5 rounded-md text-white/60 border border-white/5">
                                {tag}
                              </span>
                            ))}
                          </div>

                          <h3 className="text-xl font-bold text-white leading-snug mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/70 transition-colors">
                            {course.title}
                          </h3>

                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/20 flex items-center justify-center text-xs">
                              {course.instructor.charAt(0)}
                            </div>
                            <span className="text-sm text-white/60 font-medium">{course.instructor}</span>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-3 gap-2 py-3 border-t border-white/5 border-b mb-4">
                            <div className="text-center">
                              <div className="text-yellow-400 font-bold text-sm flex items-center justify-center gap-0.5">
                                <Star className="w-3 h-3 fill-yellow-400" /> {course.rating}
                              </div>
                              <div className="text-[10px] text-white/30 lowercase">Rating</div>
                            </div>
                            <div className="text-center border-l border-white/5">
                              <div className="text-cyan-400 font-bold text-sm">
                                {(course.students / 1000).toFixed(1)}k
                              </div>
                              <div className="text-[10px] text-white/30 lowercase">Students</div>
                            </div>
                            <div className="text-center border-l border-white/5">
                              <div className="text-pink-400 font-bold text-sm">
                                {course.duration}
                              </div>
                              <div className="text-[10px] text-white/30 lowercase">Duration</div>
                            </div>
                          </div>

                          <div className="mt-auto flex items-center justify-between gap-3">
                            <div className="text-2xl font-black text-white tracking-tight">
                              {course.price}
                            </div>
                            <Button className="rounded-xl bg-white/10 hover:bg-white text-white hover:text-black border border-white/10 transition-all flex-1 font-bold group/btn">
                              ตัวอย่าง
                              <PlayCircle className="w-4 h-4 ml-2 group-hover/btn:scale-110 transition-transform" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>
    </div>
  );
}
