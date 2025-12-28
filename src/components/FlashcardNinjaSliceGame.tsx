import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Trophy, RefreshCw, Heart, Sword, FastForward, Check, X as XIcon, Zap, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useXP } from '@/hooks/useXP';
import { useSRSProgress } from '@/hooks/useSRSProgress';
import { XPGainAnimation } from '@/components/xp/XPGainAnimation';
import { useAnalytics } from '@/hooks/useAnalytics';

interface VocabItem {
    id: string;
    word: string;
    meaning: string;
    isUserFlashcard?: boolean;
}

interface FlashcardNinjaSliceGameProps {
    vocabList: VocabItem[];
    onExit: () => void;
    onGameFinish: (results: { correct: number; total: number }) => void;
    onSelectNewGame?: () => void;
}

// -- Game Constants --
const GRAVITY = 0.25; // Increased for snappier physics
const SPAWN_RATE_INITIAL = 1000;
const BOMB_CHANCE = 0.08;
const BLADE_LIFETIME = 250;
const MAX_LIVES = 3;

// -- Assets --
const FRUIT_TYPES = [
    { char: '🍉', color: '#FF5252', lightColor: '#FFCDD2' }, // Watermelon
    { char: '🍎', color: '#FFF9C4', lightColor: '#FFFFFF' }, // Apple
    { char: '🍌', color: '#FFEB3B', lightColor: '#FFF59D' }, // Banana
    { char: '🍍', color: '#FDD835', lightColor: '#FFF176' }, // Pineapple
    { char: '🍊', color: '#FF9800', lightColor: '#FFE0B2' }, // Orange
    { char: '🥥', color: '#F5F5F5', lightColor: '#FFFFFF' }, // Coconut
    { char: '🥝', color: '#C6FF00', lightColor: '#F4FF81' }, // Kiwi
    { char: '🍑', color: '#FFCC80', lightColor: '#FFE0B2' }, // Peach
];

// -- Types --
type WordStatus = 'PENDING' | 'CORRECT' | 'WRONG';

interface Bubble {
    id: number;
    word: string;
    vocabId?: string;
    isCorrect: boolean;
    x: number;
    y: number;
    vx: number;
    vy: number;
    fruitType: typeof FRUIT_TYPES[0];
    scale: number;
    rotation: number;
    rotationSpeed: number;
    sliced: boolean;
    isBomb: boolean;
    radius: number; // Responsive radius
}

interface Particle {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
    size: number;
    type: 'circle' | 'splat';
}

interface BladePoint {
    x: number;
    y: number;
    time: number;
}

export function FlashcardNinjaSliceGame({ vocabList, onExit, onGameFinish, onSelectNewGame }: FlashcardNinjaSliceGameProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { addGameXP, lastGain, clearLastGain } = useXP();
    const { updateFromNinjaSlice } = useSRSProgress();
    const { trackGame } = useAnalytics();

    // Game State
    const [gameStateStatus, setGameStateStatus] = useState<'IDLE' | 'PLAYING' | 'WON' | 'GAME_OVER_BOMB' | 'GAME_OVER_LIVES'>('IDLE');
    const [lives, setLives] = useState(MAX_LIVES);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [currentTarget, setCurrentTarget] = useState<VocabItem | null>(null);
    const [wordResults, setWordResults] = useState<Record<string, WordStatus>>({});
    const [totalXPEarned, setTotalXPEarned] = useState(0);
    const [hadMistakeForCurrentWord, setHadMistakeForCurrentWord] = useState(false);
    const [gameStartTime] = useState(Date.now());

    // Mutable Game State (Physics/Logic)
    const gameState = useRef({
        bubbles: [] as Bubble[],
        particles: [] as Particle[],
        bladeTrail: [] as BladePoint[],
        isMouseDown: false,
        mousePos: { x: 0, y: 0 },
        lastSpawnTime: 0,
        spawnRate: SPAWN_RATE_INITIAL,
        vocabIndex: 0,
        shuffledVocab: [] as VocabItem[],
        animationFrameId: 0,
        score: 0,
        lives: MAX_LIVES,
        isPlaying: false
    });

    // Init Game
    useEffect(() => {
        const shuffled = [...vocabList].sort(() => Math.random() - 0.5);
        gameState.current.shuffledVocab = shuffled;

        // Init results map with PENDING
        const initialResults: Record<string, WordStatus> = {};
        shuffled.forEach(v => initialResults[v.id] = 'PENDING');
        setWordResults(initialResults);

        if (shuffled.length > 0) {
            setCurrentTarget(shuffled[0]);
        }

        // Track game start
        trackGame('ninja', 'start', undefined, {
            totalCards: shuffled.length
        });

        startGame();

        return () => stopGame();
    }, []);

    const startGame = () => {
        setGameStateStatus('PLAYING');
        setLives(MAX_LIVES);
        setScore(0);
        setCombo(0);

        // Reset Results
        const newResults: Record<string, WordStatus> = {};
        gameState.current.shuffledVocab.forEach(v => newResults[v.id] = 'PENDING');
        setWordResults(newResults);

        gameState.current.bubbles = [];
        gameState.current.particles = [];
        gameState.current.bladeTrail = [];
        gameState.current.score = 0;
        gameState.current.lives = MAX_LIVES;
        gameState.current.vocabIndex = 0;
        gameState.current.isPlaying = true;

        if (gameState.current.shuffledVocab.length > 0) {
            setCurrentTarget(gameState.current.shuffledVocab[0]);
        }

        cancelAnimationFrame(gameState.current.animationFrameId);
        gameState.current.animationFrameId = requestAnimationFrame(gameLoop);
    };

    const stopGame = () => {
        gameState.current.isPlaying = false;
        cancelAnimationFrame(gameState.current.animationFrameId);
    };

    const finishGame = (reason: 'WON' | 'GAME_OVER_BOMB' | 'GAME_OVER_LIVES') => {
        stopGame();
        setGameStateStatus(reason);
        setWordResults(prev => {
            const next = { ...prev };
            gameState.current.shuffledVocab.forEach(v => {
                if (next[v.id] !== 'CORRECT') {
                    next[v.id] = 'WRONG';
                }
            });
            return next;
        });

        // Track game completion
        const duration = Math.round((Date.now() - gameStartTime) / 1000);
        const correctCount = Object.values(wordResults).filter(r => r === 'CORRECT').length;
        trackGame('ninja', 'complete', gameState.current.score, {
            totalCards: gameState.current.shuffledVocab.length,
            correctAnswers: correctCount,
            duration: duration
        });
    };

    const spawnBubble = (width: number, height: number) => {
        const { shuffledVocab, vocabIndex } = gameState.current;

        if (vocabIndex >= shuffledVocab.length) return;

        const currentWordObj = shuffledVocab[vocabIndex];
        const isBomb = Math.random() < BOMB_CHANCE;

        // Smart Radius Calculation for Mobile vs Desktop
        const isMobile = width < 640;
        const radius = isMobile ? 45 : 85;

        let wordText = "";
        let isCorrect = false;
        let vocabId: string | undefined = undefined;
        let fruitType = FRUIT_TYPES[Math.floor(Math.random() * FRUIT_TYPES.length)];

        if (isBomb) {
            wordText = "";
            isCorrect = false;
            fruitType = { char: '💣', color: '#4B5563', lightColor: '#9CA3AF' };
        } else {
            const targetOnScreen = gameState.current.bubbles.some(b => b.isCorrect && !b.sliced);
            const shouldSpawnTarget = !targetOnScreen || Math.random() < 0.5;
            const distractors = shuffledVocab.filter(v => v.id !== currentWordObj.id);

            if (shouldSpawnTarget || distractors.length === 0) {
                wordText = currentWordObj.word;
                vocabId = currentWordObj.id;
                isCorrect = true;
            } else {
                const randomDistractor = distractors[Math.floor(Math.random() * distractors.length)];
                wordText = randomDistractor.word;
                vocabId = randomDistractor.id;
                isCorrect = false;
            }
        }

        const margin = radius * 2;
        const x = Math.random() * (width - margin * 2) + margin;
        const y = height + radius;

        const centerX = width / 2;
        const directionX = (centerX - x) * 0.005 + (Math.random() - 0.5) * 1.5;
        // Faster upward throw for snappier feeling
        const vy = -(Math.random() * 6 + 19);

        gameState.current.bubbles.push({
            id: Date.now() + Math.random(),
            word: wordText,
            vocabId,
            isCorrect,
            x,
            y,
            vx: directionX,
            vy,
            fruitType,
            scale: 0.1,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 0.2,
            sliced: false,
            isBomb,
            radius
        });
    };

    const createExplosion = (x: number, y: number, color: string, isJuice: boolean) => {
        const count = isJuice ? 25 : 40;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * (isJuice ? 8 : 12) + 2;
            gameState.current.particles.push({
                id: Math.random(),
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                color: color,
                size: Math.random() * (isJuice ? 8 : 5) + (isJuice ? 4 : 2),
                type: isJuice ? 'splat' : 'circle'
            });
        }
    };

    const handleCorrectSlice = async (vocabId?: string) => {
        gameState.current.score += 10 + (combo * 2);
        setScore(gameState.current.score);
        setCombo(c => c + 1);

        const xpResult = await addGameXP('ninja-slice', true, false);
        if (xpResult?.xpAdded) {
            setTotalXPEarned(prev => prev + xpResult.xpAdded);
        }

        if (vocabId) {
            setWordResults(prev => ({ ...prev, [vocabId]: 'CORRECT' }));
            const wasFirstTry = !hadMistakeForCurrentWord;
            const vocabItem = vocabList.find(v => v.id === vocabId);
            await updateFromNinjaSlice(vocabId, true, wasFirstTry, vocabItem?.isUserFlashcard);
        }

        setHadMistakeForCurrentWord(false);

        const nextIndex = gameState.current.vocabIndex + 1;
        if (nextIndex >= gameState.current.shuffledVocab.length) {
            finishGame('WON');
        } else {
            gameState.current.vocabIndex = nextIndex;
            setCurrentTarget(gameState.current.shuffledVocab[nextIndex]);
        }
    };

    const handleWrongSlice = async (isBomb: boolean, vocabId?: string) => {
        if (isBomb) {
            gameState.current.lives = 0;
            setLives(0);
            finishGame('GAME_OVER_BOMB');
            return;
        }

        setHadMistakeForCurrentWord(true);

        if (vocabId) {
            const vocabItem = vocabList.find(v => v.id === vocabId);
            await updateFromNinjaSlice(vocabId, false, false, vocabItem?.isUserFlashcard);
        }

        gameState.current.lives -= 1;
        setLives(gameState.current.lives);
        setCombo(0);

        if (containerRef.current) {
            containerRef.current.classList.add('shake-anim');
            setTimeout(() => containerRef.current?.classList.remove('shake-anim'), 300);
        }

        if (gameState.current.lives <= 0) {
            finishGame('GAME_OVER_LIVES');
        }
    };

    const gameLoop = (timestamp: number) => {
        if (!canvasRef.current || !gameState.current.isPlaying) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        // Spawner
        if (timestamp - gameState.current.lastSpawnTime > gameState.current.spawnRate) {
            spawnBubble(width, height);
            gameState.current.lastSpawnTime = timestamp;
        }

        ctx.clearRect(0, 0, width, height);

        const { bubbles, particles, bladeTrail } = gameState.current;

        // Bubbles
        for (let i = bubbles.length - 1; i >= 0; i--) {
            const b = bubbles[i];
            b.x += b.vx;
            b.y += b.vy;
            b.vy += GRAVITY;
            b.rotation += b.rotationSpeed;

            if (b.scale < 1) b.scale += 0.05;

            // Bounce Check
            if (b.x - b.radius < 0 || b.x + b.radius > width) {
                b.vx *= -0.6;
                b.x = Math.max(b.radius, Math.min(width - b.radius, b.x));
            }
            // Fallen Check
            if (b.y - b.radius > height + 200) {
                bubbles.splice(i, 1);
                continue;
            }

            // Slice Check
            if (gameState.current.isMouseDown && !b.sliced && b.scale >= 0.8) {
                const trail = gameState.current.bladeTrail;
                if (trail.length >= 2) {
                    const lastPoint = trail[trail.length - 1];
                    const prevPoint = trail[trail.length - 2];
                    const dist = pointToLineDistance(b.x, b.y, prevPoint.x, prevPoint.y, lastPoint.x, lastPoint.y);

                    if (dist < b.radius * 0.9) {
                        b.sliced = true;

                        if (b.isBomb) {
                            createExplosion(b.x, b.y, '#FFFFFF', false);
                            createExplosion(b.x, b.y, '#EF4444', false);
                            handleWrongSlice(true);
                        } else if (b.isCorrect) {
                            createExplosion(b.x, b.y, b.fruitType.color, true);
                            createExplosion(b.x, b.y, b.fruitType.lightColor, true);
                            handleCorrectSlice(b.vocabId);
                        } else {
                            createExplosion(b.x, b.y, '#EF4444', true);
                            handleWrongSlice(false, b.vocabId);
                        }
                        bubbles.splice(i, 1);
                        continue;
                    }
                }
            }

            // Draw Fruit
            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.rotate(b.rotation);
            ctx.scale(b.scale, b.scale);

            // Shadow
            ctx.beginPath();
            ctx.arc(10, 10, b.radius * 0.8, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fill();

            // Fruit Emoji
            ctx.font = `${b.radius * 1.8}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(b.fruitType.char, 0, 10);
            ctx.restore();

            // Draw Label
            if (!b.isBomb) {
                ctx.save();
                ctx.translate(b.x, b.y);

                const fontSize = Math.max(16, b.radius * 0.4);
                ctx.font = `bold ${fontSize}px "Mitr", sans-serif`;

                const textMetrics = ctx.measureText(b.word);
                const textWidth = textMetrics.width;
                const pillPadding = fontSize;
                const pillWidth = textWidth + pillPadding * 2;
                const pillHeight = fontSize * 1.5;
                const pillYOffset = b.radius * 0.8;

                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.beginPath();
                ctx.roundRect(-pillWidth / 2, pillYOffset, pillWidth, pillHeight, pillHeight / 2);
                ctx.fill();
                ctx.strokeStyle = b.fruitType.color;
                ctx.lineWidth = 3;
                ctx.stroke();

                ctx.fillStyle = '#0F172A';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(b.word, 0, pillYOffset + pillHeight / 2 + 2);
                ctx.restore();
            }
        }

        // Particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += GRAVITY;
            p.life -= 0.02;

            if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }

            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }

        // Blade Trail
        const now = Date.now();
        gameState.current.bladeTrail = bladeTrail.filter(p => now - p.time < BLADE_LIFETIME);

        if (gameState.current.bladeTrail.length > 1) {
            const trail = gameState.current.bladeTrail;
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#FFFFFF';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            for (let i = 1; i < trail.length; i++) {
                const progress = i / trail.length;
                ctx.beginPath();
                ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
                ctx.lineTo(trail[i].x, trail[i].y);
                ctx.lineWidth = (1 + progress * 8);
                ctx.strokeStyle = `rgba(200, 240, 255, ${progress})`;
                ctx.stroke();

                ctx.lineWidth = (1 + progress * 4);
                ctx.strokeStyle = '#FFFFFF';
                ctx.stroke();
            }
            ctx.shadowBlur = 0;
        }

        gameState.current.animationFrameId = requestAnimationFrame(gameLoop);
    };

    // Controls
    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!gameState.current.isPlaying) return;

        let x = 0, y = 0;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();

        if ('touches' in e) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = (e as React.MouseEvent).clientX - rect.left;
            y = (e as React.MouseEvent).clientY - rect.top;
        }

        x = x * (canvas.width / rect.width);
        y = y * (canvas.height / rect.height);

        if (gameState.current.isMouseDown) {
            gameState.current.bladeTrail.push({
                x, y, time: Date.now()
            });
            gameState.current.mousePos = { x, y };
        }
    };
    const handleMouseDown = (e: any) => {
        gameState.current.isMouseDown = true;
        handleMouseMove(e);
    };
    const handleMouseUp = () => {
        gameState.current.isMouseDown = false;
        gameState.current.bladeTrail = [];
    };

    // Resize
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current && canvasRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                canvasRef.current.width = width * 1.5;
                canvasRef.current.height = height * 1.5;
            }
        };
        window.addEventListener('resize', handleResize);
        setTimeout(handleResize, 100);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="relative w-full h-[100dvh] overflow-hidden font-sans select-none" ref={containerRef}>
            {/* Background */}
            <div className="absolute inset-0 bg-[#3E2723]"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                        repeating-linear-gradient(45deg, rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.2) 2px, transparent 2px, transparent 10px),
                        radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)
                    `,
                    backgroundSize: '100% 20px, 20px 20px, 100% 100%'
                }}>
            </div>

            {/* Top Bar HUD - Lives & Close */}
            <div className="absolute top-0 left-0 w-full p-4 z-20 flex justify-between items-start pointer-events-none">
                <div className="flex gap-4 pointer-events-auto">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onExit}
                        className="bg-black/30 hover:bg-black/50 text-white rounded-full border border-white/20 backdrop-blur-sm"
                    >
                        <XIcon className="w-6 h-6" />
                    </Button>

                    <div className="flex items-center gap-1">
                        {[...Array(MAX_LIVES)].map((_, i) => (
                            <div key={i} className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${i < lives ? 'scale-100' : 'opacity-30 grayscale scale-75'}`}>
                                <Heart className={`w-8 h-8 ${i < lives ? 'fill-red-500 text-red-600 drop-shadow-md' : 'text-slate-500'}`} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Score - Top Right */}
                <div className="flex flex-col items-end pointer-events-auto">
                    <div className="bg-gradient-to-b from-amber-500 to-amber-700 px-4 py-2 rounded-lg border-2 border-amber-300 shadow-lg transform rotate-1">
                        <p className="text-[10px] text-amber-100 font-bold uppercase tracking-wider text-right mb-0">Score</p>
                        <p className="text-3xl font-black text-white leading-none drop-shadow-md tabular-nums">{score}</p>
                    </div>
                    {combo > 1 && (
                        <motion.div
                            key={combo}
                            initial={{ scale: 1.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="mt-2 text-yellow-300 font-black text-xl italic drop-shadow-lg stroke-black"
                            style={{ WebkitTextStroke: '1px black' }}
                        >
                            {combo}x COMBO!
                        </motion.div>
                    )}
                </div>
            </div>

            {/* TARGET DISPLAY - Robust Centering with Flex Container */}
            <div className="absolute top-24 md:top-4 left-0 w-full z-30 flex justify-center pointer-events-none">
                <AnimatePresence mode='wait'>
                    {currentTarget && gameStateStatus === 'PLAYING' && (
                        <motion.div
                            key={currentTarget.id}
                            initial={{ y: -50, opacity: 0, rotate: -5 }}
                            animate={{ y: 0, opacity: 1, rotate: 0 }}
                            exit={{ y: -50, opacity: 0, scale: 0.8 }}
                            className="pointer-events-auto origin-top transform scale-75 md:scale-100"
                        >
                            <div className="relative mx-auto w-64 md:w-80">
                                <div className="absolute inset-0 bg-[#5D4037] rounded-lg shadow-lg border-2 border-[#8D6E63] transform skew-x-[-2deg]"></div>
                                <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-[#A1887F] shadow-inner"></div>
                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#A1887F] shadow-inner"></div>
                                <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-[#A1887F] shadow-inner"></div>
                                <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-[#A1887F] shadow-inner"></div>

                                <div className="relative p-3 md:p-4 text-center">
                                    <h3 className="text-[#FFECB3] font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] mb-1 drop-shadow-sm opacity-80">หาคำนี้!</h3>
                                    <h2 className="text-xl md:text-2xl font-black text-white drop-shadow-md tracking-tight leading-none break-words">
                                        {currentTarget.meaning}
                                    </h2>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* RESULTS SCREEN */}
            <AnimatePresence>
                {gameStateStatus !== 'PLAYING' && gameStateStatus !== 'IDLE' && (
                    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, rotate: -2 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            className="bg-[#2D1B15] bg-opacity-95 rounded-[2rem] shadow-2xl border-4 border-[#8D6E63] max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden relative"
                        >
                            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]"></div>

                            <div className={`p-8 text-center relative z-10 ${gameStateStatus === 'WON' ? 'bg-gradient-to-b from-green-900/50 to-transparent' : 'bg-gradient-to-b from-red-900/50 to-transparent'}`}>
                                {gameStateStatus === 'WON' ? (
                                    <>
                                        <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] animate-bounce" />
                                        <h2 className="text-4xl font-black text-yellow-400 mb-2 uppercase italic tracking-tighter transform -rotate-2">Victory!</h2>
                                        <p className="text-green-300 font-medium tracking-wide">MASTER NINJA STATUS</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-7xl mb-4 animate-pulse">💣</div>
                                        <h2 className="text-4xl font-black text-red-500 mb-2 uppercase italic tracking-tighter">Failed!</h2>
                                        <p className="text-red-300 font-medium">Training Incomplete</p>
                                    </>
                                )}
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 relative z-10">
                                <div className="space-y-3">
                                    {gameState.current.shuffledVocab.map((vocab) => {
                                        const status = wordResults[vocab.id];
                                        const isCorrect = status === 'CORRECT';

                                        return (
                                            <div key={vocab.id} className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${isCorrect ? 'bg-white/5 border-green-500' : 'bg-white/5 border-red-500'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg ${isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                        {isCorrect ? '✓' : '✕'}
                                                    </div>
                                                    <div>
                                                        <p className={`font-bold text-base ${isCorrect ? 'text-white' : 'text-slate-400'}`}>{vocab.word}</p>
                                                        <p className="text-xs text-slate-500 uppercase font-semibold">{vocab.meaning}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="p-6 border-t border-white/10 relative z-10 grid gap-3">
                                <Button onClick={startGame} className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white h-14 rounded-xl font-black text-lg shadow-lg uppercase tracking-wider transform transition-transform active:scale-95">
                                    <RefreshCw className="w-5 h-5 mr-2" /> Play Again
                                </Button>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        onClick={() => onSelectNewGame ? onSelectNewGame() : onExit()}
                                        variant="outline"
                                        className="bg-transparent border-2 border-white/20 hover:bg-white/10 text-white h-12 rounded-xl font-bold uppercase text-sm"
                                    >
                                        <FastForward className="w-4 h-4 mr-2" /> New Game
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            const results = {
                                                correct: Object.values(wordResults).filter(r => r === 'CORRECT').length,
                                                total: gameState.current.shuffledVocab.length
                                            };
                                            onGameFinish(results);
                                        }}
                                        variant="ghost"
                                        className="text-slate-400 hover:text-white h-12 rounded-xl font-bold uppercase text-sm"
                                    >
                                        <ChevronRight className="w-4 h-4 mr-2" />
                                        ไปกันต่อ
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* CANVAS */}
            <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleMouseDown}
                onTouchMove={handleMouseMove}
                onTouchEnd={handleMouseUp}
                className="block touch-none cursor-crosshair w-full h-full relative z-10"
            />

            <style>{`
                .shake-anim {
                    animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
                }
                @keyframes shake {
                    10%, 90% { transform: translate3d(-1px, 0, 0); }
                    20%, 80% { transform: translate3d(2px, 0, 0); }
                    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                    40%, 60% { transform: translate3d(4px, 0, 0); }
                }
            `}</style>
        </div>
    );
}

// Helpers
function pointToLineDistance(x: number, y: number, x1: number, y1: number, x2: number, y2: number) {
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    if (len_sq !== 0)
        param = dot / len_sq;

    let xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    }
    else if (param > 1) {
        xx = x2;
        yy = y2;
    }
    else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
}
