import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// ... imports
import { Brain, Target, GamepadIcon, Headphones, Skull, Eye, Sparkles, Search, Shuffle, Sword, Hexagon } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

interface GameSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectGame: (gameType: 'quiz' | 'matching' | 'listen' | 'hangman' | 'vocabBlinder' | 'wordSearch' | 'scramble' | 'ninja' | 'honeycomb') => void;
}

export function GameSelectionDialog({ open, onOpenChange, onSelectGame }: GameSelectionDialogProps) {
  const { trackButtonClick } = useAnalytics();

  const games = [
    {
      id: 'honeycomb',
      title: 'Honey Hive',
      subtitle: '🐝 เชื่อมคำศัพท์',
      description: 'ลากเส้นเชื่อมตัวอักษรเพื่อสร้างคำศัพท์',
      icon: Hexagon,
      color: 'bg-yellow-500',
      gradient: 'from-yellow-500 to-amber-500',
      bgGradient: 'from-yellow-50 to-amber-50',
      hoverColor: 'hover:bg-yellow-600'
    },
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
    },
    {
      id: 'scramble',
      title: 'Word Scramble',
      subtitle: '🔀 เรียงตัวอักษร',
      description: 'เรียงตัวอักษรให้เป็นคำศัพท์ที่ถูกต้อง',
      icon: Shuffle,
      color: 'bg-lime-500',
      gradient: 'from-lime-500 to-green-500',
      bgGradient: 'from-lime-50 to-green-50',
      hoverColor: 'hover:bg-lime-600'
    },
    {
      id: 'ninja',
      title: 'Ninja Slice',
      subtitle: '⚔️ ฟันคำศัพท์',
      description: 'ฟันลูกโป่งคำศัพท์ที่ถูกต้องตามความหมาย',
      icon: Sword,
      color: 'bg-red-600',
      gradient: 'from-red-600 to-rose-700',
      bgGradient: 'from-red-50 to-rose-50',
      hoverColor: 'hover:bg-red-700'
    }
  ];

  const handleGameSelect = (gameType: 'quiz' | 'matching' | 'listen' | 'hangman' | 'vocabBlinder' | 'wordSearch' | 'scramble' | 'ninja' | 'honeycomb') => {
    trackButtonClick(gameType, 'game-selection');
    onSelectGame(gameType);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[90vw] bg-gradient-to-br from-pink-50/95 via-purple-50/95 to-blue-50/95 backdrop-blur-xl border-2 border-white/60 rounded-2xl p-3 shadow-[0_20px_60px_rgba(219,39,119,0.15)]">
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-pink-300/30 to-purple-300/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-blue-300/20 to-indigo-300/20 rounded-full blur-3xl" />

        <DialogHeader className="mb-2 relative z-10">
          <DialogTitle className="flex items-center justify-center gap-2 text-base font-bold">
            <div className="p-1 rounded-lg bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 shadow-lg shadow-pink-300/50 animate-pulse">
              <GamepadIcon className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm font-extrabold">
              เลือกเกมที่ต้องการเล่น
            </span>
          </DialogTitle>
          <p className="text-center text-gray-700 mt-1 text-[11px] sm:text-xs font-semibold">
            ฝึกฝนภาษาอังกฤษผ่านมินิเกมแสนสนุก
          </p>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-2">
          {games.map((game, index) => {
            const IconComponent = game.icon;
            return (
              <Card
                key={game.id}
                className={`
                  cursor-pointer transition-all duration-300 ease-out
                  hover:scale-105 hover:shadow-2xl hover:-translate-y-1 border-2
                  hover:border-white active:scale-95
                  bg-white/80 backdrop-blur-sm
                  group relative overflow-hidden rounded-[1.5rem]
                  animate-in slide-in-from-bottom-4 fade-in duration-500
                  shadow-md shadow-gray-200/50
                `}
                style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'backwards' }}
                onClick={() => handleGameSelect(game.id as any)}
              >
                {/* Soft gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${game.bgGradient} opacity-0 group-hover:opacity-90 transition-opacity duration-500`} />

                {/* Floating sparkles */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
                </div>

                <CardHeader className="text-center pb-0.5 pt-2 relative z-10 px-2">
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1
                    bg-gradient-to-br ${game.gradient} shadow-md shadow-${game.color.replace('bg-', '')}/40
                    group-hover:shadow-xl group-hover:scale-110 group-hover:-rotate-3
                    transition-all duration-300 ease-out
                  `}>
                    <IconComponent className="h-3.5 w-3.5 text-white drop-shadow-lg" />
                  </div>
                  <CardTitle className="text-[10px] font-extrabold text-gray-800 leading-tight group-hover:text-gray-900 transition-colors mb-0">{game.title}</CardTitle>
                  <CardDescription className="font-bold text-[8px] text-gray-700 flex items-center justify-center gap-1">
                    {game.subtitle}
                  </CardDescription>
                </CardHeader>

                <CardContent className="text-center pt-0 pb-2 relative z-10 px-2">
                  <p className="text-[8px] text-gray-700 mb-1 min-h-[16px] line-clamp-2 leading-snug group-hover:text-gray-800 transition-colors font-medium">
                    {game.description}
                  </p>
                  <Button
                    className={`
                      w-full bg-gradient-to-r ${game.gradient} text-white border-0
                      shadow-md shadow-${game.color.replace('bg-', '')}/40 group-hover:shadow-lg transition-all duration-300 ease-out
                      rounded-lg h-6 text-[9px] font-extrabold
                      group-hover:scale-105 active:scale-95
                      relative overflow-hidden
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGameSelect(game.id as any);
                    }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-1">
                      <GamepadIcon className="w-2.5 h-2.5" />
                      เริ่มเล่น
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
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