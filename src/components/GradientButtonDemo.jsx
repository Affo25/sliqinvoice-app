'use client';
import { useState } from 'react';
import Button from './ui/button';

// Complete demo showing gradient button in action
export default function GradientButtonDemo() {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert('Form submitted successfully!');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            SliqInvoice Dashboard
          </h1>
          <p className="text-gray-600 mb-8">
            Enhanced with beautiful gradient buttons
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="gradient" size="lg" className="gap-2">
              <em className="icon ni ni-dashboard"></em>
              Dashboard
            </Button>
            <Button variant="gradient-blue" size="lg" className="gap-2">
              <em className="icon ni ni-reports"></em>
              Reports
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Card 1: User Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">User Management</h2>
            <p className="text-gray-600 mb-6">Manage users and permissions</p>
            <div className="space-y-3">
              <Button variant="gradient" className="w-full gap-2">
                <em className="icon ni ni-user-add"></em>
                Add User
              </Button>
              <Button variant="gradient-blue" className="w-full gap-2">
                <em className="icon ni ni-users"></em>
                View Users
              </Button>
              <Button variant="gradient-purple" className="w-full gap-2">
                <em className="icon ni ni-lock"></em>
                Permissions
              </Button>
            </div>
          </div>

          {/* Card 2: Invoice Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Invoice Management</h2>
            <p className="text-gray-600 mb-6">Create and manage invoices</p>
            <div className="space-y-3">
              <Button variant="gradient" className="w-full gap-2">
                <em className="icon ni ni-file-plus"></em>
                New Invoice
              </Button>
              <Button variant="gradient-blue" className="w-full gap-2">
                <em className="icon ni ni-file-text"></em>
                View Invoices
              </Button>
              <Button variant="gradient-orange" size="sm" className="w-full gap-2">
                <em className="icon ni ni-trash"></em>
                Delete Selected
              </Button>
            </div>
          </div>

          {/* Card 3: Settings */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Account Settings</h2>
            <p className="text-gray-600 mb-6">Configure your account</p>
            <div className="space-y-3">
              <Button variant="gradient-purple" className="w-full gap-2">
                <em className="icon ni ni-setting"></em>
                Settings
              </Button>
              <Button variant="gradient-blue" className="w-full gap-2">
                <em className="icon ni ni-user"></em>
                Profile
              </Button>
              <Button variant="outline" className="w-full gap-2">
                <em className="icon ni ni-signout"></em>
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Form Example */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left side - Form */}
            <div>
              <h3 className="text-lg font-medium mb-4">Create New Item</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name
                  </label>
                  <input 
                    type="text" 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter item name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Enter description"
                  />
                </div>
                <div className="flex gap-3">
                  <Button 
                    type="button"
                    variant="gradient" 
                    size="lg"
                    className="flex-1"
                    disabled={loading}
                    onClick={handleSubmit}
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <em className="icon ni ni-save mr-2"></em>
                        Save Item
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" 
                    size="lg"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>

            {/* Right side - Actions */}
            <div>
              <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="gradient" className="h-20 flex-col gap-1">
                  <em className="icon ni ni-growth text-xl"></em>
                  <span className="text-sm">Analytics</span>
                </Button>
                <Button variant="gradient-blue" className="h-20 flex-col gap-1">
                  <em className="icon ni ni-download text-xl"></em>
                  <span className="text-sm">Export</span>
                </Button>
                <Button variant="gradient-purple" className="h-20 flex-col gap-1">
                  <em className="icon ni ni-printer text-xl"></em>
                  <span className="text-sm">Print</span>
                </Button>
                <Button variant="gradient-orange" className="h-20 flex-col gap-1">
                  <em className="icon ni ni-alert-circle text-xl"></em>
                  <span className="text-sm">Alerts</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="gradient" size="lg" className="gap-2">
              <em className="icon ni ni-plus"></em>
              Add Transaction
            </Button>
            <Button variant="gradient-blue" size="lg" className="gap-2">
              <em className="icon ni ni-edit"></em>
              Edit Selected
            </Button>
            <Button variant="gradient-purple" size="lg" className="gap-2">
              <em className="icon ni ni-archive"></em>
              Archive
            </Button>
            <Button variant="gradient-orange" size="lg" className="gap-2" onClick={() => setShowModal(true)}>
              <em className="icon ni ni-trash"></em>
              Delete
            </Button>
          </div>
        </div>

        {/* Modal Example */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this item? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="gradient-orange" 
                  onClick={() => {
                    setShowModal(false);
                    alert('Item deleted!');
                  }}
                  className="gap-2"
                >
                  <em className="icon ni ni-trash"></em>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}