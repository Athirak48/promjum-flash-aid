import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2, Mic, MicOff, RefreshCw } from 'lucide-react';

interface ShadowingModeProps {
  sentence: string;
  isRecording: boolean;
  onPlayAI: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onNextSentence: () => void;
}

export const ShadowingMode = ({
  sentence,
  isRecording,
  onPlayAI,
  onStartRecording,
  onStopRecording,
  onNextSentence
}: ShadowingModeProps) => {
  const [phase, setPhase] = useState<'listen' | 'speak'>('listen');

  const handlePlayAI = () => {
    setPhase('listen');
    onPlayAI();
  };

  const handleStartRecording = () => {
    setPhase('speak');
    onStartRecording();
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="min-h-[120px] p-4 bg-accent rounded-lg">
            <p className="text-lg font-medium">
              {sentence || "กำลังโหลดประโยค..."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className={`p-4 ${phase === 'listen' ? 'bg-primary/10 border-primary' : ''}`}>
              <div className="space-y-3">
                <div className="font-semibold text-sm">รอบ 1: ฟัง</div>
                <Button 
                  onClick={handlePlayAI} 
                  className="w-full"
                  variant={phase === 'listen' ? 'default' : 'outline'}
                >
                  <Volume2 className="h-4 w-4 mr-2" />
                  เล่นเสียง AI
                </Button>
              </div>
            </Card>

            <Card className={`p-4 ${phase === 'speak' ? 'bg-primary/10 border-primary' : ''}`}>
              <div className="space-y-3">
                <div className="font-semibold text-sm">รอบ 2: พูดตาม</div>
                <Button
                  onClick={isRecording ? onStopRecording : handleStartRecording}
                  className="w-full"
                  variant={phase === 'speak' ? (isRecording ? 'destructive' : 'default') : 'outline'}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="h-4 w-4 mr-2" />
                      หยุดบันทึก
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-2" />
                      บันทึกเสียง
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {isRecording && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-sm text-primary">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                กำลังบันทึกเสียง... พูดตามประโยคข้างบน
              </div>
            </div>
          )}

          <Button onClick={onNextSentence} variant="outline" className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            ประโยคถัดไป
          </Button>
        </div>
      </Card>

      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">💡 คำแนะนำ</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• ฟังให้ดีและจับจังหวะการพูด</li>
            <li>• พยายามเลียนแบบน้ำเสียงและสำเนียง</li>
            <li>• AI จะเปรียบเทียบเสียงของคุณกับต้นฉบับ</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};
