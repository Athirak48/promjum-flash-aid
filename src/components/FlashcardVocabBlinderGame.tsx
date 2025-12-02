import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Eye, EyeOff, Home } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import BackgroundDecorations from '@/components/BackgroundDecorations';
import { useSRSProgress } from '@/hooks/useSRSProgress';

interface Flashcard {
  id: string;
  front_text: string;
  back_text: string;
  created_at: string;
}

interface FlashcardVocabBlinderGameProps {
  flashcards: Flashcard[];
  onClose: () => void;
}

interface BlindedWord {
  original: string;
  display: string;
  hiddenIndices: number[];
  missingLetters: string[];
}

export function FlashcardVocabBlinderGame({ flashcards, onClose }: FlashcardVocabBlinderGameProps) {
  const { t } = useLanguage();
  const { updateFromVocabBlinder } = useSRSProgress();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [blindedWord, setBlindedWord] = useState<BlindedWord | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [streak, setStreak] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isGameComplete, setIsGameComplete] = useState(false);

  // Stats
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  const currentCard = flashcards[currentIndex];

  // Override createBlindedWord for this specific simplified gameplay
  const createBlindedWordSimple = (word: string): BlindedWord => {
    // Hide exactly one non-space character
    const indices: number[] = [];
    const validIndices = word.split('').map((c, i) => c !== ' ' ? i : -1).filter(i => i !== -1);

    if (validIndices.length > 0) {
      const randomIdx = validIndices[Math.floor(Math.random() * validIndices.length)];
      indices.push(randomIdx);
    }

    const display = word.split('').map((char, i) =>
      indices.includes(i) ? '_' : char
    ).join('');

    const missingLetters = indices.map(i => word[i]);

    return {
      original: word,
      display,
      hiddenIndices: indices,
      missingLetters
    };
  };

  // Override generate options to match the simple single-letter hiding
  const generateOptionsSimple = (correctLetter: string) => {
    // Mix of similar looking letters or random ones
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    const opts = [correctLetter];

    while (opts.length < 4) {
      const randomChar = alphabet[Math.floor(Math.random() * alphabet.length)];
      // Try to match case
      const charToUse = correctLetter === correctLetter.toUpperCase() ? randomChar.toUpperCase() : randomChar;

      if (!opts.includes(charToUse)) {
        opts.push(charToUse);
      }
    }
    setOptions(opts.sort(() => Math.random() - 0.5));
  };

  useEffect(() => {
    if (!currentCard) return;
    const word = currentCard.front_text.trim();
    const blinded = createBlindedWordSimple(word);
    setBlindedWord(blinded);
    generateOptionsSimple(blinded.missingLetters[0]);
    setSelectedOption(null);
    setIsCorrect(null);
    setShowResult(false);
  }, [currentIndex]);

  const handleOptionSelect = (option: string) => {
    if (selectedOption) return;

    setSelectedOption(option);
    const correct = option === blindedWord?.missingLetters[0];

    setIsCorrect(correct);

    if (correct) {
      setScore(score + 10 + (streak * 2));
      setStreak(streak + 1);
      setCorrectCount(correctCount + 1);
    } else {
      setStreak(0);
      setWrongCount(wrongCount + 1);
    }

    setShowResult(true);
  };

  const handleNext = async () => {
    // Update SRS
    await updateFromVocabBlinder(currentCard.id, isCorrect || false);

    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsGameComplete(true);
    }
  };

  if (isGameComplete) {
    const total = correctCount + wrongCount;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    return (
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100 dark:from-indigo-950 dark:via-purple-900 dark:to-indigo-950 overflow-auto flex items-center justify-center p-4">
        <BackgroundDecorations />
        <Card className="max-w-xl w-full shadow-2xl relative z-10 bg-white/90 backdrop-blur-xl border-white/50 rounded-[2rem]">
          <CardHeader className="text-center pb-2">
            <div className="text-6xl mb-4 animate-bounce">👁️</div>
            <CardTitle className="text-3xl font-bold text-foreground bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              สรุปผล Vocab Blinder
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-6 text-white text-center shadow-lg transform hover:scale-105 transition-transform duration-300">
              <div className="text-6xl font-bold mb-2">{score}</div>
              <div className="text-xl opacity-90 font-medium">คะแนนรวม</div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-2xl border border-green-100">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {correctCount}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300 mt-1 font-medium">
                  ถูกต้อง
                </div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/30 rounded-2xl border border-red-100">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {wrongCount}
                </div>
                <div className="text-sm text-red-700 dark:text-red-300 mt-1 font-medium">
                  ผิด
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-2xl border border-blue-100">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {accuracy}%
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300 mt-1 font-medium">
                  ความแม่นยำ
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={onClose}
                className="flex-1 rounded-xl h-12 text-lg font-medium"
                size="lg"
                variant="outline"
              >
                <Home className="h-5 w-5 mr-2" />
                กลับหน้าหลัก
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100 dark:from-indigo-950 dark:via-purple-900 dark:to-indigo-950 overflow-auto">
      <BackgroundDecorations />

      <div className="container mx-auto px-2 md:px-4 py-4 md:py-6 relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <Button variant="ghost" onClick={onClose} className="rounded-full hover:bg-slate-200/50 text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft className="mr-2 h-5 w-5" />
            ออก
          </Button>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex items-center gap-1.5 md:gap-2 bg-white/80 backdrop-blur-md px-3 md:px-4 py-1.5 md:py-2 rounded-xl shadow-sm border border-white/50">
              <Trophy className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
              <span className="font-bold text-base md:text-lg">{score}</span>
            </div>
            <div className="bg-white/80 backdrop-blur-md px-3 md:px-4 py-1.5 md:py-2 rounded-xl shadow-sm border border-white/50">
              <span className="font-bold text-base md:text-lg text-primary">
                {currentIndex + 1} / {flashcards.length}
              </span>
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="flex-1 flex items-center justify-center max-w-2xl mx-auto w-full">
          <Card className="w-full bg-white/90 backdrop-blur-xl border-white/50 shadow-2xl rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden">
            <CardHeader className="pb-0 md:pb-2 pt-4 md:pt-6">
              <CardTitle className="text-center text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
                <span className="text-2xl md:text-3xl">👁️</span> Vocab Blinder
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-8 p-4 md:p-8">

              {/* Word Display */}
              <div className="text-center py-4 md:py-8">
                <div className="mb-2 text-xs md:text-sm font-medium text-gray-500 uppercase tracking-widest">เติมคำในช่องว่าง</div>
                <div className="text-3xl md:text-6xl font-mono font-bold tracking-widest text-indigo-900 dark:text-indigo-100 mb-4 md:mb-6 break-words">
                  {blindedWord?.display.split('').map((char, i) => (
                    <span key={i} className={`inline-block transition-all duration-300 ${char === '_' ? 'text-indigo-500 animate-pulse' : ''}`}>
                      {char}
                    </span>
                  ))}
                </div>

                <div className="bg-indigo-50/80 px-4 py-2 md:px-6 md:py-4 rounded-xl md:rounded-2xl inline-block border border-indigo-100 max-w-full md:max-w-lg">
                  <p className="text-gray-600 dark:text-gray-400 font-medium text-base md:text-lg">
                    {currentCard.back_text}
                  </p>
                </div>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {options.map((option, index) => {
                  const isSelected = selectedOption === option;
                  const isCorrectOption = option === blindedWord?.missingLetters[0];

                  let buttonStyle = "bg-white hover:bg-indigo-50 border-2 border-indigo-100 text-indigo-900";

                  if (showResult) {
                    if (isCorrectOption) {
                      buttonStyle = "bg-green-500 border-green-600 text-white shadow-lg scale-105";
                    } else if (isSelected && !isCorrectOption) {
                      buttonStyle = "bg-red-500 border-red-600 text-white opacity-50";
                    } else {
                      buttonStyle = "bg-gray-100 text-gray-400 border-gray-200";
                    }
                  } else if (isSelected) {
                    buttonStyle = "bg-indigo-600 border-indigo-700 text-white shadow-lg scale-95";
                  }

                  return (
                    <Button
                      key={index}
                      onClick={() => handleOptionSelect(option)}
                      disabled={showResult}
                      className={`
                        h-14 md:h-20 text-xl md:text-3xl font-bold rounded-xl md:rounded-2xl transition-all duration-300
                        ${buttonStyle}
                        ${!showResult && 'hover:-translate-y-1 hover:shadow-md'}
                      `}
                    >
                      {option}
                    </Button>
                  );
                })}
              </div>

              {/* Result Feedback */}
              {showResult && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 pt-2 md:pt-4">
                  <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl text-center mb-3 md:mb-4 ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <p className="text-lg md:text-xl font-bold">
                      {isCorrect ? '🎉 ถูกต้อง! เก่งมาก' : `😅 ผิดจ้า! คำที่ถูกคือ "${blindedWord?.original}"`}
                    </p>
                  </div>

                  <Button
                    onClick={handleNext}
                    className="w-full h-12 md:h-14 text-lg md:text-xl rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all bg-gradient-to-r from-indigo-600 to-purple-600 border-0"
                    size="lg"
                  >
                    {currentIndex < flashcards.length - 1 ? 'ข้อถัดไป' : 'ดูสรุปผล'}
                  </Button>
                </div>
              )}

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
