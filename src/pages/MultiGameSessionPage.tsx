import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMultiGameSession } from '@/hooks/useMultiGameSession';
import GameSelectionDialog from '@/components/focus/GameSelectionDialog';
import { FlashcardSwiper } from '@/components/FlashcardSwiper';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Trophy, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { QuizGameComponent } from '@/components/games/QuizGame';
import { MatchingGameComponent } from '@/components/games/MatchingGame';
import { WordScrambleComponent } from '@/components/games/WordScramble';
import { HoneycombComponent } from '@/components/games/HoneycombGame';

interface GameResult {
    gameId: string;
    gameName: string;
    answers: Array<{
        wordId: string;
        isCorrect: boolean;
        timeTaken: number; // Added for SRS: <3000ms = Fast (+2), >3000ms = Slow (+1)
    }>;
    score: number;
    correct: number;
    total: number;
}

export default function MultiGameSessionPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { session, startSession, completeGame, isSessionComplete, finalizeSession } = useMultiGameSession();

    const [showGameSelection, setShowGameSelection] = useState(true);
    const [showIndividualResult, setShowIndividualResult] = useState(false);
    const [currentGameResult, setCurrentGameResult] = useState<GameResult | null>(null);
    const [loading, setLoading] = useState(false);

    // Prevent double submission
    const finalizedRef = useRef(false);

    const goalId = location.state?.goalId;
    const mode = location.state?.mode || 'start';
    const goalName = location.state?.goalName || 'Study Goal';
    const goalConfig = location.state?.goalConfig; // Extract config
    const customLimit = location.state?.customLimit; // Extract custom limit override

    useEffect(() => {
        if (!goalId) {
            toast({
                title: 'Error',
                description: 'Missing goal information',
                variant: 'destructive'
            });
            navigate('/dashboard');
        }
    }, [goalId]);

    // Handle game selection confirmation
    const handleGameSelectionConfirm = async (selectedGames: string[]) => {
        setLoading(true);
        try {
            await startSession(goalId, mode, selectedGames, goalConfig, customLimit); // Pass config and limit to hook
            setShowGameSelection(false);
        } catch (error) {
            console.error('Error starting session:', error);
            toast({
                title: 'Error',
                description: 'Failed to start session',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    // Check for session completion whenever session updates
    useEffect(() => {
        if (session && session.currentGameIndex >= session.selectedGames.length) {
            if (finalizedRef.current) return;
            finalizedRef.current = true; // Mark as finalizing immediately

            const finish = async () => {
                setLoading(true); // Optional: show loading while finalizing
                try {
                    const combinedResults = await finalizeSession();
                    if (combinedResults) {
                        navigate('/multi-game-results', {
                            state: {
                                ...combinedResults,
                                goalName,
                                mode
                            }
                        });
                    }
                } catch (error) {
                    console.error("Error finalizing:", error);
                    toast({ title: "Error", description: "Could not save session", variant: "destructive" });
                    finalizedRef.current = false; // Reset on error
                } finally {
                    setLoading(false);
                }
            };
            finish();
        }
    }, [session, navigate, finalizeSession, goalName, mode, toast]);

    // Handle individual game completion
    const handleGameComplete = (result: GameResult) => {
        // Skip intermediate result screen for seamless flow as requested
        completeGame(result);
        setShowIndividualResult(false);
        setCurrentGameResult(null);

        // Optional feedback
        toast({
            title: "Game Complete!",
            description: `Score: ${result.score}`,
            className: "bg-green-500 text-white border-green-600 border-2"
        });
    };

    // Continue to next game (Unused but kept for structure)
    const handleContinue = async () => {
        // Logic moved to handleGameComplete
    };

    // Render current game component
    const renderCurrentGame = () => {
        if (!session) return null;

        const currentGameId = session.selectedGames[session.currentGameIndex];
        const words = session.words;

        // Convert word progress to flashcard format
        const flashcards = words.map(w => w.flashcard);

        // Handle game completion from a game component
        const handleGameCompletionFromComponent = (
            score: number,
            correctCount: number,
            totalCount: number,
            customAnswers?: Array<{ wordId: string; isCorrect: boolean }>
        ) => {
            let answers;

            if (customAnswers) {
                answers = customAnswers;
            } else {
                // Fallback: Map individual answers based on score
                answers = words.map((w, index) => {
                    const isCorrect = index < correctCount;
                    return {
                        wordId: w.flashcard.id,
                        isCorrect
                    };
                });
            }

            const result: GameResult = {
                gameId: currentGameId,
                gameName: getGameName(currentGameId),
                answers,
                score: Math.round((score / 1000) * 100) || Math.round((correctCount / totalCount) * 100),
                correct: correctCount,
                total: totalCount
            };

            handleGameComplete(result); // Call the outer handleGameComplete
        };

        // Render appropriate game component
        switch (currentGameId) {
            case 'flashcard':
                const swiperCards = words.map(w => ({
                    id: w.flashcard.id,
                    front: w.flashcard.front_text || w.flashcard.front || '',
                    back: w.flashcard.back_text || w.flashcard.back || '',
                    frontImage: w.flashcard.front_image,
                    backImage: w.flashcard.back_image,
                    partOfSpeech: w.flashcard.part_of_speech
                }));

                return (
                    <div className="fixed inset-0 z-50 bg-slate-950">
                        <FlashcardSwiper
                            cards={swiperCards}
                            onClose={() => navigate('/dashboard')}
                            onComplete={() => {
                                // Fallback if onContinue not called (though Button uses onContinue)
                            }}
                            onContinue={(results) => {
                                if (results && results.answers) {
                                    // Fix: Calculate actual correct count from answers (First-Try Accuracy)
                                    // results.correct from Swiper counts "eventual mastery", which is always 100%
                                    const actualCorrect = results.answers.filter(a => a.isCorrect).length;

                                    handleGameCompletionFromComponent(
                                        Math.round((actualCorrect / swiperCards.length) * 1000),
                                        actualCorrect,
                                        swiperCards.length,
                                        results.answers
                                    );
                                }
                            }}
                        />
                    </div>
                );

            case 'quiz':
                return (
                    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 p-6">
                        <QuizGameComponent
                            flashcards={flashcards}
                            onComplete={handleGameCompletionFromComponent}
                        />
                    </div>
                );

            case 'scramble':
                return (
                    <div className="min-h-screen bg-gradient-to-br from-green-900 to-teal-900 p-6">
                        <WordScrambleComponent
                            flashcards={flashcards}
                            onComplete={handleGameCompletionFromComponent}
                        />
                    </div>
                );

            case 'matching':
                return (
                    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-pink-900 p-6">
                        <MatchingGameComponent
                            flashcards={flashcards}
                            onComplete={handleGameCompletionFromComponent}
                        />
                    </div>
                );

            case 'honeyhive':
                return (
                    <div className="min-h-screen bg-gradient-to-br from-yellow-900 to-orange-900 p-6">
                        <HoneycombComponent
                            flashcards={flashcards}
                            onComplete={handleGameCompletionFromComponent}
                        />
                    </div>
                );

            default:
                return (
                    <div className="min-h-screen flex items-center justify-center">
                        <Card>
                            <CardContent className="p-6">
                                <p>Unknown game: {currentGameId}</p>
                            </CardContent>
                        </Card>
                    </div>
                );
        }
    };

    // Show game selection dialog
    if (showGameSelection) {
        return (
            <GameSelectionDialog
                open={true}
                mode={mode}
                onConfirm={handleGameSelectionConfirm}
                onCancel={() => navigate('/dashboard')}
            />
        );
    }

    // Show individual game result
    if (showIndividualResult && currentGameResult) {
        return <IndividualGameResult result={currentGameResult} onContinue={handleContinue} />;
    }

    // Show loading
    if (loading || !session) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="max-w-md w-full">
                    <CardContent className="p-6">
                        <Skeleton className="h-8 w-3/4 mb-4" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Render current game
    return renderCurrentGame();
}

// Individual Game Result Component (inline for now, can be extracted later)
function IndividualGameResult({ result, onContinue }: { result: GameResult, onContinue: () => void }) {
    const wrongAnswers = result.answers.filter(a => !a.isCorrect);

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
            <Card className="max-w-2xl w-full border-2 border-purple-200">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                        <Trophy className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl">
                        🎮 {result.gameName} - สรุปผล
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Score Display */}
                    <div className="text-center">
                        <div className="text-6xl font-bold text-purple-600 mb-2">
                            {result.score}%
                        </div>
                        <p className="text-muted-foreground">
                            {result.correct}/{result.total} ถูก
                        </p>
                    </div>

                    {/* Correct/Wrong Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-green-50 dark:bg-green-950">
                            <CardContent className="p-4 text-center">
                                <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-green-700">{result.correct}</p>
                                <p className="text-xs text-muted-foreground">ถูก</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-red-50 dark:bg-red-950">
                            <CardContent className="p-4 text-center">
                                <div className="h-8 w-8 mx-auto mb-2 flex items-center justify-center">
                                    <span className="text-2xl">❌</span>
                                </div>
                                <p className="text-2xl font-bold text-red-700">{wrongAnswers.length}</p>
                                <p className="text-xs text-muted-foreground">ผิด</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Wrong Words (if any) */}
                    {wrongAnswers.length > 0 && (
                        <Card className="bg-orange-50 dark:bg-orange-950">
                            <CardHeader>
                                <CardTitle className="text-base">
                                    คำที่ต้องทบทวน ({wrongAnswers.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="max-h-40 overflow-y-auto">
                                <div className="space-y-2">
                                    {wrongAnswers.slice(0, 5).map((answer, idx) => (
                                        <div key={idx} className="text-sm p-2 bg-white dark:bg-gray-800 rounded">
                                            <span className="font-medium">Word {idx + 1}</span>
                                        </div>
                                    ))}
                                    {wrongAnswers.length > 5 && (
                                        <p className="text-xs text-center text-muted-foreground">
                                            +{wrongAnswers.length - 5} more
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Continue Button */}
                    <Button
                        onClick={onContinue}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 h-12 text-lg"
                        size="lg"
                    >
                        ถัดไป
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

// Helper function
function getGameName(gameId: string): string {
    const gameNames: Record<string, string> = {
        flashcard: 'Flashcard',
        quiz: 'Quiz 3sec',
        scramble: 'Word Scramble',
        matching: 'Matching Game',
        honeyhive: 'Honey Hive'
    };
    return gameNames[gameId] || gameId;
}
