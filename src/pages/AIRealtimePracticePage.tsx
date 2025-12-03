import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, SkipForward, Volume2, RotateCcw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AIRealtimePracticePage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Mock story data - in a real app, this would come from the AI generation based on selected vocab
  const story = {
    title: "A Day at the Market",
    titleTh: "วันหนึ่งที่ตลาด",
    sentences: [
      { text: "Yesterday, I went to the local market to buy some fresh fruit.", translation: "เมื่อวานนี้ ฉันไปตลาดท้องถิ่นเพื่อซื้อผลไม้สด", start: 0, end: 5 },
      { text: "I saw many colorful apples and bananas on the stalls.", translation: "ฉันเห็นแอปเปิ้ลและกล้วยหลากสีสันมากมายบนแผงขายของ", start: 5, end: 10 },
      { text: "The merchant was very friendly and gave me a discount.", translation: "พ่อค้าเป็นมิตรมากและลดราคาให้ฉัน", start: 10, end: 15 },
      { text: "I decided to create a delicious fruit salad for dinner.", translation: "ฉันตัดสินใจทำสลัดผลไม้แสนอร่อยสำหรับมื้อเย็น", start: 15, end: 20 },
      { text: "It was a simple method to make my family happy.", translation: "มันเป็นวิธีง่ายๆ ที่จะทำให้ครอบครัวของฉันมีความสุข", start: 20, end: 25 }
    ]
  };

  // Mock audio progress simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !isComplete) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            setIsComplete(true);
            return 100;
          }
          return prev + 0.5;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isComplete]);

  // Update current sentence based on progress
  useEffect(() => {
    const totalDuration = 25; // assumed total seconds
    const currentTime = (progress / 100) * totalDuration;
    const index = story.sentences.findIndex(s => currentTime >= s.start && currentTime < s.end);
    if (index !== -1) {
      setCurrentSentenceIndex(index);
    } else if (progress >= 100) {
      setCurrentSentenceIndex(story.sentences.length - 1);
    }
  }, [progress]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleRestart = () => {
    setProgress(0);
    setCurrentSentenceIndex(0);
    setIsPlaying(true);
    setIsComplete(false);
  };

  const handleFinish = () => {
    navigate('/ai-listening-mcq');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/ai-listening-section4-intro')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-muted-foreground">
              {language === 'th' ? 'ฝึกฟัง AI' : 'AI Listening Practice'}
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center max-w-3xl">
        <Card className="w-full p-8 shadow-xl border-2 border-primary/5 space-y-8">
          {/* Visualizer / Icon */}
          <div className="flex justify-center mb-8">
            <div className={`relative w-32 h-32 rounded-full flex items-center justify-center bg-green-50 dark:bg-green-900/20 transition-all duration-500 ${isPlaying ? 'scale-110 shadow-[0_0_40px_rgba(34,197,94,0.3)]' : ''}`}>
              <div className={`absolute inset-0 rounded-full border-4 border-green-500/30 ${isPlaying ? 'animate-ping' : ''}`} />
              <Volume2 className={`w-16 h-16 text-green-600 transition-all duration-300 ${isPlaying ? 'scale-110' : ''}`} />
            </div>
          </div>

          {/* Text Display */}
          <div className="space-y-6 text-center min-h-[200px] flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-primary mb-2">
              {language === 'th' ? story.titleTh : story.title}
            </h2>

            <div className="relative">
              <p className={`text-3xl md:text-4xl font-medium leading-relaxed transition-all duration-500 ${isPlaying ? 'text-foreground' : 'text-muted-foreground'}`}>
                "{story.sentences[currentSentenceIndex].text}"
              </p>

              <div className={`mt-4 transition-all duration-500 overflow-hidden ${showTranslation ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="text-xl text-muted-foreground font-light">
                  {story.sentences[currentSentenceIndex].translation}
                </p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6 pt-8">
            {/* Progress Bar */}
            <div className="space-y-2">
              <Slider
                value={[progress]}
                max={100}
                step={1}
                className="cursor-pointer"
                onValueChange={(val) => setProgress(val[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground font-medium">
                <span>0:00</span>
                <span>0:25</span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-6">
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={handleRestart}
              >
                <RotateCcw className="h-5 w-5" />
              </Button>

              <Button
                size="icon"
                className="h-20 w-20 rounded-full shadow-lg hover:scale-105 transition-transform bg-green-600 hover:bg-green-700"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="h-10 w-10 fill-current" />
                ) : (
                  <Play className="h-10 w-10 fill-current ml-1" />
                )}
              </Button>

              <Button
                variant="outline"
                size="icon"
                className={`h-12 w-12 rounded-full ${showTranslation ? 'bg-primary/10 text-primary border-primary/20' : ''}`}
                onClick={() => setShowTranslation(!showTranslation)}
              >
                <span className="text-xs font-bold">EN/TH</span>
              </Button>
            </div>
          </div>

          {/* Completion Action */}
          {isComplete && (
            <div className="pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Button
                size="lg"
                className="w-full h-14 text-lg shadow-lg"
                onClick={handleFinish}
              >
                {language === 'th' ? 'สรุปผลการฝึก' : 'Finish Practice'}
                <CheckCircle className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
