import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useNavigationLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Function to start loading
  const startLoading = () => setIsLoading(true);
  
  // Function to stop loading
  const stopLoading = () => setIsLoading(false);

  // Enhanced navigation function with loading
  const navigateWithLoader = (url, options = {}) => {
    startLoading();
    
    // Add a minimum loading time for better UX
    const minLoadTime = options.minLoadTime || 500;
    
    const startTime = Date.now();
    
    // Navigate to the URL
    router.push(url);
    
    // Ensure minimum loading time
    setTimeout(() => {
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < minLoadTime) {
        setTimeout(stopLoading, minLoadTime - elapsedTime);
      } else {
        stopLoading();
      }
    }, 100);
  };

  return {
    isLoading,
    startLoading,
    stopLoading,
    navigateWithLoader
  };
}

// Hook for page-level loading (can be used in layouts)
export function usePageLoader() {
  const [isPageLoading, setIsPageLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleStart = () => setIsPageLoading(true);
    const handleComplete = () => setIsPageLoading(false);

    // Listen for route changes
    router.events?.on('routeChangeStart', handleStart);
    router.events?.on('routeChangeComplete', handleComplete);
    router.events?.on('routeChangeError', handleComplete);

    return () => {
      router.events?.off('routeChangeStart', handleStart);
      router.events?.off('routeChangeComplete', handleComplete);
      router.events?.off('routeChangeError', handleComplete);
    };
  }, [router]);

  return { isPageLoading };
}