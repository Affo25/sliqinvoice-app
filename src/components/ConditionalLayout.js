'use client';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  
  // Check if current path is an auth route
  const isAuthRoute = pathname.includes('/login') || 
                     pathname.includes('/register') || 
                     pathname.includes('/reset-password');

  useEffect(() => {
    // Clean existing classes and apply appropriate body classes based on route
    if (isAuthRoute) {
      document.body.className = 'nk-body npc-crypto ui-clean pg-auth';
      // Add additional HTML class for auth pages
      document.documentElement.className = 'js';
    } else {
      document.body.className = 'nk-body bg-lighter npc-general has-sidebar';
      document.documentElement.className = 'js';
    }

    // Initialize auth page scripts if needed
    if (isAuthRoute && typeof window !== 'undefined') {
      // Ensure auth page styling is properly initialized
      setTimeout(() => {
        // Any additional auth page initialization can go here
        console.log('Auth page initialized');
      }, 100);
    }
  }, [isAuthRoute, pathname]);

  if (isAuthRoute) {
    // Auth layout - clean auth pages without sidebar/header
    return children;
  }

  // Dashboard layout - full dashboard with sidebar and header
  return (
    <div className="nk-app-root">
      <div className="nk-main">
        <Sidebar />
        <div className="nk-wrap">
          <Header />
          <div className="nk-content">
            <div className="container-fluid">
              <div className="nk-content-inner">
                <div className="nk-content-body">
                  {children}
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}