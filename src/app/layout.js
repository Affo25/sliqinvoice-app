import './globals.css';
import Script from 'next/script';
import Providers from './Providers';

export const metadata = {
  title: 'SliqInvoice Dashboard',
  description: 'Professional invoice management system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="js">
      <head>
        <link rel="shortcut icon" href="/images/favicon.png" />
        <link rel="stylesheet" href="/assets/css/dashlite.css?ver=1.4.0" />
        <link rel="stylesheet" href="/assets/css/theme.css?ver=1.4.0" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      </head>
      <body className={`bg-lighter npc-general has-sidebar`}>
        <Providers>
          {children}
        </Providers>
        
        {/* Load DashLite Scripts */}
        <Script 
          src="/assets/js/bundle.js?ver=1.4.0" 
          strategy="beforeInteractive"
        />
        <Script 
          src="/assets/js/scripts.js?ver=1.4.0" 
          strategy="afterInteractive"
        />
        
        {/* Load SweetAlert2 */}
        <Script 
          src="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.js"
          strategy="afterInteractive"
        />
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css"
        />
        
        {/* Toast Notification System */}
        <Script id="toast-system" strategy="afterInteractive">
          {`
            // Global Toast Function for DashLite Theme
            window.showToast = function(message, type = 'info', options = {}) {
              if (typeof NioApp !== 'undefined' && NioApp.Toast) {
                const config = {
                  position: 'top-right',
                  ...options
                };
                
                NioApp.Toast(message, type, config);
              } else {
                // Fallback for when NioApp is not loaded
                console.log('Toast:', type.toUpperCase(), message);
                
                // Create simple fallback toast
                const toast = document.createElement('div');
                toast.style.cssText = \`
                  position: fixed;
                  top: 20px;
                  right: 20px;
                  background: \${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#17a2b8'};
                  color: white;
                  padding: 12px 20px;
                  border-radius: 4px;
                  z-index: 9999;
                  max-width: 400px;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                \`;
                toast.innerHTML = message;
                document.body.appendChild(toast);
                
                setTimeout(() => {
                  if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                  }
                }, 5000);
              }
            };
            
            // Make it available globally
            if (typeof window !== 'undefined') {
              window.showToast = window.showToast;
            }
          `}
        </Script>
      </body>
    </html>
  );
}