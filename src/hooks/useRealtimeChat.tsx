import { useState, useEffect, useRef } from 'react';
import { AudioRecorder, encodeAudioForAPI, playAudioData, clearAudioQueue } from '@/utils/RealtimeAudio';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export type PracticeMode = 'speaking' | 'sentence-builder' | 'shadowing' | 'quiz';

export const useRealtimeChat = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  
  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { toast } = useToast();

  const connect = async (mode: PracticeMode, deckName?: string) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      }

      const projectRef = 'reazfisntbexfybjkiyq';
      const wsUrl = `wss://${projectRef}.supabase.co/functions/v1/realtime-chat`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        toast({
          title: "เชื่อมต่อสำเร็จ",
          description: "พร้อมเริ่มฝึกพูด",
        });
      };

      wsRef.current.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received event:', data.type);

          if (data.type === 'response.audio.delta' && data.delta) {
            const binaryString = atob(data.delta);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            if (audioContextRef.current) {
              await playAudioData(audioContextRef.current, bytes);
            }
          } else if (data.type === 'response.audio_transcript.delta' && data.delta) {
            setCurrentTranscript(prev => prev + data.delta);
          } else if (data.type === 'response.audio_transcript.done') {
            if (currentTranscript) {
              setMessages(prev => [...prev, {
                role: 'assistant',
                content: currentTranscript,
                timestamp: new Date()
              }]);
              setCurrentTranscript('');
            }
          } else if (data.type === 'input_audio_buffer.speech_started') {
            setIsRecording(true);
          } else if (data.type === 'input_audio_buffer.speech_stopped') {
            setIsRecording(false);
          } else if (data.type === 'response.created') {
            setIsSpeaking(true);
          } else if (data.type === 'response.done') {
            setIsSpeaking(false);
          } else if (data.type === 'conversation.item.input_audio_transcription.completed') {
            if (data.transcript) {
              setMessages(prev => [...prev, {
                role: 'user',
                content: data.transcript,
                timestamp: new Date()
              }]);
            }
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่",
          variant: "destructive"
        });
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket closed');
        setIsConnected(false);
        setIsRecording(false);
        setIsSpeaking(false);
      };

    } catch (error) {
      console.error('Error connecting:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error instanceof Error ? error.message : "ไม่สามารถเชื่อมต่อได้",
        variant: "destructive"
      });
    }
  };

  const startRecording = async () => {
    try {
      if (!recorderRef.current) {
        recorderRef.current = new AudioRecorder((audioData) => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            const encoded = encodeAudioForAPI(audioData);
            wsRef.current.send(JSON.stringify({
              type: 'input_audio_buffer.append',
              audio: encoded
            }));
          }
        });
      }
      await recorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "ไม่สามารถเข้าถึงไมโครโฟน",
        description: "กรุณาอนุญาตการใช้งานไมโครโฟน",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setIsRecording(false);
  };

  const sendTextMessage = (text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [{
            type: 'input_text',
            text
          }]
        }
      }));
      wsRef.current.send(JSON.stringify({ type: 'response.create' }));
      
      setMessages(prev => [...prev, {
        role: 'user',
        content: text,
        timestamp: new Date()
      }]);
    }
  };

  const disconnect = () => {
    recorderRef.current?.stop();
    wsRef.current?.close();
    clearAudioQueue();
    setIsConnected(false);
    setIsRecording(false);
    setIsSpeaking(false);
  };

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
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
  };
};
