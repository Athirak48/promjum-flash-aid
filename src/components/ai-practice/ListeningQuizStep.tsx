import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Volume2, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ListeningQuizStepProps {
  vocab: string[];
  onNext: () => void;
}

export default function ListeningQuizStep({ vocab, onNext }: ListeningQuizStepProps) {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showStory, setShowStory] = useState(false);

  useEffect(() => {
    generateQuiz();
  }, []);

  const generateQuiz = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('generate-listening-quiz', {
        body: { vocabulary: vocab }
      });

      if (error) throw error;

      if (data?.questions && Array.isArray(data.questions)) {
        setQuestions(data.questions);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถสร้างแบบทดสอบได้',
        variant: 'destructive'
      });
      // Use fallback questions
      setQuestions([
        {
          story: "I need to finish this project by the deadline.",
          storyThai: "ฉันต้องทำโครงการนี้ให้เสร็จก่อนกำหนดเวลา",
          question: "What does the speaker need to do?",
          options: ["Cancel the project", "Finish by deadline", "Start tomorrow", "Ask for help"],
          correct: 1,
          explanation: "ต้อง finish ก่อน deadline"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-lg text-muted-foreground">AI กำลังสร้างแบบทดสอบฟัง...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <p className="text-lg text-muted-foreground mb-4">ไม่สามารถสร้างแบบทดสอบได้</p>
        <Button onClick={() => onNext()}>ข้ามไปขั้นตอนถัดไป</Button>
      </div>
    );
  }

  const question = questions[currentIndex];

  const handlePlayAudio = () => {
    // Use Web Speech API for TTS
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(question.story);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  const handleSubmit = () => {
    setShowResult(true);
    setShowStory(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setShowStory(false);
    } else {
      onNext();
    }
  };

  const isCorrect = selectedAnswer === question.correct;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">👂 Story Application</h2>
        <p className="text-muted-foreground">ฝึกฟังและทำความเข้าใจเรื่องราว</p>
        <div className="mt-4">
          <Badge>ข้อที่ {currentIndex + 1}/{questions.length}</Badge>
        </div>
      </div>

      <Card className="p-8">
        {/* Story Box */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">เรื่องราว</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlayAudio}
            >
              <Volume2 className="w-4 h-4 mr-2" />
              ฟังเสียง
            </Button>
          </div>

          <div className="bg-accent/50 rounded-lg p-6 min-h-[120px] flex items-center justify-center">
            {showStory ? (
              <div>
                <p className="text-lg mb-3">{question.story}</p>
                <p className="text-muted-foreground">{question.storyThai}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">
                กดฟังเสียงและตอบคำถามด้านล่าง
              </p>
            )}
          </div>
        </div>

        {/* Question */}
        <div className="mb-6">
          <h4 className="font-semibold text-lg mb-4">{question.question}</h4>

          <RadioGroup 
            value={selectedAnswer?.toString()} 
            onValueChange={(value) => setSelectedAnswer(parseInt(value))}
            disabled={showResult}
          >
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label 
                  htmlFor={`option-${index}`}
                  className={`flex-1 cursor-pointer p-3 rounded border transition-colors ${
                    showResult && index === question.correct
                      ? 'border-green-500 bg-green-50 dark:bg-green-950'
                      : showResult && index === selectedAnswer
                      ? 'border-red-500 bg-red-50 dark:bg-red-950'
                      : 'border-border hover:border-primary'
                  }`}
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Result */}
        {showResult && (
          <div className={`p-4 rounded-lg border mb-6 ${
            isCorrect 
              ? 'bg-green-50 dark:bg-green-950 border-green-500' 
              : 'bg-red-50 dark:bg-red-950 border-red-500'
          }`}>
            <div className="flex items-start gap-3">
              {isCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              )}
              <div>
                <h4 className="font-semibold mb-2">
                  {isCorrect ? 'ถูกต้อง! 🎉' : 'ลองใหม่อีกครั้ง'}
                </h4>
                <p className="text-sm">{question.explanation}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          {!showResult ? (
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
            >
              ส่งคำตอบ
            </Button>
          ) : (
            <Button size="lg" onClick={handleNext}>
              {currentIndex < questions.length - 1 ? 'ข้อถัดไป' : 'ไปต่อ'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
