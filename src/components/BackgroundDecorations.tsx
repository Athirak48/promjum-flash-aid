// Space Glass Background Decorations
// Deep Space Edition - Darker, richer, and more "infinite" feel
export default function BackgroundDecorations() {
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-[#020205]">
            {/* Deep Space Gradient Base - Darker Void */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/20 via-[#050510] to-[#000000]" />

            {/* Subtle Gradient Orbs for Depth (Static for performance, but rich color) */}
            {/* Top Left - Deep Purple */}
            <div
                className="absolute -top-[10%] -left-[10%] w-[70vw] h-[70vw] rounded-full opacity-20 blur-[100px]"
                style={{ background: 'radial-gradient(circle, rgba(120, 50, 200, 0.3) 0%, transparent 70%)' }}
            />

            {/* Bottom Right - Teal/Cyan */}
            <div
                className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full opacity-10 blur-[120px]"
                style={{ background: 'radial-gradient(circle, rgba(20, 184, 166, 0.4) 0%, transparent 70%)' }}
            />

            {/* Center - Faint Rose Glow */}
            <div
                className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] rounded-full opacity-5 blur-[150px]"
                style={{ background: 'radial-gradient(circle, rgba(244, 63, 94, 0.3) 0%, transparent 70%)' }}
            />

            {/* Stars Layer - High Density & Depth */}
            <div className="absolute inset-0">
                {/* Noise Texture for Realism */}
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }}
                />

                {/* Stars - Using CSS shadows for performance instead of 100s of divs if possible, but keeping lists for now as it's cleaner to read/randomize in React */}
                {/* Large Bright Stars (Twinkle) */}
                {[...Array(20)].map((_, i) => (
                    <div
                        key={`large-star-${i}`}
                        className="absolute w-[2px] h-[2px] bg-white rounded-full animate-twinkle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            boxShadow: '0 0 4px 1px rgba(255, 255, 255, 0.8)',
                            opacity: 0.8 + Math.random() * 0.2,
                            animationDuration: `${3 + Math.random() * 4}s`,
                            animationDelay: `${Math.random() * 5}s`
                        }}
                    />
                ))}

                {/* Medium Stars */}
                {[...Array(60)].map((_, i) => (
                    <div
                        key={`medium-star-${i}`}
                        className="absolute w-[1.5px] h-[1.5px] bg-slate-200 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            opacity: 0.4 + Math.random() * 0.4,
                        }}
                    />
                ))}

                {/* Small Distant Stars */}
                {[...Array(150)].map((_, i) => (
                    <div
                        key={`small-star-${i}`}
                        className="absolute w-[1px] h-[1px] bg-slate-400 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            opacity: 0.2 + Math.random() * 0.3,
                        }}
                    />
                ))}
            </div>

            {/* Shooting Star Animation */}
            <style>{`
                @keyframes shooting-star {
                    0% { transform: translateX(0) translateY(0) rotate(-45deg); opacity: 1; }
                    100% { transform: translateX(-500px) translateY(500px) rotate(-45deg); opacity: 0; }
                }
                .animate-shooting-star {
                    animation: shooting-star 5s linear infinite;
                }
            `}</style>
            <div className="absolute top-[10%] right-[10%] w-[150px] h-[1px] bg-gradient-to-l from-transparent via-white to-transparent opacity-0 animate-shooting-star" style={{ animationDelay: '8s', animationDuration: '6s' }} />
        </div>
    );
}
