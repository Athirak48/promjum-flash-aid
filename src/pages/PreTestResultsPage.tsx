import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, TrendingUp, Timer, Rocket } from 'lucide-react';

export default function PreTestResultsPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const correct = location.state?.correct || 0;
    const total = location.state?.total || 0;

    // Calculate stats
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    const wrong = total - correct;
    const timeSaved = Math.round((correct / total) * 45); // Approx 45 mins saved for high score

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6 overflow-hidden">
            {/* Animated Background Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="w-full max-w-md animate-in zoom-in-95 duration-500 ease-out relative z-10">
                <Card className="border border-white/10 bg-slate-900/90 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
                    <CardContent className="p-6 space-y-4">
                        {/* Header Section */}
                        <div className="text-center space-y-3">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                <p className="text-xs text-slate-300 font-medium">Your learning plan has been customized 🎉</p>
                            </div>

                            <div className="py-4">
                                <span className="text-[4.5rem] leading-none font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-400 via-pink-400 to-purple-500 drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]">
                                    {percentage}%
                                </span>
                                <p className="text-slate-400 font-medium mt-3 text-sm">
                                    {correct} out of {total} correct
                                </p>
                            </div>
                        </div>

                        {/* Accuracy Bar */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <span>Accuracy</span>
                                <span>{percentage}%</span>
                            </div>
                            <div className="h-2.5 w-full bg-slate-800/50 rounded-full overflow-hidden border border-white/5">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-1000"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Known */}
                            <div className="bg-gradient-to-br from-emerald-900/40 to-green-900/40 border border-emerald-500/20 rounded-xl p-3.5 text-white shadow-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-emerald-500/20 rounded-lg flex items-center justify-center border border-emerald-400/30">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-emerald-100">{correct}</p>
                                        <p className="text-[9px] uppercase tracking-wide text-emerald-300/70 font-bold">Already Know</p>
                                    </div>
                                </div>
                            </div>

                            {/* Unknown */}
                            <div className="bg-gradient-to-br from-orange-900/40 to-red-900/40 border border-orange-500/20 rounded-xl p-3.5 text-white shadow-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-orange-500/20 rounded-lg flex items-center justify-center border border-orange-400/30">
                                        <XCircle className="h-5 w-5 text-orange-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-orange-100">{wrong}</p>
                                        <p className="text-[9px] uppercase tracking-wide text-orange-300/70 font-bold">Need to Learn</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* What happens next */}
                        <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border border-blue-500/20 rounded-xl p-4 text-white shadow-lg">
                            <div className="flex gap-3">
                                <TrendingUp className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                <div className="space-y-2">
                                    <h4 className="font-bold text-blue-100 text-xs uppercase tracking-wide">
                                        What happens next?
                                    </h4>
                                    <ul className="text-xs text-blue-200/80 space-y-1 leading-relaxed">
                                        <li>• Known words ({correct}) → Scheduled for review in 7 days</li>
                                        <li>• Unknown words ({wrong}) → Added to learning queue (Priority)</li>
                                        <li>• Your study time is optimized by ~{percentage}%</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Time Saved Badge */}
                        {percentage > 0 && (
                            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg py-2.5 px-4 text-white text-center shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2">
                                <Timer className="h-4 w-4" />
                                <span className="font-semibold text-sm">Estimated time saved: ~{timeSaved} minutes</span>
                            </div>
                        )}

                        {/* CTA Button */}
                        <Button
                            onClick={() => navigate('/dashboard', { state: { activeTab: 'focus' } })}
                            className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white h-12 rounded-xl text-base font-bold shadow-2xl shadow-purple-500/50 transition-all hover:scale-[1.02] hover:shadow-purple-500/70 border-b-4 border-purple-800 active:border-b-0 active:mt-1"
                        >
                            <Rocket className="h-5 w-5 mr-2" />
                            Start Learning Journey
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
