'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'ni ni-dashlite' },
    { name: 'Users', href: '/dashboard/users', icon: 'ni ni-users' },
    { name: 'Customers', href: '/dashboard/customer', icon: 'ni ni-building' },
    { name: 'Invoices', href: '/invoices', icon: 'ni ni-file-docs' },
    { name: 'Products', href: '/products', icon: 'ni ni-package' },
    { name: 'Reports', href: '/reports', icon: 'ni ni-growth' },
    { name: 'Settings', href: '/settings', icon: 'ni ni-setting' }
  ];

  return (
    <div className="nk-sidebar nk-sidebar-fixed is-dark" data-content="sidebarMenu">
      <div className="nk-sidebar-element nk-sidebar-head">
        <div className="nk-sidebar-brand">
          <Link href="/dashboard" className="logo-link nk-sidebar-logo">
            <img className="logo-light logo-img" src="/images/logo2x.png" alt="logo" />
            <img className="logo-dark logo-img" src="/images/logo-dark.png" alt="logo-dark" />
            {/* <span className="nio-version">SliqInvoice</span> */}
          </Link>
        </div>
        <div className="nk-menu-trigger mr-n2">
          <a href="#" className="nk-nav-toggle nk-quick-nav-icon d-xl-none" data-target="sidebarMenu">
            <em className="icon ni ni-arrow-left"></em>
          </a>
        </div>
      </div>
      
      <div className="nk-sidebar-element">
        <div className="nk-sidebar-content">
          <div className="nk-sidebar-menu" data-simplebar>
            <ul className="nk-menu">
              <li className="nk-menu-heading">
                <h6 className="overline-title text-primary-alt">Invoice Management</h6>
              </li>
              {navigation.map((item) => (
                <li key={item.name} className="nk-menu-item">
                  <Link 
                    href={item.href} 
                    className={`nk-menu-link ${pathname === item.href ? 'active' : ''}`}
                  >
                    <span className="nk-menu-icon">
                      <em className={`icon ${item.icon}`}></em>
                    </span>
                    <span className="nk-menu-text">{item.name}</span>
                  </Link>
                </li>
              ))}
              
              <li className="nk-menu-heading">
                <h6 className="overline-title text-primary-alt">Business Tools</h6>
              </li>
              <li className="nk-menu-item">
                <Link href="/analytics" className="nk-menu-link">
                  <span className="nk-menu-icon">
                    <em className="icon ni ni-analytics"></em>
                  </span>
                  <span className="nk-menu-text">Analytics</span>
                </Link>
              </li>
              <li className="nk-menu-item">
                <Link href="/transactions" className="nk-menu-link">
                  <span className="nk-menu-icon">
                    <em className="icon ni ni-tranx"></em>
                  </span>
                  <span className="nk-menu-text">Transactions</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 