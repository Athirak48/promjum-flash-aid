import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Download, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SubDeck {
  id: string;
  name: string;
  name_en: string;
  flashcard_count: number;
  difficulty_level: string;
  is_free: boolean;
}

interface DownloadSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subdecks: SubDeck[];
  deckName: string;
}

export function DownloadSelectionDialog({ 
  open, 
  onOpenChange, 
  subdecks,
  deckName 
}: DownloadSelectionDialogProps) {
  const [selectedSubdecks, setSelectedSubdecks] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const toggleSubdeck = (subdeckId: string) => {
    setSelectedSubdecks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subdeckId)) {
        newSet.delete(subdeckId);
      } else {
        newSet.add(subdeckId);
      }
      return newSet;
    });
  };

  const handleDownload = async () => {
    if (selectedSubdecks.size === 0) {
      toast({
        title: "กรุณาเลือก Sub-deck",
        description: "เลือกอย่างน้อย 1 Sub-deck เพื่อดาวน์โหลด",
        variant: "destructive"
      });
      return;
    }

    setIsDownloading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "กรุณาเข้าสู่ระบบ",
          description: "คุณต้องเข้าสู่ระบบก่อนดาวน์โหลด",
          variant: "destructive"
        });
        return;
      }

      // Here you would implement the actual download logic
      // For now, we'll just show a success message
      
      toast({
        title: "ดาวน์โหลดสำเร็จ! ✨",
        description: `เพิ่ม ${selectedSubdecks.size} Sub-deck ไปยังแฟลชการ์ดของคุณแล้ว`,
      });

      setSelectedSubdecks(new Set());
      onOpenChange(false);
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดาวน์โหลดได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500/10 text-green-500';
      case 'intermediate': return 'bg-yellow-500/10 text-yellow-500';
      case 'advanced': return 'bg-red-500/10 text-red-500';
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">เลือก Sub-deck เพื่อดาวน์โหลด</DialogTitle>
          <p className="text-sm text-muted-foreground">
            จาก {deckName}
          </p>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-3">
            {subdecks.map((subdeck) => (
              <div
                key={subdeck.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => toggleSubdeck(subdeck.id)}
              >
                <Checkbox
                  checked={selectedSubdecks.has(subdeck.id)}
                  onCheckedChange={() => toggleSubdeck(subdeck.id)}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{subdeck.name}</span>
                    <Badge className={getDifficultyColor(subdeck.difficulty_level)}>
                      {getDifficultyText(subdeck.difficulty_level)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {subdeck.name_en} • {subdeck.flashcard_count} คำ
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            เลือกแล้ว {selectedSubdecks.size} Sub-deck
          </p>
          <Button
            onClick={handleDownload}
            disabled={isDownloading || selectedSubdecks.size === 0}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            เพิ่มไปยังแฟลชการ์ดของฉัน
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
