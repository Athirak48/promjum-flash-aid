import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, BookOpen, Download, Eye, ShoppingCart, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SubDeck } from '@/hooks/useSubDecks';
import { useState, useEffect } from 'react';
import { WordPreviewDialog } from './WordPreviewDialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FolderSelectionDialog } from './FolderSelectionDialog';

interface SubDeckCardProps {
  subdeck: SubDeck;
}

export function SubDeckCard({ subdeck }: SubDeckCardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPreview, setShowPreview] = useState(false);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(false);
  const [showFolderSelection, setShowFolderSelection] = useState(false);

  // Check if user has purchased this subdeck
  useEffect(() => {
    const checkPurchase = async () => {
      if (subdeck.is_free) {
        setHasPurchased(true);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setHasPurchased(false);
        return;
      }

      setCheckingPurchase(true);
      const { data } = await supabase
        .from('user_subdeck_purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('subdeck_id', subdeck.id)
        .single();

      setHasPurchased(!!data);
      setCheckingPurchase(false);
    };

    checkPurchase();
  }, [subdeck.id, subdeck.is_free]);

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'intermediate': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'advanced': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default: return 'bg-white/10 text-white/50 border-white/10';
    }
  };

  const getDifficultyText = (level: string) => {
    switch (level) {
      case 'beginner': return 'เริ่มต้น';
      case 'intermediate': return 'กลาง';
      case 'advanced': return 'ขั้นสูง';
      default: return level;
    }
  };

  const handleCardClick = async () => {
    setLoadingFlashcards(true);
    try {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('subdeck_id', subdeck.id)
        .order('created_at');

      if (error) throw error;

      setFlashcards(data || []);
      setShowPreview(true);
    } catch (error) {
      console.error('Error loading flashcards:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดคำศัพท์ได้",
        variant: "destructive"
      });
    } finally {
      setLoadingFlashcards(false);
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast({
        title: "กรุณาเข้าสู่ระบบ",
        description: "คุณต้องเข้าสู่ระบบก่อนดาวน์โหลด",
        variant: "destructive"
      });
      return;
    }

    if (!subdeck.is_free && !hasPurchased) {
      toast({
        title: "ไม่มีสิทธิ์ดาวน์โหลด",
        description: "กรุณาซื้อ Sub-deck นี้ก่อนดาวน์โหลด",
        variant: "destructive"
      });
      return;
    }

    // Open folder selection dialog
    setShowFolderSelection(true);
  };

  const handleSaveToFolder = async (folderId: string, folderName: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "กรุณาเข้าสู่ระบบ",
        description: "คุณต้องเข้าสู่ระบบก่อนบันทึก",
        variant: "destructive"
      });
      return;
    }

    try {
      // 2. Create a new user_flashcard_set
      const { data: newSet, error: setError } = await supabase
        .from('user_flashcard_sets')
        .insert({
          user_id: user.id,
          folder_id: folderId,
          title: subdeck.name,
          source: 'marketcard',
          card_count: subdeck.flashcard_count || 0
        })
        .select()
        .single();

      if (setError) throw setError;
      if (!newSet) throw new Error("Failed to create set");

      // 3. Fetch source flashcards
      const { data: sourceCards, error: sourceError } = await supabase
        .from('flashcards')
        .select('*')
        .eq('subdeck_id', subdeck.id);

      if (sourceError) throw sourceError;

      if (sourceCards && sourceCards.length > 0) {
        // 4. Map to user_flashcards format
        const cardsToInsert = sourceCards.map(card => {
          // Construct rich back text from multiple source fields
          const backTextParts = [
            card.back_text,
            card.meaning_th,
            card.meaning_en,
            card.part_of_speech ? `(${card.part_of_speech})` : null,
            card.example_sentence_en ? `Ex: ${card.example_sentence_en}` : null,
            card.example_sentence_th ? `ตัวอย่าง: ${card.example_sentence_th}` : null,
            card.synonyms && card.synonyms.length > 0 ? `Synonyms: ${card.synonyms.join(', ')}` : null
          ].filter(Boolean); // Remove null/undefined/empty strings

          return {
            user_id: user.id,
            flashcard_set_id: newSet.id,
            front_text: card.front_text,
            back_text: backTextParts.join('\n\n') || '', // Join with double newline for readability
            front_image_url: null,
            back_image_url: null
          };
        });

        // 5. Batch insert
        const { error: insertError } = await supabase
          .from('user_flashcards')
          .insert(cardsToInsert);

        if (insertError) throw insertError;
      }

      toast({
        title: "บันทึกสำเร็จ!",
        description: `บันทึก "${subdeck.name}" ลงในโฟลเดอร์ "${folderName}" เรียบร้อยแล้ว`,
      });
      setShowFolderSelection(false); // Close dialog on success


    } catch (error) {
      console.error('Error saving to folder:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: `ไม่สามารถบันทึกได้: ${(error as any).message || 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  const handlePurchase = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast({
        title: "กรุณาเข้าสู่ระบบ",
        description: "คุณต้องเข้าสู่ระบบก่อนซื้อ",
        variant: "destructive"
      });
      return;
    }

    // TODO: Implement payment flow
    // For now, just create a purchase record
    const { error } = await supabase
      .from('user_subdeck_purchases')
      .insert({
        user_id: user.id,
        subdeck_id: subdeck.id,
        amount_paid: 0 // TODO: Set actual price
      });

    if (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดำเนินการซื้อได้",
        variant: "destructive"
      });
      return;
    }

    setHasPurchased(true);
    toast({
      title: "ซื้อสำเร็จ!",
      description: `คุณสามารถดาวน์โหลด "${subdeck.name}" ได้แล้ว`,
    });
  };

  return (
    <>
      <div
        className="glass-card hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all duration-300 cursor-pointer group border-l-4 border-l-transparent hover:border-l-primary bg-black/40 rounded-3xl overflow-hidden relative"
        onClick={handleCardClick}
      >
        {/* Hover Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        <div className="p-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left: Main Info */}
            <div className="flex-1 space-y-3 w-full">
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{subdeck.name}</h3>
                    {subdeck.progress?.is_completed && (
                      <CheckCircle2 className="w-5 h-5 text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]" />
                    )}
                  </div>
                  <p className="text-sm text-white/50">
                    {subdeck.name_en}
                  </p>
                </div>
              </div>

              <p className="text-sm text-white/70 line-clamp-2 font-light">
                {subdeck.description}
              </p>

              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <Badge className={`${getDifficultyColor(subdeck.difficulty_level)} border rounded-lg px-2`}>
                  {getDifficultyText(subdeck.difficulty_level)}
                </Badge>
                {!subdeck.is_free && (
                  <Badge variant="secondary" className="gap-1 bg-gradient-brand text-white border-0 shadow-md">
                    <Lock className="w-3 h-3" />
                    Premium
                  </Badge>
                )}
                <div className="flex items-center gap-2 text-sm text-white/40 whitespace-nowrap bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{subdeck.flashcard_count} คำศัพท์</span>
                </div>
              </div>

              {subdeck.progress && (
                <div className="space-y-2 max-w-md pt-1">
                  <div className="flex justify-between text-xs text-white/40">
                    <span>เรียนไปแล้ว</span>
                    <span className="font-bold text-primary">
                      {subdeck.progress.cards_learned}/{subdeck.flashcard_count} คำ
                    </span>
                  </div>
                  <Progress
                    value={(subdeck.progress.cards_learned / subdeck.flashcard_count) * 100}
                    className="h-1.5 bg-white/10"
                  />
                </div>
              )}
            </div>

            {/* Right: Action Buttons */}
            <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto sm:min-w-[140px]">
              <Button
                size="sm"
                variant="default"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick();
                }}
                className="gap-2 flex-1 sm:flex-none w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl"
                disabled={loadingFlashcards}
              >
                <Eye className="w-4 h-4" />
                {loadingFlashcards ? 'กำลังโหลด...' : 'Preview'}
              </Button>

              {!subdeck.is_free && !hasPurchased ? (
                <Button
                  size="sm"
                  variant="default"
                  onClick={handlePurchase}
                  className="gap-2 flex-1 sm:flex-none w-full rounded-xl btn-space-glass"
                  disabled={checkingPurchase}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {checkingPurchase ? 'กำลังตรวจสอบ...' : 'ซื้อ'}
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownload}
                  className="gap-2 flex-1 sm:flex-none w-full rounded-xl bg-gradient-to-r from-primary to-pink-500 hover:from-primary/80 hover:to-pink-400 text-white border-none shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                  disabled={checkingPurchase}
                >
                  <Download className="w-4 h-4" />
                  ดาวน์โหลด
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <WordPreviewDialog
        open={showPreview}
        onOpenChange={setShowPreview}
        flashcards={flashcards}
        subdeckName={subdeck.name}
      />

      <FolderSelectionDialog
        open={showFolderSelection}
        onOpenChange={setShowFolderSelection}
        onSelectFolder={handleSaveToFolder}
      />
    </>
  );
}
