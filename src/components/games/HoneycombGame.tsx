import { useState, useEffect, useCallback } from 'react';
import { Progress } from '@/components/ui/progress';
import { Clock, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FlashcardData {
    id: string;
    front_text: string;
    back_text: string;
}

interface HoneycombComponentProps {
    flashcards: FlashcardData[];
    onComplete: (score: number, correctCount: number, totalCount: number) => void;
    isMultiplayer?: boolean;
}

interface HexCell {
    id: string;
    letter: string;
    isSelected: boolean;
    isCorrect: boolean | null;
    row: number;
    col: number;
}

export function HoneycombComponent({ flashcards, onComplete, isMultiplayer }: HoneycombComponentProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [cells, setCells] = useState<HexCell[]>([]);
    const [selectedCells, setSelectedCells] = useState<string[]>([]);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    const totalWords = Math.min(flashcards.length, 8);
    const currentCard = flashcards[currentIndex];

    // Generate honeycomb grid
    useEffect(() => {
        if (!currentCard) return;

        const word = currentCard.back_text.toUpperCase();
        const wordLetters = word.split('');

        // Add extra random letters
        const extraLetters = Array(12 - wordLetters.length).fill(null).map(() =>
            String.fromCharCode(65 + Math.floor(Math.random() * 26))
        );

        const allLetters = [...wordLetters, ...extraLetters].sort(() => Math.random() - 0.5);

        // Create hex grid (3 rows)
        const hexCells: HexCell[] = allLetters.slice(0, 12).map((letter, i) => ({
            id: `cell-${i}`,
            letter,
            isSelected: false,
            isCorrect: null,
            row: Math.floor(i / 4),
            col: i % 4
        }));

        setCells(hexCells);
        setSelectedCells([]);
        setShowResult(false);
    }, [currentIndex, currentCard]);

    // Timer
    useEffect(() => {
        const timer = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleCellClick = (cell: HexCell) => {
        if (showResult) return;

        if (cell.isSelected) {
            // Deselect
            setSelectedCells(prev => prev.filter(id => id !== cell.id));
            setCells(prev => prev.map(c =>
                c.id === cell.id ? { ...c, isSelected: false } : c
            ));
        } else {
            // Select
            setSelectedCells(prev => [...prev, cell.id]);
            setCells(prev => prev.map(c =>
                c.id === cell.id ? { ...c, isSelected: true } : c
            ));
        }
    };

    const handleSubmit = () => {
        const selectedWord = selectedCells.map(id =>
            cells.find(c => c.id === id)?.letter || ''
        ).join('');

        const correct = selectedWord === currentCard.back_text.toUpperCase();
        setIsCorrect(correct);
        setShowResult(true);

        if (correct) {
            setCorrectCount(prev => prev + 1);
        }

        setCells(prev => prev.map(c => ({
            ...c,
            isCorrect: c.isSelected ? correct : null
        })));

        setTimeout(() => {
            if (currentIndex < totalWords - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                // Time-based scoring
                const timeBonus = Math.max(0, 1000 - elapsedTime * 10);
                const accuracyBonus = correctCount * 100;
                onComplete(timeBonus + accuracyBonus, correct ? correctCount + 1 : correctCount, totalWords);
            }
        }, 1500);
    };

    if (!currentCard) {
        return <div className="text-white text-center">กำลังโหลด...</div>;
    }

    return (
        <div className="max-w-sm mx-auto px-4 py-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span>{elapsedTime}s</span>
                </div>
                <Progress value={(currentIndex / totalWords) * 100} className="w-32 h-2" />
                <span className="text-white font-bold">{currentIndex + 1}/{totalWords}</span>
            </div>

            {/* Question */}
            <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-3 mb-4 text-center">
                <p className="text-slate-400 text-xs mb-1">หาคำศัพท์</p>
                <p className="text-lg font-bold text-white">{currentCard.front_text}</p>
            </div>

            {/* Selected word preview */}
            <div className="text-center mb-3 min-h-[32px]">
                <span className="text-xl font-bold text-purple-400 tracking-widest">
                    {selectedCells.map(id => cells.find(c => c.id === id)?.letter || '').join('')}
                </span>
            </div>

            {/* Honeycomb Grid */}
            <div className="flex flex-col items-center gap-1 mb-4">
                {[0, 1, 2].map(row => (
                    <div
                        key={row}
                        className={`flex gap-1 ${row === 1 ? 'ml-8' : ''}`}
                    >
                        {cells.filter(c => c.row === row).map(cell => (
                            <motion.button
                                key={cell.id}
                                onClick={() => handleCellClick(cell)}
                                disabled={showResult}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className={`w-10 h-12 sm:w-12 sm:h-14 rounded-lg flex items-center justify-center text-lg sm:text-xl font-bold transition-all ${cell.isCorrect === true
                                    ? 'bg-green-500 text-white'
                                    : cell.isCorrect === false
                                        ? 'bg-red-500 text-white'
                                        : cell.isSelected
                                            ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg'
                                            : 'bg-amber-400/90 text-amber-900 hover:bg-amber-300 shadow-md'
                                    }`}
                                style={{
                                    clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
                                }}
                            >
                                {cell.letter}
                            </motion.button>
                        ))}
                    </div>
                ))}
            </div>

            {/* Submit button */}
            {!showResult && selectedCells.length > 0 && (
                <motion.button
                    onClick={handleSubmit}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm"
                >
                    ตรวจคำตอบ
                </motion.button>
            )}

            {/* Result */}
            <AnimatePresence>
                {showResult && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`text-center p-4 rounded-xl ${isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
                            }`}
                    >
                        {isCorrect ? (
                            <Check className="w-12 h-12 mx-auto text-green-400" />
                        ) : (
                            <>
                                <X className="w-12 h-12 mx-auto text-red-400" />
                                <p className="text-red-400 mt-2">คำตอบ: {currentCard.back_text}</p>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
