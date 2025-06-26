// ✅ NUEVO: Listener para eventos personalizados de turnos creados
  useEffect(() => {
    const handleTurnoCreado = () => {
      console.log('🎉 Evento turnoCreado recibido, refrescando carrito...');
      setForceRefreshCarrito(prev => prev + 1);
    };

    const handleAbrirCarrito = () => {
      console.log('🛒 Evento abrirCarrito recibido...');
      abrirCarrito();
    };

    // Escuchar los eventos personalizados
    window.addEventListener('turnoCreado', handleTurnoCreado);
    window.addEventListener('abrirCarrito', handleAbrirCarrito);
    
    // Limpiar los listeners al desmontar
    return () => {
      window.removeEventListener('turnoCreado', handleTurnoCreado);
      window.removeEventListener('abrirCarrito', handleAbrirCarrito);
    };
  }, [abrirCarrito]);import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import Formulario from '../Formularios/formulario.jsx';
import Boton from '../Formularios/boton.jsx';
import '../../styles/botonLogin.css';
import { UserCircle, LogOut, User, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import CarritoModal from '../carrito.jsx'

const LoginButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [carritoOpen, setCarritoOpen] = useState(false); 
  const [forceRefreshCarrito, setForceRefreshCarrito] = useState(0); // ✅ NUEVO: Estado para forzar refresh
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  // ✅ NUEVO: Listener para eventos personalizados de turnos creados
  useEffect(() => {
    const handleTurnoCreado = () => {
      console.log('🎉 Evento turnoCreado recibido, refrescando carrito...');
      setForceRefreshCarrito(prev => prev + 1);
    };

    // Escuchar el evento personalizado
    window.addEventListener('turnoCreado', handleTurnoCreado);
    
    // Limpiar el listener al desmontar
    return () => {
      window.removeEventListener('turnoCreado', handleTurnoCreado);
    };
  }, []);

  // ✅ NUEVO: Listener para cuando se enfoca la ventana (opcional)
  useEffect(() => {
    const handleWindowFocus = () => {
      if (carritoOpen && user?.id_cliente) {
        console.log('👁️ Ventana enfocada con carrito abierto, refrescando...');
        setForceRefreshCarrito(prev => prev + 1);
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [carritoOpen, user?.id_cliente]);

  const handleProfileClick = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/'); 
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  // ✅ NUEVA FUNCIÓN: Abrir carrito con refresh automático
  const abrirCarrito = useCallback(() => {
    console.log('🛒 Abriendo carrito y forzando refresh...');
    setMenuOpen(false);
    setCarritoOpen(true);
    // ✅ Incrementar contador para forzar refresh
    setForceRefreshCarrito(prev => prev + 1);
  }, []);

  // ✅ NUEVA FUNCIÓN: Cerrar carrito
  const cerrarCarrito = useCallback(() => {
    console.log('❌ Cerrando carrito...');
    setCarritoOpen(false);
  }, []);

  return (
    <div className="login-container">
      {!isAuthenticated() ? (
        <>
          <Boton
            text="Iniciar sesión"
            onClick={() => setIsOpen(true)}
            className="login-button custom-button primary medium rounded"
          />
          {isOpen && <Formulario onClose={closeSidebar} />}
        </>
      ) : (
        <div className="profile-menu-container">
          <button className="profile-icon-button" onClick={handleProfileClick} aria-label="Menú de perfil">
            <UserCircle size={28} />
          </button>
          {menuOpen && (
            <div className="profile-dropdown">
              <Link to="/perfil" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                <User size={18} />
                <span>Mi perfil</span>
              </Link>
              {/* ✅ MODIFICADO: Usar la nueva función abrirCarrito */}
              <button
                className="dropdown-item"
                onClick={abrirCarrito}
              >
                <ShoppingCart size={18} />
                <span>Carrito</span>
              </button>
              <button onClick={handleLogout} className="dropdown-item">
                <LogOut size={18} />
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* ✅ MODIFICADO: CarritoModal con props de refresh */}
      <CarritoModal
        isOpen={carritoOpen}
        onClose={cerrarCarrito}
        idCliente={user?.id_cliente}
        forceRefresh={forceRefreshCarrito} // ✅ NUEVO: Prop para forzar refresh
      />
    </div>
  );
};

export default LoginButton;