'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function CustomerLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Add authentication logic here
    setTimeout(() => {
      setIsLoading(false);
      // Redirect to customer dashboard
      window.location.href = '/dashboard';
    }, 2000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="nk-app-root">
      <div className="nk-split nk-split-page nk-split-md">
        <div className="nk-split-content nk-block-area nk-block-area-column nk-auth-container">
          <div className="absolute-top-right d-lg-none p-3 p-sm-5">
            <a href="#" className="toggle btn-white btn btn-icon btn-light" data-target="athPromo">
              <em className="icon ni ni-info"></em>
            </a>
          </div>
          <div className="nk-block nk-block-middle nk-auth-body">
            <div className="brand-logo pb-5">
              <Link href="/" className="logo-link">
                <img className="logo-light logo-img logo-img-lg" src="/images/logo.png" srcSet="/images/logo2x.png 2x" alt="logo" />
                <img className="logo-dark logo-img logo-img-lg" src="/images/logo-dark.png" srcSet="/images/logo-dark2x.png 2x" alt="logo-dark" />
              </Link>
            </div>
            <div className="nk-block-head">
              <div className="nk-block-head-content">
                <h5 className="nk-block-title">Customer Sign-In</h5>
                <div className="nk-block-des">
                  <p>Access your SliqInvoice account to manage invoices and payments.</p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <div className="form-label-group">
                  <label className="form-label" htmlFor="customer-email">Email Address</label>
                  <a className="link link-primary link-sm" tabIndex="-1" href="#">Need Help?</a>
                </div>
                <input
                  type="email"
                  className="form-control form-control-lg"
                  id="customer-email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  required
                />
              </div>
              
              <div className="form-group">
                <div className="form-label-group">
                  <label className="form-label" htmlFor="customer-password">Password</label>
                  <Link href="/auth/customer-reset-password" className="link link-primary link-sm" tabIndex="-1">
                    Forgot Password?
                  </Link>
                </div>
                <div className="form-control-wrap">
                  <a 
                    tabIndex="-1" 
                    href="#" 
                    className="form-icon form-icon-right passcode-switch" 
                    data-target="customer-password"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowPassword(!showPassword);
                    }}
                  >
                    <em className={`passcode-icon icon-show icon ni ni-eye ${showPassword ? 'd-none' : ''}`}></em>
                    <em className={`passcode-icon icon-hide icon ni ni-eye-off ${!showPassword ? 'd-none' : ''}`}></em>
                  </a>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control form-control-lg"
                    id="customer-password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <button 
                  type="submit" 
                  className="btn btn-lg btn-primary btn-block"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign in to your account'}
                </button>
              </div>
            </form>
            
            <div className="form-note-s2 pt-4">
              New customer? <Link href="/auth/customer-register">Create an account</Link>
            </div>
            
            <div className="text-center pt-4 pb-3">
              <h6 className="overline-title overline-title-sap"><span>OR</span></h6>
            </div>
            
            <ul className="nav justify-center gx-4">
              <li className="nav-item">
                <a className="nav-link" href="#">Facebook</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Google</a>
              </li>
            </ul>
            
            <div className="text-center mt-5">
              <span className="fw-500">
                Are you an admin? <Link href="/admin/login">Admin Login</Link>
              </span>
            </div>
          </div>
          
          <div className="nk-block nk-auth-footer">
            <div className="nk-block-between">
              <ul className="nav nav-sm">
                <li className="nav-item">
                  <a className="nav-link" href="#">Terms & Condition</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">Privacy Policy</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">Help Center</a>
                </li>
                <li className="nav-item dropup">
                  <a className="dropdown-toggle dropdown-indicator has-indicator nav-link" data-toggle="dropdown" data-offset="0,10">
                    <small>English</small>
                  </a>
                  <div className="dropdown-menu dropdown-menu-sm dropdown-menu-right">
                    <ul className="language-list">
                      <li>
                        <a href="#" className="language-item">
                          <img src="/images/flags/english.png" alt="" className="language-flag" />
                          <span className="language-name">English</span>
                        </a>
                      </li>
                      <li>
                        <a href="#" className="language-item">
                          <img src="/images/flags/spanish.png" alt="" className="language-flag" />
                          <span className="language-name">Español</span>
                        </a>
                      </li>
                      <li>
                        <a href="#" className="language-item">
                          <img src="/images/flags/french.png" alt="" className="language-flag" />
                          <span className="language-name">Français</span>
                        </a>
                      </li>
                      <li>
                        <a href="#" className="language-item">
                          <img src="/images/flags/turkey.png" alt="" className="language-flag" />
                          <span className="language-name">Türkçe</span>
                        </a>
                      </li>
                    </ul>
                  </div>
                </li>
              </ul>
            </div>
            <div className="mt-3">
              <p>&copy; 2024 SliqInvoice. All Rights Reserved.</p>
            </div>
          </div>
        </div>
        
        {/* Right side promotional content */}
        <div className="nk-split-content nk-split-stretch bg-lighter d-flex toggle-break-lg toggle-slide toggle-slide-right" data-content="athPromo" data-toggle-screen="lg" data-toggle-overlay="true">
          <div className="slider-wrap w-100 w-max-550px p-3 p-sm-5 m-auto">
            <div className="slider-init" data-slick='{"dots":true, "arrows":false}'>
              <div className="slider-item">
                <div className="nk-feature nk-feature-center">
                  <div className="nk-feature-img">
                    <img className="round" src="/images/slides/promo-a.png" srcSet="/images/slides/promo-a2x.png 2x" alt="" />
                  </div>
                  <div className="nk-feature-content py-4 p-sm-5">
                    <h4>SliqInvoice</h4>
                    <p>Streamline your business invoicing with our powerful and intuitive invoice management system. Create, send, and track invoices effortlessly.</p>
                  </div>
                </div>
              </div>
              
              <div className="slider-item">
                <div className="nk-feature nk-feature-center">
                  <div className="nk-feature-img">
                    <img className="round" src="/images/slides/promo-b.png" srcSet="/images/slides/promo-b2x.png 2x" alt="" />
                  </div>
                  <div className="nk-feature-content py-4 p-sm-5">
                    <h4>Easy Payment Tracking</h4>
                    <p>Keep track of all your payments and outstanding invoices in one place. Get notified when payments are received and manage your cash flow effectively.</p>
                  </div>
                </div>
              </div>
              
              <div className="slider-item">
                <div className="nk-feature nk-feature-center">
                  <div className="nk-feature-img">
                    <img className="round" src="/images/slides/promo-c.png" srcSet="/images/slides/promo-c2x.png 2x" alt="" />
                  </div>
                  <div className="nk-feature-content py-4 p-sm-5">
                    <h4>Professional Templates</h4>
                    <p>Choose from a variety of professional invoice templates. Customize with your branding and create impressive invoices that reflect your business.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="slider-dots"></div>
            <div className="slider-arrows"></div>
          </div>
        </div>
      </div>
    </div>
  );
}