# Loader Components Usage Guide

This guide shows how to use the various loader components in your sliqInvoice dashboard application.

## Components Created

1. **Loader** (Main overlay loader)
2. **InlineLoader** (Small inline spinner)
3. **PageLoader** (Top progress bar for page transitions)
4. **LoaderProvider** (Context provider for global loading states)
5. **useNavigationLoader** (Hook for navigation with loading states)

## 1. Main Overlay Loader

Use for full-screen loading overlays:

```jsx
import Loader from '../components/loader';

function MyComponent() {
  const [loading, setLoading] = useState(false);

  return (
    <div>
      {/* Your content */}
      <Loader 
        isVisible={loading} 
        message="Processing your request..." 
        type="overlay"
      />
    </div>
  );
}
```

## 2. Inline Loader

Use for buttons, cards, or inline loading states:

```jsx
import { InlineLoader } from '../components/loader';

function MyButton() {
  const [loading, setLoading] = useState(false);

  return (
    <button disabled={loading}>
      {loading ? (
        <>
          <InlineLoader size="sm" color="blue" />
          <span className="ml-2">Loading...</span>
        </>
      ) : (
        'Click Me'
      )}
    </button>
  );
}
```

Size options: `sm`, `md`, `lg`, `xl`
Color options: `blue`, `green`, `red`, `gray`

## 3. Page Loader

Use for top navigation bar progress indicator:

```jsx
import { PageLoader } from '../components/loader';

function Layout({ children }) {
  const [isPageLoading, setIsPageLoading] = useState(false);

  return (
    <div>
      <PageLoader isLoading={isPageLoading} />
      {children}
    </div>
  );
}
```

## 4. Global Loader Context

Use the LoaderProvider and useLoader hook for global loading states:

```jsx
// In your provider (already integrated in Providers.js)
import { LoaderProvider } from '../components/LoaderProvider';

function App({ children }) {
  return (
    <LoaderProvider>
      {children}
    </LoaderProvider>
  );
}

// In any component
import { useLoader } from '../components/LoaderProvider';

function MyComponent() {
  const { showLoader, hideLoader, showPageLoader, hidePageLoader } = useLoader();

  const handleSubmit = async () => {
    showLoader('Saving data...');
    try {
      await saveData();
    } finally {
      hideLoader();
    }
  };

  return <button onClick={handleSubmit}>Save</button>;
}
```

## 5. Navigation with Loading

Use the `useNavigationLoader` hook for navigation with loading states:

```jsx
import { useNavigationLoader } from '../lib/useNavigationLoader';

function NavigationComponent() {
  const { isLoading, navigateWithLoader } = useNavigationLoader();

  const handleNavigation = () => {
    // Navigates with automatic loading overlay
    navigateWithLoader('/dashboard/customers', { 
      minLoadTime: 300 // Minimum loading time for better UX
    });
  };

  return (
    <button 
      onClick={handleNavigation}
      disabled={isLoading}
    >
      {isLoading ? 'Navigating...' : 'Go to Customers'}
    </button>
  );
}
```

## 6. Form Submission with Loading

Example of form submission with loading states:

```jsx
function MyForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await submitForm();
      showToast('Success!', 'success');
    } catch (error) {
      showToast('Error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      
      <button 
        type="submit" 
        disabled={isSubmitting}
        className="btn btn-primary"
      >
        {isSubmitting ? (
          <>
            <InlineLoader size="sm" color="blue" />
            <span className="ml-2">Submitting...</span>
          </>
        ) : (
          'Submit'
        )}
      </button>
    </form>
  );
}
```

## 7. Data Loading in Tables

Example for table/list loading states:

```jsx
function DataTable({ data, loading }) {
  return (
    <div className="table-container">
      {loading ? (
        <div className="loading-state">
          <InlineLoader size="lg" color="blue" />
          <span className="ml-3">Loading data...</span>
        </div>
      ) : data.length === 0 ? (
        <div className="empty-state">No data found</div>
      ) : (
        <table>
          {/* Table content */}
        </table>
      )}
    </div>
  );
}
```

## 8. API Call Loading States

Example for API calls with different loading states:

```jsx
function ApiComponent() {
  const [fetchLoading, setFetchLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const { showLoader, hideLoader } = useLoader();

  const fetchData = async () => {
    setFetchLoading(true);
    try {
      const response = await api.getData();
      setData(response);
    } finally {
      setFetchLoading(false);
    }
  };

  const saveData = async () => {
    showLoader('Saving your changes...');
    try {
      await api.saveData(data);
      showToast('Saved successfully!', 'success');
    } catch (error) {
      showToast('Save failed', 'error');
    } finally {
      hideLoader();
    }
  };

  return (
    <div>
      <button onClick={fetchData} disabled={fetchLoading}>
        {fetchLoading ? <InlineLoader size="sm" /> : 'Refresh'}
      </button>
      
      <button onClick={saveData} disabled={saveLoading}>
        Save Changes
      </button>
    </div>
  );
}
```

## Best Practices

1. **Use appropriate loader types**:
   - Overlay loader for major operations (save, delete, bulk operations)
   - Inline loader for buttons and small components
   - Page loader for navigation between major sections

2. **Provide meaningful messages**:
   ```jsx
   showLoader('Processing payment...');
   showLoader('Generating report...');
   showLoader('Uploading files...');
   ```

3. **Set minimum loading times** for better UX:
   ```jsx
   navigateWithLoader('/path', { minLoadTime: 300 });
   ```

4. **Always handle loading cleanup**:
   ```jsx
   try {
     showLoader();
     await operation();
   } finally {
     hideLoader();
   }
   ```

5. **Use disabled states** on interactive elements during loading:
   ```jsx
   <button disabled={isLoading || isSubmitting}>
     {isLoading ? <InlineLoader /> : 'Submit'}
   </button>
   ```

This loader system provides a consistent and professional loading experience throughout your application!