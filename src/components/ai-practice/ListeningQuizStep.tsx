import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Volume2, CheckCircle2, XCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface ListeningQuizStepProps {
  vocab: string[];
  onNext: () => void;
}

const mockQuestions = [
  {
    story: "Yesterday, I had an important meeting with my colleagues. We discussed the project deadline and the budget. Everyone agreed to postpone the presentation until next week.",
    storyThai: "เมื่อวานฉันมีการประชุมสำคัญกับเพื่อนร่วมงาน เราพูดคุยเกี่ยวกับกำหนดเวลาโครงการและงบประมาณ ทุกคนเห็นด้วยที่จะเลื่อนการนำเสนอไปสัปดาห์หน้า",
    question: "What did they decide to do?",
    options: [
      "Cancel the meeting",
      "Postpone the presentation",
      "Increase the budget",
      "Change the deadline"
    ],
    correct: 1,
    explanation: "คำตอบคือ 'Postpone the presentation' เพราะในเรื่องระบุว่า everyone agreed to postpone the presentation"
  },
  {
    story: "The report needs to be revised before we can submit it. I will forward the document to you after I confirm all the details with the manager.",
    storyThai: "รายงานต้องได้รับการแก้ไขก่อนที่เราจะส่ง ฉันจะส่งต่อเอกสารให้คุณหลังจากที่ฉันยืนยันรายละเอียดทั้งหมดกับผู้จัดการ",
    question: "What will happen to the document?",
    options: [
      "It will be deleted",
      "It will be revised and forwarded",
      "It will be approved immediately",
      "It will be cancelled"
    ],
    correct: 1,
    explanation: "คำตอบคือ 'It will be revised and forwarded' เพราะเรื่องระบุว่าต้อง revise และจะ forward หลังจาก confirm"
  },
  {
    story: "This is an urgent matter with high priority. We need to approve the plan today so we can start working on it tomorrow.",
    storyThai: "นี่เป็นเรื่องเร่งด่วนที่มีความสำคัญสูง เราต้องอนุมัติแผนวันนี้เพื่อที่เราจะได้เริ่มทำงานพรุ่งนี้",
    question: "How is this matter described?",
    options: [
      "Low priority and delayed",
      "Urgent and high priority",
      "Cancelled and postponed",
      "Normal and scheduled"
    ],
    correct: 1,
    explanation: "คำตอบคือ 'Urgent and high priority' ตรงกับที่ระบุในเรื่องว่า urgent matter with high priority"
  },
  {
    story: "Can you help me check the schedule? I need to confirm if the meeting room is available for our presentation next Monday.",
    storyThai: "คุณช่วยฉันเช็คกำหนดการได้ไหม ฉันต้องยืนยันว่าห้องประชุมว่างสำหรับการนำเสนอของเราวันจันทร์หน้า",
    question: "What does the speaker need to confirm?",
    options: [
      "The project deadline",
      "The meeting room availability",
      "The budget approval",
      "The report revision"
    ],
    correct: 1,
    explanation: "คำตอบคือ 'The meeting room availability' เพราะต้องการยืนยันว่าห้องประชุมว่าง"
  },
  {
    story: "My colleague asked me to revise the report and forward it to the team. This project has a tight deadline, so we need to work efficiently.",
    storyThai: "เพื่อนร่วมงานขอให้ฉันแก้ไขรายงานและส่งต่อให้ทีม โครงการนี้มีกำหนดเวลาแน่น ดังนั้นเราต้องทำงานอย่างมีประสิทธิภาพ",
    question: "What is mentioned about the project?",
    options: [
      "It has unlimited time",
      "It was cancelled",
      "It has a tight deadline",
      "It was postponed"
    ],
    correct: 2,
    explanation: "คำตอบคือ 'It has a tight deadline' ตรงกับที่ระบุในเรื่องว่า tight deadline"
  }
];

export default function ListeningQuizStep({ vocab, onNext }: ListeningQuizStepProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showStory, setShowStory] = useState(false);

  const question = mockQuestions[currentQuestion];

  const handlePlayAudio = () => {
    console.log('Playing story audio:', question.story);
  };

  const handleSubmit = () => {
    setShowResult(true);
    setShowStory(true);
  };

  const handleNext = () => {
    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
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
          <Badge>ข้อที่ {currentQuestion + 1}/{mockQuestions.length}</Badge>
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
              {currentQuestion < mockQuestions.length - 1 ? 'ข้อถัดไป' : 'ไปต่อ'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
