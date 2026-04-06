import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { handleGoogleRedirect } from './lib/googleAuth';
import { supabaseConfigError } from './lib/supabase';

if (!supabaseConfigError) {
  handleGoogleRedirect();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
