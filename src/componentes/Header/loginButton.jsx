import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCarrito } from '../../context/carritoContext.jsx'; // ✅ NUEVO
import Formulario from '../Formularios/formulario.jsx';
import Boton from '../Formularios/boton.jsx';
import '../../styles/botonLogin.css';
import { UserCircle, LogOut, User, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import CarritoModal from '../carrito.jsx'

const LoginButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  // ✅ NUEVO: Usar contexto del carrito
  const {
    carritoAbierto,
    refreshTrigger,
    abrirCarrito,
    cerrarCarrito,
    registrarCarritoRef
  } = useCarrito();

  // Ref para el carrito
  const carritoRef = useRef();

  // ✅ NUEVO: Registrar el ref cuando el componente se monta
  useEffect(() => {
    if (carritoRef.current) {
      registrarCarritoRef(carritoRef.current);
    }
  }, [registrarCarritoRef]);

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

  // ✅ Función para abrir carrito desde menú
  const handleAbrirCarrito = () => {
    setMenuOpen(false);
    abrirCarrito();
  };

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
              <button
                className="dropdown-item"
                onClick={handleAbrirCarrito} // ✅ NUEVO: usar contexto
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
      
      {/* ✅ CarritoModal usando contexto */}
      <CarritoModal
        ref={carritoRef}
        isOpen={carritoAbierto}
        onClose={cerrarCarrito}
        idCliente={user?.id_cliente}
        forceRefresh={refreshTrigger}
      />
    </div>
  );
};

export default LoginButton;