'use client';
import { Button } from './button';

// This is a comprehensive example component showing how to use the gradient button
// You can use this as reference throughout your project
export default function GradientButtonExamples() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">Gradient Button Examples</h1>
      
      {/* Basic Gradient Buttons */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Basic Gradient Variants</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="gradient" size="default">
            Primary Gradient
          </Button>
          <Button variant="gradient-purple" size="default">
            Purple Gradient
          </Button>
          <Button variant="gradient-blue" size="default">
            Blue Gradient
          </Button>
          <Button variant="gradient-orange" size="default">
            Orange Gradient
          </Button>
        </div>
      </section>

      {/* Different Sizes */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Different Sizes</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="gradient" size="sm">
            Small
          </Button>
          <Button variant="gradient" size="default">
            Default
          </Button>
          <Button variant="gradient" size="lg">
            Large
          </Button>
          <Button variant="gradient" size="xl">
            Extra Large
          </Button>
        </div>
      </section>

      {/* With Icons */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">With Icons</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="gradient" size="default" className="gap-2">
            <em className="icon ni ni-plus"></em>
            Add New
          </Button>
          <Button variant="gradient-blue" size="default" className="gap-2">
            <em className="icon ni ni-edit"></em>
            Edit
          </Button>
          <Button variant="gradient-orange" size="default" className="gap-2">
            <em className="icon ni ni-trash"></em>
            Delete
          </Button>
          <Button variant="gradient-purple" size="default" className="gap-2">
            <em className="icon ni ni-download"></em>
            Download
          </Button>
        </div>
      </section>

      {/* Loading States */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Loading States</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="gradient" size="default" disabled>
            <span className="animate-spin mr-2">⏳</span>
            Loading...
          </Button>
          <Button variant="gradient-blue" size="default" disabled>
            <span className="animate-spin mr-2">🔄</span>
            Processing...
          </Button>
        </div>
      </section>

      {/* Full Width Buttons */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Full Width Buttons</h2>
        <div className="space-y-4 max-w-md">
          <Button variant="gradient" size="lg" className="w-full">
            Sign In
          </Button>
          <Button variant="gradient-purple" size="lg" className="w-full">
            Create Account
          </Button>
        </div>
      </section>

      {/* Form Usage Example */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Form Usage Example</h2>
        <form className="max-w-md space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input 
              type="email" 
              className="w-full p-2 border rounded-md" 
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input 
              type="password" 
              className="w-full p-2 border rounded-md" 
              placeholder="Enter your password"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="gradient" size="lg" className="flex-1">
              Submit
            </Button>
            <Button type="button" variant="outline" size="lg" className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </section>

      {/* Action Buttons */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Action Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button 
            variant="gradient" 
            onClick={() => alert('Save clicked!')}
            className="gap-2"
          >
            <em className="icon ni ni-save"></em>
            Save Changes
          </Button>
          <Button 
            variant="gradient-blue" 
            onClick={() => alert('Export clicked!')}
            className="gap-2"
          >
            <em className="icon ni ni-file-export"></em>
            Export Data
          </Button>
          <Button 
            variant="gradient-purple" 
            onClick={() => alert('Print clicked!')}
            className="gap-2"
          >
            <em className="icon ni ni-printer"></em>
            Print Report
          </Button>
        </div>
      </section>
    </div>
  );
}

// Usage Examples for different pages:

/* 
// 1. LOGIN PAGE USAGE:
import { Button } from '../../components/ui/button';

<Button 
  type="submit" 
  variant="gradient" 
  size="lg" 
  className="w-full"
  disabled={loading}
>
  {loading ? 'Signing in...' : 'Sign in'}
</Button>

// 2. DASHBOARD ACTIONS:
<Button 
  onClick={() => handleAddNew()}
  variant="gradient"
  className="gap-2"
>
  <em className="icon ni ni-plus"></em>
  Add New Item
</Button>

// 3. FORM SUBMISSIONS:
<Button 
  type="submit" 
  variant="gradient-blue" 
  size="lg"
  disabled={isSubmitting}
>
  {isSubmitting ? 'Saving...' : 'Save Changes'}
</Button>

// 4. DELETE ACTIONS:
<Button 
  onClick={() => handleDelete()}
  variant="gradient-orange"
  size="sm"
  className="gap-1"
>
  <em className="icon ni ni-trash"></em>
  Delete
</Button>

// 5. NAVIGATION BUTTONS:
<Button 
  onClick={() => router.push('/dashboard')}
  variant="gradient-purple"
>
  Go to Dashboard
</Button>

// 6. MODAL ACTIONS:
<div className="flex gap-2 justify-end">
  <Button variant="outline" onClick={onCancel}>
    Cancel
  </Button>
  <Button variant="gradient" onClick={onConfirm}>
    Confirm
  </Button>
</div>
*/