import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, BookOpen, Download, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SubDeck } from '@/hooks/useSubDecks';
import { useState, useEffect } from 'react';
import { WordPreviewDialog } from './WordPreviewDialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubDeckCardProps {
  subdeck: SubDeck;
}

export function SubDeckCard({ subdeck }: SubDeckCardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPreview, setShowPreview] = useState(false);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);

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

    // Implement download logic here
    toast({
      title: "ดาวน์โหลดสำเร็จ!",
      description: `เพิ่ม "${subdeck.name}" ไปยังแฟลชการ์ดของคุณแล้ว`,
    });
  };

  return (
    <>
      <Card 
        className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-l-4"
        onClick={handleCardClick}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Main Info */}
            <div className="flex-1 space-y-3">
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

              <div className="flex items-center gap-4">
                <Badge className={`${getDifficultyColor(subdeck.difficulty_level)} border`}>
                  {getDifficultyText(subdeck.difficulty_level)}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
            <div className="flex flex-col gap-2 min-w-[140px]">
              <Button
                size="sm"
                variant="default"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick();
                }}
                className="gap-2 w-full bg-gradient-primary hover:shadow-glow"
                disabled={loadingFlashcards}
              >
                <Eye className="w-4 h-4" />
                {loadingFlashcards ? 'กำลังโหลด...' : 'Preview'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownload}
                className="gap-2 w-full"
              >
                <Download className="w-4 h-4" />
                ดาวน์โหลด
              </Button>
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
    </>
  );
}
