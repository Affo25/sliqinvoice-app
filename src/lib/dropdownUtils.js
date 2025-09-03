// Utility functions for dropdown and toggle functionality

let isInitialized = false;
let dropdownHandler = null;
let toggleHandler = null;
let preventCloseHandler = null;
let sidebarMenuHandler = null;

// Initialize dropdown functionality
export const initializeDropdowns = () => {
  // Prevent multiple initializations
  if (isInitialized) {
    return;
  }

  // Dropdown toggle handler
  dropdownHandler = (e) => {
    const dropdownToggle = e.target.closest('[data-bs-toggle="dropdown"]');
    
    if (dropdownToggle) {
      e.preventDefault();
      e.stopPropagation();
      
      const dropdown = dropdownToggle.nextElementSibling;
      
      // Close all other dropdowns first
      document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
        if (menu !== dropdown) {
          menu.classList.remove('show');
        }
      });
      
      // Toggle current dropdown
      if (dropdown && dropdown.classList.contains('dropdown-menu')) {
        const isOpening = !dropdown.classList.contains('show');
        dropdown.classList.toggle('show');
        
        // Update parent dropdown container state
        const dropdownContainer = dropdownToggle.closest('.dropdown');
        if (dropdownContainer) {
          dropdownContainer.classList.toggle('show', isOpening);
        }
        
        // Position dropdown if needed
        if (isOpening) {
          const rect = dropdownToggle.getBoundingClientRect();
          const dropdownRect = dropdown.getBoundingClientRect();
          
          // Adjust position if dropdown goes off screen
          if (rect.right + dropdownRect.width > window.innerWidth) {
            dropdown.style.left = 'auto';
            dropdown.style.right = '0';
          }
        }
      }
    } else {
      // Close dropdowns when clicking outside
      const isDropdownContent = e.target.closest('.dropdown-menu');
      const isToggleButton = e.target.closest('[data-target]');
      
      if (!isDropdownContent && !isToggleButton) {
        document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
          menu.classList.remove('show');
          // Remove active state from parent dropdown
          const dropdownContainer = menu.closest('.dropdown');
          if (dropdownContainer) {
            dropdownContainer.classList.remove('show');
          }
        });
        document.querySelectorAll('.toggle-content.show').forEach(content => {
          content.classList.remove('show');
        });
      }
    }
  };

  // Toggle functionality handler
  toggleHandler = (e) => {
    const toggleBtn = e.target.closest('[data-target]');
    
    if (toggleBtn) {
      e.preventDefault();
      e.stopPropagation();
      
      const targetSelector = toggleBtn.getAttribute('data-target');
      const targetElements = document.querySelectorAll(`[data-content="${targetSelector}"]`);
      
      targetElements.forEach(element => {
        element.classList.toggle('show');
      });
    }
  };

  // Prevent dropdown from closing when clicking inside
  preventCloseHandler = (e) => {
    const dropdownMenu = e.target.closest('.dropdown-menu');
    if (dropdownMenu && !e.target.closest('a[href="#"], button')) {
      e.stopPropagation();
    }
  };

  // Sidebar menu toggle handler for NioLand theme
  sidebarMenuHandler = (e) => {
    const menuToggle = e.target.closest('.nk-menu-toggle');
    
    if (menuToggle) {
      e.preventDefault();
      e.stopPropagation();
      
      const menuItem = menuToggle.closest('.nk-menu-item');
      const submenu = menuItem?.querySelector('.nk-menu-sub');
      
      if (submenu) {
        // Check if menu is currently active
        const isActive = menuItem.classList.contains('active');
        
        // Close all other open submenus
        document.querySelectorAll('.nk-menu-item.active').forEach(item => {
          if (item !== menuItem) {
            item.classList.remove('active');
            const otherSubmenu = item.querySelector('.nk-menu-sub');
            if (otherSubmenu) {
              otherSubmenu.style.display = 'none';
            }
          }
        });
        
        // Toggle current submenu
        if (isActive) {
          menuItem.classList.remove('active');
          submenu.style.display = 'none';
        } else {
          menuItem.classList.add('active');
          submenu.style.display = 'block';
        }
        
        console.log(`🔄 Sidebar menu toggled: ${isActive ? 'closed' : 'opened'}`);
      }
    }
  };

  // Add event listeners
  document.addEventListener('click', dropdownHandler, true);
  document.addEventListener('click', toggleHandler, true);
  document.addEventListener('click', preventCloseHandler, true);
  document.addEventListener('click', sidebarMenuHandler, true);
  
  isInitialized = true;
  console.log('✅ Dropdown functionality initialized');
};

// Clean up dropdown functionality
export const cleanupDropdowns = () => {
  if (!isInitialized) {
    return;
  }

  // Remove event listeners
  if (dropdownHandler) {
    document.removeEventListener('click', dropdownHandler, true);
    dropdownHandler = null;
  }
  
  if (toggleHandler) {
    document.removeEventListener('click', toggleHandler, true);
    toggleHandler = null;
  }
  
  if (preventCloseHandler) {
    document.removeEventListener('click', preventCloseHandler, true);
    preventCloseHandler = null;
  }

  if (sidebarMenuHandler) {
    document.removeEventListener('click', sidebarMenuHandler, true);
    sidebarMenuHandler = null;
  }

  // Close all open dropdowns and toggles
  document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
    menu.classList.remove('show');
    // Remove active state from parent dropdown
    const dropdownContainer = menu.closest('.dropdown');
    if (dropdownContainer) {
      dropdownContainer.classList.remove('show');
    }
  });
  
  document.querySelectorAll('.toggle-content.show').forEach(content => {
    content.classList.remove('show');
  });

  // Close sidebar menus
  document.querySelectorAll('.nk-menu-item.active').forEach(item => {
    item.classList.remove('active');
    const submenu = item.querySelector('.nk-menu-sub');
    if (submenu) {
      submenu.style.display = 'none';
    }
  });
  
  isInitialized = false;
  console.log('🧹 Dropdown functionality cleaned up');
};

// Force close dropdown by selector
export const closeDropdown = (selector) => {
  const dropdown = document.querySelector(selector);
  if (dropdown) {
    dropdown.classList.remove('show');
    // Remove active state from parent dropdown
    const dropdownContainer = dropdown.closest('.dropdown');
    if (dropdownContainer) {
      dropdownContainer.classList.remove('show');
    }
    console.log(`🔒 Manually closed dropdown: ${selector}`);
  } else {
    console.warn(`⚠️ Dropdown not found: ${selector}`);
  }
};

// Close all dropdowns
export const closeAllDropdowns = () => {
  document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
    menu.classList.remove('show');
    // Remove active state from parent dropdown
    const dropdownContainer = menu.closest('.dropdown');
    if (dropdownContainer) {
      dropdownContainer.classList.remove('show');
    }
  });
  document.querySelectorAll('.toggle-content.show').forEach(content => {
    content.classList.remove('show');
  });
  
  // Close sidebar menus
  document.querySelectorAll('.nk-menu-item.active').forEach(item => {
    item.classList.remove('active');
    const submenu = item.querySelector('.nk-menu-sub');
    if (submenu) {
      submenu.style.display = 'none';
    }
  });
  
  console.log('🔒 All dropdowns closed');
};

// Initialize only sidebar menu functionality (for dynamic content)
export const initializeSidebarMenus = () => {
  // Remove any existing sidebar menu handlers to avoid duplicates
  document.querySelectorAll('.nk-menu-toggle').forEach(toggle => {
    const newToggle = toggle.cloneNode(true);
    toggle.parentNode.replaceChild(newToggle, toggle);
  });

  // Add fresh event listeners to all menu toggles
  document.querySelectorAll('.nk-menu-toggle').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const menuItem = toggle.closest('.nk-menu-item');
      const submenu = menuItem?.querySelector('.nk-menu-sub');
      
      if (submenu) {
        // Check if menu is currently active
        const isActive = menuItem.classList.contains('active');
        
        // Close all other open submenus
        document.querySelectorAll('.nk-menu-item.active').forEach(item => {
          if (item !== menuItem) {
            item.classList.remove('active');
            const otherSubmenu = item.querySelector('.nk-menu-sub');
            if (otherSubmenu) {
              otherSubmenu.style.display = 'none';
            }
          }
        });
        
        // Toggle current submenu
        if (isActive) {
          menuItem.classList.remove('active');
          submenu.style.display = 'none';
        } else {
          menuItem.classList.add('active');
          submenu.style.display = 'block';
        }
        
        console.log(`🔄 Sidebar menu toggled: ${isActive ? 'closed' : 'opened'}`);
      }
    });
  });

  console.log('✅ Sidebar menu functionality initialized');
};

// Debug function to check dropdown state
export const debugDropdowns = () => {
  const openDropdowns = document.querySelectorAll('.dropdown-menu.show');
  const openToggles = document.querySelectorAll('.toggle-content.show');
  const openSidebarMenus = document.querySelectorAll('.nk-menu-item.active');
  
  console.log('🔍 Dropdown Debug Info:', {
    initialized: isInitialized,
    openDropdowns: openDropdowns.length,
    openToggles: openToggles.length,
    openSidebarMenus: openSidebarMenus.length,
    dropdownElements: Array.from(openDropdowns).map(el => el.className),
    toggleElements: Array.from(openToggles).map(el => el.className),
    sidebarMenuElements: Array.from(openSidebarMenus).map(el => ({
      classes: el.className,
      text: el.querySelector('.nk-menu-text')?.textContent
    }))
  });
  
  return {
    initialized: isInitialized,
    openDropdowns: openDropdowns.length,
    openToggles: openToggles.length,
    openSidebarMenus: openSidebarMenus.length
  };
};