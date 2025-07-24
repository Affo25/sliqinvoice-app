'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function AdminResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Add password reset logic here
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <div className="nk-app-root">
        <div className="nk-split nk-split-page nk-split-md">
          <div className="nk-split-content nk-block-area nk-block-area-column nk-auth-container">
            <div className="nk-block nk-block-middle nk-auth-body">
              <div className="brand-logo pb-5">
                <Link href="/" className="logo-link">
                  <img className="logo-light logo-img logo-img-lg" src="/images/logo.png" srcSet="/images/logo2x.png 2x" alt="logo" />
                  <img className="logo-dark logo-img logo-img-lg" src="/images/logo-dark.png" srcSet="/images/logo-dark2x.png 2x" alt="logo-dark" />
                </Link>
              </div>
              <div className="nk-block-head">
                <div className="nk-block-head-content">
                  <h5 className="nk-block-title">Check Your Email</h5>
                  <div className="nk-block-des">
                    <p>We've sent a password reset link to <strong>{email}</strong></p>
                  </div>
                </div>
              </div>
              <div className="form-note-s2 pt-4">
                <Link href="/admin/login">Back to Admin Login</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="nk-app-root">
      <div className="nk-split nk-split-page nk-split-md">
        <div className="nk-split-content nk-block-area nk-block-area-column nk-auth-container">
          <div className="nk-block nk-block-middle nk-auth-body">
            <div className="brand-logo pb-5">
              <Link href="/" className="logo-link">
                <img className="logo-light logo-img logo-img-lg" src="/images/logo.png" srcSet="/images/logo2x.png 2x" alt="logo" />
                <img className="logo-dark logo-img logo-img-lg" src="/images/logo-dark.png" srcSet="/images/logo-dark2x.png 2x" alt="logo-dark" />
              </Link>
            </div>
            <div className="nk-block-head">
              <div className="nk-block-head-content">
                <h5 className="nk-block-title">Reset Admin Password</h5>
                <div className="nk-block-des">
                  <p>Enter your admin email to receive password reset instructions.</p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="reset-email">Admin Email Address</label>
                <input
                  type="email"
                  className="form-control form-control-lg"
                  id="reset-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your admin email address"
                  required
                />
              </div>
              
              <div className="form-group">
                <button 
                  type="submit" 
                  className="btn btn-lg btn-primary btn-block"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
            
            <div className="form-note-s2 pt-4">
              Remember your password? <Link href="/admin/login">Back to Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}