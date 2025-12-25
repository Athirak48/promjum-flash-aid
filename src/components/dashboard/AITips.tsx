import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, X, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface AITipsProps {
  tips?: string[];
}

const defaultTips = [
  "💡 ลอง Shadowing Mode เพื่อฝึกออกเสียงตามเจ้าของภาษา",
  "🎯 ทบทวนคำศัพท์ที่จำยากในช่วงเช้าจะช่วยให้จำได้ดีขึ้น",
  "⚡ ใช้ Memory Tricks: เชื่อมคำศัพท์กับภาพหรือเรื่องราวที่คุ้นเคย",
  "🔄 ฝึกอย่างสม่ำเสมอดีกว่าฝึกนาน ๆ ครั้งนะ!"
];

export function AITips({
  tips = defaultTips
}: AITipsProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleNext = () => {
    setCurrentTipIndex(prev => (prev + 1) % tips.length);
  };

  return (
    <Card className="bg-black/30 backdrop-blur-xl border-white/10 rounded-[2rem] relative overflow-hidden group p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 via-violet-400 to-pink-400 opacity-70" />
      <CardContent className="p-0 flex items-start gap-4 relative z-10">
        <div className="p-3 rounded-2xl bg-purple-400/30 border border-purple-300/40 flex-shrink-0">
          <Sparkles className="w-6 h-6 text-yellow-200 fill-yellow-200" />
        </div>

        <div className="flex-1 pt-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg text-white">
              AI Learning Tips
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNext}
                className="h-7 text-xs hover:bg-white/10 text-white/80 hover:text-white rounded-full px-3 border border-white/20"
              >
                Next Tip
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsVisible(false)}
                className="h-7 w-7 hover:bg-white/10 text-white/60 hover:text-white rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <p className="text-white/80 text-sm leading-relaxed font-medium">
            {tips[currentTipIndex]}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}