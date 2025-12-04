import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

const BackgroundDecorations = () => {
  const { theme } = useTheme();
  const [stars, setStars] = useState<Array<{ id: number; left: string; top: string; delay: string; size: string }>>([]);
  const [particles, setParticles] = useState<Array<{ id: number; left: string; top: string; delay: string }>>([]);
  const [snowflakes, setSnowflakes] = useState<Array<{ id: number; left: string; delay: string; duration: string; size: string }>>([]);
  const [lights, setLights] = useState<Array<{ id: number; left: string; color: string; delay: string }>>([]);

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

    // Generate MINIMAL snowflakes for Christmas theme
    const newSnowflakes = Array.from({ length: 30 }, (_, i) => ({
      id: i + 200,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 10}s`,
      duration: `${Math.random() * 5 + 8}s`, // Slower fall (8-13s)
      size: Math.random() > 0.8 ? 'text-xl' : 'text-sm' // Mostly small
    }));

    // Generate Christmas Lights
    const colors = ['bg-red-500', 'bg-green-500', 'bg-yellow-400', 'bg-blue-500'];
    const newLights = Array.from({ length: 20 }, (_, i) => ({
      id: i + 400,
      left: `${(i / 20) * 100}%`,
      color: colors[i % colors.length],
      delay: `${Math.random() * 2}s`
    }));

    setStars(newStars);
    setParticles(newParticles);
    setSnowflakes(newSnowflakes);
    setLights(newLights);
  }, []);

  if (theme === 'christmas') {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Pastel Christmas Lights Garland */}
        <div className="absolute top-0 left-0 right-0 h-8 z-50 flex justify-between px-4 pointer-events-none">
          {/* Wire */}
          <div className="absolute top-0 left-0 right-0 h-8 border-b-2 border-gray-300/50 rounded-[50%] translate-y-[-15px]"></div>
          {lights.map((light) => (
            <div
              key={light.id}
              className={`absolute top-2 w-3 h-3 rounded-full ${light.color.replace('red-500', 'pink-400').replace('green-500', 'teal-300').replace('blue-500', 'sky-300').replace('yellow-400', 'amber-200')} shadow-lg animate-twinkle`}
              style={{
                left: light.left,
                animationDelay: light.delay,
                boxShadow: `0 0 10px currentColor`
              }}
            />
          ))}
        </div>

        {/* Falling Snowflakes (Minimal & Soft) */}
        {snowflakes.map((flake) => (
          <div
            key={flake.id}
            className={`absolute text-white/60 ${flake.size} animate-fall`}
            style={{
              left: flake.left,
              top: '-50px',
              animationDuration: flake.duration,
              animationDelay: flake.delay,
              textShadow: '0 0 5px white',
              filter: 'blur(0.5px)'
            }}
          >
            ❄️
          </div>
        ))}

        {/* Minimal Snow Floor */}
        <div className="absolute bottom-0 left-0 right-0 h-24 z-10">
          <div className="absolute bottom-0 left-[-10%] right-[-10%] h-16 bg-white/80 rounded-t-[100%] blur-md"></div>
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-white/90 rounded-t-[50%]"></div>
        </div>

        {/* Subtle Holiday Gradient Overlay (Pink/Mint) */}
        <div className="absolute inset-0 bg-gradient-to-b from-pink-200/5 via-transparent to-teal-200/5 mix-blend-overlay pointer-events-none"></div>
      </div>
    );
  }

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