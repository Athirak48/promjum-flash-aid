// Kawaii Background Decorations
export default function BackgroundDecorations() {
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {/* Floating Hearts */}
            <div className="absolute top-10 left-10 text-6xl opacity-10 animate-float">
                💖
            </div>
            <div className="absolute top-40 right-20 text-5xl opacity-10 animate-float" style={{ animationDelay: '1s' }}>
                ✨
            </div>
            <div className="absolute bottom-32 left-32 text-7xl opacity-10 animate-float" style={{ animationDelay: '2s' }}>
                🌸
            </div>
            <div className="absolute top-1/3 right-10 text-5xl opacity-10 animate-float" style={{ animationDelay: '0.5s' }}>
                💫
            </div>
            <div className="absolute bottom-20 right-40 text-6xl opacity-10 animate-float" style={{ animationDelay: '1.5s' }}>
                🐰
            </div>

            {/* Gradient Orbs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-pink-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
    );
}
