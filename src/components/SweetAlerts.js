// SweetAlert utility components for consistent UI
import { showToast } from '../lib/toast';

export class SweetAlerts {
  
  // Delete confirmation popup
  static async confirmDelete(title, message, confirmText = 'Yes, Delete') {
    if (typeof window !== 'undefined' && window.Swal) {
      return await window.Swal.fire({
        title: title,
        text: message,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e85347',
        cancelButtonColor: '#6c7293',
        confirmButtonText: confirmText,
        cancelButtonText: 'Cancel',
        reverseButtons: true
      });
    } else {
      // Fallback to browser confirm
      return { isConfirmed: confirm(message) };
    }
  }

  // Bulk delete confirmation popup
  static async confirmBulkDelete(count, itemType = 'items') {
    if (typeof window !== 'undefined' && window.Swal) {
      return await window.Swal.fire({
        title: `Delete Multiple ${itemType}`,
        html: `
          <div class="text-center">
            <p>Are you sure you want to delete <strong>${count}</strong> selected ${itemType.toLowerCase()}?</p>
            <p class="text-danger"><small>This action cannot be undone!</small></p>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e85347',
        cancelButtonColor: '#6c7293',
        confirmButtonText: `Yes, Delete ${count} ${itemType}`,
        cancelButtonText: 'Cancel',
        reverseButtons: true
      });
    } else {
      // Fallback to browser confirm
      return { isConfirmed: confirm(`Are you sure you want to delete ${count} ${itemType.toLowerCase()}?`) };
    }
  }

  // Success alert
  static showSuccess(title, message, timer = 2000) {
    if (typeof window !== 'undefined' && window.Swal) {
      window.Swal.fire({
        title: title,
        text: message,
        icon: 'success',
        timer: timer,
        showConfirmButton: false
      });
    }
  }

  // Error alert
  static showError(title, message) {
    if (typeof window !== 'undefined' && window.Swal) {
      window.Swal.fire({
        title: title,
        text: message,
        icon: 'error'
      });
    }
  }

  // Generic confirmation popup
  static async confirm(options) {
    const defaultOptions = {
      title: 'Are you sure?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e85347',
      cancelButtonColor: '#6c7293',
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    };

    const finalOptions = { ...defaultOptions, ...options };

    if (typeof window !== 'undefined' && window.Swal) {
      return await window.Swal.fire(finalOptions);
    } else {
      // Fallback to browser confirm
      return { isConfirmed: confirm(finalOptions.text) };
    }
  }

  // Loading popup
  static showLoading(title = 'Processing...', text = 'Please wait') {
    if (typeof window !== 'undefined' && window.Swal) {
      window.Swal.fire({
        title: title,
        text: text,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          window.Swal.showLoading();
        }
      });
    }
  }

  // Close any open popup
  static close() {
    if (typeof window !== 'undefined' && window.Swal) {
      window.Swal.close();
    }
  }
}

// Hook for using SweetAlerts in components
export const useSweetAlert = () => {
  
  const confirmUserDelete = async (userName) => {
    return await SweetAlerts.confirmDelete(
      'Delete User',
      `Are you sure you want to delete ${userName}? This action cannot be undone!`,
      'Yes, Delete User'
    );
  };

  const confirmBulkUserDelete = async (count) => {
    return await SweetAlerts.confirmBulkDelete(count, 'Users');
  };

  const handleDeleteSuccess = (userName) => {
    showToast('<h5>User Deleted!</h5><p>User has been successfully removed from the system.</p>', 'success');
    SweetAlerts.showSuccess('Deleted!', `${userName} has been deleted successfully.`);
  };

  const handleDeleteError = (userName, error) => {
    showToast(`Error deleting user: ${error}`, 'error');
    SweetAlerts.showError('Error!', `Failed to delete ${userName}. Please try again.`);
  };

  const handleBulkDeleteSuccess = (count) => {
    showToast(`<h5>Bulk Delete Completed!</h5><p>${count} users have been successfully deleted.</p>`, 'success');
    SweetAlerts.showSuccess('Deleted!', `${count} users have been deleted successfully.`);
  };

  const handleBulkDeleteError = (error) => {
    showToast(`Error deleting users: ${error}`, 'error');
    SweetAlerts.showError('Error!', 'Failed to delete selected users. Please try again.');
  };

  return {
    confirmUserDelete,
    confirmBulkUserDelete,
    handleDeleteSuccess,
    handleDeleteError,
    handleBulkDeleteSuccess,
    handleBulkDeleteError,
    SweetAlerts
  };
};

export default SweetAlerts;