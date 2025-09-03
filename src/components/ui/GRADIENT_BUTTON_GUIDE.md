# Gradient Button Usage Guide

This guide shows how to use the enhanced gradient button component throughout the SliqInvoice project.

## Import

```jsx
import { Button } from '../../components/ui/button';
```

## Available Gradient Variants

### 1. Primary Gradient (Default)
- **Variant**: `gradient`  
- **Colors**: Teal to Green `#26a69a → #43a047`
- **Usage**: Primary actions, login, main CTAs

```jsx
<Button variant="gradient">Primary Action</Button>
```

### 2. Purple Gradient
- **Variant**: `gradient-purple`
- **Colors**: Purple to Pink `purple-500 → pink-500`
- **Usage**: Secondary actions, creative features

```jsx
<Button variant="gradient-purple">Creative Action</Button>
```

### 3. Blue Gradient
- **Variant**: `gradient-blue`
- **Colors**: Blue to Cyan `blue-500 → cyan-500`
- **Usage**: Info actions, navigation, data operations

```jsx
<Button variant="gradient-blue">Info Action</Button>
```

### 4. Orange Gradient
- **Variant**: `gradient-orange`
- **Colors**: Orange to Red `orange-400 → red-500`
- **Usage**: Warning actions, delete, critical operations

```jsx
<Button variant="gradient-orange">Delete Action</Button>
```

## Available Sizes

- `sm` - Small (height: 36px)
- `default` - Default (height: 40px)  
- `lg` - Large (height: 44px)
- `xl` - Extra Large (height: 48px)
- `icon` - Icon only (40x40px)

## Interactive Features

All gradient buttons include:
- ✨ **Hover Effects**: Darker gradient + shadow + slight scale up (1.02x)
- 🎯 **Active States**: Scale down (0.98x) 
- ⚡ **Smooth Transitions**: 300ms duration with ease-in-out
- 🚫 **Disabled States**: Opacity 50% + pointer-events disabled

## Common Usage Patterns

### 1. Login/Auth Forms
```jsx
<Button 
  type="submit" 
  variant="gradient" 
  size="lg" 
  className="w-full"
  disabled={loading}
>
  {loading ? 'Signing in...' : 'Sign in'}
</Button>
```

### 2. Add New Items
```jsx
<Button 
  onClick={() => setShowModal(true)}
  variant="gradient"
  className="gap-2"
>
  <em className="icon ni ni-plus"></em>
  Add Transaction
</Button>
```

### 3. Form Submissions
```jsx
<Button 
  type="submit" 
  variant="gradient-blue" 
  size="lg"
  disabled={isSubmitting}
>
  {isSubmitting ? (
    <>
      <span className="animate-spin mr-2">⏳</span>
      Saving...
    </>
  ) : (
    'Save Changes'
  )}
</Button>
```

### 4. Delete Actions
```jsx
<Button 
  onClick={() => handleDelete(id)}
  variant="gradient-orange"
  size="sm"
  className="gap-1"
>
  <em className="icon ni ni-trash"></em>
  Delete
</Button>
```

### 5. Modal Actions
```jsx
<div className="flex gap-2 justify-end">
  <Button variant="outline" onClick={onCancel}>
    Cancel
  </Button>
  <Button variant="gradient" onClick={onConfirm}>
    Confirm
  </Button>
</div>
```

### 6. Navigation Buttons
```jsx
<Button 
  onClick={() => router.push('/dashboard')}
  variant="gradient-purple"
  className="gap-2"
>
  <em className="icon ni ni-arrow-left"></em>
  Back to Dashboard
</Button>
```

## Accessibility Features

- ✅ **Focus Visible**: Ring outline on keyboard focus
- ✅ **Disabled States**: Proper disabled styling and pointer events
- ✅ **Screen Reader**: Proper button semantics
- ✅ **Keyboard Navigation**: Works with Tab, Enter, Space

## Custom Styling

You can add custom classes using the `className` prop:

```jsx
<Button 
  variant="gradient" 
  className="w-full shadow-lg rounded-xl"
>
  Custom Styled
</Button>
```

## Integration with Existing Code

### Replace inline styles:
```jsx
// ❌ Old way (inline styles)
<button style={{
  backgroundImage: "linear-gradient(to right, #26a69a, #43a047)",
  color: "white",
  border: "none",
  fontWeight: "600"
}}>
  Button
</button>

// ✅ New way (component)
<Button variant="gradient">
  Button
</Button>
```

### Replace Bootstrap classes:
```jsx
// ❌ Old way
<button className="btn btn-primary btn-lg">
  Button  
</button>

// ✅ New way
<Button variant="gradient" size="lg">
  Button
</Button>
```

## Performance Notes

- Uses CSS classes instead of inline styles for better performance
- Includes optimized hover and transition effects
- Minimal bundle impact with tree-shaking support

## Browser Support

- ✅ Chrome/Edge 88+
- ✅ Firefox 78+  
- ✅ Safari 14+
- ✅ iOS Safari 14+
- ✅ Android Chrome 88+

## Questions or Issues?

If you encounter any issues or need custom gradient variations, please:
1. Check this guide first
2. Review the GradientButtonExamples.jsx component
3. Ask the development team for assistance

---

**Happy Coding! 🚀**