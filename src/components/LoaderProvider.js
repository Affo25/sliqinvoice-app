import React, { createContext, useContext, useState } from 'react';
import Loader, { PageLoader } from './loader';

const LoaderContext = createContext();

export function LoaderProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const [isPageLoading, setIsPageLoading] = useState(false);

  const showLoader = (message = 'Loading...') => {
    setLoadingMessage(message);
    setIsLoading(true);
  };

  const hideLoader = () => {
    setIsLoading(false);
  };

  const showPageLoader = () => setIsPageLoading(true);
  const hidePageLoader = () => setIsPageLoading(false);

  const value = {
    isLoading,
    loadingMessage,
    showLoader,
    hideLoader,
    isPageLoading,
    showPageLoader,
    hidePageLoader
  };

  return (
    <LoaderContext.Provider value={value}>
      {children}
      <Loader 
        isVisible={isLoading} 
        message={loadingMessage} 
        type="overlay"
      />
      <PageLoader isLoading={isPageLoading} />
    </LoaderContext.Provider>
  );
}

export const useLoader = () => {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error('useLoader must be used within a LoaderProvider');
  }
  return context;
};