import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, Volume2, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface PronunciationStepProps {
  phrases: any[];
  onNext: () => void;
}

export default function PronunciationStep({ phrases, onNext }: PronunciationStepProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showText, setShowText] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const currentPhrase = phrases[currentIndex];

  const handlePlayAudio = () => {
    // Mock TTS
    console.log('Playing audio:', currentPhrase.text);
  };

  const handleRecord = () => {
    setIsRecording(true);
    // Mock recording
    setTimeout(() => {
      setIsRecording(false);
      // Mock score (random between 70-100)
      const mockScore = Math.floor(Math.random() * 31) + 70;
      setScore(mockScore);
    }, 2000);
  };

  const handleTryAgain = () => {
    setScore(null);
  };

  const handleNext = () => {
    if (currentIndex < phrases.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setScore(null);
    } else {
      onNext();
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">🎙️ Speak & Master</h2>
        <p className="text-muted-foreground">ฝึกออกเสียงประโยคให้ชัดเจนและถูกต้อง</p>
        <div className="mt-4">
          <Badge>ประโยคที่ {currentIndex + 1}/{phrases.length}</Badge>
        </div>
      </div>

      <Card className="p-8 mb-6">
        {/* Phrase Display */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">ประโยคที่ต้องฝึก</h3>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowText(!showText)}
              >
                {showText ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTranslation(!showTranslation)}
              >
                คำแปล
              </Button>
            </div>
          </div>

          <div className="bg-accent/50 rounded-lg p-6 text-center min-h-[120px] flex flex-col justify-center">
            {showText && (
              <p className="text-2xl font-bold mb-2">{currentPhrase.text}</p>
            )}
            {showTranslation && (
              <p className="text-lg text-muted-foreground">{currentPhrase.thai}</p>
            )}
          </div>
        </div>

        {/* Audio Controls */}
        <div className="flex gap-4 justify-center mb-6">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePlayAudio}
          >
            <Volume2 className="w-5 h-5 mr-2" />
            ฟังเสียง
          </Button>

          <Button
            size="lg"
            onClick={handleRecord}
            disabled={isRecording}
            className={isRecording ? 'bg-destructive hover:bg-destructive/90' : ''}
          >
            <Mic className="w-5 h-5 mr-2" />
            {isRecording ? 'กำลังบันทึก...' : 'กดพูด'}
          </Button>
        </div>

        {/* Score Display */}
        {score !== null && (
          <div className="mt-6 p-6 bg-primary/5 rounded-lg border border-primary/20">
            <div className="text-center mb-4">
              <h4 className="font-semibold mb-2">คะแนนความแม่นยำ</h4>
              <div className="text-5xl font-bold text-primary mb-2">{score}%</div>
              <Progress value={score} className="h-2 mb-4" />
              <p className="text-sm text-muted-foreground">
                {score >= 80 
                  ? 'ยอดเยี่ยม! การออกเสียงของคุณดีมาก' 
                  : 'ลองใหม่อีกครั้งเพื่อปรับปรุงการออกเสียง'}
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={handleTryAgain}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                ลองอีกครั้ง
              </Button>
              {score >= 80 && (
                <Button onClick={handleNext}>
                  ไปต่อ
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>

      {score === null && (
        <div className="text-center text-sm text-muted-foreground">
          <p>คลิก "กดพูด" เพื่อเริ่มบันทึกเสียง</p>
        </div>
      )}
    </div>
  );
}
