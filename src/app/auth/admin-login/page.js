"use client";
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../../redux/slices/authSlice'; // Adjust path if needed
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { showToast } from '../../../lib/toast';


export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { loading, error, isAuthenticated } = useSelector(state => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'superAdmin',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(loginUser(formData));

    if (loginUser.fulfilled.match(resultAction)) {
      showToast("Login successful!",'success');
      setTimeout(() => router.push("/dashboard"), 1500);
    } else {
      showToast(resultAction.payload || "Login failed",'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="nk-app-root bg-dark nk-theme-color-a1">
      {loading && (
        <div className="overlay-loader">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      )}
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

              <div className="card card-bordered">
                <div className="card-inner card-inner-lg">
                  <h4 className="nk-block-title text-center">Sign-In</h4>
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
                      <button type="submit" className="btn btn-lg btn-primary btn-block">
                        Sign in
                      </button>
                    </div>
                  </form>
                  <div className="form-note-s2 text-center pt-4">
                    New on our platform? <a href="/auth/register">Create an account</a>
                  </div>
                </div>
              </div>

              <div className="text-center pt-4 pb-3">
                <p className="text-soft">&copy; 2025 SliqInvoice. All Rights Reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Simple loader styling */}
      <style jsx>{`
        .overlay-loader {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.6);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}
