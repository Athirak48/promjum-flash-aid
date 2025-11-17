import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, Info } from 'lucide-react';

interface Phrase {
  text: string;
  thai: string;
  context: string;
}

interface PowerPhrasesStepProps {
  phrases: Phrase[];
  onNext: () => void;
}

export default function PowerPhrasesStep({ phrases, onNext }: PowerPhrasesStepProps) {
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
        <Button size="lg" onClick={onNext}>
          ดีมาก! ไปทบทวนกันเลย
        </Button>
      </div>
    </div>
  );
}
