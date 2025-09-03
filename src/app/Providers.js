'use client';

import { Provider } from 'react-redux';
import { store } from '../redux/store';
import { LoaderProvider } from '../components/LoaderProvider';

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <LoaderProvider>
        {children}
      </LoaderProvider>
    </Provider>
  );
} 