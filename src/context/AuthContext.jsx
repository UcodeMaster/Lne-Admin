import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

// Inactivity timeout: 15 minutes (900,000 milliseconds)
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('admin_user');
    const token = localStorage.getItem('admin_token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (user) {
      timeoutRef.current = setTimeout(() => {
        logout();
        toast('Session expired due to inactivity', {
          icon: '⏰',
          duration: 5000,
        });
      }, INACTIVITY_TIMEOUT);
    }
  };

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      resetTimer();
    };

    if (user) {
      // Initialize timer
      resetTimer();
      
      // Add event listeners
      events.forEach(event => {
        window.addEventListener(event, handleActivity);
      });
    }

    return () => {
      // Cleanup
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [user]);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('admin_user', JSON.stringify(userData));
    localStorage.setItem('admin_token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_token');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
