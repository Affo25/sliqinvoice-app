'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function CustomerRegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Add registration logic here
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
                <h5 className="nk-block-title">Create Account</h5>
                <div className="nk-block-des">
                  <p>Join SliqInvoice and start managing your invoices professionally.</p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="row gy-4">
                <div className="col-sm-6">
                  <div className="form-group">
                    <label className="form-label" htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label className="form-label" htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter your last name"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input
                  type="email"
                  className="form-control form-control-lg"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="company">Company Name (Optional)</label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Enter your company name"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <div className="form-control-wrap">
                  <a 
                    tabIndex="-1" 
                    href="#" 
                    className="form-icon form-icon-right passcode-switch" 
                    data-target="password"
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
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                <div className="form-control-wrap">
                  <a 
                    tabIndex="-1" 
                    href="#" 
                    className="form-icon form-icon-right passcode-switch" 
                    data-target="confirmPassword"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowConfirmPassword(!showConfirmPassword);
                    }}
                  >
                    <em className={`passcode-icon icon-show icon ni ni-eye ${showConfirmPassword ? 'd-none' : ''}`}></em>
                    <em className={`passcode-icon icon-hide icon ni ni-eye-off ${!showConfirmPassword ? 'd-none' : ''}`}></em>
                  </a>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-control form-control-lg"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <div className="custom-control custom-control-xs custom-checkbox">
                  <input type="checkbox" className="custom-control-input" id="checkbox" required />
                  <label className="custom-control-label" htmlFor="checkbox">
                    I agree to SliqInvoice <a href="#">Terms of Service</a> & <a href="#">Privacy Policy</a>
                  </label>
                </div>
              </div>
              
              <div className="form-group">
                <button 
                  type="submit" 
                  className="btn btn-lg btn-primary btn-block"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </button>
              </div>
            </form>
            
            <div className="form-note-s2 pt-4">
              Already have an account? <Link href="/auth/customer-login">Sign in instead</Link>
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
                    <h4>Get Started Today</h4>
                    <p>Join thousands of businesses already using SliqInvoice to streamline their billing process and improve cash flow.</p>
                  </div>
                </div>
              </div>
              
              <div className="slider-item">
                <div className="nk-feature nk-feature-center">
                  <div className="nk-feature-img">
                    <img className="round" src="/images/slides/promo-b.png" srcSet="/images/slides/promo-b2x.png 2x" alt="" />
                  </div>
                  <div className="nk-feature-content py-4 p-sm-5">
                    <h4>Free Trial Available</h4>
                    <p>Start with our free plan and upgrade as your business grows. No setup fees, no hidden costs.</p>
                  </div>
                </div>
              </div>
              
              <div className="slider-item">
                <div className="nk-feature nk-feature-center">
                  <div className="nk-feature-img">
                    <img className="round" src="/images/slides/promo-c.png" srcSet="/images/slides/promo-c2x.png 2x" alt="" />
                  </div>
                  <div className="nk-feature-content py-4 p-sm-5">
                    <h4>24/7 Support</h4>
                    <p>Our dedicated support team is here to help you succeed. Get assistance whenever you need it.</p>
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