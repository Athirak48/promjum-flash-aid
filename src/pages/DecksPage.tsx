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
import { useOnboarding } from '@/hooks/useOnboarding';
import { useUserDecks } from '@/hooks/useUserDecks';
import { OnboardingBanner } from '@/components/onboarding/OnboardingBanner';

export default function DecksPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'clones'>('recent');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { decks, loading, refetch } = usePublicDecks({ search: searchTerm, sortBy, category: selectedCategory });
  const { cloneDeck, loading: cloning } = useCloneDeck();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { trackPageView } = useAnalytics();
  const { user } = useAuth(); // Get current user
  const { hasDecks, deckCount } = useUserDecks();
  const { isOnboarding, markStepComplete, skipOnboarding } = useOnboarding();

  useEffect(() => {
    trackPageView('Community', 'decks');
  }, [trackPageView]);

  const handleDeleteDeck = async (id: string) => {
    if (!user) {
      toast({
        title: "กรุณาเข้าสู่ระบบ",
        description: "คุณต้องเข้าสู่ระบบก่อนลบ Deck",
        variant: "destructive"
      });
      return;
    }

    try {
      // Delete from user_flashcard_sets (community decks)
      const { error: deleteError } = await supabase
        .from('user_flashcard_sets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Ensure user owns this deck

      if (deleteError) throw deleteError;

      toast({
        title: "ลบ Deck สำเร็จ! ✅",
        description: "Deck ของคุณถูกลบออกจากระบบแล้ว",
        variant: "default"
      });

      // Refetch deck list instead of full page reload
      refetch();
    } catch (error: any) {
      console.error('Error deleting deck:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถลบ Deck ได้",
        variant: "destructive"
      });
    }
  };

  const handleCloneDeck = async (deck: PublicDeck) => {
    if (!user) {
      toast({
        title: "กรุณาเข้าสู่ระบบ",
        description: "คุณต้องเข้าสู่ระบบก่อนโคลน Deck",
        variant: "destructive"
      });
      return;
    }

    try {
      // 1. Find or create 'Community Uploads' folder
      let { data: existingFolder } = await supabase
        .from('user_folders')
        .select('id')
        .eq('user_id', user.id)
        .eq('title', 'Community Uploads')
        .single();

      let communityFolderId: string;

      if (!existingFolder) {
        const { data: newFolder, error: folderError } = await supabase
          .from('user_folders')
          .insert({
            user_id: user.id,
            title: 'Community Uploads',
            emoji: '🌍'
          })
          .select()
          .single();

        if (folderError) throw folderError;
        communityFolderId = newFolder.id;
      } else {
        communityFolderId = existingFolder.id;
      }

      // 2. Fetch all flashcards from the source deck
      const { data: sourceCards, error: cardsError } = await supabase
        .from('user_flashcards')
        .select('*')
        .eq('flashcard_set_id', deck.id);

      if (cardsError) throw cardsError;

      // 3. Create new flashcard set in the Community Uploads folder
      const { data: newSet, error: setError } = await supabase
        .from('user_flashcard_sets')
        .insert({
          user_id: user.id,
          folder_id: communityFolderId,
          title: deck.name,
          source: 'community',
          card_count: sourceCards?.length || 0
        })
        .select()
        .single();

      if (setError) throw setError;

      // 4. Clone all flashcards
      if (sourceCards && sourceCards.length > 0) {
        const clonedCards = sourceCards.map(card => ({
          flashcard_set_id: newSet.id,
          user_id: user.id,
          front_text: card.front_text,
          back_text: card.back_text,
          front_image_url: card.front_image_url,
          back_image_url: card.back_image_url,
          part_of_speech: card.part_of_speech
        }));

        const { error: insertError } = await supabase
          .from('user_flashcards')
          .insert(clonedCards);

        if (insertError) throw insertError;
      }

      // 5. Increment clone_count for the parent deck
      const { error: updateError } = await supabase
        .from('user_flashcard_sets')
        .update({ clone_count: (deck.clone_count || 0) + 1 })
        .eq('id', deck.id);

      if (updateError) {
        console.error('Error updating clone_count:', updateError);
        // Don't throw, clone was successful even if count update failed
      }

      toast({
        title: "โคลนสำเร็จ! 🎉",
        description: `คุณได้โคลน "${deck.name}" ไปยังโฟลเดอร์ Community Uploads แล้ว`,
        variant: "default"
      });

      // Check if this is first-time user completing onboarding
      if (isOnboarding && deckCount === 0) {
        await markStepComplete('deck_downloaded');
        setTimeout(() => {
          toast({
            title: "ยอดเยี่ยม! 🎉",
            description: "คุณมีคำศัพท์แล้ว มาลองเรียนกันเลย!",
          });
          navigate('/dashboard');
        }, 1500);
      }

    } catch (error: any) {
      console.error('Error cloning deck:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถโคลน Deck ได้",
        variant: "destructive"
      });
    }
  };

  // Handle preview for community decks
  const handlePreviewCommunityDeck = async (deck: PublicDeck) => {
    try {
      // 1. Fetch all subdecks of this parent deck
      const { data: subdecks, error: subdeckError } = await supabase
        .from('user_flashcard_sets')
        .select('id, title, card_count')
        .eq('parent_deck_id', deck.id)
        .eq('source', 'community_subdeck');

      if (subdeckError) throw subdeckError;

      if (!subdecks || subdecks.length === 0) {
        toast({
          title: "ไม่พบคำศัพท์",
          description: "Deck นี้ยังไม่มีคำศัพท์",
          variant: "destructive"
        });
        return;
      }

      // 2. Fetch all flashcards from all subdecks
      const allFlashcards: any[] = [];

      for (const subdeck of subdecks) {
        const { data: cards } = await supabase
          .from('user_flashcards')
          .select('id, front_text, back_text, part_of_speech')
          .eq('flashcard_set_id', subdeck.id);

        if (cards && cards.length > 0) {
          // Map to include subdeck name as 'setName'
          const mappedCards = cards.map(c => ({
            id: c.id,
            front: c.front_text,
            back: c.back_text,
            setName: subdeck.title
          }));
          allFlashcards.push(...mappedCards);
        }
      }

      if (allFlashcards.length === 0) {
        toast({
          title: "ไม่พบคำศัพท์",
          description: "Deck นี้ยังไม่มีคำศัพท์",
          variant: "destructive"
        });
        return;
      }

      // 3. Set state and open preview
      setSelectedCommunityDeck(deck);
      setCommunityDeckFlashcards(allFlashcards);
      setShowCommunityPreview(true);
    } catch (error: any) {
      console.error('Error fetching community deck preview:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถดึงข้อมูลได้",
        variant: "destructive"
      });
    }
  };

  // Preview dialog states
  const [showPreview, setShowPreview] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<any | null>(null);

  // Community deck preview states
  const [showCommunityPreview, setShowCommunityPreview] = useState(false);
  const [selectedCommunityDeck, setSelectedCommunityDeck] = useState<PublicDeck | null>(null);
  const [communityDeckFlashcards, setCommunityDeckFlashcards] = useState<any[]>([]);

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

          {/* Header Section - Enhanced Modern Design */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-10 md:mb-14 text-center"
          >
            {/* Subtle floating orbs background */}
            <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-purple-500/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute top-1/2 right-1/3 w-40 h-40 bg-pink-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

            {/* Create Deck Button - Desktop */}
            <div className="absolute -top-2 right-0 hidden md:block">
              <Button
                onClick={() => {
                  console.log('Create Deck button clicked!');
                  setShowCreateDialog(true);
                }}
                className="group relative rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 border-none gap-2 px-5 py-2.5 font-bold transition-all duration-300 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>สร้าง Deck</span>
              </Button>
            </div>

            {/* Main Title - More Compact */}
            <div className="relative mb-3">
              <h1 className="relative text-4xl md:text-6xl lg:text-7xl font-black tracking-tight">
                <span className="inline-block bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent">
                  Community Decks
                </span>
                <motion.span
                  className="inline-block ml-2 text-3xl md:text-4xl"
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                >
                  🌍
                </motion.span>
              </h1>
            </div>

            {/* Subtitle - Cleaner Design */}
            <p className="text-sm md:text-lg text-white/50 max-w-xl mx-auto font-light px-4">
              ค้นพบและโคลน{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-semibold">
                Deck คุณภาพ
              </span>
              {' '}จากชุมชน
            </p>
          </motion.div>

          {/* Onboarding Banner for First-Time Users */}
          {deckCount === 0 && (
            <OnboardingBanner
              message="ยังไม่มีคำศ้พท์ เลือกดาวน์โหลด 1 ชุดเพื่อเริ่มเรียน!"
              onSkip={skipOnboarding}
              showSkip={true}
            />
          )}

          {/* Search and Filters - Enhanced Design */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              {/* Search Bar - Glassmorphism Style */}
              <div className="relative flex-1 group">
                {/* Glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300" />

                {/* Search input container */}
                <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden group-hover:border-white/20 transition-all duration-300">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
                  <input
                    type="text"
                    placeholder="ค้นหา Deck หรือชื่อผู้สร้าง..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-transparent text-white text-sm md:text-base placeholder:text-white/40 focus:outline-none"
                  />
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2 flex-wrap md:flex-nowrap">
                {/* Sort Buttons */}
                <Button
                  variant={sortBy === 'recent' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSort('recent')}
                  className={`rounded-xl px-4 py-3 font-bold transition-all duration-300 ${sortBy === 'recent'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg shadow-purple-500/30'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20'
                    }`}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  ล่าสุด
                </Button>
                <Button
                  variant={sortBy === 'popular' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSort('popular')}
                  className={`rounded-xl px-4 py-3 font-bold transition-all duration-300 ${sortBy === 'popular'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg shadow-purple-500/30'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20'
                    }`}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  ยอดนิยม
                </Button>

                {/* Language Dropdown */}
                <Select value={selectedCategory || 'all'} onValueChange={(value) => setSelectedCategory(value === 'all' ? undefined : value)}>
                  <SelectTrigger className={`w-full md:w-[140px] rounded-xl px-4 py-3 font-bold border transition-all duration-300 ${selectedCategory
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg shadow-purple-500/30'
                    : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20'
                    }`}>
                    <Globe className="w-4 h-4 mr-2 text-purple-400" />
                    <SelectValue placeholder="ภาษา" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-white rounded-xl">
                    {categories.map((cat) => (
                      <SelectItem
                        key={cat.id || 'all'}
                        value={cat.id || 'all'}
                        className="focus:bg-white/10 rounded-lg"
                      >
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
          </motion.div>

          {/* Content */}
          {loading ? (
            // Loading skeleton
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-[280px] rounded-2xl bg-white/5" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 pb-40 md:pb-20">
              {/* Real Public Decks Only - No Mock Data */}
              {decks.map((deck, index) => (
                <PublicDeckCard
                  key={deck.id}
                  deck={deck}
                  index={index}
                  onPreview={() => handlePreviewCommunityDeck(deck)}
                  onClone={async () => {
                    await handleCloneDeck(deck);
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

          {/* Community Deck Preview Dialog */}
          {selectedCommunityDeck && showCommunityPreview && (
            <FolderBundlePreview
              open={showCommunityPreview}
              onOpenChange={setShowCommunityPreview}
              folderName={selectedCommunityDeck.name}
              flashcards={communityDeckFlashcards}
            />
          )}

          {/* Create Community Deck Dialog */}
          <CreateCommunityDeckDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            onSuccess={() => {
              setShowCreateDialog(false);
              refetch(); // Refresh deck list
              toast({
                title: "สร้าง Deck สำเร็จ! 🎉",
                description: "Deck ของคุณถูกแชร์ไปยังชุมชนแล้ว",
                variant: "default"
              });
            }}
          />

        </div>
      </main>

      {/* Mobile FAB - Fixed Bottom Right */}
      <div className="md:hidden fixed bottom-8 right-4 z-50">
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="rounded-full w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-[0_4px_20px_rgba(168,85,247,0.6)] border-none p-0 flex items-center justify-center"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

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
      className="group relative h-full"
    >
      {/* Abstract Gradient Blob Background - Decorative */}
      <div className="absolute -inset-0.5 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-[2.2rem] opacity-30 group-hover:opacity-75 blur-lg transition duration-500" />

      {/* Main Card Content */}
      <div className="relative h-full bg-slate-950/90 backdrop-blur-3xl rounded-[2rem] border border-white/10 p-5 flex flex-col overflow-hidden">

        {/* Top Shine */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

        {/* Header Section */}
        <div className="relative z-10 flex justify-between items-start mb-4">
          <div className="flex gap-4 items-center">
            {/* Folder Icon Box */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              <span className="text-3xl filter drop-shadow-md">📂</span>
            </div>

            <div className="flex-1 min-w-0">
              {/* Badge Category */}
              <Badge className="mb-1.5 bg-white/10 text-white/80 hover:bg-white/20 border-0 text-[10px] px-2 py-0.5 pointer-events-none data-[category='English']:bg-blue-500/20 data-[category='English']:text-blue-300" data-category={bundle.category}>
                {bundle.category || 'General'}
              </Badge>
              <h3 className="text-xl font-black text-white leading-tight truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-pink-400 transition-all duration-300">
                {bundle.name}
              </h3>
            </div>
          </div>
        </div>

        {/* Creator Info - Cute Pill */}
        <div className="flex items-center gap-2 mb-4 bg-white/5 w-fit pr-3 rounded-full border border-white/5">
          <Avatar className="w-6 h-6 border-2 border-slate-900">
            <AvatarImage src={bundle.creator_avatar || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-[9px] text-white">
              {bundle.creator_nickname?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium text-slate-300">
            {bundle.creator_nickname}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-400 mb-5 line-clamp-2 min-h-[2.5em] leading-relaxed">
          {bundle.description}
        </p>

        {/* Stats Grid - "Cards" style */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="bg-slate-900/50 rounded-xl p-2 border border-white/5 flex flex-col items-center justify-center">
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Sets</span>
            <span className="text-lg font-bold text-indigo-400">{bundle.total_sets}</span>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-2 border border-white/5 flex flex-col items-center justify-center">
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Vocab</span>
            <span className="text-lg font-bold text-pink-400">{bundle.total_cards}</span>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-2 border border-white/5 flex flex-col items-center justify-center">
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Clones</span>
            <span className="text-lg font-bold text-emerald-400 flex items-center gap-1">
              <Copy className="w-3 h-3" /> {bundle.clone_count}
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex-1 flex flex-wrap gap-1.5 mb-5 content-start">
          {bundle.tags.map((tag: string) => (
            <span key={tag} className="text-[11px] font-medium text-slate-400 px-2 py-1 rounded-md bg-white/5 border border-white/5 hover:border-white/20 transition-colors">
              #{tag}
            </span>
          ))}
        </div>

        {/* Action Button - Full Width Gradient */}
        <Button
          onClick={onPreview}
          className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold shadow-lg shadow-purple-900/20 group-hover:shadow-purple-500/40 transition-all duration-300"
        >
          <Eye className="w-4 h-4 mr-2" />
          ดูคำศัพท์ข้างใน
        </Button>

      </div>
    </motion.div>
  );
}

// Public Deck Card Component
function PublicDeckCard({
  deck,
  index,
  onPreview,
  onClone,
  currentUserId,
  onDelete
}: {
  deck: PublicDeck;
  index: number;
  onPreview: () => void;
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
      className="group relative h-full"
    >
      {/* Glow effect on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-50 blur-lg transition duration-300" />

      {/* Main Card Content */}
      <div className="relative h-full bg-slate-950/90 backdrop-blur-xl rounded-2xl border border-white/10 group-hover:border-white/20 p-4 flex flex-col overflow-hidden transition-all duration-300">

        {/* Top gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-60" />

        {/* Delete Button for Owner - Always Visible */}
        {isOwner && (
          <div className="absolute top-2 right-2 z-20">
            <Button
              variant="destructive"
              size="icon"
              className="h-7 w-7 rounded-full bg-red-600/90 hover:bg-red-500 border border-red-400/30 shadow-lg shadow-red-900/50 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('คุณต้องการลบ Deck นี้ใช่หรือไม่?')) {
                  onDelete(deck.id);
                }
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex-1 min-w-0">
            {deck.category && (
              <Badge className="mb-1 bg-blue-500/20 text-blue-300 border-0 text-[9px] px-1.5 py-0">
                {deck.category}
              </Badge>
            )}
            <h3 className="text-sm font-bold text-white leading-tight line-clamp-1 group-hover:text-cyan-400 transition-colors">
              {deck.name}
            </h3>
          </div>
        </div>

        {/* Creator Info */}
        <div className="flex items-center gap-1.5 mb-3">
          <Avatar className="w-5 h-5 border border-slate-700">
            <AvatarImage src={deck.creator_avatar || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-500 text-[8px] text-white">
              {deck.creator_nickname?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="text-[10px] font-medium text-slate-400 truncate">
            {deck.creator_nickname || 'Anonymous'}
          </span>
        </div>

        {/* Description */}
        <p className="text-[11px] text-slate-400 mb-3 line-clamp-2 leading-relaxed min-h-[2.2em]">
          {deck.description || 'No description provided.'}
        </p>

        {/* Stats Grid - Compact */}
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          <div className="bg-slate-900/50 rounded-lg p-1.5 border border-white/5 flex flex-col items-center">
            <span className="text-[8px] text-slate-500 font-medium uppercase">Sets</span>
            <span className="text-sm font-bold text-indigo-400">{deck.total_sets}</span>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-1.5 border border-white/5 flex flex-col items-center">
            <span className="text-[8px] text-slate-500 font-medium uppercase">Vocab</span>
            <span className="text-sm font-bold text-cyan-400">{deck.total_flashcards}</span>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-1.5 border border-white/5 flex flex-col items-center">
            <span className="text-[8px] text-slate-500 font-medium uppercase">Clones</span>
            <span className="text-sm font-bold text-pink-400">{deck.clone_count}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3 min-h-[20px]">
          {deck.tags?.slice(0, 2).map(tag => (
            <span key={tag} className="text-[9px] font-medium text-slate-400 px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
              #{tag}
            </span>
          ))}
        </div>

        {/* Action Button */}
        <Button
          onClick={onPreview}
          className="w-full h-9 rounded-xl font-bold shadow-lg transition-all duration-300 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white text-xs mt-auto"
        >
          <Eye className="w-3.5 h-3.5 mr-1.5" /> ดูคำศัพท์ข้างใน
        </Button>
      </div>
    </motion.div>
  );
}
