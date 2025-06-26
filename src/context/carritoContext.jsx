import React, { createContext, useContext, useRef, useState } from 'react';

const CarritoContext = createContext();

export const CarritoProvider = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [ultimoTurnoCreado, setUltimoTurnoCreado] = useState(null);
  
  // Ref para el carrito (será asignado por LoginButton)
  const carritoRef = useRef();

  // ✅ Función para notificar que se creó un turno
  const notificarTurnoCreado = async (datosTurno) => {
    try {
      console.log('🎉 CarritoContext - Turno creado:', datosTurno);
      
      setUltimoTurnoCreado(datosTurno);
      
      // Refrescar carrito si existe el ref
      if (carritoRef.current) {
        console.log('🔄 Refrescando carrito desde contexto...');
        await carritoRef.current.refrescarDatos();
        
        // Seleccionar fecha automáticamente
        if (datosTurno.fechaFormateada) {
          setTimeout(async () => {
            console.log(`📅 Seleccionando fecha: ${datosTurno.fechaFormateada}`);
            await carritoRef.current.seleccionarFecha(datosTurno.fechaFormateada);
          }, 500);
        }
      }
      
      // Trigger refresh como backup
      setRefreshTrigger(prev => prev + 1);
      
      console.log('✅ Carrito actualizado desde contexto');
      
    } catch (error) {
      console.error('❌ Error al actualizar carrito desde contexto:', error);
    }
  };

  // ✅ Función para abrir carrito
  const abrirCarrito = async () => {
    console.log('🛒 Abriendo carrito desde contexto...');
    
    // Refrescar antes de abrir
    if (carritoRef.current) {
      await carritoRef.current.refrescarDatos();
    }
    
    setCarritoAbierto(true);
  };

  // ✅ Función para cerrar carrito
  const cerrarCarrito = () => {
    setCarritoAbierto(false);
  };

  // ✅ Función para registrar el ref del carrito
  const registrarCarritoRef = (ref) => {
    carritoRef.current = ref;
  };

  const value = {
    // Estados
    refreshTrigger,
    carritoAbierto,
    ultimoTurnoCreado,
    
    // Referencias
    carritoRef,
    
    // Funciones
    notificarTurnoCreado,
    abrirCarrito,
    cerrarCarrito,
    registrarCarritoRef,
    
    // Función manual de refresh
    triggerRefresh: () => setRefreshTrigger(prev => prev + 1)
  };

  return (
    <CarritoContext.Provider value={value}>
      {children}
    </CarritoContext.Provider>
  );
};

// Hook para usar el contexto
export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) {
    throw new Error('useCarrito debe usarse dentro de CarritoProvider');
  }
  return context;
};

export default CarritoContext;