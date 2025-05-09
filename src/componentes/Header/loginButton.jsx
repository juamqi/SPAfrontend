import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import Formulario from '../Formularios/formulario.jsx';
import Boton from '../Formularios/boton.jsx';
import '../../styles/botonLogin.css';
import { UserCircle, LogOut, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const LoginButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/'); // Redirige al usuario a la página principal después de cerrar sesión
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
              <button onClick={handleLogout} className="dropdown-item">
                <LogOut size={18} />
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LoginButton;