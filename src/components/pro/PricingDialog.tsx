import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Zap, Crown } from "lucide-react";

interface PricingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PricingDialog({ open, onOpenChange }: PricingDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl p-0 bg-transparent border-0 shadow-none overflow-hidden">
                <div className="bg-slate-950/95 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden flex flex-col md:flex-row relative">

                    {/* Close Button Mobile */}
                    <button
                        onClick={() => onOpenChange(false)}
                        className="absolute top-4 right-4 md:hidden z-50 text-slate-400 hover:text-white"
                    >
                        ✕
                    </button>

                    {/* Left: Free Plan (Current) */}
                    <div className="flex-1 p-8 md:p-12 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/5">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold w-fit mb-6">
                            <span>Current Plan</span>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-2">Free Starter</h3>
                        <p className="text-slate-400 mb-8">Great for getting started.</p>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3 text-slate-300">
                                <Check className="w-5 h-5 text-slate-500" />
                                <span>1 Active Goal Limit</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-300">
                                <Check className="w-5 h-5 text-slate-500" />
                                <span>Basic Analytics</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-300">
                                <Check className="w-5 h-5 text-slate-500" />
                                <span>Standard Games</span>
                            </li>
                        </ul>
                    </div>

                    {/* Right: Pro Plan (Upsell) */}
                    <div className="flex-1 p-8 md:p-12 bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-slate-900/40 relative overflow-hidden">
                        {/* Glow Effects */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold w-fit mb-6">
                                <Zap className="w-3 h-3 fill-amber-300" />
                                <span>Recommended</span>
                            </div>

                            <h3 className="text-3xl font-bold text-white mb-2">Pro Learner</h3>
                            <p className="text-indigo-200 mb-8">Unlock your full potential.</p>

                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-4xl font-black text-white">฿199</span>
                                <span className="text-slate-400">/month</span>
                            </div>

                            <ul className="space-y-4 mb-10">
                                <li className="flex items-center gap-3 text-white font-medium">
                                    <div className="p-1 rounded-full bg-green-500/20">
                                        <Check className="w-3.5 h-3.5 text-green-400" />
                                    </div>
                                    <span>Unlimited Active Goals</span>
                                </li>
                                <li className="flex items-center gap-3 text-white font-medium">
                                    <div className="p-1 rounded-full bg-green-500/20">
                                        <Check className="w-3.5 h-3.5 text-green-400" />
                                    </div>
                                    <span>AI Detailed Analytics</span>
                                </li>
                                <li className="flex items-center gap-3 text-white font-medium">
                                    <div className="p-1 rounded-full bg-green-500/20">
                                        <Check className="w-3.5 h-3.5 text-green-400" />
                                    </div>
                                    <span>Access All Community Decks</span>
                                </li>
                                <li className="flex items-center gap-3 text-white font-medium">
                                    <div className="p-1 rounded-full bg-green-500/20">
                                        <Check className="w-3.5 h-3.5 text-green-400" />
                                    </div>
                                    <span>Premium Support</span>
                                </li>
                            </ul>

                            <Button
                                className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-400 shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.02]"
                                onClick={() => window.open('https://line.me/ti/p/@promjum', '_blank')}
                            >
                                <Crown className="w-5 h-5 mr-2" />
                                Upgrade Now
                            </Button>
                            <p className="text-center text-xs text-indigo-300/50 mt-4">
                                Secure payment via Stripe or PromptPay
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
