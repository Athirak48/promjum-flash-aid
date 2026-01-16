import { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Award, Download, Share2, CheckCircle2, XCircle, Star, ArrowRight, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

export default function PostTestResultsPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();
    const certificateRef = useRef<HTMLDivElement>(null);

    const correct = location.state?.correct || 0;
    const total = location.state?.total || 0;
    const scoreRaw = location.state?.score || 0;
    const score = Math.round(scoreRaw); // Ensure rounding
    const wrongWords = location.state?.wrongWords || [];
    const goalName = location.state?.goalName || 'Study Goal';
    const testMode = location.state?.testMode || 'all_words';

    // NEW: Dual score data
    const overallScore = location.state?.overallScore;
    const preTestSubsetScore = location.state?.preTestSubsetScore;

    const isPassed = score >= 80; // 80% = Pass
    const grade = score >= 95 ? 'A+' : score >= 90 ? 'A' : score >= 85 ? 'B+' : score >= 80 ? 'B' : score >= 75 ? 'C' : 'F';

    // Theme colors based on grade
    const getGradeColor = () => {
        if (score >= 80) return 'from-green-400 to-emerald-600';
        if (score >= 60) return 'from-yellow-400 to-orange-500';
        return 'from-red-500 to-pink-600';
    };

    const downloadCertificate = async () => {
        // TODO: Implement html2canvas in production
        toast({
            title: 'Certificate Ready!',
            description: 'Download feature coming soon',
            className: 'bg-green-500 text-white border-none'
        });
    };

    const shareCertificate = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `I completed ${goalName}!`,
                    text: `I scored ${score}% on my final exam! 🎉`,
                    url: window.location.href
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            toast({
                title: 'Share not supported',
                description: 'Web Share API not available in this browser',
                variant: 'destructive'
            });
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-[#050505] p-2 font-sans relative overflow-hidden">
            {/* Cosmic Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#050505] to-[#050505] pointer-events-none" />
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />

            <div className="w-full max-w-2xl relative z-10">
                {/* Main Results Card */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="border-white/10 bg-[#0a0a0b]/80 backdrop-blur-2xl shadow-2xl overflow-hidden ring-1 ring-white/10">
                        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${getGradeColor()}`} />

                        <CardHeader className="text-center space-y-1 pt-4 pb-0">
                            {/* Trophy Icon */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-2 bg-gradient-to-br ${getGradeColor()} shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]`}
                            >
                                <Trophy className="h-7 w-7 text-white drop-shadow-md" />
                            </motion.div>

                            <Badge variant="outline" className={`mx-auto border-white/10 bg-white/5 text-white uppercase tracking-widest px-2 py-0.5 text-[10px]`}>
                                Final Assessment
                            </Badge>

                            <CardTitle className="text-2xl md:text-3xl font-black text-white tracking-tight">
                                {isPassed ? 'Mission Accomplished!' : 'Mission Complete'}
                            </CardTitle>
                            <CardDescription className="text-slate-400 text-sm">
                                {isPassed ? 'You have mastered this goal!' : 'Keep practicing to improve.'}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4 p-4">
                            {/* Score Display */}
                            <div className="flex flex-col items-center justify-center space-y-1">
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.4, type: 'spring' }}
                                    className={`text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br ${getGradeColor()} leading-none tracking-tighter drop-shadow-lg`}
                                >
                                    {score}%
                                </motion.div>
                                <div className="flex items-center gap-3 text-slate-400 font-medium text-xs">
                                    <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" /> {correct} Correct</span>
                                    <span className="w-1 h-1 bg-slate-600 rounded-full" />
                                    <span className="flex items-center gap-1"><XCircle className="h-3 w-3 text-red-500" /> {total - correct} Wrong</span>
                                </div>
                            </div>

                            {/* Stats Grid - Compact */}
                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-white/5 border border-white/5 rounded-xl p-2 text-center">
                                    <p className="text-[10px] uppercase text-slate-500 font-bold">Grade</p>
                                    <p className={`text-xl font-black text-transparent bg-clip-text bg-gradient-to-br ${getGradeColor()}`}>{grade}</p>
                                </div>
                                <div className="bg-white/5 border border-white/5 rounded-xl p-2 text-center">
                                    <p className="text-[10px] uppercase text-slate-500 font-bold">Accuracy</p>
                                    <p className="text-xl font-black text-white">{score}%</p>
                                </div>
                                <div className="bg-white/5 border border-white/5 rounded-xl p-2 text-center">
                                    <p className="text-[10px] uppercase text-slate-500 font-bold">Status</p>
                                    <p className={`text-sm font-bold mt-0.5 ${isPassed ? 'text-green-400' : 'text-slate-300'}`}>
                                        {isPassed ? 'PASSED' : 'DONE'}
                                    </p>
                                </div>
                            </div>

                            {/* Comparison - Ultra Compact */}
                            {testMode === 'all_words' && preTestSubsetScore && (
                                <div className="bg-[#0f0f10] border border-white/10 rounded-xl p-3 relative overflow-hidden">
                                    <h3 className="text-white font-bold text-xs flex items-center gap-2 mb-2">
                                        <TrendingUpWrapper className="w-3 h-3 text-purple-400" />
                                        Progress: {preTestSubsetScore.preTestPercentage}% → {preTestSubsetScore.percentage}%
                                        <span className={`ml-auto ${preTestSubsetScore.improvementPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {preTestSubsetScore.improvementPercentage > 0 ? '+' : ''}{preTestSubsetScore.improvementPercentage}%
                                        </span>
                                    </h3>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                                        <div style={{ width: `${preTestSubsetScore.preTestPercentage}%` }} className="h-full bg-slate-700" />
                                        <div style={{ width: `${Math.max(0, preTestSubsetScore.percentage - preTestSubsetScore.preTestPercentage)}%` }} className="h-full bg-green-500" />
                                    </div>
                                </div>
                            )}

                            {/* Words List - Scrollable Small */}
                            {wrongWords.length > 0 && (
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between px-1">
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wilder">Words to Review ({wrongWords.length})</h4>
                                    </div>
                                    <div className="bg-[#0f0f10] border border-white/5 rounded-lg max-h-[15vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 p-1 space-y-0.5">
                                        {wrongWords.slice(0, 30).map((word, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-xs p-1.5 hover:bg-white/5 rounded group transition-colors">
                                                <span className="font-medium text-slate-300">{word.front}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-red-400/50 line-through text-[10px]">{word.back}</span>
                                                    <span className="text-green-400/80 font-medium text-[10px]">
                                                        {word.correct}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions - Compact */}
                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <Button
                                    onClick={() => navigate('/dashboard')}
                                    variant="outline"
                                    className="h-9 bg-transparent border-white/10 text-slate-300 hover:text-white hover:bg-white/5 hover:border-white/20 text-xs"
                                >
                                    <RotateCcw className="h-3 w-3 mr-1.5" />
                                    Dashboard
                                </Button>
                                <Button
                                    onClick={() => navigate('/dashboard')}
                                    className="h-9 bg-white text-black hover:bg-slate-200 font-bold shadow-lg shadow-white/5 text-xs"
                                >
                                    New Goal
                                    <ArrowRight className="h-3 w-3 ml-1.5" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Victory Certificate (Hidden, for download) */}
                {isPassed && (
                    <div ref={certificateRef} className="hidden">
                        <div className="w-[800px] h-[600px] bg-gradient-to-br from-purple-100 to-pink-100 p-12 relative">
                            {/* Border */}
                            <div className="absolute inset-4 border-8 border-yellow-400 rounded-lg"></div>
                            <div className="absolute inset-6 border-2 border-purple-600 rounded-lg"></div>

                            {/* Content */}
                            <div className="relative h-full flex flex-col items-center justify-center space-y-6 text-center">
                                <Award className="h-24 w-24 text-yellow-500" />
                                <h1 className="text-5xl font-bold text-purple-900">Certificate of Mastery</h1>
                                <p className="text-xl text-gray-700">This certifies that</p>
                                <p className="text-3xl font-bold text-purple-800">Student</p>
                                <p className="text-xl text-gray-700">has successfully completed</p>
                                <p className="text-2xl font-bold text-purple-800">{goalName}</p>
                                <p className="text-lg text-gray-600">with a score of</p>
                                <p className="text-4xl font-bold text-yellow-600">{score}% (Grade: {grade})</p>
                                <p className="text-sm text-gray-500 mt-8">
                                    {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Helper for Lucide icon
function TrendingUpWrapper({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
        </svg>
    )
}
