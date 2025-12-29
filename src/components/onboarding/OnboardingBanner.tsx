import { Button } from "@/components/ui/button";
import { X, Sparkles } from "lucide-react";

interface OnboardingBannerProps {
    message: string;
    onSkip?: () => void;
    showSkip?: boolean;
}

export function OnboardingBanner({ message, onSkip, showSkip = true }: OnboardingBannerProps) {
    return (
        <div className="relative w-full mb-6 animate-fade-in">
            {/* Background gradient with glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 rounded-2xl blur-xl"></div>

            {/* Main banner card */}
            <div className="relative glass-card p-6 rounded-2xl border-2 border-purple-400/30 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 backdrop-blur-md">
                <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-2">
                            ยินดีต้อนรับสู่ Promjum! 🎉
                        </h3>
                        <p className="text-white/80 leading-relaxed">
                            {message}
                        </p>
                        <div className="mt-4 flex items-center gap-3">
                            <div className="flex items-center gap-2 text-xs text-white/60">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span>เลือก Deck ยอดนิยมด้านล่างเพื่อเริ่มต้น</span>
                            </div>
                        </div>
                    </div>

                    {/* Skip button */}
                    {showSkip && onSkip && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onSkip}
                            className="flex-shrink-0 text-white/60 hover:text-white hover:bg-white/10"
                        >
                            <X className="w-4 h-4 mr-1" />
                            ข้าม
                        </Button>
                    )}
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-1 -right-1 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute -bottom-1 -left-1 w-16 h-16 bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 rounded-full blur-xl pointer-events-none"></div>
            </div>
        </div>
    );
}
