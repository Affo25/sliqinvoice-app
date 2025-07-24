// Toast notification utility for DashLite theme
export const showToast = (message, type = 'info', options = {}) => {
  if (typeof window === 'undefined') return;
  
  // Check if NioApp toast is available
  if (typeof window.NioApp !== 'undefined' && window.NioApp.Toast) {
    const config = {
      position: 'top-right',
      ...options
    };
    
    window.NioApp.Toast(message, type, config);
  } else if (typeof window.showToast === 'function') {
    // Use global showToast function from layout
    window.showToast(message, type, options);
  } else {
    // Fallback - create simple toast notification
    console.log('Toast:', type.toUpperCase(), message);
    
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? '#28a745' : 
                   type === 'error' ? '#dc3545' : 
                   type === 'warning' ? '#ffc107' : '#17a2b8';
    
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${bgColor};
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      z-index: 9999;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-family: Arial, sans-serif;
      font-size: 14px;
      line-height: 1.4;
    `;
    
    toast.innerHTML = message;
    document.body.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 5000);
    
    // Click to dismiss
    toast.addEventListener('click', () => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    });
  }
};

export default showToast;