import { useEffect, useState } from "react";

const BackgroundDecorations = () => {
  const [stars, setStars] = useState<Array<{ id: number; left: string; top: string; delay: string; size: string; duration: string }>>([]);

  useEffect(() => {
    // Generate random twinkling stars
    const newStars = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      size: Math.random() > 0.7 ? 'w-1.5 h-1.5' : 'w-1 h-1',
      duration: `${3 + Math.random() * 2}s`
    }));

    setStars(newStars);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Main Gradient Background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #b6709a 0%, #c988b8 30%, #e8d5f0 60%, #f8f6ff 100%)',
        }}
      />

      {/* Subtle Fog/Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 80% 70%, rgba(182, 112, 154, 0.2) 0%, transparent 50%),
                           radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 70%)`,
        }}
      />

      {/* Orbit Lines (เส้นวงโคจร) */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.08 }}>
        {/* Orbit 1 - Top */}
        <ellipse
          cx="50%"
          cy="20%"
          rx="40%"
          ry="15%"
          fill="none"
          stroke="white"
          strokeWidth="1"
          strokeDasharray="20 10"
          className="animate-orbit"
        />
        {/* Orbit 2 - Middle */}
        <ellipse
          cx="50%"
          cy="50%"
          rx="35%"
          ry="20%"
          fill="none"
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth="1"
          strokeDasharray="15 15"
          className="animate-orbit"
          style={{ animationDelay: '10s' }}
        />
        {/* Orbit 3 - Bottom */}
        <ellipse
          cx="50%"
          cy="80%"
          rx="30%"
          ry="12%"
          fill="none"
          stroke="rgba(255, 255, 255, 0.6)"
          strokeWidth="1"
          strokeDasharray="25 8"
          className="animate-orbit"
          style={{ animationDelay: '20s' }}
        />
      </svg>

      {/* Twinkling Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className={`absolute ${star.size} bg-white rounded-full`}
          style={{
            left: star.left,
            top: star.top,
            animation: `twinkle ${star.duration} ease-in-out infinite`,
            animationDelay: star.delay,
          }}
        />
      ))}

      {/* Soft Planet Glow - Top Right */}
      <div
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 animate-glow"
        style={{
          background: 'radial-gradient(circle, rgba(255, 223, 186, 0.6) 0%, transparent 70%)',
        }}
      />

      {/* Soft Planet Glow - Bottom Left */}
      <div
        className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-15 animate-glow"
        style={{
          background: 'radial-gradient(circle, rgba(201, 136, 184, 0.5) 0%, transparent 70%)',
          animationDelay: '2s',
        }}
      />

      {/* Soft Planet Glow - Center */}
      <div
        className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full opacity-10 animate-glow"
        style={{
          background: 'radial-gradient(circle, rgba(255, 246, 255, 0.8) 0%, transparent 65%)',
          animationDelay: '1s',
        }}
      />

      {/* Responsive: Hide some elements on mobile */}
      <div className="hidden md:block">
        {/* Additional decorative elements for desktop */}
        <div
          className="absolute top-1/4 right-1/4 w-2 h-2 bg-white/40 rounded-full animate-twinkle"
          style={{ animationDelay: '1.5s' }}
        />
        <div
          className="absolute top-3/4 left-1/4 w-1.5 h-1.5 bg-white/30 rounded-full animate-twinkle"
          style={{ animationDelay: '3s' }}
        />
      </div>

      {/* Subtle Grid Pattern (very faint) */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }}
      />
    </div>
  );
};

export default BackgroundDecorations;
