import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
      case 'beginner': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'intermediate': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'advanced': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-muted';
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
    setShowFolderSelection(false);

    // 1. Get current user
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
          source: 'library', // or 'store' depending on context
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
            back_image_url: null,
            subdeck_id: subdeck.id
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

    } catch (error) {
      console.error('Error saving to folder:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกไปยังโฟลเดอร์ได้",
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
      <Card
        className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-l-4"
        onClick={handleCardClick}
      >
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left: Main Info */}
            <div className="flex-1 space-y-3 w-full">
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-xl">{subdeck.name}</CardTitle>
                    {subdeck.progress?.is_completed && (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <CardDescription className="text-sm">
                    {subdeck.name_en}
                  </CardDescription>
                </div>
              </div>

              <p className="text-sm text-foreground/70 line-clamp-2">
                {subdeck.description}
              </p>

              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <Badge className={`${getDifficultyColor(subdeck.difficulty_level)} border`}>
                  {getDifficultyText(subdeck.difficulty_level)}
                </Badge>
                {!subdeck.is_free && (
                  <Badge variant="secondary" className="gap-1 bg-gradient-primary text-primary-foreground">
                    <Lock className="w-3 h-3" />
                    Premium
                  </Badge>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
                  <BookOpen className="w-4 h-4" />
                  <span>{subdeck.flashcard_count} คำศัพท์</span>
                </div>
              </div>

              {subdeck.progress && (
                <div className="space-y-2 max-w-md">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">เรียนไปแล้ว</span>
                    <span className="font-medium text-primary">
                      {subdeck.progress.cards_learned}/{subdeck.flashcard_count} คำ
                    </span>
                  </div>
                  <Progress
                    value={(subdeck.progress.cards_learned / subdeck.flashcard_count) * 100}
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
                className="gap-2 flex-1 sm:flex-none w-full bg-gradient-primary hover:shadow-glow"
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
                  className="gap-2 flex-1 sm:flex-none w-full"
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
                  className="gap-2 flex-1 sm:flex-none w-full"
                  disabled={checkingPurchase}
                >
                  <Download className="w-4 h-4" />
                  ดาวน์โหลด
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

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
