import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) validateToken(token);
  }, []);

  const validateToken = (token) => {
    try {
      const decodedUser = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      if (decodedUser.exp >= currentTime) {
        setUser(decodedUser);
        return true;
      }
    } catch (error) {
      console.error('Token invalid:', error);
    }
    localStorage.removeItem('token');
    setUser(null);
    return false;
  };

  const login = (token) => {
    if (validateToken(token)) {
      localStorage.setItem('token', token);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);