import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { ToastContainer } from 'react-toastify';
import ErrorBoundary from './components/ErrorBoundary';
import AppThemeProvider from './providers/AppThemeProvider';
import AuthProvider from './providers/AuthProvider';
import Web3Provider from './providers/Web3Provider';
import './styles/index.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'react-toastify/dist/ReactToastify.css';

// Initialize web3
function getLibrary(provider) {
  const library = new Web3Provider(provider);
  library.pollingInterval = 15000;
  return library;
}

// Error Boundary Component (if not already created)
const FallbackComponent = ({ error }) => (
  <div className="p-4 text-danger">
    <h2>Something went wrong</h2>
    <p>{error.message}</p>
    <button onClick={() => window.location.reload()}>Refresh</button>
  </div>
);

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={FallbackComponent}>
      <Web3ReactProvider getLibrary={getLibrary}>
        <AppThemeProvider>
          <AuthProvider>
            <Web3Provider>
              <Router>
                <App />
                <ToastContainer
                  position="bottom-right"
                  autoClose={5000}
                  newestOnTop
                  closeOnClick
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                />
              </Router>
            </Web3Provider>
          </AuthProvider>
        </AppThemeProvider>
      </Web3ReactProvider>
    </ErrorBoundary>
  </React.StrictMode>
);