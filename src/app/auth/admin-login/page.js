'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function AdminLoginPage() {
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
      // Redirect to admin dashboard
      window.location.href = '/admin/dashboard';
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
                <h5 className="nk-block-title">Admin Sign-In</h5>
                <div className="nk-block-des">
                  <p>Access the SliqInvoice admin panel using your credentials.</p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <div className="form-label-group">
                  <label className="form-label" htmlFor="admin-email">Email or Username</label>
                  <a className="link link-primary link-sm" tabIndex="-1" href="#">Need Help?</a>
                </div>
                <input
                  type="email"
                  className="form-control form-control-lg"
                  id="admin-email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your admin email address"
                  required
                />
              </div>
              
              <div className="form-group">
                <div className="form-label-group">
                  <label className="form-label" htmlFor="admin-password">Password</label>
                  <Link href="/admin/reset-password" className="link link-primary link-sm" tabIndex="-1">
                    Forgot Password?
                  </Link>
                </div>
                <div className="form-control-wrap">
                  <a 
                    tabIndex="-1" 
                    href="#" 
                    className="form-icon form-icon-right passcode-switch" 
                    data-target="admin-password"
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
                    id="admin-password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your admin password"
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
                  {isLoading ? 'Signing in...' : 'Sign in to Admin Panel'}
                </button>
              </div>
            </form>
            
            <div className="form-note-s2 pt-4">
              Not an admin? <Link href="/auth/customer-login">Customer Login</Link>
            </div>
            
            <div className="text-center pt-4 pb-3">
              <h6 className="overline-title overline-title-sap"><span>OR</span></h6>
            </div>
            
            <ul className="nav justify-center gx-4">
              <li className="nav-item">
                <a className="nav-link" href="#">Google SSO</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Microsoft AD</a>
              </li>
            </ul>
            
            <div className="text-center mt-5">
              <span className="fw-500">
                Need admin access? <a href="#">Request Access</a>
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
                  <a className="nav-link" href="#">Admin Help</a>
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
              <p>&copy; 2024 SliqInvoice Admin. All Rights Reserved.</p>
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
                    <h4>Admin Dashboard</h4>
                    <p>Complete control over your SliqInvoice system. Manage users, monitor transactions, and configure system settings with ease.</p>
                  </div>
                </div>
              </div>
              
              <div className="slider-item">
                <div className="nk-feature nk-feature-center">
                  <div className="nk-feature-img">
                    <img className="round" src="/images/slides/promo-b.png" srcSet="/images/slides/promo-b2x.png 2x" alt="" />
                  </div>
                  <div className="nk-feature-content py-4 p-sm-5">
                    <h4>User Management</h4>
                    <p>Efficiently manage customer accounts, permissions, and access levels. View detailed analytics and user activity logs.</p>
                  </div>
                </div>
              </div>
              
              <div className="slider-item">
                <div className="nk-feature nk-feature-center">
                  <div className="nk-feature-img">
                    <img className="round" src="/images/slides/promo-c.png" srcSet="/images/slides/promo-c2x.png 2x" alt="" />
                  </div>
                  <div className="nk-feature-content py-4 p-sm-5">
                    <h4>System Analytics</h4>
                    <p>Comprehensive reporting and analytics dashboard. Track system performance, revenue, and user engagement metrics.</p>
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