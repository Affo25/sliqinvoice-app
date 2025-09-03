import React from 'react'

function Loader({ isVisible = false, message = 'Loading...', type = 'overlay' }) {
  if (!isVisible && type === 'overlay') return null;

  const overlayClasses = type === 'overlay' 
    ? 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center'
    : 'flex items-center justify-center p-4';

  return (
    <div className={overlayClasses}>
      <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center space-y-4 max-w-sm w-full mx-4">
        {/* Loading Spinner */}
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-green-500 rounded-full animate-spin animation-delay-150"></div>
        </div>
        
        {/* Loading Text */}
        <div className="text-center">
          <p className="text-gray-700 font-medium">{message}</p>
          <div className="flex space-x-1 mt-2 justify-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce animation-delay-100"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce animation-delay-200"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple inline loader for smaller components
export function InlineLoader({ size = 'md', color = 'blue' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    blue: 'border-blue-600',
    green: 'border-green-600',
    red: 'border-red-600',
    gray: 'border-gray-600'
  };

  return (
    <div className={`${sizeClasses[size]} border-4 border-gray-200 ${colorClasses[color]} border-t-transparent rounded-full animate-spin`}></div>
  );
}

// Page transition loader
export function PageLoader({ isLoading }) {
  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50">
      <div className="h-full bg-gradient-to-r from-blue-600 to-green-600 animate-pulse"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600 to-green-600 animate-[loading_2s_ease-in-out_infinite]"></div>
    </div>
  );
}

export default Loader;