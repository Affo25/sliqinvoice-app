'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SplashScreen from '../components/SplashScreen';

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();

  const handleLoadingComplete = () => {
    setShowSplash(false);
    setIsRedirecting(true);
    
    // Automatically redirect to dashboard after splash screen
    setTimeout(() => {
      router.push('/dashboard');
    }, 500);
  };

  // Show a simple loading state if redirect is taking time
  if (isRedirecting && !showSplash) {
    return (
      <div className="nk-app-root">
        <div className="nk-main">
          <div className="nk-wrap nk-wrap-nosidebar">
            <div className="nk-content">
              <div className="nk-block nk-block-middle nk-auth-body wide-xs">
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Redirecting...</span>
                  </div>
                  <p className="mt-3 text-soft">Redirecting to Dashboard...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {showSplash && (
        <SplashScreen onLoadingComplete={handleLoadingComplete} />
      )}
    </>
  );
}