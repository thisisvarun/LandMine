import { createContext, useState } from 'react';

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    isAuthenticated: !!localStorage.getItem('authToken'),
    isGovt: localStorage.getItem('userRole') === 'government',
    isLoading: false
  });

  return (
    <AuthContext.Provider value={{ authState, setAuthState }}>
      {children}
    </AuthContext.Provider>
  );
}