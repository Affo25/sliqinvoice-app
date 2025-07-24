export const metadata = {
  title: 'SliqInvoice - Authentication',
  description: 'Login and registration for SliqInvoice',
};

export default function AuthLayout({ children }) {
  return (
    <div className="nk-app-root">
      <div className="nk-main">
        <div className="nk-wrap nk-wrap-nosidebar">
          <div className="nk-content">
            <div className="nk-block nk-block-middle nk-auth-body wide-xs">
              <div className="brand-logo pb-4 text-center">
                <a href="/" className="logo-link">
                  <img className="logo-light logo-img logo-img-lg" src="/images/logo.png" alt="logo" />
                  <img className="logo-dark logo-img logo-img-lg" src="/images/logo-dark.png" alt="logo-dark" />
                </a>
              </div>
              {children}
              <div className="text-center pt-4 pb-3">
                <p className="text-soft">&copy; 2024 SliqInvoice. All Rights Reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}