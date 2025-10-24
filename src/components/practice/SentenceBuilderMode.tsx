import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, RefreshCw } from 'lucide-react';

interface SentenceBuilderModeProps {
  onSubmit: (sentence: string) => void;
  vocabularyWords: string[];
}

export const SentenceBuilderMode = ({ onSubmit, vocabularyWords }: SentenceBuilderModeProps) => {
  const [sentence, setSentence] = useState('');
  const [feedback, setFeedback] = useState<string>('');

  const handleSubmit = () => {
    if (sentence.trim()) {
      onSubmit(sentence);
      setFeedback('กำลังตรวจสอบ...');
      // Feedback will come from AI response
    }
  };

  const handleReset = () => {
    setSentence('');
    setFeedback('');
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-3">คำศัพท์วันนี้:</h3>
            <div className="flex flex-wrap gap-2">
              {vocabularyWords.map((word, idx) => (
                <Badge key={idx} variant="secondary" className="text-base px-3 py-1">
                  {word}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">แต่งประโยคโดยใช้คำศัพท์ข้างบน:</label>
            <Textarea
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              placeholder="พิมพ์ประโยคที่นี่..."
              className="min-h-[120px]"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={!sentence.trim()} className="flex-1">
              <Send className="h-4 w-4 mr-2" />
              ส่งประโยค
            </Button>
            <Button onClick={handleReset} variant="outline">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {feedback && (
            <Card className="p-4 bg-accent">
              <p className="text-sm">{feedback}</p>
            </Card>
          )}
        </div>
      </Card>

      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">💡 คำแนะนำ</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• ใช้คำศัพท์ที่กำหนดให้ในประโยค</li>
            <li>• AI จะตรวจไวยากรณ์และความเป็นธรรมชาติ</li>
            <li>• พยายามสร้างประโยคที่มีความหมายชัดเจน</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};
