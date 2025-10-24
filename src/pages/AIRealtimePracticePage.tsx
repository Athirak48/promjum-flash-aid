import { useState } from 'react';
import { ArrowLeft, Settings, Mic, MessageSquare, Radio, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { DeckSelectionDialog } from '@/components/DeckSelectionDialog';
import { SpeakingMode } from '@/components/practice/SpeakingMode';
import { SentenceBuilderMode } from '@/components/practice/SentenceBuilderMode';
import { ShadowingMode } from '@/components/practice/ShadowingMode';
import { QuizMode } from '@/components/practice/QuizMode';
import { useRealtimeChat, PracticeMode } from '@/hooks/useRealtimeChat';
import { useToast } from '@/hooks/use-toast';

export default function AIRealtimePracticePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDeckDialog, setShowDeckDialog] = useState(true);
  const [selectedDeck, setSelectedDeck] = useState<{ id: string; name: string } | null>(null);
  const [mode, setMode] = useState<PracticeMode>('speaking');
  
  const {
    isConnected,
    isRecording,
    isSpeaking,
    messages,
    currentTranscript,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    sendTextMessage
  } = useRealtimeChat();

  const handleSelectDeck = async (deckId: string, deckName: string) => {
    setSelectedDeck({ id: deckId, name: deckName });
    setShowDeckDialog(false);
    
    try {
      await connect(mode, deckName);
      
      // Send initial prompt based on mode
      const prompts = {
        speaking: `I'm practicing the "${deckName}" deck. Please start a conversation to help me practice speaking English. Ask me questions about topics in this deck.`,
        'sentence-builder': `I'm using the "${deckName}" deck. Please give me 3-5 vocabulary words from this topic so I can build sentences.`,
        shadowing: `I'm doing shadowing practice with the "${deckName}" deck. Please say a short sentence related to this topic that I can repeat.`,
        quiz: `I want to take a quiz on the "${deckName}" deck. Please create quiz questions about this topic.`
      };
      
      setTimeout(() => {
        sendTextMessage(prompts[mode]);
      }, 1000);
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่",
        variant: "destructive"
      });
    }
  };

  const handleModeChange = (newMode: string) => {
    setMode(newMode as PracticeMode);
    if (isConnected) {
      disconnect();
      setTimeout(() => {
        if (selectedDeck) {
          connect(newMode as PracticeMode, selectedDeck.name);
        }
      }, 500);
    }
  };

  const currentMessage = messages.length > 0 
    ? messages[messages.length - 1].content 
    : currentTranscript || '';

  // Mock data for demo
  const mockVocabulary = ['implement', 'strategy', 'revenue', 'stakeholder', 'optimize'];
  const mockQuizQuestions = [
    {
      type: 'fill-blank' as const,
      question: 'We need to _____ a new marketing strategy.',
      options: ['implement', 'strategy', 'revenue', 'optimize'],
      correctAnswer: 'implement'
    },
    {
      type: 'listen' as const,
      question: 'What word means "a person with an interest in a business"?',
      options: ['strategy', 'stakeholder', 'revenue', 'optimize'],
      correctAnswer: 'stakeholder'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  disconnect();
                  navigate('/decks');
                }}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <div>
                <h1 className="text-xl font-bold">
                  {selectedDeck?.name || 'AI Practice'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isConnected ? '🟢 เชื่อมต่อแล้ว' : '⚪ ไม่ได้เชื่อมต่อ'}
                </p>
              </div>
            </div>

            <Button variant="outline" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={mode} onValueChange={handleModeChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="speaking">
              <Mic className="h-4 w-4 mr-2" />
              Speaking
            </TabsTrigger>
            <TabsTrigger value="sentence-builder">
              <MessageSquare className="h-4 w-4 mr-2" />
              Sentence
            </TabsTrigger>
            <TabsTrigger value="shadowing">
              <Radio className="h-4 w-4 mr-2" />
              Shadowing
            </TabsTrigger>
            <TabsTrigger value="quiz">
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Quiz
            </TabsTrigger>
          </TabsList>

          <TabsContent value="speaking">
            <SpeakingMode
              isRecording={isRecording}
              isSpeaking={isSpeaking}
              currentMessage={currentMessage}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              onSkip={() => sendTextMessage('Next topic please')}
            />
          </TabsContent>

          <TabsContent value="sentence-builder">
            <SentenceBuilderMode
              onSubmit={(sentence) => {
                sendTextMessage(`Please evaluate this sentence: "${sentence}". Check grammar, vocabulary usage, and suggest improvements.`);
              }}
              vocabularyWords={mockVocabulary}
            />
          </TabsContent>

          <TabsContent value="shadowing">
            <ShadowingMode
              sentence={currentMessage}
              isRecording={isRecording}
              onPlayAI={() => {
                // AI voice will play automatically from WebSocket
              }}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              onNextSentence={() => {
                sendTextMessage('Give me another sentence for shadowing practice.');
              }}
            />
          </TabsContent>

          <TabsContent value="quiz">
            <QuizMode
              questions={mockQuizQuestions}
              onComplete={(score) => {
                toast({
                  title: "เสร็จสิ้น!",
                  description: `คุณได้ ${score}/${mockQuizQuestions.length} คะแนน`,
                });
              }}
            />
          </TabsContent>
        </Tabs>

        {/* Messages History */}
        {messages.length > 0 && mode === 'speaking' && (
          <Card className="mt-6 p-4">
            <h3 className="font-semibold mb-3">ประวัติการสนทนา</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-lg ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground ml-8' 
                      : 'bg-accent mr-8'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>

      {/* Deck Selection Dialog */}
      <DeckSelectionDialog
        open={showDeckDialog}
        onOpenChange={setShowDeckDialog}
        onSelectDeck={handleSelectDeck}
      />
    </div>
  );
}
