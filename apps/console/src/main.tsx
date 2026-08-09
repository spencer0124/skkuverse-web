import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { SDSProvider } from '@skkuverse/ui';
import { AuthProvider } from './auth/AuthProvider';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <SDSProvider colorPreference="light">
        <AuthProvider>
          <App />
        </AuthProvider>
      </SDSProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
