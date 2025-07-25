// Reusable action button components
import React from 'react';

// Table dropdown action menu
export const TableActionMenu = ({ children, className = '' }) => {
  return (
    <div className="nk-tb-col nk-tb-col-tools">
      <ul className="nk-tb-actions gx-1">
        <li>
          <div className="dropdown">
            <a href="#" className={`dropdown-toggle btn btn-icon btn-trigger ${className}`} data-bs-toggle="dropdown">
              <em className="icon ni ni-more-h"></em>
            </a>
            <div className="dropdown-menu dropdown-menu-right">
              <ul className="link-list-opt no-bdr">
                {children}
              </ul>
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
};

// Edit action button
export const EditActionButton = ({ onClick, label = 'Edit', icon = 'ni-edit' }) => {
  return (
    <li>
      <a href="#" onClick={(e) => {
        e.preventDefault();
        onClick && onClick();
      }}>
        <em className={`icon ni ${icon}`}></em>
        <span>{label}</span>
      </a>
    </li>
  );
};

// Delete action button
export const DeleteActionButton = ({ onClick, label = 'Delete', icon = 'ni-trash', className = 'text-danger' }) => {
  return (
    <li>
      <a href="#" className={className} onClick={(e) => {
        e.preventDefault();
        onClick && onClick();
      }}>
        <em className={`icon ni ${icon}`}></em>
        <span>{label}</span>
      </a>
    </li>
  );
};

// Generic action button
export const ActionButton = ({ onClick, label, icon, className = '', disabled = false }) => {
  return (
    <li>
      <a 
        href="#" 
        className={className} 
        onClick={(e) => {
          e.preventDefault();
          if (!disabled && onClick) onClick();
        }}
        style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}
      >
        <em className={`icon ni ${icon}`}></em>
        <span>{label}</span>
      </a>
    </li>
  );
};

// Divider for action menu
export const ActionDivider = () => {
  return <li className="divider"></li>;
};

// Form submit button with loading state
export const SubmitButton = ({ 
  isLoading = false, 
  loadingText = 'Processing...', 
  children, 
  className = 'btn btn-lg btn-primary',
  icon = 'ni-check',
  disabled = false,
  ...props 
}) => {
  return (
    <button 
      type="submit" 
      className={className}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          <span className="ml-2">{loadingText}</span>
        </>
      ) : (
        <>
          <em className={`icon ni ${icon}`}></em>
          <span>{children}</span>
        </>
      )}
    </button>
  );
};

// Cancel button
export const CancelButton = ({ 
  onClick, 
  children = 'Cancel', 
  className = 'btn btn-outline-light ml-3',
  disabled = false,
  ...props 
}) => {
  return (
    <button 
      type="button" 
      className={className}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Bulk action buttons container
export const BulkActionBar = ({ selectedCount, children, className = '' }) => {
  if (selectedCount === 0) return null;

  return (
    <div className={`bulk-action-bar bg-light p-3 rounded mb-3 ${className}`}>
      <div className="d-flex align-items-center justify-content-between">
        <span className="text-muted">
          <strong>{selectedCount}</strong> item(s) selected
        </span>
        <div className="bulk-actions">
          {children}
        </div>
      </div>
    </div>
  );
};

// Bulk delete button
export const BulkDeleteButton = ({ onClick, count, isLoading = false, className = 'btn btn-danger btn-sm' }) => {
  return (
    <button 
      className={className}
      onClick={onClick}
      disabled={isLoading || count === 0}
    >
      {isLoading ? (
        <>
          <span className="spinner-border spinner-border-sm mr-1"></span>
          Deleting...
        </>
      ) : (
        <>
          <em className="icon ni ni-trash mr-1"></em>
          Delete ({count})
        </>
      )}
    </button>
  );
};