import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Volume2, CheckCircle2, XCircle, ArrowRight, Pause, RotateCcw, Home } from 'lucide-react';

interface Flashcard {
  id: string;
  front_text: string;
  back_text: string;
}

interface FlashcardListenChooseGameProps {
  flashcards: Flashcard[];
  onClose: () => void;
}

interface Question {
  word: string;
  correctAnswer: string;
  choices: string[];
}

export const FlashcardListenChooseGame = ({ flashcards, onClose }: FlashcardListenChooseGameProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<Question[]>([]);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const maxPlayCount = 3;

  useEffect(() => {
    // Generate questions from flashcards
    const generatedQuestions = flashcards.slice(0, 10).map((card) => {
      const correctAnswer = card.back_text;
      
      // Generate wrong choices
      const otherCards = flashcards.filter(c => c.id !== card.id);
      const wrongChoices = otherCards
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(c => c.back_text);
      
      // Combine and shuffle
      const choices = [correctAnswer, ...wrongChoices].sort(() => Math.random() - 0.5);
      
      return {
        word: card.front_text,
        correctAnswer,
        choices
      };
    });
    
    setQuestions(generatedQuestions);
  }, [flashcards]);

  const currentQuestion = questions[currentQuestionIndex];

  const handlePlayAudio = () => {
    if (playCount >= maxPlayCount) return;
    
    setPlayCount(playCount + 1);
    
    // Use Web Speech API for TTS
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentQuestion.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback) return;
    
    setSelectedAnswer(answer);
    setShowFeedback(true);
    
    const isCorrect = answer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
    } else {
      setWrongAnswers([...wrongAnswers, currentQuestion]);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setPlayCount(0);
    } else {
      setIsGameComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore(0);
    setWrongAnswers([]);
    setIsGameComplete(false);
    setPlayCount(0);
  };

  const getScoreLevel = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 90) return { text: 'ยอดเยี่ยม! 🥇', color: 'text-green-600' };
    if (percentage >= 70) return { text: 'ดีมาก! 🥈', color: 'text-blue-600' };
    if (percentage >= 50) return { text: 'พอใช้ 🥉', color: 'text-orange-600' };
    return { text: 'ควรฝึกฝนเพิ่มเติม 📚', color: 'text-red-600' };
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-purple-950 dark:via-pink-900 dark:to-purple-950 flex items-center justify-center">
        <Card className="p-6">
          <p className="text-center">กำลังโหลดคำถาม...</p>
        </Card>
      </div>
    );
  }

  // Summary Page
  if (isGameComplete) {
    const scoreLevel = getScoreLevel();
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-purple-950 dark:via-pink-900 dark:to-purple-950 p-4">
        <div className="container mx-auto max-w-2xl py-8">
          {/* Summary Card */}
          <Card className="mb-6 shadow-glow">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2">🎉 เสร็จสิ้น!</h2>
                <p className="text-muted-foreground">คุณทำแบบทดสอบเสร็จแล้ว</p>
              </div>

              {/* Score Display */}
              <div className="bg-gradient-primary rounded-lg p-6 mb-6">
                <div className="text-white">
                  <div className="text-5xl font-bold mb-2">
                    {score}/{questions.length}
                  </div>
                  <div className="text-xl mb-2">{percentage}%</div>
                  <div className={`text-lg font-medium ${scoreLevel.color} bg-white rounded-full px-4 py-2 inline-block`}>
                    {scoreLevel.text}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleRestart}
                  className="w-full bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  <RotateCcw className="h-5 w-5 mr-2" />
                  เล่นอีกครั้ง
                </Button>
                
                {wrongAnswers.length > 0 && (
                  <Button 
                    onClick={() => {
                      // Scroll to wrong answers section
                      document.getElementById('wrong-answers')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    📖 ทบทวนคำที่ผิด ({wrongAnswers.length})
                  </Button>
                )}
                
                <Button 
                  onClick={onClose}
                  variant="ghost"
                  className="w-full"
                  size="lg"
                >
                  <Home className="h-5 w-5 mr-2" />
                  กลับหน้าเมนูหลัก
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Wrong Answers Section */}
          {wrongAnswers.length > 0 && (
            <Card id="wrong-answers" className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  📚 คำศัพท์ที่ตอบผิด
                </h3>
                <div className="space-y-3">
                  {wrongAnswers.map((question, index) => (
                    <div 
                      key={index}
                      className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-red-900 dark:text-red-100 mb-1">
                            {question.word}
                          </div>
                          <div className="text-sm text-red-700 dark:text-red-300">
                            คำตอบที่ถูก: <span className="font-semibold">{question.correctAnswer}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Game Play
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-purple-950 dark:via-pink-900 dark:to-purple-950 p-4">
      <div className="container mx-auto max-w-2xl py-8">
        {/* Header */}
        <Card className="mb-6 shadow-glow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                🎧 Listen & Choose
              </h1>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                คะแนน: {score}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>ข้อที่ {currentQuestionIndex + 1} จาก {questions.length}</span>
                <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%</span>
              </div>
              <Progress 
                value={((currentQuestionIndex + 1) / questions.length) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Game Area */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="p-8">
            {/* Audio Button */}
            <div className="text-center mb-8">
              <Button
                onClick={handlePlayAudio}
                size="lg"
                disabled={playCount >= maxPlayCount}
                className="h-24 w-24 rounded-full bg-gradient-primary hover:shadow-glow transition-all duration-300 hover:scale-105"
              >
                <Volume2 className="h-12 w-12" />
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                {playCount >= maxPlayCount 
                  ? 'ฟังครบ 3 ครั้งแล้ว' 
                  : `ฟังเสียงอีกครั้ง (${playCount}/${maxPlayCount})`
                }
              </p>
            </div>

            {/* Choices */}
            <div className="space-y-3 mb-6">
              {currentQuestion.choices.map((choice, index) => {
                const isSelected = selectedAnswer === choice;
                const isCorrect = choice === currentQuestion.correctAnswer;
                const showCorrect = showFeedback && isCorrect;
                const showWrong = showFeedback && isSelected && !isCorrect;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(choice)}
                    disabled={showFeedback}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 hover:scale-102 ${
                      showCorrect 
                        ? 'bg-green-50 border-green-500 dark:bg-green-900/20' 
                        : showWrong 
                        ? 'bg-red-50 border-red-500 dark:bg-red-900/20' 
                        : isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-accent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          showCorrect 
                            ? 'bg-green-500 text-white' 
                            : showWrong 
                            ? 'bg-red-500 text-white' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="font-medium">{choice}</span>
                      </div>
                      {showCorrect && <CheckCircle2 className="h-6 w-6 text-green-600" />}
                      {showWrong && <XCircle className="h-6 w-6 text-red-600" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Feedback */}
            {showFeedback && (
              <Card className={`mb-6 ${
                selectedAnswer === currentQuestion.correctAnswer 
                  ? 'bg-green-50 border-green-500 dark:bg-green-900/20' 
                  : 'bg-red-50 border-red-500 dark:bg-red-900/20'
              }`}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {selectedAnswer === currentQuestion.correctAnswer ? (
                        <>
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                          <div>
                            <p className="font-bold text-green-700 dark:text-green-300">ถูกต้อง! 🎉</p>
                            <p className="text-sm text-green-600 dark:text-green-400">
                              คำตอบคือ: {currentQuestion.correctAnswer}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-6 w-6 text-red-600" />
                          <div>
                            <p className="font-bold text-red-700 dark:text-red-300">ไม่ถูกต้อง</p>
                            <p className="text-sm text-red-600 dark:text-red-400">
                              คำตอบที่ถูกคือ: {currentQuestion.correctAnswer}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-muted-foreground mb-1">ประโยคที่ฟัง:</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{currentQuestion.word}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Next Button */}
            {showFeedback && (
              <Button 
                onClick={handleNext}
                className="w-full"
                size="lg"
              >
                {currentQuestionIndex < questions.length - 1 ? (
                  <>
                    คำถามถัดไป
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                ) : (
                  'ดูผลคะแนน'
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1"
          >
            <Pause className="h-4 w-4 mr-2" />
            หยุดชั่วคราว
          </Button>
          <Button 
            variant="outline" 
            onClick={handleRestart}
            className="flex-1"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            เล่นใหม่
          </Button>
        </div>
      </div>
    </div>
  );
};
