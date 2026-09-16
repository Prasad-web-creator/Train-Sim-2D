/**
 * main.jsx
 * Application entrypoint mounting the React DOM tree.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Mount application root
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
