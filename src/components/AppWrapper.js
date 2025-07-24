'use client';
import { useState, useEffect } from 'react';
import SplashScreen from './SplashScreen';

export default function AppWrapper({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Check if splash screen has been shown before in this session
    const hasShownSplash = sessionStorage.getItem('hasShownSplash');
    
    if (hasShownSplash) {
      // Skip splash screen if already shown in this session
      setIsLoading(false);
      setShowContent(true);
    }
  }, []);

  const handleLoadingComplete = () => {
    // Mark that splash screen has been shown in this session
    sessionStorage.setItem('hasShownSplash', 'true');
    
    // Add a fade-out effect
    setIsLoading(false);
    
    // Show content after fade-out completes
    setTimeout(() => {
      setShowContent(true);
    }, 500);
  };

  if (isLoading) {
    return <SplashScreen onLoadingComplete={handleLoadingComplete} />;
  }

  if (!showContent) {
    // Show blank screen during transition
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        opacity: 0,
        transition: 'opacity 0.5s ease-out'
      }} />
    );
  }

  return children;
}
