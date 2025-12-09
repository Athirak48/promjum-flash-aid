import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Home, Eye, Sparkles, RotateCcw, Gamepad2, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import BackgroundDecorations from '@/components/BackgroundDecorations';
import { useSRSProgress } from '@/hooks/useSRSProgress';
import { motion, AnimatePresence } from 'framer-motion';

interface Flashcard {
  id: string;
  front_text: string;
  back_text: string;
  created_at: string;
  isUserFlashcard?: boolean;
}

interface FlashcardVocabBlinderGameProps {
  flashcards: Flashcard[];
  onClose: () => void;
  onNext?: () => void;
}

interface BlindedWord {
  original: string;
  display: string;
  hiddenIndices: number[];
  missingLetters: string[];
}

export function FlashcardVocabBlinderGame({ flashcards, onClose, onNext }: FlashcardVocabBlinderGameProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
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

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setWrongCount(0);
    setIsGameComplete(false);
  };

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
    await updateFromVocabBlinder(currentCard.id, isCorrect || false, currentCard.isUserFlashcard);

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
        <Card className="max-w-lg w-full shadow-2xl relative z-10 bg-white/90 backdrop-blur-xl border-white/50 rounded-[2rem]">
          <CardHeader className="text-center pb-2 pt-6">
            <div className="text-5xl mb-2 animate-bounce">👁️</div>
            <CardTitle className="text-2xl font-bold text-foreground bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              สรุปผล Vocab Blinder
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-4 text-white text-center shadow-lg transform hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold mb-1">{score}</div>
              <div className="text-sm opacity-90 font-medium">คะแนนรวม</div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/30 rounded-xl border border-green-100">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {correctCount}
                </div>
                <div className="text-xs text-green-700 dark:text-green-300 mt-1 font-medium">
                  ถูกต้อง
                </div>
              </div>
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/30 rounded-xl border border-red-100">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {wrongCount}
                </div>
                <div className="text-xs text-red-700 dark:text-red-300 mt-1 font-medium">
                  ผิด
                </div>
              </div>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-100">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {accuracy}%
                </div>
                <div className="text-xs text-blue-700 dark:text-blue-300 mt-1 font-medium">
                  ความแม่นยำ
                </div>
              </div>
            </div>

            <div className="flex flex-row gap-3 justify-center">
              <Button
                onClick={handleRestart}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:-translate-y-1 transition-all rounded-xl h-12 text-sm md:text-base"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
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
                variant="outline"
                className="flex-1 rounded-xl h-12 text-sm md:text-base border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              >
                <Gamepad2 className="h-4 w-4 mr-2" />
                เลือกเกมใหม่
              </Button>

              <Button
                onClick={onNext || onClose}
                variant="outline"
                className="flex-1 rounded-xl h-12 text-sm md:text-base border-gray-200"
              >
                ถัดไป
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100 dark:from-indigo-950 dark:via-purple-900 dark:to-indigo-950 overflow-hidden">
      <BackgroundDecorations />

      <div className="h-full flex flex-col relative z-10 p-4 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full hover:bg-slate-200/50 text-slate-500 hover:text-slate-800 transition-colors h-8 px-2">
            <ArrowLeft className="mr-1 h-4 w-4" />
            ออก
          </Button>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white/80 backdrop-blur-md px-2 py-1 rounded-lg shadow-sm border border-white/50">
              <Trophy className="h-3.5 w-3.5 text-yellow-500" />
              <span className="font-bold text-sm">{score}</span>
            </div>
            <div className="bg-white/80 backdrop-blur-md px-2 py-1 rounded-lg shadow-sm border border-white/50">
              <span className="font-bold text-sm text-primary">
                {currentIndex + 1} / {flashcards.length}
              </span>
            </div>
          </div>
        </div>

        {/* Main Game Card */}
        <Card className="flex-1 flex flex-col bg-white/90 backdrop-blur-xl border-white/50 shadow-xl rounded-[1.5rem] overflow-hidden min-h-0">
          <CardHeader className="pb-0 pt-4 shrink-0">
            <CardTitle className="text-center text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
              <Eye className="w-6 h-6 text-indigo-600" /> Vocab Blinder
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-4 min-h-0 overflow-y-auto">
            {/* Word Display Area */}
            <div className="flex-1 flex flex-col items-center justify-center py-2 shrink-0">
              <div className="mb-1 text-[10px] font-medium text-gray-500 uppercase tracking-widest">
                {showResult ? 'เฉลยคำศัพท์' : 'เติมคำในช่องว่าง'}
              </div>

              <div className="text-4xl sm:text-5xl font-mono font-bold tracking-widest text-indigo-900 dark:text-indigo-100 mb-3 break-words text-center relative">
                {showResult ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center justify-center gap-1"
                  >
                    {blindedWord?.original.split('').map((char, i) => (
                      <span key={i} className={`
                                        inline-block
                                        ${blindedWord.hiddenIndices.includes(i)
                          ? (isCorrect ? 'text-green-600' : 'text-red-500')
                          : 'text-indigo-900'}
                                    `}>
                        {char}
                      </span>
                    ))}
                  </motion.div>
                ) : (
                  blindedWord?.display.split('').map((char, i) => (
                    <span key={i} className={`inline-block transition-all duration-300 ${char === '_' ? 'text-indigo-500 animate-pulse' : ''}`}>
                      {char}
                    </span>
                  ))
                )}
              </div>

              <div className="mt-2 flex items-center justify-center gap-2 text-muted-foreground/80 bg-slate-100/50 dark:bg-slate-800/50 px-4 py-1.5 rounded-full border border-slate-200/50 dark:border-slate-700/50">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <p className="font-medium text-sm sm:text-base text-center line-clamp-2">
                  {currentCard.back_text}
                </p>
              </div>
            </div>

            {/* Options / Result Area */}
            <div className="shrink-0 mt-auto pt-2">
              {!showResult ? (
                <div className="grid grid-cols-2 gap-3">
                  {options.map((option, index) => {
                    const isSelected = selectedOption === option;
                    return (
                      <Button
                        key={index}
                        onClick={() => handleOptionSelect(option)}
                        className={`
                                            h-14 sm:h-16 text-2xl font-bold rounded-xl transition-all duration-200
                                            bg-white hover:bg-indigo-50 border-2 border-indigo-100 text-indigo-900
                                            ${isSelected ? 'bg-indigo-600 border-indigo-700 text-white scale-95' : 'hover:-translate-y-0.5 hover:shadow-sm'}
                                        `}
                      >
                        {option}
                      </Button>
                    );
                  })}
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className={`p-3 rounded-xl text-center mb-3 flex items-center justify-center gap-2 ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {isCorrect ? <Sparkles className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    <p className="text-base font-bold">
                      {isCorrect ? 'ถูกต้อง! เก่งมาก' : 'ยังไม่ถูกนะ สู้ๆ!'}
                    </p>
                  </div>

                  <Button
                    onClick={handleNext}
                    className="w-full h-12 text-lg rounded-xl shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-indigo-600 to-purple-600 border-0 text-white"
                  >
                    {currentIndex < flashcards.length - 1 ? 'ข้อถัดไป' : 'ดูสรุปผล'}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
