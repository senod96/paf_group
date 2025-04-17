import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GoogleOAuthProvider clientId="876603368180-ar5uatkro9homdcgvne90hecc09fu6rh.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);
