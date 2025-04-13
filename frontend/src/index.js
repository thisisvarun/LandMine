import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import App from './App';
import 'bootstrap/dist/css/bootstrap.css';
import { BrowserRouter as Router } from 'react-router-dom';
import AppThemeProvider from './providers/AppThemeProvider';
import AuthProvider from './providers/AuthProvider';
import Web3Provider from './providers/Web3Provider';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <AppThemeProvider>
      <AuthProvider>
        <Web3Provider>
          <Router>
            <App />
            <ToastContainer position="bottom-right" />
          </Router>
        </Web3Provider>
      </AuthProvider>
    </AppThemeProvider>
  </React.StrictMode>
);