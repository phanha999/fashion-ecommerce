import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';

import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary';
import SiteProvider from './contexts/SiteProvider.jsx';
import CartProvider from './contexts/CartProvider.jsx';
import CustomerAccountProvider from './contexts/CustomerAccountProvider.jsx';
import NotificationProvider from './contexts/NotificationProvider.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary><NotificationProvider><SiteProvider><CustomerAccountProvider>
        <CartProvider><App /></CartProvider>
      </CustomerAccountProvider></SiteProvider></NotificationProvider></ErrorBoundary>
    </BrowserRouter>
  </StrictMode>
);
