import { useEffect, useState } from "react";

const BackgroundDecorations = () => {
  const [stars, setStars] = useState<Array<{ id: number; left: string; top: string; delay: string; size: string; duration: string }>>([]);
  const [shootingStars, setShootingStars] = useState<Array<{ id: number; left: string; top: string; delay: string; duration: string }>>([]);

  useEffect(() => {
    // Generate fewer, subtler twinkling stars for minimal look
    const newStars = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      size: 'w-0.5 h-0.5',
      duration: `${3 + Math.random() * 2}s`
    }));

    // Generate shooting stars
    const newShootingStars = Array.from({ length: 5 }, (_, i) => ({
      id: i + 100,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 50}%`,
      delay: `${Math.random() * 10}s`,
      duration: `${2 + Math.random() * 1}s`
    }));

    setStars(newStars);
    setShootingStars(newShootingStars);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Minimal Gradient Background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #b6709a 0%, #d4a5c4 40%, #f0e5f5 70%, #faf8ff 100%)',
        }}
      />

      {/* Very Subtle Fog/Texture - reduced for minimal look */}
      <div 
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.2) 0%, transparent 60%),
                           radial-gradient(circle at 80% 70%, rgba(182, 112, 154, 0.15) 0%, transparent 60%)`,
        }}
      />

      {/* Shooting Stars Animation ⭐ */}
      {shootingStars.map((star) => (
        <div
          key={star.id}
          className="absolute w-1 h-1"
          style={{
            left: star.left,
            top: star.top,
            animation: `shooting-star ${star.duration} ease-in infinite`,
            animationDelay: star.delay,
          }}
        >
          <div 
            className="w-full h-full bg-white rounded-full"
            style={{
              boxShadow: '0 0 6px 2px rgba(255, 255, 255, 0.8), 0 0 12px 4px rgba(182, 112, 154, 0.6)',
            }}
          />
          <div 
            className="absolute top-0 left-0 w-12 h-[1px] origin-left"
            style={{
              background: 'linear-gradient(to right, rgba(255, 255, 255, 0.8), transparent)',
              transform: 'rotate(-45deg)',
            }}
          />
        </div>
      ))}

      {/* Minimal Twinkling Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className={`absolute ${star.size} bg-white/60 rounded-full`}
          style={{
            left: star.left,
            top: star.top,
            animation: `twinkle ${star.duration} ease-in-out infinite`,
            animationDelay: star.delay,
          }}
        />
      ))}

      {/* Minimal Soft Glow - Top Right */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-[0.12] animate-glow"
        style={{
          background: 'radial-gradient(circle, rgba(255, 223, 186, 0.5) 0%, transparent 70%)',
        }}
      />
    </div>
  );
};

export default BackgroundDecorations;
