import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Gamepad2 } from 'lucide-react';

interface FlashcardReviewStepProps {
  vocab: string[];
  phrases: any[];
  onNext: () => void;
}

export default function FlashcardReviewStep({ vocab, phrases, onNext }: FlashcardReviewStepProps) {
  const [round, setRound] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [wrongCards, setWrongCards] = useState<number[]>([]);
  const [showGameSelection, setShowGameSelection] = useState(false);

  const allCards = [
    ...vocab.map(v => ({ front: v, back: 'คำแปล' })),
    ...phrases.map(p => ({ front: p.text, back: p.thai }))
  ];

  const currentCards = round === 1 
    ? allCards 
    : wrongCards.map(i => allCards[i]);

  const handleWrong = () => {
    if (!wrongCards.includes(currentIndex)) {
      setWrongCards([...wrongCards, currentIndex]);
    }
    handleNext();
  };

  const handleCorrect = () => {
    handleNext();
  };

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < currentCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      if (round === 1 && wrongCards.length > 0) {
        // Start round 2
        setRound(2);
        setCurrentIndex(0);
        setWrongCards([]);
      } else {
        // Show game selection
        setShowGameSelection(true);
      }
    }
  };

  if (showGameSelection) {
    return (
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">เยี่ยมมาก! 🎉</h2>
        <p className="text-lg text-muted-foreground mb-8">
          คุณผ่านการทบทวนครบแล้ว ต่อไปเลือกเกม 1 เกมเพื่อเสริมความจำ
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 hover:shadow-lg transition-all cursor-pointer hover:border-primary">
            <Gamepad2 className="w-12 h-12 text-primary mb-4 mx-auto" />
            <h3 className="font-bold text-xl mb-2">Flash Fuse</h3>
            <p className="text-sm text-muted-foreground">เกมเน้นความเร็วในการจำคำศัพท์</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all cursor-pointer hover:border-primary">
            <Gamepad2 className="w-12 h-12 text-primary mb-4 mx-auto" />
            <h3 className="font-bold text-xl mb-2">Sentence Scramble</h3>
            <p className="text-sm text-muted-foreground">เรียงประโยค 2 ประโยคที่เรียนมา</p>
          </Card>
        </div>

        <Button size="lg" onClick={onNext}>
          ข้ามเกมและไปต่อ
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Challenge: ฝังศัพท์และประโยค</h2>
        <div className="flex items-center justify-center gap-4 text-muted-foreground">
          <Badge variant={round === 1 ? "default" : "secondary"}>รอบที่ {round}</Badge>
          <span>การ์ดที่ {currentIndex + 1}/{currentCards.length}</span>
        </div>
        {round === 2 && (
          <p className="text-sm text-primary mt-2">สู้ๆ นะ! เรามาทบทวนอีกรอบกัน</p>
        )}
      </div>

      {/* Flashcard */}
      <div 
        className="perspective-1000 mb-8 cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <Card 
          className={`relative h-80 transition-all duration-500 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front */}
          <div className={`absolute inset-0 flex items-center justify-center p-8 backface-hidden ${
            isFlipped ? 'invisible' : 'visible'
          }`}>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">คลิกเพื่อดูคำตอบ</p>
              <p className="text-3xl font-bold">{currentCards[currentIndex]?.front}</p>
            </div>
          </div>

          {/* Back */}
          <div className={`absolute inset-0 flex items-center justify-center p-8 backface-hidden rotate-y-180 bg-primary/5 ${
            isFlipped ? 'visible' : 'invisible'
          }`}>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">คำตอบ</p>
              <p className="text-3xl font-bold">{currentCards[currentIndex]?.back}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Actions */}
      {isFlipped && (
        <div className="flex gap-4 justify-center">
          <Button 
            variant="outline" 
            size="lg"
            onClick={handleWrong}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            จำไม่ได้
          </Button>
          <Button 
            size="lg"
            onClick={handleCorrect}
          >
            จำได้!
          </Button>
        </div>
      )}
    </div>
  );
}
