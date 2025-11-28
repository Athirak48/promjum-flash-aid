import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Gamepad2, Brain, Headphones, Puzzle, Eye, ArrowRight, RotateCcw, Trophy } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type GameType = 'quiz' | 'matching' | 'listen' | 'hangman' | 'vocabBlinder';

interface GameOption {
    id: GameType;
    name: string;
    nameEn: string;
    description: string;
    descriptionEn: string;
    icon: React.ReactNode;
    color: string;
}

export default function AIListeningGameSelectionPage() {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameComplete, setGameComplete] = useState(false);
    const [gameScore, setGameScore] = useState({ correct: 0, total: 10 });

    const games: GameOption[] = [
        {
            id: 'quiz',
            name: 'แบบทดสอบ',
            nameEn: 'Quiz',
            description: 'ตอบคำถามเลือกตอบ',
            descriptionEn: 'Answer multiple choice questions',
            icon: <Brain className="w-8 h-8" />,
            color: 'bg-blue-50 text-blue-500'
        },
        {
            id: 'matching',
            name: 'จับคู่',
            nameEn: 'Matching',
            description: 'จับคู่คำศัพท์กับความหมาย',
            descriptionEn: 'Match words with meanings',
            icon: <Puzzle className="w-8 h-8" />,
            color: 'bg-purple-50 text-purple-500'
        },
        {
            id: 'listen',
            name: 'ฟังแล้วเลือก',
            nameEn: 'Listen & Choose',
            description: 'ฟังเสียงแล้วเลือกคำที่ถูกต้อง',
            descriptionEn: 'Listen and choose the correct word',
            icon: <Headphones className="w-8 h-8" />,
            color: 'bg-green-50 text-green-500'
        },
        {
            id: 'hangman',
            name: 'เดาคำ',
            nameEn: 'Hangman',
            description: 'เดาตัวอักษรเพื่อสะกดคำ',
            descriptionEn: 'Guess letters to spell words',
            icon: <Gamepad2 className="w-8 h-8" />,
            color: 'bg-orange-50 text-orange-500'
        },
        {
            id: 'vocabBlinder',
            name: 'เติมคำ',
            nameEn: 'Vocab Blinder',
            description: 'เติมตัวอักษรที่หายไป',
            descriptionEn: 'Fill in the missing letters',
            icon: <Eye className="w-8 h-8" />,
            color: 'bg-pink-50 text-pink-500'
        }
    ];

    const handlePlayGame = (gameId: GameType) => {
        setSelectedGame(gameId);
        setIsPlaying(true);
        // Simulate game completion after 2 seconds (in real app, this would be the actual game)
        setTimeout(() => {
            setIsPlaying(false);
            setGameComplete(true);
            setGameScore({ correct: Math.floor(Math.random() * 4) + 6, total: 10 });
        }, 2000);
    };

    const handleSelectNewGame = () => {
        setSelectedGame(null);
        setGameComplete(false);
        setIsPlaying(false);
    };

    const handlePlayAgain = () => {
        if (selectedGame) {
            handlePlayGame(selectedGame);
        }
    };

    // Game Summary View
    if (gameComplete && selectedGame) {
        const currentGame = games.find(g => g.id === selectedGame);
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <header className="border-b bg-card sticky top-0 z-10">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={handleSelectNewGame}>
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <h1 className="text-2xl font-bold">
                                {language === 'th' ? 'สรุปผลเกม' : 'Game Summary'}
                            </h1>
                        </div>
                    </div>
                </header>

                <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center">
                    <Card className="w-full max-w-md p-8 text-center space-y-6">
                        <Trophy className="w-16 h-16 text-yellow-500 mx-auto" />
                        <h2 className="text-2xl font-bold">
                            {language === 'th' ? currentGame?.name : currentGame?.nameEn}
                        </h2>
                        <div className="text-5xl font-bold text-primary">
                            {gameScore.correct}/{gameScore.total}
                        </div>
                        <p className="text-muted-foreground">
                            {language === 'th' 
                                ? `คุณตอบถูก ${gameScore.correct} จาก ${gameScore.total} ข้อ`
                                : `You got ${gameScore.correct} out of ${gameScore.total} correct`}
                        </p>

                        <div className="flex flex-col gap-3 pt-4">
                            <Button variant="outline" onClick={handleSelectNewGame}>
                                <Gamepad2 className="w-4 h-4 mr-2" />
                                {language === 'th' ? 'เลือกเกมใหม่' : 'Select New Game'}
                            </Button>
                            <Button variant="outline" onClick={handlePlayAgain}>
                                <RotateCcw className="w-4 h-4 mr-2" />
                                {language === 'th' ? 'ทบทวนอีกครั้ง' : 'Play Again'}
                            </Button>
                            <Button onClick={() => navigate('/ai-listening-section4-intro')}>
                                {language === 'th' ? 'ไปกันต่อ' : 'Continue'}
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </Card>
                </main>
            </div>
        );
    }

    // Playing View
    if (isPlaying) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                    <p className="text-lg font-medium">
                        {language === 'th' ? 'กำลังเล่นเกม...' : 'Playing game...'}
                    </p>
                </div>
            </div>
        );
    }

    // Game Selection View
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="border-b bg-card sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/ai-listening-section3-intro')}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                            {language === 'th' ? 'เลือกเกม' : 'Select Game'}
                        </h1>
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto space-y-4">
                    {games.map((game) => (
                        <Card
                            key={game.id}
                            className="p-6 cursor-pointer hover:shadow-md transition-all hover:scale-[1.02]"
                            onClick={() => handlePlayGame(game.id)}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-4 rounded-xl ${game.color}`}>
                                    {game.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg">
                                        {language === 'th' ? game.name : game.nameEn}
                                    </h3>
                                    <p className="text-muted-foreground text-sm">
                                        {language === 'th' ? game.description : game.descriptionEn}
                                    </p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-muted-foreground" />
                            </div>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    );
}
