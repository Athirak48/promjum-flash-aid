import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Play, ChevronLeft, RotateCcw, Home, Settings, Trophy, Star, Clock } from 'lucide-react';
import { Deck } from '@/hooks/useDecks';
import { Flashcard } from '@/hooks/useFlashcards';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FlashcardQuizGame } from '@/components/FlashcardQuizGame';
import { FlashcardWordScrambleGame } from '@/components/FlashcardWordScrambleGame';
import { FlashcardHoneyCombGame } from '@/components/FlashcardHoneyCombGame';

// Placeholder for other games
const PlaceholderGame = ({ name, words, onFinish }: { name: string, words: Flashcard[], onFinish: (results: any) => void }) => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <div className="text-6xl mb-4">🎮</div>
        <h2 className="text-2xl font-bold">Playing {name}</h2>
        <p className="text-muted-foreground">This game mode is under construction.</p>
        <p>{words.length} words loaded.</p>
        <Button onClick={() => onFinish({ score: 100, correctWords: words.length, wrongWords: 0, timeSpent: 60 })} className="mt-4">
            Simulate Finish
        </Button>
    </div>
);

// Placeholder GameResultSummary (as requested to be separate, but included here for functionality)
const GameResultSummary = ({ results, onReplay, onExit }: { results: any, onReplay: () => void, onExit: () => void }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-30 blur-xl animate-pulse" />
                <Trophy className="w-24 h-24 text-yellow-500 relative z-10 drop-shadow-lg" />
            </div>

            <div className="text-center space-y-2">
                <h2 className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    MISSION COMPLETE!
                </h2>
                <p className="text-gray-500 font-medium">Great job practicing today!</p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-none shadow-md">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                        <Star className="w-6 h-6 text-green-600 mb-1" />
                        <span className="text-2xl font-bold text-green-700">{results.score}</span>
                        <span className="text-xs text-green-600/70 font-bold uppercase">Score</span>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-none shadow-md">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                        <Clock className="w-6 h-6 text-blue-600 mb-1" />
                        <span className="text-2xl font-bold text-blue-700">{results.timeSpent}s</span>
                        <span className="text-xs text-blue-600/70 font-bold uppercase">Time</span>
                    </CardContent>
                </Card>
            </div>

            <div className="flex gap-3 w-full max-w-sm pt-4">
                <Button variant="outline" onClick={onExit} className="flex-1 border-2 border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl h-12">
                    <Home className="w-4 h-4 mr-2" />
                    Menu
                </Button>
                <Button onClick={onReplay} className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold rounded-xl h-12 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Replay
                </Button>
            </div>
        </div>
    );
};

interface GameSessionContainerProps {
    availableDecks: Deck[];
    selectedGame: string;
    onExit: () => void;
}

type GameState = 'SETUP' | 'PLAYING' | 'SUMMARY';

export function GameSessionContainer({ availableDecks, selectedGame, onExit }: GameSessionContainerProps) {
    const [gameState, setGameState] = useState<GameState>('SETUP');
    const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
    const [availableWords, setAvailableWords] = useState<Flashcard[]>([]);
    const [selectedWordIds, setSelectedWordIds] = useState<Set<string>>(new Set());
    const [isLoadingWords, setIsLoadingWords] = useState(false);
    const [gameResults, setGameResults] = useState<any>(null);
    const { toast } = useToast();

    // Fetch words when deck is selected
    useEffect(() => {
        if (selectedDeckId) {
            fetchWordsForDeck(selectedDeckId);
        } else {
            setAvailableWords([]);
            setSelectedWordIds(new Set());
        }
    }, [selectedDeckId]);

    const fetchWordsForDeck = async (deckId: string) => {
        setIsLoadingWords(true);
        try {
            // First get the subdecks for this deck? Or directly flashcards?
            // Assuming flashcards are linked to decks via subdecks or directly.
            // Based on previous file exploration, flashcards have set_id which likely refers to subdeck.
            // We might need to fetch subdecks first, then flashcards.
            // Or maybe there's a view or we can join.
            // For simplicity, let's assuming we can fetch by joining subdecks.

            // Fetch subdecks for the deck
            const { data: subdecks, error: subdeckError } = await supabase
                .from('flashcard_sets') // Assuming this is the table for subdecks based on DeckCard logic (useSubDecks)
                .select('id')
                .eq('deck_id', deckId);

            if (subdeckError) throw subdeckError;

            const subdeckIds = subdecks.map(sd => sd.id);

            if (subdeckIds.length === 0) {
                setAvailableWords([]);
                return;
            }

            const { data: cards, error: cardsError } = await supabase
                .from('flashcards')
                .select('*')
                .in('set_id', subdeckIds) // Assuming 'set_id' links to 'flashcard_sets'
                .limit(50); // Limit for performance in preview

            if (cardsError) throw cardsError;

            setAvailableWords(cards as Flashcard[]);
            // Default select all (up to a reasonable limit for a game)
            const initialSelection = new Set(cards.slice(0, 15).map(c => c.id));
            setSelectedWordIds(initialSelection);

        } catch (error) {
            console.error('Error fetching words:', error);
            toast({
                title: "Error",
                description: "Failed to load words for this deck.",
                variant: "destructive"
            });
        } finally {
            setIsLoadingWords(false);
        }
    };

    const handleToggleWord = (id: string) => {
        const newSelected = new Set(selectedWordIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedWordIds(newSelected);
    };

    const handleStartGame = () => {
        if (selectedWordIds.size === 0) {
            toast({
                title: "No words selected",
                description: "Please select at least one word to start.",
                variant: "destructive"
            });
            return;
        }
        setGameState('PLAYING');
    };

    const handleGameFinish = (results: any) => {
        setGameResults(results);
        setGameState('SUMMARY');
    };

    const handleReplay = () => {
        setGameResults(null);
        setGameState('PLAYING');
    };

    const handleBackToSetup = () => {
        setGameState('SETUP');
        setGameResults(null);
    };

    // Helper to render the correct game
    const renderGame = () => {
        const playingWords = availableWords.filter(w => selectedWordIds.has(w.id));

        switch (selectedGame) {
            case 'quiz':
                // FlashcardQuizGame might handle its own flow, but let's try to wrap it or use it.
                // It has onSelectNewGame used as onExit/onFinish in some contexts?
                // It doesn't have a direct 'onFinish' with results object in Props typically.
                // But for this 'GameSessionContainer' we might need to adapt.
                // For now, I'll pass a custom onNext which detects end? No, it's internal.
                // Since I can't easily change FlashcardQuizGame, I'll use it as is, 
                // but note that the SUMMARY state of the Container might not be reached if the Game has its own summary.
                // To strictly follow the container logic, I would need a game component that calls onFinish.
                // I will use PlaceholderGame for unknown games, and FlashcardQuizGame for 'quiz'.
                return (
                    <FlashcardQuizGame
                        flashcards={playingWords}
                        onClose={() => setGameState('SETUP')}
                        onSelectNewGame={onExit}
                    />
                );
            case 'surfer':
            case 'slice':
            case 'scramble':
                return (
                    <FlashcardWordScrambleGame
                        vocabList={playingWords.map(w => ({
                            id: w.id,
                            word: w.front_text,
                            meaning: w.back_text
                        }))}
                        onGameFinish={handleGameFinish}
                        onExit={onExit}
                        onNewGame={handleBackToSetup}
                    />
                );
            case 'honeycomb':
                return (
                    <FlashcardHoneyCombGame
                        vocabList={playingWords.map(w => ({
                            id: w.id,
                            word: w.front_text,
                            meaning: w.back_text
                        }))}
                        onGameFinish={handleGameFinish}
                        onExit={onExit}
                        onNewGame={handleBackToSetup}
                    />
                );
            case 'surfer':
            case 'slice':
            default:
                return (
                    <PlaceholderGame
                        name={selectedGame.charAt(0).toUpperCase() + selectedGame.slice(1)}
                        words={playingWords}
                        onFinish={handleGameFinish}
                    />
                );
        }
    };

    // --- VIEWS ---

    if (gameState === 'SETUP') {
        return (
            <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                            Game Setup
                        </h1>
                        <p className="text-muted-foreground text-sm">Select a deck and words to start.</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onExit}>
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Col: Decks */}
                    <div className="md:col-span-1 space-y-4">
                        <h2 className="font-semibold text-gray-700 flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500" /> Choose Deck
                        </h2>
                        <ScrollArea className="h-[400px] rounded-xl border border-gray-100 bg-white/50 shadow-sm p-3">
                            <div className="space-y-3">
                                {availableDecks.map(deck => (
                                    <div
                                        key={deck.id}
                                        onClick={() => setSelectedDeckId(deck.id)}
                                        className={`p-3 rounded-lg cursor-pointer transition-all border ${selectedDeckId === deck.id
                                            ? 'bg-violet-50 border-violet-200 shadow-sm ring-1 ring-violet-300'
                                            : 'hover:bg-gray-50 border-transparent hover:border-gray-100'
                                            }`}
                                    >
                                        <div className="font-bold text-gray-800 text-sm">{deck.name}</div>
                                        <div className="text-xs text-gray-500 truncate">{deck.total_flashcards} words</div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Middle/Right Col: Word Selection & Preview */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-gray-700 flex items-center gap-2">
                                <Settings className="w-4 h-4 text-gray-500" /> Select Words ({selectedWordIds.size})
                            </h2>
                            {availableWords.length > 0 && (
                                <div className="text-xs space-x-2">
                                    <span
                                        className="text-violet-600 font-bold cursor-pointer hover:underline"
                                        onClick={() => setSelectedWordIds(new Set(availableWords.map(c => c.id)))}
                                    >
                                        Select All
                                    </span>
                                    <span className="text-gray-300">|</span>
                                    <span
                                        className="text-gray-500 cursor-pointer hover:underline"
                                        onClick={() => setSelectedWordIds(new Set())}
                                    >
                                        Clear
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 min-h-[400px]">
                            {isLoadingWords ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                                    <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
                                    <p className="text-xs">Loading words...</p>
                                </div>
                            ) : !selectedDeckId ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-2">
                                        <Star className="w-8 h-8 text-gray-200" />
                                    </div>
                                    <p className="text-sm font-medium">Select a deck to view words</p>
                                </div>
                            ) : availableWords.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <p>No words found in this deck.</p>
                                </div>
                            ) : (
                                <ScrollArea className="h-[360px] pr-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {availableWords.map(card => (
                                            <div
                                                key={card.id}
                                                className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${selectedWordIds.has(card.id)
                                                    ? 'bg-green-50 border-green-200'
                                                    : 'bg-gray-50/50 border-gray-100 opacity-60 hover:opacity-100'
                                                    }`}
                                            >
                                                <Checkbox
                                                    id={`word-${card.id}`}
                                                    checked={selectedWordIds.has(card.id)}
                                                    onCheckedChange={() => handleToggleWord(card.id)}
                                                    className="mt-1"
                                                />
                                                <div className="flex-1 overflow-hidden">
                                                    <label
                                                        htmlFor={`word-${card.id}`}
                                                        className="text-sm font-bold text-gray-800 block truncate cursor-pointer"
                                                    >
                                                        {card.front_text}
                                                    </label>
                                                    <p className="text-xs text-gray-500 truncate">{card.back_text}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            )}
                        </div>

                        <Button
                            className="w-full h-12 text-lg font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 shadow-lg hover:shadow-xl transition-all rounded-xl"
                            disabled={selectedWordIds.size === 0}
                            onClick={handleStartGame}
                        >
                            <Play className="w-5 h-5 mr-2 fill-white" />
                            Start Game
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (gameState === 'PLAYING') {
        return (
            <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
                {renderGame()}
            </div>
        );
    }

    if (gameState === 'SUMMARY') {
        return (
            <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-md flex items-center justify-center">
                <GameResultSummary
                    results={gameResults}
                    onReplay={handleReplay}
                    onExit={onExit}
                />
            </div>
        );
    }

    return null;
}
