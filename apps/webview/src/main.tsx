import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { SDSProvider } from '@skkuverse/ui';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      {/*
        Light only, deliberately. The app can tell a page its theme — the bridge
        defines app:theme-changed — but nothing here listens: this side only
        sends, and parseWebMessage has no caller in the repo. Passing a
        preference we cannot keep in step with the app would be worse than
        committing to one, so the pages stay light until the receive half exists.
      */}
      <SDSProvider colorPreference="light">
        <App />
      </SDSProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
