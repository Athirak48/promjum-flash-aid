import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trophy, RotateCcw, ArrowRight, Volume2, X, Lightbulb, Hexagon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';
import { useXP } from '@/hooks/useXP';
import { useSRSProgress } from '@/hooks/useSRSProgress';
import { useAnalytics } from '@/hooks/useAnalytics';

// --- Types ---
export interface HoneyCombWord {
    id: string;
    word: string;
    meaning: string;
    isUserFlashcard?: boolean;
}

interface FlashcardHoneyCombGameProps {
    vocabList: HoneyCombWord[];
    onGameFinish: (results: { score: number; correctWords: number; wrongWords: number; timeSpent: number }) => void;
    onExit?: () => void;
    onNewGame?: () => void;
}

interface HexTile {
    id: string;
    char: string;
    q: number; // Axial coordinate q
    r: number; // Axial coordinate r
    s: number; // Axial coordinate s (q + r + s = 0)
    x: number; // Pixel X
    y: number; // Pixel Y
}

// --- Component ---
export function FlashcardHoneyCombGame({ vocabList, onGameFinish, onExit, onNewGame }: FlashcardHoneyCombGameProps) {
    const { addGameXP } = useXP();
    const { updateFromHoneyComb } = useSRSProgress();
    const { trackGame } = useAnalytics();

    // Game State
    const [gameWords, setGameWords] = useState<HoneyCombWord[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [gameStartTime] = useState(Date.now());
    const [correctCount, setCorrectCount] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const [totalXPEarned, setTotalXPEarned] = useState(0);

    // Round State
    const [hexGrid, setHexGrid] = useState<HexTile[]>([]);
    const [selectedPath, setSelectedPath] = useState<string[]>([]); // Array of HexTile IDs
    const [isChecking, setIsChecking] = useState(false);
    const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
    const [hintsRevealed, setHintsRevealed] = useState(false);

    // Drag State
    const [isDragging, setIsDragging] = useState(false);
    const lastHoveredHexId = useRef<string | null>(null);

    // Stats
    const [wordAttempts, setWordAttempts] = useState<Record<string, number>>({});
    const [currentWordAttempts, setCurrentWordAttempts] = useState(0);
    const [gameFinished, setGameFinished] = useState(false);
    const [gameResults, setGameResults] = useState<{ score: number; correctWords: number; wrongWords: number; timeSpent: number } | null>(null);

    const controls = useAnimation();
    const { toast } = useToast();
    const initializedRef = useRef(false);

    // --- Initialization ---
    useEffect(() => {
        if (!initializedRef.current && vocabList.length > 0) {
            const shuffled = [...vocabList].sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, 10); // Play 10 words
            setGameWords(selected);
            initializedRef.current = true;
            // Track game start
            trackGame('honeycomb', 'start', undefined, {
                totalCards: selected.length
            });
        }
    }, [vocabList]);

    // --- Round Setup ---
    useEffect(() => {
        if (gameWords.length > 0 && currentIndex < gameWords.length) {
            setupRound(gameWords[currentIndex]);
        }
    }, [currentIndex, gameWords]);

    const setupRound = (wordObj: HoneyCombWord) => {
        const cleanWord = wordObj.word.toUpperCase().replace(/[^A-Z]/g, '');
        const grid = generateHiveGrid(cleanWord);

        setHexGrid(grid);
        setSelectedPath([]);
        setFeedback('idle');
        setIsChecking(false);
        setHintsRevealed(false);
        setCurrentWordAttempts(0);
    };

    // --- Grid Generation Logic ---
    // Responsive hex sizing based on screen width
    const getResponsiveHexSize = (): number => {
        if (typeof window === 'undefined') return 57.5;
        const width = window.innerWidth;
        if (width < 640) return 32; // Mobile: small
        if (width < 1024) return 42; // Tablet: medium  
        return 57.5; // Desktop: full
    };

    const HEX_SIZE = getResponsiveHexSize();

    const generateHiveGrid = (word: string): HexTile[] => {
        const cleanWord = word.toUpperCase().replace(/[^A-Z]/g, '');
        const count = cleanWord.length;

        // Hexagonal directions (axial coordinates)
        const directions = [
            { q: 1, r: -1 }, { q: 1, r: 0 }, { q: 0, r: 1 },
            { q: -1, r: 1 }, { q: -1, r: 0 }, { q: 0, r: -1 }
        ];

        // Get unoccupied neighbors of a hex
        const getAvailableNeighbors = (q: number, r: number, occupied: Set<string>): Array<{ q: number, r: number }> => {
            return directions
                .map(d => ({ q: q + d.q, r: r + d.r }))
                .filter(pos => !occupied.has(`${pos.q},${pos.r}`));
        };

        // Generate path with backtracking
        const generatePath = (): Array<{ q: number, r: number, char: string }> | null => {
            const path: Array<{ q: number, r: number, char: string }> = [];
            const occupied = new Set<string>();

            // Start at center
            let currentPos = { q: 0, r: 0 };
            path.push({ ...currentPos, char: cleanWord[0] });
            occupied.add(`${currentPos.q},${currentPos.r}`);

            // Place remaining letters sequentially
            for (let i = 1; i < cleanWord.length; i++) {
                const neighbors = getAvailableNeighbors(currentPos.q, currentPos.r, occupied);

                if (neighbors.length === 0) {
                    // Dead end - backtrack or restart
                    return null;
                }

                // Count how many already-placed letters touch this position (cluster-hugging)
                const countAdjacentPlaced = (q: number, r: number): number => {
                    let count = 0;
                    for (const dir of directions) {
                        const neighborKey = `${q + dir.q},${r + dir.r}`;
                        if (occupied.has(neighborKey)) {
                            count++;
                        }
                    }
                    return count;
                };

                // Distance from center (tiebreaker only)
                const distanceFromCenter = (q: number, r: number): number => {
                    const s = -q - r;
                    return (Math.abs(q) + Math.abs(r) + Math.abs(s)) / 2;
                };

                // Score neighbors: PRIMARY = adjacent count, SECONDARY = distance
                const scored = neighbors.map(n => ({
                    pos: n,
                    adjacentCount: countAdjacentPlaced(n.q, n.r),
                    centerDist: distanceFromCenter(n.q, n.r)
                }));

                // Sort: highest adjacent count first, then closest to center
                scored.sort((a, b) => {
                    if (b.adjacentCount !== a.adjacentCount) {
                        return b.adjacentCount - a.adjacentCount;
                    }
                    return a.centerDist - b.centerDist;
                });

                // Add randomness: pick from top candidates to avoid predictable patterns
                // Select from top 60% of sorted candidates (or at least 1)
                const topCandidatesCount = Math.max(1, Math.ceil(scored.length * 0.6));
                const topCandidates = scored.slice(0, topCandidatesCount);
                const nextPos = topCandidates[Math.floor(Math.random() * topCandidates.length)].pos;

                path.push({ ...nextPos, char: cleanWord[i] });
                occupied.add(`${nextPos.q},${nextPos.r}`);
                currentPos = nextPos;
            }

            return path;
        };

        // Try generating path with retries
        let path: Array<{ q: number, r: number, char: string }> | null = null;
        let attempts = 0;
        const maxAttempts = 100;

        while (!path && attempts < maxAttempts) {
            path = generatePath();
            attempts++;
        }

        if (!path) {
            // Fallback: linear path if random walk fails
            path = cleanWord.split('').map((char, i) => ({
                q: i,
                r: 0,
                char
            }));
        }

        // Convert path to HexTile format with pixel positions
        const SPACING = 1.0;

        // First pass: Calculate positions without centering
        const tempTiles = path.map((pos, i) => {
            const x = HEX_SIZE * Math.sqrt(3) * (pos.q + pos.r / 2) * SPACING;
            const y = HEX_SIZE * 1.5 * pos.r * SPACING;
            return { pos, x, y };
        });

        // Calculate bounding box center
        const minX = Math.min(...tempTiles.map(t => t.x));
        const maxX = Math.max(...tempTiles.map(t => t.x));
        const minY = Math.min(...tempTiles.map(t => t.y));
        const maxY = Math.max(...tempTiles.map(t => t.y));

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        return tempTiles.map(({ pos, x, y }, i) => {
            return {
                id: `hex-${i}-${Date.now()}-${Math.random()}`,
                char: pos.char,
                q: pos.q,
                r: pos.r,
                s: -pos.q - pos.r,
                x: x - centerX, // Center around 0,0
                y: y - centerY // Center around 0,0
            };
        });
    };

    // --- Interaction ---
    const gridContainerRef = useRef<HTMLDivElement>(null);

    // Convert pixel coordinates to axial hex coordinates
    const pixelToAxial = (px: number, py: number): { q: number, r: number } | null => {
        // Reverse of: x = HEX_SIZE * sqrt(3) * (q + r/2), y = HEX_SIZE * 1.5 * r
        // From y: r = y / (HEX_SIZE * 1.5)
        // From x and r: q = x / (HEX_SIZE * sqrt(3)) - r/2

        const r = Math.round(py / (HEX_SIZE * 1.5));
        const q = Math.round(px / (HEX_SIZE * Math.sqrt(3)) - r / 2);

        return { q, r };
    };

    // Find hex by axial coordinates
    const findHexByAxial = (q: number, r: number): HexTile | null => {
        return hexGrid.find(h => h.q === q && h.r === r) || null;
    };

    // Start Drag with Pointer Capture
    const handlePointerDown = (tile: HexTile, e: React.PointerEvent) => {
        if (isChecking || feedback !== 'idle' || gameFinished) return;

        // Pointer Capture: ensures move events tracked even outside grid
        if (gridContainerRef.current && e.pointerId) {
            gridContainerRef.current.setPointerCapture(e.pointerId);
        }

        setIsDragging(true);
        lastHoveredHexId.current = tile.id;
        setSelectedPath([tile.id]);
    };

    // Centralized Mathematical Hit-Map (Container-level tracking)
    const handleContainerPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging || isChecking || feedback !== 'idle' || gameFinished) return;
        if (!gridContainerRef.current) return;

        // Get pointer position relative to grid container
        const rect = gridContainerRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Virtual Hit-Map: Convert to relative coordinates
        const relativeX = e.clientX - rect.left - centerX;
        const relativeY = e.clientY - rect.top - centerY;

        // Balanced hit area: 100% of hex size (covers hexagon without overlap)
        const HIT_THRESHOLD = HEX_SIZE * 1.0;
        let closestHex: HexTile | null = null;
        let closestDistance = Infinity;

        // Find closest hex using pure Euclidean distance
        for (const hex of hexGrid) {
            const dx = relativeX - hex.x;
            const dy = relativeY - hex.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < HIT_THRESHOLD && distance < closestDistance) {
                closestDistance = distance;
                closestHex = hex;
            }
        }

        // Debug: Log selection
        if (closestHex && lastHoveredHexId.current !== closestHex.id) {
            console.log('Selected hex:', closestHex.char, 'at', closestHex.q, closestHex.r, 'distance:', closestDistance.toFixed(2));
        }

        if (!closestHex) return;
        if (lastHoveredHexId.current === closestHex.id) return;
        lastHoveredHexId.current = closestHex.id;

        // Get last selected hex for adjacency check
        const lastId = selectedPath[selectedPath.length - 1];
        const lastTile = hexGrid.find(h => h.id === lastId);
        if (!lastTile) return;

        // Backtracking: if hovering previous hex, undo
        if (selectedPath.length >= 2 && closestHex.id === selectedPath[selectedPath.length - 2]) {
            setSelectedPath(prev => prev.slice(0, -1));
            return;
        }

        // Selection: add if adjacent and not already selected
        if (isAdjacent(lastTile, closestHex) && !selectedPath.includes(closestHex.id)) {
            setSelectedPath([...selectedPath, closestHex.id]);
        }
    };

    // End Drag
    const handlePointerUp = () => {
        setIsDragging(false);
        lastHoveredHexId.current = null;

        // Validate and auto-reset if wrong
        if (currentIndex < gameWords.length) {
            const targetWord = gameWords[currentIndex].word.toUpperCase().replace(/[^A-Z]/g, '');
            const currentWord = selectedPath.map(id => hexGrid.find(h => h.id === id)?.char).join('');

            if (currentWord === targetWord && selectedPath.length === targetWord.length) {
                // Correct - submit for checking
                checkAnswer(selectedPath);
            } else {
                // Wrong or incomplete - auto-reset immediately
                setSelectedPath([]);
            }
        }
    };

    // Handle Global Pointer Up (in case released outside)
    useEffect(() => {
        const handleGlobalUp = () => {
            if (isDragging) {
                handlePointerUp();
            }
        };
        window.addEventListener('pointerup', handleGlobalUp);
        return () => window.removeEventListener('pointerup', handleGlobalUp);
    }, [isDragging, selectedPath]);

    // Check if two hexes are neighbors
    const isAdjacent = (a: HexTile, b: HexTile) => {
        const dq = a.q - b.q;
        const dr = a.r - b.r;
        const ds = a.s - b.s;
        // In cube coords, distance is (abs(dq) + abs(dr) + abs(ds)) / 2
        // Neighbors have distance 1
        return (Math.abs(dq) + Math.abs(dr) + Math.abs(ds)) === 2;
    };

    const checkAnswer = async (pathIds: string[]) => {
        setIsChecking(true);
        const selectedWord = pathIds.map(id => hexGrid.find(h => h.id === id)?.char).join('');
        const targetWord = gameWords[currentIndex].word.toUpperCase().replace(/[^A-Z]/g, '');

        if (selectedWord === targetWord) {
            // Correct
            setFeedback('correct');
            setScore(prev => prev + 100 + (hintsRevealed ? 0 : 50)); // Bonus for no hints
            setCorrectCount(prev => prev + 1);

            // Add XP for correct answer
            addGameXP('honeycomb', true, false).then(xpResult => {
                if (xpResult?.xpAdded) {
                    setTotalXPEarned(prev => prev + xpResult.xpAdded);
                }
            });

            // Update SRS
            const attempts = currentWordAttempts + 1;
            updateFromHoneyComb(gameWords[currentIndex].id, true, attempts, gameWords[currentIndex].isUserFlashcard);
            console.log(`🐝 SRS Updated: ${gameWords[currentIndex].id} Attempts=${attempts}`);

            confetti({
                particleCount: 80,
                spread: 70,
                colors: ['#FCD34D', '#F59E0B', '#FFFFFF'] // Gold/Yellow theme
            });

            await new Promise(r => setTimeout(r, 1500));

            // Record Attempt
            setWordAttempts(prev => ({ ...prev, [gameWords[currentIndex].id]: currentWordAttempts }));

            if (currentIndex >= gameWords.length - 1) {
                finishGame();
            } else {
                goToNext();
            }
        } else {
            // Wrong
            setFeedback('wrong');
            await controls.start({
                x: [0, -10, 10, -10, 10, 0],
                transition: { duration: 0.4 }
            });

            // Allow retry without full reset immediately, but maybe clear path after delay
            setTimeout(() => {
                setFeedback('idle');
                setSelectedPath([]); // Clear path on wrong
                setIsChecking(false);
                setWrongCount(prev => prev + 1);
                setCurrentWordAttempts(prev => prev + 1);
            }, 800);
        }
    };

    const useHint = () => {
        if (!hintsRevealed && !isChecking) {
            setHintsRevealed(true);
            setScore(prev => Math.max(0, prev - 20)); // Penalty for hint
        }
    };

    const goToNext = () => {
        setCurrentIndex(prev => prev + 1);
    };

    const finishGame = () => {
        const timeSpent = Math.floor((Date.now() - gameStartTime) / 1000);

        let perfectCount = 0;
        let imperfectCount = 0;

        gameWords.forEach(w => {
            const att = wordAttempts[w.id] || 0;
            if (att === 0) perfectCount++;
            else imperfectCount++;
        });

        // Add current word if not counted
        if (wordAttempts[gameWords[currentIndex].id] === undefined) {
            if (currentWordAttempts === 0) perfectCount++; else imperfectCount++;
        }

        setGameResults({
            score,
            correctWords: perfectCount,
            wrongWords: imperfectCount,
            timeSpent
        });
        setGameFinished(true);

        // Track game completion
        trackGame('honeycomb', 'complete', score, {
            totalCards: gameWords.length,
            correctWords: correctCount,
            wrongWords: wrongCount,
            duration: timeSpent
        });
    };

    // --- Audio ---
    const speakWord = () => {
        if ('speechSynthesis' in window && currentIndex < gameWords.length) {
            const utterance = new SpeechSynthesisUtterance(gameWords[currentIndex].word);
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
        }
    };


    // --- Render Helpers ---
    // CSS Hexagon logic
    // We basically just draw a div with a polygon clip-path

    if (gameFinished && gameResults) {
        return (
            <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-500">
                <Card className="w-full max-w-sm bg-slate-900 border border-yellow-500/30 shadow-2xl rounded-2xl overflow-hidden relative">
                    {/* Background Effects */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-[100px]" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-600/10 rounded-full blur-[100px]" />

                    <div className="relative z-10 p-4 sm:p-6 flex flex-col items-center text-center space-y-4">
                        <div className="space-y-2">
                            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-xl">
                                Hive Completed!
                            </h2>
                            <p className="text-yellow-400 font-bold uppercase tracking-widest text-xs">Incredible performance, Queen Bee!</p>
                        </div>

                        {/* Score Hexagon */}
                        <div className="relative w-28 h-28 flex items-center justify-center group">
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-xl rotate-45 opacity-20 blur-xl group-hover:opacity-40 transition-opacity" />
                            <div className="relative w-24 h-28 bg-gradient-to-b from-yellow-400 to-amber-600 [clip-path:polygon(50%_0%,_100%_25%,_100%_75%,_50%_100%,_0%_75%,_0%_25%)] flex flex-col items-center justify-center text-black shadow-2xl transform transition-transform hover:scale-110 duration-500">
                                <span className="text-[10px] font-bold uppercase opacity-80">Total Score</span>
                                <span className="text-3xl font-black">{gameResults.score}</span>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-2 w-full">
                            <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center">
                                <span className="text-xl font-bold text-white">{gameResults.correctWords}/{gameWords.length}</span>
                                <span className="text-[10px] text-slate-400 uppercase font-bold">Words</span>
                            </div>
                            <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center">
                                <span className="text-xl font-bold text-yellow-400">{hintsRevealed ? 'Used' : '0'}</span>
                                <span className="text-[10px] text-slate-400 uppercase font-bold">Hints</span>
                            </div>
                            <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center">
                                <span className="text-xl font-bold text-blue-400">{gameResults.timeSpent}s</span>
                                <span className="text-[10px] text-slate-400 uppercase font-bold">Time</span>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col w-full gap-2">
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => {
                                        setScore(0);
                                        setCorrectCount(0);
                                        setWrongCount(0);
                                        setCurrentIndex(0);
                                        setGameFinished(false);
                                        setGameResults(null);
                                        setWordAttempts({});
                                        const shuffled = [...vocabList].sort(() => 0.5 - Math.random());
                                        const selected = shuffled.slice(0, 10);
                                        setGameWords(selected);
                                    }}
                                    className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold h-10 rounded-xl text-xs shadow-lg shadow-yellow-900/20"
                                >
                                    <RotateCcw className="w-3.5 h-3.5 mr-1" /> เล่นอีก
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={onExit}
                                    className="flex-1 border-white/20 text-white hover:bg-white/10 font-bold h-10 rounded-xl text-xs"
                                >
                                    <Hexagon className="w-3.5 h-3.5 mr-1" /> เมนู
                                </Button>
                            </div>
                            {onNewGame && (
                                <Button
                                    onClick={onNewGame}
                                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold h-10 rounded-xl text-xs shadow-lg shadow-purple-900/20"
                                >
                                    <ArrowRight className="w-3.5 h-3.5 mr-1" /> เลือกเกมใหม่
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    if (gameWords.length === 0) return (<div className="h-full flex items-center justify-center text-white">Loading Hive...</div>);

    const currentWord = gameWords[currentIndex];

    // Calculate path string (user's currently formed word)
    const currentAttemptString = selectedPath.map(id => hexGrid.find(h => h.id === id)?.char).join('');

    // Hint text logic
    const hintText = hintsRevealed
        ? `Starts with '${currentWord.word[0]}', Ends with '${currentWord.word[currentWord.word.length - 1]}'`
        : "Need a hint?";

    return (
        <div className="flex flex-col items-center min-h-screen w-full bg-[#1a1a1a] relative overflow-hidden font-sans text-white">

            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-yellow-500/5 rounded-full blur-[128px]" />
                <div className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-amber-600/5 rounded-full blur-[128px]" />
            </div>

            {/* Header */}
            <div className="w-full max-w-4xl p-6 flex justify-between items-center relative z-20">
                <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={onExit}>
                    <X className="w-6 h-6" />
                </Button>

                {/* Level Progress */}
                <div className="flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-yellow-500 tracking-widest uppercase">Level {currentIndex + 1}/{gameWords.length}</span>
                    <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-yellow-500"
                            animate={{ width: `${((currentIndex) / gameWords.length) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="font-bold tabular-nums">{score}</span>
                </div>
            </div>

            {/* Game Content - Responsive */}
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl relative z-20 space-y-2 sm:space-y-4 md:space-y-6 pb-4 sm:pb-8">\

                {/* Hint Card */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    key={currentIndex}
                    className="w-full max-w-2xl px-4"
                >
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/20 to-amber-600/20 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition duration-1000" />
                        <div className="relative bg-[#252525] border border-white/10 p-4 rounded-2xl text-center shadow-2xl">
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <span className="text-yellow-500 text-xs font-bold tracking-[0.2em] uppercase">Meaning Hint</span>
                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-yellow-500/20 text-yellow-500" onClick={useHint}>
                                    <Lightbulb className="w-3 h-3" />
                                </Button>
                            </div>
                            <h2 className="text-xl md:text-2xl font-black text-white leading-tight">
                                {currentWord.meaning}
                            </h2>
                            {hintsRevealed && (
                                <p className="mt-4 text-yellow-400/80 text-sm font-medium animate-pulse">
                                    {hintText}
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Current Attempt Display - Responsive */}
                <div className="h-8 sm:h-10 md:h-12 flex items-end justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                    {Array.from({ length: currentWord.word.length }).map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-0.5 sm:gap-1">
                            <span className={`text-base sm:text-xl md:text-2xl font-bold transition-all duration-300 ${i < currentAttemptString.length ? 'text-white translate-y-0' : 'text-white/20 translate-y-2'}`}>
                                {currentAttemptString[i] || '_'}
                            </span>
                            <div className={`w-4 sm:w-5 md:w-6 h-0.5 transition-colors duration-300 ${i < currentAttemptString.length ? 'bg-yellow-500' : 'bg-white/20'}`} />
                        </div>
                    ))}
                </div>

                {/* Tip Text - Responsive */}
                <div className="text-center mb-1 sm:mb-2">
                    <p className="text-yellow-500/60 text-[9px] sm:text-xs font-medium">
                        💡 เคล็ดลับ: พยายามลากไปบนยอดหกเหลี่ยมเพื่อเลือก
                    </p>
                </div>

                {/* Grid Container - Responsive Height */}
                <div
                    ref={gridContainerRef}
                    onPointerMove={handleContainerPointerMove}
                    onPointerUp={handlePointerUp}
                    className="relative w-full flex-1 flex items-center justify-center overflow-hidden min-h-[300px]"
                    style={{
                        touchAction: 'none',
                        userSelect: 'none',
                        WebkitUserSelect: 'none'
                    }}
                >
                    <motion.div
                        animate={controls}
                        className="relative"
                        style={{
                            perspective: 1000,
                            transform: 'scale(0.95)',
                            transformOrigin: 'center center'
                        }}
                    >
                        {hexGrid.map((hex) => {
                            const isSelected = selectedPath.includes(hex.id);
                            const selectionIndex = selectedPath.indexOf(hex.id);

                            // Visual State
                            let statusColor = "bg-[#333]"; // Default
                            let textColor = "text-white/50";
                            let borderColor = "border-white/5";

                            if (isSelected) {
                                if (feedback === 'correct') {
                                    statusColor = "bg-green-500";
                                    textColor = "text-white";
                                    borderColor = "border-green-400";
                                } else if (feedback === 'wrong') {
                                    statusColor = "bg-red-500";
                                    textColor = "text-white";
                                    borderColor = "border-red-400";
                                } else {
                                    statusColor = "bg-yellow-500";
                                    textColor = "text-black";
                                    borderColor = "border-yellow-400";
                                }
                            } else {
                                // Default, make it look nice
                                statusColor = "bg-[#2A2A2A] hover:bg-[#333]";
                                textColor = "text-white";
                                borderColor = "border-white/10";
                            }

                            return (
                                <motion.button
                                    key={hex.id}
                                    onPointerDown={(e) => {
                                        e.preventDefault();
                                        handlePointerDown(hex, e);
                                    }}
                                    className={`absolute flex items-center justify-center 
                                                w-[60px] h-[72px] sm:w-[80px] sm:h-[92px] md:w-[100px] md:h-[115px]
                                                [clip-path:polygon(50%_0%,_100%_25%,_100%_75%,_50%_100%,_0%_75%,_0%_25%)]
                                                ${statusColor} transition-colors duration-200 cursor-pointer outline-none select-none
                                                `}
                                    style={{
                                        left: hex.x,
                                        top: hex.y,
                                        // Center the grid (offset by half w/h) is tricky with absolute, so we translate the parent usually.
                                        // Instead, we translate this element relative to center:
                                        transform: 'translate(-50%, -50%)',
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{
                                        type: "spring",
                                        delay: Math.random() * 0.2 // Stagger in
                                    }}
                                >
                                    {/* Inner Border Effect */}
                                    <div className={`absolute inset-1 [clip-path:polygon(50%_0%,_100%_25%,_100%_75%,_50%_100%,_0%_75%,_0%_25%)] border-2 opacity-50 pointer-events-none ${isSelected ? 'border-black/20' : 'border-white/5'}`} />

                                    <span className={`text-xl sm:text-3xl md:text-4xl font-black ${textColor} z-10`}>
                                        {hex.char}
                                    </span>

                                    {/* Selection Number Badge */}
                                    {isSelected && feedback === 'idle' && (
                                        <div className="absolute top-4 w-4 h-4 bg-black/20 rounded-full flex items-center justify-center text-[8px] font-bold text-black">
                                            {selectionIndex + 1}
                                        </div>
                                    )}
                                </motion.button>
                            );
                        })}
                    </motion.div>
                </div>


            </div>
        </div>
    );
}
