// Utility functions for dropdown and toggle functionality

let isInitialized = false;
let dropdownHandler = null;
let toggleHandler = null;
let preventCloseHandler = null;

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

  // Add event listeners
  document.addEventListener('click', dropdownHandler, true);
  document.addEventListener('click', toggleHandler, true);
  document.addEventListener('click', preventCloseHandler, true);
  
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
  console.log('🔒 All dropdowns closed');
};

// Debug function to check dropdown state
export const debugDropdowns = () => {
  const openDropdowns = document.querySelectorAll('.dropdown-menu.show');
  const openToggles = document.querySelectorAll('.toggle-content.show');
  
  console.log('🔍 Dropdown Debug Info:', {
    initialized: isInitialized,
    openDropdowns: openDropdowns.length,
    openToggles: openToggles.length,
    dropdownElements: Array.from(openDropdowns).map(el => el.className),
    toggleElements: Array.from(openToggles).map(el => el.className)
  });
  
  return {
    initialized: isInitialized,
    openDropdowns: openDropdowns.length,
    openToggles: openToggles.length
  };
};