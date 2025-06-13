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

  // Función de login que conecta con la BD
  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar en localStorage y state
        localStorage.setItem('admin', JSON.stringify(data.administrador));
        setAdmin(data.administrador);
        return { success: true, admin: data.administrador };
      } else {
        return { success: false, error: data.error || 'Error al iniciar sesión' };
      }
    } catch (error) {
      console.error('Error al loguear admin:', error);
      return { success: false, error: 'Error al conectar con el servidor' };
    }
  };

  const logout = () => {
    localStorage.removeItem('admin');
    setAdmin(null);
  };

  const isAuthenticated = () => !!admin;

  // Función para verificar si el admin sigue existiendo (opcional)
  const verifyAuth = async () => {
    if (!admin) return false;
    
    try {
      const response = await fetch('http://localhost:3001/api/admin', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        logout(); // Si hay error, cerrar sesión
        return false;
      }
      
      const admins = await response.json();
      // Verificar si el admin actual sigue activo
      const currentAdmin = admins.find(a => a.id_admin === admin.id_admin && a.estado === 1);
      
      if (!currentAdmin) {
        logout();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      logout();
      return false;
    }
  };

  return (
    <AdminAuthContext.Provider value={{ 
      admin, 
      loading, 
      login, 
      logout, 
      isAuthenticated, 
      verifyAuth 
    }}>
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