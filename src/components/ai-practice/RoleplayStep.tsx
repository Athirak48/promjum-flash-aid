import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MessageSquare, CheckCircle2, Sparkles } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RoleplayStepProps {
  vocab: string[];
  phrases: any[];
  onComplete: () => void;
}

interface Message {
  role: 'ai' | 'user';
  text: string;
  feedback?: string;
}

export default function RoleplayStep({ vocab, phrases, onComplete }: RoleplayStepProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      text: "สวัสดีค่ะ! วันนี้เรามาฝึกสถานการณ์การทำงานกัน คุณเป็นพนักงานที่ต้องประชุมกับทีม ลองใช้ประโยค 'Can you help me with this problem?' และคำศัพท์ที่เรียนมาในการตอบนะคะ"
    }
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [usedPhrases, setUsedPhrases] = useState<Set<string>>(new Set());
  const [isComplete, setIsComplete] = useState(false);

  const handleRecord = () => {
    setIsRecording(true);
    // Mock recording
    setTimeout(() => {
      setIsRecording(false);
      // Mock user response
      const userResponse = "Can you help me with this problem? I need to revise the report before the deadline.";
      
      // Check if phrase is used
      const usedPhrase = phrases[0].text; // Mock checking first phrase
      const newUsedPhrases = new Set(usedPhrases);
      newUsedPhrases.add(usedPhrase);
      setUsedPhrases(newUsedPhrases);

      // Add user message
      setMessages(prev => [...prev, {
        role: 'user',
        text: userResponse
      }]);

      // Add AI feedback
      setTimeout(() => {
        if (newUsedPhrases.size >= 2) {
          setMessages(prev => [...prev, {
            role: 'ai',
            text: "ยอดเยี่ยมมาก! คุณใช้ประโยคและคำศัพท์ได้ถูกต้องและเหมาะสม ✨",
            feedback: "คุณใช้ประโยคครบ 2 ประโยค และคำศัพท์ 8 จาก 10 คำ การใช้ grammar ถูกต้อง 95% เก่งมาก!"
          }]);
          setIsComplete(true);
        } else {
          setMessages(prev => [...prev, {
            role: 'ai',
            text: "ดีมากค่ะ! ตอนนี้ลองใช้ประโยคที่สอง 'I'm looking forward to meeting you.' ในบริบทการนัดหมายประชุมครั้งถัดไป",
            feedback: "คุณใช้ประโยคแรกได้ดีแล้ว grammar ถูกต้อง ลองใช้ประโยคที่สองด้วยนะคะ"
          }]);
        }
      }, 1000);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">💼 The Final Test: Roleplay</h2>
        <p className="text-muted-foreground">ทดสอบความสามารถในการใช้คำศัพท์และประโยคที่เรียนมา</p>
        <div className="flex gap-2 justify-center mt-4">
          <Badge variant={usedPhrases.size >= 1 ? "default" : "secondary"}>
            ประโยคที่ 1 {usedPhrases.size >= 1 && '✓'}
          </Badge>
          <Badge variant={usedPhrases.size >= 2 ? "default" : "secondary"}>
            ประโยคที่ 2 {usedPhrases.size >= 2 && '✓'}
          </Badge>
        </div>
      </div>

      <Card className="p-6 mb-6">
        {/* Chat Messages */}
        <ScrollArea className="h-[400px] mb-6 pr-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index}>
                <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-accent'
                  } rounded-lg p-4`}>
                    <div className="flex items-start gap-2 mb-2">
                      {message.role === 'ai' && <Sparkles className="w-4 h-4 mt-1" />}
                      {message.role === 'user' && <MessageSquare className="w-4 h-4 mt-1" />}
                      <p className="text-sm font-semibold">
                        {message.role === 'ai' ? 'AI Coach' : 'คุณ'}
                      </p>
                    </div>
                    <p>{message.text}</p>
                  </div>
                </div>

                {/* Feedback */}
                {message.feedback && (
                  <div className="mt-2 ml-8 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm">
                      <span className="font-semibold">📊 Feedback: </span>
                      {message.feedback}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Recording Button */}
        {!isComplete && (
          <div className="flex justify-center">
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
        )}

        {/* Complete Summary */}
        {isComplete && (
          <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg p-6 border-2 border-primary/20">
            <div className="text-center mb-4">
              <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">ยินดีด้วย! 🎉</h3>
              <p className="text-muted-foreground mb-4">
                คุณผ่านการทดสอบด้วยผลลัพธ์ที่ยอดเยี่ยม
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4 text-center">
                <p className="text-3xl font-bold text-primary mb-1">2/2</p>
                <p className="text-sm text-muted-foreground">ประโยคที่ใช้</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-3xl font-bold text-primary mb-1">8/10</p>
                <p className="text-sm text-muted-foreground">คำศัพท์ที่ใช้</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-3xl font-bold text-primary mb-1">95%</p>
                <p className="text-sm text-muted-foreground">ความถูกต้อง</p>
              </Card>
            </div>

            <div className="bg-card rounded-lg p-4 mb-4">
              <h4 className="font-semibold mb-2">สรุปผลการเรียนรู้</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>ใช้ประโยคได้เหมาะสมกับสถานการณ์</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Grammar และโครงสร้างประโยคถูกต้อง</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>การใช้คำศัพท์ครอบคลุมและแม่นยำ</span>
                </li>
              </ul>
            </div>

            <Button size="lg" className="w-full" onClick={onComplete}>
              เสร็จสิ้น - กลับหน้าหลัก
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
