import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { StickyNote, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function QuickNotes() {
  const [note, setNote] = useState('');
  const [savedNotes, setSavedNotes] = useState<string[]>([]);
  const { toast } = useToast();

  const handleSaveNote = () => {
    if (!note.trim()) {
      toast({
        title: "กรุณากรอกข้อความ",
        description: "พิมพ์บันทึกก่อนบันทึก",
        variant: "destructive",
      });
      return;
    }

    setSavedNotes([note, ...savedNotes.slice(0, 2)]);
    setNote('');
    
    toast({
      title: "บันทึกสำเร็จ",
      description: "บันทึกของคุณถูกเก็บไว้แล้ว",
    });
  };

  const handleDeleteNote = (index: number) => {
    setSavedNotes(savedNotes.filter((_, i) => i !== index));
    toast({
      title: "ลบสำเร็จ",
      description: "บันทึกถูกลบแล้ว",
    });
  };

  return (
    <Card className="bg-gradient-card backdrop-blur-sm shadow-soft border border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <StickyNote className="w-6 h-6 text-primary" />
          บันทึกด่วน
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="จดคำศัพท์ใหม่ ไอเดีย หรือสิ่งที่อยากจำ..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="bg-background/50 border-border/50 focus:border-primary resize-none"
          />
          <Button 
            onClick={handleSaveNote}
            size="sm"
            className="w-full bg-gradient-primary hover:shadow-soft transition-all"
          >
            <Save className="w-4 h-4 mr-2" />
            บันทึก
          </Button>
        </div>

        {savedNotes.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">บันทึกล่าสุด</div>
            {savedNotes.map((savedNote, index) => (
              <div 
                key={index}
                className="flex items-start justify-between gap-2 p-3 rounded-lg bg-muted/30 border border-border/30 text-sm text-foreground"
              >
                <span className="flex-1">{savedNote}</span>
                <button
                  onClick={() => handleDeleteNote(index)}
                  className="flex-shrink-0 p-1 hover:bg-destructive/10 rounded transition-colors"
                  aria-label="ลบบันทึก"
                >
                  <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
