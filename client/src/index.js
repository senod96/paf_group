import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

const PAYPAL_CLIENT_ID = "AeGb90YRedXhlZaPWSu30TYp7U3jWlBJ9BYFLJ_teCqZUcba2YCQzg7r1Bxxe24dv6S--eXwsbIjQAZN"; // 🔁 Replace this

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GoogleOAuthProvider clientId="876603368180-ar5uatkro9homdcgvne90hecc09fu6rh.apps.googleusercontent.com">
    <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID }}>
      <App />
    </PayPalScriptProvider>
  </GoogleOAuthProvider>
);
