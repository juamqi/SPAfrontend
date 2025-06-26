import { useAdminAuth } from '../context/AdminAuthContext';
import { useProfAuth } from '../context/ProfAuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import '../styles/AdminLogin.css';
import { usePopupContext } from '../context/PopupContext';

const AdminLogin = () => {
  const { login: adminLogin } = useAdminAuth();
  const { login: profLogin } = useProfAuth();
  const navigate = useNavigate();
  
  const [userType, setUserType] = useState('admin'); // 'admin' o 'profesional'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showPopup } = usePopupContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let result;
      
      if (userType === 'admin') {
        result = await adminLogin(email, password);
        if (result.success) {
          navigate('/dashboard');
        }
      } else {
        result = await profLogin(email, password);
        if (result.success) {
          navigate('/prof-panel');
        }
      }
      
      if (!result.success) {
        showPopup({
          type: 'error',
          title: "Error",
          message: result.error
        });
      }
    } catch (error) {
      console.error('Error inesperado:', error);
      showPopup({
        type: 'error',
        title: "Error",
        message: 'Error inesperado al iniciar sesión'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-section">
      <div className="admin-login-overlay"></div>
      <div className="admin-login-container">
        <div className="admin-login-content">
          <div className="admin-login-header">
            <div className="admin-login-icon">
              <i className="fas fa-lock"></i>
            </div>
            <h2 className="admin-login-title">
              Acceso de {userType === 'admin' ? 'Administrador' : 'Profesional'}
            </h2>
            <p className="admin-login-subtitle">Ingrese sus credenciales para continuar</p>
          </div>
          
          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="admin-form-group">
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="admin-form-input"
                style={{"--input-order": 0}}
                disabled={isLoading}
              >
                <option value="admin">Administrador</option>
                <option value="profesional">Profesional</option>
              </select>
            </div>

            <div className="admin-form-group">
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="admin-form-input"
                style={{"--input-order": 1}}
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="admin-form-group">
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-form-input"
                style={{"--input-order": 2}}
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="admin-form-submit">
              <button 
                type="submit" 
                className="admin-login-button"
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;