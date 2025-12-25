import { useState, useEffect, useCallback } from 'react';
import { Progress } from '@/components/ui/progress';
import { Clock, Check, Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface FlashcardData {
    id: string;
    front_text: string;
    back_text: string;
}

interface WordSearchComponentProps {
    flashcards: FlashcardData[];
    onComplete: (score: number, correctCount: number, totalCount: number) => void;
    isMultiplayer?: boolean;
}

const GRID_SIZE = 10;
const DIRECTIONS = [
    [0, 1],   // right
    [1, 0],   // down
    [1, 1],   // diagonal down-right
    [-1, 1],  // diagonal up-right
];

export function WordSearchComponent({ flashcards, onComplete, isMultiplayer }: WordSearchComponentProps) {
    const [grid, setGrid] = useState<string[][]>([]);
    const [words, setWords] = useState<string[]>([]);
    const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
    const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
    const [selecting, setSelecting] = useState(false);
    const [currentSelection, setCurrentSelection] = useState<string[]>([]);
    const [elapsedTime, setElapsedTime] = useState(0);

    const totalWords = Math.min(flashcards.length, 6);

    // Generate grid
    useEffect(() => {
        const wordsToFind = flashcards.slice(0, totalWords).map(f =>
            f.back_text.toUpperCase().replace(/[^A-Z]/g, '')
        ).filter(w => w.length <= GRID_SIZE);

        setWords(wordsToFind);

        // Create empty grid
        const newGrid: string[][] = Array(GRID_SIZE).fill(null).map(() =>
            Array(GRID_SIZE).fill('')
        );

        // Place words
        wordsToFind.forEach(word => {
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < 100) {
                const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
                const startRow = Math.floor(Math.random() * GRID_SIZE);
                const startCol = Math.floor(Math.random() * GRID_SIZE);

                if (canPlaceWord(newGrid, word, startRow, startCol, dir)) {
                    placeWord(newGrid, word, startRow, startCol, dir);
                    placed = true;
                }
                attempts++;
            }
        });

        // Fill empty cells
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                if (!newGrid[i][j]) {
                    newGrid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
                }
            }
        }

        setGrid(newGrid);
    }, [flashcards]);

    // Timer
    useEffect(() => {
        const timer = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    const canPlaceWord = (grid: string[][], word: string, row: number, col: number, dir: number[]) => {
        for (let i = 0; i < word.length; i++) {
            const r = row + dir[0] * i;
            const c = col + dir[1] * i;
            if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return false;
            if (grid[r][c] && grid[r][c] !== word[i]) return false;
        }
        return true;
    };

    const placeWord = (grid: string[][], word: string, row: number, col: number, dir: number[]) => {
        for (let i = 0; i < word.length; i++) {
            grid[row + dir[0] * i][col + dir[1] * i] = word[i];
        }
    };

    const handleCellMouseDown = (row: number, col: number) => {
        setSelecting(true);
        setCurrentSelection([`${row}-${col}`]);
    };

    const handleCellMouseEnter = (row: number, col: number) => {
        if (selecting) {
            setCurrentSelection(prev => [...prev, `${row}-${col}`]);
        }
    };

    const handleMouseUp = () => {
        if (selecting && currentSelection.length > 0) {
            // Check if selection forms a word
            const selectedWord = currentSelection.map(cell => {
                const [r, c] = cell.split('-').map(Number);
                return grid[r][c];
            }).join('');

            const reversedWord = selectedWord.split('').reverse().join('');

            if (words.includes(selectedWord) && !foundWords.has(selectedWord)) {
                setFoundWords(prev => new Set([...prev, selectedWord]));
                setSelectedCells(prev => new Set([...prev, ...currentSelection]));

                // Check if all found
                if (foundWords.size + 1 >= words.length) {
                    const timeBonus = Math.max(0, 1000 - elapsedTime * 5);
                    const score = (foundWords.size + 1) * 100 + timeBonus;
                    onComplete(score, foundWords.size + 1, words.length);
                }
            } else if (words.includes(reversedWord) && !foundWords.has(reversedWord)) {
                setFoundWords(prev => new Set([...prev, reversedWord]));
                setSelectedCells(prev => new Set([...prev, ...currentSelection]));

                if (foundWords.size + 1 >= words.length) {
                    const timeBonus = Math.max(0, 1000 - elapsedTime * 5);
                    const score = (foundWords.size + 1) * 100 + timeBonus;
                    onComplete(score, foundWords.size + 1, words.length);
                }
            }
        }
        setSelecting(false);
        setCurrentSelection([]);
    };

    return (
        <div className="max-w-xl mx-auto py-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span>{elapsedTime}s</span>
                </div>
                <Progress value={(foundWords.size / words.length) * 100} className="w-32 h-2" />
                <span className="text-white font-bold">{foundWords.size}/{words.length}</span>
            </div>

            {/* Words to find */}
            <div className="flex flex-wrap gap-2 mb-4 justify-center">
                {words.map(word => (
                    <span
                        key={word}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${foundWords.has(word)
                                ? 'bg-green-500/30 text-green-300 line-through'
                                : 'bg-white/10 text-white'
                            }`}
                    >
                        {word}
                    </span>
                ))}
            </div>

            {/* Grid */}
            <div
                className="inline-block bg-black/30 rounded-xl p-2 select-none"
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {grid.map((row, i) => (
                    <div key={i} className="flex">
                        {row.map((cell, j) => {
                            const cellKey = `${i}-${j}`;
                            const isSelected = selectedCells.has(cellKey);
                            const isCurrentlySelecting = currentSelection.includes(cellKey);

                            return (
                                <motion.button
                                    key={cellKey}
                                    onMouseDown={() => handleCellMouseDown(i, j)}
                                    onMouseEnter={() => handleCellMouseEnter(i, j)}
                                    className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-sm font-bold rounded transition-all ${isSelected
                                            ? 'bg-green-500/50 text-green-200'
                                            : isCurrentlySelecting
                                                ? 'bg-purple-500/50 text-purple-200'
                                                : 'bg-white/5 text-white hover:bg-white/20'
                                        }`}
                                >
                                    {cell}
                                </motion.button>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
