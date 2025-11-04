import { useEffect, useState } from "react";

const BackgroundDecorations = () => {
  const [stars, setStars] = useState<Array<{ id: number; left: string; top: string; delay: string; duration: string }>>([]);

  useEffect(() => {
    // Generate subtle stars with fade animation
    const newStars = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${3 + Math.random() * 4}s`
    }));

    setStars(newStars);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Main Gradient Background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #b6709a 0%, #f8f6ff 100%)'
        }}
      />

      {/* Subtle Fog Texture */}
      <div 
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(174, 226, 255, 0.2) 0%, transparent 50%)',
        }}
      />

      {/* Orbit Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50%" cy="50%" rx="40%" ry="25%" fill="none" stroke="white" strokeWidth="1" opacity="0.3" />
        <ellipse cx="50%" cy="50%" rx="55%" ry="35%" fill="none" stroke="white" strokeWidth="0.5" opacity="0.2" />
        <ellipse cx="50%" cy="50%" rx="70%" ry="45%" fill="none" stroke="white" strokeWidth="0.5" opacity="0.15" />
      </svg>

      {/* Subtle Stars with Fade Animation */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: star.left,
            top: star.top,
            animation: `twinkle ${star.duration} ease-in-out infinite`,
            animationDelay: star.delay,
          }}
        />
      ))}

      {/* Soft Planet Glow */}
      <div 
        className="absolute top-20 right-20 w-32 h-32 rounded-full opacity-30 blur-3xl"
        style={{
          background: 'radial-gradient(circle, #FFE7A0 0%, transparent 70%)',
        }}
      />
      
      <div 
        className="absolute bottom-40 left-20 w-24 h-24 rounded-full opacity-25 blur-2xl"
        style={{
          background: 'radial-gradient(circle, #AEE2FF 0%, transparent 70%)',
        }}
      />

      {/* Slow Moving Light Lines */}
      <div className="absolute inset-0">
        <div 
          className="absolute top-1/4 left-0 w-full h-px opacity-20"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, white 50%, transparent 100%)',
            animation: 'drift 20s linear infinite',
          }}
        />
        <div 
          className="absolute top-3/4 left-0 w-full h-px opacity-15"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(174, 226, 255, 0.5) 50%, transparent 100%)',
            animation: 'drift 25s linear infinite',
            animationDelay: '5s',
          }}
        />
      </div>
    </div>
  );
};

export default BackgroundDecorations;