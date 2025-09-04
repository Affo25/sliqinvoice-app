'use client';
import { useState, useEffect } from 'react';
import Loader from './loader';
export default function SplashScreen({ onLoadingComplete }) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  const loadingSteps = [
    'Initializing System Components...',
    'Loading Core Business Modules...',
    'Setting Up Dashboard Framework...',
    'Preparing User Interface...',
    'Finalizing Application Setup...'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 20;
        setCurrentStep(Math.floor(newProgress / 20) - 1);
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsCompleting(true);
          // Wait a bit more before completing
          setTimeout(() => {
            onLoadingComplete();
          }, 1000);
          return 100;
        }
        return newProgress;
      });
    }, 900); // Each step takes 900ms (20% every 900ms = 4.5 seconds total)

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  return (
    <div className="splash-screen">
     <Loader isVisible={true} message="Fetching your data..." type="overlay" />

    </div>
  );
}
