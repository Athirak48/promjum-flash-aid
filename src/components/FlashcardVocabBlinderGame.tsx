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

interface FlashcardVocabBlinderGameProps {
  flashcards: Flashcard[];
  onClose: () => void;
}

interface BlindedWord {
  word: string;
  hiddenPositions: number[];
  missingLetters: string[];
}

export function FlashcardVocabBlinderGame({ flashcards, onClose }: FlashcardVocabBlinderGameProps) {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);

  const currentCard = flashcards[currentIndex];
  const targetWord = currentCard.front_text.toUpperCase().trim();

  // Generate blinded word with 50% letters hidden
  const generateBlindedWord = (word: string): BlindedWord => {
    const wordLength = word.length;
    const hideCount = Math.ceil(wordLength * 0.5);
    
    // Generate random positions to hide
    const positions = Array.from({ length: wordLength }, (_, i) => i);
    const hiddenPositions: number[] = [];
    
    for (let i = 0; i < hideCount; i++) {
      const randomIndex = Math.floor(Math.random() * positions.length);
      hiddenPositions.push(positions[randomIndex]);
      positions.splice(randomIndex, 1);
    }
    
    hiddenPositions.sort((a, b) => a - b);
    
    // Extract missing letters in order
    const missingLetters = hiddenPositions.map(pos => word[pos]);
    
    return {
      word,
      hiddenPositions,
      missingLetters
    };
  };

  const [blindedWord] = useState(() => generateBlindedWord(targetWord));

  // Display blinded word
  const displayBlindedWord = () => {
    return targetWord.split('').map((letter, index) => {
      if (blindedWord.hiddenPositions.includes(index)) {
        return '_';
      }
      return letter;
    }).join(' ');
  };

  // Generate wrong answers
  const generateWrongAnswers = (correctLetters: string[]): string[][] => {
    const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const wrongAnswers: string[][] = [];
    
    for (let i = 0; i < 3; i++) {
      const wrongAnswer: string[] = [];
      for (let j = 0; j < correctLetters.length; j++) {
        // 50% chance to keep the correct letter, 50% to replace with similar/common letter
        if (Math.random() > 0.5) {
          wrongAnswer.push(correctLetters[j]);
        } else {
          // Get a different letter
          let randomLetter;
          do {
            randomLetter = allLetters[Math.floor(Math.random() * allLetters.length)];
          } while (randomLetter === correctLetters[j]);
          wrongAnswer.push(randomLetter);
        }
      }
      wrongAnswers.push(wrongAnswer);
    }
    
    return wrongAnswers;
  };

  const [answers] = useState(() => {
    const correctAnswer = blindedWord.missingLetters;
    const wrongAnswers = generateWrongAnswers(correctAnswer);
    
    // Combine and shuffle
    const allAnswers = [
      { letters: correctAnswer, isCorrect: true },
      ...wrongAnswers.map(letters => ({ letters, isCorrect: false }))
    ];
    
    // Shuffle
    for (let i = allAnswers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allAnswers[i], allAnswers[j]] = [allAnswers[j], allAnswers[i]];
    }
    
    return allAnswers;
  });

  const handleAnswerSelect = (index: number) => {
    if (showResult) return;

    setSelectedAnswer(index);
    const answer = answers[index];
    const correct = answer.isCorrect;
    
    setIsCorrect(correct);
    setShowResult(true);
    
    if (correct) {
      const wordScore = targetWord.length * 10;
      setScore(score + wordScore);
    }
  };

  const handleNext = () => {
    // Update stats
    if (isCorrect) {
      setCorrectCount(correctCount + 1);
    } else {
      setWrongCount(wrongCount + 1);
    }

    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsCorrect(false);
    } else {
      // Game finished - show summary
      setIsGameComplete(true);
    }
  };

  // Game Complete Summary
  if (isGameComplete) {
    const totalQuestions = correctCount + wrongCount;
    const successRate = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const avgScore = totalQuestions > 0 ? Math.round(score / totalQuestions) : 0;

    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 dark:from-blue-950 dark:via-indigo-900 dark:to-blue-950 overflow-auto flex items-center justify-center p-4">
        <BackgroundDecorations />
        <Card className="max-w-xl w-full shadow-2xl relative z-10">
          <CardHeader className="text-center pb-2">
            <div className="text-6xl mb-4">👁️</div>
            <CardTitle className="text-3xl font-bold text-foreground">
              สรุปผล Vocab Blinder
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Summary */}
            <div className="bg-gradient-primary rounded-xl p-6 text-white text-center">
              <div className="text-5xl font-bold mb-2">{score}</div>
              <div className="text-xl opacity-90">คะแนนรวม</div>
              <div className="text-sm opacity-75 mt-1">เฉลี่ย {avgScore} คะแนน/ข้อ</div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                  {correctCount}
                </div>
                <div className="text-sm text-green-900 dark:text-green-100 mt-1">
                  ตอบถูก
                </div>
              </div>
              <div className="text-center p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <div className="text-3xl font-bold text-red-700 dark:text-red-300">
                  {wrongCount}
                </div>
                <div className="text-sm text-red-900 dark:text-red-100 mt-1">
                  ตอบผิด
                </div>
              </div>
              <div className="text-center p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                  {successRate}%
                </div>
                <div className="text-sm text-blue-900 dark:text-blue-100 mt-1">
                  อัตราความแม่นยำ
                </div>
              </div>
            </div>

            {/* Performance Message */}
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-lg font-semibold text-foreground">
                {successRate >= 90 ? '🌟 สุดยอด! คุณเห็นรายละเอียดได้แม่นยำมาก!' :
                 successRate >= 70 ? '🎯 เยี่ยมมาก! สายตาคุณคมชัด' :
                 successRate >= 50 ? '👍 ดี ฝึกฝนต่อไปจะเก่งขึ้น' :
                 '💪 ยังไม่เป็นไร ลองอีกครั้งนะ!'}
              </p>
            </div>

            {/* Total Cards Info */}
            <div className="text-center text-sm text-muted-foreground">
              เล่นทั้งหมด {totalQuestions} ข้อ
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={onClose}
                className="flex-1"
                size="lg"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                กลับหน้าหลัก
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                👁️ The Vocab Blinder: Precision Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Blinded Word Display */}
              <div className="text-center bg-gray-100 dark:bg-gray-800 p-8 rounded-lg">
                <p className="text-5xl font-mono font-bold tracking-wider mb-4 text-gray-900 dark:text-gray-100">
                  {displayBlindedWord()}
                </p>
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  คำใบ้: {currentCard.back_text}
                </p>
              </div>

              {/* Instruction */}
              <div className="text-center text-lg">
                <p className="font-semibold">เลือกกลุ่มตัวอักษรที่หายไปตามลำดับ</p>
              </div>

              {/* Answer Choices */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {answers.map((answer, index) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showResult}
                    variant="outline"
                    className={`
                      h-auto py-6 text-2xl font-mono
                      ${selectedAnswer === index && showResult
                        ? isCorrect
                          ? 'bg-green-500 text-white border-green-600'
                          : 'bg-red-500 text-white border-red-600'
                        : ''
                      }
                      ${showResult && answer.isCorrect && selectedAnswer !== index
                        ? 'bg-green-100 border-green-400 dark:bg-green-900/30'
                        : ''
                      }
                    `}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-bold mr-2">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span className="tracking-widest">
                        {answer.letters.join(', ')}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>

              {/* Result Message */}
              {showResult && (
                <div className="text-center">
                  {isCorrect ? (
                    <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-lg">
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">
                        ✅ ถูกต้อง! +{targetWord.length * 10} คะแนน
                      </p>
                      <p className="text-lg text-green-900 dark:text-green-100 font-semibold">คำตอบ: {targetWord}</p>
                    </div>
                  ) : (
                    <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg">
                      <p className="text-2xl font-bold text-red-700 dark:text-red-300 mb-2">
                        ❌ ผิด!
                      </p>
                      <p className="text-lg text-red-900 dark:text-red-100 font-semibold">คำตอบที่ถูกต้อง: {targetWord}</p>
                      <p className="text-sm mt-2 text-red-800 dark:text-red-200">
                        ตัวอักษรที่หายไป: {blindedWord.missingLetters.join(', ')}
                      </p>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
