import React, { createContext, useState, useContext, useEffect } from 'react';

// Crear el contexto
const AuthContext = createContext(null);

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar si el usuario ya está autenticado (al cargar la aplicación)
  useEffect(() => {
    try {
      const clienteId = localStorage.getItem('clienteId');
      const clienteNombre = localStorage.getItem('clienteNombre');
      
      // Verificación de datos obtenidos del localStorage
      console.log('clienteId desde localStorage:', clienteId);
      console.log('clienteNombre desde localStorage:', clienteNombre);

      if (clienteId && clienteNombre) {
        setUser({
          id_cliente: clienteId,
          nombre: clienteNombre
        });
      }
    } catch (error) {
      console.error('Error al recuperar datos de la sesión:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función de login mejorada con validación
  const login = (userData) => {
    try {
      if (!userData) {
        console.error('Error en login: No se recibieron datos de usuario');
        return;
      }
      
      // Depuración de datos recibidos
      console.log('Datos recibidos en login:', userData);
      
      // si el objeto trae .id_cliente lo usamos, si no usamos .id
      const id = userData.id_cliente ?? userData.id;
      const nombre = userData.nombre;
      
      if (!id) {
        console.error('Error en login: ID de cliente no presente en los datos');
        return;
      }
      
      if (!nombre) {
        console.error('Error en login: Nombre no presente en los datos');
        return;
      }

      // Almacenar en localStorage
      localStorage.setItem('clienteId', id.toString());
      localStorage.setItem('clienteNombre', nombre);

      // Actualizar el estado
      setUser({ id_cliente: id, nombre });
      
      console.log('Usuario autenticado correctamente:', { id_cliente: id, nombre });
    } catch (error) {
      console.error('Error en el proceso de login:', error);
    }
  };

  // Función de logout
  const logout = () => {
    try {
      localStorage.removeItem('clienteId');
      localStorage.removeItem('clienteNombre');
      setUser(null);
      console.log('Sesión cerrada correctamente');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Verificar si el usuario está autenticado
  const isAuthenticated = () => {
    return !!user;
  };

  // Valores que expondremos a través del contexto
  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
