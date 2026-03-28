import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';

interface LoginTransitionScreenProps {
  userName: string;
  role: string;
  onComplete: () => void;
}

export default function LoginTransitionScreen({ userName, role, onComplete }: LoginTransitionScreenProps) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Stage 1: Fade in container
    const t1 = setTimeout(() => setStage(1), 100);
    
    // Stage 2: Show success icon
    const t2 = setTimeout(() => setStage(2), 600);
    
    // Stage 3: Show welcome text
    const t3 = setTimeout(() => setStage(3), 1200);
    
    // Stage 4: Fade out
    const t4 = setTimeout(() => {
      setStage(4);
      setTimeout(onComplete, 600);
    }, 2500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a2e2e]/95 backdrop-blur-md text-white transition-opacity duration-500 ease-in-out ${stage >= 1 && stage < 4 ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="relative flex flex-col items-center">
        
        {/* Dynamic Orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#c4a35a]/20 rounded-full mix-blend-screen filter blur-[60px] animate-pulse-glow"></div>
        
        {/* Icon Container */}
        <div 
          className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 relative transition-all duration-700 transform ${stage >= 2 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-[#1a7a7a] to-[#0d3d3d] rounded-full shadow-[0_0_40px_rgba(26,122,122,0.6)]"></div>
          <div className="absolute inset-1 bg-[#0a2e2e] rounded-full flex items-center justify-center">
            <ShieldCheck className={`w-10 h-10 text-[#c4a35a] transition-all duration-500 delay-300 ${stage >= 2 ? 'scale-100' : 'scale-0'}`} />
          </div>
          
          {/* Animated rings */}
          <div className={`absolute -inset-4 border-2 border-[#c4a35a]/30 rounded-full transition-all duration-1000 ${stage >= 2 ? 'scale-100 opacity-0' : 'scale-50 opacity-100'}`}></div>
          <div className={`absolute -inset-8 border border-[#1a7a7a]/20 rounded-full transition-all duration-1000 delay-100 ${stage >= 2 ? 'scale-100 opacity-0' : 'scale-50 opacity-100'}`}></div>
        </div>

        {/* Text Container */}
        <div className="text-center overflow-hidden">
          <div 
            className={`transition-all duration-700 transform ${stage >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
          >
            <h2 className="text-2xl font-light text-gray-300 mb-2">
              Bienvenue,
            </h2>
            <p className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
              {userName}
            </p>
            <div className="inline-block px-4 py-1.5 rounded-full bg-[#1a7a7a]/30 border border-[#1a7a7a] text-[#c4a35a] text-sm font-medium tracking-widest uppercase">
              {role}
            </div>
          </div>
        </div>
        
        {/* Loading Bar */}
        <div className={`mt-12 w-48 h-1 bg-white/10 rounded-full overflow-hidden transition-opacity duration-500 delay-500 ${stage >= 3 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="h-full bg-gradient-to-r from-[#1a7a7a] via-[#c4a35a] to-[#1a7a7a] w-full origin-left animate-shimmer"></div>
        </div>

      </div>
    </div>
  );
}