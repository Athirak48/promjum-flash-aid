import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MessageSquare, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      text: "สวัสดีค่ะ! วันนี้เรามาฝึกสถานการณ์การทำงานกัน ลองใช้ประโยคที่เรียนมาในการตอบนะคะ"
    }
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [usedPhrases, setUsedPhrases] = useState<Set<string>>(new Set());
  const [isComplete, setIsComplete] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsRecording(false);
        await handleUserMessage(transcript);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: 'ไม่สามารถบันทึกเสียงได้',
          variant: 'destructive'
        });
      };

      setRecognition(recognitionInstance);
    }
  }, [messages]);

  const handleUserMessage = async (userText: string) => {
    // Add user message
    const userMessage: Message = { role: 'user', text: userText };
    setMessages(prev => [...prev, userMessage]);

    // Check which phrases are used
    const newUsedPhrases = new Set(usedPhrases);
    phrases.forEach(phrase => {
      if (userText.toLowerCase().includes(phrase.text.toLowerCase())) {
        newUsedPhrases.add(phrase.text);
      }
    });
    setUsedPhrases(newUsedPhrases);

    // Get AI response
    try {
      setIsSending(true);
      const { data, error } = await supabase.functions.invoke('roleplay-chat', {
        body: {
          messages: [...messages, userMessage],
          vocabulary: vocab,
          phrases: phrases
        }
      });

      if (error) throw error;

      const aiMessage: Message = {
        role: 'ai',
        text: data.response
      };

      setMessages(prev => [...prev, aiMessage]);

      // Check if complete (both phrases used)
      if (newUsedPhrases.size >= phrases.length) {
        setIsComplete(true);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถรับคำตอบจาก AI ได้',
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleRecord = () => {
    if (!recognition) {
      toast({
        title: 'ไม่รองรับ',
        description: 'เบราว์เซอร์ไม่รองรับการบันทึกเสียง',
        variant: 'destructive'
      });
      return;
    }

    setIsRecording(true);
    try {
      recognition.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      setIsRecording(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">💼 The Final Test: Roleplay</h2>
        <p className="text-muted-foreground">ทดสอบความสามารถในการใช้คำศัพท์และประโยคที่เรียนมา</p>
        <div className="flex gap-2 justify-center mt-4">
          {phrases.map((phrase, idx) => (
            <Badge key={idx} variant={usedPhrases.has(phrase.text) ? "default" : "secondary"}>
              ประโยคที่ {idx + 1} {usedPhrases.has(phrase.text) && '✓'}
            </Badge>
          ))}
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
              disabled={isRecording || isSending}
              className={isRecording ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {isRecording ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : isSending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  AI กำลังตอบ...
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5 mr-2" />
                  กดพูด
                </>
              )}
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
                <p className="text-3xl font-bold text-primary mb-1">{usedPhrases.size}/{phrases.length}</p>
                <p className="text-sm text-muted-foreground">ประโยคที่ใช้</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-3xl font-bold text-primary mb-1">{vocab.length}/10</p>
                <p className="text-sm text-muted-foreground">คำศัพท์</p>
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
