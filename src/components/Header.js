"use client";

import { showToast } from '../lib/toast';
import { useAuth } from '../lib/useAuth';

export default function Header() {
  const { user, logout, loading } = useAuth();

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.success) {
        showToast("Logged out successfully", 'success');
      } else {
        showToast(result.message || "Logout failed", 'error');
      }
    } catch (err) {
      console.error('Logout error:', err);
      showToast("Logout failed: " + err.message, 'error');
    }
  };


  return (
    <div className="nk-header nk-header-fixed is-light">
      <div className="container-fluid">
        <div className="nk-header-wrap">
          <div className="nk-menu-trigger d-xl-none ml-n1">
            <a href="#" className="nk-nav-toggle nk-quick-nav-icon" data-target="sidebarMenu">
              <em className="icon ni ni-menu"></em>
            </a>
          </div>
          <div className="nk-header-brand d-xl-none">
            <a href="/" className="logo-link">
              <img className="logo-light logo-img" src="/images/logo.png" alt="logo" />
              <img className="logo-dark logo-img" src="/images/logo-dark.png" alt="logo-dark" />
              <span className="nio-version">SliqInvoice</span>
            </a>
          </div>
          <div className="nk-header-news d-none d-xl-block">
            <div className="nk-news-list">
              <a className="nk-news-item" href="#">
                <div className="nk-news-icon">
                  <em className="icon ni ni-card-view"></em>
                </div>
                <div className="nk-news-text">
                  <p>Welcome to SliqInvoice Dashboard <span>Manage your invoices efficiently</span></p>
                  <em className="icon ni ni-external"></em>
                </div>
              </a>
            </div>
          </div>
          <div className="nk-header-tools">
            <ul className="nk-quick-nav">
              <li className="dropdown notification-dropdown mr-n1">
                <a href="#" className="dropdown-toggle nk-quick-nav-icon" data-toggle="dropdown">
                  <div className="icon-status icon-status-info">
                    <em className="icon ni ni-bell"></em>
                  </div>
                </a>
                <div className="dropdown-menu dropdown-menu-xl dropdown-menu-right dropdown-menu-s1">
                  <div className="dropdown-head">
                    <span className="sub-title nk-dropdown-title">Notifications</span>
                    <a href="#">Mark All as Read</a>
                  </div>
                  <div className="dropdown-body">
                    <div className="nk-notification">
                      <div className="nk-notification-item dropdown-inner">
                        <div className="nk-notification-icon">
                          <em className="icon icon-circle bg-warning-dim ni ni-curve-down-right"></em>
                        </div>
                        <div className="nk-notification-content">
                          <div className="nk-notification-text">New invoice created successfully</div>
                          <div className="nk-notification-time">2 hrs ago</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="dropdown-foot center">
                    <a href="#">View All</a>
                  </div>
                </div>
              </li>
              <li className="dropdown user-dropdown">
                <a href="#" className="dropdown-toggle" data-toggle="dropdown">
                  <div className="user-toggle">
                    <div className="user-avatar sm">
                      <em className="icon ni ni-user-alt"></em>
                    </div>
                    <div className="user-info d-none d-md-block">
                      <div className="user-status">{loading ? "Loading..." : (user?.role ?? "Administrator")}</div>
                      <div className="user-name dropdown-indicator">{loading ? "Loading..." : (user?.name ?? "john doe")}</div>
                    </div>
                  </div>
                </a>
                <div className="dropdown-menu dropdown-menu-md dropdown-menu-right dropdown-menu-s1">
                  <div className="dropdown-inner user-card-wrap bg-lighter d-none d-md-block">
                    <div className="user-card">
                      <div className="user-avatar">
                        <span>JD</span>
                      </div>
                      <div className="user-info">
                        <span
                          className={`lead-text text-white badge ${user?.role === 'superAdmin'
                              ? 'badge-warning'
                              : user?.role === 'customers'
                                ? 'badge-info'
                                : user?.role === 'moderator'? 'badge badge-danger': 'badge-secondary'
                            }`}
                        >
                          {user?.role ?? 'test'}
                        </span>

                        <span className="sub-text">{user?.email??""}</span>
                      </div>
                    </div>
                  </div>
                  <div className="dropdown-inner">
                    <ul className="link-list">
                      <li><a href="/profile"><em className="icon ni ni-user-alt"></em><span>View Profile</span></a></li>
                      <li><a href="/settings"><em className="icon ni ni-setting-alt"></em><span>Account Setting</span></a></li>
                      <li><a href="/activity"><em className="icon ni ni-activity-alt"></em><span>Login Activity</span></a></li>
                    </ul>
                  </div>
                  {/* <div className="dropdown-inner">
                    <ul className="link-list">
                      <li><a href="/auth/login"><em className="icon ni ni-shield-check"></em><span>Admin Login</span></a></li>
                      <li><a href="/auth/customer-login"><em className="icon ni ni-user"></em><span>Customer Login</span></a></li>
                      <li><a href="/auth/customer-register"><em className="icon ni ni-user-add"></em><span>Register</span></a></li>
                    </ul>
                  </div> */}
                  <div className="dropdown-inner">
                    <ul className="link-list">
                      <li><a onClick={handleLogout}><em className="icon ni ni-signout"></em><span>Sign out</span></a></li>
                    </ul>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 