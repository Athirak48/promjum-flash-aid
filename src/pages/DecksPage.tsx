import { usePublicDecks, PublicDeck } from '@/hooks/usePublicDecks';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Users, TrendingUp, Clock, Copy, BookOpen, Eye, Folder, Globe, Trash2, Check } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCloneDeck } from '@/hooks/useCloneDeck';
import { useToast } from '@/hooks/use-toast';
import { FolderBundlePreview } from '@/components/FolderBundlePreview';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';


import { CreateCommunityDeckDialog } from '@/components/CreateCommunityDeckDialog';
import { Plus } from 'lucide-react';

export default function DecksPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'clones'>('recent');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const { decks, loading } = usePublicDecks({ search: searchTerm, sortBy, category: selectedCategory });
  const { cloneDeck, loading: cloning } = useCloneDeck();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { trackPageView } = useAnalytics();
  const { user } = useAuth(); // Get current user

  useEffect(() => {
    trackPageView('Community', 'decks');
  }, [trackPageView]);

  const handleDeleteDeck = async (id: string) => {
    try {
      const { error } = await supabase.from('sub_decks').delete().eq('id', id);
      if (error) throw error;
      toast({
        title: "ลบ Deck สำเร็จ",
        description: "Deck ของคุณถูกลบออกจากระบบแล้ว",
        variant: "default"
      });
      window.location.reload(); // Simple refresh
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Preview dialog states
  const [showPreview, setShowPreview] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false); // Create Dialog State
  const [selectedBundle, setSelectedBundle] = useState<any | null>(null);

  const categories = [
    { id: undefined, label: 'ทั้งหมด', emoji: '🌍' },
    { id: 'English', label: 'อังกฤษ', emoji: '🇬🇧' },
    { id: 'Chinese', label: 'จีน', emoji: '🇨🇳' },
    { id: 'Japanese', label: 'ญี่ปุ่น', emoji: '🇯🇵' },
    { id: 'Korean', label: 'เกาหลี', emoji: '🇰🇷' },
    { id: 'French', label: 'ฝรั่งเศส', emoji: '🇫🇷' },
    { id: 'German', label: 'เยอรมัน', emoji: '🇩🇪' },
    { id: 'Spanish', label: 'สเปน', emoji: '🇪🇸' },
    { id: 'Other', label: 'อื่นๆ', emoji: '🗣️' },
  ];

  // Mock folder bundle data - TEMPORARY FOR DEMO
  const mockFolderBundles = [
    {
      id: 'mock-1',
      name: 'Daily Life English 🌅',
      description: 'คำศัพท์ภาษาอังกฤษใช้ในชีวิตประจำวัน - ครบทุกสถานการณ์',
      creator_nickname: 'Teacher Som',
      creator_avatar: null,
      category: 'English',
      tags: ['daily-life', 'basic', 'conversation'],
      clone_count: 234,
      total_sets: 3,
      total_cards: 45,
      created_at: '2025-01-15',
      flashcards: [
        // Morning Routine - 15 cards
        { id: '1', front: 'wake up', back: 'ตื่นนอน', setName: '🌅 Morning Routine' },
        { id: '2', front: 'brush teeth', back: 'แปรงฟัน', setName: '🌅 Morning Routine' },
        { id: '3', front: 'take a shower', back: 'อาบน้ำ', setName: '🌅 Morning Routine' },
        { id: '4', front: 'get dressed', back: 'แต่งตัว', setName: '🌅 Morning Routine' },
        { id: '5', front: 'eat breakfast', back: 'กินอาหารเช้า', setName: '🌅 Morning Routine' },
        { id: '6', front: 'make coffee', back: 'ชงกาแฟ', setName: '🌅 Morning Routine' },
        { id: '7', front: 'check phone', back: 'เช็คโทรศัพท์', setName: '🌅 Morning Routine' },
        { id: '8', front: 'read news', back: 'อ่านข่าว', setName: '🌅 Morning Routine' },
        { id: '9', front: 'pack bag', back: 'จัดกระเป๋า', setName: '🌅 Morning Routine' },
        { id: '10', front: 'leave home', back: 'ออกจากบ้าน', setName: '🌅 Morning Routine' },
        { id: '11', front: 'lock door', back: 'ล็อคประตู', setName: '🌅 Morning Routine' },
        { id: '12', front: 'catch bus', back: 'จับรถบัส', setName: '🌅 Morning Routine' },
        { id: '13', front: 'arrive at work', back: 'ถึงที่ทำงาน', setName: '🌅 Morning Routine' },
        { id: '14', front: 'greet colleagues', back: 'ทักทายเพื่อนร่วมงาน', setName: '🌅 Morning Routine' },
        { id: '15', front: 'start working', back: 'เริ่มทำงาน', setName: '🌅 Morning Routine' },

        // At Work - 15 cards
        { id: '16', front: 'attend meeting', back: 'เข้าประชุม', setName: '💼 At Work' },
        { id: '17', front: 'send email', back: 'ส่งอีเมล', setName: '💼 At Work' },
        { id: '18', front: 'make phone call', back: 'โทรศัพท์', setName: '💼 At Work' },
        { id: '19', front: 'take notes', back: 'จดบันทึก', setName: '💼 At Work' },
        { id: '20', front: 'use computer', back: 'ใช้คอมพิวเตอร์', setName: '💼 At Work' },
        { id: '21', front: 'print document', back: 'ปริ้นเอกสาร', setName: '💼 At Work' },
        { id: '22', front: 'have lunch', back: 'กินข้าวเที่ยง', setName: '💼 At Work' },
        { id: '23', front: 'take break', back: 'พักผ่อน', setName: '💼 At Work' },
        { id: '24', front: 'drink water', back: 'ดื่มน้ำ', setName: '💼 At Work' },
        { id: '25', front: 'work overtime', back: 'ทำงานล่วงเวลา', setName: '💼 At Work' },
        { id: '26', front: 'finish task', back: 'ทำงานเสร็จ', setName: '💼 At Work' },
        { id: '27', front: 'submit report', back: 'ส่งรายงาน', setName: '💼 At Work' },
        { id: '28', front: 'ask question', back: 'ถามคำถาม', setName: '💼 At Work' },
        { id: '29', front: 'give presentation', back: 'นำเสนอ', setName: '💼 At Work' },
        { id: '30', front: 'leave office', back: 'ออกจากออฟฟิศ', setName: '💼 At Work' },

        // Evening & Night - 15 cards
        { id: '31', front: 'go home', back: 'กลับบ้าน', setName: '🌙 Evening & Night' },
        { id: '32', front: 'cook dinner', back: 'ทำอาหารเย็น', setName: '🌙 Evening & Night' },
        { id: '33', front: 'eat dinner', back: 'กินอาหารเย็น', setName: '🌙 Evening & Night' },
        { id: '34', front: 'wash dishes', back: 'ล้างจาน', setName: '🌙 Evening & Night' },
        { id: '35', front: 'watch TV', back: 'ดูทีวี', setName: '🌙 Evening & Night' },
        { id: '36', front: 'play games', back: 'เล่นเกม', setName: '🌙 Evening & Night' },
        { id: '37', front: 'read book', back: 'อ่านหนังสือ', setName: '🌙 Evening & Night' },
        { id: '38', front: 'listen to music', back: 'ฟังเพลง', setName: '🌙 Evening & Night' },
        { id: '39', front: 'take a bath', back: 'อาบน้ำ', setName: '🌙 Evening & Night' },
        { id: '40', front: 'brush teeth', back: 'แปรงฟัน', setName: '🌙 Evening & Night' },
        { id: '41', front: 'set alarm', back: 'ตั้งนาฬิกาปลุก', setName: '🌙 Evening & Night' },
        { id: '42', front: 'go to bed', back: 'เข้านอน', setName: '🌙 Evening & Night' },
        { id: '43', front: 'turn off lights', back: 'ปิดไฟ', setName: '🌙 Evening & Night' },
        { id: '44', front: 'sleep', back: 'นอนหลับ', setName: '🌙 Evening & Night' },
        { id: '45', front: 'good night', back: 'ราตรีสวัสดิ์', setName: '🌙 Evening & Night' },
      ]
    }
  ];

  const handleSort = (newSort: 'popular' | 'recent' | 'clones') => {
    setSortBy(newSort);
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-prompt">

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-7xl mx-auto">

          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-12 text-center"
          >
            <div className="absolute top-0 right-0 hidden md:block">
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] border-none gap-2"
              >
                <Plus className="w-4 h-4" />
                สร้าง Deck
              </Button>
            </div>
            <div className="inline-block relative">
              <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full pointer-events-none" />
              <h1 className="relative text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50 drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] mb-4 font-cute">
                Community Decks
                <span className="absolute -top-4 -right-12 text-4xl animate-bounce delay-700">🌍</span>
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto font-light leading-relaxed">
              ค้นพบและโคลน <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-bold">Deck คุณภาพ</span> จากชุมชน
            </p>
          </motion.div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-3 mb-8 items-stretch md:items-center">
            {/* Search Bar */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="ค้นหา Deck หรือชื่อผู้สร้าง..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 h-10 rounded-full bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 backdrop-blur-xl transition-all"
              />
            </div>

            {/* Sort Buttons + Dropdown */}
            <div className="flex gap-1.5 md:gap-2 items-center justify-between md:justify-end flex-shrink-0">
              <Button
                variant={sortBy === 'recent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSort('recent')}
                className={`rounded-full flex-1 md:flex-none px-2 md:px-3 h-9 md:h-10 text-[11px] md:text-xs ${sortBy === 'recent'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                  }`}
              >
                <Clock className="w-3 h-3 md:w-3.5 md:h-3.5 mr-0.5 md:mr-1" />
                ล่าสุด
              </Button>
              <Button
                variant={sortBy === 'popular' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSort('popular')}
                className={`rounded-full flex-1 md:flex-none px-2 md:px-3 h-9 md:h-10 text-[11px] md:text-xs ${sortBy === 'popular'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                  }`}
              >
                <TrendingUp className="w-3 h-3 md:w-3.5 md:h-3.5 mr-0.5 md:mr-1" />
                ยอดนิยม
              </Button>

              {/* Language Dropdown */}
              <Select value={selectedCategory || 'all'} onValueChange={(value) => setSelectedCategory(value === 'all' ? undefined : value)}>
                <SelectTrigger className="w-[80px] md:w-[120px] h-9 md:h-10 rounded-full bg-white/5 border-white/20 text-white text-[11px] md:text-xs focus:ring-purple-500/50 px-2">
                  <Globe className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1 text-purple-400" />
                  <SelectValue placeholder="ภาษา" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-white">
                  {categories.map((cat) => (
                    <SelectItem key={cat.id || 'all'} value={cat.id || 'all'} className="focus:bg-white/10">
                      <span className="flex items-center gap-2">
                        <span>{cat.emoji}</span>
                        <span>{cat.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            // Loading skeleton
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[400px] rounded-[2rem] bg-white/5" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pb-20">
              {/* Mock Folder Bundles - Show when category matches */}
              {mockFolderBundles
                .filter(bundle => !selectedCategory || bundle.category === selectedCategory)
                .map((bundle, index) => (
                  <FolderBundleCard
                    key={bundle.id}
                    bundle={bundle}
                    index={index}
                    onPreview={() => {
                      setSelectedBundle(bundle);
                      setShowPreview(true);
                    }}
                    onClone={() => {
                      setSelectedBundle(bundle);
                      setShowPreview(true);
                    }}
                  />
                ))}

              {/* Real Public Decks */}
              {decks.map((deck, index) => (
                <PublicDeckCard
                  key={deck.id}
                  deck={deck}
                  index={index + mockFolderBundles.length}
                  onClone={() => {
                    toast({
                      title: "คุณสมบัตินี้กำลังมา! 🚀",
                      description: "เร็วๆ นี้คุณจะสามารถโคลน Deck ได้"
                    });
                  }}
                  currentUserId={user?.id}
                  onDelete={handleDeleteDeck}
                />
              ))}

              {/* Empty state - only show when no mock and no real decks */}
              {mockFolderBundles.filter(b => !selectedCategory || b.category === selectedCategory).length === 0 && decks.length === 0 && (
                <div className="col-span-full glass-card rounded-[2rem] p-16 text-center text-white/50 border border-white/10">
                  <p className="text-2xl font-bold mb-2">ไม่พบ Deck</p>
                  <p>ลองค้นหาด้วยคีย์เวิร์ดอื่น หรือเปลี่ยนการเรียงลำดับดูนะ 🔍</p>
                </div>
              )}
            </div>
          )}

          {/* Preview Dialog */}
          {selectedBundle && (
            <FolderBundlePreview
              open={showPreview}
              onOpenChange={setShowPreview}
              folderName={selectedBundle.name}
              flashcards={selectedBundle.flashcards}
            />
          )}

          <CreateCommunityDeckDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            onSuccess={() => {
              // Refresh decks logic if needed (e.g. invalidate query)
              window.location.reload(); // Simple refresh for now
            }}
          />

        </div>
      </main>
    </div>
  );
}

// Folder Bundle Card Component
function FolderBundleCard({
  bundle,
  index,
  onPreview,
  onClone
}: {
  bundle: any;
  index: number;
  onPreview: () => void;
  onClone: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-card group rounded-xl sm:rounded-[2rem] border border-white/10 hover:border-white/30 hover:shadow-[0_0_40px_rgba(168,85,247,0.3)] transition-all duration-300 relative overflow-visible bg-black/40 p-3 sm:p-6"
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl sm:rounded-[2rem] pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/20 flex-shrink-0">
              <Folder className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-lg font-bold text-white group-hover:text-primary transition-colors truncate">
                {bundle.name}
              </h3>
              <div className="flex items-center gap-1">
                <Avatar className="w-3 h-3 sm:w-4 sm:h-4 border border-white/20">
                  <AvatarImage src={bundle.creator_avatar || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-[8px] sm:text-[10px]">
                    {bundle.creator_nickname?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[10px] sm:text-xs text-white/60 truncate">{bundle.creator_nickname}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-[11px] sm:text-sm text-white/70 line-clamp-2 mb-2 sm:mb-4">
          {bundle.description}
        </p>

        {/* Stats - Compact */}
        <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-2 sm:mb-4">
          <div className="bg-white/5 rounded-lg p-1.5 sm:p-2 border border-white/10 text-center">
            <p className="text-[8px] sm:text-[10px] text-white/50">ชุด</p>
            <p className="text-xs sm:text-base font-bold text-white">{bundle.total_sets}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-1.5 sm:p-2 border border-white/10 text-center">
            <p className="text-[8px] sm:text-[10px] text-white/50">คำศัพท์</p>
            <p className="text-xs sm:text-base font-bold text-white">{bundle.total_cards}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-1.5 sm:p-2 border border-white/10 text-center">
            <p className="text-[8px] sm:text-[10px] text-white/50">โคลน</p>
            <p className="text-xs sm:text-base font-bold text-pink-400">{bundle.clone_count}</p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-2 sm:mb-4">
          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-[8px] sm:text-[10px] px-1.5 py-0">
            {bundle.category}
          </Badge>
          {bundle.tags.slice(0, 1).map((tag: string) => (
            <Badge key={tag} className="bg-white/5 text-white/50 border-white/10 text-[8px] sm:text-[10px] px-1.5 py-0">
              #{tag}
            </Badge>
          ))}
        </div>

        {/* Action Button */}
        <Button
          onClick={onPreview}
          size="sm"
          className="w-full gap-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-[10px] sm:text-xs h-7 sm:h-9 px-2"
        >
          <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          ดูคำศัพท์
        </Button>
      </div>
    </motion.div>
  );
}

// Public Deck Card Component
function PublicDeckCard({
  deck,
  index,
  onClone,
  currentUserId,
  onDelete
}: {
  deck: PublicDeck;
  index: number;
  onClone: () => void;
  currentUserId?: string;
  onDelete: (id: string) => void;
}) {
  const navigate = useNavigate();
  const isOwner = currentUserId && deck.creator_user_id === currentUserId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-card group h-full flex flex-col rounded-[2.5rem] border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all duration-300 relative overflow-visible bg-black/40"
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem] pointer-events-none" />

      {/* Owner Badge & Controls */}
      {isOwner && (
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <Badge className="bg-purple-600 text-white border-purple-400">Owner</Badge>
          <Button
            variant="destructive"
            size="icon"
            className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('คุณต้องการลบ Deck นี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
                onDelete(deck.id);
              }
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}

      <div className="p-6 relative z-10 flex flex-col h-full">
        {/* Creator Info */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="w-8 h-8 border border-white/20">
            <AvatarImage src={deck.creator_avatar || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
              {deck.creator_nickname?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white/80 font-medium truncate">
              {deck.creator_nickname || 'Anonymous'}
            </p>
          </div>
          {!isOwner && (
            <Badge className="bg-white/10 text-white/60 border-white/20 text-xs">
              🌍 Public
            </Badge>
          )}
        </div>

        {/* Deck Name */}
        <h3 className="text-xl font-black text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
          {deck.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-white/60 line-clamp-2 mb-4 leading-relaxed">
          {deck.description || 'No description'}
        </p>

        {/* Categories & Tags */}
        <div className="flex-1">
          {(deck.category || (deck.tags && deck.tags.length > 0)) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {deck.category && (
                <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-xs">
                  {deck.category}
                </Badge>
              )}
              {deck.tags?.slice(0, 2).map(tag => (
                <Badge key={tag} className="bg-white/5 text-white/50 border-white/10 text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-sm mb-4 mt-auto">
          <div className="flex items-center gap-1.5 text-white/60 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium">{deck.total_flashcards}</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/60 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
            <Users className="w-3.5 h-3.5 text-pink-400" />
            <span className="font-medium">{deck.clone_count}</span>
          </div>
        </div>


        {/* Clone Button (Disable for owner?) -> Normally owner might want to clone too, but maybe edit is better. For now keep Clone. 
            User req: "delete or edit". I provided Delete. Edit is implied as Metadata edit or Manage. 
            Let's keep Clone for everyone.
        */}
        <Button
          onClick={onClone}
          disabled={isOwner} // Disable clone for owner? Or maybe allow. User didn't specify. I'll disable to avoid confusion.
          className={`w-full gap-2 rounded-xl font-bold shadow-[0_4px_15px_rgba(168,85,247,0.4)] border-none h-11 relative overflow-hidden group/btn ${isOwner ? 'bg-slate-700 text-slate-400 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'}`}
        >
          {isOwner ? (
            <span className="relative z-10 flex items-center gap-2">
              <Check className="w-4 h-4" />
              คุณเป็นเจ้าของ
            </span>
          ) : (
            <>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
              <span className="relative z-10 flex items-center gap-2">
                <Copy className="w-4 h-4" />
                โคลน Deck นี้
              </span>
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
