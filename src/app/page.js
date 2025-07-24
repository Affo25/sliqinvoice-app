'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SplashScreen from '../components/SplashScreen';
import Cookies from 'js-cookie';


export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();

 const handleLoadingComplete = () => {
  setShowSplash(false);
  setIsRedirecting(true);

  const token = Cookies.get('token');
  const userData = Cookies.get('user');

  console.log("Token:", token);
  console.log("UserData:", userData);

  if (!token) {
    router.push('/auth/admin-login');
    return;
  }

  if (userData) {
    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      // Role-based redirection
      if (parsedUser.role === 'superAdmin' || parsedUser.role === 'moderator') {
        router.push('/dashboard');
      } else if (parsedUser.role === 'customers') {
        router.push('/dashboard/customers');
      } else {
        router.push('/Pages/unauthorized');
      }

      return;
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/auth/admin-login');
      return;
    }
  } else {
    // If userData is missing but token exists, treat as invalid
    router.push('/auth/admin-login');
    return;
  }
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