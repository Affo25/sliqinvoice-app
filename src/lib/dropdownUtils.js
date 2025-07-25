// Utility functions for dropdown and toggle functionality

// Initialize dropdown functionality
export const initializeDropdowns = () => {
  // Handle dropdown toggles
  document.addEventListener('click', (e) => {
    const dropdownToggle = e.target.closest('[data-bs-toggle="dropdown"]');
    
    if (dropdownToggle) {
      e.preventDefault();
      const dropdown = dropdownToggle.nextElementSibling;
      
      // Close all other dropdowns
      document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
        if (menu !== dropdown) {
          menu.classList.remove('show');
        }
      });
      
      // Toggle current dropdown
      if (dropdown && dropdown.classList.contains('dropdown-menu')) {
        dropdown.classList.toggle('show');
      }
    } else {
      // Close dropdowns when clicking outside
      const isDropdownContent = e.target.closest('.dropdown-menu');
      if (!isDropdownContent) {
        document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
          menu.classList.remove('show');
        });
      }
    }
  });

  // Handle toggle functionality
  document.addEventListener('click', (e) => {
    const toggleBtn = e.target.closest('[data-target]');
    
    if (toggleBtn) {
      e.preventDefault();
      const targetSelector = toggleBtn.getAttribute('data-target');
      const targetElements = document.querySelectorAll(`[data-content="${targetSelector}"]`);
      
      targetElements.forEach(element => {
        element.classList.toggle('show');
      });
    }
  });

  // Prevent dropdown from closing when clicking inside
  document.addEventListener('click', (e) => {
    const dropdownMenu = e.target.closest('.dropdown-menu');
    if (dropdownMenu) {
      e.stopPropagation();
    }
  });
};

// Clean up dropdown functionality
export const cleanupDropdowns = () => {
  document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
    menu.classList.remove('show');
  });
  
  document.querySelectorAll('.toggle-content.show').forEach(content => {
    content.classList.remove('show');
  });
};

// Force close dropdown by selector
export const closeDropdown = (selector) => {
  const dropdown = document.querySelector(selector);
  if (dropdown) {
    dropdown.classList.remove('show');
  }
};

// Initialize on DOM load
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDropdowns);
  } else {
    initializeDropdowns();
  }
}