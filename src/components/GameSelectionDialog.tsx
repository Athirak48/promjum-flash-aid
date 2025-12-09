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
      <DialogContent className="max-w-4xl w-[95vw] max-h-[85vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-white/50 rounded-2xl p-4 sm:p-6 shadow-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="flex items-center justify-center gap-2 text-lg sm:text-xl font-bold">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-md">
              <GamepadIcon className="h-4 w-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              เลือกเกมที่ต้องการเล่น
            </span>
          </DialogTitle>
          <p className="text-center text-muted-foreground mt-1 text-xs sm:text-sm">
            ฝึกฝนภาษาอังกฤษผ่านมินิเกมแสนสนุก
          </p>
        </DialogHeader>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-1">
          {games.map((game, index) => {
            const IconComponent = game.icon;
            return (
              <Card
                key={game.id}
                className={`
                  cursor-pointer transition-all duration-300 ease-out
                  hover:scale-110 hover:shadow-xl hover:-translate-y-2 border-2 border-transparent
                  hover:border-white/50 active:scale-95
                  bg-gradient-to-br ${game.bgGradient}
                  group relative overflow-hidden
                  animate-in slide-in-from-bottom-4 fade-in duration-500
                `}
                style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'backwards' }}
                onClick={() => handleGameSelect(game.id as any)}
              >
                {/* Animated background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Floating icon background */}
                <div className="absolute top-0 right-0 p-1.5 opacity-10 group-hover:opacity-30 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12">
                  <IconComponent className="h-8 w-8" />
                </div>

                <CardHeader className="text-center pb-1 pt-3 relative z-10 p-2">
                  <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2
                    bg-gradient-to-br ${game.gradient} shadow-md
                    group-hover:shadow-lg group-hover:scale-110 group-hover:rotate-3
                    transition-all duration-300 ease-out
                    group-hover:animate-pulse
                  `}>
                    <IconComponent className="h-5 w-5 text-white drop-shadow" />
                  </div>
                  <CardTitle className="text-xs font-bold text-gray-800 leading-tight group-hover:text-gray-900 transition-colors">{game.title}</CardTitle>
                  <CardDescription className="font-medium text-[9px] text-primary/80 flex items-center justify-center gap-1 mt-0.5">
                    <Sparkles className="w-2.5 h-2.5 group-hover:animate-spin" style={{ animationDuration: '3s' }} />
                    {game.subtitle}
                  </CardDescription>
                </CardHeader>

                <CardContent className="text-center pt-0 pb-3 relative z-10 px-2">
                  <p className="text-[9px] text-gray-600 mb-2 min-h-[22px] line-clamp-2 leading-tight group-hover:text-gray-700 transition-colors">
                    {game.description}
                  </p>
                  <Button
                    className={`
                      w-full bg-gradient-to-r ${game.gradient} text-white border-0
                      shadow-md group-hover:shadow-lg transition-all duration-300 ease-out
                      rounded-lg h-7 text-[10px] font-bold
                      group-hover:scale-105 active:scale-95
                      relative overflow-hidden
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGameSelect(game.id as any);
                    }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-1">
                      <GamepadIcon className="w-3 h-3" />
                      เริ่มเล่น
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
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