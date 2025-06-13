import React, { createContext, useState, useContext, useEffect } from 'react';

const ProfAuthContext = createContext(null);

export const ProfAuthProvider = ({ children }) => {
  const [profesional, setProfesional] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const profesionalData = localStorage.getItem('profesional');
    if (profesionalData) {
      setProfesional(JSON.parse(profesionalData));
    }
    setLoading(false);
  }, []);

  // Función de login que conecta con la BD
  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:3001/api/profesionales/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, passwd: password })
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar en localStorage y state
        localStorage.setItem('profesional', JSON.stringify(data.profesional));
        setProfesional(data.profesional);
        return { success: true, profesional: data.profesional };
      } else {
        return { success: false, error: data.error || 'Error al iniciar sesión' };
      }
    } catch (error) {
      console.error('Error al loguear profesional:', error);
      return { success: false, error: 'Error al conectar con el servidor' };
    }
  };

  const logout = () => {
    localStorage.removeItem('profesional');
    setProfesional(null);
  };

  const isAuthenticated = () => !!profesional;

  // Función para verificar si el profesional sigue existiendo (opcional)
  const verifyAuth = async () => {
    if (!profesional) return false;
    
    try {
      const response = await fetch('http://localhost:3001/api/profesionales', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        logout(); // Si hay error, cerrar sesión
        return false;
      }
      
      const profesionales = await response.json();
      // Verificar si el profesional actual sigue activo
      const currentProfesional = profesionales.find(p => p.id_profesional === profesional.id_profesional && p.activo === 1);
      
      if (!currentProfesional) {
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
    <ProfAuthContext.Provider value={{ 
      profesional, 
      loading, 
      login, 
      logout, 
      isAuthenticated, 
      verifyAuth 
    }}>
      {children}
    </ProfAuthContext.Provider>
  );
};

export const useProfAuth = () => {
  const context = useContext(ProfAuthContext);
  if (!context) {
    throw new Error('useProfAuth debe usarse dentro de ProfAuthProvider');
  }
  return context;
};