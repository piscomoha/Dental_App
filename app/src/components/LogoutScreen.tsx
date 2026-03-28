import { useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';

interface LogoutScreenProps {
  onComplete: () => void;
}

export default function LogoutScreen({ onComplete }: LogoutScreenProps) {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    // Fade in
    requestAnimationFrame(() => setOpacity(1));

    // Wait then trigger completion
    const timer = setTimeout(() => {
      setOpacity(0);
      setTimeout(onComplete, 500); // Wait for fade out before completing
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a2e2e]/95 backdrop-blur-md text-white transition-opacity duration-500 ease-in-out"
      style={{ opacity }}
    >
      <div className="flex flex-col items-center animate-fade-in-up">
        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(26,122,122,0.5)]">
          <LogOut className="w-8 h-8 text-[#c4a35a]" />
        </div>
        <h2 className="text-2xl font-light tracking-widest uppercase mb-2">
          Déconnexion
        </h2>
        <p className="text-sm text-gray-400">À bientôt !</p>
        
        {/* Simple loader */}
        <div className="mt-8 flex gap-2">
          <div className="w-1.5 h-1.5 bg-[#c4a35a] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1.5 h-1.5 bg-[#c4a35a] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-1.5 h-1.5 bg-[#c4a35a] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}