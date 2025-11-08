import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, X } from 'lucide-react';
import { useState } from 'react';

interface AITipsProps {
  tips?: string[];
}

const defaultTips = [
  "💡 ลอง Shadowing Mode เพื่อฝึกออกเสียงตามเจ้าของภาษา",
  "🎯 ทบทวนคำศัพท์ที่จำยากในช่วงเช้าจะช่วยให้จำได้ดีขึ้น",
  "⚡ ใช้ Memory Tricks: เชื่อมคำศัพท์กับภาพหรือเรื่องราวที่คุ้นเคย",
  "🔄 ฝึกอย่างสม่ำเสมอดีกว่าฝึกนาน ๆ ครั้งนะ!",
];

export function AITips({ tips = defaultTips }: AITipsProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const currentTip = tips[currentTipIndex];

  if (!isVisible) return null;

  const handleNext = () => {
    setCurrentTipIndex((prev) => (prev + 1) % tips.length);
  };

  return (
    <Card className="bg-gradient-primary/10 backdrop-blur-sm shadow-soft border border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/20 flex-shrink-0 animate-pulse">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-primary mb-1">
              💫 AI Tips & Tricks
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {currentTip}
            </p>
            
            <button
              onClick={handleNext}
              className="text-xs text-primary hover:text-primary-glow transition-colors mt-2 font-medium"
            >
              เคล็ดลับถัดไป →
            </button>
          </div>
          
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 rounded-lg hover:bg-muted/50 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
