import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface QuizQuestion {
  type: 'listen' | 'fill-blank' | 'speak';
  question: string;
  options?: string[];
  correctAnswer: string;
}

interface QuizModeProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
}

export const QuizMode = ({ questions, onComplete }: QuizModeProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);

  const question = questions[currentQuestion];

  const handleSubmit = () => {
    const userAnswer = question.options ? selectedOption : answer;
    const correct = userAnswer.toLowerCase() === question.correctAnswer.toLowerCase();
    
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setAnswer('');
      setSelectedOption('');
      setShowFeedback(false);
      setIsCorrect(false);
    } else {
      onComplete(score);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              คำถาม {currentQuestion + 1} / {questions.length}
            </span>
            <span className="text-sm font-medium">
              คะแนน: {score} / {questions.length}
            </span>
          </div>

          <div className="p-4 bg-accent rounded-lg">
            <p className="text-lg font-medium">{question.question}</p>
          </div>

          {question.options ? (
            <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
              {question.options.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent">
                  <RadioGroupItem value={option} id={`option-${idx}`} />
                  <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <Input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="พิมพ์คำตอบที่นี่..."
              className="text-lg"
            />
          )}

          {showFeedback && (
            <Card className={`p-4 ${isCorrect ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'}`}>
              <div className="flex items-center gap-2">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-green-500">ถูกต้อง!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="font-medium text-red-500">
                      ไม่ถูกต้อง คำตอบที่ถูกคือ: {question.correctAnswer}
                    </span>
                  </>
                )}
              </div>
            </Card>
          )}

          <div className="flex gap-2">
            {!showFeedback ? (
              <Button 
                onClick={handleSubmit} 
                className="flex-1"
                disabled={!answer && !selectedOption}
              >
                ตรวจคำตอบ
              </Button>
            ) : (
              <Button onClick={handleNext} className="flex-1">
                {currentQuestion < questions.length - 1 ? (
                  <>
                    คำถามถัดไป
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  'เสร็จสิ้น'
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">💡 คำแนะนำ</h3>
          <p className="text-sm text-muted-foreground">
            ตอบคำถามให้ครบทุกข้อเพื่อทดสอบความเข้าใจในคำศัพท์วันนี้
          </p>
        </div>
      </Card>
    </div>
  );
};
