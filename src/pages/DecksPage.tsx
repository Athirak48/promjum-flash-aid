import { useDecks } from '@/hooks/useDecks';
import { DeckCard } from '@/components/DeckCard';
import { Skeleton } from '@/components/ui/skeleton';
import BackgroundDecorations from '@/components/BackgroundDecorations';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, BookOpen, MessageSquare, Sparkles, TrendingUp, Star, Zap } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SubDeck } from '@/hooks/useSubDecks';
import { Deck } from '@/hooks/useDecks';
import { motion } from 'framer-motion';



export default function DecksPage() {
  const { decks, loading } = useDecks();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('view') || 'vocab';

  const handleTabChange = (value: string) => {
    setSearchParams({ view: value });
  };

  const filteredDecks = useMemo(() => {
    let result = decks;

    // Filter by Tab (Category)
    if (activeTab === 'vocab') {
      result = result.filter(d => d.category !== 'Sentence');
    } else {
      result = result.filter(d => d.category === 'Sentence');
    }

    // Filter by Search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(deck =>
        deck.name.toLowerCase().includes(search) ||
        deck.name_en.toLowerCase().includes(search) ||
        deck.description.toLowerCase().includes(search)
      );
    }

    return result;
  }, [decks, searchTerm, activeTab]);

  // Calculate stats
  const totalDecks = decks.length;
  const totalCards = decks.reduce((sum, deck) => sum + (deck.total_flashcards || 0), 0);
  const avgProgress = decks.length > 0
    ? Math.round(decks.reduce((sum, deck) => sum + (deck.progress?.progress_percentage || 0), 0) / decks.length)
    : 0;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <BackgroundDecorations />

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-7xl mx-auto">

          {/* Header Section - Redesigned Cute Style */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-12"
          >
            {/* Decorative Background Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-pink-100/50 via-purple-100/50 to-indigo-100/50 blur-3xl rounded-full -z-10" />

            <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-[3rem] p-8 md:p-10 shadow-xl shadow-purple-100/50 text-center relative overflow-hidden group hover:bg-white/60 transition-all duration-500">

              {/* Floating Bouncy Icons */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-4 left-8 text-4xl opacity-80 rotate-[-10deg] hidden md:block"
              >
                🎒
              </motion.div>
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-6 right-8 text-4xl opacity-80 rotate-[10deg] hidden md:block"
              >
                🧸
              </motion.div>

              {/* Title Area */}
              <div className="relative inline-block">
                <motion.div
                  animate={{ rotate: [0, 2, -2, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <h1 className="text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 drop-shadow-sm">
                    Deck ของฉัน
                  </h1>
                </motion.div>

                {/* Sparkles */}
                <motion.span
                  animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-4 -right-8 text-3xl"
                >
                  ✨
                </motion.span>
              </div>

              {/* Subtitle */}
              <p className="mt-4 text-lg md:text-xl text-slate-600 font-medium max-w-xl mx-auto leading-relaxed">
                คลังคำศัพท์ส่วนตัวของคุณ!
                <br className="hidden md:block" />
                <span className="text-purple-500">เลือกหมวดที่ชอบ</span> แล้วลุยกันเลย 🚀
              </p>
            </div>
          </motion.div>





          {/* Current View Label */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${activeTab === 'vocab'
              ? 'bg-gradient-to-br from-violet-500 to-purple-600'
              : 'bg-gradient-to-br from-pink-500 to-rose-600'
              }`}>
              {activeTab === 'vocab' ? (
                <BookOpen className="w-5 h-5 text-white" />
              ) : (
                <MessageSquare className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {activeTab === 'vocab' ? 'Deck คำศัพท์' : 'Deck ประโยค'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {activeTab === 'vocab'
                  ? `${filteredDecks.length} deck พร้อมให้เรียน ✨`
                  : `${filteredDecks.length} deck พร้อมให้เรียน 💬`}
              </p>
            </div>
          </motion.div>

          {/* Deck Grid */}
          {activeTab === 'vocab' ? (
            <>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Skeleton className="h-[400px] rounded-2xl" />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDecks.map((deck, index) => (
                    <motion.div
                      key={deck.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <DeckCard deck={deck} />
                    </motion.div>
                  ))}
                </div>
              )}

              {!loading && filteredDecks.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16"
                >
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-xl text-muted-foreground mb-2">
                    {searchTerm ? 'ไม่พบ Deck ที่ค้นหา' : 'ยังไม่มี Deck'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? 'ลองค้นหาด้วยคำอื่น 🔍' : 'เริ่มสร้าง Deck แรกของคุณกันเถอะ! 🚀'}
                  </p>
                </motion.div>
              )}
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDecks.map((deck, index) => (
                <motion.div
                  key={deck.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <DeckCard
                    deck={deck}
                    // Note: Custom SubDecks are now handled within DeckCard or fetched dynamically if needed
                    // For now we assume DeckCard handles fetching its own subdecks or we might need to adjust this later
                    customLabel="ประโยค"
                  />
                </motion.div>
              ))}

              {filteredDecks.length === 0 && (
                <div className="col-span-full text-center py-10 text-muted-foreground">
                  ยังไม่มี Deck ในหมวดนี้
                </div>
              )}
            </div>
          )}

          {/* Motivational Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200/50 dark:border-violet-700/30">
              <span className="text-2xl">🎉</span>
              <p className="text-sm text-violet-700 dark:text-violet-300 font-medium">
                เรียนทุกวัน พัฒนาทุกวัน! สู้ๆ นะ 💪
              </p>
              <span className="text-2xl">✨</span>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
