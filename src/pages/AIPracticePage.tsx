import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import VocabSelectionStep from '@/components/ai-practice/VocabSelectionStep';
import PowerPhrasesStep from '@/components/ai-practice/PowerPhrasesStep';
import FlashcardReviewStep from '@/components/ai-practice/FlashcardReviewStep';
import PronunciationStep from '@/components/ai-practice/PronunciationStep';
import ListeningQuizStep from '@/components/ai-practice/ListeningQuizStep';
import RoleplayStep from '@/components/ai-practice/RoleplayStep';

export default function AIPracticePage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedVocab, setSelectedVocab] = useState<string[]>([]);
  const [generatedPhrases, setGeneratedPhrases] = useState<any[]>([]);

  const handleVocabSelected = (vocab: string[]) => {
    setSelectedVocab(vocab);
    // Mock: Generate 2 phrases using selected vocab
    setGeneratedPhrases([
      {
        text: "Can you help me with this problem?",
        thai: "คุณช่วยฉันแก้ปัญหานี้ได้ไหม",
        context: "ใช้เมื่อต้องการขอความช่วยเหลือในสถานการณ์ทำงานหรือเรียน (Formal/Casual)"
      },
      {
        text: "I'm looking forward to meeting you.",
        thai: "ฉันรอคอยที่จะได้พบคุณ",
        context: "ใช้เมื่อต้องการแสดงความตั้งใจรอคอยการพบกัน (Formal)"
      }
    ]);
    setCurrentStep(2);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <VocabSelectionStep onNext={handleVocabSelected} />;
      case 2:
        return <PowerPhrasesStep phrases={generatedPhrases} onNext={() => setCurrentStep(3)} />;
      case 3:
        return <FlashcardReviewStep vocab={selectedVocab} phrases={generatedPhrases} onNext={() => setCurrentStep(4)} />;
      case 4:
        return <PronunciationStep phrases={generatedPhrases} onNext={() => setCurrentStep(5)} />;
      case 5:
        return <ListeningQuizStep vocab={selectedVocab} onNext={() => setCurrentStep(6)} />;
      case 6:
        return <RoleplayStep vocab={selectedVocab} phrases={generatedPhrases} onComplete={() => navigate('/dashboard')} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => currentStep === 1 ? navigate('/dashboard') : setCurrentStep(currentStep - 1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                AI Practice Journey
              </h1>
              <p className="text-sm text-muted-foreground">
                Step {currentStep} of 6
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <div
                  key={step}
                  className={`h-2 w-8 rounded-full transition-colors ${
                    step <= currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {renderStep()}
      </main>
    </div>
  );
}
