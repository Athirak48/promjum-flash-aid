import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, Volume2, RotateCcw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AIRealtimePracticePage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speechRate, setSpeechRate] = useState(0.9); // Default speech rate

  // Refs for speech synthesis
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const synth = window.speechSynthesis;

  // Mock story data
  const story = {
    title: "A Day at the Market",
    titleTh: "วันหนึ่งที่ตลาด",
    sentences: [
      { text: "Yesterday, I went to the local market to buy some fresh fruit.", translation: "เมื่อวานนี้ ฉันไปตลาดท้องถิ่นเพื่อซื้อผลไม้สด" },
      { text: "I saw many colorful apples and bananas on the stalls.", translation: "ฉันเห็นแอปเปิ้ลและกล้วยหลากสีสันมากมายบนแผงขายของ" },
      { text: "The merchant was very friendly and gave me a discount.", translation: "พ่อค้าเป็นมิตรมากและลดราคาให้ฉัน" },
      { text: "I decided to create a delicious fruit salad for dinner.", translation: "ฉันตัดสินใจทำสลัดผลไม้แสนอร่อยสำหรับมื้อเย็น" },
      { text: "It was a simple method to make my family happy.", translation: "มันเป็นวิธีง่ายๆ ที่จะทำให้ครอบครัวของฉันมีความสุข" }
    ]
  };

  // Initialize Voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      setVoices(availableVoices);
      // Prefer English US/UK voices
      const defaultVoice = availableVoices.find(v => v.lang.includes('en-US')) || availableVoices.find(v => v.lang.includes('en'));
      setSelectedVoice(defaultVoice || availableVoices[0]);
    };

    loadVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }

    return () => {
      synth.cancel();
    };
  }, []);

  // Handle Speech Playback
  useEffect(() => {
    if (isPlaying && !isComplete) {
      const sentence = story.sentences[currentSentenceIndex];
      const utterance = new SpeechSynthesisUtterance(sentence.text);
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.rate = speechRate;
      utterance.pitch = 1;

      utterance.onend = () => {
        if (currentSentenceIndex < story.sentences.length - 1) {
          setCurrentSentenceIndex(prev => prev + 1);
        } else {
          setIsPlaying(false);
          setIsComplete(true);
        }
      };

      // Handle interruptions
      utterance.onerror = (e) => {
        console.error("Speech error:", e);
        setIsPlaying(false);
      };

      speechRef.current = utterance;
      synth.speak(utterance);
    } else {
      synth.cancel();
    }
  }, [isPlaying, currentSentenceIndex, selectedVoice, speechRate]);

  const togglePlay = () => {
    if (isPlaying) {
      synth.cancel();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  };

  const handleRestart = () => {
    synth.cancel();
    setCurrentSentenceIndex(0);
    setIsComplete(false);
    setIsPlaying(true);
  };

  const handleFinish = () => {
    synth.cancel();
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
              onClick={() => {
                synth.cancel();
                navigate('/ai-listening-section4-intro');
              }}
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

          {/* Voice & Speed Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 bg-muted/30 p-4 rounded-xl border border-border/50">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground ml-1 flex justify-between">
                <span>{language === 'th' ? 'เสียงอ่าน (Voice)' : 'Voice'}</span>
                <span className="text-[10px] opacity-50">{voices.length > 0 ? `${voices.length} available` : 'Scanning...'}</span>
              </label>

              {voices.length === 0 ? (
                <div className="h-10 px-3 py-2 rounded-lg border border-dashed text-sm text-muted-foreground bg-muted/50 flex items-center justify-center animate-pulse">
                  Loading voices...
                </div>
              ) : (
                <Select
                  value={selectedVoice?.name || ''}
                  onValueChange={(val) => {
                    const voice = voices.find(v => v.name === val);
                    if (voice) setSelectedVoice(voice);
                  }}
                >
                  <SelectTrigger className="w-full bg-background/50">
                    <SelectValue placeholder="Select Voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Priority 1: English Voices */}
                    {voices.filter(v => v.lang.includes('en')).length > 0 ? (
                      voices.filter(v => v.lang.includes('en')).map(v => (
                        <SelectItem key={v.name} value={v.name}>
                          {v.name.replace('Microsoft ', '').replace('Google ', '')} ({v.lang})
                        </SelectItem>
                      ))
                    ) : (
                      // Priority 2: Fallback to all if no English
                      voices.map(v => (
                        <SelectItem key={v.name} value={v.name}>
                          {v.name} ({v.lang})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground ml-1">
                {language === 'th' ? 'ความเร็ว (Speed)' : 'Speed'}
              </label>
              <div className="flex items-center gap-4 h-10 px-2 bg-background/50 rounded-lg border border-border/20">
                <span className="text-xs font-mono w-8 text-right">0.5x</span>
                <Slider
                  defaultValue={[0.9]}
                  max={1.5}
                  min={0.5}
                  step={0.1}
                  className="flex-1"
                  onValueChange={(val) => {
                    setSpeechRate(val[0]);
                  }}
                />
                <span className="text-xs font-mono w-8">1.5x</span>
              </div>
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
