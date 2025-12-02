import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Target, GamepadIcon, Headphones, Skull, Eye, Sparkles, Search } from 'lucide-react';

interface GameSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectGame: (gameType: 'quiz' | 'matching' | 'listen' | 'hangman' | 'vocabBlinder' | 'wordSearch') => void;
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
      gradient: 'from-pink-500 to-rose-500',
      bgGradient: 'from-pink-50 to-rose-50',
      hoverColor: 'hover:bg-pink-600'
    },
    {
      id: 'hangman',
      title: 'Hangman Master',
      subtitle: '🎯 ทายคำศัพท์',
      description: 'ทายตัวอักษรในคำศัพท์ให้ถูกต้อง',
      icon: Skull,
      color: 'bg-orange-500',
      gradient: 'from-orange-500 to-amber-500',
      bgGradient: 'from-orange-50 to-amber-50',
      hoverColor: 'hover:bg-orange-600'
    },
    {
      id: 'vocabBlinder',
      title: 'Vocab Blinder',
      subtitle: '👁️ เติมตัวอักษร',
      description: 'เติมตัวอักษรที่หายไปให้ถูกต้อง',
      icon: Eye,
      color: 'bg-teal-500',
      gradient: 'from-teal-500 to-emerald-500',
      bgGradient: 'from-teal-50 to-emerald-50',
      hoverColor: 'hover:bg-teal-600'
    },
    {
      id: 'quiz',
      title: 'Quiz Game',
      subtitle: 'Multiple Choice',
      description: 'ตอบคำถามแบบเลือกตอบ 4 ตัวเลือก',
      icon: Brain,
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-indigo-500',
      bgGradient: 'from-blue-50 to-indigo-50',
      hoverColor: 'hover:bg-blue-600'
    },
    {
      id: 'matching',
      title: 'Matching Game',
      subtitle: 'เกมจับคู่',
      description: 'จับคู่คำถามกับคำตอบที่ถูกต้อง',
      icon: Target,
      color: 'bg-purple-500',
      gradient: 'from-purple-500 to-violet-500',
      bgGradient: 'from-purple-50 to-violet-50',
      hoverColor: 'hover:bg-purple-600'
    },
    {
      id: 'wordSearch',
      title: 'Word Search',
      subtitle: '🔍 ค้นหาคำศัพท์',
      description: 'ค้นหาคำศัพท์ที่ซ่อนอยู่ในตารางตัวอักษร',
      icon: Search,
      color: 'bg-cyan-500',
      gradient: 'from-cyan-500 to-blue-500',
      bgGradient: 'from-cyan-50 to-blue-50',
      hoverColor: 'hover:bg-cyan-600'
    }
  ];

  const handleGameSelect = (gameType: 'quiz' | 'matching' | 'listen' | 'hangman' | 'vocabBlinder' | 'wordSearch') => {
    onSelectGame(gameType);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-xl border-white/50 rounded-[1.25rem] p-4 shadow-2xl">
        <DialogHeader className="mb-2">
          <DialogTitle className="flex items-center justify-center gap-2 text-xl font-bold">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-md">
              <GamepadIcon className="h-4 w-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              เลือกเกมที่ต้องการเล่น
            </span>
          </DialogTitle>
          <p className="text-center text-muted-foreground mt-0.5 text-xs">
            ฝึกฝนภาษาอังกฤษผ่านมินิเกมแสนสนุก
          </p>
        </DialogHeader>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 p-0.5">
          {games.map((game) => {
            const IconComponent = game.icon;
            return (
              <Card
                key={game.id}
                className={`
                  cursor-pointer transition-all duration-300
                  hover:scale-105 hover:shadow-lg border-2 border-transparent
                  bg-gradient-to-br ${game.bgGradient}
                  group relative overflow-hidden
                `}
                onClick={() => handleGameSelect(game.id as any)}
              >
                <div className="absolute top-0 right-0 p-1.5 opacity-10 group-hover:opacity-20 transition-opacity">
                  <IconComponent className="h-12 w-12" />
                </div>

                <CardHeader className="text-center pb-1 pt-3 relative z-10 p-2">
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2
                    bg-gradient-to-br ${game.gradient} shadow-sm
                    group-hover:shadow-glow transition-all duration-300
                  `}>
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-sm font-bold text-gray-800 leading-tight">{game.title}</CardTitle>
                  <CardDescription className="font-medium text-[9px] text-primary/80 flex items-center justify-center gap-1 mt-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    {game.subtitle}
                  </CardDescription>
                </CardHeader>

                <CardContent className="text-center pt-0 pb-3 relative z-10 px-2">
                  <p className="text-[9px] text-gray-600 mb-2 min-h-[24px] line-clamp-2 leading-tight">
                    {game.description}
                  </p>
                  <Button
                    className={`
                      w-full bg-gradient-to-r ${game.gradient} text-white border-0
                      shadow-sm group-hover:shadow-md transition-all duration-300
                      rounded-md h-7 text-[10px] font-semibold
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGameSelect(game.id as any);
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