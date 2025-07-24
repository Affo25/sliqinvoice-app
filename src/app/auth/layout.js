export const metadata = {
  title: 'SliqInvoice - Authentication',
  description: 'Login and registration for SliqInvoice',
};

export default function AuthLayout({ children }) {
  return (
   <div className="nk-app-root bg-dark nk-theme-color-a1" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
  <div className="nk-main" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
    <div className="nk-wrap nk-wrap-nosidebar" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="nk-content" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="nk-block nk-block-middle nk-auth-body wide-xl" style={{ width: '100%', maxWidth: '500px' }}>
          <div className="brand-logo pb-4 text-center">
            <a href="/" className="logo-link">
              {/* <img className="logo-light logo-img logo-img-lg" src="/images/logo2x.png" alt="logo" />
              <img className="logo-dark logo-img logo-img-lg" src="/images/logo-dark.png" alt="logo-dark" /> */}
            </a>
          </div>

          {children}

          <div className="text-center pt-4 pb-3">
            <p className="text-soft">&copy; 2025 SliqInvoice. All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

  );
}