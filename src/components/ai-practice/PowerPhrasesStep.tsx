import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, Info, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Phrase {
  text: string;
  thai: string;
  context: string;
}

interface PowerPhrasesStepProps {
  vocabulary: string[];
  onNext: (phrases: Phrase[]) => void;
}

export default function PowerPhrasesStep({ vocabulary, onNext }: PowerPhrasesStepProps) {
  const { toast } = useToast();
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generatePhrases();
  }, []);

  const generatePhrases = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('generate-power-phrases', {
        body: { vocabulary }
      });

      if (error) throw error;

      if (data?.phrases && Array.isArray(data.phrases)) {
        setPhrases(data.phrases);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error generating phrases:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถสร้างประโยคได้ กรุณาลองใหม่อีกครั้ง',
        variant: 'destructive'
      });
      // Use fallback phrases
      setPhrases([
        {
          text: "Can you help me with this problem?",
          thai: "คุณช่วยฉันแก้ปัญหานี้ได้ไหม",
          context: "ใช้เมื่อต้องการขอความช่วยเหลือ (Formal/Casual)"
        },
        {
          text: "I'm looking forward to seeing you.",
          thai: "ฉันรอคอยที่จะได้พบคุณ",
          context: "ใช้เมื่อต้องการแสดงความตั้งใจ (Formal)"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-lg text-muted-foreground">AI กำลังสร้างประโยคที่เหมาะกับคุณ...</p>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
          <h2 className="text-3xl font-bold">Your Power Phrases</h2>
        </div>
        <p className="text-muted-foreground">
          ประโยคที่มีโอกาสใช้ได้จริงสูง สร้างโดย AI จากคำศัพท์ที่คุณเลือก
        </p>
      </div>

      <div className="space-y-6">
        {phrases.map((phrase, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="mb-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-semibold mb-2">{phrase.text}</p>
                  <p className="text-lg text-muted-foreground">{phrase.thai}</p>
                </div>
              </div>
            </div>

            <div className="bg-accent/50 rounded-lg p-4 border border-accent">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold mb-1">AI Context Note</p>
                  <p className="text-sm text-muted-foreground">{phrase.context}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Button size="lg" onClick={() => onNext(phrases)}>
          ดีมาก! ไปทบทวนกันเลย
        </Button>
      </div>
    </div>
  );
}
