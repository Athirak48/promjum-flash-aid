import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingSpotlightProps {
    targetSelector: string;
    message: string;
    title?: string;
    position?: "top" | "bottom" | "left" | "right";
    onNext?: () => void;
    onSkip?: () => void;
    showSkip?: boolean;
}

export function OnboardingSpotlight({
    targetSelector,
    message,
    title = "คำแนะนำ",
    position = "bottom",
    onNext,
    onSkip,
    showSkip = true
}: OnboardingSpotlightProps) {
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updatePosition = () => {
            const element = document.querySelector(targetSelector);
            if (element) {
                const rect = element.getBoundingClientRect();
                setTargetRect(rect);

                // Calculate tooltip position
                const tooltipWidth = tooltipRef.current?.offsetWidth || 300;
                const tooltipHeight = tooltipRef.current?.offsetHeight || 200;

                let top = 0;
                let left = 0;

                switch (position) {
                    case "bottom":
                        top = rect.bottom + 20;
                        left = rect.left + rect.width / 2 - tooltipWidth / 2;
                        break;
                    case "top":
                        top = rect.top - tooltipHeight - 20;
                        left = rect.left + rect.width / 2 - tooltipWidth / 2;
                        break;
                    case "left":
                        top = rect.top + rect.height / 2 - tooltipHeight / 2;
                        left = rect.left - tooltipWidth - 20;
                        break;
                    case "right":
                        top = rect.top + rect.height / 2 - tooltipHeight / 2;
                        left = rect.right + 20;
                        break;
                }

                // Ensure tooltip stays within viewport
                left = Math.max(20, Math.min(left, window.innerWidth - tooltipWidth - 20));
                top = Math.max(20, Math.min(top, window.innerHeight - tooltipHeight - 20));

                setTooltipPosition({ top, left });
            }
        };

        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition);
        };
    }, [targetSelector, position]);

    if (!targetRect) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999]">
                {/* Dark overlay */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                    onClick={onSkip}
                />

                {/* Spotlight cutout */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <defs>
                        <mask id="spotlight-mask">
                            <rect x="0" y="0" width="100%" height="100%" fill="white" />
                            <rect
                                x={targetRect.left - 8}
                                y={targetRect.top - 8}
                                width={targetRect.width + 16}
                                height={targetRect.height + 16}
                                rx="12"
                                fill="black"
                            />
                        </mask>
                    </defs>
                    <rect
                        x="0"
                        y="0"
                        width="100%"
                        height="100%"
                        fill="black"
                        fillOpacity="0.8"
                        mask="url(#spotlight-mask)"
                    />
                </svg>

                {/* Highlight border around target */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, type: "spring" }}
                    className="absolute border-4 border-purple-500 rounded-xl shadow-[0_0_30px_rgba(168,85,247,0.6)]"
                    style={{
                        top: targetRect.top - 8,
                        left: targetRect.left - 8,
                        width: targetRect.width + 16,
                        height: targetRect.height + 16,
                        pointerEvents: 'none'
                    }}
                />

                {/* Tooltip card */}
                <motion.div
                    ref={tooltipRef}
                    initial={{ scale: 0.9, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="absolute glass-card p-6 rounded-2xl border-2 border-purple-400/30 bg-gradient-to-br from-purple-900/90 via-pink-900/90 to-blue-900/90 backdrop-blur-xl shadow-2xl max-w-sm"
                    style={{
                        top: tooltipPosition.top,
                        left: tooltipPosition.left
                    }}
                >
                    {/* Close button */}
                    {showSkip && onSkip && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onSkip}
                            className="absolute top-2 right-2 text-white/60 hover:text-white hover:bg-white/10"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}

                    {/* Content */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                            <p className="text-white/80 leading-relaxed">{message}</p>
                        </div>

                        <div className="flex items-center gap-3">
                            {onNext && (
                                <Button
                                    onClick={onNext}
                                    className="btn-space-glass flex-1"
                                >
                                    เข้าใจแล้ว
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            )}
                            {showSkip && onSkip && (
                                <Button
                                    variant="outline"
                                    onClick={onSkip}
                                    className="border-white/20 text-white hover:bg-white/10"
                                >
                                    ข้าม
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Arrow indicator */}
                    <div
                        className="absolute w-4 h-4 bg-purple-900 rotate-45 border-t-2 border-l-2 border-purple-400/30"
                        style={{
                            [position === "bottom" ? "top" : position === "top" ? "bottom" : "left"]: position === "left" || position === "right" ? "50%" : undefined,
                            [position === "left" ? "right" : position === "right" ? "left" : "left"]: position === "top" || position === "bottom" ? "50%" : undefined,
                            transform: position === "left" || position === "right" ? "translateY(-50%) rotate(45deg)" : "translateX(-50%) rotate(45deg)",
                            marginTop: position === "bottom" ? "-10px" : position === "top" ? "6px" : 0,
                            marginLeft: position === "right" ? "-10px" : position === "left" ? "6px" : 0
                        }}
                    />
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
