import React, { createContext, useState, useContext, useEffect } from 'react';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminData = localStorage.getItem('admin');
    if (adminData) {
      setAdmin(JSON.parse(adminData));
    }
    setLoading(false);
  }, []);

  const login = (adminData) => {
    localStorage.setItem('admin', JSON.stringify(adminData));
    setAdmin(adminData);
  };

  const logout = () => {
    localStorage.removeItem('admin');
    setAdmin(null);
  };

  const isAuthenticated = () => !!admin;

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout, isAuthenticated }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth debe usarse dentro de AdminAuthProvider');
  }
  return context;
};
