import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Home, Eye, Sparkles, RotateCcw, Gamepad2, ArrowRight, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import BackgroundDecorations from '@/components/BackgroundDecorations';
import { useSRSProgress } from '@/hooks/useSRSProgress';
import { motion, AnimatePresence } from 'framer-motion';
import { useXP } from '@/hooks/useXP';
import { useAnalytics } from '@/hooks/useAnalytics';

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
  onSelectNewGame?: () => void;
}

interface BlindedWord {
  original: string;
  display: string;
  hiddenIndices: number[];
  missingLetters: string[];
}

export function FlashcardVocabBlinderGame({ flashcards, onClose, onNext, onSelectNewGame }: FlashcardVocabBlinderGameProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { updateFromVocabBlinder } = useSRSProgress();
  const { addGameXP } = useXP();
  const { trackGame } = useAnalytics();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [blindedWord, setBlindedWord] = useState<BlindedWord | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [streak, setStreak] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [totalXPEarned, setTotalXPEarned] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [timeTakenForCurrent, setTimeTakenForCurrent] = useState(0);
  const [gameStartTime] = useState(Date.now());

  // Stats
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [wrongWords, setWrongWords] = useState<{ word: string; meaning: string }[]>([]);

  const currentCard = flashcards[currentIndex];

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setWrongCount(0);
    setWrongWords([]);
    setIsGameComplete(false);
    setQuestionStartTime(Date.now());
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

    if (currentIndex === 0) {
      trackGame('vocabBlinder', 'start', undefined, {
        totalCards: flashcards.length
      });
    }

    // Clean the word: remove part-of-speech notation like (v.), (n.), (adv.), (adj.) etc.
    let word = currentCard.front_text.trim();
    // Remove content in parentheses and any surrounding whitespace
    word = word.replace(/\s*\([^)]*\)\s*/g, '').trim();
    // Also remove any trailing dots or punctuation
    word = word.replace(/[.,;:!?]+$/g, '').trim();

    const blinded = createBlindedWordSimple(word);
    setBlindedWord(blinded);
    generateOptionsSimple(blinded.missingLetters[0]);
    setSelectedOption(null);
    setIsCorrect(null);
    setShowResult(false);
    setIsCorrect(null);
    setShowResult(false);
    setQuestionStartTime(Date.now());
  }, [currentIndex]);

  const handleOptionSelect = (option: string) => {
    if (selectedOption) return;

    setSelectedOption(option);

    const timeTaken = (Date.now() - questionStartTime) / 1000;
    setTimeTakenForCurrent(timeTaken);

    const correct = option === blindedWord?.missingLetters[0];

    setIsCorrect(correct);

    if (correct) {
      setScore(score + 10 + (streak * 2));
      setStreak(streak + 1);
      setCorrectCount(correctCount + 1);

      // Add XP for correct answer
      addGameXP('vocab-blinder', true, false).then(xpResult => {
        if (xpResult?.xpAdded) {
          setTotalXPEarned(prev => prev + xpResult.xpAdded);
        }
      });
    } else {
      setStreak(0);
      setWrongCount(wrongCount + 1);
      // Track wrong word
      setWrongWords(prev => [...prev, { word: currentCard.front_text, meaning: currentCard.back_text }]);
    }

    setShowResult(true);
  };

  const handleNext = async () => {
    // Update SRS
    await updateFromVocabBlinder(currentCard.id, isCorrect || false, timeTakenForCurrent, currentCard.isUserFlashcard);
    console.log(`👁️ VocabBlinder SRS: ${currentCard.id} Correct=${isCorrect} Time=${timeTakenForCurrent.toFixed(1)}s`);

    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsGameComplete(true);
      const duration = Math.round((Date.now() - gameStartTime) / 1000);
      trackGame('vocabBlinder', 'complete', score, {
        totalCards: flashcards.length,
        correctAnswers: correctCount + (isCorrect ? 1 : 0),
        wrongAnswers: wrongCount + (!isCorrect ? 1 : 0),
        duration: duration
      });
    }
  };

  if (isGameComplete) {
    const total = correctCount + wrongCount;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
        {/* Background Decorations handled by parent or global CSS usually, but we can add local flair if needed */}

        <Card className="max-w-sm w-full shadow-2xl relative z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-white/20 dark:border-slate-800 rounded-3xl overflow-hidden ring-1 ring-white/50 dark:ring-slate-700">

          {/* Header Gradient Stripe */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />

          <CardHeader className="text-center pb-2 pt-8 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl" />
            <div className="relative inline-flex mb-2 animate-bounce">
              <span className="text-5xl filter drop-shadow-md">👁️</span>
            </div>
            <CardTitle className="text-xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {t('games.summary')} {t('games.vocabBlinder')}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5 p-6">

            {/* Main Score Display */}
            <div className="relative group perspective">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 rounded-2xl p-5 text-white text-center shadow-xl transform transition-transform hover:scale-[1.02]">
                <div className="text-5xl font-black tracking-tight drop-shadow-sm">{score}</div>
                <div className="text-xs font-bold uppercase tracking-widest opacity-90 mt-1">{t('games.totalScore')}</div>
              </div>
            </div>

            {/* Stats Grid - Clean Glass Style */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                <span className="text-2xl font-black text-green-500 drop-shadow-sm">{correctCount}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">{t('common.correct')}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                <span className="text-2xl font-black text-red-500 drop-shadow-sm">{wrongCount}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">{t('common.incorrect')}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                <span className={`text-2xl font-black drop-shadow-sm ${accuracy >= 80 ? 'text-purple-500' : 'text-blue-500'}`}>{accuracy}%</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">{t('common.accuracy')}</span>
              </div>
            </div>

            {/* Wrong Words Section - Refined */}
            {wrongWords.length > 0 ? (
              <div className="bg-red-50/50 dark:bg-red-900/10 rounded-2xl p-4 border border-red-100 dark:border-red-900/30">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                    <X className="w-3 h-3 text-red-500" />
                  </div>
                  <span className="font-bold text-xs text-red-800 dark:text-red-300 uppercase tracking-wide">{t('games.wrongWords')}</span>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                  {wrongWords.map((w, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white dark:bg-white/5 rounded-lg px-3 py-2 shadow-sm border border-red-50 dark:border-white/5">
                      <span className="font-bold text-xs text-slate-700 dark:text-slate-200">{w.word}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{w.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-green-50/50 dark:bg-green-900/10 rounded-2xl p-6 border border-green-100 dark:border-green-900/30 text-center flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center animate-pulse">
                  <Sparkles className="w-5 h-5 text-green-600" />
                </div>
                <span className="font-bold text-sm text-green-800 dark:text-green-300">{t('games.noWrongWords')}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                onClick={handleRestart}
                className="col-span-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl h-12 shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4 mr-2 text-slate-400" />
                {t('games.playAgain')}
              </Button>
              <Button
                onClick={onClose}
                className="col-span-1 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-black hover:to-slate-900 text-white font-bold rounded-xl h-12 shadow-lg hover:shadow-xl transition-all active:scale-95 border-0"
              >
                <span>{t('common.next')}</span>
                <ArrowRight className="w-4 h-4 ml-2 opacity-80" />
              </Button>
              {/* Select Game Button - Full Width */}
              <Button
                onClick={() => onSelectNewGame && onSelectNewGame()}
                variant="ghost"
                className="col-span-2 text-xs font-semibold text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 h-auto py-2 rounded-lg"
              >
                <Gamepad2 className="w-3.5 h-3.5 mr-1.5" />
                {t('games.selectGame')}
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
            <div className="bg-white/80 backdrop-blur-md px-2 py-1 rounded-lg shadow-sm border border-white/50 opacity-0 pointer-events-none hidden">
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
            <p className="text-xs text-center font-bold text-slate-400 mt-1 uppercase tracking-wider">
              ข้อที่ {currentIndex + 1} จาก {flashcards.length}
            </p>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-4 min-h-0 overflow-y-auto">
            {/* Word Display Area */}
            <div className="flex-1 flex flex-col items-center justify-center py-2 shrink-0">
              <div className="mb-1 text-[10px] font-medium text-gray-500 uppercase tracking-widest">
                {showResult ? 'เฉลยคำศัพท์' : 'เติมคำในช่องว่าง'}
              </div>

              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-6 px-2">
                {(() => {
                  const textToRender = showResult ? blindedWord?.original : blindedWord?.display;
                  if (!textToRender) return null;

                  const words = textToRender.split(' ');
                  let globalCharIndex = 0;

                  return words.map((word, wordIndex) => {
                    const wordElement = (
                      <div key={wordIndex} className="flex flex-wrap justify-center">
                        {word.split('').map((char, charOffset) => {
                          const currentIndex = globalCharIndex + charOffset;

                          // Styling logic
                          let className = "inline-block text-2xl sm:text-3xl md:text-4xl font-mono font-bold tracking-widest transition-all duration-300 ";

                          if (showResult) {
                            const isHidden = blindedWord?.hiddenIndices.includes(currentIndex);
                            if (isHidden) {
                              className += isCorrect ? 'text-green-600' : 'text-red-500';
                            } else {
                              className += 'text-slate-900';
                            }
                          } else {
                            // Game Mode
                            if (char === '_') {
                              className += 'text-indigo-500 animate-pulse';
                            } else if (char === '●') { // Fallback if using bullet
                              className += 'text-slate-900';
                            } else {
                              className += 'text-slate-900';
                            }
                          }

                          return (
                            <span key={currentIndex} className={className}>
                              {char}
                            </span>
                          );
                        })}
                      </div>
                    );

                    // Advance index for word length + 1 for space (if not last)
                    globalCharIndex += word.length + 1;
                    return wordElement;
                  });
                })()}
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
