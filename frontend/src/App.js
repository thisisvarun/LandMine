import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Web3 from 'web3';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/App.css';

// Components
import Signup from './pages/Signup/Signup';
import UserDashboard from './components/Dashboard/Dashboard';
import Header from './components/common/Header';
import RegistrationForm from './pages/AfterLogin/AddNewLand';
import GovernmentDashboard from './components/Dashboard/Dashboard_Govt';
import Profile from './components/Profile/Profile';
import Help from './components/Help/Help';
import Home from './components/common/Home';
import Login from './pages/Login/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Loading from './components/common/Loading';

const App = () => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isGovtAuthenticated: false,
    walletAddress: '',
    loading: true
  });
  const navigate = useNavigate();

  // Initialize Web3 and auth state
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 1. Initialize Web3
        if (window.ethereum) {
          window.web3 = new Web3(window.ethereum);
          
          // Request account access
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          const currentAccount = accounts[0] || '';
          
          // Listen for account changes
          window.ethereum.on('accountsChanged', (accounts) => {
            handleAccountChange(accounts[0] || '');
          });

          // 2. Check existing auth state
          const token = localStorage.getItem('authToken');
          const userRole = localStorage.getItem('userRole');
          const storedAddress = localStorage.getItem('walletAddress');

          setAuthState({
            isAuthenticated: !!token,
            isGovtAuthenticated: userRole === 'government',
            walletAddress: currentAccount || storedAddress || '',
            loading: false
          });

          // 3. Validate session if token exists
          if (token) {
            await validateSession(token, currentAccount);
          }
        } else {
          toast.warn('Please install MetaMask for full functionality');
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Initialization error:', error);
        setAuthState(prev => ({ ...prev, loading: false }));
        toast.error('Failed to initialize application');
      }
    };

    initializeApp();

    return () => {
      // Cleanup event listeners
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountChange);
      }
    };
  }, []);

  const handleAccountChange = (newAccount) => {
    if (newAccount !== authState.walletAddress) {
      setAuthState(prev => ({
        ...prev,
        walletAddress: newAccount
      }));
      localStorage.setItem('walletAddress', newAccount);
      
      if (authState.isAuthenticated) {
        toast.info('Wallet account changed. Please re-authenticate.');
        handleLogout();
      }
    }
  };

  const validateSession = async (token, currentAddress) => {
    try {
      // Here you would typically make an API call to validate the token
      // For now, we'll just check if the wallet address matches
      const storedAddress = localStorage.getItem('walletAddress');
      if (currentAddress && storedAddress !== currentAddress) {
        handleLogout();
        toast.warn('Wallet address changed. Please login again.');
      }
    } catch (error) {
      console.error('Session validation error:', error);
      handleLogout();
    }
  };

  const handleLogin = (token, role) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userRole', role);
    localStorage.setItem('walletAddress', authState.walletAddress);
    
    setAuthState({
      isAuthenticated: true,
      isGovtAuthenticated: role === 'government',
      walletAddress: authState.walletAddress,
      loading: false
    });

    navigate(role === 'government' ? '/dashboard_govt' : '/dashboard');
    toast.success(`Successfully logged in as ${role === 'government' ? 'Government' : 'User'}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('walletAddress');
    
    setAuthState({
      isAuthenticated: false,
      isGovtAuthenticated: false,
      walletAddress: '',
      loading: false
    });

    navigate('/');
    toast.info('Logged out successfully');
  };

  if (authState.loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="App">
      <ToastContainer position="bottom-right" />
      <Header 
        authState={authState} 
        onLogout={handleLogout} 
      />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup web3={window.web3} />} />
        <Route 
          path="/login" 
          element={<Login onLogin={handleLogin} web3={window.web3} />} 
        />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute isAllowed={authState.isAuthenticated} />}>
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/profile" element={<Profile walletAddress={authState.walletAddress} />} />
          <Route path="/registration_form" element={<RegistrationForm />} />
        </Route>
        
        <Route element={<ProtectedRoute isAllowed={authState.isGovtAuthenticated} />}>
        <Route path="/government-dashboard" element={<GovernmentDashboard />} />
        </Route>
        
        <Route path="/guide" element={<Help />} />
      </Routes>
    </div>
  );
};

export default App;