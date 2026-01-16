import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Trophy, Lightbulb, Hexagon } from 'lucide-react';
import confetti from 'canvas-confetti';

// --- Types ---
interface FlashcardData {
    id: string;
    front_text: string;
    back_text: string;
}

interface HoneycombComponentProps {
    flashcards: FlashcardData[];
    onComplete: (score: number, correctCount: number, totalCount: number, answers: Array<{ wordId: string; isCorrect: boolean; timeTaken: number }>) => void;
    isMultiplayer?: boolean;
}

interface HoneyCombWord {
    id: string;
    word: string;
    meaning: string;
}

interface HexTile {
    id: string;
    char: string;
    q: number;
    r: number;
    s: number;
    x: number;
    y: number;
}

// --- Component ---
export function HoneycombComponent({ flashcards, onComplete, isMultiplayer }: HoneycombComponentProps) {
    const navigate = useNavigate();
    // Game State
    // Map flashcards to internal format
    const [gameWords, setGameWords] = useState<HoneyCombWord[]>([]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [gameStartTime] = useState(Date.now());
    const [correctCount, setCorrectCount] = useState(0);

    const [wordStartTime, setWordStartTime] = useState(Date.now());

    // Round State
    const [hexGrid, setHexGrid] = useState<HexTile[]>([]);
    const [selectedPath, setSelectedPath] = useState<string[]>([]);
    const [isChecking, setIsChecking] = useState(false);
    const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
    const [hintsRevealed, setHintsRevealed] = useState(false);

    // Drag State
    const [isDragging, setIsDragging] = useState(false);
    const lastHoveredHexId = useRef<string | null>(null);

    // SRS Tracking
    const [answers, setAnswers] = useState<Array<{ wordId: string; isCorrect: boolean; timeTaken: number }>>([]);

    const controls = useAnimation();
    const gridContainerRef = useRef<HTMLDivElement>(null);

    // --- Initialization ---
    useEffect(() => {
        if (flashcards.length > 0) {
            // Map Props to Internal Format
            // Question: Is 'word' the English (front) or Meaning (back)?
            // Usually Key Word (to spell) is Front, Meaning is Back.
            // But verify: WordScramble used back_text as "Meaning" (Question) and front_text as "Word" (Answer).
            // Let's stick to standard: Spell the English Word (Front), Show Thai Meaning (Back).
            const mapped = flashcards.map(f => ({
                id: f.id,
                word: f.front_text,
                meaning: f.back_text
            }));

            setGameWords(mapped);
        }
    }, [flashcards]);

    // --- Round Setup ---
    useEffect(() => {
        if (gameWords.length > 0 && currentIndex < gameWords.length) {
            setupRound(gameWords[currentIndex]);
            setWordStartTime(Date.now());
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
    };

    // --- Grid Generation Logic ---
    const getResponsiveHexSize = (): number => {
        if (typeof window === 'undefined') return 48;
        const width = window.innerWidth;
        if (width < 640) return 28; // Mobile: smaller
        if (width < 1024) return 36; // Tablet: medium
        return 48; // Desktop: reduced from 57.5
    };

    const HEX_SIZE = getResponsiveHexSize();

    const generateHiveGrid = (word: string): HexTile[] => {
        const cleanWord = word.toUpperCase().replace(/[^A-Z]/g, '');

        const directions = [
            { q: 1, r: -1 }, { q: 1, r: 0 }, { q: 0, r: 1 },
            { q: -1, r: 1 }, { q: -1, r: 0 }, { q: 0, r: -1 }
        ];

        const getAvailableNeighbors = (q: number, r: number, occupied: Set<string>): Array<{ q: number, r: number }> => {
            return directions
                .map(d => ({ q: q + d.q, r: r + d.r }))
                .filter(pos => !occupied.has(`${pos.q},${pos.r}`));
        };

        const generatePath = (): Array<{ q: number, r: number, char: string }> | null => {
            const path: Array<{ q: number, r: number, char: string }> = [];
            const occupied = new Set<string>();

            let currentPos = { q: 0, r: 0 };
            path.push({ ...currentPos, char: cleanWord[0] });
            occupied.add(`${currentPos.q},${currentPos.r}`);

            for (let i = 1; i < cleanWord.length; i++) {
                const neighbors = getAvailableNeighbors(currentPos.q, currentPos.r, occupied);
                if (neighbors.length === 0) return null;

                const countAdjacentPlaced = (q: number, r: number): number => {
                    let count = 0;
                    for (const dir of directions) {
                        if (occupied.has(`${q + dir.q},${r + dir.r}`)) count++;
                    }
                    return count;
                };

                const distanceFromCenter = (q: number, r: number): number => {
                    const s = -q - r;
                    return (Math.abs(q) + Math.abs(r) + Math.abs(s)) / 2;
                };

                const scored = neighbors.map(n => ({
                    pos: n,
                    adjacentCount: countAdjacentPlaced(n.q, n.r),
                    centerDist: distanceFromCenter(n.q, n.r)
                }));

                scored.sort((a, b) => {
                    if (b.adjacentCount !== a.adjacentCount) return b.adjacentCount - a.adjacentCount;
                    return a.centerDist - b.centerDist;
                });

                const topCandidatesCount = Math.max(1, Math.ceil(scored.length * 0.6));
                const topCandidates = scored.slice(0, topCandidatesCount);
                const nextPos = topCandidates[Math.floor(Math.random() * topCandidates.length)].pos;

                path.push({ ...nextPos, char: cleanWord[i] });
                occupied.add(`${nextPos.q},${nextPos.r}`);
                currentPos = nextPos;
            }
            return path;
        };

        let path: Array<{ q: number, r: number, char: string }> | null = null;
        let attempts = 0;
        const maxAttempts = 100;

        while (!path && attempts < maxAttempts) {
            path = generatePath();
            attempts++;
        }

        if (!path) {
            path = cleanWord.split('').map((char, i) => ({ q: i, r: 0, char }));
        }

        const SPACING = 1.0;
        const tempTiles = path.map((pos) => {
            const x = HEX_SIZE * Math.sqrt(3) * (pos.q + pos.r / 2) * SPACING;
            const y = HEX_SIZE * 1.5 * pos.r * SPACING;
            return { pos, x, y };
        });

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
                x: x - centerX,
                y: y - centerY
            };
        });
    };

    // --- Interaction ---
    const handlePointerDown = (tile: HexTile, e: React.PointerEvent) => {
        if (isChecking || feedback !== 'idle') return;
        if (gridContainerRef.current && e.pointerId) {
            gridContainerRef.current.setPointerCapture(e.pointerId);
        }
        setIsDragging(true);
        lastHoveredHexId.current = tile.id;
        setSelectedPath([tile.id]);
    };

    const handleContainerPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging || isChecking || feedback !== 'idle') return;
        if (!gridContainerRef.current) return;

        const rect = gridContainerRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const relativeX = e.clientX - rect.left - centerX;
        const relativeY = e.clientY - rect.top - centerY;

        const HIT_THRESHOLD = HEX_SIZE * 1.0;
        let closestHex: HexTile | null = null;
        let closestDistance = Infinity;

        for (const hex of hexGrid) {
            const dx = relativeX - hex.x;
            const dy = relativeY - hex.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < HIT_THRESHOLD && distance < closestDistance) {
                closestDistance = distance;
                closestHex = hex;
            }
        }

        if (!closestHex) return;
        if (lastHoveredHexId.current === closestHex.id) return;
        lastHoveredHexId.current = closestHex.id;

        const lastId = selectedPath[selectedPath.length - 1];
        const lastTile = hexGrid.find(h => h.id === lastId);
        if (!lastTile) return;

        if (selectedPath.length >= 2 && closestHex.id === selectedPath[selectedPath.length - 2]) {
            setSelectedPath(prev => prev.slice(0, -1));
            return;
        }

        if (isAdjacent(lastTile, closestHex) && !selectedPath.includes(closestHex.id)) {
            setSelectedPath([...selectedPath, closestHex.id]);
        }
    };

    const handlePointerUp = () => {
        setIsDragging(false);
        lastHoveredHexId.current = null;

        if (currentIndex < gameWords.length) {
            const targetWord = gameWords[currentIndex].word.toUpperCase().replace(/[^A-Z]/g, '');
            const currentWord = selectedPath.map(id => hexGrid.find(h => h.id === id)?.char).join('');

            if (currentWord === targetWord && selectedPath.length === targetWord.length) {
                checkAnswer(selectedPath);
            } else {
                setSelectedPath([]);
            }
        }
    };

    useEffect(() => {
        const handleGlobalUp = () => {
            if (isDragging) {
                handlePointerUp();
            }
        };
        window.addEventListener('pointerup', handleGlobalUp);
        return () => window.removeEventListener('pointerup', handleGlobalUp);
    }, [isDragging, selectedPath]);

    const isAdjacent = (a: HexTile, b: HexTile) => {
        const dq = a.q - b.q;
        const dr = a.r - b.r;
        const ds = a.s - b.s;
        return (Math.abs(dq) + Math.abs(dr) + Math.abs(ds)) === 2;
    };

    const checkAnswer = async (pathIds: string[]) => {
        setIsChecking(true);
        const timeTaken = (Date.now() - wordStartTime) / 1000;

        const selectedWord = pathIds.map(id => hexGrid.find(h => h.id === id)?.char).join('');
        const currentW = gameWords[currentIndex];
        const targetWord = currentW.word.toUpperCase().replace(/[^A-Z]/g, '');

        if (selectedWord === targetWord) {
            // Correct
            setFeedback('correct');
            setScore(prev => prev + 100 + (hintsRevealed ? 0 : 50));
            setCorrectCount(prev => prev + 1);

            setAnswers(prev => [...prev, { wordId: currentW.id, isCorrect: true, timeTaken }]);

            confetti({
                particleCount: 80,
                spread: 70,
                colors: ['#FCD34D', '#F59E0B', '#FFFFFF']
            });

            setTimeout(() => {
                if (currentIndex >= gameWords.length - 1) {
                    finishGame();
                } else {
                    goToNext();
                }
            }, 1000);
        } else {
            // Wrong
            setFeedback('wrong');
            setAnswers(prev => [...prev, { wordId: currentW.id, isCorrect: false, timeTaken }]);

            await controls.start({
                x: [0, -10, 10, -10, 10, 0],
                transition: { duration: 0.4 }
            });

            setTimeout(() => {
                setFeedback('idle');
                setSelectedPath([]);
                setIsChecking(false);
            }, 800);
        }
    };

    const useHint = () => {
        if (!hintsRevealed && !isChecking) {
            setHintsRevealed(true);
            setScore(prev => Math.max(0, prev - 20));
        }
    };

    const goToNext = () => {
        setCurrentIndex(prev => prev + 1);
    };

    const finishGame = () => {
        onComplete(score, correctCount, gameWords.length, answers);
    };

    const speakWord = () => {
        if ('speechSynthesis' in window && currentIndex < gameWords.length) {
            const utterance = new SpeechSynthesisUtterance(gameWords[currentIndex].word);
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
        }
    };

    if (gameWords.length === 0) return (<div className="h-full flex items-center justify-center text-white">Loading Hive...</div>);

    const currentWord = gameWords[currentIndex];
    const currentAttemptString = selectedPath.map(id => hexGrid.find(h => h.id === id)?.char).join('');

    return (
        <div className="fixed inset-0 h-[100dvh] z-40 flex flex-col items-center bg-[#1a1a1a] text-white font-sans overflow-hidden">

            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-yellow-500/5 rounded-full blur-[128px]" />
                <div className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-amber-600/5 rounded-full blur-[128px]" />
            </div>

            {/* Header - Compact */}
            <div className="w-full max-w-4xl px-4 py-2 flex justify-between items-center relative z-20 flex-shrink-0">

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/dashboard')}
                    className="absolute left-4 top-2 text-white/50 hover:text-white hover:bg-white/10 z-50 rounded-full"
                >
                    <Hexagon className="w-6 h-6" />
                </Button>

                {/* Level Progress */}
                <div className="flex flex-col items-center gap-1 mx-auto">
                    <span className="text-xs font-bold text-yellow-500 tracking-widest uppercase">Level {currentIndex + 1}/{gameWords.length}</span>
                    <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-yellow-500"
                            animate={{ width: `${((currentIndex) / gameWords.length) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="absolute right-4 top-2 flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="font-bold tabular-nums">{score}</span>
                </div>
            </div>

            {/* Game Content - Fixed Height */}
            <div className="flex-1 flex flex-col items-center justify-start gap-2 sm:gap-4 w-full max-w-4xl relative z-20 py-2 overflow-hidden">

                {/* Hint Card */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    key={currentIndex}
                    className="w-full max-w-xl px-4 flex-shrink-0"
                >
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/20 to-amber-600/20 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition duration-1000" />
                        <div className="relative bg-[#252525] border border-white/10 p-3 rounded-xl text-center shadow-xl">
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <span className="text-yellow-500 text-xs font-bold tracking-[0.2em] uppercase">Meaning Hint</span>
                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-yellow-500/20 text-yellow-500" onClick={useHint}>
                                    <Lightbulb className="w-3 h-3" />
                                </Button>
                            </div>
                            <h2 className="text-lg md:text-xl font-bold text-white leading-tight">
                                {currentWord.meaning}
                            </h2>
                            {hintsRevealed && (
                                <p className="mt-4 text-yellow-400/80 text-sm font-medium animate-pulse">
                                    Starts with '{currentWord.word[0]}', Ends with '{currentWord.word[currentWord.word.length - 1]}'
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Current Attempt Display - Compact */}
                <div className="h-6 sm:h-8 flex items-center justify-center gap-1 flex-shrink-0">
                    {Array.from({ length: currentWord.word.replace(/[^a-zA-Z]/g, '').length }).map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-0.5 sm:gap-1">
                            <span className={`text-base sm:text-xl md:text-2xl font-bold transition-all duration-300 ${i < currentAttemptString.length ? 'text-white translate-y-0' : 'text-white/20 translate-y-2'}`}>
                                {currentAttemptString[i] || '_'}
                            </span>
                            <div className={`w-4 sm:w-5 md:w-6 h-0.5 transition-colors duration-300 ${i < currentAttemptString.length ? 'bg-yellow-500' : 'bg-white/20'}`} />
                        </div>
                    ))}
                </div>

                {/* Tip Text */}
                <div className="text-center flex-shrink-0">
                    <p className="text-yellow-500/60 text-[8px] sm:text-[10px] font-medium">
                        💡 ลากเพื่อเชื่อมต่อตัวอักษร
                    </p>
                </div>

                {/* Grid Container */}
                <div
                    ref={gridContainerRef}
                    onPointerMove={handleContainerPointerMove}
                    onPointerUp={handlePointerUp}
                    className="relative w-full flex-1 flex items-center justify-center min-h-0"
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

                            // Visual State
                            let statusColor = "bg-[#333]";
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
                                        transform: 'translate(-50%, -50%)',
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{
                                        type: "spring",
                                        delay: Math.random() * 0.2
                                    }}
                                >
                                    <div className={`absolute inset-1 [clip-path:polygon(50%_0%,_100%_25%,_100%_75%,_50%_100%,_0%_75%,_0%_25%)] border-2 opacity-50 pointer-events-none ${isSelected ? 'border-black/20' : 'border-white/5'}`} />

                                    <span className={`text-xl sm:text-3xl md:text-4xl font-black ${textColor} z-10`}>
                                        {hex.char}
                                    </span>
                                </motion.button>
                            );
                        })}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
