import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isGovt: false,
    user: null,
    loading: true
  });

  useEffect(() => {
    // Check for existing auth token on app load
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    const userData = localStorage.getItem('userData');

    if (token && userRole) {
      setAuthState({
        isAuthenticated: true,
        isGovt: userRole === 'government',
        user: userData ? JSON.parse(userData) : null,
        loading: false
      });
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const login = (token, role, userData) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userData', JSON.stringify(userData));
    
    setAuthState({
      isAuthenticated: true,
      isGovt: role === 'government',
      user: userData,
      loading: false
    });
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    
    setAuthState({
      isAuthenticated: false,
      isGovt: false,
      user: null,
      loading: false
    });
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;