// Customer-specific action components
import React from 'react';
import { 
  TableActionMenu, 
  EditActionButton, 
  DeleteActionButton, 
  ActionButton, 
  ActionDivider 
} from './ActionButtons';
import { useSweetAlert } from './SweetAlerts';

// Complete customer action menu for table rows
export const CustomerActionMenu = ({ 
  customer, 
  onEdit, 
  onDelete, 
  showViewDetails = true,
  showSuspend = true 
}) => {
  const { confirmUserDelete, handleDeleteSuccess, handleDeleteError } = useSweetAlert();

  const handleDelete = async () => {
    try {
      const result = await confirmUserDelete(customer.company_name);
      
      if (result.isConfirmed) {
        await onDelete(customer._id || customer.id);
        handleDeleteSuccess(customer.company_name);
      }
    } catch (error) {
      handleDeleteError(customer.company_name, error.message || error);
    }
  };

  return (
    <TableActionMenu>
      <EditActionButton 
        onClick={() => onEdit && onEdit(customer)}
        label="Edit Customer"
      />
      
      <DeleteActionButton 
        onClick={handleDelete}
        label="Delete Customer"
      />
      
      {(showViewDetails || showSuspend) && <ActionDivider />}
      
      {showViewDetails && (
        <ActionButton 
          icon="ni-eye" 
          label="View Details"
          onClick={() => {
            // TODO: Implement view details functionality
            console.log('View details for customer ID:', customer._id || customer.id);
          }}
        />
      )}
      
      {showSuspend && (
        <ActionButton 
          icon="ni-na" 
          label={customer.subscription_status === 'active' ? "Suspend Customer" : "Activate Customer"}
          className={customer.subscription_status === 'active' ? "text-warning" : "text-success"}
          onClick={() => {
            // TODO: Implement suspend/activate functionality
            console.log('Toggle suspend for customer ID:', customer._id || customer.id);
          }}
        />
      )}
    </TableActionMenu>
  );
};

// Bulk customer actions component
export const BulkCustomerActions = ({ 
  selectedCustomers, 
  onBulkDelete, 
  isProcessing = false,
  onClearSelection 
}) => {
  const { 
    confirmBulkUserDelete, 
    handleBulkDeleteSuccess, 
    handleBulkDeleteError 
  } = useSweetAlert();

  const handleBulkDelete = async () => {
    if (selectedCustomers.length === 0) return;

    try {
      const result = await confirmBulkUserDelete(selectedCustomers.length);
      
      if (result.isConfirmed) {
        await onBulkDelete(selectedCustomers);
        handleBulkDeleteSuccess(selectedCustomers.length);
        onClearSelection && onClearSelection();
      }
    } catch (error) {
      handleBulkDeleteError(error.message || error);
    }
  };

  if (selectedCustomers.length === 0) return null;

  return (
    <div className="bulk-action-bar bg-light p-3 rounded mb-3">
      <div className="d-flex align-items-center justify-content-between">
        <span className="text-muted">
          <strong>{selectedCustomers.length}</strong> customer(s) selected
        </span>
        <div className="bulk-actions">
          <button 
            className="btn btn-danger btn-sm mr-2"
            onClick={handleBulkDelete}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="spinner-border spinner-border-sm mr-1"></span>
                Deleting...
              </>
            ) : (
              <>
                <em className="icon ni ni-trash mr-1"></em>
                Delete ({selectedCustomers.length})
              </>
            )}
          </button>
          
          <button 
            className="btn btn-outline-secondary btn-sm"
            onClick={onClearSelection}
            disabled={isProcessing}
          >
            Clear Selection
          </button>
        </div>
      </div>
    </div>
  );
};

// Customer form actions (for modals)
export const CustomerFormActions = ({ 
  isSubmitting, 
  onCancel, 
  submitText = 'Save Customer',
  submitLoadingText = 'Saving Customer...',
  isEdit = false 
}) => {
  return (
    <div className="col-12 pt-3">
      <div className="form-group">
        <button 
          type="submit" 
          className="btn btn-lg btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <span className="ml-2">{submitLoadingText}</span>
            </>
          ) : (
            <>
              <em className={`icon ni ${isEdit ? 'ni-save' : 'ni-building'}`}></em>
              <span>{submitText}</span>
            </>
          )}
        </button>
        
        <button 
          type="button" 
          className="btn btn-outline-light ml-3" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CustomerActionMenu;