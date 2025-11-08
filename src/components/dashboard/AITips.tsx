import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, X } from 'lucide-react';
import { useState } from 'react';
interface AITipsProps {
  tips?: string[];
}
const defaultTips = ["💡 ลอง Shadowing Mode เพื่อฝึกออกเสียงตามเจ้าของภาษา", "🎯 ทบทวนคำศัพท์ที่จำยากในช่วงเช้าจะช่วยให้จำได้ดีขึ้น", "⚡ ใช้ Memory Tricks: เชื่อมคำศัพท์กับภาพหรือเรื่องราวที่คุ้นเคย", "🔄 ฝึกอย่างสม่ำเสมอดีกว่าฝึกนาน ๆ ครั้งนะ!"];
export function AITips({
  tips = defaultTips
}: AITipsProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const currentTip = tips[currentTipIndex];
  if (!isVisible) return null;
  const handleNext = () => {
    setCurrentTipIndex(prev => (prev + 1) % tips.length);
  };
  return <Card className="bg-gradient-primary/10 backdrop-blur-sm shadow-soft border border-primary/20">
      
    </Card>;
}