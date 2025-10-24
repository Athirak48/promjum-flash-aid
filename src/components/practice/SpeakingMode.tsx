import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, SkipForward } from 'lucide-react';

interface SpeakingModeProps {
  isRecording: boolean;
  isSpeaking: boolean;
  currentMessage: string;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onSkip: () => void;
}

export const SpeakingMode = ({
  isRecording,
  isSpeaking,
  currentMessage,
  onStartRecording,
  onStopRecording,
  onSkip
}: SpeakingModeProps) => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Volume2 className="h-4 w-4" />
            <span>AI กำลังพูด...</span>
          </div>
          
          <div className="min-h-[120px] p-4 bg-accent rounded-lg">
            <p className="text-lg">
              {currentMessage || "เริ่มการสนทนาโดยกดปุ่มไมโครโฟนด้านล่าง"}
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              className="h-16 w-16 rounded-full"
              onClick={isRecording ? onStopRecording : onStartRecording}
            >
              {isRecording ? (
                <MicOff className="h-6 w-6" />
              ) : (
                <Mic className="h-6 w-6" />
              )}
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={onSkip}
            >
              <SkipForward className="h-4 w-4 mr-2" />
              ข้าม
            </Button>
          </div>

          {isRecording && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-sm text-primary">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                กำลังบันทึกเสียง...
              </div>
            </div>
          )}

          {isSpeaking && (
            <div className="text-center text-sm text-muted-foreground">
              AI กำลังตอบกลับ...
            </div>
          )}
        </div>
      </Card>

      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">💡 คำแนะนำ</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• พูดชัดเจนและเป็นธรรมชาติ</li>
            <li>• AI จะวิเคราะห์การออกเสียงและไวยากรณ์</li>
            <li>• กดปุ่มไมโครโฟนเพื่อพูด</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};
