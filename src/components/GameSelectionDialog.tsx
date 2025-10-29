import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Target, GamepadIcon, Headphones } from 'lucide-react';

interface GameSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectGame: (gameType: 'quiz' | 'matching' | 'listen') => void;
}

export function GameSelectionDialog({ open, onOpenChange, onSelectGame }: GameSelectionDialogProps) {
  const games = [
    {
      id: 'listen',
      title: 'Listen & Choose',
      subtitle: '🎧 ฟังและเลือกคำตอบ',
      description: 'ฟังเสียงคำศัพท์และเลือกคำตอบที่ถูกต้อง',
      icon: Headphones,
      color: 'bg-pink-500',
      hoverColor: 'hover:bg-pink-600'
    },
    {
      id: 'quiz',
      title: 'Quiz Game',
      subtitle: 'Multiple Choice',
      description: 'ตอบคำถามแบบเลือกตอบ 4 ตัวเลือก',
      icon: Brain,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600'
    },
    {
      id: 'matching',
      title: 'Matching Game',
      subtitle: 'เกมจับคู่',
      description: 'จับคู่คำถามกับคำตอบที่ถูกต้อง',
      icon: Target,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600'
    }
  ];

  const handleGameSelect = (gameType: 'quiz' | 'matching' | 'listen') => {
    onSelectGame(gameType);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <GamepadIcon className="h-6 w-6 text-purple-600" />
            เลือกเกมที่ต้องการเล่น
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {games.map((game) => {
            const IconComponent = game.icon;
            return (
              <Card 
                key={game.id}
                className="cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg border-2 hover:border-primary/50"
                onClick={() => handleGameSelect(game.id as 'quiz' | 'matching' | 'listen')}
              >
                <CardHeader className="text-center pb-2">
                  <div className={`w-16 h-16 ${game.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-lg">{game.title}</CardTitle>
                  <CardDescription className="text-sm font-medium text-primary">
                    {game.subtitle}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <p className="text-sm text-gray-600 mb-4">
                    {game.description}
                  </p>
                  <Button 
                    className={`w-full ${game.color} ${game.hoverColor} text-white`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGameSelect(game.id as 'quiz' | 'matching' | 'listen');
                    }}
                  >
                    เริ่มเล่น
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}