'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { initializeSidebarMenus } from '../lib/dropdownUtils';

export default function Sidebar() {
  const pathname = usePathname();
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  
  const navigation = [
    
    { name: 'Users', href: '/dashboard/users', icon: 'ni ni-users' },
    { name: 'Customers', href: '/dashboard/customer', icon: 'ni ni-building' },
    { name: 'Modules', href: '/dashboard/modules', icon: 'ni ni-file' },
    { name: 'Invoices', href: '/invoices', icon: 'ni ni-file-docs' },
    { name: 'Products', href: '/products', icon: 'ni ni-package' },
    { name: 'Reports', href: '/reports', icon: 'ni ni-growth' },
    { name: 'Settings', href: '/settings', icon: 'ni ni-setting' },
    { name: 'Dashboard', href: '/dashboard', icon: 'ni ni-dashlite' },
    { 
      name: 'Accounts', 
      href: '/dashboard/accounts', 
      icon: 'ni ni-wallet-alt',
      hasSubMenu: true,
      subMenus: [
        { name: 'All Accounts', href: '/dashboard/accounts', icon: 'ni ni-wallet' },
        { name: 'Categories', href: '/dashboard/categories', icon: 'ni ni-folder-list' },
      ]
    },
  ];

  // Fetch accounts for dynamic menu using Redux would be ideal,
  // but since this is a shared component, we'll keep the direct API call for simplicity
  useEffect(() => {
    const fetchAccounts = async () => {
      setLoadingAccounts(true);
      try {
        const response = await fetch('/api/accounts?status=active&limit=50');
        const data = await response.json();
        
        if (data.success) {
          setAccounts(data.accounts);
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
      } finally {
        setLoadingAccounts(false);
      }
    };

    fetchAccounts();
  }, []);

  // Initialize sidebar menu functionality on mount
  useEffect(() => {
    // Initialize immediately for static menu items
    initializeSidebarMenus();
  }, []);

  // Re-initialize sidebar menu functionality after accounts are loaded
  useEffect(() => {
    if (accounts.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        initializeSidebarMenus();
      }, 100);
    }
  }, [accounts]);

  return (
    <div className="nk-sidebar nk-sidebar-fixed is-light bg-white" data-content="sidebarMenu">
      <div className="nk-sidebar-element nk-sidebar-head">
        <div className="nk-sidebar-brand">
          <Link href="/dashboard" className="logo-link nk-sidebar-logo">
            <Image width={150} height={48} className="logo-light logo-img" src="/images/main-logo.png" alt="logo" />
            <Image width={150} height={48} className="logo-dark logo-img" src="/images/main-logo.png" alt="logo-dark" />
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
                <h6 className="overline-title text-primary-alt">Main Navigation</h6>
              </li>
              {navigation.map((item) => (
                <li key={item.name} className={`nk-menu-item ${item.hasSubMenu ? 'has-sub' : ''}`}>
                  {item.hasSubMenu ? (
                    <>
                      <a href="#" className="nk-menu-link nk-menu-toggle">
                        <span className="nk-menu-icon">
                          <em className={`icon ${item.icon}`}></em>
                        </span>
                        <span className="nk-menu-text">{item.name}</span>
                      </a>
                      <ul className="nk-menu-sub">
                        {item.subMenus.map((subItem) => (
                          <li key={subItem.name} className="nk-menu-item">
                            <Link
                              href={subItem.href}
                              className={`nk-menu-link ${pathname === subItem.href ||
                                  (subItem.href.includes("?") &&
                                    pathname === subItem.href.split("?")[0])
                                  ? "active bg-white text-dark"
                                  : ""
                                }`}
                            >
                              <span className="nk-menu-icon">
                                <em className={`icon ${subItem.icon}`}></em>
                              </span>
                               <span className="nk-menu-text">{subItem.name}</span>
                              {/* <span style={{fontSize:"10px solid", fontWeight:"bold"}} className="nk-menu-text ">{subItem.name}</span> */}
                            </Link>
                          </li>
                        ))}
                      </ul>

                    </>
                  ) : (
                    <Link 
                      href={item.href} 
                      className={`nk-menu-link ${pathname === item.href ? 'active' : ''}`}
                    >
                      <span className="nk-menu-icon">
                        <em className={`icon ${item.icon}`}></em>
                      </span>
                      <span className="nk-menu-text">{item.name}</span>
                    </Link>
                  )}
                </li>
              ))}

              {/* Recent Accounts Section */}
              <li className="nk-menu-heading">
                <h6 className="overline-title text-primary-alt">Recent Accounts</h6>
              </li>
              {loadingAccounts ? (
                <li className="nk-menu-item">
                  <span className="nk-menu-link">
                    <span className="nk-menu-icon">
                      <em className="icon ni ni-loader"></em>
                    </span>
                    <span className="nk-menu-text text-soft">Loading...</span>
                  </span>
                </li>
              ) : accounts.length > 0 ? (
                accounts.slice(0, 5).map((account) => (
                  <li key={account.id} className="nk-menu-item">
                    <Link 
                      href={`/dashboard/accounts/${account.id}`}
                      className={`nk-menu-link ${pathname === `/dashboard/accounts/${account.id}` ? 'active' : ''}`}
                    >
                      <span className="nk-menu-icon">
                        <em className={`icon ${
                          account.type === 'Income' ? 'ni ni-trend-up' : 
                          account.type === 'Expense' ? 'ni ni-trend-down' : 
                          account.type === 'Asset' ? 'ni ni-coins' :
                          account.type === 'Liability' ? 'ni ni-credit-card' : 'ni ni-pie'
                        }`}></em>
                      </span>
                      <span className="nk-menu-text">{account.name}</span>
                      <span className={`badge badge-sm ml-auto ${
                        account.type === 'Income' ? 'badge-success' : 
                        account.type === 'Expense' ? 'badge-danger' : 
                        account.type === 'Asset' ? 'badge-info' :
                        account.type === 'Liability' ? 'badge-warning' : 'badge-secondary'
                      }`}>
                        {account.type.charAt(0)}
                      </span>
                    </Link>
                  </li>
                ))
              ) : (
                <li className="nk-menu-item">
                  <span className="nk-menu-link">
                    <span className="nk-menu-icon">
                      <em className="icon ni ni-info"></em>
                    </span>
                    <span className="nk-menu-text text-soft">No accounts yet</span>
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 