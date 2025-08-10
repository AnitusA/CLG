import { useNavigation } from '@remix-run/react';
import { useEffect, useState } from 'react';

export function LoadingTransition() {
  const navigation = useNavigation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (navigation.state === 'loading') {
      setIsVisible(true);
    } else {
      // Delay hiding to show completion animation
      const timer = setTimeout(() => setIsVisible(false), 500);
      return () => clearTimeout(timer);
    }
  }, [navigation.state]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] w-full h-full">
      {/* Full-screen blurry background overlay */}
      <div className="absolute inset-0 w-full h-full bg-black/70 backdrop-blur-lg"></div>
      
      {/* Space background with enhanced elements - full screen */}
      <div className="absolute inset-0 w-full h-full overflow-hidden oxford-blue-space">
        {/* Dense Star Field */}
        <div className="stars-field w-full h-full"></div>
        
        {/* Galaxies */}
        <div className="space-galaxy"></div>
        <div className="space-galaxy-2"></div>
        
        {/* Space Shuttle */}
        <div className="space-shuttle"></div>
        
        {/* Satellites */}
        <div className="satellite-1"></div>
        <div className="satellite-2"></div>
        
        {/* Floating Astronaut */}
        <div className="space-astronaut"></div>
        
        {/* Enhanced Nebula Effects */}
        <div className="deep-space-nebula w-full h-full"></div>
        
        {/* Planets */}
        <div className="space-planet-1"></div>
        <div className="space-planet-2"></div>
        <div className="space-planet-3"></div>
        
        {/* Shooting Stars */}
        <div className="shooting-stars">
          <div className="shooting-star shooting-star-1"></div>
          <div className="shooting-star shooting-star-2"></div>
          <div className="shooting-star shooting-star-3"></div>
        </div>
      </div>
      
      {/* Centered loading container */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center">
        <div className="relative z-10 bg-black/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-blue-500/30 animate-fade-in max-w-md mx-4">
        <div className="flex flex-col items-center space-y-6">
          {/* Enhanced space-themed spinner */}
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-400/30 border-t-blue-400 rounded-full loading-spinner"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-400 rounded-full loading-spinner-reverse"></div>
            <div className="absolute inset-2 w-12 h-12 border-2 border-cyan-400/50 border-b-cyan-400 rounded-full loading-spinner-slow"></div>
            
            {/* Central glow effect */}
            <div className="absolute inset-4 w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse opacity-80"></div>
          </div>
          
          {/* Loading text with space theme */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-3 animate-pulse">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Loading
              </span>
            </h3>
            <p className="text-blue-200/80 text-sm mb-4">Preparing your dashboard...</p>
            
            {/* Enhanced loading dots with orbital animation */}
            <div className="flex space-x-2 justify-center">
              <div className="w-3 h-3 bg-blue-400 rounded-full loading-orbit-dot"></div>
              <div className="w-3 h-3 bg-purple-400 rounded-full loading-orbit-dot" style={{ animationDelay: '0.3s' }}></div>
              <div className="w-3 h-3 bg-cyan-400 rounded-full loading-orbit-dot" style={{ animationDelay: '0.6s' }}></div>
            </div>
          </div>
          
          {/* Progress indication */}
          <div className="w-48 h-1 bg-blue-900/50 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full loading-progress"></div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
