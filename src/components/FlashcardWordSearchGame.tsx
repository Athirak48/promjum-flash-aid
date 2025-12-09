import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Trophy, Search, RotateCcw, Gamepad2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import BackgroundDecorations from '@/components/BackgroundDecorations';

interface Flashcard {
    id: string;
    front_text: string;
    back_text: string;
    front_image?: string | null;
    back_image?: string | null;
}

interface FlashcardWordSearchGameProps {
    flashcards: Flashcard[];
    onClose: () => void;
    onNext?: () => void;
}

interface GridCell {
    letter: string;
    row: number;
    col: number;
    isFound: boolean;
    isSelected: boolean;
    isPartOfWord?: boolean; // For debugging or hints
}

interface WordLocation {
    word: string; // The word to find (front_text)
    id: string; // Flashcard ID
    startRow: number;
    startCol: number;
    endRow: number;
    endCol: number;
    color: string; // Color for highlighting when found
}

const COLORS = [
    'bg-red-400/50', 'bg-blue-400/50', 'bg-green-400/50', 'bg-yellow-400/50',
    'bg-purple-400/50', 'bg-pink-400/50', 'bg-indigo-400/50', 'bg-orange-400/50'
];

export function FlashcardWordSearchGame({ flashcards, onClose, onNext }: FlashcardWordSearchGameProps) {
    const navigate = useNavigate();
    const [grid, setGrid] = useState<GridCell[][]>([]);
    const [wordsToFind, setWordsToFind] = useState<Flashcard[]>([]);
    const [foundWords, setFoundWords] = useState<string[]>([]); // IDs of found flashcards
    const [selecting, setSelecting] = useState(false);
    const [selectionStart, setSelectionStart] = useState<{ row: number; col: number } | null>(null);
    const [currentSelection, setCurrentSelection] = useState<{ row: number; col: number }[]>([]);
    const [gameComplete, setGameComplete] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsedTime, setElapsedTime] = useState<string>('');
    const [gridSize, setGridSize] = useState(10);
    const [wordLocations, setWordLocations] = useState<WordLocation[]>([]);

    // Initialize game
    useEffect(() => {
        initializeGame();
    }, [flashcards]);

    const initializeGame = () => {
        // 1. Select words (filter out empty or too long words if necessary, but we'll adapt grid)
        // Let's take up to 8 words to keep it playable
        const shuffled = [...flashcards].sort(() => 0.5 - Math.random()).slice(0, 8);
        const words = shuffled.map(f => ({
            ...f,
            cleanWord: f.front_text.toUpperCase().replace(/[^A-Z]/g, '') // Only letters
        })).filter(w => w.cleanWord.length > 1); // Filter out single letters or empty

        setWordsToFind(words);
        setFoundWords([]);
        setGameComplete(false);
        setStartTime(Date.now());
        setElapsedTime('');

        // 2. Determine grid size
        // Formula: Base 7x7. If longest word > 7, increase size.
        // Example: Longest 9 -> 10x10. So size = longest + 1.
        const longestWord = Math.max(...words.map(w => w.cleanWord.length), 0);
        const size = Math.max(7, longestWord + 1);
        setGridSize(size);

        // 3. Generate Grid
        generateGrid(size, words);
    };

    const generateGrid = (size: number, words: (Flashcard & { cleanWord: string })[]) => {
        // Create empty grid
        let newGrid: GridCell[][] = Array(size).fill(null).map((_, r) =>
            Array(size).fill(null).map((_, c) => ({
                letter: '',
                row: r,
                col: c,
                isFound: false,
                isSelected: false
            }))
        );

        const locations: WordLocation[] = [];
        const directions = [
            [0, 1],   // Horizontal
            [1, 0],   // Vertical
            [1, 1],   // Diagonal down-right
            [1, -1]   // Diagonal down-left
        ];

        // Place words
        for (const wordObj of words) {
            const word = wordObj.cleanWord;
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < 100) {
                const dir = directions[Math.floor(Math.random() * directions.length)];
                const startRow = Math.floor(Math.random() * size);
                const startCol = Math.floor(Math.random() * size);

                // Check if fits
                let fits = true;
                for (let i = 0; i < word.length; i++) {
                    const r = startRow + dir[0] * i;
                    const c = startCol + dir[1] * i;

                    if (r < 0 || r >= size || c < 0 || c >= size) {
                        fits = false;
                        break;
                    }
                    if (newGrid[r][c].letter !== '' && newGrid[r][c].letter !== word[i]) {
                        fits = false;
                        break;
                    }
                }

                if (fits) {
                    // Place it
                    for (let i = 0; i < word.length; i++) {
                        const r = startRow + dir[0] * i;
                        const c = startCol + dir[1] * i;
                        newGrid[r][c].letter = word[i];
                    }

                    locations.push({
                        word: word,
                        id: wordObj.id,
                        startRow,
                        startCol,
                        endRow: startRow + dir[0] * (word.length - 1),
                        endCol: startCol + dir[1] * (word.length - 1),
                        color: COLORS[locations.length % COLORS.length]
                    });
                    placed = true;
                }
                attempts++;
            }
        }

        // Fill empty spaces
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (newGrid[r][c].letter === '') {
                    newGrid[r][c].letter = letters[Math.floor(Math.random() * letters.length)];
                }
            }
        }

        setGrid(newGrid);
        setWordLocations(locations);
    };

    // Interaction Handlers
    const handleMouseDown = (row: number, col: number) => {
        if (gameComplete) return;
        setSelecting(true);
        setSelectionStart({ row, col });
        setCurrentSelection([{ row, col }]);
        updateGridSelection([{ row, col }]);
    };

    const handleMouseEnter = (row: number, col: number) => {
        if (!selecting || !selectionStart || gameComplete) return;

        // Calculate line from start to current
        const start = selectionStart;
        const end = { row, col };

        // Determine direction
        const dRow = end.row - start.row;
        const dCol = end.col - start.col;

        // Check if straight line (horizontal, vertical, or diagonal)
        // For diagonal, abs(dRow) must equal abs(dCol)
        const isHorizontal = dRow === 0;
        const isVertical = dCol === 0;
        const isDiagonal = Math.abs(dRow) === Math.abs(dCol);

        if (isHorizontal || isVertical || isDiagonal) {
            // Generate points along the line
            const points: { row: number; col: number }[] = [];
            const steps = Math.max(Math.abs(dRow), Math.abs(dCol));
            const stepRow = dRow === 0 ? 0 : dRow / steps;
            const stepCol = dCol === 0 ? 0 : dCol / steps;

            for (let i = 0; i <= steps; i++) {
                points.push({
                    row: start.row + stepRow * i,
                    col: start.col + stepCol * i
                });
            }
            setCurrentSelection(points);
            updateGridSelection(points);
        }
    };

    const handleMouseUp = () => {
        if (!selecting || gameComplete) return;
        setSelecting(false);

        // Check if selected word matches any target
        const selectedWord = currentSelection.map(p => grid[p.row][p.col].letter).join('');

        // Check forward and backward
        const match = wordLocations.find(l => {
            if (foundWords.includes(l.id)) return false;

            // Check if selection matches location coordinates
            // This is more robust than just string matching (which might have duplicates)
            const start = currentSelection[0];
            const end = currentSelection[currentSelection.length - 1];

            const matchForward = (start.row === l.startRow && start.col === l.startCol && end.row === l.endRow && end.col === l.endCol);
            const matchBackward = (start.row === l.endRow && start.col === l.endCol && end.row === l.startRow && end.col === l.startCol);

            return matchForward || matchBackward;
        });

        if (match) {
            // Found a word!
            const newFound = [...foundWords, match.id];
            setFoundWords(newFound);

            // Mark permanently in grid
            const newGrid = [...grid];
            currentSelection.forEach(p => {
                newGrid[p.row][p.col].isFound = true;
                // We could store the color in the cell if we want multiple colors
            });
            setGrid(newGrid);

            if (newFound.length === wordsToFind.length) {
                handleGameComplete();
            }
        }

        // Clear selection
        setCurrentSelection([]);
        updateGridSelection([]);
    };

    const updateGridSelection = (selection: { row: number; col: number }[]) => {
        setGrid(prev => prev.map(row => row.map(cell => ({
            ...cell,
            isSelected: selection.some(s => s.row === cell.row && s.col === cell.col)
        }))));
    };

    const handleGameComplete = () => {
        setGameComplete(true);

        // Calculate time
        if (startTime) {
            const end = Date.now();
            const diff = Math.floor((end - startTime) / 1000); // seconds
            const minutes = Math.floor(diff / 60);
            const seconds = diff % 60;
            setElapsedTime(`${minutes > 0 ? `${minutes} นาที ` : ''}${seconds} วินาที`);
        }

        confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
        });
    };

    // Touch support (basic mapping to mouse events)
    const handleTouchStart = (e: React.TouchEvent, row: number, col: number) => {
        e.preventDefault(); // Prevent scrolling
        handleMouseDown(row, col);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        e.preventDefault();
        if (!selecting) return;

        // Find element under touch
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (element) {
            const row = parseInt(element.getAttribute('data-row') || '-1');
            const col = parseInt(element.getAttribute('data-col') || '-1');
            if (row >= 0 && col >= 0) {
                handleMouseEnter(row, col);
            }
        }
    };

    return (
        <div className="h-[100dvh] bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden flex flex-col font-sans text-slate-800">
            <BackgroundDecorations />

            {/* Header */}
            <div className="shrink-0 w-full flex items-center justify-between p-3 relative z-10">
                <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full hover:bg-slate-200/50 text-slate-500 hover:text-slate-800 transition-colors h-8 px-2">
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    ออก
                </Button>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full shadow-sm border border-white/50">
                        <Search className="h-4 w-4 text-blue-600" />
                        <span className="font-bold text-sm text-slate-800">Word Search ({foundWords.length}/{wordsToFind.length})</span>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={initializeGame} className="rounded-full hover:bg-slate-200/50 text-slate-500 hover:text-slate-800 transition-colors h-8 w-8">
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>

            {/* Main Content - Compact Layout */}
            <div className="flex-1 flex flex-col lg:flex-row gap-2 sm:gap-4 p-2 sm:p-4 min-h-0 relative z-10 max-w-5xl mx-auto w-full items-center justify-center">

                {/* Word List - Compact sidebar */}
                <div className="w-full lg:w-64 shrink-0 order-2 lg:order-1 h-[25vh] lg:h-full lg:max-h-[600px] overflow-hidden flex flex-col justify-center">
                    <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg border border-white/60 p-2 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-1 px-1 shrink-0">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                <Search className="h-3.5 w-3.5 text-blue-500" />
                                คำศัพท์ ({foundWords.length}/{wordsToFind.length})
                            </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2 overflow-y-auto pr-1 custom-scrollbar flex-1 content-start">
                            {wordsToFind.map((word, idx) => {
                                const isFound = foundWords.includes(word.id);
                                const location = wordLocations.find(l => l.id === word.id);

                                return (
                                    <motion.div
                                        key={word.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className={`
                                            px-2 py-1.5 rounded-lg transition-all duration-300 flex items-center justify-between text-xs sm:text-sm
                                            ${isFound
                                                ? 'bg-green-50/80 text-green-600 border border-green-100'
                                                : 'bg-white shadow-sm border border-slate-100 text-slate-700 hover:shadow-md hover:-translate-y-0.5 hover:border-blue-200'
                                            }
                                        `}
                                    >
                                        <span className={`font-medium truncate ${isFound ? 'line-through decoration-green-400' : ''}`}>
                                            {word.back_text}
                                        </span>
                                        {isFound && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="h-3 w-3 rounded-full bg-green-500 flex items-center justify-center shrink-0 ml-1.5"
                                            >
                                                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                                </svg>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Game Grid Container - More compact */}
                <div className="flex-1 w-full max-w-lg lg:max-w-xl flex items-center justify-center min-h-0 order-1 lg:order-2 h-[60vh] lg:h-auto lg:aspect-square">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-2 sm:p-4 w-full h-full border border-white/60 flex flex-col relative overflow-hidden"
                    >
                        {/* Decorative gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 -z-10"></div>


                        <div
                            className="grid gap-0.5 sm:gap-1 select-none touch-none mx-auto flex-1 h-full w-full object-contain"
                            style={{
                                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                                aspectRatio: '1/1',
                                maxHeight: '100%',
                                maxWidth: '100%'
                            }}
                            onMouseLeave={handleMouseUp}
                            onTouchEnd={handleMouseUp}
                        >
                            {grid.map((row, r) => (
                                row.map((cell, c) => {
                                    // Determine cell style
                                    const isSelected = cell.isSelected;
                                    const isFound = cell.isFound;

                                    // Find which word this found cell belongs to (for coloring)
                                    let cellColor = 'bg-slate-100/80';
                                    let textColor = 'text-slate-500';
                                    let shadow = '';
                                    let ring = '';

                                    if (isFound) {
                                        // Find the word location that covers this cell
                                        const loc = wordLocations.find(l =>
                                            foundWords.includes(l.id) &&
                                            isPointOnLine({ row: r, col: c }, { row: l.startRow, col: l.startCol }, { row: l.endRow, col: l.endCol })
                                        );
                                        if (loc) {
                                            cellColor = loc.color;
                                            textColor = 'text-slate-800 font-bold';
                                            shadow = 'shadow-sm';
                                        }
                                    } else if (isSelected) {
                                        cellColor = 'bg-gradient-to-br from-blue-500 to-indigo-500 scale-110 z-20';
                                        textColor = 'text-white font-bold';
                                        shadow = 'shadow-lg shadow-blue-300/50';
                                        ring = 'ring-2 ring-blue-300/50 ring-offset-1';
                                    }

                                    return (
                                        <motion.div
                                            key={`${r}-${c}`}
                                            data-row={r}
                                            data-col={c}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: (r * gridSize + c) * 0.005 }}
                                            className={`
                                                flex items-center justify-center
                                                text-xs sm:text-sm md:text-base font-bold rounded-md sm:rounded-lg cursor-pointer
                                                transition-all duration-150 select-none
                                                ${cellColor} ${textColor} ${shadow} ${ring}
                                                ${!isSelected && !isFound ? 'hover:bg-white hover:shadow-md hover:scale-110 hover:text-blue-600 hover:z-10 hover:ring-2 hover:ring-blue-200' : ''}
                                            `}
                                            onMouseDown={() => handleMouseDown(r, c)}
                                            onMouseEnter={() => handleMouseEnter(r, c)}
                                            onMouseUp={handleMouseUp}
                                            onTouchStart={(e) => handleTouchStart(e, r, c)}
                                            onTouchMove={handleTouchMove}
                                        >
                                            {cell.letter}
                                        </motion.div>
                                    );
                                })
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Completion Modal */}
            <AnimatePresence>
                {gameComplete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl text-center border border-white/50 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-50 to-transparent -z-10"></div>

                            <div className="w-20 h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center mx-auto mb-6 border border-slate-50">
                                <Trophy className="h-10 w-10 text-yellow-500 drop-shadow-sm" />
                            </div>

                            <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">ยอดเยี่ยม!</h2>
                            <p className="text-slate-500 mb-6 font-medium text-base">
                                คุณหาคำศัพท์ครบทั้งหมดแล้ว
                            </p>

                            <div className="bg-slate-50 rounded-2xl p-4 mb-8 border border-slate-100">
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">เวลาที่ใช้</p>
                                <p className="text-2xl font-black text-blue-600 tracking-tight">{elapsedTime}</p>
                            </div>

                            <div className="flex flex-row gap-2 justify-center w-full">
                                <Button
                                    onClick={initializeGame}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all rounded-xl h-12 text-sm font-bold active:scale-95"
                                >
                                    เล่นอีกครั้ง
                                </Button>

                                <Button
                                    onClick={() => {
                                        const selectedVocab = flashcards.map(f => ({
                                            id: f.id,
                                            word: f.front_text,
                                            meaning: f.back_text
                                        }));
                                        navigate('/ai-listening-section3-intro', {
                                            state: { selectedVocab }
                                        });
                                    }}
                                    className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-800 border-0 rounded-xl h-12 text-sm font-bold active:scale-95 transition-all"
                                >
                                    <Gamepad2 className="h-4 w-4 mr-1.5" />
                                    เลือกเกมใหม่
                                </Button>

                                <Button
                                    onClick={onNext || onClose}
                                    className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-800 border-0 rounded-xl h-12 text-sm font-bold active:scale-95 transition-all"
                                >
                                    ถัดไป
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Helper to check if a point is on a line segment
function isPointOnLine(p: { row: number, col: number }, start: { row: number, col: number }, end: { row: number, col: number }): boolean {
    // 1. Check if point is within bounding box (inclusive)
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);
    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);

    if (p.row < minRow || p.row > maxRow || p.col < minCol || p.col > maxCol) {
        return false;
    }

    // 2. Use cross-product to check collinearity (avoids division by zero)
    // (y - y1) * (x2 - x1) === (x - x1) * (y2 - y1)
    const dRowTotal = end.row - start.row;
    const dColTotal = end.col - start.col;
    const dRowP = p.row - start.row;
    const dColP = p.col - start.col;

    return dRowP * dColTotal === dColP * dRowTotal;
}
