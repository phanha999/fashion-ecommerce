import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';

import ErrorBoundary from './components/ErrorBoundary';
import NotificationProvider from './contexts/NotificationProvider.jsx';
import LocalizationProvider from './contexts/LocalizationProvider.jsx';
import LocalizedStore from './contexts/LocalizedStore.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary><NotificationProvider><LocalizationProvider><LocalizedStore /></LocalizationProvider></NotificationProvider></ErrorBoundary>
    </BrowserRouter>
  </StrictMode>
);
