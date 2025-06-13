import { useState } from 'react';
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
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

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
                onClick={(e) => {
                  e.preventDefault(); 
                  setMenuOpen(false);
                  setCarritoOpen(true);
                }}
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
      
      <CarritoModal
        isOpen={carritoOpen}
        onClose={() => setCarritoOpen(false)}
        idCliente={user?.id_cliente} // Agregar esta línea
      />
    </div>
  );
};

export default LoginButton;