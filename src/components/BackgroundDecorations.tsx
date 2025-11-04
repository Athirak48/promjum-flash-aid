import { useEffect, useState } from "react";

const BackgroundDecorations = () => {
  const [stars, setStars] = useState<Array<{ id: number; left: string; top: string; delay: string; size: string }>>([]);
  const [particles, setParticles] = useState<Array<{ id: number; left: string; top: string; delay: string }>>([]);

  useEffect(() => {
    // Generate random stars
    const newStars = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      size: Math.random() > 0.7 ? 'text-lg' : 'text-sm'
    }));

    // Generate floating particles
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i + 100,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 10}s`
    }));

    setStars(newStars);
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Twinkling Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className={`absolute text-primary/30 ${star.size} animate-twinkle`}
          style={{
            left: star.left,
            top: star.top,
            animationDelay: star.delay,
          }}
        >
          ✦
        </div>
      ))}

      {/* Floating Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float"
          style={{
            left: particle.left,
            top: particle.top,
            animationDelay: particle.delay,
          }}
        />
      ))}

      {/* Drifting Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 text-primary/10 text-4xl animate-drift" style={{ animationDelay: '0s' }}>
          ✨
        </div>
        <div className="absolute top-40 text-primary/10 text-3xl animate-drift" style={{ animationDelay: '5s' }}>
          💫
        </div>
        <div className="absolute top-60 text-primary/10 text-2xl animate-drift" style={{ animationDelay: '10s' }}>
          ⭐
        </div>
        <div className="absolute top-80 text-primary/10 text-3xl animate-drift" style={{ animationDelay: '15s' }}>
          🌟
        </div>
      </div>

      {/* Geometric Shapes */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-primary/10 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-3/4 right-1/4 w-24 h-24 border border-primary/10 rounded-lg rotate-45 animate-float" style={{ animationDelay: '4s' }}></div>
      <div className="absolute top-1/2 left-1/6 w-16 h-16 bg-gradient-primary opacity-5 rounded-full animate-float" style={{ animationDelay: '6s' }}></div>
      <div className="absolute top-1/3 right-1/3 w-20 h-20 border-2 border-primary/10 rounded-full animate-float" style={{ animationDelay: '8s' }}></div>

      {/* Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(280 100% 85% / 0.1) 1px, transparent 1px),
            linear-gradient(90deg, hsl(280 100% 85% / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      ></div>
    </div>
  );
};

export default BackgroundDecorations;