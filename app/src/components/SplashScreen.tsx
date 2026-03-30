import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate a loading process with a more dynamic curve
    const duration = 2800; // 2.8 seconds total for a premium feel
    const interval = 20; 
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      
      // Custom easing: starts fast, slows down in middle, finishes fast
      const t = currentStep / steps;
      let easedProgress;
      if (t < 0.5) {
        easedProgress = 4 * t * t * t;
      } else {
        easedProgress = 1 - Math.pow(-2 * t + 2, 3) / 2;
      }
        
      setProgress(Math.min(easedProgress * 100, 100));

      if (currentStep >= steps) {
        clearInterval(timer);
        setIsLoaded(true);
        // Wait for final animations to finish before unmounting
        setTimeout(onComplete, 800);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  // Generate random particles
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDuration: `${Math.random() * 3 + 2}s`,
    animationDelay: `${Math.random() * 2}s`,
  }));

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a2e2e] text-white overflow-hidden transition-opacity duration-700 ${isLoaded ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a5a5a]/40 via-[#0d3d3d]/80 to-[#0a2e2e]"></div>
      
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#c4a35a]/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#1a7a7a]/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob" style={{ animationDelay: '2s' }}></div>

      {/* Particles */}
      {particles.map(p => (
        <div 
          key={p.id}
          className="absolute rounded-full bg-white/20 animate-float"
          style={{
            width: p.size,
            height: p.size,
            left: p.left,
            top: p.top,
            animationDuration: p.animationDuration,
            animationDelay: p.animationDelay
          }}
        />
      ))}

      <div className="relative z-10 flex flex-col items-center w-full max-w-md px-8">
        
        {/* Logo Container with Premium Glassmorphism */}
        <div className="relative mb-12 group animate-float">
          {/* Rotating glowing ring */}
          <div className="absolute -inset-4 rounded-full border border-[#c4a35a]/30 animate-spin-slow opacity-50"></div>
          <div className="absolute -inset-8 rounded-full border border-[#1a7a7a]/20 animate-spin-slow opacity-30" style={{ animationDirection: 'reverse', animationDuration: '12s' }}></div>
          
          {/* Main Logo Card */}
          <div className="relative w-32 h-32 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(26,122,122,0.3)] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            
            {/* The SVG Logo */}
            <svg viewBox="0 0 24 24" className="w-16 h-16 text-[#c4a35a] drop-shadow-[0_0_15px_rgba(196,163,90,0.5)] z-10" fill="currentColor">
              <path d="M12 2C8.5 2 6 4.5 6 7c0 1.5.5 2.5 1 3.5.5 1 1 2 1 3.5 0 2.5-1 4-1 5.5 0 1.5.5 2.5 2 2.5s2-1 2-2.5c0-1.5 1-3 1-5.5 0-1.5-.5-2.5-1-3.5-.5-1-1-2-1-3.5 0-1.5 1-2.5 2-2.5s2 1 2 2.5c0 1.5.5 2.5 1 3.5.5 1 1 2 1 3.5 0 2.5-1 4-1 5.5 0 1.5.5 2.5 2 2.5s2-1 2-2.5c0-1.5 1-3 1-5.5 0-1.5-.5-2.5-1-3.5-.5-1-1-2-1-3.5 0-2.5-2.5-5-6-5z" />
            </svg>
          </div>
        </div>

        {/* Typography */}
        <div className="text-center mb-16 relative">
          <h1 className="text-4xl md:text-5xl font-light mb-3 tracking-tight text-white animate-reveal whitespace-nowrap">
            Cabinet <span className="font-bold text-[#c4a35a]">Dentaire</span>
          </h1>
          <div className="h-[1px] w-0 bg-gradient-to-r from-transparent via-[#c4a35a]/50 to-transparent mx-auto transition-all duration-1000 delay-500" style={{ width: progress > 10 ? '100%' : '0%' }}></div>
          <p className="text-sm text-gray-400 mt-4 tracking-[0.3em] uppercase opacity-0 transition-opacity duration-1000 delay-700 font-medium" style={{ opacity: progress > 20 ? 1 : 0 }}>
            Cabinet Dentaire
          </p>
        </div>

        {/* Minimalist Progress Indicator */}
        <div className="w-full flex flex-col items-center opacity-0 transition-opacity duration-1000 delay-300" style={{ opacity: progress > 5 ? 1 : 0 }}>
          <div className="flex justify-between w-full text-xs font-medium text-gray-500 mb-2 px-1">
            <span className="uppercase tracking-wider">Initialisation</span>
            <span className="text-[#c4a35a]">{Math.round(progress)}%</span>
          </div>
          
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden relative">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#1a7a7a] via-[#c4a35a] to-[#e8d5a5] rounded-full transition-all duration-100 ease-out shadow-[0_0_10px_rgba(196,163,90,0.5)]"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute top-0 right-0 w-10 h-full bg-white/50 blur-[2px] animate-shimmer"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}