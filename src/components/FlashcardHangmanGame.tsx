import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import BackgroundDecorations from '@/components/BackgroundDecorations';

interface Flashcard {
  id: string;
  front_text: string;
  back_text: string;
  created_at: string;
}

interface FlashcardHangmanGameProps {
  flashcards: Flashcard[];
  onClose: () => void;
}

export function FlashcardHangmanGame({ flashcards, onClose }: FlashcardHangmanGameProps) {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [showResult, setShowResult] = useState(false);

  const maxWrongGuesses = 7;
  const currentCard = flashcards[currentIndex];
  const targetWord = currentCard.front_text.toUpperCase().trim();

  // Calculate how many hints to show
  const getHintPositions = (word: string): number[] => {
    const wordLength = word.length;
    const hintCount = wordLength <= 6 ? 1 : 2;
    const positions: number[] = [];
    
    // Randomly select hint positions
    const availablePositions = Array.from({ length: wordLength }, (_, i) => i);
    for (let i = 0; i < hintCount; i++) {
      const randomIndex = Math.floor(Math.random() * availablePositions.length);
      positions.push(availablePositions[randomIndex]);
      availablePositions.splice(randomIndex, 1);
    }
    
    return positions;
  };

  const [hintPositions] = useState(() => getHintPositions(targetWord));

  // Generate alphabet buttons
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Check if letter is in word
  const handleLetterClick = (letter: string) => {
    if (guessedLetters.includes(letter) || gameStatus !== 'playing') return;

    const newGuessedLetters = [...guessedLetters, letter];
    setGuessedLetters(newGuessedLetters);

    if (!targetWord.includes(letter)) {
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);

      if (newWrongGuesses >= maxWrongGuesses) {
        setGameStatus('lost');
        setShowResult(true);
      }
    } else {
      // Check if word is complete
      const isComplete = targetWord.split('').every(
        char => newGuessedLetters.includes(char) || hintPositions.includes(targetWord.indexOf(char))
      );

      if (isComplete) {
        const wordScore = targetWord.length * 10;
        setScore(score + wordScore);
        setGameStatus('won');
        setShowResult(true);
      }
    }
  };

  // Display word with guessed letters
  const displayWord = () => {
    return targetWord.split('').map((letter, index) => {
      if (guessedLetters.includes(letter) || hintPositions.includes(index)) {
        return letter;
      }
      return '_';
    }).join(' ');
  };

  // Move to next word
  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setGuessedLetters([]);
      setWrongGuesses(0);
      setGameStatus('playing');
      setShowResult(false);
    } else {
      // Game finished
      onClose();
    }
  };

  // Draw hangman
  const drawHangman = () => {
    const stages = [
      // Stage 0 - empty
      <div key="0" className="text-6xl">🎯</div>,
      // Stage 1
      <div key="1" className="text-6xl">😐</div>,
      // Stage 2
      <div key="2" className="text-6xl">😟</div>,
      // Stage 3
      <div key="3" className="text-6xl">😧</div>,
      // Stage 4
      <div key="4" className="text-6xl">😨</div>,
      // Stage 5
      <div key="5" className="text-6xl">😰</div>,
      // Stage 6
      <div key="6" className="text-6xl">😱</div>,
      // Stage 7 - complete (lost)
      <div key="7" className="text-6xl">💀</div>,
    ];

    return stages[wrongGuesses];
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-purple-950 dark:via-pink-900 dark:to-purple-950 overflow-auto">
      <BackgroundDecorations />
      
      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={onClose}
            variant="ghost"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับ
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 px-4 py-2 rounded-lg">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="font-bold">{score}</span>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 px-4 py-2 rounded-lg">
              <span className="font-bold">
                {currentIndex + 1} / {flashcards.length}
              </span>
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                🎮 Hangman Master: The Vocabulary Duel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hangman Drawing */}
              <div className="flex justify-center items-center py-8">
                {drawHangman()}
              </div>

              {/* Wrong Guesses Counter */}
              <div className="text-center">
                <p className="text-lg font-semibold">
                  เดาผิด: {wrongGuesses} / {maxWrongGuesses}
                </p>
              </div>

              {/* Word Display */}
              <div className="text-center">
                <p className="text-4xl font-mono font-bold tracking-wider mb-4">
                  {displayWord()}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  คำใบ้: {currentCard.back_text}
                </p>
              </div>

              {/* Result Message */}
              {showResult && (
                <div className="text-center">
                  {gameStatus === 'won' ? (
                    <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-lg">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                        🎉 ชนะแล้ว! +{targetWord.length * 10} คะแนน
                      </p>
                      <p className="text-lg">คำตอบ: {targetWord}</p>
                    </div>
                  ) : (
                    <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg">
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
                        💀 แพ้แล้ว!
                      </p>
                      <p className="text-lg">คำตอบ: {targetWord}</p>
                    </div>
                  )}
                  
                  <Button
                    onClick={handleNext}
                    className="mt-4"
                    size="lg"
                  >
                    {currentIndex < flashcards.length - 1 ? 'ข้อถัดไป' : 'จบเกม'}
                  </Button>
                </div>
              )}

              {/* Alphabet Buttons */}
              {!showResult && (
                <div className="grid grid-cols-7 gap-2">
                  {alphabet.map((letter) => (
                    <Button
                      key={letter}
                      onClick={() => handleLetterClick(letter)}
                      disabled={guessedLetters.includes(letter)}
                      variant={guessedLetters.includes(letter) ? 'outline' : 'default'}
                      className={`
                        ${guessedLetters.includes(letter) 
                          ? targetWord.includes(letter) 
                            ? 'bg-green-500 text-white' 
                            : 'bg-red-500 text-white'
                          : ''
                        }
                      `}
                    >
                      {letter}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
