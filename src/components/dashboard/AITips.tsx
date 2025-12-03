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
    <Card className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl shadow-soft border border-primary/20 rounded-[2rem] relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50" />
      <CardContent className="p-6 flex items-start gap-4 relative z-10">
        <div className="p-3 rounded-2xl bg-white shadow-md flex-shrink-0 animate-bounce-slow">
          <Sparkles className="w-6 h-6 text-yellow-500 fill-yellow-500" />
        </div>

        <div className="flex-1 pt-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
              AI Learning Tips
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNext}
                className="h-7 text-xs hover:bg-primary/10 text-primary rounded-full px-3"
              >
                Next Tip
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsVisible(false)}
                className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <p className="text-foreground/80 text-sm leading-relaxed font-medium animate-fade-in">
            {tips[currentTipIndex]}
          </p>
        </div>
      </CardContent>

      {/* Decorative background elements */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
      <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-colors" />
    </Card>
  );
}